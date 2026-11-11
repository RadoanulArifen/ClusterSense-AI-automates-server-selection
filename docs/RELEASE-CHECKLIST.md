# Submission status

Prepared on 2026-11-11.

| Requirement | Evidence / remaining work |
| --- | --- |
| Complete source | Backend, frontend and training scripts in source ZIP; models rebuilt from CSV |
| Credentials excluded | ZIP allowlist excludes local environment files, Git history and dependencies; embedded API key removed |
| Clean setup | Docker and native/VPS procedures in HowToSetup.md; full clean-machine execution still needs verification |
| Database from scratch | database/schema.sql generated from nine ORM tables; optional repeatable database/seed.sql |
| Authentication and roles | All infrastructure routers require an active administrator; five regression checks pass |
| Live demo | Pending externally reachable HTTPS deployment and separately shared reviewer credentials |
| Dependencies | Frontend lockfile included; Python direct versions pinned; current CVE audit and transitive lock pending |
| Documentation | README.md, HowToSetup.md, AGENTS.md, CHANGELOG.md, LICENSE-NOTE.md and configuration examples included |
| Screenshots | Pending real screenshots after running the UI |
| Licensing | Confirm code attribution and rights to redistribute CSV training data before distribution |

Verified: frontend production build (bundle size warning), Docker Compose syntax,
SQL schema generation, shell syntax, five authorization tests and ZIP structure.
No PostgreSQL integration, Docker image build or public live-demo check was
completed in this environment. Static secret detection is not a comprehensive
credential audit; inspect the archive and rotate previously exposed credentials.
