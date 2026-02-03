import { HashRouter, Routes, Route } from 'react-router-dom';
import { MenuPage } from './pages/MenuPage';
import { ScanPage } from './pages/ScanPage';
import { SendPage } from './pages/SendPage';
import { DataListPage } from './pages/DataListPage';

/**
 * アプリケーションルート
 * HashRouterを使用: オフラインHTでファイルベースアクセス時に対応
 */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/data-list" element={<DataListPage />} />
        <Route path="/send" element={<SendPage />} />
      </Routes>
    </HashRouter>
  );
}
