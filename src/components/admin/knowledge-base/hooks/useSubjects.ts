
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Subject } from "../types";

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { toast } = useToast();

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

  return {
    subjects,
    fetchSubjects
  };
}
