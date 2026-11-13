"use client";

import { useState } from "react";
import { ConvertButton } from "@/components/converter/ConvertButton";
import { ConversionResult } from "@/components/converter/ConversionResult";
import { EditorPanel } from "@/components/editor/EditorPanel";

export default function Home() {
    const [input, setInput] = useState("");
    const [sourceEncoding, setSourceEncoding] = useState("");
    const [targetEncoding, setTargetEncoding] = useState("");

    const reset = () => {
        setInput("");
        setSourceEncoding("");
        setTargetEncoding("");
    };

    return (
        <div className="page-container">
            <section className="page-intro" aria-labelledby="page-title">
                <p className="eyebrow">文字コード再解釈ツール</p>
                <h1 id="page-title">文字化けを、仕組みから確かめる。</h1>
                <p>
                    入力した文字列を文字コードのバイト列として捉え直し、
                    表示の変化を確認できます。
                </p>
            </section>

            <div className="integration-notice" role="status">
                <span className="status-dot" aria-hidden="true" />
                変換機能はC担当のHook接続後に有効になります。入力内容はこの画面内でのみ扱われます。
            </div>

            <EditorPanel
                input={input}
                onInputChange={setInput}
                sourceEncoding={sourceEncoding}
                onSourceEncodingChange={setSourceEncoding}
                targetEncoding={targetEncoding}
                onTargetEncodingChange={setTargetEncoding}
                encodings={[]}
                onReset={reset}
                convertButton={
                    <ConvertButton disabled>
                        変換機能の接続待ち
                    </ConvertButton>
                }
            />

            <ConversionResult
                output={null}
                hex={null}
                errors={[]}
                warnings={[]}
            />
        </div>
    );
}
