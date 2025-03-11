
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Generate a unique file path for storage
export const generateUniqueFilePath = (fileName: string): string => {
  const fileExt = fileName.split('.').pop();
  return `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
};

// Get public URL for a file path
export const getPublicFileUrl = (filePath: string): string => {
  const { data } = supabase.storage.from('knowledge_base_files').getPublicUrl(filePath);
  return data.publicUrl;
};

// Parse document using edge function
export const parseDocument = async (
  fileUrl: string, 
  fileType: string,
  onSuccess: (text: string) => void,
  onError: (message: string) => void,
  onStart: () => void,
  onEnd: () => void
) => {
  onStart();
  
  try {
    const response = await supabase.functions.invoke('parse-document', {
      body: { fileUrl, fileType },
    });

    if (response.error) {
      throw new Error(response.error.message || "Failed to parse document");
    }

    const result = response.data;
    if (result.extractedText) {
      onSuccess(result.extractedText);
    } else {
      throw new Error("Failed to extract text from document");
    }
  } catch (error: any) {
    onError(error.message || "Failed to parse document");
  } finally {
    onEnd();
  }
};

// Upload a file to storage
export const uploadFile = async (
  file: File,
  onSuccess: (fileUrl: string) => void,
  onError: (message: string) => void,
  onStart: () => void,
  onEnd: () => void
) => {
  onStart();
  
  try {
    const filePath = generateUniqueFilePath(file.name);
    
    const { data, error } = await supabase.storage
      .from('knowledge_base_files')
      .upload(filePath, file);

    if (error) throw error;

    // Get the public URL for the uploaded file using the getPublicUrl method
    const fileUrl = getPublicFileUrl(data.path);
    
    onSuccess(fileUrl);
  } catch (error: any) {
    onError(error.message || "Failed to upload file");
  } finally {
    onEnd();
  }
};

export const constructFileUrl = (fileName: string): string => {
  return `${window.location.origin}/storage/v1/object/public/knowledge_base_files/${fileName}`;
};
