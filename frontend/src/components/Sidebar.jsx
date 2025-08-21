import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  width: ${props => props.collapsed ? '60px' : '250px'};
  height: 100vh;
  background: #1a1a1a;
  border-right: 1px solid #3a3a3a;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  transition: width 0.3s ease;
  overflow: hidden;
`;

const Logo = styled.div`
  padding: 20px;
  border-bottom: 1px solid #3a3a3a;
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  
  .logo-icon {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 16px;
    flex-shrink: 0;
    transform: perspective(100px) rotateX(10deg) rotateY(-5deg);
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.3),
      0 8px 16px rgba(102, 126, 234, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    
    &:hover {
      transform: perspective(100px) rotateX(15deg) rotateY(-10deg) scale(1.05);
      box-shadow: 
        0 6px 12px rgba(0, 0, 0, 0.4),
        0 12px 24px rgba(102, 126, 234, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }
  }
  
  .logo-text {
    color: white;
    font-size: 18px;
    font-weight: 600;
    opacity: ${props => props.collapsed ? 0 : 1};
    transition: opacity 0.3s ease;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    transform: perspective(200px) rotateX(5deg);
  }
`;

const NavMenu = styled.nav`
  padding: 20px 0;
`;

const NavItem = styled.div`
  padding: 12px 20px;
  color: ${props => props.active ? '#667eea' : '#a0a0a0'};
  background: ${props => props.active ? '#2a2a2a' : 'transparent'};
  border-left: 3px solid ${props => props.active ? '#667eea' : 'transparent'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: #2a2a2a;
    color: white;
  }
  
  .nav-icon {
    font-size: 18px;
    flex-shrink: 0;
  }
  
  .nav-text {
    font-size: 14px;
    font-weight: 500;
    opacity: ${props => props.collapsed ? 0 : 1};
    transition: opacity 0.3s ease;
  }
`;

const Sidebar = ({ activePage, onPageChange, onStateChange }) => {
  const [collapsed, setCollapsed] = useState(false);
  const timeoutRef = useRef(null);

  const navItems = [
    { id: 'dashboard', icon: '📊', text: 'Dashboard' },
    { id: 'orders', icon: '📦', text: 'Orders' },
    { id: 'tasks', icon: '✅', text: 'Tasks' },
    { id: 'calendar', icon: '📅', text: 'Calendar' },
    { id: 'chat', icon: '💬', text: 'Chat' },
    { id: 'test', icon: '🧪', text: 'Test Interaction' }
  ];

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setCollapsed(false);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setCollapsed(true);
    }, 3000);
  };

  useEffect(() => {
    if (onStateChange) {
      onStateChange(collapsed);
    }
  }, [collapsed, onStateChange]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <SidebarContainer 
      collapsed={collapsed}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Logo collapsed={collapsed}>
        <div className="logo-icon">🐒</div>
        <div className="logo-text">Five Monkeys</div>
      </Logo>
      
      <NavMenu>
        {navItems.map(item => (
          <NavItem
            key={item.id}
            active={activePage === item.id}
            collapsed={collapsed}
            onClick={() => onPageChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.text}</span>
          </NavItem>
        ))}
      </NavMenu>
    </SidebarContainer>
  );
};

export default Sidebar;
