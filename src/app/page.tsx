import styles from './page.module.css';

export default function Home() {
    return (
        <div className={styles.page}>
            <a className={styles.move__button} href='/map'>
                move button
            </a>
        </div>
    );
}
