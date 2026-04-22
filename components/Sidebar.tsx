"use client";

import { useState } from "react";
import { HtmlItem, FilterState } from "@/lib/types";
import { getCategories, getAllTags } from "@/lib/storage";
import ShareModal from "./ShareModal";

interface SidebarProps {
  items: HtmlItem[];
  filter: FilterState;
  onFilterChange: (filter: Partial<FilterState>) => void;
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: "すべて", icon: "⊞", value: "" },
  { label: "お気に入り", icon: "♥", value: "__favorites__" },
];

const CATEGORY_ICONS: Record<string, string> = {
  "UI コンポーネント": "🎨",
  "アニメーション": "✨",
  "レイアウト": "📐",
  "フォーム": "📝",
  "ゲーム": "🎮",
  "データ可視化": "📊",
  "その他": "📌",
};
const DEFAULT_CAT_ICON = "📁";

export default function Sidebar({ items, filter, onFilterChange, isOpen, onClose }: SidebarProps) {
  const [shareCategory, setShareCategory] = useState<string | null>(null);
  const categories = getCategories(items);
  const tags = getAllTags(items);
  const favoriteCount = items.filter((i) => i.favorite).length;

  const handleNavClick = (value: string) => {
    if (value === "__favorites__") {
      onFilterChange({ category: "", tag: "", onlyFavorites: true, search: "" });
    } else {
      onFilterChange({ category: "", tag: "", onlyFavorites: false, search: "" });
    }
  };

  const isNavActive = (value: string) => {
    if (value === "__favorites__") return filter.onlyFavorites;
    if (value === "") return !filter.onlyFavorites && !filter.category && !filter.tag;
    return false;
  };

  const shareCategoryItems = shareCategory
    ? items.filter((i) => i.category === shareCategory)
    : [];

  return (
    <>
      {/*
        PC (md以上): 常時表示 (translate-x-0 固定)
        モバイル: isOpen=true のとき translate-x-0、false のとき -translate-x-full でスライドアウト
      */}
      <aside
        className={`
          fixed left-0 top-0 h-full w-72 md:w-60
          bg-vault-surface border-r border-vault-border
          flex flex-col z-30
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0 shadow-2xl shadow-black/50" : "-translate-x-full"}
          md:translate-x-0 md:shadow-none
        `}
      >
        {/* ロゴ + 閉じるボタン（safe area対応） */}
        <div className="px-5 py-5 border-b border-vault-border flex items-center justify-between pt-safe [padding-top:max(1.25rem,env(safe-area-inset-top,0px))]">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-900/40">
                H
              </div>
              <span className="font-bold text-lg text-vault-text">HTML Vault</span>
            </div>
            <p className="text-xs text-vault-subtext mt-1 ml-10">HTMLスニペット管理</p>
          </div>

          {/* 閉じるボタン（モバイルのみ表示） */}
          <button
            onClick={onClose}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-vault-card text-vault-muted hover:text-vault-text transition-colors text-xl flex-shrink-0"
            aria-label="サイドバーを閉じる"
          >
            ✕
          </button>
        </div>

        {/* 統計 */}
        <div className="px-5 py-4 border-b border-vault-border">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-vault-card rounded-lg px-3 py-2 text-center border border-vault-border">
              <div className="text-xl font-bold text-purple-400">{items.length}</div>
              <div className="text-xs text-vault-subtext">合計</div>
            </div>
            <div className="bg-vault-card rounded-lg px-3 py-2 text-center border border-vault-border">
              <div className="text-xl font-bold text-amber-400">{favoriteCount}</div>
              <div className="text-xs text-vault-subtext">お気に入り</div>
            </div>
          </div>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((nav) => (
            <button
              key={nav.value}
              onClick={() => handleNavClick(nav.value)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-150 ${
                isNavActive(nav.value)
                  ? "bg-purple-600/20 text-purple-300 border border-purple-600/30"
                  : "text-vault-subtext hover:bg-vault-card hover:text-vault-text border border-transparent"
              }`}
            >
              <span className="w-5 text-center flex-shrink-0">{nav.icon}</span>
              <span>{nav.label}</span>
              {nav.value === "__favorites__" && favoriteCount > 0 && (
                <span className="ml-auto text-xs bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded-full">
                  {favoriteCount}
                </span>
              )}
              {nav.value === "" && (
                <span className="ml-auto text-xs text-vault-muted">{items.length}</span>
              )}
            </button>
          ))}

          {/* カテゴリー */}
          {categories.length > 0 && (
            <div className="pt-4">
              <p className="text-xs font-semibold text-vault-muted uppercase tracking-wider px-3 mb-2">
                カテゴリー
              </p>
              {categories.map((cat) => {
                const count = items.filter((i) => i.category === cat).length;
                const icon = CATEGORY_ICONS[cat] ?? DEFAULT_CAT_ICON;
                const isActive = filter.category === cat && !filter.onlyFavorites;
                return (
                  <div key={cat} className="group/cat relative">
                    <button
                      onClick={() =>
                        onFilterChange({ category: cat, tag: "", onlyFavorites: false })
                      }
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-150 ${
                        isActive
                          ? "bg-purple-600/20 text-purple-300 border border-purple-600/30"
                          : "text-vault-subtext hover:bg-vault-card hover:text-vault-text border border-transparent"
                      }`}
                    >
                      <span className="w-5 text-center flex-shrink-0 text-base leading-none">
                        {icon}
                      </span>
                      <span className="truncate flex-1">{cat}</span>
                      <span className={`text-xs flex-shrink-0 ${isActive ? "text-purple-400" : "text-vault-muted"}`}>
                        {count}
                      </span>
                    </button>

                    {/* 共有ボタン */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShareCategory(cat);
                      }}
                      title={`${cat} を共有`}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover/cat:opacity-100 hover:bg-purple-600/25 text-vault-muted hover:text-purple-400 transition-all duration-150 text-xs"
                    >
                      ↗
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* タグ */}
          {tags.length > 0 && (
            <div className="pt-4">
              <p className="text-xs font-semibold text-vault-muted uppercase tracking-wider px-3 mb-2">
                タグ
              </p>
              <div className="px-3 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onFilterChange({ tag, category: "", onlyFavorites: false })}
                    className={`text-xs px-2 py-1 rounded-md border transition-all duration-150 ${
                      filter.tag === tag
                        ? "bg-purple-600/20 text-purple-300 border-purple-600/30"
                        : "border-vault-border text-vault-subtext hover:border-purple-600/40 hover:text-vault-text"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* フッター */}
        <div className="px-5 py-3 border-t border-vault-border">
          <p className="text-xs text-vault-muted text-center">HTML Vault v1.1</p>
        </div>
      </aside>

      {/* 共有モーダル */}
      {shareCategory && (
        <ShareModal
          categoryName={shareCategory}
          items={shareCategoryItems}
          onClose={() => setShareCategory(null)}
        />
      )}
    </>
  );
}
