import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import TableView from './components/TableView_NEW';
import Tasks from './components/Tasks';
import Calendar from './components/Calendar';
import Chat from './components/Chat';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  margin-left: 250px;
`;

const ContentWrapper = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 40px);
  overflow: hidden;
`;

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/orders');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched orders:', data);
        setOrders(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <div style={{ padding: '20px', textAlign: 'center' }}>Loading orders...</div>;
    }

    if (error) {
      return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard orders={orders} />;
      case 'kanban':
        return <KanbanBoard orders={orders} />;
      case 'table':
        return <TableView orders={orders} />;
      case 'tasks':
        return <Tasks />;
      case 'calendar':
        return <Calendar />;
      case 'chat':
        return <Chat />;
      default:
        return <Dashboard orders={orders} />;
    }
  };

  return (
    <AppContainer>
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <MainContent>
        <ContentWrapper>
          {renderContent()}
        </ContentWrapper>
      </MainContent>
    </AppContainer>
  );
}

export default App;
