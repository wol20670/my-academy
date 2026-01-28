import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * 파일 이름 규칙: {assignmentId}_{studentId}_{timestamp}_{originalName}
 * 예: assign123_minsu_1234567890_homework.pdf
 */

/**
 * 숙제 파일 업로드 (선생님용)
 * @param {File} file - 업로드할 파일
 * @param {string} assignmentId - 숙제 ID
 * @returns {Promise<{url: string, path: string}>}
 */
export const uploadAssignmentFile = async (file, assignmentId) => {
  try {
    const timestamp = Date.now();
    const filename = `${assignmentId}_teacher_${timestamp}_${file.name}`;
    const storageRef = ref(storage, `assignments/${filename}`);
    
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    return {
      url,
      path: `assignments/${filename}`,
      filename: file.name,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('숙제 파일 업로드 실패:', error);
    throw error;
  }
};

/**
 * 학생 제출물 업로드
 * @param {File} file - 업로드할 파일
 * @param {string} assignmentId - 숙제 ID
 * @param {string} studentId - 학생 ID
 * @returns {Promise<{url: string, path: string}>}
 */
export const uploadSubmissionFile = async (file, assignmentId, studentId) => {
  try {
    const timestamp = Date.now();
    const filename = `${assignmentId}_${studentId}_${timestamp}_${file.name}`;
    const storageRef = ref(storage, `submissions/${filename}`);
    
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    return {
      url,
      path: `submissions/${filename}`,
      filename: file.name,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('제출물 업로드 실패:', error);
    throw error;
  }
};

/**
 * 파일 삭제
 * @param {string} filePath - 삭제할 파일 경로
 */
export const deleteFile = async (filePath) => {
  try {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('파일 삭제 실패:', error);
    throw error;
  }
};

/**
 * 파일 크기 검증 (5MB 제한)
 * @param {File} file - 검증할 파일
 * @returns {boolean}
 */
export const validateFileSize = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  return file.size <= maxSize;
};

/**
 * 파일 타입 검증 (PDF, 이미지만 허용)
 * @param {File} file - 검증할 파일
 * @returns {boolean}
 */
export const validateFileType = (file) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif'
  ];
  return allowedTypes.includes(file.type);
};

export default {
  uploadAssignmentFile,
  uploadSubmissionFile,
  deleteFile,
  validateFileSize,
  validateFileType
};