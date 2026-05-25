export interface ThreatSource {
  id: string;
  name: string;
  type: string;
  url: string;
}

export const threatIntelSources: ThreatSource[] = [
  { id: "abuseipdb", name: "AbuseIPDB", type: "IP Reputation", url: "https://www.abuseipdb.com" },
  { id: "virustotal", name: "VirusTotal", type: "Malware Detection", url: "https://www.virustotal.com" },
  { id: "otx", name: "AlienVault OTX", type: "Threat Intelligence", url: "https://otx.alienvault.com" },
  { id: "shodan", name: "Shodan", type: "Port Scanning", url: "https://www.shodan.io" },
  { id: "censys", name: "Censys", type: "Attack Surface", url: "https://censys.io" },
  { id: "greynoise", name: "Greynoise", type: "Background Noise", url: "https://www.greynoise.io" },
  { id: "threatcrowd", name: "ThreatCrowd", type: "Threat Aggregation", url: "https://www.threatcrowd.org" },
  { id: "urlhaus", name: "URLhaus", type: "URL Malware", url: "https://urlhaus.abuse.ch" },
];