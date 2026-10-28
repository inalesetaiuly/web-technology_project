# Campus Life

A responsive student guide built for the Web Technologies final project at Astana IT University. It brings together study advice, campus resources, a student team profile and a contact form demonstration.

## Pages and team

- `index.html` — home and study/resource introductions; Yessetaiuly Inal.
- `about.html` — team, mission and campus photo carousel; Yessetaiuly Inal.
- `resources.html` — resource cards, category links, study tips and directory; Nurkeldi Baizhigit.
- `contact.html` — sample contact directory and validated demo form; Nurkeldi Baizhigit.

This retains two HTML pages for each team member. Both members should understand and review all shared changes before defending the project.

## Technologies

Semantic HTML5, custom CSS, Bootstrap 5.3.8 and vanilla JavaScript. Bootstrap CSS, its JavaScript bundle and its MIT license are included in `vendor/bootstrap/`. All runtime assets are local; no package installation or internet connection is required to run the downloaded project.

## Run locally

Open `index.html` in a browser, or run `python3 -m http.server 8000` from the project directory and visit http://localhost:8000. No build or package installation is required.

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

The work continues the shared commit `43bb43a`: the original FAQ, subscription popup and contact validation were retained and extended. This revision adds inline validation (including password length and confirmation), animation, backdrop closing, the background switcher, the clock, and consistent integration. Both members should review the final changes and be able to demonstrate at least one JavaScript component.

## Behavior and limitations

- Navigation collapses below Bootstrap's `lg` breakpoint; the toggler and carousel use Bootstrap's bundle.
- Resource categories jump to relevant content on the same page.
- The carousel is manually controlled and does not auto-advance.
- Contact and subscription validation rules are defined in JavaScript (`contactRules` and `subscriptionRules`), independently of HTML `required`, `type`, `minlength` and `data-match` attributes. Each submission re-reads the expected fields: missing, duplicated or disabled controls block success. JavaScript checks non-empty values, email format, a minimum practice password length of 8, valid topics and exact confirmation matching. Whitespace-only values are rejected. `novalidate` allows our inline messages instead of native browser bubbles. A valid submission displays an accessible status message without navigating or transmitting data. Reset clears both fields and status. Practice passwords are cleared after successful validation; do not enter real credentials. This is client-side validation; a real service must also validate requests on the server.
- FAQ answers are hidden initially and animate open/closed over 240ms. Keyboard activation and reduced-motion preferences are supported.
- The subscription dialog opens from Subscribe, checks name/email, and closes using the close button, Escape or the backdrop. Focus returns to Subscribe.
- The background button cycles through four predefined colors; the clock updates every second in the visitor's device timezone.
- The campus directory, phone numbers and emails are sample project content, not verified university contacts. Replace them with confirmed details before using the site as a real service.
- Photos are existing project assets. The team should confirm their permission to publish these images.

## Accessibility and layout

Each page has a skip link, one main heading, semantic sections, a labeled navigation, current-page indication and descriptive image alternatives. Forms have visible labels. Tables scroll inside their containers on narrow screens. Keyboard focus remains visible, and motion preferences are respected.

See `DEFENSE_RU.md` for Assignment 4 explanations, a demonstration script and live-edit practice. `DEFENSE.md` retains the earlier HTML/Bootstrap notes.

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

Contact is a demo, not a real account or messaging endpoint. Next validates the current step; final submission validates all required fields using JavaScript rules. Back retains input and Reset returns to the first step. The old light-background control applies only in day mode. Only the theme is stored; no names, messages or passwords are persisted.

New code is in `js/assignment5.js`, loaded after the shared `js/site.js`. Run the browser regression suite with Playwright installed: `node tests/assignment5.cjs`. Optional `PLAYWRIGHT_MODULE` and `CHROME_EXECUTABLE` select existing local installations; no npm dependency is required to run the website itself. The suite starts a local server, checks the UI at 390/768/1440px, validates failure cases and captures actual browser evidence in `output/assignment5/evidence/`. Set `TEST_BASE_URL` to test a deployed copy after publication.

See `DEFENSE_ASSIGNMENT5_RU.md` for a demonstration sequence and detailed explanations. Submission artifacts are in `output/pdf/` and `output/assignment5/`. Human defense and LMS submission must be completed by each team member.
