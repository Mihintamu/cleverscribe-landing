
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
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('id, name')
          .order('name');
        
        if (error) throw error;
        setSubjectOptions(data || []);
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
            <Select
              value={selectedSubjectId}
              onValueChange={setSelectedSubjectId}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading subjects..." : "Select a subject"} />
              </SelectTrigger>
              <SelectContent>
                {subjectOptions.map((subj) => (
                  <SelectItem key={subj.id} value={subj.id}>
                    {subj.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            disabled={isGenerating || !subject || !selectedSubjectId}
          >
            {isGenerating ? "Generating..." : "Generate Content"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
