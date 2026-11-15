import type { Metadata } from "next";
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
            <body>{children}</body>
        </html>
    );
}
