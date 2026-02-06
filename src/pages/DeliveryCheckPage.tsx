import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import styles from './DeliveryCheckPage.module.css';

interface CheckItem {
  code: string;
  expected: number;
  scanned: number;
  status: 'pending' | 'ok' | 'ng';
}

/**
 * 納品チェック画面
 */
export function DeliveryCheckPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [scannedCode, setScannedCode] = useState('');
  const [items, setItems] = useState<CheckItem[]>([
    // サンプルデータ（実際はマスタから読み込み）
    { code: '4901234567890', expected: 3, scanned: 0, status: 'pending' },
    { code: '4901234567891', expected: 5, scanned: 0, status: 'pending' },
    { code: '4901234567892', expected: 2, scanned: 0, status: 'pending' },
  ]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(function() {
    inputRef.current?.focus();
  }, []);

  const showToast = useCallback(function(message: string, type: 'success' | 'error') {
    setToast({ message: message, type: type });
    setTimeout(function() { setToast(null); }, 2000);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      var code = scannedCode.trim();
      if (code) {
        var index = items.findIndex(function(item) { return item.code === code; });
        if (index >= 0) {
          var newItems = items.slice();
          newItems[index].scanned += 1;
          // ステータス更新
          if (newItems[index].scanned === newItems[index].expected) {
            newItems[index].status = 'ok';
            showToast('✓ 数量一致', 'success');
          } else if (newItems[index].scanned > newItems[index].expected) {
            newItems[index].status = 'ng';
            showToast('× 超過', 'error');
          } else {
            showToast(code + ' (' + newItems[index].scanned + '/' + newItems[index].expected + ')', 'success');
          }
          setItems(newItems);
        } else {
          showToast('未登録: ' + code, 'error');
        }
        setScannedCode('');
      }
    } else if (e.key === 'Escape' || e.key === 'Backspace') {
      if (!scannedCode) {
        navigate('/');
      }
    }
  }

  var okCount = items.filter(function(i) { return i.status === 'ok'; }).length;
  var ngCount = items.filter(function(i) { return i.status === 'ng'; }).length;

  return (
    <div className={styles.container}>
      <Header title="納品チェック" />

      <main className={styles.main}>
        <div className={styles.inputSection}>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="バーコードをスキャン"
            value={scannedCode}
            onChange={function(e) { setScannedCode(e.target.value); }}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className={styles.stats}>
          <span className={styles.statOk}>OK: {okCount}</span>
          <span className={styles.statNg}>NG: {ngCount}</span>
          <span>残: {items.length - okCount - ngCount}</span>
        </div>

        <div className={styles.list}>
          {items.map(function(item, index) {
            var statusClass = item.status === 'ok' ? styles.itemOk :
                              item.status === 'ng' ? styles.itemNg : styles.itemPending;
            return (
              <div key={index} className={statusClass}>
                <span className={styles.itemCode}>{item.code}</span>
                <span className={styles.itemCount}>
                  {item.scanned}/{item.expected}
                </span>
              </div>
            );
          })}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.buttonClear}
            onClick={function() {
              var resetItems = items.map(function(item) {
                return { code: item.code, expected: item.expected, scanned: 0, status: 'pending' as const };
              });
              setItems(resetItems);
            }}
          >
            リセット
          </button>
          <button className={styles.buttonPrimary} onClick={function() { showToast('チェック完了', 'success'); }}>
            完了
          </button>
        </div>
      </main>

      {toast && (
        <div className={toast.type === 'success' ? styles.toastSuccess : styles.toastError}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
