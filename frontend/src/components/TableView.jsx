import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';

const TableView = ({ orders }) => {
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
      id: 'shipped',
      label: 'Shipped',
      width: 80,
      render: (order) => (
        <Checkbox 
          checked={order.fulfillment?.shipped || false}
          onChange={(e) => handleStatusUpdate(order.transaction_id, 'shipped', e.target.checked)}
        />
      )
    },
    {
      id: 'material',
      label: 'Material',
      width: 120,
      render: (order) => order.product?.material_size || ''
    },
    {
      id: 'size',
      label: 'Size',
      width: 80,
      render: (order) => {
        const material = order.product?.material_size || '';
        const sizeMatch = material.match(/(\d+)mm/);
        return sizeMatch ? sizeMatch[1] + 'mm' : '';
      }
    },
    {
      id: 'product_name',
      label: 'Product Name',
      width: 200,
      resizable: true,
      render: (order) => {
        const productName = order.product?.name || '';
        return (
          <TruncatableText title={productName}>
            {productName}
          </TruncatableText>
        );
      }
    },
    {
      id: 'pendant_size',
      label: 'Pendant Size',
      width: 100,
      resizable: true,
      render: (order) => {
        const productName = order.product?.name || '';
        const sizeMatch = productName.match(/(\d+)\s*mm/i);
        return sizeMatch ? `${sizeMatch[1]}mm` : '';
      }
    },
    {
      id: 'pendant_material',
      label: 'Pendant Material',
      width: 120,
      resizable: true,
      render: (order) => {
        const productName = order.product?.name || '';
        // Extract material after pendant size
        const materialMatch = productName.match(/\d+mm\s*(.+?)(?:pendant|necklace|$)/i);
        if (materialMatch) {
          return materialMatch[1].trim();
        }
        // Fallback: look for common materials
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
      id: 'shop_name',
      label: 'Shop Name',
      width: 120,
      render: (order) => order.shop?.name || ''
    },
    {
      id: 'buyer_note',
      label: 'Buyer Note',
      width: 150,
      render: (order) => order.customer?.note || ''
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
      id: 'discount',
      label: 'Discount',
      width: 100,
      render: (order) => {
        const discount = order.pricing?.discount || 0;
        return discount > 0 ? `-${discount.toFixed(2)}` : '';
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
      id: 'shipping_price',
      label: 'Shipping Price',
      width: 100,
      render: (order) => {
        const shipping = order.pricing?.shipping_price || 0;
        const currency = order.pricing?.currency || 'USD';
        return `${currency} ${shipping.toFixed(2)}`;
      }
    },
    {
      id: 'transaction_id',
      label: 'Transaction ID',
      width: 120,
      render: (order) => order.transaction_id
    },
    {
      id: 'address',
      label: 'Address',
      width: 200,
      render: (order) => order.customer?.address || ''
    },
    {
      id: 'country',
      label: 'Country',
      width: 100,
      render: (order) => order.customer?.address_components?.country || 'Unknown'
    },
    {
      id: 'vat_collected',
      label: 'VAT Collected',
      width: 100,
      render: (order) => order.vat?.vat_collected || ''
    },
    {
      id: 'currency',
      label: 'Currency',
      width: 80,
      render: (order) => order.pricing?.currency || 'USD'
    },
    {
      id: 'vat_number',
      label: 'VAT Number',
      width: 120,
      render: (order) => order.vat?.vat_id || ''
    },
    {
      id: 'ioss_number',
      label: 'IOSS Number',
      width: 120,
      render: (order) => order.shop?.ioss_number || ''
    },
    {
      id: 'buyer_email',
      label: 'Buyer Email',
      width: 150,
      render: (order) => order.customer?.email || ''
    },
    {
      id: 'important_note',
      label: 'Important Note',
      width: 150,
      render: (order) => (
        <NoteInput 
          placeholder="Not ekle..."
          value={order.important_note || ''}
          onChange={(e) => handleNoteUpdate(order.transaction_id, e.target.value)}
        />
      )
    },
    {
      id: 'problem',
      label: 'Problem',
      width: 80,
      render: (order) => (
        <Checkbox 
          checked={order.problem || false}
          onChange={(e) => handleProblemUpdate(order.transaction_id, e.target.checked)}
        />
      )
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

  const handleNoteUpdate = async (transactionId, note) => {
    try {
      const response = await fetch(`/api/orders/${transactionId}/note`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ important_note: note })
      });
      if (response.ok) {
        // Update local state
      }
    } catch (error) {
      console.error('Note update error:', error);
    }
  };

  const handleProblemUpdate = async (transactionId, problem) => {
    try {
      const response = await fetch(`/api/orders/${transactionId}/problem`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: problem })
      });
      if (response.ok) {
        // If problem is checked, move to top
        window.location.reload();
      }
    } catch (error) {
      console.error('Problem update error:', error);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(columns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setColumns(items);
  };

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
            {orders.length === 0 ? (
              <tr>
                <Td colSpan={columns.length} style={{ textAlign: 'center', color: '#999', fontSize: 18, padding: '40px 0' }}>
                  Sipariş bulunamadı veya veri yüklenemedi.
                </Td>
              </tr>
            ) : (
              orders.map((order) => (
                <Tr key={order.transaction_id || Math.random()}>
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
    }
  ]);

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

export default TableView;
