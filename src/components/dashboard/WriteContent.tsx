
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ContentForm } from "./content/ContentForm";
import { ContentDisplay } from "./content/ContentDisplay";

export type ContentType = 
  | 'assignments' 
  | 'reports' 
  | 'research_paper' 
  | 'essays' 
  | 'thesis'
  | 'presentation' 
  | 'case_studies' 
  | 'book_review' 
  | 'article_reviews' 
  | 'term_papers'
  | 'exam_notes';

export type WordCountOption = 'short' | 'medium' | 'long';

interface WriteContentProps {
  userId: string;
}

export function WriteContent({ userId }: WriteContentProps) {
  const [contentType, setContentType] = useState<ContentType>('essays');
  const [subject, setSubject] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [wordCount, setWordCount] = useState(1000);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedBefore, setHasGeneratedBefore] = useState(false);
  const { toast } = useToast();

  // Check if user has already generated content on component mount
  useEffect(() => {
    const checkPreviousGenerations = async () => {
      try {
        const { count, error } = await supabase
          .from('generated_content')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        if (error) throw error;
        
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
        throw new Error("Could not verify subscription status");
      }
      
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
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          contentType,
          subjectId: selectedSubjectId,
          topic: subject,
          wordCount
        }
      });

      if (error) throw error;
      
      const generatedText = data.generatedText;
      setGeneratedContent(generatedText);
      
      // Make sure content_type matches the database type
      // Convert exam_notes to term_papers for database compatibility if needed
      // This is a temporary solution until the database schema is updated
      let dbContentType: "assignments" | "reports" | "research_paper" | "essays" | "thesis" | "presentation" | "case_studies" | "book_review" | "article_reviews" | "term_papers" = 
        contentType === 'exam_notes' ? 'term_papers' : contentType as any;
      
      // Save to database
      const { error: insertError } = await supabase
        .from('generated_content')
        .insert({
          user_id: userId,
          content_type: dbContentType,
          subject,
          word_count_option: wordCount <= 750 ? 'short' : wordCount <= 1500 ? 'medium' : 'long',
          target_word_count: wordCount,
          generated_text: generatedText
        });
      
      if (insertError) {
        throw new Error("Failed to save generated content");
      }
      
      // Update user's remaining credits
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ 
          credits_remaining: subscriptionData.credits_remaining - 1 
        })
        .eq('user_id', userId);
      
      if (updateError) {
        throw new Error("Failed to update credits");
      }

      // Update the hasGeneratedBefore state
      setHasGeneratedBefore(true);

      toast({
        title: "Content Generated",
        description: "Your content has been generated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred while generating content",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTextContent = (content: string) => {
    // Remove Markdown asterisks and hashtags while preserving line breaks
    return content.replace(/\*\*(.*?)\*\*/g, '$1')
                 .replace(/\*(.*?)\*/g, '$1')
                 .replace(/^### (.*?)$/gm, '$1')
                 .replace(/^## (.*?)$/gm, '$1')
                 .replace(/^# (.*?)$/gm, '$1');
  };

  const downloadAsText = () => {
    if (!generatedContent) return;
    
    const formattedContent = formatTextContent(generatedContent);
    const element = document.createElement("a");
    const file = new Blob([formattedContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${contentType}_${subject.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadAsPDF = () => {
    toast({
      title: "Coming Soon",
      description: "PDF download functionality will be available soon!",
    });
  };

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_1fr]">
      <ContentForm
        contentType={contentType}
        setContentType={setContentType}
        subject={subject}
        setSubject={setSubject}
        selectedSubjectId={selectedSubjectId}
        setSelectedSubjectId={setSelectedSubjectId}
        wordCount={wordCount}
        setWordCount={setWordCount}
        isGenerating={isGenerating}
        onGenerate={handleGenerate}
      />
      
      <ContentDisplay
        generatedContent={generatedContent}
        isGenerating={isGenerating}
        onDownloadText={downloadAsText}
        onDownloadPDF={downloadAsPDF}
      />
    </div>
  );
}
