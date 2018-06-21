
const argv = require('yargs').argv

const helpers = {}

helpers.isFunc = target => target instanceof Function
helpers.getObjectArgs = argv => {
	const args = Object.assign({}, argv)
	delete args.$0
	delete args._
	return args
}

helpers.isExecutable = (targetFunc, parentExports) => targetFunc in parentExports && helpers.isFunc(parentExports[targetFunc])
helpers.hasBothTypesOfArg = (objectArgs, arrayArgs) => Object.keys(objectArgs).length > 0 && arrayArgs.length > 0
helpers.getAndRun = (func, objectArgs, arrayArgs) => {

	const targetArgs = helpers._getCurrentArgs(objectArgs, arrayArgs)
	// console.log(targetArgs)
	return helpers._runFunc(func, targetArgs)
}

helpers.getFunctionNames = (object) => {
	const objectFunctionNames = [];
	for (let key in object) {
		let objectProperty = object[key];

		if (helpers.isFunc(objectProperty)) {
			objectFunctionNames.push(key);
		}
	}

	return objectFunctionNames;
}

helpers.generateSuggestion = (functionNames) => {
	let suggestion = "";
	let functionListString = functionNames.join(", ");
	if (functionNames.length > 1) {
		suggestion = `Perhaps you meant one of the following: ${functionListString}`;
	} else if (functionNames.length === 1) {
		suggestion = `Perhaps you meant: ${functionListString}`;
	} else {
		suggestion = `Module doesn't export any functions`;
	}
	return suggestion;
}

helpers._getCurrentArgs = (objectArgs, arrayArgs) => {
	const args = [];
	// console.log(`object args: ${JSON.stringify(objectArgs, undefined, 4)} \n array args: ${arrayArgs}`);
	if (Object.keys(objectArgs).length > 0)
		args.push(objectArgs);
	if (arrayArgs.length > 0)
		args.push(...arrayArgs);
	// console.log(`Args: ${args}`)
	return args;
}

helpers._runFunc = (func, args) => func(...args)

const main = () => {
	const parent = module.parent
	// Args passed like --test=anarg
	const objectArgs = helpers.getObjectArgs(argv)
	// All other args, also with the function name
	const args = argv._.slice(0)

	// Check for others `runnable-exports`
	if (require.main !== parent) {
		return delete require.cache[__filename]
	}

	const parentExports = parent.exports
	const correctArgs = helpers.isFunc(parentExports) ? args.slice(0) : args.slice(1)

	if (helpers.hasBothTypesOfArg(objectArgs, correctArgs)) {
		// throw new Error(`RUNNABLE-EXPORTS: can't run with both objectArgs and arrayArgs: ${JSON.stringify(objectArgs)}, ${correctArgs}`)
	}

	// Check if the parent.exports (the file you are running) is a just an exported anonymous function
	if (helpers.isFunc(parentExports)) {
		return helpers.getAndRun(parentExports, objectArgs, args);
	}

	const targetFunc = args[0];
	const isExecutable = helpers.isExecutable(targetFunc, parentExports)
	let functionArgs = args.slice(1);
	// console.log(functionArgs)
	if (isExecutable) {
		// console.log(parentExports[targetFunc])
		return helpers.getAndRun(parentExports[targetFunc], objectArgs, functionArgs)
	} else {
		let executableFunctions = helpers.getFunctionNames(parentExports);
		let suggestionString = helpers.generateSuggestion(executableFunctions);
		let errorMessage = `RUNNABLE-EXPORTS: can't run your command: ${targetFunc} \n${suggestionString}`;
		throw new Error(errorMessage);
	}
}

module.exports = main
