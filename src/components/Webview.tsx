import { Brand, Fonts } from "@/constants/theme";
import { useState } from "react";
import { StyleSheet } from "react-native";
import WebView from "react-native-webview";

export default function WebviewComponent({ document }: { document: string }) {
  const [webViewHeight, setWebViewHeight] = useState<number>(500);

  const handleMessage = (event: any) => {
    const height = Number(event.nativeEvent.data);
    if (height && height > 0) {
      setWebViewHeight(height);
    }
  };

  const htmlContent = (document: string) => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * {
            box-sizing: border-box;
          }
          body {
            font-family: ${Fonts?.sans || "sans-serif"};
            font-size: 18px;
            line-height: 1.7;
            color: ${Brand.colors.inkSoft};
            padding: 24px 18px 36px;
            margin: 0;
            background-color: ${Brand.colors.background};
            -webkit-font-smoothing: antialiased;
          }
          #content-container {
            max-width: 860px;
            margin: 0 auto;
          }
          img {
            max-width: 100% !important;
            height: auto !important;
            display: block;
            margin: 24px auto;
            border: 1px solid ${Brand.colors.border};
            border-radius: 4px;
          }
          h1, h2, h3, h4 {
            font-family: ${Fonts?.serif || "serif"};
            color: ${Brand.colors.ink};
            line-height: 1.25;
            font-weight: 600;
          }
          h1 {
            font-size: 32px;
            margin: 0 0 24px;
          }
          h2 {
            font-size: 25px;
            margin: 32px 0 14px;
          }
          h3 {
            font-size: 20px;
            margin: 26px 0 10px;
          }
          h4 {
            font-size: 17px;
            margin: 22px 0 8px;
          }
          p {
            margin-top: 0;
            margin-bottom: 16px;
          }
          ul, ol {
            margin: 0 0 18px;
            padding-left: 26px;
          }
          li {
            margin-bottom: 8px;
            padding-left: 4px;
          }
          hr {
            border: 0;
            border-top: 1px solid ${Brand.colors.border};
            margin: 28px 0;
          }
          blockquote {
            border-left: 2px solid ${Brand.colors.primary};
            color: ${Brand.colors.muted};
            margin: 24px 0;
            padding: 8px 0 8px 18px;
            font-family: ${Fonts?.serif || "serif"};
            font-style: italic;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 24px 0;
            font-size: 15px;
            overflow: hidden;
          }
          th, td {
            border: 1px solid ${Brand.colors.border};
            padding: 10px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background: ${Brand.colors.surface};
            font-weight: 700;
          }
          code {
            background: #F4EEE8;
            padding: 2px 4px;
            font-family: monospace;
            font-size: 0.9em;
          }
          pre {
            background: ${Brand.colors.inkSoft};
            color: ${Brand.colors.background};
            padding: 16px;
            overflow-x: auto;
            border-radius: 4px;
          }
          pre code {
            background: transparent;
            padding: 0;
          }
          a {
            color: ${Brand.colors.primary};
            font-weight: 600;
            text-decoration: underline;
            text-decoration-color: ${Brand.colors.primaryLight};
            text-underline-offset: 3px;
          }
          strong, b {
            color: ${Brand.colors.ink};
          }
          figure {
            margin: 24px 0;
          }
          figcaption {
            color: ${Brand.colors.muted};
            font-size: 14px;
            text-align: center;
            margin-top: 8px;
          }
        </style>
      </head>
      <body>
        <div id="content-container">
          ${document}
        </div>
        <script>
          function sendHeight() {
            var height = document.body.scrollHeight || document.documentElement.scrollHeight;
            window.ReactNativeWebView.postMessage(height);
          }
          window.onload = sendHeight;
          window.addEventListener('resize', sendHeight);
          document.querySelectorAll('img').forEach(function(image) {
            image.addEventListener('load', sendHeight);
          });
          if (window.ResizeObserver) {
            new ResizeObserver(sendHeight).observe(document.body);
          }
        </script>
      </body>
    </html>
  `;
  };

  return (
    <WebView
      pointerEvents="none"
      originWhitelist={["*"]}
      source={{ html: htmlContent(document || "") }}
      style={[styles.webview, { height: webViewHeight }]}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      scrollEnabled={false} // Lets root ScrollView handle page scrolling
      onMessage={handleMessage}
    />
  );
}

const styles = StyleSheet.create({
  webview: {
    width: "100%",
    height: "100%",
    backgroundColor: Brand.colors.background,
    margin: 10,
    borderRadius: 4,
  },
});
