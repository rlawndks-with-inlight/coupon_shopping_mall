import { TableRow } from "evergreen-ui";
import styled from "styled-components";

const notice = (Object.values(data)).map((notice) => (
  <TableRow key={notice.id}>
    <TableColumn>{notice.id}</TableColumn>
    <TableColumn>{notice.title}</TableColumn>
    <TableColumn>{notice.createDate}</TableColumn>
    <TableColumn>{notice.userName}</TableColumn>
  </TableRow>
));
//공지사항, faq 등 상세 페이지 박이규
const Demo2 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  return (
    <>

    </>
  )
}
export default Demo2
