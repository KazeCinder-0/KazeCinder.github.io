// js/app.js - 初始化
window.addEventListener('hashchange', render);
loadPosts();

// 移动端菜单关闭
document.addEventListener('click', (e) => {
  const m = document.getElementById('mobile-menu');
  if (m && !m.classList.contains('hidden') && e.target.closest('a')) {
    m.classList.add('hidden');
  }
});
