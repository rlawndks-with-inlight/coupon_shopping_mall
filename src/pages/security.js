import { Box, Container, Stack, Typography, Grid } from '@mui/material';
import { Icon } from '@iconify/react';
import MainSiteLayout from 'src/components/main-site/MainSiteLayout';

// 실제로 사실인 항목만 기재. 항목·순서·로고는 메인 최하단 TRUST 섹션과 통일.
const PILLARS = [
  {
    icon: 'tabler:credit-card',
    title: '안전결제',
    desc: 'PG·글로벌 PSP·매입사 결제를 안전하게 지원합니다.',
  },
  {
    icon: 'tabler:cloud',
    title: 'AWS 클라우드 인프라',
    desc:
      'ShopGo는 Amazon Web Services(AWS) 클라우드 인프라 위에서 운영됩니다. 검증된 글로벌 클라우드 환경에서 안정적으로 서비스를 제공합니다.',
    logo: '/assets/images/powered-by-aws.png',
    logoH: 30,
  },
  {
    icon: 'tabler:lock',
    title: '개인정보 암호화 저장',
    desc:
      '회원과 주문자의 이름·연락처·주소 등 개인정보를 데이터베이스에 암호화하여 저장합니다.',
  },
  {
    icon: 'tabler:shield-lock',
    title: '결제정보 미보관',
    desc:
      '카드 결제는 결제사(PG)의 인증 화면에서 직접 처리되며, ShopGo 서버에는 전체 카드번호가 저장되지 않습니다.',
  },
];

const SecurityPage = () => (
  <Box>
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack spacing={2} alignItems="center" textAlign="center" mb={6}>
        <Typography sx={{ fontSize: 12, letterSpacing: 4, color: '#888', fontWeight: 700 }}>
          SECURITY &amp; TRUST
        </Typography>
        <Typography sx={{ fontSize: { xs: 26, md: 40 }, fontWeight: 900, letterSpacing: '-1.2px' }}>
          안전하게 운영되는 쇼핑몰
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#666', maxWidth: 560, lineHeight: 1.7 }}>
          ShopGo는 안전한 결제, 검증된 클라우드 인프라, 개인정보 암호화, 결제정보 보호를
          기반으로 가맹점과 고객이 믿고 사용할 수 있는 환경을 제공합니다.
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        {PILLARS.map((p) => (
          <Grid item xs={12} sm={6} md={3} key={p.title}>
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
              <Typography sx={{ fontSize: 16, fontWeight: 800, wordBreak: 'keep-all' }}>{p.title}</Typography>
              <Typography sx={{ fontSize: 13.5, color: '#666', lineHeight: 1.7, flexGrow: 1, wordBreak: 'keep-all' }}>{p.desc}</Typography>
              {p.logo && (
                <Box
                  component="img"
                  src={p.logo}
                  alt={p.title}
                  sx={{ height: p.logoH || 26, width: 'auto', mt: 0.5, alignSelf: 'flex-start' }}
                />
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
