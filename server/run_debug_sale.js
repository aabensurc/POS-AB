const { Sale, User, sequelize } = require('./models');

async function debugLastSale() {
    try {
        const lastSale = await Sale.findOne({
            order: [['date', 'DESC']],
            include: [{ model: User }]
        });

        console.log("--------------- LAST SALE DEBUG ---------------");
        if (!lastSale) {
            console.log("No sales found.");
        } else {
            console.log("Sale ID:", lastSale.id);
            console.log("Date:", lastSale.date);
            console.log("Total:", lastSale.total);
            console.log("Payment:", lastSale.paymentMethod);
            console.log("Raw userId:", lastSale.userId);
            console.log("Associated User:", lastSale.User ? lastSale.User.name : "NULL");
        }
        console.log("-----------------------------------------------");
    } catch (error) {
        console.error("Error debugging:", error);
    } finally {
        await sequelize.close();
    }
}

debugLastSale();
