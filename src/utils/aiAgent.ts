export interface RemediationResult {
  testCode: string;
  remediationSteps: string[];
  severity: "low" | "medium" | "high" | "critical";
  references: string[];
}

export function generateRemediation(vulnerability: any): RemediationResult {
  const vulnType = vulnerability?.type || "generic";
  
  const testCodes: Record<string, string> = {
    xss: `# XSS Vulnerability Test
import requests

def test_xss(url, param):
    payloads = [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert('XSS')>",
        ""><script>alert(1)</script>"
    ]
    
    for payload in payloads:
        response = requests.get(url, params={param: payload})
        if payload in response.text:
            print(f"[VULNERABLE] Reflected: {payload}")
            return True
    return False

# Usage
test_xss("http://target.com/search", "query")`,

    sqli: `# SQL Injection Test
import requests

def test_sqli(url, param):
    payloads = [
        "' OR '1'='1",
        "' UNION SELECT NULL--",
        "1; DROP TABLE users--"
    ]
    
    for payload in payloads:
        response = requests.get(url, params={param: payload})
        if "error" in response.text.lower() or "sql" in response.text.lower():
            print(f"[POTENTIAL SQLi] Payload: {payload}")
            return True
    return False

# Usage
test_sqli("http://target.com/product", "id")`,

    open_ports: `# Port Scanning Test
import socket

def scan_ports(host, ports=[21, 22, 80, 443, 3306]):
    open_ports = []
    for port in ports:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((host, port))
        if result == 0:
            open_ports.append(port)
            print(f"[OPEN] Port {port}")
        sock.close()
    return open_ports

# Usage
scan_ports("192.168.1.1")`,

    generic: `# Generic Security Test
import requests

def test_security_headers(url):
    response = requests.get(url)
    headers = response.headers
    
    security_headers = [
        "X-Frame-Options",
        "X-Content-Type-Options",
        "X-XSS-Protection",
        "Content-Security-Policy",
        "Strict-Transport-Security"
    ]
    
    for header in security_headers:
        if header not in headers:
            print(f"[MISSING] {header}")
    
    return headers

# Usage
test_security_headers("http://target.com")`
  };

  const remediationSteps: Record<string, string[]> = {
    xss: [
      "Implement Content Security Policy (CSP) headers",
      "Use HTML entity encoding for all user input",
      "Implement input validation and sanitization",
      "Use HTTPOnly and Secure flags on cookies",
      "Consider using a WAF with XSS filtering"
    ],
    sqli: [
      "Use parameterized queries/prepared statements",
      "Implement input validation and sanitization",
      "Use an ORM or query builder",
      "Apply least privilege database permissions",
      "Implement Web Application Firewall (WAF)"
    ],
    open_ports: [
      "Close unnecessary open ports",
      "Implement firewall rules to restrict access",
      "Use port knocking for sensitive services",
      "Regularly audit open ports and services",
      "Disable unused services"
    ],
    generic: [
      "Implement security headers",
      "Enable HTTPS with valid certificates",
      "Regular security audits",
      "Keep software updated",
      "Implement proper error handling"
    ]
  };

  const references = [
    "https://owasp.org/www-project-top-ten/",
    "https://cheatsheetseries.owasp.org/",
    "https://cwe.mitre.org/",
    "https://nvd.nist.gov/"
  ];

  return {
    testCode: testCodes[vulnType] || testCodes.generic,
    remediationSteps: remediationSteps[vulnType] || remediationSteps.generic,
    severity: vulnerability?.severity || "medium",
    references
  };
}

export function generateTestCode(vulnerabilityType: string): string {
  const templates: Record<string, string> = {
    xss: `# XSS Test Script\n# Run: python xss_test.py`,
    sqli: `# SQL Injection Test Script\n# Run: python sqli_test.py`,
    default: `# Security Test Script\n# Run: python test.py`
  };

  return templates[vulnerabilityType] || templates.default;
}