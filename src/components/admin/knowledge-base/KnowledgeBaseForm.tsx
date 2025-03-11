
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUploader } from "./FileUploader";

type Subject = {
  id: string;
  name: string;
};

type KnowledgeBase = {
  id: string;
  subject: string;
  content: string;
  is_common: boolean;
  created_at: string;
  subject_name?: string;
  file_url?: string;
  file_type?: string;
};

interface KnowledgeBaseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subjects: Subject[];
  editItem?: KnowledgeBase | null;
}

export function KnowledgeBaseForm({
  isOpen,
  onClose,
  onSuccess,
  subjects,
  editItem
}: KnowledgeBaseFormProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [content, setContent] = useState("");
  const [isCommon, setIsCommon] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasFile, setHasFile] = useState(false);
  const { toast } = useToast();

  // Reset form when dialog opens/closes or edit item changes
  useEffect(() => {
    if (isOpen && editItem) {
      setIsCommon(editItem.is_common);
      setContent(editItem.content);
      setHasFile(!!editItem.file_url);
      if (!editItem.is_common) {
        setSelectedSubject(editItem.subject);
      }
    } else if (isOpen) {
      // Reset form for new item
      setSelectedSubject("");
      setContent("");
      setIsCommon(false);
      setSelectedFile(null);
      setHasFile(false);
    }
  }, [isOpen, editItem]);

  const handleContentParsed = (parsedContent: string) => {
    setContent(parsedContent);
  };

  const handleFileSelected = (file: File | null) => {
    setSelectedFile(file);
    setHasFile(!!file);
  };

  const handleSubmit = async () => {
    // Validation
    if (isCommon) {
      // For common knowledge, check if content or file is present
      if (!content.trim() && !hasFile && !selectedFile) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please provide either content or upload a file",
        });
        return;
      }
    } else {
      // For regular knowledge, check if subject and (content or file) are present
      if (!selectedSubject) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a subject",
        });
        return;
      }
      
      if (!content.trim() && !hasFile && !selectedFile) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please provide either content or upload a file",
        });
        return;
      }
    }

    try {
      const fileInfo = selectedFile ? {
        file_url: getPublicFileUrl(generateUniqueFilePath(selectedFile.name)),
        file_type: selectedFile.type
      } : {};

      if (editItem) {
        const { error } = await supabase
          .from('knowledge_base')
          .update({
            subject: isCommon ? "common" : selectedSubject,
            content: content.trim(),
            is_common: isCommon,
            ...fileInfo
          })
          .eq('id', editItem.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Knowledge base entry updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('knowledge_base')
          .insert({
            subject: isCommon ? "common" : selectedSubject,
            content: content.trim(),
            is_common: isCommon,
            ...fileInfo
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Knowledge base entry added successfully",
        });
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save knowledge base entry",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editItem ? "Edit Knowledge Base Entry" : "Add Knowledge Base Entry"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Input
              type="checkbox"
              id="is-common"
              className="w-4 h-4"
              checked={isCommon}
              onChange={(e) => setIsCommon(e.target.checked)}
            />
            <Label htmlFor="is-common">Common Knowledge Base</Label>
          </div>
          
          {!isCommon && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a subject" />
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
          )}
          
          <FileUploader onContentParsed={handleContentParsed} onFileSelected={handleFileSelected} />
          
          <div className="space-y-2">
            <Label htmlFor="content">Content {hasFile || selectedFile ? "(Optional when file is uploaded)" : ""}</Label>
            <Textarea
              id="content"
              placeholder={hasFile || selectedFile ? "Content is optional when a file is uploaded" : "Enter knowledge base content"}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-32"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {editItem ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Import the utility functions so they're available in this component scope
import { generateUniqueFilePath, getPublicFileUrl } from "./utils";
