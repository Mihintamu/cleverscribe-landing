
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ContentType } from "./types";
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
        description: "Please select a subject",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent(""); // Clear any previous content

    try {
      console.log("Generating content with:", { contentType, subject, wordCount });
      
      // Fetch subject and common knowledge
      const subjectKnowledge = await fetchKnowledgeBase(selectedSubjectId);
      console.log("Subject knowledge:", subjectKnowledge);
      
      // Generate content using edge function
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          contentType,
          subject,
          wordCount,
          knowledge: subjectKnowledge,
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log("Generated content response:", data);
      
      if (!data.text) {
        throw new Error("No content was generated");
      }
      
      // Save the generated content to the database
      await saveGeneratedContent(data.text);
      
      setGeneratedContent(data.text);
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

  const fetchKnowledgeBase = async (subjectId: string) => {
    try {
      // Get knowledge for the specific subject
      const { data: subjectData, error: subjectError } = await supabase
        .from("knowledge_base")
        .select("content")
        .eq("subject", subjectId)
        .eq("is_common", false);
        
      if (subjectError) {
        throw subjectError;
      }
      
      // Get common knowledge applicable to all subjects
      const { data: commonData, error: commonError } = await supabase
        .from("knowledge_base")
        .select("content")
        .eq("is_common", true);
        
      if (commonError) {
        throw commonError;
      }
      
      // Combine both types of knowledge
      const subjectContent = subjectData?.map(item => item.content) || [];
      const commonContent = commonData?.map(item => item.content) || [];
      
      return [...subjectContent, ...commonContent].join("\n\n");
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
      return ""; // Return empty string if there's an error
    }
  };

  const saveGeneratedContent = async (text: string) => {
    try {
      const { error } = await supabase.from("generated_content").insert({
        content_type: contentType,
        subject,
        generated_text: text,
        target_word_count: wordCount,
        word_count_option: formatWords(wordCount),
        user_id: userId
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error saving generated content:", error);
      // We'll continue even if saving fails
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
