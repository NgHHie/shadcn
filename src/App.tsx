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
              <AuthRouteGuard requireAuth={true}>
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
              <AuthRouteGuard requireAuth={true}>
                <MainLayout>
                  <Editor />
                </MainLayout>
              </AuthRouteGuard>
            }
          />

          <Route
            path="/"
            element={
              <AuthRouteGuard requireAuth={true}>
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
              <AuthRouteGuard requireAuth={true}>
                <MainLayout>
                  <Editor />
                </MainLayout>
              </AuthRouteGuard>
            }
          />

          <Route
            path="/history"
            element={
              <AuthRouteGuard requireAuth={true}>
                <MainLayout>
                  <HistoryPage />
                </MainLayout>
              </AuthRouteGuard>
            }
          />

          <Route
            path="/rank"
            element={
              <AuthRouteGuard requireAuth={true}>
                <MainLayout>
                  <RankPage />
                </MainLayout>
              </AuthRouteGuard>
            }
          />

          <Route
            path="/contest"
            element={
              <AuthRouteGuard requireAuth={true}>
                <MainLayout>
                  <ContestPage />
                </MainLayout>
              </AuthRouteGuard>
            }
          />

          <Route
            path="/profile"
            element={
              <AuthRouteGuard requireAuth={true}>
                <MainLayout>
                  <ProfilePage />
                </MainLayout>
              </AuthRouteGuard>
            }
          />

          {/* Quiz routes */}
          <Route
            path="/quiz/quiz-list"
            element={
              <AuthRouteGuard requireAuth={true}>
                <MainLayout>
                  <QuizListPage />
                </MainLayout>
              </AuthRouteGuard>
            }
          />

          <Route
            path="/quiz/quiz-detail/:quizId"
            element={
              <AuthRouteGuard requireAuth={true}>
                <MainLayout>
                  <QuizDetailPage />
                </MainLayout>
              </AuthRouteGuard>
            }
          />

          <Route
            path="/quiz/take/:quizId"
            element={
              <AuthRouteGuard requireAuth={true}>
                <MainLayout>
                  <QuizTakingPage />
                </MainLayout>
              </AuthRouteGuard>
            }
          />

          <Route
            path="/quiz/quiz-result/:id"
            element={
              <AuthRouteGuard requireAuth={true}>
                <MainLayout>
                  <QuizResultPage />
                </MainLayout>
              </AuthRouteGuard>
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
