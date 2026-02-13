# 간단한 테트리스 (Windows 기준 실행 가이드)

브라우저에서 동작하는 캔버스 기반 테트리스입니다.

## 1) 준비물
- Windows 10/11
- Python 3 (권장)
- Chrome/Edge 같은 브라우저

> Python이 없다면: https://www.python.org/downloads/windows/

## 2) 실행 방법 (가장 쉬운 방법)
PowerShell을 열고 프로젝트 폴더로 이동한 뒤:

```powershell
cd C:\path\to\codexTest
python -m http.server 8000 --bind 127.0.0.1
```

브라우저에서 아래 주소로 접속:

- http://127.0.0.1:8000/index.html

## 3) 조작법
- ← / → : 좌우 이동
- ↓ : 소프트 드롭
- ↑ : 회전
- Space : 하드 드롭
- `다시 시작` 버튼 : 게임 리셋

## 4) 404 에러가 날 때 (Windows에서 자주 발생)
`Error code: 404`는 대부분 **서버를 다른 폴더에서 실행**했을 때 발생합니다.

아래 순서대로 확인하세요.

1. 현재 폴더 확인
```powershell
pwd
```

2. 파일 존재 확인
```powershell
dir index.html, tetris.js
```

3. 정확한 URL 접속
- http://127.0.0.1:8000/index.html

4. 포트 충돌 시 다른 포트로 실행
```powershell
python -m http.server 5500 --bind 127.0.0.1
```
- 그럼 접속 주소는 http://127.0.0.1:5500/index.html

## 5) 간단 점검
문법 점검:

```powershell
node --check .\tetris.js
```

(선택) 서버 응답 점검:

```powershell
curl http://127.0.0.1:8000/index.html
```

## 6) VS Code 사용자 빠른 실행
- 프로젝트 폴더를 VS Code로 연 뒤, 터미널(PowerShell)에서 위 명령 그대로 실행하면 됩니다.
- Live Server 확장을 써도 되지만, 현재 프로젝트는 `python -m http.server`로 충분합니다.
