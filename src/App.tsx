import { HashRouter, Routes, Route } from 'react-router-dom';
import { MenuPage } from './pages/MenuPage';
import { ScanPage } from './pages/ScanPage';
import { SendPage } from './pages/SendPage';
import { DataListPage } from './pages/DataListPage';
import { InventoryPage } from './pages/InventoryPage';
import { ReceivingPage } from './pages/ReceivingPage';
import { ShippingPage } from './pages/ShippingPage';
import { MasterPage } from './pages/MasterPage';
import { DeliveryCheckPage } from './pages/DeliveryCheckPage';
import { ReceiveDataPage } from './pages/ReceiveDataPage';

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
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/send" element={<SendPage />} />
        <Route path="/receiving" element={<ReceivingPage />} />
        <Route path="/shipping" element={<ShippingPage />} />
        <Route path="/master" element={<MasterPage />} />
        <Route path="/delivery-check" element={<DeliveryCheckPage />} />
        <Route path="/receive" element={<ReceiveDataPage />} />
      </Routes>
    </HashRouter>
  );
}
