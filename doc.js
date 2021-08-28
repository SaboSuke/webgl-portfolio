/**
 * * THIS IS SOME IMPORTANT INFORMATION
 * @param  {Number} a=0
 * @param  {String} b='none'
 * ! danger, may have some problems
 * ? Should this method be exposed to a public API
 * TODO fix the problem
 */
function doSomething(a = 0, b = 'none') {
    return some(a, b);
}

const some = (a, b) => a + b;