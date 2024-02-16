$(document).ready(function() {
    console.log('Document ready...');
    
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

    // Function to launch the modal for saving payment methods
    async function launchSavePaymentMethodModal() {
        console.log('Launching modal to save payment method...');
        const customerId = await createCustomerId();
        if (!customerId) {
            console.error('Error getting customer ID');
            return;
        }
        const sessionId = await getSessionId(customerId);
        if (!sessionId) {
            console.error('Error getting session ID');
            return;
        }
        console.log('Session ID obtained:', sessionId);
        // Launch modal for saving payment method
        let container = $('#portalOneContainer');
        container.portalOne();
        let dialog = container.data('portalOne');
        dialog.savePaymentMethod({
            'paymentCategory': 'CreditCard',
            'billingZip': '95630',
            'billingAddressStreet': '602 Coolidge Dr., Folsom, CA',
            'policyHolderName': 'John Smith',
            'clientReferenceData1': 'POL330701-02',
            'confirmationDisplay': 'true',
            'acceptCreditCards': 'true',
            'acceptPrepaidCards': 'false',
            'customerId': customerId,
            'sessionId': sessionId
        });
    }

    // Function to launch the modal for making payment
    async function launchMakePaymentModal() {
        console.log('Launching modal to make payment...');
        const customerId = await createCustomerId();
        if (!customerId) {
            console.error('Error getting customer ID');
            return;
        }
        const sessionId = await getSessionId(customerId);
        if (!sessionId) {
            console.error('Error getting session ID');
            return;
        }
        console.log('Session ID obtained:', sessionId);
        // Launch modal for making payment
        let container = $('#portalOneContainer');
        container.portalOne();
        let dialog = container.data('portalOne');
        dialog.makePayment({
            'paymentCategory': 'CreditCard',
            'feeContext': 'PaymentWithFee',
            'convenienceFeeType': 'Renewal',
            'amountContext': 'SelectOrEnterAmount',
            'amountContextDefault': 'minimumAmountDue',
            'minAmountDue': '12.00',
            'accountBalance': '120.00',
            'billingZip': '95630',
            'billingAddressStreet': '602 Coolidge Dr., Folsom, CA',
            'policyHolderName': 'John Smith',
            'clientReferenceData1': 'POL330701-02',
            'confirmationDisplay': 'true',
            'saveOption': 'Save',
            'accountGroupCode': 'Default',
            'extendedParameters': {'key': 'value'},
            'scheduledPaymentEngineType': 'ScheduledPaymentEngine',
            'sessionId': sessionId
        });
    }

    // Attach click event listeners to buttons
    $('#savePaymentMethodButton').on('click', launchSavePaymentMethodModal);
    $('#launchModalButton').on('click', launchMakePaymentModal);
});
