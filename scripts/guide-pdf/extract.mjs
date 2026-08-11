// 매니저 이용가이드 PDF — 1단계: 콘텐츠 추출
//
// guideContent.js 를 **직접 import** 해서 중간 JSON 을 만든다. 손으로 옮겨 적지 않는다 —
// 그렇게 하면 웹 가이드와 PDF 가 서로 다른 말을 하게 되고, 실제로 그 일이 있었다
// (8/8 자 PDF 가 그 뒤의 계열 분기 수정을 반영하지 못했다).
//
// guideContent.js 는 순수 데이터 모듈이라(React·MUI import 0건) Node 에서 그대로 평가된다.
// 파일을 data: URL 로 감싸 import 하므로 빌드 도구나 트랜스파일러가 필요 없다.
//
// 사용: node scripts/guide-pdf/extract.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const SOURCE = join(ROOT, 'src', 'components', 'manager', 'guideContent.js');
const OUT_DIR = join(HERE, 'build');
const OUT_JSON = join(OUT_DIR, 'guide.json');

const code = readFileSync(SOURCE, 'utf8');

// 내용 지문. PDF 가 최신인지 판정하는 기준이 된다(verify.py 가 이 값을 PDF 안의 값과 비교).
// 주석·공백까지 포함한 파일 전체를 해싱하지 않고 '실제 렌더되는 데이터'만 해싱한다 —
// 주석만 고쳤을 때 PDF 를 다시 만들라고 하면 아무도 안 지킨다.
const mod = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
const { GUIDE_SECTIONS, FRAME_GROUP_LABEL } = mod;

if (!Array.isArray(GUIDE_SECTIONS) || GUIDE_SECTIONS.length === 0) {
  console.error('GUIDE_SECTIONS 를 읽지 못했다 — guideContent.js 의 export 를 확인할 것');
  process.exit(1);
}

// 스크린샷 경로를 절대경로로 바꿔 둔다(Python 쪽에서 경로 계산을 반복하지 않도록).
// 웹 가이드의 GuideImage 와 같은 규칙: shots 가 있으면 그 목록, 없으면 {id}.png 를 시도.
const shotPath = (img) => join(ROOT, 'public', 'manual', 'guide', `${img}.png`);
const sections = GUIDE_SECTIONS.map((s) => {
  const shots = (s.shots?.length ? s.shots : [{ img: s.id }])
    .map((sh) => ({ ...sh, path: shotPath(sh.img) }))
    .filter((sh) => existsSync(sh.path)); // 없는 스크린샷은 조용히 뺀다(웹은 '준비중' 자리를 보여주지만 PDF 엔 불필요)
  return { ...s, shots };
});

const payload = {
  // 계열 라벨도 함께 넘긴다 — PDF 는 프레임을 모르므로 웹의 '프레임5·6 전용' 꼬리표와 같은 표기를 쓴다.
  frameGroupLabel: FRAME_GROUP_LABEL ?? {},
  sections,
};
// 지문은 렌더에 실제로 쓰이는 값만 대상으로 한다.
const fingerprint = createHash('sha256')
  .update(JSON.stringify(payload.sections.map(({ shots, ...rest }) => ({ ...rest, shots: shots.map((sh) => sh.img + '|' + (sh.cap ?? '')) }))))
  .update(JSON.stringify(payload.frameGroupLabel))
  .digest('hex')
  .slice(0, 16);

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_JSON, JSON.stringify({ fingerprint, ...payload }, null, 2), 'utf8');

const part1 = sections.filter((s) => s.part === 1).length;
const part2 = sections.filter((s) => s.part === 2).length;
const shotCount = sections.reduce((n, s) => n + s.shots.length, 0);
console.log(`추출 완료 — 섹션 ${sections.length}개(1부 ${part1} · 2부 ${part2}) · 스크린샷 ${shotCount}장`);
console.log(`지문 ${fingerprint}`);
console.log(`→ ${OUT_JSON}`);
