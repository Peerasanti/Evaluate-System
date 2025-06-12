import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './dashboard.css';

function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState({ username: '', password: '', role: '' });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('authenticatedRole');
    if (role !== 'admin') {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    console.log('Fetching users...');
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('/api', {
          params: { action: 'getUsers' }
        });
        if (res.data.result === 'success' && res.data.users) {
          setAllUsers(res.data.users);
        } else {
          setError('โหลดข้อมูลผู้ใช้ไม่สําเร็จ');
          setAllUsers([]);
        }
      } catch (err) {
        setError('โหลดข้อมูลผู้ใช้ไม่ได้');
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new URLSearchParams({
        action: 'addUser',
        Username: username,
        Password: password,
        Role: role
      });
      const res = await axios.post('/api', formData, {
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      if (res.data.result === 'success') {
        setUsername('');
        setPassword('');
        setRole('user');
        fetchUsers();
      } else {
        setError(res.data.message || 'เพิ่มผู้ใช้ไม่สำเร็จ');
      }
    } catch (err) {
      setError('เพิ่มผู้ใช้ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authenticatedUser');
    localStorage.removeItem('authenticatedRole');
    navigate('/');
  };

  const handleEditUser = (user) => {
    const authenticatedRole = localStorage.getItem('authenticatedRole');
    const authenticatedUser = localStorage.getItem('authenticatedUser');
    if (authenticatedRole === 'admin' && user.role === 'admin' && user.username !== authenticatedUser) {
      setError('ไม่สามารถแก้ไขผู้ใช้ admin อื่นได้');
      return;
    }
    setCurrentUser(user);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new URLSearchParams({
        action: 'editUser',
        oldUsername: currentUser.username,
        Username: currentUser.username,
        Password: currentUser.password,
        Role: currentUser.role
      });
      const res = await axios.post('/api', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      if (res.data.result === 'success') {
        closeEditModal();
        fetchUsers();
      } else {
        setError(res.data.message || 'แก้ไขผู้ใช้ไม่สำเร็จ');
      }
    } catch (err) {
      setError('แก้ไขผู้ใช้ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (username) => {
    setLoading(true);
    setError('');
    try {
      const formData = new URLSearchParams({
        action: 'deleteUser',
        username
      });
      const res = await axios.post('/api', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
      if (res.data.result === 'success') {
        fetchUsers();
      } else {
        setError(res.data.message || 'ลบผู้ใช้ไม่สำเร็จ');
      }
    } catch (err) {
      setError('ลบผู้ใช้ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setCurrentUser(null);
  };

  return (
    <div className="dashboard-container">
      <div id="loading" className={loading ? 'loading' : 'loading hidden'}>
        <div className="spinner"></div>
      </div>

      <div className="logout-container">
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <h1 className="dashboard-title">Admin Dashboard</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="top-section">
        <div className="add-user-section">
          <div className="form-container">  
            <h3>เพิ่มชื่อผู้ใช้งาน</h3>
            <form id="userForm" onSubmit={handleFormSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>
              <div className="form-group">
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div className="form-group">
                <button type="submit">เพิ่ม</button>
              </div>
            </form>
          </div>
        </div>
        <div className="page-sheet-section">
          <div className="pageLink-container">
            <button onClick={() => navigate('/assessment')}>รายการประเมินทั้งหมด</button>
            <button onClick={() => navigate('/overview')}>ภาพรวมของคะแนน</button>
          </div>
          <div className="database-container">
            <h4>เปลี่ยน Google Sheet</h4>
            <input
              type="text"
              id="sheetId"
              name="sheetId"
              placeholder="กรอกไอดีของ Google Sheet"
              required
            />
          </div>
        </div>
      </div>

      <div className="table-section">
        <div className="table-container">
          <h4>รายชื่อผู้ใช้ทั้งหมดในระบบ</h4>
          <table id="userTable">
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>ชื่อผู้ใช้</th>
                <th>รหัสผ่าน</th>
                <th>บทบาท</th>
                <th>จัดการข้อมูล</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user, index) => (
                <tr key={user.username}>
                  <td>{index + 1}</td>
                  <td>{user.username}</td>
                  <td>{user.password}</td>
                  <td>{user.role}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEditUser(user)}
                    >
                      แก้ไข
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteUser(user.username)}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>แก้ไขผู้ใช้</h3>
            <form id="editForm" onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="editUsername">ชื่อผู้ใช้</label>
                <input
                  type="text"
                  id="editUsername"
                  name="username"
                  value={currentUser?.username || ''}
                  onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="editPassword">รหัสผ่าน</label>
                <input
                  type="password"
                  id="editPassword"
                  name="password"
                  value={currentUser?.password || ''}
                  onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="editRole">บทบาท</label>
                <select
                  id="editRole"
                  name="role"
                  value={currentUser?.role || 'user'}
                  onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="save-btn">บันทึก</button>
                <button type="button" className="cancel-btn" onClick={closeEditModal}>ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;