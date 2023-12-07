import { Button, Card, Checkbox, FormControlLabel, Grid, Stack, Typography } from "@mui/material";
import { useRouter } from "next/router"
import { useEffect, useState } from "react";
import { Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import ManagerLayout from "src/layouts/manager/ManagerLayout"
import { apiManager } from "src/utils/api";

const ColumnSetting = () => {

    const router = useRouter();

    const { themeDnsData, settingPlatform } = useSettingsContext();
    const [loading, setLoading] = useState(true);
    const [tabList, setTabList] = useState([]);
    const [columnList, setColumnList] = useState([]);
    const [currentTab, setCurrentTab] = useState("")
    useEffect(() => {
        getTableList();
    }, [])
    useEffect(() => {
        getColumnList(currentTab);
    }, [currentTab])
    const getTableList = async () => {

        const response = await apiManager(`column`, 'get');
        setCurrentTab(response[0])
        setTabList(response);
        setLoading(false);
    }
    const getColumnList = async (table) => {
        if (!table) {
            return;
        }
        const response = await apiManager(`column/${table}`, 'get');
        setColumnList(response);
    }
    const onChangeUseColumn = async (column, is_not_use = 0) => {
        setLoading(true);
        const response = await apiManager(`column/${currentTab}`, 'create', {
            column,
            is_not_use
        });
        await settingPlatform();
        setLoading(false);
    }
    return (
        <>
            {!loading &&
                <>
                    <Row style={{
                        margin: '0 0 1rem 0',
                        overflowX: 'auto',
                        display: 'block',
                        whiteSpace: 'nowrap',
                    }}>
                        {tabList.map(tab => (
                            <Button
                                sx={{ marginRight: '0.5rem' }}
                                variant={tab == currentTab ? 'contained' : 'outlined'}
                                onClick={() => {
                                    setCurrentTab(tab)
                                }}
                            >
                                {tab}
                            </Button>
                        ))}
                    </Row>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            <Card sx={{ p: 2, height: '100%' }}>
                                <Stack spacing={1}>
                                    {columnList.map(column => (
                                        <>
                                            <FormControlLabel
                                                label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>{column}</Typography>}
                                                control={<Checkbox checked={!themeDnsData?.none_use_column_obj[currentTab]?.includes(column)} />}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        onChangeUseColumn(column, 0);
                                                    } else {
                                                        onChangeUseColumn(column, 1);
                                                    }
                                                }}
                                            />
                                        </>
                                    ))}
                                </Stack>
                            </Card>
                        </Grid>
                    </Grid>
                </>}
        </>
    )
}
ColumnSetting.getLayout = page => <ManagerLayout>{page}</ManagerLayout>
export default ColumnSetting
