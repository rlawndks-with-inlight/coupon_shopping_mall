
import { Button, Card, CardHeader, Grid, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { Row } from "src/components/elements/styled-components";
import { Upload } from "src/components/upload";
import ManagerLayout from "src/layouts/manager/ManagerLayout";

const ProductEdit = () => {

  const [categories, setCategories] = useState([]);
  const [item, setItem] = useState({
    product_img: '',
    images: [],
    product_name: ''
  })
  const handleDropMultiFile = (acceptedFiles) => {
    let images = [...item.images];
    for (var i = 0; i < acceptedFiles.length; i++) {
      images.push({ ...acceptedFiles[i], preview: URL.createObjectURL(acceptedFiles[i]) })
    }
    setItem({ ...item, ['images']: images })
  };

  const handleRemoveFile = (inputFile) => {
    let images = [...item.images];
    const filesFiltered = images.filter((fileFiltered) => fileFiltered !== inputFile);
    images = filesFiltered;
    setItem({ ...item, ['images']: images })
  };

  const handleRemoveAllFiles = () => {
    let images = [...item.images];
    images = [];
    setItem({ ...item, ['images']: images })
  };
  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <CardHeader title={`대표이미지등록`} sx={{ padding: '0 0 0.5rem 0' }} />
            <Upload file={item.product_img} onDrop={(acceptedFiles) => {
              const newFile = acceptedFiles[0];
              if (newFile) {
                setItem(
                  {
                    ...item,
                    ['product_img']: Object.assign(newFile, {
                      preview: URL.createObjectURL(newFile),
                    })
                  }
                );
              }
            }} onDelete={() => {
              setItem(
                {
                  ...item,
                  ['product_img']: ''
                }
              )
            }} />
            <CardHeader title={`개별이미지등록`} sx={{ padding: '0.5rem 0' }} />
            <Upload
              multiple
              thumbnail={true}
              files={item.images}
              onDrop={(acceptedFiles) => {
                handleDropMultiFile(acceptedFiles)
              }}
              onRemove={(inputFile) => {
                handleRemoveFile(inputFile)
              }}
              onRemoveAll={() => {
                handleRemoveAllFiles();
              }}
              fileExplain={{
                width: '(520x520 추천)'//파일 사이즈 설명
              }}
              imageSize={{ //썸네일 사이즈
                width: 200,
                height: 200
              }}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <TextField
              label='상품명'
              sx={{ width: '100%' }}
              value={item.product_name}
              onChange={(e) => {
                setItem(
                  {
                    ...item,
                    ['product_name']: e.target.value
                  }
                )
              }} />
            <TextField
              label='상품 간단한 설명'
              sx={{ width: '100%',marginTop:'1rem' }}
              value={item.product_name}
              onChange={(e) => {
                setItem(
                  {
                    ...item,
                    ['product_name']: e.target.value
                  }
                )
              }} />
          </Card>
        </Grid>
        <Grid item xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={1}>
              <Button variant="contained" style={{
                height: '48px', width: '120px', marginLeft: 'auto'
              }} onClick={() => {

              }}>
                저장
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}
ProductEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default ProductEdit
