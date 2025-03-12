
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ContentType, WordCountOption } from "./types";
import { formatWords } from "./utils";
import { supabase } from "@/integrations/supabase/client";

export function useContentGeneration(userId: string) {
  const [contentType, setContentType] = useState<ContentType>("essays");
  const [subject, setSubject] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [wordCount, setWordCount] = useState(500);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState<any[]>([]);
  const { toast } = useToast();

  // Fetch knowledge base for the selected subject
  useEffect(() => {
    const fetchKnowledgeBase = async () => {
      if (!selectedSubjectId) return;
      
      try {
        console.log("Fetching knowledge base for subject:", selectedSubjectId);
        
        // Get subject-specific knowledge
        const { data: subjectData, error: subjectError } = await supabase
          .from("knowledge_base")
          .select("*")
          .eq("subject", selectedSubjectId)
          .eq("is_common", false);
          
        if (subjectError) throw subjectError;
        
        // Get common knowledge
        const { data: commonData, error: commonError } = await supabase
          .from("knowledge_base")
          .select("*")
          .eq("is_common", true);
          
        if (commonError) throw commonError;
        
        // Combine both datasets
        const combinedData = [...(subjectData || []), ...(commonData || [])];
        console.log("Fetched knowledge base:", combinedData);
        
        setKnowledgeBase(combinedData);
      } catch (error: any) {
        console.error("Error fetching knowledge base:", error);
      }
    };
    
    fetchKnowledgeBase();
  }, [selectedSubjectId]);

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
      console.log("Generating content for subject:", subject);
      console.log("Using knowledge base:", knowledgeBase);
      
      // Extract knowledge base text to use for context
      const knowledgeText = knowledgeBase.map(item => item.content).join("\n\n");
      
      // Call the Edge Function to generate content
      const response = await fetch(
        `https://cbgpennynyiizazlwjpn.functions.supabase.co/generate-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contentType,
            subject,
            wordCount: formatWords(wordCount),
            knowledgeBase: knowledgeText || "",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate content");
      }

      const data = await response.json();
      console.log("Generated content:", data);
      
      if (data.content) {
        setGeneratedContent(data.content);
        
        // Save to history
        await supabase.from("generated_content").insert({
          user_id: userId,
          content_type: contentType,
          subject,
          word_count: wordCount,
          content: data.content
        });
      } else {
        throw new Error("No content was generated");
      }
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
