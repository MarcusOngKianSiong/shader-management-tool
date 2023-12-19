

/* 
    Requirements:
        - Setup:
            1. The data
                - variables
                - operations
                - functionality
            2. The relevant class/es
                - I think that if I run the api class, I basically run all the other three classes. 
                    - There is only one problem:
                        the location of the data. 
*/

const {API} = require('../interface.js')      // The formation of an instance is here.
const path = require('path');
const functionalityLocation = path.join(__dirname,"testData","functionality.txt")
const variableLocation = path.join(__dirname,"testData","variables.txt")
const shaderOperationsLocation = path.join(__dirname,"testData","operations.txt")

const f1_vertexShader = `something nothing f1_vertex_shader_1;
something nothing f1_vertex_shader_2;
something nothing f1_vertex_shader_3;
void main(){
    // functionality 1 vertex shader operations
}`
const f1_fragmentShader = `hey there f1_fragment_shader_1;
void main(){
    // functionality 1 fragment shader operations
}`

const f1_variables = {
    something: ["f1_vertex_shader_1","f1_vertex_shader_2","f1_vertex_shader_3"],
    hey: ["f1_fragment_shader_1"],
}

const f2_vertexShader = `something nothing f2_vertex_shader_1;
something nothing f2_vertex_shader_2;
something nothing f2_vertex_shader_3;
void main(){
    // functionality 2 vertex shader operations
}`

const f2_fragmentShader = `hey there f2_fragment_shader_1;
void main(){
    // functionality 2 fragment shader operations
}`
const f2_variables = {
    something: ["f2_vertex_shader_1","f2_vertex_shader_2","f2_vertex_shader_3"],
    hey: ["f2_fragment_shader_1"],
}


describe("API: functional correctness",()=>{
    it("retrieve data",async ()=>{
        API.changeDataLocation(functionalityLocation,shaderOperationsLocation,variableLocation)
        
        const outcome = await API.constructShaderPrograms();
        
        const expected = {
            functionality1: {
                vertex: f1_vertexShader,
                fragment: f1_fragmentShader,
                variables: f1_variables
            },
            functionality2: {
                vertex: f2_vertexShader,
                fragment: f2_fragmentShader,
                variables: f2_variables
            }
        }
        

        const status = object_equal(outcome,expected);
        
        expect(status).toBe(true);

    })
})