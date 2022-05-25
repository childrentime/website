import fs from "fs";
import path from "path";
import { Feed } from "feed";
import { getPostList } from "../api";
import { name, title, twitter } from "./meta";

const dirName = "public";
const dirPath = path.join(process.cwd(), dirName);
const generateRssFeed = () => {
  const posts = getPostList();
  const siteURL = process.env.SITE_URL || "http://localhost:3000";
  const date = new Date();
  const author = {
    name: "BerLin",
    email: "Wul55267@gmail.com",
    link: twitter,
  };
  const feed = new Feed({
    title: title,
    description: "",
    id: siteURL,
    link: siteURL,
    image: `${siteURL}/logo.svg`,
    favicon: `${siteURL}/favicon.png`,
    copyright: `All rights reserved ${date.getFullYear()}, ${name}`,
    updated: date,
    generator: "Feed for Node.js",
    feedLinks: {
      rss2: `${siteURL}/rss/feed.xml`,
      json: `${siteURL}/rss/feed.json`,
      atom: `${siteURL}/rss/atom.xml`,
    },
    author,
  });
  posts.forEach((post) => {
    const url = `${siteURL}/posts/${post.slug}`;
    const category = [{ name: post.category }];
    post.tag.split(" ").forEach((t) => {
      category.push({ name: t });
    });
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.description,
      author: [author],
      contributor: [author],
      date: new Date(post.date),
      category: category,
    });
  });

  fs.mkdirSync(`${dirPath}/rss`, { recursive: true });
  fs.writeFileSync(`${dirPath}/rss/feed.xml`, feed.rss2());
  fs.writeFileSync(`${dirPath}/rss/atom.xml`, feed.atom1());
  fs.writeFileSync(`${dirPath}/rss/feed.json`, feed.json1());
};

export default generateRssFeed;
