import { about, archive, home, rss, title } from "../constants/meta";
import styles from "../styles/components/Header.module.css";
import Link from "next/link";

const Header = () => {
  return (
    <div className={styles.header}>
      <div className={styles.sitename}>
        <Link href={"/"}>
          <a className={styles.title}>{title}</a>
        </Link>
        <p className={styles.description}></p>
      </div>
      <div className={styles.navMenu}>
        <Link href={"/"}>
          <a>{home}</a>
        </Link>
        <Link href={"/archive"}>
          <a>{archive}</a>
        </Link>
        <Link href={"/about"}>
          <a>{about}</a>
        </Link>
        <Link href={"/rss/feed.xml"}>
          <a>{rss}</a>
        </Link>
      </div>
    </div>
  );
};

export default Header;
