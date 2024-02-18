$(document).ready(function() {
    const externalCustomerIdInput = $('#externalCustomerId');
    const portalKeyInput = $('#portalKey');
    const customerIdDisplay = $('#customerIdDisplay');
    const savePayMethodTokenDisplay = $('#savePayMethodTokenDisplay');
    const makePaymentTokenDisplay = $('#makePaymentTokenDisplay');
    const portalOneContainer = $('#portalOneContainer');

    let customerId = null;
    let portalKey = portalKeyInput.val();
    let savePaymentMethodToken = null;
    let makePaymentToken = null;

    //Save Payment Method
    let paymentCategory, billingZip, billingAddressStreet, policyHolderName, clientReferenceData1, confirmationDisplay, acceptCreditCards, acceptPrepaidCards;

    // Function to load data
    async function loadData() {
        document.addEventListener('DOMContentLoaded', () => {
        fetch('demo-data.json')
            .then(response => response.json())
            .then(data => {
                document.getElementById('billingZip').value = data.billingZip;
                document.getElementById('billingAddressStreet').value = data.billingAddressStreet;
                document.getElementById('policyHolderName').value = data.policyHolderName;
                document.getElementById('clientReferenceData1').value = data.clientReferenceData1;
                document.getElementById('confirmationDisplay').value = data.confirmationDisplay;
                document.getElementById('acceptCreditCards').value = data.acceptCreditCards;
                document.getElementById('acceptPrepaidCards').value = data.acceptPrepaidCards;
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
        });

        // Submit the submitPayMethodForm so we have our html values here and available to send to the server
        // event.preventDefault();
        // document.getElementById("submitPayMethodForm").click();

        // Send our form data to the server
        const form = document.getElementById('paymentMethodForm');
        const formData = new FormData(form);
        try {
            const headers = new Headers();
            // Set the Content-Type header based on the type of form data
            headers.append('Content-Type', 'application/x-www-form-urlencoded'); // or 'multipart/form-data' depending on your form data
            const response = await fetch('/submit-paymethod-data', {
                method: 'POST',
                headers: headers,
                body: formData
            });
            if (response.ok) {
                console.log('Form data submitted successfully to our server side');
            } else {
                console.error('Failed to submit form data to our server side:', response.status);
            }
        } catch (error) {
            console.error('Error submitting form data to our server side:', error.message);
        }
        
    }
    // Event listener for the button click
    document.getElementById('loadDataButton').addEventListener('click', loadData);


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

    $('#getSavePaymentMethodTokenButton').click(async function() {
        try {
            savePaymentMethodToken = await getSavePayMethodTokenFromServer(customerId, portalKey);
            savePayMethodTokenDisplay.val(savePaymentMethodToken);
        } catch (error) {
            console.error('Error fetching savePaymentMethod tokenD:', error.message);
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

    function populateVariables() {
        // Assign values to the variables
        paymentCategory = document.getElementById("paymentCategory").value;
        billingZip = document.getElementById("billingZip").value;
        billingAddressStreet = document.getElementById("billingAddressStreet").value;
        policyHolderName = document.getElementById("policyHolderName").value;
        clientReferenceData1 = document.getElementById("clientReferenceData1").value;
        confirmationDisplay = document.getElementById("confirmationDisplay").value;
        acceptCreditCards = document.getElementById("acceptCreditCards").value;
        acceptPrepaidCards = document.getElementById("acceptPrepaidCards").value;
    }
    
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

    async function getSavePayMethodTokenFromServer(customerId, portalKey) {
        try {
            const response = await fetch(`/savePaymentMethodToken?customerId=${customerId}&portalKey=${portalKey}`);
            const data = await response.json();
            console.log(data);
            return data.token;
        } catch (error) {
            console.error('Error fetching savePaymentMethod token from server:', error.message);
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

    async function launchSavePaymentMethodModal() {
        const sessionId = await getSessionIdFromServer(customerId);
        console.log('Session ID obtained:', sessionId);
        populateVariables();
        portalOneContainer.portalOne();
        let dialog = portalOneContainer.data('portalOne');
        dialog.savePaymentMethod({
            'paymentCategory': paymentCategory,
            'billingZip': billingZip,
            'billingAddressStreet': billingAddressStreet,
            'policyHolderName': policyHolderName,
            'clientReferenceData1': clientReferenceData1,
            'confirmationDisplay': confirmationDisplay,
            'acceptCreditCards': acceptCreditCards,
            'acceptPrepaidCards': acceptPrepaidCards,
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

    async function launchSavePaymentMethodModalWithToken() {
        console.log('launchSavePaymentModalOption2');
        const sessionId = await getSessionIdFromServer(customerId);
        console.log('Session ID obtained:', sessionId);
        const token = await getSavePayMethodTokenFromServer(customerId, portalKey);
        console.log('SavePayMethod Token obtained:', token);        
        portalOneContainer.portalOne();
        let portalOne = portalOneContainer.data('portalOne');
        portalOne.run({
            'sessionId': sessionId,
            'accessTokenId': token,
            'displayMode': 'Modal',
            'allowClosing': "true"
        });
    }

    async function launchMakePaymentModalWithToken() {
        console.log('launchMakePaymentModalOption2');
        const sessionId = await getSessionIdFromServer(customerId);
        console.log('Session ID obtained:', sessionId);
        const token = await getMakePaymentTokenFromServer(portalKey);
        console.log('MakePayment Token obtained:', token);        
        portalOneContainer.portalOne();
        let portalOne = portalOneContainer.data('portalOne');
        portalOne.run({
            'sessionId': sessionId,
            'accessTokenId': token,
            'displayMode': 'Modal',
            'allowClosing': "true"
        });
    }

    $('#savePaymentMethodButton').on('click', launchSavePaymentMethodModal);
    $('#launchModalButton').on('click', launchMakePaymentModal);
    $('#savePaymentMethodButtonOption2').on('click', launchSavePaymentMethodModalWithToken);
    $('#launchModalButtonOption2').on('click', launchMakePaymentModalWithToken);
});
