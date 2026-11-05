
# API Sentinel — Domain Model

## 1. Domain Overview

API Sentinel operates in the domain of API testing, automated test execution, and regression detection.

The platform enables development teams to define expected API behavior, execute tests repeatedly, maintain execution history, and identify unexpected changes.

## 2. Core Domain

The core domain is API Test Execution and Regression Detection.

The platform's primary value comes from:

- Defining reusable API tests.
- Executing tests against configured environments.
- Evaluating expected behavior.
- Maintaining execution history.
- Comparing results against approved baselines.
- Identifying regressions.

## 3. Domain Terminology

| Term | Definition |
|---|---|
| Workspace | An organizational space for a team |
| Project | A logical application or system being tested |
| API | A registered API under a project |
| API Contract | A machine-readable description of an API |
| Environment | A configured target environment |
| Test Suite | A collection of related test cases |
| Test Case | A reusable definition of expected API behavior |
| Assertion | A condition that must be satisfied by a test |
| Test Run | An execution instance |
| Test Result | The outcome of an executed test |
| Baseline | An approved reference representing expected behavior |
| Regression | An unexpected behavior change detected during comparison |

## 4. Initial Entity Candidates

- User
- Workspace
- WorkspaceMember
- Project
- API
- APIContract
- Environment
- TestSuite
- TestCase
- Assertion
- TestRun
- TestResult
- Baseline
- Schedule

These are initial candidates. Their exact aggregate boundaries and ownership will be refined during detailed design.

## 5. Initial Value Object Candidates

- HttpMethod
- EndpointPath
- AssertionDefinition
- AuthenticationConfiguration
- EnvironmentVariable
- ExecutionConfiguration
- RetryPolicy
- RequestConfiguration

## 6. Initial Bounded Contexts

### Identity and Access
Responsible for users, authentication, membership and authorization.

### Workspace Management
Responsible for workspace creation, membership and team roles.

### Project Management
Responsible for project creation, ownership and lifecycle.

### API Registry
Responsible for registering APIs and managing their contracts.

### Environment Management
Responsible for target environments and authentication configuration.

### Test Management
Responsible for test suites, test cases and assertions.

### Test Execution
Responsible for executing tests and recording results.

### Regression Management
Responsible for approved baselines and regression detection.

### Scheduling
Responsible for recurring test execution.

### AI Assistance
Responsible for optional AI-powered test authoring and failure analysis.

## 7. Important Business Rules

Initial business rules to validate and refine:

1. Every project belongs to a workspace.
2. Users can access projects only when authorized.
3. Every test case belongs to a project.
4. A test case must have a valid configuration before execution.
5. Test execution must use a valid API and environment configuration.
6. Every completed test execution must have a recorded outcome.
7. Baselines must be explicitly approved.
8. Regression detection must use defined comparison rules.
9. Sensitive credentials must never be exposed in execution logs.
10. AI-generated test suggestions must be reviewed before execution.

## 8. Architecture Considerations

- Domain rules must not depend on NestJS or Prisma.
- Protocol-specific execution must be isolated behind adapters.
- Test execution must be independent of HTTP request processing.
- Aggregate boundaries must protect business invariants.
- Domain events may be introduced where they simplify coordination between contexts.

## 9. Open Design Questions

- Can a project contain multiple APIs?
- Can a test suite contain tests targeting different APIs?
- Can a test case execute against multiple environments?
- Can one test run contain multiple test cases?
- Can a project have multiple approved baselines?
- How should baselines handle intentional API changes?
- How should we handle tests that modify data in target APIs?

These questions will be resolved before finalizing the database schema.


## 10. Proposed Entity Relationships

The initial domain hierarchy is:

Workspace
- Workspace Members
- Projects

Project
- APIs
- Environments
- Test Suites
- Test Cases

API
- API Contracts and contract revisions

Environment
- API-specific target configurations
- Authentication configuration

Test Suite
- References Test Cases belonging to the same Project

Test Case
- References one API
- Contains request configuration
- Contains one or more assertions

Test Run
- References a Project
- References an Environment
- Represents an execution of one or more Test Cases
- Preserves the relevant execution configuration snapshot
- Contains individual Test Results

Test Result
- Records the outcome of a Test Case during a Test Run
- Contains assertion outcomes and sanitized evidence

Baseline
- Represents explicitly approved reference behavior
- Associated with the relevant test and execution context

## 11. Proposed Aggregate Roots

| Aggregate Root | Aggregate Responsibility |
|---|---|
| Workspace | Workspace identity and lifecycle |
| Project | Project identity and configuration |
| API | API registration and contract association |
| Environment | Environment and API target configuration |
| TestSuite | Test suite organization |
| TestCase | Request configuration and assertions |
| TestRun | Execution lifecycle and results |
| Baseline | Approved reference behavior |

Aggregates will reference other aggregates using identifiers rather than directly owning entire object graphs.

## 12. Initial Business Invariants

1. Every Project belongs to exactly one Workspace.
2. Every API belongs to exactly one Project.
3. Every Environment belongs to exactly one Project.
4. An Environment can configure multiple APIs in its Project.
5. Every TestCase belongs to one Project and initially targets one API.
6. A TestSuite can only contain TestCases from its own Project.
7. A TestRun cannot combine TestCases from multiple Projects.
8. An Environment must have a valid target configuration for every API included in a TestRun.
9. Execution history must preserve the relevant configuration used during execution.
10. Baselines require explicit approval.

## 13. Design Decisions To Be Refined

- Whether TestCases can belong to multiple TestSuites.
- Whether a TestCase can target multiple API endpoints.
- Whether Baselines are specific to an Environment.
- How TestRun snapshots are represented and retained.
- How contract revisions affect existing TestCases.
- How large TestRuns and their results should be partitioned or stored.

