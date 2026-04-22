import { Suspense } from "react";
import ImportContent from "./ImportContent";

export default function ImportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-vault-bg flex items-center justify-center">
          <div className="text-vault-muted text-sm">読み込み中...</div>
        </div>
      }
    >
      <ImportContent />
    </Suspense>
  );
}
