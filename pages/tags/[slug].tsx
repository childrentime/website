import { getPostsByTag, IPostArchive } from "../../api";
import { tags } from "../../constants/meta";
import Link from "next/link";
import { Fragment } from "react";
import styles from "../../styles/category/Category.module.css";
import { NextPage } from "next";

interface IProps {
  posts: IPostArchive[];
  slug: string;
}
const Tag: NextPage<IProps> = ({ posts, slug }) => {
  return (
    <>
      <h1 className={styles.title}>{`Reading articles in ${slug}`}</h1>
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

interface IParams {
  params: {
    slug: string;
  };
}
export async function getStaticPaths() {
  return {
    paths: tags.map((t) => ({ params: { slug: t } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }: IParams) {
  const { slug } = params;
  const posts = getPostsByTag(slug);
  return { props: { posts, slug } };
}

export default Tag;
