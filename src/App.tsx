import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Page } from "./app/dashboard/page";
import { Editor } from "./app/editor/page";
import { Login } from "./login";
import { MainLayout } from "./layouts/MainLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" Component={Login} />
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <Page />
            </MainLayout>
          }
        />
        <Route
          path="/editor"
          element={
            <MainLayout>
              <Editor />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
