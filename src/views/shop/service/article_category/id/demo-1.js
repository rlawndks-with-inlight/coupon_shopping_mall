import { useTheme } from "@emotion/react";
import { Button, Stack, TextField } from "@mui/material";
import _ from "lodash";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import { Col, Row, Title } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { react_quill_data } from "src/data/manager-data";
import { uploadFileByManager } from "src/utils/api-manager";
import { addPostByUser, getPostByUser } from "src/utils/api-shop";
import styled from "styled-components";
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})
const Wrappers = styled.div`
max-width:1500px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
`

const Demo1 = (props) => {
    const { setModal } = useModal()
    const {
        data: {

        },
        func: {
            router
        },
    } = props;
    const { themeMode, themePostCategoryList } = useSettingsContext();
    const theme = useTheme();
    const [postCategory, setPostCategory] = useState({});
    const [loading, setLoading] = useState(true);
    const [item, setItem] = useState({
        parent_id: null,
        post_title: '',
        post_content: '',
        is_reply: false,
    })
    useEffect(() => {
        settingPage();
    }, [router.query?.article_category, themePostCategoryList])
    const settingPage = async () => {
        setPostCategory(_.find(themePostCategoryList, { id: parseInt(router.query?.article_category) }))
        if (router.query?.id > 0) {
            let data = await getPostByUser({
                post_id: router.query?.id
            })
            setItem(data);
        }
        setLoading(false);
    }
    const onSave = async () => {
        let result = undefined;
        if (router.query?.id == 'add') {
            result = await addPostByUser({ ...item, category_id: router.query?.article_category });
        } else {
            result = await updatePostByManager({ ...item, id: router.query?.id, category_id: router.query?.article_category });
        }
        if (result) {
            toast.success("성공적으로 저장 되었습니다.");
            router.push(`/shop/service/${router.query?.article_category}`);
        }
    }
    return (
        <>
            <Wrappers>
                <Title style={{
                    marginBottom: '2rem'
                }}>{postCategory?.post_category_title} {router.query?.id == 'add' ? '작성' : ''}</Title>
                {!loading &&
                    <>
                        <Stack spacing={3}>
                            {router.query?.id == 'add' ?
                                <>
                                    <TextField
                                        label='제목'
                                        value={item.post_title}
                                        onChange={(e) => {
                                            setItem(
                                                {
                                                    ...item,
                                                    ['post_title']: e.target.value
                                                }
                                            )
                                        }} />
                                    <ReactQuill
                                        className="max-height-editor"
                                        theme={'snow'}
                                        id={'content'}
                                        placeholder={''}
                                        value={item.post_content}
                                        modules={react_quill_data.modules}
                                        formats={react_quill_data.formats}
                                        onChange={async (e) => {
                                            let note = e;
                                            if (e.includes('<img src="') && e.includes('base64,')) {
                                                let base64_list = e.split('<img src="');
                                                for (var i = 0; i < base64_list.length; i++) {
                                                    if (base64_list[i].includes('base64,')) {
                                                        let img_src = base64_list[i];
                                                        img_src = await img_src.split(`"></p>`);
                                                        let base64 = img_src[0];
                                                        img_src = await base64toFile(img_src[0], 'note.png');
                                                        const response = await uploadFileByManager({
                                                            file: img_src
                                                        });
                                                        note = await note.replace(base64, response?.url)
                                                    }
                                                }
                                            }
                                            setItem({
                                                ...item,
                                                ['post_content']: note
                                            });
                                        }} />
                                    <Button variant="contained" style={{
                                        height: '48px', width: '120px', margin: '1rem 0 1rem auto'
                                    }} onClick={() => {
                                        setModal({
                                            func: () => { onSave() },
                                            icon: 'material-symbols:edit-outline',
                                            title: '저장 하시겠습니까?'
                                        })
                                    }}>
                                        저장
                                    </Button>
                                </>
                                :
                                <>
                                    <Row style={{ columnGap: '0.5rem', fontSize: '1rem', alignItems: 'center' }}>
                                        <div>제목: </div>
                                        <h1 style={{ fontSize: '1rem' }}>{item?.post_title}</h1>
                                    </Row>
                                    <img src={item?.post_title_img} style={{width:'100%'}} />
                                    <ReactQuill
                                        className='none-padding'
                                        value={item?.post_content ?? `<body></body>`}
                                        readOnly={true}
                                        theme={"bubble"}
                                        bounds={'.app'}
                                    />
                                    {item?.replies && item?.replies.map((reply, idx) => (
                                        <>
                                            <Row style={{ columnGap: '0.5rem', fontSize: '1rem', alignItems: 'center' }}>
                                                <div>답변제목: </div>
                                                <h1 style={{ fontSize: '1rem' }}>{reply?.post_title}</h1>
                                            </Row>
                                            <ReactQuill
                                                className='none-padding'
                                                value={reply?.post_content ?? `<body></body>`}
                                                readOnly={true}
                                                theme={"bubble"}
                                                bounds={'.app'}
                                            />
                                        </>
                                    ))}
                                </>}
                        </Stack>
                    </>}
            </Wrappers>
        </>
    )
}
export default Demo1
