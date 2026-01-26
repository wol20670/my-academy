import React, { useState, useEffect } from 'react';
import { BookOpen, LogOut, TrendingUp, BarChart3 } from 'lucide-react';
import { auth, db } from './firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

// Components
import LoginForm from './components/Auth/LoginForm';
import StudentForm from './components/Student/StudentForm';
import StudentList from './components/Student/StudentList';
import RecordForm from './components/Record/RecordForm';
import RecordList from './components/Record/RecordList';
import SubjectChartAnalysis from './components/Analysis/SubjectBarChartAnalysis';
import BarChartAnalysis from './components/Analysis/BarChartAnalysis';
import { calculateAverage } from './utils/calculations';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('records');

  // 사용자 인증 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 학생 데이터 실시간 동기화
  useEffect(() => {
    if (!currentUser) {
      setStudents([]);
      return;
    }

    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setStudents(docSnap.data().students || []);
      }
    });

    return unsubscribe;
  }, [currentUser]);

  // 로그아웃
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSelectedStudent(null);
    } catch (err) {
      console.error('로그아웃 오류:', err);
    }
  };

  // 학생 데이터 저장
  const saveStudents = async (updatedStudents) => {
    if (!currentUser) return;
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        email: currentUser.email,
        students: updatedStudents,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      alert('데이터 저장 실패: ' + err.message);
    }
  };

  // 학생 추가
  const handleAddStudent = (studentData) => {
    const student = {
      id: Date.now(),
      ...studentData,
      records: []
    };
    saveStudents([...students, student]);
  };

  // 학생 삭제
  const handleDeleteStudent = (id) => {
    if (window.confirm('정말 이 학생을 삭제하시겠습니까?')) {
      saveStudents(students.filter(s => s.id !== id));
      if (selectedStudent?.id === id) {
        setSelectedStudent(null);
      }
    }
  };

  // 기록 추가
  const handleAddRecord = (recordData) => {
    const updatedStudents = students.map(s => {
      if (s.id === selectedStudent.id) {
        const record = {
          id: Date.now(),
          ...recordData
        };
        return { ...s, records: [...s.records, record] };
      }
      return s;
    });
    saveStudents(updatedStudents);
    setSelectedStudent(updatedStudents.find(s => s.id === selectedStudent.id));
  };

  // 기록 수정
  const handleUpdateRecord = (updatedRecord) => {
    const updatedStudents = students.map(s => {
      if (s.id === selectedStudent.id) {
        return {
          ...s,
          records: s.records.map(r => r.id === updatedRecord.id ? updatedRecord : r)
        };
      }
      return s;
    });
    saveStudents(updatedStudents);
    setSelectedStudent(updatedStudents.find(s => s.id === selectedStudent.id));
  };

  // 기록 삭제
  const handleDeleteRecord = (recordId) => {
    if (window.confirm('이 기록을 삭제하시겠습니까?')) {
      const updatedStudents = students.map(s => {
        if (s.id === selectedStudent.id) {
          return { ...s, records: s.records.filter(r => r.id !== recordId) };
        }
        return s;
      });
      saveStudents(updatedStudents);
      setSelectedStudent(updatedStudents.find(s => s.id === selectedStudent.id));
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">학생 학업 관리</h1>
              <p className="text-sm text-gray-600">{currentUser.email}</p>
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

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 학생 목록 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <StudentForm onAddStudent={handleAddStudent} />
          </div>
          <StudentList
            students={students}
            selectedStudent={selectedStudent}
            onSelectStudent={setSelectedStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        </div>

        {/* 오른쪽: 학생 상세 정보 */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          {selectedStudent ? (
            <>
              {/* 학생 헤더 */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedStudent.name}</h2>
                  <p className="text-gray-600">{selectedStudent.grade}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span className="text-gray-600">평균 점수:</span>
                  <span className="font-bold text-indigo-600">
                    {calculateAverage(selectedStudent.records)}
                  </span>
                </div>
              </div>

              {/* 탭 네비게이션 */}
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

              {/* 탭 컨텐츠 */}
              {activeTab === 'records' ? (
                <>
                  <RecordForm onAddRecord={handleAddRecord} />
                  <RecordList
                    records={selectedStudent.records}
                    onUpdateRecord={handleUpdateRecord}
                    onDeleteRecord={handleDeleteRecord}
                  />
                </>
              ) : (
                <div className="space-y-8">
                  <SubjectChartAnalysis student={selectedStudent} />
                  <BarChartAnalysis students={students} />
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