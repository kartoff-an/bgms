const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
    expoConfig,
    {
        ignores: ["dist/*"],
        settings: {
            "import/resolver": {
                typescript: {
                    project: "./tsconfig.json",
                    alwaysTryTypes: true,
                },
                node: {
                    extensions: [".js", ".jsx", ".ts", ".tsx"],
                },
                alias: {
                    map: [
                    ["@app", "./"],
                    ["@shared", "../shared/src"]
                ],
                }
            },
        },
    },
]);
