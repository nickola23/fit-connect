namespace FitConnect.Domain.Equipment;

public class Equipment
{
    public Guid Id { get; }
    public string Name { get; private set; }

    public Equipment(Guid id, string name)
    {
        Id = id;
        Name = name;
    }

    public void Rename(string name)
    {
        Name = name;
    }
}