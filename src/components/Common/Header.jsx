import React from 'react';
import { LogOut, GraduationCap } from 'lucide-react';

const Header = ({ userEmail, userRole, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-indigo-600 p-1.5 sm:p-2 rounded-lg">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-gray-800">
                학업 관리 시스템
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-500">
                {userRole === 'teacher' ? '선생님' : '학생'} 모드
              </p>
            </div>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs sm:text-sm text-gray-600">{userEmail}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors active:bg-red-100"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">로그아웃</span>
              <span className="sm:hidden">나가기</span>
            </button>
          </div>
        </div>
        
        {/* Mobile: User Email */}
        <div className="sm:hidden mt-2 pt-2 border-t">
          <p className="text-xs text-gray-600 truncate">{userEmail}</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
