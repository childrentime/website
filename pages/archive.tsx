import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { Fragment } from "react";
import { getPostsSortByArchive, IPostArchive } from "../api";
import { archive, title } from "../constants/meta";
import styles from "../styles/category/Category.module.css";

export async function getStaticProps() {
  const posts = getPostsSortByArchive();
  return {
    props: { posts },
  };
}

interface IProps {
  posts: IPostArchive[];
}
const Archive: NextPage<IProps> = ({ posts }) => {
  return (
    <>
      <Head>
        <title>{`${archive} | ${title}`}</title>
        <meta name="description" content={`this is ${title}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.post}>
        <div className={styles.postArchive}>
          {posts.map((post) => (
            <Fragment key={post.year}>
              <h2>{post.year}</h2>
              <ul className={styles.list}>
                {post.posts.map((p) => (
                  <li key={p.slug}>
                    <span className={styles.date}>{p.date}</span>
                    <Link href={`/posts/${p.slug}`}>
                      <a>{p.title}</a>
                    </Link>
                  </li>
                ))}
              </ul>
            </Fragment>
          ))}
        </div>
      </div>
    </>
  );
};

export default Archive;
