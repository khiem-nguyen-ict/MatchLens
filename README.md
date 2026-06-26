# MatchLens 🔍

**Supercharge your LinkedIn profile with AI-powered optimization!**

A powerful Chrome extension that intelligently optimizes your LinkedIn profile by analyzing job descriptions and automatically tailoring your headline, industry, and about section for maximum visibility and relevance.

## ✨ Features

- 🤖 **AI-Powered Optimization** - Uses intelligent algorithms to enhance your profile
- 📝 **Auto-Fill LinkedIn Fields** - Seamlessly updates Headline, Industry, and About sections
- 🎯 **Job-Description Matching** - Analyzes job postings to customize your profile
- 📊 **Smart Keyword Integration** - Naturally incorporates relevant keywords
- 🔐 **Secure & Private** - All data stays on your device (LocalStorage)
- ⚡ **One-Click Optimization** - Fast and efficient profile updates
- 🎨 **Visual Feedback** - See exactly what changed with highlighting
- 🔄 **Non-Destructive** - Review changes before committing them
- 🌐 **Universal Form Support** - Works on LinkedIn and other web forms

## 🎯 Use Cases

1. **LinkedIn Optimization** - Update your profile to match specific job descriptions
2. **Cover Letter Writing** - Auto-fill application forms with optimized information
3. **Job Applications** - Quickly tailor information for multiple positions
4. **Career Transitions** - Highlight relevant skills for new industries
5. **Interview Prep** - Ensure your online presence reflects your best self

## 📦 Installation

### From Chrome Web Store (Coming Soon)
*MatchLens will be available on the Chrome Web Store*

### Manual Installation (Developer Mode)

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/khiem-nguyen-ict/MatchLens.git
   cd MatchLens
   ```

2. **Open Chrome Extension Manager**
   - Open Chrome and go to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right corner)

3. **Load unpacked extension**
   - Click **"Load unpacked"**
   - Select the `MatchLens` folder
   - Extension appears in your toolbar!

4. **Pin the extension**
   - Click the puzzle icon in toolbar
   - Find "MatchLens" and click the pin icon
   - Easy access from your Chrome toolbar

## 🚀 Quick Start

### 1. Configure Your Profile

1. **Click the MatchLens icon** in your Chrome toolbar
2. **Paste your profile information as JSON**:

```json
{
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0123"
  },
  "professional": {
    "headline": "Full Stack Developer | React & Node.js",
    "currentTitle": "Senior Software Engineer",
    "currentCompany": "Tech Corp",
    "industry": "Software Development"
  },
  "summary": "Experienced full-stack developer with 5+ years building scalable web applications...",
  "keySkills": ["JavaScript", "React", "Node.js", "AWS", "Docker"],
  "experience": [
    {
      "title": "Senior Developer",
      "company": "Tech Corp",
      "duration": "2 years",
      "description": "Led team of 5 developers..."
    }
  ],
  "education": [
    {
      "school": "University",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "year": "2018"
    }
  ]
}
```

3. **Click "Save"** - Your profile is securely stored locally

### 2. Optimize LinkedIn Profile

1. **Visit your LinkedIn profile edit page**
   - Go to `linkedin.com/in/yourprofile/` → Click **Edit profile**

2. **Open MatchLens popup**
   - Click the MatchLens icon

3. **Choose optimization type**
   - **Edit Intro** - Update Headline & Industry
   - **Edit About** - Update About section

4. **Review changes**
   - See what will be updated in real-time
   - Fields are highlighted in green

5. **Apply changes**
   - Click **"Apply"** to update LinkedIn
   - Changes are saved automatically on LinkedIn

### 3. Fill Web Forms

1. **Navigate to any web form** with fields like:
   - Name
   - Email
   - Phone
   - Professional title
   - Bio/Summary

2. **Open MatchLens popup**

3. **Click "Fill Form"**
   - Extension auto-detects form fields
   - Fills with your saved profile data

4. **Review & submit**
   - Verify information is correct
   - Submit the form

## ⚙️ How It Works

### Technical Architecture

```
┌─────────────────────────────────────┐
│       MatchLens Extension           │
├─────────────────────────────────────┤
│  popup.js     │ Content Scripts     │
│  (UI Logic)   │ (Form Detection)    │
├─────────────────────────────────────┤
│     background.js (Service Worker)  │
│     • Injects page-world scripts    │
│     • Handles React typeahead       │
├─────────────────────────────────────┤
│     Chrome LocalStorage (Secure)    │
│     • Stores user profile JSON      │
│     • No server uploads             │
└─────────────────────────────────────┘
```

### LinkedIn Field Detection

- **Headline**: Finds the headline input field on profile edit page
- **Industry**: Detects and handles LinkedIn's autocomplete dropdown
- **About**: Updates the rich text editor in the about section
- **Typeahead Handling**: Special script handles React form state updates

## 🔐 Privacy & Security

✅ **Your data stays on your device**
- Profile stored only in Chrome LocalStorage
- No data sent to external servers
- No tracking or analytics
- Extension works completely offline

✅ **Safe LinkedIn updates**
- Changes previewed before applying
- Non-destructive updates
- You control exactly what changes

## 🛠️ Project Structure

```
MatchLens/
├── manifest.json              # Extension manifest (v3)
├── popup.html                 # Popup UI
├── popup.js                   # Popup logic
├── background.js              # Service worker
├── linkedin.js                # LinkedIn-specific logic
├── content.js                 # Content script (reserved)
├── utils.js                   # Shared utilities
├── icons/                     # Extension icons (16, 48, 128px)
└── README.md                  # This file
```

## 📋 Permissions Explained

| Permission | Why It's Needed |
|-----------|-----------------|
| `storage` | Save your profile JSON locally |
| `activeTab` | Detect which tab you're on |
| `tabs` | Query tab information |
| `scripting` | Inject scripts for form automation |

## 🎨 Usage Tips

### Best Practices

1. **Use Specific Information**
   - More detailed profile = better matches
   - Include real accomplishments
   - List actual skills and experience

2. **Update Regularly**
   - Refresh profile data when changing roles
   - Adjust for different job types
   - Keep skills current

3. **Review Before Submitting**
   - Always check generated text
   - Ensure tone matches industry
   - Verify no placeholder text remains

4. **Customize for Roles**
   - Save multiple profile versions
   - Use different headlines for different industries
   - Tailor skills to job descriptions

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Extension not loading | Restart Chrome, check `chrome://extensions/` |
| LinkedIn fields not updating | Refresh LinkedIn page, check if page in edit mode |
| Profile data not saving | Check LocalStorage: DevTools → Application → Storage |
| Form detection not working | Form fields might need custom selectors |
| Autocomplete not working | LinkedIn layout may have changed, check LinkedIn support |

### Developer Console
Press `F12` and check the Console tab for error messages.

## 🔄 Future Enhancements

- [ ] Multi-profile support (save different profile versions)
- [ ] AI-powered content generation
- [ ] LinkedIn job scraping and auto-matching
- [ ] Email template auto-fill
- [ ] Cloud sync across devices
- [ ] Chrome Sync support
- [ ] Integration with other job sites

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add: feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support & Contact

- **Author**: Khiem Nguyen
- **Email**: nguyenthanhkhiemvn@gmail.com
- **GitHub**: [@khiem-nguyen-ict](https://github.com/khiem-nguyen-ict)
- **Issues**: [GitHub Issues](https://github.com/khiem-nguyen-ict/MatchLens/issues)

## ⭐ Show Your Support

- ⭐ Star the repository
- 🍴 Fork and contribute
- 📢 Share with your network
- 💬 Leave feedback and suggestions

---

**Optimize your LinkedIn. Land your dream job. 🚀**

*MatchLens - Intelligent Profile Optimization for LinkedIn*
