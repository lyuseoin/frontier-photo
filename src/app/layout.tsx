import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = settings.school_name
    ? `${settings.school_name} ${settings.class_name}`
    : settings.class_name;
  return {
    title: { default: `${title} 학급 홈페이지`, template: `%s · ${title}` },
    description: settings.tagline || `${title} 공지 · 일정 · 시간표 안내`,
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
