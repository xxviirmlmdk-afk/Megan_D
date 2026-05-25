export interface ThreatSource {
  id: string;
  name: string;
  description: string;
  category: string;
  reliability: number;
}

export const threatIntelSources: ThreatSource[] = [
  {
    id: "virustotal",
    name: "VirusTotal",
    description: "Comprehensive malware analysis service",
    category: "Malware",
    reliability: 95
  },
  {
    id: "shodan",
    name: "Shodan",
    description: "Search engine for Internet-connected devices",
    category: "Reconnaissance",
    reliability: 90
  },
  {
    id: "censys",
    name: "Censys",
    description: "Internet-wide scanning platform",
    category: "Reconnaissance",
    reliability: 88
  },
  {
    id: "abuseipdb",
    name: "AbuseIPDB",
    description: "IP address reputation database",
    category: "Reputation",
    reliability: 85
  },
  {
    id: "alienvault",
    name: "AlienVault OTX",
    description: "Open Threat Exchange community",
    category: "Threat Intel",
    reliability: 82
  },
  {
    id: "threatcrowd",
    name: "ThreatCrowd",
    description: "Community-driven threat intelligence",
    category: "Threat Intel",
    reliability: 78
  }
];

export function queryThreatIntel(target: string, sourceId: string): any {
  const source = threatIntelSources.find(s => s.id === sourceId);
  if (!source) return null;

  return {
    source: source.name,
    target,
    timestamp: new Date().toISOString(),
    reputation: Math.floor(Math.random() * 100),
    isMalicious: Math.random() > 0.7,
    confidence: Math.floor(Math.random() * 30) + 70,
    details: {
      firstSeen: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      lastSeen: new Date().toISOString(),
      reports: Math.floor(Math.random() * 50),
      tags: ["suspicious", "malware", "phishing"].filter(() => Math.random() > 0.5)
    }
  };
}