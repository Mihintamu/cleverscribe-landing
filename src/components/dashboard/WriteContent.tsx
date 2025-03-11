
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Save, Download } from "lucide-react";

// Word count mapping
const wordCountMap = {
  short: 500,
  medium: 1000,
  long: 2000
};

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
  const [wordCountOption, setWordCountOption] = useState<WordCountOption>('medium');
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const contentTypes: ContentType[] = [
    'assignments', 
    'reports', 
    'research_paper', 
    'essays', 
    'thesis',
    'presentation', 
    'case_studies', 
    'book_review', 
    'article_reviews', 
    'term_papers'
  ];

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
        setIsGenerating(false);
        return;
      }

      // Placeholder for actual AI content generation
      // In a real app, this would call an edge function or API
      // For now, we'll simulate a delay and generate placeholder text
      setTimeout(async () => {
        const targetWordCount = wordCountMap[wordCountOption];
        const placeholderContent = `This is a sample ${contentType} about ${subject}. It would be approximately ${targetWordCount} words in a real application.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;
        
        setGeneratedContent(placeholderContent);
        
        // Save to database
        const { error: insertError } = await supabase
          .from('generated_content')
          .insert({
            user_id: userId,
            content_type: contentType,
            subject,
            word_count_option: wordCountOption,
            target_word_count: targetWordCount,
            generated_text: placeholderContent
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
        
        setIsGenerating(false);
      }, 2000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred while generating content",
      });
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
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="content-type">Content Type</Label>
              <Select
                value={contentType}
                onValueChange={(value) => setContentType(value as ContentType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject/Topic</Label>
              <Textarea 
                id="subject"
                placeholder="Enter the subject or topic for your content"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="word-count">Word Count</Label>
              <Select
                value={wordCountOption}
                onValueChange={(value) => setWordCountOption(value as WordCountOption)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select word count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (~500 words)</SelectItem>
                  <SelectItem value="medium">Medium (~1000 words)</SelectItem>
                  <SelectItem value="long">Long (~2000 words)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full" 
              onClick={handleGenerate}
              disabled={isGenerating || !subject}
            >
              {isGenerating ? "Generating..." : "Generate Content"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Generated Content</Label>
              {generatedContent && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadAsText}
                    title="Download as Text"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    TXT
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadAsPDF}
                    title="Download as PDF"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              )}
            </div>
            <div className="border rounded-md p-4 min-h-[400px] bg-muted/20">
              {isGenerating ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-pulse">Generating content...</div>
                </div>
              ) : !generatedContent ? (
                <div className="text-muted-foreground flex justify-center items-center h-full">
                  Generated content will appear here...
                </div>
              ) : (
                <div className="whitespace-pre-line">{generatedContent}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
