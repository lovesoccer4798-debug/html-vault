"use client";

import { useEffect, useRef, useState } from "react";
import { HtmlItem } from "@/lib/types";

interface PreviewModalProps {
  item: HtmlItem | null;
  onClose: () => void;
  onEdit: (item: HtmlItem) => void;
}

export default function PreviewModal({ item, onClose, onEdit }: PreviewModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mobileTab, setMobileTab] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // モーダルが開いた時にスクロールをロック
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!item) return null;

  const hasUrl = !!item.url;
  const hasCode = !!item.code;

  const copyCode = async () => {
    await navigator.clipboard.writeText(item.code || item.url || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const PreviewFrame = () => (
    hasUrl ? (
      <iframe
        src={item.url}
        title={`${item.title} プレビュー`}
        className="w-full h-full border-0 bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    ) : hasCode ? (
      <iframe
        ref={iframeRef}
        srcDoc={item.code}
        title={`${item.title} プレビュー`}
        className="w-full h-full border-0 bg-white"
        sandbox="allow-scripts allow-same-origin"
      />
    ) : (
      <div className="flex items-center justify-center h-full bg-vault-bg text-vault-muted text-sm">
        コンテンツがありません
      </div>
    )
  );

  const CodePanel = () => (
    <div className="flex flex-col h-full bg-vault-bg">
      <div className="px-4 py-2.5 border-b border-vault-border flex items-center justify-between flex-shrink-0">
        <p className="text-xs font-semibold text-vault-muted uppercase tracking-wider">HTML コード</p>
        <span className="text-xs text-vault-muted">{(item.code || "").split("\n").length} 行</span>
      </div>
      <pre className="flex-1 overflow-auto p-4 text-xs font-mono leading-relaxed">
        <code className="text-green-400">{item.code}</code>
      </pre>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      {/*
        モバイル: 画面下からシートとして表示（高さ95vh）
        PC: 中央にモーダル表示
      */}
      <div
        className="
          bg-vault-surface border-t md:border border-vault-border
          w-full md:max-w-5xl
          h-[95svh] md:h-[88vh] md:max-h-[88vh]
          md:rounded-2xl rounded-t-2xl
          flex flex-col overflow-hidden
          shadow-2xl shadow-black/60
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-vault-border flex-shrink-0">
          <div className="flex-1 min-w-0 mr-3">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-vault-text text-base truncate">{item.title}</h2>
              {item.favorite && <span className="text-amber-400 text-sm flex-shrink-0">♥</span>}
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {item.category && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-purple-600/15 text-purple-400 border border-purple-600/20">
                  {item.category}
                </span>
              )}
              {hasUrl && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 flex items-center gap-0.5 hover:underline"
                >
                  ↗ 外部リンク
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {hasCode && (
              <button
                onClick={copyCode}
                className="hidden sm:block text-xs px-3 py-1.5 rounded-lg bg-vault-card hover:bg-vault-border text-vault-subtext hover:text-vault-text border border-vault-border transition-colors"
              >
                {copied ? "✓ コピー" : "コピー"}
              </button>
            )}
            <button
              onClick={() => onEdit(item)}
              className="text-xs px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-600/30 transition-colors"
            >
              編集
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-vault-card text-vault-muted hover:text-vault-text transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ===== モバイル: タブ切替 ===== */}
        <div className="md:hidden flex-shrink-0">
          <div className="flex border-b border-vault-border">
            <button
              onClick={() => setMobileTab("preview")}
              className={`flex-1 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                mobileTab === "preview"
                  ? "border-purple-500 text-purple-400"
                  : "border-transparent text-vault-muted"
              }`}
            >
              プレビュー
            </button>
            {hasCode && (
              <button
                onClick={() => setMobileTab("code")}
                className={`flex-1 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  mobileTab === "code"
                    ? "border-purple-500 text-purple-400"
                    : "border-transparent text-vault-muted"
                }`}
              >
                コード
              </button>
            )}
          </div>
        </div>

        {/* モバイル: タブコンテンツ */}
        <div className="md:hidden flex-1 min-h-0">
          {mobileTab === "preview" ? (
            <div className="h-full">
              <PreviewFrame />
            </div>
          ) : (
            <div className="h-full overflow-auto">
              <div className="h-full">
                <CodePanel />
              </div>
            </div>
          )}
        </div>

        {/* モバイル: コピーボタン（コードタブ表示時） */}
        {mobileTab === "code" && hasCode && (
          <div className="md:hidden px-4 py-3 border-t border-vault-border flex-shrink-0">
            <button
              onClick={copyCode}
              className="w-full py-2.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-600/30 text-sm font-medium transition-colors"
            >
              {copied ? "✓ コピー完了" : "コードをコピー"}
            </button>
          </div>
        )}

        {/* ===== PC: 横並びスプリットビュー ===== */}
        <div className="hidden md:flex flex-1 min-h-0">
          {/* プレビュー */}
          <div className="flex-1 min-w-0">
            <PreviewFrame />
          </div>

          {/* コードパネル（コードがある時のみ） */}
          {hasCode && (
            <div className="w-80 flex-shrink-0 border-l border-vault-border">
              <CodePanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
