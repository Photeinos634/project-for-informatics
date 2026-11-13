import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
    title: "MojiFix",
    description: "文字コードの再解釈と文字化けをブラウザ上で確認するツール",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
            <body>
                <Header />
                <main className="main-content">{children}</main>
                <Footer />
            </body>
        </html>
    );
}
