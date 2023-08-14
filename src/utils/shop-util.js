import { useEffect } from "react";
import { useSettingsContext } from "src/components/settings"
import { getProductsByUser } from "./api-shop";
import { toast } from "react-hot-toast";

export const getCartDataUtil = async (themeCartData) => {
    let data = themeCartData??[];
    if (data.length > 0) {
      let products = await getProductsByUser({
        page: 1,
        page_size: 100000,
      })
      products = products?.content ?? [];
      for (var i = 0; i < data.length; i++) {
        let find_item = _.find(products, { id: data[i]?.id })
        if (find_item) {
          data[i] = {
            ...data[i],
            ...find_item,
          }
        }
      }
    }
    return data;
}
export const insertCartDataUtil = (product, selectProduct, themeCartData, onChangeCartData) => {
    try{
        let cart_data = [...themeCartData];
        let select_product = { ...selectProduct };
        for (var i = 0; i < product?.groups.length; i++) {
          let group = product?.groups[i];
          if (!select_product.select_option_obj[group?.id]) {
            toast.error(`${group?.group_name}을(를) 선택해 주세요.`);
            return false;
          }
        }
        let option_key_list = Object.keys(select_product.select_option_obj ?? {});
        let insert_item = true;
        let find_index = -1;
        for (var i = 0; i < cart_data.length; i++) {
          if (cart_data[i]?.id == select_product.id) {
            for (var j = 0; j < option_key_list.length; j++) {
              if (select_product.select_option_obj[option_key_list[j]]?.option_id != cart_data[i].select_option_obj[option_key_list[j]]?.option_id) {
                break;
              }
            }
            if (j == option_key_list.length) {
              insert_item = false;
              find_index = i;
              break;
            }
          }
        }
        if (insert_item) {
          cart_data.push(select_product);
        } else {
          cart_data[find_index].count = cart_data[find_index].count + select_product.count;
        }
        onChangeCartData(cart_data);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}
export const getWishDataUtil = async (themeWishData) => {
    let products = await getProductsByUser({
        page: 1,
        page_size: 100000,
    })
    products = products?.content ?? [];
    let wish_list = [];
    for (var i = 0; i < products.length; i++) {
        let find_index = _.indexOf(themeWishData, products[i]?.id);
        if (find_index >= 0) {
            wish_list.push(products[i]);
        }
    }
    return wish_list;
}
export const insertWishDataUtil = (item, themeWishData, onChangeWishData) => {
    try {
        let wish_data = [...themeWishData];
        let find_index = _.indexOf(wish_data, item?.id);
        if (find_index >= 0) {
            wish_data.splice(find_index, 1);
        } else {
            wish_data.push(item?.id);
        }
        onChangeWishData(wish_data);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}