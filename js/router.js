// js/router.js - 路由逻辑
let renderInProgress = false;

async function render() {
  if (!postsLoaded) return;
  if (renderInProgress) return;
  renderInProgress = true;

  const hash = window.location.hash || '#/';
  const main = document.getElementById('main-content');
  let page, title;

  // 更新导航激活状态
  document.querySelectorAll('[data-nav]').forEach(el => {
    const nav = el.getAttribute('data-nav');
    const isHome = hash === '#/' || hash === '#' || hash.startsWith('#/post') || hash.startsWith('#/tag') || hash.startsWith('#/category');
    const isLibrary = hash.startsWith('#/library');
    const isAbout = hash === '#/about';

    if (nav === 'home' && isHome) {
      el.className = 'px-4 py-2 rounded-lg text-sm font-medium text-purple-400 bg-purple-500/10';
    } else if (nav === 'library' && isLibrary) {
      el.className = 'px-4 py-2 rounded-lg text-sm font-medium text-purple-400 bg-purple-500/10';
    } else if (nav === 'about' && isAbout) {
      el.className = 'px-4 py-2 rounded-lg text-sm font-medium text-purple-400 bg-purple-500/10';
    } else {
      el.className = 'px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-text hover:bg-surface transition-colors';
    }
  });

  if (hash === '#/' || hash === '#') {
    page = await renderHome(null, null);
    title = 'King Cobra — Backend & AI';
  } else if (hash.startsWith('#/post/')) {
    const id = hash.replace('#/post/', '');
    page = await renderPost(id);
    const post = allPosts.find(p => p.id === id);
    title = post ? `${post.title} | King Cobra` : 'Not Found | King Cobra';
  } else if (hash.startsWith('#/tag/')) {
    const tag = hash.replace('#/tag/', '');
    page = await renderHome(tag, null);
    title = `#${tag} | King Cobra`;
  } else if (hash.startsWith('#/category/')) {
    const category = hash.replace('#/category/', '');
    page = await renderHome(null, category);
    title = `${CONFIG.categoryLabels[category] || category} | King Cobra`;
  } else if (hash.startsWith('#/library')) {
    const category = hash.replace('#/library', '').replace('/', '');
    page = renderLibrary(category || null);
    title = '知识库 | King Cobra';
  } else if (hash === '#/about') {
    page = renderAbout();
    title = 'About | King Cobra';
  } else {
    page = await renderHome(null, null);
    title = 'King Cobra — Backend & AI';
  }

  main.innerHTML = `<div class="animate-fade-in-up">${page}</div>`;
  document.title = title;
  window.scrollTo(0, 0);
  renderInProgress = false;
}
