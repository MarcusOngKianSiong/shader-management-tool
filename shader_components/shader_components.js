const {newFunctionalityInterfaceInstance} = require("./functionality/interface.js");
const {newShaderOperationsInterfaceInstance} = require("./operations/interface.js");
const {newVariableOperationsInstance} = require('./variables/interface.js');

module.exports = {
    newFunctionalityInterfaceInstance,
    newShaderOperationsInterfaceInstance,
    newVariableOperationsInstance
}
