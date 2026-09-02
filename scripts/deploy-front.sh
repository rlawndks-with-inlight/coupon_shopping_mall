#!/usr/bin/env bash
# 프론트 무중단 배포 (서버 /home/ubuntu/front 에서 실행)
#
#   bash scripts/deploy-front.sh            # origin/master 를 받아 빌드 → 교체 → pm2 reload
#
# 왜 이 스크립트인가:
#   예전엔 서비스 중인 `.next` 위에서 그대로 `npm run build` 를 돌렸다. 빌드가 도는 1~2분 동안
#   실행 중인 서버가 반쯤 지워진 산출물을 읽어 `Cannot find module .../pages/404.js` 같은 오류를 내고
#   손님 화면이 깨졌다(pm2 err 로그에 다수 기록, 2026-09-03 점검). 별도 디렉토리에 빌드해 두고
#   완성된 뒤 한 번에 바꿔 끼운 다음 `pm2 reload`(클러스터 순차 재시작) 하면 그 창이 사라진다.
#
# ⚠ `npm run deploy` 스크립트와는 무관하다(그건 쓰지 않기로 함). 이 파일은 pull·build·reload 를 순서대로 할 뿐이다.
set -euo pipefail
cd "$(dirname "$0")/.."

BUILD_DIR=".next-build"
LIVE_DIR=".next"
PREV_DIR=".next-prev"

echo "[1/4] git pull origin master"
git pull -q origin master
echo "      HEAD: $(git log --oneline -1)"

echo "[2/4] build → $BUILD_DIR (서비스 중인 $LIVE_DIR 은 건드리지 않는다)"
rm -rf "$BUILD_DIR"
NEXT_DIST_DIR="$BUILD_DIR" npx next build

echo "[3/4] swap: $LIVE_DIR → $PREV_DIR, $BUILD_DIR → $LIVE_DIR"
rm -rf "$PREV_DIR"
[ -d "$LIVE_DIR" ] && mv "$LIVE_DIR" "$PREV_DIR"
mv "$BUILD_DIR" "$LIVE_DIR"
# next start 는 distDir 기본값(.next)을 읽으므로 이름을 바꿔 끼우면 그대로 새 빌드를 서비스한다.
# 실행 중인 옛 프로세스는 이미 연 파일(.next-prev 로 옮겨진 inode)을 계속 읽으므로 reload 전까지 안전하다.

echo "[4/4] pm2 reload front (무중단)"
if pm2 describe front >/dev/null 2>&1; then
  pm2 reload front
else
  pm2 start pm2.front.config.cjs && pm2 save
fi
sleep 3
pm2 jlist | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{for(const p of JSON.parse(s)) if(p.name==="front") console.log("  front", p.pm2_env.exec_mode, "status="+p.pm2_env.status, "pid="+p.pid)})'
curl -s -o /dev/null -w "  localhost:3000 → %{http_code}\n" --max-time 20 http://127.0.0.1:3000/shop/main/ || true
echo "done"
