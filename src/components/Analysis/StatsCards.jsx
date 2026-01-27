import React from 'react';

const StatsCards = ({ data, showLegend = false, getColor }) => {
  if (!data || data.length === 0) return null;

  const scores = data.map(d => d.score);
  const maxScore = Math.max(...scores);
  const avgScore = (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(1);
  const minScore = Math.min(...scores);

  return (
    <>
      {/* 통계 정보 */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-white p-3 rounded-lg border text-center">
          <p className="text-xs text-gray-600">최고 점수</p>
          <p className="text-lg font-bold text-indigo-600">{maxScore}점</p>
        </div>
        <div className="bg-white p-3 rounded-lg border text-center">
          <p className="text-xs text-gray-600">평균 점수</p>
          <p className="text-lg font-bold text-green-600">{avgScore}점</p>
        </div>
        <div className="bg-white p-3 rounded-lg border text-center">
          <p className="text-xs text-gray-600">최저 점수</p>
          <p className="text-lg font-bold text-orange-600">{minScore}점</p>
        </div>
      </div>

      {/* 전체 선택시 과목별 범례 표시 */}
      {showLegend && getColor && (
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          {[...new Set(data.map(d => d.subject))].map(subject => (
            <div key={subject} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: getColor(subject) }}
              />
              <span className="text-sm text-gray-700">{subject}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default StatsCards;