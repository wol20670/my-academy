import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, TrendingUp, BarChart3 } from 'lucide-react';
import { auth, db } from './firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Services
import {
  subscribeToStudents,
  subscribeToStudentInfo,
  subscribeToRecordsByTeacher,
  subscribeToRecordsByStudent
} from './services/firebaseService';

// Utils
import {
  addStudent as addStudentToDB,
  deleteStudent as deleteStudentFromDB,
  addRecord as addRecordToDB,
  updateRecord as updateRecordInDB,
  deleteRecord as deleteRecordFromDB
} from './utils/dataHelper';
import { linkRecordsToStudents, filterRecordsByStudent } from './utils/dataHandlers';
import { calculateAverage } from './utils/calculations';

// Components
import LoginForm from './components/Auth/LoginForm';
import StudentForm from './components/Student/StudentForm';
import StudentList from './components/Student/StudentList';
import RecordForm from './components/Record/RecordForm';
import RecordList from './components/Record/RecordList';
import AnalysisDashboard from './components/Analysis/AnalysisDashboard';
import BarChartAnalysis from './components/Analysis/BarChartAnalysis';
import LoadingSpinner from './components/Common/LoadingSpinner';
import Header from './components/Common/Header';
import { toEmail } from './utils/authHelper';

function App() {
  // State
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('records');

  // 사용자 인증 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUser(user);
            setUserRole(userData.role);
            setUserId(userData.id);
          }
        } catch (error) {
          console.error('사용자 정보 로드 실패:', error);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserId(null);
        setStudents([]);
        setRecords([]);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 실시간 데이터 동기화
  useEffect(() => {
    if (!currentUser || !userRole || !userId) {
      setStudents([]);
      setRecords([]);
      return;
    }

    setDataLoading(true);
    let unsubscribeStudents;
    let unsubscribeRecords;

    if (userRole === 'teacher') {
      // 선생님: 학생 목록 구독
      unsubscribeStudents = subscribeToStudents(
        currentUser.email,
        (data) => {
          setStudents(data);
          setDataLoading(false);
        },
        () => {
          setStudents([]);
          setDataLoading(false);
        }
      );

      // 선생님: 성적 기록 구독
      unsubscribeRecords = subscribeToRecordsByTeacher(
        currentUser.email,
        (data) => setRecords(data),
        () => setRecords([])
      );

    } else {
      // 학생: 본인 정보 구독
      unsubscribeStudents = subscribeToStudentInfo(
        userId,
        (data) => {
          setStudents(data);
          setDataLoading(false);
          
          // 학생은 자동으로 선택
          if (data.length > 0 && !selectedStudent) {
            setSelectedStudent(data[0]);
          }
        },
        () => {
          setStudents([]);
          setDataLoading(false);
        }
      );

      // 학생: 본인 성적 구독
      unsubscribeRecords = subscribeToRecordsByStudent(
        userId,
        (data) => setRecords(data),
        () => setRecords([])
      );
    }

    return () => {
      if (unsubscribeStudents) unsubscribeStudents();
      if (unsubscribeRecords) unsubscribeRecords();
    };
  }, [currentUser, userRole, userId]);

  // 선택된 학생의 성적 업데이트
  useEffect(() => {
    if (selectedStudent && Array.isArray(records)) {
      const updatedRecords = filterRecordsByStudent(records, selectedStudent.studentId);
      setSelectedStudent(prev => ({
        ...prev,
        records: updatedRecords
      }));
    }
  }, [records]);

  // 학생에 성적 연결 (메모이제이션)
  const studentsWithRecords = useMemo(() => {
    return linkRecordsToStudents(students, records);
  }, [students, records]);

  // Event Handlers
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSelectedStudent(null);
      setStudents([]);
      setRecords([]);
      setUserRole(null);
      setUserId(null);
    } catch (err) {
      console.error('로그아웃 오류:', err);
    }
  };

  const handleAddStudent = async (studentData) => {
    try {
      await addStudentToDB(
        {
          studentId: studentData.studentId,
          name: studentData.name,
          grade: studentData.grade,
          memo: studentData.memo,
          email: toEmail(studentData.studentId)
        },
        currentUser.email
      );
    } catch (error) {
      console.error('학생 추가 실패:', error);
      alert('학생 추가 실패: ' + error.message);
    }
  };

  const handleDeleteStudent = async (studentDocId) => {
    if (window.confirm('정말 이 학생을 삭제하시겠습니까?')) {
      try {
        await deleteStudentFromDB(studentDocId);
        if (selectedStudent?.id === studentDocId) {
          setSelectedStudent(null);
        }
      } catch (error) {
        console.error('학생 삭제 실패:', error);
        alert('학생 삭제 실패: ' + error.message);
      }
    }
  };

  const handleAddRecord = async (recordData) => {
    try {
      await addRecordToDB(recordData, selectedStudent.studentId, currentUser.email);
    } catch (error) {
      console.error('성적 추가 실패:', error);
      alert('성적 추가 실패: ' + error.message);
    }
  };

  const handleUpdateRecord = async (updatedRecord) => {
    try {
      await updateRecordInDB(updatedRecord.id, updatedRecord);
    } catch (error) {
      console.error('성적 수정 실패:', error);
      alert('성적 수정 실패: ' + error.message);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('이 기록을 삭제하시겠습니까?')) {
      try {
        await deleteRecordFromDB(recordId);
      } catch (error) {
        console.error('성적 삭제 실패:', error);
        alert('성적 삭제 실패: ' + error.message);
      }
    }
  };

  const handleSelectStudent = (student) => {
    if (!student) return;
    
    const studentRecords = filterRecordsByStudent(records, student.studentId);
    setSelectedStudent({
      ...student,
      records: studentRecords
    });
  };

  // Render
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        userEmail={currentUser.email}
        userRole={userRole}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Student Management */}
        <div className="lg:col-span-1">
          {userRole === 'teacher' && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <StudentForm onAddStudent={handleAddStudent} />
            </div>
          )}
          
          {userRole === 'student' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                👋 학생 모드입니다. 선생님이 등록한 나의 성적을 확인할 수 있습니다.
              </p>
            </div>
          )}

          <StudentList
            students={studentsWithRecords}
            selectedStudent={selectedStudent}
            onSelectStudent={handleSelectStudent}
            onDeleteStudent={userRole === 'teacher' ? handleDeleteStudent : null}
            isTeacher={userRole === 'teacher'}
            currentUserEmail={currentUser?.email}
            loading={dataLoading}
          />
        </div>

        {/* Right Panel: Student Details */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          {selectedStudent ? (
            <>
              {/* Student Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedStudent.name}</h2>
                  <p className="text-gray-600">{selectedStudent.grade}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span className="text-gray-600">평균 점수:</span>
                  <span className="font-bold text-indigo-600">
                    {calculateAverage(selectedStudent.records || [])}
                  </span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-2 mb-6 border-b">
                <button
                  onClick={() => setActiveTab('records')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'records'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    학업 기록
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'analysis'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    성적 분석
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'records' ? (
                <>
                  {userRole === 'teacher' && <RecordForm onAddRecord={handleAddRecord} />}
                  
                  <RecordList
                    records={selectedStudent.records || []}
                    onUpdateRecord={userRole === 'teacher' ? handleUpdateRecord : null}
                    onDeleteRecord={userRole === 'teacher' ? handleDeleteRecord : null}
                    isTeacher={userRole === 'teacher'}
                  />
                </>
              ) : (
                <div className="space-y-8">
                  <AnalysisDashboard student={selectedStudent} />
                  {userRole === 'teacher' && <BarChartAnalysis students={studentsWithRecords} />}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>학생을 선택해주세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;