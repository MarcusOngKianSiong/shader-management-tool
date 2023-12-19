const { appendFile } = require('fs');
const path = require('path')
const fs = require('fs').promises;


class shaderOperations{

    constructor(){
        this.detailsLocation = path.join(__dirname,"storage","details.txt");
        this.sectionLocation = path.join(__dirname,"storage","sections.txt");
        this.SectionIndication = {
            functionality: "//---Section name: {}---//",
            vertex: "//---vertex---//",
            fragment: "//---fragment---//"
        }
    }
    
    /*  
        Return Format:
                {
                    sectionName: {
                        vertex: "",
                        fragment: ""
                    },
                }
    */
    async #sectionDetailsDecomposition(stringSplit){

        // set up the necessary things
        const indexes = {
            functionality: [],
            vertex: [],
            fragment: []
        }
        const decomposedData = {}
        const functionalityRegex = new RegExp(this.SectionIndication.functionality.replace("{}","(.+)"));
        const vertexRegex = new RegExp(this.SectionIndication.vertex);
        const fragmentRegex = new RegExp(this.SectionIndication.fragment);
        const sections = await this.getSectionContent();
        const numberOfSections = sections.length;
        
        const length = stringSplit.length;
        
        for(let i = 0;i<length;i++){
            const current = stringSplit[i];
            if(functionalityRegex.exec(current)){
                indexes.functionality.push(i);
                continue;
            }
            
            if(vertexRegex.exec(current)){
                indexes.vertex.push(i);
                continue;
            }
            if(fragmentRegex.exec(current)){
                indexes.fragment.push(i);
                continue;
            }
        }
        
        // perform decomposition
        for(let i = 0;i<numberOfSections;i++){
            const currentSectionName = functionalityRegex.exec(stringSplit[indexes.functionality[i*2]])[1];
            const currentSectionVertexContent = stringSplit.slice(indexes.vertex[i*2]+1,indexes.vertex[i*2+1]).join('\n');
            const currentSectionFragmentContent = stringSplit.slice(indexes.fragment[i*2]+1,indexes.fragment[i*2+1]).join("\n");
            decomposedData[currentSectionName] = {
                vertex: currentSectionVertexContent,
                fragment: currentSectionFragmentContent
            }
        }

        return decomposedData;
    }
    #sectionDetailsRecombination(decomposedData){
        let string = ''
        
        for(const sectionName in decomposedData){
            
            const constructedVertex = this.#constructSingleSectionContent(decomposedData[sectionName].vertex,"vertex");
            const constructedFragment = this.#constructSingleSectionContent(decomposedData[sectionName].fragment,"fragment");
            const grouped = this.#constructGroup(sectionName,constructedVertex,constructedFragment);
            string += (grouped + '\n')
        }
        string = string.slice(0,string.length-1);
        return string
    }
    #isFileEmpty(string){
        if(string.length === 0 || /[a-zA-Z0-9]/.exec(string) === null){
            throw new Error("No functionality");
        }
    }
    #isAShader(content){
        const split = content.split('\n');
        const length = split.length;
        if(split[0] === "void main(){" && split[length-1] === "}"){
            return true;
        }
        return false;
    }
    #doesSectionLabelExist(section,type){
        const split = section.split("\n");
        const length = split.length;
        if(split[0]+'\n' !== this.SectionIndication[type] + '\n'){
            throw new Error("Section head does not match requirement");
        }
        if(split[length-1] !== this.SectionIndication[type]){
            throw new Error("Section tail does not match requirement")
        }
        return true;
    }

    
    #constructGroup(functionalityName,vertex,fragment){
        const sectionIndication = this.SectionIndication.functionality;
        const namedSection = sectionIndication.replace("{}",functionalityName);
        if(this.#doesSectionLabelExist(vertex,"vertex") && this.#doesSectionLabelExist(fragment,"fragment")){
            return namedSection + '\n' + vertex + '\n' + fragment + '\n' + namedSection;
        }
        return false;
    }
    #constructSingleSectionContent(content,type){
        return this.SectionIndication[type] + "\n" + content + "\n" + this.SectionIndication[type];
    }
    
    changeStorageLocation(section,details){
        this.detailsLocation = details;
        this.sectionLocation = section;
    }

    /**
     * @abstract Get functionality names from sections.txt file
     * @returns {array}
     */
    async getSectionContent(){

        /*
            DATA RETURN FORMAT: 
            {
                functionality1: {
                    vertex: 'void main(){\n    // THIS IS THE VERTEX OF functionality 1\n}',
                    fragment: 'void main(){\n    // THIS IS THE FRAGMENT OF functionality 1\n}'
                },
                functionality2: {
                    vertex: 'void main(){\n    // THIS IS THE VERTEX OF functionality 2\n}',
                    fragment: 'void main(){\n    // THIS IS THE FRAGMENT OF functionality 2\n}'
                }
            }
        */

        const data = await fs.readFile(this.sectionLocation,'utf8');
        this.#isFileEmpty(data);
        return data.split("\n");
        
    }

    async doesSectionExist(section){
        const data = await this.getSectionContent();
        return data.includes(section);
    }
    
    /**
     * @abstract Add a new section name to the sections.txt
     * @param {string} sectionName 
     * @returns {boolean}
     */
    async addSection(sectionName){
        await fs.appendFile(this.sectionLocation,sectionName,'utf8');
        return true;
    }
    /**
     * @abstract Change an existing name in sections.txt to another name
     * @param {string} oldSection 
     * @param {string} newSection 
     * @returns {boolean | error} 
     */
    async editSection(oldSection,newSection){
        if(!await this.doesSectionExist(oldSection)){
            throw new Error(`${oldSection} section does not exist`);
        }
        const data = await this.getSectionContent();
        const index = data.indexOf(oldSection);
        data[index] = newSection;
        fs.writeFile(this.sectionLocation,data.join('\n'),'utf8');
        return true;
    }
    
    /**
     * @abstract remove a name from the section.txt file.
     * @param {*} section 
     * @returns 
     */
    async removeSection(section){
        if(!await this.doesSectionExist(section)){
            throw new Error("Section does not exist");
        }
        const data = await this.getSectionContent()
        const index = data.indexOf(section);
        data.splice(index,1);
        await fs.writeFile(this.sectionLocation,data.join('\n'),'utf8');
        return true;
    }
    
    /**
     * @abstract Retrieve the operations for each functionality stored in details.txt and returns an object containing them
     * @note
     *      - object returned is organized by name and shader type for each. 
     *      - assumptions
                1. Each pattern comes in pairs. 
                2. vertex and fragment pattern is beside each other. 
                3. vertex and fragment pattern is between the pair of functionality indication pattern. 
     * @returns 
     */
    /* EXPECTED DATA FORMAT: output, key data
        output: 
            {
                    sectionName: {
                        vertex: "",
                        fragment: ""
                    },
            }
        key data:
            //--- section name: lalala---//
            //---vertex---//
            ....
            //---vertex---//
            //---fragment---//
            ....
            //---fragment---//
            //--- section name: lalala---//
    */
    async getSectionDetails(){
        const data = await fs.readFile(this.detailsLocation,'utf8');
        this.#isFileEmpty(data);
        const decomposedData = this.#sectionDetailsDecomposition(data.split("\n"));
        return decomposedData
    }

    /**
     * @abstract returns the vertex and fragment operation of a specific functionality
     * @param {string} sectionDetailsName 
     * @returns {obj} 
     */
    /* EXPECTED DATA FORMAT: output
        output:
            {
                vertex: "",
                fragment: ""
            },
    */
    async getSpecificSectionDetails(sectionDetailsName){
        if(!await this.doesSectionExist(sectionDetailsName)){
            throw new Error(`${sectionDetailsName} section does not exist.`);
        }
        const decomposedData = await this.getSectionDetails();
        return decomposedData[sectionDetailsName]
    }
    
    /**
     * @abstract Take a specific functionality name that exist, and change the name for both the section.txt file and detail.txt file. 
     * @param {string} oldName 
     * @param {string} newName 
     * @returns {boolean}
     */
    /* STEPS:
            Step 1: Get all the operations
            Step 2: Replace a specific functionality name within operation details object.
            Step 3: Recombine operation details object into a string and post it to the detail.txt file.
            Step 4: Obtain the functionality names from the section.txt file
            Step 5: Loop through the array to find a functionality name that matches the oldName parameter and change it to the newName parameter
            Step 6: Convert the array of functionality name into a string and post it up to the section.txt file.
    */
    async modifySectionName(oldName, newName){

        // Step 1: Get all the operations
        const decomposedData = await this.getSectionDetails();
        
        // Step 2: Replace a specific functionality name within operation details object.
        const temporaryStorage = decomposedData[oldName];
        delete decomposedData[oldName];
        decomposedData[newName] = temporaryStorage;
        
        // Step 3: Recombine operation details object into a string and post it to the detail.txt file.
        const recombinedData = this.#sectionDetailsRecombination(decomposedData);
        await fs.writeFile(this.detailsLocation,recombinedData,'utf8');

        // Step 4: Obtain the functionality names from the section.txt file
        const data = fs.readFile(this.sectionLocation,'utf8');

        // Step 5: Loop through the array to find a functionality name that matches the oldName parameter and change it to the newName parameter
        const split = (await data).split('\n');
        const length = split.length;
        for(let i = 0;i<length;i++){
            if(split[i] === oldName){
                split[i] = newName;
                break;
            }
        }
        
        // Step 6: Convert the array of functionality name into a string and post it up to the section.txt file.
        const merge = split.join('\n');
        await fs.writeFile(this.sectionLocation,merge,'utf8');
        return true;
    }
    
    /**
     * @abstract Add new functionality operations to the storage.
     * @param {string} functionalityName 
     * @param {string} vertex The string representing the vertex operation code
     * @param {string} fragment The string representing the fragment operation code
     * @returns {boolean}
     */
    /* STEPS:
        Step 1: Check if vertex and fragment parameters have "void main(){" as the first line and "}" as the last line, which represents a shader operation.
        Step 2: Encapsulate the vertex and fragment code into their shader indicator
        Step 3: Encapsulate the encapsulated vertex and fragment code into a functionality indicator
        Step 4: Add the new functionality name into the sections.txt file
        Step 5: Add the entire functionality encapsulation into details.txt file
    */
    async addNew(functionalityName, vertex,fragment){
        // Step 1: Check if vertex and fragment parameters have "void main(){" as the first line and "}" as the last line, which represents a shader operation.
        if(!this.#isAShader(vertex) || !this.#isAShader(fragment)){
            throw new Error("vertex or fragment shader is not enclosed in void main function");
        }
        // Step 2: Encapsulate the vertex and fragment code into their shader indicator
        const vertexSection = this.#constructSingleSectionContent(vertex,"vertex");
        const fragmentSection = this.#constructSingleSectionContent(fragment,"fragment");
        
        // Step 3: Encapsulate the encapsulated vertex and fragment code into a functionality indicator
        const groupSection = this.#constructGroup(functionalityName,vertexSection,fragmentSection);

        // Step 4: Add the new functionality name into the sections.txt file
        await fs.appendFile(this.detailsLocation,groupSection,'utf8');

        // Step 5: Add the entire functionality encapsulation into details.txt file
        await fs.appendFile(this.sectionLocation,"\n"+functionalityName,'utf8');
        return true;
    }
    
    /**
     * @abstract Change ONLY a SINGLE SPECIFIC operation code FOR a specific shader FOR a specific functionality.
     * @param {string} functionalityName 
     * @param {string} shader 
     * @param {string} data 
     * @returns 
     */
    async editSpecificSectionDetail(functionalityName,shader,data){
        if(shader !== "fragment" && shader !== "vertex"){
            throw new Error("No shader specified.")
        }
        if(!this.doesSectionExist(functionalityName)){
            throw new Error("Functionality does not exist")
        }
        
        const decomposedData = await this.getSectionDetails();
        console.log(decomposedData)
        decomposedData[functionalityName][shader] = data;
        const combinedString = this.#sectionDetailsRecombination(decomposedData);
        fs.writeFile(this.detailsLocation,combinedString,'utf8');
        return true;
    }
    
    /**
     * @abstract Remove functionality operations from details.txt file and functionality name from sections.txt file.
     * @param {string} functionalityName 
     * @return {boolean}
     */
    /* STEPS:
        Step 1: check if section exist
        Step 2: Get functionality operations from details.txt
        Step 3: Remove functionality from operations object.
        Step 4: Turn operations object back into a string
        Step 5: Post the modified string onto the details.txt file
        Step 6: Remove functionality name from sections.txt file
    */
    async removeDetail(functionalityName){
        
        // Step 1: check if section exist
        if(await this.doesSectionExist(functionalityName)){

            // Step 2: Get functionality operations from details.txt
            const data = await this.getSectionDetails();
            if(data[functionalityName] !== undefined){
                let final = '';

                // Step 3: Remove functionality from operations object.
                delete data[functionalityName];

                // Step 4: Turn operations object back into a string
                for(const functionalityName in data){
                    const vertexStringEncapsulated = this.#constructSingleSectionContent(data[functionalityName].vertex,"vertex");
                    const fragmentStringEncapsulated = this.#constructSingleSectionContent(data[functionalityName].fragment,"fragment");
                    const grouped = this.#constructGroup(functionalityName,vertexStringEncapsulated,fragmentStringEncapsulated);
                    final+=grouped+'\n';
                }

                // Step 5: Post the modified string onto the details.txt file
                await fs.writeFile(this.detailsLocation,final.slice(0,final.length-1),'utf8');

                // Step 6: Remove functionality name from sections.txt file
                await this.removeSection(functionalityName);

                return true

            }else{
                throw new Error("functionality does not exist")
            }
        }else{
            throw new Error("functionality does not exist")
        }
    }

}

// I learned that if you prepare the information your mind 
module.exports = {
    shaderOperations
}