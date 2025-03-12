
import { useCallback } from "react";
import { useSubjects } from "./useSubjects";
import { useFetchKnowledgeBase } from "./useFetchKnowledgeBase";
import { useFilterKnowledgeBase } from "./useFilterKnowledgeBase";
import { useKnowledgeBaseOperations } from "./useKnowledgeBaseOperations";
import { KnowledgeBase } from "../types";

export type { KnowledgeBase } from "../types";

export function useKnowledgeBase() {
  const { subjects, fetchSubjects } = useSubjects();
  const { knowledgeBase, loading, fetchKnowledgeBase } = useFetchKnowledgeBase();
  const { filteredKnowledgeBase, searchTerm, handleSearch } = useFilterKnowledgeBase(knowledgeBase);
  const { handleEdit, handleDelete } = useKnowledgeBaseOperations();

  // Wrapper function to handle delete operation
  const handleDeleteWrapper = useCallback((id: string) => {
    handleDelete(id, fetchKnowledgeBase);
  }, [handleDelete, fetchKnowledgeBase]);

  return {
    knowledgeBase: filteredKnowledgeBase,
    allKnowledgeBase: knowledgeBase,
    subjects,
    loading,
    searchTerm,
    fetchKnowledgeBase,
    fetchSubjects,
    handleEdit,
    handleDelete: handleDeleteWrapper,
    handleSearch
  };
}
