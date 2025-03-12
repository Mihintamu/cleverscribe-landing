
import { useCallback } from "react";
import { KnowledgeBase } from "../types";

export function useKnowledgeBaseOperations() {
  const handleEdit = useCallback((item: KnowledgeBase) => {
    return item;
  }, []);

  const handleDelete = useCallback(async (id: string, onSuccess: () => void) => {
    // Empty function
    onSuccess();
  }, []);

  return {
    handleEdit,
    handleDelete
  };
}
