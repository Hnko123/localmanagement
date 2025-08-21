import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import TableView from './components/TableView_COMPLETE';
import Tasks from './components/Tasks';
import Calendar from './components/Calendar';
import Chat from './components/Chat';
import TestInteraction from './components/TestInteraction';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #1a1a1a;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  overflow: hidden;
  margin: 0;
  padding: 0;
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: ${props => props.sidebarCollapsed ? '60px' : '250px'};
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  transition: margin-left 0.3s ease;
  /* Custom scrollbar styles */
  &::-webkit-scrollbar { 
    width: 8px; 
  }
  &::-webkit-scrollbar-track { 
    background: #1a1a1a; 
  }
  &::-webkit-scrollbar-thumb { 
    background: #3a3a3a; 
    border-radius: 4px; 
  }
  &::-webkit-scrollbar-thumb:hover { 
    background: #4a4a4a; 
  }
  
  /* Remove any default margins/padding */
  margin-top: 0;
  margin-bottom: 0;
  padding: 0;
`;

const OrdersPageContainer = styled.div`
  min-height: 100vh;
  background: #1a1a1a;
`;

const OrdersHeader = styled.div`
  background: #2a2a2a;
  border-bottom: 1px solid #3a3a3a;
  padding: 20px 30px;
  
  h1 {
    color: white;
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 8px 0;
  }
  
  p {
    color: #a0a0a0;
    margin: 0;
    font-size: 14px;
  }
  
  .orders-stats {
    margin-top: 15px;
    display: flex;
    gap: 20px;
  }
  
  .stat-item {
    color: #667eea;
    font-size: 14px;
    font-weight: 600;
  }
`;

function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [ordersViewMode, setOrdersViewMode] = useState('table'); // 'kanban' or 'table'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
          console.log('✅ API\'den veri yüklendi:', data.length, 'sipariş');
        } else {
          throw new Error('API yanıt vermedi');
        }
      } catch (error) {
        console.error('API hatası, yerel veri deneniyor:', error);
        // Fallback: Local JSON file
        try {
          const response = await fetch('/data/etsy_orders.json');
          if (response.ok) {
            const data = await response.json();
            setOrders(data);
            console.log('✅ Yerel dosyadan veri yüklendi:', data.length, 'sipariş');
          } else {
            throw new Error('Yerel dosya da bulunamadı');
          }
        } catch (error2) {
          console.error('Veri yüklenemedi:', error2);
          setOrders([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleSidebarStateChange = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard orders={orders} />;
      case 'orders':
        return (
          <OrdersPageContainer>
            <OrdersHeader>
              <h1>Etsy Siparişleri</h1>
              <p>Gmail'den çekilen sipariş detayları ve durum takibi</p>
              <div className="orders-stats">
                <span className="stat-item">📦 Toplam: {orders.length}</span>
                <span className="stat-item">✂️ Kesim: {orders.filter(o => o.fulfillment?.cut).length}</span>
                <span className="stat-item">✅ Hazır: {orders.filter(o => o.fulfillment?.ready).length}</span>
                <span className="stat-item">🚚 Gönderildi: {orders.filter(o => o.fulfillment?.shipped).length}</span>
              </div>
            </OrdersHeader>
            <TableView orders={orders} />
          </OrdersPageContainer>
        );
      case 'tasks':
        return <Tasks />;
      case 'calendar':
        return <Calendar />;
      case 'chat':
        return <Chat />;
      case 'test':
        return <TestInteraction />;
      default:
        return <Dashboard orders={orders} />;
    }
  };

  if (loading) {
    return (
      <AppContainer style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        📊 Gmail verileri yükleniyor...
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Sidebar 
        activePage={activePage} 
        onPageChange={setActivePage}
        onStateChange={handleSidebarStateChange}
      />
      <MainContent sidebarCollapsed={sidebarCollapsed}>
        {renderPage()}
      </MainContent>
    </AppContainer>
  );
}

export default App;
