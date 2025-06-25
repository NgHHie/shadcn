// src/components/editor/discussion-tab.tsx
"use client";
import { useTranslation } from "react-i18next";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, Loader2, AlertCircle } from "lucide-react";
import { useApi } from "@/lib/api";
import { useParams } from "react-router-dom";
import { toastSuccess, toastError } from "@/lib/toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CommentItem } from "./comment-item";

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

interface CommentsResponse {
  content?: Comment[]; // Make content optional since it might not exist when empty
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

interface DiscussionTabProps {
  questionId?: string;
}

export function DiscussionTab({
  questionId: propQuestionId,
}: DiscussionTabProps) {
  const { t } = useTranslation("editor");

  const { questionId: urlQuestionId } = useParams<{ questionId?: string }>();
  const questionId = propQuestionId || urlQuestionId;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [likingComments, setLikingComments] = useState<Set<string>>(new Set());

  const messagesRef = useRef<HTMLDivElement>(null);
  const api = useApi();
  const pageSize = 10;

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [comments]);

  // Fetch current user info
  const fetchCurrentUser = useCallback(async () => {
    try {
      const userInfo = await api.user.getUserInfo();
      setCurrentUser({
        id: userInfo.id,
        userCode: userInfo.userCode,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        avatar: userInfo.avatar,
      });
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
  }, [api.user]);

  // Fetch comments for the question
  const fetchComments = useCallback(
    async (page: number = 0, append: boolean = false) => {
      if (!questionId) {
        setComments([]);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `https://api.learnsql.store/api/app/comments/question/${questionId}?page=${page}&size=${pageSize}&sort=createdAt,asc`,
          {
            headers: {
              Authorization: `Bearer ${localStorage
                .getItem("access_token")
                ?.replace(/"/g, "")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: CommentsResponse = await response.json();

        // Handle case when content is missing (empty response)
        const commentsData = data.content || [];

        if (append) {
          setComments((prev) => [...prev, ...commentsData]);
        } else {
          setComments(commentsData);
        }

        setCurrentPage(data.number);
        setTotalPages(data.totalPages);
        setHasMore(!data.last);
      } catch (err: any) {
        const errorMessage = api.utils.formatErrorMessage(err);
        setError(errorMessage);
        if (!append) {
          setComments([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [questionId, api.utils, pageSize]
  );

  // Post a new comment
  const postComment = useCallback(async () => {
    if (!inputValue.trim() || !questionId || !currentUser) {
      toastError(t("discussion.errors.error"), {
        description: t("discussion.errors.emptyComment"),
      });
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        "https://api.learnsql.store/api/app/comments",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage
              .getItem("access_token")
              ?.replace(/"/g, "")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            parentId: questionId,
            user: {
              id: currentUser.id,
            },
            content: inputValue.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Clear input and refresh comments
      setInputValue("");
      toastSuccess(t("discussion.commentSent"));

      // Refresh comments to show the new one
      await fetchComments(0, false);
    } catch (err: any) {
      const errorMessage = api.utils.formatErrorMessage(err);
      toastError(t("discussion.errors.loadComments"), {
        description: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  }, [inputValue, questionId, currentUser, fetchComments, api.utils]);

  // Like/unlike a comment
  const toggleLikeComment = useCallback(
    async (commentId: string) => {
      if (likingComments.has(commentId)) return;

      try {
        setLikingComments((prev) => new Set(prev).add(commentId));

        const response = await fetch(
          "https://api.learnsql.store/api/app/comments/like",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage
                .getItem("access_token")
                ?.replace(/"/g, "")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              commentId: commentId,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Update the comment in local state
        setComments((prev) =>
          prev.map((comment) => {
            if (comment.id === commentId) {
              const wasLiked = comment.isUserLike;
              return {
                ...comment,
                isUserLike: !wasLiked,
                userLike: !wasLiked,
                countLike: wasLiked
                  ? comment.countLike - 1
                  : comment.countLike + 1,
              };
            }
            return comment;
          })
        );

        const comment = comments.find((c) => c.id === commentId);
        toastSuccess(
          comment?.isUserLike
            ? t("discussion.unlikeComment")
            : t("discussion.likeComment")
        );
      } catch (err: any) {
        const errorMessage = api.utils.formatErrorMessage(err);
        toastError(t("discussion.errors.likeComment"), {
          description: errorMessage,
        });
      } finally {
        setLikingComments((prev) => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
      }
    },
    [likingComments, api.utils]
  );

  // Load more comments
  const loadMoreComments = useCallback(() => {
    if (hasMore && !loading && totalPages > 0) {
      fetchComments(currentPage + 1, true);
    }
  }, [hasMore, loading, currentPage, totalPages, fetchComments]);

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      postComment();
    }
  };

  // Initialize data
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (questionId) {
      fetchComments(0, false);
    }
  }, [questionId, fetchComments]);

  if (!questionId) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-sm mb-2">Chọn một câu hỏi để xem thảo luận</p>
            <p className="text-xs">
              Bạn có thể tham gia thảo luận với cộng đồng về các câu hỏi SQL
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages Container */}
      <div ref={messagesRef} className="flex-1 p-4 overflow-y-auto min-h-0">
        {loading && comments.length === 0 ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {t("discussion.loadingComments")}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
            <Alert className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button
              onClick={() => fetchComments(0, false)}
              size="sm"
              variant="outline"
            >
              {t("assignment.retry")}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p className="text-sm mb-2">{t("discussion.noComments")}</p>
                <p className="text-xs">{t("discussion.firstComment")}</p>
              </div>
            ) : (
              <>
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onToggleLike={toggleLikeComment}
                    isLiking={likingComments.has(comment.id)}
                  />
                ))}

                {/* Load more button */}
                {hasMore && totalPages > 0 && (
                  <div className="text-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadMoreComments}
                      disabled={loading}
                      className="text-xs h-7"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          {t("discussion.loadingComments")}
                        </>
                      ) : (
                        t("discussion.loadMore")
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-3 bg-background flex-shrink-0">
        <div className="flex items-center bg-muted rounded-lg px-3 py-2 gap-2">
          <input
            type="text"
            placeholder={t("discussion.inputPlaceholder")}
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground min-w-0"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={submitting || !currentUser}
          />
          <Button
            size="icon"
            className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 flex-shrink-0"
            onClick={postComment}
            disabled={submitting || !inputValue.trim() || !currentUser}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
