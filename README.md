# LifeLedger - AI-Powered Personal Finance Forecaster

LifeLedger is a comprehensive personal finance management application that helps users track their finances, forecast future wealth, and receive AI-powered financial advice.

## Features

- 📊 **Financial Dashboard** - Visualize your wealth trajectory with interactive charts
- 🤖 **AI Financial Advisor** - Get personalized financial advice powered by Groq AI (Mixtral model)
- 💰 **Savings Forecast** - Project your future savings with compound interest calculations
- 🏦 **Loan Payoff Calculator** - Track your debt freedom timeline
- 🎯 **Retirement Planning** - Plan your retirement corpus with customizable parameters
- 📈 **Spending Analysis** - Categorize and analyze your spending patterns with ML clustering
- 🔮 **What-If Simulator** - See how saving more impacts your financial future
- 📱 **Offline Support** - Works offline with local storage fallback
- 🔥 **Firebase Integration** - Cloud storage for your financial data

## Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Firebase** - Authentication & database
- **Tesseract.js** - OCR for document upload

### Backend
- **Flask** - Python web framework
- **Groq AI** - AI-powered financial analysis (Mixtral-8x7b model)
- **Scikit-learn** - ML clustering for spending analysis
- **Pandas** - Data processing
- **Python-dateutil** - Date calculations

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- Git

### Backend Setup

1. Navigate to the Server directory:
```bash
cd Server
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - Windows: `.\venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create a `.env` file in the Server directory:
```env
GROQ_API_KEY=your_groq_api_key_here
```

6. Run the backend server:
```bash
python app.py
```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the client directory:
```env
VITE_API_BASE=http://127.0.0.1:8080

# Firebase configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Run the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Environment Variables

### Backend (.env in Server/)
- `GROQ_API_KEY` - Your Groq API key (get it from [console.groq.com](https://console.groq.com))

### Frontend (.env in client/)
- `VITE_API_BASE` - Backend API URL (default: http://127.0.0.1:8080)
- `VITE_FIREBASE_*` - Firebase configuration (get from Firebase console)

## API Endpoints

### POST /forecast
Forecast savings growth over time.
```json
{
  "monthlySaving": 5000,
  "months": 120
}
```

### POST /analyze
Get AI-powered financial advice.
```json
{
  "context": {
    "income": 50000,
    "expenses": 30000,
    "savings": 100000,
    // ... other financial data
  }
}
```

### POST /retirement
Calculate retirement corpus.
```json
{
  "currentSavings": 100000,
  "monthlyContribution": 10000,
  "annualReturnRate": 0.08,
  "months": 360
}
```

### POST /loan-payoff
Calculate loan payoff timeline.
```json
{
  "principal": 500000,
  "monthlyEmi": 15000,
  "annualInterestRate": 0.10
}
```

### POST /analyze/clusters
Analyze spending patterns.
```json
{
  "expenses": {
    "Rent": 15000,
    "Food": 5000,
    "Transport": 3000
  }
}
```

### POST /simulate
Run what-if scenarios.
```json
{
  "baseMonthlySaving": 5000,
  "deltaMonthlySaving": 2000,
  "months": 120
}
```

## Project Structure

```
Lifeledger/
├── Server/                 # Backend Flask application
│   ├── app.py             # Main Flask app with API routes
│   ├── forecast_module.py # Financial calculation functions
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables
│
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── utils/        # Utility functions
│   │   └── firebase.js   # Firebase configuration
│   ├── package.json      # Node dependencies
│   └── .env             # Environment variables
│
└── README.md            # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please open an issue on GitHub.

## Acknowledgments

- Groq AI for providing fast AI inference
- Firebase for backend services
- The open-source community for amazing tools and libraries
