const path = require('path');
const fs = require('fs').promises;
const {interfaceOperations} = require('../interface.js')

const newLocation = path.join(__dirname,"testData","new.txt")
const editLocation = path.join(__dirname,"testData","edit.txt")

const interface = new interfaceOperations();
interface.changeInterfaceLocation(newLocation,editLocation);

async function refresher(target){
    let locate = null;
    if(target === "new"){
        locate = newLocation;
    }
    if(target === "edit"){
        locate = editLocation;
    }
    await fs.writeFile(locate,"",'utf8');
}

// Expected outcomes (Cannot be placed in test cases or else there would be additional white spaces due to test case indentation)
const expected_extractDataFromInterface = `//---FUNCTIONALITY---//
testing
//---FUNCTIONALITY---//

//---VERTEX: variables---//
Write your vertex shader variables here...
//---VERTEX: variables---//

//---VERTEX: operations---//
Write your vertex shader operations here...
//---VERTEX: operations---//

//---FRAGMENT: variables---//
Write your fragment shader variables here...
//---FRAGMENT: variables---//

//---FRAGMENT: operations---//
Write your fragment shader operations here...
//---FRAGMENT: operations---//

`

describe("functional correctness: interface operations",()=>{

    it('setup interface file',async ()=>{
        await interface.setup("new","testing");
        const outcome = await fs.readFile(newLocation,'utf8');
        displayDifferenceBetweenLinesInStrings(outcome,expected_extractDataFromInterface);
        await refresher("new");
        expect(outcome).toBe(expected_extractDataFromInterface);
    })

    it('extract data from interface',async ()=>{
        await interface.setup("new","testing");
        const data = await interface.extractDataFromInterface("new");
        const expected = {
            functionality: 'testing',
            vertex: {
                variables: `Write your vertex shader variables here...`,
                operations: `Write your vertex shader operations here...` 
            },
            fragment: {
                variables: `Write your fragment shader variables here...`,
                operations: `Write your fragment shader operations here...`
            }
        }
        console.log("HELLOOOO: ",data)
        await refresher("new");
        const outcome = object_equal(expected, data);
        expect(outcome).toBe(true);
    })

})