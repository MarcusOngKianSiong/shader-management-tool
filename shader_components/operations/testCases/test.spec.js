const {shaderOperations} = require('../shaderOperations.js')
const path = require('path')
const fs = require('fs').promises;
const interface = new shaderOperations();
const control = new shaderOperations();

// Storage location
const testDetailsStorageLocation = path.join(__dirname,"testData","details.txt");
const testFunctionalityStorageLocation = path.join(__dirname,"testData","functionality.txt");
const controlDetailsStorageLocation = path.join(__dirname,"controlData","details.txt");
const controlFunctionalityStorageLocation = path.join(__dirname,"controlData","functionalities.txt")

// change storage location
control.changeStorageLocation(controlFunctionalityStorageLocation,controlDetailsStorageLocation);
interface.changeStorageLocation(testFunctionalityStorageLocation,testDetailsStorageLocation);

async function resetTestData(){
    const details = await fs.readFile(controlDetailsStorageLocation,'utf8');
    const functionalities = await fs.readFile(controlFunctionalityStorageLocation,'utf8');
    await fs.writeFile(testDetailsStorageLocation,details,'utf8');
    await fs.writeFile(testFunctionalityStorageLocation,functionalities,'utf8');
}

describe('shader operations: functionality correctness',()=>{
    
    it('show all functionalities',async ()=>{
        
        const correct = ["functionality1","functionality2"];
        const data = await interface.getSectionContent();
        const length = data.length;
        let status = true;
        for(let i = 0;i<length;i++){
            const current = data[i];
            const control = correct[i];
            if(current !== control){
                status = false;
                break;
            }
        }
        expect(status).toBe(true);

    })

    it('edit functionality name',async ()=>{

        // OUTCOME DESCRIPTION: Check both functionality and details should change
        await interface.modifySectionName("functionality1","lala");
        const functionalityNames = await interface.getSectionContent();
        const functionalityDetails = await interface.getSectionDetails();
        let status = true;
        if(!functionalityNames.includes("lala") || functionalityDetails["lala"] === undefined){
            status = false;
        }
        // await interface.modifySectionName("lala","functionality1");
        await resetTestData()
        expect(status).toBe(true);

    })

    it('edit functionality details',async ()=>{
        
        const initial = await interface.getSectionDetails()
        const funcName = 'functionality1'
        const newVertexShader = 'void main(){\n   // THIS IS functionality2 NEW NEW NEW FUNCTIONALITY FRAGMENT SHADER\n}';
        const originalVertexShader = await interface.getSectionDetails()
        
        await interface.editSpecificSectionDetail(funcName,"vertex",newVertexShader);
        const data = await interface.getSectionDetails();
        let status = true;
        if(data[funcName].vertex !== newVertexShader){
            status = false;
        }
        await resetTestData()
        // await interface.editSectionDetails(funcName,"vertex",originalVertexShader);
        expect(status).toBe(true);
        
    })
    
    it('remove functionality',async ()=>{
        const original = interface.getSectionDetails()["functionality1"];
        await interface.removeSection("functionality1");
        const outcome = interface.doesSectionExist("functionality1"); // only checks the functionality text file
        const details = interface.getSectionDetails();
        let state = true;
        if(outcome === true || details["functionality1"] !== undefined){
            state =  false;
        }
        await resetTestData()
        // await interface.addNew("functionality1",original.vertex,original.fragment);
        expect(state).toBe(true);
    })


    it('add new functionality',async ()=>{
        const newVertex = 'void main(){\n   // THIS IS TESTNEW FUNCTIONALITY VERTEX SHADER\n}';
        const newFragment = 'void main(){\n   // THIS IS TESTNEW FUNCTIONALITY FRAGMENT SHADER\n}';
        const NewSectionName = "TESTNEW"
        await interface.addNew(NewSectionName,newVertex,newFragment);
        const outcome = await interface.doesSectionExist("TESTNEW");
        const data = await interface.getSectionDetails();
        let status = true;
        if(!outcome || data[NewSectionName] === undefined){
            status = false;
        }
        // await interface.removeSection(NewSectionName);
        await resetTestData()
        expect(status).toBe(true);
    })
    
    it('Remove functionality in detail file',async ()=>{
        await interface.removeDetail("functionality1");
        const functionalityList = await interface.getSectionContent();
        const functionalityDetails = await interface.getSectionDetails();
        let status = true;
        if(functionalityList.includes("functionality1") || functionalityDetails["functionality1"] !== undefined){
            status = false;
        }
        await resetTestData();
        expect(status).toBe(true);
    })

})

