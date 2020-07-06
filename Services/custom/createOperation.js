const dbUtil = require('../../../../server/util/utilsDB');
const emailReceiver = require('../../util/EmailReceiver.js');

const validate = function(inputs){
    let table = inputs.modelDef;
    let data = inputs.inputData;

    let errorMessages = [];
    for( let key in table.rawAttributes ){
        let type = table.rawAttributes[key].type.key;


        if(!!dbUtil.validate[type]
            && (key !== 'createdAt' 
                && key !== 'updatedAt'
                && key !== 'deletedAt')){
            if(!dbUtil.validate[type](data[key]))
                errorMessages.push(key +" is a " + type + " type");
        }
        
    }
    return errorMessages;
};

const operation = {
    loadOperation: function(serviceManager, inputs, callback, mcHeader){

        let inputModelName = 'ConfigEmail';
        if(Array.isArray(inputs) && inputs.length > 0){

            let creates = [];
            let sendToCreate = true;
            inputs.forEach(input =>{
                let create = {
                    'model': inputModelName,
                    'data':input,
                    'type':'create'
                }
                creates.push(create);
            });
            if(!sendToCreate){
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
                serviceManager.callDBOperation.transact(creates, processCallback, mcHeader);
            }

        } else if(typeof inputs === 'object'){

            //perform update action
            let processCallback = function(data){
                callback(data);
            };
            serviceManager.callDBOperation.create(inputModelName, inputs, processCallback, mcHeader);

        }

        //let table = serviceManager.callDBOperation.getModel(inputModelName);
        //let errors = validate({'modelDef':table, 'inputData':inputs})

        //let processCallback = function(data){
        //    callback(data);
        //};

        //if(errors.length === 0)
        //    serviceManager.callDBOperation.create(inputModelName, inputs, processCallback, mcHeader);
    }
}
module.exports = operation;