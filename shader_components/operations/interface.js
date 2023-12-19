const {shaderOperations} = require('./shaderOperations.js')


function newShaderOperationsInterfaceInstance(){
    return new shaderOperations()
}

module.exports = {newShaderOperationsInterfaceInstance}

global.shaderOperation = new shaderOperations();
