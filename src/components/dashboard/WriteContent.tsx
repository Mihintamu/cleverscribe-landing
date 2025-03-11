
import { useState } from "react";
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
  | 'term_papers';

export type WordCountOption = 'short' | 'medium' | 'long';

interface WriteContentProps {
  userId: string;
}

export function WriteContent({ userId }: WriteContentProps) {
  const [contentType, setContentType] = useState<ContentType>('essays');
  const [subject, setSubject] = useState("");
  const [wordCount, setWordCount] = useState(1000);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!subject) {
      toast({
        variant: "destructive",
        title: "Subject is required",
        description: "Please enter a subject or topic to generate content."
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Check if user has enough credits
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (subscriptionError) {
        throw new Error("Could not verify subscription status");
      }
      
      if (subscriptionData.credits_remaining < 1) {
        toast({
          variant: "destructive",
          title: "Insufficient Credits",
          description: "You don't have enough credits. Please upgrade your plan to continue."
        });
        return;
      }

      // Call the edge function to generate content
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          contentType,
          subject,
          wordCount
        }
      });

      if (error) throw error;
      
      const generatedText = data.generatedText;
      setGeneratedContent(generatedText);
      
      // Save to database
      const { error: insertError } = await supabase
        .from('generated_content')
        .insert({
          user_id: userId,
          content_type: contentType,
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

  const downloadAsText = () => {
    if (!generatedContent) return;
    
    const element = document.createElement("a");
    const file = new Blob([generatedContent], {type: 'text/plain'});
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
