import { useRouter } from "next/router";
import { useEffect } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
//주문내역
const Root = () => {
  const router = useRouter();
  useEffect(() => {
    router.push('/manager/orders/list')
  }, [])
  return (
    <>

    </>
  )
}
Root.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default Root
