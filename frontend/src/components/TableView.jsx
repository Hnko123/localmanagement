import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';

// Styled Components
const Container = styled.div`
  padding: 20px;
  margin: 0;
  background: #1a1a1a;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  color: white;
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
  border: 1px solid #666;
  border-radius: 6px;
  font-size: 14px;
  width: 300px;
  background: #333;
  color: white;
`;

const WidthInput = styled.input`
  padding: 4px 8px;
  border: 1px solid #666;
  border-radius: 4px;
  font-size: 12px;
  width: 50px;
  background: #333;
  color: white;
  margin: 0 5px;
`;

const FontSizeInput = styled.input`
  padding: 4px 8px;
  border: 1px solid #666;
  border-radius: 4px;
  font-size: 12px;
  width: 50px;
  background: #333;
  color: white;
  margin: 0 5px;
`;

const ColumnControls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
  background: #2a2a2a;
  padding: 10px;
  border-radius: 6px;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  background: #1a1a1a;
  border-radius: 8px;
  border: 1px solid #3a3a3a;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1400px;
  table-layout: fixed;
`;

const ResizeHandle = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: col-resize;
  background: rgba(255, 255, 255, 0.2);
  border-left: 1px solid rgba(255, 255, 255, 0.5);
  margin-left: -1px;

  &:hover {
    background: rgba(255, 255, 255, 0.4);
  }
`;

const Th = styled.th`
  background: #2a2a2a;
  color: white;
  padding: 16px 12px;
  text-align: left;
  border-bottom: 2px solid #3a3a3a;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  font-weight: 600;
  font-size: 13px;
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: nowrap;
  position: relative;
  min-width: 80px;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background: #1a1a1a;
  }

  &:hover {
    background: #3a3a3a;
    cursor: pointer;
  }
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #3a3a3a;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
  vertical-align: middle;
  color: white;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  ${props => props.fontSize && `font-size: ${props.fontSize}px !important;`}
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #f0f0f0;
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
`;

const ProductName = styled.div`
  font-weight: 500;
  color: white;
  line-height: 1.4;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const CustomerInfo = styled.div`
  max-width: 150px;
  line-height: 1.4;
`;

const CustomerName = styled.div`
  font-weight: 500;
  color: white;
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
  color: white;
  font-size: 12px;
`;

const StatusCheckbox = styled.input`
  margin: 0;
  width: 16px;
  height: 16px;
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
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem('searchTerm') || '');
  const [sortConfig, setSortConfig] = useState(() => {
    const saved = localStorage.getItem('sortConfig');
    return saved ? JSON.parse(saved) : { key: 'order_date', direction: 'desc' };
  });
  const [checkedStatuses, setCheckedStatuses] = useState(() => {
    const saved = localStorage.getItem('checkedStatuses');
    return saved ? JSON.parse(saved) : {};
  });
  const [buyerNameFontSize, setBuyerNameFontSize] = useState(() => localStorage.getItem('buyerNameFontSize') || '14');
  const [editingCell, setEditingCell] = useState(null);
  const [editedValues, setEditedValues] = useState(() => {
    const saved = localStorage.getItem('editedValues');
    return saved ? JSON.parse(saved) : {};
  });
  const [columnWidths, setColumnWidths] = useState(() => {
    const saved = localStorage.getItem('columnWidths');
    return saved ? JSON.parse(saved) : {
    photo: '80px',
    productname: '200px',
    buyername: '150px',
    tarih: '120px',
    Kesildi: '80px',
    Hazır: '80px',
    Gönderildi: '100px',
    importantnote: '150px',
    material: '120px',
    'Chain Length': '150px',
    Personalization: '180px',
    Quantity: '100px',
    ioss: '80px',
    transaction: '120px',
    FullAdress: '250px',
    itemprice: '100px',
    discount: '100px',
    salestax: '100px',
    ordertotal: '100px',
    buyeremail: '200px',
    vatcollected: '100px',
    vatid: '120px',
    fullorderdetails: '200px',
    shop: '120px',
    vatpaidchf: '100px',
    Problem: '120px',
    buyermessage: '200px',
    'Buyer Note': '120px',
    Expres: '80px',
    express: '80px',
    gonderimdurumu: '120px'
  };
  });
  const [resizing, setResizing] = useState(null);
  const [startPos, setStartPos] = useState(0);
  const [startSize, setStartSize] = useState(0);
const [users, setUsers] = useState([]);
  const [imageErrors, setImageErrors] = useState({});

  // Image URL correct handler
  const getImageSrc = (photoUrl) => {
    if (!photoUrl) return null;

    // If already cached image (/images/*.jpg format) - use backend URL with relative
    if (photoUrl.startsWith('/images/')) {
      return photoUrl;  // Will use vite proxy as /images/*
    }

    // If Google Drive URL - use directly
    if (photoUrl.includes('drive.google.com')) {
      return photoUrl;
    }

    // For other URLs, try directly
    return photoUrl;
  };

  const handleColumnResizeStart = useCallback((column) => (e) => {
    e.preventDefault();
    setResizing(column);
    setStartPos(e.clientX);
    setStartSize(parseInt(columnWidths[column]) || 100);
  }, [columnWidths]);

  const handleMouseMove = useCallback((e) => {
    if (!resizing) return;
    const diff = e.clientX - startPos;
    const newWidth = Math.max(50, startSize + diff);
    setColumnWidths(prev => ({...prev, [resizing]: newWidth + 'px'}));
  }, [resizing, startPos, startSize]);

  const handleMouseUp = useCallback(() => {
    setResizing(null);
  }, []);

  useEffect(() => {
    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizing, handleMouseMove, handleMouseUp]);

  // Save user data to localStorage
  useEffect(() => {
    localStorage.setItem('checkedStatuses', JSON.stringify(checkedStatuses));
  }, [checkedStatuses]);

  useEffect(() => {
    localStorage.setItem('editedValues', JSON.stringify(editedValues));
  }, [editedValues]);

  useEffect(() => {
    localStorage.setItem('buyerNameFontSize', buyerNameFontSize);
  }, [buyerNameFontSize]);

  useEffect(() => {
    localStorage.setItem('searchTerm', searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    localStorage.setItem('sortConfig', JSON.stringify(sortConfig));
  }, [sortConfig]);

  useEffect(() => {
    localStorage.setItem('columnWidths', JSON.stringify(columnWidths));
  }, [columnWidths]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8080/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleAssignment = async (orderId, userId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/api/orders/${orderId}/assign/${userId}`, {
        method: 'POST'
      });
      if (response.ok) {
        console.log(`Order ${orderId} assigned to user ${userId}`);
      }
    } catch (error) {
      console.error('Assignment error:', error);
    }
  };

  const getAssignedUser = (orderId) => {
    // For demo, we'll use in-memory tracking
    return localStorage.getItem(`assignment-${orderId}`);
  };

  // Arama filtresi
  const filteredOrders = orders.filter(order => {
    const searchString = searchTerm.toLowerCase();
    return (
      (order.productname || '').toLowerCase().includes(searchString) ||
      (order.buyername || '').toLowerCase().includes(searchString) ||
      (order.buyeremail || '').toLowerCase().includes(searchString) ||
      (order.transaction || '').toString().includes(searchString)
    );
  });

  // Sıralama fonksiyonu
  const sortOrders = (orders, key, direction) => {
    return [...orders].sort((a, b) => {
      let aValue, bValue;

      switch (key) {
        case 'tarih':
          aValue = new Date(a.tarih);
          bValue = new Date(b.tarih);
          break;
        case 'ordertotal':
          aValue = parseFloat((a.ordertotal || '0').replace('US$', '').replace(/,/g, '')) || 0;
          bValue = parseFloat((b.ordertotal || '0').replace('US$', '').replace(/,/g, '')) || 0;
          break;
        case 'productname':
          aValue = (a.productname || '').toLowerCase();
          bValue = (b.productname || '').toLowerCase();
          break;
        case 'buyername':
          aValue = (a.buyername || '').toLowerCase();
          bValue = (b.buyername || '').toLowerCase();
          break;
        case 'buyeremail':
          aValue = (a.buyeremail || '').toLowerCase();
          bValue = (b.buyeremail || '').toLowerCase();
          break;
        case 'material':
          aValue = (a.material || '').toLowerCase();
          bValue = (b.material || '').toLowerCase();
          break;
        case 'Personalization':
          aValue = (a.Personalization || '').toLowerCase();
          bValue = (b.Personalization || '').toLowerCase();
          break;
        case 'Quantity':
          aValue = parseInt(a.Quantity) || 0;
          bValue = parseInt(b.Quantity) || 0;
          break;
        case 'transaction':
          aValue = a.transaction || 0;
          bValue = b.transaction || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Sıralama
  const sortedOrders = sortOrders(filteredOrders, sortConfig.key, sortConfig.direction);

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
        <div style={{ textAlign: 'center', padding: '40px', color: white }}>
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

      <ColumnControls>
        <span>Sütun Genişlikleri (px):</span>
        <label>Photo: <WidthInput
          type="number"
          value={parseInt(columnWidths.photo)}
          onChange={(e) => setColumnWidths(prev => ({...prev, photo: e.target.value + 'px'}))}
        /></label>
        <label>ProductName: <WidthInput
          type="number"
          value={parseInt(columnWidths.productname)}
          onChange={(e) => setColumnWidths(prev => ({...prev, productname: e.target.value + 'px'}))}
        /></label>
        <label>BuyerName: <WidthInput
          type="number"
          value={parseInt(columnWidths.buyername)}
          onChange={(e) => setColumnWidths(prev => ({...prev, buyername: e.target.value + 'px'}))}
        /></label>
        <label>Font Size (px): <FontSizeInput
          type="number"
          value={buyerNameFontSize}
          onChange={(e) => setBuyerNameFontSize(e.target.value)}
        /></label>
      </ColumnControls>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th style={{width: columnWidths.photo}}>
                <div onClick={() => handleSort('photo')}>photo</div>
                <ResizeHandle onMouseDown={handleColumnResizeStart('photo')} />
              </Th>
              <Th style={{width: columnWidths.productname}}>
                <div onClick={() => handleSort('productname')}>
                  productname {sortConfig.key === 'productname' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </div>
                <ResizeHandle onMouseDown={handleColumnResizeStart('productname')} />
              </Th>
              <Th style={{width: columnWidths.buyername}}>
                <div onClick={() => handleSort('buyername')}>
                  buyername {sortConfig.key === 'buyername' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </div>
                <ResizeHandle onMouseDown={handleColumnResizeStart('buyername')} />
              </Th>
              <Th style={{width: columnWidths.tarih}}>
                <div onClick={() => handleSort('tarih')} style={{ cursor: 'pointer' }}>
                  tarih {sortConfig.key === 'tarih' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </div>
                <ResizeHandle onMouseDown={handleColumnResizeStart('tarih')} />
              </Th>
              <Th style={{width: columnWidths.Kesildi}}>Kesildi<ResizeHandle onMouseDown={handleColumnResizeStart('Kesildi')} /></Th>
              <Th style={{width: columnWidths.Hazır}}>Hazır<ResizeHandle onMouseDown={handleColumnResizeStart('Hazır')} /></Th>
              <Th style={{width: columnWidths.Gönderildi}}>Gönderildi<ResizeHandle onMouseDown={handleColumnResizeStart('Gönderildi')} /></Th>
              <Th style={{width: columnWidths.importantnote}}>importantnote<ResizeHandle onMouseDown={handleColumnResizeStart('importantnote')} /></Th>
              <Th style={{width: columnWidths.material}}>material<ResizeHandle onMouseDown={handleColumnResizeStart('material')} /></Th>
              <Th style={{width: columnWidths['Chain Length']}}>Chain Length<ResizeHandle onMouseDown={handleColumnResizeStart('Chain Length')} /></Th>
              <Th style={{width: columnWidths.Personalization}}>Personalization<ResizeHandle onMouseDown={handleColumnResizeStart('Personalization')} /></Th>
              <Th style={{width: columnWidths.Quantity}}>
                Quantity {sortConfig.key === 'Quantity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <ResizeHandle onMouseDown={handleColumnResizeStart('Quantity')} />
              </Th>
              <Th style={{width: columnWidths.ioss}}>ioss<ResizeHandle onMouseDown={handleColumnResizeStart('ioss')} /></Th>
              <Th style={{width: columnWidths.transaction}}>
                transaction {sortConfig.key === 'transaction' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <ResizeHandle onMouseDown={handleColumnResizeStart('transaction')} />
              </Th>
              <Th style={{width: columnWidths.FullAdress}}>FullAdress<ResizeHandle onMouseDown={handleColumnResizeStart('FullAdress')} /></Th>
              <Th style={{width: columnWidths.itemprice}}>itemprice<ResizeHandle onMouseDown={handleColumnResizeStart('itemprice')} /></Th>
              <Th style={{width: columnWidths.discount}}>discount<ResizeHandle onMouseDown={handleColumnResizeStart('discount')} /></Th>
              <Th style={{width: columnWidths.salestax}}>salestax<ResizeHandle onMouseDown={handleColumnResizeStart('salestax')} /></Th>
              <Th style={{width: columnWidths.ordertotal}}>
                ordertotal {sortConfig.key === 'ordertotal' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <ResizeHandle onMouseDown={handleColumnResizeStart('ordertotal')} />
              </Th>
              <Th style={{width: columnWidths.buyeremail}}>buyeremail<ResizeHandle onMouseDown={handleColumnResizeStart('buyeremail')} /></Th>
              <Th style={{width: columnWidths.vatcollected}}>vatcollected<ResizeHandle onMouseDown={handleColumnResizeStart('vatcollected')} /></Th>
              <Th style={{width: columnWidths.vatid}}>vatid<ResizeHandle onMouseDown={handleColumnResizeStart('vatid')} /></Th>
              <Th style={{width: columnWidths.fullorderdetails}}>fullorderdetails<ResizeHandle onMouseDown={handleColumnResizeStart('fullorderdetails')} /></Th>
              <Th style={{width: columnWidths.shop}}>shop<ResizeHandle onMouseDown={handleColumnResizeStart('shop')} /></Th>
              <Th style={{width: columnWidths.vatpaidchf}}>vatpaidchf<ResizeHandle onMouseDown={handleColumnResizeStart('vatpaidchf')} /></Th>
              <Th style={{width: columnWidths.Problem}}>Problem<ResizeHandle onMouseDown={handleColumnResizeStart('Problem')} /></Th>
              <Th style={{width: columnWidths.buyermessage}}>buyermessage<ResizeHandle onMouseDown={handleColumnResizeStart('buyermessage')} /></Th>
              <Th style={{width: columnWidths['Buyer Note']}}>Buyer Note<ResizeHandle onMouseDown={handleColumnResizeStart('Buyer Note')} /></Th>
              <Th style={{width: columnWidths.Expres}}>Expres<ResizeHandle onMouseDown={handleColumnResizeStart('Expres')} /></Th>
              <Th style={{width: columnWidths.express}}>express<ResizeHandle onMouseDown={handleColumnResizeStart('express')} /></Th>
              <Th style={{width: columnWidths.gonderimdurumu}}>gonderimdurumu<ResizeHandle onMouseDown={handleColumnResizeStart('gonderimdurumu')} /></Th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map((order, index) => {
              const isKesildiChecked = String(order.Kesildi).toLowerCase() === 'true' || order.Kesildi === true;
              const isHazırChecked = String(order.Hazır).toLowerCase() === 'true' || order.Hazır === true;
              const isGönderildiChecked = String(order.Gönderildi).toLowerCase() === 'true' || order.Gönderildi === true;

              return (
                <Tr key={order.transaction || index}>
                  <Td>
                    {order.photo ? (
                      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <ProductImage
                          src={getImageSrc(order.photo)}  // FIXED: Use getImageSrc function
                          alt={order.productname || 'Product'}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <ImagePlaceholder style={{ display: 'none' }}>
                          📦
                        </ImagePlaceholder>
                      </div>
                    ) : (
                      <ImagePlaceholder>
                        📦
                      </ImagePlaceholder>
                    )}
                  </Td>
                  <Td fontSize={parseInt(buyerNameFontSize)}>
                    <ProductName title={order.productname}>
                      {order.productname || '-'}
                    </ProductName>
                  </Td>
                  <Td fontSize={parseInt(buyerNameFontSize)}>
                    <CustomerName>{order.buyername || '-'}</CustomerName>
                  </Td>
                  <Td fontSize={parseInt(buyerNameFontSize)}>
                    <OrderDate>{formatDate(order.tarih)}</OrderDate>
                  </Td>
                  <Td onClick={() => setCheckedStatuses(prev => ({...prev, [order.transaction + '-Kesildi']: !prev[order.transaction + '-Kesildi']} ))} style={{cursor: 'pointer', textAlign: 'center', fontSize: '26px'}}>
                    {checkedStatuses[order.transaction + '-Kesildi'] ? '✅' : '⬜'}
                  </Td>
                  <Td onClick={() => setCheckedStatuses(prev => ({...prev, [order.transaction + '-Hazır']: !prev[order.transaction + '-Hazır']} ))} style={{cursor: 'pointer', textAlign: 'center', fontSize: '26px'}}>
                    {checkedStatuses[order.transaction + '-Hazır'] ? '✅' : '⬜'}
                  </Td>
                  <Td onClick={() => setCheckedStatuses(prev => ({...prev, [order.transaction + '-Gönderildi']: !prev[order.transaction + '-Gönderildi']} ))} style={{cursor: 'pointer', textAlign: 'center', fontSize: '26px'}}>
                    {checkedStatuses[order.transaction + '-Gönderildi'] ? '✅' : '⬜'}
                  </Td>
              <Td fontSize={parseInt(buyerNameFontSize)} style={{maxHeight: 'none'}}>
                {editingCell === `${order.transaction}-importantnote` ? (
                  <input
                    type="text"
                    value={editedValues[`${order.transaction}-importantnote`] || order.importantnote || ''}
                    onChange={(e) => setEditedValues(prev => ({...prev, [`${order.transaction}-importantnote`]: e.target.value}))}
                    onBlur={() => setEditingCell(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditingCell(null);
                      } else if (e.key === 'Escape') {
                        setEditingCell(null);
                        setEditedValues(prev => {
                          const newPrev = {...prev};
                          delete newPrev[`${order.transaction}-importantnote`];
                          return newPrev;
                        });
                      }
                    }}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '4px',
                      background: '#333',
                      color: 'white',
                      border: '1px solid #666',
                      borderRadius: '3px'
                    }}
                  />
                ) : (
                  <div
                    onDoubleClick={() => setEditingCell(`${order.transaction}-importantnote`)}
                    style={{ cursor: 'pointer' }}
                  >
                    {editedValues[`${order.transaction}-importantnote`] || order.importantnote || '-'}
                  </div>
                )}
              </Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{order.material || '-'}</Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{order['Chain Length'] || '-'}</Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{order.Personalization || '-'}</Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{order.Quantity || '-'}</Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{order.ioss || '-'}</Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{order.transaction || '-'}</Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{order.FullAdress || '-'}</Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{order.itemprice || '-'}</Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{order.discount || '-'}</Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{order.salestax || '-'}</Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{formatPrice(parseFloat((order.ordertotal || '0').replace('US$','')))}</Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{order.buyeremail || '-'}</Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{order.vatcollected || '-'}</Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{order.vatid || '-'}</Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{order.fullorderdetails || '-'}</Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{order.shop || '-'}</Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{order.vatpaidchf || '-'}</Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{order.Problem || '-'}</Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{order.buyermessage || '-'}</Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{order['Buyer Note'] || '-'}</Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{order.Expres || '-'}</Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{order.express || '-'}</Td>
              <Td fontSize={parseInt(buyerNameFontSize)}>{order.gonderimdurumu || '-'}</Td>
                </Tr>
              );
            })}
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
