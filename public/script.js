$(document).ready(function() {
    const externalCustomerIdInput = $('#externalCustomerId');
    const portalKeyInput = $('#portalKey');
    const customerIdDisplay = $('#customerIdDisplay');
    const makePaymentTokenDisplay = $('#makePaymentTokenDisplay');
    const portalOneContainer = $('#portalOneContainer');

    let customerId = null;
    let portalKey = portalKeyInput.val();
    let makePaymentToken = null;

    $('#getCustomerIdButton').click(async function() {
        // Execute our customerId button to actually convert the externalCustomerId to the customerId
        try {
            externalCustomerId = externalCustomerIdInput.val();
            customerId = await getCustomerIdFromServer(externalCustomerId);
            customerIdDisplay.val(customerId);
        } catch (error) {
            console.error('Error fetching Customer ID:', error.message);
        }
    });

    $('#getMakePaymentTokenButton').click(async function() {
        try {
            makePaymentToken = await getMakePaymentTokenFromServer(portalKey);
            makePaymentTokenDisplay.val(makePaymentToken);
        } catch (error) {
            console.error('Error fetching makePayment tokenD:', error.message);
        }
    });
    
    async function getCustomerIdFromServer(externalCustomerId) {
        try {
            const response = await fetch(`/createCustomerId?externalCustomerId=${externalCustomerId}&portalKey=${portalKey}`);
            const data = await response.json();
            return data.customerId;
        } catch (error) {
            console.error('Error fetching customer ID from server:', error.message);
            return null;
        }
    }

    async function getSessionIdFromServer(customerId) {
        try {
            const response = await fetch(`/getSessionId?customerId=${customerId}&portalKey=${portalKey}`);
            const data = await response.json();
            return data.sessionId;
        } catch (error) {
            console.error('Error fetching session ID from server:', error.message);
            return null;
        }
    }

    async function getMakePaymentTokenFromServer(portalKey) {
        try {
            const response = await fetch(`/makePaymentToken?portalKey=${portalKey}`);
            const data = await response.json();
            console.log(data);
            return data.token;
        } catch (error) {
            console.error('Error fetching makePayment token from server:', error.message);
            return null;
        }
    }

    async function launchMakePaymentModal() {
        const sessionId = await getSessionIdFromServer(customerId);
        portalOneContainer.portalOne();
        let dialog = portalOneContainer.data('portalOne');
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

    async function launchMakePaymentModalWithToken() {
        const sessionId = await getSessionIdFromServer(customerId);
        const token = await getMakePaymentTokenFromServer(portalKey);
        portalOneContainer.portalOne();
        let portalOne = portalOneContainer.data('portalOne');
        portalOne.run({
            'sessionId': sessionId,
            'accessTokenId': token,
            'displayMode': 'Modal',
            'allowClosing': "true"
        });
    }
   
    $('#launchModalButton').on('click', launchMakePaymentModal);
    $('#launchModalButtonOption2').on('click', launchMakePaymentModalWithToken);

});
