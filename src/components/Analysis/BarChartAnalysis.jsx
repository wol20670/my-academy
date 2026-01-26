import React from 'react';
import { BarChart as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getStudentsComparisonData } from '../../utils/calculations';

const BarChartAnalysis = ({ students }) => {
  const comparisonData = getStudentsComparisonData(students);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <BarChartIcon className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-800">전체 학생 평균 점수 비교</h3>
      </div>
      {comparisonData.length === 0 ? (
        <p className="text-gray-500 text-center py-8">비교할 학생 데이터가 없습니다.</p>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="average" fill="#8b5cf6" name="평균 점수" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {comparisonData.map((student, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg border">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">{student.name}</span>
                  <span className="text-indigo-600 font-bold">{student.average}점</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">기록 {student.recordCount}개</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BarChartAnalysis;