import { useRouter } from "next/router";
import { useEffect } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
const Root = () => {
  const router = useRouter();
  useEffect(() => {
    router.push('/manager/designs/main')
  }, [])
  return (
    <>

    </>
  )
}
Root.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default Root
