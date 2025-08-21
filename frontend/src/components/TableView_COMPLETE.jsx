import React, { useState } from 'react';
import styled from 'styled-components';

// Styled Components
const Container = styled.div`
  padding: 20px;
  margin: 0;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-co          <thead>
            <tr>
              <Th>Resim</Th>
              <Th>Ürün Bilgileri</Th>
              <Th>Müşteri</Th>
              <Th onClick={() => handleSort('order_date')} style={{ cursor: 'pointer' }}>
                Sipariş Tarihi {sortField === 'order_date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Th>
              <Th>Durum</Th>
              <Th>Materyal & Boyut</Th>
              <Th>Zincir Uzunluğu</Th>
              <Th>Kişiselleştirme</Th>
              <Th>Adet</Th>
              <Th onClick={() => handleSort('order_total')} style={{ cursor: 'pointer' }}>
                Toplam {sortField === 'order_total' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Th>
              <Th>İndirim</Th>
              <Th>Vergi</Th>
              <Th>Adres</Th>
              <Th>Ülke</Th>
              <Th>IOSS</Th>
              <Th>Gönderim Durumu</Th>
              <Th>Sipariş ID</Th>
            </tr>
          </thead>en;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 300px;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1400px;
`;

const Th = styled.th`
  background: #f8f9fa;
  color: #2c3e50;
  padding: 16px 12px;
  text-align: left;
  border-bottom: 2px solid #e9ecef;
  font-weight: 600;
  font-size: 13px;
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: nowrap;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background: #f8f9fa;
  }
  
  &:hover {
    background: #e3f2fd;
    cursor: pointer;
  }
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  font-size: 13px;
  vertical-align: top;
`;

const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ddd;
`;

const ProductName = styled.div`
  max-width: 200px;
  font-weight: 500;
  color: #2c3e50;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const CustomerInfo = styled.div`
  max-width: 150px;
  line-height: 1.4;
`;

const CustomerName = styled.div`
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 2px;
`;

const CustomerEmail = styled.div`
  color: #666;
  font-size: 12px;
`;

const PriceInfo = styled.div`
  text-align: right;
`;

const Price = styled.div`
  font-weight: 600;
  color: #27ae60;
  margin-bottom: 2px;
`;

const Currency = styled.span`
  font-size: 11px;
  color: #666;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  
  ${props => {
    if (props.status === 'pending') {
      return 'background: #fff3cd; color: #856404;';
    } else if (props.status === 'shipped') {
      return 'background: #d4edda; color: #155724;';
    } else if (props.status === 'completed') {
      return 'background: #cce5ff; color: #004085;';
    }
    return 'background: #f8d7da; color: #721c24;';
  }}
`;

const OrderDate = styled.div`
  color: #666;
  font-size: 12px;
`;

const PersonalizationInfo = styled.div`
  max-width: 150px;
  font-style: italic;
  color: #666;
  font-size: 12px;
  line-height: 1.3;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Quantity = styled.div`
  text-align: center;
  font-weight: 500;
`;

const MaterialSize = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
`;

const ChainLength = styled.div`
  font-size: 12px;
  color: #999;
`;

// Image URL'yi büyük versiyona çevirme fonksiyonu
const convertImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // il_75x75 formatını il_500x500 formatına çevir
  return imageUrl.replace(/il_75x75/, 'il_300x300');
};

function TableView({ orders = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'order_date', direction: 'desc' });

  // Arama filtresi
  const filteredOrders = orders.filter(order => {
    const searchString = searchTerm.toLowerCase();
    return (
      order.product?.name?.toLowerCase().includes(searchString) ||
      order.customer?.name?.toLowerCase().includes(searchString) ||
      order.customer?.email?.toLowerCase().includes(searchString) ||
      order.transaction_id?.toString().includes(searchString)
    );
  });

  // Sıralama
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortConfig.key === 'order_date') {
      const dateA = new Date(a.order_date);
      const dateB = new Date(b.order_date);
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    if (sortConfig.key === 'order_total') {
      const priceA = a.pricing?.order_total || 0;
      const priceB = b.pricing?.order_total || 0;
      return sortConfig.direction === 'asc' ? priceA - priceB : priceB - priceA;
    }
    
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price, currency = 'USD') => {
    return `${price?.toFixed(2)} ${currency}`;
  };

  const getCountryFromAddress = (address) => {
    if (!address) return null;
    const parts = address.split(',');
    const lastPart = parts[parts.length - 1]?.trim();
    
    // Ülke adı genellikle adresin son kısmındadır
    const countries = {
      'United States': 'ABD',
      'Germany': 'Almanya', 
      'United Kingdom': 'İngiltere',
      'England': 'İngiltere',
      'Canada': 'Kanada',
      'Denmark': 'Danimarka',
      'Poland': 'Polonya',
      'Switzerland': 'İsviçre',
      'Ireland': 'İrlanda',
      'The Netherlands': 'Hollanda',
      'Netherlands': 'Hollanda'
    };
    
    return countries[lastPart] || lastPart;
  };

  if (!orders || orders.length === 0) {
    return (
      <Container>
        <Header>
          <Title>Etsy Siparişleri</Title>
        </Header>
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Henüz sipariş verisi bulunamadı.
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Etsy Siparişleri ({orders.length})</Title>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Ürün adı, müşteri adı veya email ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
      </Header>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Resim</Th>
              <Th>Ürün Bilgileri</Th>
              <Th>Müşteri</Th>
              <Th onClick={() => handleSort('order_date')} style={{ cursor: 'pointer' }}>
                Sipariş Tarihi {sortConfig.key === 'order_date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </Th>
              <Th>Durum</Th>
              <Th>Materyal & Boyut</Th>
              <Th>Kişiselleştirme</Th>
              <Th>Adet</Th>
              <Th onClick={() => handleSort('order_total')} style={{ cursor: 'pointer' }}>
                Fiyat {sortConfig.key === 'order_total' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </Th>
              <Th>Sipariş ID</Th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map((order, index) => (
              <Tr key={order.id || index}>
                <Td>
                  {order.product?.image_url && (
                    <ProductImage 
                      src={convertImageUrl(order.product.image_url)} 
                      alt={order.product?.name || 'Product'}
                      onError={(e) => {
                        // Eğer büyük resim yüklenemezse, orijinal küçük resmi göster
                        e.target.src = order.product.image_url;
                      }}
                    />
                  )}
                </Td>
                
                <Td>
                  <ProductName title={order.product?.name}>
                    {order.product?.name || 'Ürün adı bulunamadı'}
                  </ProductName>
                </Td>
                
                <Td>
                  <CustomerInfo>
                    <CustomerName>{order.customer?.name || 'Ad bulunamadı'}</CustomerName>
                    <CustomerEmail title={order.customer?.email}>
                      {order.customer?.email || 'Email bulunamadı'}
                    </CustomerEmail>
                  </CustomerInfo>
                </Td>
                
                <Td>
                  <OrderDate>{formatDate(order.order_date)}</OrderDate>
                </Td>
                
                <Td>
                  <StatusBadge status={order.status}>
                    {order.status || 'unknown'}
                  </StatusBadge>
                </Td>
                
                <Td>
                  <MaterialSize>{order.product?.material_size || 'Belirtilmemiş'}</MaterialSize>
                </Td>
                
                <Td>
                  <ChainLength>{order.product?.chain_length || 'Zincir yok'}</ChainLength>
                </Td>
                
                <Td>
                  <PersonalizationInfo title={order.product?.personalization}>
                    {order.product?.personalization === 'Not requested on this item.' 
                      ? 'Kişiselleştirme yok' 
                      : order.product?.personalization || 'Belirtilmemiş'}
                  </PersonalizationInfo>
                </Td>
                
                <Td>
                  <Quantity>{order.product?.quantity || 1}</Quantity>
                </Td>
                
                <Td>
                  <PriceInfo>
                    <Price>
                      {formatPrice(order.pricing?.order_total, order.pricing?.currency)}
                    </Price>
                  </PriceInfo>
                </Td>
                
                <Td>
                  {order.pricing?.discount > 0 ? (
                    <div style={{ fontSize: '12px', color: '#e74c3c' }}>
                      {formatPrice(order.pricing.discount, order.pricing?.currency)}
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#666' }}>-</div>
                  )}
                </Td>
                
                <Td>
                  {order.pricing?.sales_tax > 0 ? (
                    <div style={{ fontSize: '12px', color: '#3498db' }}>
                      {formatPrice(order.pricing.sales_tax, order.pricing?.currency)}
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#666' }}>-</div>
                  )}
                </Td>
                
                <Td>
                  <div style={{ fontSize: '11px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={order.customer?.address}>
                    {order.customer?.address?.split(',').slice(0, 2).join(',') || 'Adres yok'}
                  </div>
                </Td>
                
                <Td>
                  <div style={{ fontSize: '12px', fontWeight: '500' }}>
                    {getCountryFromAddress(order.customer?.address) || 'Bilinmiyor'}
                  </div>
                </Td>
                
                <Td>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    {order.shop?.ioss_number !== 'Yok' ? order.shop?.ioss_number : '-'}
                  </div>
                </Td>
                
                <Td>
                  <div style={{ fontSize: '11px' }}>
                    {order.fulfillment?.shipped ? (
                      <span style={{ color: '#27ae60' }}>✓ Gönderildi</span>
                    ) : order.fulfillment?.ready ? (
                      <span style={{ color: '#f39c12' }}>📦 Hazır</span>
                    ) : (
                      <span style={{ color: '#e74c3c' }}>⏳ Bekliyor</span>
                    )}
                  </div>
                </Td>
                
                <Td>
                  <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    {order.transaction_id}
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
      
      {filteredOrders.length === 0 && searchTerm && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          "{searchTerm}" araması için sonuç bulunamadı.
        </div>
      )}
    </Container>
  );
}

export default TableView;
