import { Component } from '@theme/component';

/**
 * Page Mirror — fetches a same-store URL, parses its Shopify sections and
 * renders each one as a scaled visual preview card with block metadata.
 *
 * @typedef {object} Refs
 * @property {HTMLInputElement} urlInput
 * @property {HTMLElement} status
 * @property {HTMLElement} output
 */

class PageMirrorComponent extends Component {
  /** @type {Map<string, {html: string, stylesheets: string}>} */
  #sectionData = new Map();

  connectedCallback() {
    super.connectedCallback();
    const url = this.dataset.targetUrl;
    if (url) this.load(url);
  }

  async handleLoad() {
    const url = this.refs.urlInput?.value?.trim();
    if (url) await this.load(url);
  }

  handleKeydown(event) {
    if (event.key === 'Enter') this.handleLoad();
  }

  async load(url) {
    const output = this.refs.output;
    const input = this.refs.urlInput;

    this.#showStatus('Laden…', 'loading');
    output.setAttribute('data-loading', '');
    output.innerHTML = '';
    this.#sectionData.clear();

    if (input && input.value !== url) input.value = url;

    try {
      const response = await fetch(url, { credentials: 'same-origin' });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} — ${response.statusText}`);
      }

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      const pageTitle = doc.title;
      const rawSections = [...doc.querySelectorAll('[id^="shopify-section-"]')];

      if (!rawSections.length) {
        this.#showStatus('Geen Shopify-secties gevonden op deze pagina.', 'info');
        output.removeAttribute('data-loading');
        return;
      }

      const stylesheets = this.#extractStylesheets(doc);

      for (const sectionEl of rawSections) {
        const id = sectionEl.id.replace('shopify-section-', '');
        const clone = /** @type {Element} */ (sectionEl.cloneNode(true));

        for (const script of clone.querySelectorAll('script')) script.remove();
        for (const el of clone.querySelectorAll('[style*="display:none"],[hidden]')) {
          el.removeAttribute('hidden');
        }

        this.#sectionData.set(id, { html: clone.outerHTML, stylesheets });
      }

      output.innerHTML = rawSections
        .map((s) => this.#renderCard(s))
        .join('');

      output.removeAttribute('data-loading');
      this.#hydratePreviews();
      this.#showStatus(
        `${rawSections.length} secties geladen van “${pageTitle}”`,
        'success'
      );
    } catch (err) {
      const msg =
        err instanceof TypeError
          ? 'Kan de pagina niet laden. Zorg dat de URL van jouw eigen winkel is (zelfde domein).'
          : `Fout: ${err.message}`;
      this.#showStatus(msg, 'error');
      output.removeAttribute('data-loading');
    }
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  #showStatus(message, type = 'info') {
    const status = this.refs.status;
    if (!status) return;
    status.textContent = message;
    status.dataset.statusType = type;
    status.removeAttribute('hidden');
  }

  #extractStylesheets(doc) {
    const links = [...doc.querySelectorAll('link[rel="stylesheet"]')]
      .map((el) => el.outerHTML)
      .join('\n');

    const styles = [...doc.querySelectorAll('style')]
      .filter((el) => el.textContent.trim().length > 0)
      .map((el) => el.outerHTML)
      .join('\n');

    return `${links}\n${styles}`;
  }

  #extractScheme(sectionEl) {
    const el = sectionEl.querySelector('[class*="color-scheme-"]');
    if (!el) return null;
    const cls = [...el.classList].find((c) => c.startsWith('color-scheme-'));
    return cls ? cls.replace('color-scheme-', '') : null;
  }

  #extractBlocks(sectionEl) {
    return [...sectionEl.querySelectorAll('[id^="shopify-block-"]')].map((b) => ({
      id: b.id.replace('shopify-block-', ''),
      type: b.dataset.type ?? 'block',
      label: (
        b.querySelector('h1,h2,h3,h4,h5,h6')?.textContent?.trim() ||
        b.querySelector('p')?.textContent?.trim() ||
        b.querySelector('img')?.getAttribute('alt') ||
        ''
      )
        .trim()
        .slice(0, 48),
    }));
  }

  #renderCard(sectionEl) {
    const id = sectionEl.id.replace('shopify-section-', '');
    const type = sectionEl.dataset.type ?? id;
    const scheme = this.#extractScheme(sectionEl);
    const blocks = this.#extractBlocks(sectionEl);

    const schemeBadge = scheme
      ? `<span class="mirror-badge mirror-badge--scheme" data-scheme="${scheme}">
           <span class="mirror-badge__dot" aria-hidden="true"></span>${scheme}
         </span>`
      : '';

    const blockBadge = `<span class="mirror-badge">${blocks.length}&nbsp;blok${
      blocks.length !== 1 ? 'ken' : ''
    }</span>`;

    const blockChips = blocks.length
      ? `<div class="mirror-section__blocks" aria-label="Blokken in deze sectie">
           ${blocks
             .map(
               (b) =>
                 `<span class="mirror-block" title="${b.id}">
                    <code class="mirror-block__type">${b.type}</code>
                    ${b.label ? `<span class="mirror-block__label">${b.label}</span>` : ''}
                  </span>`
             )
             .join('')}
         </div>`
      : '';

    return `
      <article class="mirror-section" data-section-id="${id}" aria-label="Sectie: ${type}">
        <header class="mirror-section__header">
          <div class="mirror-section__meta">
            <strong class="mirror-section__type">${type}</strong>
            ${schemeBadge}
            ${blockBadge}
          </div>
          <div class="mirror-section__actions">
            <code class="mirror-section__id">#${id}</code>
            <button
              class="mirror-section__copy button"
              type="button"
              data-section-id="${id}"
              aria-label="Kopieer HTML van sectie ${type}"
            >Kopieer HTML</button>
          </div>
        </header>
        <div class="mirror-section__preview-wrap" aria-hidden="true">
          <iframe
            class="mirror-section__iframe"
            title="Voorvertoning: ${type}"
            loading="lazy"
            tabindex="-1"
          ></iframe>
        </div>
        ${blockChips}
      </article>`;
  }

  #hydratePreviews() {
    for (const section of this.querySelectorAll('.mirror-section')) {
      const id = /** @type {string} */ (
        /** @type {HTMLElement} */ (section).dataset.sectionId
      );
      const data = this.#sectionData.get(id);
      if (!data) continue;

      const iframe = /** @type {HTMLIFrameElement} */ (
        section.querySelector('.mirror-section__iframe')
      );

      iframe.srcdoc = `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1440">
${data.stylesheets}
<style>
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; overflow: hidden; pointer-events: none; }
</style>
</head>
<body>${data.html}</body>
</html>`;

      iframe.addEventListener('load', () => this.#scaleIframe(iframe), {
        once: true,
      });

      const copyBtn = section.querySelector('.mirror-section__copy');
      copyBtn?.addEventListener('click', () => this.#copySection(id, copyBtn));
    }

    const observer = new ResizeObserver(() => {
      for (const iframe of this.querySelectorAll(
        '.mirror-section__iframe[style]'
      )) {
        this.#scaleIframe(/** @type {HTMLIFrameElement} */ (iframe));
      }
    });

    if (this.refs.output) observer.observe(this.refs.output);
  }

  #scaleIframe(iframe) {
    const wrap = /** @type {HTMLElement | null} */ (
      iframe.closest('.mirror-section__preview-wrap')
    );
    if (!wrap) return;

    const wrapWidth = wrap.clientWidth || 800;
    const contentHeight =
      iframe.contentDocument?.documentElement?.scrollHeight ?? 500;
    const scale = wrapWidth / 1440;

    iframe.style.cssText = `
      width: 1440px;
      height: ${contentHeight}px;
      transform: scale(${scale});
      transform-origin: top left;
      border: none;
      display: block;
    `;
    wrap.style.height = `${Math.max(contentHeight * scale, 100)}px`;
  }

  async #copySection(id, btn) {
    const data = this.#sectionData.get(id);
    if (!data) return;

    try {
      await navigator.clipboard.writeText(data.html);
      btn.textContent = '✓ Gekopieerd!';
    } catch {
      btn.textContent = 'Kopiëren mislukt';
    }

    setTimeout(() => {
      btn.textContent = 'Kopieer HTML';
    }, 2500);
  }
}

customElements.define('page-mirror-component', PageMirrorComponent);
