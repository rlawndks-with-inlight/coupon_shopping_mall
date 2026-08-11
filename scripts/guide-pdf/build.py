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
from datetime import date

# 윈도우 콘솔 기본 코드페이지가 cp949 라 한글을 출력하다 죽는다. PDF 내용과는 무관하지만
# 스크립트가 마지막 print 에서 실패하면 '어디서 실패했는지' 알기 어렵다.
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
from reportlab.platypus import (BaseDocTemplate, CondPageBreak, Flowable, Frame,
                                Image, KeepTogether, PageBreak, PageTemplate,
                                Paragraph, Spacer, Table, TableStyle)
from reportlab.platypus.tableofcontents import TableOfContents

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SRC_JSON = os.path.join(HERE, 'build', 'guide.json')
OUT_PDF = os.path.join(ROOT, 'public', 'manual', 'manager-guide.pdf')


# ── 폰트 ──────────────────────────────────────────────────────────────────
# 처음엔 reportlab 내장 CID 폰트(HYGothic-Medium)를 썼다. 폰트 파일이 필요 없어 편했지만
# **문자 범위가 Adobe-Korea1 로 제한돼 있어 글자가 깨졌다.** verify.py 가 잡아낸 실제 증상:
#   · 가운뎃점(U+00B7)이 통째로 사라짐 — '프레임1·2' → '프레임12'
#   · 이모지가 깨지며 뒤따르는 한글까지 오염 — '촀糊봀‰賂판관리」'
# 그래서 유니코드 커버리지가 넓은 TTF 를 우선 쓰고, 없으면 CID 로 떨어진다.
def _register_fonts():
    candidates = [
        (r'C:\Windows\Fonts\malgun.ttf', r'C:\Windows\Fonts\malgunbd.ttf'),
        ('/usr/share/fonts/truetype/nanum/NanumGothic.ttf',
         '/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf'),
    ]
    for regular, bold in candidates:
        if os.path.exists(regular):
            pdfmetrics.registerFont(TTFont('GuideSans', regular))
            pdfmetrics.registerFont(TTFont('GuideSans-Bold', bold if os.path.exists(bold) else regular))
            pdfmetrics.registerFontFamily('GuideSans', normal='GuideSans', bold='GuideSans-Bold')
            return 'GuideSans', 'GuideSans-Bold', True
    print('⚠ 한글 TTF 를 찾지 못해 내장 CID 폰트로 떨어진다 — 가운뎃점·기호가 깨질 수 있다', file=sys.stderr)
    pdfmetrics.registerFont(UnicodeCIDFont('HYGothic-Medium'))
    return 'HYGothic-Medium', 'HYGothic-Medium', False


SANS, BOLD, HAS_TTF = _register_fonts()

# ── 색 ────────────────────────────────────────────────────────────────────
# 먹색 하나 + 회색 단계 + 초록 악센트 하나. 배지마다 색을 다 다르게 주면 문서가 알록달록해진다.
INK = colors.HexColor('#111827')
BODY = colors.HexColor('#374151')
MUTED = colors.HexColor('#6b7280')
FAINT = colors.HexColor('#9ca3af')
RULE_C = colors.HexColor('#e5e7eb')
RULE_SOFT = colors.HexColor('#f1f3f5')
ACCENT = colors.HexColor('#166534')
PANEL = colors.HexColor('#f8faf8')

# 배지는 '해야 하는 정도'를 나타내는 단계값이다. 단계가 드러나도록 세 톤만 쓴다.
BADGE_HEX = {
    '필수': '#b91c1c',
    '시작': '#b91c1c',
    '권장': '#1d4ed8',
    '조건부': '#b45309',
    '참조': '#9ca3af',
    '운영': '#9ca3af',
}

PAGE_W, PAGE_H = A4
MARGIN_X = 20 * mm
MARGIN_TOP = 22 * mm
MARGIN_BOT = 20 * mm
CONTENT_W = PAGE_W - MARGIN_X * 2
NUM_W = 7.5 * mm        # 번호 칩 한 변
GUTTER = 5 * mm         # 칩과 본문 사이


def esc(text):
    """Paragraph 는 미니 HTML 을 해석한다 — 본문의 <, & 가 깨지지 않게 이스케이프."""
    return (str(text if text is not None else '')
            .replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))


S = {
    'cover_kicker': ParagraphStyle('ck', fontName=BOLD, fontSize=8, leading=12, textColor=FAINT),
    'cover_title': ParagraphStyle('ct', fontName=BOLD, fontSize=26, leading=34, textColor=INK),
    'cover_lead': ParagraphStyle('cl', fontName=SANS, fontSize=10, leading=17, textColor=BODY),
    'cover_meta': ParagraphStyle('cm', fontName=SANS, fontSize=8.5, leading=14, textColor=FAINT),

    'part_no': ParagraphStyle('pn', fontName=BOLD, fontSize=8, leading=11, textColor=ACCENT),
    'pt': ParagraphStyle('pt', fontName=BOLD, fontSize=15, leading=21, textColor=INK),
    'part_sub': ParagraphStyle('ps', fontName=SANS, fontSize=9, leading=14, textColor=MUTED),

    # 배지·계열 표시. 번호 칩 오른쪽 본문 열에 맞춰 들여쓴다(칩과 겹치지 않게).
    'eyebrow': ParagraphStyle('eb', fontName=BOLD, fontSize=7.5, leading=11,
                              leftIndent=(7.5 + 5) * mm, textColor=FAINT),
    'ti': ParagraphStyle('ti', fontName=BOLD, fontSize=13, leading=18, textColor=INK),
    'where': ParagraphStyle('wh', fontName=SANS, fontSize=8.5, leading=13, textColor=MUTED),
    'why': ParagraphStyle('wy', fontName=SANS, fontSize=9.5, leading=16, textColor=BODY),
    'step': ParagraphStyle('st', fontName=SANS, fontSize=9.5, leading=16, textColor=BODY,
                           leftIndent=12, firstLineIndent=-12),
    'flabel': ParagraphStyle('fl', fontName=BOLD, fontSize=8.5, leading=13.5, textColor=ACCENT),
    'fdesc': ParagraphStyle('fd', fontName=SANS, fontSize=8.5, leading=13.5, textColor=BODY),
    'cap': ParagraphStyle('cp', fontName=SANS, fontSize=8, leading=12.5, textColor=MUTED),
    'num': ParagraphStyle('nu', fontName=BOLD, fontSize=9, leading=12,
                          textColor=colors.white, alignment=TA_CENTER),
    # 목차 표제. 'pt' 를 쓰면 목차가 자기 자신을 항목으로 등록한다.
    'toc_head': ParagraphStyle('th', fontName=BOLD, fontSize=15, leading=21, textColor=INK),
}


class TocMark(Flowable):
    """목차 등록용 보이지 않는 표식(높이 0).

    reportlab 의 afterFlowable 은 **문서가 직접 그린 flowable** 만 통지한다.
    섹션 제목은 번호 칩과 함께 Table 안에 들어 있어(section_head) 통지 대상이 아니다.
    그래서 섹션이 시작되는 자리에 이 표식을 따로 흘려 페이지 번호를 잡는다.
    CondPageBreak 뒤에 놓아야 '실제로 섹션이 시작된 페이지'가 기록된다.
    """

    def __init__(self, level, text):
        Flowable.__init__(self)
        self.level = level
        self.text = text
        self.width = 0
        self.height = 0

    def draw(self):
        pass


class Rule(Flowable):
    """가는 가로선. Table 로 선을 그리면 페이지 나눔 계산이 지저분해진다."""

    def __init__(self, width, color=RULE_C, thickness=0.5):
        Flowable.__init__(self)
        self.width = width
        self.color = color
        self.thickness = thickness
        self.height = thickness

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, 0, self.width, 0)


def num_chip(no):
    """번호 칩. 표 셀의 ALIGN 은 Paragraph 내부 정렬을 바꾸지 않아 스타일에 alignment 를 준다."""
    cell = Table([[Paragraph(esc(no), S['num'])]], colWidths=[NUM_W], rowHeights=[NUM_W])
    cell.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), INK),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    cell.hAlign = 'LEFT'
    return cell


def section_head(section, group_label):
    """[배지·계열] 줄 → [번호 칩 | 제목·위치] 2단.

    예전엔 배지를 제목 오른쪽 끝에 띄웠다. 제목 길이에 따라 위치가 제각각이고
    계열 꼬리표까지 들어가면 두 줄로 접혀 더 지저분했다 — '애매한 위치·크기'라는 지적을 받았다.
    배지는 제목 위 왼쪽으로 올린다. 본문 열에 맞춰 들여쓰므로 제목과 세로선이 맞는다.

    ⚠ 칩 열의 폭은 반드시 NUM_W + GUTTER 여야 한다. NUM_W 로 두고 RIGHTPADDING 을 주면
      칸보다 내용이 넓어져 배지·제목이 칩 위로 겹쳐 찍힌다(실제로 그렇게 났었다).
    """
    flow = []

    badge = section.get('badge') or ''
    parts = []
    if badge:
        parts.append(f'<font color="{BADGE_HEX.get(badge, "#9ca3af")}">{esc(badge)}</font>')
    groups = section.get('groups') or []
    if groups:
        names = ' · '.join(group_label.get(g, g) for g in groups)
        parts.append(f'{esc(names)} 전용')
    if parts:
        flow.append(Paragraph('&nbsp;&nbsp;&nbsp;'.join(parts), S['eyebrow']))
        flow.append(Spacer(1, 2))

    col = [Paragraph(esc(section.get('title')), S['ti'])]
    if section.get('where'):
        col.append(Spacer(1, 1))
        col.append(Paragraph(esc(section['where']), S['where']))

    no = section.get('no')
    if no:
        t = Table([[num_chip(no), col]],
                  colWidths=[NUM_W + GUTTER, CONTENT_W - NUM_W - GUTTER])
        t.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (0, 0), 2),   # 칩 윗변을 제목 글자 윗선에 맞춘다
            ('TOPPADDING', (1, 0), (1, 0), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ]))
        flow.append(t)
    else:
        flow.extend(col)
    return flow


def fields_table(fields):
    rows = [[Paragraph(esc(f.get('label')), S['flabel']),
             Paragraph(esc(f.get('desc')), S['fdesc'])] for f in fields]
    t = Table(rows, colWidths=[40 * mm, CONTENT_W - 40 * mm], repeatRows=0)
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BACKGROUND', (0, 0), (0, -1), PANEL),
        ('LINEBELOW', (0, 0), (-1, -2), 0.4, RULE_SOFT),
        ('BOX', (0, 0), (-1, -1), 0.5, RULE_C),
        ('LEFTPADDING', (0, 0), (-1, -1), 7), ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    return t


# 스크린샷 한 장이 한 페이지를 다 먹으면 앞뒤 설명과 떨어져 읽기 나빠진다.
SHOT_MAX_H = 112 * mm
SHOT_MAX_W = CONTENT_W

# 여백 자동 정리.
#
# 가맹점 화면 캡처는 페이지 전체를 찍은 것이 많아 실제 UI 주위에 흰 여백이 크게 남는다.
# 실측: access 50% · find-id 64% · find-pw 60% · home-texts 55% 가 여백이다.
# 그대로 실으면 지면이 성기게 보인다.
#
# **원본(public/manual/guide/*.png)은 절대 건드리지 않는다** — 웹 가이드가 같은 파일을 쓴다.
# 다듬은 사본을 build/shots/ 에 만들어 그것만 PDF 에 넣는다(gitignore 대상).
TRIM_TOL = 12          # 배경으로 볼 색차 허용치
TRIM_KEEP = 10         # 잘라낸 뒤 되돌려 줄 여백(px). 바싹 자르면 답답해 보인다
TRIM_MIN_RATIO = 0.25  # 남는 면적이 이보다 작으면 판정 실패로 보고 원본을 쓴다
SHOT_CACHE = os.path.join(HERE, 'build', 'shots')


def trimmed_path(src):
    """네 변의 '단색으로 이어지는 띠'만 걷어낸 사본 경로를 돌려준다.

    로고에 쓴 Cloudinary e_trim 과 같은 발상이지만 여기서는 로컬에서 처리한다.
    잘라낼 게 없으면(대형 관리자 화면 캡처 대부분) 원본 경로를 그대로 돌려준다.
    """
    try:
        from PIL import Image
        import numpy as np
    except ImportError:
        return src  # Pillow 가 없으면 조용히 원본을 쓴다

    try:
        im = Image.open(src)
        rgb = im.convert('RGB')
        a = np.asarray(rgb).astype(int)
        h, w, _ = a.shape
        bg = np.array(a[0, 0])
        near = (np.abs(a - bg).max(axis=2) <= TRIM_TOL)
        rows, cols = near.all(axis=1), near.all(axis=0)
        if rows.all() or cols.all():
            return src  # 전면 단색 — 자를 수 없다
        top = int(np.argmin(rows))
        bottom = int(np.argmin(rows[::-1]))
        left = int(np.argmin(cols))
        right = int(np.argmin(cols[::-1]))
        # 되돌려 줄 여백을 감안해 실제 잘라낼 양을 정한다
        top = max(0, top - TRIM_KEEP)
        bottom = max(0, bottom - TRIM_KEEP)
        left = max(0, left - TRIM_KEEP)
        right = max(0, right - TRIM_KEEP)
        if top + bottom + left + right < 8:
            return src  # 다듬을 게 사실상 없다
        box = (left, top, w - right, h - bottom)
        cw, ch = box[2] - box[0], box[3] - box[1]
        if cw <= 0 or ch <= 0 or (cw * ch) / (w * h) < TRIM_MIN_RATIO:
            return src  # 과하게 잘렸다 — 판정을 못 믿는다
        os.makedirs(SHOT_CACHE, exist_ok=True)
        out = os.path.join(SHOT_CACHE, os.path.basename(src))
        im.crop(box).save(out)
        return out
    except Exception:
        return src  # 어떤 이유로든 실패하면 원본을 쓴다. 여백은 미관 문제일 뿐이다


def shot_blocks(shots):
    """이미지와 캡션은 반드시 붙어 있어야 한다(KeepTogether)."""
    out = []
    for sh in shots:
        path = sh.get('path')
        if not path or not os.path.exists(path):
            continue
        path = trimmed_path(path)
        try:
            iw, ih = ImageReader(path).getSize()
        except Exception:
            continue
        scale = min(SHOT_MAX_W / iw, SHOT_MAX_H / ih, 1.0)  # 원본보다 확대하지 않는다
        img = Image(path, width=iw * scale, height=ih * scale)
        img.hAlign = 'LEFT'
        block = [img]
        if sh.get('cap'):
            block.append(Spacer(1, 3))
            block.append(Paragraph(esc(sh['cap']), S['cap']))
        out.append(KeepTogether(block))
        out.append(Spacer(1, 7))
    return out


class GuideDoc(BaseDocTemplate):
    """목차 페이지번호를 채우려면 multiBuild + afterFlowable 통지가 필요하다."""

    def afterFlowable(self, flowable):
        if isinstance(flowable, TocMark):
            self.notify('TOCEntry', (flowable.level, flowable.text, self.page))
        elif isinstance(flowable, Paragraph) and flowable.style.name == 'pt':
            self.notify('TOCEntry', (0, flowable.getPlainText(), self.page))


def draw_frame(canvas, doc):
    """머리말·꼬리말.

    지문(fingerprint)은 **여기 찍지 않는다.** 내부 검증용 값이라 가맹점에게는 의미가 없고,
    실제로 '이게 왜 있냐'는 지적을 받았다. PDF 메타데이터(subject)에만 넣고
    verify.py 가 거기서 읽는다.
    """
    canvas.saveState()
    if doc.page > 1:
        canvas.setFont(SANS, 7.5)
        canvas.setFillColor(FAINT)
        canvas.drawString(MARGIN_X, PAGE_H - MARGIN_TOP + 7 * mm, 'SHOPGO 관리자 이용가이드')
        canvas.setStrokeColor(RULE_SOFT)
        canvas.setLineWidth(0.5)
        y = PAGE_H - MARGIN_TOP + 5 * mm
        canvas.line(MARGIN_X, y, PAGE_W - MARGIN_X, y)
        canvas.setFont(SANS, 8.5)
        canvas.setFillColor(MUTED)
        canvas.drawRightString(PAGE_W - MARGIN_X, MARGIN_BOT - 9 * mm, str(doc.page))
    canvas.restoreState()


def build():
    if not os.path.exists(SRC_JSON):
        print('build/guide.json 이 없다. 먼저 `node scripts/guide-pdf/extract.mjs` 를 돌릴 것',
              file=sys.stderr)
        return 1
    with open(SRC_JSON, encoding='utf-8') as fp:
        data = json.load(fp)

    fingerprint = data.get('fingerprint', '')
    group_label = data.get('frameGroupLabel', {})
    sections = data.get('sections', [])
    issued = date.today().strftime('%Y년 %-m월 %-d일') if os.name != 'nt' else date.today().strftime('%Y년 %m월 %d일').replace(' 0', ' ')

    doc = GuideDoc(OUT_PDF, pagesize=A4,
                   leftMargin=MARGIN_X, rightMargin=MARGIN_X,
                   topMargin=MARGIN_TOP, bottomMargin=MARGIN_BOT,
                   title='SHOPGO 관리자 이용가이드', author='SHOPGO',
                   subject=f'guide-fingerprint:{fingerprint}')
    frame = Frame(MARGIN_X, MARGIN_BOT, CONTENT_W, PAGE_H - MARGIN_TOP - MARGIN_BOT, id='body')
    doc.addPageTemplates([PageTemplate(id='main', frames=[frame], onPage=draw_frame)])

    story = []

    # ── 표지 ─────────────────────────────────────────────────────────────
    story.append(Spacer(1, 24 * mm))
    story.append(Paragraph('SHOPGO', S['cover_kicker']))
    story.append(Spacer(1, 3))
    story.append(Paragraph('관리자 이용가이드', S['cover_title']))
    story.append(Spacer(1, 5 * mm))
    story.append(Rule(CONTENT_W, INK, 1.2))
    story.append(Spacer(1, 7 * mm))
    story.append(Paragraph(
        '처음이시라면 <b>1부의 순서대로</b> 따라 하시면 쇼핑몰을 열 수 있습니다. '
        '앞 단계가 뒤 단계의 준비가 되니 순서를 지켜 주세요.<br/>'
        '2부는 메뉴별 상세 안내입니다. 순서 없이 필요할 때 찾아보세요.', S['cover_lead']))
    story.append(Spacer(1, 5 * mm))
    story.append(Paragraph(
        '프레임 계열에 따라 관리자 메뉴가 다릅니다. 항목 위에 '
        '<font color="#9ca3af">프레임3·4 전용</font> 같은 표시가 있으면 그 계열에만 해당합니다.',
        S['cover_lead']))
    story.append(Spacer(1, 14 * mm))
    story.append(Paragraph(f'발행 {issued}', S['cover_meta']))
    story.append(Paragraph('문의 office@forspay.com', S['cover_meta']))

    # ── 목차 ─────────────────────────────────────────────────────────────
    story.append(PageBreak())
    story.append(Paragraph('목차', S['toc_head']))
    story.append(Spacer(1, 2.5 * mm))
    story.append(Rule(CONTENT_W, RULE_C, 0.5))
    story.append(Spacer(1, 5 * mm))
    toc = TableOfContents()
    toc.levelStyles = [
        ParagraphStyle('toc0', fontName=BOLD, fontSize=10, leading=21, textColor=INK, spaceBefore=10),
        ParagraphStyle('toc1', fontName=SANS, fontSize=9.5, leading=17, textColor=BODY, leftIndent=9),
    ]
    toc.dotsMinLevel = 1
    story.append(toc)

    # ── 본문 ─────────────────────────────────────────────────────────────
    for part, no, heading, sub in (
        (1, '1부', '쇼핑몰 오픈까지', '이 순서대로 따라 하시면 됩니다. 앞 단계가 뒤 단계의 전제입니다.'),
        (2, '2부', '메뉴별 상세 안내', '각 메뉴가 어떤 역할을 하는지 항목별로 정리했습니다.'),
    ):
        rows = [s for s in sections if s.get('part') == part]
        if not rows:
            continue
        story.append(PageBreak())
        story.append(Paragraph(no, S['part_no']))
        story.append(Spacer(1, 1))
        story.append(Paragraph(heading, S['pt']))
        story.append(Spacer(1, 2 * mm))
        story.append(Paragraph(sub, S['part_sub']))
        story.append(Spacer(1, 3.5 * mm))
        story.append(Rule(CONTENT_W, INK, 1.0))
        story.append(Spacer(1, 8 * mm))

        for idx, s in enumerate(rows):
            # 페이지 끝에 제목만 걸치고 내용이 다음 장으로 넘어가는 걸 막는다.
            # 남은 높이가 이만큼 안 되면 새 페이지에서 시작한다 — '애매하게 우겨넣지 않기'.
            story.append(CondPageBreak(62 * mm))
            # 목차 라벨. 계열이 다른 항목끼리 번호·제목이 겹친다(6번이 둘, '디자인관리'가 둘) —
            # 웹 가이드에서는 자기 계열 것만 보이니 문제가 없지만 PDF 는 전부 싣기 때문에
            # 목차에서 구분이 안 된다. 계열명을 붙여 갈라 준다.
            label = f"{s['no']}. {s['title']}" if s.get('no') else s.get('title', '')
            if s.get('groups'):
                label += ' · ' + ' · '.join(group_label.get(g, g) for g in s['groups'])
            story.append(TocMark(1, label))
            head = list(section_head(s, group_label))
            if s.get('why'):
                head.append(Spacer(1, 3.5 * mm))
                head.append(Paragraph(esc(s['why']), S['why']))
            # 제목·위치·요약은 반드시 한 덩어리로 붙어 있어야 한다.
            story.append(KeepTogether(head))

            if s.get('steps'):
                story.append(Spacer(1, 3 * mm))
                for i, step in enumerate(s['steps'], 1):
                    story.append(Paragraph(f'{i}.&nbsp;&nbsp;{esc(step)}', S['step']))
            if s.get('fields'):
                story.append(Spacer(1, 4.5 * mm))
                story.append(fields_table(s['fields']))
            shots = shot_blocks(s.get('shots') or [])
            if shots:
                story.append(Spacer(1, 5 * mm))
                story.extend(shots)

            if idx < len(rows) - 1:
                story.append(Spacer(1, 5 * mm))
                story.append(Rule(CONTENT_W, RULE_SOFT, 0.6))
                story.append(Spacer(1, 8 * mm))

    doc.multiBuild(story)
    size_kb = os.path.getsize(OUT_PDF) / 1024
    print(f'PDF 생성 완료 — {OUT_PDF}')
    print(f'  섹션 {len(sections)}개 · {size_kb:.0f}KB')
    print(f'  지문 {fingerprint} — 본문에 찍지 않고 메타데이터에만 기록한다')
    return 0


if __name__ == '__main__':
    sys.exit(build())
