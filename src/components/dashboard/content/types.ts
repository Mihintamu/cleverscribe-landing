
export type ContentType = 
  | 'assignments' 
  | 'reports' 
  | 'research_paper' 
  | 'essays' 
  | 'thesis'
  | 'presentation' 
  | 'case_studies' 
  | 'book_review' 
  | 'article_reviews' 
  | 'term_papers'
  | 'exam_notes';

export type WordCountOption = 'short' | 'medium' | 'long';

export interface WriteContentProps {
  userId: string;
}
