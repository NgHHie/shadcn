import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Dashboard } from "./dashboard";
import { Page } from "./app/dashboard/page";
import { Editor } from "./app/editor/page";
import { Login } from "./login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" Component={Login} />
        <Route path="/dashboard" Component={Page} />
        <Route path="/editor" Component={Editor} />
      </Routes>
    </Router>
  );
}

export default App;
