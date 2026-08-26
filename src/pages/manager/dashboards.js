import { useRouter } from "next/router";
import { useSettingsContext } from "src/components/settings";

import ManagerLayout from "src/layouts/manager/ManagerLayout";
import DashboardDemo2 from "src/views/manager/dashboards/demo-2";
import MasterDashboard from "src/views/manager/dashboards/master";
import { SHOPGO_MASTER_ID } from "src/utils/is-shopgo";

const Dashboards = () => {
  const router = useRouter();
  const { themeDnsData } = useSettingsContext();
  const common = {
    data: {},
    func: {
      router
    },
  };
  return (
    <>
      {/* 가맹점 관리 대시보드(MasterDashboard)는 merchant-application 시스템 기준 ShopGo 본사(id 98) 전용이다.
          그 데이터(가맹점 신청·개설·전체매출)는 백엔드가 마스터=shopgo(MAIN_FRONT_URL)로 고정 조회하므로,
          shopgo 본사가 아닌 다른 메인 브랜드(is_main_dns=1, 예: 에이삽몰)에서 띄우면 남의(shopgo) 가맹점
          데이터가 보였다. → is_main_dns 가 아니라 'shopgo 본사인가'로 판별한다. 그 외는 자기 매출·주문(Demo2). */}
      {Number(themeDnsData?.id) === SHOPGO_MASTER_ID
        ? <MasterDashboard {...common} />
        : <DashboardDemo2 {...common} />}
    </>
  )
}
Dashboards.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;

export default Dashboards;
