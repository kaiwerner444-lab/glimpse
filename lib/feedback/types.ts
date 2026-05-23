export type FeedbackRating = "too_hard" | "just_right" | "too_easy";

export interface ActivityFeedback {
  id: string;
  taskId: string;
  taskTitle: string;
  rating: FeedbackRating;
  bodyIssueFlag: boolean;
  note?: string;
  submittedAt: string;
}

export const RATING_LABELS: Record<FeedbackRating, string> = {
  too_hard: "Too hard for my body",
  just_right: "Just right",
  too_easy: "Too easy",
};
