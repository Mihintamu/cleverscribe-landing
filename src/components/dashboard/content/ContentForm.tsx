
import { useState } from "react";
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
import { ContentType, WordCountOption } from "../WriteContent";

interface ContentFormProps {
  contentType: ContentType;
  setContentType: (value: ContentType) => void;
  subject: string;
  setSubject: (value: string) => void;
  wordCountOption: WordCountOption;
  setWordCountOption: (value: WordCountOption) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function ContentForm({
  contentType,
  setContentType,
  subject,
  setSubject,
  wordCountOption,
  setWordCountOption,
  isGenerating,
  onGenerate,
}: ContentFormProps) {
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
            onClick={onGenerate}
            disabled={isGenerating || !subject}
          >
            {isGenerating ? "Generating..." : "Generate Content"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
