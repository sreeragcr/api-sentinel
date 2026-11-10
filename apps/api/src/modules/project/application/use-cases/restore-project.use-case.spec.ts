import { describe, it, expect, vi, beforeEach } from 'vitest';

import { RestoreProjectUseCase } from './restore-project.use-case.js';
import { ProjectRepository } from '../ports/project.repository.js';
import { ProjectNotFoundError } from '../errors/project-not-found.error.js';
import { Project } from '../../domain/entities/project.entity.js';

describe('RestoreProjectUseCase', () => {
    let useCase: RestoreProjectUseCase;
    let projectRepository: ProjectRepository;

    let existingProject: Project;
    let deletedProject: Project;

    beforeEach(() => {
        existingProject = Project.create({
            id: 'project-123',
            workspaceId: 'workspace-123',
            name: 'Payment Gateway',
            slug: 'payment-gateway',
            description: 'Payment API testing',
        });

        deletedProject = existingProject.softDelete();

        projectRepository = {
            save: vi.fn(),
            update: vi.fn(),
            findById: vi.fn(),
            findByWorkspaceId: vi.fn(),
            findDeletedByWorkspaceId: vi.fn(),
            deleteById: vi.fn(),
        } as unknown as ProjectRepository;

        useCase = new RestoreProjectUseCase(projectRepository);
    });

    it('should restore a deleted project', async () => {
        vi.mocked(projectRepository.findById).mockResolvedValue(
            deletedProject,
        );

        vi.mocked(projectRepository.update).mockImplementation(
            async (project) => project,
        );

        const result = await useCase.execute({
            projectId: deletedProject.id,
        });

        expect(result.deletedAt).toBeNull();

        expect(projectRepository.update).toHaveBeenCalledOnce();
        expect(projectRepository.update).toHaveBeenCalledWith(
            expect.objectContaining({
                id: deletedProject.id,
                deletedAt: null,
            }),
        );
    });

    it('should throw ProjectNotFoundError when project does not exist', async () => {
        vi.mocked(projectRepository.findById).mockResolvedValue(null);

        await expect(
            useCase.execute({ projectId: 'missing-project' }),
        ).rejects.toThrow(ProjectNotFoundError);

        expect(projectRepository.update).not.toHaveBeenCalled();
    });

    it('should return existing project when it is already active', async () => {
        vi.mocked(projectRepository.findById).mockResolvedValue(
            existingProject,
        );

        const result = await useCase.execute({
            projectId: existingProject.id,
        });

        expect(result).toBe(existingProject);
        expect(projectRepository.update).not.toHaveBeenCalled();
    });

    it('should propagate repository find errors', async () => {
        vi.mocked(projectRepository.findById).mockRejectedValue(
            new Error('Database connection failed'),
        );

        await expect(
            useCase.execute({ projectId: 'project-123' }),
        ).rejects.toThrow('Database connection failed');

        expect(projectRepository.update).not.toHaveBeenCalled();
    });

    it('should propagate repository update errors', async () => {
        vi.mocked(projectRepository.findById).mockResolvedValue(
            deletedProject,
        );

        vi.mocked(projectRepository.update).mockRejectedValue(
            new Error('Database update failed'),
        );

        await expect(
            useCase.execute({ projectId: deletedProject.id }),
        ).rejects.toThrow('Database update failed');
    });
});