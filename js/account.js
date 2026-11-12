'use strict';

(() => {
    const accountPrefix = 'campus-life-account:';
    const sessionKey = 'campus-life-account-session';
    const emailRule = { type: 'email', maxLength: 254 };
    const passwordRule = { type: 'password', minLength: 8, maxLength: 128, complexity: true };
    const signupRules = {
        'signup-name': { maxLength: 80 },
        'signup-email': emailRule,
        'signup-phone': { type: 'phone', maxLength: 32 },
        'signup-password': passwordRule,
        'signup-confirm': { type: 'password', match: 'signup-password' }
    };
    const loginRules = {
        'login-email': emailRule,
        'login-password': passwordRule
    };

    function readAccount(email) {
        return email ? JSON.parse(localStorage.getItem(accountPrefix + email)) : null;
    }

    function currentAccount() {
        return readAccount(localStorage.getItem(sessionKey));
    }

    // This local demo stores a salted password verifier. Real authentication needs a server.
    async function deriveVerifier(password, salt) {
        const key = await crypto.subtle.importKey(
            'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
        );
        const bits = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', salt: new Uint8Array(salt), iterations: 200000, hash: 'SHA-256' },
            key,
            256
        );
        return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, '0')).join('');
    }

    function formMessage(status, message, isError = false) {
        status.textContent = message;
        status.classList.toggle('alert', isError);
        status.classList.toggle('alert-danger', isError);
    }

    function setupAccountForm(form, rules, pendingMessage, submit) {
        const status = form.querySelector('.form-status');
        const button = form.querySelector('button[type="submit"]');
        form.addEventListener('submit', async event => {
            event.preventDefault();
            if (button.disabled) return;

            const fields = Object.keys(rules).map(id => validationField(form, id, rules[id]));
            if (fields.includes(null)) {
                formMessage(status, 'A form field is unavailable. Reload the page and try again.', true);
                return;
            }

            let firstInvalid;
            for (const field of fields) {
                const rule = rules[field.id];
                if (rule.type !== 'password') field.value = field.value.trim();
                const message = fieldError(field, rule, form, rules);
                showFieldError(field, message);
                if (message && !firstInvalid) firstInvalid = field;
            }
            if (firstInvalid) {
                formMessage(status, 'Check the highlighted fields.', true);
                firstInvalid.focus();
                return;
            }

            button.disabled = true;
            formMessage(status, pendingMessage);
            try {
                const error = await submit(new FormData(form));
                formMessage(status, error || '', Boolean(error));
            } catch {
                formMessage(status, 'The account could not be processed. Check that browser storage is enabled and try again.', true);
            } finally {
                button.disabled = false;
            }
        });

        form.addEventListener('input', event => {
            const field = event.target;
            if (field.getAttribute('aria-invalid') === 'true') {
                showFieldError(field, fieldError(field, rules[field.id], form, rules));
            }
        });
    }

    function setupAccountPage(forms) {
        const signup = document.getElementById('signup-form');
        const login = document.getElementById('login-form');
        const notice = document.getElementById('login-notice');
        const unavailable = document.getElementById('account-unavailable');
        const loginLink = document.querySelector('[data-login-link]');
        const profileLink = document.querySelector('[data-active-profile]');

        setupAccountForm(signup, signupRules, 'Creating your account…', async values => {
            const email = values.get('email').toLowerCase();
            const duplicateMessage = 'An account already exists for this email. Log in with that account.';
            if (readAccount(email)) return duplicateMessage;
            const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)));
            const verifier = await deriveVerifier(values.get('password'), salt);
            // Another tab may have registered this address while Web Crypto was running.
            if (readAccount(email)) return duplicateMessage;
            const account = {
                name: values.get('name'),
                email,
                phone: values.get('phone'),
                salt,
                verifier
            };
            localStorage.setItem(accountPrefix + email, JSON.stringify(account));
            signup.reset();
            login.elements.email.value = email;
            login.elements.password.value = '';
            showFieldError(login.elements.email, '');
            showFieldError(login.elements.password, '');
            formMessage(login.querySelector('.form-status'), '');
            notice.textContent = 'Account created. Log in to open your profile.';
            notice.hidden = false;
            login.elements.password.focus();
        });

        setupAccountForm(login, loginRules, 'Checking your details…', async values => {
            const account = readAccount(values.get('email').toLowerCase());
            if (!account || await deriveVerifier(values.get('password'), account.salt) !== account.verifier) {
                return 'The email or password does not match an account on this device.';
            }
            localStorage.setItem(sessionKey, account.email);
            login.reset();
            window.location.assign('profile.html');
        });

        function renderAccountPage() {
            try {
                const signedIn = Boolean(currentAccount());
                if (!signedIn && !globalThis.crypto?.subtle) {
                    unavailable.textContent = 'Open the account demo over HTTPS or on a localhost server.';
                    unavailable.hidden = false;
                    return;
                }
                forms.hidden = signedIn;
                loginLink.hidden = signedIn;
                profileLink.hidden = !signedIn;
                unavailable.hidden = true;
            } catch {
                forms.hidden = true;
                loginLink.hidden = true;
                profileLink.hidden = true;
                unavailable.textContent = 'Enable browser storage to use the account demo.';
                unavailable.hidden = false;
            }
        }

        renderAccountPage();
        window.addEventListener('pageshow', renderAccountPage);
        window.addEventListener('storage', renderAccountPage);
    }

    function setupProfilePage(details) {
        const guest = document.getElementById('profile-guest');
        const guestStatus = document.getElementById('profile-guest-status');
        const logoutStatus = document.getElementById('logout-status');
        const fields = details.querySelectorAll('[data-profile-field]');

        function renderProfile() {
            let account = null;
            try {
                account = currentAccount();
                formMessage(guestStatus, '');
            } catch {
                formMessage(guestStatus, 'Profile details are unavailable. Check that browser storage is enabled.', true);
            }
            for (const field of fields) {
                field.textContent = account?.[field.dataset.profileField] || '';
            }
            details.hidden = !account;
            guest.hidden = Boolean(account);
        }

        document.getElementById('logout-button').addEventListener('click', () => {
            try {
                localStorage.removeItem(sessionKey);
                renderProfile();
                window.location.assign('account.html#log-in');
            } catch {
                formMessage(logoutStatus, 'Could not log out. Check that browser storage is enabled.', true);
            }
        });

        renderProfile();
        window.addEventListener('pageshow', renderProfile);
        window.addEventListener('storage', renderProfile);
    }

    const forms = document.getElementById('account-forms');
    const profile = document.getElementById('profile-details');
    if (forms) setupAccountPage(forms);
    if (profile) setupProfilePage(profile);
})();
