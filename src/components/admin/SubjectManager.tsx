
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2 } from "lucide-react";

type Subject = {
  id: string;
  name: string;
  created_at: string;
};

export function SubjectManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubjects(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch subjects",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Subject name cannot be empty",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('subjects')
        .insert({ name: newSubjectName.trim() });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Subject added successfully",
      });
      
      setNewSubjectName("");
      setIsDialogOpen(false);
      fetchSubjects();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add subject",
      });
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      // First, check if subject is being used in knowledge base
      const { count, error: knowledgeError } = await supabase
        .from('knowledge_base')
        .select('*', { count: 'exact', head: true })
        .eq('subject', id);

      if (knowledgeError) throw knowledgeError;
      
      if (count && count > 0) {
        toast({
          variant: "destructive",
          title: "Cannot Delete",
          description: "This subject is being used in the knowledge base",
        });
        return;
      }
      
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });
      
      fetchSubjects();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete subject",
      });
    }
  };

  if (loading) {
    return <div>Loading subjects...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Subjects</CardTitle>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            size="sm"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No subjects found. Create one to get started.</p>
          ) : (
            <div className="space-y-2">
              {subjects.map((subject) => (
                <div 
                  key={subject.id} 
                  className="flex items-center justify-between p-3 bg-muted rounded-md"
                >
                  <span>{subject.name}</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteSubject(subject.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subject</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Enter subject name"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSubject}>Add Subject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
