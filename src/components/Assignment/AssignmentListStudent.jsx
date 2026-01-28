import React, { useState } from 'react';
import { FileText, Calendar, Upload, CheckCircle, AlertCircle, Download, MessageSquare } from 'lucide-react';
import { uploadSubmissionFile, validateFileSize, validateFileType } from '../../services/storageService';
import { addSubmission } from '../../services/assignmentService';

const AssignmentListStudent = ({ assignments, studentId }) => {
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [error, setError] = useState('');

  const handleFileSelect = (assignmentId, file) => {
    setError('');

    if (!validateFileType(file)) {
      setError('PDF 또는 이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (!validateFileSize(file)) {
      setError('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setSelectedFiles({
      ...selectedFiles,
      [assignmentId]: file
    });
  };

  const handleSubmit = async (assignment) => {
    const file = selectedFiles[assignment.id];
    
    if (!file) {
      setError('제출할 파일을 선택해주세요.');
      return;
    }

    try {
      setError('');
      setUploadingId(assignment.id);

      // Storage에 파일 업로드
      const fileData = await uploadSubmissionFile(file, assignment.id, studentId);

      // Firestore에 제출 정보 저장
      await addSubmission(assignment.id, {
        studentId,
        file: fileData
      });

      alert('숙제가 성공적으로 제출되었습니다!');
      
      // 선택된 파일 초기화
      setSelectedFiles({
        ...selectedFiles,
        [assignment.id]: null
      });
    } catch (err) {
      console.error('제출 실패:', err);
      setError('제출에 실패했습니다: ' + err.message);
    } finally {
      setUploadingId(null);
    }
  };

  const getMySubmission = (assignment) => {
    if (!assignment.submissions) return null;
    return assignment.submissions.find(s => s.studentId === studentId);
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">내 숙제</h3>
        <span className="text-sm text-gray-600">{assignments.length}개</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {assignments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">등록된 숙제가 없습니다.</p>
      ) : (
        assignments.map(assignment => {
          const mySubmission = getMySubmission(assignment);
          const overdue = isOverdue(assignment.dueDate);
          const isUploading = uploadingId === assignment.id;

          return (
            <div key={assignment.id} className={`bg-white border rounded-lg p-4 ${overdue && !mySubmission ? 'border-red-300' : ''}`}>
              {/* 숙제 헤더 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-semibold text-gray-800">{assignment.title}</h4>
                    {mySubmission ? (
                      <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        <CheckCircle className="w-3 h-3" />
                        제출 완료
                      </span>
                    ) : overdue ? (
                      <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                        <AlertCircle className="w-3 h-3" />
                        마감
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                        <AlertCircle className="w-3 h-3" />
                        미제출
                      </span>
                    )}
                  </div>

                  {assignment.description && (
                    <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                  )}

                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    마감: {assignment.dueDate}
                  </div>
                </div>
              </div>

              {/* 숙제 첨부파일 */}
              {assignment.file && (
                <div className="mb-3">
                  <a
                    href={assignment.file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    <Download className="w-4 h-4" />
                    숙제 파일 다운로드
                  </a>
                </div>
              )}

              {/* 제출 영역 */}
              {mySubmission ? (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-800 mb-2">
                    제출일: {new Date(mySubmission.submittedAt).toLocaleDateString('ko-KR')}
                  </p>
                  
                  {mySubmission.file && (
                    <a
                      href={mySubmission.file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mb-2"
                    >
                      <Download className="w-3 h-3" />
                      내 제출 파일 보기
                    </a>
                  )}

                  {mySubmission.feedback ? (
                    <div className="mt-2 p-3 bg-white rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                        <p className="text-sm font-medium text-gray-800">선생님 피드백</p>
                      </div>
                      <p className="text-sm text-gray-700">{mySubmission.feedback}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(mySubmission.feedbackAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2">피드백 대기 중...</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* 파일 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      제출 파일
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 transition-colors">
                        <Upload className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {selectedFiles[assignment.id] 
                            ? selectedFiles[assignment.id].name 
                            : 'PDF 또는 이미지 선택'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => handleFileSelect(assignment.id, e.target.files[0])}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, JPG, PNG, GIF 파일만 가능 (최대 5MB)
                    </p>
                  </div>

                  {/* 제출 버튼 */}
                  <button
                    onClick={() => handleSubmit(assignment)}
                    disabled={isUploading || !selectedFiles[assignment.id]}
                    className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                      isUploading || !selectedFiles[assignment.id]
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        제출 중...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        숙제 제출
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default AssignmentListStudent;