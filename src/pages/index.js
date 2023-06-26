import { useRouter } from "next/router";
import { useEffect } from "react";

const category = 'shop';
const Index = () => {
  const router = useRouter();
  useEffect(() => {
    if (category == 'blog') {
      router.push('/blog')
    } else if (category == 'shop') {
      router.push('/shop')
    }
  }, [])
}

export default Index
