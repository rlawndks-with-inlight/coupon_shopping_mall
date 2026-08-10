# -*- coding: utf-8 -*-
"""매니저 이용가이드 PDF — 2단계: 렌더

extract.mjs 가 만든 build/guide.json 을 읽어 public/manual/manager-guide.pdf 를 만든다.
콘텐츠 원본은 src/components/manager/guideContent.js 하나뿐이다(웹 가이드와 같은 파일).

이 스크립트는 **빌드에 끼우지 않는다.** 개발자가 로컬에서 돌리고 PDF 를 커밋하는 산출물이다.
next build 에 넣으면 배포 서버에 Python·reportlab 을 깔아야 하는데, 그럴 만한 이득이 없다.
대신 verify.py 가 '지금 커밋된 PDF 가 최신 콘텐츠인지'를 검사한다.

사용: python scripts/guide-pdf/build.py
"""
import json
import os
import sys

# 윈도우 콘솔 기본 코드페이지가 cp949 라 한글·— 를 출력하다 죽는다. PDF 내용과는 무관하지만
# 스크립트가 마지막 print 에서 실패하면 '실패한 줄' 알기 어렵다.
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding='utf-8')
    except Exception:
        pass

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, Frame, Image, KeepTogether,
                                PageBreak, PageTemplate, Paragraph, Spacer,
                                Table, TableStyle)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SRC_JSON = os.path.join(HERE, 'build', 'guide.json')
OUT_PDF = os.path.join(ROOT, 'public', 'manual', 'manager-guide.pdf')

# 폰트.
#
# 처음엔 reportlab 내장 CID 폰트(HYGothic-Medium)를 썼다. 폰트 파일이 필요 없어 편했지만
# **문자 범위가 Adobe-Korea1 로 제한돼 있어 글자가 깨졌다.** verify.py 가 잡아낸 실제 증상:
#   · 가운뎃점(U+00B7)이 통째로 사라짐 — '프레임1·2·3' → '프레임123'
#   · 이모지(📍)가 깨지면서 뒤따르는 한글까지 오염 — '촀糊봀‰賂판관리」'
# 그래서 유니코드 커버리지가 넓은 TTF(맑은고딕)를 우선 쓰고, 없으면 CID 로 떨어진다.
# 맑은고딕은 한국어 윈도우 기본 탑재라 이 프로젝트 개발 환경에서는 사실상 항상 있다.
def _register_fonts():
    candidates = [
        (r'C:\Windows\Fonts\malgun.ttf', r'C:\Windows\Fonts\malgunbd.ttf'),
        ('/usr/share/fonts/truetype/nanum/NanumGothic.ttf', '/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf'),
    ]
    for regular, bold in candidates:
        if os.path.exists(regular):
            pdfmetrics.registerFont(TTFont('GuideSans', regular))
            pdfmetrics.registerFont(TTFont('GuideSans-Bold', bold if os.path.exists(bold) else regular))
            pdfmetrics.registerFontFamily('GuideSans', normal='GuideSans', bold='GuideSans-Bold')
            return 'GuideSans', 'GuideSans', True
    # 폴백: 글자가 일부 깨질 수 있다. verify.py 가 걸러내므로 조용히 넘어가지 않는다.
    print('⚠ 한글 TTF 를 찾지 못해 내장 CID 폰트로 떨어진다 — 가운뎃점·기호가 깨질 수 있다', file=sys.stderr)
    pdfmetrics.registerFont(UnicodeCIDFont('HYGothic-Medium'))
    pdfmetrics.registerFont(UnicodeCIDFont('HYSMyeongJo-Medium'))
    return 'HYGothic-Medium', 'HYSMyeongJo-Medium', False


SANS, SERIF, HAS_TTF = _register_fonts()
BOLD = 'GuideSans-Bold' if HAS_TTF else SANS

INK = colors.HexColor('#1a1a1a')
MUTED = colors.HexColor('#6b7280')
LINE = colors.HexColor('#e5e7eb')
ACCENT = colors.HexColor('#2e7d32')

BADGE_COLORS = {
    '필수': ('#fdecea', '#c62828'),
    '권장': ('#eef4ff', '#2e6bd6'),
    '조건부': ('#fff4e5', '#b26a00'),
    '시작': ('#eaf7ee', '#2e7d32'),
    '참조': ('#eef0f3', '#5b6472'),
    '운영': ('#eaf7ee', '#2e7d32'),
}

def esc(text):
    """Paragraph 는 미니 HTML 을 해석한다 — 본문에 든 <, &, 「」 등이 깨지지 않게 이스케이프."""
    return (str(text if text is not None else '')
            .replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))

S = {
    'h1': ParagraphStyle('h1', fontName=SANS, fontSize=20, leading=27, textColor=INK, spaceAfter=4),
    'lead': ParagraphStyle('lead', fontName=SANS, fontSize=9.5, leading=15, textColor=MUTED, spaceAfter=14),
    'part': ParagraphStyle('part', fontName=SANS, fontSize=14, leading=20, textColor=INK, spaceBefore=6, spaceAfter=2),
    'partsub': ParagraphStyle('partsub', fontName=SANS, fontSize=9, leading=14, textColor=MUTED, spaceAfter=10),
    'title': ParagraphStyle('title', fontName=SANS, fontSize=12.5, leading=18, textColor=INK),
    'where': ParagraphStyle('where', fontName=SANS, fontSize=8.5, leading=13, textColor=MUTED, spaceBefore=2),
    'why': ParagraphStyle('why', fontName=SANS, fontSize=9.5, leading=15.5, textColor=colors.HexColor('#374151'), spaceBefore=5),
    'step': ParagraphStyle('step', fontName=SANS, fontSize=9.5, leading=15.5, textColor=colors.HexColor('#222'),
                           leftIndent=13, firstLineIndent=-13, spaceBefore=2, alignment=TA_LEFT),
    'flabel': ParagraphStyle('flabel', fontName=SANS, fontSize=9, leading=14, textColor=ACCENT),
    'fdesc': ParagraphStyle('fdesc', fontName=SANS, fontSize=9, leading=14.5, textColor=colors.HexColor('#374151')),
    'cap': ParagraphStyle('cap', fontName=SANS, fontSize=8.5, leading=13, textColor=colors.HexColor('#555')),
    'foot': ParagraphStyle('foot', fontName=SERIF, fontSize=7.5, leading=10, textColor=MUTED),
    # 표 셀의 ALIGN 속성은 Paragraph 안의 텍스트를 가운데로 옮기지 않는다. 스타일에 줘야 한다.
    'num': ParagraphStyle('num', fontName=SANS, fontSize=9.5, leading=12, textColor=colors.white, alignment=TA_CENTER),
}

PAGE_W, PAGE_H = A4
MARGIN = 18 * mm
CONTENT_W = PAGE_W - MARGIN * 2


def badge_table(section, group_label):
    """제목 줄: [번호] 제목 ......... (계열 꼬리표) [배지]"""
    no = section.get('no')
    bits = []
    if no:
        bits.append(Paragraph(f'<font color="#ffffff"><b>{esc(no)}</b></font>', S['title']))
    bits.append(Paragraph(f'<b>{esc(section.get("title"))}</b>', S['title']))

    tag = ''
    groups = section.get('groups') or []
    if groups:
        names = ' · '.join(group_label.get(g, g) for g in groups)
        tag = f'{names} 전용'

    badge = section.get('badge') or ''
    bg, fg = BADGE_COLORS.get(badge, ('#eef0f3', '#5b6472'))

    right = []
    if tag:
        right.append(Paragraph(f'<font color="#5b6472" size="8">{esc(tag)}</font>', S['where']))
    right.append(Paragraph(f'<font color="{fg}" size="8"><b>{esc(badge)}</b></font>', S['where']))

    num_cell = ''
    if no:
        num_cell = Table([[Paragraph(f'<b>{esc(no)}</b>', S['num'])]],
                         colWidths=[11 * mm], rowHeights=[8 * mm])
        num_cell.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), INK),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ]))

    title_w = CONTENT_W - (13 * mm if no else 0) - 42 * mm
    row = [num_cell, Paragraph(f'<b>{esc(section.get("title"))}</b>', S['title']), right]
    widths = [13 * mm if no else 0.01, title_w, 42 * mm]
    t = Table([row], colWidths=widths)
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (2, 0), (2, 0), 'RIGHT'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 2), ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    return t


def fields_table(fields):
    rows = []
    for f in fields:
        rows.append([
            Paragraph(f'<b>{esc(f.get("label"))}</b>', S['flabel']),
            Paragraph(esc(f.get('desc')), S['fdesc']),
        ])
    # 라벨 칸이 좁으면 '프레임이 정하는 / 범위' 처럼 어색하게 접힌다.
    t = Table(rows, colWidths=[42 * mm, CONTENT_W - 42 * mm])
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f7faf7')),
        ('BOX', (0, 0), (-1, -1), 0.5, LINE),
        ('INNERGRID', (0, 0), (-1, -1), 0.4, LINE),
        ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    return t


def shot_flowables(shots):
    """스크린샷은 원본보다 크게 늘리지 않는다(확대하면 글자가 뭉개진다)."""
    out = []
    max_w = CONTENT_W
    for sh in shots:
        path = sh.get('path')
        if not path or not os.path.exists(path):
            continue
        try:
            iw, ih = ImageReader(path).getSize()
        except Exception:
            continue
        scale = min(max_w / iw, 1.0)
        w, h = iw * scale, ih * scale
        # 한 페이지를 넘는 세로 스크린샷은 페이지 높이에 맞춘다
        max_h = PAGE_H - MARGIN * 2 - 40 * mm
        if h > max_h:
            w, h = w * (max_h / h), max_h
        img = Image(path, width=w, height=h)
        img.hAlign = 'LEFT'
        block = [Spacer(1, 5), img]
        if sh.get('cap'):
            block.append(Spacer(1, 3))
            block.append(Paragraph(f'<font color="#2e7d32">●</font> {esc(sh["cap"])}', S['cap']))
        out.append(KeepTogether(block))
    return out


def build():
    if not os.path.exists(SRC_JSON):
        print('build/guide.json 이 없다. 먼저 `node scripts/guide-pdf/extract.mjs` 를 돌릴 것', file=sys.stderr)
        return 1
    with open(SRC_JSON, encoding='utf-8') as fp:
        data = json.load(fp)

    fingerprint = data.get('fingerprint', '')
    group_label = data.get('frameGroupLabel', {})
    sections = data.get('sections', [])

    def on_page(canvas, doc):
        canvas.saveState()
        canvas.setFont(SERIF, 7.5)
        canvas.setFillColor(MUTED)
        # 지문을 푸터에 박아 둔다 — verify.py 가 이 값으로 최신 여부를 판정한다.
        canvas.drawString(MARGIN, 11 * mm, f'SHOPGO 관리자 이용가이드 · 내용본 {fingerprint}')
        canvas.drawRightString(PAGE_W - MARGIN, 11 * mm, f'{doc.page}')
        canvas.setStrokeColor(LINE)
        canvas.line(MARGIN, 14 * mm, PAGE_W - MARGIN, 14 * mm)
        canvas.restoreState()

    doc = BaseDocTemplate(OUT_PDF, pagesize=A4,
                          leftMargin=MARGIN, rightMargin=MARGIN,
                          topMargin=MARGIN, bottomMargin=MARGIN + 6 * mm,
                          title='SHOPGO 관리자 이용가이드', author='SHOPGO',
                          subject=f'guide-fingerprint:{fingerprint}')
    frame = Frame(MARGIN, MARGIN + 6 * mm, CONTENT_W, PAGE_H - MARGIN * 2 - 6 * mm, id='body')
    doc.addPageTemplates([PageTemplate(id='main', frames=[frame], onPage=on_page)])

    story = []
    story.append(Paragraph('관리자 이용가이드', S['h1']))
    story.append(Paragraph(
        '처음이시라면 아래 순서대로 따라 하시면 쇼핑몰을 열 수 있습니다. 앞 단계가 뒤 단계의 준비가 되니 순서를 지켜주세요.<br/>'
        '프레임 계열에 따라 관리자 메뉴가 다릅니다 — 항목에 「프레임4·5 전용」 같은 표시가 있으면 그 계열에만 해당합니다.',
        S['lead']))

    for part, heading, sub in (
        (1, '① 쇼핑몰 오픈까지 — 이 순서대로', '앞 단계가 뒤 단계의 전제입니다.'),
        (2, '② 메뉴별 상세 안내', '각 메뉴가 어떤 역할을 하는지 항목별로 정리했습니다. 필요할 때 찾아보세요.'),
    ):
        rows = [s for s in sections if s.get('part') == part]
        if not rows:
            continue
        if part == 2:
            story.append(PageBreak())
        story.append(Paragraph(esc(heading), S['part']))
        story.append(Paragraph(esc(sub), S['partsub']))
        for s in rows:
            block = [badge_table(s, group_label)]
            if s.get('where'):
                block.append(Paragraph(f'▸ {esc(s["where"])}', S['where']))
            if s.get('why'):
                block.append(Paragraph(esc(s['why']), S['why']))
            if s.get('steps'):
                for i, step in enumerate(s['steps'], 1):
                    block.append(Paragraph(f'{i}. {esc(step)}', S['step']))
            if s.get('fields'):
                block.append(Spacer(1, 6))
                block.append(fields_table(s['fields']))
            # 제목~설명까지는 한 페이지에 붙여 둔다. 스크린샷은 커서 따로 흘린다.
            story.append(KeepTogether(block))
            story.extend(shot_flowables(s.get('shots') or []))
            story.append(Spacer(1, 7))
            story.append(Table([['']], colWidths=[CONTENT_W], rowHeights=[0.4],
                               style=TableStyle([('BACKGROUND', (0, 0), (-1, -1), LINE)])))
            story.append(Spacer(1, 9))

    doc.build(story)
    size_kb = os.path.getsize(OUT_PDF) / 1024
    print(f'PDF 생성 완료 — {OUT_PDF}')
    print(f'  섹션 {len(sections)}개 · {size_kb:.0f}KB · 지문 {fingerprint}')
    return 0


if __name__ == '__main__':
    sys.exit(build())
