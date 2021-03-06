'use strict'
const _ = require('lodash')
const reactTemplates = require('../../src/reactTemplates')
const testUtils = require('./utils/testUtils')
const readFileNormalized = testUtils.readFileNormalized
const compareAndWrite = testUtils.compareAndWrite
const path = require('path')
const context = require('../../src/context')
const assert = require('assert')
const dataPath = path.resolve(__dirname, '..', 'data')

/**
 * @param testData
 */
function check(testData) {
    const filename = path.join(dataPath, testData.source)
    const html = readFileNormalized(filename)
    const expected = readFileNormalized(path.join(dataPath, testData.expected))
    const actual = reactTemplates.convertTemplateToReact(html, testData.options).replace(/\r/g, '').trim()
    compareAndWrite(actual, expected, filename)
}

/**
 * @param files
 * @param options
 */
function testFiles(files, options) {
    files.forEach(testFile => {
        check({
            source: testFile,
            expected: `${testFile}.js`,
            options
        })
    })
}

describe('utils', () => {
    describe('#convertText', () => {
        it('rt-if with rt-scope test', () => {
            const files = ['if-with-scope/valid-if-scope.rt']
            const options = {modules: 'amd'}
            testFiles(files, options)
        })

        it('conversion test', () => {
            const files = ['div.rt', 'test.rt', 'repeat.rt', 'repeat-with-index.rt', 'inputs.rt', 'virtual.rt', 'stateless.rt', 'style-vendor-prefix.rt', 'non-breaking-space.rt']
            const options = {modules: 'amd'}
            testFiles(files, options)
        })

        it('autobinding conversion test', () => {
            const options = {
                modules: 'amd',
                autobind: true
            }
            const files = ['autobind.rt']
            testFiles(files, options)
        })

        it('prop template conversion test', () => {
            const options = {
                propTemplates: {
                    List: {
                        Row: {prop: 'renderRow', arguments: ['rowData']}
                    }
                },
                modules: 'amd'
            }
            const files = [
                'simpleTemplate.rt',
                'templateInScope.rt',
                'implicitTemplate.rt',
                'twoTemplates.rt',
                'siblingTemplates.rt'
            ].map(file => path.join('propTemplates', file))
            testFiles(files, options)
        })

        it('conversion test - native', () => {
            const options = {
                propTemplates: {
                    MyComp: {
                        Row: {prop: 'renderRow', arguments: ['rowData']}
                    }
                },
                native: true
            }
            const optionsNew = _.assign({nativeTargetVersion: '0.29.0'}, options)

            const files = [
                {source: 'native/nativeView.rt', expected: 'native/nativeView.rt.js', options},
                {source: 'native/listViewTemplate.rt', expected: 'native/listViewTemplate.rt.js', options},
                {source: 'native/listViewAndCustomTemplate.rt', expected: 'native/listViewAndCustomTemplate.rt.js', options},
                {source: 'native/nativeView.rt', expected: 'native/nativeView.rt.v029.js', options: optionsNew},
                {source: 'native/listViewTemplate.rt', expected: 'native/listViewTemplate.rt.v029.js', options: optionsNew},
                {source: 'native/listViewAndCustomTemplate.rt', expected: 'native/listViewAndCustomTemplate.rt.v029.js', options: optionsNew}
            ]
            files.forEach(check)
        })

        it('convert div with all module types', () => {
            const files = [
                {source: 'div.rt', expected: 'div.rt.commonjs.js', options: {modules: 'commonjs'}},
                {source: 'div.rt', expected: 'div.rt.amd.js', options: {modules: 'amd', name: 'div'}},
                {source: 'div.rt', expected: 'div.rt.globals.js', options: {modules: 'none', name: 'div'}},
                {source: 'div.rt', expected: 'div.rt.es6.js', options: {modules: 'es6'}},
                {source: 'div.rt', expected: 'div.rt.typescript.ts', options: {modules: 'typescript'}},
                {source: 'div.rt', expected: 'div.rt.15.js', options: {targetVersion: '15.0.0', modules: 'amd'}}
            ]
            files.forEach(check)
        })

        it('normalize whitespace', () => {
            const files = ['whitespace.rt']
            const options = {normalizeHtmlWhitespace: true, modules: 'amd'}
            testFiles(files, options)
        })

        it('convert comment with AMD and ES6 modules', () => {
            const files = [
                {source: 'comment.rt', expected: 'comment.rt.amd.js', options: {modules: 'amd'}},
                {source: 'comment.rt', expected: 'comment.rt.es6.js', options: {modules: 'es6'}}
            ]
            files.forEach(check)
        })

        it('rt-require with all module types', () => {
            const files = [
                {source: 'require.rt', expected: 'require.rt.commonjs.js', options: {modules: 'commonjs'}},
                {source: 'require.rt', expected: 'require.rt.amd.js', options: {modules: 'amd', name: 'div'}},
                {source: 'require.rt', expected: 'require.rt.globals.js', options: {modules: 'none', name: 'div'}},
                {source: 'require.rt', expected: 'require.rt.es6.js', options: {modules: 'es6'}},
                {source: 'require.rt', expected: 'require.rt.typescript.ts', options: {modules: 'typescript'}}
            ]
            files.forEach(check)
        })

        it('rt-import with all module types', () => {
            const files = [
                {source: 'import.rt', expected: 'import.rt.commonjs.js', options: {modules: 'commonjs'}},
                {source: 'import.rt', expected: 'import.rt.amd.js', options: {modules: 'amd', name: 'div'}},
                {source: 'import.rt', expected: 'import.rt.globals.js', options: {modules: 'none', name: 'div'}},
                {source: 'import.rt', expected: 'import.rt.es6.js', options: {modules: 'es6'}},
                {source: 'import.rt', expected: 'import.rt.typescript.ts', options: {modules: 'typescript'}}
            ]
            files.forEach(check)
        })

        it('convert jsrt and test source results', () => {
            const files = ['simple.jsrt']
            files.forEach(file => {
                const filename = path.join(dataPath, file)
                const js = readFileNormalized(filename)
                const expected = readFileNormalized(path.join(dataPath, file.replace('.jsrt', '.js')))
                const actual = reactTemplates.convertJSRTToJS(js, context).replace(/\r/g, '').trim()
                compareAndWrite(actual, expected, filename)
            })
        })
    })
})
