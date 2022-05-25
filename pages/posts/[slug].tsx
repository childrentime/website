import dayjs from "dayjs";
import { NextPage } from "next";
import Link from "next/link";
import {
  getPostBySlug,
  getPostSlugs,
  getPrevNextPost,
  IItemContent,
  IPrevNextPost,
} from "../../api";
import styles from "../../styles/posts/Slug.module.css";

interface IProps {
  post: IItemContent;
  nav: IPrevNextPost;
}
const Post: NextPage<IProps> = ({ post, nav }) => {
  const { previous, next } = nav;
  return (
    <>
      <div className={styles.post}>
        <h1 className={styles.postTitle}>{post.title}</h1>
        <div className={styles.postMeta}>
          {dayjs(post.date).format("MMM DD,YYYY")}
          <span> | </span>
          <span className={styles.category}>
            <Link href={`/category/${post.category}`}>
              <a>{post.category}</a>
            </Link>
          </span>
          <span> | </span>
          <span className={styles.tags}>
            {post.tag.split(" ").map((tag) => (
              <Link href={`/tags/${tag}`} key={tag}>
                <a>{tag}</a>
              </Link>
            ))}
          </span>
        </div>
        <div className={styles.postContent}>
          <div
            dangerouslySetInnerHTML={{
              __html: post.description,
            }}
          />
          <div
            dangerouslySetInnerHTML={{
              __html: post.content,
            }}
          ></div>
        </div>
        <div className={styles.postNav}>
          {previous && (
            <Link href={previous.slug}>
              <a className={styles.pre}>{previous.title}</a>
            </Link>
          )}
          {next && (
            <Link href={next.slug}>
              <a className={styles.next}>{next.title}</a>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

interface IParams {
  params: {
    slug: string;
  };
}

export async function getStaticPaths() {
  const posts = getPostSlugs();
  return {
    paths: posts.map((post) => ({
      params: { slug: post },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }: IParams) {
  const { slug } = params;
  const post = getPostBySlug(slug);
  const nav = getPrevNextPost(slug);
  return { props: { post, nav } };
}

export default Post;
