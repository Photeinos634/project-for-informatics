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
                        M&gt;
                    </span>
                    <span className="brand-name">MojiFix</span>
                </Link>
                <span className="header-note">
                    DIRECT WEB TOOL　/　文字コード変換・文字化け確認
                </span>
                <span className="privacy-badge">
                    <span className="status-lamp" aria-hidden="true" />
                    UI PREVIEW
                </span>
            </header>

            <main className="page-main">
                <section className="intro" aria-labelledby="page-title">
                    <p className="eyebrow">MOJIFIX　文字コード修正室</p>
                    <h1 id="page-title">文字化けを、読みやすい文字に。</h1>
                    <p className="intro-copy">
                        文字コードの違いで読めなくなった文章を、ここでチェック。
                    </p>
                    <div className="welcome-banner" aria-label="MojiFix">
                        <span>★</span>
                        <strong>ようこそ MojiFix へ</strong>
                        <span>★</span>
                    </div>
                </section>

                <div className="workspace-grid">
                    <aside className="retro-sidebar" aria-label="ページメニュー">
                        <h2 className="sidebar-heading">TOOLS MENU</h2>
                        <nav className="sidebar-menu">
                            <a href="#input">≫ 文字化け文章</a>
                            <a href="#encoding">≫ 文字コード選択</a>
                            <a href="#result">≫ 変換結果</a>
                            <a href="#hex">≫ HEX表示</a>
                        </nav>
                        <div className="sidebar-note">
                            <span className="sidebar-note-title">お知らせ</span>
                            <p>MojiFix UI preview</p>
                            <span className="sidebar-stars" aria-hidden="true">
                                ★ ★ ★
                            </span>
                        </div>
                    </aside>

                    <section className="converter-card" aria-label="文字化け修正">
                        <div className="section-heading" id="input">
                            <div>
                                <span className="step-label">01 / INPUT</span>
                                <h2>文字化けした文章を入力</h2>
                            </div>
                            <button className="text-button" type="button">
                                サンプルを試す <span aria-hidden="true">★</span>
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
                            <span>文章を入力してください</span>
                            <span>0 文字</span>
                        </div>

                        <div className="encoding-section" id="encoding">
                            <div className="section-heading encoding-heading">
                                <div>
                                    <span className="step-label">
                                        02 / ENCODING
                                    </span>
                                    <h2>文字コードを選択</h2>
                                </div>
                                <span className="encoding-hint">
                                    Shift_JIS → UTF-8
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
                                <span
                                    className="convert-icon"
                                    aria-hidden="true"
                                >
                                    ✦
                                </span>
                                文字化けを修正する
                                <span
                                    className="button-arrow"
                                    aria-hidden="true"
                                >
                                    →
                                </span>
                            </button>
                        </div>

                        <section
                            className="result-section"
                            id="result"
                            aria-labelledby="result-title"
                        >
                            <div className="result-heading">
                                <div>
                                    <span className="step-label">
                                        03 / RESULT
                                    </span>
                                    <h2 id="result-title">変換結果</h2>
                                </div>
                                <button
                                    className="copy-button"
                                    type="button"
                                    disabled
                                >
                                    結果をコピー
                                </button>
                            </div>

                            <div className="result-box">
                                <span className="empty-result">
                                    変換結果がここに表示されます
                                </span>
                            </div>

                            <details className="hex-details" id="hex">
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
                </div>

                <p className="page-footnote">
                    ※ UI プレビュー：ボタンを押しても変換は行われません。
                </p>
            </main>

            <footer className="site-footer">
                <span>★ MojiFix　文字コード変換ツール ★</span>
                <span>WELCOME TO OUR WEB SITE</span>
            </footer>
        </div>
    );
}
