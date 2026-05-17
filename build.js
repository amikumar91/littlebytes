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
  // Override via SITE_URL env var for non-GitHub-Pages deployments
  siteUrl: process.env.SITE_URL || 'https://amikumar91.github.io/littlebytes',
  basePath: process.env.BASE_PATH || '',
};

// ─── Author config ────────────────────────────────────────────────────────────
// PLACEHOLDER: fill in your personal details below
const author = {
  initials: '??',           // [PLACEHOLDER: your initials, e.g. "AK"]
  name:     '[PLACEHOLDER: Your Full Name]',
  role:     '[PLACEHOLDER: e.g. Software engineer · Algo trader · Writing about systems and markets]',
  bio:      '[PLACEHOLDER: Short bio — what you build, what you trade, what this blog is about. 2–3 sentences.]',
  github:   '[PLACEHOLDER: https://github.com/your-handle]',
  linkedin: '[PLACEHOLDER: https://linkedin.com/in/your-handle]',
  twitter:  '',  // [PLACEHOLDER: https://x.com/your-handle — set to non-empty string to show]
  email:    '',  // [PLACEHOLDER: mailto:your@email.com — set to non-empty string to show]
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
const DIST_DIR  = path.join(__dirname, 'dist');
const SRC_DIR   = path.join(__dirname, 'src');
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

function readingTime(text) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const icons = {
  github: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"/></svg>',
  linkedin: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  rss: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20 4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/></svg>',
  twitter: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
};

// ─── Copy-button script (injected inline at bottom of every page) ──────────
const COPY_SCRIPT = `document.querySelectorAll('pre').forEach(function(pre){var btn=document.createElement('button');btn.className='copy-btn';btn.textContent='Copy';btn.addEventListener('click',function(){var code=pre.querySelector('code');navigator.clipboard.writeText(code?code.innerText:pre.innerText).then(function(){btn.textContent='Copied!';setTimeout(function(){btn.textContent='Copy';},2000);}).catch(function(){btn.textContent='Failed';setTimeout(function(){btn.textContent='Copy';},2000);});});pre.appendChild(btn);});`;

// ─── Author card (rendered on homepage) ──────────────────────────────────────
function renderAuthorCard() {
  const twitterLink = author.twitter
    ? `<a href="${author.twitter}" class="author-link" aria-label="Twitter / X" target="_blank" rel="noopener">${icons.twitter}</a>`
    : '';
  const emailLink = author.email
    ? `<a href="${author.email}" class="author-link" aria-label="Email">✉</a>`
    : '';
  return `
    <aside class="author-card" id="about">
      <div class="author-avatar" aria-hidden="true">${author.initials}</div>
      <div class="author-info">
        <div class="author-name">${author.name}</div>
        <div class="author-role">${author.role}</div>
        <p class="author-bio">${author.bio}</p>
        <div class="author-links">
          <a href="${author.github}" class="author-link" aria-label="GitHub" target="_blank" rel="noopener">${icons.github}</a>
          <a href="${author.linkedin}" class="author-link" aria-label="LinkedIn" target="_blank" rel="noopener">${icons.linkedin}</a>
          ${twitterLink}${emailLink}
        </div>
      </div>
    </aside>`;
}

// ─── RSS 2.0 feed ─────────────────────────────────────────────────────────────
function generateFeed(posts) {
  const items = posts.map(post => {
    const { title, date, description } = post.frontmatter;
    const link = `${config.siteUrl}/blog/${post.slug}/`;
    const pubDate = new Date(date).toUTCString();
    const desc = description ? `      <description>${escapeXml(description)}</description>\n` : '';
    return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${pubDate}</pubDate>
${desc}    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.title)}</title>
    <link>${config.siteUrl}/</link>
    <description>${escapeXml(config.tagline)}</description>
    <language>en-us</language>
    <atom:link href="${config.siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

// ─── HTML layout ─────────────────────────────────────────────────────────────
function layout({ title, description = '', content, ogType = 'website', pageUrl = '', ogDate = '' }) {
  const safeTitle = escapeHtml(title);
  const safeDesc  = escapeHtml(description || config.tagline);
  const resolvedUrl = pageUrl || `${config.siteUrl}/`;

  const metaDesc = description ? `<meta name="description" content="${escapeHtml(description)}">` : '';

  const ogTags = ogType === 'article' ? `
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:url" content="${resolvedUrl}" />
  <meta property="og:type" content="article" />${ogDate ? `\n  <meta property="article:published_time" content="${ogDate}" />` : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <!-- PLACEHOLDER: <meta name="twitter:creator" content="@yourhandle" /> -->` : `
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:url" content="${resolvedUrl}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />`;

  const footerTwitter = author.twitter
    ? `<a href="${author.twitter}" class="footer-link" aria-label="Twitter / X" target="_blank" rel="noopener">${icons.twitter}</a>`
    : '';

  const logoFirst = config.title.slice(0, -5);
  const logoLast  = config.title.slice(-5);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle} · ${config.title}</title>
  ${metaDesc}
  ${ogTags}
  <link rel="alternate" type="application/rss+xml" title="${config.title} RSS" href="${config.siteUrl}/feed.xml">
  <link rel="icon" href="${url('/favicon.svg')}" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;1,14..32,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${url('/style.css')}">
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
    <a href="${url('/')}" class="site-logo" aria-label="${config.title} home">
      <span class="site-logo-icon" aria-hidden="true">◑</span>
      <span class="site-logo-text">${logoFirst}<span>${logoLast}</span></span>
    </a>
    <nav class="site-nav" aria-label="Site navigation">
      <a href="${url('/')}" class="nav-link">Writing</a>
      <a href="${url('/')}#about" class="nav-link">About</a>
      <a href="${author.github}" class="nav-link nav-icon-link" aria-label="GitHub" target="_blank" rel="noopener">${icons.github}</a>
      <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">◑</button>
    </nav>
  </header>
  <main>
    ${content}
  </main>
  <footer class="site-footer">
    <div class="footer-inner">
      <span class="footer-copy">© 2026 [PLACEHOLDER: Your Full Name]<!-- PLACEHOLDER --></span>
      <span class="footer-tagline">${config.tagline}</span>
      <div class="footer-links">
        <a href="${author.github}" class="footer-link" aria-label="GitHub" target="_blank" rel="noopener">${icons.github}</a>
        <a href="${author.linkedin}" class="footer-link" aria-label="LinkedIn" target="_blank" rel="noopener">${icons.linkedin}</a>
        ${footerTwitter}
        <a href="${url('/feed.xml')}" class="footer-link" aria-label="RSS feed">${icons.rss}</a>
      </div>
    </div>
  </footer>
  <script>
    document.getElementById('theme-toggle').addEventListener('click', function () {
      var html = document.documentElement;
      var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  </script>
  <script>${COPY_SCRIPT}</script>
</body>
</html>`;
}

// ─── Post page ────────────────────────────────────────────────────────────────
function renderPost(post) {
  const { title, date, tags = [], description } = post.frontmatter;
  const mins = readingTime(post.body);
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
          <span class="read-time">· ${mins} min read</span>
          ${tagsHtml}
        </div>
        ${description ? `<p class="post-lead">${description}</p>` : ''}
      </header>
      <div class="prose">
        ${content}
      </div>
    </article>`;

  return layout({
    title,
    description,
    content: body,
    ogType: 'article',
    pageUrl: `${config.siteUrl}/blog/${post.slug}/`,
    ogDate: String(date),
  });
}

// ─── Index page ───────────────────────────────────────────────────────────────
function renderIndex(posts) {
  const items = posts
    .map(post => {
      const { title, date, description, tags = [] } = post.frontmatter;
      const mins = readingTime(post.body);
      const tagsHtml = tags.length
        ? `<div class="tags">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>`
        : '';
      return `
      <li>
        <a href="${url('/blog/' + post.slug + '/')}" class="post-card">
          <span class="post-card-title">${title}</span>
          <span class="post-meta">
            <time datetime="${date}">${formatDate(date)}</time>
            <span class="read-time">· ${mins} min read</span>
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
    ${renderAuthorCard()}
    <ul class="post-list">
      ${items}
    </ul>
    ${empty}`;

  return layout({
    title: config.title,
    description: config.tagline,
    content: body,
    pageUrl: `${config.siteUrl}/`,
  });
}

// ─── Build ────────────────────────────────────────────────────────────────────
function build() {
  console.time('Built in');
  ensureDir(DIST_DIR);
  ensureDir(path.join(DIST_DIR, 'blog'));

  // Copy styles
  fs.copyFileSync(path.join(SRC_DIR, 'style.css'), path.join(DIST_DIR, 'style.css'));

  // Copy public/ assets (favicon, etc.)
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

  // Write RSS feed
  fs.writeFileSync(path.join(DIST_DIR, 'feed.xml'), generateFeed(posts));

  console.log(`  ${posts.length} post(s)`);
  console.timeEnd('Built in');
}

build();
