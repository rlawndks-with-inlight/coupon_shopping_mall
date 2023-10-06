import { TableRow, TableCell } from "@mui/material";
import { styled as muiStyled } from '@mui/material';
import ManagerTd from "./ManagerTd";
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

const CustomTableRow = muiStyled(TableRow)(({ theme }) => ({
    '&:hover': {
        background: `${theme.palette.mode == 'dark' ? '' : theme.palette.grey[100]}`,
    },
}));

const ItemTypes = { CARD: 'card' }
const ManagerTr = ({
    index,
    columns,
    row,
    want_move_card,
    moveCard,
    onChangeSequence,
}) => {

    const moveRef = useRef(null)
    const [{ handlerId }, drop] = useDrop({
        accept: ItemTypes.CARD,
        drop(item) {
            console.log(item)
            let hover_idx = item?.index;
            let drag_id = item?.id;
            console.log(123)
            onChangeSequence(drag_id, hover_idx);
        },
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            }
        },
        hover(item, monitor) {
            if (!moveRef.current) {
                return
            }
            const dragIndex = item.index
            const hoverIndex = index
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return
            }
            // Determine rectangle on screen
            const hoverBoundingRect = moveRef.current?.getBoundingClientRect()
            // Get vertical middle
            const hoverMiddleY =
                (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
            // Determine mouse position
            const clientOffset = monitor.getClientOffset()
            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top
            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%
            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return
            }
            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return
            }
            // Time to actually perform the action
            moveCard(dragIndex, hoverIndex)
            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex
        },
    })
    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.CARD,
        item: () => {
            return {
                id: row?.id,
                index,
                sort: row?.sort_idx
            }
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })
    const opacity = isDragging ? 0 : 1
    drag(drop(moveRef))
    return (
        <>
            <CustomTableRow ref={want_move_card ? moveRef : null} data-handler-id={handlerId}>
                {columns && columns.map((col, idx) => {
                    return <ManagerTd
                        col={col}
                        row={row}
                        idx={idx}
                    />
                })}
            </CustomTableRow>
        </>
    )
}
export default ManagerTr;