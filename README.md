# Campus Life

A responsive student guide built for the Web Technologies final project at Astana IT University. It brings together study advice, campus resources, a student community, a contact form and a demo student account.

## Pages and team

- `index.html` — home and study/resource introductions; Yessetaiuly Inal.
- `about.html` — team, mission and campus photo carousel; Yessetaiuly Inal.
- `resources.html` — resource cards, category links, study tips and directory; Nurkeldi Baizhigit.
- `contact.html` — sample campus directory and contact form for the project team; Nurkeldi Baizhigit.
- `account.html` — demo registration and login with inline validation.
- `profile.html` — signed-in student details and logout.

Both members should understand and review all shared changes before defending the project.

## Technologies

Semantic HTML5, custom CSS, Bootstrap 5.3.8, JavaScript and jQuery 4.0.0. Bootstrap CSS, its JavaScript bundle and its MIT license are included in `vendor/bootstrap/`. The site requests jQuery from its official CDN and falls back to the identical copy in vendor/jquery. No build or package installation is required.

## Project structure

| Location | Contents |
| --- | --- |
| Root | Six HTML pages and this README |
| `css/style.css` | Layout, components and theme variables |
| `js/site.js` | Shared validation, FAQ, newsletter and clock |
| `js/assignment5.js` | Theme, keyboard navigation, resource categories and contact form steps |
| `js/script.js` | jQuery search, scroll progress, counters, form feedback and gallery loading |
| `js/account.js` and `js/books.js` | Demo account and book catalog search |
| `images/` and `vendor/` | Site imagery and bundled libraries |
| `tests/`, `scripts/` and `output/` | Browser checks, report generator and earlier assignment evidence |

## Run locally

Open `index.html` in a browser, or run `python3 -m http.server 8000` from the project directory and visit http://localhost:8000. Use the local server for testing the Copy buttons because clipboard access depends on browser permissions.

## GitHub Pages

1. Commit and push the project files to the repository.
2. In GitHub, open **Settings → Pages**.
3. Choose **Deploy from a branch**, then the branch containing these files and **/(root)**. Save.
4. Wait for deployment to finish and copy the URL shown by GitHub into your submission.

Project URL: https://inalesetaiuly.github.io/web-technology_project/

GitHub Pages hosts the project at this URL. Updates are published by pushing the project files to the shared repository and allowing the Pages deployment to finish. All local links use relative paths, including case-sensitive image filenames, so they work under the repository subdirectory.

## Assignment 4: JavaScript components

| Task | Page / UI | Main JavaScript |
| --- | --- | --- |
| 1. Form validation | Contact → Get in Touch | `fieldError()`, `showFieldError()`, `setupValidation()` |
| 2. FAQ accordion | Resources → Frequently Asked Questions | `.faq-toggle` click listeners and `Element.animate()` |
| 3. Subscription popup | Contact → Campus Newsletter | `showModal()`, `close()`, backdrop detection |
| 4. Background color | Home → A moment for your day | color array, index and `body.style.backgroundColor` |
| 5. Current date/time | Home → A moment for your day | `new Date()`, `Intl.DateTimeFormat`, `setInterval()` |

Every HTML page links `vendor/bootstrap/bootstrap.bundle.min.js` and `js/site.js` using `defer`. Guards skip components that are absent on a particular page. Both team members are named in every footer. Group: **SE-2508**.

The work continues the shared commit `43bb43a`: the original FAQ, subscription popup and contact validation were retained and extended. Both members should review the final changes and be able to demonstrate at least one JavaScript component.

## Behavior and limitations

- Navigation collapses below Bootstrap's `lg` breakpoint; the toggler and carousel use Bootstrap's bundle.
- Resource categories jump to relevant content on the same page.
- The carousel is manually controlled and does not auto-advance.
- Contact and subscription validation rules are defined in JavaScript (`contactRules` and `subscriptionRules`). The forms use `novalidate` to show errors alongside their fields. Contact checks the required fields, email format, optional phone number and selected topic. The newsletter subscription is a local demo.
- FAQ answers are hidden initially and animate open/closed over 240ms. Keyboard activation and reduced-motion preferences are supported.
- The subscription dialog opens from Subscribe, checks name/email, and closes using the close button, Escape or the backdrop. Focus returns to Subscribe.
- The background button cycles through four predefined colors; the clock updates every second in the visitor's device timezone.
- The campus directory, phone numbers and emails are sample project content, not verified university contacts. Replace them with confirmed details before using the site as a real service.
- Photos are existing project assets. The team should confirm their permission to publish these images.

## Accessibility and layout

Each page has a skip link, one main heading, semantic sections, a labeled navigation, current-page indication and descriptive image alternatives. Forms have visible labels. Tables scroll inside their containers on narrow screens. Keyboard focus remains visible, and motion preferences are respected.

## Assignment 5: advanced JavaScript and DOM

| Requirement | Feature / implementation |
| --- | --- |
| DOM selection, content, attributes and styling | Personal greeting, dynamic resource cards, theme / ARIA updates |
| Dynamic styling | Day/night theme on all pages; saved preference in localStorage |
| One manipulation option | Personalized greeting on Home (safe textContent; submit/Enter) |
| Click and keyboard listeners | Theme, filters, sound, greeting; arrow/Home/End navigation |
| Callback option | Three-step Contact form; createStepController(total, onStepChange) |
| Switch | Resource categories and arrow-key navigation |
| Objects and methods | catalog.items, filterByCategory(), render() |
| Arrays, loops, higher-order functions | Array of resource objects; for...of; filter()/forEach() |
| Sound | User-triggered Web Audio signal with overlap guard and cleanup |
| Event-triggered animations | Greeting, cards and form steps; reduced motion supported |
| Separation | HTML markup, css/style.css, js/site.js and js/assignment5.js |

On Contact, Next validates the current step and opens a review before sending. The final submission validates the fields again. Back retains input and Reset returns to the first step. The background control applies only in day mode.

New code is in `js/assignment5.js`, loaded after the shared `js/site.js`. Run the browser regression suite with Playwright installed: `node tests/assignment5.cjs`. Optional `PLAYWRIGHT_MODULE` and `CHROME_EXECUTABLE` select existing local installations; no npm dependency is required to run the website itself. The suite starts a local server, checks the UI at 390/768/1440px, validates failure cases and captures actual browser evidence in `output/assignment5/evidence/`. Set `TEST_BASE_URL` to test a deployed copy after publication.

Earlier submission artifacts are in `output/pdf/` and `output/assignment5/`.

## Assignment 6: jQuery

- Resources: type a title or description keyword. Suggestions are selectable with the mouse or keyboard. The results combine search and the current category, and matching terms are highlighted.
- Home: scroll to see the reading progress and reload to replay the number counters.
- Contact: the submit button displays a spinner during the request and a success toast after Formspree accepts it. Use Copy beside an email address to test clipboard feedback.
- About: scroll to Campus Moments and move between slides. Gallery images load when their slides enter the viewport.

The jQuery behavior is in `js/script.js`.

## Contact delivery

The contact form posts validated fields to the Formspree endpoint in `contact.html`. Review the configured **Target Email** in the Formspree dashboard to confirm where notifications go. The browser suite intercepts Formspree requests so automated checks do not send emails.

## Demo account

Open Account, register with sample details, then log in to open Profile. Use HTTPS or the localhost server for browser password verification. `js/account.js` stores the name, email, phone and a salted password verifier in localStorage. Logout clears the active session. The demo works within the same browser and site address. Use sample details and a password you do not use elsewhere.

## Open Library search

On Resources, open **Find books**, enter a title or author, and submit. `js/books.js` requests up to five books from the public Open Library Search API. If Open Library fails, it tries the US Apple Books catalog through Apple's public Search API. The result message identifies the source. An internet connection is required for new searches.
