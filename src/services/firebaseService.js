import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * 선생님의 학생 목록 실시간 동기화
 * @param {string} teacherEmail - 선생님 이메일
 * @param {Function} onUpdate - 데이터 업데이트 콜백
 * @param {Function} onError - 에러 처리 콜백
 * @returns {Function} - unsubscribe 함수
 */
export const subscribeToStudents = (teacherEmail, onUpdate, onError) => {
  try {
    const studentsQuery = query(
      collection(db, 'students'),
      where('teacherId', '==', teacherEmail)
    );
    
    return onSnapshot(
      studentsQuery,
      (snapshot) => {
        const studentsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        onUpdate(studentsList);
      },
      (error) => {
        console.error('학생 데이터 동기화 실패:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error('학생 구독 설정 실패:', error);
    if (onError) onError(error);
    return () => {}; // 빈 unsubscribe 함수
  }
};

/**
 * 학생의 본인 정보 실시간 동기화
 * @param {string} studentId - 학생 아이디
 * @param {Function} onUpdate - 데이터 업데이트 콜백
 * @param {Function} onError - 에러 처리 콜백
 * @returns {Function} - unsubscribe 함수
 */
export const subscribeToStudentInfo = (studentId, onUpdate, onError) => {
  try {
    const studentsQuery = query(
      collection(db, 'students'),
      where('studentId', '==', studentId)
    );
    
    return onSnapshot(
      studentsQuery,
      (snapshot) => {
        const studentsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        onUpdate(studentsList);
      },
      (error) => {
        console.error('학생 정보 동기화 실패:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error('학생 정보 구독 설정 실패:', error);
    if (onError) onError(error);
    return () => {};
  }
};

/**
 * 선생님의 성적 기록 실시간 동기화
 * @param {string} teacherEmail - 선생님 이메일
 * @param {Function} onUpdate - 데이터 업데이트 콜백
 * @param {Function} onError - 에러 처리 콜백
 * @returns {Function} - unsubscribe 함수
 */
export const subscribeToRecordsByTeacher = (teacherEmail, onUpdate, onError) => {
  try {
    const recordsQuery = query(
      collection(db, 'records'),
      where('teacherId', '==', teacherEmail)
    );
    
    return onSnapshot(
      recordsQuery,
      (snapshot) => {
        const recordsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        onUpdate(recordsList);
      },
      (error) => {
        console.error('성적 데이터 동기화 실패:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error('성적 구독 설정 실패:', error);
    if (onError) onError(error);
    return () => {};
  }
};

/**
 * 학생의 성적 기록 실시간 동기화
 * @param {string} studentId - 학생 아이디
 * @param {Function} onUpdate - 데이터 업데이트 콜백
 * @param {Function} onError - 에러 처리 콜백
 * @returns {Function} - unsubscribe 함수
 */
export const subscribeToRecordsByStudent = (studentId, onUpdate, onError) => {
  try {
    const recordsQuery = query(
      collection(db, 'records'),
      where('studentId', '==', studentId)
    );
    
    return onSnapshot(
      recordsQuery,
      (snapshot) => {
        const recordsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        onUpdate(recordsList);
      },
      (error) => {
        console.error('학생 성적 동기화 실패:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error('학생 성적 구독 설정 실패:', error);
    if (onError) onError(error);
    return () => {};
  }
};

export default {
  subscribeToStudents,
  subscribeToStudentInfo,
  subscribeToRecordsByTeacher,
  subscribeToRecordsByStudent
};