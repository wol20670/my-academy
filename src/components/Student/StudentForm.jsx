import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

const StudentForm = ({ onAddStudent }) => {
  const [newStudent, setNewStudent] = useState({ name: '', grade: '', memo: '' });

  const handleSubmit = () => {
    if (!newStudent.name.trim()) {
      alert('학생 이름을 입력해주세요.');
      return;
    }
    onAddStudent(newStudent);
    setNewStudent({ name: '', grade: '', memo: '' });
  };

  return (
    <div className="space-y-3 mb-6">
      <input
        type="text"
        placeholder="이름"
        value={newStudent.name}
        onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
      />
      <input
        type="text"
        placeholder="학년/반"
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