"use client";

import { HtmlItem } from "@/lib/types";
import { getCategories } from "@/lib/storage";

interface DashboardStatsProps {
  items: HtmlItem[];
}

const CATEGORY_ICONS: Record<string, string> = {
  "UI コンポーネント": "🎨",
  "アニメーション": "✨",
  "レイアウト": "📐",
  "フォーム": "📝",
  "ゲーム": "🎮",
  "データ可視化": "📊",
  "その他": "📌",
};

export default function DashboardStats({ items }: DashboardStatsProps) {
  const categories = getCategories(items);
  const favoriteCount = items.filter((i) => i.favorite).length;
  const recentCount = items.filter((i) => {
    return Date.now() - new Date(i.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;
  const urlCount = items.filter((i) => i.url).length;
  const totalLines = items.reduce((acc, i) => acc + (i.code?.split("\n").length ?? 0), 0);

  const stats = [
    {
      label: "スニペット",
      value: items.length,
      icon: "⊞",
      color: "text-accent",
      bg: "from-accent/10 to-accent/5",
      border: "border-accent/20",
      sub: `${urlCount} URL付き`,
    },
    {
      label: "カテゴリー",
      value: categories.length,
      icon: "📁",
      color: "text-blue-400",
      bg: "from-blue-900/20 to-blue-900/5",
      border: "border-blue-600/20",
      sub: categories[0] ? `最新: ${categories[0]}` : "未設定",
    },
    {
      label: "お気に入り",
      value: favoriteCount,
      icon: "♥",
      color: "text-amber-400",
      bg: "from-amber-900/20 to-amber-900/5",
      border: "border-amber-600/20",
      sub: items.length > 0 ? `全体の ${Math.round((favoriteCount / items.length) * 100)}%` : "0%",
    },
    {
      label: "今週追加",
      value: recentCount,
      icon: "✨",
      color: "text-green-400",
      bg: "from-green-900/20 to-green-900/5",
      border: "border-green-600/20",
      sub: `合計 ${totalLines.toLocaleString()} 行`,
    },
  ];

  // Category distribution
  const catData = categories.map((cat) => {
    const count = items.filter((i) => i.category === cat).length;
    return { cat, count, pct: items.length > 0 ? (count / items.length) * 100 : 0 };
  });
  const uncategorized = items.filter((i) => !i.category).length;
  if (uncategorized > 0) {
    catData.push({
      cat: "未分類",
      count: uncategorized,
      pct: (uncategorized / items.length) * 100,
    });
  }

  // Sort desc
  catData.sort((a, b) => b.count - a.count);

  return (
    <div className="mb-8 space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`bg-gradient-to-br ${s.bg} border ${s.border} rounded-xl p-4 flex flex-col gap-2 hover:scale-[1.02] transition-transform duration-200`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">{s.icon}</span>
              <span className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-vault-text">{s.label}</p>
              <p className="text-xs text-vault-muted mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      {catData.length > 0 && (
        <div className="bg-vault-card border border-vault-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-vault-text">カテゴリー分布</h3>
            <span className="text-xs text-vault-muted">{catData.length} カテゴリー</span>
          </div>

          {/* Stacked bar */}
          <div className="h-2.5 rounded-full overflow-hidden flex mb-5">
            {catData.map((d, i) => {
              const hues = [265, 220, 45, 140, 0, 180, 300, 60];
              const hue = hues[i % hues.length];
              return (
                <div
                  key={d.cat}
                  style={{
                    width: `${d.pct}%`,
                    background: `hsl(${hue}, 70%, 60%)`,
                    opacity: 0.85,
                  }}
                  title={`${d.cat}: ${d.count}件`}
                />
              );
            })}
          </div>

          {/* List */}
          <div className="space-y-2.5">
            {catData.slice(0, 6).map((d, i) => {
              const hues = [265, 220, 45, 140, 0, 180, 300, 60];
              const hue = hues[i % hues.length];
              const icon = CATEGORY_ICONS[d.cat] ?? "📁";
              return (
                <div key={d.cat} className="flex items-center gap-3">
                  <span className="text-sm w-5 text-center flex-shrink-0">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-vault-text truncate">{d.cat}</span>
                      <span className="text-xs text-vault-muted tabular-nums ml-2 flex-shrink-0">
                        {d.count} 件 ({Math.round(d.pct)}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-vault-border rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${d.pct}%`,
                          background: `hsl(${hue}, 70%, 60%)`,
                          opacity: 0.8,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {catData.length > 6 && (
            <p className="text-xs text-vault-muted mt-3 text-right">
              + {catData.length - 6} カテゴリー
            </p>
          )}
        </div>
      )}
    </div>
  );
}
