## File IO

Useful helpers for working with the file system.

The original problems: 
1. I find myself writing the same 2-3 lines each time (e.g. to check a file exists before deleting it)
2. I can never remember the exact command to use, especially when there are alternatives (readdir vs glob)
3. Sometimes the functions don't do as I expect (e.g. Node's `relative` behaves counter-intuitively when the first path is a file instead of a directory)

Most of the benefit comes from: 
- Using JSDoc and the type system to make it easy to remember the most common use cases 
- Flexible error handling (returns them or throws them)


