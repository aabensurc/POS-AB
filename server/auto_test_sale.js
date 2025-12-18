```javascript
const API_URL = 'http://localhost:5000/api';

async function testSaleCreation() {
    try {
        // 1. Login
        console.log("1. Logging in...");
        const loginRes = await fetch(`${ API_URL } /auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'adminpassword' })
        });
        
        if (!loginRes.ok) throw new Error(`Login failed: ${ loginRes.statusText } `);
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("   Login successful. Token obtained.");

        // 2. Create Sale
        console.log("2. Creating Sale...");
        const saleData = {
            clientId: null,
            total: 10.00,
            paymentMethod: 'Efectivo',
            items: [
                { productId: 1, quantity: 1, price: 10.00 } // Assuming product 1 exists
            ]
        };

        const saleRes = await fetch(`${ API_URL }/sales`, {
method: 'POST',
    headers: {
    'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
},
body: JSON.stringify(saleData)
        });

if (!saleRes.ok) throw new Error(`Sale creation failed: ${saleRes.statusText}`);
const createdSaleData = await saleRes.json();
console.log("   Sale created. ID:", createdSaleData.id);

// 3. Check History
console.log("3. Checking details of created sale...");
const historyRes = await fetch(`${API_URL}/sales`, {
    headers: { 'Authorization': `Bearer ${token}` }
});

if (!historyRes.ok) throw new Error(`Fetch history failed: ${historyRes.statusText}`);
const historyData = await historyRes.json();
const createdSale = historyData.find(s => s.id === createdSaleData.id);

if (createdSale) {
    console.log("   Sale found in history.");
    console.log("   Seller Name in Record:", createdSale.User ? createdSale.User.name : "MISSING (NULL)");

    if (createdSale.User && createdSale.User.name) {
        console.log("SUCCESS: Seller is correctly recorded!");
    } else {
        console.log("FAILURE: Seller is missing.");
    }
} else {
    console.log("   Error: Created sale not found in history.");
}

    } catch (error) {
    console.error("Error during test:", error.message);
}
}

testSaleCreation();
```
