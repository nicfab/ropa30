# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability in **ropa30**, please report it
**privately** by emailing:

**nicola@nicfab.eu**

with the subject line `[ropa30 security]` followed by a brief description.

Please **do not** open a public issue on Codeberg or GitHub for security
matters until the vulnerability has been investigated and a fix is available.

### What to include

- A clear description of the vulnerability.
- Steps to reproduce it.
- The browser, browser version, and operating system where you observed it.
- Any proof-of-concept code or screenshots (without including real personal data).
- Your assessment of the severity and potential impact.

### What to expect

- **Acknowledgement** within 5 working days.
- A first response with a preliminary assessment within 10 working days.
- A patched release as soon as reasonably possible, depending on severity.
- Public disclosure coordinated with the reporter, with credit (if desired)
  in the release notes and CHANGELOG.

### Scope

In-scope vulnerabilities include:

- Cross-site scripting (XSS) in the ropa30 web application.
- Local data leakage (e.g. data unintentionally sent to external servers).
- Bypass of the local-only storage model.
- Insecure handling of imported / exported files.
- Vulnerabilities in the Service Worker that could be exploited offline.

Out-of-scope:

- Vulnerabilities in the underlying browser (report those to the browser vendor).
- Vulnerabilities in user-controlled deployments of ropa30 on their own infrastructure.
- Social engineering attacks not specific to ropa30.

---

## Security design principles

ropa30 is designed with the following security-by-design principles:

- **No network calls at runtime.** Once loaded, ropa30 does not make any
  HTTP request to external services. All data stays in the browser.
- **No external dependencies loaded at runtime.** All JavaScript libraries
  are bundled in the application; no CDN is used in production.
- **Strict Content Security Policy.** Inline scripts and external sources
  are disallowed.
- **No analytics, no telemetry, no fingerprinting.**
- **Encrypted backup export (planned).** Optional AES-256 encryption of
  JSON backups via the Web Crypto API.

---

## Responsible disclosure

We commit to:

- Treating all reports with confidentiality.
- Not pursuing legal action against researchers who follow this policy in
  good faith.
- Crediting reporters publicly (if they wish) once a fix has been released.

Thank you for helping keep ropa30 and its users safe.
