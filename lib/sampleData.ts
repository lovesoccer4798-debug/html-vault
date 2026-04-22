import { HtmlItem } from "./types";

export const sampleItems: HtmlItem[] = [
  {
    id: "sample-1",
    title: "グラデーションボタン",
    description: "ホバー時にアニメーションするパープルグラデーションボタン",
    category: "UI コンポーネント",
    tags: ["ボタン", "CSS", "アニメーション"],
    favorite: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    code: `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
  body { display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; background:#0f0f13; }
  .btn {
    padding: 14px 32px;
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(124,58,237,0.4);
  }
  .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(124,58,237,0.6);
    background: linear-gradient(135deg, #6d28d9, #9333ea);
  }
</style>
</head>
<body>
  <button class="btn">Click Me</button>
</body>
</html>`,
  },
  {
    id: "sample-2",
    title: "カードホバーエフェクト",
    description: "マウスオーバーで浮き上がるカードコンポーネント",
    category: "UI コンポーネント",
    tags: ["カード", "CSS", "ホバー"],
    favorite: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    code: `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
  body { display:flex; gap:20px; align-items:center; justify-content:center; min-height:100vh; margin:0; background:#0f0f13; flex-wrap:wrap; padding:20px; box-sizing:border-box; }
  .card {
    background: #1e1e2a;
    border: 1px solid #2a2a3a;
    border-radius: 16px;
    padding: 24px;
    width: 200px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #e2e2f0;
  }
  .card:hover {
    transform: translateY(-8px);
    border-color: #7c3aed;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  }
  .icon { font-size: 32px; margin-bottom: 12px; }
  .title { font-weight: 600; margin-bottom: 8px; }
  .desc { font-size: 13px; color: #9998b0; }
</style>
</head>
<body>
  <div class="card"><div class="icon">🚀</div><div class="title">Launch</div><div class="desc">Deploy your project</div></div>
  <div class="card"><div class="icon">📊</div><div class="title">Analytics</div><div class="desc">Track your metrics</div></div>
  <div class="card"><div class="icon">⚙️</div><div class="title">Settings</div><div class="desc">Configure options</div></div>
</body>
</html>`,
  },
  {
    id: "sample-3",
    title: "ローディングスピナー",
    description: "CSSだけで作ったシンプルなスピナーアニメーション",
    category: "アニメーション",
    tags: ["CSS", "アニメーション", "ローディング"],
    favorite: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    code: `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
  body { display:flex; gap:40px; align-items:center; justify-content:center; min-height:100vh; margin:0; background:#0f0f13; }
  .spinner {
    width: 48px; height: 48px;
    border: 4px solid #2a2a3a;
    border-top-color: #7c3aed;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  .spinner-dots {
    display: flex; gap: 8px;
  }
  .dot {
    width: 12px; height: 12px;
    background: #7c3aed;
    border-radius: 50%;
    animation: bounce 0.6s alternate infinite;
  }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes bounce { to { transform: translateY(-16px); opacity: 0.5; } }
</style>
</head>
<body>
  <div class="spinner"></div>
  <div class="spinner-dots">
    <div class="dot"></div><div class="dot"></div><div class="dot"></div>
  </div>
</body>
</html>`,
  },
];
