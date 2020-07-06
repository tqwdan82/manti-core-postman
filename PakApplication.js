const fs = require('fs')
const path = require('path')
require('dotenv').config();
const emailReceiver = require('./util/EmailReceiver.js');

const pakDetails = {
    "AI_Enabled": false,
    "VI_Enabled": false,
    "WI_Enabled": false,
    "DBI_Enabled": false,
    "pakCode":"MCP_EMAIL_0_0_1",
    "Name":"Manti-core Postman Package",
    "Description": "This is an email module",
    "WebContext": "postman",
    "AppName": "postman"
}

const init = function(dbMgr, svcMgr, webMgr){
    PakManager.dbMgr = dbMgr;
    PakManager.svcMgr = svcMgr;
    PakManager.webMgr = webMgr;
    let allAccessObj = { appresources: [ '*' ], dbresources: ['*'] };

    //look at all the package models and create them
    let modelsPath =  path.join(__dirname, 'Models');
    let allPromises = [];
    if (fs.existsSync(modelsPath)) //if the models directory exists
    {
        //get all models file name
        let modFileNames = fs.readdirSync(modelsPath);
        //iterate all models file name
        modFileNames.forEach(function(modFileName) {
            let modelFilePath = path.join(modelsPath, modFileName)
            allPromises.push(dbMgr.addModel(modelFilePath, modFileName));
        });
    }
    Promise.all(allPromises).then(function() {
        // all loaded
        let tokenCallback = function(response){

            let resData = response.data;
            let username, password, host, port;
            resData.forEach(rsData =>{
                if(rsData.key === 'user') username = rsData.value;
                if(rsData.key === 'password') password = rsData.value;
                if(rsData.key === 'host') host = rsData.value;
                if(rsData.key === 'port') port = rsData.value;
            });

            emailReceiver.stop();
            emailReceiver.init(
                {
                    username: username,//"summer.senger@ethereal.email",
                    password: password,//"e7pgSZAZshwvefRkVU",
                    host: host,//"imap.ethereal.email",
                    port: port, //993, // imap port
                    tls: true,
                    connTimeout: 10000, // Default by node-imap
                    authTimeout: 5000, // Default by node-imap,
                    handler:function(from, subject, content){
                        svcMgr.ServiceManager.broadcastApp("Email_Message",{
                            "from": from,
                            "subject": subject,
                            "content": content
                        });
                    }
                }
            );

        };
        
        let queryCriteria = {
            where:{
                "group": "IMAP",
            },
        };
        svcMgr.ServiceManager.callDBOperation.query('ConfigEmail', queryCriteria, tokenCallback, allAccessObj);

      }, function() {
        // one or more failed
        console.log("Cannot get the email servers configuration data.");
    });

    //look at all the services and operations
    let svcsPath =  path.join(__dirname, 'Services');
    if (fs.existsSync(svcsPath)) //if the services directory exists
    {
        //get all contexts
        let services = fs.readdirSync(svcsPath);
        //iterate all services
        services.forEach(function(service) {

            let svcDirPath = path.join(svcsPath, service)
            //read and iterate the service for all the operations
            let operations = fs.readdirSync(svcDirPath);
            //iterate all operations to slice the extention
            let returnOperations = [];
            operations.forEach(function(operation) {
                // console.log(svcDirPath, operation);
                var opName = operation.substring(0, operation.indexOf(".js"));
                returnOperations.push(opName);
            });

            //register the service and operations
            svcMgr.ServiceManager.registerPackageService(
                svcsPath,
                pakDetails.AppName,
                service,
                returnOperations
            );

        });
    }

    //look at all web app contexts
    let webAppContextsPath =  path.join(__dirname, 'WebApp', "views");
    //get all other scripts and css directories
    let scriptDirs = [];
    if (fs.existsSync(webAppContextsPath)) //if the web app directory exists
    {
        //get all contexts
        let contexts = fs.readdirSync(webAppContextsPath);
        //iterate all context to add scripts and css directoryu
        contexts.forEach(function(context) {
            scriptDirs.push(path.join(webAppContextsPath, context,"main","script"));
            // scriptDirs.push(path.join(webAppContextsPath, context,"main","css"));
            //scriptDirs.push(path.join(webAppContextsPath, context,"pages"));
        });
    }

    //register the view with the platform
    PakManager.webMgr.registerView({
        contextPath: pakDetails.WebContext,
        directory: webAppContextsPath,
        miscellaneous: scriptDirs
    });
}

const PakManager = {
    init:init,
    pakDetails:pakDetails
};

module.exports = PakManager;