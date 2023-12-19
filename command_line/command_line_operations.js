const {
    newFunctionalityInterfaceInstance,
    newShaderOperationsInterfaceInstance,
    newVariableOperationsInstance
} = require('../shader_components/shader_components.js')
const {
    interfaceOperations
} = require('../interface/interface.js');
const childProcess = require('child_process')
/**
 * @Purpose Operations to edit, delete, or add shader programs (functionalities)
 * @abstract All functionalities required to display certain details about specific functionalities
 * @note
 *      - What components does this class rely on?: interface, shader components
 * @class commandLineInterface
 */
class commandLineInterface{

    constructor(){
        this.variableInterface = newVariableOperationsInstance();
        this.operationsInterface = newShaderOperationsInterfaceInstance();
        this.functionalityInterface = newFunctionalityInterfaceInstance();
        this.writingShaderPrograms = new interfaceOperations()
    } 

    changeDataLocation(functionality,shaderOperation,variables){
        this.functionalityInterface.changeFileLocation(functionality);
        this.operationsInterface.changeStorageLocation(functionality,shaderOperation);
        this.variableInterface.changeVariableStorageLocation(variables);
    }

    

    async #getData(){
        const data = {
        }
        
        const variables = await this.variableInterface.getVariables();
        const functionalities = await this.functionalityInterface.getFunctionalityNames();
        const operations = await this.operationsInterface.getSectionDetails();
        
        const length = functionalities.length;
        for(let i = 0;i<length;i++){
            const currentFunctionality = functionalities[i];
            data[currentFunctionality] = {
                operations: operations[currentFunctionality],
                variables: variables[currentFunctionality]
            }
        }
        return data
    }

    async displayVariables(functionality=null){

        /* 
            Steps: 
                0. Create an empty object
                1. Get the data
                2. Check what is the value of functionality
                    2.1. if functionality is null
                        2.1.1. pass the entire object to them 
                    2.2. Check if functionality exist within data object
                        2.1.1. If no
                            2.1.1.1. Console.log("Functionality does not exist");
                        2.1.2. If yes
                            2.1.1.1. Create a new key value pair in the empty object
                                - Key: functionality name
                                - value: the value for the functionality name in data
                3. Go through each key (A functionality name) in the empty object
                    3.1. 


        */

        const data = await this.#getData()
        const emptyObj = {}

        // Display all
        if(functionality === null){
            // Go through every single functionality, extract the value in the variables key, and place it in the emptyObj. 
            for(const functionalityName in data){
                emptyObj[functionalityName] = data[functionalityName].variables;
            }
        }else if(data[functionality] === undefined){
            console.log(`${functionality} Functionality does not exist.`)
            return false;
        }else{
            emptyObj[functionality] = data[functionality].variables;
        }

        let final = '';
        console.log("");
        final += '\n';
        for(const functionalityName in emptyObj){
            console.log(`     ${functionalityName}`);
            final+=`    ${functionalityName}\n`;
            for(const shader in emptyObj[functionalityName]){
                console.log(`        ${shader}`)
                final+=`        ${shader}\n`
                for(const variableName in emptyObj[functionalityName][shader]){
                    const qualifier = emptyObj[functionalityName][shader][variableName].qualifier;
                    const dataType = emptyObj[functionalityName][shader][variableName].dataType;
                    console.log(`           ${qualifier} ${dataType} ${variableName}`);
                    final+=`            ${qualifier} ${dataType} ${variableName}\n`;
                }
            }
        }
        console.log("");
        return final;
    }
    
    async displayFunctionalityList(){
        
        const data = await this.functionalityInterface.getFunctionalityNames();
        const length = data.length;
        if(length === 0){
            console.log("\nNo functionality stored....\n")
            return "\nNo functionality stored....\n"
        }
        console.log("\n\n---List of functionalities---\n");
        for(let i = 0;i < length;i++){
            console.log(`${i+1}. ${data[i]}`);
        }
        console.log('\n\n');
        return data;
    }
    async displaySpecificFunctionality(functionality){
        try{
            const operations = await this.operationsInterface.getSpecificSectionDetails(functionality);
            const variables = await this.variableInterface.getSpecificFunctionalityVariables(functionality);
            const vertexVariablesStringFormat = this.variableInterface.reconstructSingleShaderVariablesToOriginal(variables.vertex);
            const fragmentVariablesStringFormat = this.variableInterface.reconstructSingleShaderVariablesToOriginal(variables.fragment);
            console.log(`\n\nFunctionality Name: ${functionality}\n\n`)
            console.log(vertexVariablesStringFormat);
            console.log('\n')
            console.log(operations.vertex);
            console.log('\n')
            console.log(fragmentVariablesStringFormat);
            console.log('\n')
            console.log(operations.fragment);
            console.log("\n\n")
            /*Expected output: {
                sectionName: {
                    vertex: {variableName: {qualifier: 'uniform', dataType: 'vec3}},
                    fragment: {...},
                }
            }*/
            return true;
        }catch(err){
            if(err.message === `${functionality} section does not exist.`){
                console.log(`\n"${functionality}" functionality does not exist.\n`);
            }
            return false;
        }
    }
    
    async deleteFunctionality(functionality){
        await this.operationsInterface.removeDetail(functionality);
        await this.variableInterface.removeFunctionality(functionality);
        await this.functionalityInterface.removeFunctionality(functionality);
        return true;
    }

    /**
     * @abstract Extracts data from either the new or edit interface file, and upload the contents onto the text files in the respective shader components.
     * @param {string} type Which interface do you want to upload
     * @returns 
     */
    async uploadInterfaceContent(type){
        let data = null;
        if(type === "new"){
            data = await this.writingShaderPrograms.extractDataFromInterface("new");
            // Formatted variables
            const vertexVariableFormatted = this.variableInterface.formatRawVariablesIntoAcceptableFormat(data.vertex.variables);
            const fragmentVariableFormatted = this.variableInterface.formatRawVariablesIntoAcceptableFormat(data.fragment.variables);
            // Insert functionality name into functionality component
            await this.functionalityInterface.insertNewFunctionality(data.functionality)
            // Insert functionality operation into operation component
            await this.operationsInterface.addNew(data.functionality,data.vertex.operations,data.fragment.operations);
            // Insert variables into variable component
            await this.variableInterface.createNewFunctionality(data.functionality,vertexVariableFormatted,fragmentVariableFormatted);
            return true;
        }
        if(type === "edit"){
            data = await this.writingShaderPrograms.extractDataFromInterface("edit");
            // Step 5: Check if the functionality name has changed
                if(data.functionality !== data.previousFunctionalityName){
                    // Step 5.1.: If functionality name changed, change the names of the functionalities in the various component text files. 
                    await this.functionalityInterface.renameFunctionality(data.previousFunctionalityName,functionality);    
                    await this.operationsInterface.modifySectionName(data.previousFunctionalityName,data.functionality);
                    await this.variableInterface.changeFunctionalityName(data.previousFunctionalityName,data.functionality);
                }
                
            // Step 6: Go through each component of the shaders to change the data
                await this.operationsInterface.editSpecificSectionDetail(data.functionality,"vertex",data.vertex.operations);
                await this.operationsInterface.editSpecificSectionDetail(data.functionality,"fragment",data.fragment.operations);
                // Step 7: Change the variables for the functionality
                await this.variableInterface.editMultipleFunctionalityVariables(data.functionality,data.vertex.variables,data.fragment.variables);
                return true
        }
        
        
    }

    async setupUploadInterface(type,name){
        if(name === undefined){
            console.log("\n\nNo functionality name defined. \n\n")
            return false;
        }
        if(type === "new"){
            if(await this.functionalityInterface.doesFunctionalityExist(name)){
                console.log(`\n\n"${name}" functionality already exist.`);
                return false;
            }
            await this.writingShaderPrograms.setup("new",name);
            return true;
            // I need to make javascript open up the new_functionality file in vscode.
        }
        if(type === "edit"){
            await this.writingShaderPrograms.setup("edit",name);
            return true;
        }
        throw new Error(`interface of type ${type} does not exist.`);
    }

    openInterfaceFile(type,locate){
        this.writingShaderPrograms.openInterfaceFile(type,locate);
    }

}


module.exports = {
    commandLineInterface
}