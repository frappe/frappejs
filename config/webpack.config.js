const Extract = require("extract-text-webpack-plugin")

const extract = new Extract("../css/style.css")

module.exports = {
    entry: "./src/index.js",
    output: {
        path: process.cwd() + "/dist/js",
        filename: "bundle.js",
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: extract.extract({
                    use: ["css-loader", "sass-loader"],
                    fallback: "style-loader"
                })
            }
        ]
    },
    plugins: [
        extract
    ]
}