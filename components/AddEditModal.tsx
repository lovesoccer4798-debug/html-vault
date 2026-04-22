"use client";

import { useEffect, useState } from "react";
import { HtmlItem } from "@/lib/types";

interface AddEditModalProps {
  item: HtmlItem | null;
  onSave: (data: Omit<HtmlItem, "id" | "createdAt" | "updatedAt">) => void;
  onClose: () => void;
}

const PRESET_CATEGORIES = [
  "UI コンポーネント",
  "アニメーション",
  "レイアウト",
  "フォーム",
  "ゲーム",
  "データ可視化",
  "その他",
];

export default function AddEditModal({ item, onSave, onClose }: AddEditModalProps) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [category, setCategory] = useState(item?.category ?? "");
  const [customCategory, setCustomCategory] = useState("");
  const [tagInput, setTagInput] = useState(item?.tags.join(", ") ?? "");
  const [url, setUrl] = useState(item?.url ?? "");
  const [code, setCode] = useState(item?.code ?? "");
  const [favorite, setFavorite] = useState(item?.favorite ?? false);
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");

  const isEditing = !!item;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const finalCategory = category === "__custom__" ? customCategory : category;
    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSave({ title, description, category: finalCategory, tags, url: url.trim() || undefined, code, favorite });
  };

  // Preview source: prefer URL, fallback to code
  const previewSrc = url.trim() || null;

  const inputClass =
    "w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-vault-text placeholder-vault-muted focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-vault-surface border border-vault-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-vault-border">
          <h2 className="font-semibold text-vault-text text-lg">
            {isEditing ? "スニペットを編集" : "新しいスニペットを追加"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-vault-card text-vault-muted hover:text-vault-text transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-vault-border px-6">
          {(["form", "preview"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? "border-purple-500 text-purple-400"
                  : "border-transparent text-vault-muted hover:text-vault-text"
              }`}
            >
              {tab === "form" ? "フォーム" : "プレビュー"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className={`flex-1 overflow-y-auto ${activeTab === "preview" ? "hidden" : ""}`}>
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-vault-subtext mb-1.5">
                  タイトル <span className="text-red-400">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例：グラデーションボタン"
                  className={inputClass}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-vault-subtext mb-1.5">説明</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="何のスニペットか簡単に説明..."
                  className={inputClass}
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-xs font-medium text-vault-subtext mb-1.5">
                  URL{" "}
                  <span className="text-vault-muted font-normal">（外部サイト・デモページ）</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-muted text-sm select-none">
                    🔗
                  </span>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className={inputClass + " pl-9"}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-vault-subtext mb-1.5">カテゴリー</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClass + " cursor-pointer"}
                >
                  <option value="">カテゴリーなし</option>
                  {PRESET_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="__custom__">カスタム...</option>
                </select>
                {category === "__custom__" && (
                  <input
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="カテゴリー名を入力..."
                    className={inputClass + " mt-2"}
                  />
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium text-vault-subtext mb-1.5">
                  タグ <span className="text-vault-muted font-normal">（カンマ区切り）</span>
                </label>
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="例：CSS, アニメーション, ボタン"
                  className={inputClass}
                />
              </div>

              {/* Favorite */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFavorite(!favorite)}
                  className={`text-xl transition-transform hover:scale-125 ${
                    favorite ? "text-amber-400" : "text-vault-border"
                  }`}
                >
                  {favorite ? "♥" : "♡"}
                </button>
                <span className="text-sm text-vault-subtext">お気に入りに追加</span>
              </div>

              {/* Code */}
              <div>
                <label className="block text-xs font-medium text-vault-subtext mb-1.5">
                  HTML コード
                  <span className="text-vault-muted font-normal ml-1">（URLと併用可・どちらか一方でもOK）</span>
                </label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={"<!DOCTYPE html>\n<html>\n...\n</html>"}
                  className={inputClass + " font-mono text-xs h-48 resize-none leading-relaxed"}
                />
              </div>
            </div>
          </div>

          {/* Preview tab */}
          {activeTab === "preview" && (
            <div className="flex-1 bg-white">
              {previewSrc ? (
                <iframe
                  src={previewSrc}
                  title="URLプレビュー"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              ) : code ? (
                <iframe
                  srcDoc={code}
                  title="HTMLプレビュー"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-vault-bg text-vault-muted text-sm">
                  URLまたはHTMLコードを入力するとプレビューが表示されます
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-vault-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-vault-subtext hover:text-vault-text hover:bg-vault-card border border-vault-border transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-lg shadow-purple-900/30"
            >
              {isEditing ? "変更を保存" : "追加する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
