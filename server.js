const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define route for serving the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Function to get session ID from API
async function getSessionId(customerId) {
    try {
        console.log('Fetching session ID...');
        const response = await fetch(`https://testportalone.processonepayments.com/Api/Api/Session/Create?PortalOneAuthenticationKey=53471279-ce51-4e8f-830f-374dad91e561&CustomerId=${customerId}`);
        const data = await response.json();
        console.log('Session ID response:', data);
        return data.PortalOneSessionKey;
    } catch (error) {
        console.error('Error fetching session ID:', error.message);
        return null;
    }
}

// Function to create customer ID
async function createCustomerId() {
    try {
        console.log('Creating customer ID...');
        const response = await fetch('https://testportalone.processonepayments.com/Api/Api/Customer/CreateAccount', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ExternalCustomerId: 'customer12345',
                CustomerName: 'John Smith',
                PortalOneAuthenticationKey: '53471279-ce51-4e8f-830f-374dad91e561'
            })
        });
        const data = await response.json();
        console.log('Customer ID created:', data.CustomerId);
        return data.CustomerId;
    } catch (error) {
        console.error('Error creating customer ID:', error.message);
        return null;
    }
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
