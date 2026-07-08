using FitConnect.Application.Cooperations;
using FitConnect.Application.Exercises;
using FitConnect.Domain.Enums;
using FitConnect.Domain.Exceptions;
using FitConnect.Domain.Exceptions.Trainings;
using FitConnect.Domain.Trainings;

namespace FitConnect.Application.Trainings;

public class TrainingService
{
    private readonly ITrainingRepository trainingRepository;
    private readonly ICooperationRepository cooperationRepository;
    private readonly IExerciseRepository exerciseRepository;

    public TrainingService(ITrainingRepository trainingRepository, ICooperationRepository cooperationRepository, IExerciseRepository exerciseRepository)
    {
        this.trainingRepository = trainingRepository;
        this.cooperationRepository = cooperationRepository;
        this.exerciseRepository = exerciseRepository;
    }

    public Task<Training?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        trainingRepository.GetByIdAsync(id, cancellationToken);

    public Task<IReadOnlyList<Training>> GetForCooperationAsync(Guid cooperationId, CancellationToken cancellationToken = default) =>
        trainingRepository.GetForCooperationAsync(cooperationId, cancellationToken);

    public async Task<Training> AssignAsync(AssignTrainingCommand command, CancellationToken cancellationToken = default)
    {
        var cooperation = await cooperationRepository.GetByIdAsync(command.CooperationId, cancellationToken)
            ?? throw new CooperationNotFoundException(command.CooperationId);

        if (cooperation.Status is not CooperationStatus.Accepted and not CooperationStatus.Active)
        {
            throw new CooperationNotActiveForTrainingException(command.CooperationId);
        }

        foreach (var assignment in command.Exercises)
        {
            var exercise = await exerciseRepository.GetByIdAsync(assignment.ExerciseId, cancellationToken)
                ?? throw new ExerciseNotFoundException(assignment.ExerciseId);

            if (exercise.TrainerId != cooperation.TrainerId)
            {
                throw new ExerciseNotOwnedByTrainerException(assignment.ExerciseId);
            }
        }

        var trainingId = Guid.NewGuid();

        Training training = command.Type switch
        {
            TrainingType.Live => new LiveTraining(trainingId, command.CooperationId, command.TrainingDate, TrainingStatus.Scheduled, command.MeetingLink),
            TrainingType.Assigned => new AssignedTraining(
                trainingId, command.CooperationId, command.TrainingDate, TrainingStatus.Scheduled,
                command.TargetDate ?? throw new ArgumentException("Target date is required for an assigned training.", nameof(command))),
            _ => throw new ArgumentOutOfRangeException(nameof(command), "Unknown training type.")
        };

        var trainingExercises = command.Exercises
            .Select(a => new TrainingExercise(Guid.NewGuid(), trainingId, a.ExerciseId, a.Reps, a.Sets, completed: false, difficultyRating: null, clientComment: null))
            .ToList();

        return await trainingRepository.CreateAsync(training, trainingExercises, cancellationToken);
    }

    public async Task<Training> CompleteAsync(Guid trainingId, CancellationToken cancellationToken = default)
    {
        var training = await trainingRepository.GetByIdAsync(trainingId, cancellationToken)
            ?? throw new TrainingNotFoundException(trainingId);

        training.MarkComplete();
        await trainingRepository.UpdateStatusAsync(training, cancellationToken);
        return training;
    }

    public async Task<Training> MarkMissedAsync(Guid trainingId, CancellationToken cancellationToken = default)
    {
        var training = await trainingRepository.GetByIdAsync(trainingId, cancellationToken)
            ?? throw new TrainingNotFoundException(trainingId);

        training.MarkMissed();
        await trainingRepository.UpdateStatusAsync(training, cancellationToken);
        return training;
    }
}