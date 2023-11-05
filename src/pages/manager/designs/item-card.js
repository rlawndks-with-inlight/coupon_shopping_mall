import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ItemCardSetting from "src/views/manager/item-card/setting";

const ItemCard = () => {
 
  return (
    <>
      <ItemCardSetting ITEM_CARD_TYPE={'shop_item_card_css'}/>
    </>
  )
}
ItemCard.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default ItemCard;
