# Chaat N Chill Dashboard

Beginner-friendly guide for opening, editing, uploading, and publishing this app.

## 1. How to Open the Project

1. Open **Command Prompt** or **PowerShell**.
2. Go to this project folder:

```powershell
cd C:\Users\GIG\Documents\Codex\2026-05-17\https-fresh-juice-shop-bil-7uay-2
```

3. Start the local web server:

```powershell
python serve_static.py
```

4. Open this link in your browser:

```text
http://127.0.0.1:4173/
```

Keep the command window open. If you close it, the local website stops.

## 2. How to Edit the Code

You can edit files with **Notepad**, **VS Code**, or any code editor.

Important files:

```text
index.html
assets/chaat-n-chill-settings.js
assets/chaat-n-chill-overrides.css
assets/chaat-n-chill-logo.png
serve_static.py
```

What they do:

```text
index.html
Loads the website files. Also controls the page title, logo, CSS, and custom JavaScript.

assets/chaat-n-chill-settings.js
Controls App Settings, Edit Bills, Delete Bill, Cloud Storage links, Google Form fields, profile, theme, and contact settings.

assets/chaat-n-chill-overrides.css
Controls the custom design for Chaat N Chill settings, buttons, cards, confirmation popup, and mobile layout.

assets/chaat-n-chill-logo.png
Your Chaat N Chill logo.

serve_static.py
Small local server used to open the project on http://127.0.0.1:4173/
```

After editing, refresh the browser.

If the old design still appears, press:

```text
Ctrl + F5
```

## 3. Google Form and Google Sheets Idea

In the app, open:

```text
App Settings > Cloud Storage
```

Paste links here:

```text
Google Sheets URL
Google Form URL
```

Create a Google Form with these fields:

```text
Bill No
Customer Name
Date
Amount
Item Details
```

Connect form responses to Google Sheets:

1. Open your Google Form.
2. Click **Responses**.
3. Click the green **Google Sheets** icon.
4. Create a new spreadsheet or select an existing one.
5. Copy the Google Sheet URL.
6. Paste it in the app under **Google Sheets URL**.
7. Copy the Google Form URL.
8. Paste it in the app under **Google Form URL**.
9. Click **Save Cloud Settings**.

Current status: the app saves these links locally. A future API integration can use them to send bill data automatically.

## 4. How to Upload to GitHub

### Option A: Upload Using Git Commands

1. Create a GitHub account:

```text
https://github.com
```

2. Create a new repository named:

```text
chaat-n-chill-dashboard
```

3. Open Command Prompt in this project folder.
4. Run:

```powershell
git init
git add .
git commit -m "Initial Chaat N Chill dashboard"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/chaat-n-chill-dashboard.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username.

### Option B: Upload Using GitHub Website

1. Open your GitHub repository.
2. Click **Add file**.
3. Click **Upload files**.
4. Drag and drop all project files and folders.
5. Click **Commit changes**.

Make sure you upload:

```text
index.html
assets/
serve_static.py
README.md
vite.svg
```

## 5. How to Deploy Using GitHub Pages

1. Open your GitHub repository.
2. Click **Settings**.
3. Click **Pages** in the left sidebar.
4. Under **Build and deployment**, choose:

```text
Source: Deploy from a branch
Branch: main
Folder: /root
```

5. Click **Save**.
6. Wait a few minutes.
7. GitHub will show your website link.

Your link will look like:

```text
https://YOUR-USERNAME.github.io/chaat-n-chill-dashboard/
```

## Notes

- Edit and Delete bills are inside **App Settings > Edit Bills**.
- Reports page stays clean.
- Delete Bill asks for confirmation before removing a bill.
- Profile, theme, contact, and cloud settings save in browser localStorage.
- The Made in Bolt button has been removed.
