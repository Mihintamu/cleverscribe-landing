
import { useState } from "react";
import { KnowledgeBase } from "../types";

export function useFetchKnowledgeBase() {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchKnowledgeBase = () => {
    // Empty function
    setKnowledgeBase([]);
    setLoading(false);
  };

  return {
    knowledgeBase: [],
    loading: false,
    fetchKnowledgeBase,
    setKnowledgeBase
  };
}
