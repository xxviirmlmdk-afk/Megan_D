import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Code2, Play, Copy, Download, AlertTriangle, Zap } from "lucide-react";
import { vulnerabilityTypes, generatePayload, PayloadConfig } from "../utils/payloadGenerator";

export default function PayloadEngine() {
  const [selectedVuln, setSelectedVuln] = useState("xss");
  const [target, setTarget] = useState("");
  const [parameters, setParameters] = useState("id,search,query");
  const [generatedPayload, setGeneratedPayload] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const config: PayloadConfig = {
        type: selectedVuln,
        target: target || "http://target.com/page",
        parameters: parameters.split(",").map(p => p.trim()).filter(Boolean)
      };
      
      const payload = generatePayload(config);
      setGeneratedPayload(payload);
      setIsGenerating(false);
    }, 800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPayload);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Payload Injection Engine</h1>
        <p className="text-slate-400 mt-1">Generate security test payloads for vulnerability testing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Vulnerability Type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {vulnerabilityTypes.map((vuln) => (
              <button
                key={vuln.id}
                onClick={() => setSelectedVuln(vuln.id)}
                className={`w-full p-3 text-left rounded-lg border transition-all ${
                  selectedVuln === vuln.id
                    ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-300"
                    : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{vuln.icon}</span>
                  <span className="font-medium">{vuln.name}</span>
                </div>
                <p className="text-xs mt-1 text-slate-500 line-clamp-2">{vuln.description}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-400" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target" className="text-slate-300">Target URL</Label>
                  <Input
                    id="target"
                    placeholder="http://target.com/page"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <Label htmlFor="params" className="text-slate-300">Parameters (comma-separated)</Label>
                  <Input
                    id="params"
                    placeholder="id, search, query"
                    value={parameters}
                    onChange={(e) => setParameters(e.target.value)}
                    className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                >
                  {isGenerating ? (
                    <>
                      <Play className="w-4 h-4 mr-2 animate-pulse" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Generate Payloads
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {generatedPayload && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    Generated Payloads
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCopy}
                      className="bg-slate-800 border-slate-700 text-slate-300"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const blob = new Blob([generatedPayload], { type: "text/plain" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `payloads_${selectedVuln}.txt`;
                        a.click();
                      }}
                      className="bg-slate-800 border-slate-700 text-slate-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-slate-950 rounded-lg overflow-x-auto text-sm border border-slate-800">
                  <code className="text-emerald-400 font-mono whitespace-pre-wrap">
                    {generatedPayload}
                  </code>
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}