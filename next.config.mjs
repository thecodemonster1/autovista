/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    /**
     * onnxruntime-web ships its own WASM loader; bundling it through webpack
     * breaks the runtime's internal path resolution, so it is kept external
     * and loaded with a plain `import()` at request time.
     */
    serverComponentsExternalPackages: ['onnxruntime-web'],
    /**
     * Vercel's output file tracing cannot statically see the model file or the
     * WASM binaries (they are read with `fs` / resolved at runtime), so they
     * are declared explicitly to guarantee they ship with the function bundle.
     */
    outputFileTracingIncludes: {
      '/api/predict': ['./public/model.onnx', './node_modules/onnxruntime-web/dist/*.wasm'],
    },
  },
};

export default nextConfig;
