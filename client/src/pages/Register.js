import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  TextField, Button, Typography, Container, Box, Link, Grid,
  FormControl, InputLabel, Select, MenuItem, IconButton, InputAdornment
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
        // Add other fields if needed
      });
      navigate('/');
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

        {error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* First & Last Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handleChange('firstName')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person fontSize="small" />
                    </InputAdornment>
                  )
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

            {/* Email */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Phone */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange('phone')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Gender */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={handleChange('gender')}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Password */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type={formData.showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <IconButton
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, showPassword: !formData.showPassword })
                      }
                    >
                      {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
              />
            </Grid>

            {/* Confirm Password */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock fontSize="small" />
                    </InputAdornment>
                  )
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
