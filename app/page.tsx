"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import HtmlCard from "@/components/HtmlCard";
import AddEditModal from "@/components/AddEditModal";
import PreviewModal from "@/components/PreviewModal";
import DashboardStats from "@/components/DashboardStats";
import { HtmlItem, FilterState } from "@/lib/types";
import { getItems, addItem, updateItem, deleteItem, toggleFavorite, saveItems } from "@/lib/storage";
import { sampleItems } from "@/lib/sampleData";

export default function Home() {
  const [items, setItems] = useState<HtmlItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<FilterState>({
    search: "",
    category: "",
    tag: "",
    onlyFavorites: false,
  });
  const [addEditTarget, setAddEditTarget] = useState<HtmlItem | null | "new">(null);
  const [previewTarget, setPreviewTarget] = useState<HtmlItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const stored = getItems();
    if (stored.length === 0) {
      saveItems(sampleItems);
      setItems(sampleItems);
    } else {
      setItems(stored);
    }
  }, []);

  const refresh = () => setItems(getItems());

  const handleFilterChange = (partial: Partial<FilterState>) => {
    setFilter((prev) => ({ ...prev, ...partial }));
    setSidebarOpen(false);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filter.onlyFavorites && !item.favorite) return false;
      if (filter.category && item.category !== filter.category) return false;
      if (filter.tag && !item.tags.includes(filter.tag)) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        const match =
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [items, filter]);

  const handleSave = (data: Omit<HtmlItem, "id" | "createdAt" | "updatedAt">) => {
    if (addEditTarget === "new") {
      addItem(data);
    } else if (addEditTarget) {
      updateItem(addEditTarget.id, data);
    }
    refresh();
    setAddEditTarget(null);
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteItem(id);
      refresh();
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
    refresh();
  };

  const handleEditFromPreview = (item: HtmlItem) => {
    setPreviewTarget(null);
    setAddEditTarget(item);
  };

  const filterLabel = filter.onlyFavorites
    ? "お気に入り"
    : filter.category
    ? filter.category
    : filter.tag
    ? `#${filter.tag}`
    : filter.search
    ? `"${filter.search}"`
    : "すべて";

  return (
    <div className="flex min-h-screen bg-vault-bg">
      {/* モバイル用オーバーレイ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        items={items}
        filter={filter}
        onFilterChange={handleFilterChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 ml-0 md:ml-60 min-h-screen flex flex-col">
        {/*
          ヘッダー
          - sticky top-0: 画面上部に固定
          - pt-safe: iPhoneのステータスバー分の余白を確保
          - PCはpt-safeが0なので影響なし
        */}
        <header
          className="sticky top-0 z-10 bg-vault-bg/95 backdrop-blur border-b border-vault-border pt-safe"
        >
          <div className="px-4 md:px-6 py-3 md:py-4 flex items-center gap-3">
            {/* ハンバーガーボタン（モバイルのみ） */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl hover:bg-vault-card active:bg-vault-card transition-colors gap-1.5 flex-shrink-0"
              aria-label="メニューを開く"
            >
              <span className="w-5 h-0.5 bg-vault-text rounded-full" />
              <span className="w-5 h-0.5 bg-vault-text rounded-full" />
              <span className="w-5 h-0.5 bg-vault-text rounded-full" />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-semibold text-vault-text truncate">{filterLabel}</h1>
              <p className="text-xs text-vault-muted">{filteredItems.length} 件</p>
            </div>

            {/* 検索 */}
            <div className="relative w-32 sm:w-48 md:w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-muted text-sm select-none">
                🔍
              </span>
              <input
                type="text"
                value={filter.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                placeholder="検索..."
                className="w-full bg-vault-card border border-vault-border rounded-xl pl-9 pr-7 py-2 text-sm text-vault-text placeholder-vault-muted focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-colors"
              />
              {filter.search && (
                <button
                  onClick={() => handleFilterChange({ search: "" })}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-vault-muted hover:text-vault-text text-xs w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 新規追加ボタン */}
            <button
              onClick={() => setAddEditTarget("new")}
              className="flex items-center justify-center gap-1.5 w-10 h-10 sm:w-auto sm:px-4 sm:h-10 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-sm font-medium rounded-xl shadow-lg shadow-purple-900/30 transition-colors flex-shrink-0"
            >
              <span className="text-xl leading-none">+</span>
              <span className="hidden sm:inline">新規追加</span>
            </button>
          </div>
        </header>

        {/* コンテンツ */}
        <div className="flex-1 p-4 md:p-6 pb-safe">
          {!filter.category && !filter.tag && !filter.onlyFavorites && !filter.search && (
            <DashboardStats items={items} />
          )}

          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-5xl mb-4">🗂️</div>
              <h3 className="text-vault-text font-semibold mb-2">
                {items.length === 0
                  ? "まだスニペットがありません"
                  : "該当するスニペットがありません"}
              </h3>
              <p className="text-vault-muted text-sm mb-6 px-4">
                {items.length === 0
                  ? "「+」ボタンから最初のHTMLスニペットを追加しましょう"
                  : "検索条件を変えてみてください"}
              </p>
              {items.length === 0 && (
                <button
                  onClick={() => setAddEditTarget("new")}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-purple-900/30 transition-colors"
                >
                  最初のスニペットを追加
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="relative">
                  {deleteConfirm === item.id && (
                    <div className="absolute inset-0 z-10 bg-red-900/90 rounded-xl flex flex-col items-center justify-center gap-3 p-4">
                      <p className="text-sm text-red-200 text-center font-medium">
                        本当に削除しますか？
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-400 text-white text-xs rounded-lg font-medium"
                        >
                          削除する
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1.5 bg-vault-card hover:bg-vault-border text-vault-text text-xs rounded-lg"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  )}
                  <HtmlCard
                    item={item}
                    onPreview={setPreviewTarget}
                    onEdit={setAddEditTarget}
                    onDelete={handleDelete}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {addEditTarget !== null && (
        <AddEditModal
          item={addEditTarget === "new" ? null : addEditTarget}
          onSave={handleSave}
          onClose={() => setAddEditTarget(null)}
        />
      )}

      {previewTarget && (
        <PreviewModal
          item={previewTarget}
          onClose={() => setPreviewTarget(null)}
          onEdit={handleEditFromPreview}
        />
      )}
    </div>
  );
}
