import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ProfileContainer = styled.div`
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
`;

const AvatarSection = styled.div`
  text-align: center;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const UserInfo = styled.div``;

const Name = styled.h1`
  color: white;
  margin: 0;
  font-size: 28px;
`;

const Username = styled.p`
  color: #a0a0a0;
  margin: 5px 0;
`;

const Role = styled.span`
  background: ${props => {
    if (props.role === 'admin') return '#e74c3c';
    if (props.role === 'manager') return '#f39c12';
    return '#27ae60';
  }};
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  text-transform: uppercase;
`;

const FormSection = styled.div`
  background: #2a2a2a;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  color: white;
  margin: 0 0 20px 0;
  font-size: 20px;
`;

const Form = styled.form``;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  color: white;
  margin-bottom: 5px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #666;
  border-radius: 5px;
  background: #333;
  color: white;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #666;
  border-radius: 5px;
  background: #333;
  color: white;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  margin-right: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const UsersSection = styled.div`
  background: #2a2a2a;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const UserList = styled.div`
  display: grid;
  gap: 10px;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #333;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: #3a3a3a;
  }
`;

const UserAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserRole = styled(Role)`
  font-size: 10px;
  padding: 2px 8px;
  display: inline-block;
  margin-bottom: 5px;
`;

function Profile({ user, onClose }) {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    skills: user?.skills || '',
    avatar: user?.avatar || ''
  });
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(user);

  useEffect(() => {
    loadUsers();
  }, []);

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://127.0.0.1:8080/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Profil güncellendi!');
      } else {
        alert('Güncelleme başarısız');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Hata oluştu');
    }

    setLoading(false);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <ProfileContainer>
      <Header>
        {selectedUser && (
          <>
            <AvatarSection>
              <Avatar>{getInitials(selectedUser.full_name || selectedUser.username)}</Avatar>
            </AvatarSection>
            <UserInfo>
              <Name>{selectedUser.full_name || selectedUser.username}</Name>
              <Username>@{selectedUser.username}</Username>
              <Role role={selectedUser.role}>{selectedUser.role}</Role>
            </UserInfo>
          </>
        )}
      </Header>

      {users.length > 1 && (
        <UsersSection>
          <SectionTitle>Kullanıcıları Yönet</SectionTitle>
          <UserList>
            {users.map(u => (
              <UserItem key={u.id} onClick={() => setSelectedUser(u)}>
                <UserAvatar>{getInitials(u.full_name || u.username)}</UserAvatar>
                <UserDetails>
                  <div style={{ color: 'white', fontWeight: 'bold' }}>
                    {u.full_name || u.username}
                  </div>
                  <div style={{ color: '#a0a0a0', fontSize: '14px' }}>@{u.username}</div>
                  <UserRole role={u.role}>{u.role}</UserRole>
                </UserDetails>
              </UserItem>
            ))}
          </UserList>
        </UsersSection>
      )}

      {selectedUser && (
        <FormSection>
          <SectionTitle>Profil Düzenle</SectionTitle>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Ad Soyad:</Label>
              <Input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Adınız ve soyadınız"
              />
            </FormGroup>

            <FormGroup>
              <Label>Telefon:</Label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+90 5XX XXX XX XX"
              />
            </FormGroup>

            <FormGroup>
              <Label>Yetenekler (virgülle ayırın):</Label>
              <Input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="ör: tasarım, programlama, müşteri hizmetleri"
              />
            </FormGroup>

            <FormGroup>
              <Label>Avatar URL:</Label>
              <Input
                type="url"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                placeholder="İsteğe bağlı: Profil fotoğrafı URL'i"
              />
            </FormGroup>

            <Button type="submit" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Güncelleme Kaydet'}
            </Button>
          </Form>
        </FormSection>
      )}

      <Button onClick={onClose} style={{ background: '#666', marginTop: '20px' }}>
        Geri Dön
      </Button>
    </ProfileContainer>
  );
}

export default Profile;
