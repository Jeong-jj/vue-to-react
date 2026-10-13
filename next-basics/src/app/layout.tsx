import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "임대 매물 서비스",
  description: "Vue to React 학습용 Next.js App Router 실습",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>
        <header>
          <nav>
            <Link href={"/"}>홈</Link>
            <Link href={"/properties"}>매물 목록</Link>
          </nav>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
