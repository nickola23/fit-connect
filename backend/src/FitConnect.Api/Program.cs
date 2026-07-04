using FitConnect.Api.Middleware;
using FitConnect.Application.Common;
using FitConnect.Application.Users;
using FitConnect.Infrastructure.Security;
using FitConnect.Infrastructure.Persistence;
using FitConnect.Infrastructure.Repositories;

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
builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();

builder.Services.AddScoped<IAdminRepository, AdminRepository>();
builder.Services.AddScoped<ITrainerRepository, TrainerRepository>();
builder.Services.AddScoped<IClientRepository, ClientRepository>();

builder.Services.AddScoped<AdminService>();
builder.Services.AddScoped<TrainerService>();
builder.Services.AddScoped<ClientService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.Run();
