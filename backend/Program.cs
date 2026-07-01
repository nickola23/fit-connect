using System.Data;
// Make sure to include the namespace where PostgresConnection lives
using backend.database; 

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();

var reactAppUrl = builder.Configuration["AllowedOrigins:ReactApp"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins(reactAppUrl!) 
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowReactApp");

// Fetch users from the PostgreSQL database
app.MapGet("/users", () =>
    {
        var users = new List<User>();
    
        using var connection = PostgresConnection.CreateConnection();
        using var command = connection.CreateCommand();
    
        command.CommandText = "SELECT id, name, email, role::text, language FROM users;";
    
        using var reader = command.ExecuteReader();
    
        while (reader.Read())
        {
            users.Add(new User(
                reader.GetInt32(0),   // id
                reader.GetString(1),  // name
                reader.GetString(2),  // email
                reader.GetString(3),  // role
                reader.GetString(4)   // language
            ));
        }
    
        return Results.Ok(users);
    })
    .WithName("GetUsers");

app.Run();

// Simple record to represent the API response
record User(int Id, string Name, string Email, string Role, string Language);