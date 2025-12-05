class ProjectCard extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'img-src', 'img-alt', 'description', 'href', 'link-text', 'date', 'tags'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    // Re-render on attribute change to keep the view in sync
    if (this.shadowRoot) this.render();
  }

  get _props() {
    const tags = (this.getAttribute('tags') || '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    return {
      title: this.getAttribute('title') || 'Untitled',
      imgSrc: this.getAttribute('img-src') || '',
      imgAlt: this.getAttribute('img-alt') || '',
      description: this.getAttribute('description') || '',
      href: this.getAttribute('href') || '#',
      linkText: this.getAttribute('link-text') || 'Learn more',
      date: this.getAttribute('date') || '',
      tags
    };
  }

  render() {
    const { title, imgSrc, imgAlt, description, href, linkText, date, tags } = this._props;
    const hasImage = Boolean(imgSrc);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background: var(--card-bg, var(--bg-tertiary));
          color: var(--card-fg, var(--text-primary));
          border: 1px solid var(--card-border, var(--border-subtle));
          border-radius: 12px;
          box-shadow: 0 6px 20px color-mix(in srgb, var(--shadow-color, rgba(0,0,0,0.25)) 60%, transparent);
          transition: transform .2s ease, box-shadow .2s ease, background-color .2s ease;
          overflow: hidden;
        }
        :host(:hover), :host(:focus-within) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px color-mix(in srgb, var(--shadow-color, rgba(0,0,0,0.3)) 70%, transparent);
        }
        .card {
          display: grid;
          grid-template-rows: auto 1fr auto;
          gap: 0.75rem;
          padding: 0.9rem;
        }
        .media {
          aspect-ratio: 16 / 9;
          border-radius: 8px;
          overflow: hidden;
          background: var(--overlay-light);
          border: 1px solid var(--border-subtle);
        }
        .media img { width:100%; height:100%; display:block; object-fit:cover; object-position:center center; }
        h2 { font-size: 1.05rem; margin: 0.1rem 0 0; color: var(--text-accent); line-height: 1.3; }
        .desc { margin: 0.25rem 0 0; color: var(--text-secondary); font-size: 0.98rem; }
        .meta { margin-top: 0.5rem; display: flex; gap: .5rem; align-items: center; color: var(--text-secondary); font-size: 0.9rem; }
        .tags { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.35rem; }
        .tag { border: 1px solid var(--border-medium); color: var(--text-secondary); padding: 0.25rem 0.5rem; border-radius: 999px; font-size: 0.8rem; background: transparent; }
        .actions { margin-top: 0.6rem; }
        .actions a { display: inline-block; text-decoration: none; background: var(--link-color); color: var(--bg-secondary); border-radius: 8px; padding: 0.5rem 0.75rem; font-weight: 600; }
        .actions a:focus-visible { outline: 2px solid var(--link-color); outline-offset: 2px; }
      </style>
      <article class="card">
        ${hasImage ? `
          <figure class="media">
            <picture>
              <img src="${imgSrc}" alt="${imgAlt}">
            </picture>
          </figure>
        ` : ''}
        <header>
          <h2>${title}</h2>
        </header>
        <section>
          <p class="desc">${description}</p>
          ${date ? `<div class="meta" aria-label="Published date"><span>📅</span><time>${date}</time></div>` : ''}
          ${tags.length ? `<div class="tags" role="list">${tags.map(t => `<span class="tag" role="listitem">${t}</span>`).join('')}</div>` : ''}
        </section>
        <footer class="actions">
          <a href="${href}" target="_blank" rel="noopener noreferrer">${linkText}</a>
        </footer>
      </article>
    `;
  }
}

customElements.define('project-card', ProjectCard);