
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ContentType, WordCountOption } from "./types";
import { formatWords } from "./utils";

export function useContentGeneration(userId: string) {
  const [contentType, setContentType] = useState<ContentType>("essays");
  const [subject, setSubject] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [wordCount, setWordCount] = useState(500);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!subject) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a subject",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent(""); // Clear any previous content

    try {
      // Simplified content generation - no knowledge base or subjects used
      toast({
        title: "Information",
        description: "Content generation has been purged and reset.",
      });
      
      setGeneratedContent("Content generation functionality has been reset.");
    } catch (error: any) {
      console.error("Content generation error:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message || "Failed to generate content, please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    contentType,
    setContentType,
    subject,
    setSubject,
    selectedSubjectId,
    setSelectedSubjectId,
    wordCount,
    setWordCount,
    generatedContent,
    isGenerating,
    handleGenerate,
  };
}
