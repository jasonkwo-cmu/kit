import { parse } from 'acorn';
import MagicString from 'magic-string';
import { simple as walkSimple } from 'acorn-walk';
import fg from 'fast-glob';
import { dirname, relative, join } from 'path';

/**
 * Replace and restore custom syntax to avoid parsing errors.
 */
function preprocessCode(code, revert = false) {
	const token = 'import.meta.glob';
	const placeholder = 'importMetaGlob'; // A valid identifier that Acorn can parse
	return code.replace(new RegExp(revert ? placeholder : token, 'g'), revert ? token : placeholder);
}

/**
 * Resolve glob patterns to file paths.
 */
async function resolveGlob(pattern, sourcePath) {
	const basePath = dirname(sourcePath);
	const files = await fg(pattern, { cwd: basePath, onlyFiles: true });
	return files.map((file) => join(basePath, file));
}

/**
 * Transform `import.meta.glob` in JavaScript code to dynamic imports based on actual file matches.
 */
export async function transformImportMetaGlob(code, sourcePath) {
	const preprocessedCode = preprocessCode(code);
	const ast = parse(preprocessedCode, {
		ecmaVersion: 'latest',
		sourceType: 'module',
		locations: true
	});

	const s = new MagicString(preprocessedCode);

	const tasks = [];

	walkSimple(ast, {
		CallExpression(node) {
			if (
				node.callee.type === 'Identifier' &&
				node.callee.name === 'importMetaGlob' &&
				node.arguments.length > 0 &&
				node.arguments[0].type === 'Literal'
			) {
				const pattern = node.arguments[0].value;
				tasks.push(
					(async () => {
						const files = await resolveGlob(pattern, sourcePath);
						const objectEntries = files
							.map((file) => {
								const relativePath = relative(dirname(sourcePath), file);
								return `'./${relativePath}': () => import('./${relativePath}')`;
							})
							.join(',\n');

						const replacement = `/* #__PURE__ */ Object.assign({\n${objectEntries}\n})`;
						s.overwrite(node.start, node.end, preprocessCode(replacement, true));
					})()
				);
			}
		}
	});

	await Promise.all(tasks);

	return preprocessCode(s.toString(), true);
}
