const { Sale, sequelize } = require('../models');
const { Op } = require('sequelize');

(async () => {
    try {
        // 1. Check existing dates
        const allSales = await Sale.findAll({
            attributes: ['id', 'date'],
            order: [['date', 'DESC']],
            limit: 5
        });
        console.log("--- Latest 5 Sales Dates ---");
        allSales.forEach(s => console.log(`ID: ${s.id}, Date: ${s.date.toISOString()}, Local: ${s.date.toLocaleString()}`));

        // 2. Simulate Controller Logic for Same Day (2025-12-07)
        const customStart = '2025-12-07';
        const customEnd = '2025-12-07';

        const startDate = new Date(`${customStart}T00:00:00-05:00`);
        const endDate = new Date(`${customEnd}T23:59:59.999-05:00`);

        console.log("\n--- Simulated Range Query ---");
        console.log(`Start Input: ${customStart} -> Obj: ${startDate.toISOString()}`);
        console.log(`End Input: ${customEnd}   -> Obj: ${endDate.toISOString()}`);

        const foundSales = await Sale.findAll({
            where: {
                date: { [Op.between]: [startDate, endDate] }
            }
        });
        console.log(`Found Records: ${foundSales.length}`);

    } catch (e) { console.error(e); }
})();
