# PowerShell 실행 정책 문제 해결

## 문제
```
npm : 이 시스템에서 스크립트를 실행할 수 없으므로 npm.ps1 파일을 로드할 수 없습니다.
```

## 해결 방법

### 방법 1: 실행 정책 변경 (권장)

**관리자 권한으로 PowerShell을 열고** 다음 명령어 실행:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

확인 메시지가 나오면 `Y` 입력

### 방법 2: CMD 사용 (가장 간단)

PowerShell 대신 **명령 프롬프트(CMD)**를 사용:

1. Windows 키 + R
2. `cmd` 입력 후 Enter
3. 다음 명령어 실행:

```cmd
cd C:\Users\skypo\SajuMonooApp\backend
npm install
npm start
```

### 방법 3: 일시적으로 실행 정책 변경

PowerShell에서 (관리자 권한 없이):

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
npm install
```

### 방법 4: 직접 node 사용

npm 대신 npx 사용:

```powershell
npx --yes npm install
```

또는:

```powershell
node "C:\Program Files\nodejs\npm.cmd" install
```

## 추천 방법

**가장 쉬운 방법**: CMD 사용
- Windows 키 + R
- `cmd` 입력
- 명령어 실행

**영구적 해결**: 방법 1 (관리자 권한 필요)

