import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { toast } from 'react-toastify'; // ✅ Import toast

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔐 Attempting login with:', { email, password });
    try {
      await login(email, password);
      toast.success('✅ Logged in successfully!'); // ✅ Show success toast
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Login failed:', err);
      toast.error('❌ Invalid credentials'); // ✅ Show error toast
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4">Login</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" sx={{ mt: 3 }}>
            Login
          </Button>

          {/* Sign Up Link */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link to="/register" style={{ textDecoration: 'none', color: '#1976d2' }}>
                Sign Up
              </Link>
            </Typography>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default Login;
