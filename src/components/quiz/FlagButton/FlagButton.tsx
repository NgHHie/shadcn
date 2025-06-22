import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import "./style.css";

interface FlagButtonProps {
  isFlagged: boolean;
  onToggle: () => void;
  className?: string;
}

export function FlagButton({ isFlagged, onToggle, className }: FlagButtonProps) {
  const { t } = useTranslation('quiz');
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className={cn(
        "h-8 w-8 p-0 hover:bg-yellow-100 dark:hover:bg-yellow-900/20",
        isFlagged && "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
        className
      )}
      title={isFlagged ? t("taking.removeFlagTooltip") : t("taking.addFlagTooltip")}
    >
      <Flag 
        className={cn(
          "h-4 w-4 transition-colors",
          isFlagged && "fill-current"
        )} 
      />
    </Button>
  );
}
