export interface CreateReviewInput {
  jobId: string;
  /** Integer 1–5 star rating. */
  rating: number;
  comment?: string;
}

export interface WorkerReview {
  id: string;
  rating: number;
  comment: string | null;
  customerName: string | null;
  createdAt: Date;
}