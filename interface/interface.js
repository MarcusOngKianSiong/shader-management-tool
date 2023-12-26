const {interfaceUtility,interfaceOperations} = require('./interfaceOperations.js')

function getNewInterfaceLocation(){
        return interfaceUtility.interfaceLocation("new");
}

function getEditInterfaceLocation(){
	return interfaceUtility.interfaceLocation("edit");
}

module.exports = {interfaceOperations,getNewInterfaceLocation,getEditInterfaceLocation}
