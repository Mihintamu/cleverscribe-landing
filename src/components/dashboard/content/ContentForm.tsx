
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
  wordCount: number;
  setWordCount: (wordCount: number) => void;
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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoading(true);
      try {
        // Check if we're authenticated first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error("Session error:", sessionError);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Please log in again to continue.",
          });
          return;
        }
        
        console.log("Fetching subjects with active session");
        const { data, error } = await supabase
          .from("subjects")
          .select("*")
          .order("name");

        if (error) {
          throw error;
        }

        console.log("Subjects fetched:", data);
        setSubjects(data || []);
        
        // If no subject is selected and we have subjects, select the first one
        if (data && data.length > 0 && !selectedSubjectId) {
          setSelectedSubjectId(data[0].id);
          setSubject(data[0].name);
        }
      } catch (error: any) {
        console.error("Error fetching subjects:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to fetch subjects",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, [toast, selectedSubjectId, setSelectedSubjectId, setSubject]);

  // Update subject text when subject ID changes
  useEffect(() => {
    if (selectedSubjectId) {
      const selectedSubject = subjects.find(
        (subject) => subject.id === selectedSubjectId
      );
      if (selectedSubject) {
        setSubject(selectedSubject.name);
      }
    }
  }, [selectedSubjectId, subjects, setSubject]);

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="content-type">Content Type</Label>
          <Select
            value={contentType}
            onValueChange={(value) => setContentType(value as ContentType)}
          >
            <SelectTrigger id="content-type">
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
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
          <Label htmlFor="subject-select">Subject</Label>
          {isLoading ? (
            <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
          ) : subjects.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No subjects available. Please create subjects in the admin dashboard.
            </div>
          ) : (
            <Select
              value={selectedSubjectId}
              onValueChange={setSelectedSubjectId}
            >
              <SelectTrigger id="subject-select">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-4">
          <Label>Word Count: {wordCount}</Label>
          <Slider
            value={[wordCount]}
            onValueChange={(value) => setWordCount(value[0])}
            min={100}
            max={2500}
            step={100}
            className="w-full"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button disabled={isGenerating || subjects.length === 0} onClick={onGenerate} className="w-full">
          {isGenerating ? "Generating..." : "Generate Content"}
        </Button>
      </CardFooter>
    </Card>
  );
}
