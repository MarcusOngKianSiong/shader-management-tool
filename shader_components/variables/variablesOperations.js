const path = require('path');
const fs = require('fs').promises;


/* 
    Storage format:
        1. section,vertexType,qualifier,datatype,variable name

    Conditions:
        1. Names in a vertex cannot be the same
        2. There must be at least one variable
        
*/

class variableOperations{
    constructor(){
        
        this.variableStorageLocation = path.join(__dirname,"storage.txt");
        this.variableFormat = new RegExp("(.+) (.+) (.+);(.*)");
    }

    changeVariableStorageLocation(newLocation){
        this.variableStorageLocation = newLocation;
    }
    
    async #checkIfFunctionalityNameExist(functionalityName){
        const data = await this.getVariables();
        if(data[functionalityName] === undefined){
            throw new Error(`${functionalityName} functionality does not exist`);
        }
        return data;
    }
    formatRawVariablesIntoAcceptableFormat(str){
        const data = str.split('\n');
        return data;
    }
    #deconstructOneVariable(variableDeclaration){
        const obj = {};
        const replaced = variableDeclaration.replace(";"," ");
        const split = replaced.split(" ");
        obj["name"] = split[2];
        obj["qualifier"] = split[0];
        obj["dataType"] = split[1];
        return obj;
    }

    /**
     * @abstract Get all the variables from all storage, where variables are segmented by functionality name, and within them by shader type. 
     * @returns {object}
     */
    async getVariables(){
        /*  
            Expected output: {
                sectionName: {
                    vertex: {variableName: {qualifier: 'uniform', dataType: 'vec3}},
                    fragment: {...},
                }
            }

            NOTE: 
                1. There should be no duplicate of names within a shader. -> When adding variables, check for that.

        */
        const data = await fs.readFile(this.variableStorageLocation,'utf8');
        const split = data.split('\n');
        const length = split.length;
        const reformatting = {};
        for(let i = 0 ; i < length ; i++){
            const currentVariable = split[i].split(",");
            if(reformatting[currentVariable[0]] === undefined){
                reformatting[currentVariable[0]] = {
                    vertex: {},
                    fragment: {}
                }
            }
            if(currentVariable[1] === "vertex"){
                reformatting[currentVariable[0]].vertex[currentVariable[4]] = {qualifier: currentVariable[2], dataType: currentVariable[3]};
            }
            if(currentVariable[1] === "fragment"){
                reformatting[currentVariable[0]].fragment[currentVariable[4]] = {qualifier: currentVariable[2], dataType: currentVariable[3]};
            }
        }
        return reformatting;
    }
    
    /**
     * @abstract checks if the variables are in "[qualifer] [dataType] [variable name];" format. 
     * @param {string || array} variable 
     * @param {"one" || "bulk"} oneOrBulk 
     * @returns true
     */
    #checkVariableInputFormat(variable, oneOrBulk="one"){
        if(oneOrBulk === "one"){
            const outcome = this.variableFormat.exec(variable);
            if(!outcome){
                throw new Error("variable input format not acceptable");
            }
            const convertSemiColonToSpace = variable.replace(";"," ");
            const convertToArray = convertSemiColonToSpace.split(" ");
            const reconstructToString = convertToArray[0] + ',' + convertToArray[1] + ',' + convertToArray[2];
            
            return reconstructToString;
        }
        if(oneOrBulk === "bulk"){
            const length = variable.length;
            for(let i = 0;i<length;i++){
                const currentVariable = variable[i];
                if(this.variableFormat.exec(currentVariable) === false){
                    throw new Error(`"${currentVariable}" this variable definition is in a wrong format.`);
                }
            }
            return true;
        }
        throw new Error("Error in type of input")
    }

    /**
     * @abstract convert the standard object format that contains all variables from all functionalities into a comma separated string for storage.
     * @param {object} 
     * @returns {string}
     */
    /* EXPECTED DATA FORMAT: Input, Output
        input:
            {
                functionality1: {
                    vertex: {
                        varName: {
                            qualifier: "",
                            dataType: "", 
                        }
                    }
                }
            }
        output:
            functionalityName,vertex,qualifier,dataType,variableName;
    */
    #reconstructToString(obj){
        let reconstructedString = ''
        for(const functionality in obj){
            for(const shaders in obj[functionality]){
                for(const shaderVariableName in obj[functionality][shaders]){
                    const qualifier = obj[functionality][shaders][shaderVariableName].qualifier;
                    const dataType = obj[functionality][shaders][shaderVariableName].dataType;
                    reconstructedString += functionality + ',' + shaders + ',' + qualifier + ',' + dataType + ',' + shaderVariableName + '\n';
                }
            }
        }
        return reconstructedString.slice(0,reconstructedString.length-1);
    }

    /**
     * @abstract Go through each variable in a object representing a single shader type and it back to the original shader program form.
     * @param {object} shader 
     * @returns 
     */
    /* EXPECTED DATA FORMAT: input, output, key data
        input:
            {
                variableName: {
                    qualifier: "",
                    dataType: ""
                },
            }
        output: 
            qualifier dataType variableName1;
            qualifier dataType variableName2;
        key:
            {
                qualifier: "something",
                dataType: "nothing"
            }
    */
    reconstructSingleShaderVariablesToOriginal(shader){
        let reconstructed = ''
        for (const name in shader){
            const qualifier = shader[name].qualifier;
            const dataType = shader[name].dataType;
            reconstructed += qualifier + ' ' + dataType + ' ' + name + ';\n';
        }
        return reconstructed.slice(0,reconstructed.length-1)
    }
    
    async getSpecificFunctionalityVariables(functionalityName){
        const data = await this.#checkIfFunctionalityNameExist(functionalityName);
        if(data[functionalityName] === undefined){
            throw new Error(`${functionalityName} section does not exist`)
        }
        return data[functionalityName];
    }

    async getSpecificFunctionalityShader(functionalityName,shader){
        const data = await this.#checkIfFunctionalityNameExist(functionalityName);
        if(shader === "vertex"){
            return data[functionalityName].vertex;
        }
        if(shader === "fragment"){
            return data[functionalityName].fragment;
        }
        throw new Error(`${shader} shader does not exist`);
    }
    
    async addOneVariable(functionName,shader,variable){
        
        const commaSeparatedString = this.#checkVariableInputFormat(variable);
        const appendFunctionalityNameAndShaderName = functionName + ',' + shader + ',' + commaSeparatedString;
        
        const split = appendFunctionalityNameAndShaderName.split(',');
        
        const formattedVariables = await this.#checkIfFunctionalityNameExist(functionName);
        
        formattedVariables[split[0]][split[1]][split[4]] = {qualifier: split[2], dataType: split[3]};
        const reconstructed = this.#reconstructToString(formattedVariables);
        
        fs.writeFile(this.variableStorageLocation,reconstructed,'utf8');
        return true;

    }

    async removeOneVariable(functionName,shader,variableName){
        const data = await this.#checkIfFunctionalityNameExist(functionName);
        if(data[functionName][shader][variableName] === undefined){
            throw new Error(`${variableName} variable does not exist in ${functionName} functionality ${shader} shader.`)
        }
        delete data[functionName][shader][variableName];
        await fs.writeFile(this.variableStorageLocation,this.#reconstructToString(data),'utf8');
        return true;
    }

    /**
     * @abstract Change a specific variable's attribute (variable name, qualifier, or data type)
     * @param {string} functionName 
     * @param {string} shader 
     * @param {string} name 
     * @param {string} component 
     * @param {string} change 
     * @returns 
     */
    async editFunctionalityShaderVariable(functionName,shader,name,component,change){
        // await varOps.editFunctionalityShaderVariable("functionality1","vertex","something","name","LALALA");
        if(component === "qualifier" || component === "name" || component === "dataType"){
            if(shader === "vertex" || shader === "fragment"){
                const data = await this.#checkIfFunctionalityNameExist(functionName);
                if(data[functionName][shader][name] === undefined){
                    throw new Error(`${name} variable name does not exist in ${shader} shader of ${functionName} functionality.`)
                }
                if(component === "qualifier"){
                    data[functionName][shader][name].qualifier = change;
                }
                if(component === "name"){
                    const temporary = data[functionName][shader][name];
                    delete data[functionName][shader][name];
                    data[functionName][shader][change] = temporary;
                }
                if(component === "dataType"){
                    data[functionName][shader][name].dataType = change;
                }
                const reconstructed = this.#reconstructToString(data);
                await fs.writeFile(this.variableStorageLocation,reconstructed,'utf8');
                return true;
            }else{
                throw new Error(`${shader} shader does not exist.`);
            }
        }else{
            throw new Error(`${component} variable component does not exist`);
        }
    }

    /**
     * @abstract Takes raw vertex and fragment variable strings (grouped) and replace the existing ones. 
     * @param {string} functionality 
     * @param {string} vertex 
     * @param {string} fragment 
     * @returns {boolean} 
     */
    /* EXPECTED DATA FORMAT: input, output
        input: vertex
            something nothing hello;
            hi bye saySoemthing;
        input: fragment
            something nothing hello;
            hi bye saySoemthing;
    */
    async editMultipleFunctionalityVariables(functionality,vertex,fragment){
        const data = await this.getVariables();
        const grouped = {
            vertex: vertex.split('\n'),
            fragment: fragment.split('\n')
        }
        const reFormatted = {vertex: {}, fragment: {}}
        for(const shader in grouped){
            const length = grouped[shader].length;
            for(let i = 0;i<length;i++){
                const currentVariableReformatted = this.#deconstructOneVariable(grouped[shader][i]);
                reFormatted[shader][currentVariableReformatted.name] = {
                    qualifier: currentVariableReformatted.qualifier,
                    dataType: currentVariableReformatted.dataType
                }   
            }
        }
        data[functionality] = reFormatted;
        const final = this.#reconstructToString(data);
        fs.writeFile(this.variableStorageLocation,final,'utf8');
        return true;
    }


    /**
     * @abstract change a specific functionality name
     * @param {string} oldFuncName 
     * @param {string} newFuncName 
     * @returns {boolean}
     */
    /*

    */
    async changeFunctionalityName(oldFuncName, newFuncName){
        const data = await this.#checkIfFunctionalityNameExist(oldFuncName);
        const temporary = data[oldFuncName];
        delete data[oldFuncName];
        data[newFuncName] = temporary;
        const final = this.#reconstructToString(data);
        await fs.writeFile(this.variableStorageLocation,final,'utf8');
        return true;
    }

    async createNewFunctionality(functionalityName,vertexVariables,fragmentVariables){
        // await varOps.createNewFunctionality
        // ("NEWFUNC",["something nothing lala;"],["hello nothing blabla;"]);

        const storage = {};
        if(vertexVariables.length < 1 || fragmentVariables.length < 1){
            throw new Error("vertex or fragment variable array is empty");
        }

        this.#checkVariableInputFormat(vertexVariables,"bulk");
        this.#checkVariableInputFormat(fragmentVariables,"bulk");
        
        storage["vertex"] = {}
        const vertexLength = vertexVariables.length;
        for(let i = 0;i<vertexLength;i++){
            const singleShaderVariable = this.#deconstructOneVariable(vertexVariables[i]);
            
            storage.vertex[singleShaderVariable.name] = {qualifier: singleShaderVariable.qualifier, dataType: singleShaderVariable.dataType};
        }
        
        storage["fragment"] = {}
        const fragmentLength = fragmentVariables.length;
        for(let i = 0;i<fragmentLength;i++){
            const singleShaderVariable = this.#deconstructOneVariable(fragmentVariables[i]);
            
            storage.fragment[singleShaderVariable.name] = {qualifier: singleShaderVariable.qualifier, dataType: singleShaderVariable.dataType};
        }
        
        const reconstructSetup = {}
        reconstructSetup[functionalityName] = storage;

        const reconstructed = this.#reconstructToString(reconstructSetup);
        
        await fs.appendFile(this.variableStorageLocation,"\n"+reconstructed,'utf8');
        return true; 
    }

    async removeFunctionality(functionalityName){
        const data = await this.#checkIfFunctionalityNameExist(functionalityName);
        delete data[functionalityName];
        
        const reconstructed = this.#reconstructToString(data);
        await fs.writeFile(this.variableStorageLocation,reconstructed,'utf8');
        return true;
    }
    
}

module.exports = {
    variableOperations
}