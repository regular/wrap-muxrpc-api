const test = require('tape')
const wrapAPI = require('../')

test('reject non-functions as leaves', t =>{
  t.throws( ()=>{
    wrapAPI({x: 1}, {x: 'sync'}, ()=>{})
  }, /non-function/, 'throws when encountering non-function as leaf')
  t.end()
})

test('reject invalid tyoes', t =>{
  t.doesNotThrow( ()=>{
    wrapAPI({x: ()=>{}}, {}, ()=>{})
  }, 'does not throw when not in manifest')
  t.throws( ()=>{
    wrapAPI({x: ()=>{}}, {x: 'xxx'}, ()=>{})
  }, /invalid type/, 'throws when unknown type in manifest')

  const ret = wrapAPI({
    a: ()=>{},
    b: ()=>{},
    c: ()=>{},
    d: ()=>{},
    e: ()=>{}
  }, {
    a: 'sync',
    b: 'async',
    c: 'source',
    d: 'sink',
    e: 'duplex'
  }, ()=>{})
  t.ok(ret, 'does not throw for valid types')
  t.end()
})

test('calls wrap with correct args', t=>{
  function a() {}
  function b() {}
  function c() {}
  function d() {}
  function e() {}

  const calls = []
  const api = {
    a,
    b,
    c,
    d,
    e
  }
  const manifest = {
    a: 'sync',
    b: 'async',
    c: 'source',
    d: 'sink',
    e: 'duplex'
  }
  const api2 = Object.assign({}, api)
  const manifest2 = Object.assign({}, manifest)
  const ret = wrapAPI(api, manifest, function() {
    calls.push(Array.from(arguments))
  })
  t.deepEqual(api, api2, 'argument1 was not modified')
  t.deepEqual(manifest, manifest2, 'argument2 was not modified')
  t.deepEqual(calls, [
    [a, 'sync', ['a']],
    [b, 'async', ['b']],
    [c, 'source', ['c']],
    [d, 'sink', ['d']],
    [e, 'duplex', ['e']]
  ])
  t.end()
})

test('returne wrapped api', t => {
  function a() {}
  function b() {}

  const api = {
    a,
    foo: {
      b
    }
  }
  const manifest = {
    a: 'sync',
    foo: {
      b: 'sync'
    }
  }

  newApi = wrapAPI(api, manifest, (f, type, path) =>{
    if (f == a) return function A() {
      t.ok(true, 'wrapper for a was called')
    }
    return function B() {
      t.ok(true, 'wrapper for b was called')
    }
  })
  t.plan(2)
  newApi.a()
  newApi.foo.b()
})
