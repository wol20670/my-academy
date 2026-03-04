import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, TrendingUp, BarChart3, ClipboardList, Menu, X, Users } from 'lucide-react';
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
import {
  subscribeToAssignmentsByTeacher,
  subscribeToAssignmentsByStudent
} from './services/assignmentService';

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
import AssignmentForm from './components/Assignment/AssignmentForm';
import AssignmentListTeacher from './components/Assignment/AssignmentListTeacher';
import AssignmentListStudent from './components/Assignment/AssignmentListStudent';
import { toEmail } from './utils/authHelper';

function App() {
  // State
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('records');
  
  // 모바일 UI 상태
  const [showStudentList, setShowStudentList] = useState(false);

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
        setAssignments([]);
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
      setAssignments([]);
      return;
    }

    setDataLoading(true);
    let unsubscribeStudents;
    let unsubscribeRecords;
    let unsubscribeAssignments;

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

      // 선생님: 숙제 구독
      unsubscribeAssignments = subscribeToAssignmentsByTeacher(
        currentUser.email,
        (data) => setAssignments(data),
        () => setAssignments([])
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

      // 학생: 본인 숙제 구독
      unsubscribeAssignments = subscribeToAssignmentsByStudent(
        userId,
        (data) => setAssignments(data),
        () => setAssignments([])
      );
    }

    return () => {
      if (unsubscribeStudents) unsubscribeStudents();
      if (unsubscribeRecords) unsubscribeRecords();
      if (unsubscribeAssignments) unsubscribeAssignments();
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
      setAssignments([]);
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
    
    // 모바일에서 학생 선택 시 목록 자동으로 닫기
    setShowStudentList(false);
  };

  // 미제출 숙제 개수 계산
  const unsubmittedCount = useMemo(() => {
    if (userRole !== 'student') return 0;
    return assignments.filter(a => !a.submissions?.find(s => s.studentId === userId)).length;
  }, [assignments, userId, userRole]);

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

      <div className="max-w-7xl mx-auto p-2 sm:p-4">
        {/* 모바일: 학생 목록 토글 버튼 (선생님만) */}
        {userRole === 'teacher' && (
          <button
            onClick={() => setShowStudentList(!showStudentList)}
            className="lg:hidden w-full mb-4 px-4 py-3 bg-indigo-600 text-white rounded-lg flex items-center justify-between shadow-md active:bg-indigo-700"
          >
            <span className="flex items-center gap-2 font-medium">
              <Users className="w-5 h-5" />
              학생 목록 {showStudentList ? '숨기기' : '보기'}
            </span>
            {showStudentList ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Left Panel: Student Management */}
          <div className={`lg:col-span-1 ${showStudentList ? 'block' : 'hidden lg:block'}`}>
            {userRole === 'teacher' && (
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4">
                <StudentForm onAddStudent={handleAddStudent} />
              </div>
            )}
            
            {userRole === 'student' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
                <p className="text-xs sm:text-sm text-blue-800">
                  👋 학생 모드입니다. 선생님이 등록한 나의 성적과 숙제를 확인할 수 있습니다.
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
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-3 sm:p-6">
            {selectedStudent ? (
              <>
                {/* Student Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{selectedStudent.name}</h2>
                    <p className="text-sm sm:text-base text-gray-600">{selectedStudent.grade}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm bg-indigo-50 px-3 py-2 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <span className="text-gray-600">평균 점수:</span>
                    <span className="font-bold text-indigo-600">
                      {calculateAverage(selectedStudent.records || [])}
                    </span>
                  </div>
                </div>

                {/* Tab Navigation - 모바일 최적화 */}
                <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b overflow-x-auto pb-1">
                  <button
                    onClick={() => setActiveTab('records')}
                    className={`flex-1 min-w-[100px] px-3 sm:px-4 py-2 sm:py-3 font-medium transition-colors rounded-t-lg ${
                      activeTab === 'records'
                        ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">학업기록</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className={`flex-1 min-w-[100px] px-3 sm:px-4 py-2 sm:py-3 font-medium transition-colors rounded-t-lg ${
                      activeTab === 'analysis'
                        ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">성적분석</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className={`flex-1 min-w-[100px] px-3 sm:px-4 py-2 sm:py-3 font-medium transition-colors rounded-t-lg relative ${
                      activeTab === 'assignments'
                        ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">숙제</span>
                      {userRole === 'student' && unsubmittedCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unsubmittedCount}
                        </span>
                      )}
                    </div>
                  </button>
                </div>

                {/* Tab Content */}
                <div className="overflow-y-auto max-h-[calc(100vh-280px)] sm:max-h-[calc(100vh-300px)]">
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
                  ) : activeTab === 'analysis' ? (
                    <div className="space-y-6 sm:space-y-8">
                      <AnalysisDashboard student={selectedStudent} />
                      {userRole === 'teacher' && <BarChartAnalysis students={studentsWithRecords} />}
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      {userRole === 'teacher' ? (
                        <>
                          <AssignmentForm 
                            teacherEmail={currentUser.email}
                            students={students}
                            onSuccess={() => {}}
                          />
                          <AssignmentListTeacher 
                            assignments={assignments}
                            students={students}
                          />
                        </>
                      ) : (
                        <AssignmentListStudent 
                          assignments={assignments}
                          studentId={userId}
                        />
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 sm:py-20 text-gray-500">
                <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">학생을 선택해주세요</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
