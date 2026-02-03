import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

interface HeaderProps {
  title: string;
  /** ヘッダー右側に表示するスロット */
  rightSlot?: ReactNode;
}

export function Header({ title, rightSlot }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className={styles.header}>
      {!isHome && (
        <button className={styles.backButton} onClick={function () { navigate('/'); }}>
          ◀ 戻る
        </button>
      )}
      <h1 className={styles.title}>{title}</h1>
      {rightSlot && <div className={styles.rightSlot}>{rightSlot}</div>}
    </header>
  );
}
