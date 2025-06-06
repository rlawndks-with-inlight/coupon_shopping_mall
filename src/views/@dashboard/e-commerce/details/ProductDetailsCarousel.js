import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';
// @mui
import { alpha, useTheme, styled } from '@mui/material/styles';
import { Box } from '@mui/material';
// utils
import { bgGradient } from 'src/utils/cssStyles';
// components
import Image from 'src/components/image/Image';
import Lightbox from 'src/components/lightbox/Lightbox';
import Carousel, { CarouselArrowIndex } from 'src/components/carousel';
import { useSettingsContext } from 'src/components/settings';
// ----------------------------------------------------------------------

const THUMB_SIZE = 100;

const StyledThumbnailsContainer = styled('div', {
  shouldForwardProp: (prop) => prop !== 'length',
})(({ length, theme, themeMode }) => ({
  margin: theme.spacing(0, 'auto'),
  position: 'relative',

  '& .slick-slide': {
    opacity: 1,
    '&.slick-current': {
      opacity: 1,
    },
    '& > div': {
      padding: theme.spacing(0, 0.75),
    },
  },

  ...(length === 1 && {
    maxWidth: THUMB_SIZE * 1 + 16,
  }),
  ...(length === 2 && {
    maxWidth: THUMB_SIZE * 2 + 32,
  }),
  ...((length === 3 || length === 4) && {
    maxWidth: THUMB_SIZE * 3 + 48,
  }),
  ...(length >= 5 && {
    maxWidth: THUMB_SIZE * 6,
  }),
  ...(length > 2 && {
    '&:before, &:after': {
      ...bgGradient({
        direction: 'to left',
        startColor: `${alpha(theme.palette.background.default, 0)} 0%`,
        endColor: `${themeMode == 'dark' ? '#000' : theme.palette.background.default} 10%`,
      }),
      top: 0,
      zIndex: 9,
      content: "''",
      height: '100%',
      position: 'absolute',
      //width: (THUMB_SIZE * 2) / 3,
    },
    '&:after': {
      right: 0,
      transform: 'scaleX(-1)',
    },
  }),
}));

// ----------------------------------------------------------------------

ProductDetailsCarousel.propTypes = {
  product: PropTypes.object,
};

export default function ProductDetailsCarousel({ product, type = '' }) {

  const { themeMode } = useSettingsContext();
  const theme = useTheme();

  const carousel1 = useRef(null);

  const carousel2 = useRef(null);

  const [nav1, setNav1] = useState();

  const [nav2, setNav2] = useState();

  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedImage, setSelectedImage] = useState(-1);

  /*useEffect(() => {
    console.log(product)
  }, [])*/

  const imagesLightbox = type == 'early' ? product?.sub_images?.product_sub_file ? product.sub_images?.map((img) => ({ src: img?.product_sub_file?.preview })) : product.sub_images?.map((img) => ({ src: img?.product_sub_img })) : product.images?.map((img) => ({ src: img }));
  const handleOpenLightbox = (imageUrl) => {
    const imageIndex = imagesLightbox.findIndex((image) => image.src === imageUrl);
    setSelectedImage(imageIndex);
  };

  const handleCloseLightbox = () => {
    setSelectedImage(-1);
  };

  let val = product.sub_images.length > 0 && product.sub_images[0].product_sub_file
    ? product.sub_images?.length
    : product.sub_images?.filter(
      item => typeof item === 'object' && item !== null && 'product_sub_img' in item && item['product_sub_img'] != null
    ).length;

  const carouselSettings1 = {
    dots: false,
    arrows: false,
    slidesToShow: 1,
    draggable: false,
    slidesToScroll: 1,
    adaptiveHeight: true,
    beforeChange: (current, next) => setCurrentIndex(next),
  };

  const carouselSettings2 = {
    dots: false,
    arrows: false,
    centerMode: true,
    swipeToSlide: true,
    focusOnSelect: true,
    variableWidth: true,
    centerPadding: '0px',
    slidesToShow: type == 'early' ? val > 3 ? 3 : val : product.images?.length > 3 ? 3 : product.images?.length,
  };

  useEffect(() => {
    if (carousel1.current) {
      setNav1(carousel1.current);
    }
    if (carousel2.current) {
      setNav2(carousel2.current);
    }
  }, []);

  useEffect(() => {
    carousel1.current?.slickGoTo(currentIndex?.index);
  }, [currentIndex]);

  const handlePrev = () => {
    carousel2.current?.slickPrev();
  };

  const handleNext = () => {
    carousel2.current?.slickNext();
  };

  const renderLargeImg = (
    <Box sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
      {type == 'early' ?
        <Carousel {...carouselSettings1} asNavFor={nav2} ref={carousel1}>
          {product.sub_images?.map((img, idx) => {
            if (img?.product_sub_file) {
              return <Image
                key={idx}
                alt="product"
                src={img?.product_sub_file?.preview}
                ratio="1/1"
                onClick={() => handleOpenLightbox(img)}
                sx={{ cursor: 'zoom-in', objectFit: 'cover' }}
              />
            } else if (img?.product_sub_img) {
              return <Image
                key={idx}
                alt="product"
                src={img?.product_sub_img}
                ratio="1/1"
                onClick={() => handleOpenLightbox(img)}
                sx={{ cursor: 'zoom-in', objectFit: 'cover' }}
              />
            }
          })}
        </Carousel>
        :
        <Carousel {...carouselSettings1} asNavFor={nav2} ref={carousel1}>
          {product.images?.map((img) => (
            <Image
              key={img}
              alt="product"
              src={img}
              ratio="1/1"
              onClick={() => handleOpenLightbox(img)}
              sx={{ cursor: 'zoom-in', objectFit: 'cover' }}
            />
          ))}
        </Carousel>
      }
      <CarouselArrowIndex
        index={currentIndex}
        total={type == 'early' ? val : product.images?.length}
        onNext={handleNext}
        onPrevious={handlePrev}
      />
    </Box>
  );
  const renderThumbnails = (
    <StyledThumbnailsContainer length={type == 'early' ? val : product.images?.length} themeMode={themeMode}>
      {type == 'early' ?
        <Carousel {...carouselSettings2} asNavFor={nav1} ref={carousel2}>
          {product.sub_images?.map((img, idx) => {
            if (img?.product_sub_file) {
              return <Image
                key={idx}
                disabledEffect
                alt="thumbnail"
                src={img?.product_sub_file?.preview}
                sx={{
                  width: THUMB_SIZE,
                  height: THUMB_SIZE,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  ...(currentIndex === idx && {
                    border: `solid 2px ${theme.palette.primary.main}`,
                  }),
                }}
              />
            } else if (img?.product_sub_img) {
              return <Image
                key={idx}
                disabledEffect
                alt="thumbnail"
                src={img?.product_sub_img}
                sx={{
                  width: THUMB_SIZE,
                  height: THUMB_SIZE,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  ...(currentIndex === idx && {
                    border: `solid 2px ${theme.palette.primary.main}`,
                  }),
                }}
              />
            }
          })}
        </Carousel>
        :
        <Carousel {...carouselSettings2} asNavFor={nav1} ref={carousel2}>
          {product.images?.map((img, index) => (
            <Image
              key={img}
              disabledEffect
              alt="thumbnail"
              src={img}
              sx={{
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                borderRadius: 1.5,
                cursor: 'pointer',
                ...(currentIndex === index && {
                  border: `solid 2px ${theme.palette.primary.main}`,
                }),
              }}
            />
          ))}
        </Carousel>
      }
    </StyledThumbnailsContainer>
  );

  return (
    <>
      <Box
        sx={{
          '& .slick-slide': {
            float: theme.direction === 'rtl' ? 'right' : 'left',
          },
        }}
      >
        {renderLargeImg}
        {renderThumbnails}
      </Box>

      <Lightbox
        index={selectedImage}
        slides={imagesLightbox}
        open={selectedImage >= 0}
        close={handleCloseLightbox}
        onGetCurrentIndex={(index) => {
          setSelectedImage(index?.index)
        }}
      />
    </>
  );
}
