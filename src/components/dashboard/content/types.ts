
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

export interface WriteContentProps {
  userId: string;
}

export interface ContentFormProps {
  contentType: ContentType;
  setContentType: (value: ContentType) => void;
  subject: string;
  setSubject: (value: string) => void;
  selectedSubjectId: string;
  setSelectedSubjectId: (value: string) => void;
  wordCount: number;
  setWordCount: (value: number) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export interface ContentDisplayProps {
  generatedContent: string;
  isGenerating: boolean;
  onDownloadText: () => void;
  onDownloadPDF: () => void;
}
