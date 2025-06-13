using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HR_ClientManagement_WebAPI.Models
{
    public class Project
    {
        [Key]
        public int ProjectId { get; set; }

        [Required(ErrorMessage = "Project name is required")]
        [StringLength(100, ErrorMessage = "Project name cannot exceed 100 characters")]
        public string ProjectName { get; set; }

        public bool IsMaintenanceProject { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Project value must be a positive number")]
        public decimal ProjectValue { get; set; }

        [Required]
        public int ClientId { get; set; }
        public string? Status { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        [JsonIgnore]
        public virtual Client? Client { get; set; }
        [JsonIgnore]
        public virtual IEnumerable<ProjectResourceAllocation>? ResourceAllocations { get; set; }
    }
}
