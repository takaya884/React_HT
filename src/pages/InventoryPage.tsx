import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Toast } from '../components/common/Toast';
import { writeLog } from '../services/logService';
import { generateId } from '../utils/dateUtils';
import styles from './InventoryPage.module.css';

interface InventoryItem {
  id: string;
  code: string;
  quantity: number;
  scannedAt: string;
}

type ScanMode = 'location' | 'item';

export function InventoryPage() {
  const [location, setLocation] = useState('');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [scanMode, setScanMode] = useState<ScanMode>('location');
  const [inputValue, setInputValue] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 入力欄に自動フォーカス
  useEffect(function () {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [scanMode]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleScan(inputValue.trim());
      setInputValue('');
    }
  }

  function handleScan(value: string) {
    if (scanMode === 'location') {
      // ロケーションスキャン
      setLocation(value);
      setScanMode('item');
      writeLog('INFO', 'OPERATION', '棚卸ロケーション設定: ' + value);
      setToast({ message: 'ロケーション: ' + value, type: 'success' });
    } else {
      // 商品スキャン
      if (!location) {
        setToast({ message: '先にロケーションをスキャンしてください', type: 'error' });
        return;
      }

      // 既存アイテムがあれば数量を加算
      const existingIndex = items.findIndex(function (item) {
        return item.code === value;
      });

      if (existingIndex >= 0) {
        const newItems = items.slice();
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + 1,
        };
        setItems(newItems);
        writeLog('INFO', 'SCAN', '棚卸スキャン(加算): ' + value + ' x' + newItems[existingIndex].quantity);
      } else {
        const newItem: InventoryItem = {
          id: generateId(),
          code: value,
          quantity: 1,
          scannedAt: new Date().toISOString(),
        };
        setItems(function (prev) { return [...prev, newItem]; });
        writeLog('INFO', 'SCAN', '棚卸スキャン(新規): ' + value);
      }

      setToast({ message: value + ' を読取', type: 'success' });
    }
  }

  function handleClear() {
    setItems([]);
    setLocation('');
    setScanMode('location');
    writeLog('INFO', 'OPERATION', '棚卸データクリア');
    setToast({ message: 'データをクリアしました', type: 'info' });
  }

  function handleComplete() {
    if (items.length === 0) {
      setToast({ message: '読取データがありません', type: 'error' });
      return;
    }

    // TODO: 実際の棚卸完了処理（サーバー送信等）
    writeLog('INFO', 'OPERATION', '棚卸完了: ロケーション=' + location + ', 件数=' + items.length);
    setToast({ message: '棚卸を完了しました (' + items.length + '件)', type: 'success' });

    // データをクリア
    setItems([]);
    setLocation('');
    setScanMode('location');
  }

  const totalQuantity = items.reduce(function (sum, item) {
    return sum + item.quantity;
  }, 0);

  return (
    <AppLayout title="棚卸">
      <div className={styles.container}>
        {/* モード切替 */}
        <div className={styles.header}>
          <div className={styles.modeToggle}>
            <button
              className={styles.modeButton + (scanMode === 'location' ? ' ' + styles.active : '')}
              onClick={function () { setScanMode('location'); }}
            >
              ロケーション
            </button>
            <button
              className={styles.modeButton + (scanMode === 'item' ? ' ' + styles.active : '')}
              onClick={function () { setScanMode('item'); }}
            >
              商品
            </button>
          </div>
        </div>

        {/* ロケーション表示 */}
        <div className={styles.locationSection}>
          <p className={styles.locationLabel}>ロケーション</p>
          <p className={styles.locationValue + (location ? '' : ' ' + styles.empty)}>
            {location || '未設定'}
          </p>
        </div>

        {/* スキャン入力 */}
        <div className={styles.scanSection}>
          <p className={styles.scanLabel}>
            {scanMode === 'location' ? 'ロケーションをスキャン' : '商品をスキャン'}
          </p>
          <input
            ref={inputRef}
            type="text"
            className={styles.scanInput}
            value={inputValue}
            onChange={function (e) { setInputValue(e.target.value); }}
            onKeyDown={handleKeyDown}
            placeholder={scanMode === 'location' ? 'ロケーションコード...' : '商品コード...'}
          />
        </div>

        {/* 読取結果 */}
        <div className={styles.resultSection}>
          <div className={styles.resultHeader}>
            <p className={styles.resultTitle}>読取結果</p>
            <span className={styles.resultCount}>
              {items.length}品目 / {totalQuantity}点
            </span>
          </div>

          {items.length === 0 ? (
            <p className={styles.empty}>読取データなし</p>
          ) : (
            <ul className={styles.itemList}>
              {items.map(function (item) {
                return (
                  <li key={item.id} className={styles.item}>
                    <span className={styles.itemCode}>{item.code}</span>
                    <span className={styles.itemQty}>×{item.quantity}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* アクションボタン */}
        <div className={styles.actions}>
          <button
            className={styles.actionButton + ' ' + styles.secondaryButton}
            onClick={handleClear}
          >
            クリア
          </button>
          <button
            className={styles.actionButton + ' ' + styles.primaryButton}
            onClick={handleComplete}
            disabled={items.length === 0}
          >
            完了
          </button>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={function () { setToast(null); }}
          duration={2000}
        />
      )}
    </AppLayout>
  );
}
