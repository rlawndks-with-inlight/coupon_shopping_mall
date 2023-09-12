import ManagerLayout from "src/layouts/manager/ManagerLayout";
import MainObjSetting from "src/views/manager/main_obj/setting";

const BlogMain = () => {
  return (
    <>
     <MainObjSetting MAIN_OBJ_TYPE={'blog_obj'} />
    </>
  )
}
BlogMain.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default BlogMain;
