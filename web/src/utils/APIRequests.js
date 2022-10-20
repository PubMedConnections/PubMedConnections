import axios from 'axios'


function POST(route, data) {
    return makeRequest('post', route, data)
}

function GET(route) {
    return makeRequest('get', route)
}

function PUT(route, data) {
    return makeRequest('put', route, data)
}

function DELETE(route, data) {
    return makeRequest('delete', route, data)
}

function getAPIEndpoint() {
    const endpointURL = process.env.REACT_APP_API_ENDPOINT;
    return endpointURL.replace("<HOSTNAME>", window.location.hostname);
}

function makeRequest(method, route, data) {

    const config = {
        method: method,
        url: `${getAPIEndpoint()}${route}`,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Authorization': localStorage.getItem('access_token')
        },
        data: data,
    };
    try {
        return axios(config);
    } catch (err) {
        console.error(err);
    }
}

export {POST, GET, PUT, DELETE}
