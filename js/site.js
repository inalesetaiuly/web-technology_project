'use strict';

// Task 1: keep validation rules in JavaScript, independent of HTML attributes.
const contactRules = {
    fullname: { label: 'Full Name' },
    email: { label: 'Email', type: 'email' },
    subject: { label: 'Subject' },
    category: {
        label: 'Topic / Department', tagName: 'SELECT',
        choices: ['general', 'it_support', 'library', 'academic', 'feedback']
    },
    password: { label: 'Practice password', type: 'password', minLength: 8 },
    'confirm-password': { label: 'Confirm practice password', type: 'password', match: 'password' },
    message: { label: 'Message', tagName: 'TEXTAREA' }
};
const subscriptionRules = {
    'subscriber-name': { label: 'Name' },
    'subscriber-email': { label: 'Email', type: 'email' }
};

function validationField(form, id, rule) {
    // Re-read the live form: a deleted, duplicated or disabled field is invalid.
    const matches = form.querySelectorAll(`[id="${id}"]`);
    if (matches.length !== 1) return null;
    const field = matches[0];
    if (field.form !== form || field.matches(':disabled') ||
        field.tagName !== (rule.tagName || 'INPUT')) return null;
    return field;
}

function fieldError(field, rule, form, rules) {
    const value = rule.type === 'password' ? field.value : field.value.trim();
    if (value.trim() === '') {
        return rule.tagName === 'SELECT' ? 'Choose a topic / department.' : 'This field is required.';
    }
    if (rule.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Enter a valid email, for example student@example.com.';
    }
    if (rule.minLength && value.length < rule.minLength) {
        return `Use at least ${rule.minLength} characters.`;
    }
    if (rule.choices && !rule.choices.includes(value)) {
        return 'Choose a valid topic / department.';
    }
    if (rule.match) {
        const original = validationField(form, rule.match, rules[rule.match]);
        if (!original) return 'The password field is missing or unavailable. Reload the page.';
        if (value !== original.value) return 'Passwords do not match.';
    }
    return '';
}

function showFieldError(field, message) {
    const error = document.getElementById(`${field.id}-error`);
    field.classList.toggle('is-invalid', Boolean(message));
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
    if (error) {
        error.textContent = message;
        error.hidden = !message;
    }
}

function setupValidation(form, status, rules, successMessage) {
    if (!form || !status) return;
    let submitted = false;
    function clearStatus() {
        status.textContent = '';
        status.classList.remove('alert', 'alert-success', 'alert-danger');
    }
    form.addEventListener('submit', (event) => {
        // This static demonstration does not send form data to a server.
        event.preventDefault();
        submitted = true;
        clearStatus();
        let firstInvalid = null;
        const unavailable = [];
        Object.entries(rules).forEach(([id, rule]) => {
            const field = validationField(form, id, rule);
            if (!field) {
                unavailable.push(rule.label);
                return;
            }
            if (rule.type !== 'password') field.value = field.value.trim();
            const message = fieldError(field, rule, form, rules);
            showFieldError(field, message);
            if (message && !firstInvalid) firstInvalid = field;
        });
        if (unavailable.length || firstInvalid) {
            status.textContent = unavailable.length
                ? `Required fields are missing or unavailable: ${unavailable.join(', ')}. Reload the page and try again.`
                : 'Please correct the highlighted fields and try again.';
            status.classList.add('alert', 'alert-danger');
            if (firstInvalid) {
                form.dispatchEvent(new CustomEvent('validation-error', { detail: { field: firstInvalid } }));
                firstInvalid.focus();
            }
            return;
        }
        status.textContent = successMessage;
        status.classList.add('alert', 'alert-success');
        // Passwords are compared only in memory and never stored or logged.
        Object.entries(rules).forEach(([id, rule]) => {
            if (rule.type === 'password') validationField(form, id, rule).value = '';
        });
        submitted = false;
    });
    // Delegation also handles a field that is replaced after the page has loaded.
    const recheck = (event) => {
        const field = event.target;
        const rule = rules[field.id];
        if (!Object.hasOwn(rules, field.id) || validationField(form, field.id, rule) !== field) return;
        clearStatus();
        if (submitted || field.hasAttribute('aria-invalid')) {
            showFieldError(field, fieldError(field, rule, form, rules));
        }
        Object.entries(rules).forEach(([id, dependentRule]) => {
            if (dependentRule.match !== field.id) return;
            const dependent = validationField(form, id, dependentRule);
            if (dependent && (submitted || dependent.hasAttribute('aria-invalid'))) {
                showFieldError(dependent, fieldError(dependent, dependentRule, form, rules));
            }
        });
    };
    form.addEventListener('input', recheck);
    form.addEventListener('change', recheck);
    form.addEventListener('reset', () => {
        submitted = false;
        clearStatus();
        Object.entries(rules).forEach(([id, rule]) => {
            const field = validationField(form, id, rule);
            if (field) showFieldError(field, '');
        });
    });
}

setupValidation(document.querySelector('#contact-form'), document.querySelector('#form-status'), contactRules,
    'All fields are valid and the passwords match. Demo complete: no account was created and no message was sent or stored.');
setupValidation(document.querySelector('#subscription-form'), document.querySelector('#subscription-status'), subscriptionRules,
    'Subscription details are valid. Demo complete: no subscription was sent or stored.');

// Task 2: extend the existing FAQ toggle with a smooth open/close transition.
document.querySelectorAll('.faq-toggle').forEach((button) => {
    const answer = document.getElementById(button.getAttribute('aria-controls'));
    if (!answer) return;
    let animation = null;
    button.addEventListener('click', () => {
        const opening = button.getAttribute('aria-expanded') !== 'true';
        const startHeight = answer.hidden ? 0 : answer.getBoundingClientRect().height;
        if (animation) animation.cancel();
        button.setAttribute('aria-expanded', String(opening));
        answer.hidden = false;
        answer.inert = !opening;
        const endHeight = opening ? answer.scrollHeight : 0;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            answer.hidden = !opening;
            return;
        }
        animation = answer.animate(
            [{ height: `${startHeight}px`, opacity: opening ? 0 : 1 },
                { height: `${endHeight}px`, opacity: opening ? 1 : 0 }],
            { duration: 240, easing: 'ease-in-out' }
        );
        animation.onfinish = () => {
            answer.hidden = !opening;
            animation = null;
        };
    });
});

// Task 3: retain the subscription dialog; support close, backdrop and Escape.
const popup = document.querySelector('#subscribe-popup');
const openPopupButton = document.querySelector('#open-popup');
const closePopupButton = document.querySelector('#close-popup');
if (popup && openPopupButton && closePopupButton) {
    openPopupButton.addEventListener('click', () => {
        document.querySelector('#subscription-form').reset();
        popup.showModal();
    });
    closePopupButton.addEventListener('click', () => popup.close());
    let startedOnBackdrop = false;
    popup.addEventListener('pointerdown', (event) => {
        const box = popup.getBoundingClientRect();
        startedOnBackdrop = event.target === popup && (
            event.clientX < box.left || event.clientX > box.right ||
            event.clientY < box.top || event.clientY > box.bottom
        );
    });
    popup.addEventListener('click', (event) => {
        const box = popup.getBoundingClientRect();
        if (startedOnBackdrop && event.target === popup && (
            event.clientX < box.left || event.clientX > box.right ||
            event.clientY < box.top || event.clientY > box.bottom
        )) popup.close();
        startedOnBackdrop = false;
    });
    popup.addEventListener('close', () => openPopupButton.focus());
    // Native <dialog> handles Escape and keeps keyboard focus in the modal.
}

// Task 4: cycle through readable, predefined page background colors.
const backgroundButton = document.querySelector('#change-background');
if (backgroundButton) {
    const backgrounds = [
        { name: 'Warm paper', color: '#f5f6f2' },
        { name: 'Morning blue', color: '#e7f0fa' },
        { name: 'Garden mint', color: '#e5f2eb' },
        { name: 'Soft lavender', color: '#efebf8' }
    ];
    let backgroundIndex = 0;
    backgroundButton.addEventListener('click', () => {
        if (document.documentElement.dataset.bsTheme === 'dark') {
            document.querySelector('#background-status').textContent = 'Switch to Day theme to choose a light background.';
            return;
        }
        backgroundIndex = (backgroundIndex + 1) % backgrounds.length;
        const background = backgrounds[backgroundIndex];
        document.body.style.setProperty('--day-background', background.color);
        document.querySelector('#background-status').textContent = `Background: ${background.name}`;
    });
}

// Task 5: display local time immediately, then refresh every second.
const clock = document.querySelector('#current-datetime');
if (clock) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
    });
    function updateClock() {
        const now = new Date();
        clock.dateTime = now.toISOString();
        clock.textContent = formatter.format(now);
    }
    document.querySelector('#clock-zone').textContent = `Time zone: ${formatter.resolvedOptions().timeZone}`;
    updateClock();
    window.setInterval(updateClock, 1000);
}
