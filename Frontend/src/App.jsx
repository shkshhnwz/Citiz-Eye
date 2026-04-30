import './App.css'
import { Routes, Route } from 'react-router-dom';
import Navbar from "./components/mycomponents/navbar";
import About from "./components/mycomponents/About";
import Feed from "./components/mycomponents/Feed"; // 1. Import the Feed component
import ReportForm from "./components/mycomponents/Report";

function App() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* 2. This makes the Feed show up at http://localhost:5173/ */}
          <Route path="/" element={<Feed />} /> 
          
          {/* 3. This makes About show up at http://localhost:5173/about */}
          <Route path="/about" element={<About />} />
          
          {/* 4. Future Route for your form */}
          <Route path="/report" element={<ReportForm />} />
        </Routes>
      </main>
    </div>
  )
}

export default App