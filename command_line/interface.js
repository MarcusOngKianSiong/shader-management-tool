const {commandLineInterface} = require('./command_line_operations.js')

const CLInterface = new commandLineInterface()

module.exports = {CLInterface}

const consoleInput = process.argv;

/*
    Commands available
    1. `WebGL list`
    2. `WebGL edit ${functionality name}`
    3. `WebGL new ${functionality name}`
    4. `WebGL upload`
    5. `WebGL delete ${functionality name}`
    6. `WebGL view functionality`
*/

// DONE: Test to see if command intake works
if(consoleInput[2] === "test"){
    console.log("Hello fucking bob. ")
}

// DONE: List out all the various functionality that exist
if(consoleInput[2] === "list"){
        CLInterface.displayFunctionalityList();
}

// DONE: Delete a specific functionality
if(consoleInput[2] === `delete`){
    if(consoleInput[3] === ""){
        console.log("\n\nfunctionality to delete not specified\n\n");
    }else{
        CLInterface.deleteFunctionality(consoleInput[3]).then(res=>{
            console.log(`\n\n${consoleInput[3]} functionality deleted.\n\n`)
        }).catch(err=>{
            if(err.message === "functionality does not exist"){
                console.log(`\n\n${consoleInput[3]} functionality does not exist.\n\n`);
            }
        })
    }
}

// --- TO BE COMPLETED: REQUIRE INTERFACE COMPONENT --- //
// Set up the new interface
if(consoleInput[2] === `new`){
    CLInterface.setupUploadInterface("new",consoleInput[3]).then(res=>{
        CLInterface.openInterfaceFile("new",'../interface/interfaces/new_functionality.txt');
    }).catch(err=>{
        console.log(err.message);
    })
}

// setup edit interface for editing functionality
if(consoleInput[2] === `edit`){
    CLInterface.setupUploadInterface("edit",consoleInput[3]).then(res=>{
        CLInterface.openInterfaceFile("edit","../interface/interfaces/edit_functionality.txt");
    }).catch(err=>{
        console.log(err.message)
    })
}

// upload file contents from specified interface
if(consoleInput[2] === `upload`){
    if(consoleInput[3] === 'new'){
        CLInterface.uploadInterfaceContent("new").then(res=>{
            console.log('\n\n       Upload New Complete.\n\n');
        }).catch(err=>{
            console.log(`\n\n       Upload new Failed: ${err.message}\n\n`);
        })
    }else if(consoleInput[3] === 'edit'){
        CLInterface.uploadInterfaceContent("edit").then(res=>{
            console.log("\n\n       Edits implemented.\n\n");
        }).catch(err=>{
            console.log(`\n\n       Upload edit Failed: ${err.message}\n\n`);
        })
    }else{
        console.log(`${consoleInput[3]} interface does not exist`);
    }
}

// DONE: Display specific functionality details
if(consoleInput[2] === `view`){
    if(consoleInput[3] === undefined){
        console.log("functionality name not specified")
    }else{
        CLInterface.displaySpecificFunctionality(consoleInput[3]);
    }
}

if(consoleInput[2] === `help`){
    console.log(`

    --- Command list: ---
    1. WebGL list                           -> Display a list of functionality that exist in the data base
    2. WebGL edit [functionality name]      -> Set up the interface for editing a specific functionality
    3. WebGL new [functionality name]       -> Set up the interface for adding a new functionality
    4. WebGL upload [interface name]        -> Upload the contents of the interface file for storage
    5. WebGL delete [functionality name]    -> delete a specific functionality
    6. WebGL view [functionality name]      -> View the contents (variables) of a specific functionality
    
    `)
}