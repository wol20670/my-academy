import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';

const ChartDisplay = ({ 
  chartType, 
  data, 
  selectedSubject, 
  getColor, 
  subjects 
}) => {
  if (!data || data.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        {selectedSubject === '전체' 
          ? '점수 데이터가 없습니다.' 
          : `${selectedSubject} 과목의 점수 데이터가 없습니다.`}
      </p>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <ResponsiveContainer width="100%" height={450}>
        {chartType === 'bar' ? (
          <BarChart 
            data={data}
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
                  const chartData = payload[0].payload;
                  const color = selectedSubject === '전체' ? getColor(chartData.subject) : '#8b5cf6';
                  return (
                    <div className="bg-white p-3 rounded-lg shadow-lg border-2" style={{ borderColor: color }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: color }}
                        />
                        <p className="font-semibold text-gray-800">{chartData.subject}</p>
                      </div>
                      <p className="text-sm text-gray-600">{chartData.displayDate}</p>
                      <p className="text-lg font-bold mt-1" style={{ color: color }}>
                        {chartData.score}점
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
              {data.map((entry, index) => (
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
                  fontSize: data.length > 15 ? 11 : 13 
                }}
                formatter={(value) => `${value}점`}
              />
            </Bar>
          </BarChart>
        ) : (
          <LineChart 
            data={data}
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
            {subjects.map((subject) => (
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
    </div>
  );
};

export default ChartDisplay;