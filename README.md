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

### 2. Set up Environment Variables

Create a `.env` file in the root directory (based on `.env.example`) and fill in your Firebase configuration keys:

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
```

*Note: Since `.env` is listed in `.gitignore`, it will not be committed to GitHub, keeping your keys safe.*

### 3. Run the app locally

First, install dependencies:

```bash
npm install
```

Then start the Vite local development server:

```bash
npm run dev
```

---

## Deploying to Vercel

When deploying to Vercel, you can safely configure your API keys as secret environment variables:

1. Import your project into Vercel.
2. Vercel will automatically detect the **Vite** project configuration.
3. Before building, go to **Project Settings** → **Environment Variables** in Vercel.
4. Add the following environment variables with your Firebase details:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
5. Trigger a deployment. Your keys will be securely injected at build time!

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
