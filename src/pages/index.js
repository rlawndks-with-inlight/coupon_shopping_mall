import { useTheme } from "@emotion/react";
import { useScroll, useSpring, m } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  HomeHero,
  HomeMinimal,
  HomeDarkMode,
  HomeLookingFor,
  HomeForDesigner,
  HomeColorPresets,
  HomePricingPlans,
  HomeAdvertisement,
  HomeCleanInterfaces,
  HomeHugePackElements,
} from '../views/home';
import MainLayout from "src/layouts/main/MainLayout";
import { Box } from "@mui/material";
const category = 'blog';
const Index = () => {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (category == 'blog') {
      router.push('/blog')
    } else if (category == 'shop') {
      router.push('/shop')
    }
  }, [])
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const progress = (
    <m.div
      style={{
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 1999,
        position: 'fixed',
        transformOrigin: '0%',
        backgroundColor: theme.palette.primary.main,
        scaleX,
      }}
    />
  );

  return (
    <>
      {/* <Head>
        <title> The starting point for your next project | Minimal UI</title>
      </Head> */}

      {progress}

      <HomeHero />

      <Box
        sx={{
          overflow: 'hidden',
          position: 'relative',
          bgcolor: 'background.default',
        }}
      >
        <HomeMinimal />

        <HomeHugePackElements />

        <HomeForDesigner />

        <HomeDarkMode />

        <HomeColorPresets />

        <HomeCleanInterfaces />

        <HomePricingPlans />

        <HomeLookingFor />

        <HomeAdvertisement />
      </Box>
    </>
  );
}
Index.getLayout = (page) => <MainLayout> {page} </MainLayout>;
export default Index
