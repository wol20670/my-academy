import React, { useState } from 'react';
import { BookOpen, User, GraduationCap } from 'lucide-react';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { toEmail, isValidId } from '../../utils/authHelper';

const LoginForm = () => {
  const [loginForm, setLoginForm] = useState({ id: '', password: '' });
  const [selectedRole, setSelectedRole] = useState('teacher');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      setError('');

      if (!isValidId(loginForm.id)) {
        setError('아이디는 영어 소문자와 숫자만 사용 가능합니다 (3-20자)');
        return;
      }

      const email = toEmail(loginForm.id);
      
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email, 
        loginForm.password
      );
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        id: loginForm.id,
        email: email,
        role: selectedRole,
        students: [],
        createdAt: new Date().toISOString()
      });

      alert(`${selectedRole === 'teacher' ? '선생님' : '학생'} 계정 회원가입 완료!`);
      setIsRegistering(false);
      setLoginForm({ id: '', password: '' });
      setSelectedRole('teacher');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('이미 사용 중인 아이디입니다.');
      } else if (err.code === 'auth/weak-password') {
        setError('비밀번호는 최소 6자 이상이어야 합니다.');
      } else {
        setError('회원가입 실패: ' + err.message);
      }
    }
  };

  const handleLogin = async () => {
    try {
      setError('');
      
      if (!isValidId(loginForm.id)) {
        setError('올바른 아이디 형식이 아닙니다.');
        return;
      }

      const email = toEmail(loginForm.id);
      await signInWithEmailAndPassword(auth, email, loginForm.password);
      setLoginForm({ id: '', password: '' });
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setError('로그인 실패: ' + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <BookOpen className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">학생 학업 관리</h1>
          <p className="text-gray-600 mt-2">학생들의 학업 성취를 체계적으로 관리하세요</p>
        </div>
        
        <div className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">계정 유형</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedRole('teacher')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedRole === 'teacher'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">선생님</span>
                </button>
                <button
                  onClick={() => setSelectedRole('student')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedRole === 'student'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                  <span className="font-medium">학생</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
            <div className="relative">
              <input
                type="text"
                value={loginForm.id}
                onChange={(e) => setLoginForm({...loginForm, id: e.target.value.toLowerCase()})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-40"
                placeholder="teacher"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                @my-academy.com
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">영어 소문자와 숫자만 사용 (3-20자)</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  isRegistering ? handleRegister() : handleLogin();
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="최소 6자 이상"
            />
          </div>
          
          {error && <p className="text-red-600 text-sm">{error}</p>}
          
          <button
            onClick={isRegistering ? handleRegister : handleLogin}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            {isRegistering ? '회원가입' : '로그인'}
          </button>
          
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setSelectedRole('teacher');
            }}
            className="w-full text-indigo-600 hover:text-indigo-700 text-sm"
          >
            {isRegistering ? '로그인으로 돌아가기' : '회원가입하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;