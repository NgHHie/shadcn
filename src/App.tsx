// src/App.tsx
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Page } from "./app/dashboard/page";
import { Editor } from "./app/editor/page";
import { HistoryPage } from "./app/history/page";
import { ProfilePage } from "./app/profile/page";
import { Login } from "./login";
import { MainLayout } from "./layouts/MainLayout";
import { RankPage } from "./app/rank/page";
import { ContestPage } from "./app/contest/page";

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
        {/* Editor route without question ID - just show empty editor */}
        <Route
          path="/editor"
          element={
            <MainLayout>
              <Editor />
            </MainLayout>
          }
        />
        {/* Editor route with question ID - load specific question */}
        <Route
          path="/question-detail/:questionId"
          element={
            <MainLayout>
              <Editor />
            </MainLayout>
          }
        />
        <Route
          path="/history"
          element={
            <MainLayout>
              <HistoryPage />
            </MainLayout>
          }
        />
        <Route
          path="/rank"
          element={
            <MainLayout>
              <RankPage />
            </MainLayout>
          }
        />
        <Route
          path="/contest"
          element={
            <MainLayout>
              <ContestPage />
            </MainLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
