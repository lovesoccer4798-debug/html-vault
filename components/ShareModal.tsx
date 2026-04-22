"use client";

import { useEffect, useState } from "react";
import { HtmlItem, SharePackage } from "@/lib/types";

interface ShareModalProps {
  categoryName: string;
  items: HtmlItem[];
  onClose: () => void;
}

export default function ShareModal({ categoryName, items, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    const pkg: SharePackage = {
      version: 1,
      exportedAt: new Date().toISOString(),
      category: categoryName,
      items: items.map(({ title, description, category, tags, code, url, favorite }) => ({
        title,
        description,
        category,
        tags,
        code,
        url,
        favorite,
      })),
    };
    const encoded = btoa(encodeURIComponent(JSON.stringify(pkg)));
    setShareUrl(`${window.location.origin}/import?data=${encoded}`);
  }, [categoryName, items]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const copyUrl = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const exportJson = () => {
    const pkg: SharePackage = {
      version: 1,
      exportedAt: new Date().toISOString(),
      category: categoryName,
      items: items.map(({ title, description, category, tags, code, url, favorite }) => ({
        title,
        description,
        category,
        tags,
        code,
        url,
        favorite,
      })),
    };
    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `html-vault-${categoryName.replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-vault-surface border border-vault-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-vault-border">
          <div>
            <h2 className="font-semibold text-vault-text text-base">パッケージを共有</h2>
            <p className="text-xs text-vault-muted mt-0.5">
              <span className="text-purple-400">{categoryName}</span>
              {" "}— {items.length} 件のスニペット
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-vault-card text-vault-muted hover:text-vault-text transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Item list preview */}
          <div className="bg-vault-bg rounded-xl border border-vault-border overflow-hidden">
            <div className="px-4 py-2.5 border-b border-vault-border">
              <p className="text-xs font-semibold text-vault-muted uppercase tracking-wider">
                含まれるスニペット
              </p>
            </div>
            <ul className="divide-y divide-vault-border max-h-40 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="px-4 py-2.5 flex items-center gap-3">
                  <span className="text-sm">{item.favorite ? "♥" : "○"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-vault-text truncate">{item.title}</p>
                    <div className="flex gap-1 mt-0.5">
                      {item.url && (
                        <span className="text-[10px] px-1 py-0.5 rounded bg-blue-600/20 text-blue-400">URL</span>
                      )}
                      {item.code && (
                        <span className="text-[10px] px-1 py-0.5 rounded bg-purple-600/20 text-purple-400">HTML</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Share URL */}
          <div>
            <label className="block text-xs font-medium text-vault-subtext mb-2">共有URL</label>
            <div className="flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-xs text-vault-muted font-mono truncate focus:outline-none"
              />
              <button
                onClick={copyUrl}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  copied
                    ? "bg-green-600/20 text-green-400 border border-green-600/30"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
              >
                {copied ? "✓ コピー済" : "コピー"}
              </button>
            </div>
            <p className="text-xs text-vault-muted mt-1.5">
              このURLを共有すると、受け取った側がインポートできます
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-vault-border" />
            <span className="text-xs text-vault-muted">または</span>
            <div className="flex-1 h-px bg-vault-border" />
          </div>

          {/* JSON Export */}
          <button
            onClick={exportJson}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-vault-border hover:border-purple-600/40 hover:bg-purple-600/5 text-vault-subtext hover:text-vault-text transition-all duration-200 text-sm"
          >
            <span>⬇</span>
            JSONファイルとしてダウンロード
          </button>
        </div>
      </div>
    </div>
  );
}
