function show(){
    objective=$1
    subObjective=$2
    currentDir=$(pwd)
    if [[ "$objective" == "interface" ]]; then
        if [[ "$subObjective" == "new" ]]; then
            cat "$currentDir/interface/interfaces/new_functionality.txt"
        fi
        if [[ "$subObjective" == "edit" ]]; then
            cat /Users/marcus/Desktop/DEVELOPMENT_INFRASTRUCTURE/WebGL_ShaderManagementTool/shader_management_tool/shaderManipulation/interface/interfaces/edit_functionality.txt
        fi
    fi

    if [[ "$objective" == "data" ]]; then

	if [[ "$subObjective" == "functionality" ]]; then
	    cat /Users/marcus/Desktop/DEVELOPMENT_INFRASTRUCTURE/WebGL_ShaderManagementTool/shader_management_tool/shaderManipulation/shader_components/functionality/storage.txt
	fi

	if [[ "$subObjective" == "operations" ]]; then
	    cat /Users/marcus/Desktop/DEVELOPMENT_INFRASTRUCTURE/WebGL_ShaderManagementTool/shader_management_tool/shaderManipulation/shader_components/operations/storage/details.txt
	fi

	if [[ "$subObjective" == "variables" ]]; then
	    cat /Users/marcus/Desktop/DEVELOPMENT_INFRASTRUCTURE/WebGL_ShaderManagementTool/shader_management_tool/shaderManipulation/shader_components/variables/storage.txt
	fi

    fi

}

function setup(){
	source ./.setup.sh
}
