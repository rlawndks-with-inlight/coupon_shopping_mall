import { useRouter } from "next/router";
import { useSettingsContext } from "src/components/settings";

import ManagerLayout from "src/layouts/manager/ManagerLayout";
import DashboardDemo2 from "src/views/manager/dashboards/demo-2";
import MasterDashboard from "src/views/manager/dashboards/master";

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
      {/* 마스터(shopgo)는 가맹점 관리 대시보드, 하위 가맹점은 매출·주문 대시보드(Demo2)로 통일 */}
      {themeDnsData?.is_main_dns == 1
        ? <MasterDashboard {...common} />
        : <DashboardDemo2 {...common} />}
    </>
  )
}
Dashboards.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;

export default Dashboards;
