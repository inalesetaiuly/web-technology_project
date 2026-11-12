'use strict';

(() => {
    const form = document.getElementById('book-search');
    const input = document.getElementById('book-query');
    const status = document.getElementById('book-status');
    const results = document.getElementById('book-results');
    const button = form.querySelector('button');
    const openLibrary = 'https://openlibrary.org';
    const cache = new Map();
    const lastRequestAt = new Map();

    async function requestCatalog(url, interval) {
        // Track request spacing per provider because the two catalogs have different limits.
        const elapsed = performance.now() - (lastRequestAt.get(url.origin) ?? -Infinity);
        if (elapsed < interval) await new Promise(resolve => window.setTimeout(resolve, interval - elapsed));
        lastRequestAt.set(url.origin, performance.now());
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 8000);
        try {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) throw new Error(`Book catalog HTTP ${response.status}`);
            return await response.json();
        } finally {
            window.clearTimeout(timeout);
        }
    }

    async function searchOpenLibrary(query) {
        const url = new URL('/search.json', openLibrary);
        url.search = new URLSearchParams({
            q: query,
            fields: 'key,title,author_name,first_publish_year',
            limit: '5'
        });
        const { docs } = await requestCatalog(url, 1000);
        if (!Array.isArray(docs)) throw new Error('Invalid Open Library response');
        return docs.filter(book => typeof book?.title === 'string').slice(0, 5).map(book => {
            const workId = typeof book.key === 'string' && book.key.match(/^(?:\/works\/)?(OL\d+W)$/);
            return {
                title: book.title,
                author: Array.isArray(book.author_name) ? book.author_name.join(', ') : '',
                year: Number.isInteger(book.first_publish_year) ? book.first_publish_year : null,
                url: workId ? `${openLibrary}/works/${workId[1]}` : null
            };
        });
    }

    async function searchAppleBooks(query) {
        const url = new URL('https://itunes.apple.com/search');
        url.search = new URLSearchParams({ term: query, country: 'US', media: 'ebook', entity: 'ebook', limit: '5' });
        const { results: entries } = await requestCatalog(url, 3000);
        if (!Array.isArray(entries)) throw new Error('Invalid Apple Books response');
        return entries.filter(book => book?.kind === 'ebook' && typeof book.trackName === 'string')
            .slice(0, 5).map(book => ({
                title: book.trackName,
                author: typeof book.artistName === 'string' ? book.artistName : '',
                year: typeof book.releaseDate === 'string' ? book.releaseDate.match(/^\d{4}(?=-)/)?.[0] : null,
                url: Number.isSafeInteger(book.trackId) ? `https://books.apple.com/us/book/id${book.trackId}` : null
            }));
    }

    async function findBooks(query) {
        if (cache.has(query)) return cache.get(query);

        let result;
        // A successful response with no matches is a valid result. Switch catalogs only on failure.
        try {
            result = { source: 'Open Library', books: await searchOpenLibrary(query) };
        } catch {
            status.textContent = 'Open Library is unavailable. Searching Apple Books…';
            result = { source: 'Apple Books', books: await searchAppleBooks(query) };
        }
        cache.set(query, result);
        return result;
    }

    function createBookItem(book) {
        const item = document.createElement('li');
        item.className = 'list-group-item px-0 py-2 bg-transparent';
        const title = document.createElement(book.url ? 'a' : 'span');
        title.className = 'fw-semibold';
        title.textContent = book.title;
        if (book.url) title.href = book.url;
        const details = document.createElement('div');
        details.className = 'small text-body-secondary';
        const year = book.year ? ` · ${book.year}` : '';
        details.textContent = (book.author || 'Unknown author') + year;
        item.append(title, details);
        return item;
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (button.disabled) return;
        const query = input.value.trim();
        const error = !query ? 'Enter a title or author.' : query.length > 120 ? 'Use no more than 120 characters.' : '';
        showFieldError(input, error);
        if (error) {
            input.focus();
            return;
        }

        button.disabled = true;
        results.hidden = true;
        results.replaceChildren();
        status.textContent = 'Searching Open Library…';
        try {
            const { books, source } = await findBooks(query);
            results.replaceChildren(...books.map(createBookItem));
            results.hidden = books.length === 0;
            status.textContent = books.length
                ? `${books.length} ${books.length === 1 ? 'book' : 'books'} from ${source} for “${query}”.`
                : `No books found in ${source}. Try another title or author.`;
        } catch {
            status.textContent = 'Book search is unavailable right now. Try again in a moment.';
        } finally {
            button.disabled = false;
        }
    });

    input.addEventListener('input', () => showFieldError(input, ''));
    form.hidden = false;
})();
