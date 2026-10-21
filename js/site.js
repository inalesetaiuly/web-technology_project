// GitHub Pages has no server to receive form submissions.
const form = document.querySelector('#contact-form');
const status = document.querySelector('#form-status');
if (form && status) {
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        form.querySelectorAll('input[required], textarea[required]').forEach((field) => {
            field.value = field.value.trim();
        });
        if (!form.checkValidity()) {
            status.textContent = '';
            status.classList.remove('alert', 'alert-success');
            form.reportValidity();
            return;
        }
        status.textContent = 'Your message passes validation. This is a demo: nothing has been sent or stored.';
        status.classList.add('alert', 'alert-success');
    });
    form.addEventListener('reset', () => {
        status.textContent = '';
        status.classList.remove('alert', 'alert-success');
    });
}
const faqButtons = document.querySelectorAll('.faq-toggle');

faqButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const answerId = button.getAttribute('aria-controls');
        const answer = document.getElementById(answerId);
        const isOpen = button.getAttribute('aria-expanded') === 'true';

        answer.hidden = isOpen;
        button.setAttribute('aria-expanded', String(!isOpen));
    });
});
const popup = document.querySelector('#subscribe-popup');
const openPopupButton = document.querySelector('#open-popup');
const closePopupButton = document.querySelector('#close-popup');

if (popup && openPopupButton && closePopupButton) {
    openPopupButton.addEventListener('click', () => {
        popup.showModal();
    });

    closePopupButton.addEventListener('click', () => {
        popup.close();
    });
}
