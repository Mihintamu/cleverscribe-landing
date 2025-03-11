
import { KnowledgeBaseItem } from "./KnowledgeBaseItem";
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
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground animate-pulse">Loading knowledge base...</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          {searchTerm ? "No results found for your search." : "No knowledge base entries found."}
        </p>
        {!searchTerm && (
          <p className="text-sm text-muted-foreground mt-2">Click 'Add Knowledge' to create one.</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
