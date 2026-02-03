import { useState, useCallback } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Toast } from '../components/common/Toast';
import { StatusBadge } from '../components/common/StatusBadge';
import { getScannedData, removeScannedData, clearScannedData } from '../services/storageService';
import { writeLog } from '../services/logService';
import type { ScannedData } from '../types';
import styles from './DataListPage.module.css';

export function DataListPage() {
  const [data, setData] = useState<ScannedData[]>(getScannedData);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleDelete = useCallback((id: string, value: string) => {
    removeScannedData(id);
    setData(getScannedData());
    setToast({ message: `削除: ${value}`, type: 'info' });
    writeLog('INFO', 'OPERATION', `データ確認画面: 個別削除 [${value}]`);
  }, []);

  const handleClearAll = useCallback(() => {
    clearScannedData();
    setData([]);
    setConfirmClear(false);
    setToast({ message: '全データを削除しました', type: 'success' });
    writeLog('INFO', 'OPERATION', 'データ確認画面: 全件削除');
  }, []);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <AppLayout title="データ確認">
      <div className={styles.header}>
        <StatusBadge count={data.length} label="件" />
        {data.length > 0 && !confirmClear && (
          <button
            className={styles.clearButton}
            onClick={() => setConfirmClear(true)}
          >
            全削除
          </button>
        )}
        {confirmClear && (
          <div className={styles.confirmRow}>
            <button className={styles.confirmYes} onClick={handleClearAll}>
              実行
            </button>
            <button className={styles.confirmNo} onClick={() => setConfirmClear(false)}>
              取消
            </button>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <p className={styles.empty}>蓄積データはありません</p>
      ) : (
        <ul className={styles.list}>
          {data.map((item, index) => (
            <li key={item.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <span className={styles.itemIndex}>{index + 1}</span>
                <div className={styles.itemDetail}>
                  <span className={styles.itemValue}>{item.value}</span>
                  <span className={styles.itemTime}>{formatTime(item.scannedAt)}</span>
                </div>
              </div>
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(item.id, item.value)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AppLayout>
  );
}
