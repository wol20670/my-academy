import React, { useState } from 'react';
import { FileText, Calendar, Users, CheckCircle, Clock, MessageSquare, Trash2, Download } from 'lucide-react';
import { deleteAssignment } from '../../services/assignmentService';
import { deleteFile } from '../../services/storageService';
import FeedbackModal from './FeedbackModal';

const AssignmentListTeacher = ({ assignments, students }) => {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const handleDelete = async (assignment) => {
    if (!window.confirm('정말 이 숙제를 삭제하시겠습니까?')) return;

    try {
      // Storage에서 파일 삭제
      if (assignment.file?.path) {
        await deleteFile(assignment.file.path);
      }

      // 제출물 파일들도 삭제
      if (assignment.submissions) {
        for (const submission of assignment.submissions) {
          if (submission.file?.path) {
            await deleteFile(submission.file.path);
          }
        }
      }

      // Firestore에서 삭제
      await deleteAssignment(assignment.id);
      alert('숙제가 삭제되었습니다.');
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다: ' + error.message);
    }
  };

  const handleOpenFeedback = (assignment, submission) => {
    setSelectedAssignment(assignment);
    setSelectedSubmission(submission);
    setShowFeedbackModal(true);
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.studentId === studentId);
    return student ? student.name : studentId;
  };

  const getSubmissionStatus = (assignment) => {
    const submissions = assignment.submissions || [];
    
    // 전체 공지인 경우
    if (assignment.targetStudentId === 'all') {
      return {
        total: students.length,
        submitted: submissions.length,
        pending: students.length - submissions.length
      };
    }
    
    // 특정 학생인 경우
    return {
      total: 1,
      submitted: submissions.length,
      pending: 1 - submissions.length
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">등록된 숙제</h3>
        <span className="text-sm text-gray-600">{assignments.length}개</span>
      </div>

      {assignments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">등록된 숙제가 없습니다.</p>
      ) : (
        assignments.map(assignment => {
          const status = getSubmissionStatus(assignment);
          const isExpanded = selectedAssignment?.id === assignment.id;

          return (
            <div key={assignment.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              {/* 숙제 헤더 */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-semibold text-gray-800">{assignment.title}</h4>
                  </div>
                  
                  {assignment.description && (
                    <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      마감: {assignment.dueDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      대상: {assignment.targetStudentId === 'all' ? '전체' : getStudentName(assignment.targetStudentId)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(assignment)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* 첨부파일 */}
              {assignment.file && (
                <div className="mb-3">
                  <a
                    href={assignment.file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    <Download className="w-4 h-4" />
                    {assignment.file.filename}
                  </a>
                </div>
              )}

              {/* 제출 현황 */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">제출: {status.submitted}/{status.total}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-700">미제출: {status.pending}</span>
                </div>
              </div>

              {/* 제출 목록 보기 버튼 */}
              <button
                onClick={() => setSelectedAssignment(isExpanded ? null : assignment)}
                className="w-full py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                {isExpanded ? '제출 목록 숨기기' : '제출 목록 보기'}
              </button>

              {/* 제출 목록 (확장 시) */}
              {isExpanded && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  {assignment.submissions && assignment.submissions.length > 0 ? (
                    assignment.submissions.map((submission, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-800">
                              {getStudentName(submission.studentId)}
                            </p>
                            <p className="text-xs text-gray-500">
                              제출일: {new Date(submission.submittedAt).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                          <button
                            onClick={() => handleOpenFeedback(assignment, submission)}
                            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                          >
                            <MessageSquare className="w-4 h-4" />
                            피드백
                          </button>
                        </div>

                        {submission.file && (
                          <a
                            href={submission.file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mb-2"
                          >
                            <Download className="w-3 h-3" />
                            제출 파일 보기
                          </a>
                        )}

                        {submission.feedback && (
                          <div className="mt-2 p-2 bg-white rounded border">
                            <p className="text-xs text-gray-600 mb-1">선생님 피드백:</p>
                            <p className="text-sm text-gray-800">{submission.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">아직 제출한 학생이 없습니다.</p>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* 피드백 모달 */}
      {showFeedbackModal && (
        <FeedbackModal
          assignment={selectedAssignment}
          submission={selectedSubmission}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedAssignment(null);
            setSelectedSubmission(null);
          }}
        />
      )}
    </div>
  );
};

export default AssignmentListTeacher;