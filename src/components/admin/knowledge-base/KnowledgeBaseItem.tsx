
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, FileText, ExternalLink } from "lucide-react";

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
  // Function to format file type for display
  const formatFileType = (fileType?: string) => {
    if (!fileType) return "";
    
    const fileTypeMap: Record<string, string> = {
      "application/pdf": "PDF",
      "text/plain": "Text",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
      "application/msword": "Word",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
      "application/vnd.ms-excel": "Excel"
    };
    
    return fileTypeMap[fileType] || fileType;
  };
  
  // Get filename from URL
  const getFileName = (url?: string) => {
    if (!url) return "";
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  return (
    <Card className="bg-muted">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <CardTitle className="text-sm font-medium">
              {item.subject_name}
              {item.is_common && <span className="ml-2 text-primary">(Common)</span>}
            </CardTitle>
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
        {item.file_url && (
          <div className="bg-background p-2 rounded mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-xs text-muted-foreground truncate max-w-[150px]" title={getFileName(item.file_url)}>
                {getFileName(item.file_url)}
              </span>
              <span className="ml-2 text-xs bg-slate-200 px-1 rounded">
                {formatFileType(item.file_type)}
              </span>
            </div>
            <a 
              href={item.file_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
        {item.content && (
          <p className="text-sm whitespace-pre-wrap max-h-24 overflow-y-auto">
            {item.content}
          </p>
        )}
        {!item.content && !item.file_url && (
          <p className="text-xs text-muted-foreground italic">No content or file provided</p>
        )}
      </CardContent>
    </Card>
  );
}
