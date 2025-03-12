import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ContentType } from "./types";

interface ContentFormProps {
  contentType: ContentType;
  setContentType: (contentType: ContentType) => void;
  subject: string;
  setSubject: (subject: string) => void;
  selectedSubjectId: string;
  setSelectedSubjectId: (subjectId: string) => void;
  wordCount: string;
  setWordCount: (wordCount: string) => void;
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
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data, error } = await supabase
          .from("subjects")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setSubjects(data || []);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to fetch subjects",
        });
      }
    };

    fetchSubjects();
  }, [toast]);

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="content-type">Content Type</Label>
          <Select
            value={contentType}
            onValueChange={(value) => setContentType(value as ContentType)}
          >
            <SelectTrigger id="content-type">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="assignments">Assignments</SelectItem>
              <SelectItem value="reports">Reports</SelectItem>
              <SelectItem value="research_paper">Research Paper</SelectItem>
              <SelectItem value="essays">Essays</SelectItem>
              <SelectItem value="thesis">Thesis</SelectItem>
              <SelectItem value="presentation">Presentation</SelectItem>
              <SelectItem value="case_studies">Case Studies</SelectItem>
              <SelectItem value="book_review">Book Review</SelectItem>
              <SelectItem value="article_reviews">Article Reviews</SelectItem>
              <SelectItem value="term_papers">Term Papers</SelectItem>
              <SelectItem value="exam_notes">Exam Notes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            placeholder="Enter subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject-select">Or Select Subject</Label>
          <Select
            value={selectedSubjectId}
            onValueChange={(value) => setSelectedSubjectId(value)}
          >
            <SelectTrigger id="subject-select">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="word-count">Word Count</Label>
          <Select value={wordCount} onValueChange={setWordCount}>
            <SelectTrigger id="word-count">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="long">Long</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button disabled={isGenerating} onClick={onGenerate} className="w-full">
          {isGenerating ? "Generating..." : "Generate Content"}
        </Button>
      </CardFooter>
    </Card>
  );
}
