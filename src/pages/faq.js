import { Box, Container, Stack, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Icon } from '@iconify/react';
import MainSiteLayout from 'src/components/main-site/MainSiteLayout';

// 라이브용 — 답변이 확실한 질문만. (정산·수수료·환불·세금계산서·서류·디자인 편집범위 등
// 포스페이/우진 정책 확정이 필요한 항목은 답변 확보 후 추가)
const CATEGORIES = [
  {
    label: '결제 · 정산',
    items: [
      {
        q: '결제는 어떤 방식으로 이뤄지나요?',
        a: '포스페이 지정 PG(전자결제대행)를 통해 카드결제 등으로 안전하게 처리됩니다. 약정상 포스페이 지정 PG를 사용합니다.',
      },
      {
        q: '정산·수수료 등 결제 관련 문의는 어디로 하나요?',
        a: '가맹·결제 문의(office@forspay.com)로 연락해 주세요. 정산 주기·수수료 등 상세 사항을 안내해 드립니다.',
      },
    ],
  },
  {
    label: '쇼핑몰 운영',
    items: [
      {
        q: '쇼핑몰 주소(도메인)는 어떻게 정해지나요?',
        a: '신청 시 희망한 이름으로 가맹점명.shopgo.co.kr 주소가 자동 생성됩니다.',
      },
      {
        q: '관리자 계정은 어떻게 받나요?',
        a: '승인(개설) 시 안내 메일로 관리자 페이지 주소·아이디·초기 비밀번호가 발송됩니다. 초기 비밀번호는 아이디와 동일하며, 로그인 후 반드시 변경해 주세요. (관리자 페이지 우측 상단 프로필 → 비밀번호 변경)',
      },
      {
        q: '상품은 어떻게 등록하나요?',
        a: '관리자 페이지 → 상품관리 → 상품 추가에서 등록합니다. 등록 순서를 따라 하는 매뉴얼도 제공됩니다.',
      },
      {
        q: '상품을 잠시 숨기고 싶어요.',
        a: '상품 목록에서 해당 상품 상태를 ‘비공개’로 바꾸면 쇼핑몰에서 보이지 않습니다. 다시 ‘판매중’으로 되돌릴 수 있습니다.',
      },
      {
        q: '할인가는 어떻게 표시하나요?',
        a: '상품 등록/수정에서 ‘할인 표시하기’를 체크하면 ‘할인 전 가격(정가)’ 칸이 나타납니다. 정가를 판매가보다 높게 입력하면 쇼핑몰에 취소선과 할인율(%)이 함께 표시됩니다.',
      },
      {
        q: '주문 확인과 송장 입력은 어떻게 하나요?',
        a: '관리자 페이지 → 주문관리에서 확인합니다. 택배사 선택 + 송장번호 입력 후 저장하면, 구매자 주문내역에 택배사·송장번호와 ‘배송조회’ 링크가 표시됩니다.',
      },
      {
        q: '배송비는 어떻게 설정하나요?',
        a: '설정 → 배송비설정에서 기본 배송비와 무료배송 기준금액을 설정합니다. 기준금액 이상 주문 시 배송비가 무료로 적용됩니다.',
      },
      {
        q: '회원 관리는 어디서 하나요?',
        a: '관리자 페이지 → 회원관리에서 회원 상태 변경·비밀번호 변경 등을 할 수 있습니다.',
      },
      {
        q: '공지사항·문의 게시판이 있나요?',
        a: '개설 시 공지사항과 1:1문의가 기본 제공됩니다. 1:1문의는 작성자 본인과 관리자만 볼 수 있는 문의함으로 동작합니다.',
      },
      {
        q: '운영 매뉴얼은 어디서 보나요?',
        a: '개설 안내 메일의 매뉴얼 링크, 또는 shopgo.co.kr 매뉴얼 페이지에서 PDF로 제공됩니다.',
      },
    ],
  },
];

const FaqPage = () => (
  <Box>
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack spacing={1.5} alignItems="center" textAlign="center" mb={6}>
        <Typography sx={{ fontSize: 12, letterSpacing: 4, color: '#888', fontWeight: 700 }}>SUPPORT</Typography>
        <Typography sx={{ fontSize: { xs: 26, md: 40 }, fontWeight: 900, letterSpacing: '-1.2px' }}>
          자주 묻는 질문
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#666', maxWidth: 520, lineHeight: 1.7, wordBreak: 'keep-all' }}>
          가맹점 운영에 자주 나오는 질문을 결제·정산과 쇼핑몰 운영으로 나눠 정리했습니다.
        </Typography>
      </Stack>

      <Stack spacing={5}>
        {CATEGORIES.map((cat) => (
          <Box key={cat.label}>
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#a3e635' }} />
              <Typography sx={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, color: '#111' }}>
                {cat.label}
              </Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: '#eee' }} />
            </Stack>

            <Stack spacing={1.25}>
              {cat.items.map((it, idx) => (
                <Accordion
                  key={idx}
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
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1a1a1f', wordBreak: 'keep-all' }}>
                        {it.q}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2.5, pb: 2.25, pt: 0, pl: '52px' }}>
                    <Typography sx={{ fontSize: 14, color: '#666', lineHeight: 1.75, wordBreak: 'keep-all' }}>
                      {it.a}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>

      <Box sx={{ mt: 6, p: 3, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafaf7', textAlign: 'center' }}>
        <Typography sx={{ fontSize: 14, color: '#555', mb: 0.5 }}>원하는 답변을 찾지 못하셨나요?</Typography>
        <Typography sx={{ fontSize: 13, color: '#666', lineHeight: 1.8, wordBreak: 'keep-all' }}>
          쇼핑몰 기능 문의{' '}
          <Box component="a" href="mailto:kimin6756@gmail.com" sx={{ color: '#111', fontWeight: 700, textDecoration: 'underline' }}>
            kimin6756@gmail.com
          </Box>
          {' · '}가맹·결제 문의{' '}
          <Box component="a" href="mailto:office@forspay.com" sx={{ color: '#111', fontWeight: 700, textDecoration: 'underline' }}>
            office@forspay.com
          </Box>
        </Typography>
      </Box>
    </Container>
  </Box>
);

FaqPage.getLayout = (page) => <MainSiteLayout>{page}</MainSiteLayout>;

export default FaqPage;
