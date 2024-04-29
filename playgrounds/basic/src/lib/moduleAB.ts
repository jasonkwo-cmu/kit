const test = import.meta;
const modules = test.glob('./*.ts', { eager: true });
asdlfjasldkfjaklsdjflasdjfklj;
// const modules = import.meta.glob('./*.ts', { eager: true });

// Function to execute module functions
export const runModules = () => {
	Object.entries(modules).forEach(([moduleName, module]) => {
		if (moduleName.includes('moduleA')) {
			module.runA();
		} else if (moduleName.includes('moduleB')) {
			module.runB();
		}
	});
};
