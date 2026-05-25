import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Settings as SettingsIcon, Key, Globe, Shield, Database, Save, RefreshCw } from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState({
    apiKeys: {
      virustotal: "",
      shodan: "",
      censys: "",
      abuseipdb: ""
    },
    scanConfig: {
      timeout: "30",
      maxRetries: "3",
      concurrentScans: "5"
    },
    general: {
      autoSave: true,
      notifications: true,
      darkMode: true
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Settings</h1>
        <p className="text-slate-400 mt-1">Configure Megan_D security operations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              API Keys
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(settings.apiKeys).map(([key, value]) => (
              <div key={key}>
                <Label className="text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                <Input
                  type="password"
                  placeholder={`Enter ${key} API key`}
                  value={value}
                  onChange={(e) => setSettings({
                    ...settings,
                    apiKeys: { ...settings.apiKeys, [key]: e.target.value }
                  })}
                  className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
              </div>
            ))}
            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
              <Save className="w-4 h-4 mr-2" />
              Save API Keys
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              Scan Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-300">Default Timeout (seconds)</Label>
              <Input
                type="number"
                value={settings.scanConfig.timeout}
                onChange={(e) => setSettings({
                  ...settings,
                  scanConfig: { ...settings.scanConfig, timeout: e.target.value }
                })}
                className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>
            <div>
              <Label className="text-slate-300">Max Retries</Label>
              <Input
                type="number"
                value={settings.scanConfig.maxRetries}
                onChange={(e) => setSettings({
                  ...settings,
                  scanConfig: { ...settings.scanConfig, maxRetries: e.target.value }
                })}
                className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>
            <div>
              <Label className="text-slate-300">Concurrent Scans</Label>
              <Input
                type="number"
                value={settings.scanConfig.concurrentScans}
                onChange={(e) => setSettings({
                  ...settings,
                  scanConfig: { ...settings.scanConfig, concurrentScans: e.target.value }
                })}
                className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>
            <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <p className="text-sm text-slate-300">Clear all scan history and cached results</p>
              <Button variant="destructive" className="mt-3">
                Clear All Data
              </Button>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <p className="text-sm text-slate-300">Export all configuration and results</p>
              <Button variant="outline" className="mt-3 bg-slate-700 border-slate-600 text-slate-300">
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Threat Intel APIs", status: "Connected" },
              { name: "AI Agent System", status: "Active" },
              { name: "Payload Engine", status: "Ready" },
              { name: "Host Scanner", status: "Ready" }
            ].map((service) => (
              <div key={service.name} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-300">{service.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-sm text-emerald-400">{service.status}</span>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full bg-slate-800 border-slate-700 text-slate-300">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh All Services
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}