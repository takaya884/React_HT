import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { StatusBadge } from '../components/common/StatusBadge';
import { getScannedDataCount, clearScannedData } from '../services/storageService';
import { writeLog } from '../services/logService';
import type { MenuItem } from '../types';
import styles from './MenuPage.module.css';

/**
 * メニュー定義
 * 画面を追加する場合はこの配列にアイテムを追加する
 */
const MENU_ITEMS: MenuItem[] = [
  {
    id: 'receiving',
    label: '入庫',
    path: '/receiving',
    icon: '📥',
    description: '入庫処理',
  },
  {
    id: 'shipping',
    label: '出庫',
    path: '/shipping',
    icon: '📤',
    description: '出庫処理',
  },
  {
    id: 'master',
    label: 'チェックマスタ作成',
    path: '/master',
    icon: '📝',
    description: 'マスタデータ作成',
  },
  {
    id: 'delivery-check',
    label: '納品チェック',
    path: '/delivery-check',
    icon: '✅',
    description: '納品確認',
  },
  {
    id: 'inventory',
    label: '棚卸',
    path: '/inventory',
    icon: '📦',
    description: 'ロケーション別棚卸',
  },
  {
    id: 'scan',
    label: 'データ読取',
    path: '/scan',
    icon: '📖',
    description: 'バーコード読取',
  },
  {
    id: 'data-list',
    label: 'データ確認',
    path: '/data-list',
    icon: '📋',
    description: '蓄積データ確認',
  },
  {
    id: 'send',
    label: 'データ送信',
    path: '/send',
    icon: '📡',
    description: 'サーバーへ送信',
  },
  {
    id: 'receive',
    label: 'データ受信',
    path: '/receive',
    icon: '📥',
    description: 'サーバーから受信',
  },
];

export function MenuPage() {
  const navigate = useNavigate();
  const dataCount = getScannedDataCount();
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const confirmYesRef = useRef<HTMLButtonElement>(null);
  const confirmNoRef = useRef<HTMLButtonElement>(null);
  const [confirmFocus, setConfirmFocus] = useState<'yes' | 'no'>('no');

  // キーボードナビゲーション（十字キー対応）
  const handleKeyDown = useCallback(function(e: KeyboardEvent) {
    if (showExitConfirm) {
      // 確認ダイアログ表示中
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        setConfirmFocus(function(prev) { return prev === 'yes' ? 'no' : 'yes'; });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (confirmFocus === 'yes') {
          doExit();
        } else {
          setShowExitConfirm(false);
        }
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        setShowExitConfirm(false);
      }
      return;
    }

    const cols = 2; // 2列グリッド
    const totalItems = MENU_ITEMS.length;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(function(prev) {
          const newIndex = prev - cols;
          return newIndex >= 0 ? newIndex : prev;
        });
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(function(prev) {
          const newIndex = prev + cols;
          return newIndex < totalItems ? newIndex : prev;
        });
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setSelectedIndex(function(prev) {
          return prev > 0 ? prev - 1 : prev;
        });
        break;
      case 'ArrowRight':
        e.preventDefault();
        setSelectedIndex(function(prev) {
          return prev < totalItems - 1 ? prev + 1 : prev;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (MENU_ITEMS[selectedIndex]) {
          navigate(MENU_ITEMS[selectedIndex].path);
        }
        break;
      default:
        break;
    }
  }, [showExitConfirm, confirmFocus, selectedIndex, navigate]);

  useEffect(function() {
    window.addEventListener('keydown', handleKeyDown);
    return function() {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 選択中のボタンにフォーカス
  useEffect(function() {
    if (!showExitConfirm && menuButtonRefs.current[selectedIndex]) {
      menuButtonRefs.current[selectedIndex]?.focus();
    }
  }, [selectedIndex, showExitConfirm]);

  // 確認ダイアログのフォーカス制御
  useEffect(function() {
    if (showExitConfirm) {
      if (confirmFocus === 'yes') {
        confirmYesRef.current?.focus();
      } else {
        confirmNoRef.current?.focus();
      }
    }
  }, [showExitConfirm, confirmFocus]);

  function handleExit() {
    if (dataCount > 0) {
      setShowExitConfirm(true);
      setConfirmFocus('no');
    } else {
      doExit();
    }
  }

  function doExit() {
    clearScannedData();
    writeLog('INFO', 'SYSTEM', 'システム終了');
    try {
      window.close();
    } catch (_e) {
      // 閉じられない場合
    }
    window.location.href = 'about:blank';
  }

  const exitButton = (
    <button className={styles.exitButton} onClick={handleExit}>
      終了
    </button>
  );

  return (
    <AppLayout title="メニュー" headerRight={exitButton}>
      <div className={styles.statusRow}>
        <StatusBadge count={dataCount} label="件 蓄積中" />
      </div>

      {/* 終了確認ダイアログ */}
      {showExitConfirm && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmBox}>
            <p className={styles.confirmText}>
              蓄積データが <strong>{dataCount}件</strong> あります。<br />
              終了すると削除されます。<br />
              よろしいですか？
            </p>
            <div className={styles.confirmButtons}>
              <button
                ref={confirmYesRef}
                className={confirmFocus === 'yes' ? styles.confirmYesFocused : styles.confirmYes}
                onClick={doExit}
              >
                終了する
              </button>
              <button
                ref={confirmNoRef}
                className={confirmFocus === 'no' ? styles.confirmNoFocused : styles.confirmNo}
                onClick={function () { setShowExitConfirm(false); }}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {MENU_ITEMS.map(function (item, index) {
          var isSelected = index === selectedIndex;
          return (
            <button
              key={item.id}
              ref={function(el) { menuButtonRefs.current[index] = el; }}
              className={isSelected ? styles.menuButtonSelected : styles.menuButton}
              onClick={function () { navigate(item.path); }}
              onFocus={function() { setSelectedIndex(index); }}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.hint}>
        ↑↓←→: 選択　Enter: 決定
      </div>
    </AppLayout>
  );
}
