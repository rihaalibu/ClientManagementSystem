using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HR_ClientManagement_WebAPI.Models
{
    public class Employee
    {
        [Key]
        public int EmployeeID { get; set; }

        [Required(ErrorMessage = "Employee name is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters")]
        public string EmployeeName { get; set; }

        [StringLength(50, ErrorMessage = "Technology name cannot exceed 50 characters")]
        public string Technology { get; set; }

        [Range(0, float.MaxValue, ErrorMessage = "Salary must be a positive value")]
        public float Salary { get; set; }
        public int? ProjectID { get; set; }
        
        [ForeignKey("ProjectID")]
        public Project? Project { get; set; }
    }
}
