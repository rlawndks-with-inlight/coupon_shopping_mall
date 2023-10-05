import { TableCell } from "@mui/material";

const ManagerTd = (props) => {
    const {
        col,
        row,
        idx
    } = props;
    return (
        <>
            <TableCell align="left" sx={{ ...(col?.sx ? col.sx(row) : {}) }}>{col.action(row)}</TableCell>
        </>
    )
}
export default ManagerTd;