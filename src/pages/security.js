import { Box, Container, Stack, Typography, Grid } from '@mui/material';
import { Icon } from '@iconify/react';
import MainSiteLayout from 'src/components/main-site/MainSiteLayout';

// 실제로 사실인 항목만 기재. (개인정보 DB 암호화는 적용 완료 후 추가 예정)
const PILLARS = [
  {
    icon: 'tabler:lock',
    title: 'SSL 보안 통신',
    desc:
      '모든 페이지는 SSL/TLS로 암호화되어 전송됩니다. 와일드카드 SSL 인증서를 적용해 shopgo.co.kr은 물론 모든 가맹점 주소(가맹점명.shopgo.co.kr)까지 https 보안 접속이 적용됩니다.',
  },
  {
    icon: 'tabler:cloud',
    title: 'AWS 클라우드 인프라',
    desc:
      'ShopGo는 Amazon Web Services(AWS) 클라우드 인프라 위에서 운영됩니다. 검증된 글로벌 클라우드 환경에서 안정적으로 서비스를 제공합니다.',
    caption: 'Powered by AWS',
  },
  {
    icon: 'tabler:credit-card',
    title: '포스페이 전자결제(PG)',
    desc:
      '결제는 ㈜포스페이의 전자결제(PG) 솔루션을 통해 처리됩니다. 검증된 결제대행 시스템을 통해 결제가 이루어집니다.',
  },
  {
    icon: 'tabler:shield-lock',
    title: '비밀번호 보호',
    desc:
      '회원 비밀번호는 복호화가 불가능한 단방향 해시(PBKDF2)와 계정별 고유 salt로 저장됩니다. 데이터베이스가 노출되어도 원문 비밀번호를 확인할 수 없습니다.',
  },
];

const SecurityPage = () => (
  <Box>
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack spacing={2} alignItems="center" textAlign="center" mb={6}>
        <Typography sx={{ fontSize: 12, letterSpacing: 4, color: '#888', fontWeight: 700 }}>
          SECURITY &amp; TRUST
        </Typography>
        <Typography sx={{ fontSize: { xs: 26, md: 40 }, fontWeight: 900, letterSpacing: '-1.2px' }}>
          안전하게 운영되는 쇼핑몰
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#666', maxWidth: 560, lineHeight: 1.7 }}>
          ShopGo는 보안 통신, 검증된 클라우드 인프라, 전자결제(PG), 계정 보호를 기반으로
          가맹점과 고객이 믿고 사용할 수 있는 환경을 제공합니다.
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        {PILLARS.map((p) => (
          <Grid item xs={12} sm={6} key={p.title}>
            <Stack
              spacing={1.5}
              sx={{ p: 3, border: '1px solid #eee', borderRadius: 2, bgcolor: '#fff', height: '100%' }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  bgcolor: '#111',
                  color: '#a3e635',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon icon={p.icon} width={22} height={22} />
              </Box>
              <Typography sx={{ fontSize: 16, fontWeight: 800 }}>{p.title}</Typography>
              <Typography sx={{ fontSize: 13.5, color: '#666', lineHeight: 1.7 }}>{p.desc}</Typography>
              {p.caption && (
                <Typography sx={{ fontSize: 11, color: '#aaa', fontWeight: 700, letterSpacing: 0.5, pt: 0.5 }}>
                  {p.caption}
                </Typography>
              )}
            </Stack>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          mt: 5,
          p: 3,
          border: '1px dashed #ccc',
          borderRadius: 2,
          bgcolor: '#fafaf7',
          textAlign: 'center',
        }}
      >
        <Typography sx={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>
          보안 문의는{' '}
          <Box
            component="a"
            href="mailto:kimin6756@gmail.com"
            sx={{ color: '#111', fontWeight: 700, textDecoration: 'underline' }}
          >
            kimin6756@gmail.com
          </Box>
          {' '}으로 연락 주세요. 보안 체계는 지속적으로 강화되고 있습니다.
        </Typography>
      </Box>
    </Container>
  </Box>
);

SecurityPage.getLayout = (page) => <MainSiteLayout>{page}</MainSiteLayout>;

export default SecurityPage;
