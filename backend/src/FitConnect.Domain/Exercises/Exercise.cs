namespace FitConnect.Domain.Exercises;

public class Exercise
{
    public Guid Id { get; }
    public Guid TrainerId { get; }
    public string Name { get; private set; }
    public int DefaultReps { get; private set; }
    public int DefaultSets { get; private set; }
    public string? DemoVideoUrl { get; private set; }

    public Exercise(Guid id, Guid trainerId, string name, int defaultReps, int defaultSets, string? demoVideoUrl)
    {
        Id = id;
        TrainerId = trainerId;
        Name = name;
        DefaultReps = defaultReps;
        DefaultSets = defaultSets;
        DemoVideoUrl = demoVideoUrl;
    }

    public void UpdateDetails(string name, int defaultReps, int defaultSets)
    {
        if (defaultReps <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(defaultReps), "Default reps must be positive.");
        }

        if (defaultSets <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(defaultSets), "Default sets must be positive.");
        }

        Name = name;
        DefaultReps = defaultReps;
        DefaultSets = defaultSets;
    }

    public void RecordDemoVideo(string url)
    {
        DemoVideoUrl = url;
    }
}