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
  flex-direction: column;
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
  
  .message-content {
    max-width: 70%;
    padding: 12px 16px;
    border-radius: 12px;
    background: ${props => props.isOwn ? '#667eea' : '#2a2a2a'};
    color: white;
    margin-left: ${props => props.isOwn ? 'auto' : '0'};
  }
  
  .message-time {
    font-size: 10px;
    color: #a0a0a0;
    margin-top: 4px;
    text-align: ${props => props.isOwn ? 'right' : 'left'};
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
  
  // localStorage'dan mesajları yükle
  const loadMessages = () => {
    try {
      const savedMessages = localStorage.getItem('chat-messages');
      return savedMessages ? JSON.parse(savedMessages) : [
        { id: 1, text: "🎉 Etsy Chat Kanalı Açıldı!", sender: "Sistem", time: "09:00", isSystem: true },
        { id: 2, text: "Merhaba! Maltese pendant siparişim nasıl gidiyor?", sender: "Garold P Hull", time: "14:30", isOwn: false },
        { id: 3, text: "Merhaba Garold! Siparişiniz kesim aşamasında. Yarın hazır olacak.", sender: "Atölye", time: "14:31", isOwn: true },
        { id: 4, text: "Tiger pendant için gravür yapılacak isim: Milan", sender: "Milan Cordes", time: "13:10", isOwn: false },
        { id: 5, text: "Anlaşıldı Milan, gravür işlemi bugün yapılacak.", sender: "Atölye", time: "13:12", isOwn: true },
        { id: 6, text: "Dachshund kolye siparişim hakkında bilgi alabilir miyim?", sender: "Elin Elisabeth", time: "12:40", isOwn: false }
      ];
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
      return [];
    }
  };
  
  const [messages, setMessages] = useState(loadMessages);

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

  return (
    <ChatContainer>
      <PageHeader>
        <h1>Mesajlaşma</h1>
        <p>Genel chat kanalı - Tüm kullanıcılar burada mesajlaşır</p>
      </PageHeader>
      
      <ChatArea>
        <ChannelHeader>
          <h3>💬 Genel Chat Kanalı</h3>
          <div>🟢 Online</div>
        </ChannelHeader>
        
        <ChatMessages>
          <MessagesArea>
            {messages.map(message => (
              <Message key={message.id} isOwn={message.isOwn}>
                <div className="message-content">
                  {!message.isOwn && <div className="message-sender">{message.sender}</div>}
                  {message.text}
                  <div className="message-time">{message.time}</div>
                </div>
              </Message>
            ))}
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
      </ChatArea>
    </ChatContainer>
  );
};

export default Chat;
