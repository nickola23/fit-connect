using FitConnect.Application.Users;
using FitConnect.Domain.Exceptions;
using FitConnect.Domain.Exercises;

namespace FitConnect.Application.Exercises;

public class ExerciseService
{
    private readonly IExerciseRepository exerciseRepository;
    private readonly ITrainerRepository trainerRepository;

    public ExerciseService(IExerciseRepository exerciseRepository, ITrainerRepository trainerRepository)
    {
        this.exerciseRepository = exerciseRepository;
        this.trainerRepository = trainerRepository;
    }

    public Task<Exercise?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        exerciseRepository.GetByIdAsync(id, cancellationToken);

    public Task<IReadOnlyList<Exercise>> GetForTrainerAsync(Guid trainerId, CancellationToken cancellationToken = default) =>
        exerciseRepository.GetForTrainerAsync(trainerId, cancellationToken);

    public async Task<Exercise> CreateAsync(Guid trainerId, string name, string? description, int defaultReps, int defaultSets, CancellationToken cancellationToken = default)
    {
        _ = await trainerRepository.GetByIdAsync(trainerId, cancellationToken)
            ?? throw new UserNotFoundException(trainerId);

        var exercise = new Exercise(Guid.NewGuid(), trainerId, name, description, defaultReps, defaultSets, demoVideoUrl: null);
        return await exerciseRepository.CreateAsync(exercise, cancellationToken);
    }

    public async Task UpdateAsync(Guid id, string name, string? description, int defaultReps, int defaultSets, CancellationToken cancellationToken = default)
    {
        var exercise = await exerciseRepository.GetByIdAsync(id, cancellationToken)
                       ?? throw new ExerciseNotFoundException(id);

        exercise.UpdateDetails(name, description, defaultReps, defaultSets);
        await exerciseRepository.UpdateAsync(exercise, cancellationToken);
    }

    public async Task RecordDemoVideoAsync(Guid id, string url, CancellationToken cancellationToken = default)
    {
        var exercise = await exerciseRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new ExerciseNotFoundException(id);

        exercise.RecordDemoVideo(url);
        await exerciseRepository.UpdateAsync(exercise, cancellationToken);
    }

    public Task DeleteAsync(Guid id, CancellationToken cancellationToken = default) =>
        exerciseRepository.DeleteAsync(id, cancellationToken);
}