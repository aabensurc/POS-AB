const { Sale, SaleItem, Product, Client, User, Settings, sequelize } = require('../models');
const { Op } = require('sequelize');

// Helper to get Date Ranges in Peru Time (UTC-5)
const getPeruDateRange = (range) => {
    const timezoneOffset = -5;
    const now = new Date();

    // Shift to Peru "Wall Clock" Time
    const peruTime = new Date(now.getTime() + timezoneOffset * 60 * 60 * 1000);

    // Default: Start of Today (00:00:00 Peru Time)
    peruTime.setUTCHours(0, 0, 0, 0);

    // Handle Ranges logic on the "Wall Clock" time
    if (range === 'week') {
        const day = peruTime.getUTCDay() || 7; // 1(Mon) - 7(Sun)
        peruTime.setUTCDate(peruTime.getUTCDate() - (day - 1));
    } else if (range === 'month') {
        peruTime.setUTCDate(1);
    }

    // Check if range is 'all' (optional, or just fallback) - dashboard usually timebound

    const startDate = new Date(peruTime.getTime() - timezoneOffset * 60 * 60 * 1000);
    const endDate = new Date(now.getTime()); // Now (up to currrent moment) OR End of Day?

    // Usually filters imply "up to now" or "whole day". Let's do Whole Day for End logic to capture future-dated testing?
    // Better: End of "Today" Peru Time.
    const peruEnd = new Date(now.getTime() + timezoneOffset * 60 * 60 * 1000);
    peruEnd.setUTCHours(23, 59, 59, 999);
    const endDateFull = new Date(peruEnd.getTime() - timezoneOffset * 60 * 60 * 1000);

    return { startDate, endDate: endDateFull };
};

exports.getDashboardStats = async (req, res) => {
    try {
        const { range = 'today' } = req.query; // today, week, month

        const { startDate, endDate } = getPeruDateRange(range);

        console.log(`Dashboard Range: ${range} | Start(UTC): ${startDate.toISOString()} | End(UTC): ${endDate.toISOString()}`);

        // 1. Sales Stats (Based on Range)
        const salesStats = await Sale.sum('total', {
            where: {
                date: { [Op.between]: [startDate, endDate] },
                status: 'completed'
            }
        });

        // 2. Profit Estimate (Based on Range)
        const salesItems = await SaleItem.findAll({
            include: [
                {
                    model: Sale,
                    where: {
                        date: { [Op.between]: [startDate, endDate] },
                        status: 'completed'
                    }
                },
                { model: Product }
            ]
        });

        let profitEstimate = 0;
        salesItems.forEach(item => {
            const cost = item.Product ? (item.Product.cost || item.Product.costPrice || 0) : 0;
            const revenue = item.price * item.quantity;
            const costTotal = cost * item.quantity;
            profitEstimate += (revenue - costTotal);
        });

        // 3. Low Stock Alerts (Global)
        const lowStockCount = await Product.count({
            where: {
                stock: { [Op.lte]: 5 }
            }
        });

        // 4. Sales Trend (Last 7 Days - Fixed - Peru Time via SQL)
        // Note: This remains fixed 7 days for now as "Trend", unrelated to filter unless requested.
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(new Date().getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0); // This is UTC based, but we rely on SQL interval -5h for grouping

        const salesTrendData = await Sale.findAll({
            attributes: [
                [sequelize.literal("date(\"date\" - interval '5 hours')"), 'day'],
                [sequelize.fn('sum', sequelize.col('total')), 'dailyTotal']
            ],
            where: {
                date: { [Op.gte]: sevenDaysAgo }, // This 'where' is still loose UTC, might miss slight Peru overlap edge, but okay for now
                status: 'completed'
            },
            group: [sequelize.literal("date(\"date\" - interval '5 hours')")],
            order: [[sequelize.literal("date(\"date\" - interval '5 hours')"), 'ASC']]
        });

        const trendLabels = [];
        const trendValues = [];
        const mapTrend = {};
        salesTrendData.forEach(d => {
            mapTrend[d.get('day')] = parseFloat(d.get('dailyTotal'));
        });

        // Generate Labels (need to align with SQL logic approx)
        // Simplest: Generate last 7 days keys using the same Peru logic
        const tzOffset = -5;
        const now = new Date();
        const peruNow = new Date(now.getTime() + tzOffset * 3600000);

        for (let i = 6; i >= 0; i--) {
            const d = new Date(peruNow);
            d.setUTCDate(d.getUTCDate() - i);

            const key = d.toISOString().split('T')[0]; // YYYY-MM-DD of Peru Time
            const label = d.toLocaleDateString('es-PE', { timeZone: 'UTC', weekday: 'short', day: 'numeric' });

            trendLabels.push(label);
            trendValues.push(mapTrend[key] || 0);
        }

        // 5. Top Products (Based on Range)
        const topProducts = await SaleItem.findAll({
            attributes: [
                'productId',
                [sequelize.fn('sum', sequelize.col('quantity')), 'totalQty'],
                [sequelize.literal('(SELECT "name" FROM "Products" WHERE "Products"."id" = "SaleItem"."productId")'), 'name'],
                [sequelize.literal('(SELECT "price" FROM "Products" WHERE "Products"."id" = "SaleItem"."productId")'), 'currentPrice']
            ],
            include: [{
                model: Sale,
                attributes: [],
                where: {
                    date: { [Op.between]: [startDate, endDate] },
                    status: 'completed'
                }
            }],
            group: ['productId'],
            order: [[sequelize.literal('"totalQty"'), 'DESC']],
            limit: 5
        });

        // 6. Recent Transactions (FILTERED BY Range now)
        const recentTransactions = await Sale.findAll({
            where: {
                date: { [Op.between]: [startDate, endDate] }
            },
            limit: 10,
            order: [['date', 'DESC']],
            include: [{ model: Client, attributes: ['name'] }]
        });

        const formattedTransactions = recentTransactions.map(t => ({
            ...t.toJSON(),
            Client: t.Client || { name: 'Cliente General' }
        }));

        res.json({
            salesToday: salesStats || 0,
            profitEstimate,
            lowStockCount,
            trend: { labels: trendLabels, data: trendValues },
            topProducts,
            recentTransactions: formattedTransactions
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ error: error.message });
    }
};
