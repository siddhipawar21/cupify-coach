<div align="center">

# ⚽ Cupify Coach
### AI-Powered Multilingual FIFA World Cup 2026 Companion

[![IBM Granite](https://img.shields.io/badge/IBM%20Granite-4--h--small-054ADA?style=for-the-badge&logo=ibm)](https://www.ibm.com/watsonx)
[![Docling](https://img.shields.io/badge/Docling-PDF%20Ingestion-green?style=for-the-badge)](https://github.com/DS4SD/docling)
[![LangChain](https://img.shields.io/badge/LangChain-RAG%20Pipeline-blue?style=for-the-badge)](https://langchain.com)
[![Flask](https://img.shields.io/badge/Flask-REST%20API-black?style=for-the-badge)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge)](https://vitejs.dev)

**IBM SkillsBuild AI Builders Challenge · June 2026**
*Fan & Learning Experiences · Soccer, AI, and the World Cup*

</div>

---

## 🌍 The Problem

The FIFA World Cup 2026 will be watched by over **5 billion people** across 200+ countries — many of whom are casual viewers who don't fully understand what they're watching.

- Rules like **offside** and **VAR** confuse even intermediate fans
- **Tactical shifts** happen and commentators assume you already know why
- **Language barriers** mean billions can't access quality football explanation
- **1.4 billion Hindi speakers**, **83 million Marathi speakers**, **500 million Spanish speakers** are underserved

**Cupify Coach solves this.** An AI companion that explains soccer to *anyone* — in their language, at their level, in real time.

---

## 💡 What It Does

| Feature | Description |
|---|---|
| 🤖 **Ask Anything** | Ask any football question — rules, tactics, formations, World Cup history |
| 🟨 **VAR Explainer** | Describe a controversial incident — get an instant plain-language ruling |
| ⚡ **Match Moment** | Describe what just happened live — AI explains the rule and what happens next |
| 🌐 **4 Languages** | English, Hindi (हिंदी), Marathi (मराठी), Spanish — answers adapt fully |
| 🎓 **3 Knowledge Levels** | Beginner / Intermediate / Fan — depth and vocabulary adapt automatically |
| 🎮 **FIFA Rules Game** | Interactive football game where real FIFA laws trigger as events happen |
| 📡 **Live Match Data** | Real-time scores via Socket.IO — updates every 30 seconds |
| 🎬 **Cinematic Intro** | Stadium-atmosphere intro animation before the app loads |

---

## 🏆 Real-World Impact

```
5,000,000,000+   football fans who could benefit globally
       48        nations competing in FIFA World Cup 2026  
        4        languages supported at launch
       17        FIFA Laws of the Game explained interactively
        3        knowledge levels — from child to expert
        1        mission — make football understandable for everyone
```

---

## 🛠 Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CUPIFY COACH                        │
│                                                         │
│  User Query (any language, any level)                   │
│          │                                              │
│          ▼                                              │
│  ┌───────────────┐    ┌──────────────────────────────┐  │
│  │  React + Vite │    │     Socket.IO Live Data      │  │
│  │  Frontend     │◄───│  football-data.org API       │  │
│  └───────┬───────┘    └──────────────────────────────┘  │
│          │                                              │
│          ▼  REST API                                    │
│  ┌───────────────────────────────────────────────┐     │
│  │            Flask Backend                      │     │
│  │                                               │     │
│  │  ┌─────────────┐    ┌────────────────────┐   │     │
│  │  │   Docling   │    │   RAG Pipeline     │   │     │
│  │  │ FIFA PDFs → │───►│  LangChain +       │   │     │
│  │  │ structured  │    │  FAISS Vector DB   │   │     │
│  │  │   chunks    │    │  sentence-         │   │     │
│  │  └─────────────┘    │  transformers      │   │     │
│  │                     └────────┬───────────┘   │     │
│  │                              │ Top-K chunks  │     │
│  │                              ▼               │     │
│  │                  ┌───────────────────────┐   │     │
│  │                  │   IBM Granite         │   │     │
│  │                  │   granite-4-h-small   │   │     │
│  │                  │   via Watsonx.ai      │   │     │
│  │                  │                       │   │     │
│  │                  │  Multilingual answer  │   │     │
│  │                  │  adapted to level     │   │     │
│  │                  └───────────────────────┘   │     │
│  └───────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### IBM Technologies Used
| Technology | Role | Version |
|---|---|---|
| **IBM Granite** | Answer generation — multilingual, level-adaptive | `granite-4-h-small` |
| **Docling** | FIFA PDF → structured text extraction for RAG | `2.5.0` |
| **Watsonx.ai** | Cloud hosting for IBM Granite inference | Runtime |

### Open Source Stack
| Technology | Role |
|---|---|
| **LangChain** | RAG pipeline orchestration |
| **FAISS** | Vector similarity search (semantic retrieval) |
| **sentence-transformers** | Free local embeddings (`all-MiniLM-L6-v2`) |
| **Flask + Flask-CORS** | REST API + Socket.IO backend |
| **Flask-SocketIO** | Real-time live match data broadcast |
| **React + Vite** | Responsive, fast frontend |
| **socket.io-client** | Frontend real-time connection |

---

## 🚀 Setup & Run

### Prerequisites
- Python 3.11
- Node.js 18+
- IBM Watsonx.ai account (free tier)

### Step 1 — Clone
```bash
git clone https://github.com/YOUR_USERNAME/cupify-coach
cd cupify-coach
```

### Step 2 — Backend setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env — add your IBM Watsonx credentials
```

### Step 3 — Configure `.env`
```env
WATSONX_API_KEY=your_ibm_api_key
WATSONX_PROJECT_ID=your_project_id
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_MODEL=ibm/granite-4-h-small

# Optional — free from football-data.org
FOOTBALL_API_KEY=your_football_key
```

### Step 4 — Build knowledge base
```bash
# Add FIFA PDFs to /data folder (optional but recommended)
python knowledge/knowledge_pipeline.py
```

### Step 5 — Start backend
```bash
python app.py
# API running at http://localhost:5000
```

### Step 6 — Start frontend
```bash
cd ../frontend
npm install
npm run dev
# App running at http://localhost:3000
```

---

## 📁 Project Structure

```
cupify-coach/
├── README.md
├── .gitignore
├── data/                          ← FIFA PDFs (Docling ingests these)
├── backend/
│   ├── app.py                     ← Flask + Socket.IO entry point
│   ├── requirements.txt
│   ├── .env.example
│   ├── knowledge/
│   │   └── knowledge_pipeline.py  ← Docling + FAISS builder
│   ├── routes/
│   │   └── api_routes.py          ← /api/ask, /api/explain, /api/topics
│   └── utils/
│       ├── rag_engine.py          ← IBM Granite RAG engine
│       └── realtime_data.py       ← Live match data fetcher
└── frontend/
    └── src/
        ├── App.jsx
        ├── api.js
        ├── hooks/
        │   └── useLiveData.js     ← Socket.IO live data hook
        └── components/
            ├── Header.jsx
            ├── QuestionInput.jsx  ← Ask / VAR / Match Moment modes
            ├── AnswerCard.jsx
            ├── TopicSuggestions.jsx
            ├── LiveMatchBar.jsx   ← Real-time score ticker
            ├── Intro.jsx          ← Cinematic stadium intro
            └── FootballGame.jsx   ← Interactive FIFA rules game
```

---

## 🌐 API Reference

### POST /api/ask
```json
{
  "question": "What is VAR?",
  "level": "Beginner",
  "language": "Hindi"
}
```

### POST /api/explain (VAR mode)
```json
{
  "incident": "The referee cancelled a goal after 3 minutes of VAR review",
  "level": "Intermediate",
  "language": "English"
}
```

### GET /api/live
```json
{
  "matches": [{"home":"Brazil","away":"Argentina","home_score":2,"away_score":1,"minute":74}],
  "scorers": [{"name":"Mbappé","team":"France","goals":4}],
  "timestamp": "21:43:12"
}
```

### GET /api/topics
Returns suggested quick-start topics by category.

---

## 🎮 Interactive FIFA Rules Game

Cupify Coach includes a fully interactive football game where **real FIFA Laws trigger as events happen**:

| Event | Law Triggered |
|---|---|
| Ball crosses touchline | Law 15 — Throw-In (with full explanation) |
| Foul committed | Law 12 — Fouls & Misconduct |
| Yellow card issued | Law 12 — Caution |
| Red card | Law 12 — Dismissal |
| Goal scored | Law 10 — Method of Scoring |
| Ball over goal line | Law 16/17 — Goal Kick / Corner Kick |
| Player in offside position | Law 11 — Offside |
| Penalty awarded | Law 14 — Penalty Kick |
| Half time | Law 7 — Duration of Play |

---

## 🌐 Why This Matters

The World Cup is one of the few moments the entire world watches together. But enjoyment and trust in the game depend on understanding it:

- A **child in Mumbai** watching her first match
- A **grandmother in Pune** following her grandson's national team  
- A **fan in Mexico City** arguing about a VAR call in Spanish

All deserve access to clear, accurate football explanations — in their own language, at their own level, in real time.

Cupify Coach is human-centered, explainable AI — it doesn't predict scores or replace referees. It helps **5 billion people understand the beautiful game**.

---

## 👤 Team

| Name | Role | University |
|---|---|---|
| Siddhi | AI & Data Science, Full Stack | SPPU (Savitribai Phule Pune University) |

---

## 📄 License

MIT License — open for learning and collaboration.

---

<div align="center">

**Built with ❤️ for the IBM SkillsBuild AI Builders Challenge · June 2026**

*IBM Granite · Docling · LangChain · FAISS · Flask · React*

</div>