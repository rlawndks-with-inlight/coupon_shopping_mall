import styled from 'styled-components'

const Wrappers = styled.div`

`
const returnTypeObj = {

}
const returnHomeContent = (content) => {
  let type = content?.type;

  if (type == 'banner') {

  }
  if (type == 'editor') {

  }
  if (type == 'items') {

  }
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
      type: 'banner',
      list: [
        {
          src: '',
          link: ''
        },
        {
          src: '',
          link: ''
        },
        {
          src: '',
          link: ''
        },
        {
          src: '',
          link: ''
        },
      ],
    },
    {
      type: 'editor',
      content: ``,
    },
    {
      type: 'items',
      list: [],
      title: '',
      sub_title:'',
      sort_type: '',
      side_img:'',
      item_slide_auto:''
    },
    {
      type:''
    }
  ];
  return (
    <>
      {home_content_list.map((content, idx) => (
        <>
          {returnHomeContent(content)}
        </>
      ))}
    </>
  )
}
export default Demo1
