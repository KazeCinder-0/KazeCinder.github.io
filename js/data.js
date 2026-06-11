// js/data.js - 数据加载
let allPosts = [];
let postsLoaded = false;

export async function loadPosts() {
  try {
    const response = await fetch('data/posts.json');
    if (response.ok) {
      allPosts = await response.json();
    } else {
      throw new Error('posts.json not found');
    }
  } catch (err) {
    console.error('Failed to load posts:', err);
    allPosts = [];
  }
  allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  postsLoaded = true;
  if (typeof render === 'function') render();
}

export function getAllTags() {
  const set = new Set();
  allPosts.forEach(p => p.tags.forEach(t => set.add(t)));
  return Array.from(set).sort();
}

export function getCategories() {
  return [...new Set(allPosts.map(p => p.category))].sort();
}

export { allPosts, postsLoaded };
