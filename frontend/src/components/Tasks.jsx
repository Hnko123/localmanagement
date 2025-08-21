import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const TasksContainer = styled.div`
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

const TaskGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const TaskCard = styled.div`
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  padding: 24px;
  
  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .task-title {
    color: white;
    font-size: 16px;
    font-weight: 600;
  }
  
  .task-status {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    text-transform: uppercase;
    font-weight: 600;
  }
  
  .status-pending { background: #f59e0b; color: white; }
  .status-progress { background: #3b82f6; color: white; }
  .status-completed { background: #10b981; color: white; }
  
  .task-description {
    color: #a0a0a0;
    font-size: 14px;
    margin-bottom: 15px;
    line-height: 1.5;
  }
  
  .task-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #666;
  }
`;

const AddTaskButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 20px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
  }
`;

const Tasks = () => {
  // localStorage'dan mevcut tasks'ları yükle
  const loadTasks = () => {
    try {
      const savedTasks = localStorage.getItem('etsy-tasks');
      return savedTasks ? JSON.parse(savedTasks) : [
        {
          id: 1,
          title: "Maltese Dog Pendant - Kesim",
          description: "Transaction ID: 4557190128 - 14K Gold 20mm kesim işlemi",
          status: "completed",
          priority: "high",
          dueDate: "2025-08-20",
          assignee: "Atölye"
        },
        {
          id: 2,
          title: "Tiger Pendant - Kişiselleştirme",
          description: "Milan yazısı gravür işlemi - Gold Plated 25mm",
          status: "progress",
          priority: "medium",
          dueDate: "2025-08-21",
          assignee: "Atölye"
        },
        {
          id: 3,
          title: "Dachshund Necklace - Üretim",
          description: "Gold Plated 22mm - Zincir eklenecek",
          status: "pending",
          priority: "low",
          dueDate: "2025-08-22",
          assignee: "Atölye"
        }
      ];
    } catch (error) {
      console.error('Tasks yüklenirken hata:', error);
      return [];
    }
  };

  const [tasks, setTasks] = useState(loadTasks);

  // Tasks değiştiğinde localStorage'a kaydet
  useEffect(() => {
    try {
      localStorage.setItem('etsy-tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Tasks kaydedilirken hata:', error);
    }
  }, [tasks]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'progress': return 'status-progress';
      default: return 'status-pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'progress': return 'Devam Ediyor';
      default: return 'Bekliyor';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      default: return '🟢';
    }
  };

  const handleAddTask = () => {
    const newTask = {
      id: Date.now(),
      title: `Yeni Görev ${tasks.length + 1}`,
      description: "Açıklama eklenecek...",
      status: "pending",
      priority: "medium",
      dueDate: new Date().toISOString().split('T')[0],
      assignee: "Atölye"
    };
    
    setTasks([...tasks, newTask]);
    console.log('Yeni görev eklendi:', newTask);
    alert('Yeni görev başarıyla eklendi!');
  };

  const handleTaskClick = (task) => {
    console.log('Görev tıklandı:', task);
    alert(`Görev: ${task.title}\nDurum: ${getStatusText(task.status)}`);
  };

  return (
    <TasksContainer>
      <PageHeader>
        <h1>Görevler</h1>
        <p>Sipariş işleme süreçleri ve atölye görevleri</p>
      </PageHeader>
      <ContentArea>
        <AddTaskButton onClick={handleAddTask}>
          + Yeni Görev Ekle
        </AddTaskButton>
        
        <TaskGrid>
          {tasks.map(task => (
            <TaskCard key={task.id} onClick={() => handleTaskClick(task)} style={{ cursor: 'pointer' }}>
              <div className="task-header">
                <div className="task-title">
                  {getPriorityIcon(task.priority)} {task.title}
                </div>
                <div className={`task-status ${getStatusColor(task.status)}`}>
                  {getStatusText(task.status)}
                </div>
              </div>
              
              <div className="task-description">
                {task.description}
              </div>
              
              <div className="task-meta">
                <span>👤 {task.assignee}</span>
                <span>📅 {task.dueDate}</span>
              </div>
            </TaskCard>
          ))}
        </TaskGrid>
      </ContentArea>
    </TasksContainer>
  );
};

export default Tasks;
