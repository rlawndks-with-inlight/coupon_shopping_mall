import { useEffect } from 'react';
import { useSettingsContext } from 'src/components/settings';
import { getPostByUser } from 'src/utils/api-shop';
import styled from 'styled-components'

const Wrappers = styled.div`
max-width:1500px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
`
const Demo1 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;
    const { themePostCategoryList } = useSettingsContext();
    useEffect(() => {
        pageSetting();
    }, [])
    const pageSetting = async () => {
        let data = await getPostByUser({
            post_id: router.query?.id
        })
    }
    return (
        <>
            <Wrappers>

            </Wrappers>
        </>
    )
}
export default Demo1
