import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUploader } from "./FileUploader";
import { FormHeader } from "./FormHeader";
import { CommonToggle } from "./CommonToggle";
import { FormSubjectSelector } from "./FormSubjectSelector";
import { ContentInput } from "./ContentInput";
import { FormActions } from "./FormActions";
import { uploadFile } from "./utils";

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
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && editItem) {
      setIsCommon(editItem.is_common);
      setContent(editItem.content);
      setHasFile(!!editItem.file_url);
      if (!editItem.is_common) {
        setSelectedSubject(editItem.subject);
      }
    } else if (isOpen) {
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
    if (isCommon) {
      if (!content.trim() && !hasFile && !selectedFile) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please provide either content or upload a file",
        });
        return;
      }
    } else {
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

    setIsUploading(true);

    try {
      let fileInfo = {};
      
      if (selectedFile) {
        await new Promise<void>((resolve, reject) => {
          uploadFile(
            selectedFile,
            (fileUrl) => {
              fileInfo = {
                file_url: fileUrl,
                file_type: selectedFile.type
              };
              resolve();
            },
            (errorMessage) => {
              reject(new Error(errorMessage));
            },
            () => {},
            () => {}
          );
        });
      }

      if (editItem?.file_url && !selectedFile) {
        fileInfo = {
          file_url: editItem.file_url,
          file_type: editItem.file_type
        };
      }

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
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-md">
        <FormHeader isEditing={!!editItem} />
        
        <div className="space-y-4 py-4">
          <CommonToggle isCommon={isCommon} setIsCommon={setIsCommon} />
          
          <FormSubjectSelector 
            subjects={subjects} 
            selectedSubject={selectedSubject} 
            setSelectedSubject={setSelectedSubject}
            isCommon={isCommon}
          />
          
          <FileUploader onContentParsed={handleContentParsed} onFileSelected={handleFileSelected} />
          
          <ContentInput 
            content={content} 
            setContent={setContent} 
            hasFile={hasFile || !!selectedFile}
          />
        </div>
        
        <FormActions 
          onClose={onClose} 
          onSubmit={handleSubmit} 
          isUploading={isUploading}
          isEditing={!!editItem}
        />
      </DialogContent>
    </Dialog>
  );
}
