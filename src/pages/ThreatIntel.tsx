import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Database, Search, Globe, Shield, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { threatIntelSources, queryThreatIntel, ThreatSource } from "../utils/threatIntel";

export default function ThreatIntel() {
  const [target, setTarget] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>(["virustotal"]);
  const [results, setResults] = useState<any[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(s => s !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleQuery = () => {
    if (!target || selectedSources.length === 0) return;
    
    setIsQuerying(true);
    
    setTimeout(() => {
      const queryResults = selectedSources.map(sourceId => 
        queryThreatIntel(target, sourceId)
      );
      setResults(queryResults);
      setIsQuerying(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Threat Intelligence</h1>
        <p className="text-slate-400 mt-1">Query multiple threat intelligence sources</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            Target Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="target" className="text-slate-300">Target Domain / IP / Hash</Label>
            <Input
              id="target"
              placeholder="example.com or 192.168.1.1 or hash"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div>
            <Label className="text-slate-300 mb-2 block">Select Sources</Label>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {threatIntelSources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => toggleSource(source.id)}
                  className={`p-3 text-left rounded-lg border transition-all ${
                    selectedSources.includes(source.id)
                      ? "bg-cyan-500/10 border-cyan-500/50"
                      : "bg-slate-800/50 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-200">{source.name}</span>
                    {selectedSources.includes(source.id) && (
                      <CheckCircle className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{source.category}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleQuery}
              disabled={!target || selectedSources.length === 0 || isQuerying}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
            >
              {isQuerying ? (
                <>
                  <Database className="w-4 h-4 mr-2 animate-pulse" />
                  Querying...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Query Sources
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {results.map((result, index) => (
            <Card key={index} className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    {result.source}
                  </span>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    result.isMalicious 
                      ? "bg-red-500/20 text-red-400" 
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}>
                    {result.isMalicious ? (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm">Malicious</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Clean</span>
                      </>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-slate-800/50 rounded-lg">
                      <p className="text-xs text-slate-500">Reputation Score</p>
                      <p className="text-lg font-bold text-slate-200">{result.reputation}/100</p>
                    </div>
                    <div className="p-2 bg-slate-800/50 rounded-lg">
                      <p className="text-xs text-slate-500">Confidence</p>
                      <p className="text-lg font-bold text-slate-200">{result.confidence}%</p>
                    </div>
                  </div>
                  
                  {result.details?.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {result.details.tags.map((tag: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
