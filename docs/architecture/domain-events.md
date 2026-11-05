
# API Sentinel — Domain Events and Module Communication

## 1. Purpose

This document describes how business modules communicate through domain events and integration events.

The objective is to keep business modules independent and reduce unnecessary coupling.

## 2. Domain Events

A Domain Event represents an important business fact that has already occurred.

Examples:

- WorkspaceCreated
- ProjectCreated
- TestCaseActivated
- TestRunQueued
- TestRunStarted
- TestRunCompleted
- BaselineApproved
- RegressionDetected

Events generally use past-tense names because they represent completed business occurrences.

## 3. Integration Events

Integration Events communicate business facts across bounded-context boundaries.

They provide explicit message contracts without exposing internal domain implementation details.

For example:

TestRunCompletedIntegrationEvent

This event can be consumed by:

- Regression Management
- Notification functionality
- Reporting functionality

## 4. Commands and Events

Commands request an action.

Events communicate that something has happened.

| Command | Event |
|---|---|
| CreateProject | ProjectCreated |
| ActivateTestCase | TestCaseActivated |
| ExecuteTestSuite | TestRunQueued |
| ApproveBaseline | BaselineApproved |

A command may be rejected. An event represents a fact that has already occurred.

## 5. Test Execution Communication Flow

1. The frontend requests test execution.
2. The Test Execution application service validates the request.
3. A TestRun is created.
4. An execution job is submitted to BullMQ.
5. The worker consumes the job.
6. The worker executes the configured tests.
7. Results are persisted.
8. TestRunCompleted is published.
9. Regression Management evaluates the execution against approved baselines.
10. Additional consumers may process the event for reporting or notifications.

## 6. Initial Event Consumers

| Event | Consumer | Responsibility |
|---|---|---|
| ProjectCreated | Project-related handlers | Initialize required project resources |
| TestRunQueued | Execution infrastructure | Coordinate execution job processing |
| TestRunCompleted | Regression Management | Evaluate baseline comparisons |
| TestRunCompleted | Reporting | Update reporting information |
| BaselineApproved | Regression Management | Activate approved reference behavior |

These are proposed responsibilities. Their exact implementation will be decided during development.

## 7. Implementation Strategy

The initial architecture will use:

- Modular NestJS modules.
- Application-layer event handlers.
- An internal event dispatcher where appropriate.
- Redis and BullMQ for asynchronous background jobs.
- PostgreSQL for durable application data.

Integration event contracts will be kept separate from internal domain entities.

## 8. Reliability Considerations

Important events must not be silently lost.

The Transactional Outbox Pattern will be evaluated for operations that require reliable database persistence and event publication.

Event consumers should be designed to tolerate duplicate delivery where applicable.

Events should include enough identifiers and version information to support processing and troubleshooting without exposing credentials or unnecessary sensitive data.

## 9. Architectural Principles

- Events represent business facts, not arbitrary method calls.
- Commands request actions; events report outcomes.
- Consumers should not depend on the publisher's internal implementation.
- Event handlers should be independently testable.
- Background operations should support retries and failure tracking.
- Event delivery must be designed with reliability and duplicate handling in mind.
