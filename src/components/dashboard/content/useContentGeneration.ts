
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ContentType } from "./types";

export function useContentGeneration(userId: string) {
  const [contentType, setContentType] = useState<ContentType>('essays');
  const [subject, setSubject] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [wordCount, setWordCount] = useState<number>(1500); // Default to medium (1500 words)
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedBefore, setHasGeneratedBefore] = useState(false);
  const { toast } = useToast();

  // Check if user has already generated content on component mount
  useEffect(() => {
    const checkPreviousGenerations = async () => {
      try {
        console.log("Checking previous generations for user:", userId);
        const { count, error } = await supabase
          .from('generated_content')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        if (error) throw error;
        
        console.log("Previous generations count:", count);
        setHasGeneratedBefore(!!count && count > 0);
      } catch (error) {
        console.error("Error checking previous generations:", error);
      }
    };
    
    checkPreviousGenerations();
  }, [userId]);

  const handleGenerate = async () => {
    if (!subject || !selectedSubjectId) {
      toast({
        variant: "destructive",
        title: "Required fields missing",
        description: "Please select a subject and enter a topic to generate content."
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Check if user has enough credits
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', userId)
        .single();
      
      if (subscriptionError) {
        console.error("Subscription error:", subscriptionError);
        throw new Error("Could not verify subscription status");
      }
      
      console.log("Subscription data:", subscriptionData);
      
      // Check if this is a free plan user who has already generated content
      if (subscriptionData.subscription_plans.name.toLowerCase() === 'free' && hasGeneratedBefore) {
        toast({
          variant: "destructive",
          title: "Free Plan Limit Reached",
          description: "You've reached the limit for the free plan. Please upgrade to generate more content."
        });
        setIsGenerating(false);
        return;
      }
      
      if (subscriptionData.credits_remaining < 1) {
        toast({
          variant: "destructive",
          title: "Insufficient Credits",
          description: "You don't have enough credits. Please upgrade your plan to continue."
        });
        setIsGenerating(false);
        return;
      }

      // Call the edge function to generate content
      console.log("Calling edge function with:", {
        contentType, selectedSubjectId, subject, wordCount
      });
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          contentType,
          subjectId: selectedSubjectId,
          topic: subject,
          wordCount
        }
      });

      console.log("Edge function response:", { data, error });
      
      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }
      
      const generatedText = data.generatedText;
      setGeneratedContent(generatedText);
      
      // Make sure content_type matches the database type
      // Convert exam_notes to term_papers for database compatibility if needed
      // This is a temporary solution until the database schema is updated
      let dbContentType: "assignments" | "reports" | "research_paper" | "essays" | "thesis" | "presentation" | "case_studies" | "book_review" | "article_reviews" | "term_papers" = 
        contentType === 'exam_notes' ? 'term_papers' : contentType as any;
      
      // Get word count option for database
      const wordCountOption = wordCount <= 750 ? 'short' : wordCount <= 1500 ? 'medium' : 'long';
      
      // Save to database
      console.log("Saving to database:", {
        user_id: userId,
        content_type: dbContentType,
        subject,
        word_count_option: wordCountOption,
        target_word_count: wordCount,
      });
      
      const { error: insertError } = await supabase
        .from('generated_content')
        .insert({
          user_id: userId,
          content_type: dbContentType,
          subject,
          word_count_option: wordCountOption,
          target_word_count: wordCount,
          generated_text: generatedText
        });
      
      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error("Failed to save generated content");
      }
      
      // Update user's remaining credits
      console.log("Updating credits:", {
        credits_remaining: subscriptionData.credits_remaining - 1
      });
      
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ 
          credits_remaining: subscriptionData.credits_remaining - 1 
        })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error("Update credits error:", updateError);
        throw new Error("Failed to update credits");
      }

      // Update the hasGeneratedBefore state
      setHasGeneratedBefore(true);

      toast({
        title: "Content Generated",
        description: "Your content has been generated successfully",
      });
    } catch (error: any) {
      console.error("Content generation error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred while generating content",
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
    hasGeneratedBefore
  };
}
