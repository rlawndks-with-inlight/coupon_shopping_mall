import { useTheme } from "@emotion/react";
import { Button, Stack, TextField } from "@mui/material";
import _ from "lodash";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import { Col, Title } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { react_quill_data } from "src/data/manager-data";
import { uploadFileByManager } from "src/utils/api-manager";
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
    const [item, setItem] = useState({
        category_id: router.query?.category_id,
        parent_id: null,
        post_title: '',
        post_content: '',
        is_reply: false,
    })
    useEffect(() => {
        setPostCategory(_.find(themePostCategoryList, { id: parseInt(router.query?.article_category) }))
        console.log(_.find(themePostCategoryList, { id: parseInt(router.query?.article_category) }))
    }, [router.query?.article_category, themePostCategoryList])
    const onSave = async () => {
        let result = undefined;
        return;
        if (router.query?.id == 'add') {
          result = await addPostByManager({ ...item });
        } else {
          result = await updatePostByManager({ ...item, id: router.query?.id });
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
                }}>{postCategory?.post_category_title} 작성</Title>
                <Stack spacing={3}>
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
                        height: '48px', width: '120px', marginLeft: 'auto'
                    }} onClick={() => {
                        setModal({
                            func: () => { onSave() },
                            icon: 'material-symbols:edit-outline',
                            title: '저장 하시겠습니까?'
                        })
                    }}>
                        저장
                    </Button>
                </Stack>
            </Wrappers>
        </>
    )
}
export default Demo1
