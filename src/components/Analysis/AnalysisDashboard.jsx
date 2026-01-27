import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import ChartControls from './ChartControls';
import StatsCards from './StatsCards';
import ChartDisplay from './ChartDisplay';
import { formatDate } from '../../utils/formatters';

const AnalysisDashboard = ({ student }) => {
  const [selectedSubject, setSelectedSubject] = useState('전체');
  const [chartType, setChartType] = useState('bar');

  // 안전하게 records 처리
  const safeRecords = Array.isArray(student?.records) ? student.records : [];
  const allSubjects = ['전체', ...new Set(safeRecords.map(r => r.subject))];

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

  const getFilteredData = () => {
    let filteredRecords = safeRecords.filter(r => r.score);

    if (selectedSubject !== '전체') {
      filteredRecords = filteredRecords.filter(r => r.subject === selectedSubject);
    }

    filteredRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

    return filteredRecords.map(record => ({
      date: record.date,
      displayDate: formatDate(record.date),
      subject: record.subject,
      score: parseFloat(record.score)
    }));
  };

  const getLineChartData = () => {
    const records = safeRecords.filter(r => r.score);
    
    if (selectedSubject !== '전체') {
      return records
        .filter(r => r.subject === selectedSubject)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(r => ({
          date: formatDate(r.date),
          [r.subject]: parseFloat(r.score)
        }));
    }

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
  const subjects = selectedSubject === '전체' 
    ? [...new Set(safeRecords.map(r => r.subject))]
    : [selectedSubject];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-800">과목별 성적 추이</h3>
      </div>

      <ChartControls
        chartType={chartType}
        onChartTypeChange={setChartType}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        subjects={allSubjects}
      />

      <div className="mt-6">
        <ChartDisplay
          chartType={chartType}
          data={chartData}
          selectedSubject={selectedSubject}
          getColor={getColor}
          subjects={subjects}
        />

        {chartType === 'bar' && chartData.length > 0 && (
          <StatsCards
            data={chartData}
            showLegend={selectedSubject === '전체'}
            getColor={getColor}
          />
        )}
      </div>
    </div>
  );
};

export default AnalysisDashboard;