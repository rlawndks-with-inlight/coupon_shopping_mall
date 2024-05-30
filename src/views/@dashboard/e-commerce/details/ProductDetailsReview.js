import PropTypes from 'prop-types';
import { useState } from 'react';
import sumBy from 'lodash/sumBy';
// @mui
import { Divider, Typography, Rating, Button, LinearProgress, Stack, Box, CircularProgress, Dialog } from '@mui/material';
// utils
// components
import Iconify from 'src/components/iconify/Iconify';
//
import ProductDetailsReviewList from './ProductDetailsReviewList';
import ProductDetailsReviewNewDialog from './ProductDetailsNewReviewForm';
import { fShortenNumber } from 'src/utils/formatNumber';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import toast from 'react-hot-toast';
import { commarNumber } from 'src/utils/function';
import { useRouter } from 'next/router';
import { useSettingsContext } from 'src/components/settings';
import { apiManager } from 'src/utils/api';
import { useEffect } from 'react';
import { useLocales } from 'src/locales';
import { PointerText } from 'src/components/elements/styled-components';

// ----------------------------------------------------------------------

ProductDetailsReview.propTypes = {
  product: PropTypes.object,
};

export default function ProductDetailsReview({ product, reviewContent, onChangePage, reviewPage }) {

  const { translate } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const { user } = useAuthContext();
  const { rating, totalReview, ratings = [], product_average_scope } = product;

  const router = useRouter();

  const [openReview, setOpenReview] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [reviewData, setReviewData] = useState({
    product_id: router.query?.id,
    trans_id: 0,
    brand_id: themeDnsData?.id,
    scope: 0,
    user_id: user?.id,
    profile_file: undefined,
    profile_img: user?.profile_img ?? "",
    content: '',
  })
  const handleOpenReview = (data) => {
    if (!user) {
      toast.error(<PointerText onClick={() => router.push('/shop/auth/login')}>{translate('로그인을 해주세요.')}</PointerText>);
      return;
    }
    setOpenReview(true);
  };

  const handleCloseReview = () => {
    setOpenReview(false);
  };
  const onSubmit = async () => {
    setEditLoading(true);
    let result = undefined;
    if (reviewData?.id) {
      result = await apiManager('product-reviews', 'update', reviewData);
    } else {
      result = await apiManager('product-reviews', 'create', reviewData);
    }
    if (result) {
      toast.success(translate(`성공적으로 리뷰를 ${reviewData?.id ? '수정' : '작성'}하였습니다.`));
      handleCloseReview();
      setEditLoading(false);

      onChangePage(reviewPage);
    }

  }
  const deleteReview = async (id) => {
    let result = await apiManager('product-reviews', 'delete', { id });
    if (result) {
      onChangePage(reviewPage);
    }
  }
  return (
    <>
      <Dialog open={editLoading}
        onClose={() => {
          setEditLoading(false);
        }}
        PaperProps={{
          style: {
            background: 'transparent',
            overflow: 'hidden'
          }
        }}
      >
        <CircularProgress />
      </Dialog>
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          md: 'repeat(3, 1fr)',
        }}
      >
        <Stack
          alignItems="center"
          justifyContent="center"
          spacing={1}
          sx={{
            pt: 2,
            pb: 2,

          }}
        >
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            {translate('평점')}
          </Typography>

          <Typography variant="h2">{commarNumber(product_average_scope ?? 0)}/5</Typography>
          <Rating readOnly value={product_average_scope ?? 0} precision={0.1} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            ({fShortenNumber(reviewContent?.total)} {translate('리뷰')})
          </Typography>
        </Stack>

        <Stack
          spacing={1.5}
          sx={{
            p: 3,
            py: { md: 5 },
            borderLeft: (theme) => ({ md: `dashed 1px ${theme.palette.divider}` }),
            borderRight: (theme) => ({ md: `dashed 1px ${theme.palette.divider}` }),
          }}
        >
        </Stack>

        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            pt: { xs: 3, md: 0 },
            pb: { xs: 5, md: 0 },
          }}
        >
          <Button
            color="inherit"
            size="large"
            onClick={handleOpenReview}
            variant="outlined"
            startIcon={<Iconify icon="eva:edit-fill" />}
          >
            {translate('리뷰 작성하기')}
          </Button>
        </Stack>
      </Box>

      <Divider />

      <ProductDetailsReviewList reviews={product.reviews} reviewData={reviewData} handleOpenReview={handleOpenReview} setReviewData={setReviewData} deleteReview={deleteReview} reviewContent={reviewContent} onChangePage={onChangePage} />

      <ProductDetailsReviewNewDialog onSubmit={onSubmit} reviewData={reviewData} setReviewData={setReviewData} open={openReview} onClose={handleCloseReview} onChangePage={onChangePage} />
    </>
  );
}

// ----------------------------------------------------------------------

ProgressItem.propTypes = {
  star: PropTypes.object,
  total: PropTypes.number,
};

function ProgressItem({ star, total }) {
  const { name, starCount, reviewCount } = star;

  return (
    <Stack direction="row" alignItems="center">
      <Typography variant="subtitle2" sx={{ width: 42 }}>
        {name}
      </Typography>

      <LinearProgress
        color="inherit"
        variant="determinate"
        value={(starCount / total) * 100}
        sx={{
          mx: 2,
          flexGrow: 1,
        }}
      />

      <Typography
        variant="body2"
        sx={{
          minWidth: 48,
          color: 'text.secondary',
        }}
      >
        {fShortenNumber(reviewCount)}
      </Typography>
    </Stack>
  );
}
