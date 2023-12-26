const {
    newFunctionalityInterfaceInstance,
    newShaderOperationsInterfaceInstance,
    newVariableOperationsInstance
} = require('../shader_components/shader_components.js')

class APIOperations{

    constructor(){
        // console.log(newFunctionalityInterfaceInstance())
        this.functionalityInterface = newFunctionalityInterfaceInstance();
        this.shaderOperationsInterface = newShaderOperationsInterfaceInstance();
        this.variableOperationsInterface = newVariableOperationsInstance();
        // console.log(this.functionalityInterface)
    }

    
    changeDataLocation(functionality,shaderOperation,variables){
        this.functionalityInterface.changeFileLocation(functionality);
        this.shaderOperationsInterface.changeStorageLocation(functionality,shaderOperation);
        this.variableOperationsInterface.changeVariableStorageLocation(variables);
    }
    

    async #getFunctionalities(){
        return await this.functionalityInterface.getFunctionalityNames();
    }
    

    async #getShaderOperations(){
        return await this.shaderOperationsInterface.getSectionDetails();
        
    }

    async #getShaderVariables(){
        return await this.variableOperationsInterface.getVariables();
    }

    async #turnVariableNameSplitFormatIntoString(variables){
        // Should the variableOperations handle the conversion of the formatted data into the original form?
        // Well, it does handle the deconstruction of the original form. Why not handle the reconstruction?
        return await this.variableOperationsInterface.reconstructSingleShaderVariablesToOriginal(variables);
    }
    
    async #joinSingleVariableAndShader(variable, shaderOperations){
        
        /*
            Assumption:
                - The return value is pure without any specifiers (e.g. //--vertex--//)
                - Shaders format come in this form: {
                    functionalityName: {
                        vertex: {
                            variableName: {
                                qualifier: "",
                                dataType: ""
                            }
                        },
                        fragment: {
                            variableName: {
                                qualifier: "",
                                dataType: ""
                            }
                        }
                    }
                }
        */

        const combined = {
            vertex: "",
            fragment: "",
            variables: {}
        }

        // Step 1: Reformat the variables into raw GLSL variable definitions
        const reformatVariables = {
            vertex: "",
            fragment: ""
        }
        reformatVariables.vertex = await this.#turnVariableNameSplitFormatIntoString(variable.vertex);
        reformatVariables.fragment = await this.#turnVariableNameSplitFormatIntoString(variable.fragment);
        
        // Step 2: Combine operations and variables
        combined.vertex = reformatVariables.vertex + '\n' + shaderOperations.vertex;
        combined.fragment = reformatVariables.fragment + '\n' + shaderOperations.fragment;
        
        /* 

            Create a new key value pair that focuses on variables where the keys are the qualifiers, 
            and in each of them, there is an array of names. 

            What do I need to watch out for?
            1. Repeats

            What are the steps?
                1. Create a new object that combines the vertex and fragment variables
                2. Loop throught every single item in the new object
                    2.1. Does the qualifier exist in the new format object?
                        2.1.1. If no
                            1. Create the new key using the qualifier name
                            2. Add an array to the key
                    2.2. Does the name exist in the array for that key qualifier?
                            2.2.1. If yes 
                                1. Continue
                    2.3. Add the name to the array
                        
        */ 

        // Step 3: Create a key value pair for variables that comes in the form of this -> qualifier: [variableName]
        const joinBothVertexVariables = Object.assign({},variable.vertex,variable.fragment);
        // console.log("THIS THIS THIS: ",joinBothVertexVariables)
        for(const variableName in joinBothVertexVariables){
            const varQualifier = joinBothVertexVariables[variableName].qualifier;
            if(combined.variables[varQualifier] === undefined){
                combined.variables[varQualifier] = [];
            }
            const doesArrayContainVariableName = combined.variables[varQualifier].includes(variableName);
            if(doesArrayContainVariableName){
                continue;
            }
            combined.variables[varQualifier].push(variableName);
        }
        
        return combined;

    }

    async constructShaderPrograms(){

        /* 
            Assumptions:
                1. The names of the functionalities in operations and variables and functionality should be the same. 

            Queries:
                - What format will the names be?
                
        */

        const functionalities = await this.#getFunctionalities();
        const operations = await this.#getShaderOperations();
        const variables = await this.#getShaderVariables();

        // combine shader variables to their respective shader types:
        const formatted = {}
        const length = functionalities.length;
        for(let i = 0;i<length;i++){
            const currentFunctionality = functionalities[i];
            const currentOperations = operations[currentFunctionality];
            const currentVariables = variables[currentFunctionality];
            const objectReShuffled = await this.#joinSingleVariableAndShader(currentVariables,currentOperations);
            formatted[currentFunctionality] = objectReShuffled;
        }

        // Construct this:
        /* 
        
            format: 
                "variables": {
                    attribute: ["a_position"],
                    uniform: ["default_color","grid_color","number_of_rows","number_of_columns","shape_width","shape_height"],
                }

            Why in this particular format?
                If I recall, different variable qualifiers have a different set of methods for connecting javascript object to shader variables in the GPU
                By specifying the qualifier type, I can do bulk connection. 

        */
        
        return formatted;

    }
}


module.exports = {
    APIOperations
}