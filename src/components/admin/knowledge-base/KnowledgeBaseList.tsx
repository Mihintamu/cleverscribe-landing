
import { KnowledgeBase } from "./hooks/useKnowledgeBase";

interface KnowledgeBaseListProps {
  items: KnowledgeBase[];
  onEdit: (item: KnowledgeBase) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  searchTerm?: string;
}

export function KnowledgeBaseList({ 
  items, 
  onEdit, 
  onDelete, 
  isLoading,
  searchTerm
}: KnowledgeBaseListProps) {
  return (
    <div className="py-8 text-center">
      <p className="text-muted-foreground">
        Knowledge base functionality has been purged.
      </p>
    </div>
  );
}
