import { Box, Container, Stack, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Icon } from '@iconify/react';
import MainSiteLayout from 'src/components/main-site/MainSiteLayout';

// 라이브용 — 답변이 확실한 질문만. (정산·수수료·환불·세금계산서·서류·디자인 편집범위 등
// 포스페이/우진 정책 확정이 필요한 항목은 답변 확보 후 추가)
// 결제 섹션 = 포스페이 공식 Q&A(SHOPGO Q&A_결제 정산) 원문을 그대로 반영.
const CATEGORIES = [
  {
    label: '결제 · PG · 정산',
    items: [
      {
        q: 'SHOPGO에서 온라인 결제는 어떻게 이루어지나요?',
        a: 'SHOPGO는 PG(Payment Gateway)와 연동되어 안전하게 결제가 진행됩니다. 고객은 다양한 결제수단으로 주문할 수 있으며, 결제가 완료되면 주문 정보가 판매자에게 자동으로 전달됩니다.',
      },
      {
        q: 'SHOPGO는 어떤 PG(결제대행사)를 지원하나요?',
        a: '서비스 오픈 시점에는 페이레터(PayLetter)와 나이스정보통신(NICE)이 지원되며, NHN KCP·한국정보통신(KICC)·KSNET 및 기타 국내·글로벌 PG가 순차적으로 지원될 예정입니다. SHOPGO는 지속적으로 다양한 PG사를 확대하여 판매자가 원하는 결제환경을 선택할 수 있도록 지원합니다.',
      },
      {
        q: '사용할 수 있는 결제수단은 무엇인가요?',
        a: '선택한 PG사에 따라 신용카드·체크카드, 계좌이체, 간편결제(카카오페이·네이버페이·삼성페이), 해외발행카드(비자카드·마스터카드·JCB·UPI(은련카드)·AMX(아멕스카드)), 해외간편결제(위챗페이·알리페이·라인페이)를 이용할 수 있습니다. 제공되는 결제수단은 PG사별로 일부 차이가 있을 수 있습니다.',
      },
      {
        q: 'PG 계약은 반드시 해야 하나요?',
        a: '네. 온라인(모바일) 결제를 이용하려면 PG 계약이 필요합니다. SHOPGO에서는 PG 신청부터 심사, 계약, 쇼핑몰 연동까지 전 과정을 지원해 드립니다.',
      },
      {
        q: 'PG 심사는 얼마나 걸리나요?',
        a: '일반적으로 영업일 기준 2~3주 정도 소요되며, 업종 및 제출 서류에 따라 기간이 달라질 수 있습니다.',
      },
      {
        q: '결제 수수료는 얼마인가요?',
        a: '결제 수수료는 선택한 PG사와 업종에 따라 달라집니다. 정확한 수수료는 PG 심사 완료 후 안내해 드립니다.',
      },
      {
        q: '정산은 어떻게 이루어지나요?',
        a: '고객이 결제를 완료하면 계약한 PG사의 정산 정책에 따라 판매자에게 정산됩니다. 정산주기와 지급일은 PG사별 정책에 따라 운영됩니다.',
      },
      {
        q: '해외 고객도 결제가 가능한가요?',
        a: '가능합니다. 지원되는 PG를 선택하면 해외발행카드(비자카드·마스터카드·JCB·UPI(은련카드)·AMX(아멕스카드)) 및 해외간편결제(위챗페이·알리페이·라인페이)를 이용할 수 있습니다.',
      },
      {
        q: 'PG를 변경하거나 추가할 수 있나요?',
        a: '가능합니다. 사업 규모와 운영환경에 맞게 다른 PG를 추가하거나 변경할 수 있으며, SHOPGO에서 연동을 지원합니다.',
      },
      {
        q: '결제나 정산에 문제가 발생하면 어디로 문의하나요?',
        a: '결제 승인, 취소, 정산, 수수료 등 결제 관련 문의는 SHOPGO 고객센터 또는 담당 영업담당자를 통해 접수해 주시면 신속하게 지원해 드립니다. (가맹·결제 문의: office@forspay.com)',
      },
      {
        q: '무료쇼핑몰인데 결제서비스도 무료인가요?',
        a: 'SHOPGO 쇼핑몰 이용은 무료입니다. 다만, PG 결제서비스는 금융서비스이므로 계약한 PG사의 결제수수료 및 관련 비용은 별도로 적용됩니다.',
      },
      {
        q: 'PG사 결제내역은 어디서 확인하나요?',
        a: '계약한 PG사에서 제공하는 결제내역(거래내역) 페이지에서 직접 확인·출력하실 수 있습니다. 이용 중인 PG사의 조회 페이지는 아래와 같습니다.',
        links: [
          { label: '페이레터', url: 'https://www.payletter.com/ko/customer/history' },
          { label: '나이스정보통신', url: 'https://www.nicepay.co.kr/cs/transInfo/cardList.do' },
          { label: 'NHN KCP', url: 'https://www.kcp.co.kr/viewPaymentParent/viewPayment/' },
          { label: 'KSNET', url: 'https://nims.ksnet.co.kr/pg_infoc/src/bill/credit01.jsp' },
        ],
      },
    ],
  },
  {
    label: '쇼핑몰 운영',
    items: [
      {
        q: '쇼핑몰 주소(도메인)는 어떻게 정해지나요?',
        a: '신청 시 희망하신 이름으로 ‘가맹점명.shopgo.co.kr’ 형태의 주소가 자동 생성됩니다. 별도의 도메인 구매 없이 바로 쇼핑몰을 운영하실 수 있습니다.',
      },
      {
        q: '관리자 계정은 어떻게 받나요?',
        a: '승인(개설) 시 안내 메일로 관리자 페이지 주소·아이디·초기 비밀번호가 발송됩니다. 초기 비밀번호는 아이디와 동일하므로, 로그인 후 우측 상단 프로필 → 비밀번호 변경에서 반드시 변경해 주세요.',
      },
      {
        q: '상품은 어떻게 등록하나요?',
        a: '관리자 페이지 → 상품관리 → 상품 추가에서 상품명·판매가·대표이미지·옵션·재고를 입력해 등록합니다. 상품을 등록하려면 카테고리가 먼저 있어야 하니, 상품관리에서 카테고리를 만든 뒤 등록해 주세요.',
      },
      {
        q: '상품을 잠시 숨기고 싶어요.',
        a: '상품 목록에서 해당 상품 상태를 ‘비공개(숨김)’로 바꾸면 쇼핑몰에 노출되지 않습니다. 언제든 다시 ‘판매중’으로 되돌릴 수 있습니다.',
      },
      {
        q: '할인가는 어떻게 표시하나요?',
        a: '상품 등록/수정에서 ‘할인 표시하기’를 체크하면 ‘할인 전 가격(정가)’ 입력칸이 나타납니다. 정가를 판매가보다 높게 입력하면 쇼핑몰에 취소선과 할인율(%)이 함께 표시됩니다.',
      },
      {
        q: '주문 확인과 송장 입력은 어떻게 하나요?',
        a: '관리자 페이지 → 주문관리에서 들어온 주문을 확인하고 상태를 변경합니다. 상품 발송 후 택배사를 선택하고 송장번호를 입력해 저장하면, 구매자 주문내역에 택배사·송장번호와 ‘배송조회’ 링크가 표시됩니다.',
      },
      {
        q: '배송비는 어떻게 설정하나요?',
        a: '설정관리 → 배송비설정에서 기본 배송비와 무료배송 기준금액을 설정합니다. 기준금액 이상 주문 시 배송비가 무료로 적용되며, 배송비를 설정하지 않으면 무료배송으로 처리됩니다.',
      },
      {
        q: '회원 관리는 어디서 하나요?',
        a: '관리자 페이지 → 회원관리에서 가입 회원을 조회하고 상태 변경·비밀번호 변경 등을 처리할 수 있습니다. 회원 아이디·이름·전화번호로 검색하실 수 있습니다.',
      },
      {
        q: '공지사항·문의 게시판이 있나요?',
        a: '개설 시 공지사항과 1:1문의 게시판이 기본 제공됩니다. 1:1문의는 작성자 본인과 관리자만 볼 수 있으며, 문의 글에 답변을 작성해 저장하면 고객에게 답변이 등록됩니다.',
      },
      {
        q: '운영 매뉴얼은 어디서 보나요?',
        a: '개설 안내 메일의 매뉴얼 링크 또는 shopgo.co.kr 매뉴얼 페이지에서 관리자 가이드를 확인하실 수 있습니다. 처음 사용자를 위해 상품 등록부터 주문·배송 처리까지 순서대로 안내되어 있습니다.',
      },
    ],
  },
];

// 이 페이지의 wordBreak: 'keep-all' 들은 MainSiteLayout 의 줄바꿈 규칙을 일부러 안 따른다.
// 그 규칙은 '화면 언어'를 보는데, 위 CATEGORIES 는 아직 한국어로 고정돼 있어
// 일본어·중국어 화면에서도 한국어가 그대로 나온다. 상속에 맡기면 그 화면에서 깨진다.
// ▶ FAQ 문구를 사전으로 옮기는 날, 이 keep-all 들을 지우고 상속에 맡기면 된다.
const FaqPage = () => (
  <Box>
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack spacing={1.5} alignItems="center" textAlign="center" mb={6}>
        <Typography sx={{ fontSize: 12, letterSpacing: 4, color: '#888', fontWeight: 700 }}>SUPPORT</Typography>
        <Typography sx={{ fontSize: { xs: 26, md: 40 }, fontWeight: 900, letterSpacing: '-1.2px' }}>
          자주 묻는 질문
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#666', maxWidth: 520, lineHeight: 1.7, wordBreak: 'keep-all', textWrap: 'balance' }}>
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
                    {it.links && (
                      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.25 }}>
                        {it.links.map((lk) => (
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
