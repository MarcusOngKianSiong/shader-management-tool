const path = require('path');
const {CLInterface} = require('../interface.js')      // The formation of an instance is here.
const fs = require('fs').promises
const functionalityLocation = path.join(__dirname,"data","functionality.txt")
const variableLocation = path.join(__dirname,"data","variables.txt")
const shaderOperationsLocation = path.join(__dirname,"data","operations.txt")

const expectString = `
    functionality1
        vertex
            something nothing f1_vertex_shader_1
            something nothing f1_vertex_shader_2
            something nothing f1_vertex_shader_3
        fragment
            hey there f1_fragment_shader_1
    functionality2
        vertex
            something nothing f2_vertex_shader_1
            something nothing f2_vertex_shader_2
            something nothing f2_vertex_shader_3
        fragment
            hey there f2_fragment_shader_1
`

describe("Command line operations: Functional correctness",()=>{
    it("display variables",async ()=>{
        
        CLInterface.changeDataLocation(functionalityLocation,shaderOperationsLocation,variableLocation);

        // What is the problem right now?
        /*  

            I have to manually code out the entire expected outcome string. 
                It is so time consuming
                    I also have a feeling it is something that I will come across again. 

        */
        
        const expected = expectString;
        const outcome = await CLInterface.displayVariables();
        const status = outcome === expected
        
        expect(status).toBe(true);

    })
})


