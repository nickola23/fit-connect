using FitConnect.Api.Contracts.Files;
using FitConnect.Application.Files;
using FitConnect.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace FitConnect.Api.Controllers;

[ApiController]
[Route("api/files")]
public class FilesController : ControllerBase
{
    private readonly FileUploadService fileUploadService;

    public FilesController(FileUploadService fileUploadService)
    {
        this.fileUploadService = fileUploadService;
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(200 * 1024 * 1024)]
    public async Task<ActionResult<FileUploadResponse>> Upload([FromQuery] string category, IFormFile? file, CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest("No file was provided.");
        }

        if (!Enum.TryParse<FileCategory>(category, ignoreCase: true, out var parsedCategory))
        {
            return BadRequest($"Unknown category '{category}'. Use 'Credentials' or 'ExerciseDemoVideos'.");
        }

        await using var stream = file.OpenReadStream();
        var url = await fileUploadService.UploadAsync(stream, file.FileName, file.Length, parsedCategory, cancellationToken);

        return Ok(new FileUploadResponse { Url = url });
    }
}