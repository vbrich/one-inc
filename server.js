const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

let paymentCategory, billingZip, billingAddressStreet, policyHolderName, clientReferenceData1, confirmationDisplay, acceptCreditCards, acceptPrepaidCards;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // Middleware to parse form data
app.use(express.json()); // Middleware to parse form data

// Define route for serving the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get payment method data from our front end so we can use it in other calls
app.post('/submit-paymethod-data', (req, res) => {
    const formData = req.body;
    populateVariables(formData);
    console.log('Received form data:', formData);
    res.send('Form submitted successfully!');
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

// Define a route for create savePaymentMethodToken
app.get('/savePaymentMethodToken', async (req, res) => {
    try {
        const { customerId, portalKey } = req.query;
        if (!customerId || !portalKey) {
            throw new Error('CustomerId and PortalKey are required');
        }
        const token = await savePaymentMethodToken(customerId, portalKey);
        res.json({ token });
    } catch (error) {
        console.error('Error fetching token:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Define a route for create makePaymentToken
app.get('/makePaymentToken', async (req, res) => {
    try {
        const { portalKey } = req.query;
        if (!portalKey) {
            throw new Error('PortalKey is required');
        }
        const token = await makePaymentToken(portalKey);
        res.json({ token });
    } catch (error) {
        console.error('Error fetching token:', error.message);
        res.status(500).json({ error: error.message });
    }
});

function populateVariables(formData) {
    paymentCategory = formData.paymentCategory;
    billingZip = formData.billingZip;
    billingAddressStreet = formData.billingAddressStreet;
    policyHolderName = formData.policyHolderName;
    clientReferenceData1 = formData.clientReferenceData1;
    confirmationDisplay = formData.confirmationDisplay;
    acceptCreditCards = formData.acceptCreditCards;
    acceptPrepaidCards = formData.acceptPrepaidCards;
}

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

async function savePaymentMethodToken(customerId, portalKey) {
    try {
        console.log('Creating customer ID...');
        const response = await fetch('https://testportalone.processonepayments.com/Api/Api/AccessToken/Create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Type: "Client",
                Payload: {
                    operation: "savePaymentMethod",
                    paymentCategory: paymentCategory,
                    billingZip: billingZip,
                    billingAddressStreet: billingAddressStreet,
                    policyHolderName: policyHolderName,
                    clientReferenceData1: clientReferenceData1,
                    confirmationDisplay: confirmationDisplay,
                    acceptCreditCards: acceptCreditCards,
                    acceptPrepaidCards: acceptPrepaidCards,
                    extendedParameters: {
                        key: "value"
                    },
                    customerId: customerId
                },
                PortalOneAuthenticationKey: portalKey
            })
        });
        const data = await response.json();
        console.log('Token created:', data.Token);
        return data.Token;
    } catch (error) {
        console.error('Error creating token:', error.message);
        throw new Error('Failed to create token');
    }
}

async function makePaymentToken(portalKey) {
    try {
        console.log('Creating token...');
        const response = await fetch('https://testportalone.processonepayments.com/Api/Api/AccessToken/Create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Type: "Client",
                Payload: {
                    operation: "makePayment",
                    paymentCategory: "CreditCard",
                    feeContext: "PaymentWithFee",
                    convenienceFeeType: "Renewal",
                    amountContext: "AmountDueOnly",
                    amountContextDefault: "minimumAmountDue",
                    minAmountDue: "2107.98",
                    billingZip: "12345",
                    billingAddressStreet: "201 W. Mifflin St",
                    policyHolderName: "John Smith",
                    confirmationDisplay: "true",
                    saveOption: "UserSelect",
                    clientReferenceData1: "BLU-CB-1KI4YZIX",
                    clientReferenceData2: "1INC",
                    clientReferenceData3: "",
                    clientReferenceData4: "POL-12345-ClientReferenceData4",
                    clientReferenceData5: "POL-12345-ClientReferenceData5",
                    ExtendedParameters: { key: "value" },
                    accountGroupCode: "Default"
                },
                PortalOneAuthenticationKey: portalKey
            })
        });
        const data = await response.json();
        console.log('Token created:', data.Token);
        return data.Token;
    } catch (error) {
        console.error('Error creating token:', error.message);
        throw new Error('Failed to create token');
    }
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

