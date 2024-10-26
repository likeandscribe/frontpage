// https://github.com/sindresorhus/article-title/blob/main/index.js
// slightly modified because import style
// MIT license
import * as cheerio from 'cheerio';

const matchers = [
    '.instapaper_title',
    'article h1',
    '.entry-content h1',
    '.markdown-body h1',
    '.entry-title',
    '.post-title',
    '.pageTitle',
    '.post_title',
    '.headline h1',
    '.headline',
    '.story h1',
    '.entry-header h1',
    '.news_title',
    '#page-post h1',
    '.postheader h1',
    '.postheader h2',
    '.type-post h1',
];

const clean = string => string.replace(/\r?\n/g, '').replace(/\s+/g, ' ').trim();

const findSelectorMatch = $ => {
    for (const matcher of matchers) {
        const element = $(matcher).first().text().trim();

        if (element && element.length > 0) {
            return element;
        }
    }
};

export default function articleTitle(html) {
    const $ = cheerio.load(html);

    let documentTitle = $('title').text().replace(/\r?\n/g, '');
    documentTitle = (/^[^|\-/•—]+/.exec(documentTitle) || [])[0] || documentTitle;
    documentTitle = (((documentTitle || '').match(/:(?<documentTitle>.*)/) || []).groups || '').documentTitle || documentTitle;
    documentTitle = (documentTitle || '').trim();

    let title = documentTitle;
    const heading = findSelectorMatch($);

    if (heading && heading.length > 5 && heading.length < 100) {
        title = heading;
    }

    return clean(title);
}
