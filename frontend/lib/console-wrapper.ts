// コンソールラッパー - プロダクション環境ではコンソール出力を抑制する

// オリジナルのコンソールメソッドを保存
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};

// 本番環境かどうかを確認（クライアントサイドでのみ実行）
if (typeof window !== 'undefined') {
  // 本番環境または明示的に指定された場合にコンソールを無効化
  const shouldDisableConsole = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_DISABLE_CONSOLE === 'true';
  
  if (shouldDisableConsole) {
    console.log = () => {};
    console.error = () => {};
    console.warn = () => {};
    console.info = () => {};
    console.debug = () => {};
    
    // 開発用のデバッグ機能 - 必要な場合のみ使用
    (window as any).__enableConsole = () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;
      console.debug = originalConsole.debug;
      originalConsole.log('コンソール出力が有効になりました');
    };
  }
}

export {}; 