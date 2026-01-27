import React, { useState } from 'react';
import { Edit2, Trash2, Save, X } from 'lucide-react';

const RecordList = ({ records = [], onUpdateRecord, onDeleteRecord, isTeacher = true }) => {
  const [editingRecord, setEditingRecord] = useState(null);

  const handleUpdate = () => {
    if (onUpdateRecord) {
      onUpdateRecord(editingRecord);
      setEditingRecord(null);
    }
  };

  // 안전하게 배열 처리
  const safeRecords = Array.isArray(records) ? records : [];
  const sortedRecords = [...safeRecords].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-800">학업 기록</h3>
      {safeRecords.length === 0 ? (
        <p className="text-gray-500 text-center py-8">아직 기록이 없습니다.</p>
      ) : (
        sortedRecords.map(record => (
          <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50">
            {editingRecord?.id === record.id && isTeacher ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={editingRecord.date}
                    onChange={(e) => setEditingRecord({...editingRecord, date: e.target.value})}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    value={editingRecord.subject}
                    onChange={(e) => setEditingRecord({...editingRecord, subject: e.target.value})}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    value={editingRecord.score}
                    onChange={(e) => setEditingRecord({...editingRecord, score: e.target.value})}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    value={editingRecord.comment}
                    onChange={(e) => setEditingRecord({...editingRecord, comment: e.target.value})}
                    className="px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdate}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    저장
                  </button>
                  <button
                    onClick={() => setEditingRecord(null)}
                    className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-600">{record.date}</span>
                    <span className="font-semibold text-indigo-600">{record.subject}</span>
                    {record.score && (
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-medium">
                        {record.score}점
                      </span>
                    )}
                  </div>
                  {record.comment && <p className="text-gray-700">{record.comment}</p>}
                </div>
                {/* 선생님만 수정/삭제 버튼 표시 */}
                {isTeacher && (
                  <div className="flex gap-2">
                    {onUpdateRecord && (
                      <button
                        onClick={() => setEditingRecord(record)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {onDeleteRecord && (
                      <button
                        onClick={() => onDeleteRecord(record.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default RecordList;