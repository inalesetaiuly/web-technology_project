// GitHub Pages has no server to receive form submissions.
const form = document.querySelector('#contact-form');
const status = document.querySelector('#form-status');
if (form && status) {
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Native HTML validation runs before this event.
        status.textContent = 'Your message passes validation. This is a demo: nothing has been sent or stored.';
        status.classList.add('alert', 'alert-success');
    });
    form.addEventListener('reset', () => {
        status.textContent = '';
        status.classList.remove('alert', 'alert-success');
    });
}
