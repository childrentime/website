import { NextPage } from "next";
import Head from "next/head";
import { getAbout } from "../api";
import { about, title } from "../constants/meta";
import styles from "../styles/posts/Slug.module.css";

export async function getStaticProps() {
  const post = getAbout();
  return { props: { post } };
}

interface IProps {
  post: string;
}

const About: NextPage<IProps> = ({ post }) => {
  return (
    <>
      <Head>
        <title>{`${about} | ${title}`}</title>
        <meta name="description" content={`this is ${title}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.post}>
        <h1 className={styles.postTitle}>About Me</h1>
        <div
          className={styles.postContent}
          dangerouslySetInnerHTML={{ __html: post }}
        />
      </div>
    </>
  );
};

export default About;
