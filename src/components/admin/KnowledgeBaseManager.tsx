
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function KnowledgeBaseManager() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Knowledge Base Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">Knowledge base management functionality has been purged.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
