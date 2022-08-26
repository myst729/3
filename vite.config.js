import { Plugin as importToCDN } from 'vite-plugin-cdn-import'

export default {
  base: './',
  build: {
    outDir: 'docs',
  },
  plugins: [
    importToCDN({
      modules: [
        {
          name: 'three',
          var: 'THREE',
          path: 'build/three.min.js',
        },
      ],
      prodUrl: '//unpkg.com/{name}@{version}/{path}',
    }),
  ],
}
