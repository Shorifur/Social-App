import React, { useState, useContext } from 'react';
import { Grid, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material';

import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  TextField, Button, Typography, Container, Box, Link,
  //Grid, InputAdornment, IconButton, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { 
  Person, Email, Phone, Lock, 
  Visibility, VisibilityOff, Transgender 
} from '@mui/icons-material';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    password: '',
    confirmPassword: '',
    showPassword: false
  });
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (prop) => (event) => {
    setFormData({ ...formData, [prop]: event.target.value });
  };

// Change this in your handleSubmit:
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (formData.password !== formData.confirmPassword) {
    setError("Passwords don't match");
    return;
  }

  try {
    await register({
      username: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      password: formData.password
      // Add other fields as needed by your backend
    });
    navigate('/'); // Redirect to home after registration
  } catch (err) {
    setError(err.response?.data?.message || 'Registration failed');
  }
};

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Create Account
        </Typography>
        
        {error && <Typography color="error" align="center" sx={{ mb: 2 }}>{error}</Typography>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Name Fields */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handleChange('firstName')}
                required
                InputProps={{
                  startAdornment: <Person fontSize="small" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange('lastName')}
                required
              />
            </Grid>

            {/* Contact Fields */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                required
                InputProps={{
                  startAdornment: <Email fontSize="small" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange('phone')}
                InputProps={{
                  startAdornment: <Phone fontSize="small" sx={{ mr: 1 }} />
                }}
              />
            </Grid>

            {/* Gender Field */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={handleChange('gender')}
                  label="Gender"
                  startAdornment={<Transgender fontSize="small" sx={{ mr: 1 }} />}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Password Fields */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type={formData.showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
                required
                InputProps={{
                  startAdornment: <Lock fontSize="small" sx={{ mr: 1 }} />,
                  endAdornment: (
                    <IconButton
                      onClick={() => setFormData({ ...formData, showPassword: !formData.showPassword })}
                    >
                      {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                required
                InputProps={{
                  startAdornment: <Lock fontSize="small" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            Register
          </Button>

          <Typography align="center">
            Already have an account?{' '}
            <Link href="/login" underline="hover" sx={{ fontWeight: 'bold' }}>
              Sign In
            </Link>
          </Typography>
        </form>
      </Box>
    </Container>
  );
}