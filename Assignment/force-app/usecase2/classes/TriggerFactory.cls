/**
 * Class TriggerFactory
 *
 * Used to instantiate and execute Trigger Handlers associated with sObjects.
 */
public with sharing class TriggerFactory
{
    /**
     * Public static method to create and execute a trigger handler
     *
     * Arguments:   Type t - Type of handler to instatiate
     *
     * Throws a TriggerException if no handler has been found.
     */
    public static void createAndExecuteHandler(Type t)
    {
         // Get a handler appropriate to the object being processed
        ITrigger handler = getHandler(t);
         
        // Make sure we have a handler registered, new handlers must be registered in the getHandler method.
        if (handler == null)
        {
            throw new TriggerException('No Trigger Handler found named: ' + t.getName());
        }
         
        // Execute the handler to fulfil the trigger
        execute(handler);
    }
 
    /**
     * private static method to control the execution of the handler
     *
     * Arguments:   ITrigger handler - A Trigger Handler to execute
     */
    private static void execute(ITrigger handler) {
        // Before Trigger
        if (Trigger.isBefore) {
            handler.bulkBefore();
            if (Trigger.isInsert) {
                for (SObject so : Trigger.new){
                    handler.beforeInsert(so);
                }
            }
            // Iterate through the records to be updated passing them to the handler.
            else if (Trigger.isUpdate) {
                for (SObject so : Trigger.old) {
                    handler.beforeUpdate(so, Trigger.newMap.get(so.Id));
                }
            }
        }
        else { 
            handler.bulkAfter();           
            // Iterate through the records inserted passing them to the handler.
            if (Trigger.isInsert) {
                for (SObject so : Trigger.new) {
                    handler.afterInsert(so);
                }
            }
            // Iterate through the records updated passing them to the handler.
            else if (Trigger.isUpdate) {
                for (SObject so : Trigger.old){
                    handler.afterUpdate(so, Trigger.newMap.get(so.Id));
                }
            }
        }
 
        // Perform any post processing
        handler.andFinally();
    }
 
    private static ITrigger getHandler(Type t) {
        // Instantiate the type
        Object o = t.newInstance();
 
        // if its not an instance of ITrigger return null
        if (!(o instanceOf ITrigger)) {
            return null;
        }
 
        return (ITrigger)o;
    }
 
    public class TriggerException extends Exception {}
}