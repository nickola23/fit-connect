using FitConnect.Domain.Enums;

namespace FitConnect.Application.Common;

public interface ICurrentUserAccessor
{
    Guid? UserId { get; }
    UserRole? Role { get; }
    bool IsAuthenticated { get; }
}