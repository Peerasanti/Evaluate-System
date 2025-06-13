import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './App.css'

function App() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_GAS_URL || '/api';

  const handleConfigLogin = () => {
    alert('Config login clicked!');
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const normalizedUsername = String(username || '').trim();
      const res = await axios.get(`${API_BASE_URL}` , {
        params: {
          action: 'getUserByUsername',
          username: normalizedUsername,
        }
      });
      console.log('Response:', res.data);

      if (!res.data.result || !res.data.user) {
        setMessage(res.data.error || 'ไม่พบชื่อผู้ใช้นี้');
        setLoading(false);
        return;
      }

      const { username: dataUsername, password: dataPassword, role } = res.data.user;
      const normalizedDataPassword = String(dataPassword || '').trim();
      const normalizedPassword = String(password || '').trim();

      if (normalizedDataPassword !== normalizedPassword) {
        setMessage('รหัสผ่านไม่ถูกต้อง');
        setLoading(false);
        return;
      }

      if (!['admin', 'user'].includes(role)) {
        setMessage('สิทธิที่มีไม่ถูกต้อง');
        setLoading(false);
        return;
      }

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authenticatedUser', dataUsername);
      localStorage.setItem('authenticatedRole', role);
      setMessage('ล็อกอินสำเร็จ!');
      setLoading(false);

      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'user') {
        navigate('/user/evaluate');
      }
    } catch (error) {
      setMessage('ไม่สามารถเชื่อมต่อกับเซิฟเวอร์ได้');
      console.error('Login error:', error);
    }
  };

  return (
    <>
      <div id="loading" className={loading ? 'loading' : 'loading hidden'}>
        <div className="spinner"></div>
      </div>
      <div className="container">
        <div className="card">
          <div className="card-body">
            <button type="button" className="btn btn-config" onClick={handleConfigLogin}>
              
            </button>
            <h1 className="card-title">Login</h1>
            <form id="loginForm" onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  placeholder="ชื่อผู้ใช้"
                  name="username"
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="รหัสผ่าน"
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {message && <p className={message === 'Login สำเร็จ!' ? 'message success' : 'message'}>{message}</p>}
              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">Login</button>
              </div>
            </form>
            <p className="error">{error}</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
