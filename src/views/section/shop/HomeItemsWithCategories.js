import styled from 'styled-components'
import { Row, themeObj } from 'src/components/elements/styled-components'
import { Items } from 'src/components/elements/shop/common'
import { Button, Tab } from '@mui/material'
import _ from 'lodash'
import { styled as muiStyled } from '@mui/material/styles';
const Wrappers = styled.div`
  width:90%;
  max-width:1600px;
  margin:0 auto;
  flex-direction: ${props => props.is_vertical == 1 ? 'row' : 'column'};
  @media (max-width:1000px) {
    flex-direction:column;
  }  
`
const HeaderContainer = styled.div`
display:flex;
align-items: ${props => props.is_vertical == 1 ? 'flex-start' : 'center'};
flex-direction: ${props => props.is_vertical == 1 ? 'column' : 'row'};
min-width: ${props => props.is_vertical == 1 ? '250px' : ''};
@media (max-width:1000px) {
    align-items: center;
    flex-direction:row;
    width:auto;
}  
`
const TabContainer = styled.div`
display:flex;
margin-left: ${props => props.is_vertical == 1 ? '0' : 'auto'};
margin-top: ${props => props.is_vertical == 1 ? '1rem' : '0'};
column-gap: 0.5rem;
row-gap: 0.5rem;
overflow-x: auto;
white-space: nowrap;
flex-direction: ${props => props.is_vertical == 1 ? 'column' : 'row'};
@media (max-width:1000px) {
    flex-direction:row;
    margin-left: auto;
}
`
const NoneShowMobile = styled.div`

`
const CategoryTabs = (props) => {
    const {
        column,
        itemsCategory,
        onClickItemsCategory,
        idx
    } = props;
    return (
        <>
            <TabContainer is_vertical={column?.is_vertical}>
                {column?.list && column?.list.map((item, index) => (
                    <>
                        <Button variant={itemsCategory[idx] == index ? `contained` : `outlined`} sx={{ height: '36px', minWidth: `${(column?.is_vertical == 1 && window.innerWidth > 1000 ? '220px' : '')}` }} onClick={() => {
                            onClickItemsCategory(idx, index);
                        }}>
                            {item?.category_name}
                        </Button>
                    </>
                ))}
            </TabContainer>
        </>
    )
}
const HomeItemsWithCategories = (props) => {
    const { column, data, func } = props;
    let { idx, itemsCategory } = data;
    const { router, onClickItemsCategory } = func;
    return (
        <>
            <Wrappers style={{
                marginTop: '1rem',
                marginBottom: '1rem',
                display: 'flex',
            }}
                is_vertical={column?.is_vertical}
            >
                <HeaderContainer is_vertical={column?.is_vertical}>
                    <Row style={{ flexDirection: 'column' }}>
                        {column?.title &&
                            <>
                                <div style={{ fontSize: themeObj.font_size.size3, fontWeight: 'bold' }}>{column?.title}</div>
                                {column?.sub_title &&
                                    <>
                                        <div style={{ fontSize: themeObj.font_size.size5, color: themeObj.grey[500] }}>{column?.sub_title}</div>
                                    </>}
                            </>}
                    </Row>
                    <CategoryTabs onClickItemsCategory={onClickItemsCategory} column={column} itemsCategory={itemsCategory} idx={idx} />
                </HeaderContainer>
                <div style={{ marginTop: '1rem' }} />
                <Row>
                    {column?.list && column?.list.map((item, index) => (
                        <>
                            {itemsCategory[idx] == index &&
                                <>
                                    <Items items={item?.list} router={router} />
                                </>}
                        </>
                    ))}
                </Row>
            </Wrappers>
        </>
    )
}
export default HomeItemsWithCategories;