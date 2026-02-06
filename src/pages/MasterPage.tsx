import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import styles from './MasterPage.module.css';

/**
 * チェックマスタ作成画面
 */
export function MasterPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [scannedCode, setScannedCode] = useState('');
  const [items, setItems] = useState<Array<{ code: string; name: string }>>([]);
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
        // 重複チェック
        var exists = items.some(function(item) { return item.code === code; });
        if (exists) {
          showToast('登録済み: ' + code);
        } else {
          setItems(items.concat([{ code: code, name: '' }]));
          showToast('マスタ追加: ' + code);
        }
        setScannedCode('');
      }
    } else if (e.key === 'Escape' || e.key === 'Backspace') {
      if (!scannedCode) {
        navigate('/');
      }
    }
  }

  function handleDelete(index: number) {
    var newItems = items.slice();
    newItems.splice(index, 1);
    setItems(newItems);
    showToast('削除しました');
  }

  return (
    <div className={styles.container}>
      <Header title="マスタ作成" />

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
          <span>マスタ件数: {items.length}</span>
        </div>

        <div className={styles.list}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>📝</span>
              <span>マスタデータなし</span>
            </div>
          ) : (
            items.map(function(item, index) {
              return (
                <div key={index} className={styles.listItem}>
                  <span className={styles.itemCode}>{item.code}</span>
                  <button
                    className={styles.deleteBtn}
                    onClick={function() { handleDelete(index); }}
                  >
                    ×
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className={styles.actions}>
          <button className={styles.buttonClear} onClick={function() { setItems([]); }}>
            クリア
          </button>
          <button className={styles.buttonPrimary} onClick={function() { showToast('マスタ保存完了'); }}>
            保存
          </button>
        </div>
      </main>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
