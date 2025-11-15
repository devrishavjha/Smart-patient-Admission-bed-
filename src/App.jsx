import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import BedSimulate from "./pages/BedSimulate";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/beds/:id" element={<BedSimulate />} />
      </Routes>
    </Router>
  );
}
