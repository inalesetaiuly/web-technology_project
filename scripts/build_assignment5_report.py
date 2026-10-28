"""Build the submission PDF from actual Playwright screenshots and test results."""
import json
from pathlib import Path
from xml.sax.saxutils import escape

from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / 'output/assignment5/evidence'
OUTPUT = ROOT / 'output/pdf/Campus_Life_Assignment_5_Report.pdf'
RESULTS = json.loads((ROOT / 'output/assignment5/test-results.json').read_text())
NAVY = colors.HexColor('#0b2545')
TEAL = colors.HexColor('#235b67')
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='Cover', fontName='Helvetica-Bold', fontSize=30, leading=35, textColor=NAVY, spaceAfter=12))
styles.add(ParagraphStyle(name='Title5', fontName='Helvetica-Bold', fontSize=20, leading=25, textColor=NAVY, spaceAfter=12))
styles.add(ParagraphStyle(name='Body5', fontName='Helvetica', fontSize=10, leading=14, spaceAfter=8, textColor=colors.HexColor('#14213d')))
styles.add(ParagraphStyle(name='Small5', fontName='Helvetica', fontSize=8, leading=11, spaceAfter=6, textColor=colors.HexColor('#465c69')))
styles.add(ParagraphStyle(name='Caption5', fontName='Helvetica-Oblique', fontSize=8, leading=11, spaceAfter=10, textColor=TEAL))
styles.add(ParagraphStyle(name='HeadCell5', fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=colors.white))
story = []

def text(value, style='Body5'):
    story.append(Paragraph(value, styles[style]))

def figure(name, caption, maxheight=83):
    path = EVIDENCE / (name + '.png')
    with PILImage.open(path) as image:
        width, height = image.size
    scale = min(174 * mm / width, maxheight * mm / height)
    story.append(Image(str(path), width=width * scale, height=height * scale))
    text(caption, 'Caption5')

def table(headers, rows, widths):
    cells = [[Paragraph(escape(h), styles['HeadCell5']) for h in headers]]
    cells.extend([[Paragraph(escape(str(cell)), styles['Small5']) for cell in row] for row in rows])
    result = Table(cells, colWidths=[value * mm for value in widths], repeatRows=1, hAlign='LEFT')
    result.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f0f5f8'), colors.white]),
        ('LINEBELOW', (0, 0), (-1, 0), .5, NAVY),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 7), ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ('TOPPADDING', (0, 0), (-1, -1), 7), ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
    ]))
    story.append(result)

def newpage(title):
    story.append(PageBreak())
    text(title, 'Title5')

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(TEAL)
    canvas.line(18 * mm, 15 * mm, 192 * mm, 15 * mm)
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(TEAL)
    canvas.drawString(18 * mm, 10 * mm, 'Campus Life | Assignment 5 | SE-2508')
    canvas.drawRightString(192 * mm, 10 * mm, str(doc.page))
    canvas.restoreState()

story.append(Spacer(1, 17 * mm))
text('CAMPUS LIFE', 'Cover')
text('Assignment 5', 'Cover')
text('Advanced JavaScript and DOM Manipulation', 'Title5')
text('Astana IT University - Web Technologies')
story.append(Spacer(1, 8 * mm))
table(['Submission details', 'Value'], [
    ('Team', 'Campus Life'),
    ('Members', 'Yessetaiuly Inal; Nurkeldi Baizhigit'),
    ('Group', 'SE-2508'),
    ('Date', '28 October 2026'),
    ('Repository', 'https://github.com/inalesetaiuly/web-technology_project'),
    ('Website', 'https://inalesetaiuly.github.io/web-technology_project/'),
    ('Local browser verification', f'{RESULTS["passed"]} automated checks passed in Chrome'),
], [43, 131])
story.append(Spacer(1, 10 * mm))
text('Objective', 'Title5')
text('Extend the existing student guide with meaningful DOM manipulation, event handling, reusable data structures, callbacks, sound and event-triggered animation. Preserve the previous assignment features and JavaScript validation rules.')
text('The report uses real screenshots captured from the implemented site in Chrome, together with screenshots of source excerpts. Form data is demonstration-only and is not transmitted or stored. Only the theme preference is persisted.')

newpage('1. Requirements and selected options')
text('The assignment offers alternatives. We selected Day/Night theme for dynamic styling, personalized greeting for content manipulation, and a multi-step form for the callback requirement. The remaining required concepts are implemented explicitly.')
table(['Criterion', 'Implementation', 'Weight'], [
    ('DOM manipulation and styling', 'Theme attribute/classes, greeting text, generated cards and ARIA states', '10%'),
    ('Event handling', 'Clicks, submit, keydown, callbacks and switch', '10%'),
    ('Data structures and functions', 'Catalog object/methods, array, for...of, filter(), modular functions', '10%'),
    ('Sound effects', 'User-triggered two-tone Web Audio notification; overlap guard', '5%'),
    ('Animations', 'Greeting, cards, step changes and theme transitions', '5%'),
    ('Clean code and structure', 'Separate HTML, CSS and external JavaScript files', '5%'),
    ('UX and engagement', 'Student-guide theme, keyboard access, responsive layout, reduced motion', '5%'),
    ('Defense', 'Demonstration and explanation guide; performed by students', '40%'),
    ('Report', 'Objective, implementation steps, code/UI screenshots and reflection', '10%'),
], [44, 112, 18])
story.append(Spacer(1, 8 * mm))
text('File structure', 'Title5')
text('index.html: greeting, clock, background and sound. resources.html: generated resource catalog and FAQ. contact.html: multi-step form and subscription dialog. about.html: team and carousel. css/style.css: visual rules and themes. js/site.js: shared validation and Assignment 4. js/assignment5.js: new components. tests/assignment5.cjs: repeatable browser checks.')

newpage('2. Day and night themes')
text('1. Add a theme button to every navbar. 2. Read the saved preference, or use the system color scheme. 3. Change data-bs-theme on the root HTML element. 4. Update button text and aria-pressed. 5. Save the selected theme in localStorage; handle unavailable storage without breaking the toggle.')
text('CSS variables cover page surfaces, text, cards, tables, forms, dialog, links and focus indicators. The old background-color control applies to day mode only, so it cannot override the dark background.')
figure('resources-dark', 'Figure 1. Actual Resources page in night theme.', 105)
figure('code-theme', 'Figure 2. Source screenshot: theme application and persistence.', 85)

newpage('3. Personalized greeting and DOM')
text('1. Select the greeting form and output by ID. 2. Listen for submit and prevent navigation. 3. Trim the name and validate non-empty input and a maximum length of 60 in JavaScript. 4. Write the welcome message using textContent. 5. Animate the updated message.')
text('Enter and the button use the same handler. HTML-looking input is shown as literal text rather than inserted as markup. The name is not persisted. Empty/whitespace-only input is rejected even if the HTML required attribute is removed.')
figure('greeting', 'Figure 3. A personalized greeting on the Home page.', 70)
figure('code-greeting', 'Figure 4. Source screenshot: input validation and safe DOM text update.', 115)

newpage('4. Keyboard events and navigation')
text('1. Attach keydown to the navbar link list. 2. Find the currently focused link. 3. Use switch(event.key) to choose a direction. 4. Calculate the next index using modulo so movement wraps. 5. Call focus() and prevent arrow-key scrolling.')
text('ArrowRight/ArrowDown move forward, ArrowLeft/ArrowUp move back, and Home/End choose the boundary items. Tab and Enter retain their native behavior. The mobile navbar must be opened before navigating its links.')
figure('code-keyboard', 'Figure 5. Source screenshot: switch-based arrow navigation.', 85)
figure('home-mobile', 'Figure 6. Actual Home page at a 390px viewport.', 60)

newpage('5. Multi-step form and callback')
text('1. Define three step objects with their field IDs. 2. Create a controller that stores the current index in a closure. 3. Pass onStepChange as a callback. 4. Next validates the current fields before calling goTo(). 5. Back changes the index without clearing inputs. 6. The callback shows the correct groups, updates progress and focuses the step label.')
text('The permitted multi-step option is used instead of an asynchronous POST. No backend or real account creation is claimed. Enter advances an intermediate step, while the last submit checks the complete JavaScript schema.')
figure('wizard-step2', 'Figure 7. Step 2 of 3 with Back/Next and a progress indicator.', 100)
figure('code-callback', 'Figure 8. Source screenshot: a controller invoking its callback.', 85)

newpage('6. Validation and failure cases')
text('Rules remain in contactRules rather than depending on required, type, minlength or data-match attributes. Every submission re-reads mandatory controls. Missing, duplicated or disabled controls block success. Earlier invalid fields cause their step to open before focus moves to the error.')
text('The final check rejects incomplete input, malformed email, invalid category, short passwords and mismatched confirmation. Successful validation clears practice passwords. Reset clears errors and restores step 1.')
figure('wizard-errors', 'Figure 9. Actual errors for a short password and different confirmation.', 96)
figure('wizard-success', 'Figure 10. Successful demo validation; no real data is sent.', 96)

newpage('7. Objects, arrays, loops and filtering')
text('1. Store resources as objects in catalog.items. 2. Use the filterByCategory() method and switch to select All, Study or Activities. 3. Use filter() with a predicate callback for category matching. 4. Iterate selected objects with for...of. 5. Create cards with createElement(), assemble a DocumentFragment and insert it with replaceChildren().')
text('The count updates with textContent and category buttons update aria-pressed. All shows 3 cards, Study shows 2 and Activities shows 1. Sidebar links restore all items before jumping to a resource, preserving existing navigation.')
figure('catalog-filtered', 'Figure 11. Actual catalog filtered to Activities with one result.', 100)
figure('code-catalog', 'Figure 12. Source screenshot: a method, switch and higher-order filter().', 80)

newpage('8. Sound, animations and usability')
text('A click creates/resumes an AudioContext. An oscillator generates two short tones (660 and 880 Hz), and a GainNode fades amplitude. A playing flag and disabled button prevent overlapping sounds. The nodes disconnect after onended; failure displays a status message.')
text('animateEntrance() uses Element.animate() on greeting changes, filtered cards and visible form steps. It cancels prior animations on the target. CSS transitions smooth theme colors. The prefers-reduced-motion preference disables optional motion. Sounds are never played automatically.')
figure('home-tools', 'Figure 13. Actual clock, background control and notification button.', 70)
figure('code-sound', 'Figure 14. Source screenshot: oscillator timing and gain envelope.', 115)
text('The automated check confirms oscillator start and completion and the overlap guard. Actual audibility depends on system volume and audio permissions; confirm it with speakers before the live defense.', 'Small5')

newpage('9. Final test results')
text(f'Test date: 28 October 2026. Environment: Chrome through Playwright, local HTTP server. Result: {RESULTS["passed"]} checks passed; {len(RESULTS["errors"])} uncaught JavaScript errors and {len(RESULTS["failedResponses"])} failed HTTP asset responses.')
table(['Area', 'Verified scenarios'], [
    ('Theme', 'Toggle, ARIA state, reload persistence, cross-page persistence and return to day mode'),
    ('Greeting', 'Blank/whitespace, Enter submission and HTML-looking input rendered safely'),
    ('Keyboard', 'Arrow wrap, Home/End and collapsed mobile navigation'),
    ('Form', 'Next/Back, retained input, final success, password clearing and reset'),
    ('Validation regression', 'Removed HTML constraints; all 7 mandatory fields individually deleted; earlier email tampering'),
    ('Catalog', '3/2/1 category counts, pressed state and restoration by sidebar links'),
    ('Sound / motion', 'Oscillator completion, no overlap, unsupported audio, reduced-motion animation'),
    ('Previous features', 'Clock tick, day background, FAQ keyboard toggle, popup validation/close, nine-slide carousel'),
    ('Responsive layout', 'All 4 pages at 390px, 768px and 1440px with no horizontal page overflow'),
], [40, 134])
story.append(Spacer(1, 7 * mm))
text('Reproduce the test', 'Title5')
text('Install Playwright in a development environment and run node tests/assignment5.cjs. CHROME_EXECUTABLE can select an existing Chrome binary. The suite starts a local server, executes browser checks and captures evidence. No development tools are needed to open the website itself.')
text('Full named results: output/assignment5/test-results.json. Browser evidence: output/assignment5/evidence/. The test covers behavior; personal understanding and the oral defense cannot be automated.')

newpage('10. Reflection and defense preparation')
text('Challenges and solutions', 'Title5')
text('Theme consistency: fixed colors from earlier work needed coordinated dark overrides. The solution uses theme variables and Bootstrap color-mode support rather than changing only the page background.')
text('Form integration: hidden steps must not bypass mandatory checks. The solution keeps all JavaScript rules active at final submission and reveals the relevant step on validation errors. Existing fields remain enabled, preserving their values.')
text('Filtering and anchors: generated cards can disappear under a filter. Sidebar/hash navigation restores the full catalog before scrolling. Sound overlap is prevented by explicit playback state and cleanup.')
text('What the team learned', 'Title5')
text('DOM methods connect JavaScript state to visible content. A callback lets a controller reuse presentation logic. Objects organize related data and methods; arrays and filter() provide predictable selections. Keyboard support, reduced motion and error handling are part of the feature implementation, not separate decoration.')
text('Demonstration sequence', 'Title5')
for n, item in enumerate([
    'Switch to night theme, navigate to another page, reload, then return to day.',
    'Submit an empty greeting, then enter a name; navigate the navbar with arrow keys.',
    'Play the notification; explain the overlap guard and audio cleanup.',
    'Filter resources to Study/Activities and explain the object, switch, loop and filter predicate.',
    'Walk through form steps, go Back, demonstrate errors and successful validation; explain the callback.',
    'Explain how JavaScript rules survive removed HTML constraints and why real services still need server validation.',
], 1):
    text(f'{n}. {item}')
text('Submission', 'Title5')
text('Submit this PDF and the project ZIP with HTML, CSS, JavaScript and local assets. Include the deployed URL shown on the cover. Each team member must upload the work to the LMS before the course deadline and personally defend it. The 40% defense component depends on the students explaining and modifying the code themselves.')

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
doc = SimpleDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=17 * mm, bottomMargin=22 * mm, title='Campus Life - Assignment 5', author='Yessetaiuly Inal; Nurkeldi Baizhigit')
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUTPUT)
