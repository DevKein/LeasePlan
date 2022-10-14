public with sharing class SupplierSelector {
    @AuraEnabled(Cacheable = true)
    public static List<Supplier__c> getList(Id accountId) {
        Account customer = AccountSelector.getAccount(accountId);
        
        SObjectAccessDecision decision = Security.stripInaccessible(
        AccessType.READABLE,
        [ SELECT  Id, Name, Location__c, Street__c, City__c, Country__c, State__c, Postal_Code__c
             FROM Supplier__c 
             WHERE City__c = :customer.BillingCity ]);

        evaluateDecision(decision);

        List<Supplier__c> supplierList = (List<Supplier__c>)decision.getRecords();
        // If no supplier found throw not found error for LWC to catch
        if(supplierList.isEmpty()) {
            throw new AuraHandledException('No Record Found..');
        }
        return supplierList; 
    }

    @AuraEnabled(Cacheable = true)
    public static Supplier__c getSupplier(Id supplierId) {      
        SObjectAccessDecision decision = Security.stripInaccessible(
        AccessType.READABLE,
        [ SELECT  Id, Name, Location__c, Street__c, City__c, Country__c, State__c, Postal_Code__c
             FROM Supplier__c 
             WHERE Id = :supplierId LIMIT 1]);

        evaluateDecision(decision);

        Supplier__c supplier = (Supplier__c)decision.getRecords()[0];
        return supplier; 
    }

    // PRIVATE

    private static void evaluateDecision( SObjectAccessDecision decision ) {
        Map<String,Set<String>> fieldLevelSecurityIssues = decision.getRemovedFields();
        // SECURITY: If there are a not readable fields throw FLS exception
        if( !fieldLevelSecurityIssues.isEmpty() ) {
            throw new AuraHandledException('ERROR: Insufficient Priviliges');
        }
    }
    // With google API key below code could convert billing address into a geocoded location for better supplier filtering
    // As a second option salesforce has Salesforce Maps package which is a paid product for this kind of operations
    /*private String getGeolocation() {
        String gApiKey = getGoogleApiKey();
        Http h = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('http://maps.googleapis.com/maps/api/geocode/json?address='+salesforceAddress+'&sensor=false&key='+gApiKey);
        req.setMethod('GET');
        req.setTimeout(120000);

        HttpResponse res = h.send(req);
        System.debug(res.getBody());
    }*/

}
