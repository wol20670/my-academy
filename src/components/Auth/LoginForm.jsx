import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { toEmail } from '../../utils/authHelper';
import { GraduationCap, LogIn, User, Lock } from 'lucide-react';

const LoginForm = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const email = toEmail(userId);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('로그인 오류:', err);
      if (err.code === 'auth/user-not-found') {
        setError('존재하지 않는 계정입니다.');
      } else if (err.code === 'auth/wrong-password') {
        setError('비밀번호가 올바르지 않습니다.');
      } else if (err.code === 'auth/invalid-email') {
        setError('잘못된 형식의 ID입니다.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('ID 또는 비밀번호를 확인해주세요.');
      } else {
        setError('로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 & 타이틀 */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full shadow-lg mb-4">
            <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            학업 관리 시스템
          </h1>
          <p className="text-sm sm:text-base text-white/90">
            학생과 선생님을 위한 올인원 플랫폼
          </p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">
            로그인
          </h2>

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            {/* 아이디 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                아이디
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="영어 아이디를 입력하세요"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                예: minsu, teacher1 등
              </p>
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 sm:py-4 rounded-lg font-medium text-base sm:text-lg transition-all ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-lg hover:shadow-xl'
              } text-white`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  로그인 중...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  로그인
                </>
              )}
            </button>
          </form>

          {/* 안내 메시지 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 font-medium mb-2">
                💡 계정이 없으신가요?
              </p>
              <p className="text-xs text-blue-700">
                선생님께 아이디 발급을 요청하세요.
              </p>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <p className="text-center text-white/80 text-xs sm:text-sm mt-6">
          © 2024 학업 관리 시스템. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
