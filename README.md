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
      "phone": "+358 44 950 9869",
      "linkedin": "https://www.linkedin.com/in/khiem-nguyen-ict/"
    }
  },
  "professional": {
    "headline": "Senior Full-Stack Engineer & Technical Lead | React • TypeScript • Java Spring • Microservices | 22+ Years Experience | Finland",
    "currentTitle": "Subject Matter Expert & Project Manager & Frontend Technical Lead",
    "currentCompany": "TMA Solutions",
    "industry": "Software Development",
    "yearsOfExperience": 22,
    "jobSearch": "(\"Software Engineer\" OR \"Developer\" OR \"Technical Lead\" OR \"Frontend Engineer\") AND (React OR TypeScript OR Java OR Spring) AND Finland"
  },
  "summary": "With 22 years in software engineering, I've built up a seriously deep technical toolkit-think debugging gnarly issues, architecting solutions, and wrangling code bases that have definitely seen better days. I focus a lot on mentoring too, because watching someone level up their engineering chops is its own reward.\n\nOn the leadership front, I've managed teams through launches, migrations, and the occasional \"oh no, what did we just deploy?\" midnight crisis. I'm good at working alone - heads-down sprints, rapid prototyping, all that - or collaborating with cross-functional groups if that's what the project needs. Customer support isn't just a footnote: I've worked directly with users and clients, translating tech jargon, handling tickets, and turning ugly problems into happy resolutions.\n\nI am a Senior Full-Stack Engineer with extensive experience designing scalable web platforms and leading engineering teams across healthcare, AI, and enterprise systems. My core strength is frontend architecture using React and TypeScript, combined with robust backend integrations in Java Spring and microservices environments. I focus on building clean, maintainable systems that translate complex business requirements into reliable technical solutions.",
  "keySkills": [
    "Rich technical experience across software development",
    "Proven leadership and team direction skills",
    "Flexible-works independently or in multi-disciplinary teams",
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
      "frontend": [
        "JavaScript",
        "TypeScript",
        "Dart",
        "Swift",
        "Objective-C",
        "HTML",
        "CSS"
      ],
      "backend": [
        "Java",
        "C",
        "C++",
        "Delphi",
        "PHP",
        "JSP",
        "Ruby",
        "C#",
        "VB",
        "VC++",
        "VB.NET",
        "Kotlin"
      ],
      "frameworks": [
        "ReactJS",
        "React Native",
        "GraphQL",
        "AngularJS",
        "Flutter",
        "VueJS"
      ]
    },
    "infrastructure": {
      "containerization": [
        "Docker",
        "Kubernetes"
      ],
      "architecture": [
        "Microservices Architecture"
      ],
      "cloud": [
        "AWS",
        "Azure"
      ],
      "devops": [
        "GitLab CI/CD",
        "GitHub CI/CD",
        "Terraform",
        "Jenkins"
      ],
      "webServers": [
        "Apache",
        "Node.js",
        "IIS",
        "LAMP",
        "Nginx"
      ]
    },
    "monitoring": [
      "DataDog",
      "Google Firebase",
      "Firebase Crashlytics",
      "Firebase Analytics"
    ],
    "pushNotifications": [
      "Braze",
      "Firebase Cloud Messaging",
      "OneSignal"
    ],
    "microsoft": {
      "technologies": [
        "Razor",
        "Azure",
        "ASP.NET",
        "COM",
        "DCOM",
        "ActiveX",
        "MVC",
        "Silverlight"
      ]
    },
    "mobile": {
      "platforms": [
        "iOS",
        "Android",
        "Windows Mobile"
      ],
      "tools": [
        "Xcode",
        "Android Studio"
      ],
      "libraries": [
        "Alamofire",
        "Dio",
        "Socket.io",
        "CLLocationManager",
        "Core Data",
        "Core Animation",
        "Cocoa Framework",
        "BLOC Pattern",
        "Room",
        "Nexmo Video SDK"
      ]
    },
    "testing": [
      "End-to-End (E2E) Testing",
      "Automation Testing"
    ],
    "dataEngineering": [
      "Spark",
      "Python"
    ],
    "databases": {
      "sql": [
        "Microsoft SQL Server (MS SQL)",
        "MySQL",
        "Oracle",
        "SQLite",
        "SQFLite",
        "FMDB"
      ],
      "nosql": [
        "DynamoDB",
        "MongoDB",
        "Firebird",
        "Core Data",
        "Prisma",
        "Room"
      ],
      "other": [
        "Polaris"
      ]
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
      "Shark",
      "Figma",
      "Marvel"
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
      "Express",
      "Flutter",
      "VueJS",
      "Cocoa Framework"
    ],
    "networking": [
      "VPN",
      "LAN/WAN",
      "Cisco routers",
      "Zimbra",
      "Exchange"
    ],
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
    "collaboration": [
      "Jira",
      "GitLab",
      "GitHub",
      "Azure DevOps",
      "Trello",
      "Bitbucket",
      "Confluence",
      "SVN"
    ],
    "linux": [
      "Shell Scripting",
      "Python",
      "QT"
    ],
    "methodologies": [
      "Agile",
      "Scrum",
      "CMMI",
      "ISO"
    ],
    "machineLearning": [
      "Machine Learning (ML)",
      "Deep Learning (DL)",
      "Natural Language Processing (NLP)",
      "Model Training & Evaluation",
      "AI Code Analysis",
      "Conversational AI",
      "Avatar / Real-time AI Rendering"
    ]
  },
  "projects": [
    {
      "name": "Coin Trading Application",
      "description": "Led iOS development and architecture for a real-time trading platform covering stocks, ETFs, forex, and crypto. Clarified requirements with clients, designed mobile architecture and database structure, led the team, and delivered a production-ready app with live market data via WebSocket.",
      "role": "Senior Developer / Tech Lead",
      "tech": [
        "Swift",
        "Alamofire",
        "Socket.io",
        "Firebase Crashlytics",
        "OneSignal",
        "REST API",
        "Xcode",
        "Git"
      ],
      "company": "TMA Solutions"
    },
    {
      "name": "Life Saver",
      "description": "Architected and led iOS development of a fall-detection safety app for the elderly. Designed the mobile architecture, integrated phone sensors to detect falls, and automated emergency alerts via calls and SMS to pre-set contacts.",
      "role": "Senior Developer / Tech Lead",
      "tech": [
        "Swift",
        "Core Data",
        "Core Animation",
        "CLLocationManager",
        "Click Send API",
        "Firebase Messaging",
        "Xcode",
        "Git"
      ],
      "company": "TMA Solutions"
    },
    {
      "name": "Healthcare Platform",
      "description": "Led cross-platform mobile development of a secure health-monitoring platform enabling users to share vital health indexes with doctors and family. Designed architecture, resolved cross-team bugs, and cloned the platform to serve multiple distinct customer verticals.",
      "role": "Senior Developer / Tech Lead",
      "tech": [
        "Swift",
        "Flutter",
        "Core Data",
        "SQFLite",
        "Dio",
        "HTTP",
        "Firebase",
        "Java",
        "VueJS",
        "Visual Code",
        "GitLab"
      ],
      "company": "TMA Solutions"
    },
    {
      "name": "GemCraft",
      "description": "Designed and delivered a full-stack iOS app for the diamond and jewelry industry, enabling users to browse, customise, and virtually try on jewelry using the device camera before placing orders.",
      "role": "Senior Developer (Full-Stack)",
      "tech": [
        "Swift",
        "PHP",
        "Cocoa Framework",
        "Camera",
        "SQLite",
        "MySQL",
        "REST API",
        "Xcode",
        "Git"
      ],
      "company": "TMA Solutions"
    },
    {
      "name": "Watch Me Mobile App",
      "description": "Built the Android frontend for a safety and social app supporting video calls and one-tap access to a Response Center. Integrated sensors, GPS, camera, and Nexmo Video SDK from user stories through to production release.",
      "role": "Senior Developer / Tech Lead",
      "tech": [
        "Android (Java)",
        "Nexmo Video SDK",
        "REST API",
        "GPS",
        "Sensors",
        "Camera",
        "Firebase Push Messaging",
        "Firebase Analytics",
        "Firebase Crashlytics",
        "Android Studio",
        "Azure DevOps"
      ],
      "company": "TMA Solutions"
    },
    {
      "name": "City In Your Pocket",
      "description": "Developed dual-platform (iOS Objective-C + Android Java) mobile app for a French city information service, delivering RSS news, live local alerts, and location-aware features. Coordinated with the backend team to define API contracts.",
      "role": "Senior Developer / Tech Lead",
      "tech": [
        "Objective-C",
        "Java (Android)",
        "Cocoa Framework",
        "CLLocationManager",
        "Camera",
        "SQLite",
        "REST API",
        "Android Studio",
        "SVN"
      ],
      "company": "TMA Solutions"
    },
    {
      "name": "Catalog Product Application",
      "description": "Enhanced and maintained an offline-capable iOS sales catalog app, enabling field reps to browse product categories, view images and documents, build collections, and place customer orders without connectivity.",
      "role": "Senior Developer",
      "tech": [
        "Objective-C",
        "FMDB",
        "SQLite",
        "REST API",
        "Xcode"
      ],
      "company": "TMA Solutions"
    },
    {
      "name": "Mobile POS",
      "description": "Designed and built an Android POS and e-menu system for restaurants, integrating with SAP B1 to manage table orders, reservations, and customer-facing digital menus.",
      "role": "Senior Developer",
      "tech": [
        "Android (Java)",
        "SQLite",
        "SQL Server",
        "C#",
        "SOAP API",
        "Sensors",
        "Android Studio",
        "SVN"
      ],
      "company": "SAIGONTECHCOM JSC"
    },
    {
      "name": "Dealer Management System",
      "description": "Built an Android app connected to SAP B1 for dealer networks, covering sales order tracking, inventory management, reporting, and GPS-based dealer location features.",
      "role": "Senior Developer",
      "tech": [
        "Android (Java)",
        "SAP B1",
        "Google Maps",
        "SQLite",
        "SQL Server",
        "C#",
        "SOAP API",
        "GPS",
        "Sensors",
        "Android Studio",
        "SVN"
      ],
      "company": "SAIGONTECHCOM JSC"
    },
    {
      "name": "Mobile Trading",
      "description": "Designed and developed an Android app integrating with SAP B1 ERP, enabling sales reps to create and track orders, manage inventory, and view reports from the field.",
      "role": "Senior Developer",
      "tech": [
        "Android (Java)",
        "SAP B1",
        "SQLite",
        "SQL Server",
        "C#",
        "SOAP API",
        "Android Studio",
        "SVN"
      ],
      "company": "SAIGONTECHCOM JSC"
    },
    {
      "name": "Kid Tracker",
      "description": "Built an Android child-safety tracking app allowing kids to contact parents from anywhere and trigger SOS alerts in emergencies, using GPS and sensor integration.",
      "role": "Android Developer",
      "tech": [
        "Android (Java)",
        "GPS",
        "Sensors",
        "SQLite",
        "Web Service",
        "Eclipse",
        "SVN"
      ],
      "company": "SAIGONTECHCOM JSC"
    },
    {
      "name": "Vehicle Tracker",
      "description": "Developed an Android vehicle monitoring app with real-time GPS tracking and an integrated navigation system to locate company vehicles.",
      "role": "Android Developer",
      "tech": [
        "Android (Java)",
        "GPS",
        "SQLite",
        "Web Service",
        "Eclipse",
        "SVN"
      ],
      "company": "SAIGONTECHCOM JSC"
    },
    {
      "name": "SIP Calls",
      "description": "Built an Android VoIP communication app enabling free international calls and video chat over any internet connection using SIP protocol.",
      "role": "Android Developer",
      "tech": [
        "Android (Java)",
        "SIP",
        "VoIP",
        "SQLite",
        "Eclipse",
        "SVN"
      ],
      "company": "SAIGONTECHCOM JSC"
    },
    {
      "name": "CulinaryMind - AI Avatar Cooking Assistant",
      "description": "Managed end-to-end delivery of a real-time AI cooking assistant featuring a lifelike interactive avatar that guides users through recipes step-by-step like a virtual human chef. Led the team from R&D through production, coordinated with the U.S. client, and drove architecture decisions for real-time avatar rendering and conversational AI integration.",
      "role": "Project Manager",
      "tech": [
        "AI",
        "Machine Learning",
        "Deep Learning",
        "Avatar / Real-time Rendering",
        "NLP",
        "Conversational AI",
        "REST API",
        "WebRTC",
        "React"
      ],
      "company": "TMA Solutions",
      "client": "U.S.",
      "status": "Active"
    },
    {
      "name": "CodeSentinel - Human vs. AI Code Detector",
      "description": "Led an R&D project building ML/DL models to classify whether source code was written by a human or generated by AI. Guided the team through model research, training, and evaluation cycles. Delivered Phase 1 results that impressed the Canadian client so strongly that they extended the project by 6 months for Phase 2 before Phase 1 was even complete - a direct outcome of the team's execution quality under my leadership.",
      "role": "Project Manager",
      "tech": [
        "Machine Learning",
        "Deep Learning",
        "Python",
        "NLP",
        "Code Analysis",
        "Model Training & Evaluation",
        "R&D"
      ],
      "company": "TMA Solutions",
      "client": "Canada",
      "status": "Active - Phase 2 secured mid-Phase 1",
      "achievements": [
        "Delivered Phase 1 results that secured a 6-month Phase 2 extension before Phase 1 was complete",
        "Led team through full ML/DL research-to-delivery cycle, earning strong client recognition"
      ]
    }
  ],
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
        "Serve as primary architect-dividing workloads, assigning tasks, and maintaining project cohesion across multiple teams",
        "Oversee technical strategy to keep development streamlined and efficient",
        "Managed full project lifecycle as Project Manager for international AI/ML R&D engagements with U.S. and Canadian clients"
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
      "industries": [
        "Artificial Intelligence",
        "Healthcare",
        "Education"
      ],
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
      "technologies": [
        "Android",
        "ERP",
        "GPS tracking",
        "SIP/VoIP"
      ],
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
      "technologies": [
        "SAP B1",
        "ERP",
        "Cloud",
        "Virtualization"
      ],
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
      "technologies": [
        "iOS",
        "Android",
        "Agile"
      ],
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
      "technologies": [
        "SAP",
        "VB scripting"
      ],
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
      "technologies": [
        "Delphi 7",
        "Windows",
        "Win32",
        "Interbase FireBird DBMS",
        "C++",
        "CMMI",
        "ISO"
      ],
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
