
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Subject = {
  id: string;
  name: string;
};

export type KnowledgeBase = {
  id: string;
  subject: string;
  content: string;
  is_common: boolean;
  created_at: string;
  subject_name?: string;
  file_url?: string;
  file_type?: string;
};

export function useKnowledgeBase() {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase[]>([]);
  const [filteredKnowledgeBase, setFilteredKnowledgeBase] = useState<KnowledgeBase[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const { toast } = useToast();

  // Fetch subjects function
  const fetchSubjects = useCallback(async () => {
    try {
      console.log("Fetching subjects...");
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      console.log("Subjects fetched:", data);
      setSubjects(data || []);
    } catch (error: any) {
      console.error("Error fetching subjects:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch subjects",
      });
    }
  }, [toast]);

  // Fetch knowledge base function
  const fetchKnowledgeBase = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching knowledge base...");
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log("Knowledge base data fetched:", data);
      
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
        
        console.log("Knowledge base with subject names:", withSubjectNames);
        setKnowledgeBase(withSubjectNames);
      } else {
        console.log("No knowledge base entries found");
        setKnowledgeBase([]);
      }
    } catch (error: any) {
      console.error("Error fetching knowledge base:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch knowledge base",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    console.log("useKnowledgeBase hook initialized");
    fetchSubjects();
    fetchKnowledgeBase();
  }, [fetchSubjects, fetchKnowledgeBase]);

  // Apply filters when knowledgeBase, searchTerm, or subjectFilter changes
  useEffect(() => {
    console.log("Applying filters:", { searchTerm, subjectFilter });
    applyFilters();
  }, [knowledgeBase, searchTerm, subjectFilter]);

  // Function to apply search and filter
  const applyFilters = () => {
    let filtered = [...knowledgeBase];
    
    // Apply subject filter if selected
    if (subjectFilter) {
      if (subjectFilter === "common") {
        filtered = filtered.filter(item => item.is_common);
      } else {
        filtered = filtered.filter(item => item.subject === subjectFilter);
      }
    }
    
    // Apply search term if entered
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const contentMatch = item.content && item.content.toLowerCase().includes(searchLower);
        const subjectMatch = item.subject_name && item.subject_name.toLowerCase().includes(searchLower);
        return contentMatch || subjectMatch;
      });
    }
    
    console.log("Filtered knowledge base:", filtered);
    setFilteredKnowledgeBase(filtered);
  };

  // Handle search and filter changes
  const handleSearch = (query: string, subject: string) => {
    console.log("Search parameters:", { query, subject });
    setSearchTerm(query);
    setSubjectFilter(subject);
  };

  const handleEdit = (item: KnowledgeBase) => {
    return item;
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

  return {
    knowledgeBase: filteredKnowledgeBase,
    allKnowledgeBase: knowledgeBase,
    subjects,
    loading,
    searchTerm,
    fetchKnowledgeBase,
    fetchSubjects,
    handleEdit,
    handleDelete,
    handleSearch
  };
}
