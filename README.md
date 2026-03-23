# ₹ HISAAB — Loan & Payment Tracker

A clean, mobile-first web app to track personal loans and payment records, built with Firebase Firestore for real-time sync.

---

## Features

- **Add borrowers** with principal amount and date given
- **Set interest rate (%)** and **loan duration (months)** per person
- **Auto-calculates** total payable amount, net balance remaining, and monthly EMI
- **Record payments** received with date
- **Delete payments** or entire borrower records
- **Search** borrowers by name
- **Real-time sync** via Firebase Firestore — works across devices instantly
- **Indian number formatting** (e.g. 1,00,000)

---

## Tech Stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Frontend   | HTML, Tailwind CSS (CDN)             |
| Logic      | Vanilla JavaScript (ES Modules)      |
| Database   | Firebase Firestore (real-time)       |

---

## Project Structure

```
hisaab/
├── index.html      # UI layout and modals
├── script.js       # App logic, Firebase integration
└── favicon.png     # App icon
```

---

## Getting Started

### 1. Clone or download the project

```bash
git clone https://github.com/your-username/hisaab.git
cd hisaab
```

### 2. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Enable **Firestore Database** (in test mode for development)
3. Register a **Web App** and copy your Firebase config
4. In `script.js`, replace the `firebaseConfig` object with your own:

```js
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. Set Firestore Rules

In Firebase Console → **Firestore → Rules**, set:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ This is for personal/trusted use. Add authentication before making the app public.

### 4. Run the app

Simply open `index.html` in a browser, or serve it with any static file server:

```bash
npx serve .
```

---

## How It Works

### Adding a Borrower
Click the **+** button → Enter name, amount, and date → Hit **Create**.

### Viewing a Record
Tap any card on the dashboard to open the detail view.

### Setting Interest & Duration
In the detail view, enter the interest percentage and number of months. The app auto-calculates:
- **Total Payable** = Principal + (Principal × Rate / 100)
- **Net Balance** = Total Payable − Total Paid
- **Monthly EMI** = Total Payable ÷ Duration

### Recording a Payment
Tap **Record Payment** → Enter amount and date → **Save Payment**.

### Deleting
- Delete a **payment**: tap the red trash icon next to any transaction
- Delete a **borrower**: tap the trash icon in the top-right of the detail view

---
