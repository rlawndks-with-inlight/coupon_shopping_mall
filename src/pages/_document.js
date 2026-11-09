import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

// 언어팩(is_use_lang)을 켠 몰은 브라우저 자동 번역을 끈다.
// 우리 사전으로 이미 그 언어를 보여 주는데, 휴대폰 크롬이 그 화면을 다시 폰 언어로 기계 번역해
// 「휴대폰→Mobile→이동하는」 같은 문구가 나왔다(해담수산, 2026-11-09 제보 — 영어 선택이 남은 한국 손님).
// 언어팩을 끈 몰은 한국어 화면뿐이라 외국 손님에게는 브라우저 번역이 유일한 길이다 — 그대로 둔다.
//
// <html> 은 화면을 옮겨 다녀도 다시 그려지지 않으므로 첫 응답 한 번에 넣으면 끝까지 유지된다.
// (head_data 는 _app.getInitialProps 가 서버에서 채워 __NEXT_DATA__ 로 내려 준다)
const 사전언어 = { ko: 'ko', en: 'en', ja: 'ja', cn: 'zh', es: 'es' };

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    const 설정 = this.props?.__NEXT_DATA__?.props?.head_data?.setting_obj ?? {};
    const 우리번역 = 설정?.is_use_lang == 1;
    return (
      <Html lang={사전언어[설정?.default_lang] || 'ko'} translate={우리번역 ? 'no' : undefined}>
        <Head>
          {우리번역 && <meta name="google" content="notranslate" />}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
//styled component 적용을 위한 코드
