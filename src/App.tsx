// src/App.tsx (Updated with Auth Guard and Quiz)
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Page } from "./app/exercise/page";
import { Editor } from "./app/editor/page";
import { HistoryPage } from "./app/history/page";
import { ProfilePage } from "./app/profile/page";
import { MainLayout } from "./layouts/MainLayout";
import { RankPage } from "./app/rank/page";
import { ContestPage } from "./app/contest/page";
import { AuthRouteGuard } from "./components/auth/auth-route-guard";
import { HomePage } from "./app/home";
import { SchedulePage } from "./app/schedule/page";

// Quiz components
import QuizListPage from "./app/quiz/quiz-list";
import QuizDetailPage from "./app/quiz/quiz-detail";
import QuizTakingPage from "./app/quiz/quiz-taking";
import QuizResultPage from "./app/quiz/quiz-result";
import { ContestWaitingPage } from "./app/contest-waiting/page";
import { ContestEditor } from "@/app/contest-editor/page";

// Context Providers
import { UserProvider } from "./contexts/UserContext";
import Login from "./app/auth/login";
import Register from "./app/auth/register";
import { ContestJoinedPage } from "./app/contest-joined/page";

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

          <Route
            path="/register"
            element={
              <AuthRouteGuard requireAuth={false}>
                <Register />
              </AuthRouteGuard>
            }
          />

          {/* Protected routes */}
          <Route
            path="/home"
            element={
              <AuthRouteGuard requireAuth={true}>
                <MainLayout>
                  <HomePage />
                </MainLayout>
              </AuthRouteGuard>
            }
          />

          <Route
            path="/"
            element={
              <AuthRouteGuard requireAuth={true}>
                <MainLayout>
                  <HomePage />
                </MainLayout>
              </AuthRouteGuard>
            }
          />

          <Route
            path="/exercise"
            element={
              <AuthRouteGuard requireAuth={true}>
                <MainLayout>
                  <Page />
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
            path="/contest-waiting/:contestId"
            element={
              <AuthRouteGuard requireAuth={true}>
                <ContestWaitingPage />
              </AuthRouteGuard>
            }
          />

          <Route
            path="/contest-joined/:contestId"
            element={
              <AuthRouteGuard requireAuth={true}>
                <ContestJoinedPage />
              </AuthRouteGuard>
            }
          />
          <Route
            path="/contest-joined/:contestId/question/:innerQuestionId/:outerQuestionId"
            element={
              <AuthRouteGuard requireAuth={true}>
                <ContestEditor />
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
                <QuizTakingPage />
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

          {/* Schedule route */}
          <Route
            path="/schedule"
            element={
              <AuthRouteGuard requireAuth={true}>
                <MainLayout>
                  <SchedulePage />
                </MainLayout>
              </AuthRouteGuard>
            }
          />

          {/* Demo route cho home page */}
          <Route
            path="/home-demo"
            element={
              <AuthRouteGuard requireAuth={true}>
                <MainLayout>
                  <HomePage />
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
