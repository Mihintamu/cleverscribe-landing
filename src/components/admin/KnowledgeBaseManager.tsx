
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { KnowledgeBaseList } from "./knowledge-base/KnowledgeBaseList";
import { KnowledgeBaseForm } from "./knowledge-base/KnowledgeBaseForm";
import { useKnowledgeBase } from "./knowledge-base/hooks/useKnowledgeBase";
import { SearchBar } from "./knowledge-base/SearchBar";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeBase } from "./knowledge-base/types";

export function KnowledgeBaseManager() {
  const { toast } = useToast();
  const { 
    knowledgeBase, 
    subjects, 
    loading, 
    searchTerm,
    fetchKnowledgeBase, 
    fetchSubjects,
    handleEdit, 
    handleDelete,
    handleSearch
  } = useKnowledgeBase();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeBase | null>(null);
  const [debug, setDebug] = useState({
    knowledgeBaseCount: 0,
    subjectsCount: 0, 
    isLoading: true
  });

  // Re-fetch knowledge base and subjects data when component mounts
  useEffect(() => {
    console.log("KnowledgeBaseManager mounted, fetching data...");
    Promise.all([
      fetchKnowledgeBase(),
      fetchSubjects()
    ]).then(() => {
      console.log("Initial data fetched successfully");
    }).catch(error => {
      console.error("Error fetching initial data:", error);
    });
  }, [fetchKnowledgeBase, fetchSubjects]);

  // Debug logging for state changes
  useEffect(() => {
    setDebug({
      knowledgeBaseCount: knowledgeBase?.length || 0,
      subjectsCount: subjects?.length || 0,
      isLoading: loading
    });
    console.log("KnowledgeBaseManager state updated:", {
      knowledgeBaseCount: knowledgeBase?.length || 0,
      subjectsCount: subjects?.length || 0,
      isLoading: loading
    });
  }, [knowledgeBase, subjects, loading]);

  const onEdit = (item: KnowledgeBase) => {
    console.log("Editing item:", item);
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    console.log("Closing dialog");
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const handleAddSuccess = () => {
    console.log("Knowledge base entry added successfully");
    toast({
      title: "Success",
      description: "Knowledge base entry added successfully!",
    });
    fetchKnowledgeBase();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Knowledge Base Manager</CardTitle>
          <Button 
            onClick={() => {
              console.log("Opening dialog to add knowledge");
              setIsDialogOpen(true);
            }}
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
          
          <div className="mt-6">
            <KnowledgeBaseList 
              items={knowledgeBase}
              onEdit={onEdit}
              onDelete={handleDelete}
              isLoading={loading}
              searchTerm={searchTerm}
            />
          </div>
        </CardContent>
      </Card>

      <KnowledgeBaseForm 
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleAddSuccess}
        subjects={subjects}
        editItem={editingItem}
      />
    </div>
  );
}
