using System.Security.Claims;
using FitConnect.Application.Common;
using FitConnect.Domain.Enums;

namespace FitConnect.Api.Authorization;

public class HttpCurrentUserAccessor : ICurrentUserAccessor
{
    private readonly IHttpContextAccessor httpContextAccessor;

    public HttpCurrentUserAccessor(IHttpContextAccessor httpContextAccessor)
    {
        this.httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => httpContextAccessor.HttpContext?.User;

    public Guid? UserId =>
        Guid.TryParse(User?.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    public UserRole? Role =>
        Enum.TryParse<UserRole>(User?.FindFirstValue(ClaimTypes.Role), ignoreCase: true, out var role) ? role : null;

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;
}