# Python 환경 설정 가이드

## 문제
궁합 계산이 항상 100점으로 나오는 경우, Python 스크립트 실행에 필요한 라이브러리가 설치되지 않았을 수 있습니다.

## 해결 방법

### 1. Python 패키지 설치

```bash
cd backend
pip install -r requirements.txt
```

또는 개별 설치:

```bash
pip install numpy tensorflow
```

### 2. 설치 확인

```bash
python -c "import numpy; import tensorflow; print('✅ 모든 패키지 설치 완료')"
```

### 3. 모델 파일 확인

다음 파일들이 `backend` 디렉토리에 있는지 확인:
- `sky3000.h5`
- `earth3000.h5`
- `cal.csv`

### 4. 테스트

```bash
cd backend
node test-compatibility.js
```

`fallback: false`가 나오면 정상 작동합니다.

## 주의사항

- Python 3.8 이상 필요
- TensorFlow는 CPU 버전으로도 작동하지만, GPU 버전을 사용하면 더 빠릅니다
- Windows에서는 `python` 명령어, Linux/Mac에서는 `python3` 명령어 사용

