import { about, archive, home, rss, title } from "../constants/meta";
import styles from "../styles/components/Header.module.css";
import Link from "next/link";
import Image from "next/image";
import moon from "./moon.svg";
import sun from "./sun.svg";
import { useState } from "react";

const Header = () => {
  const [dark, setDark] = useState<boolean>(false);
  const toggleDark = () => {
    const root = document.getRootNode() as Document;
    root.children[0].classList.toggle("dark");
    setDark(!dark);
  };
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
        <button onClick={toggleDark} className={styles.button}>
          {dark && <Image alt="" src={moon} width={20} height={20} />}
          {!dark && <Image alt="" src={sun} width={20} height={20} />}
        </button>
      </div>
    </div>
  );
};

export default Header;
