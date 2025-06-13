import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './evaluate.css';
import ExcelJS from 'exceljs';
import Papa from 'papaparse';

function Evaluate() {
    const currentUser = localStorage.getItem('authenticatedUser');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [department, setDepartment] = useState(''); 
    const [allAssessments, setAllAssessments] = useState([]);
    const [score_1, setScore_1] = useState("");
    const [score_2, setScore_2] = useState("");
    const [score_3, setScore_3] = useState("");
    const [score_4, setScore_4] = useState("");
    const [score_5, setScore_5] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editAssessment, setEditAssessment] = useState(null);
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_GAS_URL || '/api';
    
    useEffect(() => {
        if (!currentUser) {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        fetchAssessments();
    }, []);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const formData = new URLSearchParams({
                action: 'addAssessment',
                AssessorUsername: currentUser,
                AssesseeName: employeeName,
                Department: department,
                Score1: score_1,
                Score2: score_2,
                Score3: score_3,
                Score4: score_4,
                Score5: score_5
            });
            const res = await axios.post(`${API_BASE_URL}`, formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            if (res.data.result === 'success') {
                setEmployeeName('');
                setDepartment('');
                setScore_1(""); setScore_2(""); setScore_3(""); setScore_4(""); setScore_5("");
                fetchAssessments();
            } else {
                setError(res.data.message || 'เพิ่มรายการประเมินไม่สำเร็จ');
            }
        } catch {
            setError('เกิดข้อผิดพลาดในการส่งข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    const fetchAssessments = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`${API_BASE_URL}`, {
                params: { action: 'getAssessments' }
            });
            if (res.data.result === 'success' && res.data.assessments) {
                const filtered = res.data.assessments.filter(
                    (a) => a.AssessorUsername === currentUser
                );
                setAllAssessments(filtered);
            } else {
                setError('ไม่สามารถโหลดข้อมูลประเมินได้');
                setAllAssessments([]);
            }
        } catch {
            setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
            setAllAssessments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (assessment) => {
        setEditAssessment(assessment);
        setEmployeeName(assessment.AssesseeName);
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
                AssessorUsername: currentUser,
                AssesseeName: employeeName,
                Department: department,
                Score1: score_1,
                Score2: score_2,
                Score3: score_3,
                Score4: score_4,
                Score5: score_5
            });
            const res = await axios.post(`${API_BASE_URL}`, formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            console.log(res.data);
            if (res.data.result === 'success') {
                closeModal();
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
            const res = await axios.post(`${API_BASE_URL}`, formData, {
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
        localStorage.clear();
        window.location.href = '/';
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEmployeeName('');
        setDepartment('');
        setScore_1(""); setScore_2(""); setScore_3(""); setScore_4(""); setScore_5("");
        setEditAssessment(null);
        setError('');
    };

    const ExportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Assessments');

        worksheet.columns = [
            { header: 'ผู้ถูกประเมิน', key: 'AssesseeName', width: 20 },
            { header: 'แผนก', key: 'Department', width: 15 },
            { header: 'ตรงต่อเวลา', key: 'Score1', width: 15 },
            { header: 'การทำงานร่วมกัน', key: 'Score2', width: 20 },
            { header: 'จำนวนงาน', key: 'Score3', width: 15 },
            { header: 'คุณภาพงาน', key: 'Score4', width: 15 },
            { header: 'อื่นๆ', key: 'Score5', width: 10 },
            { header: 'คะแนนรวม', key: 'TotalScore', width: 15 },
        ];

        allAssessments.forEach((row) => {
            worksheet.addRow(row);
        });

        const buffer = await workbook.xlsx.writeBuffer();

        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Assessments.xlsx';
        link.click();
        URL.revokeObjectURL(url);
    };


    const ExportToCSV = () => {
        const csv = Papa.unparse(allAssessments);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Assessments.csv';
        link.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className='evaluate-container'>
            {loading && <div className="loading"><div className="spinner"></div></div>}

            <div className="logout-container">
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>

            <h1 className="evaluate-title">หน้าประเมินพนักงาน</h1>
            <div className="export-btn">
                <button className="export-excel submit-btn" onClick={(e) => ExportToExcel()}>Export to Excel</button>
                <button className='export-csv submit-btn' onClick={(e) => ExportToCSV()}>Export to CSV</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form id="employee-form" onSubmit={handleFormSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="ชื่อพนักงาน"
                            value={employeeName}
                            onChange={(e) => setEmployeeName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
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
                            />
                        </div>
                    ))}
                    <div className="form-group submit-group">
                        <button type="submit" className="submit-btn">เพิ่ม</button>
                    </div>
                </div>
            </form>

            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close-btn" onClick={closeModal}>&times;</span>
                        <h2>แก้ไขการประเมิน</h2>
                        <form id="edit-employee-form" onSubmit={handleUpdateAssessment}>
                            <div className="form-row">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        placeholder="ชื่อพนักงาน"
                                        value={employeeName}
                                        onChange={(e) => setEmployeeName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
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

            <table className="employee-table">
                <thead>
                    <tr>
                        <th>ลำดับ</th>
                        <th>ชื่อพนักงาน</th>
                        <th>แผนก</th>
                        <th>ตรงต่อเวลา</th>
                        <th>การทำงานร่วมกัน</th>
                        <th>จำนวนงาน</th>
                        <th>คุณภาพงาน</th>
                        <th>อื่นๆ</th>
                        <th>คะแนนรวม</th>
                        <th>จัดการข้อมูล</th>
                    </tr>
                </thead>
                <tbody>
                    {allAssessments.map((a, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{a.AssesseeName}</td>
                            <td>{a.Department}</td>
                            <td>{a.Score1}</td>
                            <td>{a.Score2}</td>
                            <td>{a.Score3}</td>
                            <td>{a.Score4}</td>
                            <td>{a.Score5}</td>
                            <td>{a.TotalScore}/50</td>
                            <td>
                                <button
                                    className="edit-btn"
                                    onClick={() => handleEditUser(a)} 
                                >
                                    แก้ไข
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDeleteUser(a)} 
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

export default Evaluate;