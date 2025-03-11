
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, Download, Eye, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ContentType, WordCountOption } from "./WriteContent";

interface HistoryItem {
  id: string;
  content_type: ContentType;
  subject: string;
  word_count_option: WordCountOption;
  target_word_count: number;
  generated_text: string;
  created_at: string;
}

interface ContentHistoryProps {
  userId: string;
}

export function ContentHistory({ userId }: ContentHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from("generated_content")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setHistory(data || []);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error fetching history",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId, toast]);

  const viewContent = (item: HistoryItem) => {
    setSelectedItem(item);
  };

  const downloadAsText = (item: HistoryItem) => {
    const element = document.createElement("a");
    const file = new Blob([item.generated_text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${item.content_type}_${item.subject.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadAsPDF = () => {
    toast({
      title: "Coming Soon",
      description: "PDF download functionality will be available soon!",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-[2fr_3fr] gap-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Content History</h2>
          {history.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">
                  No history found. Generate your first content!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {history.map((item) => (
                <Card 
                  key={item.id} 
                  className={`cursor-pointer transition-all hover:bg-muted/50 ${
                    selectedItem?.id === item.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => viewContent(item)}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg capitalize">
                      {item.content_type.replace('_', ' ')}
                    </CardTitle>
                    <CardDescription className="line-clamp-1">
                      {item.subject}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(item.created_at), "MMM d, yyyy")}
                      </div>
                      <div>
                        {item.target_word_count} words
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Content Preview</CardTitle>
            <CardDescription>
              {selectedItem 
                ? `${selectedItem.subject} (${selectedItem.target_word_count} words)`
                : "Select an item to preview"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedItem ? (
              <>
                <div className="flex justify-end mb-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadAsText(selectedItem)}
                      title="Download as Text"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      TXT
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadAsPDF}
                      title="Download as PDF"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
                <div className="border rounded-md p-4 min-h-[400px] bg-muted/20 whitespace-pre-line overflow-y-auto">
                  {selectedItem.generated_text}
                </div>
              </>
            ) : (
              <div className="border rounded-md p-4 min-h-[400px] bg-muted/20 flex justify-center items-center">
                <div className="flex flex-col items-center text-muted-foreground">
                  <Eye className="h-12 w-12 mb-2 opacity-20" />
                  <p>Select an item from history to preview</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
