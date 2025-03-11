
import { supabase } from "@/integrations/supabase/client";

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

// Extract filename from a file URL
export const extractFilenameFromUrl = (fileUrl: string): string => {
  if (!fileUrl) return '';
  const urlParts = fileUrl.split('/');
  return urlParts[urlParts.length - 1];
};

// Get friendly file type
export const getFriendlyFileType = (fileType: string): string => {
  if (!fileType) return '';
  
  const fileTypeMappings: Record<string, string> = {
    'application/pdf': 'PDF',
    'text/plain': 'Text',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
    'application/msword': 'Word',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
    'application/vnd.ms-excel': 'Excel'
  };
  
  return fileTypeMappings[fileType] || fileType;
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
    console.log(`Parsing document: ${fileUrl}, type: ${fileType}`);
    
    const response = await supabase.functions.invoke('parse-document', {
      body: { fileUrl, fileType },
    });
    
    console.log('Parse document response:', response);

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
    console.error('Document parsing error:', error);
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
    console.log(`Uploading file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
    const filePath = generateUniqueFilePath(file.name);
    
    // Ensure the bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketName = 'knowledge_base_files';
    
    if (!buckets?.find(b => b.name === bucketName)) {
      console.log(`Creating bucket: ${bucketName}`);
      const { error: bucketError } = await supabase.storage.createBucket(bucketName, { public: true });
      if (bucketError) throw bucketError;
    }
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    console.log(`File uploaded successfully: ${data.path}`);

    // Get the public URL for the uploaded file
    const fileUrl = getPublicFileUrl(data.path);
    console.log(`Public URL: ${fileUrl}`);
    
    onSuccess(fileUrl);
  } catch (error: any) {
    console.error('File upload error:', error);
    onError(error.message || "Failed to upload file");
  } finally {
    onEnd();
  }
};

// Helper function to construct file URL for display
export const constructFileUrl = (fileName: string): string => {
  if (!fileName) return '';
  const { data } = supabase.storage
    .from('knowledge_base_files')
    .getPublicUrl(fileName);
  return data.publicUrl;
};
