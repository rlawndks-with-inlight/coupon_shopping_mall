import styled from 'styled-components'

export const Row = styled.div`
display: flex;
`
export const RowMobileColumn = styled.div`
display: flex;
@media (max-width:1000px) {
    flex-direction:column;
}
`
export const Title = styled.div`
margin: 0 auto;
`
export const themeObj = {
  grey: {
    0: '#FFFFFF',
    100: '#F9FAFB',
    200: '#F4F6F8',
    300: '#DFE3E8',
    400: '#C4CDD5',
    500: '#919EAB',
    600: '#637381',
    700: '#454F5B',
    800: '#212B36',
    900: '#161C24',
  }
}
