
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Search, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function KnowledgeBaseManager() {
  const [knowledgeBase, setKnowledgeBase] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [content, setContent] = useState("");
  const [isCommon, setIsCommon] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Fetch knowledge base and subjects
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("*")
        .order("name");

      if (subjectsError) throw subjectsError;
      
      // Fetch knowledge base with a modified approach to handle subjects
      const { data: kbData, error: kbError } = await supabase
        .from("knowledge_base")
        .select("*")
        .order("created_at", { ascending: false });

      if (kbError) throw kbError;

      console.log("Fetched subjects:", subjectsData);
      console.log("Fetched knowledge base:", kbData);
      
      // Create a lookup for subject names
      const subjectLookup = new Map();
      subjectsData?.forEach(subject => {
        subjectLookup.set(subject.id, subject.name);
      });
      
      // Format the data to handle the subject names
      const formattedKbData = kbData?.map((item) => ({
        ...item,
        subject_name: item.is_common ? "Common" : subjectLookup.get(item.subject) || "Unknown"
      }));

      setSubjects(subjectsData || []);
      setKnowledgeBase(formattedKbData || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch data",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setSelectedSubject(item.is_common ? "" : item.subject);
      setContent(item.content || "");
      setIsCommon(item.is_common);
    } else {
      setEditingItem(null);
      setSelectedSubject("");
      setContent("");
      setIsCommon(false);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSubject("");
    setContent("");
    setIsCommon(false);
    setEditingItem(null);
  };

  const validateForm = () => {
    if (isCommon) {
      if (!content.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Content cannot be empty",
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
      
      if (!content.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Content cannot be empty",
        });
        return false;
      }
    }
    return true;
  };

  const handleSaveKnowledgeBase = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      const subjectValue = isCommon ? "common" : selectedSubject;
      
      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from("knowledge_base")
          .update({
            subject: subjectValue,
            content: content.trim(),
            is_common: isCommon
          })
          .eq("id", editingItem.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Knowledge base entry updated successfully",
        });
      } else {
        // Create new item
        const { error } = await supabase
          .from("knowledge_base")
          .insert({
            subject: subjectValue,
            content: content.trim(),
            is_common: isCommon
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Knowledge base entry created successfully",
        });
      }

      // Refresh the data
      fetchData();
      handleCloseDialog();
    } catch (error: any) {
      console.error("Error saving knowledge base:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save knowledge base entry",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteKnowledgeBase = async (id: string) => {
    if (!confirm("Are you sure you want to delete this knowledge base entry?")) {
      return;
    }

    try {
      setIsProcessing(true);
      const { error } = await supabase
        .from("knowledge_base")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Knowledge base entry deleted successfully",
      });
      
      // Refresh the data
      fetchData();
    } catch (error: any) {
      console.error("Error deleting knowledge base:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete knowledge base entry",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter knowledge base based on search term
  const filteredKnowledgeBase = knowledgeBase.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.subject_name?.toLowerCase().includes(searchLower) ||
      item.content?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Knowledge Base Manager</CardTitle>
          <Button 
            onClick={() => handleOpenDialog()} 
            size="sm"
            disabled={isProcessing}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Knowledge
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by subject or content..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : knowledgeBase.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No knowledge base entries found. Create your first entry.</p>
            </div>
          ) : filteredKnowledgeBase.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKnowledgeBase.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.subject_name}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{item.content}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.is_common ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                      }`}>
                        {item.is_common ? "Common" : "Subject Specific"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(item)}
                          disabled={isProcessing}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteKnowledgeBase(item.id)}
                          disabled={isProcessing}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog for adding/editing knowledge base */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Knowledge Base Entry" : "Add Knowledge Base Entry"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is-common"
                checked={isCommon}
                onCheckedChange={setIsCommon}
              />
              <Label htmlFor="is-common">Common Knowledge (applies to all subjects)</Label>
            </div>

            {!isCommon && (
              <div className="space-y-2">
                <Label htmlFor="subject-select">Subject</Label>
                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}
                  disabled={subjects.length === 0}
                >
                  <SelectTrigger id="subject-select">
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
                {subjects.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No subjects available. Please create a subject first.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter knowledge base content"
                className="min-h-[150px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveKnowledgeBase}
              disabled={isProcessing || (!isCommon && !selectedSubject) || !content.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingItem ? "Updating..." : "Creating..."}
                </>
              ) : (
                editingItem ? "Update" : "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
