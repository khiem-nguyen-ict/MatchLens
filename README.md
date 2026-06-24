# MatchLens

MatchLens is a Chrome extension that help manage and optimize the LinkedIn profile.

## Key Features

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
  "personalInfo": {
    "firstName": "<your_first_name>",
    "lastName": "<your_last_name>",
    "email": "<your_email>"
  },
  "professional": {
    "headline": "<your_headline>",
    "currentTitle": "<your_current_title>",
    "currentCompany": "<your_current_company>"
  },
  // Include other sections as needed: summary, keySkills, education, etc.
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
├── content.js         # (Unused, reserved for future LinkedIn-specific scripts)
├── utils.js           # Shared helper functions
└── icons/             # Icons used by the extension
```

## Technical Notes


- `popup.js` stores user profile JSON in Chrome local storage and sends `OPTIMIZE_LINKEDIN_PROFILE` messages to the content script when updating LinkedIn fields.
- `linkedin.js` updates `contenteditable` headline fields and coordinates typeahead updates (it may call into `background.js` to inject a small script into the page world so React internals receive native events).
- `background.js` contains the page-world script used to set native input values and trigger React `onChange` handlers safely.

## Permissions

- `storage` — store profile data locally
- `activeTab`, `tabs` — query and target the active tab
- `scripting` — inject scripts into pages when needed

## License

MIT
