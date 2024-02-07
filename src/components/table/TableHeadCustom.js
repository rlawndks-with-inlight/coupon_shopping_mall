import PropTypes from 'prop-types';
// @mui
import { Box, Checkbox, TableRow, TableCell, TableHead, TableSortLabel, Button } from '@mui/material';
import { useState } from 'react';

// ----------------------------------------------------------------------

const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
};

// ----------------------------------------------------------------------

TableHeadCustom.propTypes = {
  sx: PropTypes.object,
  onSort: PropTypes.func,
  orderBy: PropTypes.string,
  headLabel: PropTypes.array,
  rowCount: PropTypes.number,
  numSelected: PropTypes.number,
  onSelectAllRows: PropTypes.func,
  order: PropTypes.oneOf(['asc', 'desc']),
};


export default function TableHeadCustom({
  order,
  orderBy,
  rowCount = 0,
  headLabel,
  numSelected = 0,
  onSort,
  onSelectAllRows,
  sx,
  onChangePage,
  searchObj
}) {
  const createSortHandler = (prop) => (e) => {
    onSort(e, prop)
    const orderVal = order == 'asc' ? 0 : 1
    onChangePage({ ...searchObj, is_asc: orderVal, order: orderBy })
  }

  return (
    <TableHead sx={sx}>
      <TableRow>
        {onSelectAllRows && (
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={(event) => onSelectAllRows(event.target.checked)}
            />
          </TableCell>
        )}

        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: headCell.width, minWidth: headCell.minWidth }}//'@media screen and (max-width: 2500px)': {fontSize:'0.5rem'}
          >
            {onSort &&
              headCell.id == 'product_code' ||
              headCell.id == 'product_price' ||
              headCell.id == 'product_sale_price' ||
              headCell.id == 'order_count' ||
              headCell.id == 'review_count' ||
              headCell.id == 'created_at' ||
              headCell.id == 'updated_at' ? (
              <>
                <div style={{ display: 'flex', flexDirection:'column'}}>
                  <TableSortLabel
                    //hideSortIcon
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={createSortHandler(headCell.id)}
                    sx={{ textTransform: 'capitalize', flexDirection:'row' }}
                  >
                    {headCell.label}
                    {orderBy === headCell.id ? (
                      <Box sx={{ ...visuallyHidden }}>
                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                  {headCell.sub_id && 
                  <TableSortLabel
                    //hideSortIcon
                    active={orderBy === headCell.sub_id}
                    direction={orderBy === headCell.sub_id ? order : 'asc'}
                    onClick={createSortHandler(headCell.sub_id)}
                    sx={{ textTransform: 'capitalize', flexDirection:'row' }}
                  >
                    {headCell.sub_label}
                    {orderBy === headCell.sub_id ? (
                      <Box sx={{ ...visuallyHidden }}>
                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                      </Box>
                    ) : null}
                  </TableSortLabel>}
                </div>
              </>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
