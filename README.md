# API Sentinel

**An open-source, self-hostable API testing and regression detection platform.**

API Sentinel helps development teams define, execute, organize, and monitor API tests across REST, GraphQL, and gRPC services.

The platform provides centralized test management, automated execution, execution history, baseline comparisons, and regression detection.

## Why API Sentinel?

API behavior can change unexpectedly as applications evolve.

API Sentinel aims to help teams:

- Manage API tests in a centralized workspace.
- Import API contracts and discover API structures.
- Create reusable test cases with configurable assertions.
- Execute tests against different environments.
- Run tests asynchronously in the background.
- Maintain execution history and compare results.
- Detect unexpected API behavior changes.
- Schedule recurring test executions.
- Collaborate through shared workspaces and projects.

## Supported API Protocols

| Protocol | Planned capabilities |
|---|---|
| REST | OpenAPI import, HTTP execution, assertions |
| GraphQL | Schema import, query and mutation testing |
| gRPC | Protocol Buffers import, unary RPC testing |

## Technology Stack

| Area | Technology |
|---|---|
| Backend | NestJS, TypeScript |
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Cache | Redis |
| Background Jobs | BullMQ |
| Containerization | Docker, Docker Compose |
| Testing | Jest, Vitest, Playwright |

## Architecture

API Sentinel will initially follow a modular monolith architecture with a separate background worker process.

The architecture will use principles from:

- Domain-Driven Design (DDD)
- Hexagonal Architecture
- Clean Architecture

## Project Status

**Early development — foundation and architecture phase.**

Features and implementation details are subject to change.

## Development

The project follows a Docker-first development approach. Contributors will be able to run the development environment using Docker Compose without installing application dependencies directly on their host machines.

Detailed setup instructions will be added as the development environment is established.

## Open Source

API Sentinel is intended to be an open-source project. Contributions, feedback, bug reports, and feature suggestions will be welcome.

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines and [SECURITY.md](SECURITY.md) for security reporting.

## License

This project is licensed under the MIT License.
