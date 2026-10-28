// Run with Playwright installed: node tests/assignment5.cjs
// Optional: PLAYWRIGHT_MODULE=/absolute/path/to/playwright CHROME_EXECUTABLE=/path/to/chrome
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const evidence = path.join(root, 'output', 'assignment5', 'evidence');
fs.mkdirSync(evidence, { recursive: true });
const results = [];
const errors = [];
const failures = [];
let base;

const server = http.createServer((req, res) => {
    const requested = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!requested.startsWith(root + path.sep) || !fs.existsSync(requested) || !fs.statSync(requested).isFile()) {
        res.writeHead(404); res.end(); return;
    }
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg' };
    res.setHeader('Content-Type', types[path.extname(requested).toLowerCase()] || 'application/octet-stream');
    res.end(fs.readFileSync(requested));
});

async function run() {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    base = process.env.TEST_BASE_URL || `http://127.0.0.1:${server.address().port}/`;
    const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_EXECUTABLE ? { executablePath: process.env.CHROME_EXECUTABLE } : {}) });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
    async function check(name, fn) {
        await fn(); results.push(name); console.log(`PASS ${name}`);
    }
    async function open(file) {
        await page.goto(base + file);
        await page.waitForFunction(() => document.querySelector('[data-theme-toggle]')?.hidden === false);
    }
    async function screenshot(name, selector) {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        if (selector) await page.locator(selector).screenshot({ path: path.join(evidence, name + '.png') });
        else { await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: path.join(evidence, name + '.png'), fullPage: false }); }
        await page.emulateMedia({ reducedMotion: 'no-preference' });
    }
    async function contactStep1() {
        await page.locator('#fullname').fill('Test Student');
        await page.locator('#email').fill('student@example.com');
        await page.locator('#wizard-next').click();
    }
    async function contactStep2() {
        await page.locator('#subject').fill('Library study session');
        await page.locator('#category').selectOption('library');
        await page.locator('#message').fill('Can I find a quiet study space?');
        await page.locator('#wizard-next').click();
    }
    try {
        for (const file of ['index.html', 'about.html', 'resources.html', 'contact.html']) {
            await check(`loads ${file}, correct footer and no inline handlers`, async () => {
                await open(file);
                assert.match(await page.locator('footer').innerText(), /Yessetaiuly Inal/);
                assert.match(await page.locator('footer').innerText(), /Nurkeldi Baizhigit/);
                assert.equal(await page.locator('h1').count(), 1);
                assert.equal(await page.locator('[onclick], [onkeydown], [onsubmit], script:not([src])').count(), 0);
            });
        }
        await open('index.html');
        await check('theme toggle changes theme and ARIA state', async () => {
            await page.locator('[data-theme-toggle]').click();
            assert.equal(await page.locator('html').getAttribute('data-bs-theme'), 'dark');
            assert.equal(await page.locator('[data-theme-toggle]').getAttribute('aria-pressed'), 'true');
        });
        await screenshot('home-dark');
        await check('theme persists on reload and across pages', async () => {
            await page.reload();
            assert.equal(await page.locator('html').getAttribute('data-bs-theme'), 'dark');
            await open('resources.html');
            assert.equal(await page.locator('html').getAttribute('data-bs-theme'), 'dark');
        });
        await screenshot('resources-dark');
        await open('contact.html'); await screenshot('contact-dark');
        await page.locator('#open-popup').click(); await screenshot('popup-dark', '#subscribe-popup'); await page.keyboard.press('Escape');
        await open('about.html'); await screenshot('about-dark');
        await check('theme restores day colors', async () => {
            await page.locator('[data-theme-toggle]').click();
            assert.equal(await page.locator('html').getAttribute('data-bs-theme'), 'light');
        });
        await open('index.html');
        await check('empty and whitespace greetings rejected without HTML required', async () => {
            await page.locator('#greeting-name').evaluate(el => el.removeAttribute('required'));
            await page.locator('#greeting-name').fill('   ');
            await page.locator('#greeting-form button').click();
            assert.match(await page.locator('#greeting-error').innerText(), /enter your name/);
        });
        await check('personal greeting works by Enter', async () => {
            await page.locator('#greeting-name').fill('Nurkeldi');
            await page.locator('#greeting-name').press('Enter');
            assert.match(await page.locator('#personal-greeting').innerText(), /Welcome, Nurkeldi!/);
        });
        await screenshot('greeting', 'section:has(#greeting-form)');
        await check('greeting renders HTML-looking input as plain text', async () => {
            await page.locator('#greeting-name').fill('<img src=x onerror=alert(1)>');
            await page.locator('#greeting-form button').click();
            assert.equal(await page.locator('#personal-greeting img').count(), 0);
            assert.match(await page.locator('#personal-greeting').innerText(), /<img/);
        });
        await check('arrow menu navigation wraps; Home and End work', async () => {
            const links = page.locator('#mainNavbar .nav-link');
            await links.nth(0).focus(); await page.keyboard.press('ArrowLeft');
            assert.equal(await links.nth(3).evaluate(el => el === document.activeElement), true);
            await page.keyboard.press('ArrowRight');
            assert.equal(await links.nth(0).evaluate(el => el === document.activeElement), true);
            await page.keyboard.press('End');
            assert.equal(await links.nth(3).evaluate(el => el === document.activeElement), true);
            await page.keyboard.press('Home');
            assert.equal(await links.nth(0).evaluate(el => el === document.activeElement), true);
        });
        await check('old background switcher still works and respects dark theme', async () => {
            const before = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor);
            await page.locator('#change-background').click();
            await page.waitForFunction(() => getComputedStyle(document.body).backgroundColor === 'rgb(231, 240, 250)');
            assert.notEqual(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor), before);
            await page.locator('[data-theme-toggle]').click();
            await page.waitForFunction(() => getComputedStyle(document.body).backgroundColor === 'rgb(16, 25, 35)');
            const dark = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor);
            await page.locator('#change-background').click();
            assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor), dark);
            await page.locator('[data-theme-toggle]').click();
        });
        await check('clock updates', async () => {
            const before = await page.locator('#current-datetime').getAttribute('datetime');
            await page.waitForFunction(value => document.querySelector('#current-datetime').dateTime !== value, before);
        });
        await check('sound plays, prevents overlap and releases resources', async () => {
            await page.evaluate(() => {
                window.audioStarts = 0;
                const original = AudioContext.prototype.createOscillator;
                AudioContext.prototype.createOscillator = function () { window.audioStarts++; return original.call(this); };
                document.getElementById('play-notification').click();
                document.getElementById('play-notification').click();
            });
            await page.waitForFunction(() => document.querySelector('#sound-status').textContent.startsWith('Notification played'));
            assert.equal(await page.evaluate(() => window.audioStarts), 1);
            assert.equal(await page.locator('#play-notification').isEnabled(), true);
        });
        await screenshot('home-tools', '#campus-tools');
        await check('unavailable audio shows an error', async () => {
            await page.evaluate(() => { window.AudioContext = undefined; window.webkitAudioContext = undefined; });
            await page.locator('#play-notification').click();
            assert.match(await page.locator('#sound-status').innerText(), /unavailable/);
        });
        await open('resources.html');
        await check('catalog filters study, activities and all with correct counts', async () => {
            assert.equal(await page.locator('#resource-cards article').count(), 3);
            await page.locator('[data-category="study"]').click();
            assert.equal(await page.locator('#resource-cards article').count(), 2);
            await page.locator('[data-category="activities"]').click();
            assert.equal(await page.locator('#resource-cards article').count(), 1);
            assert.match(await page.locator('#resource-count').innerText(), /^1 campus resource$/);
            assert.equal(await page.locator('[data-category="activities"]').getAttribute('aria-pressed'), 'true');
        });
        await screenshot('catalog-filtered', 'section:has(#resource-cards)');
        await check('sidebar restores filtered-out cards', async () => {
            await page.locator('.resource-sidebar a[href="#library"]').click();
            assert.equal(await page.locator('#resource-cards article').count(), 3);
            await page.locator('#library').waitFor({ state: 'visible' });
        });
        await check('FAQ expands and closes with keyboard', async () => {
            await page.locator('#faq-library-toggle').focus(); await page.keyboard.press('Enter');
            await page.locator('#faq-library').waitFor({ state: 'visible' });
            await page.keyboard.press('Space');
            await page.locator('#faq-library').waitFor({ state: 'hidden' });
        });
        await check('reduced motion skips catalog animations', async () => {
            await page.emulateMedia({ reducedMotion: 'reduce' });
            await page.locator('[data-category="study"]').click();
            assert.equal(await page.locator('#resource-cards').evaluate(el => el.getAnimations().length), 0);
            await page.emulateMedia({ reducedMotion: 'no-preference' });
        });
        await open('contact.html');
        await check('wizard blocks empty first step', async () => {
            await page.locator('#wizard-next').click();
            assert.match(await page.locator('#wizard-step-label').innerText(), /Step 1/);
            assert.equal(await page.locator('#fullname').getAttribute('aria-invalid'), 'true');
        });
        await check('wizard preserves values through Next and Back', async () => {
            await contactStep1();
            assert.match(await page.locator('#wizard-step-label').innerText(), /Step 2/);
            await page.locator('#wizard-back').click();
            assert.equal(await page.locator('#fullname').inputValue(), 'Test Student');
            await page.locator('#email').press('Enter');
            assert.match(await page.locator('#wizard-step-label').innerText(), /Step 2/);
        });
        await screenshot('wizard-step2', '#message-section');
        await contactStep2();
        await check('password length and confirmation enforced without HTML attributes', async () => {
            await page.locator('#password').evaluate(el => el.removeAttribute('minlength'));
            await page.locator('#confirm-password').evaluate(el => el.removeAttribute('data-match'));
            await page.locator('#password').fill('short');
            await page.locator('#confirm-password').fill('other');
            await page.locator('#wizard-submit').click();
            assert.match(await page.locator('#password-error').innerText(), /8 characters/);
            assert.match(await page.locator('#confirm-password-error').innerText(), /do not match/);
        });
        await screenshot('wizard-errors', '#message-section');
        await check('valid final submission succeeds and clears practice passwords', async () => {
            await page.locator('#password').fill('CampusDemo26');
            await page.locator('#confirm-password').fill('CampusDemo26');
            await page.locator('#wizard-submit').click();
            assert.match(await page.locator('#form-status').innerText(), /All fields are valid/);
            assert.equal(await page.locator('#password').inputValue(), '');
        });
        await screenshot('wizard-success', '#message-section');
        await check('reset returns to step one and clears messages', async () => {
            await page.locator('#contact-form button[type="reset"]').click();
            assert.match(await page.locator('#wizard-step-label').innerText(), /Step 1/);
            assert.equal(await page.locator('#fullname').inputValue(), '');
            assert.equal(await page.locator('#form-status').innerText(), '');
        });
        for (const id of ['fullname', 'email', 'subject', 'category', 'message', 'password', 'confirm-password']) {
            await check(`deleted mandatory field ${id} cannot pass`, async () => {
                await open('contact.html'); await contactStep1(); await contactStep2();
                await page.locator('#password').fill('CampusDemo26'); await page.locator('#confirm-password').fill('CampusDemo26');
                await page.locator('#' + id).evaluate(el => el.remove());
                await page.locator('#wizard-submit').click();
                assert.match(await page.locator('#form-status').innerText(), /missing or unavailable/);
                assert.equal(await page.locator('#form-status').evaluate(el => el.classList.contains('alert-success')), false);
            });
        }
        await check('tampered earlier email returns to its visible step', async () => {
            await open('contact.html'); await contactStep1(); await contactStep2();
            await page.locator('#password').fill('CampusDemo26'); await page.locator('#confirm-password').fill('CampusDemo26');
            await page.locator('#email').evaluate(el => { el.removeAttribute('required'); el.type = 'text'; el.value = 'bad-email'; });
            await page.locator('#wizard-submit').click();
            assert.match(await page.locator('#wizard-step-label').innerText(), /Step 1/);
            assert.equal(await page.locator('#email').isVisible(), true);
        });
        await check('popup validates and closes by Escape and backdrop', async () => {
            await page.locator('#open-popup').click();
            await page.locator('#subscription-form button[type="submit"]').click();
            assert.match(await page.locator('#subscriber-name-error').innerText(), /required/);
            await page.locator('#subscriber-name').fill('Test Student'); await page.locator('#subscriber-email').fill('student@example.com');
            await page.locator('#subscription-form button[type="submit"]').click();
            assert.match(await page.locator('#subscription-status').innerText(), /details are valid/);
            await page.keyboard.press('Escape'); assert.equal(await page.locator('#subscribe-popup').isVisible(), false);
            await page.locator('#open-popup').click(); await page.mouse.click(3, 3);
            assert.equal(await page.locator('#subscribe-popup').isVisible(), false);
        });
        await open('about.html');
        await check('nine-slide carousel still changes slides', async () => {
            assert.equal(await page.locator('.carousel-item').count(), 9);
            await page.locator('.carousel-control-next').click();
            await page.waitForFunction(() => document.querySelectorAll('.carousel-item')[1].classList.contains('active'));
        });
        for (const width of [390, 768, 1440]) {
            await page.setViewportSize({ width, height: 1000 });
            for (const file of ['index.html', 'resources.html', 'contact.html', 'about.html']) {
                await check(`${file} has no horizontal overflow at ${width}px`, async () => {
                    await open(file);
                    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
                });
            }
        }
        await page.setViewportSize({ width: 390, height: 844 });
        await open('index.html');
        await check('mobile collapsed menu supports arrow navigation', async () => {
            await page.locator('.navbar-toggler').click();
            const links = page.locator('#mainNavbar .nav-link');
            await links.nth(0).focus(); await page.keyboard.press('ArrowDown');
            assert.equal(await links.nth(1).evaluate(el => el === document.activeElement), true);
        });
        await page.locator('.navbar-toggler').click(); await screenshot('home-mobile');
        await page.setViewportSize({ width: 1440, height: 1000 });
        await open('index.html'); await screenshot('home-light');

        // Real browser screenshots of source excerpts, alongside the actual page screenshots.
        const snippets = [
            ['theme', 'js/assignment5.js', '    function applyTheme(theme)', '    button.addEventListener'],
            ['greeting', 'js/assignment5.js', '        const field = form.querySelector', '        if (!message) animateEntrance(result);'],
            ['keyboard', 'js/assignment5.js', 'function setupKeyboardNavigation()', '// The callback'],
            ['callback', 'js/assignment5.js', 'function createStepController', 'function setupWizard()'],
            ['catalog', 'js/assignment5.js', '        filterByCategory(category)', '        render(category'],
            ['sound', 'js/assignment5.js', '            const start = context.currentTime;', '            status.textContent = \'Notification played.'],
            ['validation', 'js/site.js', 'const contactRules', 'function validationField']
        ];
        for (const [name, file, start, end] of snippets) {
            const source = fs.readFileSync(path.join(root, file), 'utf8');
            const begin = source.indexOf(start), finish = source.indexOf(end, begin + start.length);
            const excerpt = source.slice(begin, finish);
            await page.setContent('<html><head></head><body><h1></h1><pre></pre></body></html>');
            await page.addStyleTag({content: 'body{margin:0;padding:32px;background:#10233d;color:#e5edf4;font:17px monospace}h1{font-size:22px;color:#9bdce7}pre{white-space:pre-wrap;font:17px/1.6 monospace}'});
            await page.locator('h1').evaluate((el, text) => { el.textContent = text; }, file + ' / ' + name);
            await page.locator('pre').evaluate((el, text) => { el.textContent = text; }, excerpt);
            await page.locator('pre').screenshot({ path: path.join(evidence, 'code-' + name + '.png') });
        }
        assert.deepEqual(errors, [], 'No uncaught JavaScript errors');
        assert.deepEqual(failures, [], 'No failed assets');
        fs.writeFileSync(path.join(root, 'output', 'assignment5', 'test-results.json'), JSON.stringify({ date: '2026-10-28', base, passed: results.length, tests: results, errors, failedResponses: failures }, null, 2));
        console.log(`ALL ${results.length} CHECKS PASSED`);
    } finally {
        await context.close(); await browser.close(); server.close();
    }
}
run().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
