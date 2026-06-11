// js/markdown.js - Markdown 解析（使用 marked.js）

async function loadMarkdown(contentPath) {
  try {
    const response = await fetch(contentPath);
    const text = await response.text();

    // 去掉 YAML frontmatter 并提取 title
    const content = text.replace(/^---\n([\s\S]*?)\n---/, (match, yaml) => {
      const titleMatch = yaml.match(/title:\s*"([^"]+)"/);
      if (titleMatch) window._articleTitle = titleMatch[1];
      return '';
    }).trim();

    // 使用 marked.js 解析 Markdown
    return marked.parse(content, {
      breaks: true,
      gfm: true
    });

  } catch (err) {
    console.error('Failed to load markdown:', contentPath, err);
    return '<p class="text-muted">文章加载失败</p>';
  }
}
