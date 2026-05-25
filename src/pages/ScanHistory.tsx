import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { History, Globe, Server, Clock, Trash2, Download, CheckCircle, AlertTriangle } from "lucide-react";

interface ScanHistoryProps {
  results: any[];
}

export default function ScanHistory({ results }: ScanHistoryProps) {
  if (results.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Scan History</h1>
          <p className="text-slate-400 mt-1">View past scan results and analysis</p>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-12">
            <div className="text-center">
              <History className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No scan history yet</p>
              <p className="text-sm text-slate-500 mt-1">Run scans to see results here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Scan History</h1>
          <p className="text-slate-400 mt-1">{results.length} scans recorded</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-slate-800 border-slate-700 text-slate-300">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
          <Button variant="destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear History
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <Card key={index} className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    result.type === "host" ? "bg-cyan-500/10" : "bg-purple-500/10"
                  }`}>
                    {result.type === "host" ? (
                      <Globe className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <Server className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{result.target}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span className="text-xs text-slate-500">
                        {new Date(result.timestamp).toLocaleString()}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        result.vulnerabilities?.length > 0 
                          ? "bg-amber-500/20 text-amber-400" 
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}>
                        {result.vulnerabilities?.length > 0 
                          ? `${result.vulnerabilities.length} issues` 
                          : "Clean"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {result.vulnerabilities?.length > 0 ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  )}
                  <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-slate-300">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
