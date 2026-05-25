# Megan_D — Product Overview

Megan_D is a browser-based **Security Operations Platform** built as a single-page application. It provides a unified interface for offensive and defensive security workflows.

## Core Capabilities

- **Host Checker** — Scan domains and IP addresses for open ports, services, OS fingerprinting, and SSL validity (quick / full / deep scan modes)
- **Threat Intelligence** — Query multiple external threat intel sources (VirusTotal, Shodan, Censys, AbuseIPDB, AlienVault OTX, ThreatCrowd) for reputation and malicious indicator data
- **Payload Engine** — Generate security test payloads for XSS, SQLi, LFI, RFI, RCE, SSRF, XXE, and Open Redirect vulnerability types
- **AI Multi-Agent System** — LLM-powered vulnerability analysis that produces boilerplate test code and step-by-step remediation guidance
- **Scan History** — Persistent in-memory log of all scan results (capped at 100 entries)
- **Reports** — Export and review aggregated scan and vulnerability data
- **Audit Logging** — Tracks user actions with timestamps for compliance

## Users & Roles

Three roles with distinct permission sets:

| Role     | Key Permissions                                              |
|----------|--------------------------------------------------------------|
| admin    | All features + settings, delete, manage users               |
| analyst  | Scan, payload, threat intel, AI agent, export               |
| viewer   | View and export only                                         |

Auth is currently mock-based (localStorage). Google OAuth flow is simulated.

## Design Aesthetic

Dark-first UI using a `slate-950` base with cyan/purple accent gradients. The platform is intended to feel like a professional SOC tool.
