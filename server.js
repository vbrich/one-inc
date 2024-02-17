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

// Define a route for creating a customerId
app.get('/createCustomerId', async (req, res) => {
    try {
        const { externalCustomerId, portalKey } = req.query;
        
        if (!externalCustomerId || !portalKey) {
            throw new Error('ExternalCustomerId and PortalKey are required');
        }

        const customerId = await createCustomerId(externalCustomerId, portalKey);
        res.json({ customerId });
    } catch (error) {
        console.error('Error creating customer ID:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Define a route for fetching sessionId
app.get('/getSessionId', async (req, res) => {
    try {
        const { customerId, portalKey } = req.query;

        if (!customerId || !portalKey) {
            throw new Error('CustomerId and PortalKey are required');
        }

        const sessionId = await getSessionId(customerId, portalKey);
        res.json({ sessionId });
    } catch (error) {
        console.error('Error fetching session ID:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Function to get session ID from API
async function getSessionId(customerId, portalKey) {
    try {
        console.log('Fetching session ID with customerId = ' + customerId + ' and portalKey = ' + portalKey);
        const response = await fetch(`https://testportalone.processonepayments.com/Api/Api/Session/Create?PortalOneAuthenticationKey=${portalKey}&CustomerId=${customerId}`);
        const data = await response.json();
        console.log('Session ID response:', data);
        return data.PortalOneSessionKey;
    } catch (error) {
        console.error('Error fetching session ID:', error.message);
        throw new Error('Failed to fetch session ID');
    }
}

// Function to create customer ID
async function createCustomerId(externalCustomerId, portalKey) {
    try {
        console.log('Creating customer ID...');
        const response = await fetch('https://testportalone.processonepayments.com/Api/Api/Customer/CreateAccount', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ExternalCustomerId: externalCustomerId,
                CustomerName: 'John Smith',
                PortalOneAuthenticationKey: portalKey
            })
        });
        const data = await response.json();
        console.log('Customer ID created:', data.CustomerId);
        return data.CustomerId;
    } catch (error) {
        console.error('Error creating customer ID:', error.message);
        throw new Error('Failed to create customer ID');
    }
}
