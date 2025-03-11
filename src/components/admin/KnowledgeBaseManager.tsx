
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import { KnowledgeBaseList } from "./knowledge-base/KnowledgeBaseList";
import { KnowledgeBaseForm } from "./knowledge-base/KnowledgeBaseForm";

type Subject = {
  id: string;
  name: string;
};

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

export function KnowledgeBaseManager() {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeBase | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubjects();
    fetchKnowledgeBase();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch subjects",
      });
    }
  };

  const fetchKnowledgeBase = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get subject names
      if (data && data.length > 0) {
        const withSubjectNames = await Promise.all(
          data.map(async (item) => {
            if (item.is_common) {
              return { ...item, subject_name: "Common Knowledge Base" };
            }
            
            const { data: subjectData } = await supabase
              .from('subjects')
              .select('name')
              .eq('id', item.subject)
              .single();
              
            return { ...item, subject_name: subjectData?.name || "Unknown" };
          })
        );
        
        setKnowledgeBase(withSubjectNames);
      } else {
        setKnowledgeBase([]);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch knowledge base",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: KnowledgeBase) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // First check if there's a file associated with this knowledge base entry
      const { data, error: fetchError } = await supabase
        .from('knowledge_base')
        .select('file_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // If there's a file URL, delete the file from storage
      if (data?.file_url) {
        // Extract the file path from the URL
        const filePath = data.file_url.split('/').pop();
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from('knowledge_base_files')
            .remove([filePath]);

          if (storageError) {
            console.error('Failed to delete file from storage:', storageError);
            // Continue with deletion of database entry even if file deletion fails
          }
        }
      }

      // Delete the knowledge base entry
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Knowledge base entry deleted successfully",
      });
      
      fetchKnowledgeBase();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete knowledge base entry",
      });
    }
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
            onEdit={handleEdit}
            onDelete={handleDelete}
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
