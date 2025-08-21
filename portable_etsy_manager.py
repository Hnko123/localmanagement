#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Portable Etsy Order Manager
==========================

Taşınabilir Etsy sipariş yönetim sistemi.
Tüm dosyalar relative path'lerle organize edilmiştir.
"""

import imaplib
import email
import re
import os
import json
import csv
import logging
import shutil
from pathlib import Path
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import sys
from enhancements import translate, load_plugins, generate_stats, validate_order
import base64

class PortableEtsyManager:
    """Portable Etsy Order Manager - Ana sınıf"""
    
    def __init__(self):
        self.app_dir = Path(__file__).parent.absolute()
        print(f"ℹ️  Çalışma dizini: {self.app_dir}")
        
        self.load_settings()
        self.setup_logging()
        self.ensure_directories()
        self.plugins = load_plugins(self.app_dir)
        
    def load_settings(self):
        """Ayarları yükle"""
        settings_file = self.app_dir / "settings.json"
        
        if not settings_file.exists():
            raise FileNotFoundError(f"Ayar dosyası bulunamadı: {settings_file}")
            
        with open(settings_file, 'r', encoding='utf-8') as f:
            self.settings = json.load(f)
            
        # Path'leri absolute'a çevir
        self.paths = {}
        for key, relative_path in self.settings["files"].items():
            self.paths[key] = self.app_dir / relative_path
            
        print(f"ℹ️  Ayarlar yüklendi: {settings_file}")
        
    def setup_logging(self):
        """Logging'i kurguyla"""
        log_file = self.app_dir / self.settings["files"]["logs_dir"] / f"etsy_manager_{datetime.now().strftime('%Y%m%d')}.log"
        log_file.parent.mkdir(exist_ok=True)
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file, encoding='utf-8'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger(__name__)
        print(f"ℹ️  Log sistemi başlatıldı: {log_file}")
        
    def log_info(self, message: str):
        """Info level log"""
        print(f"ℹ️  {message}")
        if hasattr(self, 'logger') and self.logger:
            self.logger.info(message)
        
    def log_error(self, message: str):
        """Error level log"""
        print(f"❌ {message}")
        if hasattr(self, 'logger') and self.logger:
            self.logger.error(message)
        
    def log_success(self, message: str):
        """Success level log"""
        print(f"✅ {message}")
        if hasattr(self, 'logger') and self.logger:
            self.logger.info(f"SUCCESS: {message}")
        
    def ensure_directories(self):
        """Gerekli klasörleri oluştur"""
        for path in self.paths.values():
            if path.suffix == "":  # Klasör ise
                path.mkdir(exist_ok=True)
            else:  # Dosya ise parent klasörünü oluştur
                path.parent.mkdir(exist_ok=True)
                
    def load_credentials(self) -> Tuple[str, str]:
        """Gmail credentials'ını yükle"""
        cred_file = self.paths["credentials"]
        
        if not cred_file.exists():
            self.log_error(f"Credentials dosyası bulunamadı: {cred_file}")
            self.log_info("Lütfen config/gmail_credentials.txt dosyasını oluşturun:")
            self.log_info("Satır 1: Gmail adresi")
            self.log_info("Satır 2: 16 haneli uygulama şifresi")
            raise FileNotFoundError("Gmail credentials bulunamadı")
            
        try:
            with open(cred_file, 'r', encoding='utf-8') as f:
                lines = f.read().strip().split('\n')
                
            if len(lines) < 2:
                raise ValueError("Credentials dosyası eksik bilgi içeriyor")
                
            username = lines[0].strip()
            password = lines[1].strip()
            
            if '@gmail.com' not in username or len(password) != 16:
                raise ValueError("Gmail adresi veya uygulama şifresi geçersiz")
                
            self.log_success(f"Gmail credentials yüklendi: {username}")
            return username, password
            
        except Exception as e:
            self.log_error(f"Credentials yüklenemedi: {e}")
            raise
            
    def load_processed_ids(self) -> set:
        """İşlenmiş Transaction ID'leri yükle"""
        processed_file = self.paths["processed_ids"]
        
        if processed_file.exists():
            try:
                with open(processed_file, 'r', encoding='utf-8') as f:
                    ids = json.load(f)
                    return set(map(int, ids))
            except Exception as e:
                self.log_error(f"İşlenmiş ID'ler yüklenemedi: {e}")
                
        return set()
        
    def save_processed_ids(self, ids: set):
        """İşlenmiş Transaction ID'leri kaydet"""
        try:
            with open(self.paths["processed_ids"], 'w', encoding='utf-8') as f:
                json.dump(sorted(list(ids)), f, indent=2)
            self.log_success(f"İşlenmiş ID'ler kaydedildi: {len(ids)} adet")
        except Exception as e:
            self.log_error(f"İşlenmiş ID'ler kaydedilemedi: {e}")
            
    def create_backup(self):
        """Mevcut verileri yedekle"""
        if not self.settings["data"]["backup_enabled"]:
            return
            
        backup_dir = self.paths["backup_dir"] / datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_dir.mkdir(parents=True, exist_ok=True)
        
        # Veri dosyalarını yedekle
        for file_key in ["orders_json", "orders_csv", "processed_ids"]:
            source_file = self.paths[file_key]
            if source_file.exists():
                dest_file = backup_dir / source_file.name
                shutil.copy2(source_file, dest_file)
                
        self.log_success(f"Yedek oluşturuldu: {backup_dir}")

    # Email parsing helper methods
    def extract_buyer_note(self, html_body: str) -> str:
        note_match = re.search(r'(?:<strong>\s*(?:Note from buyer|Buyer Note)\s*</strong>)([\s\S]*?)(?:<hr|<strong>\s*Shipping)', html_body, re.IGNORECASE)
        if note_match:
            buyer_note = re.sub(r'<br\s*/?>', ' ', note_match.group(1), flags=re.IGNORECASE)
            return re.sub(r'<[^>]+>', '', buyer_note).strip()
        return ''
        
    def extract_ioss_number(self, html_body: str) -> str:
        ioss_match = re.search(r'IOSS number, ([A-Z0-9]+),', html_body)
        return ioss_match.group(1) if ioss_match else 'Yok'
        
    def extract_shipping_address(self, html_body: str) -> Tuple[str, str]:
        address_match = re.search(r'<strong>\s*Shipping address\s*</strong>([\s\S]*?)<strong>', html_body)
        recipient_name = 'Bulunamadı'
        full_address = 'Bulunamadı'
        
        if address_match:
            address_html = re.sub(r'<br\s*/?>', '|', address_match.group(1), flags=re.IGNORECASE)
            address_text = re.sub(r'<[^>]+>', '', address_html).strip()
            lines = [line.strip() for line in address_text.split('|') if line.strip() and "USPS® could not confirm" not in line]
            
            if lines:
                recipient_name = lines[0]
                if len(lines) > 1:
                    full_address = ', '.join(lines[1:])
        
        return recipient_name, full_address
    
    def parse_address_components(self, full_address: str) -> dict:
        """Adres bileşenlerini ülke bazlı ayrıştır"""
        if not full_address or full_address == 'Bulunamadı':
            return {
                'full_address': full_address,
                'country': 'Unknown',
                'country_code': '',
                'city': '',
                'postal_code': '',
                'state': '',
                'street': '',
                'phone_code': ''
            }
        
        address = full_address.upper()
        components = {
            'full_address': full_address,
            'country': 'Unknown',
            'country_code': '',
            'city': '',
            'postal_code': '',
            'state': '',
            'street': '',
            'phone_code': ''
        }
        
        # Ülke tespiti ve ayrıştırma
        if 'UNITED STATES' in address or 'USA' in address:
            components['country'] = 'United States'
            components['country_code'] = 'US'
            components['phone_code'] = '+1'
            # USA format: Street, City, State ZIP
            parts = full_address.split(',')
            if len(parts) >= 3:
                components['street'] = parts[0].strip()
                components['city'] = parts[1].strip()
                state_zip = parts[2].strip().split()
                if len(state_zip) >= 2:
                    components['state'] = state_zip[0]
                    components['postal_code'] = ' '.join(state_zip[1:])
        
        elif 'GERMANY' in address or 'DEUTSCHLAND' in address:
            components['country'] = 'Germany'
            components['country_code'] = 'DE'
            components['phone_code'] = '+49'
            # Germany format: Street, Postal Code City
            parts = full_address.split(',')
            if len(parts) >= 2:
                components['street'] = parts[0].strip()
                city_part = parts[1].strip()
                # Postal code pattern: 5 digits
                postal_match = re.search(r'(\d{5})\s+(.+)', city_part)
                if postal_match:
                    components['postal_code'] = postal_match.group(1)
                    components['city'] = postal_match.group(2)
        
        elif 'DENMARK' in address or 'DANMARK' in address:
            components['country'] = 'Denmark'
            components['country_code'] = 'DK'
            components['phone_code'] = '+45'
            # Denmark format: Street, Postal Code City
            parts = full_address.split(',')
            if len(parts) >= 2:
                components['street'] = parts[0].strip()
                city_part = parts[1].strip()
                # Postal code pattern: 4 digits
                postal_match = re.search(r'(\d{4})\s+(.+)', city_part)
                if postal_match:
                    components['postal_code'] = postal_match.group(1)
                    components['city'] = postal_match.group(2)
        
        elif 'CANADA' in address:
            components['country'] = 'Canada'
            components['country_code'] = 'CA'
            components['phone_code'] = '+1'
            # Canada format: Street, City, Province Postal Code
            parts = full_address.split(',')
            if len(parts) >= 3:
                components['street'] = parts[0].strip()
                components['city'] = parts[1].strip()
                province_postal = parts[2].strip().split()
                if len(province_postal) >= 2:
                    components['state'] = province_postal[0]
                    components['postal_code'] = ' '.join(province_postal[1:])
        
        elif 'UNITED KINGDOM' in address or 'UK' in address or 'ENGLAND' in address:
            components['country'] = 'United Kingdom'
            components['country_code'] = 'UK'
            components['phone_code'] = '+44'
            # UK format: Street, City, Postal Code
            parts = full_address.split(',')
            if len(parts) >= 3:
                components['street'] = parts[0].strip()
                components['city'] = parts[1].strip()
                components['postal_code'] = parts[2].strip()
        
        elif 'SWITZERLAND' in address or 'SWISS' in address:
            components['country'] = 'Switzerland'
            components['country_code'] = 'CH'
            components['phone_code'] = '+41'
            # Switzerland format: Street, Postal Code City
            parts = full_address.split(',')
            if len(parts) >= 2:
                components['street'] = parts[0].strip()
                city_part = parts[1].strip()
                # Postal code pattern: 4 digits
                postal_match = re.search(r'(\d{4})\s+(.+)', city_part)
                if postal_match:
                    components['postal_code'] = postal_match.group(1)
                    components['city'] = postal_match.group(2)
        
        elif 'NORWAY' in address or 'NORGE' in address:
            components['country'] = 'Norway'
            components['country_code'] = 'NO'
            components['phone_code'] = '+47'
            # Norway format: Street, Postal Code City
            parts = full_address.split(',')
            if len(parts) >= 2:
                components['street'] = parts[0].strip()
                city_part = parts[1].strip()
                # Postal code pattern: 4 digits
                postal_match = re.search(r'(\d{4})\s+(.+)', city_part)
                if postal_match:
                    components['postal_code'] = postal_match.group(1)
                    components['city'] = postal_match.group(2)
        
        else:
            # Genel format denemesi
            parts = full_address.split(',')
            if len(parts) >= 2:
                components['street'] = parts[0].strip()
                if len(parts) >= 3:
                    components['city'] = parts[1].strip()
                    # Son kısımda postal code olabilir
                    last_part = parts[-1].strip()
                    postal_match = re.search(r'(\d{3,5})', last_part)
                    if postal_match:
                        components['postal_code'] = postal_match.group(1)
        
        return components
        
    def extract_buyer_email(self, plain_body: str) -> str:
        email_match = re.search(r'\* Email ([\w@\.]+)', plain_body)
        return email_match.group(1) if email_match else ''
        
    def extract_order_total(self, plain_body: str) -> str:
        total_match = re.search(r'Order Total:\s*(US\$\d+\.\d+)', plain_body)
        return total_match.group(1) if total_match else ''
        
    def extract_shop_name(self, html_body: str) -> str:
        shop_match = re.search(r'<div[^>]*>\s*Shop:\s*([^<]+)</div>', html_body, re.IGNORECASE)
        return shop_match.group(1).strip() if shop_match else 'Bulunamadı'
        
    def extract_vat_info(self, html_body: str) -> Tuple[str, str, str]:
        vat_collected_match = re.search(r'currency-symbol[\'"]>([€£$])</span><span[^>]*>([0-9.,]+)', html_body)
        vat_collected = ''.join(vat_collected_match.groups()) if vat_collected_match else ''
        
        vat_id_match = re.search(r'(UID VAT|UK VAT number|IOSS number)[^\dA-Z]*([A-Z0-9\-\. ]+)', html_body, re.IGNORECASE)
        vat_id = re.sub(r'\s+', '', vat_id_match.group(2).strip()) if vat_id_match else ''
        
        vat_paid_chf_match = re.search(r'<strong>VAT paid:\s*(CHF[0-9.,]+)</strong>', html_body, re.IGNORECASE)
        vat_paid_chf = vat_paid_chf_match.group(1) if vat_paid_chf_match else ''
        
        return vat_collected, vat_id, vat_paid_chf
        
    def extract_etsy_image_from_gmail(self, html_body: str) -> str:
        """Gmail HTML'inden Etsy image URL'sini çıkar (75px)"""
        # Gmail'deki img tag'lerini bul
        soup = BeautifulSoup(html_body, 'html.parser')
        
        for img in soup.find_all('img'):
            src = img.get('src', '')
            
            # Google proxy URL'sinden gerçek Etsy URL'sini çıkar
            # Format: https://ci3.googleusercontent.com/meips/...#https://i.etsystatic.com/...
            if '#https://i.etsystatic.com/' in src:
                # # işaretinden sonraki kısmı al
                etsy_url = src.split('#https://i.etsystatic.com/')[1]
                etsy_url = 'https://i.etsystatic.com/' + etsy_url
                
                # Herhangi bir boyut pattern'ini 75x75'e dönüştür
                etsy_url = re.sub(r'il_\d+x\d+', 'il_75x75', etsy_url)
                
                print(f"🖼 Gmail'den Etsy image URL çıkarıldı: {etsy_url}")
                return etsy_url
            
            # Direkt etsystatic URL'si varsa
            elif 'i.etsystatic.com' in src:
                etsy_url = re.sub(r'il_\d+x\d+', 'il_75x75', src)
                print(f"🖼 Direkt Etsy image URL bulundu: {etsy_url}")
                return etsy_url
        
        print("⚠️ Etsy image URL bulunamadı")
        return ""
    
    def extract_embedded_images(self, msg) -> dict:
        """Gmail mesajından gömülü resimleri çıkar"""
        embedded_images = {}
        
        for part in msg.walk():
            # Resim attachment'larını bul
            if part.get_content_type().startswith('image/'):
                # Content-ID'yi al (HTML'de referans için kullanılır)
                content_id = part.get('Content-ID')
                if content_id:
                    # <> karakterlerini kaldır
                    content_id = content_id.strip('<>')
                    
                # Dosya adını al
                filename = part.get_filename()
                if not filename:
                    # Content-ID'den filename oluştur
                    if content_id:
                        filename = f"image_{content_id}.jpg"
                    else:
                        filename = "image_unknown.jpg"
                
                # Resim verisini al
                image_data = part.get_payload(decode=True)
                if image_data:
                    embedded_images[content_id or filename] = {
                        'data': image_data,
                        'filename': filename,
                        'content_type': part.get_content_type()
                    }
                    self.log_info(f"🖼 Gömülü resim bulundu: {filename} ({len(image_data)} bytes)")
        
        return embedded_images
    
    def find_product_image_in_html(self, soup, embedded_images: dict) -> bytes:
        """HTML'den ürün resmini bul ve gömülü resimlerle eşleştir"""
        if not soup or not embedded_images:
            return None
        
        # HTML'deki img taglerini kontrol et
        for img in soup.find_all('img'):
            src = img.get('src', '')
            
            # CID (Content-ID) referanslarını kontrol et
            if src.startswith('cid:'):
                cid = src.replace('cid:', '')
                if cid in embedded_images:
                    self.log_info(f"✅ CID ile eşleşen resim bulundu: {cid}")
                    return embedded_images[cid]['data']
            
            # Base64 embedded image kontrolü
            elif src.startswith('data:image/'):
                try:
                    # data:image/jpeg;base64,... formatını parse et
                    header, data = src.split(',', 1)
                    image_data = base64.b64decode(data)
                    self.log_info(f"✅ Base64 gömülü resim bulundu ({len(image_data)} bytes)")
                    return image_data
                except:
                    continue
        
        # Eğer HTML'de eşleşme bulamazsa, ilk gömülü resmi kullan
        if embedded_images:
            first_image = list(embedded_images.values())[0]
            self.log_info(f"ℹ  İlk gömülü resim kullanılıyor: {first_image['filename']}")
            return first_image['data']
        
        return None
        
    def parse_order_details(self, order_details_raw: str) -> Tuple[str, str, str, int, str]:
        clean_details = re.sub(r'(\r\n|\n|\r)', ' ', order_details_raw)
        clean_details = re.sub(r'\s{2,}', ' ', clean_details).replace('&amp;', '&').replace('&#39;', "'").replace('&quot;', '"')
        
        material_match = re.search(r'Material(?:\s*&\s*[^:]*)?:\s*(.*?)(?=\s*Chain\s*Length:|\s*Personalization:|\s*Quantity:|$)', clean_details, re.IGNORECASE)
        material_size = material_match.group(1).strip() if material_match else ''
        
        chain_match = re.search(r'Chain\s*Length:\s*([^P]*?)(?=\s*Personalization|$)', clean_details)
        chain_length = chain_match.group(1).strip() if chain_match else ''
        
        personalization_match = re.search(r'Personalization:\s*([^Q]*?)(?=\s*Quantity|$)', clean_details)
        personalization = personalization_match.group(1).strip() if personalization_match else ''
        
        quantity_match = re.search(r'Quantity:\s*(\d+)', clean_details)
        quantity = int(quantity_match.group(1)) if quantity_match else 1
        
        return material_size, chain_length, personalization, quantity, clean_details
        
    def parse_pricing_info(self, block: str) -> Tuple[float, float, float]:
        item_price_match = re.search(r'Item price:\s*US\$(\d+\.\d+)', block)
        item_price = float(item_price_match.group(1)) if item_price_match else 0.0
        
        discount_match = re.search(r'Discount:\s*-US\$(\d+\.\d+)', block)
        discount = float(discount_match.group(1)) if discount_match else 0.0
        
        sales_tax_match = re.search(r'(?:Sales tax|Tax):\s*US\$(\d+\.\d+)', block)
        sales_tax = float(sales_tax_match.group(1)) if sales_tax_match else 0.0
        
        return item_price, discount, sales_tax
        
    def clean_price_string(self, price_str: str) -> float:
        if not price_str:
            return 0.0
        clean_str = re.sub(r'[^\d.]', '', price_str)
        try:
            return float(clean_str)
        except:
            return 0.0
            
    def create_order_dict(self, order_data: dict) -> dict:
        """React/Next.js için optimize edilmiş order objesi oluştur"""
        return {
            "id": order_data.get("transaction_id"),
            "transaction_id": order_data.get("transaction_id"),
            "order_date": order_data.get("order_date"),
            "status": "pending",
            
            "product": {
                "name": order_data.get("product_name", ""),
                "image_url": order_data.get("etsy_image_url", ""),  # Etsy'den gelen 75x75 image URL
                "material_size": order_data.get("material_size", ""),
                "chain_length": order_data.get("chain_length", ""),
                "personalization": order_data.get("personalization", ""),
                "quantity": order_data.get("quantity", 1),
                "raw_details": order_data.get("raw_details", "")
            },
            
            "customer": {
                "name": order_data.get("recipient_name", ""),
                "email": order_data.get("buyer_email", ""),
                "address": order_data.get("full_address", ""),
                "address_components": order_data.get("address_components", {}),
                "note": order_data.get("buyer_note", "")
            },
            
            "pricing": {
                "item_price": order_data.get("item_price", 0.0),
                "discount": order_data.get("discount", 0.0),
                "sales_tax": order_data.get("sales_tax", 0.0),
                "order_total": order_data.get("order_total", 0.0),
                "currency": "USD"
            },
            
            "shop": {
                "name": order_data.get("shop_name", ""),
                "ioss_number": order_data.get("ioss_number", "")
            },
            
            "vat": {
                "vat_collected": order_data.get("vat_collected", ""),
                "vat_id": order_data.get("vat_id", ""),
                "vat_paid_chf": order_data.get("vat_paid_chf", "")
            },
            
            "fulfillment": {
                "cut": False,
                "ready": False,
                "shipped": False,
                "tracking_number": "",
                "shipping_date": None,
                "notes": ""
            },
            
            "meta": {
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "source": "portable_etsy_manager"
            }
        }
        
    def save_to_csv(self, orders: List[dict]):
        """CSV formatında kaydet"""
        if not orders:
            return
            
        csv_headers = [
            'transaction_id', 'order_date', 'status',
            'product_name', 'product_image_url', 'material_size', 'chain_length', 
            'personalization', 'quantity',
            'customer_name', 'customer_email', 'customer_address', 'customer_note',
            'item_price', 'discount', 'sales_tax', 'order_total',
            'shop_name', 'ioss_number',
            'vat_collected', 'vat_id', 'vat_paid_chf',
            'cut', 'ready', 'shipped', 'notes',
            'created_at'
        ]
        
        existing_orders = []
        csv_file = self.paths["orders_csv"]
        if csv_file.exists():
            try:
                with open(csv_file, 'r', encoding='utf-8', newline='') as f:
                    reader = csv.DictReader(f)
                    existing_orders = list(reader)
            except Exception as e:
                self.log_error(f"Mevcut CSV okunamadı: {e}")
        
        with open(csv_file, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=csv_headers)
            writer.writeheader()
            
            for order in existing_orders:
                writer.writerow(order)
            
            for order in orders:
                csv_row = {
                    'transaction_id': order['transaction_id'],
                    'order_date': order['order_date'],
                    'status': order['status'],
                    'product_name': order['product']['name'],
                    'product_image_url': order['product']['image_url'],
                    'material_size': order['product']['material_size'],
                    'chain_length': order['product']['chain_length'],
                    'personalization': order['product']['personalization'],
                    'quantity': order['product']['quantity'],
                    'customer_name': order['customer']['name'],
                    'customer_email': order['customer']['email'],
                    'customer_address': order['customer']['address'],
                    'customer_note': order['customer']['note'],
                    'item_price': order['pricing']['item_price'],
                    'discount': order['pricing']['discount'],
                    'sales_tax': order['pricing']['sales_tax'],
                    'order_total': order['pricing']['order_total'],
                    'shop_name': order['shop']['name'],
                    'ioss_number': order['shop']['ioss_number'],
                    'vat_collected': order['vat']['vat_collected'],
                    'vat_id': order['vat']['vat_id'],
                    'vat_paid_chf': order['vat']['vat_paid_chf'],
                    'cut': order['fulfillment']['cut'],
                    'ready': order['fulfillment']['ready'],
                    'shipped': order['fulfillment']['shipped'],
                    'notes': order['fulfillment']['notes'],
                    'created_at': order['meta']['created_at']
                }
                writer.writerow(csv_row)
                
        self.log_success(f"CSV kaydedildi: {csv_file}")
        
    def save_to_json(self, orders: List[dict]):
        """JSON formatında kaydet"""
        if not orders:
            return
            
        existing_orders = []
        json_file = self.paths["orders_json"]
        if json_file.exists():
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    existing_orders = json.load(f)
            except Exception as e:
                self.log_error(f"Mevcut JSON okunamadı: {e}")
        
        all_orders = existing_orders + orders
        
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(all_orders, f, indent=2, ensure_ascii=False, default=str)
            
        self.log_success(f"JSON kaydedildi: {json_file}")
        
    def process_emails(self):
        """Ana email işleme fonksiyonu"""
        try:
            username, password = self.load_credentials()
            existing_txn_ids = self.load_processed_ids()
            
            self.log_info(f"Daha önce işlenmiş sipariş sayısı: {len(existing_txn_ids)}")
            
            # Gmail'e bağlan
            gmail_config = self.settings["gmail"]
            mail = imaplib.IMAP4_SSL(gmail_config["imap_server"], gmail_config["imap_port"])
            mail.login(username, password)
            self.log_success("Gmail'e başarıyla bağlandı")
            
            mail.select('INBOX')
            
            # Mail arama
            search_from = gmail_config["search_criteria"]["from"]
            search_subject = gmail_config["search_criteria"]["subject"]
            
            status, data = mail.search(
                None,
                'OR',
                  'FROM', f'"{search_from}"',
                  'SUBJECT', f'"{search_subject}"'
            )
            
            mail_ids = data[0].split()
            self.log_info(f"Toplam {len(mail_ids)} Etsy maili bulundu")
            
            # Mail limiti
            mail_limit = self.settings["processing"]["mail_limit"]
            if mail_limit and len(mail_ids) > mail_limit:
                mail_ids = mail_ids[:mail_limit]
                self.log_info(f"Test için sadece {len(mail_ids)} mail işlenecek")
            
            new_orders = []
            processed_count = 0
            
            # Mailleri işle
            for num in reversed(mail_ids):
                processed_count += 1
                self.log_info(f"Mail {processed_count}/{len(mail_ids)} işleniyor...")
                
                # Email al
                fetch_cmd = '(BODY.PEEK[])' if self.settings["processing"]["use_peek_mode"] else '(RFC822)'
                status, msg_data = mail.fetch(num, fetch_cmd)
                msg = email.message_from_bytes(msg_data[0][1])
                
                # İçerik çıkar
                html_body = ''
                plain_body = ''
                
                for part in msg.walk():
                    if part.get_content_type() == 'text/html':
                        charset = part.get_content_charset() or 'utf-8'
                        html_body = part.get_payload(decode=True).decode(charset, errors='replace')
                    elif part.get_content_type() == 'text/plain':
                        charset = part.get_content_charset() or 'utf-8'
                        plain_body = part.get_payload(decode=True).decode(charset, errors='replace')
                
                if not plain_body or not html_body:
                    continue
                
                # Gömülü resimleri çıkar
                embedded_images = self.extract_embedded_images(msg)
                soup = BeautifulSoup(html_body, 'html.parser')
                
                # Gmail'den Etsy image URL'sini çıkar (75x75)
                etsy_image_url = self.extract_etsy_image_from_gmail(html_body)
                
                # Mail bilgilerini çıkar
                buyer_note = self.extract_buyer_note(html_body)
                ioss_number = self.extract_ioss_number(html_body)
                recipient_name, full_address = self.extract_shipping_address(html_body)
                address_components = self.parse_address_components(full_address)
                buyer_email = self.extract_buyer_email(plain_body)
                order_total_str = self.extract_order_total(plain_body)
                order_total = self.clean_price_string(order_total_str)
                shop_name = self.extract_shop_name(html_body)
                vat_collected, vat_id, vat_paid_chf = self.extract_vat_info(html_body)
                
                # Mail tarihini al
                mail_date = msg.get('Date', '')
                try:
                    from email.utils import parsedate_to_datetime
                    order_date = parsedate_to_datetime(mail_date).isoformat()
                except:
                    order_date = datetime.now().isoformat()
                
                # Transaction ID'leri bul
                transaction_matches = re.findall(r'Transaction ID:\s*(\d+)', plain_body)
                if not transaction_matches:
                    continue
                
                # Transaction'ları işle
                if len(transaction_matches) == 1:
                    blocks = [plain_body]
                else:
                    blocks = re.split(r'Transaction ID:', plain_body)[1:]
                    blocks = ['Transaction ID:' + block for block in blocks]
                
                for block in blocks:
                    txn_match = re.search(r'Transaction ID:\s*(\d+)', block)
                    if not txn_match:
                        continue
                        
                    transaction_id = int(txn_match.group(1))
                    
                    if transaction_id in existing_txn_ids:
                        self.log_info(f"  ⏭ Transaction {transaction_id} zaten işlenmiş")
                        continue
                    
                    order_details_match = re.search(r'Item:([\s\S]*?)Item price:', block)
                    if not order_details_match:
                        continue
                    
                    order_details_raw = order_details_match.group(1).strip()
                    product_name = re.sub(r'(\r\n|\n|\r)', ' ', order_details_raw)
                    product_name = re.sub(r'\s{2,}', ' ', product_name).strip()
                    
                    material_size, chain_length, personalization, quantity, clean_details = self.parse_order_details(order_details_raw)
                    item_price, discount, sales_tax = self.parse_pricing_info(block)
                    
                    self.log_success(f"  ✅ Transaction {transaction_id}: {product_name[:30]}... (Image: {'Var' if etsy_image_url else 'Yok'})")
                    
                    order_data = {
                        "transaction_id": transaction_id,
                        "order_date": order_date,
                        "product_name": product_name,
                        "etsy_image_url": etsy_image_url,  # Gmail'den çıkarılan 75x75 Etsy image URL
                        "material_size": material_size,
                        "chain_length": chain_length,
                        "personalization": personalization,
                        "quantity": quantity,
                        "raw_details": clean_details,
                        "recipient_name": recipient_name,
                        "buyer_email": buyer_email,
                        "full_address": full_address,
                        "address_components": address_components,  # Ayrıştırılmış adres bileşenleri
                        "buyer_note": buyer_note,
                        "item_price": item_price,
                        "discount": discount,
                        "sales_tax": sales_tax,
                        "order_total": order_total,
                        "shop_name": shop_name,
                        "ioss_number": ioss_number,
                        "vat_collected": vat_collected,
                        "vat_id": vat_id,
                        "vat_paid_chf": vat_paid_chf
                    }
                    
                    order_dict = self.create_order_dict(order_data)
                    new_orders.append(order_dict)
                    existing_txn_ids.add(transaction_id)
                
            mail.logout()
            self.log_success("Email işleme tamamlandı")
            
            # Verileri kaydet
            if new_orders:
                validated_orders = [o for o in new_orders if validate_order(o)]
                invalid_count = len(new_orders) - len(validated_orders)
                if invalid_count > 0:
                    self.log_error(f"{invalid_count} sipariş şema hatası nedeniyle atlandı")
                new_orders = validated_orders
                # Plugin post‑process hooks
                for plugin in self.plugins:
                    if hasattr(plugin, 'post_process'):
                        try:
                            plugin.post_process(new_orders)
                        except Exception as e:
                            self.log_error(f"Plugin {plugin.__name__} hata: {e}")
                self.create_backup()
                
                if "json" in self.settings["data"]["format"]:
                    self.save_to_json(new_orders)
                    
                if "csv" in self.settings["data"]["format"]:
                    self.save_to_csv(new_orders)
                    
                self.save_processed_ids(existing_txn_ids)
                
                self.log_success(f"İşlem tamamlandı: {len(new_orders)} yeni sipariş")
            else:
                generate_stats(new_orders, self.paths["logs_dir"], self.logger)
            self.log_info("Yeni sipariş bulunamadı")
                
        except Exception as e:
            self.log_error(f"Email işleme hatası: {e}")
            raise
            
    def run(self):
        """Ana çalıştırma fonksiyonu"""
        try:
            self.log_info(f"=== {self.settings['app']['name']} v{self.settings['app']['version']} ===")
            self.log_info(f"Çalışma dizini: {self.app_dir}")
            
            self.process_emails()
            
        except KeyboardInterrupt:
            self.log_info("İşlem kullanıcı tarafından durduruldu")
        except Exception as e:
            self.log_error(f"Genel hata: {e}")
            return 1
            
        return 0

def main():
    """Ana giriş noktası"""
    try:
        manager = PortableEtsyManager()
        return manager.run()
    except Exception as e:
        print(f"❌ Başlatma hatası: {e}")
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())
