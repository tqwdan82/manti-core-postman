const emailReceiver = require('../../util/EmailReceiver.js');

//private method to find out what is the primary key 
const getKeyName = function(inputs){ 
    let table = inputs.modelDef;

    let dataPrimarykey;
    for( let key in table.rawAttributes ){

        let attrData = table.rawAttributes[key];
        if(typeof attrData.primaryKey !== 'undefined'
            && attrData.primaryKey){
                dataPrimarykey = key;
                break;
        }        
    }
    return dataPrimarykey;
};

const operation = {
    loadOperation: function(serviceManager, inputs, callback, mcHeader){

        let inputModelName = 'ConfigEmail';
        let table = serviceManager.callDBOperation.getModel(inputModelName);

        if(Array.isArray(inputs) && inputs.length > 0){

            let updates = [];
            let sendForUpdate = true;
            inputs.forEach(input =>{
                let key = getKeyName({'modelDef':table, 'inputData':input})
                if(typeof key === 'undefined'){
                    sendForUpdate = false;
                }
                let update = {
                    'model': inputModelName,
                    'criteria':{
                        'where':{
                            id:input[key]
                        }
                    },
                    'data':input,
                    'type':'update'
                }
                updates.push(update);
            });
            if(!sendForUpdate){
                //return failure
                let returnData = {};
                returnData["status"] = "Fail";
                returnData["details"] = "One or more records do not have id/key provided";

                callback(returnData);
            }else{
                let processCallback = function(data){

                    let username, password, host, port;
                    inputs.forEach(input =>{
                        if(input.key === 'user') username = input.value;
                        if(input.key === 'password') password = input.value;
                        if(input.key === 'host') host = input.value;
                        if(input.key === 'port') port = input.value;
                    });
                    
                    emailReceiver.stop();
                    emailReceiver.init(
                        {
                            username: user,//"summer.senger@ethereal.email",
                            password: password,//"e7pgSZAZshwvefRkVU",
                            host: host,//"imap.ethereal.email",
                            port: port, //993, // imap port
                            tls: true,
                            connTimeout: 10000, // Default by node-imap
                            authTimeout: 5000, // Default by node-imap,
                        }
                    );

                    callback(data);
                };
                serviceManager.callDBOperation.transact(updates, processCallback, mcHeader);
            }

        } else if(typeof inputs === 'object'){

            let key = getKeyName({'modelDef':table, 'inputData':inputs})

            // check if input data has key
            if(typeof key === 'undefined'){ //does not have key

                //return failure
                let returnData = {};
                returnData["status"] = "Fail";
                returnData["details"] = "No id/key is provided";

                callback(returnData);

            }else{ // have key

                //perform update action
                let processCallback = function(data){
                    callback(data);
                };
                let query = {};
                query[key] = inputs[key];
                serviceManager.callDBOperation.update(inputModelName, query, inputs, processCallback, mcHeader);
            }
        }
        /*
        let key = getKeyName({'modelDef':table, 'inputData':inputs})

        // check if input data has key
        if(typeof key === 'undefined'){ //does not have key

            //return failure
            let returnData = {};
            returnData["status"] = "Fail";
            returnData["details"] = "No id/key is provided";

            callback(returnData);

        }else{ // have key

            //perform update action
            let processCallback = function(data){
                callback(data);
            };
            let query = {};
            query[key] = inputs[key];
            serviceManager.callDBOperation.update(inputModelName, query, inputs, processCallback, mcHeader);
        }
        */
    }
}
module.exports = operation;