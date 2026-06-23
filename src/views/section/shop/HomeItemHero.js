import styled from 'styled-components'
import { Row, themeObj } from 'src/components/elements/styled-components'
import { useLocales } from 'src/locales'
import { formatLang } from 'src/utils/format'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { commarNumber } from 'src/utils/function'
import { useSettingsContext } from 'src/components/settings'
import { useRouter } from 'next/router'
import { useMediaQuery } from '@mui/material'

const fixImgUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  return url;
};

const SectionTitle = styled.div`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 1rem;
`
const Badge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
`

const pHelper = (product, currentLang) => {
  const img = fixImgUrl(product?.product_img);
  const name = formatLang(product, 'product_name', currentLang);
  const comment = product?.product_comment;
  const sale = product?.product_sale_price || product?.product_price || 0;
  const orig = product?.product_price || 0;
  const hasSale = orig > sale && sale > 0;
  const disc = hasSale ? Math.round((orig - sale) * 100 / orig) : 0;
  return { img, name, comment, sale, orig, hasSale, disc };
};

/* ══════════════════════════════════════
   단일 상품 - 타입 1: 매거진 커버 스토리
   좌측 편집자 서문 스타일 + 우측 대형 이미지
   ══════════════════════════════════════ */
const renderSingleBanner = (product, router, currentLang, mainColor, isMobile) => {
  const { img, name, comment, sale, orig, hasSale, disc } = pHelper(product, currentLang);
  const today = new Date();
  const dateStr = `VOL. ${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}`;
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 0,
      borderTop: '4px double #1a1a1a', borderBottom: '4px double #1a1a1a',
      cursor: 'pointer', minHeight: isMobile ? 'auto' : '420px',
    }} onClick={() => router?.push?.(`/shop/item/${product?.id}`)}>
      <div style={{
        padding: isMobile ? '1.5rem 1.25rem' : '3rem 2.5rem',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: isMobile ? 'none' : '1px solid #e8e8e8',
        borderBottom: isMobile ? '1px solid #e8e8e8' : 'none',
        background: '#fafaf7', order: isMobile ? 2 : 0,
      }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '1rem' : '2rem', paddingBottom: '1rem', borderBottom: '1px solid #d0d0d0' }}>
            <div style={{ fontSize: '10px', letterSpacing: '3px', fontWeight: 'bold' }}>{dateStr}</div>
            {hasSale && <Badge style={{ background: '#1a1a1a', color: '#fff' }}>ON SALE</Badge>}
          </div>
          <div style={{
            fontSize: isMobile ? '12px' : '14px', letterSpacing: '4px', color: mainColor,
            fontWeight: 'bold', marginBottom: '0.75rem', textTransform: 'uppercase',
          }}>Cover Story</div>
          <div style={{
            fontSize: isMobile ? '24px' : '36px', fontWeight: '900', lineHeight: 1.15,
            letterSpacing: '-1px', fontFamily: 'serif', marginBottom: '1rem',
          }}>{name}</div>
          {comment && (
            <div style={{ fontSize: isMobile ? '13px' : '15px', lineHeight: 1.7, color: themeObj.grey[600], paddingLeft: '0.75rem', borderLeft: `3px solid ${mainColor}`, fontStyle: 'italic', marginBottom: isMobile ? '1rem' : '2rem' }}>
              "{comment}"
            </div>
          )}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {hasSale && <span style={{ fontSize: '14px', textDecoration: 'line-through', color: themeObj.grey[400] }}>{commarNumber(orig)}원</span>}
            <span style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 'bold', color: mainColor, fontFamily: 'serif' }}>{commarNumber(sale)}원</span>
          </div>
          <div style={{
            display: 'inline-block', padding: isMobile ? '10px 24px' : '12px 36px',
            background: '#1a1a1a', color: '#fff',
            fontSize: isMobile ? '11px' : '12px', fontWeight: 'bold', letterSpacing: '3px',
          }}>READ THE STORY →</div>
        </div>
      </div>
      <div style={{
        background: `linear-gradient(135deg, ${mainColor}15 0%, ${mainColor}05 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '2rem 1rem' : '3rem',
      }}>
        <LazyLoadImage style={{
          maxWidth: isMobile ? '180px' : '320px', maxHeight: isMobile ? '180px' : '320px', objectFit: 'contain',
          filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.2))',
        }} src={img} />
      </div>
    </div>
  );
};

/* 단일 상품 - 타입 2: 매거진 피처 스프레드
   양쪽 대칭 펼침면, 중앙 이미지 + 좌우 에디토리얼
*/
const renderSingleFullbleed = (product, router, currentLang, mainColor, isMobile) => {
  const { img, name, comment, sale, orig, hasSale, disc } = pHelper(product, currentLang);
  return (
    <div style={{
      position: 'relative', padding: isMobile ? '2rem 1.25rem' : '3rem 2rem', cursor: 'pointer',
      background: '#1a1a1a', color: '#fff',
      borderRadius: '16px', overflow: 'hidden',
    }} onClick={() => router?.push?.(`/shop/item/${product?.id}`)}>
      <div style={{
        position: 'absolute', top: '2rem', right: '2rem',
        fontSize: isMobile ? '60px' : '120px', fontWeight: '900', opacity: 0.06,
        lineHeight: 1, letterSpacing: '-8px', fontFamily: 'serif',
      }}>01</div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr auto 1fr',
        gap: isMobile ? '1.25rem' : '2rem',
        alignItems: 'center', position: 'relative', zIndex: 1,
      }}>
        <div style={{ textAlign: isMobile ? 'center' : 'right' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', color: mainColor, fontWeight: 'bold', marginBottom: '0.75rem' }}>EDITOR'S PICK</div>
          <div style={{
            fontSize: isMobile ? '22px' : '28px', fontWeight: '900', lineHeight: 1.2,
            letterSpacing: '-0.5px', fontFamily: 'serif', marginBottom: '0.75rem',
          }}>{name}</div>
          {comment && (
            <div style={{ fontSize: '13px', lineHeight: 1.7, opacity: 0.75, fontStyle: 'italic' }}>
              {comment}
            </div>
          )}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: isMobile ? '1rem' : '1.5rem', background: '#fff', borderRadius: '50%',
          width: isMobile ? '180px' : '280px', height: isMobile ? '180px' : '280px',
          margin: isMobile ? '0 auto' : '0',
        }}>
          <LazyLoadImage style={{ maxWidth: isMobile ? '140px' : '220px', maxHeight: isMobile ? '140px' : '220px', objectFit: 'contain' }} src={img} />
        </div>
        <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
          <div style={{ fontSize: '10px', letterSpacing: '4px', opacity: 0.5, marginBottom: '0.5rem' }}>PRICE</div>
          {hasSale && (
            <div style={{ fontSize: '14px', textDecoration: 'line-through', opacity: 0.4, marginBottom: '0.25rem' }}>
              {commarNumber(orig)}원
            </div>
          )}
          <div style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: '900', fontFamily: 'serif', color: mainColor, marginBottom: '0.5rem' }}>
            {commarNumber(sale)}원
          </div>
          {hasSale && (
            <div style={{ fontSize: '12px', color: '#ff6b6b', letterSpacing: '2px', fontWeight: 'bold', marginBottom: '1rem' }}>
              {disc}% OFF
            </div>
          )}
          <div style={{
            display: 'inline-block', padding: '12px 28px',
            border: `2px solid ${mainColor}`, color: mainColor,
            fontSize: '11px', fontWeight: 'bold', letterSpacing: '3px',
          }}>VIEW DETAIL</div>
        </div>
      </div>
    </div>
  );
};

/* 단일 상품 - 타입 3: 매거진 인터뷰 포맷
   인용구가 주인공, 상품이 인터뷰이 위치
*/
const renderSingleCard = (product, router, currentLang, mainColor, isMobile) => {
  const { img, name, comment, sale, orig, hasSale, disc } = pHelper(product, currentLang);
  return (
    <div style={{
      padding: isMobile ? '2.5rem 1.25rem' : '4rem 2rem', cursor: 'pointer',
      maxWidth: '720px', margin: '0 auto', textAlign: 'center',
      position: 'relative',
    }} onClick={() => router?.push?.(`/shop/item/${product?.id}`)}>
      <div style={{
        fontSize: isMobile ? '80px' : '120px', color: mainColor, opacity: 0.15,
        lineHeight: 0.5, fontFamily: 'serif', marginBottom: '1rem',
      }}>"</div>
      <div style={{
        fontSize: '11px', letterSpacing: '5px', fontWeight: 'bold',
        color: mainColor, marginBottom: '1.25rem',
      }}>INTERVIEW</div>
      <div style={{
        fontSize: isMobile ? '18px' : '24px', fontWeight: '400', lineHeight: 1.5,
        letterSpacing: '-0.3px', fontFamily: 'serif', fontStyle: 'italic',
        maxWidth: '500px', margin: isMobile ? '0 auto 1.5rem' : '0 auto 2.5rem',
        color: '#1a1a1a',
      }}>
        {comment || name}
      </div>
      <div style={{
        width: '60px', height: '1px', background: mainColor,
        margin: '0 auto 1.5rem',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.75rem' : '1.5rem', justifyContent: 'center', marginBottom: '1.5rem', flexDirection: isMobile ? 'column' : 'row' }}>
        <div style={{
          width: isMobile ? '80px' : '100px', height: isMobile ? '80px' : '100px', borderRadius: '50%',
          overflow: 'hidden', background: '#fafafa', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `2px solid ${mainColor}20`,
        }}>
          <LazyLoadImage style={{ maxWidth: isMobile ? '64px' : '80px', maxHeight: isMobile ? '64px' : '80px', objectFit: 'contain' }} src={img} />
        </div>
        <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
          <div style={{ fontSize: isMobile ? '15px' : '18px', fontWeight: 'bold', marginBottom: '0.25rem' }}>{name}</div>
          <div style={{ fontSize: '12px', color: themeObj.grey[500], letterSpacing: '1px' }}>
            {hasSale && <span style={{ textDecoration: 'line-through', color: themeObj.grey[400], marginRight: '0.5rem' }}>{commarNumber(orig)}원</span>}
            <span style={{ fontWeight: 'bold', color: mainColor }}>{commarNumber(sale)}원</span>
            {hasSale && <span style={{ color: '#e74c3c', marginLeft: '0.5rem', fontWeight: 'bold' }}>{disc}%</span>}
          </div>
        </div>
      </div>
      <div style={{
        display: 'inline-block', padding: isMobile ? '12px 28px' : '14px 40px',
        background: '#1a1a1a', color: '#fff',
        fontSize: '12px', fontWeight: 'bold', letterSpacing: '3px',
      }}>READ FULL STORY →</div>
    </div>
  );
};

/* ══════════════════════════════════════
   단일 상품 - 타입 5: 프로모션 와이드 배너
   홈쇼핑 스타일, 큰 이미지 + 큰 가격 + 강렬한 CTA
   ══════════════════════════════════════ */
const renderShopPromo = (product, router, currentLang, mainColor, isMobile) => {
  const { img, name, comment, sale, orig, hasSale, disc } = pHelper(product, currentLang);
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      borderRadius: '20px', overflow: 'hidden', cursor: 'pointer',
      background: '#fff', boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
      minHeight: isMobile ? 'auto' : '480px',
    }} onClick={() => router?.push?.(`/shop/item/${product?.id}`)}>
      <div style={{
        background: `linear-gradient(135deg, ${mainColor} 0%, ${mainColor}cc 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '2rem 1rem' : '3rem', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-150px', left: '-100px',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          background: '#fff', borderRadius: '16px',
          padding: isMobile ? '1.5rem' : '2.5rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          position: 'relative', zIndex: 1,
        }}>
          <LazyLoadImage style={{ maxWidth: isMobile ? '180px' : '300px', maxHeight: isMobile ? '180px' : '300px', objectFit: 'contain' }} src={img} />
        </div>
      </div>
      <div style={{ padding: isMobile ? '1.5rem 1.25rem' : '3.5rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
        {hasSale && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: '#ff3333', color: '#fff', padding: '8px 16px',
            borderRadius: '6px', fontSize: '13px', fontWeight: 'bold',
            alignSelf: 'flex-start', letterSpacing: '0.5px',
          }}>
            <span style={{ fontSize: '18px' }}>⚡</span>
            오늘만 {disc}% 특가
          </div>
        )}
        <div style={{ fontSize: isMobile ? '22px' : '36px', fontWeight: 'bold', lineHeight: 1.2, letterSpacing: '-0.5px' }}>{name}</div>
        {comment && <div style={{ fontSize: isMobile ? '13px' : '16px', color: themeObj.grey[600], lineHeight: 1.6 }}>{comment}</div>}
        <div style={{ padding: isMobile ? '1rem' : '1.5rem', background: '#fafafa', borderRadius: '12px', marginTop: '0.5rem' }}>
          {hasSale && (
            <div style={{ fontSize: '14px', textDecoration: 'line-through', color: themeObj.grey[400], marginBottom: '0.25rem' }}>
              정가 {commarNumber(orig)}원
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
            {hasSale && <span style={{ fontSize: isMobile ? '16px' : '22px', fontWeight: 'bold', color: '#ff3333' }}>{disc}%</span>}
            <span style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: '900', color: '#1a1a1a', letterSpacing: '-0.5px' }}>{commarNumber(sale)}</span>
            <span style={{ fontSize: isMobile ? '14px' : '18px', fontWeight: 'bold' }}>원</span>
          </div>
        </div>
        <div style={{
          padding: isMobile ? '14px 0' : '18px 0', background: mainColor, color: '#fff',
          borderRadius: '12px', fontSize: isMobile ? '15px' : '17px', fontWeight: 'bold',
          textAlign: 'center', letterSpacing: '0.5px', marginTop: '0.5rem',
          boxShadow: `0 8px 24px ${mainColor}60`,
        }}>지금 구매하기 →</div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   단일 상품 - 타입 6: 풀블리드 이미지 배너
   와이드 풀스크린 이미지 + 좌우 오버레이 카드
   ══════════════════════════════════════ */
const renderShopFullbleed = (product, router, currentLang, mainColor, isMobile) => {
  const { img, name, comment, sale, orig, hasSale, disc } = pHelper(product, currentLang);
  if (isMobile) {
    // 모바일: 세로 스택 (이미지 위, 텍스트 아래)
    return (
      <div style={{
        position: 'relative', width: '100%',
        borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
        background: `linear-gradient(135deg, ${mainColor}15 0%, ${mainColor}05 100%)`,
        display: 'flex', flexDirection: 'column',
      }} onClick={() => router?.push?.(`/shop/item/${product?.id}`)}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2rem 1rem',
        }}>
          <LazyLoadImage style={{
            maxWidth: '220px', maxHeight: '220px', objectFit: 'contain',
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.2))',
          }} src={img} />
        </div>
        <div style={{
          padding: '1.5rem 1.25rem',
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column', gap: '0.75rem',
        }}>
          {hasSale && (
            <div style={{
              display: 'inline-flex', alignSelf: 'flex-start',
              background: '#1a1a1a', color: '#fff',
              padding: '6px 14px', borderRadius: '4px',
              fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px',
            }}>BEST DEAL · {disc}% OFF</div>
          )}
          <div style={{ fontSize: '22px', fontWeight: 'bold', lineHeight: 1.2, letterSpacing: '-0.5px' }}>{name}</div>
          {comment && <div style={{ fontSize: '13px', color: themeObj.grey[600], lineHeight: 1.6 }}>{comment}</div>}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
            {hasSale && <span style={{ fontSize: '14px', textDecoration: 'line-through', color: themeObj.grey[400] }}>{commarNumber(orig)}원</span>}
            <span style={{ fontSize: '24px', fontWeight: '900', color: mainColor }}>{commarNumber(sale)}원</span>
          </div>
          <div style={{
            padding: '12px 24px', background: mainColor, color: '#fff',
            borderRadius: '50px', fontSize: '14px', fontWeight: 'bold',
            alignSelf: 'flex-start', marginTop: '0.25rem',
          }}>바로 구매 →</div>
        </div>
      </div>
    );
  }
  // 데스크탑: 기존 레이아웃
  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '16/7',
      borderRadius: '20px', overflow: 'hidden', cursor: 'pointer',
      background: `linear-gradient(135deg, ${mainColor}15 0%, ${mainColor}05 100%)`,
    }} onClick={() => router?.push?.(`/shop/item/${product?.id}`)}>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'flex-end',
        padding: '0 3rem',
      }}>
        <LazyLoadImage style={{
          maxWidth: '400px', maxHeight: '80%', objectFit: 'contain',
          filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.2))',
        }} src={img} />
      </div>
      <div style={{
        position: 'absolute', left: '3rem', top: '50%', transform: 'translateY(-50%)',
        width: '48%', maxWidth: '500px', padding: '2.5rem',
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
        borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column', gap: '1rem',
      }}>
        {hasSale && (
          <div style={{
            display: 'inline-flex', alignSelf: 'flex-start',
            background: '#1a1a1a', color: '#fff',
            padding: '6px 14px', borderRadius: '4px',
            fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px',
          }}>BEST DEAL · {disc}% OFF</div>
        )}
        <div style={{ fontSize: '30px', fontWeight: 'bold', lineHeight: 1.2, letterSpacing: '-0.8px' }}>{name}</div>
        {comment && <div style={{ fontSize: '14px', color: themeObj.grey[600], lineHeight: 1.6 }}>{comment}</div>}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
          {hasSale && <span style={{ fontSize: '15px', textDecoration: 'line-through', color: themeObj.grey[400] }}>{commarNumber(orig)}원</span>}
          <span style={{ fontSize: '32px', fontWeight: '900', color: mainColor }}>{commarNumber(sale)}원</span>
        </div>
        <div style={{
          padding: '14px 32px', background: mainColor, color: '#fff',
          borderRadius: '50px', fontSize: '15px', fontWeight: 'bold',
          alignSelf: 'flex-start', marginTop: '0.5rem',
        }}>바로 구매 →</div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   단일 상품 - 타입 7: 하이라이트 스포트라이트
   검은 배경 + 중앙 조명 효과 + 럭셔리 느낌
   ══════════════════════════════════════ */
const renderShopSpotlight = (product, router, currentLang, mainColor, isMobile) => {
  const { img, name, comment, sale, orig, hasSale, disc } = pHelper(product, currentLang);
  return (
    <div style={{
      position: 'relative', borderRadius: '20px', overflow: 'hidden',
      background: '#0d0d0d', cursor: 'pointer',
      padding: isMobile ? '2.5rem 1.25rem' : '4rem 2rem',
      textAlign: 'center', minHeight: isMobile ? 'auto' : '520px',
    }} onClick={() => router?.push?.(`/shop/item/${product?.id}`)}>
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isMobile ? '400px' : '600px', height: isMobile ? '400px' : '600px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${mainColor}40 0%, transparent 70%)`,
      }} />
      <div style={{ position: 'relative', zIndex: 1, color: '#fff' }}>
        <div style={{
          fontSize: '12px', letterSpacing: '6px', color: mainColor,
          fontWeight: 'bold', marginBottom: isMobile ? '1.5rem' : '2rem',
        }}>★ PREMIUM COLLECTION ★</div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: isMobile ? '1.5rem' : '2rem' }}>
          <div style={{
            background: '#fff', borderRadius: '50%',
            padding: isMobile ? '1.25rem' : '2rem',
            width: isMobile ? '180px' : '280px', height: isMobile ? '180px' : '280px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 80px ${mainColor}60, 0 0 120px ${mainColor}30`,
          }}>
            <LazyLoadImage style={{ maxWidth: isMobile ? '140px' : '220px', maxHeight: isMobile ? '140px' : '220px', objectFit: 'contain' }} src={img} />
          </div>
        </div>
        <div style={{
          fontSize: isMobile ? '22px' : '32px', fontWeight: '900', marginBottom: '0.75rem',
          letterSpacing: '-0.5px', maxWidth: '600px', margin: '0 auto 0.75rem',
        }}>{name}</div>
        {comment && (
          <div style={{
            fontSize: isMobile ? '13px' : '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7,
            maxWidth: '500px', margin: isMobile ? '0 auto 1.5rem' : '0 auto 2rem', fontStyle: 'italic',
          }}>{comment}</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '0.5rem', marginBottom: isMobile ? '1.5rem' : '2rem', flexWrap: 'wrap' }}>
          {hasSale && <span style={{ fontSize: isMobile ? '15px' : '18px', fontWeight: 'bold', color: '#ff6b6b' }}>{disc}%</span>}
          <span style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>
            {commarNumber(sale)}원
          </span>
          {hasSale && <span style={{ fontSize: '14px', textDecoration: 'line-through', color: 'rgba(255,255,255,0.4)' }}>{commarNumber(orig)}원</span>}
        </div>
        <div style={{
          display: 'inline-block',
          padding: isMobile ? '14px 40px' : '16px 56px',
          background: 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
          color: '#0d0d0d', borderRadius: '50px',
          fontSize: isMobile ? '13px' : '15px', fontWeight: 'bold', letterSpacing: '2px',
          boxShadow: '0 10px 30px rgba(255,255,255,0.15)',
        }}>GET IT NOW</div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   단일 상품 - 타입 8: 그리드 쇼케이스
   이미지 + 좌우 정보 블록 + 하단 가로 CTA
   ══════════════════════════════════════ */
const renderShopShowcase = (product, router, currentLang, mainColor, isMobile) => {
  const { img, name, comment, sale, orig, hasSale, disc } = pHelper(product, currentLang);
  if (isMobile) {
    // 모바일: 단일 컬럼 세로 스택
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', cursor: 'pointer' }}
        onClick={() => router?.push?.(`/shop/item/${product?.id}`)}>
        <div style={{
          background: 'linear-gradient(180deg, #fafafa 0%, #fff 100%)',
          borderRadius: '16px', padding: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid #f0f0f0',
        }}>
          <LazyLoadImage style={{
            maxWidth: '220px', maxHeight: '220px', objectFit: 'contain',
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.1))',
          }} src={img} />
        </div>
        <div style={{
          background: '#1a1a1a', borderRadius: '16px', padding: '1.25rem',
          color: '#fff', display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap',
        }}>
          {hasSale && <span style={{ fontSize: '13px', textDecoration: 'line-through', opacity: 0.5 }}>{commarNumber(orig)}원</span>}
          <span style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px' }}>{commarNumber(sale)}원</span>
          {hasSale && <span style={{ fontSize: '12px', color: '#ff6b6b', fontWeight: 'bold' }}>{disc}% OFF</span>}
        </div>
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '1.25rem',
          border: '1px solid #eee',
        }}>
          <div style={{ fontSize: '11px', letterSpacing: '2px', color: mainColor, fontWeight: 'bold', marginBottom: '0.5rem' }}>PRODUCT</div>
          <div style={{ fontSize: '17px', fontWeight: 'bold', lineHeight: 1.3, marginBottom: '0.5rem' }}>{name}</div>
          {comment && <div style={{ fontSize: '13px', color: themeObj.grey[600], lineHeight: 1.5 }}>{comment}</div>}
        </div>
        <div style={{
          padding: '14px 0', background: mainColor, color: '#fff',
          borderRadius: '8px', fontSize: '14px', fontWeight: 'bold',
          textAlign: 'center', letterSpacing: '1px',
        }}>구매하기</div>
      </div>
    );
  }
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1.4fr 1fr',
      gridTemplateRows: 'auto auto',
      gap: '1rem',
      cursor: 'pointer',
    }} onClick={() => router?.push?.(`/shop/item/${product?.id}`)}>
      {/* 좌상단: 배지 */}
      <div style={{
        background: mainColor, borderRadius: '16px', padding: '2rem 1.5rem',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        color: '#fff', minHeight: '180px',
      }}>
        <div style={{ fontSize: '11px', letterSpacing: '3px', fontWeight: 'bold', opacity: 0.7 }}>PICK OF THE DAY</div>
        <div style={{ fontSize: '48px', fontWeight: '900', lineHeight: 1 }}>01</div>
      </div>
      {/* 중앙: 이미지 (2줄 걸침) */}
      <div style={{
        gridRow: 'span 2',
        background: 'linear-gradient(180deg, #fafafa 0%, #fff 100%)',
        borderRadius: '16px', padding: '2.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid #f0f0f0',
      }}>
        <LazyLoadImage style={{
          maxWidth: '320px', maxHeight: '100%', objectFit: 'contain',
          filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.1))',
        }} src={img} />
      </div>
      {/* 우상단: 가격 */}
      <div style={{
        background: '#1a1a1a', borderRadius: '16px', padding: '2rem 1.5rem',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        color: '#fff', minHeight: '180px',
      }}>
        {hasSale && (
          <div style={{ fontSize: '13px', textDecoration: 'line-through', opacity: 0.5, marginBottom: '0.25rem' }}>
            {commarNumber(orig)}원
          </div>
        )}
        <div style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px', marginBottom: '0.5rem' }}>
          {commarNumber(sale)}원
        </div>
        {hasSale && (
          <div style={{ fontSize: '12px', color: '#ff6b6b', letterSpacing: '2px', fontWeight: 'bold' }}>
            {disc}% OFF
          </div>
        )}
      </div>
      {/* 좌하단: 상품명 */}
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '1.5rem',
        border: '1px solid #eee',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <div style={{ fontSize: '11px', letterSpacing: '2px', color: mainColor, fontWeight: 'bold', marginBottom: '0.5rem' }}>PRODUCT</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: 1.3 }}>{name}</div>
      </div>
      {/* 우하단: CTA */}
      <div style={{
        background: '#f5f5f0', borderRadius: '16px', padding: '1.5rem',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        gap: '0.75rem',
      }}>
        {comment && (
          <div style={{ fontSize: '13px', color: themeObj.grey[600], lineHeight: 1.5 }}>{comment}</div>
        )}
        <div style={{
          padding: '10px 0', background: mainColor, color: '#fff',
          borderRadius: '8px', fontSize: '13px', fontWeight: 'bold',
          textAlign: 'center', letterSpacing: '1px',
        }}>구매하기</div>
      </div>
    </div>
  );
};

/* 단일 상품 - 타입 4: 매거진 에디토리얼 */
const renderSingleMagazine = (product, router, currentLang, mainColor, brandName, isMobile) => {
  const { img, name, comment, sale, orig, hasSale, disc } = pHelper(product, currentLang);
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr',
      gap: isMobile ? '1.25rem' : '2rem',
      alignItems: 'center',
      padding: isMobile ? '2rem 1.25rem' : '3rem 2rem', cursor: 'pointer',
      borderTop: `3px solid ${mainColor}`, borderBottom: `3px solid ${mainColor}`,
    }} onClick={() => router?.push?.(`/shop/item/${product?.id}`)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', order: isMobile ? 2 : 0 }}>
        {brandName && <div style={{ fontSize: '11px', letterSpacing: '3px', color: mainColor, fontWeight: 'bold' }}>{brandName} · EDITORIAL</div>}
        <div style={{ fontSize: isMobile ? '24px' : '40px', fontWeight: '900', lineHeight: 1.1, letterSpacing: '-1px', fontFamily: 'serif' }}>{name}</div>
        {comment && <div style={{ fontSize: isMobile ? '13px' : '15px', lineHeight: 1.7, color: themeObj.grey[600], fontStyle: 'italic', borderLeft: `3px solid ${mainColor}`, paddingLeft: '0.75rem' }}>"{comment}"</div>}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
          {hasSale && (
            <div style={{ fontSize: '14px', textDecoration: 'line-through', color: themeObj.grey[400] }}>{commarNumber(orig)}원</div>
          )}
          <div style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold', color: mainColor }}>{commarNumber(sale)}원</div>
          {hasSale && <Badge style={{ background: '#e74c3c', color: '#fff' }}>-{disc}%</Badge>}
        </div>
        <div style={{
          display: 'inline-block',
          padding: isMobile ? '12px 28px' : '14px 40px',
          border: `2px solid ${mainColor}`, color: mainColor,
          fontSize: '13px', fontWeight: 'bold', alignSelf: 'flex-start', letterSpacing: '2px', marginTop: '0.75rem',
        }}>READ MORE →</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <LazyLoadImage style={{
          maxWidth: isMobile ? '200px' : '320px', maxHeight: isMobile ? '260px' : '400px', objectFit: 'contain',
          filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))',
        }} src={img} />
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   타입 1: 랭킹 디스플레이
   큰 순위 숫자가 주인공, 이미지는 보조
   ══════════════════════════════════════ */
const renderRanking = (products, router, currentLang, mainColor) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {products.map((product, idx) => {
        const { img, name, comment, sale, orig, hasSale, disc } = pHelper(product, currentLang);
        return (
          <div key={product?.id || idx} style={{
            display: 'flex', alignItems: 'center', gap: '1.25rem',
            padding: '1rem 1.25rem', cursor: 'pointer',
            borderRadius: '12px', background: idx === 0 ? '#f7f7f5' : 'transparent',
            transition: 'background 0.2s',
          }} onClick={() => router?.push?.(`/shop/item/${product?.id}`)}>
            <div style={{
              fontSize: '64px', fontWeight: '900', lineHeight: 1, minWidth: '60px',
              WebkitTextStroke: idx === 0 ? 'none' : `2px ${mainColor}`,
              WebkitTextFillColor: idx === 0 ? mainColor : 'transparent',
              textAlign: 'center',
            }}>{idx + 1}</div>
            <div style={{
              width: '90px', minWidth: '90px', height: '90px',
              borderRadius: '10px', overflow: 'hidden', background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid #eee',
            }}>
              <LazyLoadImage style={{ maxWidth: '80px', maxHeight: '80px', objectFit: 'contain' }} src={img} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{name}</div>
              <Row style={{ alignItems: 'baseline', gap: '0.3rem' }}>
                {hasSale && <span style={{ color: 'red', fontSize: '14px', fontWeight: 'bold' }}>{disc}%</span>}
                <span style={{ fontSize: '17px', fontWeight: 'bold' }}>{commarNumber(sale)}원</span>
                {hasSale && <span style={{ fontSize: '12px', textDecoration: 'line-through', color: themeObj.grey[400] }}>{commarNumber(orig)}원</span>}
              </Row>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ══════════════════════════════════════
   타입 2: 폴라로이드 포토
   회전된 사진 프레임, 아날로그 느낌
   ══════════════════════════════════════ */
const rotations = [-3, 2, -1.5, 3, -2];
const renderPolaroid = (products, router, currentLang, mainColor) => {
  return (
    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', padding: '1rem 0' }}>
      {products.map((product, idx) => {
        const { img, name, sale, orig, hasSale, disc } = pHelper(product, currentLang);
        const rot = rotations[idx % rotations.length];
        return (
          <div key={product?.id || idx} style={{
            background: '#fff', padding: '10px 10px 44px 10px',
            boxShadow: '2px 3px 12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)',
            transform: `rotate(${rot}deg)`,
            transition: 'transform 0.3s, box-shadow 0.3s',
            position: 'relative', cursor: 'pointer',
            maxWidth: '220px',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'rotate(0deg) scale(1.03)'; e.currentTarget.style.boxShadow = '4px 6px 20px rgba(0,0,0,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = `rotate(${rot}deg)`; e.currentTarget.style.boxShadow = '2px 3px 12px rgba(0,0,0,0.15)'; }}
          onClick={() => router?.push?.(`/shop/item/${product?.id}`)}>
            <div style={{ width: '180px', height: '180px', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LazyLoadImage style={{ maxWidth: '160px', maxHeight: '160px', objectFit: 'contain', filter: 'contrast(1.05) saturate(1.1)' }} src={img} />
            </div>
            <div style={{ position: 'absolute', bottom: '8px', left: '14px', right: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{name}</div>
            </div>
            <div style={{
              position: 'absolute', bottom: '-10px', right: '-10px',
              background: mainColor, color: '#fff',
              padding: '4px 14px', borderRadius: '12px',
              fontSize: '13px', fontWeight: 'bold',
              transform: 'rotate(3deg)',
            }}>
              {commarNumber(sale)}원
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ══════════════════════════════════════
   타입 3: 비교 테이블
   상품을 나란히 비교하는 표 형태
   ══════════════════════════════════════ */
const renderCompare = (products, router, currentLang, mainColor) => {
  return (
    <div style={{
      border: '1px solid #e8e8e8', borderRadius: '12px', overflow: 'hidden',
      display: 'grid', gridTemplateColumns: `repeat(${products.length}, 1fr)`,
      maxWidth: `${products.length * 260}px`, margin: '0 auto',
    }}>
      {products.map((product, idx) => {
        const { img, name, comment, sale, orig, hasSale, disc } = pHelper(product, currentLang);
        const isFirst = idx === 0;
        return (
          <div key={product?.id || idx} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '1.5rem 1rem', cursor: 'pointer',
            borderRight: idx < products.length - 1 ? '1px solid #f0f0f0' : 'none',
            background: isFirst ? `${mainColor}08` : '#fff',
            position: 'relative',
          }} onClick={() => router?.push?.(`/shop/item/${product?.id}`)}>
            {isFirst && (
              <div style={{
                position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)',
                background: mainColor, color: '#fff',
                padding: '2px 16px', borderRadius: '0 0 8px 8px',
                fontSize: '11px', fontWeight: 'bold',
              }}>PICK</div>
            )}
            <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', marginTop: isFirst ? '0.5rem' : 0 }}>
              <LazyLoadImage style={{ maxWidth: '110px', maxHeight: '110px', objectFit: 'contain' }} src={img} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.5rem', minHeight: '40px' }}>{name}</div>
            {comment && <div style={{ fontSize: '12px', color: themeObj.grey[500], textAlign: 'center', marginBottom: '0.5rem', lineHeight: '1.4' }}>{comment}</div>}
            <div style={{ marginTop: 'auto', textAlign: 'center' }}>
              {hasSale && <div style={{ fontSize: '12px', textDecoration: 'line-through', color: themeObj.grey[400] }}>{commarNumber(orig)}원</div>}
              <Row style={{ justifyContent: 'center', gap: '0.25rem', alignItems: 'baseline' }}>
                {hasSale && <span style={{ color: 'red', fontSize: '13px', fontWeight: 'bold' }}>{disc}%</span>}
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{commarNumber(sale)}원</span>
              </Row>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ══════════════════════════════════════
   타입 4: 타임라인 스토리
   가로 라인 위에 원형 이미지 + STEP
   ══════════════════════════════════════ */
const renderTimeline = (products, router, currentLang, mainColor) => {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      position: 'relative', padding: '60px 0',
    }}>
      {/* 가로 연결선 */}
      <div style={{
        position: 'absolute', top: '50%', left: '10%', right: '10%',
        height: '3px', background: `linear-gradient(90deg, ${mainColor}, ${mainColor}66)`,
        transform: 'translateY(-50%)', zIndex: 0,
      }} />
      {products.map((product, idx) => {
        const { img, name, sale, orig, hasSale, disc } = pHelper(product, currentLang);
        const isEven = idx % 2 === 0;
        return (
          <div key={product?.id || idx} style={{
            display: 'flex', flexDirection: isEven ? 'column' : 'column-reverse',
            alignItems: 'center', position: 'relative', zIndex: 1,
            cursor: 'pointer', maxWidth: '160px',
          }} onClick={() => router?.push?.(`/shop/item/${product?.id}`)}>
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div style={{ fontSize: '10px', letterSpacing: '2px', fontWeight: '700', color: mainColor, marginBottom: '0.25rem' }}>
                STEP {String(idx + 1).padStart(2, '0')}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '0.2rem' }}>{name}</div>
              <Row style={{ justifyContent: 'center', gap: '0.2rem', alignItems: 'baseline' }}>
                {hasSale && <span style={{ color: 'red', fontSize: '12px', fontWeight: 'bold' }}>{disc}%</span>}
                <span style={{ fontSize: '15px', fontWeight: 'bold' }}>{commarNumber(sale)}원</span>
              </Row>
            </div>
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%',
              overflow: 'hidden', border: `3px solid ${mainColor}`,
              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LazyLoadImage style={{ maxWidth: '70px', maxHeight: '70px', objectFit: 'contain' }} src={img} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ════════════════════════════════════
   메인 컴포넌트
   ════════════════════════════════════ */
const HomeItemHero = (props) => {
  const { currentLang } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const { column, func = {} } = props;
  const nextRouter = useRouter();
  const router = func?.router || nextRouter;
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isBlogContext = (nextRouter?.asPath || '').startsWith('/blog') || (nextRouter?.asPath || '') === '/';
  const productPathPrefix = isBlogContext ? '/blog/product' : '/shop/item';
  const wrappedRouter = router ? {
    ...router,
    push: (path) => router?.push?.(typeof path === 'string' ? path.replace(/^\/shop\/item\//, `${productPathPrefix}/`) : path),
  } : router;
  const { style } = column;
  const heroType = style?.hero_type || '1';
  const products = (column?.list ?? []).filter(p => typeof p === 'object');
  const mainColor = themeDnsData?.theme_css?.main_color || '#000';

  if (products.length === 0) return null;

  const brandName = themeDnsData?.name || '';

  // 상품 1개 → 풍성한 배너형 디자인 (타입별 분기)
  if (products.length === 1) {
    return (
      <div style={{ marginTop: `${style?.margin_top || 0}px` }}>
        {column?.title && <SectionTitle>{formatLang(column, 'title', currentLang)}</SectionTitle>}
        {heroType === '1' && renderSingleBanner(products[0], wrappedRouter, currentLang, mainColor, isMobile)}
        {heroType === '2' && renderSingleFullbleed(products[0], wrappedRouter, currentLang, mainColor, isMobile)}
        {heroType === '3' && renderSingleCard(products[0], wrappedRouter, currentLang, mainColor, isMobile)}
        {heroType === '4' && renderSingleMagazine(products[0], wrappedRouter, currentLang, mainColor, brandName, isMobile)}
        {heroType === '5' && renderShopPromo(products[0], wrappedRouter, currentLang, mainColor, isMobile)}
        {heroType === '6' && renderShopFullbleed(products[0], wrappedRouter, currentLang, mainColor, isMobile)}
        {heroType === '7' && renderShopSpotlight(products[0], wrappedRouter, currentLang, mainColor, isMobile)}
        {heroType === '8' && renderShopShowcase(products[0], wrappedRouter, currentLang, mainColor, isMobile)}
      </div>
    );
  }

  // 상품 2개 이상 → 기존 복수 디자인
  return (
    <div style={{ marginTop: `${style?.margin_top || 0}px` }}>
      {column?.title && <SectionTitle>{formatLang(column, 'title', currentLang)}</SectionTitle>}
      {heroType === '1' && renderRanking(products, wrappedRouter, currentLang, mainColor)}
      {heroType === '2' && renderPolaroid(products, wrappedRouter, currentLang, mainColor)}
      {heroType === '3' && renderCompare(products, wrappedRouter, currentLang, mainColor)}
      {heroType === '4' && renderTimeline(products, wrappedRouter, currentLang, mainColor)}
    </div>
  );
};

export default HomeItemHero
