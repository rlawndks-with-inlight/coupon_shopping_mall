import styled from 'styled-components'
import { Row } from 'src/components/elements/styled-components'
import _ from 'lodash'

const Wrappers = styled.div`
  width:90%;
  max-width: ${props => props.type == 1 ? '1140px' : '1400px'};
  margin:0 auto;
  font-family: ${props => props.type == 1 ? 'Playfair Display' : ''};
  font-size: ${props => props.type == 1 ? '14px' : ''};
  @media (max-width:1200px) {
    font-size: ${props => props.type == 1 ? '10px' : ''};
  }
  
  `

const TextCover = styled.div`
display:flex;
margin:0 auto;
align-items: center;

`

const Texts = styled.div`
align-items: center;
white-space: nowrap;
width:fit-content;
cursor:pointer;
font-size:170%;
@media screen and (max-width:650px) {
    font-size:130%;
}
@media screen and (max-width:500px) {
    font-size:120%;
}
@media screen and (max-width:450px) {
    font-size:100%;
}
@media screen and (max-width:450px) {
    font-size:80%;
}

`

const HomeTextBanner = (props) => {
    const { column, data, func, is_manager, demoType } = props;
    const { style } = column;
    // (이 섹션은 슬라이더가 아니라 텍스트 링크를 한 줄로 나열한다. 예전의 slide_setting·
    //  getSlideToShow·getBannerWidth 는 어디서도 렌더에 쓰이지 않아 제거했다.)
    return (
        <>
            {/* maxWidth 에 라우터 객체가 문자열로 들어가 "[object Object]"(무효값)였다 — 제거. */}
            <Wrappers style={{ marginTop: `${style?.margin_top}px` }} type={demoType}>
            {/* 항목이 많거나 길면 nowrap 때문에 모바일에서 가로로 넘쳤다 — 줄바꿈을 허용한다. */}
            <Row style={{ flexWrap: 'wrap', justifyContent: 'center', rowGap: '0.5rem' }}>
                    {column?.list && (column?.list ?? []).map((item, idx) => (
                        <>
                        {idx != 0 && <div style={{ borderRight: '1px solid #ccc', height: '1.2em', margin: 'auto 0.75rem' }} />}
                                <TextCover>
                                    <Texts 
                                    onClick={() => {
                                        if (item?.link && !is_manager) {
                                            window.location.href = item?.link;
                                        }
                                    }}
                                    >
                                        {item.title}
                                        </Texts>
                                </TextCover>
                        </>
                    ))}
                    </Row>
            </Wrappers>
        </>
    )
}
export default HomeTextBanner;