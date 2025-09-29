import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const TasksContainer = styled.div`
  padding: 20px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const PageTitle = styled.h1`
  color: white;
  margin: 0;
`;

const AddTaskButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  }
`;

const KanbanContainer = styled.div`
  display: flex;
  gap: 20px;
  height: calc(100vh - 140px);
`;

const Column = styled.div`
  flex: 1;
  background: rgba(34, 34, 34, 0.8);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const ColumnTitle = styled.h2`
  color: white;
  margin: 0 0 20px 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    display: block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => {
      if (props.status === 'todo') return '#f39c12';
      if (props.status === 'in-progress') return '#3498db';
      return '#27ae60';
    }};
  }
`;

const TasksList = styled.div`
  flex: 1;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.4);
    }
  }
`;

const TaskCard = styled.div`
  background: #333;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: transform 0.2s;
  border-left: 4px solid ${props => {
    if (props.status === 'todo') return '#f39c12';
    if (props.status === 'in-progress') return '#3498db';
    return '#27ae60';
  }};
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-2px);
  }
`;

const TaskImage = styled.img`
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 8px;
  border: 1px solid #555;
`;

const TaskTitle = styled.h3`
  color: white;
  margin: 0 0 8px 0;
  font-size: 16px;
`;

const TaskMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #aaa;
  margin-bottom: 8px;
`;

const TaskDescription = styled.p`
  color: #ccc;
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
`;

const TaskAssignee = styled.div`
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  display: inline-block;
`;

const TaskDate = styled.div`
  font-size: 11px;
  color: #f39c12;
`;

const TaskModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #2a2a2a;
  padding: 30px;
  border-radius: 12px;
  width: 500px;
  max-width: 90vw;
`;

const ModalTitle = styled.h2`
  color: white;
  margin: 0 0 20px 0;
  font-size: 24px;
`;

const ModalForm = styled.form``;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  color: white;
  margin-bottom: 8px;
  font-weight: 500;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #666;
  border-radius: 6px;
  background: #333;
  color: white;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #666;
  border-radius: 6px;
  background: #333;
  color: white;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #666;
  border-radius: 6px;
  background: #333;
  color: white;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const SaveButton = styled(ModalButton)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const CancelButton = styled(ModalButton)`
  background: #666;
  color: white;
`;

function Tasks() {
  const [tasks, setTasks] = useState({
    todo: [],
    'in-progress': [],
    done: []
  });
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, []);

  const loadTasks = () => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  };

  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem('tasks', JSON.stringify(newTasks));
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8080/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleSaveTask = (taskData) => {
    const task = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      start_date: new Date().toISOString().split('T')[0],
      ...taskData
    };

    const column = task.status || 'todo';
    const currentTasks = { ...tasks };
    currentTasks[column] = [...(currentTasks[column] || []), task];

    saveTasks(currentTasks);
    setShowModal(false);
  };

  const onDragStart = (e, taskId, fromColumn) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('fromColumn', fromColumn);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, toColumn) => {
    e.preventDefault();

    const taskId = e.dataTransfer.getData('taskId');
    const fromColumn = e.dataTransfer.getData('fromColumn');

    if (fromColumn === toColumn) return;

    const currentTasks = { ...tasks };
    const taskIndex = currentTasks[fromColumn].findIndex(t => t.id === taskId);
    const task = currentTasks[fromColumn][taskIndex];

    // Remove from source column
    currentTasks[fromColumn].splice(taskIndex, 1);

    // Update task status
    task.status = toColumn;

    // Add to destination column
    if (!currentTasks[toColumn]) currentTasks[toColumn] = [];
    currentTasks[toColumn].push(task);

    saveTasks(currentTasks);
  };

  const getAssigneeName = (assigneeId) => {
    const user = users.find(u => u.id === assigneeId);
    return user ? user.full_name || user.username : 'Bilinmiyor';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <TasksContainer>
      <PageHeader>
        <PageTitle>Görev Yönetimi</PageTitle>
        <AddTaskButton onClick={handleAddTask}>
          ➕ Görev Ekle
        </AddTaskButton>
      </PageHeader>

      <KanbanContainer>
        {Object.entries(tasks).map(([columnId, columnTasks]) => (
          <Column
            key={columnId}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, columnId)}
          >
            <ColumnTitle status={columnId}>
              {columnId === 'todo' && '📝 Yapılacak'}
              {columnId === 'in-progress' && '🎯 Devam Ediyor'}
              {columnId === 'done' && '✅ Tamamlandı'}
              ({columnTasks.length})
            </ColumnTitle>

            <TasksList>
              {columnTasks.map(task => (
                <TaskCard
                  key={task.id}
                  status={task.status}
                  draggable
                  onDragStart={(e) => onDragStart(e, task.id, columnId)}
                >
                  {task.attachment && task.attachment.type.startsWith('image/') && (
                    <TaskImage src={task.attachment.data} alt="Görev görseli" />
                  )}
                  <TaskTitle>{task.title}</TaskTitle>
                  <TaskMeta>
                    <TaskDate>📅 {formatDate(task.start_date)}</TaskDate>
                    {task.assigned_to && (
                      <TaskAssignee>👤 {getAssigneeName(parseInt(task.assigned_to))}</TaskAssignee>
                    )}
                  </TaskMeta>
                  <TaskDescription>
                    {task.description?.slice(0, 100)}
                    {task.description?.length > 100 ? '...' : ''}
                  </TaskDescription>
                  {task.deadline && (
                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#e74c3c' }}>
                      ⏰ {formatDate(task.deadline)}
                    </div>
                  )}
                  {task.attachment && !task.attachment.type.startsWith('image/') && (
                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#3498db' }}>
                      📎 {task.attachment.name}
                    </div>
                  )}
                </TaskCard>
              ))}
            </TasksList>
          </Column>
        ))}
      </KanbanContainer>

      {showModal && (
        <TaskModal onClick={() => setShowModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalTitle>Yeni Görev</ModalTitle>
            <TaskForm
              users={users}
              onSave={handleSaveTask}
              onCancel={() => setShowModal(false)}
              task={editingTask}
            />
          </ModalContent>
        </TaskModal>
      )}
    </TasksContainer>
  );
}

function TaskForm({ users, onSave, onCancel, task }) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assigned_to: task?.assigned_to || '',
    deadline: task?.deadline || '',
    status: task?.status || 'todo',
    attachment: task?.attachment || null
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is JPG or PNG
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert('Lütfen sadece JPG veya PNG dosyası yükleyin.');
        return;
      }

      // Convert to base64 for local storage
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          attachment: {
            name: file.name,
            type: file.type,
            data: event.target.result
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <ModalForm onSubmit={handleSubmit}>
      <FormGroup>
        <FormLabel>Görev Başlığı</FormLabel>
        <FormInput
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Görev başlığını girin..."
        />
      </FormGroup>

      <FormGroup>
        <FormLabel>Açıklama</FormLabel>
        <FormTextarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Görev detaylarını açıklayın..."
        />
      </FormGroup>

      <FormGroup>
        <FormLabel>Sorumlu Kişi</FormLabel>
        <FormSelect
          name="assigned_to"
          value={formData.assigned_to}
          onChange={handleChange}
        >
          <option value="">Seçin...</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.full_name || user.username}
            </option>
          ))}
        </FormSelect>
      </FormGroup>

      <FormGroup>
        <FormLabel>Son Tarih</FormLabel>
        <FormInput
          type="date"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
        />
      </FormGroup>

      <FormGroup>
        <FormLabel>Durum</FormLabel>
        <FormSelect
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="todo">📝 Yapılacak</option>
          <option value="in-progress">🎯 Devam Ediyor</option>
          <option value="done">✅ Tamamlandı</option>
        </FormSelect>
      </FormGroup>

      <FormGroup>
        <FormLabel>Dosya Ekle (JPG/PNG)</FormLabel>
        <FormInput
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleFileChange}
        />
        {formData.attachment && (
          <div style={{ color: '#27ae60', fontSize: '12px', marginTop: '5px' }}>
            ✅ {formData.attachment.name}
          </div>
        )}
      </FormGroup>

      <ModalActions>
        <CancelButton type="button" onClick={onCancel}>
          İptal
        </CancelButton>
        <SaveButton type="submit">
          Kaydet
        </SaveButton>
      </ModalActions>
    </ModalForm>
  );
}

export default Tasks;
