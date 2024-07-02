const http = require('http');
const config = require('./config.json');
// List of backend servers
const servers = config.servers;

let currentIndex = 0; // Index to keep track of the current backend server

// Create the load balancer server
const balancer = http.createServer((req, res) => {

    
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Allow the GET, POST, and OPTIONS methods
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    // Allow the Content-Type header
    // res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    
    const currentServer = servers[currentIndex];

    
    
    console.log(`Request URL: ${req.url}, Backend Server: ${currentServer.host}:${currentServer.port}`);
    // Proxy the incoming request to the current backend server
    const proxyReq = http.request({
        hostname: currentServer.host,
        port: currentServer.port,
        path: req.url,
        method: req.method,
        headers: req.headers
    }, (proxyRes) => {
        // Pipe the response from the backend server back to the client
        
        proxyRes.pipe(res);
    });

    // Pipe the request body (if any) to the backend server
    req.pipe(proxyReq);

    // rotateServer()
    // Handle errors from the backend server
    proxyReq.on('error', (err) => {
        console.error('Error proxying request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
    });
});

// Listen for incoming requests on port 8080
balancer.listen(8081, () => {
    console.log('Load balancer started on port 8081');
});

// Rotate to the next backend server in a round-robin fashion
function rotateServer() {
    currentIndex = (currentIndex + 1) % servers.length;
}

// Rotate to the next backend server every 10 secondss
setInterval(rotateServer, 500);

