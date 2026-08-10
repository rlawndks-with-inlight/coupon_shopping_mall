# 매니저 이용가이드 PDF 생성

## 콘텐츠 원본은 하나다

```
src/components/manager/guideContent.js
   ├─ 웹  /manager/guide  ·  /manual   (GuideBody 가 렌더)
   └─ PDF public/manual/manager-guide.pdf   (이 스크립트가 렌더)
```

PDF 는 저 파일을 **직접 import** 해서 만든다. 내용을 손으로 옮겨 적는 곳은 없다.

## 쓰는 법

```bash
# 가이드 내용을 고친 뒤
npm run guide:pdf      # 추출 → 렌더 → 검증 (PDF 를 새로 만든다)

# 지금 커밋된 PDF 가 최신인지만 확인
npm run guide:check
```

`guide:check` 는 종료코드로 답한다 — **0 = 최신, 1 = 재생성 필요**.

## 왜 자동 빌드에 안 넣었나

`next build` 에 끼우면 배포 서버(EC2)에 Python·reportlab·한글 폰트를 깔아야 한다.
PDF 는 자주 바뀌지 않으므로 그 값을 치를 이유가 없다.
대신 **개발자가 로컬에서 만들어 커밋하는 산출물**로 두고, 어긋남은 `guide:check` 로 막는다.

## 어긋남을 어떻게 막나 — 지문(fingerprint)

`extract.mjs` 가 렌더에 실제로 쓰이는 데이터만 골라 sha256 앞 16자를 낸다.
`build.py` 는 그 값을 **모든 페이지 푸터와 PDF 메타데이터**에 박는다.
`verify.py` 는 지금 guideContent.js 의 지문과 PDF 안의 지문을 비교한다.

주석·들여쓰기만 고쳤을 때는 지문이 안 바뀐다 — 의미 없는 재생성을 요구하지 않기 위해서다.

`verify.py` 는 지문 외에 두 가지를 더 본다. **지문만 맞고 본문이 깨진 사고**를 잡기 위한 것이다:

1. 모든 섹션 제목이 PDF 본문 텍스트에 실제로 있는지
2. 계열 전용 표시(「프레임6~11 전용」 등)가 반영됐는지

실제로 이 검사가 초기 버전의 렌더 결함을 잡아냈다 — reportlab 내장 CID 폰트를 쓰던 때
가운뎃점(`·`)이 통째로 사라지고(`프레임1·2·3` → `프레임123`) 이모지가 뒤 글자까지
오염시키고 있었다. 그래서 지금은 유니코드 커버리지가 넓은 TTF(맑은고딕)를 쓴다.

## 필요한 것

| | 용도 |
|---|---|
| Node | `extract.mjs` — guideContent.js 를 import 해 JSON 으로 뽑는다 |
| Python + `reportlab` | `build.py` — PDF 렌더 |
| Python + `pymupdf` | `verify.py` — 생성물 검사 |
| 한글 TTF | 맑은고딕(윈도우 기본) 또는 나눔고딕. 없으면 CID 폰트로 떨어지며 경고를 낸다 |

```bash
pip install reportlab pymupdf
```

## 파일

| 파일 | 역할 |
|---|---|
| `extract.mjs` | guideContent.js → `build/guide.json` (+ 지문) |
| `build.py` | `build/guide.json` → `public/manual/manager-guide.pdf` |
| `verify.py` | PDF 가 현재 콘텐츠와 일치하는지 검사 |
| `build/` | 중간 산출물. 커밋 대상이 아니다 |
