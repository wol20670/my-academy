import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

const RecordForm = ({ onAddRecord }) => {
  const [newRecord, setNewRecord] = useState({ 
    date: '', 
    subject: '', 
    score: '', 
    comment: '' 
  });

  const handleSubmit = () => {
    if (!newRecord.date || !newRecord.subject) {
      alert('날짜와 과목을 입력해주세요.');
      return;
    }
    onAddRecord(newRecord);
    setNewRecord({ date: '', subject: '', score: '', comment: '' });
  };

  return (
    <div className="bg-indigo-50 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-gray-800 mb-3">새 기록 추가</h3>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="date"
          value={newRecord.date}
          onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          placeholder="과목"
          value={newRecord.subject}
          onChange={(e) => setNewRecord({...newRecord, subject: e.target.value})}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="number"
          placeholder="점수"
          value={newRecord.score}
          onChange={(e) => setNewRecord({...newRecord, score: e.target.value})}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          placeholder="코멘트"
          value={newRecord.comment}
          onChange={(e) => setNewRecord({...newRecord, comment: e.target.value})}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <button
        onClick={handleSubmit}
        className="w-full mt-3 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
      >
        <PlusCircle className="w-4 h-4" />
        기록 추가
      </button>
    </div>
  );
};

export default RecordForm;