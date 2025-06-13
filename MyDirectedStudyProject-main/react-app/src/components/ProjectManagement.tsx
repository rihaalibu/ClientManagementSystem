import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Grid,
    CircularProgress,
    Alert,
    SelectChangeEvent
} from '@mui/material';
import { createAuthenticatedAxios } from '../utils/api';

interface Client {
    clientId: number;
    clientName: string;
}
interface Resource {
    employeeId: number;
    employeeName: string;
    technology: string;
    salary: number;
};

interface Project {
    projectId: number;
    projectName: string;
    clientId: number;
    clientName: string;
    startDate: string;
    endDate: string;
    status: string;
    isMaintenanceProject: boolean;
    projectValue: number;
    technology?: string[];
    assignedEmployees?: number;
    resources?: Resource[];
}

const httpClient = createAuthenticatedAxios();

const ProjectManagement = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Partial<Project>>({});
    const [editProject, setEditProject] = useState<Partial<Project>>({});
    const [employees, setEmployees] = useState<Resource[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects();
        fetchClients();
        fetchEmployees();
    }, []);
    const fetchEmployees = async () => {
        try {
            const response = await httpClient.get('/api/technicalresource');
            const formattedEmployee = response.data.map((employee: any) => ({
                employeeId: employee.employeeId,
                employeeName: employee.employeeName,
                technology: employee.technology,
                salary: employee.salary,
            }));
            setEmployees(formattedEmployee);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await httpClient.get('/api/project');
            //Transforimg the data to match the Project interface
            const formattedProjects = response.data.map((project: any) => ({
                projectId: project.projectId,
                projectName: project.projectName,
                clientId: project.clientId,
                clientName: project.clientName || 'Unknown Client',
                startDate: project.startDate || new Date().toISOString(),
                endDate: project.endDate || new Date().toISOString(),
                status: project.status,
                isMaintenanceProject: project.isMaintenanceProject || false,
                projectValue: project.projectValue || 0,
                technology: project.technology || [],
                assignedEmployees: project.resources?.length || 0,
                resources: project.resources
            }));

            setProjects(formattedProjects);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setError('Failed to load projects. Please try again later.');
            setLoading(false);
        }
    };
    const fetchClients = async () => {
        try {
            const response = await httpClient.get('/api/client');
            setClients(response.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };
    const handleClientChange = (event: SelectChangeEvent<number>) => {
        setSelectedProject({
            ...selectedProject,
            clientId: event.target.value as number
        });
    };
    const handleSave = () => {
        if (isEditing) {
            handleEditProject();
        } else {
            handleAddProject();
        }
    };

    const handleAddProject = async () => {
        try {
            await httpClient.post('/api/project', selectedProject);
            fetchProjects();
            setOpenDialog(false);
            setSelectedProject({});
        } catch (error) {
            console.error('Error adding project:', error);
        }
    };

    const handleEditProject = async () => {
        try {
            await httpClient.put(`/api/project/${editProject.projectId}`, editProject);
            fetchProjects();
            setIsEditing(false);
            setEditProject({});
            setOpenDialog(false);
        } catch (error) {
            console.error('Error updating project:', error);
        }
    };

    const handleDeleteProject = async (projectId: number) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await httpClient.delete(`/api/project/${projectId}`);
                fetchProjects();
            } catch (error) {
                console.error('Error deleting project:', error);
            }
        }
    };

    const openEditDialog = (project: Project) => {
        setEditProject(project);
        setIsEditing(true);
        setOpenDialog(true);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">Project Management</Typography>
                <Button
                    variant="contained"
                    onClick={() => {
                        setIsEditing(false);
                        setSelectedProject({});
                        setOpenDialog(true);
                    }}
                >
                    Create New Project
                </Button>
            </Paper>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Total Projects</Typography>
                        <Typography variant="h4">{projects.length}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Active Projects</Typography>
                        <Typography variant="h4">
                            {projects.filter(p => p.status == "Active").length}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Total Employees</Typography>
                        <Typography variant="h4">
                            {/*projects.reduce((acc, curr) => acc + (curr.assignedEmployees || 0), 0)*/}
                            {employees.length}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Paper sx={{ p: 2 }}>
                {projects.length > 0 ? (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Project Name</TableCell>
                                <TableCell>Client</TableCell>
                                <TableCell>Start Date</TableCell>
                                <TableCell>End Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Maintenance</TableCell>
                                <TableCell>Value</TableCell>
                                <TableCell>Resources</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {projects.map((project) => (
                                <TableRow key={project.projectId}>
                                    <TableCell>{project.projectName}</TableCell>
                                    <TableCell>{project.clientName}</TableCell>
                                    <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={project.status? project.status: 'On Hold' }
                                            color={project.status === 'Active' ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {project.isMaintenanceProject ? 'Yes' : 'No'}
                                    </TableCell>
                                    <TableCell>${project.projectValue.toLocaleString()}</TableCell>
                                    <TableCell>{project.resources?.length || 0}</TableCell>
                                    <TableCell>
                                        <Button
                                            color="primary"
                                            size="small"
                                            onClick={() => openEditDialog(project)}
                                            sx={{ mr: 1 }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            color="error"
                                            size="small"
                                            onClick={() => handleDeleteProject(project.projectId)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography variant="body1" color="textSecondary">
                            No projects found. Create your first project by clicking the button above.
                        </Typography>
                    </Box>
                )}
            </Paper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{isEditing ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Project Name"
                                value={isEditing ? editProject.projectName || '' : selectedProject.projectName || ''}
                                onChange={(e) => {
                                    if (isEditing) {
                                        setEditProject({ ...editProject, projectName: e.target.value });
                                    } else {
                                        setSelectedProject({ ...selectedProject, projectName: e.target.value });
                                    }
                                }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Client</InputLabel>
                                <Select
                                    value={isEditing ? editProject.clientId || '' : selectedProject.clientId || ''}
                                    onChange={(e) => {
                                        if (isEditing) {
                                            setEditProject({ ...editProject, clientId: e.target.value as number });
                                        } else {
                                            setSelectedProject({ ...selectedProject, clientId: e.target.value as number });
                                        }
                                    }}
                                    label="Client"
                                    required
                                >
                                    {clients.map((client) => (
                                        <MenuItem key={client.clientId} value={client.clientId}>
                                            {client.clientName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Project Value"
                                type="number"
                                value={isEditing ? editProject.projectValue || '' : selectedProject.projectValue || ''}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    if (isEditing) {
                                        setEditProject({ ...editProject, projectValue: value });
                                    } else {
                                        setSelectedProject({ ...selectedProject, projectValue: value });
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Maintenance Project</InputLabel>
                                <Select
                                    value={isEditing
                                        ? (editProject.isMaintenanceProject ? 'yes' : 'no')
                                        : (selectedProject.isMaintenanceProject ? 'yes' : 'no')}
                                    onChange={(e) => {
                                        const isMaintenanceProject = e.target.value === 'yes';
                                        if (isEditing) {
                                            setEditProject({ ...editProject, isMaintenanceProject });
                                        } else {
                                            setSelectedProject({ ...selectedProject, isMaintenanceProject });
                                        }
                                    }}
                                    label="Maintenance Project"
                                >
                                    <MenuItem value="yes">Yes</MenuItem>
                                    <MenuItem value="no">No</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Start Date"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={isEditing
                                    ? (editProject.startDate ? new Date(editProject.startDate).toISOString().split('T')[0] : '')
                                    : (selectedProject.startDate ? new Date(selectedProject.startDate).toISOString().split('T')[0] : '')}
                                onChange={(e) => {
                                    if (isEditing) {
                                        setEditProject({ ...editProject, startDate: e.target.value });
                                    } else {
                                        setSelectedProject({ ...selectedProject, startDate: e.target.value });
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="End Date"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={isEditing
                                    ? (editProject.endDate ? new Date(editProject.endDate).toISOString().split('T')[0] : '')
                                    : (selectedProject.endDate ? new Date(selectedProject.endDate).toISOString().split('T')[0] : '')}
                                onChange={(e) => {
                                    if (isEditing) {
                                        setEditProject({ ...editProject, endDate: e.target.value });
                                    } else {
                                        setSelectedProject({ ...selectedProject, endDate: e.target.value });
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={isEditing ? editProject.status ? editProject.status : 'On Hold' : 'On Hold'}
                                    onChange={(e) => {
                                        if (isEditing) {
                                            setEditProject({ ...editProject, status: e.target.value as string });
                                        } else {
                                            setSelectedProject({ ...selectedProject, status: e.target.value as string });
                                        }
                                    }}
                                    label="Status"
                                >
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Inactive">Inactive</MenuItem>
                                    <MenuItem value="Completed">Completed</MenuItem>
                                    <MenuItem value="On Hold">On Hold</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isEditing
                            ? (!editProject.projectName || !editProject.clientId)
                            : (!selectedProject.projectName || !selectedProject.clientId)
                        }
                    >
                        {isEditing ? 'Update Project' : 'Create Project'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
};

export default ProjectManagement;
