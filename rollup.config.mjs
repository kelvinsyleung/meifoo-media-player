/* eslint-disable @typescript-eslint/no-var-requires */
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

import pkg from "./load-package.cjs";

export default [
    {
        input: "src/index.ts",
        output: [
            {
                file: pkg.main,
                format: "cjs",
                sourcemap: true,
            },
            {
                file: pkg.module,
                format: "esm",
                sourcemap: true,
            },
        ],
        plugins: [
            resolve(),
            commonjs(),
            typescript({ tsconfig: "./tsconfig.json" }),
        ],
    },
    {
        input: "dist/esm/types/index.d.ts",
        output: [{ file: "dist/index.d.ts", format: "esm" }],
        plugins: [dts()],
    },
];
