import React from 'react';
import { Users, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { calculateAverage } from '../../utils/calculations';
import { toEmail } from '../../utils/authHelper';

const StudentList = ({ 
  students, 
  selectedStudent, 
  onSelectStudent, 
  onDeleteStudent, 
  isTeacher = true, 
  currentUserEmail = '',
  loading = false
}) => {
  // 안전하게 배열 처리 - undefined, null 체크
  const safeStudents = Array.isArray(students) ? students : [];
  
  // 학생 계정일 경우 자신의 이메일과 매칭되는 학생만 필터링
  const displayStudents = isTeacher 
    ? safeStudents 
    : safeStudents.filter(s => s?.studentId && toEmail(s.studentId) === currentUserEmail);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">학생 목록</h2>
        </div>
        <span className="text-sm text-gray-600">{displayStudents?.length || 0}명</span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading ? (
          // 로딩 중
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-sm">데이터를 불러오는 중입니다...</p>
          </div>
        ) : displayStudents.length === 0 ? (
          // 데이터 없음
          <p className="text-gray-500 text-center py-8">
            {isTeacher ? '학생을 추가해주세요.' : '등록된 학생 정보가 없습니다.'}
          </p>
        ) : (
          // 학생 목록 표시
          displayStudents.map(student => {
            if (!student) return null; // null 체크
            
            const studentRecords = Array.isArray(student.records) ? student.records : [];
            
            return (
              <div
                key={student.id || Math.random()}
                onClick={() => onSelectStudent && onSelectStudent(student)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedStudent?.id === student.id
                    ? 'bg-indigo-50 border-2 border-indigo-300'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{student.name || '이름 없음'}</h3>
                      {isTeacher && student.studentId && (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          <CheckCircle className="w-3 h-3" />
                          {student.studentId}
                        </span>
                      )}
                      {isTeacher && !student.studentId && (
                        <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                          <AlertCircle className="w-3 h-3" />
                          미연결
                        </span>
                      )}
                    </div>
                    {student.grade && <p className="text-sm text-gray-600">{student.grade}</p>}
                    {student.memo && <p className="text-xs text-gray-500 mt-1">{student.memo}</p>}
                    <p className="text-xs text-indigo-600 mt-1">
                      기록: {studentRecords.length}개 | 평균: {calculateAverage(studentRecords)}
                    </p>
                  </div>
                  {isTeacher && onDeleteStudent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteStudent(student.id);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentList;