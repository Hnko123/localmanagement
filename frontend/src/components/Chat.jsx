import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ChatContainer = styled.div`
  min-height: 100vh;
  background: #1a1a1a;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
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

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  background: #1a1a1a;
`;

const ChannelHeader = styled.div`
  background: #2a2a2a;
  border-bottom: 1px solid #3a3a3a;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  .channel-icon {
    width: 40px;
    height: 40px;
    background: #667eea;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: white;
  }
  
  .channel-info {
    flex: 1;
    
    h3 {
      color: white;
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
    }
    
    p {
      color: #a0a0a0;
      margin: 0;
      font-size: 12px;
    }
  }
  
  .online-count {
    color: #4CAF50;
    font-size: 12px;
    font-weight: 500;
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #3a3a3a;
`;

const OnlineUsers = styled.div`
  width: 280px;
  background: #2a2a2a;
  display: flex;
  flex-direction: column;
`;

const OnlineUsersHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #3a3a3a;
  background: #2a2a2a;

  h3 {
    color: white;
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
  }

  .online-count {
    color: #4CAF50;
    font-size: 12px;
    font-weight: 500;
  }
`;

const UserListArea = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
`;

const OnlineUserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 8px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #3a3a3a;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${props => props.userColor};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;
    font-weight: 600;
    border: 2px solid ${props => props.userColor};
  }

  .user-info {
    flex: 1;

    .user-name {
      color: white;
      font-size: 14px;
      font-weight: 500;
      margin: 0;
    }

    .user-role {
      color: #a0a0a0;
      font-size: 11px;
      margin: 0;
      opacity: 0.8;
    }
  }

  .online-indicator {
    width: 8px;
    height: 8px;
    background: #4CAF50;
    border-radius: 50%;
    border: 2px solid #2a2a2a;
  }
`;

const MessagesArea = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #1a1a1a;
`;

const Message = styled.div`
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;

  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: ${props => props.userColor};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;
    font-weight: 600;
    margin-right: 12px;
    border: 2px solid ${props => props.userColor};
    flex-shrink: 0;
  }

  .message-wrapper {
    flex: 1;

    .message-sender {
      color: ${props => props.userColor};
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;

      &:before {
        content: '';
        width: 6px;
        height: 6px;
        background: ${props => props.userColor};
        border-radius: 50%;
      }
    }

    .message-content {
      max-width: 70%;
      padding: 12px 16px;
      border-radius: 12px;
      background: ${props => props.isOwn ? '#667eea' : '#2a2a2a'};
      color: white;
      margin-left: ${props => !props.isOwn ? '0' : 'auto'};
      position: relative;

      ${props => props.isOwn && `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: 1px solid #5a6fd8;

        &:after {
          content: '';
          position: absolute;
          right: -8px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid #667eea;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
        }
      `}

      .message-text {
        word-wrap: break-word;
        line-height: 1.4;
      }

      .message-time {
        font-size: 10px;
        color: #a0a0a0;
        margin-top: 4px;
        text-align: right;
      }
    }
  }
`;

const MessageInput = styled.div`
  padding: 20px;
  background: #2a2a2a;
  border-top: 1px solid #3a3a3a;
  display: flex;
  gap: 12px;
  
  input {
    flex: 1;
    background: #1a1a1a;
    border: 1px solid #3a3a3a;
    border-radius: 8px;
    padding: 12px 16px;
    color: white;
    
    &::placeholder {
      color: #666;
    }
    
    &:focus {
      outline: none;
      border-color: #667eea;
    }
  }
  
  button {
    background: #667eea;
    border: none;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    
    &:hover {
      background: #5a6fd8;
    }
  }
`;

const Chat = () => {
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]); // Başlangıçta boş

  // kullanıcı renklerini oluştur
  const getUserColor = (username) => {
    if (!username || username === 'Atölye') return '#667eea';
    if (username === 'Sistem') return '#4CAF50';

    // İsimden hash oluştur ve renk üret
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      const char = username.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32-bit integer'a çevir
    }

    // Parlak renkler için hue değeri hesapla
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  // Online kullanıcıları yükle - sadece şu an login olan kullanıcı
  const loadOnlineUsers = () => {
    return [
      { id: 1, username: "Atölye", fullName: "Admin Yönetici", role: "Admin", isOnline: true }
    ];
  };

  // Chat mesajlarını temiz tut - sadece welcome mesajı
  const loadMessages = () => {
    return [
      { id: 1, text: "🎉 Hoş Geldiniz! Bu genel chat kanalıdır.", sender: "Sistem", time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), isSystem: true }
    ];
  };

  const [messages, setMessages] = useState(loadMessages);

  // Component mount olduğunda
  useEffect(() => {
    // Online users'ı yükle
    setOnlineUsers(loadOnlineUsers());

    // Chat mesajlarını temizle (sadece welcome mesajı)
    setMessages(loadMessages());

    // localStorage temizliğini sağla
    localStorage.removeItem('chat-messages');
  }, []);

  // mesajlar değiştiğinde localStorage'a kaydet
  useEffect(() => {
    try {
      localStorage.setItem('chat-messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Mesajlar kaydedilirken hata:', error);
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: Date.now(),
        text: newMessage,
        sender: "Atölye",
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <ChatContainer>
      <PageHeader>
        <h1>Mesajlaşma</h1>
        <p>Genel chat kanalı - Tüm kullanıcılar burada mesajlaşır</p>
      </PageHeader>

      <ChatArea>
        <ChatMessages>
          <MessagesArea>
            {messages.map(message => {
              const userColor = getUserColor(message.sender);

              return (
                <Message
                  key={message.id}
                  isOwn={message.isOwn}
                  userColor={userColor}
                >
                  {!message.isOwn && (
                    <div className="user-avatar">
                      {getInitials(message.sender)}
                    </div>
                  )}

                  <div className="message-wrapper">
                    {!message.isOwn && (
                      <div className="message-sender" style={{ color: userColor }}>
                        {message.sender}
                      </div>
                    )}

                    <div className="message-content">
                      <div className="message-text">
                        {message.text}
                      </div>
                      <div className="message-time">
                        {message.time}
                      </div>
                    </div>
                  </div>
                </Message>
              );
            })}
          </MessagesArea>

          <MessageInput>
            <input
              type="text"
              placeholder="Mesajınızı yazın..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>Gönder</button>
          </MessageInput>
        </ChatMessages>

        <OnlineUsers>
          <OnlineUsersHeader>
            <h3>Çevrimiçi Kullanıcılar</h3>
            <div className="online-count">{onlineUsers.filter(u => u.isOnline).length} Online</div>
          </OnlineUsersHeader>

          <UserListArea>
            {onlineUsers.map(user => {
              const userColor = getUserColor(user.username);

              return (
                <OnlineUserItem key={user.id} userColor={userColor}>
                  <div className="user-avatar" style={{ backgroundColor: userColor, borderColor: userColor }}>
                    {getInitials(user.fullName)}
                  </div>
                  <div className="user-info">
                    <p className="user-name">{user.fullName}</p>
                    <p className="user-role">{user.role}</p>
                  </div>
                  {user.isOnline && <div className="online-indicator"></div>}
                </OnlineUserItem>
              );
            })}
          </UserListArea>
        </OnlineUsers>
      </ChatArea>
    </ChatContainer>
  );
};

export default Chat;
