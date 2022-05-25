import { NextPage } from "next";
import { getAbout } from "../api";
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
    <div className={styles.post}>
      <h1 className={styles.postTitle}>About Me</h1>
      <div
        className={styles.postContent}
        dangerouslySetInnerHTML={{ __html: post }}
      />
    </div>
  );
};

export default About;
