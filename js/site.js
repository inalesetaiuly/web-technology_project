'use strict';

// Task 1: validate both demo forms with messages beside each field.
function fieldError(field) {
    const value = field.type === 'password' ? field.value : field.value.trim();
    if (field.required && value.trim() === '') {
        return field.tagName === 'SELECT' ? 'Choose a topic / department.' : 'This field is required.';
    }
    if (field.type === 'email' && (field.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) {
        return 'Enter a valid email, for example student@example.com.';
    }
    if (field.minLength > 0 && value.length < field.minLength) {
        return `Use at least ${field.minLength} characters.`;
    }
    if (field.dataset.match && value !== document.getElementById(field.dataset.match).value) {
        return 'Passwords do not match.';
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

function setupValidation(form, status, successMessage) {
    if (!form || !status) return;
    const fields = Array.from(form.querySelectorAll('[required]'));
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
        fields.forEach((field) => {
            if (field.type !== 'password') field.value = field.value.trim();
            const message = fieldError(field);
            showFieldError(field, message);
            if (message && !firstInvalid) firstInvalid = field;
        });
        if (firstInvalid) {
            status.textContent = 'Please correct the highlighted fields and try again.';
            status.classList.add('alert', 'alert-danger');
            firstInvalid.focus();
            return;
        }
        status.textContent = successMessage;
        status.classList.add('alert', 'alert-success');
        // Passwords are compared only in memory and never stored or logged.
        form.querySelectorAll('input[type="password"]').forEach((field) => { field.value = ''; });
        submitted = false;
    });
    fields.forEach((field) => {
        const recheck = () => {
            clearStatus();
            if (submitted || field.hasAttribute('aria-invalid')) showFieldError(field, fieldError(field));
            if (field.id === 'password' && submitted) {
                const confirmation = form.querySelector('[data-match="password"]');
                if (confirmation) showFieldError(confirmation, fieldError(confirmation));
            }
        };
        field.addEventListener('input', recheck);
        field.addEventListener('change', recheck);
    });
    form.addEventListener('reset', () => {
        submitted = false;
        clearStatus();
        fields.forEach((field) => showFieldError(field, ''));
    });
}

setupValidation(document.querySelector('#contact-form'), document.querySelector('#form-status'),
    'All fields are valid and the passwords match. Demo complete: no account was created and no message was sent or stored.');
setupValidation(document.querySelector('#subscription-form'), document.querySelector('#subscription-status'),
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
        backgroundIndex = (backgroundIndex + 1) % backgrounds.length;
        const background = backgrounds[backgroundIndex];
        document.body.style.backgroundColor = background.color;
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
