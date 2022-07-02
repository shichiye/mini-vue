const args = require('minimist')(process.argv.slice(2))
const { build } = require('esbuild')
const { resolve } = require('path')

const target = args._[0] || 'reactivity'
const format = args.f || 'global'

// 开发环境只打包某一个
const pkg = require(resolve(__dirname, `../packages/${target}/package.json`))

/**
 * iife 立即执行函数
 * cjs node中的模块
 * esm 浏览器中的esModule模块
 */
const outputFormat = format.startsWith('global')
  ? 'iife'
  : format === 'cjs'
  ? 'cjs'
  : 'esm'

const outfile = resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`)

build({
  entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
  outfile,
  bundle: true,   // 把所有的包全部打包到一起
  sourcemap: true,
  format: outputFormat, // iife cjs esm
  globalName: pkg.buildOptions?.name, // 打包的全局的名字
  platform: format == 'cjs' ? 'node' : 'browser', // 平台
  watch: {
    onRebuild(error) {
      if (!error) console.log('rebuild...')
    }
  }
}).then(() => {
  console.log('watching...')
})
