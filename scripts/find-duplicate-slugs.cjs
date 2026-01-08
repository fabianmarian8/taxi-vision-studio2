const data = require('../slovenske-obce-main/obce.json');

const toSlug = (text) => text
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const slugToNames = new Map();
data.forEach(item => {
  const slug = toSlug(item.name);
  if (!slugToNames.has(slug)) {
    slugToNames.set(slug, []);
  }
  slugToNames.get(slug).push({ name: item.name, district: item.district });
});

console.log('Obce s rovnakým slugom ale rôznymi názvami:\n');

let count = 0;
slugToNames.forEach((items, slug) => {
  const uniqueNames = new Set(items.map(i => i.name));
  if (uniqueNames.size > 1) {
    console.log('Slug:', slug);
    items.forEach(i => console.log('  -', i.name, '(' + i.district + ')'));
    console.log();
    count++;
  }
});

console.log('Celkom:', count, 'prípadov');
