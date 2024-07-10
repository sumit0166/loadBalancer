const http = require('http');
const url = require('url');
const crypto = require('crypto');

const config = require('./config/config.json');
const logger = require('./components/logger');

// List of backend servers
const servers = config.servers;
let prevServer;
let currentIndex = 0; // Index to keep track of the current backend server

// Create the load balancer server
// function rotateServer() {
//     currentIndex = (currentIndex + 1) % servers.length;
// }

// setInterval(rotateServer, config.switchnterval);
const convertIptoHash = (ip) => {
    const hash = crypto.createHash('md5').update(ip).digest('hex');
    return parseInt(hash, 16);
}


const reqBalance = (req) => {
    const currentServer = servers[currentIndex];
    switch (config.balanceType) {
        case "roundRobin":
            if(currentIndex >= servers.length){
                currentIndex = 0
            }
            let tempServer = servers[currentIndex]
            currentIndex++;
            return tempServer;
        case "ipHash":
            const ip = req.connection.remoteAddress || req.socket.remoteAddress;
            const ipHash = convertIptoHash(ip);
            const target = ipHash % servers.length
            return servers[target];
        case "contextBased":
            const parsedUrl = url.parse(req.url, true);
            const context = parsedUrl.pathname.split('/')[1];
            let defa;
            try {
                defa = servers.filter(server => server.allowedRequest.length === 0)
            } catch (error) {
                console.error(error);
            }
            // logger.info(`CONTEXT: ${context}`);
            console.log(`CONTEXT: ${context}`);
            for(let server of config.servers){ 
                if (server.allowedRequest.includes(`/${context}`)) {
                    // console.log(server)
                    prevServer = server
                    // logger.info(`${JSON.stringify(server)}`);
                    return server;
                } 
            }

            let defaultServer = defa[Math.floor(Math.random() * defa.length)]
            return defaultServer;
        default:
            return servers[Math.floor(Math.random() * servers.length)];
    }
    // Rotate to the next backend server every 10 secondss
}


const handleTunneling = (req, res) => {
    const proxyReq = http.request({
        hostname: currentServer.host,
        port: currentServer.port,
        path: req.url,
        method: req.method,
        headers: req.headers
    }, (proxyRes) => {
        // Pipe the response from the backend server back to the client
        logger.info(`Response Received ${res.statusCode}`)
        proxyRes.pipe(res);
    });

    // Pipe the request body (if any) to the backend server
    req.pipe(proxyReq);

    // rotateServer()
    // Handle errors from the backend server
    proxyReq.on('error', (err) => {
        logger.error('Error proxying request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
    });
}


const balancer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Allow the GET, POST, and OPTIONS methods
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    // Allow the Content-Type header
    // res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // logger.info(`**** Request Received URL: ${req.url}, Method: ${req.method},  origin - ${req.headers.origin}, connection - ${req.headers.connection}`);
    const tunnelServer = reqBalance(req);

    try {
        // logger.info(` --> Backend Server: ${tunnelServer.host}:${tunnelServer.port}`)
        console.log(`Backend: ${tunnelServer.host}:${tunnelServer.port}`)
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ opStatus: 5001, isSuccess: true }));
        
    } catch (error) {
        logger.error(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 500, message: "Internal server error" }));
    }
    // handleTunneling(req,res);
    // Proxy the incoming request to the current backend server

});

// Listen for incoming requests on port 8080
balancer.listen(config.port, () => {
    logger.info(`Load balancer started on port ${config.port}`);
    logger.info(`Host URI: ${config.host}:${config.port}`);
    logger.info(`Printing configuration bllow`)
    logger.info(`Balancing Mehod - ${config.balanceType}`)
    logger.info(`Rotate Interval in ms- ${config.switchnterval}`);
    logger.info(`Avilable backend servers : ${JSON.stringify(config.servers, null, 2)}`);
});

// Rotate to the next backend server in a round-robin fashion




