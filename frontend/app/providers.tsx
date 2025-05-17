'use client'

import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/redux/store'
import { useEffect, useState } from 'react'
import { initializeAuth } from '@/redux/features/authSlice'
import '../lib/console-wrapper'

// 開発者ツールブロッカー
const DevToolsBlocker = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // F12キー、Ctrl+Shift+I、Ctrl+Shift+J、Ctrl+Shift+Cの無効化
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          e.keyCode === 123 || 
          (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67))
        ) {
          e.preventDefault();
          return false;
        }
      };

      // 右クリックメニューの無効化
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };

      // コンソール警告メッセージ
      const warnDevTools = () => {
        console.clear();
        const warningTitleCSS = 'color:red; font-size:60px; font-weight: bold; -webkit-text-stroke: 1px black;';
        const warningDescCSS = 'font-size: 18px;';
        console.log('%cSTOP!', warningTitleCSS);
        console.log('%cこのコンソールは開発者用です。悪意のあるスクリプトを実行すると、あなたのアカウントが危険にさらされる可能性があります。', warningDescCSS);
      };

      // イベントリスナーを追加
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('contextmenu', handleContextMenu);
      
      // 初回警告
      warnDevTools();
      
      // 定期的に警告を表示（コンソールクリア対策）
      const intervalId = setInterval(warnDevTools, 3000);

      return () => {
        // クリーンアップ
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('contextmenu', handleContextMenu);
        clearInterval(intervalId);
      };
    }
  }, []);

  return null;
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Dispatch initializeAuth directly using the store
    store.dispatch(initializeAuth())
  }, [])

  if (!isClient) {
    return null
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {process.env.NODE_ENV === 'production' && <DevToolsBlocker />}
        {children}
      </PersistGate>
    </Provider>
  )
}

