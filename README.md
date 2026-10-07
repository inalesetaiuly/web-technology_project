# Campus Life

A responsive student guide built for the Web Technologies final project at Astana IT University. It brings together study advice, campus resources, a student team profile and a contact form demonstration.

## Pages and team

- `index.html` — home and study/resource introductions; Yessetaiuly Inal.
- `about.html` — team, mission and campus photo carousel; Yessetaiuly Inal.
- `resources.html` — resource cards, category links, study tips and directory; Nurkeldi Baizhigit.
- `contact.html` — sample contact directory and validated demo form; Nurkeldi Baizhigit.

This retains two HTML pages for each team member. Both members should understand and review all shared changes before defending the project.

## Technologies

Semantic HTML5, custom CSS, Bootstrap 5.3.8 and a small vanilla JavaScript form handler. Bootstrap CSS and its bundle load from jsDelivr, so an internet connection is required for Bootstrap styling and interactive components.

## Run locally

Open `index.html` in a browser, or run `python3 -m http.server 8000` from the project directory and visit http://localhost:8000. No build or package installation is required.

## GitHub Pages

1. Commit and push the project files to the repository.
2. In GitHub, open **Settings → Pages**.
3. Choose **Deploy from a branch**, then the branch containing these files and **/(root)**. Save.
4. Wait for deployment to finish and copy the URL shown by GitHub into your submission.

Expected project URL after successful deployment: https://inalesetaiuly.github.io/web-technology_project/

All project links use relative paths, including case-sensitive image filenames, so they work under the repository subdirectory. The expected URL is not confirmation of a deployed site.

## Behavior and limitations

- Navigation collapses below Bootstrap's `lg` breakpoint; the toggler and carousel use Bootstrap's bundle.
- Resource categories jump to relevant content on the same page.
- The carousel is manually controlled and does not auto-advance.
- Contact fields use native browser validation. A valid submission displays an accessible status message without navigating or transmitting data. Reset clears both fields and status.
- The campus directory, phone numbers and emails are sample project content, not verified university contacts. Replace them with confirmed details before using the site as a real service.
- Photos are existing project assets. The team should confirm their permission to publish these images.

## Accessibility and layout

Each page has a skip link, one main heading, semantic sections, a labeled navigation, current-page indication and descriptive image alternatives. Forms have visible labels. Tables scroll inside their containers on narrow screens. Keyboard focus remains visible, and motion preferences are respected.

See `DEFENSE.md` for explanations and live-edit practice.
