import { useState } from 'react';
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
    id: 'scan',
    label: 'データ読取',
    path: '/scan',
    icon: '📖',
    description: 'バーコード読取・蓄積',
  },
  {
    id: 'inventory',
    label: '棚卸',
    path: '/inventory',
    icon: '📦',
    description: 'ロケーション別棚卸',
  },
  {
    id: 'data-list',
    label: 'データ確認',
    path: '/data-list',
    icon: '📋',
    description: '蓄積データの確認・削除',
  },
  {
    id: 'send',
    label: 'サーバー送信',
    path: '/send',
    icon: '📡',
    description: '蓄積データを送信',
  },
];

export function MenuPage() {
  const navigate = useNavigate();
  const dataCount = getScannedDataCount();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  function handleExit() {
    if (dataCount > 0) {
      setShowExitConfirm(true);
    } else {
      doExit();
    }
  }

  function doExit() {
    clearScannedData();
    writeLog('INFO', 'SYSTEM', 'システム終了');
    // ブラウザのタブ/ウィンドウを閉じる
    // window.close()はスクリプトで開いたウィンドウでないと動作しない場合がある
    try {
      window.close();
    } catch (_e) {
      // 閉じられない場合はabout:blankに遷移
    }
    // window.close()が効かなかった場合のフォールバック
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
              <button className={styles.confirmYes} onClick={doExit}>
                終了する
              </button>
              <button
                className={styles.confirmNo}
                onClick={function () { setShowExitConfirm(false); }}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {MENU_ITEMS.map(function (item) {
          return (
            <button
              key={item.id}
              className={styles.menuButton}
              onClick={function () { navigate(item.path); }}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
              <span className={styles.description}>{item.description}</span>
            </button>
          );
        })}
      </div>
    </AppLayout>
  );
}
