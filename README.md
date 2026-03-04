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
    "firstName": "Khiem Thanh",
    "lastName": "Nguyen",
    "additionalName": "KN",
    "title": "Mr.",
    "pronouns": "He/Him",
    "dateOfBirth": "1982-10-27",
    "address": {
      "street": "[REDACTED] 30A",
      "postalCode": "20540",
      "city": "Turku",
      "country": "Finland"
    },
    "contact": {
      "email": "khiem.nguyen@edu.turkuamk.fi, nguyenthanhkhiemvn@gmail.com",
      "phone": "+35844[REDACTED], +358 44 950 9869",
      "linkedin": "https://www.linkedin.com/in/nguyenthanhkhiemvn"
    }
  },
  "professional": {
    "headline": "Senior Full-Stack Engineer & Technical Lead | React • TypeScript • Java Spring • Microservices | 21+ Years Experience | Finland",
    "currentTitle": "Subject Matter Expert & Frontend Technical Lead",
    "currentCompany": "TMA Solutions",
    "industry": "Software Development",
    "yearsOfExperience": 21,
    "jobSearch": "(\"Software Engineer\" OR \"Developer\" OR \"Technical Lead\" OR \"Frontend Engineer\") AND (React OR TypeScript OR Java OR Spring) AND Finland"
  },
  "summary": "With 21 years in software engineering, I've built up a seriously deep technical toolkit—think debugging gnarly issues, architecting solutions, and wrangling code bases that have definitely seen better days. I focus a lot on mentoring too, because watching someone level up their engineering chops is its own reward.\n\nOn the leadership front, I've managed teams through launches, migrations, and the occasional \"oh no, what did we just deploy?\" midnight crisis. I'm good at working alone — heads-down sprints, rapid prototyping, all that — or collaborating with cross-functional groups if that's what the project needs. Customer support isn't just a footnote: I've worked directly with users and clients, translating tech jargon, handling tickets, and turning ugly problems into happy resolutions.\n\nI am a Senior Full-Stack Engineer with extensive experience designing scalable web platforms and leading engineering teams across healthcare, AI, and enterprise systems. My core strength is frontend architecture using React and TypeScript, combined with robust backend integrations in Java Spring and microservices environments. I focus on building clean, maintainable systems that translate complex business requirements into reliable technical solutions.",
  "keySkills": [
    "Rich technical experience across software development",
    "Proven leadership and team direction skills",
    "Flexible—works independently or in multi-disciplinary teams",
    "Customer support: effective, direct, and solutions-oriented",
    "Frontend architecture using React and TypeScript",
    "Backend integrations in Java Spring and microservices",
    "Cloud-native architectures (AWS & Azure)",
    "Cross-border engineering team leadership",
    "Technical mentoring and team development"
  ],
  "education": [
    {
      "degree": "BSc",
      "field": "Information and Communication Technologies (ICT)",
      "institution": "Turku University of Applied Science (Turku AMK)",
      "location": "Turku, Finland",
      "startDate": "2025",
      "endDate": "2029",
      "status": "In Progress"
    },
    {
      "degree": "BSc",
      "field": "Informatics Technology",
      "specialization": "Software Engineering, Business and Information Systems, Encryption Technology",
      "institution": "Ho Chi Minh University of Foreign Languages and Informatics Technology",
      "startDate": "2000",
      "endDate": "2004",
      "status": "Completed"
    }
  ],
  "certifications": [
    {
      "name": "CCNA Certificate",
      "issuer": "Cisco",
      "year": "2005",
      "type": "Networking"
    },
    {
      "name": "Microsoft Fundamentals in AI",
      "issuer": "Microsoft",
      "description": "Foundational competence in AI concepts, ethical considerations, and practical applications within enterprise environments"
    }
  ],
  "training": [
    {
      "name": "Information Security & Risk Management",
      "topics": [
        "Managed information security risks through continuous threat assessment and mitigation",
        "Developed and routinely updated disaster recovery protocols",
        "Oversaw strict access controls to critical systems",
        "Network and system architectures hardening",
        "User awareness through targeted security communication and training"
      ]
    },
    {
      "name": "Online Marketing",
      "topics": [
        "Analysis of social networking platforms",
        "Data-driven marketing techniques",
        "Big data analytics for decision-making",
        "Mobile marketing optimization",
        "Real-world marketing challenges and digital outreach"
      ]
    }
  ],
  "technicalSkills": {
    "programmingLanguages": {
      "frontend": ["JavaScript", "TypeScript", "Dart", "Swift", "Objective-C"],
      "backend": ["Java", "C", "C++", "Delphi", "PHP", "JSP", "Ruby", "C#", "VB", "VC++", "VB.NET"],
      "frameworks": ["ReactJS", "React Native", "GraphQL", "AngularJS", "Kotlin"]
    },
    "infrastructure": {
      "containerization": ["Docker", "Kubernetes"],
      "architecture": ["Microservices Architecture"],
      "cloud": ["AWS", "Azure"],
      "devops": ["GitLab CI/CD", "GitHub CI/CD", "Terraform", "Jenkins"],
      "webServers": ["Apache", "Node.js", "IIS", "LAMP", "Nginx"]
    },
    "monitoring": ["DataDog", "Google Firebase"],
    "microsoft": {
      "technologies": ["Razor", "Azure", "ASP.NET", "COM", "DCOM", "ActiveX", "MVC", "Silverlight"]
    },
    "mobile": {
      "platforms": ["iOS", "Android", "Windows Mobile"],
      "tools": ["Xcode", "Android Studio"]
    },
    "testing": ["End-to-End (E2E) Testing", "Automation Testing"],
    "dataEngineering": ["Spark", "Python"],
    "databases": {
      "sql": ["Microsoft SQL Server (MS SQL)", "MySQL", "Oracle", "SQLite"],
      "nosql": ["DynamoDB", "MongoDB", "Firebird"],
      "other": ["Polaris"]
    },
    "developmentTools": [
      "IntelliJ IDEA",
      "Eclipse",
      "NetBeans",
      "Android Studio",
      "Visual Studio",
      "Visual Studio Code (VS Code)",
      "Xcode",
      "Photoshop",
      "Shark"
    ],
    "frameworks": [
      "Spring",
      "Laravel",
      "NHibernate",
      "Phaser",
      "Drupal",
      "OpenCart",
      "GOA",
      "Yii",
      "Sencha",
      "Meteor",
      "Vuforia (Augmented Reality)",
      "React",
      "AngularJS",
      "Truffle",
      "Express"
    ],
    "networking": ["VPN", "LAN/WAN", "Cisco routers", "Zimbra", "Exchange"],
    "coreTechnologies": [
      "REST API",
      "SOAP API",
      "WebRTC",
      "WebSockets",
      "Serverless & Cloud Computing",
      "Virtualization",
      "Video Compression",
      "SIP",
      "VoIP",
      "Computer Vision",
      "Arduino"
    ],
    "collaboration": ["Jira", "GitLab", "GitHub", "Azure DevOps", "Trello"],
    "linux": ["Shell Scripting", "Python", "QT"]
  },
  "workExperience": [
    {
      "position": "Subject Matter Expert",
      "company": "TMA Solutions",
      "location": null,
      "startDate": "2022-02",
      "endDate": "Present",
      "current": true,
      "responsibilities": [
        "Lead the front-end development team, directly managing engineers delivering solutions to international clients",
        "Ensure project milestones are met and client expectations are consistently exceeded",
        "Serve as primary architect—dividing workloads, assigning tasks, and maintaining project cohesion across multiple teams",
        "Oversee technical strategy to keep development streamlined and efficient"
      ],
      "technologies": [
        "Java",
        "Spring Framework",
        "Microservice",
        "AngularJS",
        "ReactJS",
        "React Native",
        "Swift",
        "Dart",
        "JavaScript",
        "TypeScript",
        "Objective-C",
        "C++",
        "Ruby",
        "Kotlin"
      ],
      "industries": ["Artificial Intelligence", "Healthcare", "Education"],
      "achievements": [
        "Build and deploy mobile, desktop, and web applications for international clients",
        "Proven ability to deliver high-performance solutions for both Android and iOS platforms",
        "Skilled in technical architecture, team management, and complex problem-solving"
      ]
    },
    {
      "position": "CEO & Co-Founder",
      "company": "ADCREW LLC / ADCREW Co., LTD",
      "location": null,
      "startDate": "2016-09",
      "endDate": "2022-02",
      "current": false,
      "responsibilities": [
        "Responsible for all operations: project management, financial oversight, and spearheading client acquisition",
        "Identified expansion opportunities, forged strategic partnerships, and consistently increased company visibility",
        "Fostered a culture of innovation, driving business growth with hands-on leadership and team coordination",
        "Engineered full-stack web applications with PHP and LAMP",
        "Designed and launched interactive JavaScript games using Phaser",
        "Executed advanced SEO strategies"
      ],
      "technologies": [
        "PHP",
        "LAMP",
        "JavaScript",
        "Phaser",
        "Artificial Intelligence",
        "Chatbot",
        "Natural Language Processing (NLP)",
        "Decentralized Finance (DeFi)"
      ],
      "achievements": [
        "Delivered multiple high-impact projects from ideation to completion",
        "Streamlined project workflows and financial processes, resulting in higher operational efficiency and profitability",
        "Measurable improvements in website traffic and brand discoverability through SEO"
      ]
    },
    {
      "position": "General Manager",
      "company": "SAIGONTECHCOM JSC",
      "location": null,
      "startDate": "2012-12",
      "endDate": "2016-09",
      "current": false,
      "responsibilities": [
        "Led mobility initiatives, including Android development, ERP integration, GPS tracking systems, and SIP/VoIP tech",
        "Oversaw AD and IT departments, established strategic goals, and executed plans to meet annual sales targets",
        "Directed software development teams on global outsourcing projects",
        "Coordinated multiple complex projects simultaneously",
        "Designed and delivered targeted marketing campaigns for pharmacy products tailored to the Vietnamese market",
        "Enhanced client service standards and negotiation processes"
      ],
      "technologies": ["Android", "ERP", "GPS tracking", "SIP/VoIP"],
      "achievements": [
        "Increased annual sales by optimizing departmental workflows and deploying effective marketing solutions",
        "Improved project delivery times and quality standards through hands-on leadership",
        "Increased market share and revenue growth through effective marketing strategies",
        "Improved client retention and satisfaction rates"
      ]
    },
    {
      "position": "IT Manager",
      "company": "TOPCEMENT",
      "location": null,
      "startDate": "2011-08",
      "endDate": "2012-11",
      "current": false,
      "responsibilities": [
        "Owned and executed various IT initiatives: ERP transformation, cloud infrastructure, virtualization, and network upgrades",
        "Managed end-to-end SAP B1 implementation",
        "Served as the lead SAP B1 resource for internal teams",
        "Oversaw IT operations daily, directed troubleshooting efforts",
        "Served as main liaison to the CEO"
      ],
      "technologies": ["SAP B1", "ERP", "Cloud", "Virtualization"],
      "achievements": [
        "Deployed SAP B1, resulting in notable process improvements and increased operational efficiency",
        "Achieved seamless ERP integration with existing infrastructure",
        "Coordinated cross-functional teams using strong communication and leadership skills"
      ]
    },
    {
      "position": "Mobile Team Supervisor",
      "company": "PLAYSOFT",
      "location": null,
      "startDate": "2011-01",
      "endDate": "2011-12",
      "current": false,
      "responsibilities": [
        "Oversaw end-to-end development and deployment of mobile applications for iOS and Android",
        "Managed a team of developers in Vietnam, collaborating with French teams",
        "Maintained operational efficiency under high-pressure situations using Agile methodologies"
      ],
      "technologies": ["iOS", "Android", "Agile"],
      "achievements": [
        "Demonstrated ability to perform in demanding environments under tight deadlines",
        "Applied practical Agile frameworks for on-time, efficient project execution",
        "Effectively coordinated across multicultural and cross-functional teams"
      ]
    },
    {
      "position": "Senior Developer",
      "company": "NETiKA",
      "location": null,
      "startDate": "2007-01",
      "endDate": "2011-12",
      "current": false,
      "responsibilities": [
        "Developed ERP applications using Delphi for Win32",
        "Integrated DCOM and MS SQL technologies",
        "Collaborated across teams in England, Belgium, and Vietnam",
        "Built applications for Motorola Symbol Devices using C# on Compact Framework",
        "Developed robust applications with C++ and QT framework",
        "Specialized in optimizing ERP workflows for Android and Windows Mobile",
        "Developed dynamic user interfaces using Flash technology"
      ],
      "technologies": [
        "Delphi",
        "MS SQL",
        "DCOM",
        "C#",
        "Compact Framework",
        "Windows CE",
        "C++",
        "QT",
        "Android",
        "Windows Mobile",
        "Flash"
      ],
      "achievements": [
        "Deployed solutions for both Windows and Linux environments (openSUSE, Ubuntu)",
        "Proficient in diagnosing and resolving complex technical issues",
        "Skilled in delivering clear technical presentations to both technical and non-technical stakeholders"
      ]
    },
    {
      "position": "IT Staff",
      "company": "SONY",
      "location": null,
      "startDate": "2006-07",
      "endDate": "2007-02",
      "current": false,
      "responsibilities": [
        "Oversaw daily operations of the SONY sales system",
        "Conducted training sessions on electronic approval system for northern branch",
        "Completed comprehensive SONY-SAP system training",
        "Developed automated daily and monthly sales reports using VB scripting"
      ],
      "technologies": ["SAP", "VB scripting"],
      "achievements": [
        "Facilitated successful user onboarding and increased system adoption rates",
        "Enabled efficient data analysis and supported informed decision-making",
        "Minimized downtime and ensured seamless operations"
      ]
    },
    {
      "position": "Team Leader",
      "company": "Saigon Software Park",
      "location": null,
      "startDate": "2004-09",
      "endDate": "2006-06",
      "current": false,
      "responsibilities": [
        "Led a team building Delphi 7 applications on Windows and Win32 platforms",
        "Spearheaded an ERP system project using Delphi 7 with Interbase FireBird DBMS",
        "Designed and developed custom Delphi VCL components",
        "Utilized C++ to develop Windows system services",
        "Applied expertise in CMMI and ISO methodology"
      ],
      "technologies": ["Delphi 7", "Windows", "Win32", "Interbase FireBird DBMS", "C++", "CMMI", "ISO"],
      "achievements": [
        "Fostered strong team environment with high productivity",
        "Enhanced overall application functionality and user experience",
        "Ensured process consistency and upheld software quality standards"
      ]
    }
  ]
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
