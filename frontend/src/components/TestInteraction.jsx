import React, { useState } from 'react';
import styled from 'styled-components';

const TestContainer = styled.div`
  padding: 20px;
  background: white;
  min-height: 100vh;
`;

const TestButton = styled.button`
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin: 10px;
  font-size: 14px;
  
  &:hover {
    background: #5a67d8;
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const TestInput = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 10px;
  font-size: 14px;
`;

const TestSelect = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 10px;
  font-size: 14px;
`;

function TestInteraction() {
  const [clickCount, setClickCount] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('option1');

  const handleClick = () => {
    setClickCount(prev => prev + 1);
    console.log('Button clicked!', clickCount + 1);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    console.log('Input changed:', e.target.value);
  };

  const handleSelectChange = (e) => {
    setSelectValue(e.target.value);
    console.log('Select changed:', e.target.value);
  };

  return (
    <TestContainer>
      <h1>🧪 Interaction Test Page</h1>
      <p>Bu sayfa tüm etkileşimlerin çalışıp çalışmadığını test eder.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Button Test:</h3>
        <TestButton onClick={handleClick}>
          Click Me! (Clicked: {clickCount} times)
        </TestButton>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Input Test:</h3>
        <TestInput 
          type="text"
          placeholder="Type something..."
          value={inputValue}
          onChange={handleInputChange}
        />
        <p>Current value: {inputValue}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Select Test:</h3>
        <TestSelect value={selectValue} onChange={handleSelectChange}>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
          <option value="option3">Option 3</option>
        </TestSelect>
        <p>Selected: {selectValue}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Mouse Events Test:</h3>
        <div 
          style={{
            width: '200px',
            height: '100px',
            background: '#f0f0f0',
            border: '2px solid #ddd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#e0e0e0';
            console.log('Mouse entered');
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#f0f0f0';
            console.log('Mouse left');
          }}
          onClick={() => {
            console.log('Div clicked');
            alert('Div clicked successfully!');
          }}
        >
          Click this area
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Console Messages:</h3>
        <p>Check browser console (F12) for interaction logs.</p>
      </div>
    </TestContainer>
  );
}

export default TestInteraction;
