export interface HostScanResult {
  target: string;
  ip: string;
  isUp: boolean;
  openPorts: number[];
  services: string[];
  sslValid: boolean;
  os: string;
  lastScanned: string;
}

function generateRandomIP(): string {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function generateOpenPorts(): number[] {
  const commonPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 993, 995, 3306, 3389, 5432, 8080, 8443];
  const count = Math.floor(Math.random() * 5) + 2;
  return commonPorts.sort(() => Math.random() - 0.5).slice(0, count);
}

function generateServices(): string[] {
  const allServices = ["HTTP", "HTTPS", "SSH", "FTP", "SMTP", "MySQL", "PostgreSQL", "Redis", "MongoDB", "Nginx", "Apache", "Node.js"];
  const count = Math.floor(Math.random() * 4) + 2;
  return allServices.sort(() => Math.random() - 0.5).slice(0, count);
}

export function performHostScan(target: string, scanType: "quick" | "full" | "deep"): HostScanResult {
  // Simulate host scanning
  const isUp = Math.random() > 0.2;
  
  return {
    target: target,
    ip: generateRandomIP(),
    isUp: isUp,
    openPorts: isUp ? generateOpenPorts() : [],
    services: isUp ? generateServices() : [],
    sslValid: isUp && Math.random() > 0.3,
    os: ["Linux", "Windows Server", "Ubuntu", "CentOS", "Debian"][Math.floor(Math.random() * 5)],
    lastScanned: new Date().toISOString(),
  };
}