import React, { useState, useEffect } from "react";
import {
    AppBar,
    Box,
    Container,
    Drawer,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
    Avatar,
    Tooltip,
    Badge,
    Menu,
    MenuItem,
    CircularProgress,
    Popover
} from "@mui/material";
import {
    Assessment as ReportIcon,
    Assignment as ProjectIcon,
    //Devices as TechnologyIcon,
    Group as ResourceIcon,
    Menu as MenuIcon,
    People as ClientIcon,
    Dashboard as DashboardIcon,
    Notifications as NotificationIcon,
    ExitToApp as LogoutIcon,
    //Settings as SettingsIcon,
    Person as PersonIcon
} from "@mui/icons-material";
import ResourceManagement from "./ResourceManagement";
//import TechnologyReport from "./TechnologyReport";
import RevenueDetails from "./RevenueDetails";
import ClientManagement from "./ClientManagement";
import ProjectManagement from "./ProjectManagement";
import { createAuthenticatedAxios } from "../utils/api";
import { useNavigate } from "react-router-dom";

const httpClient = createAuthenticatedAxios();

// Define interfaces for our data
interface DashboardSummary {
    totalClients: number;
    activeProjects: number;
    totalEmployees: number;
    totalRevenue: number;
    loading: boolean;
}

interface Notification {
    id: number;
    message: string;
    date: string;
    read: boolean;
    type: 'info' | 'warning' | 'error' | 'success';
}

const Dashboard = () => {
    const [activeSection, setActiveSection] = useState("dashboard");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const [username, setUsername] = useState("");

    // Dashboard data state
    const [dashboardData, setDashboardData] = useState<DashboardSummary>({
        totalClients: 0,
        activeProjects: 0,
        totalEmployees: 0,
        totalRevenue: 0,
        loading: true
    });

    // User menu state
    const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
    const userMenuOpen = Boolean(userMenuAnchor);

    // Notifications state
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
    const notificationOpen = Boolean(notificationAnchor);

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Try to get username from token or localStorage
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        } else {
            // Default username if not found , lets remove it later..
            //setUsername("Admin user");
        }

        // Fetch dashboard summary data
        fetchDashboardSummary();

        // Generate notifications based on system events
        generateNotifications();
    }, [navigate]);

    const fetchDashboardSummary = async () => {
        try {
            // Fetching clients
            const clientsResponse = await httpClient.get('/api/client');
            const clients = clientsResponse.data;
            console.log("Below are the clients");
            console.log(clients);
            const activeClients = clients.filter((c: any) => c.isActive).length;
            // Fetching projects
            const projectsResponse = await httpClient.get('/api/project');
            const projects = projectsResponse.data;
            // Fetching employees
            const employeesResponse = await httpClient.get('/api/technicalresource');
            const employees = employeesResponse.data;
            // Calculating total revenue from client payments
            const totalRevenue = projects.reduce((sum: number, project: any) =>
                sum + (project.projectValue || 0), 0);
            setDashboardData({
                totalClients: clients.length,
                activeProjects: projects.length,
                totalEmployees: employees.length,
                totalRevenue: totalRevenue,
                loading: false
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setDashboardData(prev => ({ ...prev, loading: false }));
        }
    };

    const generateNotifications = async () => {
        try {
            // Get recent data to generate notifications
            const clientsResponse = await httpClient.get('/api/client');
            const clients = clientsResponse.data;

            const projectsResponse = await httpClient.get('/api/project');
            const projects = projectsResponse.data;

            const employeesResponse = await httpClient.get('/api/technicalresource');
            const employees = employeesResponse.data;

            // Generate notifications based on data
            const systemNotifications: Notification[] = [];

            // Add notification for recently added clients (assuming the last 2 are recent)
            if (clients.length > 0) {
                const recentClients = clients.slice(-2);
                recentClients.forEach((client: any, index: number) => {
                    systemNotifications.push({
                        id: systemNotifications.length + 1,
                        message: `New client "${client.clientName}" was added`,
                        date: new Date(Date.now() - (index + 1) * 3600000).toISOString(),
                        read: false,
                        type: 'info'
                    });
                });
            }

            // Add notification for projects with low resource allocation
            const projectsWithEmployees = projects.filter((p: any) =>
                p.resourceAllocations && p.resourceAllocations.length < 2);

            projectsWithEmployees.slice(0, 2).forEach((project: any, index: number) => {
                systemNotifications.push({
                    id: systemNotifications.length + 1,
                    message: `Project "${project.projectName}" needs more employees`,
                    date: new Date(Date.now() - (index + 1) * 7200000).toISOString(),
                    read: false,
                    type: 'warning'
                });
            });

            // Add a revenue report notification
            systemNotifications.push({
                id: systemNotifications.length + 1,
                message: 'Monthly revenue report is ready for review',
                date: new Date(Date.now() - 172800000).toISOString(),
                read: true,
                type: 'success'
            });

            setNotifications(systemNotifications);
        } catch (error) {
            console.error('Error generating notifications:', error);
            // Fallback to sample notifications if API calls fail
            const fallbackNotifications: Notification[] = [
                {
                    id: 1,
                    message: 'Welcome to HR Management System',
                    date: new Date().toISOString(),
                    read: false,
                    type: 'info'
                },
                {
                    id: 2,
                    message: 'System update scheduled for next week',
                    date: new Date(Date.now() - 86400000).toISOString(),
                    read: false,
                    type: 'warning'
                }
            ];
            setNotifications(fallbackNotifications);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('username');
        navigate('/login');
    };

    const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setUserMenuAnchor(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchor(null);
    };

    const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
        setNotificationAnchor(event.currentTarget);
    };

    const handleNotificationClose = () => {
        setNotificationAnchor(null);
    };

    const handleMarkAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        handleNotificationClose();
    };

    const menuItems = [
        {
            id: "dashboard",
            text: "Dashboard Overview",
            icon: <DashboardIcon />,
        },
        {
            id: "employees",
            text: "Employee Management",
            icon: <ResourceIcon />,
        },
        {
            id: "client",
            text: "Client Management",
            icon: <ClientIcon />
        },
        {
            id: "project",
            text: "Project Management",
            icon: <ProjectIcon />
        },
        /*{
            id: "technology",
            text: "Technology Distribution",
            icon: <ProjectIcon />,
        },*/
        {
            id: "revenue",
            text: "Revenue Analysis",
            icon: <ReportIcon />
        },
    ];

    const drawerWidth = 240;
    const unreadNotifications = notifications.filter(n => !n.read).length;

    return (
        <Box sx={{ display: "flex" }}>
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    backgroundColor: '#fff',
                    color: '#333333'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={() => setDrawerOpen(!drawerOpen)}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        Higher Management Client Management System
                    </Typography>

                    {/* Notifications */}
                    <Tooltip title="Notifications">
                        <IconButton color="inherit" onClick={handleNotificationOpen}>
                            <Badge badgeContent={unreadNotifications} color="error">
                                <NotificationIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    {/* User menu */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            ml: 2,
                            cursor: 'pointer'
                        }}
                        onClick={handleUserMenuOpen}
                    >
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            {username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                            {username}
                        </Typography>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Notifications Popover */}
            <Popover
                open={notificationOpen}
                anchorEl={notificationAnchor}
                onClose={handleNotificationClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: { width: 320, maxHeight: 400, overflow: 'auto' }
                }}
            >
                <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Notifications</Typography>
                        <Typography
                            variant="body2"
                            color="primary"
                            sx={{ cursor: 'pointer' }}
                            onClick={handleMarkAllRead}
                        >
                            Mark all as read
                        </Typography>
                    </Box>
                </Box>
                <List sx={{ p: 0 }}>
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <ListItem
                                key={notification.id}
                                disablePadding
                                sx={{
                                    borderBottom: '1px solid #f0f0f0',
                                    backgroundColor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.08)'
                                }}
                            >
                                <ListItemButton>
                                    <Box sx={{ width: '100%' }}>
                                        <Typography variant="body2" sx={{ fontWeight: notification.read ? 'regular' : 'medium' }}>
                                            {notification.message}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(notification.date).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </ListItemButton>
                            </ListItem>
                        ))
                    ) : (
                        <ListItem>
                            <ListItemText primary="No notifications" />
                        </ListItem>
                    )}
                </List>
            </Popover>

            {/* User Menu */}
            <Menu
                anchorEl={userMenuAnchor}
                open={userMenuOpen}
                onClose={handleUserMenuClose}
                MenuListProps={{
                    'aria-labelledby': 'user-menu-button',
                }}
            >
                {/*<MenuItem onClick={handleUserMenuClose}>
                    <ListItemIcon>
                        <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Profile</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleUserMenuClose}>
                    <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Settings</ListItemText>
                </MenuItem>*/}
                <Divider />
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText sx={{ color: 'error.main' }}>Logout</ListItemText>
                </MenuItem>
            </Menu>

            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={isMobile ? drawerOpen : true}
                onClose={() => setDrawerOpen(false)}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        backgroundColor: '#f8f9fa',
                        borderRight: '1px solid #e0e0e0'
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto', mt: 2 }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem
                                key={item.id}
                                disablePadding
                                sx={{
                                    borderRadius: '0 20px 20px 0',
                                    mx: 1,
                                    mb: 0.5,
                                }}
                            >
                                <ListItemButton
                                    selected={activeSection === item.id}
                                    onClick={() => {
                                        setActiveSection(item.id);
                                        if (isMobile) setDrawerOpen(false);
                                    }}
                                    sx={{
                                        borderRadius: '0 20px 20px 0',
                                        '&.Mui-selected': {
                                            backgroundColor: 'primary.light',
                                            '&:hover': {
                                                backgroundColor: 'primary.light',
                                            }
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{
                                        color: activeSection === item.id ? 'primary.main' : 'text.secondary',
                                        minWidth: 40
                                    }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontWeight: activeSection === item.id ? 'medium' : 'regular',
                                            color: activeSection === item.id ? 'primary.main' : 'text.primary'
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>

            <Box component="main" sx={{
                flexGrow: 1,
                p: 3,
                mt: 8,
                backgroundColor: '#f5f7fa',
                minHeight: '100vh'
            }}>
                <Container maxWidth="xl">
                    {activeSection === "dashboard" && (
                        <Box>
                            <Typography color="text.primary"  variant="h4" sx={{ mb: 4, fontWeight: 'medium' }}>
                                Dashboard Overview
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6} lg={3}>
                                    <Box sx={{
                                        p: 3,
                                        bgcolor: 'white',
                                        borderRadius: 2,
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                        height: '100%',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                        }
                                    }}onClick={() => setActiveSection("client")}>

                                        <Typography variant="h6" color="primary">
                                            Total Clients
                                        </Typography>
                                        {dashboardData.loading ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                                <CircularProgress size={30} />
                                            </Box>
                                        ) : (
                                            <Typography color="text.primary" variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
                                                {dashboardData.totalClients}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6} lg={3}>
                                    <Box sx={{
                                        p: 3,
                                        bgcolor: 'white',
                                        borderRadius: 2,
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                        height: '100%',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                        }
                                    }}onClick={() => setActiveSection("project")}>

                                        <Typography variant="h6" color="primary">
                                            Active Projects
                                        </Typography>
                                        {dashboardData.loading ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                                <CircularProgress size={30} />
                                            </Box>
                                        ) : (
                                            <Typography color="text.primary" variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
                                                {dashboardData.activeProjects}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6} lg={3}>
                                    <Box sx={{
                                        p: 3,
                                        bgcolor: 'white',
                                        borderRadius: 2,
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                        height: '100%',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                        }
                                    }}onClick={() => setActiveSection("employees")}>
                                        <Typography variant="h6" color="primary">
                                            Total Employees
                                        </Typography>
                                        {dashboardData.loading ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                                <CircularProgress size={30} />
                                            </Box>
                                        ) : (
                                            <Typography color="text.primary" variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
                                                {dashboardData.totalEmployees}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6} lg={3}>
                                    <Box sx={{
                                        p: 3,
                                        bgcolor: 'white',
                                        borderRadius: 2,
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                        height: '100%',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                        }
                                    }}onClick={() => setActiveSection("revenue")}>
                                        <Typography variant="h6" color="primary">
                                            Revenue
                                        </Typography>
                                        {dashboardData.loading ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                                <CircularProgress size={30} />
                                            </Box>
                                        ) : (
                                            <Typography color="text.primary" variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
                                                ${dashboardData.totalRevenue.toLocaleString()}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                    {activeSection === "employees" && <ResourceManagement />}
                    {/*{activeSection === "technology" && <TechnologyReport />}*/}
                    {activeSection === "project" && <ProjectManagement />}
                    {activeSection === "revenue" && <RevenueDetails />}
                    {activeSection === "client" && <ClientManagement />}
                </Container>
            </Box >
        </Box >
    );
};

export default Dashboard;
