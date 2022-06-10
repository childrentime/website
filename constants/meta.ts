export const name = "Berlin";
export const twitter = "https://twitter.com/wulianwen1";
export const github = "https://github.com/childrentime";
export const title = `${name}'s Blog`;
export const archive = "Archive";
export const home = "Home";
export const about = "About";
export const rss = "RSS";

export const category = ["Announcements", "Life", "Tech"];
export const tags = [
  "meta",
  "javascript",
  "node.js",
  "year-end",
  "shopping-guide",
  "news",
  "typescript",
];

export const CHINISE = "-zh-CN";

type Flatten<Els extends unknown[]> = Els extends [infer F, ...infer R]
  ? F extends unknown[]
    ? [...Flatten<F>, ...Flatten<R>]
    : [F, ...Flatten<R>]
  : [];
