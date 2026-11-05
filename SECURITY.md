# Security Policy

Security is a priority for API Sentinel.

## Reporting a Vulnerability

Please do not disclose security vulnerabilities through public GitHub issues.

Use GitHub's private vulnerability reporting feature if enabled for this repository.

Include:

- A description of the vulnerability.
- Steps to reproduce it.
- Potential impact.
- Suggested mitigation, if available.

Please avoid sharing real credentials, API tokens, or customer data.

## Security Principles

API Sentinel is designed to execute requests against user-configured API endpoints.

Security controls will include:

- Protection against Server-Side Request Forgery (SSRF).
- Secure credential storage.
- Secret redaction in logs and execution evidence.
- Project-level authorization.
- Request timeouts and resource limits.
- Safe handling of uploaded API contracts.
