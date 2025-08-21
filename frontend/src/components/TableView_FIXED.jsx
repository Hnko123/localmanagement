import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';

// Styled Components
const Container = styled.div`
  width: 100%;
  height: 100%;
  background: #1a1a1a;
  color: white;
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  max-height: calc(100vh - 140px);
  
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #1a1a1a;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #3a3a3a;
    border-radius: 4px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #2a2a2a;
  
  * {
    border: none !important;
  }
`;

const Th = styled.th`
  background: #222;
  color: white;
  font-weight: 600;
  font-size: 13px;
  padding: 12px 8px;
  text-align: left;
  border-bottom: 2px solid #3a3a3a;
  position: sticky;
  top: 0;
  z-index: 10;
  cursor: grab;
  user-select: none;
  
  &:hover {
    background: #333;
  }
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background: #252525;
  }
  
  &:hover {
    background: #2d2d2d;
  }
`;

const Td = styled.td`
  padding: 8px;
  border-bottom: 1px solid #333;
  font-size: 12px;
  vertical-align: top;
  max-width: 200px;
  word-wrap: break-word;
`;

const ProductImageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 75px;
  height: 75px;
`;

const ProductImage = styled.img`
  width: 75px;
  height: 75px;
  object-fit: cover;
  border: 3px solid #f5f5f1;
  background-color: #fff;
  padding: 3px;
  display: block;
`;

const ProductImagePlaceholder = styled.div`
  width: 75px;
  height: 75px;
  background: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 3px solid #f5f5f1;
  background-color: #fff;
  color: #999;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const NoteInput = styled.input`
  background: #333;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 6px 8px;
  color: white;
  font-size: 12px;
  width: 100%;
  
  &::placeholder {
    color: #888;
  }
`;

const TruncatableText = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 4px;
    border-radius: 4px;
  }
`;

const TableView = ({ orders = [] }) => {
  const [columns, setColumns] = useState([
    {
      id: 'product_image',
      label: 'Image',
      width: 90,
      resizable: true,
      render: (order) => {
        // Gmail'den gelen Google proxy URL'ini kullan
        const rawDetails = order.product?.raw_details || '';
        const imageMatch = rawDetails.match(/https:\/\/ci\d+\.googleusercontent\.com[^"]+/);
        if (imageMatch) {
          const googleProxyUrl = imageMatch[0];
          return (
            <ProductImageContainer>
              <ProductImage src={googleProxyUrl} alt="Product" />
            </ProductImageContainer>
          );
        }
        // Fallback: Base64 image data
        const imageData = order.product?.image_data;
        if (imageData) {
          try {
            const imageUrl = `data:image/jpeg;base64,${imageData}`;
            return (
              <ProductImageContainer>
                <ProductImage src={imageUrl} alt="Product" />
              </ProductImageContainer>
            );
          } catch (error) {
            console.error('Resim dönüştürme hatası:', error);
          }
        }
        return (
          <ProductImageContainer>
            <ProductImagePlaceholder>📷</ProductImagePlaceholder>
          </ProductImageContainer>
        );
      }
    },
    {
      id: 'order_date',
      label: 'Order Date',
      width: 110,
      render: (order) => {
        const date = new Date(order.order_date);
        return date.toLocaleDateString('tr-TR');
      }
    },
    {
      id: 'buyer_name',
      label: 'Buyer',
      width: 150,
      render: (order) => order.customer?.name || ''
    },
    {
      id: 'product_name',
      label: 'Product',
      width: 200,
      render: (order) => (
        <TruncatableText title={order.product?.name}>
          {order.product?.name || ''}
        </TruncatableText>
      )
    },
    {
      id: 'chain_length',
      label: 'Chain Length',
      width: 120,
      render: (order) => order.product?.chain_length || ''
    },
    {
      id: 'personalization',
      label: 'Personalization',
      width: 150,
      render: (order) => order.product?.personalization || ''
    },
    {
      id: 'quantity',
      label: 'Quantity',
      width: 80,
      render: (order) => order.product?.quantity || 1
    },
    {
      id: 'total_price',
      label: 'Total Price',
      width: 100,
      render: (order) => {
        const price = order.pricing?.item_price || 0;
        const currency = order.pricing?.currency || 'USD';
        return `${currency} ${price.toFixed(2)}`;
      }
    },
    {
      id: 'transaction_id',
      label: 'Transaction ID',
      width: 120,
      render: (order) => order.transaction_id
    },
    {
      id: 'country',
      label: 'Country',
      width: 100,
      render: (order) => order.customer?.address_components?.country || 'Unknown'
    }
  ]);

  const handleStatusUpdate = async (transactionId, status, value) => {
    try {
      const response = await fetch(`/api/orders/${transactionId}/fulfillment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [status]: value })
      });
      if (response.ok) {
        // Refresh data or update local state
        window.location.reload();
      }
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(columns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setColumns(items);
  };

  // Debug log
  console.log('TableView orders:', orders, 'length:', orders?.length);

  if (!orders || orders.length === 0) {
    return (
      <Container>
        <div style={{ 
          textAlign: 'center', 
          color: '#999', 
          fontSize: '18px', 
          padding: '40px',
          background: '#2a2a2a',
          margin: '20px',
          borderRadius: '8px'
        }}>
          📦 Sipariş bulunamadı veya veri yüklenemedi.
          <br />
          <small style={{ fontSize: '14px', marginTop: '10px', display: 'block' }}>
            Backend API'den veri çekilemiyor olabilir.
          </small>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <TableContainer>
        <Table>
          <DragDropContext onDragEnd={onDragEnd}>
            <thead>
              <Droppable droppableId="headers" direction="horizontal">
                {(provided) => (
                  <tr
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {columns.map((column, index) => (
                      <Draggable
                        key={column.id}
                        draggableId={column.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Th
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              width: column.width,
                              opacity: snapshot.isDragging ? 0.8 : 1,
                              background: snapshot.isDragging ? '#333' : '#222'
                            }}
                          >
                            {column.label}
                          </Th>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </tr>
                )}
              </Droppable>
            </thead>
          </DragDropContext>
          <tbody>
            {orders.map((order, index) => (
              <Tr key={order.transaction_id || index}>
                {columns.map((column) => (
                  <Td key={column.id} style={{ width: column.width }}>
                    {column.render(order)}
                  </Td>
                ))}
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TableView;
