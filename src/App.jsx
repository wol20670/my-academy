import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, LogOut, TrendingUp, BarChart3 } from 'lucide-react';
import { auth, db } from './firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { toEmail, toId } from './utils/authHelper';
import {
  addStudent as addStudentToDB,
  deleteStudent as deleteStudentFromDB,
  addRecord as addRecordToDB,
  updateRecord as updateRecordInDB,
  deleteRecord as deleteRecordFromDB
} from './utils/dataHelper';

import LoginForm from './components/Auth/LoginForm';
import StudentForm from './components/Student/StudentForm';
import StudentList from './components/Student/StudentList';
import RecordForm from './components/Record/RecordForm';
import RecordList from './components/Record/RecordList';
import AnalysisDashboard from './components/Analysis/AnalysisDashboard';
import BarChartAnalysis from './components/Analysis/BarChartAnalysis';
import { calculateAverage } from './utils/calculations';

function App() {
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

  // 실시간 데이터 동기화 (onSnapshot)
  useEffect(() => {
    if (!currentUser || !userRole || !userId) {
      setStudents([]);
      setRecords([]);
      return;
    }

    setDataLoading(true);
    let unsubscribeStudents;
    let unsubscribeRecords;

    try {
      if (userRole === 'teacher') {
        // 선생님: 자신이 등록한 모든 학생 실시간 동기화
        const studentsQuery = query(
          collection(db, 'students'),
          where('teacherId', '==', currentUser.email)
        );
        
        unsubscribeStudents = onSnapshot(studentsQuery, (snapshot) => {
          const studentsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setStudents(studentsList);
          setDataLoading(false);
        }, (error) => {
          console.error('학생 데이터 동기화 실패:', error);
          setStudents([]);
          setDataLoading(false);
        });

        // 선생님: 자신이 등록한 모든 성적 실시간 동기화
        const recordsQuery = query(
          collection(db, 'records'),
          where('teacherId', '==', currentUser.email)
        );
        
        unsubscribeRecords = onSnapshot(recordsQuery, (snapshot) => {
          const recordsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setRecords(recordsList);
        }, (error) => {
          console.error('성적 데이터 동기화 실패:', error);
          setRecords([]);
        });

      } else {
        // 학생: 자신의 정보 실시간 동기화
        const studentsQuery = query(
          collection(db, 'students'),
          where('studentId', '==', userId)
        );
        
        unsubscribeStudents = onSnapshot(studentsQuery, (snapshot) => {
          const studentsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          if (studentsList.length > 0) {
            setStudents(studentsList);
          } else {
            setStudents([]);
          }
          setDataLoading(false);
        }, (error) => {
          console.error('학생 정보 동기화 실패:', error);
          setStudents([]);
          setDataLoading(false);
        });

        // 학생: 자신의 성적 실시간 동기화
        const recordsQuery = query(
          collection(db, 'records'),
          where('studentId', '==', userId)
        );
        
        unsubscribeRecords = onSnapshot(recordsQuery, (snapshot) => {
          const recordsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setRecords(recordsList);
          
          // 학생은 자동으로 첫 번째 학생 선택
          if (studentsList.length > 0) {
            setSelectedStudent({
              ...studentsList[0],
              records: recordsList
            });
          }
        }, (error) => {
          console.error('성적 데이터 동기화 실패:', error);
          setRecords([]);
        });
      }

    } catch (error) {
      console.error('데이터 동기화 설정 실패:', error);
      setDataLoading(false);
    }

    // 클린업
    return () => {
      if (unsubscribeStudents) unsubscribeStudents();
      if (unsubscribeRecords) unsubscribeRecords();
    };
  }, [currentUser, userRole, userId]);

  // 선택된 학생의 성적 업데이트
  useEffect(() => {
    if (selectedStudent && Array.isArray(records)) {
      const updatedRecords = records.filter(r => r.studentId === selectedStudent.studentId);
      setSelectedStudent(prev => ({
        ...prev,
        records: updatedRecords
      }));
    }
  }, [records]);

  // 학생에 성적 연결 (렌더링용)
  const studentsWithRecordsLinked = useMemo(() => {
    if (!Array.isArray(students) || !Array.isArray(records)) return [];
    
    return students.map(student => {
      const studentRecords = records.filter(r => r.studentId === student.studentId);
      return {
        ...student,
        records: studentRecords
      };
    });
  }, [students, records]);

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
      // onSnapshot이 자동으로 업데이트함
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
        // onSnapshot이 자동으로 업데이트함
      } catch (error) {
        console.error('학생 삭제 실패:', error);
        alert('학생 삭제 실패: ' + error.message);
      }
    }
  };

  const handleAddRecord = async (recordData) => {
    try {
      await addRecordToDB(recordData, selectedStudent.studentId, currentUser.email);
      // onSnapshot이 자동으로 업데이트함
    } catch (error) {
      console.error('성적 추가 실패:', error);
      alert('성적 추가 실패: ' + error.message);
    }
  };

  const handleUpdateRecord = async (updatedRecord) => {
    try {
      await updateRecordInDB(updatedRecord.id, updatedRecord);
      // onSnapshot이 자동으로 업데이트함
    } catch (error) {
      console.error('성적 수정 실패:', error);
      alert('성적 수정 실패: ' + error.message);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('이 기록을 삭제하시겠습니까?')) {
      try {
        await deleteRecordFromDB(recordId);
        // onSnapshot이 자동으로 업데이트함
      } catch (error) {
        console.error('성적 삭제 실패:', error);
        alert('성적 삭제 실패: ' + error.message);
      }
    }
  };

  const handleSelectStudent = (student) => {
    if (!student) return;
    
    const studentRecords = Array.isArray(records) 
      ? records.filter(r => r.studentId === student.studentId)
      : [];
      
    setSelectedStudent({
      ...student,
      records: studentRecords
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginForm />;
  }

  // 학생별로 성적 그룹화 (전체 학생 비교용)
  const studentsWithRecords = studentsWithRecordsLinked;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">학생 학업 관리</h1>
              <p className="text-sm text-gray-600">
                {currentUser.email} 
                <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                  {userRole === 'teacher' ? '선생님' : '학생'}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            students={studentsWithRecordsLinked}
            selectedStudent={selectedStudent}
            onSelectStudent={handleSelectStudent}
            onDeleteStudent={userRole === 'teacher' ? handleDeleteStudent : null}
            isTeacher={userRole === 'teacher'}
            currentUserEmail={currentUser?.email}
            loading={dataLoading}
          />
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          {selectedStudent ? (
            <>
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