import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * 선생님의 학생 목록 가져오기
 */
export const fetchStudentsByTeacher = async (teacherEmail) => {
  try {
    const q = query(
      collection(db, 'students'),
      where('teacherId', '==', teacherEmail)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('학생 목록 가져오기 실패:', error);
    return [];
  }
};

/**
 * 특정 학생 정보 가져오기 (학생 로그인용)
 */
export const fetchStudentById = async (studentId) => {
  try {
    const q = query(
      collection(db, 'students'),
      where('studentId', '==', studentId)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    };
  } catch (error) {
    console.error('학생 정보 가져오기 실패:', error);
    return null;
  }
};

/**
 * 선생님의 모든 성적 기록 가져오기
 */
export const fetchRecordsByTeacher = async (teacherEmail) => {
  try {
    const q = query(
      collection(db, 'records'),
      where('teacherId', '==', teacherEmail)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('성적 기록 가져오기 실패:', error);
    return [];
  }
};

/**
 * 특정 학생의 성적 기록 가져오기
 */
export const fetchRecordsByStudent = async (studentId) => {
  try {
    const q = query(
      collection(db, 'records'),
      where('studentId', '==', studentId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('학생 성적 가져오기 실패:', error);
    return [];
  }
};

/**
 * 학생 추가
 */
export const addStudent = async (studentData, teacherEmail) => {
  try {
    const docRef = await addDoc(collection(db, 'students'), {
      ...studentData,
      teacherId: teacherEmail,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...studentData, teacherId: teacherEmail };
  } catch (error) {
    console.error('학생 추가 실패:', error);
    throw error;
  }
};

/**
 * 학생 삭제
 */
export const deleteStudent = async (studentDocId) => {
  try {
    await deleteDoc(doc(db, 'students', studentDocId));
  } catch (error) {
    console.error('학생 삭제 실패:', error);
    throw error;
  }
};

/**
 * 성적 기록 추가
 */
export const addRecord = async (recordData, studentId, teacherEmail) => {
  try {
    const docRef = await addDoc(collection(db, 'records'), {
      studentId,
      teacherId: teacherEmail,
      subject: recordData.subject,
      score: parseFloat(recordData.score),
      date: recordData.date,
      comment: recordData.comment || '',
      createdAt: new Date().toISOString()
    });
    return {
      id: docRef.id,
      studentId,
      teacherId: teacherEmail,
      ...recordData
    };
  } catch (error) {
    console.error('성적 추가 실패:', error);
    throw error;
  }
};

/**
 * 성적 기록 수정
 */
export const updateRecord = async (recordId, recordData) => {
  try {
    const recordRef = doc(db, 'records', recordId);
    await updateDoc(recordRef, {
      subject: recordData.subject,
      score: parseFloat(recordData.score),
      date: recordData.date,
      comment: recordData.comment || '',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('성적 수정 실패:', error);
    throw error;
  }
};

/**
 * 성적 기록 삭제
 */
export const deleteRecord = async (recordId) => {
  try {
    await deleteDoc(doc(db, 'records', recordId));
  } catch (error) {
    console.error('성적 삭제 실패:', error);
    throw error;
  }
};

/**
 * 성적 데이터를 학생별로 그룹화
 */
export const groupRecordsByStudent = (students, records) => {
  return students.map(student => ({
    ...student,
    records: records.filter(r => r.studentId === student.studentId)
  }));
};

export default {
  fetchStudentsByTeacher,
  fetchStudentById,
  fetchRecordsByTeacher,
  fetchRecordsByStudent,
  addStudent,
  deleteStudent,
  addRecord,
  updateRecord,
  deleteRecord,
  groupRecordsByStudent
};