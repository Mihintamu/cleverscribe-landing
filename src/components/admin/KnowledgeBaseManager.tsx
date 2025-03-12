
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { KnowledgeBaseList } from "./knowledge-base/KnowledgeBaseList";
import { KnowledgeBaseForm } from "./knowledge-base/KnowledgeBaseForm";
import { useKnowledgeBase } from "./knowledge-base/hooks/useKnowledgeBase";
import { SearchBar } from "./knowledge-base/SearchBar";

export function KnowledgeBaseManager() {
  const { 
    knowledgeBase, 
    subjects, 
    loading, 
    searchTerm,
    fetchKnowledgeBase, 
    handleEdit, 
    handleDelete,
    handleSearch
  } = useKnowledgeBase();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Re-fetch knowledge base data when component mounts
  useEffect(() => {
    console.log("KnowledgeBaseManager mounted, fetching data...");
    fetchKnowledgeBase();
  }, [fetchKnowledgeBase]);

  const onEdit = (item) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  console.log("KnowledgeBase data:", knowledgeBase);
  console.log("Subjects data:", subjects);

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
          <SearchBar 
            subjects={subjects}
            onSearch={handleSearch}
          />
          
          <KnowledgeBaseList 
            items={knowledgeBase}
            onEdit={onEdit}
            onDelete={handleDelete}
            isLoading={loading}
            searchTerm={searchTerm}
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
