import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { AlertTriangle, Shield, Globe, Activity, Clock, TrendingUp, Server, Bug } from "lucide-react";

interface DashboardProps {
  scanResults: any[];
  vulnerabilities: any[];
}

export default function Dashboard({ scanResults, vulnerabilities }: DashboardProps) {
  const stats = [
    { 
      label: "Total Scans", 
      value: scanResults.length, 
      icon: Activity, 
      color: "text-cyan-400",
      bg: "bg-cyan-500/10"
    },
    { 
      label: "Vulnerabilities", 
      value: vulnerabilities.length, 
      icon: Bug, 
      color: "text-red-400",
      bg: "bg-red-500/10"
    },
    { 
      label: "Hosts Scanned", 
      value: new Set(scanResults.map(r => r.target)).size, 
      icon: Server, 
      color: "text-purple-400",
      bg: "bg-purple-500/10"
    },
    { 
      label: "Threats Blocked", 
      value: Math.floor(Math.random() * 50) + 10, 
      icon: Shield, 
      color: "text-emerald-400",
      bg: "bg-emerald-500/10"
    },
  ];

  const recentActivity = [
    { action: "Host scan completed", target: "example.com", time: "2 min ago", status: "success" },
    { action: "Vulnerability detected", target: "192.168.1.1", time: "5 min ago", status: "warning" },
    { action: "Payload generated", target: "XSS Test", time: "10 min ago", status: "info" },
    { action: "Threat intel query", target: "malicious-domain.com", time: "15 min ago", status: "success" },
    { action: "AI Analysis completed", target: "SQLi Detection", time: "20 min ago", status: "success" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-100 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Scan Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between gap-2">
              {[65, 45, 78, 52, 88, 42, 95, 60, 72, 55, 80, 48].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-cyan-500 to-purple-500 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-slate-500">{i + 1}h</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Clock className="w-5 h-5 text-purple-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-slate-800/50">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    activity.status === "success" ? "bg-emerald-400" :
                    activity.status === "warning" ? "bg-amber-400" : "bg-cyan-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{activity.action}</p>
                    <p className="text-xs text-slate-500">{activity.target} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Globe className="w-5 h-5 text-emerald-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "New Host Scan", desc: "Scan a target host" },
                { label: "Threat Lookup", desc: "Query threat intel" },
                { label: "Generate Payload", desc: "Create test payload" },
                { label: "AI Analysis", desc: "Run vulnerability AI" },
              ].map((action) => (
                <button
                  key={action.label}
                  className="p-4 text-left bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                >
                  <p className="text-sm font-medium text-slate-200">{action.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{action.desc}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { level: "info", message: "All threat intel sources operational" },
                { level: "warning", message: "Rate limit approaching for VirusTotal API" },
                { level: "success", message: "AI Agent model updated to latest version" },
              ].map((alert, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border ${
                    alert.level === "warning" 
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                      : alert.level === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                  }`}
                >
                  <p className="text-sm">{alert.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
