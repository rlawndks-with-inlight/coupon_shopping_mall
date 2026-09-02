// 프론트(Next.js) pm2 설정 — 클러스터 2 인스턴스.
//
// 왜: 서버는 2 vCPU 인데 예전엔 `pm2 start npm -- start`(fork 1개)라 1코어만 썼다.
//     게다가 브라우저의 모든 /api 호출이 next.config 의 rewrite 로 이 프로세스를 프록시로 거친다.
//     실측(2026-09-03): 동시 30명 연속요청 113 rps·p95 355ms → 60명 105 rps·p95 823ms 로
//     약 110 rps 에서 포화. 클러스터 2 로 두 코어를 다 쓰면 그 상한이 대략 두 배가 된다.
//
// 어떻게: pm2 클러스터 모드는 node 스크립트만 감쌀 수 있어 npm 이 아니라 next 의 실행 파일을 직접 띄운다.
//     Next 는 프로세스 간 공유 상태가 없고(이미지 캐시는 디스크), 로그인은 쿠키 기반이라 인스턴스 2개가 무해하다.
//
// 사용(서버 /home/ubuntu/front):
//     pm2 delete front && pm2 start pm2.front.config.cjs && pm2 save
//     이후 배포는 scripts/deploy-front.sh (빌드 산출물 교체 후 `pm2 reload front` — 무중단)
module.exports = {
    apps: [{
        name: 'front',
        script: 'node_modules/next/dist/bin/next',
        args: 'start -p 3000',
        cwd: '/home/ubuntu/front',
        instances: 2,
        exec_mode: 'cluster',
        max_memory_restart: '1G',
        autorestart: true,
        watch: false,
        env: { NODE_ENV: 'production' },
    }],
};
