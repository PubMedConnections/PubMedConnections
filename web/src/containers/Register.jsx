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
import {POST} from "../utils/APIRequests";

function Register() {
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [inviteCode, setInviteCode] = useState('');

    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        POST('auth/register', {
            username: user,
            password: password,
            invite_code: inviteCode
        })
            .then((resp) => {
                if (resp.data.success) {
                    setError(false);
                    window.alert("User created.");
                    navigate('/login');

                } else {
                    setError(true);
                    setErrorMessage(resp.data.message);
                }
            })
            .catch((err) => {
                setError(true);
                setErrorMessage(err.response.data ? err.response.data.message : 'Could not contact the server.');
            })

    };

    useEffect(() => {
        document.title = 'PubMed Connections | Register';
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
                    Register
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
                    <TextField
                        margin='normal'
                        required
                        fullWidth
                        name='invite_code'
                        label='Invite code'
                        type='password'
                        id='invite_code'
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                    />
                    {error && (
                        <Alert severity='error'>
                            <AlertTitle>Could not register user</AlertTitle>
                            There was a problem registering a new user.
                            &nbsp;{errorMessage ?? ''}
                        </Alert>
                    )}
                    <Button
                        type='submit'
                        fullWidth
                        variant='contained'
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Register
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default Register;
