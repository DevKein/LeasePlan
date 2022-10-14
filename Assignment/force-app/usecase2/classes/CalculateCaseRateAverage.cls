public with sharing class CalculateCaseRateAverage {
    public static Map<Id,AggregateResult> accountIdToAggregateResult = new Map<Id,AggregateResult>();    
    public static Map<Id,Account> accountsToUpdate = new Map<Id,Account>();

    public static void groupAverageRates(Map<Id,sObject> newMap) {
        checkPermissions();
        Set<Id> accountIds = new Set<Id>();
        for(Case c : (List<Case>)newMap.values()) {
            accountIds.add(c.AccountId);
        }
        // Aggregate queries supports up to 50k rows. If a customer has more than 50k cases below calculation can be moved to a batch class easily.
        List<AggregateResult> arList = new List<AggregateResult>([SELECT AccountId, Avg(Rate__c) avr 
                                                                    FROM Case 
                                                                    WHERE AccountId IN :accountIds 
                                                                        AND Rate__c != NULL 
                                                                    GROUP BY AccountId ]);                                                          
        for (AggregateResult ar : arList)  {
            accountIdToAggregateResult.put((Id)ar.get('AccountId'),ar);     
        }
    }
    public static void execute(Case oldCase, Case newCase) {
       try {
            // For update ignore if rate didn't change
            // For insert ignore if rate is empty
            if((oldCase != NULL && oldCase.Rate__c != newCase.Rate__c) || (oldCase == NULL && newCase.Rate__c != NULL)) {
                if(!accountsToUpdate.containsKey(newCase.AccountId) && accountIdToAggregateResult.containsKey(newCase.AccountId)){
                    Decimal avgRate = (Decimal)accountIdToAggregateResult.get(newCase.AccountId).get('avr');
                    if(avgRate != NULL){
                        Account tempAccount = new Account(
                            Id = newCase.AccountId,
                            Average_Rate__c = avgRate.round(System.RoundingMode.HALF_EVEN)
                        );
                        accountsToUpdate.put(newCase.AccountId,tempAccount);
                    }
                }
            }
        } catch(Exception ex) {
           throw new calculationException('Error: Couldn\'t calculate the case average. Msg: '+ ex.getMessage());
        }
    }

    public static void register() {
        try {
            Database.update(accountsToUpdate.values());
        } catch(Exception ex) {
            throw new calculationException('Error: Couldn\'t update case average calculations. Msg: '+ ex.getMessage());
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
