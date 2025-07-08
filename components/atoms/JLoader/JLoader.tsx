'use client';

import styles from './JLoader.module.css';

export function JLoader() {
  return (
    <div className={styles.backdrop}>
      <div className={styles.loader}></div>
      <h1 className="text-lg text-white">Joining</h1>
    </div>
  );
}