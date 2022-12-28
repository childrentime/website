import fs from "fs";
import path from "path";
import matter from "gray-matter";
import markdown from "../constants/markdown";
import dayjs from "dayjs";

const dirName = "docs";
const ext = ".md";
const dirPath = path.join(process.cwd(), dirName);
const aboutPath = path.join(process.cwd(), "ME.md");

export interface IItem {
  title: string;
  date: string;
  category: string;
  tag: string;
  description: string;
}

interface ISlug {
  slug: string;
}

export type IItemSlug = IItem & ISlug;
export type IItemContent = IItem & { content: string };

export const getAbout = (): string => {
  const file = fs.readFileSync(aboutPath, "utf-8");
  return markdown.render(file);
};

// 获取博文列表
export const getPostList = (): IItemSlug[] => {
  const posts = [];
  // 文件数组
  const files: string[] = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const data = matter(fileContent).data as IItem;
    posts.push({
      title: data.title,
      date: data.date,
      category: data.category,
      tag: data.tag,
      description: markdown.render(data.description),
      slug: file.substring(0, file.length - 3),
    });
  }
  // 时间降序
  posts.sort((a, b) => (dayjs(a.date).isBefore(dayjs(b.date)) ? 1 : -1));
  return posts;
};

// 获取博文 slug 数组
export const getPostSlugs = () => {
  const files: string[] = fs.readdirSync(dirPath);
  return files.map((file) => file.substring(0, file.length - 3));
};

// 获取一条博文
export const getPostBySlug = (slug: string): IItemContent => {
  const filepath = path.join(dirPath, `${slug}${ext}`);
  const file = fs.readFileSync(filepath, "utf-8");
  const fileContent = matter(file);
  const data = fileContent.data as IItem;
  const content = fileContent.content;

  return {
    title: data.title,
    date: data.date,
    category: data.category,
    tag: data.tag,
    description: markdown.render(data.description),
    content: markdown.render(content),
  };
};

type IItemPrevNext = Pick<IItem, "title" | "date"> & ISlug;
export interface IPrevNextPost {
  previous?: IItemPrevNext;
  next?: IItemPrevNext;
}
// 获取当前博文的上一篇和下一篇博文
export const getPrevNextPost = (slug: string) => {
  const posts: IItemPrevNext[] = [];
  const files: string[] = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const data = matter(fileContent).data as IItem;
    posts.push({
      title: data.title,
      date: data.date,
      slug: file.substring(0, file.length - 3),
    });
  }
  posts.sort((a, b) => (dayjs(a.date).isBefore(dayjs(b.date)) ? 1 : -1));
  let result: IPrevNextPost = {};
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].slug === slug) {
      if (posts[i - 1]) {
        result.previous = posts[i - 1];
      }
      if (posts[i + 1]) {
        result.next = posts[i + 1];
      }
      break;
    }
  }
  return result;
};

type IItemArchive = Pick<IItem, "date" | "title"> & ISlug;
export interface IPostArchive {
  year: string;
  posts: IItemArchive[];
}
// 根据分类获取博文
export const getPostsByCategory = (category: string): IPostArchive[] => {
  const posts: IItemArchive[] = [];
  const files: string[] = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const data = matter(fileContent).data as IItem;
    if (data.category === category) {
      posts.push({
        title: data.title,
        date: data.date,
        slug: file.substring(0, file.length - 3),
      });
    }
  }
  const map = new Map<string, IItemArchive[]>();
  for (const post of posts) {
    const year = post.date.substring(0, 4);
    if (map.has(year)) {
      map.get(year)!.push(post);
    } else {
      map.set(year, [post]);
    }
  }
  const keys = [...map.keys()];
  keys.sort((a, b) => Number(b) - Number(a));
  const result: IPostArchive[] = [];
  for (const key of keys) {
    result.push({
      year: key,
      posts: map.get(key)!,
    });
  }
  return result;
};

export const getPostsByTag = (tag: string): IPostArchive[] => {
  const posts: IItemArchive[] = [];
  const files: string[] = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const data = matter(fileContent).data as IItem;
    if (data.tag.split(" ").includes(tag)) {
      posts.push({
        title: data.title,
        date: data.date,
        slug: file.substring(0, file.length - 3),
      });
    }
  }
  const map = new Map<string, IItemArchive[]>();
  for (const post of posts) {
    const year = post.date.substring(0, 4);
    if (map.has(year)) {
      map.get(year)!.push(post);
    } else {
      map.set(year, [post]);
    }
  }
  const keys = [...map.keys()];
  keys.sort((a, b) => Number(b) - Number(a));
  const result: IPostArchive[] = [];
  for (const key of keys) {
    result.push({
      year: key,
      posts: map.get(key)!,
    });
  }
  return result;
};

export const getPostsSortByArchive = () => {
  const posts: IItemArchive[] = [];
  const files: string[] = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const data = matter(fileContent).data as IItem;
    posts.push({
      title: data.title,
      date: data.date,
      slug: file.substring(0, file.length - 3),
    });
  }
  const map = new Map<string, IItemArchive[]>();
  for (const post of posts) {
    const year = post.date.substring(0, 4);
    if (map.has(year)) {
      map.get(year)!.push(post);
    } else {
      map.set(year, [post]);
    }
  }
  const keys = [...map.keys()];
  keys.sort((a, b) => Number(b) - Number(a));
  const result: IPostArchive[] = [];
  for (const key of keys) {
    result.push({
      year: key,
      posts: map.get(key)!,
    });
  }
  return result;
};
