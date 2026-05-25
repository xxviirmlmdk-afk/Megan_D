export interface HostScanResult {
  target: string;
  ip: string;
  isUp: boolean;
  openPorts: number[];
  services: string[];
  os: string;
  sslValid: boolean;
  vulnerabilities: string[];
}

const commonPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 993, 995, 1433, 3306, 3389, 5432, 8080, 8443];
const commonServices = ["Apache", "Nginx", "OpenSSH", "MySQL", "PostgreSQL", "IIS", "Tomcat", "Node.js", "PHP-FPM"];
const commonOS = ["Linux (Ubuntu 20.04)", "Linux (CentOS 8)", "Windows Server 2019", "FreeBSD", "Debian 11"];

export function performHostScan(target: string, scanType: "quick" | "full" | "deep"): HostScanResult {
  const ipMatch = target.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/);
  const ip = ipMatch ? target : `${192}.${168}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  
  const portCount = scanType === "quick" ? 3 : scanType === "full" ? 6 : 10;
  const shuffled = [...commonPorts].sort(() => Math.random() - 0.5);
  const openPorts = shuffled.slice(0, portCount);
  
  const serviceCount = scanType === "quick" ? 2 : scanType === "full" ? 4 : 6;
  const shuffledServices = [...commonServices].sort(() => Math.random() - 0.5);
  const services = shuffledServices.slice(0, serviceCount);
  
  return {
    target,
    ip,
    isUp: true,
    openPorts,
    services,
    os: commonOS[Math.floor(Math.random() * commonOS.length)],
    sslValid: openPorts.includes(443) && Math.random() > 0.3,
    vulnerabilities: []
  };
}