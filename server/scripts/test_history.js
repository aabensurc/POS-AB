const http = require('http');

// 1. First, we need a token (login as admin)
// But I can hardcode the Previous Token if valid, or just login fresh.
// Let's rely on the fact that I fixed login.

// Actually, let's just use a fetch helper
const loginAndFetchHistory = async () => {
    // Login
    const loginData = JSON.stringify({ username: 'admin', password: '123' });

    // Login Request
    const loginReq = http.request({
        hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
    }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            const token = JSON.parse(body).token;
            console.log("Token obtained:", token);

            // History Request
            const histReq = http.request({
                hostname: 'localhost', port: 5000, path: '/api/cash/history', method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            }, (histRes) => {
                console.log("History Status:", histRes.statusCode);
                let histBody = '';
                histRes.on('data', c => histBody += c);
                histRes.on('end', () => console.log("History Body:", histBody));
            });
            histReq.end();
        });
    });
    loginReq.write(loginData);
    loginReq.end();
};

loginAndFetchHistory();
