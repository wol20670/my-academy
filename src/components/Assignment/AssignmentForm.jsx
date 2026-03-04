import React, { useState } from 'react';
import { Upload, PlusCircle, X } from 'lucide-react';
import { uploadAssignmentFile, validateFileSize, validateFileType } from '../../services/storageService';
import { addAssignment } from '../../services/assignmentService';

const AssignmentForm = ({ teacherEmail, students, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    targetStudentId: 'all'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');

    if (!validateFileType(file)) {
      setError('PDF 또는 이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (!validateFileSize(file)) {
      setError('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setUploading(true);

      if (!formData.title.trim()) {
        setError('숙제 제목을 입력해주세요.');
        setUploading(false);
        return;
      }

      if (!formData.dueDate) {
        setError('마감일을 선택해주세요.');
        setUploading(false);
        return;
      }

      let fileData = null;

      // 파일이 선택된 경우 업로드
      if (selectedFile) {
        const tempId = `temp_${Date.now()}`;
        fileData = await uploadAssignmentFile(selectedFile, tempId);
      }

      // Firestore에 숙제 데이터 저장
      const assignmentData = {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        targetStudentId: formData.targetStudentId,
        file: fileData,
        submissions: []
      };

      await addAssignment(assignmentData, teacherEmail);

      // 폼 초기화
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        targetStudentId: 'all'
      });
      setSelectedFile(null);
      setIsExpanded(false);
      
      if (onSuccess) onSuccess();
      alert('숙제가 성공적으로 등록되었습니다!');
    } catch (err) {
      console.error('숙제 등록 실패:', err);
      setError('숙제 등록에 실패했습니다: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-indigo-50 rounded-lg p-3 sm:p-6 border border-indigo-100">
      {/* 헤더 - 모바일에서 클릭하여 펼치기/접기 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between sm:pointer-events-none"
      >
        <h3 className="font-semibold text-sm sm:text-base text-gray-800 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
          새 숙제 등록
        </h3>
        <span className="sm:hidden text-gray-500">
          {isExpanded ? '닫기 ▲' : '펼치기 ▼'}
        </span>
      </button>

      {/* 폼 내용 - 모바일에서는 펼쳤을 때만 보임 */}
      <div className={`${isExpanded ? 'block' : 'hidden sm:block'} space-y-3 sm:space-y-4 mt-3 sm:mt-4`}>
        {/* 숙제 제목 */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            숙제 제목 *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="예: 수학 문제집 1~10페이지"
          />
        </div>

        {/* 숙제 설명 */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            설명
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows="3"
            placeholder="숙제에 대한 상세 설명을 입력하세요"
          />
        </div>

        {/* 마감일 & 대상 학생 - 모바일에서는 세로로 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* 마감일 */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              마감일 *
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* 대상 학생 선택 */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              대상 학생
            </label>
            <select
              value={formData.targetStudentId}
              onChange={(e) => setFormData({...formData, targetStudentId: e.target.value})}
              className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">전체 학생</option>
              {students.map(student => (
                <option key={student.id} value={student.studentId}>
                  {student.name} ({student.studentId})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 파일 업로드 */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            첨부 파일 (선택사항)
          </label>
          <div className="flex items-center gap-2">
            <label className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 transition-colors active:bg-gray-50">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <span className="text-xs sm:text-sm text-gray-600 truncate">
                {selectedFile ? selectedFile.name : 'PDF 또는 이미지 선택'}
              </span>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            {selectedFile && (
              <button
                onClick={() => setSelectedFile(null)}
                className="p-2 text-red-500 hover:bg-red-50 active:bg-red-100 rounded-lg"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
            PDF, JPG, PNG, GIF 파일만 가능 (최대 5MB)
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        {/* 등록 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={uploading}
          className={`w-full py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base font-medium ${
            uploading
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white'
          }`}
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              업로드 중...
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              숙제 등록
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AssignmentForm;
