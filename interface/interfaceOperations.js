const {

        newFunctionalityInterfaceInstance,
        newShaderOperationsInterfaceInstance,
        newVariableOperationsInstance
    
} = require('../shader_components/shader_components.js')
const fs = require('fs').promises
const path = require('path')
const {spawnSync,spawn,exec} = require('node:child_process');
const readline = require('readline');

/*
    What are the features here?
    1. Setup 
        1. Setup the new file
        2. Setup the edit file
    2. Upload 
        1. Upload the new file
        2. Upload the edit file
    

    How do you set up the file?
        There are two components:
            1. The indicators
            2. The contents
                - Only for edit

    What are some limitations:
        1. Number of functionality displayed: There should only be one functionality specified in the file. 
            - Indicated by the number of grouped indicators. If there are more, then remove it. 
        2. 
*/


/**
 * @abstract Extract the contents from the interface file, perform the necessary checks, perform operations using shader component tools, and finally, store the data in shader components
 * @note
 *      - All this operation does is extract and format the data from the interface files for processing by other app components later. 
 * @class interfaceOperations
 * */
class interfaceOperations{

    constructor(){
        this.operationsInterface = newFunctionalityInterfaceInstance();
        this.functionalityInterface = newShaderOperationsInterfaceInstance();
        this.variablesInterface = newVariableOperationsInstance();
        this.newInterfaceLocation = path.join(__dirname,"interfaces","new_functionality.txt");
        this.editInterfaceLocation = path.join(__dirname,"interfaces","edit_functionality.txt");
        this.SectionIndication = {
            functionality: "//---FUNCTIONALITY---//",
            vertex: "//---VERTEX: {}---//",
            fragment: "//---FRAGMENT: {}---//"
        }
    }
    
    /**
     * @abstract change the interface by which you write your shader programs
     * @param {*} theNew        The path of the file where you write new shader programs.
     * @param {*} theEdit       The path of the file where you implement your modification to existing shader programs.
     * @memberof interfaceOperations
     */
    changeInterfaceLocation(theNew,theEdit){
        this.newInterfaceLocation = theNew;
        this.editInterfaceLocation = theEdit;
    }
    
    /**
     * @abstract Create the string that represents the framework in which you write or edit your shader programs
     * @notes 
     *      1. The framework: Actual specifications within the interface files that specifies the section of a shader program (e.g. vertex variables, vertex operations, fragment variables, fragment operations)
     * @param {*} functionalityName 
     * @returns 
     */
    #createFileContentStructure(functionalityName,vertexVar=null,vertexOps=null,fragmentVar=null,fragmentOps=null){
        const functionalitySection = this.SectionIndication.functionality;
        const vertexVariables = this.SectionIndication.vertex.replace("{}","variables");
        const fragmentVariables = this.SectionIndication.fragment.replace("{}","variables");
        const vertexOperations = this.SectionIndication.vertex.replace("{}","operations");
        const fragmentOperations = this.SectionIndication.fragment.replace("{}","operations");
        const spacing = '\n\n';
        let structure = '';
        if(vertexVar === null || vertexOps === null || fragmentVar === null || fragmentOps === null){
            structure = functionalitySection + '\n' + functionalityName + '\n' + functionalitySection + spacing;
            structure += vertexVariables + '\n' + "Write your vertex shader variables here..." + '\n' + vertexVariables + spacing;
            structure += vertexOperations + '\n' + "Write your vertex shader operations here..." + '\n' + vertexOperations + spacing;
            structure += fragmentVariables + '\n' + "Write your fragment shader variables here..." + '\n' + fragmentVariables + spacing;
            structure += fragmentOperations + '\n' + "Write your fragment shader operations here..." + '\n' + fragmentOperations + spacing;
            return structure;
        }else{
            structure = functionalitySection + '\n' + functionalityName + '\n' + functionalitySection + spacing;
            structure += vertexVariables + '\n' + vertexVar + '\n' + vertexVariables + spacing;
            structure += vertexOperations + '\n' + vertexOps + '\n' + vertexOperations + spacing;
            structure += fragmentVariables + '\n' + fragmentVar + '\n' + fragmentVariables + spacing;
            structure += fragmentOperations + '\n' + fragmentOps + '\n' + fragmentOperations + spacing;
            return structure;
        }
        
    }
    
    async #getShaderProgramDetails(name){
        const operations = await this.functionalityInterface.getSpecificSectionDetails(name);
        const variables = await this.variablesInterface.getSpecificFunctionalityVariables(name);
        return {operations: operations, variables, variables};
    }

    /** 
     * @abstract Get the data from the interface file, and separate the contents according to the sections laid out. 
     * @notes
     *      - How can you be sure you will segment correctly: There is a step in the code that finds the indexes of the section indications and analyse to see if there is any overlap or more or less than two section indication.
     *      - Are the return components (e.g. vertex variables) all in string format?: Yes.
     * @param {string} data 
     * @returns {obj} 
     */
     /* EXAMPLE DATA FORMAT: input, output
        Expected input: "..."
        Expected output: (CORE CONTENTS ARE IN STRING FORMAT)
        {
            functionality '';
            vertex: {
                variables: ``
                operations: `` 
            }
            fragment: {
                variables: ``
                operations: ``
            }
        }
    */
    #splitRawInterfaceContentIntoShaderSections(data){
        const functionalitySection = this.SectionIndication.functionality;
        const vertexVariables = this.SectionIndication.vertex.replace("{}","variables");
        const fragmentVariables = this.SectionIndication.fragment.replace("{}","variables");
        const vertexOperations = this.SectionIndication.vertex.replace("{}","operations");
        const fragmentOperations = this.SectionIndication.fragment.replace("{}","operations");
        const outcome = {
            functionality: '',
            vertex: {
                variables: ``,
                operations: `` 
            },
            fragment: {
                variables: ``,
                operations: ``
            }
        }
        
        const split = data.split('\n'); 
        const length = split.length;

        // STEP: Identify and store the indexes of the section indications
        const indexes = {
            functionality: {start: -1, end: -1},
            vertexVariable: {start: -1, end: -1},
            fragmentVariable: {start: -1, end: -1},
            vertexOperations: {start: -1, end: -1},
            fragmentOperations: {start: -1, end: -1},
        }
        for(let i = 0;i < length;i++){
            const currentLine = split[i];
            if(currentLine === functionalitySection){
                if(indexes.functionality.start === -1 && indexes.functionality.end === -1){
                    indexes.functionality.start = i;
                    continue;
                }
                if(indexes.functionality.start !== -1 && indexes.functionality.end === -1){
                    indexes.functionality.end = i;
                    continue;
                }
                throw new Error("More than 3 functionality section specification when there should only be two.");
            }
            if(currentLine === vertexVariables){
                if(indexes.vertexVariable.start === -1 && indexes.vertexVariable.end === -1){
                    indexes.vertexVariable.start = i;
                    continue;
                }
                if(indexes.vertexVariable.start !== -1 && indexes.vertexVariable.end === -1){
                    indexes.vertexVariable.end = i;
                    continue;
                }
                throw new Error("More than 3 vertexVariable section specification when there should only be two.");
            }
            if(currentLine === vertexOperations){
                if(indexes.vertexOperations.start === -1 && indexes.vertexOperations.end === -1){
                    indexes.vertexOperations.start = i;
                    continue;
                }
                if(indexes.vertexOperations.start !== -1 && indexes.vertexOperations.end === -1){
                    indexes.vertexOperations.end = i;
                    continue;
                }
                throw new Error("More than 3 vertexOperation section specification when there should only be two.");
            }
            if(currentLine === fragmentVariables){
                if(indexes.fragmentVariable.start === -1 && indexes.fragmentVariable.end === -1){
                    indexes.fragmentVariable.start = i;
                    continue;
                }
                if(indexes.fragmentVariable.start !== -1 && indexes.fragmentVariable.end === -1){
                    indexes.fragmentVariable.end = i;
                    continue;
                }
                throw new Error("More than 3 fragmentVariable section specification when there should only be two.");
            }
            if(currentLine === fragmentOperations){
                if(indexes.fragmentOperations.start === -1 && indexes.fragmentOperations.end === -1){
                    indexes.fragmentOperations.start = i;
                    continue;
                }
                if(indexes.fragmentOperations.start !== -1 && indexes.fragmentOperations.end === -1){
                    indexes.fragmentOperations.end = i;
                    continue;
                }
                throw new Error("More than 3 fragmentOperation section specification when there should only be two.");
            }
        }
        
        /* 
            STEP: Check the indexes for the following conditions: 
                1. No overlapping: A start or end of one section cannot be in-between another section's start and end;
                2. Must have two in existence: Both cannot be -1;
                3. Cannot be empty: 
                    - 3.1. If the section indexes are one value apart from one another (e.g. 8 and 9);
                    - 3.2. If the section contents are blank. 
        */
        for(const sectionName in indexes){
                const current = indexes[sectionName];
                if(current.start === -1 || current.end === -1){
                    throw new Error(`${sectionName} must only have two found within the interface.`);
                }
                if(current.start+1 === current.end){
                    throw new Error(`${sectionName} section is empty`)
                }
                for(const secName in indexes){
                    if(secName === sectionName){
                        continue;
                    }
                    const checkAgainst = indexes[secName];
                    if(current.start > checkAgainst.start && current.start < checkAgainst.end){
                        throw new Error(`${sectionName} section is overlapping with ${secName} section.`);
                    }
                    if(current.end > checkAgainst.start && current.end < checkAgainst.end){
                        throw new Error(`${sectionName} section is overlapping with ${secName} section.`);
                    }
                }
                for(let i = current.start+1;i<current.end;i++){
                    const cur = split[i];
                    
                    if(/[a-zA-Z0-9{}]/.exec(cur) === null){
                        throw new Error(`${sectionName} section is empty`)
                    }
                }
        }

        // extract the sections into the object using (indexes) and store it in (outcome);
        for(const section in indexes){
            const current = split.slice(indexes[section].start+1, indexes[section].end);
            const toString = current.join('\n');
            if(section === "functionality"){
                outcome.functionality = toString;
                continue;
            }
            if(section === "vertexVariable"){
                outcome.vertex.variables = toString;
                continue;
            }
            if(section === "vertexOperations"){
                outcome.vertex.operations = toString;
                continue;
            }
            if(section === "fragmentVariable"){
                outcome.fragment.variables = toString;
                continue;
            }
            if(section === "fragmentOperations"){
                outcome.fragment.operations = toString;
                continue;
            }
        }
        return outcome;
    }

    /**
     * @abstract Check if an interface file is empty or not.
     * @param {string} type  Check if either new.txt or edit.txt is empty (by default)
     * @returns {boolean} {[]} Either a false or the contents of a file, split by new line.
     */
    async isFileEmpty(type){
        let data = null;
        if(type === "new"){
            data = await fs.readFile(this.newInterfaceLocation,'utf8');
        }else if(type === "edit"){
            data = await fs.readFile(this.editInterfaceLocation,'utf8');
        }else{
            throw new Error(`${type} type does not exist.`);
        }
        if(/[a-bA-B0-9]/.exec(data) === null){
            return false
        }else{
            return data;
        }
    }
    
    /**
     * @abstract Sends a message to the console and waits for a user input.
     * @param {string} message 
     * @returns {string} User input
     */
    async askInputFromUser(message){
        return new Promise((resolve)=>{
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
              });

              rl.question(message, (answer) => {
                rl.close();
                resolve(answer);
              });
        })
    }
    
    /**
     * @abstract Set up the interface files (new, edit) with the correct structure for proper storage through proper segmentation. 
     *
     * @param {*} type                  What interface file do you want to use?
     * @param {*} functionalityName     What is the name of the functionality?
     * @return {*} 
     * @memberof interfaceOperations
     */
    async setup(type,functionalityName){
        // throw new Error("SOMETHING ")
        if(functionalityName === undefined || functionalityName === ""){
            throw new Error("\n\nNo functionality name specified for interface\n\n");
        }
        if(await this.isFileEmpty(type) !== true){
            // Ask if you are sure you want to get it.
            const message = type === "new" ?  "Do you want to override file content for new interface file? (Y/N)" : "Do you want to override file content for edit interface file?";
            const result = await this.askInputFromUser(message);
            if(result[0] === "n" || result[0] === "N"){
                console.log(`\n\nSetup operation on ${type} terminated. \n\nShowing current file state....\n\n`);
                return false;
            }
            if(result[0] !== "y" && result[0] !== "Y"){
                console.log(`Error. Input is not recognizable: ${result}`);
                return false;
            }
        }
        if(type === "new"){
            await fs.writeFile(this.newInterfaceLocation, this.#createFileContentStructure(functionalityName),'utf8');
            console.log(`\n\nnew interface reset complete. \n\nShow resetted new interface state....\n\n`);
        }
        if(type === "edit"){
            const shaderProgram = await this.#getShaderProgramDetails(functionalityName);
            const vertexOperation = shaderProgram.operations.vertex;
            const fragmentOperation = shaderProgram.operations.fragment;
            const vertexVariables = this.variablesInterface.reconstructSingleShaderVariablesToOriginal(shaderProgram.variables.vertex);
            const fragmentVariables = this.variablesInterface.reconstructSingleShaderVariablesToOriginal(shaderProgram.variables.fragment);
            await fs.writeFile(this.editInterfaceLocation, this.#createFileContentStructure(functionalityName,vertexVariables,vertexOperation,fragmentVariables,fragmentOperation),'utf8');
            await this.#storeFunctionalityName(functionalityName);
            console.log("\n\nedit interface reset complete. \n\nShow resetted edit interface state....\n\n");
        }
    }

    /**
     * @abstract Get the data from the inteface file and split the contents into an object of key representing shader program components. 
     * @note
     *      - The operation is a combination of other methods within this class.
     *      - Return value: the key called previousFunctionalityName, only exist if the parameter is of type "edit".
     * @param {string} type State the interface file you want to extract the shader program from. 
     * @returns {obj} An object with keys as the components of a shader program. 
     */
     /* EXAMPLE DATA FORMAT: output
        {
            previousFunctionalityName: ""
            functionality: '',
            vertex: {
                variables: ``,
                operations: `` 
            },
            fragment: {
                variables: ``,
                operations: ``
            }
        }
     */
    async extractDataFromInterface(type){
        
        /*

            Is file empty?

            Is content indication correct?
                - this.#splitRawInterfaceContentIntoShaderSections(data);        

            Is content format correct?
                - variables
                    - three components, 
                    - separated by a space, and 
                    - ends with semicolon.
                - operations
                    - encapsulated in void main(){} (first and last line of the operations section.)
                
        */
        
        const data = await this.isFileEmpty(type);
        
        if(!data){
            throw new Error(`${type} interface is empty.`);
        }
        
        const shaderSectionObject = this.#splitRawInterfaceContentIntoShaderSections(data);
        if(type === "edit"){
            const previousFunctionalityName = await this.#retrieveFunctionalityName();
            
            shaderSectionObject["previousFunctionalityName"] = previousFunctionalityName
        }
        return shaderSectionObject;
        
    }

    /* 

            WHAT ELSE MUST I DO TO GET IT READY FOR STORAGE?
                What must I impact?
                    - Functionality
                    - shader operations
                    - shader variables
                What functions must be affected?
                    - Setup everything properly. 
            
    */

    /**
     * @abstract Opens up an interface text file in nano text editor
     * @param {string} type                 Interface type
     * @param {string} [editor="nano"]      Editor to open the interface in (only nano for now.)
     * @memberof interfaceOperations
     */
    async openInterfaceFile(type,locate,editor="nano"){
        const components = locate.split('/');
        
        if(type === "new"){
            if(components[components.length-1] !== "new_functionality.txt"){
                throw new Error("File at the end of path is not new_functionality.txt");
            }
            if(editor === "nano"){
                const outcome = spawnSync("nano",[locate],{
                    stdio: 'inherit',
                    // detached: true
                })
            }
        }else if(type === "edit"){
            if(components[components.length-1] !== "edit_functionality.txt"){
                throw new Error("File at the end of path is not edit_functionality.txt");
            }
            if(editor === "nano"){
                const outcome = spawnSync("nano",[locate],{
                    stdio: 'inherit',
                })
            }
        }else{
            throw new Error(`${type} interface does not exist.`)
        }
    }

    /**
     * 
     * @param {string} name 
     * @returns 
     */
    async #storeFunctionalityName(name){
        if(/[a-zA-Z]/.exec(name) === null){
            throw new Error("Name parameter is either empty or not a string");
        }
        await fs.writeFile('./temporaryMemory.txt',name,'utf8');
        return true;
    }
    async #retrieveFunctionalityName(){
        const name = await fs.readFile('./temporaryMemory.txt','utf8');
        await fs.writeFile('./temporaryMemory.txt',"",'utf8');
        return name;
    }

}



module.exports = {interfaceOperations}


