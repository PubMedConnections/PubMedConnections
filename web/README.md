# PubMed Connections Web Interface

Provides a React Web application to interface with the PubMedConnections API.

## Install and Run

1. **Node.js LTS (16.15.0 or 17.X.X) is required**, it won't work with (18.1.0)
   - To install multiple versions of Node.js, see [nvm](https://github.com/nvm-sh/nvm) (stackoverflow helped alot).
2. Install dependencies:
   - `npm install`
3. Run:
   - `npm start`
   - By default, web application will be available at `http://localhost:3000`

## Environment File

For the application to operate correctly, the following information must be provideded in a file named `.env` in the root directory (`./web/.env`).

The environment file must contain the following options (only example values provided):

```
# URL of API endpoint
REACT_APP_API_ENDPOINT=http://localhost:8080/api/
```
