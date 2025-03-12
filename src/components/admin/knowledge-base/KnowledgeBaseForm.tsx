
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
import { useKnowledgeBaseForm } from "./hooks/useKnowledgeBaseForm";
import { Subject, KnowledgeBase } from "./types";

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
  const { toast } = useToast();
  
  const {
    selectedSubject,
    setSelectedSubject,
    content,
    setContent,
    isCommon,
    setIsCommon,
    selectedFile,
    setSelectedFile,
    hasFile,
    setHasFile,
    isUploading,
    setIsUploading,
    resetForm,
    handleSubmit
  } = useKnowledgeBaseForm({
    editItem,
    onSuccess,
    onClose,
    toast
  });

  useEffect(() => {
    if (isOpen && editItem) {
      setIsCommon(editItem.is_common);
      setContent(editItem.content);
      setHasFile(!!editItem.file_url);
      if (!editItem.is_common) {
        setSelectedSubject(editItem.subject);
      }
    } else if (isOpen) {
      resetForm();
    }
  }, [isOpen, editItem, resetForm, setIsCommon, setContent, setHasFile, setSelectedSubject]);

  const handleContentParsed = (parsedContent: string) => {
    setContent(parsedContent);
  };

  const handleFileSelected = (file: File | null) => {
    setSelectedFile(file);
    setHasFile(!!file);
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
          onSubmit={() => handleSubmit(subjects, uploadFile, selectedFile)}
          isUploading={isUploading}
          isEditing={!!editItem}
        />
      </DialogContent>
    </Dialog>
  );
}
