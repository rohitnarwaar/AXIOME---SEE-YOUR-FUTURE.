import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import InputPage from "./pages/InputPage";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";

function AppContent() {
  const location = useLocation();
  const showNavbar = location.pathname !== '/';

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/input" element={<InputPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<h1 className="text-center mt-10">404 - Page Not Found</h1>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
