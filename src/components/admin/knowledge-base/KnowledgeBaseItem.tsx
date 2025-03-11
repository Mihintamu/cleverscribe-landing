
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

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
    <Card className="bg-muted">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <CardTitle className="text-sm font-medium">
              {item.subject_name}
              {item.is_common && <span className="ml-2 text-primary">(Common)</span>}
            </CardTitle>
            {item.file_url && (
              <div className="text-xs text-muted-foreground mt-1">
                Attached file: {item.file_url.split('/').pop()}
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onEdit(item)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap max-h-24 overflow-y-auto">
          {item.content}
        </p>
      </CardContent>
    </Card>
  );
}
