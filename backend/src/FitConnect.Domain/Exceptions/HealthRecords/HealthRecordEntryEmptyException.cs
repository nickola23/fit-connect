namespace FitConnect.Domain.Exceptions.HealthRecords;

public class HealthRecordEntryEmptyException : Exception
{
    public HealthRecordEntryEmptyException()
        : base("A health record entry must include at least one of weight, height, or health condition.")
    {
    }
}