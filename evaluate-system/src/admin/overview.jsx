import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './overview.css';

function Overview() {
    const [allAssessments, setAllAssessments] = useState([]);
    const [averagedAssessments, setAveragedAssessments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null); 
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_GAS_URL || '/api';

    useEffect(() => {
        const role = localStorage.getItem('authenticatedRole');
        if (role !== 'admin') {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        console.log('Fetching assessments for overview...');
        fetchAssessments();
    }, []);

    const fetchAssessments = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`${API_BASE_URL}`, {
                params: { action: 'getAssessments' }
            });
            if (res.data.result === 'success' && res.data.assessments) {
                setAllAssessments(res.data.assessments);
                calculateAveragedAssessments(res.data.assessments);
            } else {
                setAllAssessments([]);
                setAveragedAssessments([]);
                setError('ไม่สามารถโหลดข้อมูลประเมินได้');
            }
        } catch {
            setAllAssessments([]);
            setAveragedAssessments([]);
            setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    const calculateAveragedAssessments = (assessments) => {
        const grouped = assessments.reduce((acc, assessment) => {
            const { AssesseeName, Department, Score1, Score2, Score3, Score4, Score5, TotalScore } = assessment;
            const normalizedName = AssesseeName.replace(/\s+/g, '')

            if (!acc[normalizedName]) {
                acc[normalizedName] = {
                    AssesseeName,
                    Department,   
                    Score1: [],
                    Score2: [],
                    Score3: [],
                    Score4: [],
                    Score5: [],
                    TotalScore: []
                };
            }
            acc[normalizedName].Score1.push(Number(Score1));
            acc[normalizedName].Score2.push(Number(Score2));
            acc[normalizedName].Score3.push(Number(Score3));
            acc[normalizedName].Score4.push(Number(Score4));
            acc[normalizedName].Score5.push(Number(Score5));
            acc[normalizedName].TotalScore.push(Number(TotalScore));
            return acc;
        }, {});

        const averaged = Object.values(grouped).map(group => ({
            AssesseeName: group.AssesseeName, 
            Department: group.Department,
            Score1: group.Score1.reduce((sum, score) => sum + score, 0),
            Score2: group.Score2.reduce((sum, score) => sum + score, 0),
            Score3: group.Score3.reduce((sum, score) => sum + score, 0),
            Score4: group.Score4.reduce((sum, score) => sum + score, 0),
            Score5: group.Score5.reduce((sum, score) => sum + score, 0),
            TotalScore: group.TotalScore.reduce((sum, score) => sum + score, 0),
            Count: group.Score1.length
        }));

        setAveragedAssessments(averaged);
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('authenticatedUser');
        localStorage.removeItem('authenticatedRole');
        navigate('/');
    };

    const toggleDropdown = (assesseeName) => {
        setOpenDropdown(openDropdown === assesseeName ? null : assesseeName);
    };

    return (
        <div className="overview-container">
            {loading && <div className="loading"><div className="spinner"></div></div>}
            {error && <div className="error-message">{error}</div>}

            <div className="logout-container">
                <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>Back</button>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>

            <h1>ภาพรวมการประเมิน</h1>

            <table className="overview-table">
                <thead>
                    <tr>
                        <th>ลําดับ</th>
                        <th>ผู้ถูกประเมิน</th>
                        <th>แผนก</th>
                        <th>จำนวนผู้ประเมิน</th>
                        <th>ตรงต่อเวลา</th>
                        <th>การทำงานร่วมกัน</th>
                        <th>จำนวนงาน</th>
                        <th>คุณภาพงาน</th>
                        <th>อื่นๆ</th>
                        <th>คะแนนรวม</th>
                        <th>สัดส่วนคะแนน</th>
                        <th>รายละเอียด</th>
                    </tr>
                </thead>
                <tbody>
                    {averagedAssessments.map((assessment, index) => (
                        <>
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{assessment.AssesseeName}</td>
                                <td>{assessment.Department}</td>
                                <td>{assessment.Count} คน</td>
                                <td>{assessment.Score1}</td>
                                <td>{assessment.Score2}</td>
                                <td>{assessment.Score3}</td>
                                <td>{assessment.Score4}</td>
                                <td>{assessment.Score5}</td>
                                <td>{assessment.TotalScore}/{assessment.Count * 50}</td>
                                <td>({((assessment.TotalScore / (assessment.Count * 50)) * 100).toFixed(0)}%)</td>
                                <td>
                                    <button
                                        className="details-btn"
                                        onClick={() => toggleDropdown(assessment.AssesseeName)}
                                    >
                                        {openDropdown === assessment.AssesseeName ? 'ซ่อน' : 'รายละเอียด'}
                                    </button>
                                </td>
                            </tr>
                            {openDropdown === assessment.AssesseeName && (
                                <tr className="dropdown-row">
                                    <td colSpan="11">
                                        <div className="dropdown-content">
                                            <table className="details-table">
                                                <thead>
                                                    <tr>
                                                        <th>ลําดับ</th>
                                                        <th>ผู้ประเมิน</th>
                                                        <th>ตรงต่อเวลา</th>
                                                        <th>การทำงานร่วมกัน</th>
                                                        <th>จำนวนงาน</th>
                                                        <th>คุณภาพงาน</th>
                                                        <th>อื่นๆ</th>
                                                        <th>คะแนนรวม</th>
                                                        <th>สัดส่วนคะแนน</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {allAssessments
                                                        .filter(a => a.AssesseeName === assessment.AssesseeName)
                                                        .map((detail, idx) => (
                                                            <tr key={idx}>
                                                                <td>{idx + 1}</td>
                                                                <td>{detail.AssessorUsername}</td>
                                                                <td>{detail.Score1}</td>
                                                                <td>{detail.Score2}</td>
                                                                <td>{detail.Score3}</td>
                                                                <td>{detail.Score4}</td>
                                                                <td>{detail.Score5}</td>
                                                                <td>{detail.TotalScore}/50</td>
                                                                <td>({((detail.TotalScore / 50) * 100).toFixed(0)}%)</td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Overview;