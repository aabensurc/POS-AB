const dashboardController = require('../controllers/dashboard.controller');

const req = {
    query: { range: 'today' }
};

const res = {
    json: (data) => console.log('Response JSON:', JSON.stringify(data, null, 2)),
    status: (code) => {
        console.log('Response Status:', code);
        return res;
    }
};

(async () => {
    try {
        console.log('Testing getDashboardStats...');
        await dashboardController.getDashboardStats(req, res);
    } catch (e) {
        console.error('CRITICAL ERROR:', e);
    }
})();
