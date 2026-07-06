using System.Net;
using FitConnect.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace FitConnect.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate next;
    private readonly ILogger<ExceptionHandlingMiddleware> logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        this.next = next;
        this.logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (UserNotFoundException ex)
        {
            await WriteProblemAsync(context, HttpStatusCode.NotFound, ex.Message);
        }
        catch (EmailAlreadyRegisteredException ex)
        {
            await WriteProblemAsync(context, HttpStatusCode.Conflict, ex.Message);
        }
        catch (InvalidCredentialsException ex)
        {
            await WriteProblemAsync(context, HttpStatusCode.Unauthorized, ex.Message);
        }
        catch (CooperationNotFoundException ex)
        {
            await WriteProblemAsync(context, HttpStatusCode.NotFound, ex.Message);
        }
        catch (PricingTierNotFoundException ex)
        {
            await WriteProblemAsync(context, HttpStatusCode.NotFound, ex.Message);
        }
        catch (CooperationAlreadyActiveException ex)
        {
            await WriteProblemAsync(context, HttpStatusCode.Conflict, ex.Message);
        }
        catch (FreeTrialAlreadyUsedException ex)
        {
            await WriteProblemAsync(context, HttpStatusCode.Conflict, ex.Message);
        }
        catch (InvalidCooperationStatusTransitionException ex)
        {
            await WriteProblemAsync(context, HttpStatusCode.Conflict, ex.Message);
        }
        catch (TrainerNotApprovedException ex)
        {
            await WriteProblemAsync(context, HttpStatusCode.Conflict, ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception while processing {Path}", context.Request.Path);
            await WriteProblemAsync(context, HttpStatusCode.InternalServerError, "An unexpected error occurred.");
        }
    }

    private static async Task WriteProblemAsync(HttpContext context, HttpStatusCode statusCode, string detail)
    {
        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsJsonAsync(new ProblemDetails { Status = (int)statusCode, Title = statusCode.ToString(), Detail = detail });
    }
}