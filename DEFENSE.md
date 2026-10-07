# Campus Life: defense notes

## Explain the implementation

**HTML:** `header`, `nav`, `main`, `section`, `article` and `footer` describe the page structure. `aria-labelledby` connects a section to its heading. `alt` describes an image, and `label for` connects a form label to its input's `id`.

**Bootstrap:** `container → row → col` creates the responsive grid. `col-12 col-md-6 col-lg-4` means full width below 768px, half width from 768px and one third from 992px. `navbar-expand-lg` collapses navigation below 992px. The JavaScript bundle activates the navbar and carousel through `data-bs-*` attributes.

**CSS:** `css/style.css` defines shared colors, typography, panels, images, button styling and responsive adjustments. The home cards use custom Flexbox and media queries: one column on phones, two from 576px and three from 992px. This preserves an example of responsiveness implemented without the Bootstrap grid.

**Flexbox:** `d-flex flex-column min-vh-100` on the body and `mt-auto` on the footer keep short pages full-height. Card bodies use a column layout and `mt-auto` to align their buttons even when descriptions have different lengths.

**JavaScript:** `js/site.js` listens for submit and reset on the contact form. Native `required` and `type="email"` validation runs first. `preventDefault()` stops the browser from posting to GitHub Pages, which cannot handle a form server. The `role="status"` area announces the result. The demonstration does not send a message.

## Practice small live modifications

1. Change a heading inside its HTML tag and refresh.
2. Change a button from `btn-primary` to `btn-outline-primary`.
3. Change a Bootstrap column from `col-lg-4` to `col-lg-6` and explain the desktop width change.
4. Change `mb-4` to `mb-5` to increase bottom spacing.
5. Change a shared color variable in `:root` and find where it is used.
6. Add a resource card inside the existing `row`, preserving its column wrapper and heading hierarchy.
7. Explain why removing `required` allows an empty field, and restore it.

## Before submission

Review four pages at mobile, tablet and desktop widths. Open the mobile menu, navigate through every page, cycle carousel slides, submit an invalid and valid form, reset it, and tab through links and fields. Confirm the deployed GitHub Pages URL and replace any example contacts if you intend them to be real.
