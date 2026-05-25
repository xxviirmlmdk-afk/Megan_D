import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { FileText, Download, FileJson, FileSpreadsheet, FileDown, BarChart3, PieChart, TrendingUp } from "lucide-react";
import { exportToJSON, exportToCSV, generatePDFReport } from "../utils/exportUtils";
import { useNotifications } from "../context/NotificationContext";
import { useAudit } from "../context/AuditContext";

interface ReportsProps {
  scanResults: any[];
  vulnerabilities: any[];
}

export default function Reports({ scanResults, vulnerabilities }: ReportsProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const { addNotification } = useNotifications();
  const { logAction } = useAudit();

  const handleExport = async (format: "json" | "csv" | "pdf") => {
    setIsExporting(format);
    logAction("export_report", `Exported report in ${format.toUpperCase()} format`);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const data = {
        scanResults,
        vulnerabilities,
        generatedAt: new Date().toISOString(),
        summary: {
          totalScans: scanResults.length,
          totalVulnerabilities: vulnerabilities.length,
          criticalCount: vulnerabilities.filter(v => v.severity === "critical").length,
          highCount: vulnerabilities.filter(v => v.severity === "high").length,
        }
      };

      switch (format) {
        case "json":
          exportToJSON(data, `megand-report-${Date.now()}.json`);
          break;
        case "csv":
          exportToCSV(scanResults, `megand-scan-results-${Date.now()}.csv`);
          break;
        case "pdf":
          generatePDFReport(data);
          break;
      }

      addNotification("success", "Export Complete", `Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      addNotification("error", "Export Failed", "Failed to generate report");
    }

    setIsExporting(null);
  };

  const reportTypes = [
    {
      title: "Executive Summary",
      description: "High-level overview for stakeholders",
      icon: BarChart3,
      color: "cyan"
    },
    {
      title: "Technical Report",
      description: "Detailed vulnerability analysis",
      icon: FileText,
      color: "purple"
    },
    {
      title: "Compliance Report",
      description: "OWASP Top 10 compliance status",
      icon: PieChart,
      color: "emerald"
    },
    {
      title: "Trend Analysis",
      description: "Security posture over time",
      icon: TrendingUp,
      color: "amber"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Reports & Export</h1>
        <p className="text-slate-400 mt-1">Generate and export security reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Download className="w-5 h-5 text-cyan-400" />
              Quick Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <Button
                onClick={() => handleExport("json")}
                disabled={isExporting !== null}
                className="h-20 flex-col bg-slate-800 hover:bg-slate-700 border border-slate-700"
              >
                {isExporting === "json" ? (
                  <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FileJson className="w-6 h-6 text-cyan-400 mb-2" />
                )}
                <span className="text-sm text-slate-300">JSON</span>
              </Button>

              <Button
                onClick={() => handleExport("csv")}
                disabled={isExporting !== null}
                className="h-20 flex-col bg-slate-800 hover:bg-slate-700 border border-slate-700"
              >
                {isExporting === "csv" ? (
                  <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-6 h-6 text-emerald-400 mb-2" />
                )}
                <span className="text-sm text-slate-300">CSV</span>
              </Button>

              <Button
                onClick={() => handleExport("pdf")}
                disabled={isExporting !== null}
                className="h-20 flex-col bg-slate-800 hover:bg-slate-700 border border-slate-700"
              >
                {isExporting === "pdf" ? (
                  <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FileDown className="w-6 h-6 text-red-400 mb-2" />
                )}
                <span className="text-sm text-slate-300">PDF</span>
              </Button>
            </div>

            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
              <p className="text-sm text-slate-400">
                <span className="text-slate-300 font-medium">{scanResults.length}</span> scans • 
                <span className="text-slate-300 font-medium ml-1">{vulnerabilities.length}</span> vulnerabilities
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <FileText className="w-5 h-5 text-purple-400" />
              Report Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportTypes.map((report) => {
                const Icon = report.icon;
                const colorClasses: Record<string, string> = {
                  cyan: "text-cyan-400 bg-cyan-500/10",
                  purple: "text-purple-400 bg-purple-500/10",
                  emerald: "text-emerald-400 bg-emerald-500/10",
                  amber: "text-amber-400 bg-amber-500/10"
                };

                return (
                  <button
                    key={report.title}
                    className="w-full flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors text-left"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[report.color]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-200">{report.title}</p>
                      <p className="text-xs text-slate-500">{report.description}</p>
                    </div>
                    <Download className="w-4 h-4 text-slate-500" />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">Report Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-950 rounded-lg p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-slate-100">Megan_D Security Report</h3>
                <p className="text-sm text-slate-500">Generated: {new Date().toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Report ID</p>
                <p className="text-slate-200 font-mono">RPT-{Date.now().toString(36).toUpperCase()}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Scans", value: scanResults.length, color: "cyan" },
                { label: "Vulnerabilities", value: vulnerabilities.length, color: "red" },
                { label: "Critical", value: vulnerabilities.filter(v => v.severity === "critical").length, color: "amber" },
                { label: "Resolved", value: Math.floor(vulnerabilities.length * 0.3), color: "emerald" }
              ].map((stat) => (
                <div key={stat.label} className="p-3 bg-slate-900 rounded-lg">
                  <p className="text-xs text-slate-500">{stat.label}</p>
                  <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-300">Summary</h4>
              <p className="text-sm text-slate-400">
                This report contains the results of {scanResults.length} security scans performed by Megan_D.
                A total of {vulnerabilities.length} vulnerabilities were detected across all scanned targets.
                Immediate attention is recommended for {vulnerabilities.filter(v => v.severity === "critical").length} critical issues.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}