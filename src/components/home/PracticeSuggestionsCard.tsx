import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Mock data for suggestions (id, type, difficulty là key, title/reason dùng i18n)
const suggestions = [
  {
    id: '1',
    titleKey: 'practiceSuggestions.suggestion1.title',
    reasonKey: 'practiceSuggestions.suggestion1.reason',
    type: 'quiz',
    difficulty: 'medium',
    link: '/quiz/quiz-list',
  },
  {
    id: '2',
    titleKey: 'practiceSuggestions.suggestion2.title',
    reasonKey: 'practiceSuggestions.suggestion2.reason',
    type: 'practice',
    difficulty: 'easy',
    link: '/editor',
  },
  {
    id: '3',
    titleKey: 'practiceSuggestions.suggestion3.title',
    reasonKey: 'practiceSuggestions.suggestion3.reason',
    type: 'quiz',
    difficulty: 'hard',
    link: '/quiz/quiz-list',
  },
];

export function PracticeSuggestionsCard() {
  const { t } = useTranslation('home');

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-4 w-4 text-primary" />
          {t('practiceSuggestions.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-1 overflow-y-auto">
        {suggestions.length > 0 ? (
          <div className="space-y-2">
            {suggestions.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg">
                <div>
                  <div className="font-medium text-sm line-clamp-1">{t(item.titleKey)}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{t(item.reasonKey)}</div>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="outline" className="text-xs px-1 py-0">{t(`practiceSuggestions.type.${item.type}`)}</Badge>
                    <Badge variant="secondary" className="text-xs px-1 py-0">{t(`practiceSuggestions.difficulty.${item.difficulty}`)}</Badge>
                  </div>
                </div>
                <Button asChild size="icon" variant="ghost" className="ml-2">
                  <a href={item.link} title={t('practiceSuggestions.doNow')}>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">{t('practiceSuggestions.noSuggestions')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 