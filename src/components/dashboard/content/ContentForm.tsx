
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ContentType } from "../WriteContent";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ContentFormProps {
  contentType: ContentType;
  setContentType: (value: ContentType) => void;
  subject: string;
  setSubject: (value: string) => void;
  selectedSubjectId: string;
  setSelectedSubjectId: (value: string) => void;
  wordCount: number;
  setWordCount: (value: number) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function ContentForm({
  contentType,
  setContentType,
  subject,
  setSubject,
  selectedSubjectId,
  setSelectedSubjectId,
  wordCount,
  setWordCount,
  isGenerating,
  onGenerate,
}: ContentFormProps) {
  const [subjectOptions, setSubjectOptions] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
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
    'term_papers',
    'exam_notes'
  ];

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setLoadingError(null);
      try {
        console.log("Fetching subjects...");
        const { data, error } = await supabase
          .from('subjects')
          .select('id, name')
          .order('name');
        
        console.log("Subjects response:", { data, error });
        
        if (error) {
          console.error("Error fetching subjects:", error);
          setLoadingError("Failed to load subjects. Please try again later.");
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load subjects. Please try again later."
          });
          throw error;
        }
        
        if (data && data.length > 0) {
          console.log("Subjects found:", data.length);
          setSubjectOptions(data);
          
          // Set the first subject as default if none is selected
          if (!selectedSubjectId) {
            setSelectedSubjectId(data[0].id);
          }
        } else {
          console.log("No subjects found");
          setLoadingError("No subjects found. Please contact support or add subjects in admin panel.");
          toast({
            variant: "destructive",
            title: "No Subjects Found",
            description: "There are no subjects available. Please contact support."
          });
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleSliderChange = (value: number[]) => {
    setWordCount(value[0]);
  };

  return (
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
            <Label htmlFor="subject-id">Subject</Label>
            {loading ? (
              <div className="flex items-center space-x-2 p-2 border rounded">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading subjects...</span>
              </div>
            ) : loadingError ? (
              <div className="p-2 border border-destructive bg-destructive/10 rounded text-destructive text-sm">
                {loadingError}
              </div>
            ) : (
              <Select
                value={selectedSubjectId}
                onValueChange={setSelectedSubjectId}
                disabled={loading || subjectOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading subjects..." : subjectOptions.length === 0 ? "No subjects available" : "Select a subject"} />
                </SelectTrigger>
                <SelectContent>
                  {subjectOptions.map((subj) => (
                    <SelectItem key={subj.id} value={subj.id}>
                      {subj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Topic</Label>
            <Textarea 
              id="subject"
              placeholder="Enter the topic for your content"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="word-count">Word Count: {wordCount}</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="word-count"
                defaultValue={[wordCount]}
                min={500}
                max={2500}
                step={100}
                onValueChange={handleSliderChange}
                className="flex-1"
              />
              <Input 
                type="number"
                value={wordCount}
                onChange={(e) => setWordCount(parseInt(e.target.value, 10) || 500)}
                min={500}
                max={2500}
                step={100}
                className="w-20"
              />
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={onGenerate}
            disabled={isGenerating || !subject || !selectedSubjectId || subjectOptions.length === 0}
          >
            {isGenerating ? "Generating..." : "Generate Content"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
