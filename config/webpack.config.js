module.exports = {
    entry: './src/index.js',
    output: {
        path: process.cwd() + '/dist/js',
        filename: 'bundle.js'
    },
    module:{rules:[{
        test: /\.scss$/,
         use: ["style-loader", "css-loader", "sass-loader"]
    }]}
}