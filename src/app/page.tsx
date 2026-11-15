import Link from "next/link";

const encodings = [
    "UTF-8",
    "Shift_JIS",
    "EUC-JP",
    "ISO-2022-JP",
    "UTF-16 LE",
    "UTF-16 BE",
];

export default function Home() {
    return (
        <div className="site-shell">
            <header className="site-header">
                <Link className="brand" href="/" aria-label="MojiFix ホーム">
                    <span className="brand-mark" aria-hidden="true">
                        M
                    </span>
                    <span>MojiFix</span>
                </Link>
                <span className="header-note">
                    文字化けを、ブラウザーでかんたん修正
                </span>
                <span className="privacy-badge">UI プレビュー</span>
            </header>

            <main className="page-main">
                <section className="intro" aria-labelledby="page-title">
                    <p className="eyebrow">文字コード変換ツール</p>
                    <h1 id="page-title">文字化けを、読みやすい文字に。</h1>
                    <p className="intro-copy">
                        文字化けした文章を入力し、文字コードを選択してください。
                    </p>
                </section>

                <section className="converter-card" aria-label="文字化け修正">
                    <div className="section-heading">
                        <div>
                            <span className="step-label">STEP 01</span>
                            <h2>文字化けした文章を入力</h2>
                        </div>
                        <button className="text-button" type="button">
                            サンプルを試す
                            <span aria-hidden="true"> ↗</span>
                        </button>
                    </div>

                    <label className="sr-only" htmlFor="source-text">
                        文字化けした文章
                    </label>
                    <textarea
                        id="source-text"
                        className="text-input"
                        placeholder={
                            "ここに文字化けした文章を貼り付けてください\n例：縺薙ｓ縺ｫ縺｡縺ｯ"
                        }
                        spellCheck={false}
                    />
                    <div className="input-meta">
                        <span>文字化けした文章を入力してください</span>
                        <span>0 文字</span>
                    </div>

                    <div className="encoding-section">
                        <div className="section-heading encoding-heading">
                            <div>
                                <span className="step-label">STEP 02</span>
                                <h2>文字コードを選択</h2>
                            </div>
                            <span className="encoding-hint">
                                迷ったら Shift_JIS → UTF-8 をお試しください
                            </span>
                        </div>

                        <div className="encoding-controls">
                            <label className="select-field">
                                <span>変換元</span>
                                <select defaultValue="Shift_JIS">
                                    {encodings.map((encoding) => (
                                        <option key={encoding}>
                                            {encoding}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <button
                                className="swap-button"
                                type="button"
                                aria-label="変換元と変換先を入れ替える"
                                title="変換元と変換先を入れ替え"
                            >
                                ⇄
                            </button>
                            <label className="select-field">
                                <span>変換先</span>
                                <select defaultValue="UTF-8">
                                    {encodings.map((encoding) => (
                                        <option key={encoding}>
                                            {encoding}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <button className="convert-button" type="button">
                            <span className="convert-icon" aria-hidden="true">
                                ✦
                            </span>
                            文字化けを修正する
                            <span className="button-arrow" aria-hidden="true">
                                →
                            </span>
                        </button>
                    </div>

                    <section
                        className="result-section"
                        aria-labelledby="result-title"
                    >
                        <div className="result-heading">
                            <div>
                                <span className="step-label">STEP 03</span>
                                <h2 id="result-title">変換結果</h2>
                            </div>
                            <button
                                className="copy-button"
                                type="button"
                                disabled
                            >
                                <span aria-hidden="true">▢</span>
                                結果をコピー
                            </button>
                        </div>

                        <div className="result-box">
                            <span className="empty-result">
                                変換結果がここに表示されます
                            </span>
                        </div>

                        <details className="hex-details">
                            <summary>
                                <span>HEX表示</span>
                                <span className="hex-summary-hint">
                                    変換したバイト列を確認
                                </span>
                            </summary>
                            <div className="hex-content">
                                <span className="empty-result">
                                    HEX表示は変換後に確認できます
                                </span>
                            </div>
                        </details>
                    </section>
                </section>

                <p className="page-footnote">
                    文字コードの再解釈により、入力と異なる文字が表示される場合があります。
                </p>
            </main>

            <footer className="site-footer">
                <span>© 2026 MojiFix</span>
                <span>文字コード変換ツール</span>
            </footer>
        </div>
    );
}
