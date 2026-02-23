# MatchLens

MatchLens is a Chrome extension that detects and fills web forms and provides LinkedIn profile editing helpers (headline, industry, about).

## Key Features

- Auto-detects form fields (`input`, `textarea`, `select`) and reports them to the popup UI
- Auto-fills form fields using a JSON profile stored in Chrome local storage
- LinkedIn optimization: updates Headline, Industry, and About on LinkedIn edit pages
- Handles LinkedIn typeahead/autocomplete fields by injecting a small page-world script (via the background service worker)
- Highlights fields that were modified for visual feedback

## Installation

1. Clone or download this repository
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode** (top-right)
4. Click **Load unpacked** and select this project folder

## Usage

### Configure your profile
Open the extension popup and paste your profile data in JSON, for example:

```json
{
  "about": "I am a Senior Full-Stack Engineer with over 20 years of experience designing scalable web platforms and leading engineering teams across healthcare, AI, and enterprise systems.\n\nMy core strength is frontend architecture using React and TypeScript, combined with robust backend integrations in Java Spring and microservices environments. I focus on building clean, maintainable systems that translate complex business requirements into reliable technical solutions.\n\nThroughout my career, I have:\n• Led cross-border engineering teams\n• Designed cloud-native architectures (AWS & Azure)\n• Delivered production systems serving international clients\n• Bridged technical execution with business objectives\n\nI work comfortably across architecture, hands-on development, and technical leadership. My approach emphasizes clarity, scalability, and long-term maintainability over quick fixes.\n\nCurrently based in Finland and open to Senior Frontend, Full-Stack, or Technical Lead roles in product-driven companies.",
  "city": "Turku",
  "company": "TMA Solutions",
  "country": "Finland",
  "email": "khiem.nguyen@edu.turkuamk.fi",
  "firstName": "Khiem Thanh",
  "headline": "Senior Full-Stack Engineer (React + Java Spring) | Frontend Architecture | Cloud & Microservices | Finland",
  "industry": "Software Development",
  "lastName": "Nguyen",
  "phone": "+35844[REDACTED]",
  "pronouns": "He/Him",
  "title": "Frontend Technical Lead"
}
```

Click **Save** to store the profile locally.

### Fill web forms
Navigate to any webpage with a form. The extension will detect form fields automatically. Use the popup to trigger filling with your saved profile data.

### Optimize LinkedIn profile
1. Open a LinkedIn profile (e.g. `https://www.linkedin.com/in/<your-id>/`).
2. Open the extension popup — the LinkedIn section will appear when a profile is detected.
3. Click **Edit Intro** to update headline and industry, or **Edit About** to update the About section.

Notes:
- For LinkedIn typeahead fields (Industry), the extension types into the input and selects the matching dropdown option so LinkedIn will persist the selection on Save.
- If the content scripts are not pre-injected, the popup will attempt to inject `utils.js` and `linkedin.js` into the active tab and retry detection.

## Project Structure

```
MatchLens/
├── manifest.json      # Extension manifest
├── popup.html         # Popup UI
├── popup.js           # Popup logic and user interactions
├── background.js      # Service worker (injects page-world scripts for typeahead)
├── linkedin.js        # LinkedIn profile editing logic
├── content.js         # Form detection and filling logic
├── utils.js           # Shared helper functions
└── icons/             # Icons used by the extension
```

## Technical Notes

- `content.js` scans the DOM for form elements and sends `FORM_DETECTED` messages to the extension.
- `popup.js` stores user profile JSON in Chrome local storage and sends `OPTIMIZE_LINKEDIN_PROFILE` messages to the content script when updating LinkedIn fields.
- `linkedin.js` updates `contenteditable` headline fields and coordinates typeahead updates (it may call into `background.js` to inject a small script into the page world so React internals receive native events).
- `background.js` contains the page-world script used to set native input values and trigger React `onChange` handlers safely.

## Permissions

- `storage` — store profile data locally
- `activeTab`, `tabs` — query and target the active tab
- `scripting` — inject scripts into pages when needed

## Troubleshooting

- If the LinkedIn section does not appear in the popup: make sure the active tab URL contains `/in/` and reload the page and extension.
- If a field appears updated in the UI but does not persist after Save, the extension will retry using a page-world injection to trigger React handlers; reload the page if needed.

## License

MIT
