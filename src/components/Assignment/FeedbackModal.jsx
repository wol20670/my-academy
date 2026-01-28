import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { addFeedback } from '../../services/assignmentService';

const FeedbackModal = ({ assignment, submission, onClose }) => {
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    try {
      setError('');
      setSaving(true);

      if (!feedback.trim()) {
        setError('피드백 내용을 입력해주세요.');
        setSaving(false);
        return;
      }

      await addFeedback(assignment.id, submission.studentId, feedback);
      alert('피드백이 저장되었습니다!');
      onClose();
    } catch (err) {
      console.error('피드백 저장 실패:', err);
      setError('피드백 저장에 실패했습니다: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-800">피드백 작성</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-4">
          {/* 숙제 정보 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">{assignment.title}</h4>
            <p className="text-sm text-gray-600">
              학생: {submission.studentId}
            </p>
            <p className="text-sm text-gray-600">
              제출일: {new Date(submission.submittedAt).toLocaleDateString('ko-KR')}
            </p>
          </div>

          {/* 제출 파일 */}
          {submission.file && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제출 파일
              </label>
              <a
                href={submission.file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                파일 보기 →
              </a>
            </div>
          )}

          {/* 피드백 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              피드백 *
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows="6"
              placeholder="학생에게 전달할 피드백을 작성하세요..."
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              saving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                저장 중...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                피드백 저장
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;