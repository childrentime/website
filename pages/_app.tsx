import "../styles/globals.css";
import type { AppProps } from "next/app";
import styles from "../styles/App.module.css";
import Link from "next/link";
import { category, github, tags, title, twitter } from "../constants/meta";
import Header from "../components/header";

export function getStaticProps() {
  return {};
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="body-container">
      <script
        dangerouslySetInnerHTML={{
          // 增加一个自执行的函数
          __html: `
          (function () {
            function setDark(dark) {
              dark &&  document.documentElement.classList.add('dark');
            }
            let store;
            try {
              store = JSON.parse(localStorage.getItem('reactuses-color-scheme'));
            } catch (err) { }
            let dark;
            if(store === null){
              const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
              dark = darkQuery.matches;
            }else {
              dark = store;
            }
            setDark(dark)
          })();
      `,
        }}
      ></script>
      <Header />
      <div className={styles.layout}>
        <nav className="table-of-contents" />
        <div className={styles.left}>
          <div className={styles.content}>
            <Component {...pageProps} />
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.sidebar}>
            <div className={styles.widget}>
              <div className={styles.widgetTitle}>
                <span>Categories</span>
              </div>
              <ul className={styles.categoryList}>
                {category.map((c) => (
                  <li className={styles.categoryListItem} key={c}>
                    <Link href={`/category/${c}`}>
                      <a>{c}</a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.widget}>
              <div className={styles.widgetTitle}>
                <span>Tags</span>
              </div>
              <div className={styles.tagcloud}>
                {tags.map((tag) => (
                  <Link href={`/tags/${tag}`} key={tag}>
                    <a>{tag}</a>
                  </Link>
                ))}
              </div>
            </div>
            <div className={styles.widget}>
              <div className={styles.widgetTitle}>
                <span>Links</span>
              </div>
              <ul></ul>
              <Link href={github}>
                <a target="_blank">Github</a>
              </Link>
              <ul></ul>
              <Link href={twitter}>
                <a target="_blank">Twitter</a>
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.left}>
          <div className={styles.footer}>
            {"Copyright © 2022 "}
            <Link href="/">
              <a>{title}</a>
            </Link>
            {". Powered by"}
            <Link href="https://nextjs.org/">
              <a target="_blank"> Next.</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyApp;
