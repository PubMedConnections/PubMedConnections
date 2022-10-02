import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import JsonData from "../json/redirectLinks.json";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";


function Redirect() {
    const { toLink } = useParams();

    const [redirectPageData, setRedirectPageData] = useState({});
    useEffect(() => {
        setRedirectPageData(JsonData);
    }, []);

    useEffect(() => {
        document.title = 'PubMed Connections | Redirecting...';
    }, []);

    window.location.href = redirectPageData[toLink];

    return (
        <div>
            <Container component='main' sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflow: 'auto' }}>
                    <Box sx={{ width: 250, paddingY: 1 }}
                        component='img'
                        src='/img/logo-with-text.png'
                    />
                    <Typography component='h1' variant='h5'>
                        Redirecting...
                    </Typography>
                </Box>
            </Container>
        </div>
    );
}

export default Redirect;