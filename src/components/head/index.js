import Head from "next/head";
const HeadContent = ({ dns_data }) => {
  console.log(dns_data)
  return (
    <>
      <Head>
        <title>{dns_data?.name}</title>
        <meta
          name='description'
          content={dns_data?.og_description}
        />
        <link rel='shortcut icon' href={dns_data?.favicon_img} />
        <link rel="apple-touch-icon" sizes="180x180" href={dns_data?.favicon_img} />
        <meta name='keywords' content={dns_data?.name} />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={dns_data?.name} />
        <meta property="og:image" content={dns_data?.og_img} />
        <meta property="og:url" content={'https:' + dns_data?.dns} />
        <meta property="og:description" content={dns_data?.og_description} />
        <meta name="author" content="purplevery" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0, user-scalable=0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={dns_data?.name} />
        <meta name="theme-color" content={JSON.parse(dns_data?.theme_css ?? "{}")?.main_color || "#7367f0"} />
      </Head>
    </>
  )
}
export default HeadContent;
