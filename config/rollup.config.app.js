module.exports = {
	input: './src/index.js',
	output: {
		file: './dist/js/bundle.js',
		format: 'iife',
		name: 'desk'
	},
	plugins: [
		require('rollup-plugin-commonjs')({
			namedExports: {
				'node_modules/jquery/dist/jquery.min.js': [ 'jquery' ]
			}
		}),
		require('rollup-plugin-json')(),
		require('rollup-plugin-node-resolve')(),
		require('rollup-plugin-node-builtins')(),
		require('rollup-plugin-svg')()
	]
}
