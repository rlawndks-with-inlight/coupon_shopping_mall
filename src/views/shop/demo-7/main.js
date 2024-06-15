import { useRouter } from "next/router";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { HomeDemo1 } from "../demo-1";
import styled from "styled-components";

const MainDemo = (props) => {

    const { user } = useAuthContext();
    const { themeDnsData } = useSettingsContext();
    const router = useRouter();

    return (
        <>
            <HomeDemo1 {...props} />
        </>
    )
}
export default MainDemo