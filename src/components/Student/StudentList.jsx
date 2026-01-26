import React from 'react';
import { Users, Trash2 } from 'lucide-react';
import { calculateAverage } from '../../utils/calculations';

const StudentList = ({ students, selectedStudent, onSelectStudent, onDeleteStudent, isTeacher = true }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">학생 목록</h2>
        </div>
        <span className="text-sm text-gray-600">{students.length}명</span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {students.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {isTeacher ? '학생을 추가해주세요.' : '등록된 학생 정보가 없습니다.'}
          </p>
        ) : (
          students.map(student => (
            <div
              key={student.id}
              onClick={() => onSelectStudent(student)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedStudent?.id === student.id
                  ? 'bg-indigo-50 border-2 border-indigo-300'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{student.name}</h3>
                  {student.grade && <p className="text-sm text-gray-600">{student.grade}</p>}
                  {student.memo && <p className="text-xs text-gray-500 mt-1">{student.memo}</p>}
                  <p className="text-xs text-indigo-600 mt-1">
                    기록: {student.records.length}개 | 평균: {calculateAverage(student.records)}
                  </p>
                </div>
                {/* 선생님만 삭제 버튼 표시 */}
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
          ))
        )}
      </div>
    </div>
  );
};

export default StudentList;