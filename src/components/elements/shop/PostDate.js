import { themeObj } from 'src/components/elements/styled-components';

// 게시글 상세 상단의 작성일 표시.
// 목록에는 '작성일' 컬럼이 있는데 상세에는 아무 날짜도 없어서 언제 올라온 글인지 알 수 없었다.
// 데모 9종의 상세 화면 마크업이 제각각이라(Row/FieldLabel/Typography 혼용) 공용 조각으로 뺐다.
//
// created_at 은 API가 "2026-08-06 14:23:11" 형태의 문자열로 내려준다.
// 값이 없으면(구 데이터 등) 줄 자체를 렌더하지 않는다 — "---" 같은 빈 표시는 오히려 지저분하다.
const PostDate = ({ value, align = 'left', style }) => {
  if (!value) return null;
  return (
    <div
      style={{
        fontSize: '0.8125rem',
        color: themeObj.grey[500],
        textAlign: align,
        ...style,
      }}
    >
      {String(value).slice(0, 16)}
    </div>
  );
};

export default PostDate;
