
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
  const [debug, setDebug] = useState({
    isOpen,
    hasSubjects: false,
    subjectCount: 0,
    isEditMode: !!editItem
  });
  
  useEffect(() => {
    // Debug log whenever props change
    setDebug({
      isOpen,
      hasSubjects: subjects && subjects.length > 0,
      subjectCount: subjects?.length || 0,
      isEditMode: !!editItem
    });
    console.log("KnowledgeBaseForm props:", { isOpen, subjects, editItem });
  }, [isOpen, subjects, editItem]);
  
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
      console.log("Setting up form for edit mode", editItem);
      setIsCommon(editItem.is_common);
      setContent(editItem.content);
      setHasFile(!!editItem.file_url);
      if (!editItem.is_common && editItem.subject) {
        setSelectedSubject(editItem.subject);
      }
    } else if (isOpen) {
      console.log("Setting up form for create mode");
      resetForm();
      
      // If we have subjects, pre-select the first one
      if (subjects && subjects.length > 0) {
        setSelectedSubject(subjects[0].id);
      }
    }
  }, [isOpen, editItem, resetForm, setIsCommon, setContent, setHasFile, setSelectedSubject, subjects]);

  const handleContentParsed = (parsedContent: string) => {
    setContent(parsedContent);
  };

  const handleFileSelected = (file: File | null) => {
    setSelectedFile(file);
    setHasFile(!!file);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-md overflow-y-auto max-h-[90vh]">
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

          {subjects && subjects.length === 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
              No subjects available. Please create a subject first before adding knowledge base entries.
            </div>
          )}
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
