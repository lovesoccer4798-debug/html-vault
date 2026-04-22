"use client";

import { HtmlItem } from "@/lib/types";

interface HtmlCardProps {
  item: HtmlItem;
  onPreview: (item: HtmlItem) => void;
  onEdit: (item: HtmlItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export default function HtmlCard({
  item,
  onPreview,
  onEdit,
  onDelete,
  onToggleFavorite,
}: HtmlCardProps) {
  const date = new Date(item.updatedAt).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });

  const hasUrl = !!item.url;
  const hasCode = !!item.code;

  return (
    <div className="group bg-vault-card border border-vault-border rounded-xl overflow-hidden transition-all duration-300 ease-out hover:border-purple-500/60 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(124,58,237,0.25)]">
      {/* Preview thumbnail */}
      <div
        className="relative h-40 bg-[#0a0a0f] overflow-hidden cursor-pointer"
        onClick={() => onPreview(item)}
      >
        {hasCode && !hasUrl ? (
          <iframe
            srcDoc={item.code}
            title={item.title}
            className="w-full h-full border-0 pointer-events-none"
            style={{
              transform: "scale(0.5)",
              transformOrigin: "top left",
              width: "200%",
              height: "200%",
            }}
            sandbox="allow-scripts"
          />
        ) : hasUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-purple-900/30 to-vault-bg">
            <span className="text-3xl">🔗</span>
            <p className="text-xs text-vault-subtext px-4 truncate max-w-full">{item.url}</p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-vault-bg">
            <span className="text-4xl opacity-30">📄</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-purple-900/0 group-hover:bg-purple-900/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-vault-surface/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-purple-300 flex items-center gap-2 shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            {hasUrl ? <span>🔗</span> : <span>▶</span>}
            {hasUrl ? "リンクを開く" : "プレビュー"}
          </div>
        </div>

        {/* Badge: URL or HTML */}
        <div className="absolute top-2 left-2 flex gap-1">
          {hasUrl && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600/70 text-blue-200 font-medium backdrop-blur-sm">
              URL
            </span>
          )}
          {hasCode && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-600/70 text-purple-200 font-medium backdrop-blur-sm">
              HTML
            </span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-vault-text text-sm leading-snug flex-1 truncate">
            {item.title}
          </h3>
          <button
            onClick={() => onToggleFavorite(item.id)}
            className={`flex-shrink-0 text-base leading-none transition-all duration-200 hover:scale-125 ${
              item.favorite ? "text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]" : "text-vault-border hover:text-amber-400"
            }`}
            title={item.favorite ? "お気に入り解除" : "お気に入りに追加"}
          >
            {item.favorite ? "♥" : "♡"}
          </button>
        </div>

        {item.description && (
          <p className="text-xs text-vault-subtext mb-3 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Category + Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.category && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-purple-600/15 text-purple-400 border border-purple-600/20">
              {item.category}
            </span>
          )}
          {item.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-md bg-vault-surface text-vault-muted border border-vault-border"
            >
              #{tag}
            </span>
          ))}
          {item.tags.length > 2 && (
            <span className="text-xs text-vault-muted">+{item.tags.length - 2}</span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-vault-border">
          <div className="flex items-center gap-2">
            <span className="text-xs text-vault-muted">{date}</span>
            {hasUrl && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs px-2 py-0.5 rounded-md bg-blue-600/15 text-blue-400 border border-blue-600/20 hover:bg-blue-600/25 transition-colors flex items-center gap-1"
              >
                <span>↗</span> 外部リンク
              </a>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => onEdit(item)}
              className="text-xs px-2.5 py-1 rounded-md bg-vault-surface hover:bg-vault-border text-vault-subtext hover:text-vault-text transition-colors"
            >
              編集
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="text-xs px-2.5 py-1 rounded-md bg-vault-surface hover:bg-red-900/40 text-vault-subtext hover:text-red-400 transition-colors"
            >
              削除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
