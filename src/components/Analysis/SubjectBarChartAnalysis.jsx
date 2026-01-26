import React, { useState } from 'react';
import { BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';

const SubjectChartAnalysis = ({ student }) => {
  const [selectedSubject, setSelectedSubject] = useState('전체');
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'line'

  // 학생의 모든 과목 추출
  const allSubjects = ['전체', ...new Set(student.records.map(r => r.subject))];

  // 날짜 포맷 변환 함수 (YYYY-MM-DD -> YY/MM/DD)
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  // 선택된 과목에 따라 데이터 필터링 및 정렬
  const getFilteredData = () => {
    let filteredRecords = student.records.filter(r => r.score);

    // '전체'가 아닌 경우 특정 과목만 필터링
    if (selectedSubject !== '전체') {
      filteredRecords = filteredRecords.filter(r => r.subject === selectedSubject);
    }

    // 날짜순으로 정렬
    filteredRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 차트 데이터 형식으로 변환
    return filteredRecords.map(record => ({
      date: record.date,
      displayDate: formatDate(record.date),
      subject: record.subject,
      score: parseFloat(record.score),
      label: `${record.subject} ${record.score}점`
    }));
  };

  // 꺾은선 그래프용 데이터 (과목별로 그룹화)
  const getLineChartData = () => {
    const records = student.records.filter(r => r.score);
    
    if (selectedSubject !== '전체') {
      // 특정 과목만 선택된 경우
      return records
        .filter(r => r.subject === selectedSubject)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(r => ({
          date: formatDate(r.date),
          [r.subject]: parseFloat(r.score)
        }));
    }

    // 전체 과목 선택된 경우
    const allDates = [...new Set(records.map(r => r.date))].sort();
    const subjects = [...new Set(records.map(r => r.subject))];
    
    return allDates.map(date => {
      const dataPoint = { date: formatDate(date) };
      subjects.forEach(subject => {
        const record = records.find(r => r.date === date && r.subject === subject);
        if (record) {
          dataPoint[subject] = parseFloat(record.score);
        }
      });
      return dataPoint;
    });
  };

  const chartData = chartType === 'bar' ? getFilteredData() : getLineChartData();
  const hasData = chartData.length > 0;

  // 막대/선 색상 (과목별로 다른 색상)
  const getColor = (subject) => {
    const colorMap = {
      '국어': '#8b5cf6',
      '영어': '#3b82f6',
      '수학': '#10b981',
      '과학': '#f59e0b',
      '사회': '#ef4444',
      '역사': '#ec4899',
      '체육': '#14b8a6',
      '음악': '#f97316'
    };
    return colorMap[subject] || '#6366f1';
  };

  const subjects = selectedSubject === '전체' 
    ? [...new Set(student.records.map(r => r.subject))]
    : [selectedSubject];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-800">과목별 성적 추이</h3>
      </div>

      {/* 차트 타입 선택 */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">차트 유형:</p>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('bar')}
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
            onClick={() => setChartType('line')}
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
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">과목 선택:</p>
        <div className="flex flex-wrap gap-2">
          {allSubjects.map(subject => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
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

      {/* 그래프 */}
      {!hasData ? (
        <p className="text-gray-500 text-center py-8">
          {selectedSubject === '전체' 
            ? '점수 데이터가 없습니다.' 
            : `${selectedSubject} 과목의 점수 데이터가 없습니다.`}
        </p>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4">
          <ResponsiveContainer width="100%" height={450}>
            {chartType === 'bar' ? (
              <BarChart 
                data={chartData}
                margin={{ top: 30, right: 30, left: 20, bottom: 90 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="displayDate" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  interval="preserveStartEnd"
                  dx={-5}
                  dy={10}
                />
                <YAxis 
                  domain={[0, 100]} 
                  ticks={[0, 20, 40, 60, 80, 100]}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const color = selectedSubject === '전체' ? getColor(data.subject) : '#8b5cf6';
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border-2" style={{ borderColor: color }}>
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: color }}
                            />
                            <p className="font-semibold text-gray-800">{data.subject}</p>
                          </div>
                          <p className="text-sm text-gray-600">{data.displayDate}</p>
                          <p className="text-lg font-bold mt-1" style={{ color: color }}>
                            {data.score}점
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="score" 
                  name="점수" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={selectedSubject === '전체' ? getColor(entry.subject) : '#8b5cf6'} 
                    />
                  ))}
                  <LabelList 
                    dataKey="score" 
                    position="top" 
                    offset={8}
                    style={{ 
                      fill: '#1f2937', 
                      fontWeight: 'bold', 
                      fontSize: chartData.length > 15 ? 11 : 13 
                    }}
                    formatter={(value) => `${value}점`}
                  />
                </Bar>
              </BarChart>
            ) : (
              <LineChart 
                data={chartData}
                margin={{ top: 30, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  interval="preserveStartEnd"
                  dx={-5}
                  dy={10}
                />
                <YAxis 
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border">
                          {payload.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2 mb-1">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: entry.stroke }}
                              />
                              <span className="font-semibold text-gray-800">{entry.name}:</span>
                              <span className="font-bold" style={{ color: entry.stroke }}>
                                {entry.value}점
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                {subjects.map((subject, idx) => (
                  <Line
                    key={subject}
                    type="monotone"
                    dataKey={subject}
                    stroke={getColor(subject)}
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>

          {/* 통계 정보 */}
          {chartType === 'bar' && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg border text-center">
                <p className="text-xs text-gray-600">최고 점수</p>
                <p className="text-lg font-bold text-indigo-600">
                  {Math.max(...chartData.map(d => d.score))}점
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border text-center">
                <p className="text-xs text-gray-600">평균 점수</p>
                <p className="text-lg font-bold text-green-600">
                  {(chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length).toFixed(1)}점
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border text-center">
                <p className="text-xs text-gray-600">최저 점수</p>
                <p className="text-lg font-bold text-orange-600">
                  {Math.min(...chartData.map(d => d.score))}점
                </p>
              </div>
            </div>
          )}

          {/* 전체 선택시 과목별 범례 표시 (막대 그래프일 때만) */}
          {selectedSubject === '전체' && chartType === 'bar' && (
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              {[...new Set(chartData.map(d => d.subject))].map(subject => (
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
        </div>
      )}
    </div>
  );
};

export default SubjectChartAnalysis;