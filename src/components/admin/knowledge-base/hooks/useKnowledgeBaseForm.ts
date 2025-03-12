
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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

type FormHookProps = {
  editItem?: KnowledgeBase | null;
  onSuccess: () => void;
  onClose: () => void;
  toast: any;
};

export function useKnowledgeBaseForm({
  editItem,
  onSuccess,
  onClose,
  toast
}: FormHookProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [content, setContent] = useState("");
  const [isCommon, setIsCommon] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasFile, setHasFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = useCallback(() => {
    setSelectedSubject("");
    setContent("");
    setIsCommon(false);
    setSelectedFile(null);
    setHasFile(false);
  }, []);

  const validateForm = useCallback(() => {
    if (isCommon) {
      if (!content.trim() && !hasFile && !selectedFile) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please provide either content or upload a file",
        });
        return false;
      }
    } else {
      if (!selectedSubject) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a subject",
        });
        return false;
      }
      
      if (!content.trim() && !hasFile && !selectedFile) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please provide either content or upload a file",
        });
        return false;
      }
    }
    return true;
  }, [content, hasFile, isCommon, selectedFile, selectedSubject, toast]);

  const handleSubmit = useCallback(async (
    subjects: Subject[],
    uploadFileFn: Function,
    file: File | null
  ) => {
    if (!validateForm()) return;

    setIsUploading(true);

    try {
      let fileInfo = {};
      
      if (file) {
        await new Promise<void>((resolve, reject) => {
          uploadFileFn(
            file,
            (fileUrl: string) => {
              fileInfo = {
                file_url: fileUrl,
                file_type: file.type
              };
              resolve();
            },
            (errorMessage: string) => {
              reject(new Error(errorMessage));
            },
            () => {},
            () => {}
          );
        });
      }

      if (editItem?.file_url && !file) {
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
  }, [content, editItem, isCommon, onClose, onSuccess, selectedSubject, toast, validateForm]);

  return {
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
  };
}
