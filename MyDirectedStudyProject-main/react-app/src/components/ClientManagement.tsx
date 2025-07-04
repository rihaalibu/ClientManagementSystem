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
    FormControlLabel,
    Checkbox,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Snackbar
} from '@mui/material';

import axios from 'axios';

import { createAuthenticatedAxios } from '../utils/api';

interface Client {
    clientId: number;
    clientName: string;
    totalAmountPaid: number;
    isActive: boolean;
    projects: Project[];
}

interface Project {
    projectId: number;
    projectName: string;
    isMaintenanceProject: boolean;
    projectValue: number;
    clientId: number;
}

interface TechnicalResource {
    employeeId: number;
    employeeName: string;
    salary: number;
    technology: string;
    isActive: boolean;
}

interface ProjectAllocation {
    projectId: number;
    resourceId: number;
    startDate: string;
    endDate: string;
}


interface ResourceAllocationView {
    projectId: number;
    employeeId: number;
    employeeName: string;
    technology: string;
    salary: number;
    isActive: boolean;
    startDate: string;
    endDate: string;
}

const ClientManagement = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newClient, setNewClient] = useState<Partial<Client>>({});
    const [projectDialog, setProjectDialog] = useState(false);
    const [newProject, setNewProject] = useState<Partial<Project>>({});
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [clientProjects, setClientProjects] = useState<Project[]>([]);
    const [viewProjectsDialog, setViewProjectsDialog] = useState(false);
    const [selectedClientName, setSelectedClientName] = useState<string>('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [technicalResources, setTechnicalResources] = useState<TechnicalResource[]>([]);
    const [allocationDialog, setAllocationDialog] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [newAllocation, setNewAllocation] = useState<Partial<ProjectAllocation>>({});
    const [editClient, setEditClient] = useState<Partial<Client>>({});
    const [editProject, setEditProject] = useState<Partial<Project>>({});
    const [editAllocation, setEditAllocation] = useState<Partial<ProjectAllocation>>({});
   
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [resourceAllocationsDialog, setResourceAllocationsDialog] = useState(false);
    const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocationView[]>([]);
    const [resourceAllAllocations, setResourceAllAllocations] = useState<ProjectAllocation[]>([]); 
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState<'error' | 'warning' | 'info' | 'success'>('error');

    // const httpClient = axios.create({
    //     baseURL: 'http://localhost:8080',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Access-Control-Allow-Origin': '*',
    //         'Authorization': `Bearer ${localStorage.getItem('token')}`
    //     }
    // });
    const httpClient = createAuthenticatedAxios();
    useEffect(() => {
        fetchAllResourceAllocations();
        fetchClients();
        fetchProjects();
        fetchTechnicalResources();
       
    }, []);

    const fetchClients = async () => {
        try {
            const response = await httpClient.get('/api/client');
            setClients(response.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await httpClient.get('/api/project');
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchTechnicalResources = async () => {
        try {
            const response = await httpClient.get('/api/technicalresource');
            setTechnicalResources(response.data);
        } catch (error) {
            console.error('Error fetching resources:', error);
        }
    };

    const fetchAllResourceAllocations = async () => {
        try {
        const allAllocationsResponse = await httpClient.get('/api/resourceallocation');
        const allAllocations = allAllocationsResponse.data;
        setResourceAllAllocations(allAllocations);
    }catch (error) {
        console.error('Error fetching resource allocations:', error);
    }
}

    const handleAddClient = async () => {
        try {
            await httpClient.post('/api/client', newClient);
            fetchClients();
            setOpenDialog(false);
            setNewClient({});
        } catch (error) {
            console.error('Error adding client:', error);
        }
    };

    const handleEditClient = async () => {
        try {
            
            await httpClient.put(`/api/client/updateclient/${editClient.clientId}`, editClient);
            fetchClients();
            setOpenEditDialog(false);
            setEditClient({});
        } catch (error) {
            console.error('Error editing client:', error);
        }
    };
    //check for delete
    const handleDeleteClient = async (clientId: number) => {
        try {
            await httpClient.delete(`/api/client/DeleteClient/${clientId}`); // modified just now
            fetchClients();
        } catch (error) {
            console.error('Error deleting client:', error);
        }
    };

    const handleAddProject = async () => {
        try {
            await httpClient.post('/api/project', {
                ...newProject,
                clientId: selectedClientId
            });
            setProjectDialog(false);
            setNewProject({});
            setSelectedClientId(null);
            fetchProjects();

            //refreshing the client projects, just now
            if (viewProjectsDialog && selectedClientId) {
                fetchClientProjects(selectedClientId, clients.find(c => c.clientId === selectedClientId)?.clientName || '');
            }
        } catch (error) {
            console.error('Error adding project:', error);
        }
    };
    //fetching projects based on client id
    const fetchClientProjects = async (clientId: number, clientName: string) => {
        try {
            const clientSpecificProjects = projects.filter(project => project.clientId === clientId);
            setClientProjects(clientSpecificProjects);
            setSelectedClientName(clientName);
            setSelectedClientId(clientId);
            setViewProjectsDialog(true);
        }
        catch (error) {
            console.error('Error fetching clients projects:', error);
        }
    }

    const handleAddAllocation = async () => {
        try {
            const selectedProject = projects.find(project => project.projectId === selectedProjectId);
            if (!selectedProject) {
                setAlertMessage("Project not found");
                setAlertSeverity("error");
                setAlertOpen(true);
                return;
            }

            const selectedResource = technicalResources.find(r => r.employeeId === newAllocation.resourceId);
            
            if (!selectedResource) {
                setAlertMessage("Resource not found");
                setAlertSeverity("error");
                setAlertOpen(true);
                return;
            }
           
            const existingAllocation = resourceAllAllocations.find(allocation => 
                allocation.resourceId === newAllocation.resourceId &&
                allocation.projectId !== selectedProjectId
            );

            if (existingAllocation) {
               
                const existingProject = projects.find(p => p.projectId === existingAllocation.projectId);
                const projectName = existingProject ? existingProject.projectName : 'another project';
                setAlertMessage(`This resource is already allocated to ${projectName}. One resource can only be assigned to one project.`);
                setAlertSeverity("error");
                setAlertOpen(true);
                return;
            }

            const existingAllocations = await httpClient.get(`/api/resourceallocation/project/${selectedProjectId}`);
            const existingCost = existingAllocations.data.reduce((sum, allocation) => 
                sum + (technicalResources.find(r => r.employeeId === allocation.employeeId)?.salary || 0), 0);
            
            const totalCost = existingCost + selectedResource.salary;
            if (totalCost > selectedProject.projectValue) {
                setAlertMessage(`Cannot allocate this resource. Total resource cost ($${totalCost}) would exceed project value ($${selectedProject.projectValue}).`);
                setAlertSeverity("warning");
                setAlertOpen(true);
                return;
            }

            await httpClient.post('/api/resourceallocation/allocate', {
                ...newAllocation,
                projectId: selectedProjectId
            });
            setAlertMessage("Resource allocated successfully!");
            setAlertSeverity("success");
            setAlertOpen(true);
            
            setAllocationDialog(false);
            setNewAllocation({});
            setSelectedProjectId(null);
            //fetchProjects(); commented just now
            if (resourceAllocationsDialog && selectedProjectId) {
                fetchResourceAllocations(selectedProjectId);
            }
        } catch (error) {
            console.error('Error adding allocation:', error);
            setAlertMessage("Failed to allocate resource. Please try again.");
            setAlertSeverity("error");
            setAlertOpen(true);
        }
    };

    const handleAlertClose = () => {
        setAlertOpen(false);
    };

    const fetchResourceAllocations = async (projectId: number) => {
        try {
            const response = await httpClient.get(`/api/resourceallocation/project/${projectId}`);
            setResourceAllocations(response.data);
            setResourceAllocationsDialog(true);
            //return response.data;
        } catch (error) {
            console.error('Error fetching resource allocations:', error);
            //return []; commented just now
        }
    };

    return (
        <Box>
            <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">Client Management</Typography>
                <Button variant="contained" onClick={() => setOpenDialog(true)}>
                    Add New Client
                </Button>
            </Paper>

            <Paper sx={{ p: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Total Amount Paid</TableCell>
                            <TableCell>Amount Owed</TableCell>
                            <TableCell>isActive</TableCell>
                            
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {clients.map((client) => (
                            <TableRow key={client.clientId}>
                                <TableCell>{client.clientId}</TableCell>
                                <TableCell>{client.clientName}</TableCell>
                                <TableCell>{client.totalAmountPaid}</TableCell>
                                {/*<TableCell>{projects.filter((p) => p.clientId == client.clientId).reduce((sum_value, curr_value) => {
                                    return sum_value + curr_value.projectValue;
                                }, 0) - client.totalAmountPaid}
                                </TableCell>*/}
                                <TableCell>
    {(() => {
        const clientProjects = projects.filter((p) => p.clientId === client.clientId);
        if (clientProjects.length === 0) {
            return 0; // Return 0 when there are no projects
        } else {
            const totalProjectValue = clientProjects.reduce((sum_value, curr_value) => {
                return sum_value + curr_value.projectValue;
            }, 0);
            return Math.max(0, totalProjectValue - client.totalAmountPaid);
        }
    })()}
</TableCell>    
                                <TableCell>
                                    <FormControlLabel control={<Checkbox checked={client.isActive || false} onChange={(e) => setEditClient({ ...editClient, isActive: e.target.checked })} />} label="isActive" />

                                    {/* <checkbox
                                        checked={client.isactive}

                                    /> */}
                                </TableCell>


                                <TableCell>
                                    <Button
                                        color="primary"
                                        onClick={() => {
                                            setEditClient(client);
                                            setOpenEditDialog(true);
                                        }}
                                    >Edit</Button>
                                    <Button color="error"
                                        onClick={() => {
                                            handleDeleteClient(client.clientId);
                                        }}
                                    >Delete</Button>
                                    <Button
                                        color="success"
                                        onClick={() => {
                                            setSelectedClientId(client.clientId);
                                            setProjectDialog(true);
                                        }}
                                    >
                                        Add Project
                                    </Button>
                                    <Button
                                        color="info"
                                        onClick={() => {
                                            fetchClientProjects(client.clientId, client.clientName);
                                        }}
                                    >
                                        View Projects
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            {/* Edit Client Dialog */}

            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                <DialogTitle>Edit Client </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Client Name"
                        margin="normal"
                        value={editClient.clientName}
                        onChange={(e) => setEditClient({ ...editClient, clientName: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Total Amount Paid"
                        margin="normal"
                        value={editClient.totalAmountPaid}
                        onChange={(e) => setEditClient({ ...editClient, totalAmountPaid: Number(e.target.value) })}
                    />
                    <FormControlLabel
                        label="IsActive"
                        control={
                            <Checkbox
                                checked={editClient.isActive || false}
                                onChange={(e) => setEditClient({ ...editClient, isActive: e.target.checked })} />} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button onClick={handleEditClient} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Add Client Dialog */}

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Add New Client </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Client Name"
                        margin="normal"
                        onChange={(e) => setNewClient({ ...newClient, clientName: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Total Amount Paid"
                        margin="normal"
                        onChange={(e) => setNewClient({ ...newClient, totalAmountPaid: Number(e.target.value) })}
                    />
                    <FormControlLabel label="IsActive" control={<Checkbox checked={newClient.isActive || false} onChange={(e) => setNewClient({ ...newClient, isActive: e.target.checked })} />} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddClient} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>

            {/* Add Project Dialog */}
            <Dialog open={projectDialog} onClose={() => setProjectDialog(false)}>
                <DialogTitle>Add New Project</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Project Name"
                        margin="normal"
                        required
                        onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Project Value"
                        type="number"
                        margin="normal"
                        onChange={(e) => setNewProject({ ...newProject, projectValue: Number(e.target.value) })}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={newProject.isMaintenanceProject || false}
                                onChange={(e) => setNewProject({ ...newProject, isMaintenanceProject: e.target.checked })}
                            />
                        }
                        label="Maintenance Project"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setProjectDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddProject} variant="contained">Add Project</Button>
                </DialogActions>
            </Dialog>


            {/* View Projects Dialog */}

            <Dialog open={viewProjectsDialog} onClose={() => setViewProjectsDialog(false)}
                maxWidth="md"
                fullWidth>
                <DialogTitle>{`Projects for ${selectedClientName}`}</DialogTitle>
                <DialogContent>
                    {clientProjects.length > 0 ? (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Project ID</TableCell>
                                    <TableCell>Project Name</TableCell>
                                    <TableCell>Maintenance Project</TableCell>
                                    <TableCell>Project Value</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {clientProjects.map((project) => (
                                    <TableRow key={project.projectId}>
                                        <TableCell>{project.projectId}</TableCell>
                                        <TableCell>{project.projectName}</TableCell>
                                        <TableCell>{project.isMaintenanceProject ? 'Yes' : 'No'}</TableCell>
                                        <TableCell>${project.projectValue}</TableCell>
                                        <TableCell>
                                            <Button
                                                color="primary"
                                                onClick={() => {
                                                    setSelectedProjectId(project.projectId);
                                                    setAllocationDialog(true);
                                                }}
                                            >
                                                Allocate Resource
                                            </Button>
                                            <Button
                                                color="info"
                                                onClick={() => {
                                                    setSelectedProjectId(project.projectId);
                                                    fetchResourceAllocations(project.projectId);
                                                }}
                                            >
                                                View Resources
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
                            No projects found for this client.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewProjectsDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Allocate Resource Dialog */}

            <Dialog open={allocationDialog} onClose={() => setAllocationDialog(false)}>
                <DialogTitle>Allocate Resource to Project</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Technical Resource</InputLabel>
                        <Select
                            value={newAllocation.resourceId || ''}
                            onChange={(e) => setNewAllocation({ ...newAllocation, resourceId: Number(e.target.value) })}
                        >
                            {technicalResources.map((resource) => (
                                <MenuItem key={resource.employeeId} value={resource.employeeId}>
                                    {resource.employeeName} - {resource.technology}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Start Date"
                        type="date"
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        onChange={(e) => setNewAllocation({ ...newAllocation, startDate: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="End Date"
                        type="date"
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        onChange={(e) => setNewAllocation({ ...newAllocation, endDate: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAllocationDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddAllocation} variant="contained">Allocate</Button>
                </DialogActions>
            </Dialog>

            {/* View Resource Allocations Dialog */}
            <Dialog
                open={resourceAllocationsDialog}
                onClose={() => setResourceAllocationsDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Project Resource Allocations</DialogTitle>
                <DialogContent>
                    {resourceAllocations.length > 0 ? (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Project ID</TableCell>
                                    <TableCell>Employee ID</TableCell>
                                    <TableCell>Employee Name</TableCell>
                                    <TableCell>Technology</TableCell>
                                    <TableCell>Salary</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Start Date</TableCell>
                                    <TableCell>End Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {resourceAllocations.map((allocation) => (
                                    <TableRow key={`${allocation.projectId}-${allocation.employeeId}`}>
                                        <TableCell>{allocation.projectId}</TableCell>
                                        <TableCell>{allocation.employeeId}</TableCell>
                                        <TableCell>{allocation.employeeName}</TableCell>
                                        <TableCell>{allocation.technology}</TableCell>
                                        <TableCell>${allocation.salary}</TableCell>
                                        <TableCell>{allocation.isActive ? 'Active' : 'Inactive'}</TableCell>
                                        <TableCell>{new Date(allocation.startDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(allocation.endDate).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
                            No resource allocations found for this project.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResourceAllocationsDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>
            <Snackbar 
                open={alertOpen} 
                autoHideDuration={9000} 
                onClose={handleAlertClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleAlertClose} 
                    severity={alertSeverity}
                    sx={{ width: '100%' }}
                >
                    {alertMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ClientManagement;

