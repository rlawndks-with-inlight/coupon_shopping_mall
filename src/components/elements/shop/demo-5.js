import { useState } from "react";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { itemThemeCssDefaultSetting } from "src/views/manager/item-card/setting";


export const Item5 = (props) => {
    const { user } = useAuthContext();
    const { themeWishData, onChangeWishData } = useSettingsContext();
    const { item, router, theme_css, seller } = props;
    const [itemThemeCss, setItemThemeCss] = useState(itemThemeCssDefaultSetting);
    return (
        <>

        </>
    )
}

export const Seller5 = (props) => {
    const { item, router } = props;
    return (
        <>

        </>
    )
}
