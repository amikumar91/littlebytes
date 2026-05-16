import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Site config ─────────────────────────────────────────────────────────────
const config = {
  title: 'LittleBytes',
  tagline: 'Short notes on things I learn.',
  // For GitHub Pages served at a subdirectory (e.g. '/my-repo'), set this via:
  //   BASE_PATH=/my-repo node build.js
  basePath: process.env.BASE_PATH || '',
};

// ─── Marked config ───────────────────────────────────────────────────────────
marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  })
);

marked.use({
  gfm: true,
  renderer: {
    // In marked v12 the extension renderer receives positional args, not a token object:
    //   heading(text, depth, rawText)  — rawText is the plain-text heading content
    //   image(href, title, altText)
    heading(text, depth, rawText) {
      const slug = (rawText || text.replace(/<[^>]+>/g, ''))
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+$/, '');
      return `<h${depth} id="${slug}"><a class="anchor" href="#${slug}">#</a> ${text}</h${depth}>\n`;
    },
    image(href, title, text) {
      const titleAttr = title ? ` title="${title}"` : '';
      const caption = text ? `<figcaption>${text}</figcaption>` : '';
      return `<figure><img src="${href}" alt="${text || ''}"${titleAttr} loading="lazy">${caption}</figure>\n`;
    },
  },
});

// ─── Paths ────────────────────────────────────────────────────────────────────
const BLOGS_DIR = path.join(__dirname, 'blogs');
const DIST_DIR = path.join(__dirname, 'dist');
const SRC_DIR = path.join(__dirname, 'src');
const PUBLIC_DIR = path.join(__dirname, 'public');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function url(p) {
  return config.basePath + p;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

// ─── HTML layout ─────────────────────────────────────────────────────────────
function layout({ title, description = '', head = '', content }) {
  const metaDesc = description
    ? `<meta name="description" content="${description}">`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} · ${config.title}</title>
  ${metaDesc}
  <link rel="icon" href="${url('/favicon.svg')}" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;1,14..32,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${url('/style.css')}">
  ${head}
  <script>
    (function () {
      var saved = localStorage.getItem('theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));
    })();
  </script>
</head>
<body>
  <header class="site-header">
    <a href="${url('/')}" class="site-title">${config.title.slice(0, -5)}<span>${config.title.slice(-5)}</span></a>
    <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">◑</button>
  </header>
  <main>
    ${content}
  </main>
  <footer class="site-footer">
    <span>${config.title}</span>
  </footer>
  <script>
    document.getElementById('theme-toggle').addEventListener('click', function () {
      var html = document.documentElement;
      var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  </script>
</body>
</html>`;
}

// ─── Post page ────────────────────────────────────────────────────────────────
function renderPost(post) {
  const { title, date, tags = [], description } = post.frontmatter;
  const content = marked.parse(post.body);

  const tagsHtml = tags.length
    ? `<div class="tags">${tags.map(t => `<a href="${url('/tag/' + slugify(t) + '/')}" class="tag">${t}</a>`).join('')}</div>`
    : '';

  const body = `
    <a href="${url('/')}" class="back-link">← All posts</a>
    <article>
      <header class="post-header">
        <h1 class="post-header-title">${title}</h1>
        <div class="post-meta">
          <time datetime="${date}">${formatDate(date)}</time>
          ${tagsHtml}
        </div>
        ${description ? `<p class="post-lead">${description}</p>` : ''}
      </header>
      <div class="prose">
        ${content}
      </div>
    </article>`;

  return layout({ title, description, content: body });
}

// ─── Index page ───────────────────────────────────────────────────────────────
function renderIndex(posts) {
  const items = posts
    .map(post => {
      const { title, date, description, tags = [] } = post.frontmatter;
      const tagsHtml = tags.length
        ? `<div class="tags">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>`
        : '';
      return `
      <li>
        <a href="${url('/blog/' + post.slug + '/')}" class="post-card">
          <span class="post-card-title">${title}</span>
          <span class="post-meta">
            <time datetime="${date}">${formatDate(date)}</time>
            ${tagsHtml}
          </span>
          ${description ? `<span class="post-card-desc">${description}</span>` : ''}
        </a>
      </li>`;
    })
    .join('');

  const empty = posts.length === 0
    ? `<p class="empty">No posts yet — add a folder to <code>blogs/</code>.</p>`
    : '';

  const body = `
    <div class="site-intro">
      <p class="site-tagline">${config.tagline}</p>
    </div>
    <ul class="post-list">
      ${items}
    </ul>
    ${empty}`;

  return layout({ title: config.title, content: body });
}

// ─── Build ────────────────────────────────────────────────────────────────────
function build() {
  console.time('Built in');
  ensureDir(DIST_DIR);
  ensureDir(path.join(DIST_DIR, 'blog'));

  // Copy styles
  ensureDir(path.join(DIST_DIR));
  fs.copyFileSync(path.join(SRC_DIR, 'style.css'), path.join(DIST_DIR, 'style.css'));

  // Copy public/ assets
  if (fs.existsSync(PUBLIC_DIR)) {
    fs.cpSync(PUBLIC_DIR, DIST_DIR, { recursive: true });
  }

  // Read all posts
  const posts = [];

  if (!fs.existsSync(BLOGS_DIR)) {
    console.warn('blogs/ directory not found — skipping posts');
  } else {
    for (const entry of fs.readdirSync(BLOGS_DIR, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;

      const slug = entry.name;
      const mdPath = path.join(BLOGS_DIR, slug, 'index.md');
      if (!fs.existsSync(mdPath)) continue;

      const raw = fs.readFileSync(mdPath, 'utf8');
      const { data: frontmatter, content: body } = matter(raw);

      if (!frontmatter.title || !frontmatter.date) {
        console.warn(`  skip ${slug}: frontmatter missing title or date`);
        continue;
      }

      posts.push({ slug, frontmatter, body });

      // Write post HTML
      const postDist = path.join(DIST_DIR, 'blog', slug);
      ensureDir(postDist);
      fs.writeFileSync(path.join(postDist, 'index.html'), renderPost({ slug, frontmatter, body }));

      // Copy post assets (images, diagrams, etc.)
      for (const asset of fs.readdirSync(path.join(BLOGS_DIR, slug))) {
        if (asset === 'index.md') continue;
        const assetSrc = path.join(BLOGS_DIR, slug, asset);
        if (fs.statSync(assetSrc).isFile()) {
          fs.copyFileSync(assetSrc, path.join(postDist, asset));
        }
      }
    }
  }

  // Sort newest first
  posts.sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date));

  // Write index
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), renderIndex(posts));

  console.log(`  ${posts.length} post(s)`);
  console.timeEnd('Built in');
}

build();
