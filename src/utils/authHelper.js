// 도메인 설정
const DOMAIN = '@my-academy.com';

/**
 * 영어 아이디를 이메일로 변환
 * @param {string} id - 영어 아이디 (예: 'teacher')
 * @returns {string} - 완전한 이메일 (예: 'teacher@my-academy.com')
 */
export const toEmail = (id) => {
  if (!id) return '';
  // 이미 @가 포함되어 있으면 그대로 반환
  if (id.includes('@')) return id;
  return `${id.trim().toLowerCase()}${DOMAIN}`;
};

/**
 * 이메일에서 아이디만 추출
 * @param {string} email - 이메일 (예: 'teacher@my-academy.com')
 * @returns {string} - 영어 아이디 (예: 'teacher')
 */
export const toId = (email) => {
  if (!email) return '';
  return email.split('@')[0];
};

/**
 * 아이디 유효성 검사
 * @param {string} id - 영어 아이디
 * @returns {boolean} - 유효 여부
 */
export const isValidId = (id) => {
  // 영어 소문자, 숫자만 허용 (3-20자)
  const regex = /^[a-z0-9]{3,20}$/;
  return regex.test(id);
};

export default { toEmail, toId, isValidId };