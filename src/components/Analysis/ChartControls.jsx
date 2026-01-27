import React from 'react';
import { BarChart3, LineChart as LineChartIcon } from 'lucide-react';

const ChartControls = ({ 
  chartType, 
  onChartTypeChange, 
  selectedSubject, 
  onSubjectChange, 
  subjects 
}) => {
  return (
    <div className="space-y-4">
      {/* 차트 타입 선택 */}
      <div>
        <p className="text-sm text-gray-600 mb-2">차트 유형:</p>
        <div className="flex gap-2">
          <button
            onClick={() => onChartTypeChange('bar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              chartType === 'bar'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            막대 그래프
          </button>
          <button
            onClick={() => onChartTypeChange('line')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              chartType === 'line'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <LineChartIcon className="w-4 h-4" />
            꺾은선 그래프
          </button>
        </div>
      </div>

      {/* 과목 필터 버튼 그룹 */}
      <div>
        <p className="text-sm text-gray-600 mb-2">과목 선택:</p>
        <div className="flex flex-wrap gap-2">
          {subjects.map(subject => (
            <button
              key={subject}
              onClick={() => onSubjectChange(subject)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedSubject === subject
                  ? 'bg-indigo-600 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartControls;