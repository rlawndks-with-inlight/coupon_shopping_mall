import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Container, Card, Stack, Typography, Button, TextField, Alert, Box } from '@mui/material';
import { toast } from 'react-hot-toast';
import ManagerLayout from 'src/layouts/manager/ManagerLayout';
import { useSettingsContext } from 'src/components/settings';
import { apiManager } from 'src/utils/api';
import { getHomeTextSchema } from 'src/data/home-texts';
import { homeTextPreviewSrc } from 'src/data/section-preview';

// 홈 문구가 화면 어디에 나오는지 보여주는 그림.
// 그림 속 글자가 곧 칸 이름이라 좌표를 따로 관리하지 않는다.
// 이미지가 없으면 아무것도 그리지 않는다 — 깨진 아이콘이 뜨면 가맹점은 자기가 잘못한 줄 안다.
const HomeTextGuide = ({ demoNum }) => {
  const [있음, set있음] = useState(true);
  useEffect(() => { set있음(true); }, [demoNum]);
  if (!있음 || !demoNum) return null;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontSize: 12.5, color: '#666', mb: 0.75 }}>
        아래 번호가 각 칸이 나오는 자리입니다.
      </Typography>
      <Box sx={{ border: '1px solid #eee', borderRadius: 1, overflow: 'hidden', lineHeight: 0 }}>
        <img src={homeTextPreviewSrc(demoNum)} alt="" onError={() => set있음(false)}
          style={{ width: '100%', display: 'block' }} />
      </Box>
    </Box>
  );
};

// 홈 문구 편집 — 블로그 단일상품 데모의 하드코딩 문구를 가맹점이 직접 입력.
// 현재 브랜드의 blog_demo_num 에 해당하는 스키마 필드만 렌더. 비워두면 데모 기본값 표시.
const HomeTextsPage = () => {
  const { themeDnsData } = useSettingsContext();
  const so = themeDnsData?.setting_obj ?? {};
  const demoNum = Number(themeDnsData?.blog_demo_num);
  const schema = getHomeTextSchema(demoNum);
  const storeKey = `demo${demoNum}`;

  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(so?.home_texts?.[storeKey] ?? {});
  }, [themeDnsData?.id, storeKey]);

  const onSave = async () => {
    setSaving(true);
    const result = await apiManager('brands', 'update', {
      id: themeDnsData?.id,
      setting_obj: { ...so, home_texts: { ...(so.home_texts ?? {}), [storeKey]: values } },
    });
    setSaving(false);
    if (result) {
      toast.success('홈 문구가 저장되었습니다.');
      window.location.reload();
    }
  };

  return (
    <>
      <Head><title>홈 문구 편집</title></Head>
      <Container maxWidth="sm" sx={{ py: { xs: 3, md: 4 } }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 900 }}>홈 문구 편집</Typography>
          <Typography sx={{ fontSize: 13.5, color: '#666', lineHeight: 1.7 }}>
            홈 화면 문구를 직접 입력합니다. <b>비워두면 기본 문구</b>가 그대로 표시됩니다.
          </Typography>
        </Stack>

        {!schema ? (
          <Alert severity="info">
            현재 데모(블로그 {demoNum || '-'})는 홈 문구 편집을 아직 지원하지 않습니다.
          </Alert>
        ) : (
          <Card variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
            <Typography sx={{ fontSize: 13, color: '#888', mb: 2 }}>{schema.label}</Typography>
            {/* 어느 칸이 화면 어디에 나오는지.
                가맹점 요청(2026-08-24): "정확히 어디 문구 인지 이미지로 보여주면 좋을 듯 합니다."
                그림 속 글자가 곧 칸 이름이다(① 에디션 표기 …) — 좌표를 따로 적어 두지 않았다.
                다시 만들기: node scripts/section-preview/capture.cjs
                이미지가 없으면 아무것도 안 그린다(깨진 아이콘을 보여주지 않는다). */}
            <HomeTextGuide demoNum={demoNum} />
            <Stack spacing={2}>
              {schema.fields.map((f, i) => (
                <TextField
                  key={f.key}
                  label={`${['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','⑪','⑫'][i] ?? (i + 1)} ${f.label}`}
                  placeholder={`기본값: ${f.placeholder}`}
                  value={values[f.key] ?? ''}
                  multiline={!!f.multiline}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  fullWidth
                  size="small"
                />
              ))}
            </Stack>
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button variant="contained" onClick={onSave} disabled={saving}>
                저장
              </Button>
            </Stack>
          </Card>
        )}
      </Container>
    </>
  );
};

HomeTextsPage.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default HomeTextsPage;
