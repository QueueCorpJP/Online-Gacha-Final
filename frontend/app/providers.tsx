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
      // F12キー、Ctrl+Shift+I/J/Cの無効化（機密ページでのみ）
      const handleKeyDown = (e: KeyboardEvent) => {
        // 機密情報を含むページかどうかチェック
        const isSecurePage = window.location.pathname.includes('/profile') || 
                            window.location.pathname.includes('/payment') ||
                            window.location.pathname.includes('/admin') ||
                            window.location.pathname.includes('/gacha/result');
                            
        if (isSecurePage && (
          e.keyCode === 123 || 
          (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67))
        )) {
          e.preventDefault();
          return false;
        }
      };

      // 右クリックメニューの制限（画像などの保護コンテンツのみ）
      const handleContextMenu = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        // 画像や特定のコンテンツのみ保護
        if (
          target instanceof HTMLImageElement || 
          target.closest('.protected-content') ||
          target.closest('.gacha-card')
        ) {
          e.preventDefault();
          return false;
        }
        // その他の要素では通常の右クリックを許可
      };

      // コンソール警告メッセージ（頻度を抑える）
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
      
      // 警告表示の頻度を下げる（SEOとパフォーマンスに配慮）
      const intervalId = setInterval(warnDevTools, 30000); // 30秒ごとに変更

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

