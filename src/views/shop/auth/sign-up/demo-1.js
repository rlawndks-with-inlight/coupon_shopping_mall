import PropTypes from 'prop-types';
import { Step, StepConnector, StepLabel, Stepper, stepConnectorClasses } from '@mui/material';
import { useState } from 'react';
import { Title } from 'src/components/elements/styled-components';
import styled from 'styled-components'
import { styled as muiStyled } from '@mui/material/styles';
import Iconify from 'src/components/iconify/Iconify';
import { bgGradient } from 'src/utils/cssStyles';
import { useTheme } from '@emotion/react';

const Wrappers = styled.div`
max-width:700px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
`

const STEPS = ['약관동의', '정보입력', '가입완료'];
const ColorlibConnector = muiStyled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      ...bgGradient({
        startColor: theme.palette.primary.light,
        endColor: theme.palette.primary.main,
      }),
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      ...bgGradient({
        startColor: theme.palette.primary.light,
        endColor: theme.palette.primary.main,
      }),
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    borderRadius: 1,
    backgroundColor: theme.palette.divider,
  },
}));
const ColorlibStepIconRoot = muiStyled('div')(({ theme, ownerState }) => ({
  zIndex: 1,
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.disabled,
  backgroundColor:
    theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
  ...(ownerState.active && {
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    color: theme.palette.common.white,
    ...bgGradient({
      startColor: theme.palette.primary.light,
      endColor: theme.palette.primary.main,
    }),
  }),
  ...(ownerState.completed && {
    color: theme.palette.common.white,
    ...bgGradient({
      startColor: theme.palette.primary.light,
      endColor: theme.palette.primary.main,
    }),
  }),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className, icon } = props;

  const icons = {
    1: <Iconify icon="eva:settings-2-outline" width={24} />,
    2: <Iconify icon="eva:person-add-outline" width={24} />,
    3: <Iconify icon="fluent-mdl2:completed" width={24} />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}
ColorlibStepIcon.propTypes = {
  active: PropTypes.bool,
  icon: PropTypes.number,
  completed: PropTypes.bool,
  className: PropTypes.string,
};

const Demo1 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const theme = useTheme();
  console.log(theme)
  const [activeStep, setActiveStep] = useState(0);
  return (
    <>
      <Wrappers>
        <Title>회원가입</Title>
        <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Wrappers>
    </>
  )
}
export default Demo1
