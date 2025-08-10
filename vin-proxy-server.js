const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3003;

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if (req.method === 'GET' && req.url === '/test') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'VIN Proxy Server is running!', timestamp: new Date().toISOString() }));
        console.log('Test endpoint accessed');
        return;
    }
    
    if (req.method === 'GET' && req.url.startsWith('/decode/')) {
        const vin = req.url.split('/decode/')[1];
        
        if (!vin || vin.length !== 17) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid VIN - must be 17 characters' }));
            return;
        }
        
        console.log(`Decoding VIN: ${vin}`);
        
        // Proxy request to NHTSA API
        const nhtsaUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;
        
        https.get(nhtsaUrl, (nhtsaRes) => {
            let data = '';
            
            nhtsaRes.on('data', (chunk) => {
                data += chunk;
            });
            
            nhtsaRes.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(jsonData));
                    console.log(`VIN ${vin} decoded successfully`);
                } catch (error) {
                    console.error('JSON parse error:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to parse NHTSA response' }));
                }
            });
            
        }).on('error', (error) => {
            console.error('NHTSA API error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to connect to NHTSA API' }));
        });
        
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

server.listen(PORT, () => {
    console.log(`VIN Proxy Server running on http://localhost:${PORT}`);
    console.log(`Usage: GET http://localhost:${PORT}/decode/{17-character-VIN}`);
});
