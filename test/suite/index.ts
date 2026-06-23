import * as path from 'path'

import Mocha from 'mocha'
import glob from 'glob'

export function run(): Promise<void> {
  const mocha = new Mocha({ ui: 'tdd' })
  const testsRoot = path.resolve(__dirname, '..')

  return new Promise((c, e) => {
    glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
      if (err) return e(err)
      files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)))
      try {
        mocha.run((failures) => (failures > 0 ? e(new Error(`${failures} tests failed`)) : c()))
      } catch (err) {
        e(err)
      }
    })
  })
}
