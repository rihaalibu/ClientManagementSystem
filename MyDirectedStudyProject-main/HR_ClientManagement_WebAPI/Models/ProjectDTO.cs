using System.Collections;

namespace HR_ClientManagement_WebAPI.Models
{

    public class ProjectDTO
    {
        public int ProjectId { get; set; }

        public string ProjectName { get; set; }
        public bool IsMaintenanceProject { get; set; }
        public decimal ProjectValue { get; set; }
        public string? Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public IEnumerable<ResourceDTO>? Resources { get; set; }
        public int ClientId { get; set; }
        public string? ClientName { get; set; }

    }

    public class ResourceDTO
    {
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string Technology { get; set; }
        //public DateTime StartDate { get; set; }

    }

    public class ClientDTO
    {
        public string ClientName { get; set; }
        public decimal Revenue { get; set; }
        public decimal Costs { get; set; }
        public decimal Profit { get; set; }  

        public IEnumerable<ProjectRevenueDTO> Projects { get; set; }


    }

public     class ProjectRevenueDTO
    {
        public string ProjectName { get; set; }
        public decimal Revenue { get; set; }
        public decimal ResourceCost { get; set; }

    }



}
