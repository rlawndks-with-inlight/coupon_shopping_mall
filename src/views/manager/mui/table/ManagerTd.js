import { TableCell } from "@mui/material";

const ManagerTd = (props) => {
    const {
        col,
        row,
        idx
    } = props;
    return (
        <>
            <TableCell align="left" sx={{ ...(col?.sx ? col.sx(row) : {}) }}>{col.action(row)} </TableCell>
        </> //'@media screen and (max-width: 2500px)': {fontSize:'0.1rem'}
    )
}
export default ManagerTd;