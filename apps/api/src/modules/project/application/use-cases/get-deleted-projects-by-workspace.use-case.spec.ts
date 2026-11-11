
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GetDeletedProjectsByWorkspaceUseCase } from './get-deleted-projects-by-workspace.use-case.js';

import { ProjectRepository } from '../ports/project.repository.js';

import { WorkspaceExistenceChecker } from '../ports/workspace-existence-checker.js';

import { WorkspaceNotFoundError } from '../errors/workspace-not-found.error.js';

describe('GetDeletedProjectsByWorkspaceUseCase', () => {
  let useCase: GetDeletedProjectsByWorkspaceUseCase;

  let projectRepository: ProjectRepository;
  let workspaceExistenceChecker: WorkspaceExistenceChecker;

  const workspaceId = 'workspace-123';

  beforeEach(() => {
    projectRepository = {
      save: vi.fn(),
      update: vi.fn(),
      findById: vi.fn(),
      findByWorkspaceId: vi.fn(),
      findDeletedByWorkspaceId: vi.fn(),
      deleteById: vi.fn(),
    } as unknown as ProjectRepository;

    workspaceExistenceChecker = {
      existsById: vi.fn(),
    } as unknown as WorkspaceExistenceChecker;

    useCase = new GetDeletedProjectsByWorkspaceUseCase(
      projectRepository,
      workspaceExistenceChecker,
    );
  });

  it('should retrieve deleted projects for a workspace', async () => {
    const expectedResult = {
      items: [],
      totalCount: 0,
    };

    vi.mocked(workspaceExistenceChecker.existsById)
      .mockResolvedValue(true);

    vi.mocked(projectRepository.findDeletedByWorkspaceId)
      .mockResolvedValue(expectedResult);

    const result = await useCase.execute({
      workspaceId,
      offset: 0,
      limit: 20,
    });

    expect(result).toEqual(expectedResult);

    expect(projectRepository.findDeletedByWorkspaceId)
      .toHaveBeenCalledWith(workspaceId, {
        offset: 0,
        limit: 20,
      });
  });

  it('should return an empty result when no deleted projects exist', async () => {
    vi.mocked(workspaceExistenceChecker.existsById)
      .mockResolvedValue(true);

    vi.mocked(projectRepository.findDeletedByWorkspaceId)
      .mockResolvedValue({
        items: [],
        totalCount: 0,
      });

    const result = await useCase.execute({
      workspaceId,
      offset: 0,
      limit: 20,
    });

    expect(result.items).toEqual([]);
    expect(result.totalCount).toBe(0);
  });

  it('should throw WorkspaceNotFoundError when workspace does not exist', async () => {
    vi.mocked(workspaceExistenceChecker.existsById)
      .mockResolvedValue(false);

    await expect(
      useCase.execute({
        workspaceId,
        offset: 0,
        limit: 20,
      }),
    ).rejects.toThrow(WorkspaceNotFoundError);

    expect(projectRepository.findDeletedByWorkspaceId)
      .not.toHaveBeenCalled();
  });

  it('should propagate workspace checker errors', async () => {
    vi.mocked(workspaceExistenceChecker.existsById)
      .mockRejectedValue(new Error('Database connection failed'));

    await expect(
      useCase.execute({
        workspaceId,
        offset: 0,
        limit: 20,
      }),
    ).rejects.toThrow('Database connection failed');

    expect(projectRepository.findDeletedByWorkspaceId)
      .not.toHaveBeenCalled();
  });

  it('should propagate repository errors', async () => {
    vi.mocked(workspaceExistenceChecker.existsById)
      .mockResolvedValue(true);

    vi.mocked(projectRepository.findDeletedByWorkspaceId)
      .mockRejectedValue(new Error('Database query failed'));

    await expect(
      useCase.execute({
        workspaceId,
        offset: 0,
        limit: 20,
      }),
    ).rejects.toThrow('Database query failed');
  });

  it('should pass the requested pagination values to the repository', async () => {
    vi.mocked(workspaceExistenceChecker.existsById)
      .mockResolvedValue(true);

    vi.mocked(projectRepository.findDeletedByWorkspaceId)
      .mockResolvedValue({
        items: [],
        totalCount: 0,
      });

    await useCase.execute({
      workspaceId,
      offset: 10,
      limit: 5,
    });

    expect(projectRepository.findDeletedByWorkspaceId)
      .toHaveBeenCalledWith(workspaceId, {
        offset: 10,
        limit: 5,
      });
  });
});
