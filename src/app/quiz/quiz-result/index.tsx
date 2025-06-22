import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

// Định nghĩa type đơn giản cho kết quả
interface SimpleResult {
  score: number;
  correct: number;
  wrong: number;
  total: number;
}

export default function QuizResultPage() {
  const location = useLocation();
  const { t } = useTranslation('quiz');
  const result = location.state?.result as SimpleResult | undefined;

  if (!result) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-xl mb-4">{t("result.noData")}</p>
          <Link to="/quiz/quiz-list">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("result.backToList")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/quiz/quiz-list">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common:back")}
          </Button>
        </Link>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold mb-2">{t("result.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-green-600 mb-2">
                {result.score ?? '--'}/10
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400">{t("result.score")}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-1">{result.correct ?? '--'}</div>
                <div className="text-sm text-gray-600">{t("result.correctAnswers")}</div>
              </div>
              <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
                <div className="text-3xl font-bold text-red-600 mb-1">{result.wrong ?? '--'}</div>
                <div className="text-sm text-gray-600">{t("result.wrongAnswers")}</div>
              </div>
            </div>
            <div className="text-center mt-6">
              <span className="text-muted-foreground">{t("result.totalQuestions")}: {result.total ?? '--'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
