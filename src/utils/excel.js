import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 시트만들기, 파일이름 } from './excel-sheet';

// 표를 엑셀로 내려받는다.
//
// 왜 유틸로 두나: 내려받을 화면이 늘어난다. 화면마다 XLSX 를 직접 부르면 파일명 규칙·
// 시트 이름·열 너비가 제각각이 되고, 한글 깨짐 같은 문제를 한 곳에서 못 고친다.
//
// ⚠ 개인정보가 실린 표(주문내역 등)를 내리면 그 파일은 평문이다.
//   DB 는 이름·전화·주소를 암호화해 두는데 엑셀로 나가는 순간 그 보호가 사라진다.
//   버튼을 붙일 때 누가 누를 수 있는지(권한)를 같이 정할 것.
export const 엑셀내려받기 = (이름, columns, rows, 시트이름 = 'Sheet1') => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, 시트만들기(columns, rows), 시트이름);
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), 파일이름(이름));
};
