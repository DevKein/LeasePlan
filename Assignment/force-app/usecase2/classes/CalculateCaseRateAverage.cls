public with sharing class CalculateCaseRateAverage {
    public static void aggregateAccountCaseRateAverage(Id accountId) {
        checkPermissions();
        try {
            List<AggregateResult> ar = [SELECT Avg(Rate__c) avr FROM Case WHERE AccountId = '0011x00001fWw6QAAS' AND Rate__c != NULL];
            Integer avgRate = Integer.valueOf(ar[0].get('avr'));
            Account temp = new Account(
                Id = accountId,
                Average_Rate__c = avgRate
            );
            Database.update(temp);
        } catch(Exception ex) {
            throw new calculationException('Error: Couldn\'t calculate the case average. Msg: '+ ex.getMessage());
        }

    }

    // PRIVATE

    private static void checkPermissions() {
        if(!Schema.sObjectType.Case.isAccessible() && !Schema.sObjectType.Account.isUpdateable()) {
            throw new priviliageException('Error: Insufficient object level priviliges for Account/Case');
        }
        if(!Schema.sObjectType.Case.fields.Rate__c.isAccessible() && !Schema.sObjectType.Account.fields.Average_Rate__c.isAccessible()) {
            throw new priviliageException('Error: Insufficient field level priviliges for Account\'s Average Rate field or Case\'s Rate field');
        }
    }

    // INNER CLASSES

    public inherited sharing class calculationException extends Exception{}
    public inherited sharing class priviliageException extends Exception{}
}
