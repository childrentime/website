import MarkdownIt from "markdown-it";
import { getHighlighter } from "shiki";

const highlighter = await getHighlighter({ theme: "nord" });
const markdown = new MarkdownIt({
  highlight: (code, lang) => {
    return highlighter.codeToHtml(code, { lang });
  },
});
// 导出一个 markdown-it 单例
export default markdown;
