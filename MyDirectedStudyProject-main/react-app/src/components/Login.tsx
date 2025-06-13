import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    TextField, 
    Button, 
    Typography, 
    Paper, 
    Container,
    InputAdornment,
    IconButton,
    CircularProgress,
    Alert,
    Grid,
    Link
} from '@mui/material';
import { 
    Visibility, 
    VisibilityOff, 
    LockOutlined as LockIcon,
    Person as PersonIcon,
    Business as BusinessIcon
} from '@mui/icons-material';
import { createAuthenticatedAxios } from '../utils/api';
const httpClient = createAuthenticatedAxios();
const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();  
    useEffect(() => {
        // Check if user is already logged in
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        const token = localStorage.getItem('token');
        
        if (isAuthenticated === 'true' && token) {
            navigate('/dashboard');
        }
    }, [navigate]);
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        // Validating inputs
        if (!credentials.username.trim() || !credentials.password.trim()) {
            setError('Please enter both username and password');
            return;
        }  
        setIsLoading(true);
        setError('');
        try {
            const response = await httpClient.post('/api/auth/login', credentials);
            if (response.data.token) {
                // Storing auth data
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('username', credentials.username);  
                // Redirecting to dashboard
                navigate('/dashboard', {replace: true});   
            } else {
                setError('Invalid response from server. Please try again.');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.response) {
                if (err.response.status === 401) {
                    setError('Invalid username or password. Please try again.');
                } else if (err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } else {
                    setError(`Error ${err.response.status}: ${err.response.statusText}`);
                }
            } else if (err.request) {
                setError('No response from server. Please check your connection.');
            } else {
                setError('An error occurred during login. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            py: 4
        }}>
            <Container maxWidth="sm">
                <Grid container justifyContent="center">
                    <Grid item xs={12} sm={10} md={8}>
                        <Paper 
                            elevation={10} 
                            sx={{ 
                                p: 4, 
                                borderRadius: 2,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                            }}
                        >
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center',
                                    mb: 3
                                }}
                            >
                                <Box 
                                    sx={{ 
                                        bgcolor: 'primary.main', 
                                        color: 'white', 
                                        width: 56, 
                                        height: 56, 
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 2
                                    }}
                                >
                                    <BusinessIcon fontSize="large" />
                                </Box>
                                <Typography variant="h5" component="h1" fontWeight="bold">
                                    Higher Management Client Management System
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Sign in to access your dashboard
                                </Typography>
                            </Box>
                            
                            {error && (
                                <Alert severity="error" sx={{ mb: 3 }}>
                                    {error}
                                </Alert>
                            )}
                            
                            <form onSubmit={handleLogin}>
                                <TextField
                                    fullWidth
                                    label="Username"
                                    variant="outlined"
                                    margin="normal"
                                    value={credentials.username}
                                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                    required
                                    autoFocus
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    variant="outlined"
                                    margin="normal"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon color="action" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleTogglePasswordVisibility}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                {/*<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 2 }}>
                                    <Link href="#" variant="body2" underline="hover">
                                        Forgot password?
                                    </Link>
                                </Box>*/}
                                <Button 
                                    fullWidth 
                                    variant="contained" 
                                    size="large"
                                    type="submit"
                                    disabled={isLoading}
                                    sx={{ 
                                        py: 1.5,
                                        mt: 1,
                                        mb: 3,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {isLoading ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        'Sign In'
                                    )}
                                </Button>
                            </form>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Login;
