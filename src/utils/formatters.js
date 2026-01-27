/**
 * 날짜를 짧은 형식으로 변환
 * @param {string} dateStr - YYYY-MM-DD 형식
 * @returns {string} - YY/MM/DD 형식
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export default { formatDate };