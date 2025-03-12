
import { useState, useEffect } from "react";
import { KnowledgeBase } from "../types";

export function useFilterKnowledgeBase(knowledgeBase: KnowledgeBase[]) {
  const [filteredKnowledgeBase, setFilteredKnowledgeBase] = useState<KnowledgeBase[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");

  // Apply filters when knowledgeBase, searchTerm, or subjectFilter changes
  useEffect(() => {
    console.log("Applying filters:", { searchTerm, subjectFilter });
    if (knowledgeBase.length === 0) {
      setFilteredKnowledgeBase([]);
      return;
    }
    
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
    
    console.log("Filtered knowledge base:", filtered.length, "items");
    setFilteredKnowledgeBase(filtered);
  }, [knowledgeBase, searchTerm, subjectFilter]);

  // Handle search and filter changes
  const handleSearch = (query: string, subject: string) => {
    console.log("Search parameters:", { query, subject });
    setSearchTerm(query);
    setSubjectFilter(subject);
  };

  return {
    filteredKnowledgeBase,
    searchTerm,
    handleSearch
  };
}
