# CommonGround — Multilingual Community Notice Board

A beginner-friendly B.Tech CSE project made with HTML, CSS, JavaScript, Node.js and Express.

## 1. What this project does

Community admins can publish a notice and add its versions in multiple languages. Visitors can search notices, filter by category, and choose a reading language. The notice details show the translation status of each language version.

## 2. Requirements

Install **Node.js (LTS version)** on your computer. You can check whether it is installed by opening Terminal / Command Prompt and running:

```bash
node -v
npm -v
```

## 3. Run the project

1. Extract the ZIP file.
2. Open the extracted `multilingual-community-notice-board` folder in VS Code.
3. Open the VS Code terminal (**Terminal → New Terminal**).
4. Run:

```bash
npm install
npm start
```

5. Open this address in your browser:

```text
http://localhost:3000
```

Keep the terminal running while you use the website. To stop the server, press `Ctrl + C`.

## 4. Demo login

| Role | Username | Password |
|---|---|---|
| Administrator | `admin` | `admin123` |
| Viewer account | `viewer` | `viewer123` |

Only the administrator can create notices. Everyone can read published notices. The viewer login is included to demonstrate role-based access.

## 5. Folder structure

```text
multilingual-community-notice-board/
│
├── data/
│   └── notices.json       # Sample notices and saved notice data
│
├── public/
│   ├── index.html         # Website structure
│   ├── style.css          # Website design and responsive layout
│   └── app.js             # Browser interactions and API requests
│
├── package.json           # Project information and dependencies
├── server.js              # Node.js + Express backend
└── README.md              # Setup guide and explanation
```

## 6. How the project works

**Frontend:** The browser loads `index.html`, applies `style.css`, and runs `app.js`. JavaScript uses `fetch()` to request information from the backend.

**Backend:** `server.js` starts an Express server. It defines API routes such as `GET /api/notices`, `POST /api/notices`, and `POST /api/login`.

**Storage:** `data/notices.json` stores the notice records. When an admin publishes a notice, the backend reads the JSON file, adds the new notice, and saves the updated file.

**Language versions:** Each notice has a `versions` array. Every item stores a language name, language code, translated title, translated content and translation status. This prototype uses manually entered translations; it does not automatically translate text.

**Roles:** The demo login stores the signed-in user's role in a server session. The backend checks the role before allowing notice creation, editing or deletion. Hiding an admin button in the browser is not security by itself—the server check is important.

## 7. API routes

| Method | Route | Purpose | Access |
|---|---|---|---|
| POST | `/api/login` | Sign in | Everyone |
| POST | `/api/logout` | Sign out | Signed-in user |
| GET | `/api/me` | Check current session | Everyone |
| GET | `/api/notices` | Get published, unexpired notices | Everyone |
| GET | `/api/admin/notices` | Get all notices | Admin |
| POST | `/api/notices` | Create a notice | Admin |
| PUT | `/api/notices/:id` | Update a notice | Admin |
| DELETE | `/api/notices/:id` | Delete a notice | Admin |

The update and delete APIs are provided for the next development stage; the current page demonstrates notice creation and reading.

## 8. Important viva questions

**Q1. What is frontend?**  
Frontend is the part of a website that the user sees and interacts with. In this project, HTML, CSS and browser-side JavaScript form the frontend.

**Q2. What is backend?**  
Backend runs on the server. It receives requests, checks permissions, reads or updates data, and sends responses. Here, Node.js and Express are the backend.

**Q3. What is an API?**  
An API is a way for two parts of software to communicate. For example, the frontend sends a request to `/api/notices` and the backend responds with notice data in JSON format.

**Q4. What is JSON?**  
JSON stands for JavaScript Object Notation. It is a text format for storing and exchanging structured data. We use it to store notices.

**Q5. What is the purpose of `fetch()`?**  
`fetch()` lets browser JavaScript send a request to the backend and receive its response.

**Q6. What is middleware in Express?**  
Middleware is a function that runs during the request-response process. `requireAdmin` checks whether the current session belongs to an administrator before allowing an admin operation.

**Q7. How are multiple languages stored?**  
A notice contains an array named `versions`. Each version contains the language, translated title, translated content and translation status.

**Q8. How does search work?**  
JavaScript checks whether the search text appears in the notice title, category or any language version, then displays matching notices.

**Q9. How is expiry handled?**  
The backend compares the expiry date with today's date and does not return expired notices from the public notices API.

**Q10. Does this project use automatic translation?**  
No. It stores manually provided language versions and tracks their status. Automatic translation could be added later using a translation API.

## 9. Limitations and future scope

This is a **college demonstration prototype**, not a production-ready public service. It uses a local JSON file, demo credentials, and a simple session configuration. For real deployment, add a database such as MongoDB or PostgreSQL, securely hashed passwords, stronger session/cookie settings, HTTPS, input validation, CSRF protection, and proper admin account management.

Possible future improvements:
- Automatic translation using a translation service.
- Edit and delete controls in the admin dashboard.
- More Indian and international languages.
- Email or SMS notifications.
- MongoDB database integration.
- Admin dashboard showing pending translations.

## 10. Suggested viva explanation

"My project is a multilingual community notice board. The frontend is developed using HTML, CSS and JavaScript. The backend uses Node.js and Express. When the page opens, JavaScript calls the notices API using fetch. The Express server reads notice data from a JSON file and returns it to the frontend. Each notice stores multiple language versions with a translation status. Visitors can search and filter notices, while an administrator can log in and publish new notices. The purpose is to make important community information accessible to people who speak different languages."
