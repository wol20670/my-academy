# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# 학생 학업 관리 시스템

학생들의 학업 성취를 체계적으로 관리하는 웹 애플리케이션입니다.

## 🚀 시작하기

### 1. 프로젝트 클론

```bash
git clone [your-repository-url]
cd student-management
```

### 2. 의존성 설치

```bash
npm install
```

### 3. Firebase 설정

#### 3.1 Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 후 생성

#### 3.2 Firebase 설정 값 가져오기

1. Firebase Console에서 프로젝트 선택
2. 프로젝트 설정 (톱니바퀴 아이콘) → "프로젝트 설정"
3. "내 앱" 섹션에서 웹 앱 추가 (`</>` 아이콘)
4. 앱 닉네임 입력 후 "앱 등록"
5. **Firebase SDK 구성** 정보 복사

#### 3.3 Authentication 활성화

1. 왼쪽 메뉴에서 **Authentication** 클릭
2. "시작하기" 버튼 클릭
3. "이메일/비밀번호" 활성화

#### 3.4 Firestore Database 생성

1. 왼쪽 메뉴에서 **Firestore Database** 클릭
2. "데이터베이스 만들기" 클릭
3. **테스트 모드로 시작** 선택 (나중에 보안 규칙 설정 가능)
4. 위치 선택 후 "완료"

### 4. 환경 변수 설정

#### 4.1 .env 파일 생성

프로젝트 **루트 폴더**에 `.env` 파일을 만드세요:

```bash
# 프로젝트 루트에서
touch .env
```

#### 4.2 Firebase 설정 값 입력

`.env` 파일을 열고 Firebase Console에서 복사한 값을 붙여넣으세요:

```env
VITE_FIREBASE_API_KEY=your-actual-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

**⚠️ 주의사항:**
- `.env` 파일은 절대 깃허브에 올리면 안 됩니다! (`.gitignore`에 이미 추가되어 있음)
- 모든 환경 변수는 `VITE_` 접두사로 시작해야 합니다.
- 값에 따옴표(`""`)는 넣지 마세요.

### 5. 앱 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 📁 프로젝트 구조

```
src/
├── firebase.js              # Firebase 설정 (환경 변수 사용)
├── App.js                   # 메인 앱 컴포넌트
├── components/
│   ├── Auth/
│   │   └── LoginForm.js
│   ├── Student/
│   │   ├── StudentList.js
│   │   └── StudentForm.js
│   ├── Record/
│   │   ├── RecordList.js
│   │   └── RecordForm.js
│   └── Analysis/
│       ├── SubjectBarChartAnalysis.jsx
│       └── BarChartAnalysis.js
└── utils/
    └── calculations.js
```

## 🔒 보안 설정 (선택사항)

Firestore 보안 규칙을 설정하여 사용자별 데이터 접근을 제한할 수 있습니다.

Firebase Console → Firestore Database → 규칙 탭:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🛠️ 기술 스택

- React 18
- Firebase (Authentication, Firestore)
- Recharts (데이터 시각화)
- Tailwind CSS
- Lucide React (아이콘)
- Vite

## ❓ 문제 해결

### 환경 변수가 인식되지 않을 때

1. `.env` 파일이 **프로젝트 루트 폴더**에 있는지 확인
2. 모든 변수명이 `VITE_`로 시작하는지 확인
3. 개발 서버를 재시작 (`Ctrl+C` 후 `npm run dev`)

### Firebase 연결 오류

1. Firebase Console에서 Authentication과 Firestore가 활성화되어 있는지 확인
2. `.env` 파일의 값이 정확한지 확인 (공백, 따옴표 없이)
3. 브라우저 콘솔에서 오류 메시지 확인

## 📝 라이선스

MIT License

## 👥 기여

이슈나 PR을 자유롭게 제출해주세요!