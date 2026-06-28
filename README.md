# 🧳 TripGenie — Your AI Trip Companion

TripGenie is an AI-powered travel planning web app that generates a complete, 
personalized trip starter kit from a single form. Enter your destination, dates, 
budget, and interests — and get four AI-generated outputs in seconds.

Built for the **Decoding Data Science Build AI Application Challenge — 12th Edition** 
(June 2026).

---

## 🌍 Live Demo

👉https://your-travel-wizard.lovable.app/

---

## 🎯 The Problem

Planning a trip means juggling four separate tasks across multiple browser tabs, 
blogs, and spreadsheets — all before the trip even starts:

- Building a day-by-day itinerary
- Figuring out what to pack
- Splitting a budget across categories
- Researching local customs and key phrases

TripGenie solves all four in one place.

---

## ✨ Features

| Tab | What it does |
|-----|-------------|
| 🗓️ Itinerary | Day-by-day activity plan with morning, afternoon and evening slots |
| 🎒 Packing List | Categorized packing list tailored to destination, season and activities |
| 💰 Budget Breakdown | Budget split by category with money-saving tips |
| 🌍 Culture & Phrases | Key local phrases, etiquette tips and tourist mistakes to avoid |

---

## 🛠️ Tools & Stack

| Layer | Tool |
|-------|------|
| Frontend | Lovable (React) |
| AI / LLM | OpenAI API |
| Automation | Zapier (Webhook → Gmail) |
| Version Control | GitHub |

---

## 🔁 How It Works

1. User fills the input form — destination, dates, budget, currency, interests
2. Form data is validated before submission
3. Four separate AI calls fire in parallel, one per output tab
4. Each tab renders a loading skeleton then replaces it with formatted AI output
5. A Zapier webhook catches the full payload and emails the trip plan to the user

---

## 🧠 Prompt Engineering

Each of the four tabs uses a dedicated prompt. All prompts share three core rules:

- **Never ask follow-up questions** — generate immediately using only the form inputs
- **Variables injected from the form** — destination, dates, budget, currency and 
  interests are passed dynamically into every prompt
- **Structured output format** — each prompt specifies the exact format so the UI 
  renders it cleanly (day headings, categories, bullet points)

---

## ⚙️ How to Run Locally

1. Clone the repository
2. 2. Open the project in [Lovable](https://lovable.dev) or your preferred React environment
3. Add your OpenAI API key to the environment variables
4. Add your Zapier webhook URL to the form submission handler
5. Run the development server

---

## 🧪 Evaluation

Five test cases were run across different destinations, trip lengths, and budgets. 
Average output quality rating: **4.4 / 5**.

Two bugs were identified and resolved during testing:
- 404 error on the results page (React Router misconfiguration — fixed)
- AI asking follow-up questions instead of generating (fixed via prompt engineering)

---

## 🚀 Future Improvements

- Multi-traveler support (budget per person)
- Save and retrieve past trips (Supabase backend)
- Regenerate individual tabs without resubmitting the form
- Map view of the itinerary (Google Maps API)
- Multi-language output

---

## 📹 Explainer Video

https://drive.google.com/file/d/160OodkzJoXUSb4EOZRYTw10gzapWtKQ1/view?usp=drive_link

---

## 🏆 Challenge

Built during the [Decoding Data Science Build AI Application Challenge — 12th Edition]
(https://decodingdatascience.com/ai-application-challenge/)

---
