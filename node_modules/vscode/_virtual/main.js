import { getDefaultExportFromCjs } from './_commonjsHelpers.js';
import { __require as requireMain } from '../external/vscode-textmate/release/main.js';

function _mergeNamespaces$1(n, m) {
	m.forEach(function (e) {
		e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
			if (k !== 'default' && !(k in n)) {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () { return e[k]; }
				});
			}
		});
	});
	return Object.freeze(n);
}
var mainExports = requireMain();
var main = getDefaultExportFromCjs(mainExports);
var main$1 = _mergeNamespaces$1({
	__proto__: null,
	default: main
}, [mainExports]);

export { main as default, main$1 as main };
