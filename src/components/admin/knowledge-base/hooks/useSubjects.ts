
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Subject } from "../types";

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching subjects in useSubjects hook...");
      
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) {
        console.error("Error fetching subjects in hook:", error);
        throw error;
      }
      
      console.log("Subjects fetched in hook:", data);
      setSubjects(data || []);
    } catch (error: any) {
      console.error("Error in useSubjects hook:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch subjects",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return {
    subjects,
    loading,
    fetchSubjects
  };
}
