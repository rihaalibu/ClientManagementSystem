using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HR_ClientManagement_WebAPI.Models;

namespace HR_ClientManagement_WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProjectController : ControllerBase
    {
        private readonly HRAppDBContext _context;

        public ProjectController(HRAppDBContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectDTO>>> GetProjects()
        {
            return await _context.Projects
               .Include(p => p.Client)
               .Include(p => p.ResourceAllocations).Select(p => new ProjectDTO
               {
                   ClientId = p.ClientId,
                   ClientName = p.Client.ClientName,
                   ProjectId = p.ProjectId,
                   ProjectName = p.ProjectName,
                   IsMaintenanceProject = p.IsMaintenanceProject,
                   ProjectValue = p.ProjectValue,
                   Status = p.Status,
                   StartDate = p.StartDate,
                   EndDate = p.EndDate,
                   Resources = p.ResourceAllocations.Select(res => new ResourceDTO
                   {
                       EmployeeId = res.ResourceId,
                       EmployeeName = res.Resource.EmployeeName,
                       Technology = res.Resource.Technology

                   })

               })
               .ToListAsync();

            //return await 
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetProject(int id)
        {
            var project = await _context.Projects
                .Include(p => p.Client)
                .Include(p => p.ResourceAllocations)
                .FirstOrDefaultAsync(p => p.ProjectId == id);

            if (project == null)
                return NotFound();

            return project;
        }

        [HttpPost]
        public async Task<ActionResult<Project>> CreateProject(Project project)
        {
            project.StartDate = project.StartDate.ToUniversalTime();
            project.EndDate = project.EndDate.ToUniversalTime();
            project.Status = project.Status;
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProject), new { id = project.ProjectId }, project);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(int id, Project project)
        {
            if (id != project.ProjectId)
                return BadRequest();

            project.StartDate = project.StartDate.ToUniversalTime();
            project.EndDate = project.EndDate.ToUniversalTime();
            project.Status = project.Status;
            _context.Entry(project).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProjectExists(id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null)
                return NotFound();

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProjectExists(int id)
        {
            return _context.Projects.Any(e => e.ProjectId == id);
        }
    }
}
