# MatchLens - Smart Form Filler & LinkedIn Profile Optimizer

MatchLens is a powerful Chrome extension that intelligently detects and fills web forms while providing seamless LinkedIn profile optimization with AI-assisted content management.

## 🎯 Features

### Form Filling
- **Auto-detect** form fields on any webpage
- **Smart matching** of fields based on labels and names
- **Profile-based** filling using stored user data
- **JSON configuration** for easy profile management

### LinkedIn Profile Optimization
- **Automatic detection** of LinkedIn profile pages
- **One-click navigation** to profile edit pages
- **Headline optimization** with custom text
- **Instant updates** to LinkedIn profile information
- **Update history** tracking

## 📋 Requirements

- Google Chrome browser (version 88+)
- LinkedIn account for profile optimization features

## 🚀 Installation

### Manual Installation (Development Mode)

1. **Clone or download** this repository to your local machine
   ```bash
   git clone <repository-url>
   cd matchlens
   ```

2. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right corner)

3. **Load the Extension**
   - Click **"Load unpacked"**
   - Select the `matchlens` folder
   - The extension will appear in your extensions list

4. **Pin the Extension** (optional)
   - Click the extensions icon in Chrome toolbar
   - Click the pin icon next to "MatchLens"

## 💻 Usage

### Setting Up Your Profile

1. **Click the extension icon** in your Chrome toolbar
2. **Enter your profile data** as JSON:
   ```json
   {
    "firstName": "Khiem Thanh",
    "lastName": "Nguyen",
    "email": "khiem.nguyen@edu.turkuamk.fi",
    "city": "Turku",
    "country": "Finland",
    "phone": "+35844[REDACTED]",
    "company": "TMA Solutions",
    "title": "Frontend Technical Lead",
    "headline": "Senior Full-Stack Engineer (React + Java Spring) | Frontend Architecture | Cloud & Microservices | Finland",
    "industry": "Software Development"
   }
3. **Click "Save"** to store your profile locally

### Auto-Filling Forms

1. **Navigate to any webpage** with form fields (name, email, address, etc.)
2. **The extension automatically detects** the form
3. Click the extension icon and forms will be **filled using your profile data**
4. A message confirms successful form detection and filling

### Optimizing LinkedIn Profile

1. **Navigate to your LinkedIn profile** (e.g., `https://www.linkedin.com/in/your-profile-id/`)
2. **Click the extension icon** to open the popup
3. **LinkedIn Profile section** will appear showing your profile ID
4. **Enter your desired headline** (or use the pre-filled example):
   ```
   Frontend Technical Lead (React + TypeScript + Cloud)
   ```
5. **Click "Optimize LinkedIn Profile"**
6. The extension will:
   - Navigate to your profile edit page
   - Update the headline with your text
   - Display a success message

## 🏗️ Project Structure

```
matchlens/
├── manifest.json          # MatchLens configuration
├── popup.html            # Popup UI for MatchLens
├── popup.js              # Popup functionality
├── content.js            # Form detection engine
├── linkedin.js           # LinkedIn optimization module
├── background.js         # Background service worker
├── README.md             # Documentation
└── icons/                # MatchLens extension icons
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

### File Descriptions

- **manifest.json** - Defines extension permissions, content scripts, and configuration
- **popup.html** - UI for the extension popup with form and LinkedIn sections
- **popup.js** - Handles user interactions and communication with content scripts
- **content.js** - Detects and fills general web forms
- **linkedin.js** - Handles LinkedIn profile detection and headline updates
- **background.js** - Service worker that processes messages and maintains update history

## 🔒 Privacy & Security

- ✅ **Local storage only** - Your profile data is stored locally on your device
- ✅ **No server communication** - All processing happens in your browser
- ✅ **No tracking** - No analytics or user tracking
- ✅ **Manual control** - You control when forms are filled or profiles updated

## ⚙️ Technical Details

### Technologies Used
- **JavaScript (ES6+)** - Extension logic
- **Chrome Extension API** - Browser integration
- **Chrome Storage API** - Local data persistence

### Key Components

#### LinkedIn Profile ID Extraction
- Regex pattern: `/linkedin\.com\/in\/([^/?]+)/`
- Extracts profile slug from LinkedIn URLs

#### Headline Update Process
1. Detects contenteditable div with role="textbox"
2. Updates text content via DOM manipulation
3. Triggers input, change, and blur events
4. LinkedIn's React components handle the update

#### Form Field Detection
- Scans for `<input>`, `<textarea>`, and `<select>` elements
- Extracts labels, names, placeholders, and types
- Matches fields against predefined rules

## 🐛 Troubleshooting

### Issue: Extension not detecting forms
- **Solution**: Refresh the page and wait a few seconds for form detection
- **Solution**: Check if the form elements are visible (extension skips hidden fields)

### Issue: LinkedIn section not appearing
- **Solution**: Make sure you're on a LinkedIn profile page (URL contains `/in/`)
- **Solution**: Refresh the page
- **Solution**: Reload the extension from `chrome://extensions/`

### Issue: Headline not updating
- **Solution**: Ensure you're on the LinkedIn edit page or extension navigates within 30 seconds
- **Solution**: Try manually updating the headline and check browser console for errors
- **Solution**: Clear browser cache and reload the extension

### Issue: Profile not saving
- **Solution**: Check if JSON is valid - use an online JSON validator
- **Solution**: Ensure all required fields are included
- **Solution**: Check browser storage permissions in Chrome settings

## 📊 Update History

The extension maintains a history of the last 20 LinkedIn profile updates. Access this in developer tools:

```javascript
// In browser console
chrome.storage.local.get("linkedInUpdates", (data) => {
  console.log(data.linkedInUpdates);
});
```

## 🔄 Permissions Explained

| Permission | Purpose |
|-----------|---------|
| `storage` | Stores your profile data locally |
| `activeTab` | Access current tab to detect LinkedIn pages |
| `scripting` | Inject scripts into web pages |
| `tabs` | Manage tab information |
| `*://www.linkedin.com/*` | Access LinkedIn domains |
| `<all_urls>` | Support form filling on any website |

## 📝 Example Profile JSON

```
{
  "firstName": "Khiem Thanh",
  "lastName": "Nguyen",
  "email": "khiem.nguyen@edu.turkuamk.fi",
  "city": "Turku",
  "country": "Finland",
  "phone": "+35844[REDACTED]",
  "company": "TMA Solutions",
  "title": "Frontend Technical Lead",
  "headline": "Senior Full-Stack Engineer (React + Java Spring) | Frontend Architecture | Cloud & Microservices | Finland",
  "industry": "Software Development"
}
```

## 🎓 Use Cases

- **Job Applications** - Quickly fill out application forms
- **LinkedIn Optimization** - Update headline to showcase your skills
- **Bulk Registrations** - Speed up account creation across multiple sites
- **Profile Management** - Maintain consistent information across platforms

## ⚖️ Legal Disclaimer

This extension is provided as-is. Users are responsible for:
- Complying with website terms of service
- Using the extension only for legitimate purposes
- Not violating LinkedIn's terms of service
- Ensuring personal data compliance (GDPR, etc.)

The author is not liable for misuse or third-party website policies.

## 🤝 Contributing

To improve this extension:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - Feel free to modify and distribute

## 👨‍💻 Author

**Khiem Nguyen Thanh**
- Expertise: Frontend Development, React, TypeScript, Cloud Technologies
- Email: Contact via LinkedIn

## 🆘 Support

For issues or questions:
1. Check the **Troubleshooting** section above
2. Review browser console for error messages
3. Verify extension permissions in Chrome settings
4. Reload the extension from `chrome://extensions/`

## 🚀 Future Features (Roadmap)

- [ ] Support for multiple profile templates
- [ ] Integration with more LinkedIn profile fields
- [ ] Advanced form matching with ML
- [ ] Import/export profile configurations
- [ ] Keyboard shortcuts for quick actions
- [ ] Support for other job boards (Indeed, Glassdoor, etc.)

---

**Version:** 1.0  
**Last Updated:** February 22, 2026  
**Status:** Active Development
