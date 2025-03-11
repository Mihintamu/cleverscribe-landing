
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2, FileUp, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

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

export function KnowledgeBaseManager() {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [content, setContent] = useState("");
  const [isCommon, setIsCommon] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fileUploading, setFileUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedContent, setParsedContent] = useState<string>("");
  const [isParsingFile, setIsParsingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubjects();
    fetchKnowledgeBase();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch subjects",
      });
    }
  };

  const fetchKnowledgeBase = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get subject names
      if (data && data.length > 0) {
        const withSubjectNames = await Promise.all(
          data.map(async (item) => {
            if (item.is_common) {
              return { ...item, subject_name: "Common Knowledge Base" };
            }
            
            const { data: subjectData } = await supabase
              .from('subjects')
              .select('name')
              .eq('id', item.subject)
              .single();
              
            return { ...item, subject_name: subjectData?.name || "Unknown" };
          })
        );
        
        setKnowledgeBase(withSubjectNames);
      } else {
        setKnowledgeBase([]);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch knowledge base",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No file selected",
      });
      return;
    }

    setFileUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('knowledge_base_files')
        .upload(filePath, selectedFile);

      if (error) throw error;

      // Get the public URL for the uploaded file
      const fileUrl = `${supabase.storageUrl}/object/public/knowledge_base_files/${data.path}`;
      
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

      // Start parsing the document
      await parseDocument(fileUrl, selectedFile.type);
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload file",
      });
    } finally {
      setFileUploading(false);
    }
  };

  const parseDocument = async (fileUrl: string, fileType: string) => {
    setIsParsingFile(true);
    setParsedContent("");
    
    try {
      const response = await supabase.functions.invoke('parse-document', {
        body: { fileUrl, fileType },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to parse document");
      }

      const result = response.data;
      if (result.extractedText) {
        setParsedContent(result.extractedText);
        setContent(result.extractedText);
        
        toast({
          title: "Success",
          description: "Document parsed successfully",
        });
      } else {
        throw new Error("Failed to extract text from document");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to parse document",
      });
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleAddKnowledge = async () => {
    if (isCommon) {
      // For common knowledge, we don't need a subject
      if (!content.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Content cannot be empty",
        });
        return;
      }
    } else {
      // For regular knowledge, we need both subject and content
      if (!selectedSubject || !content.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a subject and enter content",
        });
        return;
      }
    }

    try {
      const fileInfo = selectedFile ? {
        file_url: `${supabase.storageUrl}/object/public/knowledge_base_files/${Date.now()}_${selectedFile.name}`,
        file_type: selectedFile.type
      } : {};

      if (isEditing && editingId) {
        const { error } = await supabase
          .from('knowledge_base')
          .update({
            subject: isCommon ? "common" : selectedSubject,
            content: content.trim(),
            is_common: isCommon,
            ...fileInfo
          })
          .eq('id', editingId);

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
      
      resetForm();
      fetchKnowledgeBase();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save knowledge base entry",
      });
    }
  };

  const handleEdit = (item: KnowledgeBase) => {
    setIsEditing(true);
    setEditingId(item.id);
    setIsCommon(item.is_common);
    setContent(item.content);
    if (!item.is_common) {
      setSelectedSubject(item.subject);
    }
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // First check if there's a file associated with this knowledge base entry
      const { data, error: fetchError } = await supabase
        .from('knowledge_base')
        .select('file_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // If there's a file URL, delete the file from storage
      if (data?.file_url) {
        const filePath = data.file_url.split('/').pop();
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from('knowledge_base_files')
            .remove([filePath]);

          if (storageError) {
            console.error('Failed to delete file from storage:', storageError);
            // Continue with deletion of database entry even if file deletion fails
          }
        }
      }

      // Delete the knowledge base entry
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Knowledge base entry deleted successfully",
      });
      
      fetchKnowledgeBase();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete knowledge base entry",
      });
    }
  };

  const resetForm = () => {
    setSelectedSubject("");
    setContent("");
    setIsCommon(false);
    setIsEditing(false);
    setEditingId(null);
    setIsDialogOpen(false);
    setSelectedFile(null);
    setParsedContent("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return <div>Loading knowledge base...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Knowledge Base Manager</CardTitle>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            size="sm"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Knowledge
          </Button>
        </CardHeader>
        <CardContent>
          {knowledgeBase.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No knowledge base entries found. Create one to get started.</p>
          ) : (
            <div className="space-y-4">
              {knowledgeBase.map((item) => (
                <Card key={item.id} className="bg-muted">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <CardTitle className="text-sm font-medium">
                          {item.subject_name}
                          {item.is_common && <span className="ml-2 text-primary">(Common)</span>}
                        </CardTitle>
                        {item.file_url && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Attached file: {item.file_url.split('/').pop()}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap max-h-24 overflow-y-auto">
                      {item.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setIsDialogOpen(open);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Knowledge Base Entry" : "Add Knowledge Base Entry"}</DialogTitle>
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
            
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload Document (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  ref={fileInputRef}
                  id="file-upload" 
                  type="file" 
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                />
                <Button 
                  type="button"
                  onClick={handleFileUpload}
                  disabled={!selectedFile || fileUploading}
                  size="sm"
                >
                  {fileUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {selectedFile && (
                <p className="text-xs text-muted-foreground">
                  Selected file: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                </p>
              )}
              {isParsingFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Parsing document content...</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Enter knowledge base content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleAddKnowledge}>
              {isEditing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
