const path = require('path');
const fs = require('fs').promises;
const {variableOperations} = require('../variablesOperations.js');
const storageLocation = path.join(__dirname,"testData","variables.txt");
const controlLocation = path.join(__dirname,"controlData","variables.txt")
const varOps = new variableOperations()
varOps.changeVariableStorageLocation(storageLocation);


async function resetTestData(){
    const data = await fs.readFile(controlLocation,'utf8');
    await fs.writeFile(storageLocation,data,'utf8');
    return true;
}

/*
    NOTES:
        1. You cannot create or delete just one shader. When you create or delete, you must have both;
            - Why: You must have both vertex and fragment shader, not just one. Otherwise, nothing will happen. 
*/

describe('variable operations: functional correctness',()=>{
    it('get all',async ()=>{
        const outcome = await varOps.getVariables();
        const expecting = {
            functionality1: {
                vertex: {
                    something: {
                        qualifier: "uniform",
                        dataType: "vec3"
                    },
                    nothing: {
                        qualifier: "uniform",
                        dataType: "vec3"
                    },
                    hello: {
                        qualifier: "uniform",
                        dataType: "vec3"
                    },
                    goodbye: {
                        qualifier: "uniform",
                        dataType: "vec3"
                    },
                },
                fragment: {
                    float: {
                        qualifier: "precision",
                        dataType: "mediump"
                    }
                }
            },
            functionality2: {
                vertex: {
                    something: {
                        qualifier: "uniform",
                        dataType: "vec3"
                    },
                    nothing: {
                        qualifier: "uniform",
                        dataType: "vec3"
                    },
                    hello: {
                        qualifier: "uniform",
                        dataType: "vec3"
                    },
                    goodbye: {
                        qualifier: "uniform",
                        dataType: "vec3"
                    },
                },
                fragment: {
                    float: {
                        qualifier: "precision",
                        dataType: "mediump"
                    }
                }
            }
        }
        const result = object_equal(expecting,outcome)
        expect(result).toBe(true);
    })
    it('get specific functionality variables',async ()=>{
        const outcome = await varOps.getSpecificFunctionalityVariables("functionality1");
        
        const expecting = {
                vertex: {
                    something: {
                        qualifier: "uniform",
                        dataType: "vec3"
                    },
                    nothing: {
                        qualifier: "uniform",
                        dataType: "vec3"
                    },
                    hello: {
                        qualifier: "uniform",
                        dataType: "vec3"
                    },
                    goodbye: {
                        qualifier: "uniform",
                        dataType: "vec3"
                    },
                },
                fragment: {
                    float: {
                        qualifier: "precision",
                        dataType: "mediump"
                    }
                }
        }
        
        const result = object_equal(expecting,outcome);
        expect(result).toBe(true)
    })
    
    it("get specific functionality shader variables",async ()=>{
        const outcome = await varOps.getSpecificFunctionalityShader("functionality1",'vertex');
        const expecting = {
            something: {
                qualifier: "uniform",
                dataType: "vec3"
            },
            nothing: {
                qualifier: "uniform",
                dataType: "vec3"
            },
            hello: {
                qualifier: "uniform",
                dataType: "vec3"
            },
            goodbye: {
                qualifier: "uniform",
                dataType: "vec3"
            },
        }
        const result = object_equal(expecting,outcome);
        expect(result).toBe(true)
    })
    it('add 1 variable to functionality shader',async ()=>{
        await varOps.addOneVariable("functionality1","fragment","uniform vec3 NEWTHING;");
        const data = await varOps.getVariables();
        
        let status  = true;
        if(data["functionality1"]["fragment"]["NEWTHING"].qualifier !== "uniform" && data["functionality1"]["fragment"]["NEWTHING"].dataType !== "vec3"){
            status = false;
        }
        await resetTestData();
        expect(status).toBe(true)
    })
    it('remove 1 variable from functionality shader',async ()=>{
        let status  = true;
        await varOps.removeOneVariable("functionality1","vertex","something");
        const data = await varOps.getVariables();
        if(data["functionality1"].vertex.something !== undefined){
            status = false;
        }
        await resetTestData();
        expect(status).toBe(true);
    })

    it('edit functionality shader variable',async ()=>{
        let status  = true;
        await varOps.editFunctionalityShaderVariable("functionality1","vertex","something","name","LALALA");
        const data = await varOps.getVariables();
        if(data["functionality1"].vertex.LALALA === undefined || data["functionality1"].vertex.something !== undefined){
            status = false;
        }
        await resetTestData();
        expect(status).toBe(true);
    })

    it('create new functionality',async ()=>{
        let status  = true;
        await varOps.createNewFunctionality("NEWFUNC",["something nothing lala;"],["hello nothing blabla;"]);
        const data = await varOps.getVariables(); 
        if(data["NEWFUNC"].vertex.lala.qualifier !== "something" || data["NEWFUNC"].fragment.blabla.qualifier !== "hello"){
            status = false;
        }
        await resetTestData();
        expect(status).toBe(true)
    })

    it('remove functionality',async ()=>{
        let status  = true;
        await varOps.removeFunctionality("functionality1");
        const data = await varOps.getVariables();
        if(data["functionality1"] !== undefined){
            status = false;
        }
        await resetTestData();
        expect(status).toBe(true)
    })

    it('change functionality name',async ()=>{
        const oldFun = "functionality1";
        const newFun = "SOMETHING";
        await varOps.changeFunctionalityName(oldFun,newFun);
        const data = await varOps.getSpecificFunctionalityVariables(newFun);
        let status = true;
        if(data.vertex.something.qualifier !== "uniform"){
            status = false;
        }
        await resetTestData();
        expect(status).toBe(true);
    })    

    it('edit multiple functionality variables',async ()=>{

        let status = true;
        const newVertex = "hehe haha blabla;"
        const newFragment = "hoho bobo dodo";
        await varOps.editMultipleFunctionalityVariables("functionality1",newVertex,newFragment);
        const data = await varOps.getSpecificFunctionalityVariables("functionality1");
        
        if(data.vertex.blabla.qualifier !== "hehe" || data.fragment.dodo.qualifier !== "hoho"){
            status = false;
        }
        await resetTestData();
        expect(status).toBe(true);

    })

})