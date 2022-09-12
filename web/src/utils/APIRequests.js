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

function makeRequest(method, route, data) {
    const config = {
        method: method,
        url: `${process.env.REACT_APP_API_ENDPOINT}${route}`,
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

export {POST, GET, PUT}
