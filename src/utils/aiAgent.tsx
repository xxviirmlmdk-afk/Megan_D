export interface RemediationResult {
  vulnerability: string;
  severity: string;
  testCode: string;
  remediationSteps: string[];
  references: string[];
}

const vulnerabilityInfo: Record<string, { severity: string; description: string }> = {
  xss: { severity: "High", description: "Cross-Site Scripting allows attackers to inject malicious scripts" },
  sqli: { severity: "Critical", description: "SQL Injection can lead to data theft and database compromise" },
  lfi: { severity: "High", description: "Local File Inclusion can expose sensitive server files" },
  rfi: { severity: "Critical", description: "Remote File Inclusion can lead to remote code execution" },
  ssrf: { severity: "High", description: "Server-Side Request Forgery can access internal resources" },
  xxe: { severity: "High", description: "XML External Entity can read files and perform SSRF" },
  rce: { severity: "Critical", description: "Remote Code Execution allows complete system control" },
  ssti: { severity: "High", description: "Server-Side Template Injection can lead to RCE" },
};

const testCodeTemplates: Record<string, string> = {
  xss: `// XSS Vulnerability Test Script
const axios = require('axios');

async function testXSS(targetUrl, parameter) {
  const payloads = [
    '<script>alert(1)</script>',
    '<img src=x onerror=alert(1)>',
    '"><script>alert(1)</script>'
  ];
  
  for (const payload of payloads) {
    try {
      const response = await axios.get(targetUrl, {
        params: { [parameter]: payload }
      });
      
      if (response.data.includes(payload)) {
        console.log('[VULNERABLE] Reflected XSS found!');
        console.log('Parameter:', parameter);
        console.log('Payload:', payload);
      }
    } catch (error) {
      console.error('Request failed:', error.message);
    }
  }
}

testXSS('TARGET_URL', 'PARAMETER_NAME');`,

  sqli: `// SQL Injection Vulnerability Test Script
const axios = require('axios');

async function testSQLi(targetUrl, parameter) {
  const payloads = [
    "' OR '1'='1",
    "' UNION SELECT NULL--",
    "1; WAITFOR DELAY '0:0:5'--"
  ];
  
  for (const payload of payloads) {
    const startTime = Date.now();
    try {
      const response = await axios.get(targetUrl, {
        params: { [parameter]: payload },
        timeout: 10000
      });
      const elapsed = Date.now() - startTime;
      
      if (elapsed > 5000) {
        console.log('[VULNERABLE] Time-based SQLi detected!');
      } else if (response.data.includes('error') || response.data.includes('SQL')) {
        console.log('[POTENTIAL] Error-based SQLi detected!');
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log('[VULNERABLE] Time-based SQLi confirmed!');
      }
    }
  }
}

testSQLi('TARGET_URL', 'PARAMETER_NAME');`,

  lfi: `// Local File Inclusion Test Script
const axios = require('axios');

async function testLFI(targetUrl, parameter) {
  const payloads = [
    '../../../etc/passwd',
    '....//....//....//etc/passwd',
    '/etc/passwd%00',
    'php://filter/convert.base64-encode/resource=index.php'
  ];
  
  const indicators = ['root:', 'nobody:', 'daemon:', '<?php'];
  
  for (const payload of payloads) {
    try {
      const response = await axios.get(targetUrl, {
        params: { [parameter]: payload }
      });
      
      for (const indicator of indicators) {
        if (response.data.includes(indicator)) {
          console.log('[VULNERABLE] LFI detected!');
          console.log('Payload:', payload);
          console.log('Indicator found:', indicator);
          return;
        }
      }
    } catch (error) {
      console.error('Request failed:', error.message);
    }
  }
}

testLFI('TARGET_URL', 'PARAMETER_NAME');`,

  default: `// Generic Vulnerability Test Script
const axios = require('axios');

async function testVulnerability(targetUrl, parameter) {
  console.log('Testing:', targetUrl);
  console.log('Parameter:', parameter);
  
  try {
    const response = await axios.get(targetUrl);
    console.log('Response status:', response.status);
    console.log('Response length:', response.data.length);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testVulnerability('TARGET_URL', 'PARAMETER_NAME');`
};

const remediationSteps: Record<string, string[]> = {
  xss: [
    "Implement Content Security Policy (CSP) headers",
    "Use HTML encoding for all user inputs before rendering",
    "Implement input validation and sanitization",
    "Use HttpOnly and Secure flags on cookies",
    "Consider using frameworks with built-in XSS protection"
  ],
  sqli: [
    "Use parameterized queries / prepared statements",
    "Implement an ORM with proper escaping",
    "Apply the principle of least privilege to database users",
    "Validate and sanitize all user inputs",
    "Use stored procedures instead of dynamic SQL"
  ],
  lfi: [
    "Validate and sanitize file path inputs",
    "Use a whitelist of allowed files",
    "Implement proper path canonicalization",
    "Disable PHP wrappers if not needed",
    "Use chroot jails or containerization"
  ],
  rfi: [
    "Disable allow_url_include in PHP configuration",
    "Use a whitelist of allowed sources",
    "Implement strict input validation",
    "Use a Content Security Policy",
    "Avoid using user input in file inclusion functions"
  ],
  ssrf: [
    "Implement URL validation and whitelisting",
    "Use a dedicated HTTP client with restrictions",
    "Block requests to internal IP ranges",
    "Disable unnecessary URL schemes",
    "Implement network segmentation"
  ],
  xxe: [
    "Disable external entity processing in XML parsers",
    "Use JSON instead of XML where possible",
    "Implement input validation",
    "Use less complex data formats",
    "Update XML parsing libraries"
  ],
  rce: [
    "Avoid passing user input to system commands",
    "Use proper input sanitization and validation",
    "Implement strict input whitelisting",
    "Run applications with minimal privileges",
    "Use containerization for isolation"
  ],
  ssti: [
    "Avoid rendering user input in templates",
    "Use sandboxed template environments",
    "Implement input sanitization",
    "Use template engines with auto-escaping",
    "Limit template functionality"
  ]
};

const references: Record<string, string[]> = {
  xss: [
    "https://owasp.org/www-community/attacks/xss/",
    "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html"
  ],
  sqli: [
    "https://owasp.org/www-community/attacks/SQL_Injection",
    "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"
  ],
  lfi: [
    "https://owasp.org/www-community/attacks/File_Inclusion",
    "https://portswigger.net/web-security/file-path-traversal"
  ],
  rfi: [
    "https://owasp.org/www-community/attacks/File_Inclusion",
    "https://www.acunetix.com/blog/web-security-zone/remote-file-inclusion/"
  ],
  ssrf: [
    "https://owasp.org/www-community/attacks/Server_Side_Request_Forgery",
    "https://portswigger.net/web-security/ssrf"
  ],
  xxe: [
    "https://owasp.org/www-community/attacks/XXE",
    "https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html"
  ],
  rce: [
    "https://owasp.org/www-community/attacks/Command_Injection",
    "https://portswigger.net/web-security/os-command-injection"
  ],
  ssti: [
    "https://portswigger.net/web-security/server-side-template-injection",
    "https://owasp.org/www-community/attacks/Template_Injection"
  ]
};

export function generateRemediation(vulnerability: any): RemediationResult {
  const vulnType = vulnerability?.type || "xss";
  const info = vulnerabilityInfo[vulnType] || vulnerabilityInfo.xss;
  
  return {
    vulnerability: vulnType.toUpperCase(),
    severity: info.severity,
    testCode: testCodeTemplates[vulnType] || testCodeTemplates.default,
    remediationSteps: remediationSteps[vulnType] || remediationSteps.xss,
    references: references[vulnType] || references.xss
  };
}

export function generateTestCode(vulnType: string): string {
  return testCodeTemplates[vulnType] || testCodeTemplates.default;
}