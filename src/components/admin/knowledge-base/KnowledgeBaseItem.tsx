
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

interface KnowledgeBaseItemProps {
  item: KnowledgeBase;
  onEdit: (item: KnowledgeBase) => void;
  onDelete: (id: string) => void;
}

export function KnowledgeBaseItem({ item, onEdit, onDelete }: KnowledgeBaseItemProps) {
  return (
    <div className="bg-muted p-4 rounded">
      <p className="text-sm">Knowledge base item functionality has been purged.</p>
    </div>
  );
}
