import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Brain, Sparkles, Code, Shield, AlertTriangle, CheckCircle, Loader } from "lucide-react";
import { generateRemediation, RemediationResult } from "../utils/aiAgent";

interface AgentSystemProps {
  vulnerabilities: any[];
}

export default function AgentSystem({ vulnerabilities }: AgentSystemProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<RemediationResult | null>(null);
  const [selectedTab, setSelectedTab] = useState<"code" | "remediation">("code");

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const result = generateRemediation(vulnerabilities.length > 0 ? vulnerabilities[0] : null);
      setAnalysisResult(result);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">AI Multi-Agent System</h1>
        <p className="text-slate-400 mt-1">LLM-powered vulnerability analysis and remediation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Agent Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Detection Agent", status: "active", color: "emerald" },
              { name: "Analysis Agent", status: "active", color: "cyan" },
              { name: "Code Generator", status: "standby", color: "amber" },
              { name: "Remediation Agent", status: "standby", color: "purple" },
            ].map((agent) => (
              <div key={agent.name} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-300">{agent.name}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    agent.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                  }`} />
                  <span className={`text-xs ${
                    agent.status === "active" ? "text-emerald-400" : "text-amber-400"
                  }`}>
                    {agent.status}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-slate-200">Vulnerability Analysis</h3>
                  <p className="text-sm text-slate-500">
                    {vulnerabilities.length > 0 
                      ? `${vulnerabilities.length} vulnerabilities detected for analysis`
                      : "No vulnerabilities detected yet. Run scans to find issues."}
                  </p>
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Run Analysis
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {analysisResult && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Button
                    variant={selectedTab === "code" ? "default" : "outline"}
                    onClick={() => setSelectedTab("code")}
                    className={selectedTab === "code" ? "bg-cyan-500 hover:bg-cyan-600" : "bg-slate-800 border-slate-700"}
                  >
                    <Code className="w-4 h-4 mr-2" />
                    Test Code
                  </Button>
                  <Button
                    variant={selectedTab === "remediation" ? "default" : "outline"}
                    onClick={() => setSelectedTab("remediation")}
                    className={selectedTab === "remediation" ? "bg-purple-500 hover:bg-purple-600" : "bg-slate-800 border-slate-700"}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Remediation
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedTab === "code" ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-cyan-300">Boilerplate test code for vulnerability verification</span>
                    </div>
                    <pre className="p-4 bg-slate-950 rounded-lg overflow-x-auto text-sm">
                      <code className="text-emerald-400 font-mono whitespace-pre">
                        {analysisResult.testCode}
                      </code>
                    </pre>
                    <Button
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(analysisResult.testCode)}
                      className="bg-slate-800 border-slate-700 text-slate-300"
                    >
                      Copy Code
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-purple-300">Actionable remediation steps</span>
                    </div>
                    <div className="space-y-3">
                      {analysisResult.remediationSteps.map((step, index) => (
                        <div key={index} className="flex gap-3 p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <span className="text-xs text-purple-400">{index + 1}</span>
                          </div>
                          <p className="text-sm text-slate-300">{step}</p>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-slate-700">
                      <h4 className="text-sm font-medium text-slate-400 mb-2">References</h4>
                      <div className="space-y-1">
                        {analysisResult.references.map((ref, index) => (
                          <a
                            key={index}
                            href={ref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-cyan-400 hover:text-cyan-300"
                          >
                            {ref}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}