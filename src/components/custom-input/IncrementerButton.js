import PropTypes from 'prop-types';
import { forwardRef, useState } from 'react';
import { alpha } from '@mui/material/styles';
import { Stack, IconButton, InputBase } from '@mui/material';
import Iconify from '../iconify';

const IncrementerButton = forwardRef(
  ({ quantity, onIncrease, onDecrease, onChangeQuantity, disabledIncrease, disabledDecrease, sx, type, ...other }, ref) => {
    const [localQuantity, setLocalQuantity] = useState(quantity);

    const handleInputChange = (event) => {
      const newValue = event.target.value;
      setLocalQuantity(newValue);
      console.log(localQuantity)
      if (onChangeQuantity) {
        onChangeQuantity(Number(newValue));
      }
    };

    const handleBlur = () => {
      const validQuantity = Math.max(1, parseInt(localQuantity, 10) || 1);
      setLocalQuantity(validQuantity);
      if (onChangeQuantity) {
        onChangeQuantity(validQuantity);
      }
    };

    return (
      <Stack
        ref={ref}
        flexShrink={0}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          mb: 0.5,
          py: 0.5,
          px: 0.75,
          width: 96,
          borderRadius: 1,
          border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.32)}`,
          ...sx,
        }}
        {...other}
      >
        <IconButton
          size="small"
          color="inherit"
          onClick={onDecrease}
          disabled={disabledDecrease}
          sx={{ color: 'text.secondary' }}
        >
          <Iconify icon="eva:minus-fill" width={16} />
        </IconButton>

        <InputBase
          value={quantity}
          onChange={handleInputChange}
          onBlur={handleBlur}
          inputProps={{
            style: { textAlign: 'center' },
            'aria-label': 'quantity',
          }}
          sx={{ width: 40 }}
        />

        <IconButton
          size="small"
          color="inherit"
          onClick={onIncrease}
          disabled={disabledIncrease}
          sx={{ color: 'text.secondary' }}
        >
          <Iconify icon="eva:plus-fill" width={16} />
        </IconButton>
      </Stack>
    );
  }
);

IncrementerButton.propTypes = {
  sx: PropTypes.object,
  onDecrease: PropTypes.func,
  onIncrease: PropTypes.func,
  onQuantityChange: PropTypes.func,
  quantity: PropTypes.number,
  disabledDecrease: PropTypes.bool,
  disabledIncrease: PropTypes.bool,
};

export default IncrementerButton;