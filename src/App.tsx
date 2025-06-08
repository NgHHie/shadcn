// src/App.tsx (Updated with Auth Guard)
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
import { AuthRouteGuard } from "./components/auth/auth-route-guard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <AuthRouteGuard requireAuth={false}>
              <Login />
            </AuthRouteGuard>
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <AuthRouteGuard>
              <MainLayout>
                <Page />
              </MainLayout>
            </AuthRouteGuard>
          }
        />

        {/* Editor route without question ID - just show empty editor */}
        <Route
          path="/question-detail"
          element={
            <AuthRouteGuard>
              <MainLayout>
                <Editor />
              </MainLayout>
            </AuthRouteGuard>
          }
        />

        <Route
          path="/"
          element={
            <AuthRouteGuard>
              <MainLayout>
                <Editor />
              </MainLayout>
            </AuthRouteGuard>
          }
        />

        {/* Editor route with question ID - load specific question */}
        <Route
          path="/question-detail/:questionId"
          element={
            <AuthRouteGuard>
              <MainLayout>
                <Editor />
              </MainLayout>
            </AuthRouteGuard>
          }
        />

        <Route
          path="/history"
          element={
            <AuthRouteGuard>
              <MainLayout>
                <HistoryPage />
              </MainLayout>
            </AuthRouteGuard>
          }
        />

        <Route
          path="/rank"
          element={
            <AuthRouteGuard>
              <MainLayout>
                <RankPage />
              </MainLayout>
            </AuthRouteGuard>
          }
        />

        <Route
          path="/contest"
          element={
            <AuthRouteGuard>
              <MainLayout>
                <ContestPage />
              </MainLayout>
            </AuthRouteGuard>
          }
        />

        <Route
          path="/profile"
          element={
            <AuthRouteGuard>
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            </AuthRouteGuard>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
