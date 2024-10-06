import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { Stack, Button, Rating, Avatar, Pagination, Typography, IconButton, Divider } from '@mui/material';
// utils
// components
import Iconify from 'src/components/iconify/Iconify';
import { Row } from 'src/components/elements/styled-components';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { Icon } from '@iconify/react';
import { useModal } from 'src/components/dialog/ModalProvider';

// ----------------------------------------------------------------------

ProductDetailsReviewList.propTypes = {
  reviews: PropTypes.array,
};

export default function ProductDetailsReviewList({ reviews = [], handleOpenReview, reviewContent, onChangePage, reviewData, setReviewData, deleteReview }) {
  const getMaxPage = (total, page_size) => {
    if (total == 0) {
      return 1;
    }
    if (total % page_size == 0) {
      return parseInt(total / page_size);
    } else {
      return parseInt(total / page_size) + 1;
    }
  }
  return (
    <>
      <Stack
        spacing={5}
        sx={{
          pt: 5,
          pl: {
            xs: 2.5,
            md: 0,
          },
          pr: {
            xs: 2.5,
            md: 5,
          },
        }}
      >
        {reviewContent?.content && reviewContent?.content.map((review) => (
          <ReviewItem key={review.id} handleOpenReview={handleOpenReview} review={review} onChangePage={onChangePage} reviewData={reviewData} setReviewData={setReviewData} deleteReview={deleteReview} />
        ))}
      </Stack>

      <Stack
        alignItems={{
          xs: 'center',
          md: 'flex-end',
        }}
        sx={{
          my: 5,
          mr: { md: 5 },
        }}
      >
        <Pagination
          count={getMaxPage(reviewContent?.total, reviewContent?.page_size)}
          page={parseInt(reviewContent?.page)}
          onChange={(_, num) => {
            onChangePage(num)
          }}
        />
      </Stack>
    </>
  );
}

// ----------------------------------------------------------------------

ReviewItem.propTypes = {
  review: PropTypes.object,
};

function ReviewItem({ review, onChangePage, reviewData, setReviewData, deleteReview, handleOpenReview }) {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const { nickname, scope, content, avatarUrl, isPurchased, created_at, title, profile_img, content_img, user_id, id } = review;

  return (
    <Stack
      spacing={2}
      direction={{
        xs: 'column',
        md: 'row',
      }}
      style={{ paddingBottom: '1rem', borderBottom: '1px solid lightgray', marginTop: '1rem' }}
    >
      <Stack
        spacing={2}
        alignItems="center"
        direction={{
          xs: 'row',
          md: 'column',
        }}
        sx={{
          width: { md: '20%' },
          textAlign: { md: 'center' },
        }}
        style={{
          //width: '240px !important'
        }}
      >
        {/*
        <Avatar
          src={avatarUrl}
          sx={{
            width: { md: 64 },
            height: { md: 64 },
          }}
        />
*/}
        {
          content_img &&
          <>
            <img style={{ maxHeight: '100px', }} src={content_img} />
          </>
        }

        <Stack spacing={{ md: 0.5 }}>
          <Typography variant="subtitle2" noWrap >
            {nickname}
          </Typography>

          <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
            {created_at}
          </Typography>
        </Stack>
      </Stack>

      <Stack spacing={1} flexGrow={1} style={{
        maxWidth: '920px',
      }}>
        <Rating size="small" value={scope / 2} precision={0.1} readOnly />
        <img style={{ width: '200px', height: 'auto' }} /*src={profile_img}*/ />
        {isPurchased && (
          <Typography
            variant="caption"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'success.main',
            }}
          >
            <Iconify icon="ic:round-verified" width={16} sx={{ mr: 0.5 }} />
            Verified purchase
          </Typography>
        )}

        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="body2">{content}</Typography>
      </Stack>
      {user_id == user?.id &&
        <>
          <Stack spacing={1} style={{
            marginLeft: 'auto',
          }}>
            <Row>
              <IconButton onClick={() => {
                setReviewData(review)
                handleOpenReview();
              }}>
                <Icon icon={'material-symbols:edit-outline'} />
              </IconButton>
              <IconButton onClick={() => {
                setModal({
                  func: () => { deleteReview(id) },
                  icon: 'material-symbols:delete-outline',
                  title: '정말 삭제하시겠습니까?'
                })
              }}>
                <Icon icon='material-symbols:delete-outline' />
              </IconButton>
            </Row>
          </Stack>
        </>}
    </Stack>
  );
}
