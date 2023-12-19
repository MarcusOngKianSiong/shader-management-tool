const path = require("path")
const fs = require('fs').promises

class functionality{
    constructor(){
        this.fileLocation = path.join(__dirname,"storage.txt");
    }
    changeFileLocation(fileLocation){
        this.fileLocation = fileLocation
    }
    async getDataAndSplit(){
        const data = await fs.readFile(this.fileLocation,'utf8');
        const split = data.split('\n');
        return split
    }
    async getFunctionalityNames(){
        const data = await this.getDataAndSplit()
        return data;
    }
    async doesFunctionalityExist(func){
        const data = await this.getDataAndSplit();
        const outcome = data.includes(func);
        
        return outcome;
    }

    async insertNewFunctionality(func){
        // Check if functionality exist
        if(await this.doesFunctionalityExist(func)){
            throw new Error("Functionality exist already")
        }
        const outcome = fs.appendFile(this.fileLocation,"\n"+func,'utf8');
        return true;
    }
    
    async renameFunctionality(oldFunc,newFunc){
        if(!this.doesFunctionalityExist(oldFunc)){
            throw new Error("Functionality does not exist.");
        }
        const oldData = await this.getFunctionalityNames();
        const length = oldData.length;
        const index = oldData.indexOf(oldFunc);
        oldData[index] = newFunc;
        const combineEverything = oldData.join('\n');
        const outcome = fs.writeFile(this.fileLocation,combineEverything,'utf8');
        return true;
    }

    async removeFunctionality(name){
        if(!await this.doesFunctionalityExist(name)){
            throw new Error(`Cannot remove ${name} functionality as it does not exist`);
        }
        const data = await this.getFunctionalityNames()
        const length = data.length;
        for(let i = 0;i<length;i++){
            if(data[i] === name){
                data.splice(i,1);
                break;
            }
        }
        fs.writeFile(this.fileLocation,data.join('\n'),'utf8');
        return true;
    }
    
}

module.exports = {
    functionality
}