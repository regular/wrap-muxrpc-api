const traverse = require('traverse')
const validTypes = ['sync', 'async', 'source', 'sink', 'duplex']

module.exports = function(api, manifest, wrap) {
  api = traverse(api)
  return traverse(manifest).map(function(type) {
    if (!this.isLeaf || !this.path.length || (typeof type == 'object' && Object.keys(type).length == 0)) return
    if (type == undefined) return
    const x = api.get(this.path)
    if (typeof x !== 'function') throw new Error(`non-function as leaf in api object. ${this.path.join('.')} is ${typeof x}`)
    if (!validTypes.includes(type)) throw new Error(`invalid type at path ${this.path}: ${type}`)
    this.update(wrap(x, type, this.path))
  })
}
