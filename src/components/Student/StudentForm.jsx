import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { isValidId } from '../../utils/authHelper';

const StudentForm = ({ onAddStudent }) => {
  const [newStudent, setNewStudent] = useState({ 
    name: '', 
    studentId: '',
    grade: '', 
    memo: '' 
  });
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');

    if (!newStudent.name.trim()) {
      setError('학생 이름을 입력해주세요.');
      return;
    }

    if (!newStudent.studentId.trim()) {
      setError('학생 아이디를 입력해주세요.');
      return;
    }

    if (!isValidId(newStudent.studentId)) {
      setError('아이디는 영어 소문자와 숫자만 사용 가능합니다 (3-20자)');
      return;
    }

    onAddStudent(newStudent);
    setNewStudent({ name: '', studentId: '', grade: '', memo: '' });
    setError('');
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="이름 (예: 김민수)"
        value={newStudent.name}
        onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
      />
      
      <div>
        <div className="relative">
          <input
            type="text"
            placeholder="아이디 (예: minsu)"
            value={newStudent.studentId}
            onChange={(e) => setNewStudent({...newStudent, studentId: e.target.value.toLowerCase()})}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 pr-40"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            @my-academy.com
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">학생이 로그인할 때 사용할 아이디</p>
      </div>

      <input
        type="text"
        placeholder="학년/반 (예: 3학년 2반)"
        value={newStudent.grade}
        onChange={(e) => setNewStudent({...newStudent, grade: e.target.value})}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
      />
      
      <textarea
        placeholder="메모"
        value={newStudent.memo}
        onChange={(e) => setNewStudent({...newStudent, memo: e.target.value})}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        rows="2"
      />
      
      {error && <p className="text-red-600 text-sm">{error}</p>}
      
      <button
        onClick={handleSubmit}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
      >
        <PlusCircle className="w-4 h-4" />
        학생 추가
      </button>
    </div>
  );
};

export default StudentForm;