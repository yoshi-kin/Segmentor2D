declare global {
  interface Window {
    cv: typeof import('mirada/dist/src/types/opencv/_types');
  }
}

// 必要に応じて、グローバルスコープのモジュールをエクスポート
export {};