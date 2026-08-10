# -*- coding: utf-8 -*-
"""매니저 이용가이드 PDF — 3단계: 최신 여부 검사

**이 스크립트가 '일원화'의 실체다.**
콘텐츠 원본은 guideContent.js 하나지만, PDF 는 그걸 찍어낸 스냅샷이다. 가이드를 고치고
PDF 재생성을 잊으면 웹과 PDF 가 또 갈라진다 — 실제로 그 일이 있었다(8/8 자 PDF 가
그 뒤의 프레임 계열 분기 수정을 반영하지 못했다).

그래서 build.py 는 콘텐츠 지문(sha256 앞 16자)을 PDF 의 모든 페이지 푸터와 메타데이터에
박아 둔다. 이 스크립트는 지금 guideContent.js 에서 계산한 지문과 PDF 안의 지문을 비교한다.
어긋나면 실패로 끝난다 — 배포 전 검사에 넣으면 '깜빡함'이 구조적으로 불가능해진다.

사용: node scripts/guide-pdf/extract.mjs && python scripts/guide-pdf/verify.py
종료코드 0 = 최신 / 1 = 재생성 필요
"""
import json
import os
import sys

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding='utf-8')
    except Exception:
        pass

try:
    import fitz  # PyMuPDF
except ImportError:
    print('PyMuPDF 가 없다: pip install pymupdf', file=sys.stderr)
    sys.exit(2)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SRC_JSON = os.path.join(HERE, 'build', 'guide.json')
PDF = os.path.join(ROOT, 'public', 'manual', 'manager-guide.pdf')


def main():
    if not os.path.exists(SRC_JSON):
        print('build/guide.json 이 없다. 먼저 `node scripts/guide-pdf/extract.mjs` 를 돌릴 것', file=sys.stderr)
        return 2
    if not os.path.exists(PDF):
        print('PDF 가 없다: ' + PDF, file=sys.stderr)
        return 1

    with open(SRC_JSON, encoding='utf-8') as fp:
        data = json.load(fp)
    want = data.get('fingerprint', '')
    sections = data.get('sections', [])

    doc = fitz.open(PDF)
    text = ''.join(page.get_text() for page in doc)
    meta_subject = (doc.metadata or {}).get('subject') or ''

    ok = True

    # ① 지문 대조 — 이게 본 검사다.
    if want and want in text:
        print(f'지문 일치 — {want} (본문 {doc.page_count}쪽)')
    elif want and f'guide-fingerprint:{want}' in meta_subject:
        print(f'지문 일치(메타데이터) — {want}')
    else:
        ok = False
        print(f'⚠ 지문 불일치. guideContent.js 는 {want} 인데 PDF 는 그 값을 담고 있지 않다.')
        print('   → node scripts/guide-pdf/extract.mjs && python scripts/guide-pdf/build.py')

    # ② 지문만 맞고 본문이 비어 있는 사고(폰트 미등록 등)를 잡는다.
    #    섹션 제목이 실제로 PDF 텍스트에 들어 있는지 확인한다.
    missing = [s.get('title') for s in sections if s.get('title') and s['title'] not in text]
    if missing:
        ok = False
        print(f'⚠ PDF 본문에서 찾을 수 없는 섹션 제목 {len(missing)}건:')
        for t in missing[:8]:
            print('   - ' + t)
    else:
        print(f'섹션 제목 {len(sections)}개 전부 본문에 존재')

    # ③ 계열 꼬리표가 붙는 항목이 PDF 에도 반영됐는지(웹 가이드와 같은 정보인지) 확인.
    tagged = [s for s in sections if s.get('groups')]
    if tagged:
        labels = data.get('frameGroupLabel', {})
        bad = []
        for s in tagged:
            names = ' · '.join(labels.get(g, g) for g in s['groups'])
            if f'{names} 전용' not in text:
                bad.append(f"{s.get('title')} ({names})")
        if bad:
            ok = False
            print(f'⚠ 계열 표시가 빠진 항목 {len(bad)}건: ' + ', '.join(bad[:5]))
        else:
            print(f'계열 전용 표시 {len(tagged)}건 반영됨')

    doc.close()
    print('결과: ' + ('최신' if ok else '재생성 필요'))
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
