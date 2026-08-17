import { Box, Container, Stack, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Icon } from '@iconify/react';
import MainSiteLayout from 'src/components/main-site/MainSiteLayout';
import { useSubpageT } from 'src/components/main-site/landingStrings';

// 자주 묻는 질문.
//
// 문구는 전부 사전(landingStrings 의 SUBPAGE_FLAT, faq.* 키)에 있다.
// 예전에는 질문·답변 22개가 이 파일에 한국어로 박혀 있었다. 그래서 영어·일본어·중국어·
// 스페인어 화면에서도 이 페이지만 통째로 한국어였다 — 해외 판매가 소구점인 서비스에서
// 정작 '어떻게 파는지' 를 설명하는 페이지를 못 읽었다.
//
// 답변 내용 자체는 포스페이 공식 Q&A(SHOPGO Q&A_결제 정산) 원문을 반영한 것이다.
// 답변이 확실하지 않은 항목(수수료율·서류·디자인 편집범위 등)은 넣지 않는다.
//
// 항목을 늘릴 때: 사전 5개 언어에 faq.pN.q / faq.pN.a 를 넣고 아래 목록에 키만 추가한다.
// 한 언어라도 빠지면 그 화면에서만 키 문자열이 그대로 보인다(i18next 는 못 찾은 키를 그대로 돌려준다).
const CATEGORIES = [
  { labelKey: 'faq.catPay', keys: ['faq.p1', 'faq.p2', 'faq.p3', 'faq.p4', 'faq.p5', 'faq.p6',
                                   'faq.p7', 'faq.p8', 'faq.p9', 'faq.p10', 'faq.p11', 'faq.p12'] },
  { labelKey: 'faq.catShop', keys: ['faq.s1', 'faq.s2', 'faq.s3', 'faq.s4', 'faq.s5',
                                    'faq.s6', 'faq.s7', 'faq.s8', 'faq.s9', 'faq.s10'] },
];

// PG 사 조회 페이지. 회사 이름과 주소라 번역하지 않는다.
const LINKS = {
  'faq.p12': [
    { label: '페이레터', url: 'https://www.payletter.com/ko/customer/history' },
    { label: '나이스정보통신', url: 'https://www.nicepay.co.kr/cs/transInfo/cardList.do' },
    { label: 'NHN KCP', url: 'https://www.kcp.co.kr/viewPaymentParent/viewPayment/' },
    { label: 'KSNET', url: 'https://nims.ksnet.co.kr/pg_infoc/src/bill/credit01.jsp' },
  ],
};

const 문의 = [
  { key: 'faq.askShop', mail: 'kimin6756@gmail.com' },
  { key: 'faq.askPay', mail: 'office@forspay.com' },
];

// wordBreak: 'keep-all' 은 MainSiteLayout 에서 상속받는다.
// 예전엔 이 페이지가 한국어 고정이라 여기에 직접 박아 뒀는데, 이제 화면 언어를 따라가므로
// 레이아웃 규칙에 맡긴다(일본어·중국어에서 keep-all 이면 문장이 통째로 안 끊겨 넘친다).
const FaqPage = () => {
  const st = useSubpageT();
  return (
    <Box>
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={1.5} alignItems="center" textAlign="center" mb={6}>
          <Typography sx={{ fontSize: 12, letterSpacing: 4, color: '#888', fontWeight: 700 }}>SUPPORT</Typography>
          <Typography sx={{ fontSize: { xs: 26, md: 40 }, fontWeight: 900, letterSpacing: '-1.2px' }}>
            {st('faq.title')}
          </Typography>
          <Typography sx={{ fontSize: 14, color: '#666', maxWidth: 520, lineHeight: 1.7, textWrap: 'balance' }}>
            {st('faq.desc')}
          </Typography>
        </Stack>

        <Stack spacing={5}>
          {CATEGORIES.map((cat) => (
            <Box key={cat.labelKey}>
              <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#a3e635' }} />
                <Typography sx={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, color: '#111' }}>
                  {st(cat.labelKey)}
                </Typography>
                <Box sx={{ flex: 1, height: '1px', bgcolor: '#eee' }} />
              </Stack>

              <Stack spacing={1.25}>
                {cat.keys.map((k) => (
                  <Accordion
                    key={k}
                    disableGutters
                    elevation={0}
                    sx={{
                      border: '1px solid #eee',
                      borderRadius: '12px !important',
                      bgcolor: '#fff',
                      '&:before': { display: 'none' },
                      overflow: 'hidden',
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<Icon icon="tabler:chevron-down" width={18} height={18} color="#a3a3ac" />}
                      sx={{ px: 2.5, py: 0.5, '& .MuiAccordionSummary-content': { my: 1.75 } }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                        <Box
                          sx={{
                            flex: 'none',
                            width: 20,
                            height: 20,
                            mt: '1px',
                            borderRadius: 1,
                            bgcolor: 'rgba(163,230,53,0.18)',
                            color: '#5a8a1e',
                            fontSize: 12,
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          Q
                        </Box>
                        <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1a1a1f' }}>
                          {st(`${k}.q`)}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 2.5, pb: 2.25, pt: 0, pl: '52px' }}>
                      <Typography sx={{ fontSize: 14, color: '#666', lineHeight: 1.75 }}>
                        {st(`${k}.a`)}
                      </Typography>
                      {LINKS[k] && (
                        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.25 }}>
                          {LINKS[k].map((lk) => (
                            <Box
                              key={lk.url}
                              component="a"
                              href={lk.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: '#5a8a1e',
                                textDecoration: 'none',
                                border: '1px solid #e3efcf',
                                borderRadius: 1,
                                px: 1.25,
                                py: 0.5,
                                '&:hover': { bgcolor: '#f5fae9' },
                              }}
                            >
                              {lk.label} ↗
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>

        <Box sx={{ mt: 6, p: 3, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafaf7', textAlign: 'center' }}>
          <Typography sx={{ fontSize: 14, color: '#555', mb: 0.5 }}>{st('faq.notFound')}</Typography>
          <Typography sx={{ fontSize: 13, color: '#666', lineHeight: 1.8 }}>
            {문의.map((f, i) => (
              <Box component="span" key={f.key}>
                {i > 0 && ' · '}
                {st(f.key)}{' '}
                <Box component="a" href={`mailto:${f.mail}`}
                  sx={{ color: '#111', fontWeight: 700, textDecoration: 'underline' }}>
                  {f.mail}
                </Box>
              </Box>
            ))}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

FaqPage.getLayout = (page) => <MainSiteLayout>{page}</MainSiteLayout>;

export default FaqPage;
