using FitConnect.Application.Common;
using FitConnect.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

var reactAppUrl = builder.Configuration["AllowedOrigins:ReactApp"];

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins(reactAppUrl!) 
            .AllowAnyMethod()
            .AllowAnyHeader());
});

builder.Services.AddSingleton<IDbConnectionFactory, NpgsqlConnectionFactory>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
