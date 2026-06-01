import './App.css'
import { Routes, Route } from 'react-router-dom';
import Navbar from "./components/mycomponents/navbar";
import About from "./components/mycomponents/About";
import Feed from "./components/mycomponents/Feed";
import ReportForm from "./components/mycomponents/Report";
import HistoryOfReports from './components/mycomponents/HistoryOfReports';
import { LoginForm } from "./components/mycomponents/Loginpageform";
import AdminDashboard from "./components/mycomponents/adminDashboard";
import Signup from "./components/mycomponents/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/about" element={<About />} />
          <Route path="/report" element={<ProtectedRoute><ReportForm /></ProtectedRoute>} />
          <Route path="/my-reports" element={<ProtectedRoute><HistoryOfReports /></ProtectedRoute>} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}

export default App