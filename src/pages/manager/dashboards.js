import { useRouter } from "next/router";
import { useSettingsContext } from "src/components/settings";

import ManagerLayout from "src/layouts/manager/ManagerLayout";
import DashboardDemo4 from "src/views/manager/dashboards/demo-4";

const getDemo = (num, common) => {
  if (num == 1)
    return
  else if (num == 2)
    return
  else if (num == 3)
    return
  else if (num == 4)
    return <DashboardDemo4 {...common} />
  else if (num == 5)
    return
  else if (num == 6)
    return
  else if (num == 7)
    return
}
const Dashboards = () => {

  const router = useRouter();
  const { themeDnsData } = useSettingsContext();
  return (
    <>
      {getDemo(themeDnsData?.shop_demo_num, {
        data: {
        },
        func: {
          router
        },
      })}
    </>
  )
}
Dashboards.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;

export default Dashboards;
