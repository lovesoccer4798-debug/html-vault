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
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!item) return null;

  const hasUrl = !!item.url;
  const hasCode = !!item.code;

  const copyCode = async () => {
    const text = item.code || item.url || "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-vault-surface border border-vault-border rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-vault-border">
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-semibold text-vault-text text-lg truncate">{item.title}</h2>
              {item.favorite && <span className="text-amber-400 text-sm">♥</span>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {item.category && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-purple-600/15 text-purple-400 border border-purple-600/20">
                  {item.category}
                </span>
              )}
              {item.tags.map((tag) => (
                <span key={tag} className="text-xs text-vault-muted">
                  #{tag}
                </span>
              ))}
              {hasUrl && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-0.5 rounded-md bg-blue-600/15 text-blue-400 border border-blue-600/20 hover:bg-blue-600/25 transition-colors flex items-center gap-1"
                >
                  ↗ 外部リンクを開く
                </a>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* View mode toggle (only when both exist) */}
            {hasUrl && hasCode && (
              <div className="flex bg-vault-card rounded-lg border border-vault-border p-0.5">
                {(["preview", "code"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                      viewMode === mode
                        ? "bg-purple-600/30 text-purple-300"
                        : "text-vault-muted hover:text-vault-text"
                    }`}
                  >
                    {mode === "preview" ? "プレビュー" : "コード"}
                  </button>
                ))}
              </div>
            )}
            {hasCode && (
              <button
                onClick={copyCode}
                className="text-xs px-3 py-1.5 rounded-lg bg-vault-card hover:bg-vault-border text-vault-subtext hover:text-vault-text border border-vault-border transition-colors"
              >
                {copied ? "✓ コピー完了" : "コードをコピー"}
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
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-vault-card text-vault-muted hover:text-vault-text transition-colors text-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body: preview + optional code panel */}
        <div className="flex flex-1 min-h-0">
          {/* Live Preview */}
          <div className="flex-1 min-w-0">
            {hasUrl && (!hasCode || viewMode === "preview") ? (
              <iframe
                ref={iframeRef}
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
            )}
          </div>

          {/* Code panel (shown when code exists AND not in URL-only view) */}
          {hasCode && (!hasUrl || viewMode === "code") && (
            <div className="w-80 flex-shrink-0 flex flex-col border-l border-vault-border bg-vault-bg">
              <div className="px-4 py-3 border-b border-vault-border flex items-center justify-between">
                <p className="text-xs font-semibold text-vault-muted uppercase tracking-wider">
                  HTML コード
                </p>
                <span className="text-xs text-vault-muted">
                  {item.code.split("\n").length} 行
                </span>
              </div>
              <pre className="flex-1 overflow-auto p-4 text-xs font-mono leading-relaxed">
                <code className="text-green-400">{item.code}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
