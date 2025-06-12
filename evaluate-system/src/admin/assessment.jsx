import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './assessment.css';

function Assessment() {
    const [allAssessments, setAllAssessments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editAssessment, setEditAssessment] = useState(null);
    const [assesseeName, setAssesseeName] = useState('');
    const [department, setDepartment] = useState('');
    const [score_1, setScore_1] = useState('');
    const [score_2, setScore_2] = useState('');
    const [score_3, setScore_3] = useState('');
    const [score_4, setScore_4] = useState('');
    const [score_5, setScore_5] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem('authenticatedRole');
        if (role !== 'admin') {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        console.log('Fetching assessments...');
        fetchAssessments();
    }, []);

    const fetchAssessments = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('/api', {
                params: { action: 'getAssessments' }
            });
            if (res.data.result === 'success' && res.data.assessments) {
                setAllAssessments(res.data.assessments);
            } else {
                setAllAssessments([]);
                setError('ไม่สามารถโหลดข้อมูลประเมินได้');
            }
        } catch {
            setAllAssessments([]);
            setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (assessment) => {
        setEditAssessment(assessment);
        setAssesseeName(assessment.AssesseeName);
        setDepartment(assessment.Department);
        setScore_1(assessment.Score1);
        setScore_2(assessment.Score2);
        setScore_3(assessment.Score3);
        setScore_4(assessment.Score4);
        setScore_5(assessment.Score5);
        setIsModalOpen(true);
    };

    const handleUpdateAssessment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const formData = new URLSearchParams({
                action: 'editAssessment',
                AssessorUsername: editAssessment.AssessorUsername,
                AssesseeName: assesseeName,
                OriginalAssesseeName: editAssessment.AssesseeName,
                Department: department,
                Score1: score_1,
                Score2: score_2,
                Score3: score_3,
                Score4: score_4,
                Score5: score_5
            });
            const res = await axios.post('/api', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            if (res.data.result === 'success') {
                setIsModalOpen(false);
                setAssesseeName('');
                setDepartment('');
                setScore_1('');
                setScore_2('');
                setScore_3('');
                setScore_4('');
                setScore_5('');
                setEditAssessment(null);
                fetchAssessments();
            } else {
                setError(res.data.message || 'อัปเดตรายการประเมินไม่สำเร็จ');
            }
        } catch {
            setError('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (assessment) => {
        setLoading(true);
        setError('');
        try {
            const formData = new URLSearchParams({
                action: 'deleteAssessment',
                AssessorUsername: assessment.AssessorUsername,
                AssesseeName: assessment.AssesseeName
            });
            const res = await axios.post('/api', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            if (res.data.result === 'success') {
                fetchAssessments();
            } else {
                setError(res.data.message || 'ลบรายการประเมินไม่สำเร็จ');
            }
        } catch {
            setError('เกิดข้อผิดพลาดในการลบรายการประเมิน');
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

    const closeModal = () => {
        setIsModalOpen(false);
        setAssesseeName('');
        setDepartment('');
        setScore_1('');
        setScore_2('');
        setScore_3('');
        setScore_4('');
        setScore_5('');
        setEditAssessment(null);
        setError('');
    };

    return (
        <div className="assessment-container">
            {loading && <div className="loading"><div className="spinner"></div></div>}
            {error && <div className="error-message">{error}</div>}

            <div className="logout-container">
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>

            <div className="back-container">
                <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>Back</button>
            </div>

            <h1>รายการประเมินทั้งหมด</h1>

            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close-btn" onClick={closeModal}>×</span>
                        <h2>แก้ไขการประเมิน</h2>
                        <form id="edit-assessment-form" onSubmit={handleUpdateAssessment}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>ผู้ประเมิน</label>
                                    <input
                                        type="text"
                                        value={editAssessment?.AssessorUsername || ''}
                                        disabled
                                        className="read-only"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>ชื่อผู้ถูกประเมิน</label>
                                    <input
                                        type="text"
                                        placeholder="ชื่อผู้ถูกประเมิน"
                                        value={assesseeName}
                                        onChange={(e) => setAssesseeName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>แผนก</label>
                                    <select value={department} onChange={(e) => setDepartment(e.target.value)} required>
                                        <option value="">กรุณาเลือกแผนก</option>
                                        <option value="IT">IT</option>
                                        <option value="HR">HR</option>
                                        <option value="Sales">Sales</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row score-row">
                                {[score_1, score_2, score_3, score_4, score_5].map((score, index) => (
                                    <div className="form-group" key={index}>
                                        <label>{["ตรงต่อเวลา", "การทำงานร่วมกัน", "จำนวนงาน", "คุณภาพงาน", "อื่นๆ"][index]}</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={10}
                                            placeholder={["ตรงต่อเวลา", "การทำงานร่วมกัน", "จำนวนงาน", "คุณภาพงาน", "อื่นๆ"][index]}
                                            value={[score_1, score_2, score_3, score_4, score_5][index]}
                                            onChange={(e) => {
                                                const setter = [setScore_1, setScore_2, setScore_3, setScore_4, setScore_5][index];
                                                setter(e.target.value);
                                            }}
                                            required
                                        />
                                    </div>
                                ))}
                                <div className="form-group submit-group">
                                    <button type="submit" className="submit-btn">บันทึก</button>
                                    <button type="button" className="cancel-btn" onClick={closeModal}>ยกเลิก</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <table className="table-section">
                <thead>
                    <tr>
                        <th>ผู้ประเมิน</th>
                        <th>ผู้ถูกประเมิน</th>
                        <th>แผนก</th>
                        <th>ตรงต่อเวลา</th>
                        <th>การทำงานร่วมกัน</th>
                        <th>จำนวนงาน</th>
                        <th>คุณภาพงาน</th>
                        <th>อื่นๆ</th>
                        <th>คะแนนรวม</th>
                        <th>สัดส่วนคะแนน</th>
                        <th>จัดการข้อมูล</th>
                    </tr>
                </thead>
                <tbody>
                    {allAssessments.map((assessment, index) => (
                        <tr key={index}>
                            <td>{assessment.AssessorUsername}</td>
                            <td>{assessment.AssesseeName}</td>
                            <td>{assessment.Department}</td>
                            <td>{assessment.Score1}</td>
                            <td>{assessment.Score2}</td>
                            <td>{assessment.Score3}</td>
                            <td>{assessment.Score4}</td>
                            <td>{assessment.Score5}</td>
                            <td>{assessment.TotalScore}/50</td>
                            <td>({((assessment.TotalScore / 50) * 100).toFixed(0)}%)</td>
                            <td>
                                <button
                                    className="edit-btn"
                                    onClick={() => handleEditUser(assessment)}
                                >
                                    แก้ไข
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDeleteUser(assessment)}
                                >
                                    ลบ
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Assessment;