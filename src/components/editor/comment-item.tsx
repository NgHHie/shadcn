// src/components/editor/comment-item.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";

interface User {
  id: string;
  userCode: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface Comment {
  id: string;
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string;
  parentId: string;
  user: User;
  content: string;
  countLike: number;
  isUserLike: boolean;
  userLike: boolean;
}

interface CommentItemProps {
  comment: Comment;
  onToggleLike: (commentId: string) => void;
  isLiking: boolean;
}

export function CommentItem({
  comment,
  onToggleLike,
  isLiking,
}: CommentItemProps) {
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date for mobile (shorter)
  const formatDateMobile = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      return `${diffInMinutes}p`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    }
  };

  return (
    <div className="bg-muted p-3 rounded-lg transition-colors hover:bg-muted/80 group">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.user.avatar ? (
            <img
              src={comment.user.avatar}
              alt={`${comment.user.firstName} ${comment.user.lastName}`}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
              {comment.user.firstName.charAt(0)}
              {comment.user.lastName.charAt(0)}
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="flex-1 min-w-0">
          {/* Header - Responsive */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              {/* Desktop layout */}
              <div className="hidden sm:block">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-foreground">
                    {comment.user.firstName} {comment.user.lastName}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    @{comment.user.userCode}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span>{formatDate(comment.createdAt)}</span>
                </div>
              </div>

              {/* Mobile layout */}
              <div className="sm:hidden">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {comment.user.firstName} {comment.user.lastName}
                    </p>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      @{comment.user.userCode}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDateMobile(comment.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Like button - Desktop (top right) */}
            <div className="hidden sm:block flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 text-xs transition-colors ${
                  comment.isUserLike
                    ? "text-red-500 hover:text-red-600"
                    : "text-muted-foreground hover:text-red-500"
                }`}
                onClick={() => onToggleLike(comment.id)}
                disabled={isLiking}
              >
                <div className="flex items-center gap-1">
                  {isLiking ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Heart
                      className={`h-3 w-3 ${
                        comment.isUserLike ? "fill-current" : ""
                      }`}
                    />
                  )}
                  <span>{comment.countLike}</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Comment content */}
          <div className="mb-2">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {comment.content}
            </p>
          </div>

          {/* Like button - Mobile (bottom right) */}
          <div className="sm:hidden flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 px-2 text-xs transition-colors ${
                comment.isUserLike
                  ? "text-red-500 hover:text-red-600"
                  : "text-muted-foreground hover:text-red-500"
              }`}
              onClick={() => onToggleLike(comment.id)}
              disabled={isLiking}
            >
              <div className="flex items-center gap-1">
                {isLiking ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Heart
                    className={`h-3 w-3 ${
                      comment.isUserLike ? "fill-current" : ""
                    }`}
                  />
                )}
                <span>{comment.countLike}</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
