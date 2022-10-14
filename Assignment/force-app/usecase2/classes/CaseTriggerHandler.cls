public with sharing class CaseTriggerHandler implements ITrigger{

    public void bulkBefore(){
       // Nothing to do
    }
 
    public void bulkAfter(){
        if(Trigger.isInsert || Trigger.isUpdate) {
            CalculateCaseRateAverage.groupAverageRates(Trigger.newMap);
        }
    }

    public void beforeInsert(SObject so) {
        // Nothing to do
    }

    public void beforeUpdate(SObject oldSo, SObject so) {
         // Nothing to do
    }

    public void afterInsert(SObject so) {
        CalculateCaseRateAverage.execute(null, (Case)so);
    }

    public void afterUpdate(SObject oldSo, SObject so) {
        CalculateCaseRateAverage.execute((Case)oldSo, (Case)so);
    }
    public void andFinally() {
        if(Trigger.isAfter) {
            CalculateCaseRateAverage.register();
        }
    }
}
