const {functionality} = require('../functionalityOperation.js')
const path = require('path')
const fs = require('fs').promises;
// Class variable name: functionalityInterface

const functionalityInterface = new functionality();
const controlDataFile = path.join(__dirname,"controlData.txt");
const testDataFile = path.join(__dirname,"data.txt");

functionalityInterface.changeFileLocation(testDataFile);


async function resetTestData(){
    const original = await fs.readFile(controlDataFile,'utf8');
    await fs.writeFile(testDataFile,original,'utf8'); 
    return true;
}

describe('functionality operations: Functional correctness',()=>{

    it('get all functionality',async ()=>{

        const correctState = ["something","nothing","hello","goodbye"];
        const data = await functionalityInterface.getFunctionalityNames();
        // What if there is extra?
        // What if there is a difference?
        let outcome = true;
        const whatToExpect = true;
        const lengthOfCorrect = correctState.length;
        const testLength = data.length;

        if(lengthOfCorrect !== testLength){
            outcome = false;
        }
        
        if(outcome === true){
            for(let i = 0; i<lengthOfCorrect;i++){
                if(correctState[i] !== data[i]){
                    outcome = false;
                    break;
                }
            }
        }
        expect(outcome).toBe(whatToExpect);

    })
    
    it('check if specific functionality exist',async ()=>{
        
        const outcome = await functionalityInterface.doesFunctionalityExist('hello');
        expect(outcome).toBe(true);
    })

    it('edit functionality name',async ()=>{
        const oldFuncName = "hello";
        const newFuncName = "bla bla"
        await functionalityInterface.renameFunctionality(oldFuncName,newFuncName);
        const outcome = await functionalityInterface.doesFunctionalityExist(newFuncName);
        await functionalityInterface.renameFunctionality(newFuncName,oldFuncName);
        await resetTestData();
        expect(outcome).toBe(true)
    })

    it('add new functionality',async ()=>{
        const newFuncName = "lolo"
        await functionalityInterface.insertNewFunctionality(newFuncName);
        const outcome = await functionalityInterface.doesFunctionalityExist(newFuncName);
        await functionalityInterface.removeFunctionality(newFuncName);
        await resetTestData();
        expect(outcome).toBe(true);
    })

    it('remove functionality',async ()=>{
        const oldFuncName = "something";
        const originalState = await functionalityInterface.getFunctionalityNames();
        if(!originalState.includes(oldFuncName)){
            throw new Error("Test case 'remove functionality' does not work because functionality name 'something' does not exist");
        }
        await functionalityInterface.removeFunctionality("something");
        const newState = await functionalityInterface.getFunctionalityNames();
        const shouldNotExist = newState.includes(oldFuncName);
        functionalityInterface.insertNewFunctionality("something")
        resetTestData()
        expect(shouldNotExist).toBe(false);
    })
})

