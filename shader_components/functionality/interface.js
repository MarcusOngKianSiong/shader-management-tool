const {functionality} = require('./functionalityOperation.js')

function newFunctionalityInterfaceInstance(){
    return new functionality();
}

module.exports = {newFunctionalityInterfaceInstance}

global.functionalityInterface = new functionality()