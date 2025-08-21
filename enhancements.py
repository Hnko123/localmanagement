"""
Enhanced utilities for Portable Etsy Order Manager
=================================================

Bu modül, aşağıdaki ek özellikleri sağlar:
1. Dil desteği (translate)
2. Plugin sistemi (load_plugins)
3. İstatistik raporu (generate_stats)
4. JSON şema doğrulama (validate_order)
"""

import json
import os
from pathlib import Path
from typing import List, Dict

# ---------- Dil desteği ----------
_language_cache = {}


def _load_lang_file(lang: str) -> dict:
    """Yüklenmemişse lang dosyasını yükler."""
    if lang in _language_cache:
        return _language_cache[lang]
    base_dir = Path(__file__).parent / 'lang'
    file_path = base_dir / f'{lang}.json'
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            _language_cache[lang] = data
            return data
    except Exception:
        _language_cache[lang] = {}
        return {}


def translate(key: str, lang: str = 'en') -> str:
    """Basit çeviri fonksiyonu."""
    translations = _load_lang_file(lang)
    return translations.get(key, key)

# ---------- Plugin sistemi ----------

def load_plugins(app_dir: Path) -> List[object]:
    """plugins/ klasöründeki .py dosyalarını yükler.
    Her plugin bir Python modülü olmalı ve opsiyonel olarak 'process(order_dict)' fonksiyonu içermeli.
    """
    plugins = []
    plugin_dir = app_dir / 'plugins'
    if not plugin_dir.exists():
        return plugins
    for file in plugin_dir.glob('*.py'):
        try:
            module_name = f'plugins.{file.stem}'
            import importlib.util, sys
            spec = importlib.util.spec_from_file_location(module_name, str(file))
            mod = importlib.util.module_from_spec(spec)
            sys.modules[module_name] = mod
            spec.loader.exec_module(mod)
            plugins.append(mod)
        except Exception as e:
            print(f'Plugin {file.name} yüklenemedi: {e}')
    return plugins

# ---------- İstatistik raporu ----------

def generate_stats(new_orders: List[Dict], logs_dir: Path, logger=None):
    """
    Yeni sipariş sayısı ve toplam gelir gibi istatistikleri kaydeder.
    :param new_orders: İşlenen yeni siparişler listesi
    :param logs_dir: Log klasörü yolu
    :param logger: logging.Logger (opsiyonel)
    """
    if not new_orders:
        return
    total_revenue = sum(o.get('pricing', {}).get('order_total', 0) for o in new_orders)
    stats = {
        'date': logs_dir.parent.name,  # yyyyMMdd
        'new_order_count': len(new_orders),
        'total_revenue_usd': total_revenue,
        'generated_at': __import__('datetime').datetime.now().isoformat()
    }
    stats_file = logs_dir / f"stats_{logs_dir.parent.name}.json"
    try:
        with open(stats_file, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2)
        if logger:
            logger.info(f'Statistics written to {stats_file}')
    except Exception as e:
        if logger:
            logger.error(f'Stats yazılamadı: {e}')

# ---------- JSON şema doğrulama ----------
from jsonschema import validate, ValidationError
_schema_cache = None
_schema_path = Path(__file__).parent / 'order_schema.json'


def _load_schema():
    global _schema_cache
    if _schema_cache is not None:
        return _schema_cache
    try:
        with open(_schema_path, 'r', encoding='utf-8') as f:
            _schema_cache = json.load(f)
    except Exception as e:
        print(f'Schema yüklenemedi: {e}')
        _schema_cache = {}
    return _schema_cache


def validate_order(order: dict) -> bool:
    """JSON şemasına göre order doğrulama.
    Başarılıysa True, hatalıysa False döner ve hata mesajı yazdırır."""
    schema = _load_schema()
    if not schema:
        return True  # Şema yoksa geçerli kabul et
    try:
        validate(instance=order, schema=schema)
        return True
    except ValidationError as e:
        print(f'Şema hatası: {e.message}')
        return False
