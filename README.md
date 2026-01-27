# Firebase 데이터 구조 및 보안 규칙 가이드

## 📊 새로운 데이터 구조

### Firestore 컬렉션 구조

```
Firestore Database
│
├── users/                              # 사용자 정보
│   └── {userId} (Auto-generated)
│       ├── id: "teacher"              # 영어 아이디
│       ├── email: "teacher@my-academy.com"
│       ├── role: "teacher" | "student"
│       └── createdAt: timestamp
│
├── students/                           # 학생 정보 (독립 컬렉션)
│   └── {studentDocId} (Auto-generated)
│       ├── studentId: "minsu"         # 영어 아이디 (매칭 키)
│       ├── name: "김민수"
│       ├── grade: "3학년 2반"
│       ├── memo: "수학 특기"
│       ├── email: "minsu@my-academy.com"
│       ├── teacherId: "teacher@my-academy.com"  # 등록한 선생님
│       └── createdAt: timestamp
│
└── records/                            # 성적 기록 (독립 컬렉션)
    └── {recordId} (Auto-generated)
        ├── studentId: "minsu"         # 학생 아이디 (매칭 키)
        ├── teacherId: "teacher@my-academy.com"  # 등록한 선생님
        ├── subject: "수학"
        ├── score: 95
        ├── date: "2024-01-27"
        ├── comment: "잘했어요"
        └── createdAt: timestamp
```

---

## 🔐 보안 규칙 설정

### Firebase Console에서 설정하기

1. Firebase Console → Firestore Database → 규칙 탭
2. 아래 규칙을 붙여넣고 "게시" 클릭

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 사용자 컬렉션
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;
    }
    
    // 학생 컬렉션
    match /students/{studentId} {
      allow read: if request.auth != null && (
        resource.data.teacherId == request.auth.token.email ||
        resource.data.studentId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.id
      );
      
      allow create: if request.auth != null && 
        request.resource.data.teacherId == request.auth.token.email &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
      
      allow update, delete: if request.auth != null && 
        resource.data.teacherId == request.auth.token.email &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
    
    // 성적 기록 컬렉션
    match /records/{recordId} {
      allow read: if request.auth != null && (
        resource.data.teacherId == request.auth.token.email ||
        resource.data.studentId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.id
      );
      
      allow create, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🎯 주요 변경 사항

### Before (이전 구조)
```javascript
users/
└── {userId}/
    └── students: [array]  // 학생 데이터가 배열로 저장
        └── records: [array]  // 성적이 중첩 배열로 저장
```

**문제점:**
- 데이터 중복 및 비효율적인 쿼리
- 보안 규칙 설정 어려움
- 확장성 부족

### After (현재 구조)
```javascript
users/ - 사용자 정보만
students/ - 학생 정보 (독립)
records/ - 성적 기록 (독립)
```

**장점:**
- ✅ 데이터 정규화 및 효율적인 쿼리
- ✅ 세밀한 보안 규칙 적용
- ✅ 확장성 우수
- ✅ 여러 선생님이 같은 학생 데이터 공유 가능 (미래 확장)

---

## 🔄 데이터 흐름

### 선생님 로그인 시

1. **사용자 정보 확인**
   ```javascript
   users/{teacherId} → role: "teacher"
   ```

2. **학생 목록 조회**
   ```javascript
   students 컬렉션에서
   where teacherId == "teacher@my-academy.com"
   ```

3. **성적 기록 조회**
   ```javascript
   records 컬렉션에서
   where teacherId == "teacher@my-academy.com"
   ```

4. **데이터 그룹화**
   ```javascript
   학생별로 성적 기록을 그룹화하여 표시
   ```

### 학생 로그인 시

1. **사용자 정보 확인**
   ```javascript
   users/{studentUserId} → id: "minsu", role: "student"
   ```

2. **자신의 학생 정보 조회**
   ```javascript
   students 컬렉션에서
   where studentId == "minsu"
   ```

3. **자신의 성적 조회**
   ```javascript
   records 컬렉션에서
   where studentId == "minsu"
   ```

---

## 📝 보안 규칙 설명

### 1. 사용자 컬렉션 (users)
- **읽기/쓰기**: 본인만 가능
- **삭제**: 불가능 (데이터 보호)

### 2. 학생 컬렉션 (students)
- **읽기**: 
  - 등록한 선생님
  - 해당 학생 본인
- **쓰기**: 
  - 선생님만 가능 (생성/수정/삭제)
  - teacherId가 본인 이메일과 일치해야 함

### 3. 성적 컬렉션 (records)
- **읽기**: 
  - 등록한 선생님
  - 해당 학생 본인
- **쓰기**: 
  - 선생님만 가능
  - teacherId가 본인 이메일과 일치해야 함

---

## 🧪 테스트 시나리오

### ✅ 허용되는 작업

**선생님 (teacher@my-academy.com):**
- ✅ 학생 "minsu" 추가
- ✅ "minsu"의 성적 추가/수정/삭제
- ✅ 자신이 등록한 모든 학생 조회
- ✅ 자신이 등록한 모든 성적 조회

**학생 (minsu):**
- ✅ 자신의 정보 조회
- ✅ 자신의 성적 조회
- ✅ 성적 분석 차트 보기

### ❌ 차단되는 작업

**학생 (minsu):**
- ❌ 다른 학생 정보 조회
- ❌ 자신의 성적 수정/삭제
- ❌ 새 성적 추가

**선생님 A:**
- ❌ 선생님 B가 등록한 학생 수정/삭제
- ❌ 선생님 B가 등록한 성적 수정/삭제

---

## 🔧 문제 해결

### "권한 거부" 오류가 발생하면?

1. **보안 규칙이 올바르게 적용되었는지 확인**
   - Firebase Console → Firestore → 규칙 탭

2. **사용자 role이 올바르게 설정되었는지 확인**
   - Firestore → users → 해당 문서 확인
   - `role` 필드가 "teacher" 또는 "student"인지 확인

3. **teacherId와 studentId가 정확한지 확인**
   - students 문서: `teacherId` = 선생님 이메일
   - records 문서: `teacherId` + `studentId` 모두 정확해야 함

4. **브라우저 캐시 지우기 및 재로그인**

### 데이터가 표시되지 않으면?

1. **콘솔에서 데이터 구조 확인**
   ```javascript
   console.log('Students:', students);
   console.log('Records:', records);
   ```

2. **Firestore Console에서 직접 확인**
   - students 컬렉션에 데이터가 있는지
   - records 컬렉션에 데이터가 있는지
   - teacherId와 studentId가 정확히 일치하는지

---

## 📌 중요 체크리스트

- [ ] Firebase Console에서 보안 규칙 업데이트 완료
- [ ] 기존 데이터가 있다면 새 구조로 마이그레이션 필요
- [ ] 각 컬렉션에 인덱스 설정 (선택사항, 쿼리 성능 향상)
- [ ] teacherId와 studentId 필드가 정확히 입력되었는지 확인

---

## 🚀 성능 최적화 팁

### Firestore 인덱스 생성 (선택사항)

성능 향상을 위해 다음 인덱스를 생성하세요:

**students 컬렉션:**
- `teacherId` (Ascending)

**records 컬렉션:**
- `teacherId` (Ascending)
- `studentId` (Ascending)
- `teacherId` + `studentId` (Composite)

Firebase Console → Firestore → 인덱스 탭에서 자동으로 제안됩니다.

---

이 새로운 구조로 보안과 확장성이 크게 개선되었습니다! 🎉