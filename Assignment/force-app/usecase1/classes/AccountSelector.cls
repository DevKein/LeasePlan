public with sharing class AccountSelector {
    @AuraEnabled(Cacheable = true)
    public static List<Account> getAccountData(String searchkey) {
        // escapeSingleQuotes to avoid potential failure and to prevent SOQL injection
        searchkey = '%' + String.escapeSingleQuotes(searchkey) + '%';

         // Strip fields that are not readable/accessible
        SObjectAccessDecision decision = Security.stripInaccessible(
        AccessType.READABLE,
        [ SELECT  Id, Name, Phone, BillingAddress
            FROM Account 
            WHERE Name LIKE :searchkey OR Phone LIKE :searchkey ]);

        evaluateDecision(decision);

        List<Account> accountList = (List<Account>)decision.getRecords();
        // If no account found throw not found error for LWC to catch
        if(accountList.isEmpty()) {
            throw new AuraHandledException('No Record Found..');
        }
        return accountList; 
    }

    @AuraEnabled(Cacheable = true)
    public static Account getAccount(Id accountId) {
         // Strip fields that are not readable/accessible
        SObjectAccessDecision decision = Security.stripInaccessible(
        AccessType.READABLE,
        [ SELECT  Id, Name, Phone, BillingAddress, BillingStreet, 
            BillingCity, BillingPostalCode, BillingState, BillingCountry 
             FROM Account 
             WHERE Id = :accountId LIMIT 1]);
 
        evaluateDecision(decision);
        
        Account account = (Account)decision.getRecords()[0];
        // If no account found throw not found error for LWC to catch
        if(account == null) {
            throw new AuraHandledException('No Record Found..');
        }
        return account; 
    }

    // PRIVATE

    private static void evaluateDecision( SObjectAccessDecision decision ) {
        Map<String,Set<String>> fieldLevelSecurityIssues = decision.getRemovedFields();
        // SECURITY: If there are a not readable fields throw FLS exception
        if( !fieldLevelSecurityIssues.isEmpty() ) {
            throw new AuraHandledException('ERROR: Insufficient Priviliges');
        }
    }
}
