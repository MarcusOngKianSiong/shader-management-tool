const {variableOperations} = require('./variablesOperations.js')

function newVariableOperationsInstance(){
    return new variableOperations();
}

module.exports = {newVariableOperationsInstance};

global.variableOperations = new variableOperations()
