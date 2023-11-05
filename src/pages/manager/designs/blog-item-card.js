import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ItemCardSetting from "src/views/manager/item-card/setting";

const BlogItemCard = () => {
 
  return (
    <>
      <ItemCardSetting ITEM_CARD_TYPE={'blog_item_card_css'}/>
    </>
  )
}
BlogItemCard.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default BlogItemCard;
