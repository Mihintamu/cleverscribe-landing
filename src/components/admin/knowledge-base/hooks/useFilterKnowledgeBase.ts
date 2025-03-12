
import { useState } from "react";
import { KnowledgeBase } from "../types";

export function useFilterKnowledgeBase(knowledgeBase: KnowledgeBase[]) {
  const [filteredKnowledgeBase] = useState<KnowledgeBase[]>([]);
  const [searchTerm] = useState("");

  // Empty function
  const handleSearch = () => {};

  return {
    filteredKnowledgeBase: [],
    searchTerm: "",
    handleSearch
  };
}
