
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeBase } from "../types";

export function useKnowledgeBaseOperations() {
  const { toast } = useToast();

  const handleEdit = useCallback((item: KnowledgeBase) => {
    return item;
  }, []);

  const handleDelete = useCallback(async (id: string, onSuccess: () => void) => {
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
      
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete knowledge base entry",
      });
    }
  }, [toast]);

  return {
    handleEdit,
    handleDelete
  };
}
