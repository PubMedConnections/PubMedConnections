import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

function Login() {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  const { loading, error } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    await dispatch(login({ user, password }));
    navigate('/connections');
  };

  useEffect(() => {
    document.title = 'PubMed Connections | Login';
  }, []);

  return (
    <Container component='main' sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '100%',
          overflow: 'auto',
        }}
      >
        <Box
          sx={{
            width: 250,
            paddingY: 1,
            cursor: 'hand'
          }}
          component='img'
          src='/img/logo-with-text.png'
          onClick={() => {
              navigate('/')
          }}
        />
        <Typography component='h1' variant='h5'>
          Sign in
        </Typography>

        <Box
          component='form'
          onSubmit={handleSubmit}
          noValidate
          sx={{ width: '400px', mt: 1 }}
        >
          <TextField
            margin='normal'
            required
            fullWidth
            id='username'
            label='Username'
            name='username'
            value={user}
            onChange={(e) => setUser(e.target.value)}
            autoComplete='userName'
            autoFocus
          />
          <TextField
            margin='normal'
            required
            fullWidth
            name='password'
            label='Password'
            type='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete='current-password'
          />
          {error && (
            <Alert severity='error'>
              <AlertTitle>Wrong Username or Password</AlertTitle>
              There was a problem logging in -{' '}
              <strong>
                please ensure your login details are correct and try again.
              </strong>
            </Alert>
          )}
          {
            // TODO: Support 'remember me' feature
            /* <FormControlLabel
            control={<Checkbox value='remember' color='primary' />}
            label='Remember me'
          /> */
          }
           <br/>
            <p style={{fontSize: "small"}}>Don't have an account? <a href="/register">Sign up &gt;</a></p>
          <Button
            type='submit'
            fullWidth
            variant='contained'
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          {
            // TODO: Support forgot password and signup pages
            /* <Grid container>
            <Grid item xs>
              <Link href='#' variant='body2'>
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href='#' variant='body2'>
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid> */
          }
        </Box>
      </Box>
    </Container>
  );
}

export default Login;
