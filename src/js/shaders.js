/**
 * @desc Creates the vertex and fragment shaders
 * 
 * @constructor
 * @return {Object}
 */
export default class Shader {
    constructor() {
        return {
            fragment: this.getFragment(),
            vertex: this.getVertex()
        };
    }

    getFragment() {
        return `
            void main(){
                
            }
        `;
    }

    getVertex() {
        return `
            void main(){
                
            }
        `;
    }
}