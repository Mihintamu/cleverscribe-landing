
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { KnowledgeBaseList } from "./knowledge-base/KnowledgeBaseList";
import { KnowledgeBaseForm } from "./knowledge-base/KnowledgeBaseForm";
import { useKnowledgeBase } from "./knowledge-base/hooks/useKnowledgeBase";

export function KnowledgeBaseManager() {
  const { 
    knowledgeBase, 
    subjects, 
    loading, 
    fetchKnowledgeBase, 
    handleEdit, 
    handleDelete 
  } = useKnowledgeBase();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const onEdit = (item) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Knowledge Base Manager</CardTitle>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            size="sm"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Knowledge
          </Button>
        </CardHeader>
        <CardContent>
          <KnowledgeBaseList 
            items={knowledgeBase}
            onEdit={onEdit}
            onDelete={handleDelete}
            isLoading={loading}
          />
        </CardContent>
      </Card>

      <KnowledgeBaseForm 
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSuccess={fetchKnowledgeBase}
        subjects={subjects}
        editItem={editingItem}
      />
    </div>
  );
}
