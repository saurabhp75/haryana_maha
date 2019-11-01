import { terser } from "rollup-plugin-terser";

export default [
{
  input: 'haryanaIndex.js',
  external: ['d3'],
  output: {
    file: 'haryanaBundle.js',
    format: 'iife',
    sourcemap: true,
    globals: { d3: 'd3' }
  },
  plugins: [terser()]
},
{
  input: 'mahaIndex.js',
  external: ['d3'],
  output: {
    file: 'mahaBundle.js',
    format: 'iife',
    sourcemap: true,
    globals: { d3: 'd3' }
  },
  plugins: [terser()]
}];
