import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as THREE from 'three';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #1a1a1a;
  padding: 0;
  margin: 0;
`;

const PageHeader = styled.div`
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
`;

const ContentArea = styled.div`
  padding: 30px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 15px;
  
  .stat-icon {
    font-size: 24px;
    color: #a0a0a0;
  }
  
  .stat-content {
    display: flex;
    flex-direction: column;
  }
  
  .stat-value {
    color: white;
    font-size: 28px;
    font-weight: 600;
  }
  
  .stat-label {
    color: #a0a0a0;
    font-size: 14px;
  }
`;

const ChartContainer = styled.div`
  background: #2a2a2a;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
  display: flex;
  gap: 40px;
  align-items: center;
  justify-content: center;
  
  .chart-title {
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 20px;
    text-align: center;
  }
  
  .chart-canvas {
    width: 200px;
    height: 200px;
    border-radius: 8px;
    background: #1f1f1f;
  }
`;

const ChartSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .chart-title {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 16px;
    text-align: center;
  }
  
  .chart-canvas {
    width: 180px;
    height: 180px;
    border-radius: 8px;
    background: #1f1f1f;
  }
`;

const Dashboard = ({ orders }) => {
  const chartRef = useRef();
  const chartRef2 = useRef();

  // Calculate stats from orders data
  const stats = {
    total: orders.length,
    pending: orders.filter(order => order.status === 'pending').length,
    cut: orders.filter(order => order.fulfillment?.cut).length,
    ready: orders.filter(order => order.fulfillment?.ready).length,
    shipped: orders.filter(order => order.fulfillment?.shipped).length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.pricing?.order_total || 0), 0)
  };

  useEffect(() => {
    if (chartRef.current && chartRef2.current) {
      // Clear previous charts
      chartRef.current.innerHTML = '';
      chartRef2.current.innerHTML = '';

      // Create first chart (Order Status)
      const scene1 = new THREE.Scene();
      const camera1 = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      const renderer1 = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer1.setSize(180, 180);
      chartRef.current.appendChild(renderer1.domElement);

      // Create second chart (Fulfillment Status)
      const scene2 = new THREE.Scene();
      const camera2 = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      const renderer2 = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer2.setSize(180, 180);
      chartRef2.current.appendChild(renderer2.domElement);

      // First chart data
      const data1 = [
        { value: stats.pending, color: 0x667eea, label: 'Pending' },
        { value: stats.cut, color: 0xf59e0b, label: 'Cut' },
        { value: stats.ready, color: 0x10b981, label: 'Ready' },
        { value: stats.shipped, color: 0x8b5cf6, label: 'Shipped' }
      ].filter(item => item.value > 0);

      // Second chart data
      const data2 = [
        { value: stats.cut, color: 0xf59e0b, label: 'Cut' },
        { value: stats.ready, color: 0x10b981, label: 'Ready' },
        { value: stats.shipped, color: 0x8b5cf6, label: 'Shipped' }
      ].filter(item => item.value > 0);

      // Create donut charts
      createDonutChart(scene1, camera1, renderer1, data1, 'Order Status');
      createDonutChart(scene2, camera2, renderer2, data2, 'Fulfillment Status');
    }
  }, [stats]);

  const createDonutChart = (scene, camera, renderer, data, title) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return;

    let currentAngle = 0;
    data.forEach((item, index) => {
      const angle = (item.value / total) * Math.PI * 2;
      
      const geometry = new THREE.RingGeometry(0.3, 0.8, 32);
      const material = new THREE.MeshBasicMaterial({ 
        color: item.color,
        side: THREE.DoubleSide 
      });
      const ring = new THREE.Mesh(geometry, material);
      
      ring.rotation.z = currentAngle;
      scene.add(ring);
      
      currentAngle += angle;
    });

    camera.position.z = 2;
    
    const animate = () => {
      requestAnimationFrame(animate);
      scene.rotation.z += 0.005;
      renderer.render(scene, camera);
    };
    animate();
  };

  return (
    <DashboardContainer>
      <PageHeader>
        <h1>Dashboard</h1>
        <p>Overview of your Etsy orders and business metrics</p>
      </PageHeader>
      <ContentArea>
        <StatsGrid>
          <StatCard>
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Orders</div>
            </div>
          </StatCard>
          <StatCard>
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
          </StatCard>
          <StatCard>
            <div className="stat-icon">✂️</div>
            <div className="stat-content">
              <div className="stat-value">{stats.cut}</div>
              <div className="stat-label">Cut</div>
            </div>
          </StatCard>
          <StatCard>
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.ready}</div>
              <div className="stat-label">Ready</div>
            </div>
          </StatCard>
          <StatCard>
            <div className="stat-icon">🚚</div>
            <div className="stat-content">
              <div className="stat-value">{stats.shipped}</div>
              <div className="stat-label">Shipped</div>
            </div>
          </StatCard>
          <StatCard>
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-value">${stats.totalRevenue.toFixed(2)}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </StatCard>
        </StatsGrid>
        
        <ChartContainer>
          <ChartSection>
            <div className="chart-title">Order Status Distribution</div>
            <div ref={chartRef} className="chart-canvas"></div>
          </ChartSection>
          <ChartSection>
            <div className="chart-title">Fulfillment Progress</div>
            <div ref={chartRef2} className="chart-canvas"></div>
          </ChartSection>
        </ChartContainer>
      </ContentArea>
    </DashboardContainer>
  );
};

export default Dashboard;
