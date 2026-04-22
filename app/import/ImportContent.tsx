"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SharePackage } from "@/lib/types";
import { addItem, getItems } from "@/lib/storage";

export default function ImportContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [pkg, setPkg] = useState<SharePackage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [imported, setImported] = useState(false);
  const [duplicates, setDuplicates] = useState<Set<number>>(new Set());

  useEffect(() => {
    const data = params.get("data");
    if (!data) { setError("データが見つかりません"); return; }
    try {
      const json = decodeURIComponent(atob(data));
      const parsed = JSON.parse(json) as SharePackage;
      if (parsed.version !== 1) throw new Error("バージョン不一致");
      setPkg(parsed);

      // Select all by default
      setSelected(new Set(parsed.items.map((_, i) => i)));

      // Detect duplicates (same title in existing items)
      const existing = getItems();
      const existingTitles = new Set(existing.map((i) => i.title.toLowerCase()));
      const dups = new Set<number>();
      parsed.items.forEach((item, i) => {
        if (existingTitles.has(item.title.toLowerCase())) dups.add(i);
      });
      setDuplicates(dups);
    } catch {
      setError("データの解析に失敗しました。URLが正しいか確認してください。");
    }
  }, [params]);

  const toggleItem = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) { next.delete(idx); } else { next.add(idx); }
      return next;
    });
  };

  const handleImport = () => {
    if (!pkg) return;
    pkg.items.forEach((item, i) => {
      if (selected.has(i)) {
        addItem({
          title: item.title,
          description: item.description,
          category: item.category,
          tags: item.tags,
          code: item.code || "",
          url: item.url,
          favorite: item.favorite,
        });
      }
    });
    setImported(true);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-vault-bg flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-vault-text font-semibold text-lg mb-2">インポートエラー</h1>
          <p className="text-vault-muted text-sm mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  if (imported) {
    return (
      <div className="min-h-screen bg-vault-bg flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-vault-text font-semibold text-lg mb-2">インポート完了</h1>
          <p className="text-vault-muted text-sm mb-6">
            {selected.size} 件のスニペットを追加しました
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-purple-900/30"
          >
            HTML Vault で開く
          </button>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-vault-bg flex items-center justify-center">
        <div className="text-vault-muted text-sm">解析中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vault-bg flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-vault-surface border border-vault-border rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="px-6 py-5 border-b border-vault-border bg-gradient-to-r from-purple-900/20 to-transparent">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">📦</span>
            <h1 className="font-bold text-vault-text text-lg">パッケージをインポート</h1>
          </div>
          <p className="text-sm text-vault-subtext">
            カテゴリー:{" "}
            <span className="text-purple-400 font-medium">{pkg.category}</span>
            {" "}・{" "}
            {pkg.items.length} 件のスニペット
          </p>
          <p className="text-xs text-vault-muted mt-1">
            エクスポート日: {new Date(pkg.exportedAt).toLocaleDateString("ja-JP")}
          </p>
        </div>

        {/* Item list */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-vault-muted uppercase tracking-wider">
              インポートするスニペットを選択
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setSelected(new Set(pkg.items.map((_, i) => i)))}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                全選択
              </button>
              <span className="text-vault-border">|</span>
              <button
                onClick={() => setSelected(new Set())}
                className="text-xs text-vault-muted hover:text-vault-text"
              >
                全解除
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {pkg.items.map((item, i) => (
              <label
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                  selected.has(i)
                    ? "bg-purple-600/10 border-purple-600/30"
                    : "bg-vault-card border-vault-border hover:border-vault-muted"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={() => toggleItem(i)}
                  className="mt-0.5 accent-purple-600"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-vault-text truncate">{item.title}</p>
                    {duplicates.has(i) && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 flex-shrink-0">
                        重複
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-vault-muted mt-0.5 truncate">{item.description}</p>
                  )}
                  <div className="flex gap-1 mt-1">
                    {item.url && (
                      <span className="text-[10px] px-1 py-0.5 rounded bg-blue-600/20 text-blue-400">URL</span>
                    )}
                    {item.code && (
                      <span className="text-[10px] px-1 py-0.5 rounded bg-purple-600/20 text-purple-400">HTML</span>
                    )}
                    {item.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-[10px] px-1 py-0.5 rounded bg-vault-bg text-vault-muted">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {duplicates.size > 0 && (
            <p className="text-xs text-amber-400/80 mt-3 flex items-center gap-1.5">
              <span>⚠</span>
              {duplicates.size} 件は同名のスニペットが既に存在します（重複して追加されます）
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-vault-border">
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-lg text-sm text-vault-subtext hover:text-vault-text hover:bg-vault-card border border-vault-border transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleImport}
            disabled={selected.size === 0}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shadow-lg shadow-purple-900/30"
          >
            {selected.size} 件をインポート
          </button>
        </div>
      </div>
    </div>
  );
}
