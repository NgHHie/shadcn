// src/App.tsx (Updated with Auth Guard and Quiz)
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

// Quiz components
import QuizListPage from "./app/quiz/quiz-list";
import QuizDetailPage from "./app/quiz/quiz-detail";
import QuizTakingPage from "./app/quiz/quiz-taking";
import QuizResultPage from "./app/quiz/quiz-result";

// Context Providers
import { UserProvider } from "./contexts/UserContext";

function App() {
  return (
    <UserProvider>
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
              <MainLayout>
                <Page />
              </MainLayout>
            }
          />

          {/* Editor route without question ID - just show empty editor */}
          <Route
            path="/question-detail"
            element={
              <MainLayout>
                <Editor />
              </MainLayout>
            }
          />

          <Route
            path="/"
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

          {/* Quiz routes */}
          <Route
            path="/quiz/quiz-list"
            element={
              <MainLayout>
                <QuizListPage />
              </MainLayout>
            }
          />

          <Route
            path="/quiz/quiz-detail/:quizId"
            element={
              <MainLayout>
                <QuizDetailPage />
              </MainLayout>
            }
          />

          <Route
            path="/quiz/take/:quizId"
            element={
              <MainLayout>
                <QuizTakingPage />
              </MainLayout>
            }
          />

          <Route
            path="/quiz/quiz-result/:id"
            element={
              <MainLayout>
                <QuizResultPage />
              </MainLayout>
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
