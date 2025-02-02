import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import RidesPage from "./pages/RidesPage";
import "./App.css";
import NewDrivePage from "./pages/NewDrive";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/rides" element={<RidesPage />} />
          <Route path="/newDrive" element={<NewDrivePage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;