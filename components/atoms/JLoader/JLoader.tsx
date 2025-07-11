'use client';

import styles from './JLoader.module.css';

type JLoaderProps = {
  text: string;
};

export function JLoader({ text }: JLoaderProps) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.loader}></div>
      <h1 className="text-lg text-white">{text}</h1>
    </div>
  );
}