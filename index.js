const traverse = require('traverse')
const validTypes = ['sync', 'async', 'source', 'sink', 'duplex']

module.exports = function(api, manifest, wrap) {
  manifest = traverse(manifest)
  return traverse(api).map(function(x) {
    if (!this.isLeaf) return
    if (typeof x !== 'function') throw new Error('non-function as leaf in api object')
    const type = manifest.get(this.path)
    if (!validTypes.includes(type)) throw new Error(`invalid type at path ${this.path}: ${type}`)
    this.update(wrap(x, type, this.path))
  })
}
