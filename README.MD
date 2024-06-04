## File IO

An abstract interface, with some helpers, for working with the file system. 

It's intended to be cross-environment, but currently is only for Node.

## Roadmap

### Support Deno


## Build 

### Troubleshooting 

#### Jest pains 

In theory it should be simple to get ESM working with Jest (all the code is written for ESM); but I've found switching the whole npm package to ESM to be full of sharks. So it's commonjs for now, with caveats for certain ESM modules / techniques (below).

Longer term the package should move to ESM, but for now...

##### Importing 3rd party ESM modules

Jest will complain about "import" statements. So tell Jest to not try to transform those packages, just use them.

In jest.config.ts:
```
transformIgnorePatterns: [
    // Don't transform node_modules for any other ES modules you use
    '/node_modules/(?!lodash-es|dot-prop|\@electric\-sql\/pglite|pkg-dir|find-up-simple|inquirer|chalk|ansi-styles|filenamify|filename-reserved-regex)'
],
```

##### Getting import.meta.url working with Jest

Follow this: https://stackoverflow.com/questions/64961387/how-to-use-import-meta-when-testing-with-jest to use the babel plugin: https://github.com/javiertury/babel-plugin-transform-import-meta 

In jest.config.ts, I had to make the file explicit to use Babel instead of ts-jest:
```
transform: {
        // Use babel-jest to transform JS files
        '^.+\\.(js|jsx)$': 'babel-jest',
        '^.+getInvokedScriptDirectory\\.ts$': 'babel-jest',
        // Use ts-jest for ts/tsx files
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
```

An alternative solution would have been to create a __mocks__ folder, with getInvokedScriptDirectory.ts, and then update jest.config.js with: 
```
moduleNameMapper: {
    '^./getInvokedScriptDirectory$': '<rootDir>/path/to/__mocks__/getInvokedScriptDirectory.ts',
},
```