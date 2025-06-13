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
  const [originalUsername, setOriginalUsername] = useState(''); 
  const [editModalOpen, setEditModalOpen] = useState(false);
  const navigate = useNavigate();
  const [sheetId, setSheetId] = useState('');

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
    } catch {
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
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      if (res.data.result === 'success') {
        setUsername('');
        setPassword('');
        setRole('user');
        fetchUsers();
      } else {
        setError(res.data.message || 'เพิ่มผู้ใช้ไม่สำเร็จ');
      }
    } catch {
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
      setError('ไม่สามารถแก้ไข admin คนอื่นได้');
      return;
    }
    setCurrentUser({ ...user });
    setOriginalUsername(user.username); 
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new URLSearchParams({
        action: 'editUser',
        oldUsername: originalUsername, 
        Username: currentUser.username, 
        Password: currentUser.password,
        Role: currentUser.role
      });
      const res = await axios.post('/api', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      if (res.data.result === 'success') {
        closeEditModal();
        fetchUsers();
      } else {
        setError(res.data.message || 'แก้ไขผู้ใช้ไม่สำเร็จ');
      }
    } catch {
      setError('แก้ไขผู้ใช้ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    const authenticatedRole = localStorage.getItem('authenticatedRole');
    const authenticatedUser = localStorage.getItem('authenticatedUser');
    if (authenticatedRole === 'admin' && user.role === 'admin' && user.username !== authenticatedUser) {
      setError('ไม่สามารถลบ admin คนอื่นได้');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = new URLSearchParams({
        action: 'deleteUser',
        username: user.username
      });
      const res = await axios.post('/api', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      if (res.data.result === 'success') {
        fetchUsers();
      } else {
        setError(res.data.message || 'ลบผู้ใช้ไม่สำเร็จ');
      }
    } catch {
      setError('ลบผู้ใช้ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleSheetIdChange = async () => {
    if (!sheetId) {
      setError('กรุณากรอก Google Sheet ID');
      return;
    }
    setLoading(true);
    try {
      const formData = new URLSearchParams({
        action: 'setSheetId',
        sheetId
      });
      const res = await axios.post('/api', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      if (res.data.result === 'success') {
        setError('');
        setSheetId('');
      } else {
        setError(res.data.message || 'เกิดข้อผิดพลาดในการตั้งค่า Google Sheet ID');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการตั้งค่า Google Sheet ID');
    } finally {
      setLoading(false);
    }
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setCurrentUser({ username: '', password: '', role: '' });
    setOriginalUsername(''); 
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
            <button onClick={() => navigate('/admin/assessment')}>รายการประเมินทั้งหมด</button>
            <button onClick={() => navigate('/admin/overview')}>ภาพรวมของคะแนน</button>
          </div>
          <div className="database-container">
            <h4>เปลี่ยน Google Sheet</h4>
            <input
              type="text"
              id="sheetId"
              name="sheetId"
              placeholder="กรอกไอดีของ Google Sheet"
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value)}
              required
            />
            <button onClick={handleSheetIdChange}>บันทึก</button>
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
                      onClick={() => handleDeleteUser(user)}
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
            <span className="close-btn" onClick={closeEditModal}>×</span>
            <h3>แก้ไขผู้ใช้</h3>
            <form id="editForm" onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="editUsername">ชื่อผู้ใช้</label>
                <label htmlFor="warningUsername">*หากเปลี่ยนชื่อผู้ใช้แล้วจะทำให้ข้อมูลการประเมินสูญหาย</label>
                <input
                  type="text"
                  id="editUsername"
                  name="username"
                  value={currentUser.username}
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
                  value={currentUser.password}
                  onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="editRole">บทบาท</label>
                <select
                  id="editRole"
                  name="role"
                  value={currentUser.role}
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