// 평균 계산
export const calculateAverage = (records = []) => {
  const safeRecords = Array.isArray(records) ? records : [];
  const scores = safeRecords.filter(r => r.score).map(r => parseFloat(r.score));
  if (scores.length === 0) return '-';
  return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
};

// 과목별 성적 변화 데이터 생성 (꺾은선 그래프용)
export const getSubjectTrendData = (student) => {
  if (!student) return [];
  const records = Array.isArray(student.records) ? student.records : [];
  if (records.length === 0) return [];

  const subjects = [...new Set(records.map(r => r.subject))];
  const recordsBySubject = {};
  
  subjects.forEach(subject => {
    recordsBySubject[subject] = records
      .filter(r => r.subject === subject && r.score)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(r => ({
        date: r.date,
        score: parseFloat(r.score)
      }));
  });

  const allDates = [...new Set(records.filter(r => r.score).map(r => r.date))].sort();
  
  return allDates.map(date => {
    const dataPoint = { date };
    subjects.forEach(subject => {
      const record = recordsBySubject[subject].find(r => r.date === date);
      if (record) {
        dataPoint[subject] = record.score;
      }
    });
    return dataPoint;
  });
};

// 전체 학생 평균 비교 데이터 (막대 그래프용)
export const getStudentsComparisonData = (students = []) => {
  const safeStudents = Array.isArray(students) ? students : [];
  return safeStudents
    .filter(s => {
      const records = Array.isArray(s.records) ? s.records : [];
      return records.length > 0;
    })
    .map(student => {
      const records = Array.isArray(student.records) ? student.records : [];
      return {
        name: student.name,
        average: parseFloat(calculateAverage(records)),
        recordCount: records.length
      };
    })
    .sort((a, b) => b.average - a.average);
};

// 과목별 색상
export const subjectColors = [
  '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', 
  '#ef4444', '#ec4899', '#14b8a6', '#f97316'
];