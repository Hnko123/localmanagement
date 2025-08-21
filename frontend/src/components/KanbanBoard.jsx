import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import OrderCard3D from './OrderCard3D';
import styled from 'styled-components';

const BoardContainer = styled.div`
  min-height: 100vh;
  background: #1a1a1a;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const TopBar = styled.div`
  background: #2a2a2a;
  border-bottom: 1px solid #3a3a3a;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BrandSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  .brand-icon {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: white;
    font-size: 18px;
  }
  
  .brand-name {
    font-size: 20px;
    font-weight: 600;
    color: #ffffff;
  }
`;

const PageTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  
  .title-icon {
    width: 24px;
    height: 24px;
    background: #667eea;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

const SyncBanner = styled.div`
  background: #1e3a8a;
  color: white;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #3a3a3a;
  
  .sync-text {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .reconnect-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
`;

const FilterBar = styled.div`
  background: #2a2a2a;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid #3a3a3a;
`;

const FilterButton = styled.button`
  background: ${props => props.active ? '#667eea' : 'transparent'};
  color: ${props => props.active ? 'white' : '#a0a0a0'};
  border: 1px solid ${props => props.active ? '#667eea' : '#3a3a3a'};
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#667eea' : '#3a3a3a'};
    color: white;
  }
`;

const BoardContent = styled.div`
  display: flex;
  gap: 16px;
  padding: 24px;
  overflow-x: auto;
  min-height: calc(100vh - 200px);
`;

const Column = styled.div`
  background: #2a2a2a;
  border-radius: 12px;
  min-width: 320px;
  max-width: 320px;
  border: 1px solid #3a3a3a;
  display: flex;
  flex-direction: column;
`;

const ColumnHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #3a3a3a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .column-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #ffffff;
  }
  
  .column-count {
    background: #3a3a3a;
    color: #a0a0a0;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .column-actions {
    display: flex;
    gap: 4px;
    
    button {
      background: transparent;
      border: none;
      color: #a0a0a0;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      
      &:hover {
        background: #3a3a3a;
        color: white;
      }
    }
  }
`;

const OrderContainer = styled.div`
  margin: 8px;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
`;

const EmptyColumn = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #a0a0a0;
  font-style: italic;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const statusColumns = {
  pending: { 
    label: "New", 
    color: "#667eea",
    icon: "📋"
  },
  cut: { 
    label: "Screening", 
    color: "#f59e0b",
    icon: "✂️"
  },
  ready: { 
    label: "Meeting", 
    color: "#10b981",
    icon: "📦"
  },
  shipped: { 
    label: "Customer", 
    color: "#8b5cf6",
    icon: "🚚"
  }
};

export default function KanbanBoard({ orders }) {
  const [orderList, setOrderList] = useState(orders);
  const [activeFilter, setActiveFilter] = useState('all');

  const onDragEnd = (result) => {
    console.log('Drag ended:', result);
    
    if (!result.destination) {
      console.log('No destination, drag cancelled');
      return;
    }
    
    const { draggableId, destination, source } = result;
    const newStatus = destination.droppableId;
    
    console.log('Moving order', draggableId, 'from', source.droppableId, 'to', newStatus);

    // Optimistic update
    setOrderList(prev => prev.map(o =>
      o.transaction_id === parseInt(draggableId) ? {...o, status: newStatus} : o
    ));

    // API call
    fetch(`/api/orders/${draggableId}/status`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ status: newStatus })
    }).catch(err => {
      console.error('Failed to update status:', err);
      // Revert on error
      setOrderList(prev => prev.map(o =>
        o.transaction_id === parseInt(draggableId) ? {...o, status: result.source.droppableId} : o
      ));
    });
  };

  const filteredOrders = activeFilter === 'all' ? orderList : 
    orderList.filter(order => order.status === activeFilter);

  const handleNewRecord = () => {
    console.log('New record clicked');
    alert('Yeni kayıt ekleme özelliği yakında gelecek!');
  };

  const handleCardClick = (order) => {
    console.log('Card clicked:', order);
    alert(`Sipariş: ${order.product?.name || 'Unknown'}\nMüşteri: ${order.customer?.name || 'Unknown'}`);
  };

  return (
    <BoardContainer>
      <TopBar>

        
        <PageTitle>
          <div className="title-icon">📦</div>
          Görevler
        </PageTitle>
        
        <ActionButton onClick={handleNewRecord}>+ New record</ActionButton>
      </TopBar>



      <FilterBar>
        <FilterButton 
          active={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
        >
          All Opportunities
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'pending'}
          onClick={() => setActiveFilter('pending')}
        >
          New
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'cut'}
          onClick={() => setActiveFilter('cut')}
        >
          Screening
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'ready'}
          onClick={() => setActiveFilter('ready')}
        >
          Meeting
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'shipped'}
          onClick={() => setActiveFilter('shipped')}
        >
          Customer
        </FilterButton>
      </FilterBar>
      
      <BoardContent>
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.entries(statusColumns).map(([key, config]) => {
            const columnOrders = filteredOrders.filter(o => o.status === key);
            
            return (
              <Droppable droppableId={key} key={key}>
                {(provided, snapshot) => (
                  <Column
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      borderColor: snapshot.isDraggingOver ? config.color : '#3a3a3a',
                      background: snapshot.isDraggingOver ? '#2f2f2f' : '#2a2a2a'
                    }}
                  >
                    <ColumnHeader>
                      <div className="column-title">
                        <span>{config.icon}</span>
                        <span>{config.label}</span>
                      </div>
                      <div className="column-actions">
                        <span className="column-count">{columnOrders.length}</span>
                        <button>-</button>
                        <button>+ New</button>
                      </div>
                    </ColumnHeader>
                    
                    {columnOrders.length === 0 ? (
                      <EmptyColumn>
                        No opportunities in this stage
                      </EmptyColumn>
                    ) : (
                      columnOrders.map((order, index) => (
                        <Draggable
                          draggableId={String(order.transaction_id)}
                          index={index}
                          key={order.transaction_id}
                        >
                          {(provided, snapshot) => (
                            <OrderContainer
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                transform: snapshot.isDragging
                                  ? provided.draggableProps.style.transform
                                  : 'none',
                                opacity: snapshot.isDragging ? 0.8 : 1
                              }}
                              onClick={() => handleCardClick(order)}
                            >
                              <OrderCard3D order={order} />
                            </OrderContainer>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </Column>
                )}
              </Droppable>
            );
          })}
        </DragDropContext>
      </BoardContent>
    </BoardContainer>
  );
}
