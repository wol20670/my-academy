/**
 * 학생에 성적 데이터 연결
 * @param {Array} students - 학생 목록
 * @param {Array} records - 성적 기록 목록
 * @returns {Array} - 성적이 연결된 학생 목록
 */
export const linkRecordsToStudents = (students, records) => {
  if (!Array.isArray(students) || !Array.isArray(records)) {
    return [];
  }
  
  return students.map(student => {
    const studentRecords = records.filter(r => r.studentId === student.studentId);
    return {
      ...student,
      records: studentRecords
    };
  });
};

/**
 * 특정 학생의 성적 필터링
 * @param {Array} records - 전체 성적 목록
 * @param {string} studentId - 학생 아이디
 * @returns {Array} - 해당 학생의 성적만
 */
export const filterRecordsByStudent = (records, studentId) => {
  if (!Array.isArray(records) || !studentId) {
    return [];
  }
  return records.filter(r => r.studentId === studentId);
};

/**
 * 데이터 유효성 검사
 * @param {any} data - 검사할 데이터
 * @returns {boolean} - 유효한 배열인지 여부
 */
export const isValidArray = (data) => {
  return Array.isArray(data) && data.length > 0;
};

/**
 * 안전한 배열 반환
 * @param {any} data - 검사할 데이터
 * @returns {Array} - 빈 배열 또는 원본 배열
 */
export const safeArray = (data) => {
  return Array.isArray(data) ? data : [];
};

export default {
  linkRecordsToStudents,
  filterRecordsByStudent,
  isValidArray,
  safeArray
};