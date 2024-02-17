$(document).ready(function() {
    const externalCustomerIdInput = $('#externalCustomerId');
    const portalKeyInput = $('#portalKey');
    const customerIdDisplay = $('#customerIdDisplay');
    const portalOneContainer = $('#portalOneContainer');

    let customerId = null;
    let portalKey = portalKeyInput.val();

    $('#getCustomerIdButton').click(async function() {
        try {
            externalCustomerId = externalCustomerIdInput.val();
            customerId = await getCustomerIdFromServer(externalCustomerId);
            customerIdDisplay.val(customerId);
        } catch (error) {
            console.error('Error fetching Customer ID:', error.message);
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

    async function launchSavePaymentMethodModal() {
        const sessionId = await getSessionIdFromServer(customerId);
        console.log('Session ID obtained:', sessionId);
        portalOneContainer.portalOne();
        let dialog = portalOneContainer.data('portalOne');
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

    async function launchMakePaymentModal() {
        const sessionId = await getSessionIdFromServer(customerId);
        console.log('Session ID obtained:', sessionId);
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

    $('#savePaymentMethodButton').on('click', launchSavePaymentMethodModal);
    $('#launchModalButton').on('click', launchMakePaymentModal);
});
