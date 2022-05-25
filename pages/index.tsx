import dayjs from "dayjs";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { getPostList, IItemSlug } from "../api";
import { title } from "../constants/meta";
import generateRssFeed from "../constants/rss";
import styles from "../styles/Home.module.css";

export async function getStaticProps() {
  generateRssFeed();
  const posts = getPostList();
  return {
    props: { posts },
  };
}

interface IProps {
  posts: IItemSlug[];
}

const Home: NextPage<IProps> = ({ posts }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={`this is ${title}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {posts?.map((p) => (
        <div className={styles.post} key={p.title}>
          <div className={styles.postTitle}>
            <Link href={`/posts/${p.slug}`}>
              <a>{p.title}</a>
            </Link>
          </div>
          <div className={styles.postMeta}>
            {dayjs(p.date).format("MMM DD,YYYY")}
            <span> | </span>
            <span className={styles.category}>
              <Link href={`/category/${p.category}`}>
                <a>{p.category}</a>
              </Link>
            </span>
          </div>
          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{
              __html: p.description,
            }}
          />
          <p className={styles.readmore}>
            <Link href={`/posts/${p.slug}`}>
              <a>Read More</a>
            </Link>
          </p>
        </div>
      ))}
    </>
  );
};

export default Home;
