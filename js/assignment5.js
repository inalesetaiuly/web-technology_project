'use strict';

// Assignment 5: each initializer safely skips components absent on the current page.
function animateEntrance(element) {
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    element.getAnimations().forEach(animation => animation.cancel());
    element.animate(
        [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 200, easing: 'ease-out' }
    );
}

function setupTheme() {
    const button = document.querySelector('[data-theme-toggle]');
    if (!button) return;
    const storageKey = 'campus-life-theme';
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    let preference = null;
    try { preference = localStorage.getItem(storageKey); } catch { /* Storage can be unavailable. */ }
    function applyTheme(theme) {
        const dark = theme === 'dark';
        document.documentElement.dataset.bsTheme = dark ? 'dark' : 'light';
        button.textContent = dark ? 'Day theme' : 'Night theme';
        button.setAttribute('aria-pressed', String(dark));
        button.setAttribute('aria-label', `Switch to ${dark ? 'day' : 'night'} theme`);
    }
    applyTheme(['light', 'dark'].includes(preference) ? preference : (media.matches ? 'dark' : 'light'));
    button.hidden = false;
    button.addEventListener('click', () => {
        preference = document.documentElement.dataset.bsTheme === 'dark' ? 'light' : 'dark';
        applyTheme(preference);
        try { localStorage.setItem(storageKey, preference); } catch { /* The toggle still works in memory. */ }
    });
    media.addEventListener('change', event => {
        if (!['light', 'dark'].includes(preference)) applyTheme(event.matches ? 'dark' : 'light');
    });
    window.addEventListener('storage', event => {
        if (event.key !== storageKey) return;
        preference = event.newValue;
        applyTheme(['light', 'dark'].includes(preference) ? preference : (media.matches ? 'dark' : 'light'));
    });
}

function setupGreeting() {
    const form = document.getElementById('greeting-form');
    if (!form) return;
    const result = document.getElementById('personal-greeting');
    const error = document.getElementById('greeting-error');
    form.addEventListener('submit', event => {
        event.preventDefault();
        const field = form.querySelector('#greeting-name');
        const name = field && !field.disabled ? field.value.trim() : '';
        const message = !name ? 'Please enter your name.' : name.length > 60 ? 'Use no more than 60 characters.' : '';
        error.textContent = message;
        error.hidden = !message;
        if (field) {
            showFieldError(field, message);
            if (message) field.focus();
        }
        // textContent treats any HTML-looking input as text, never as markup.
        result.textContent = message ? 'Welcome to Campus Life!' : `Welcome, ${name}! Ready to explore campus?`;
        if (!message) animateEntrance(result);
    });
}

function setupKeyboardNavigation() {
    const menu = document.querySelector('#mainNavbar .navbar-nav');
    if (!menu) return;
    menu.addEventListener('keydown', event => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        const links = Array.from(menu.querySelectorAll('.nav-link')).filter(link => link.getClientRects().length);
        const index = links.indexOf(document.activeElement);
        if (index < 0) return;
        let next;
        switch (event.key) {
            case 'ArrowRight': case 'ArrowDown': next = (index + 1) % links.length; break;
            case 'ArrowLeft': case 'ArrowUp': next = (index - 1 + links.length) % links.length; break;
            case 'Home': next = 0; break;
            case 'End': next = links.length - 1; break;
            default: return;
        }
        event.preventDefault();
        links[next].focus();
    });
}

// The callback receives the current step; state is stored separately from the DOM.
function createStepController(total, onStepChange) {
    let current = 0;
    return {
        get current() { return current; },
        goTo(index, focus = true) {
            if (!Number.isInteger(index) || index < 0 || index >= total) return;
            current = index;
            onStepChange(current, focus);
        }
    };
}

function setupWizard() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const steps = [
        { title: 'About you', fields: ['fullname', 'email'] },
        { title: 'Your message', fields: ['subject', 'category', 'message'] },
        { title: 'Confirmation', fields: ['password', 'confirm-password'] }
    ];
    const back = document.getElementById('wizard-back');
    const next = document.getElementById('wizard-next');
    const submit = document.getElementById('wizard-submit');
    const label = document.getElementById('wizard-step-label');
    const progress = document.getElementById('wizard-progress-bar');
    const status = document.getElementById('form-status');
    const panels = Array.from(form.querySelectorAll('[data-wizard-step]'));
    const controller = createStepController(steps.length, (index, focus) => {
        panels.forEach(panel => {
            panel.hidden = Number(panel.dataset.wizardStep) !== index;
            if (!panel.hidden) animateEntrance(panel);
        });
        label.textContent = `Step ${index + 1} of ${steps.length}: ${steps[index].title}`;
        progress.value = index + 1;
        back.hidden = index === 0;
        next.hidden = index === steps.length - 1;
        submit.hidden = index !== steps.length - 1;
        if (focus) label.focus();
    });
    function clearStatus() {
        status.textContent = '';
        status.classList.remove('alert', 'alert-danger', 'alert-success');
    }
    function advance() {
        clearStatus();
        let firstInvalid = null;
        const missing = [];
        for (const id of steps[controller.current].fields) {
            const rule = contactRules[id];
            const field = validationField(form, id, rule);
            if (!field) { missing.push(rule.label); continue; }
            const message = fieldError(field, rule, form, contactRules);
            showFieldError(field, message);
            if (message && !firstInvalid) firstInvalid = field;
        }
        if (missing.length || firstInvalid) {
            status.textContent = missing.length
                ? `Required fields are missing or unavailable: ${missing.join(', ')}. Reload the page and try again.`
                : 'Please correct the highlighted fields before continuing.';
            status.classList.add('alert', 'alert-danger');
            if (firstInvalid) firstInvalid.focus();
            return;
        }
        controller.goTo(controller.current + 1);
    }
    next.addEventListener('click', advance);
    back.addEventListener('click', () => { clearStatus(); controller.goTo(controller.current - 1); });
    // Capture submission before the shared validator: Enter advances until the final step.
    form.addEventListener('submit', event => {
        if (controller.current === steps.length - 1) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        advance();
    }, true);
    form.addEventListener('validation-error', event => {
        const index = steps.findIndex(step => step.fields.includes(event.detail.field.id));
        if (index >= 0) controller.goTo(index, false);
    });
    form.addEventListener('reset', () => controller.goTo(0));
    document.getElementById('wizard-progress').hidden = false;
    controller.goTo(0, false);
}

function setupResourceCatalog() {
    const container = document.getElementById('resource-cards');
    if (!container) return;
    const filters = document.getElementById('resource-filters');
    const catalog = {
        items: [
            { id: 'library', title: 'Library', category: 'study', image: 'images/library.png', alt: 'Shelves inside the university library', text: 'Find books, quiet study spaces and help with academic research.', href: 'contact.html', action: 'Ask the Library' },
            { id: 'study-spaces', title: 'Study Spaces', category: 'study', image: 'images/studypng.png', alt: 'Students using a study space', text: 'Choose a comfortable place to focus on individual or group work.', href: 'contact.html', action: 'Find Support' },
            { id: 'student-center', title: 'Student Center', category: 'activities', image: 'images/activities.png', alt: 'Students participating in campus activities', text: 'Discover activities, clubs and opportunities to meet other students.', href: 'about.html', action: 'Explore Activities' }
        ],
        filterByCategory(category) {
            switch (category) {
                case 'study': case 'activities': return this.items.filter(item => item.category === category);
                case 'all': default: return this.items;
            }
        },
        render(category, animate = true) {
            const items = this.filterByCategory(category);
            const fragment = document.createDocumentFragment();
            for (const item of items) {
                const column = document.createElement('div');
                column.className = 'col-12 col-md-6 col-lg-4';
                const article = document.createElement('article');
                article.className = 'card resource-card h-100';
                const image = document.createElement('img');
                image.className = 'card-img-top';
                image.src = item.image;
                image.alt = item.alt;
                image.loading = 'lazy';
                const body = document.createElement('div');
                body.className = 'card-body d-flex flex-column';
                const title = document.createElement('h3');
                title.id = item.id;
                title.className = 'card-title h5';
                title.textContent = item.title;
                const text = document.createElement('p');
                text.className = 'card-text';
                text.textContent = item.text;
                const link = document.createElement('a');
                link.className = 'btn btn-primary mt-auto';
                link.href = item.href;
                link.textContent = item.action;
                body.append(title, text, link);
                article.append(image, body);
                column.append(article);
                fragment.append(column);
            }
            container.replaceChildren(fragment);
            document.getElementById('resource-count').textContent = `${items.length} campus resource${items.length === 1 ? '' : 's'}`;
            filters.querySelectorAll('[data-category]').forEach(button => {
                button.setAttribute('aria-pressed', String(button.dataset.category === category));
            });
            if (animate) animateEntrance(container);
        }
    };
    filters.addEventListener('click', event => {
        const button = event.target.closest('button[data-category]');
        if (button) catalog.render(button.dataset.category);
    });
    // A category link must still reach a card hidden by a previous filter.
    function revealHash() {
        const id = window.location.hash.slice(1);
        if (catalog.items.some(item => item.id === id)) {
            catalog.render('all', false);
            document.getElementById(id).scrollIntoView({ block: 'start' });
        }
    }
    document.querySelectorAll('.resource-sidebar a').forEach(link => {
        link.addEventListener('click', () => catalog.render('all', false));
    });
    window.addEventListener('hashchange', revealHash);
    catalog.render('all', false);
    filters.hidden = false;
    revealHash();
}

function setupSound() {
    const button = document.getElementById('play-notification');
    if (!button) return;
    const status = document.getElementById('sound-status');
    let context;
    let playing = false;
    button.addEventListener('click', async () => {
        if (playing) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) { status.textContent = 'Audio is unavailable in this browser.'; return; }
        playing = true;
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
        let oscillator;
        let gain;
        try {
            context = context || new AudioContextClass();
            await context.resume();
            if (context.state !== 'running') throw new Error('Audio is suspended');
            oscillator = context.createOscillator();
            gain = context.createGain();
            oscillator.connect(gain);
            gain.connect(context.destination);
            const start = context.currentTime;
            oscillator.frequency.setValueAtTime(660, start);
            oscillator.frequency.setValueAtTime(880, start + 0.12);
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
            gain.gain.linearRampToValueAtTime(0, start + 0.3);
            status.textContent = 'Playing campus notification…';
            await new Promise(resolve => {
                oscillator.onended = resolve;
                oscillator.start(start);
                oscillator.stop(start + 0.32);
            });
            status.textContent = 'Notification played. You can play it again.';
        } catch {
            status.textContent = 'Sound could not play. Check browser audio permissions and try again.';
        } finally {
            if (oscillator) oscillator.disconnect();
            if (gain) gain.disconnect();
            playing = false;
            button.disabled = false;
            button.removeAttribute('aria-busy');
        }
    });
    window.addEventListener('pagehide', () => { if (context) context.close().catch(() => {}); });
}

setupTheme();
setupGreeting();
setupKeyboardNavigation();
setupWizard();
setupResourceCatalog();
setupSound();
