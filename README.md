# ONE'S OWN / LifeLedger 🚀

**AI-Powered Financial Forecasting & Wealth Management**

LifeLedger (rebranded as ONE'S OWN in the UI) is a cutting-edge personal finance application that goes beyond simple tracking. It creates a "Digital Twin" of your financial life, using AI to forecast your Net Worth, Retirement Corpus, and Debt Freedom timeline in real-time based on your daily transaction behavior.

![Dashboard Preview](client/public/vite.svg) *Add a screenshot here if available*

---

## 🌟 Key Features

### 1. **Real-time Financial Digital Twin**
- **Live Net Worth Forecast**: The moment you add a transaction, your 10-year wealth projection updates instantly.
- **Dynamic Retirement Corpus**: See how today's coffee vs. investment choice impacts your retirement pot 30 years from now.
- **Debt Freedom Tracker**: Tracks your loan repayments in real-time and predicts exactly when you'll be debt-free.

### 2. **Smart Transaction Management**
- **Quick Add**: Log Income and Expenses in seconds.
- **Multi-Add Mode**: Add multiple transactions in a row without closing the interface.
- **Cloud Persistence**: All data is securely stored in Google Firebase Firestore.

### 3. **AI Financial Advisor (Gemini Powered)**
- **Context-Aware Insights**: The AI doesn't just know your salary; it sees your *actual spending* this month.
- **Real-time Coaching**: If you overspend, the Advisor immediately warns you about the impact on your savings rate.
- **Personalized Strategy**: Adapts advice based on whether you are in "Growth", "Balanced", or "Preservation" mode.

### 4. **Budgeting & Goals**
- **Monthly Budget Bar**: Visual red/yellow/green indicator of your monthly spending limit.
- **Goal Tracking**: Set financial targets (e.g., "Buy a Tesla") and track progress.

### 5. **Spending Clusters** (Machine Learning)
- **K-Means Clustering**: Automatically categorizes your spending habits into "High", "Medium", and "Low" impact clusters to help you identify cost-cutting opportunities.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/) + Custom CSS
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Database**: [Firebase Firestore](https://firebase.google.com/)

### Backend
- **Server**: [Flask](https://flask.palletsprojects.com/) (Python)
- **AI Engine**: Google Gemini (via LangChain/Direct API)
- **Data Science**: Pandas, Scikit-learn (K-Means Clustering)

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v16+)
- Python 3.8+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/rohitnarwaar/Sho-AI-Finance-Forecaster.git
cd Lifeledger
```

### 2. Backend Setup (Flask)
Navigate to the Server folder and install dependencies:
```bash
cd Server
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in `Server/` with your API keys:
```env
# Google Gemini API Key for AI Advisor
GEMINI_API_KEY=your_gemini_api_key
```

Run the server:
```bash
python app.py
```
*Server runs on `http://localhost:8080`*

### 3. Frontend Setup (React)
Navigate to the client folder:
```bash
cd ../client
npm install
```

Create a `.env` file in `client/` with Firebase & API config:
```env
# Backend URL
VITE_API_BASE=http://localhost:8080

# Firebase Config (Get from Firebase Console)
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender
VITE_FIREBASE_APP_ID=your_app_id
```

Run the frontend:
```bash
npm run dev
```
*App runs on `http://localhost:5173`*

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/forecast` | 10-year Net Worth projection based on real-time savings. |
| **POST** | `/retirement` | Retirement corpus calculation with compound interest. |
| **POST** | `/loan-payoff` | Debt freedom timeline based on principal & extra payments. |
| **POST** | `/analyze` | AI Advisor generation (uses Gemini). |
| **POST** | `/analyze/clusters` | ML-based spending categorization. |

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/NewCoolThing`).
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request.

---

**Built with ❤️ for Financial Freedom.**
