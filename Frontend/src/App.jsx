import './App.css'
import { Routes, Route } from 'react-router-dom';
import Navbar from "./components/mycomponents/navbar";
import About from "./components/mycomponents/About";

function App() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/about" element={<About />} />
          {/* Add other routes here later */}
        </Routes>
      </main>
    </>
  )
}

export default App
