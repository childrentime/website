import MarkdownIt from "markdown-it";
import { getHighlighter } from "shiki";
import anchor from "markdown-it-anchor";
import toc from "markdown-it-toc-done-right";

const highlighter = await getHighlighter({ theme: "nord" });
const markdown = new MarkdownIt({
  highlight: (code, lang) => {
    return highlighter.codeToHtml(code, { lang });
  },
});
markdown.use(anchor, {
  permalink: anchor.permalink.headerLink(), // This will add a link in each header
});
markdown.use(toc);
// 导出一个 markdown-it 单例
export default markdown;
