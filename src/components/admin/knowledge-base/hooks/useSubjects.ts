
import { useState } from "react";
import { Subject } from "../types";

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSubjects = () => {
    // Empty function that doesn't fetch anything
    setSubjects([]);
    setLoading(false);
  };

  return {
    subjects,
    loading,
    fetchSubjects
  };
}
