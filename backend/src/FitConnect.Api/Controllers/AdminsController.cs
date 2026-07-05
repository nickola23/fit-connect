using FitConnect.Api.Contracts.Admins;
using FitConnect.Application.Users;
using FitConnect.Domain.Enums;
using FitConnect.Domain.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitConnect.Api.Controllers;

[ApiController]
[Route("api/admins")]
[Authorize(Roles = nameof(UserRole.Admin))]
public class AdminsController : ControllerBase
{
    private readonly AdminService adminService;

    public AdminsController(AdminService adminService)
    {
        this.adminService = adminService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AdminResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var admins = await adminService.GetAllAsync(cancellationToken);
        return Ok(admins.Select(ToResponse));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdminResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var admin = await adminService.GetByIdAsync(id, cancellationToken);
        return admin is null ? NotFound() : Ok(ToResponse(admin));
    }

    [HttpPost]
    public async Task<ActionResult<AdminResponse>> Create(CreateAdminRequest request, CancellationToken cancellationToken)
    {
        var admin = await adminService.CreateAsync(request.Name, request.Email, request.Password, request.Language, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = admin.Id }, ToResponse(admin));
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateAdminRequest request, CancellationToken cancellationToken)
    {
        await adminService.UpdateAsync(id, request.Name, request.Language, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await adminService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    private static AdminResponse ToResponse(Admin admin) => new()
    {
        Id = admin.Id,
        Name = admin.Name,
        Email = admin.Email,
        Language = admin.Language,
        CreatedAt = admin.CreatedAt
    };
}