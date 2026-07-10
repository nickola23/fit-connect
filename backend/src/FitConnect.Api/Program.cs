using System.Text;
using System.Text.Json.Serialization;
using FitConnect.Api.Authorization;
using FitConnect.Api.Middleware;
using FitConnect.Application.Auth;
using FitConnect.Application.Common;
using FitConnect.Application.Cooperations;
using FitConnect.Application.Credentials;
using FitConnect.Application.Equipment;
using FitConnect.Application.Exercises;
using FitConnect.Application.Trainings;
using FitConnect.Application.Users;
using FitConnect.Infrastructure.Security;
using FitConnect.Infrastructure.Persistence;
using FitConnect.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var reactAppUrl = builder.Configuration["AllowedOrigins:ReactApp"];

builder.Services.AddControllers();

builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

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

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.AddSingleton<ITokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IAuthUserRepository, AuthUserRepository>();
builder.Services.AddScoped<AuthService>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserAccessor, HttpCurrentUserAccessor>();
builder.Services.AddSingleton<IAuthorizationHandler, SameUserOrAdminAuthorizationHandler>();

builder.Services.AddScoped<ICooperationRepository, CooperationRepository>();
builder.Services.AddScoped<IPricingTierRepository, PricingTierRepository>();
builder.Services.AddScoped<CooperationService>();

builder.Services.AddScoped<IAuthorizationHandler, CooperationParticipantOrAdminAuthorizationHandler>();
builder.Services.AddScoped<IAuthorizationHandler, CooperationTrainerParticipantAuthorizationHandler>();

builder.Services.AddScoped<PricingTierService>();

builder.Services.AddScoped<IExerciseRepository, ExerciseRepository>();
builder.Services.AddScoped<ExerciseService>();

builder.Services.AddScoped<IAuthorizationHandler, PricingTierOwnerOrAdminAuthorizationHandler>();
builder.Services.AddScoped<IAuthorizationHandler, ExerciseOwnerOrAdminAuthorizationHandler>();

builder.Services.AddScoped<IEquipmentRepository, EquipmentRepository>();
builder.Services.AddScoped<EquipmentService>();

builder.Services.AddScoped<IExerciseEquipmentRepository, ExerciseEquipmentRepository>();
builder.Services.AddScoped<ExerciseEquipmentService>();

builder.Services.AddScoped<IClientEquipmentRepository, ClientEquipmentRepository>();
builder.Services.AddScoped<ClientEquipmentService>();

builder.Services.AddScoped<ITrainingRepository, TrainingRepository>();
builder.Services.AddScoped<TrainingService>();

builder.Services.AddScoped<ITrainingExerciseRepository, TrainingExerciseRepository>();
builder.Services.AddScoped<TrainingExerciseService>();

builder.Services.AddScoped<ITrainingReviewRepository, TrainingReviewRepository>();
builder.Services.AddScoped<TrainingReviewService>();

builder.Services.AddScoped<IAuthorizationHandler, TrainingParticipantOrAdminAuthorizationHandler>();
builder.Services.AddScoped<IAuthorizationHandler, TrainingTrainerOrAdminAuthorizationHandler>();
builder.Services.AddScoped<IAuthorizationHandler, TrainingTrainerOnlyAuthorizationHandler>();
builder.Services.AddScoped<IAuthorizationHandler, TrainingExerciseClientOwnerAuthorizationHandler>();

builder.Services.AddScoped<ICredentialRepository, CredentialRepository>();
builder.Services.AddScoped<CredentialService>();

var jwtOptions = builder.Configuration.GetSection("Jwt").Get<JwtOptions>()!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("SameUserOrAdmin", policy => policy.Requirements.Add(new SameUserOrAdminRequirement()));
    options.AddPolicy("CooperationParticipantOrAdmin", policy => policy.Requirements.Add(new CooperationParticipantOrAdminRequirement()));
    options.AddPolicy("CooperationTrainerParticipant", policy => policy.Requirements.Add(new CooperationTrainerParticipantRequirement()));
    options.AddPolicy("PricingTierOwnerOrAdmin", policy => policy.Requirements.Add(new PricingTierOwnerOrAdminRequirement()));
    options.AddPolicy("ExerciseOwnerOrAdmin", policy => policy.Requirements.Add(new ExerciseOwnerOrAdminRequirement()));
    options.AddPolicy("TrainingParticipantOrAdmin", policy => policy.Requirements.Add(new TrainingParticipantOrAdminRequirement()));
    options.AddPolicy("TrainingTrainerOrAdmin", policy => policy.Requirements.Add(new TrainingTrainerOrAdminRequirement()));
    options.AddPolicy("TrainingTrainerOnly", policy => policy.Requirements.Add(new TrainingTrainerOnlyRequirement()));
    options.AddPolicy("TrainingExerciseClientOwner", policy => policy.Requirements.Add(new TrainingExerciseClientOwnerRequirement()));
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
