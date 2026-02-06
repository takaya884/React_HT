import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import styles from './ShippingPage.module.css';

/**
 * 出庫画面
 */
export function ShippingPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [scannedCode, setScannedCode] = useState('');
  const [items, setItems] = useState<Array<{ code: string; quantity: number }>>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(function() {
    inputRef.current?.focus();
  }, []);

  const showToast = useCallback(function(message: string) {
    setToast(message);
    setTimeout(function() { setToast(null); }, 2000);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      var code = scannedCode.trim();
      if (code) {
        var existingIndex = items.findIndex(function(item) { return item.code === code; });
        if (existingIndex >= 0) {
          var newItems = items.slice();
          newItems[existingIndex].quantity += 1;
          setItems(newItems);
        } else {
          setItems(items.concat([{ code: code, quantity: 1 }]));
        }
        showToast('出庫: ' + code);
        setScannedCode('');
      }
    } else if (e.key === 'Escape' || e.key === 'Backspace') {
      if (!scannedCode) {
        navigate('/');
      }
    }
  }

  var totalQuantity = items.reduce(function(sum, item) { return sum + item.quantity; }, 0);

  return (
    <div className={styles.container}>
      <Header title="出庫" />

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
          <span>品目: {items.length}</span>
          <span>総数: {totalQuantity}</span>
        </div>

        <div className={styles.list}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>📤</span>
              <span>出庫データなし</span>
            </div>
          ) : (
            items.map(function(item, index) {
              return (
                <div key={index} className={styles.listItem}>
                  <span className={styles.itemCode}>{item.code}</span>
                  <span className={styles.itemQty}>×{item.quantity}</span>
                </div>
              );
            })
          )}
        </div>

        <div className={styles.actions}>
          <button className={styles.buttonClear} onClick={function() { setItems([]); }}>
            クリア
          </button>
          <button className={styles.buttonPrimary} onClick={function() { showToast('出庫完了'); }}>
            完了
          </button>
        </div>
      </main>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
