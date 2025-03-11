
import { KnowledgeBaseItem } from "./KnowledgeBaseItem";

type KnowledgeBase = {
  id: string;
  subject: string;
  content: string;
  is_common: boolean;
  created_at: string;
  subject_name?: string;
  file_url?: string;
  file_type?: string;
};

interface KnowledgeBaseListProps {
  items: KnowledgeBase[];
  onEdit: (item: KnowledgeBase) => void;
  onDelete: (id: string) => void;
}

export function KnowledgeBaseList({ items, onEdit, onDelete }: KnowledgeBaseListProps) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">
        No knowledge base entries found. Create one to get started.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <KnowledgeBaseItem 
          key={item.id} 
          item={item} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
}
