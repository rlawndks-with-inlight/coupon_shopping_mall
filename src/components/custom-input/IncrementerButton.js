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
      // 화면에는 입력 중인 값을 그대로 둔다(지우고 다시 치는 동안 숫자가 튀지 않게).
      setLocalQuantity(newValue);
      // ⚠ 상위에는 **유효한 수량일 때만** 올린다.
      //   예전엔 Number('') === 0, Number('abc') === NaN 을 그대로 올려서
      //   입력칸을 비우는 순간 수량이 0 이 되고 합계·결제금액이 0원으로 계산됐다.
      //   (하한 보정은 blur 에만 있어서, 지운 채로 결제하면 그대로 나갔다)
      const parsed = parseInt(newValue, 10);
      if (onChangeQuantity && Number.isFinite(parsed) && parsed >= 1) {
        onChangeQuantity(parsed);
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