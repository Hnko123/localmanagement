import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';

// Styled Components
const Container = styled.div`
  padding: 0;
  margin: 0;
  background: #1a1a1a;
  min-height: 100vh;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  background: #1a1a1a;
  padding: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  min-width: 1200px;
`;

const Th = styled.th`
  background: #222;
  color: white;
  padding: 12px 8px;
  text-align: left;
  border-right: 1px solid #333;
  font-weight: 600;
  font-size: 12px;
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
    background: #2a2a2a;
  }
  
  &:nth-child(odd) {
    background: #252525;
  }
  
  &:hover {
    background: #333 !important;
  }
`;

const Td = styled.td`
  padding: 8px;
  border-right: 1px solid #333;
  border-bottom: 1px solid #333;
  color: white;
  font-size: 12px;
  vertical-align: top;
  max-width: 200px;
  word-wrap: break-word;
`;

const ProductImageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
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

const TableView = ({ orders = [] }) => {
  const [columns, setColumns] = useState([
    {
      id: 'product_image',
      label: 'Image',
      width: 90,
      render: (order) => {
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
      width: 100,
      render: (order) => {
        const date = new Date(order.order_date);
        return date.toLocaleDateString('tr-TR');
      }
    },
    {
      id: 'product_name',
      label: 'Product Name',
      width: 200,
      render: (order) => order.product?.name || ''
    },
    {
      id: 'customer_name',
      label: 'Customer',
      width: 120,
      render: (order) => order.customer?.name || ''
    },
    {
      id: 'material',
      label: 'Material',
      width: 120,
      render: (order) => {
        const productName = order.product?.name || '';
        const materials = ['14K Gold', 'Sterling Silver', 'Gold Plated', 'Silver Plated', '14K Solid Gold'];
        for (const material of materials) {
          if (productName.toLowerCase().includes(material.toLowerCase())) {
            return material;
          }
        }
        return '';
      }
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
      id: 'order_total',
      label: 'Order Total',
      width: 100,
      render: (order) => {
        const total = order.pricing?.order_total || 0;
        const currency = order.pricing?.currency || 'USD';
        return `${currency} ${total.toFixed(2)}`;
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

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(columns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setColumns(items);
  };

  console.log('TableView render, orders:', orders?.length || 0);

  return (
    <Container>
      <TableContainer>
        <Table>
          <DragDropContext onDragEnd={onDragEnd}>
            <thead>
              <Droppable droppableId="headers" direction="horizontal">
                {(provided) => (
                  <tr {...provided.droppableProps} ref={provided.innerRef}>
                    {columns.map((column, index) => (
                      <Draggable key={column.id} draggableId={column.id} index={index}>
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
            {!orders || orders.length === 0 ? (
              <tr>
                <Td colSpan={columns.length} style={{ 
                  textAlign: 'center', 
                  color: '#999', 
                  fontSize: 18, 
                  padding: '40px 0' 
                }}>
                  {orders === undefined ? 'Veriler yükleniyor...' : 'Sipariş bulunamadı veya veri yüklenemedi.'}
                </Td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <Tr key={order.transaction_id || index}>
                  {columns.map((column) => (
                    <Td key={column.id} style={{ width: column.width }}>
                      {column.render(order)}
                    </Td>
                  ))}
                </Tr>
              ))
            )}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TableView;
