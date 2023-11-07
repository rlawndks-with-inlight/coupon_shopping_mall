import PropTypes from 'prop-types';
import * as Yup from 'yup';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Stack,
  Button,
  Rating,
  Dialog,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormHelperText,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { toast } from 'react-hot-toast';
import { Upload } from "src/components/upload";
import { apiManager } from 'src/utils/api';
import { useEffect } from 'react';
// components

// ----------------------------------------------------------------------

ProductDetailsNewReviewForm.propTypes = {
  onClose: PropTypes.func,
};

export default function ProductDetailsNewReviewForm({ onClose, onChangePage, open, reviewData, setReviewData, onSubmit, ...other }) {
  const router = useRouter();
  const { themeDnsData } = useSettingsContext();
  const { user } = useAuthContext();
  const ReviewSchema = Yup.object().shape({
    rating: Yup.mixed().required('Rating is required'),
    review: Yup.string().required('Review is required'),
    name: Yup.string().required('Name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
  });
  const defaultValues = {
    rating: null,
    review: '',
    name: '',
    email: '',
  };

  useEffect(() => {
    if (!open) {
      setReviewData({
        product_id: router.query?.id,
        trans_id: 0,
        brand_id: themeDnsData?.id,
        scope: 0,
        user_id: user?.id,
        profile_file: undefined,
        profile_img: user?.profile_img ?? "",
        content: '',
      });
    }
  }, [open])
  const methods = useForm({
    resolver: yupResolver(ReviewSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onCancel = () => {
    onClose();
    reset();
  };
  return (
    <Dialog onClose={onClose} {...other} open={open}>
      <DialogTitle>리뷰 {reviewData?.id ? '수정' : '작성'}하기</DialogTitle>

      <DialogContent>
        <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1.5}>
          <Typography variant="body2">별점을 체크해 주세요:</Typography>

          <Controller
            name="rating"
            control={control}
            render={({ field }) => <Rating {...field} value={reviewData.scope / 2} precision={0.5} onChange={(e) => {
              setReviewData({
                ...reviewData,
                scope: e.target.value * 2
              })
            }} />}
          />
        </Stack>

        {!!errors.rating && <FormHelperText error> {errors.rating?.message}</FormHelperText>}
        <div style={{ marginTop: '1rem' }} />
        <Stack spacing={1}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            대표이미지등록
          </Typography>
          <Upload file={reviewData.profile_file || reviewData.profile_img} onDrop={(acceptedFiles) => {
            const newFile = acceptedFiles[0];
            if (newFile) {
              setReviewData(
                {
                  ...reviewData,
                  ['profile_file']: Object.assign(newFile, {
                    preview: URL.createObjectURL(newFile),
                  })
                }
              );
            }
          }}
            onDelete={() => {
              setReviewData(
                {
                  ...reviewData,
                  ['profile_file']: undefined,
                  ['profile_img']: '',
                }
              )
            }}
            fileExplain={{
              width: ''//파일 사이즈 설명
            }}
          />
        </Stack>
        <TextField
          label='제목'
          value={reviewData.title}
          sx={{ mt: 3, width: '100%' }}
          onChange={(e) => {
            setReviewData(
              {
                ...reviewData,
                ['title']: e.target.value
              }
            )
          }} />
        <TextField name="review" value={reviewData.content} label="리뷰를 작성해 주세요." multiline rows={6} sx={{ mt: 3, width: '100%' }} onChange={(e) => {
          setReviewData({
            ...reviewData,
            content: e.target.value
          })
        }} />
      </DialogContent>

      <DialogActions>
        <Button color="inherit" variant="outlined" onClick={onCancel}>
          취소
        </Button>

        <Button type="submit" variant="contained" onClick={onSubmit}>
          리뷰 {reviewData?.id ? '수정' : '작성'}하기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
