import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const root = new URL('./', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
function write(path, content) {
  const target = new URL(path, root);
  mkdirSync(new URL('./', target), { recursive: true });
  writeFileSync(target, content);
}

const api = 'https://tilt-lab-seven-ergonomics.usefulcrown8.chatgpt.site';
const selection = 'const MODEL=' + read('src/model.json') + ';\n' + read('src/selection.mjs');
const prepared = 'const PREPARED=' + read('src/prepared-advice.json') + ';';
const pages = {
  '/': read('src/intro.html'),
  '/recommend': read('src/recommend.html').replace('/* shared recommendation data */', () => selection + '\n' + prepared),
  '/ask': read('src/ask.html'),
  '/LICENSE.txt': read('LICENSE.txt'),
  '/CREDITS.md': read('CREDITS.md')
};

// Relative links keep visitors inside the GitHub Pages project path.
function pagesHtml(html, fromHome) {
  const base = fromHome ? './' : '../';
  return html.replaceAll('href="/"', 'href="' + base + '"')
    .replaceAll('href="/ask"', 'href="' + base + 'ask/"')
    .replaceAll('href="/recommend"', 'href="' + base + 'recommend/"')
    .replaceAll("fetch('/api/", "fetch('" + api + "/api/");
}
write('docs/index.html', pagesHtml(pages['/'], true));
for (const name of ['recommend', 'ask']) {
  write('docs/' + name + '/index.html', pagesHtml(pages['/' + name], false));
}
write('docs/LICENSE.txt', pages['/LICENSE.txt']);
write('docs/CREDITS.md', pages['/CREDITS.md']);
write('docs/.nojekyll', '');

const worker = 'const PAGES=' + JSON.stringify(pages) + ';\n' + selection + '\n' +
  read('src/recommend.mjs') + '\n' + read('src/worker.mjs');
write('dist/worker.mjs', worker);
