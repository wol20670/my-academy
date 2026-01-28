import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * 숙제 추가
 * @param {Object} assignmentData - 숙제 데이터
 * @param {string} teacherEmail - 선생님 이메일
 * @returns {Promise<Object>}
 */
export const addAssignment = async (assignmentData, teacherEmail) => {
  try {
    const docRef = await addDoc(collection(db, 'assignments'), {
      ...assignmentData,
      teacherId: teacherEmail,
      createdAt: new Date().toISOString(),
      submissions: [] // 제출 현황
    });
    
    return { id: docRef.id, ...assignmentData, teacherId: teacherEmail };
  } catch (error) {
    console.error('숙제 추가 실패:', error);
    throw error;
  }
};

/**
 * 선생님의 숙제 목록 실시간 구독
 * @param {string} teacherEmail - 선생님 이메일
 * @param {Function} onUpdate - 업데이트 콜백
 * @param {Function} onError - 에러 콜백
 * @returns {Function} - unsubscribe 함수
 */
export const subscribeToAssignmentsByTeacher = (teacherEmail, onUpdate, onError) => {
  try {
    const q = query(
      collection(db, 'assignments'),
      where('teacherId', '==', teacherEmail),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(
      q,
      (snapshot) => {
        const assignments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        onUpdate(assignments);
      },
      (error) => {
        console.error('숙제 동기화 실패:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error('숙제 구독 설정 실패:', error);
    if (onError) onError(error);
    return () => {};
  }
};

/**
 * 학생의 숙제 목록 실시간 구독 (전체 공지 + 본인 타겟)
 * @param {string} studentId - 학생 ID
 * @param {Function} onUpdate - 업데이트 콜백
 * @param {Function} onError - 에러 콜백
 * @returns {Function} - unsubscribe 함수
 */
export const subscribeToAssignmentsByStudent = (studentId, onUpdate, onError) => {
  try {
    // 전체 공지 또는 본인 타겟인 숙제
    const q = query(
      collection(db, 'assignments'),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(
      q,
      (snapshot) => {
        const allAssignments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // 필터링: targetStudentId가 'all' 또는 본인 ID인 것만
        const filteredAssignments = allAssignments.filter(assignment => 
          assignment.targetStudentId === 'all' || 
          assignment.targetStudentId === studentId
        );
        
        onUpdate(filteredAssignments);
      },
      (error) => {
        console.error('학생 숙제 동기화 실패:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error('학생 숙제 구독 설정 실패:', error);
    if (onError) onError(error);
    return () => {};
  }
};

/**
 * 제출물 추가
 * @param {string} assignmentId - 숙제 ID
 * @param {Object} submissionData - 제출 데이터
 * @returns {Promise}
 */
export const addSubmission = async (assignmentId, submissionData) => {
  try {
    const assignmentRef = doc(db, 'assignments', assignmentId);
    const assignmentDoc = await getDocs(query(collection(db, 'assignments'), where('__name__', '==', assignmentId)));
    
    if (assignmentDoc.empty) {
      throw new Error('숙제를 찾을 수 없습니다.');
    }
    
    const currentData = assignmentDoc.docs[0].data();
    const submissions = currentData.submissions || [];
    
    // 기존 제출물이 있으면 덮어쓰기
    const existingIndex = submissions.findIndex(s => s.studentId === submissionData.studentId);
    
    if (existingIndex >= 0) {
      submissions[existingIndex] = {
        ...submissions[existingIndex],
        ...submissionData,
        submittedAt: new Date().toISOString()
      };
    } else {
      submissions.push({
        ...submissionData,
        submittedAt: new Date().toISOString(),
        feedback: null
      });
    }
    
    await updateDoc(assignmentRef, { submissions });
  } catch (error) {
    console.error('제출물 추가 실패:', error);
    throw error;
  }
};

/**
 * 피드백 추가
 * @param {string} assignmentId - 숙제 ID
 * @param {string} studentId - 학생 ID
 * @param {string} feedback - 피드백 내용
 * @returns {Promise}
 */
export const addFeedback = async (assignmentId, studentId, feedback) => {
  try {
    const assignmentRef = doc(db, 'assignments', assignmentId);
    const assignmentDoc = await getDocs(query(collection(db, 'assignments'), where('__name__', '==', assignmentId)));
    
    if (assignmentDoc.empty) {
      throw new Error('숙제를 찾을 수 없습니다.');
    }
    
    const currentData = assignmentDoc.docs[0].data();
    const submissions = currentData.submissions || [];
    
    const submissionIndex = submissions.findIndex(s => s.studentId === studentId);
    
    if (submissionIndex >= 0) {
      submissions[submissionIndex].feedback = feedback;
      submissions[submissionIndex].feedbackAt = new Date().toISOString();
      
      await updateDoc(assignmentRef, { submissions });
    } else {
      throw new Error('제출물을 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error('피드백 추가 실패:', error);
    throw error;
  }
};

/**
 * 숙제 삭제
 * @param {string} assignmentId - 숙제 ID
 * @returns {Promise}
 */
export const deleteAssignment = async (assignmentId) => {
  try {
    await deleteDoc(doc(db, 'assignments', assignmentId));
  } catch (error) {
    console.error('숙제 삭제 실패:', error);
    throw error;
  }
};

/**
 * 숙제 수정
 * @param {string} assignmentId - 숙제 ID
 * @param {Object} updateData - 수정할 데이터
 * @returns {Promise}
 */
export const updateAssignment = async (assignmentId, updateData) => {
  try {
    const assignmentRef = doc(db, 'assignments', assignmentId);
    await updateDoc(assignmentRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('숙제 수정 실패:', error);
    throw error;
  }
};

export default {
  addAssignment,
  subscribeToAssignmentsByTeacher,
  subscribeToAssignmentsByStudent,
  addSubmission,
  addFeedback,
  deleteAssignment,
  updateAssignment
};