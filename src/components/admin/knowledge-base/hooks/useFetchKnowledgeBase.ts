
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeBase } from "../types";

export function useFetchKnowledgeBase() {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchKnowledgeBase = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching knowledge base...");
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log("Knowledge base data fetched:", data?.length || 0, "items");
      
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
        
        console.log("Knowledge base with subject names processed");
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
      setKnowledgeBase([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    knowledgeBase,
    loading,
    fetchKnowledgeBase,
    setKnowledgeBase
  };
}
