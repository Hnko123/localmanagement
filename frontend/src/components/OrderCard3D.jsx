import React, { useState } from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
  }
`;

const CardHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #3a3a3a;
  background: #1f1f1f;
`;

const CardTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  .card-icon {
    width: 16px;
    height: 16px;
    background: #667eea;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: white;
  }
`;

const CardSubtitle = styled.div`
  font-size: 12px;
  color: #a0a0a0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardContent = styled.div`
  padding: 16px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-size: 12px;
  color: #a0a0a0;
  font-weight: 500;
`;

const InfoValue = styled.span`
  font-size: 12px;
  color: #ffffff;
  font-weight: 600;
`;

const PriceTag = styled.div`
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
`;

const StatusBadge = styled.span`
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  color: white;
  background: ${props => {
    switch(props.status) {
      case 'pending': return '#667eea';
      case 'cut': return '#f59e0b';
      case 'ready': return '#10b981';
      case 'shipped': return '#8b5cf6';
      default: return '#6b7280';
    }
  }};
`;

const CustomerAvatar = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: 600;
`;

const Divider = styled.div`
  height: 1px;
  background: #3a3a3a;
  margin: 8px 0;
`;

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

const formatPrice = (price) => {
  if (!price) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return 'N/A';
  }
};

const truncateText = (text, maxLength = 30) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const extractProductType = (productName) => {
  if (!productName) return 'Order';
  const name = productName.toLowerCase();
  if (name.includes('pendant')) return 'Pendant';
  if (name.includes('necklace')) return 'Necklace';
  if (name.includes('ring')) return 'Ring';
  if (name.includes('bracelet')) return 'Bracelet';
  if (name.includes('earring')) return 'Earring';
  return 'Order';
};

export default function OrderCard3D({ order }) {
  const [isHovered, setIsHovered] = useState(false);

  const productType = extractProductType(order.product?.name);
  const orderId = order.transaction_id?.toString().slice(-4) || '0000';

  return (
    <CardContainer
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader>
        <CardTitle>
          <div className="card-icon">📦</div>
          {productType} - {orderId}
        </CardTitle>
        <CardSubtitle>
          <span>📧 Email Thread</span>
          <span>•</span>
          <span>{formatDate(order.order_date)}</span>
        </CardSubtitle>
      </CardHeader>
      
      <CardContent>
        <InfoRow>
          <InfoLabel>$ Amount</InfoLabel>
          <PriceTag>
            {formatPrice(order.pricing?.order_total)}
          </PriceTag>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>rest</InfoLabel>
          <InfoValue>API</InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>Close date</InfoLabel>
          <InfoValue>{formatDate(order.order_date)}</InfoValue>
        </InfoRow>
        
        <Divider />
        
        <InfoRow>
          <InfoLabel>Company</InfoLabel>
          <InfoValue>{truncateText(order.shop?.name, 15)}</InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>Point of Contact</InfoLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CustomerAvatar>
              {getInitials(order.customer?.name)}
            </CustomerAvatar>
            <InfoValue>{truncateText(order.customer?.name, 12)}</InfoValue>
          </div>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>Status</InfoLabel>
          <StatusBadge status={order.status}>
            {order.status === 'pending' && 'New'}
            {order.status === 'cut' && 'Screening'}
            {order.status === 'ready' && 'Meeting'}
            {order.status === 'shipped' && 'Customer'}
          </StatusBadge>
        </InfoRow>
        
        {order.product?.quantity > 1 && (
          <InfoRow>
            <InfoLabel>Quantity</InfoLabel>
            <InfoValue>x{order.product.quantity}</InfoValue>
          </InfoRow>
        )}
        
        {order.customer?.note && (
          <>
            <Divider />
            <InfoRow>
              <InfoLabel>Note</InfoLabel>
              <InfoValue style={{ fontSize: '11px', color: '#a0a0a0' }}>
                {truncateText(order.customer.note, 25)}
              </InfoValue>
            </InfoRow>
          </>
        )}
      </CardContent>
    </CardContainer>
  );
}
