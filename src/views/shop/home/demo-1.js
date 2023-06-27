import styled from 'styled-components'

const Wrappers = styled.div`

`
const returnTypeObj = {

}
const Demo1 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;
    const home_content_list = [
      {
        type:'banner',
        list:[
          {
            src:'',
            link:''
          }
        ],
      },
      {
        type:'editor',
        content:``,
      },
      {
        type:'items',
        list:[],
        sort_type:''//column, row_wrap, row_slide
      },
      
    ];
    return (
        <>
        <Wrappers>
        </Wrappers>
        </>
    )
}
export default Demo1
