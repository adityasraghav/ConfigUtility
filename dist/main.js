(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (factory());
}(this, (function () { 'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {}

function interopDefault(ex) {
	return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var riot = createCommonjsModule(function (module, exports) {
/* Riot v2.6.1, @license MIT */

;(function(window, undefined) {
  'use strict';
var riot = { version: 'v2.6.1', settings: {} },
  // be aware, internal usage
  // ATTENTION: prefix the global dynamic variables with `__`

  // counter to give a unique id to all the Tag instances
  __uid = 0,
  // tags instances cache
  __virtualDom = [],
  // tags implementation cache
  __tagImpl = {},

  /**
   * Const
   */
  GLOBAL_MIXIN = '__global_mixin',

  // riot specific prefixes
  RIOT_PREFIX = 'riot-',
  RIOT_TAG = RIOT_PREFIX + 'tag',
  RIOT_TAG_IS = 'data-is',

  // for typeof == '' comparisons
  T_STRING = 'string',
  T_OBJECT = 'object',
  T_UNDEF  = 'undefined',
  T_FUNCTION = 'function',
  XLINK_NS = 'http://www.w3.org/1999/xlink',
  XLINK_REGEX = /^xlink:(\w+)/,
  // special native tags that cannot be treated like the others
  SPECIAL_TAGS_REGEX = /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?|opt(?:ion|group))$/,
  RESERVED_WORDS_BLACKLIST = /^(?:_(?:item|id|parent)|update|root|(?:un)?mount|mixin|is(?:Mounted|Loop)|tags|parent|opts|trigger|o(?:n|ff|ne))$/,
  // SVG tags list https://www.w3.org/TR/SVG/attindex.html#PresentationAttributes
  SVG_TAGS_LIST = ['altGlyph', 'animate', 'animateColor', 'circle', 'clipPath', 'defs', 'ellipse', 'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feFlood', 'feGaussianBlur', 'feImage', 'feMerge', 'feMorphology', 'feOffset', 'feSpecularLighting', 'feTile', 'feTurbulence', 'filter', 'font', 'foreignObject', 'g', 'glyph', 'glyphRef', 'image', 'line', 'linearGradient', 'marker', 'mask', 'missing-glyph', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'stop', 'svg', 'switch', 'symbol', 'text', 'textPath', 'tref', 'tspan', 'use'],

  // version# for IE 8-11, 0 for others
  IE_VERSION = (window && window.document || {}).documentMode | 0,

  // detect firefox to fix #1374
  FIREFOX = window && !!window.InstallTrigger
/* istanbul ignore next */
riot.observable = function(el) {

  /**
   * Extend the original object or create a new empty one
   * @type { Object }
   */

  el = el || {}

  /**
   * Private variables
   */
  var callbacks = {},
    slice = Array.prototype.slice

  /**
   * Private Methods
   */

  /**
   * Helper function needed to get and loop all the events in a string
   * @param   { String }   e - event string
   * @param   {Function}   fn - callback
   */
  function onEachEvent(e, fn) {
    var es = e.split(' '), l = es.length, i = 0
    for (; i < l; i++) {
      var name = es[i]
      if (name) fn(name, i)
    }
  }

  /**
   * Public Api
   */

  // extend the el object adding the observable methods
  Object.defineProperties(el, {
    /**
     * Listen to the given space separated list of `events` and
     * execute the `callback` each time an event is triggered.
     * @param  { String } events - events ids
     * @param  { Function } fn - callback function
     * @returns { Object } el
     */
    on: {
      value: function(events, fn) {
        if (typeof fn != 'function')  return el

        onEachEvent(events, function(name, pos) {
          (callbacks[name] = callbacks[name] || []).push(fn)
          fn.typed = pos > 0
        })

        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Removes the given space separated list of `events` listeners
     * @param   { String } events - events ids
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
    off: {
      value: function(events, fn) {
        if (events == '*' && !fn) callbacks = {}
        else {
          onEachEvent(events, function(name, pos) {
            if (fn) {
              var arr = callbacks[name]
              for (var i = 0, cb; cb = arr && arr[i]; ++i) {
                if (cb == fn) arr.splice(i--, 1)
              }
            } else delete callbacks[name]
          })
        }
        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Listen to the given space separated list of `events` and
     * execute the `callback` at most once
     * @param   { String } events - events ids
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
    one: {
      value: function(events, fn) {
        function on() {
          el.off(events, on)
          fn.apply(el, arguments)
        }
        return el.on(events, on)
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Execute all callback functions that listen to
     * the given space separated list of `events`
     * @param   { String } events - events ids
     * @returns { Object } el
     */
    trigger: {
      value: function(events) {

        // getting the arguments
        var arglen = arguments.length - 1,
          args = new Array(arglen),
          fns

        for (var i = 0; i < arglen; i++) {
          args[i] = arguments[i + 1] // skip first argument
        }

        onEachEvent(events, function(name, pos) {

          fns = slice.call(callbacks[name] || [], 0)

          for (var i = 0, fn; fn = fns[i]; ++i) {
            if (fn.busy) continue
            fn.busy = 1
            fn.apply(el, fn.typed ? [name].concat(args) : args)
            if (fns[i] !== fn) { i-- }
            fn.busy = 0
          }

          if (callbacks['*'] && name != '*')
            el.trigger.apply(el, ['*', name].concat(args))

        })

        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    }
  })

  return el

}
/* istanbul ignore next */
;(function(riot) {

/**
 * Simple client-side router
 * @module riot-route
 */


var RE_ORIGIN = /^.+?\/\/+[^\/]+/,
  EVENT_LISTENER = 'EventListener',
  REMOVE_EVENT_LISTENER = 'remove' + EVENT_LISTENER,
  ADD_EVENT_LISTENER = 'add' + EVENT_LISTENER,
  HAS_ATTRIBUTE = 'hasAttribute',
  REPLACE = 'replace',
  POPSTATE = 'popstate',
  HASHCHANGE = 'hashchange',
  TRIGGER = 'trigger',
  MAX_EMIT_STACK_LEVEL = 3,
  win = typeof window != 'undefined' && window,
  doc = typeof document != 'undefined' && document,
  hist = win && history,
  loc = win && (hist.location || win.location), // see html5-history-api
  prot = Router.prototype, // to minify more
  clickEvent = doc && doc.ontouchstart ? 'touchstart' : 'click',
  started = false,
  central = riot.observable(),
  routeFound = false,
  debouncedEmit,
  base, current, parser, secondParser, emitStack = [], emitStackLevel = 0

/**
 * Default parser. You can replace it via router.parser method.
 * @param {string} path - current path (normalized)
 * @returns {array} array
 */
function DEFAULT_PARSER(path) {
  return path.split(/[/?#]/)
}

/**
 * Default parser (second). You can replace it via router.parser method.
 * @param {string} path - current path (normalized)
 * @param {string} filter - filter string (normalized)
 * @returns {array} array
 */
function DEFAULT_SECOND_PARSER(path, filter) {
  var re = new RegExp('^' + filter[REPLACE](/\*/g, '([^/?#]+?)')[REPLACE](/\.\./, '.*') + '$'),
    args = path.match(re)

  if (args) return args.slice(1)
}

/**
 * Simple/cheap debounce implementation
 * @param   {function} fn - callback
 * @param   {number} delay - delay in seconds
 * @returns {function} debounced function
 */
function debounce(fn, delay) {
  var t
  return function () {
    clearTimeout(t)
    t = setTimeout(fn, delay)
  }
}

/**
 * Set the window listeners to trigger the routes
 * @param {boolean} autoExec - see route.start
 */
function start(autoExec) {
  debouncedEmit = debounce(emit, 1)
  win[ADD_EVENT_LISTENER](POPSTATE, debouncedEmit)
  win[ADD_EVENT_LISTENER](HASHCHANGE, debouncedEmit)
  doc[ADD_EVENT_LISTENER](clickEvent, click)
  if (autoExec) emit(true)
}

/**
 * Router class
 */
function Router() {
  this.$ = []
  riot.observable(this) // make it observable
  central.on('stop', this.s.bind(this))
  central.on('emit', this.e.bind(this))
}

function normalize(path) {
  return path[REPLACE](/^\/|\/$/, '')
}

function isString(str) {
  return typeof str == 'string'
}

/**
 * Get the part after domain name
 * @param {string} href - fullpath
 * @returns {string} path from root
 */
function getPathFromRoot(href) {
  return (href || loc.href)[REPLACE](RE_ORIGIN, '')
}

/**
 * Get the part after base
 * @param {string} href - fullpath
 * @returns {string} path from base
 */
function getPathFromBase(href) {
  return base[0] == '#'
    ? (href || loc.href || '').split(base)[1] || ''
    : (loc ? getPathFromRoot(href) : href || '')[REPLACE](base, '')
}

function emit(force) {
  // the stack is needed for redirections
  var isRoot = emitStackLevel == 0, first
  if (MAX_EMIT_STACK_LEVEL <= emitStackLevel) return

  emitStackLevel++
  emitStack.push(function() {
    var path = getPathFromBase()
    if (force || path != current) {
      central[TRIGGER]('emit', path)
      current = path
    }
  })
  if (isRoot) {
    while (first = emitStack.shift()) first() // stack increses within this call
    emitStackLevel = 0
  }
}

function click(e) {
  if (
    e.which != 1 // not left click
    || e.metaKey || e.ctrlKey || e.shiftKey // or meta keys
    || e.defaultPrevented // or default prevented
  ) return

  var el = e.target
  while (el && el.nodeName != 'A') el = el.parentNode

  if (
    !el || el.nodeName != 'A' // not A tag
    || el[HAS_ATTRIBUTE]('download') // has download attr
    || !el[HAS_ATTRIBUTE]('href') // has no href attr
    || el.target && el.target != '_self' // another window or frame
    || el.href.indexOf(loc.href.match(RE_ORIGIN)[0]) == -1 // cross origin
  ) return

  if (el.href != loc.href
    && (
      el.href.split('#')[0] == loc.href.split('#')[0] // internal jump
      || base[0] != '#' && getPathFromRoot(el.href).indexOf(base) !== 0 // outside of base
      || base[0] == '#' && el.href.split(base)[0] != loc.href.split(base)[0] // outside of #base
      || !go(getPathFromBase(el.href), el.title || doc.title) // route not found
    )) return

  e.preventDefault()
}

/**
 * Go to the path
 * @param {string} path - destination path
 * @param {string} title - page title
 * @param {boolean} shouldReplace - use replaceState or pushState
 * @returns {boolean} - route not found flag
 */
function go(path, title, shouldReplace) {
  // Server-side usage: directly execute handlers for the path
  if (!hist) return central[TRIGGER]('emit', getPathFromBase(path))

  path = base + normalize(path)
  title = title || doc.title
  // browsers ignores the second parameter `title`
  shouldReplace
    ? hist.replaceState(null, title, path)
    : hist.pushState(null, title, path)
  // so we need to set it manually
  doc.title = title
  routeFound = false
  emit()
  return routeFound
}

/**
 * Go to path or set action
 * a single string:                go there
 * two strings:                    go there with setting a title
 * two strings and boolean:        replace history with setting a title
 * a single function:              set an action on the default route
 * a string/RegExp and a function: set an action on the route
 * @param {(string|function)} first - path / action / filter
 * @param {(string|RegExp|function)} second - title / action
 * @param {boolean} third - replace flag
 */
prot.m = function(first, second, third) {
  if (isString(first) && (!second || isString(second))) go(first, second, third || false)
  else if (second) this.r(first, second)
  else this.r('@', first)
}

/**
 * Stop routing
 */
prot.s = function() {
  this.off('*')
  this.$ = []
}

/**
 * Emit
 * @param {string} path - path
 */
prot.e = function(path) {
  this.$.concat('@').some(function(filter) {
    var args = (filter == '@' ? parser : secondParser)(normalize(path), normalize(filter))
    if (typeof args != 'undefined') {
      this[TRIGGER].apply(null, [filter].concat(args))
      return routeFound = true // exit from loop
    }
  }, this)
}

/**
 * Register route
 * @param {string} filter - filter for matching to url
 * @param {function} action - action to register
 */
prot.r = function(filter, action) {
  if (filter != '@') {
    filter = '/' + normalize(filter)
    this.$.push(filter)
  }
  this.on(filter, action)
}

var mainRouter = new Router()
var route = mainRouter.m.bind(mainRouter)

/**
 * Create a sub router
 * @returns {function} the method of a new Router object
 */
route.create = function() {
  var newSubRouter = new Router()
  // assign sub-router's main method
  var router = newSubRouter.m.bind(newSubRouter)
  // stop only this sub-router
  router.stop = newSubRouter.s.bind(newSubRouter)
  return router
}

/**
 * Set the base of url
 * @param {(str|RegExp)} arg - a new base or '#' or '#!'
 */
route.base = function(arg) {
  base = arg || '#'
  current = getPathFromBase() // recalculate current path
}

/** Exec routing right now **/
route.exec = function() {
  emit(true)
}

/**
 * Replace the default router to yours
 * @param {function} fn - your parser function
 * @param {function} fn2 - your secondParser function
 */
route.parser = function(fn, fn2) {
  if (!fn && !fn2) {
    // reset parser for testing...
    parser = DEFAULT_PARSER
    secondParser = DEFAULT_SECOND_PARSER
  }
  if (fn) parser = fn
  if (fn2) secondParser = fn2
}

/**
 * Helper function to get url query as an object
 * @returns {object} parsed query
 */
route.query = function() {
  var q = {}
  var href = loc.href || current
  href[REPLACE](/[?&](.+?)=([^&]*)/g, function(_, k, v) { q[k] = v })
  return q
}

/** Stop routing **/
route.stop = function () {
  if (started) {
    if (win) {
      win[REMOVE_EVENT_LISTENER](POPSTATE, debouncedEmit)
      win[REMOVE_EVENT_LISTENER](HASHCHANGE, debouncedEmit)
      doc[REMOVE_EVENT_LISTENER](clickEvent, click)
    }
    central[TRIGGER]('stop')
    started = false
  }
}

/**
 * Start routing
 * @param {boolean} autoExec - automatically exec after starting if true
 */
route.start = function (autoExec) {
  if (!started) {
    if (win) {
      if (document.readyState == 'complete') start(autoExec)
      // the timeout is needed to solve
      // a weird safari bug https://github.com/riot/route/issues/33
      else win[ADD_EVENT_LISTENER]('load', function() {
        setTimeout(function() { start(autoExec) }, 1)
      })
    }
    started = true
  }
}

/** Prepare the router **/
route.base()
route.parser()

riot.route = route
})(riot)
/* istanbul ignore next */

/**
 * The riot template engine
 * @version v2.4.1
 */
/**
 * riot.util.brackets
 *
 * - `brackets    ` - Returns a string or regex based on its parameter
 * - `brackets.set` - Change the current riot brackets
 *
 * @module
 */

var brackets = (function (UNDEF) {

  var
    REGLOB = 'g',

    R_MLCOMMS = /\/\*[^*]*\*+(?:[^*\/][^*]*\*+)*\//g,

    R_STRINGS = /"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'/g,

    S_QBLOCKS = R_STRINGS.source + '|' +
      /(?:\breturn\s+|(?:[$\w\)\]]|\+\+|--)\s*(\/)(?![*\/]))/.source + '|' +
      /\/(?=[^*\/])[^[\/\\]*(?:(?:\[(?:\\.|[^\]\\]*)*\]|\\.)[^[\/\\]*)*?(\/)[gim]*/.source,

    UNSUPPORTED = RegExp('[\\' + 'x00-\\x1F<>a-zA-Z0-9\'",;\\\\]'),

    NEED_ESCAPE = /(?=[[\]()*+?.^$|])/g,

    FINDBRACES = {
      '(': RegExp('([()])|'   + S_QBLOCKS, REGLOB),
      '[': RegExp('([[\\]])|' + S_QBLOCKS, REGLOB),
      '{': RegExp('([{}])|'   + S_QBLOCKS, REGLOB)
    },

    DEFAULT = '{ }'

  var _pairs = [
    '{', '}',
    '{', '}',
    /{[^}]*}/,
    /\\([{}])/g,
    /\\({)|{/g,
    RegExp('\\\\(})|([[({])|(})|' + S_QBLOCKS, REGLOB),
    DEFAULT,
    /^\s*{\^?\s*([$\w]+)(?:\s*,\s*(\S+))?\s+in\s+(\S.*)\s*}/,
    /(^|[^\\]){=[\S\s]*?}/
  ]

  var
    cachedBrackets = UNDEF,
    _regex,
    _cache = [],
    _settings

  function _loopback (re) { return re }

  function _rewrite (re, bp) {
    if (!bp) bp = _cache
    return new RegExp(
      re.source.replace(/{/g, bp[2]).replace(/}/g, bp[3]), re.global ? REGLOB : ''
    )
  }

  function _create (pair) {
    if (pair === DEFAULT) return _pairs

    var arr = pair.split(' ')

    if (arr.length !== 2 || UNSUPPORTED.test(pair)) {
      throw new Error('Unsupported brackets "' + pair + '"')
    }
    arr = arr.concat(pair.replace(NEED_ESCAPE, '\\').split(' '))

    arr[4] = _rewrite(arr[1].length > 1 ? /{[\S\s]*?}/ : _pairs[4], arr)
    arr[5] = _rewrite(pair.length > 3 ? /\\({|})/g : _pairs[5], arr)
    arr[6] = _rewrite(_pairs[6], arr)
    arr[7] = RegExp('\\\\(' + arr[3] + ')|([[({])|(' + arr[3] + ')|' + S_QBLOCKS, REGLOB)
    arr[8] = pair
    return arr
  }

  function _brackets (reOrIdx) {
    return reOrIdx instanceof RegExp ? _regex(reOrIdx) : _cache[reOrIdx]
  }

  _brackets.split = function split (str, tmpl, _bp) {
    // istanbul ignore next: _bp is for the compiler
    if (!_bp) _bp = _cache

    var
      parts = [],
      match,
      isexpr,
      start,
      pos,
      re = _bp[6]

    isexpr = start = re.lastIndex = 0

    while ((match = re.exec(str))) {

      pos = match.index

      if (isexpr) {

        if (match[2]) {
          re.lastIndex = skipBraces(str, match[2], re.lastIndex)
          continue
        }
        if (!match[3]) {
          continue
        }
      }

      if (!match[1]) {
        unescapeStr(str.slice(start, pos))
        start = re.lastIndex
        re = _bp[6 + (isexpr ^= 1)]
        re.lastIndex = start
      }
    }

    if (str && start < str.length) {
      unescapeStr(str.slice(start))
    }

    return parts

    function unescapeStr (s) {
      if (tmpl || isexpr) {
        parts.push(s && s.replace(_bp[5], '$1'))
      } else {
        parts.push(s)
      }
    }

    function skipBraces (s, ch, ix) {
      var
        match,
        recch = FINDBRACES[ch]

      recch.lastIndex = ix
      ix = 1
      while ((match = recch.exec(s))) {
        if (match[1] &&
          !(match[1] === ch ? ++ix : --ix)) break
      }
      return ix ? s.length : recch.lastIndex
    }
  }

  _brackets.hasExpr = function hasExpr (str) {
    return _cache[4].test(str)
  }

  _brackets.loopKeys = function loopKeys (expr) {
    var m = expr.match(_cache[9])

    return m
      ? { key: m[1], pos: m[2], val: _cache[0] + m[3].trim() + _cache[1] }
      : { val: expr.trim() }
  }

  _brackets.array = function array (pair) {
    return pair ? _create(pair) : _cache
  }

  function _reset (pair) {
    if ((pair || (pair = DEFAULT)) !== _cache[8]) {
      _cache = _create(pair)
      _regex = pair === DEFAULT ? _loopback : _rewrite
      _cache[9] = _regex(_pairs[9])
    }
    cachedBrackets = pair
  }

  function _setSettings (o) {
    var b

    o = o || {}
    b = o.brackets
    Object.defineProperty(o, 'brackets', {
      set: _reset,
      get: function () { return cachedBrackets },
      enumerable: true
    })
    _settings = o
    _reset(b)
  }

  Object.defineProperty(_brackets, 'settings', {
    set: _setSettings,
    get: function () { return _settings }
  })

  /* istanbul ignore next: in the browser riot is always in the scope */
  _brackets.settings = typeof riot !== 'undefined' && riot.settings || {}
  _brackets.set = _reset

  _brackets.R_STRINGS = R_STRINGS
  _brackets.R_MLCOMMS = R_MLCOMMS
  _brackets.S_QBLOCKS = S_QBLOCKS

  return _brackets

})()

/**
 * @module tmpl
 *
 * tmpl          - Root function, returns the template value, render with data
 * tmpl.hasExpr  - Test the existence of a expression inside a string
 * tmpl.loopKeys - Get the keys for an 'each' loop (used by `_each`)
 */

var tmpl = (function () {

  var _cache = {}

  function _tmpl (str, data) {
    if (!str) return str

    return (_cache[str] || (_cache[str] = _create(str))).call(data, _logErr)
  }

  _tmpl.haveRaw = brackets.hasRaw

  _tmpl.hasExpr = brackets.hasExpr

  _tmpl.loopKeys = brackets.loopKeys

  // istanbul ignore next
  _tmpl.clearCache = function () { _cache = {} }

  _tmpl.errorHandler = null

  function _logErr (err, ctx) {

    if (_tmpl.errorHandler) {

      err.riotData = {
        tagName: ctx && ctx.root && ctx.root.tagName,
        _riot_id: ctx && ctx._riot_id  //eslint-disable-line camelcase
      }
      _tmpl.errorHandler(err)
    }
  }

  function _create (str) {
    var expr = _getTmpl(str)

    if (expr.slice(0, 11) !== 'try{return ') expr = 'return ' + expr

    return new Function('E', expr + ';')    // eslint-disable-line no-new-func
  }

  var
    CH_IDEXPR = '\u2057',
    RE_CSNAME = /^(?:(-?[_A-Za-z\xA0-\xFF][-\w\xA0-\xFF]*)|\u2057(\d+)~):/,
    RE_QBLOCK = RegExp(brackets.S_QBLOCKS, 'g'),
    RE_DQUOTE = /\u2057/g,
    RE_QBMARK = /\u2057(\d+)~/g

  function _getTmpl (str) {
    var
      qstr = [],
      expr,
      parts = brackets.split(str.replace(RE_DQUOTE, '"'), 1)

    if (parts.length > 2 || parts[0]) {
      var i, j, list = []

      for (i = j = 0; i < parts.length; ++i) {

        expr = parts[i]

        if (expr && (expr = i & 1

            ? _parseExpr(expr, 1, qstr)

            : '"' + expr
                .replace(/\\/g, '\\\\')
                .replace(/\r\n?|\n/g, '\\n')
                .replace(/"/g, '\\"') +
              '"'

          )) list[j++] = expr

      }

      expr = j < 2 ? list[0]
           : '[' + list.join(',') + '].join("")'

    } else {

      expr = _parseExpr(parts[1], 0, qstr)
    }

    if (qstr[0]) {
      expr = expr.replace(RE_QBMARK, function (_, pos) {
        return qstr[pos]
          .replace(/\r/g, '\\r')
          .replace(/\n/g, '\\n')
      })
    }
    return expr
  }

  var
    RE_BREND = {
      '(': /[()]/g,
      '[': /[[\]]/g,
      '{': /[{}]/g
    }

  function _parseExpr (expr, asText, qstr) {

    expr = expr
          .replace(RE_QBLOCK, function (s, div) {
            return s.length > 2 && !div ? CH_IDEXPR + (qstr.push(s) - 1) + '~' : s
          })
          .replace(/\s+/g, ' ').trim()
          .replace(/\ ?([[\({},?\.:])\ ?/g, '$1')

    if (expr) {
      var
        list = [],
        cnt = 0,
        match

      while (expr &&
            (match = expr.match(RE_CSNAME)) &&
            !match.index
        ) {
        var
          key,
          jsb,
          re = /,|([[{(])|$/g

        expr = RegExp.rightContext
        key  = match[2] ? qstr[match[2]].slice(1, -1).trim().replace(/\s+/g, ' ') : match[1]

        while (jsb = (match = re.exec(expr))[1]) skipBraces(jsb, re)

        jsb  = expr.slice(0, match.index)
        expr = RegExp.rightContext

        list[cnt++] = _wrapExpr(jsb, 1, key)
      }

      expr = !cnt ? _wrapExpr(expr, asText)
           : cnt > 1 ? '[' + list.join(',') + '].join(" ").trim()' : list[0]
    }
    return expr

    function skipBraces (ch, re) {
      var
        mm,
        lv = 1,
        ir = RE_BREND[ch]

      ir.lastIndex = re.lastIndex
      while (mm = ir.exec(expr)) {
        if (mm[0] === ch) ++lv
        else if (!--lv) break
      }
      re.lastIndex = lv ? expr.length : ir.lastIndex
    }
  }

  // istanbul ignore next: not both
  var // eslint-disable-next-line max-len
    JS_CONTEXT = '"in this?this:' + (typeof window !== 'object' ? 'global' : 'window') + ').',
    JS_VARNAME = /[,{][$\w]+(?=:)|(^ *|[^$\w\.])(?!(?:typeof|true|false|null|undefined|in|instanceof|is(?:Finite|NaN)|void|NaN|new|Date|RegExp|Math)(?![$\w]))([$_A-Za-z][$\w]*)/g,
    JS_NOPROPS = /^(?=(\.[$\w]+))\1(?:[^.[(]|$)/

  function _wrapExpr (expr, asText, key) {
    var tb

    expr = expr.replace(JS_VARNAME, function (match, p, mvar, pos, s) {
      if (mvar) {
        pos = tb ? 0 : pos + match.length

        if (mvar !== 'this' && mvar !== 'global' && mvar !== 'window') {
          match = p + '("' + mvar + JS_CONTEXT + mvar
          if (pos) tb = (s = s[pos]) === '.' || s === '(' || s === '['
        } else if (pos) {
          tb = !JS_NOPROPS.test(s.slice(pos))
        }
      }
      return match
    })

    if (tb) {
      expr = 'try{return ' + expr + '}catch(e){E(e,this)}'
    }

    if (key) {

      expr = (tb
          ? 'function(){' + expr + '}.call(this)' : '(' + expr + ')'
        ) + '?"' + key + '":""'

    } else if (asText) {

      expr = 'function(v){' + (tb
          ? expr.replace('return ', 'v=') : 'v=(' + expr + ')'
        ) + ';return v||v===0?v:""}.call(this)'
    }

    return expr
  }

  _tmpl.version = brackets.version = 'v2.4.1'

  return _tmpl

})()

/*
  lib/browser/tag/mkdom.js

  Includes hacks needed for the Internet Explorer version 9 and below
  See: http://kangax.github.io/compat-table/es5/#ie8
       http://codeplanet.io/dropping-ie8/
*/
var mkdom = (function _mkdom() {
  var
    reHasYield  = /<yield\b/i,
    reYieldAll  = /<yield\s*(?:\/>|>([\S\s]*?)<\/yield\s*>|>)/ig,
    reYieldSrc  = /<yield\s+to=['"]([^'">]*)['"]\s*>([\S\s]*?)<\/yield\s*>/ig,
    reYieldDest = /<yield\s+from=['"]?([-\w]+)['"]?\s*(?:\/>|>([\S\s]*?)<\/yield\s*>)/ig
  var
    rootEls = { tr: 'tbody', th: 'tr', td: 'tr', col: 'colgroup' },
    tblTags = IE_VERSION && IE_VERSION < 10
      ? SPECIAL_TAGS_REGEX : /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?)$/

  /**
   * Creates a DOM element to wrap the given content. Normally an `DIV`, but can be
   * also a `TABLE`, `SELECT`, `TBODY`, `TR`, or `COLGROUP` element.
   *
   * @param   {string} templ  - The template coming from the custom tag definition
   * @param   {string} [html] - HTML content that comes from the DOM element where you
   *           will mount the tag, mostly the original tag in the page
   * @returns {HTMLElement} DOM element with _templ_ merged through `YIELD` with the _html_.
   */
  function _mkdom(templ, html) {
    var
      match   = templ && templ.match(/^\s*<([-\w]+)/),
      tagName = match && match[1].toLowerCase(),
      el = mkEl('div', isSVGTag(tagName))

    // replace all the yield tags with the tag inner html
    templ = replaceYield(templ, html)

    /* istanbul ignore next */
    if (tblTags.test(tagName))
      el = specialTags(el, templ, tagName)
    else
      setInnerHTML(el, templ)

    el.stub = true

    return el
  }

  /*
    Creates the root element for table or select child elements:
    tr/th/td/thead/tfoot/tbody/caption/col/colgroup/option/optgroup
  */
  function specialTags(el, templ, tagName) {
    var
      select = tagName[0] === 'o',
      parent = select ? 'select>' : 'table>'

    // trim() is important here, this ensures we don't have artifacts,
    // so we can check if we have only one element inside the parent
    el.innerHTML = '<' + parent + templ.trim() + '</' + parent
    parent = el.firstChild

    // returns the immediate parent if tr/th/td/col is the only element, if not
    // returns the whole tree, as this can include additional elements
    if (select) {
      parent.selectedIndex = -1  // for IE9, compatible w/current riot behavior
    } else {
      // avoids insertion of cointainer inside container (ex: tbody inside tbody)
      var tname = rootEls[tagName]
      if (tname && parent.childElementCount === 1) parent = $(tname, parent)
    }
    return parent
  }

  /*
    Replace the yield tag from any tag template with the innerHTML of the
    original tag in the page
  */
  function replaceYield(templ, html) {
    // do nothing if no yield
    if (!reHasYield.test(templ)) return templ

    // be careful with #1343 - string on the source having `$1`
    var src = {}

    html = html && html.replace(reYieldSrc, function (_, ref, text) {
      src[ref] = src[ref] || text   // preserve first definition
      return ''
    }).trim()

    return templ
      .replace(reYieldDest, function (_, ref, def) {  // yield with from - to attrs
        return src[ref] || def || ''
      })
      .replace(reYieldAll, function (_, def) {        // yield without any "from"
        return html || def || ''
      })
  }

  return _mkdom

})()

/**
 * Convert the item looped into an object used to extend the child tag properties
 * @param   { Object } expr - object containing the keys used to extend the children tags
 * @param   { * } key - value to assign to the new object returned
 * @param   { * } val - value containing the position of the item in the array
 * @returns { Object } - new object containing the values of the original item
 *
 * The variables 'key' and 'val' are arbitrary.
 * They depend on the collection type looped (Array, Object)
 * and on the expression used on the each tag
 *
 */
function mkitem(expr, key, val) {
  var item = {}
  item[expr.key] = key
  if (expr.pos) item[expr.pos] = val
  return item
}

/**
 * Unmount the redundant tags
 * @param   { Array } items - array containing the current items to loop
 * @param   { Array } tags - array containing all the children tags
 */
function unmountRedundant(items, tags) {

  var i = tags.length,
    j = items.length,
    t

  while (i > j) {
    t = tags[--i]
    tags.splice(i, 1)
    t.unmount()
  }
}

/**
 * Move the nested custom tags in non custom loop tags
 * @param   { Object } child - non custom loop tag
 * @param   { Number } i - current position of the loop tag
 */
function moveNestedTags(child, i) {
  Object.keys(child.tags).forEach(function(tagName) {
    var tag = child.tags[tagName]
    if (isArray(tag))
      each(tag, function (t) {
        moveChildTag(t, tagName, i)
      })
    else
      moveChildTag(tag, tagName, i)
  })
}

/**
 * Adds the elements for a virtual tag
 * @param { Tag } tag - the tag whose root's children will be inserted or appended
 * @param { Node } src - the node that will do the inserting or appending
 * @param { Tag } target - only if inserting, insert before this tag's first child
 */
function addVirtual(tag, src, target) {
  var el = tag._root, sib
  tag._virts = []
  while (el) {
    sib = el.nextSibling
    if (target)
      src.insertBefore(el, target._root)
    else
      src.appendChild(el)

    tag._virts.push(el) // hold for unmounting
    el = sib
  }
}

/**
 * Move virtual tag and all child nodes
 * @param { Tag } tag - first child reference used to start move
 * @param { Node } src  - the node that will do the inserting
 * @param { Tag } target - insert before this tag's first child
 * @param { Number } len - how many child nodes to move
 */
function moveVirtual(tag, src, target, len) {
  var el = tag._root, sib, i = 0
  for (; i < len; i++) {
    sib = el.nextSibling
    src.insertBefore(el, target._root)
    el = sib
  }
}


/**
 * Manage tags having the 'each'
 * @param   { Object } dom - DOM node we need to loop
 * @param   { Tag } parent - parent tag instance where the dom node is contained
 * @param   { String } expr - string contained in the 'each' attribute
 */
function _each(dom, parent, expr) {

  // remove the each property from the original tag
  remAttr(dom, 'each')

  var mustReorder = typeof getAttr(dom, 'no-reorder') !== T_STRING || remAttr(dom, 'no-reorder'),
    tagName = getTagName(dom),
    impl = __tagImpl[tagName] || { tmpl: getOuterHTML(dom) },
    useRoot = SPECIAL_TAGS_REGEX.test(tagName),
    root = dom.parentNode,
    ref = document.createTextNode(''),
    child = getTag(dom),
    isOption = tagName.toLowerCase() === 'option', // the option tags must be treated differently
    tags = [],
    oldItems = [],
    hasKeys,
    isVirtual = dom.tagName == 'VIRTUAL'

  // parse the each expression
  expr = tmpl.loopKeys(expr)

  // insert a marked where the loop tags will be injected
  root.insertBefore(ref, dom)

  // clean template code
  parent.one('before-mount', function () {

    // remove the original DOM node
    dom.parentNode.removeChild(dom)
    if (root.stub) root = parent.root

  }).on('update', function () {
    // get the new items collection
    var items = tmpl(expr.val, parent),
      // create a fragment to hold the new DOM nodes to inject in the parent tag
      frag = document.createDocumentFragment()

    // object loop. any changes cause full redraw
    if (!isArray(items)) {
      hasKeys = items || false
      items = hasKeys ?
        Object.keys(items).map(function (key) {
          return mkitem(expr, key, items[key])
        }) : []
    }

    // loop all the new items
    var i = 0,
      itemsLength = items.length

    for (; i < itemsLength; i++) {
      // reorder only if the items are objects
      var
        item = items[i],
        _mustReorder = mustReorder && typeof item == T_OBJECT && !hasKeys,
        oldPos = oldItems.indexOf(item),
        pos = ~oldPos && _mustReorder ? oldPos : i,
        // does a tag exist in this position?
        tag = tags[pos]

      item = !hasKeys && expr.key ? mkitem(expr, item, i) : item

      // new tag
      if (
        !_mustReorder && !tag // with no-reorder we just update the old tags
        ||
        _mustReorder && !~oldPos || !tag // by default we always try to reorder the DOM elements
      ) {

        tag = new Tag(impl, {
          parent: parent,
          isLoop: true,
          hasImpl: !!__tagImpl[tagName],
          root: useRoot ? root : dom.cloneNode(),
          item: item
        }, dom.innerHTML)

        tag.mount()

        if (isVirtual) tag._root = tag.root.firstChild // save reference for further moves or inserts
        // this tag must be appended
        if (i == tags.length || !tags[i]) { // fix 1581
          if (isVirtual)
            addVirtual(tag, frag)
          else frag.appendChild(tag.root)
        }
        // this tag must be insert
        else {
          if (isVirtual)
            addVirtual(tag, root, tags[i])
          else root.insertBefore(tag.root, tags[i].root) // #1374 some browsers reset selected here
          oldItems.splice(i, 0, item)
        }

        tags.splice(i, 0, tag)
        pos = i // handled here so no move
      } else tag.update(item, true)

      // reorder the tag if it's not located in its previous position
      if (
        pos !== i && _mustReorder &&
        tags[i] // fix 1581 unable to reproduce it in a test!
      ) {
        // update the DOM
        if (isVirtual)
          moveVirtual(tag, root, tags[i], dom.childNodes.length)
        else if (tags[i].root.parentNode) root.insertBefore(tag.root, tags[i].root)
        // update the position attribute if it exists
        if (expr.pos)
          tag[expr.pos] = i
        // move the old tag instance
        tags.splice(i, 0, tags.splice(pos, 1)[0])
        // move the old item
        oldItems.splice(i, 0, oldItems.splice(pos, 1)[0])
        // if the loop tags are not custom
        // we need to move all their custom tags into the right position
        if (!child && tag.tags) moveNestedTags(tag, i)
      }

      // cache the original item to use it in the events bound to this node
      // and its children
      tag._item = item
      // cache the real parent tag internally
      defineProperty(tag, '_parent', parent)
    }

    // remove the redundant tags
    unmountRedundant(items, tags)

    // insert the new nodes
    root.insertBefore(frag, ref)
    if (isOption) {

      // #1374 FireFox bug in <option selected={expression}>
      if (FIREFOX && !root.multiple) {
        for (var n = 0; n < root.length; n++) {
          if (root[n].__riot1374) {
            root.selectedIndex = n  // clear other options
            delete root[n].__riot1374
            break
          }
        }
      }
    }

    // set the 'tags' property of the parent tag
    // if child is 'undefined' it means that we don't need to set this property
    // for example:
    // we don't need store the `myTag.tags['div']` property if we are looping a div tag
    // but we need to track the `myTag.tags['child']` property looping a custom child node named `child`
    if (child) parent.tags[tagName] = tags

    // clone the items array
    oldItems = items.slice()

  })

}
/**
 * Object that will be used to inject and manage the css of every tag instance
 */
var styleManager = (function(_riot) {

  if (!window) return { // skip injection on the server
    add: function () {},
    inject: function () {}
  }

  var styleNode = (function () {
    // create a new style element with the correct type
    var newNode = mkEl('style')
    setAttr(newNode, 'type', 'text/css')

    // replace any user node or insert the new one into the head
    var userNode = $('style[type=riot]')
    if (userNode) {
      if (userNode.id) newNode.id = userNode.id
      userNode.parentNode.replaceChild(newNode, userNode)
    }
    else document.getElementsByTagName('head')[0].appendChild(newNode)

    return newNode
  })()

  // Create cache and shortcut to the correct property
  var cssTextProp = styleNode.styleSheet,
    stylesToInject = ''

  // Expose the style node in a non-modificable property
  Object.defineProperty(_riot, 'styleNode', {
    value: styleNode,
    writable: true
  })

  /**
   * Public api
   */
  return {
    /**
     * Save a tag style to be later injected into DOM
     * @param   { String } css [description]
     */
    add: function(css) {
      stylesToInject += css
    },
    /**
     * Inject all previously saved tag styles into DOM
     * innerHTML seems slow: http://jsperf.com/riot-insert-style
     */
    inject: function() {
      if (stylesToInject) {
        if (cssTextProp) cssTextProp.cssText += stylesToInject
        else styleNode.innerHTML += stylesToInject
        stylesToInject = ''
      }
    }
  }

})(riot)


function parseNamedElements(root, tag, childTags, forceParsingNamed) {

  walk(root, function(dom) {
    if (dom.nodeType == 1) {
      dom.isLoop = dom.isLoop ||
                  (dom.parentNode && dom.parentNode.isLoop || getAttr(dom, 'each'))
                    ? 1 : 0

      // custom child tag
      if (childTags) {
        var child = getTag(dom)

        if (child && !dom.isLoop)
          childTags.push(initChildTag(child, {root: dom, parent: tag}, dom.innerHTML, tag))
      }

      if (!dom.isLoop || forceParsingNamed)
        setNamed(dom, tag, [])
    }

  })

}

function parseExpressions(root, tag, expressions) {

  function addExpr(dom, val, extra) {
    if (tmpl.hasExpr(val)) {
      expressions.push(extend({ dom: dom, expr: val }, extra))
    }
  }

  walk(root, function(dom) {
    var type = dom.nodeType,
      attr

    // text node
    if (type == 3 && dom.parentNode.tagName != 'STYLE') addExpr(dom, dom.nodeValue)
    if (type != 1) return

    /* element */

    // loop
    attr = getAttr(dom, 'each')

    if (attr) { _each(dom, tag, attr); return false }

    // attribute expressions
    each(dom.attributes, function(attr) {
      var name = attr.name,
        bool = name.split('__')[1]

      addExpr(dom, attr.value, { attr: bool || name, bool: bool })
      if (bool) { remAttr(dom, name); return false }

    })

    // skip custom tags
    if (getTag(dom)) return false

  })

}
function Tag(impl, conf, innerHTML) {

  var self = riot.observable(this),
    opts = inherit(conf.opts) || {},
    parent = conf.parent,
    isLoop = conf.isLoop,
    hasImpl = conf.hasImpl,
    item = cleanUpData(conf.item),
    expressions = [],
    childTags = [],
    root = conf.root,
    tagName = root.tagName.toLowerCase(),
    attr = {},
    propsInSyncWithParent = [],
    dom

  // only call unmount if we have a valid __tagImpl (has name property)
  if (impl.name && root._tag) root._tag.unmount(true)

  // not yet mounted
  this.isMounted = false
  root.isLoop = isLoop

  // keep a reference to the tag just created
  // so we will be able to mount this tag multiple times
  root._tag = this

  // create a unique id to this tag
  // it could be handy to use it also to improve the virtual dom rendering speed
  defineProperty(this, '_riot_id', ++__uid) // base 1 allows test !t._riot_id

  extend(this, { parent: parent, root: root, opts: opts}, item)
  // protect the "tags" property from being overridden
  defineProperty(this, 'tags', {})

  // grab attributes
  each(root.attributes, function(el) {
    var val = el.value
    // remember attributes with expressions only
    if (tmpl.hasExpr(val)) attr[el.name] = val
  })

  dom = mkdom(impl.tmpl, innerHTML)

  // options
  function updateOpts() {
    var ctx = hasImpl && isLoop ? self : parent || self

    // update opts from current DOM attributes
    each(root.attributes, function(el) {
      var val = el.value
      opts[toCamel(el.name)] = tmpl.hasExpr(val) ? tmpl(val, ctx) : val
    })
    // recover those with expressions
    each(Object.keys(attr), function(name) {
      opts[toCamel(name)] = tmpl(attr[name], ctx)
    })
  }

  function normalizeData(data) {
    for (var key in item) {
      if (typeof self[key] !== T_UNDEF && isWritable(self, key))
        self[key] = data[key]
    }
  }

  function inheritFrom(target) {
    each(Object.keys(target), function(k) {
      // some properties must be always in sync with the parent tag
      var mustSync = !RESERVED_WORDS_BLACKLIST.test(k) && contains(propsInSyncWithParent, k)

      if (typeof self[k] === T_UNDEF || mustSync) {
        // track the property to keep in sync
        // so we can keep it updated
        if (!mustSync) propsInSyncWithParent.push(k)
        self[k] = target[k]
      }
    })
  }

  /**
   * Update the tag expressions and options
   * @param   { * }  data - data we want to use to extend the tag properties
   * @param   { Boolean } isInherited - is this update coming from a parent tag?
   * @returns { self }
   */
  defineProperty(this, 'update', function(data, isInherited) {

    // make sure the data passed will not override
    // the component core methods
    data = cleanUpData(data)
    // inherit properties from the parent in loop
    if (isLoop) {
      inheritFrom(self.parent)
    }
    // normalize the tag properties in case an item object was initially passed
    if (data && isObject(item)) {
      normalizeData(data)
      item = data
    }
    extend(self, data)
    updateOpts()
    self.trigger('update', data)
    update(expressions, self)

    // the updated event will be triggered
    // once the DOM will be ready and all the re-flows are completed
    // this is useful if you want to get the "real" root properties
    // 4 ex: root.offsetWidth ...
    if (isInherited && self.parent)
      // closes #1599
      self.parent.one('updated', function() { self.trigger('updated') })
    else rAF(function() { self.trigger('updated') })

    return this
  })

  defineProperty(this, 'mixin', function() {
    each(arguments, function(mix) {
      var instance,
        props = [],
        obj

      mix = typeof mix === T_STRING ? riot.mixin(mix) : mix

      // check if the mixin is a function
      if (isFunction(mix)) {
        // create the new mixin instance
        instance = new mix()
      } else instance = mix

      // build multilevel prototype inheritance chain property list
      do props = props.concat(Object.getOwnPropertyNames(obj || instance))
      while (obj = Object.getPrototypeOf(obj || instance))

      // loop the keys in the function prototype or the all object keys
      each(props, function(key) {
        // bind methods to self
        // allow mixins to override other properties/parent mixins
        if (key != 'init') {
          // check for getters/setters
          var descriptor = Object.getOwnPropertyDescriptor(instance, key)
          var hasGetterSetter = descriptor && (descriptor.get || descriptor.set)

          // apply method only if it does not already exist on the instance
          if (!self.hasOwnProperty(key) && hasGetterSetter) {
            Object.defineProperty(self, key, descriptor)
          } else {
            self[key] = isFunction(instance[key]) ?
              instance[key].bind(self) :
              instance[key]
          }
        }
      })

      // init method will be called automatically
      if (instance.init) instance.init.bind(self)()
    })
    return this
  })

  defineProperty(this, 'mount', function() {

    updateOpts()

    // add global mixins
    var globalMixin = riot.mixin(GLOBAL_MIXIN)

    if (globalMixin)
      for (var i in globalMixin)
        if (globalMixin.hasOwnProperty(i))
          self.mixin(globalMixin[i])

    // children in loop should inherit from true parent
    if (self._parent) {
      inheritFrom(self._parent)
    }

    // initialiation
    if (impl.fn) impl.fn.call(self, opts)

    // parse layout after init. fn may calculate args for nested custom tags
    parseExpressions(dom, self, expressions)

    // mount the child tags
    toggle(true)

    // update the root adding custom attributes coming from the compiler
    // it fixes also #1087
    if (impl.attrs)
      walkAttributes(impl.attrs, function (k, v) { setAttr(root, k, v) })
    if (impl.attrs || hasImpl)
      parseExpressions(self.root, self, expressions)

    if (!self.parent || isLoop) self.update(item)

    // internal use only, fixes #403
    self.trigger('before-mount')

    if (isLoop && !hasImpl) {
      // update the root attribute for the looped elements
      root = dom.firstChild
    } else {
      while (dom.firstChild) root.appendChild(dom.firstChild)
      if (root.stub) root = parent.root
    }

    defineProperty(self, 'root', root)

    // parse the named dom nodes in the looped child
    // adding them to the parent as well
    if (isLoop)
      parseNamedElements(self.root, self.parent, null, true)

    // if it's not a child tag we can trigger its mount event
    if (!self.parent || self.parent.isMounted) {
      self.isMounted = true
      self.trigger('mount')
    }
    // otherwise we need to wait that the parent event gets triggered
    else self.parent.one('mount', function() {
      // avoid to trigger the `mount` event for the tags
      // not visible included in an if statement
      if (!isInStub(self.root)) {
        self.parent.isMounted = self.isMounted = true
        self.trigger('mount')
      }
    })
  })


  defineProperty(this, 'unmount', function(keepRootTag) {
    var el = root,
      p = el.parentNode,
      ptag,
      tagIndex = __virtualDom.indexOf(self)

    self.trigger('before-unmount')

    // remove this tag instance from the global virtualDom variable
    if (~tagIndex)
      __virtualDom.splice(tagIndex, 1)

    if (p) {

      if (parent) {
        ptag = getImmediateCustomParentTag(parent)
        // remove this tag from the parent tags object
        // if there are multiple nested tags with same name..
        // remove this element form the array
        if (isArray(ptag.tags[tagName]))
          each(ptag.tags[tagName], function(tag, i) {
            if (tag._riot_id == self._riot_id)
              ptag.tags[tagName].splice(i, 1)
          })
        else
          // otherwise just delete the tag instance
          ptag.tags[tagName] = undefined
      }

      else
        while (el.firstChild) el.removeChild(el.firstChild)

      if (!keepRootTag)
        p.removeChild(el)
      else {
        // the riot-tag and the data-is attributes aren't needed anymore, remove them
        remAttr(p, RIOT_TAG_IS)
        remAttr(p, RIOT_TAG) // this will be removed in riot 3.0.0
      }

    }

    if (this._virts) {
      each(this._virts, function(v) {
        if (v.parentNode) v.parentNode.removeChild(v)
      })
    }

    self.trigger('unmount')
    toggle()
    self.off('*')
    self.isMounted = false
    delete root._tag

  })

  // proxy function to bind updates
  // dispatched from a parent tag
  function onChildUpdate(data) { self.update(data, true) }

  function toggle(isMount) {

    // mount/unmount children
    each(childTags, function(child) { child[isMount ? 'mount' : 'unmount']() })

    // listen/unlisten parent (events flow one way from parent to children)
    if (!parent) return
    var evt = isMount ? 'on' : 'off'

    // the loop tags will be always in sync with the parent automatically
    if (isLoop)
      parent[evt]('unmount', self.unmount)
    else {
      parent[evt]('update', onChildUpdate)[evt]('unmount', self.unmount)
    }
  }


  // named elements available for fn
  parseNamedElements(dom, this, childTags)

}
/**
 * Attach an event to a DOM node
 * @param { String } name - event name
 * @param { Function } handler - event callback
 * @param { Object } dom - dom node
 * @param { Tag } tag - tag instance
 */
function setEventHandler(name, handler, dom, tag) {

  dom[name] = function(e) {

    var ptag = tag._parent,
      item = tag._item,
      el

    if (!item)
      while (ptag && !item) {
        item = ptag._item
        ptag = ptag._parent
      }

    // cross browser event fix
    e = e || window.event

    // override the event properties
    if (isWritable(e, 'currentTarget')) e.currentTarget = dom
    if (isWritable(e, 'target')) e.target = e.srcElement
    if (isWritable(e, 'which')) e.which = e.charCode || e.keyCode

    e.item = item

    // prevent default behaviour (by default)
    if (handler.call(tag, e) !== true && !/radio|check/.test(dom.type)) {
      if (e.preventDefault) e.preventDefault()
      e.returnValue = false
    }

    if (!e.preventUpdate) {
      el = item ? getImmediateCustomParentTag(ptag) : tag
      el.update()
    }

  }

}


/**
 * Insert a DOM node replacing another one (used by if- attribute)
 * @param   { Object } root - parent node
 * @param   { Object } node - node replaced
 * @param   { Object } before - node added
 */
function insertTo(root, node, before) {
  if (!root) return
  root.insertBefore(before, node)
  root.removeChild(node)
}

/**
 * Update the expressions in a Tag instance
 * @param   { Array } expressions - expression that must be re evaluated
 * @param   { Tag } tag - tag instance
 */
function update(expressions, tag) {

  each(expressions, function(expr, i) {

    var dom = expr.dom,
      attrName = expr.attr,
      value = tmpl(expr.expr, tag),
      parent = expr.parent || expr.dom.parentNode

    if (expr.bool) {
      value = !!value
    } else if (value == null) {
      value = ''
    }

    // #1638: regression of #1612, update the dom only if the value of the
    // expression was changed
    if (expr.value === value) {
      return
    }
    expr.value = value

    // textarea and text nodes has no attribute name
    if (!attrName) {
      // about #815 w/o replace: the browser converts the value to a string,
      // the comparison by "==" does too, but not in the server
      value += ''
      // test for parent avoids error with invalid assignment to nodeValue
      if (parent) {
        // cache the parent node because somehow it will become null on IE
        // on the next iteration
        expr.parent = parent
        if (parent.tagName === 'TEXTAREA') {
          parent.value = value                    // #1113
          if (!IE_VERSION) dom.nodeValue = value  // #1625 IE throws here, nodeValue
        }                                         // will be available on 'updated'
        else dom.nodeValue = value
      }
      return
    }

    // ~~#1612: look for changes in dom.value when updating the value~~
    if (attrName === 'value') {
      if (dom.value !== value) {
        dom.value = value
        setAttr(dom, attrName, value)
      }
      return
    } else {
      // remove original attribute
      remAttr(dom, attrName)
    }

    // event handler
    if (isFunction(value)) {
      setEventHandler(attrName, value, dom, tag)

    // if- conditional
    } else if (attrName == 'if') {
      var stub = expr.stub,
        add = function() { insertTo(stub.parentNode, stub, dom) },
        remove = function() { insertTo(dom.parentNode, dom, stub) }

      // add to DOM
      if (value) {
        if (stub) {
          add()
          dom.inStub = false
          // avoid to trigger the mount event if the tags is not visible yet
          // maybe we can optimize this avoiding to mount the tag at all
          if (!isInStub(dom)) {
            walk(dom, function(el) {
              if (el._tag && !el._tag.isMounted)
                el._tag.isMounted = !!el._tag.trigger('mount')
            })
          }
        }
      // remove from DOM
      } else {
        stub = expr.stub = stub || document.createTextNode('')
        // if the parentNode is defined we can easily replace the tag
        if (dom.parentNode)
          remove()
        // otherwise we need to wait the updated event
        else (tag.parent || tag).one('updated', remove)

        dom.inStub = true
      }
    // show / hide
    } else if (attrName === 'show') {
      dom.style.display = value ? '' : 'none'

    } else if (attrName === 'hide') {
      dom.style.display = value ? 'none' : ''

    } else if (expr.bool) {
      dom[attrName] = value
      if (value) setAttr(dom, attrName, attrName)
      if (FIREFOX && attrName === 'selected' && dom.tagName === 'OPTION') {
        dom.__riot1374 = value   // #1374
      }

    } else if (value === 0 || value && typeof value !== T_OBJECT) {
      // <img src="{ expr }">
      if (startsWith(attrName, RIOT_PREFIX) && attrName != RIOT_TAG) {
        attrName = attrName.slice(RIOT_PREFIX.length)
      }
      setAttr(dom, attrName, value)
    }

  })

}
/**
 * Specialized function for looping an array-like collection with `each={}`
 * @param   { Array } els - collection of items
 * @param   {Function} fn - callback function
 * @returns { Array } the array looped
 */
function each(els, fn) {
  var len = els ? els.length : 0

  for (var i = 0, el; i < len; i++) {
    el = els[i]
    // return false -> current item was removed by fn during the loop
    if (el != null && fn(el, i) === false) i--
  }
  return els
}

/**
 * Detect if the argument passed is a function
 * @param   { * } v - whatever you want to pass to this function
 * @returns { Boolean } -
 */
function isFunction(v) {
  return typeof v === T_FUNCTION || false   // avoid IE problems
}

/**
 * Get the outer html of any DOM node SVGs included
 * @param   { Object } el - DOM node to parse
 * @returns { String } el.outerHTML
 */
function getOuterHTML(el) {
  if (el.outerHTML) return el.outerHTML
  // some browsers do not support outerHTML on the SVGs tags
  else {
    var container = mkEl('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

/**
 * Set the inner html of any DOM node SVGs included
 * @param { Object } container - DOM node where we will inject the new html
 * @param { String } html - html to inject
 */
function setInnerHTML(container, html) {
  if (typeof container.innerHTML != T_UNDEF) container.innerHTML = html
  // some browsers do not support innerHTML on the SVGs tags
  else {
    var doc = new DOMParser().parseFromString(html, 'application/xml')
    container.appendChild(
      container.ownerDocument.importNode(doc.documentElement, true)
    )
  }
}

/**
 * Checks wether a DOM node must be considered part of an svg document
 * @param   { String }  name - tag name
 * @returns { Boolean } -
 */
function isSVGTag(name) {
  return ~SVG_TAGS_LIST.indexOf(name)
}

/**
 * Detect if the argument passed is an object, exclude null.
 * NOTE: Use isObject(x) && !isArray(x) to excludes arrays.
 * @param   { * } v - whatever you want to pass to this function
 * @returns { Boolean } -
 */
function isObject(v) {
  return v && typeof v === T_OBJECT         // typeof null is 'object'
}

/**
 * Remove any DOM attribute from a node
 * @param   { Object } dom - DOM node we want to update
 * @param   { String } name - name of the property we want to remove
 */
function remAttr(dom, name) {
  dom.removeAttribute(name)
}

/**
 * Convert a string containing dashes to camel case
 * @param   { String } string - input string
 * @returns { String } my-string -> myString
 */
function toCamel(string) {
  return string.replace(/-(\w)/g, function(_, c) {
    return c.toUpperCase()
  })
}

/**
 * Get the value of any DOM attribute on a node
 * @param   { Object } dom - DOM node we want to parse
 * @param   { String } name - name of the attribute we want to get
 * @returns { String | undefined } name of the node attribute whether it exists
 */
function getAttr(dom, name) {
  return dom.getAttribute(name)
}

/**
 * Set any DOM/SVG attribute
 * @param { Object } dom - DOM node we want to update
 * @param { String } name - name of the property we want to set
 * @param { String } val - value of the property we want to set
 */
function setAttr(dom, name, val) {
  var xlink = XLINK_REGEX.exec(name)
  if (xlink && xlink[1])
    dom.setAttributeNS(XLINK_NS, xlink[1], val)
  else
    dom.setAttribute(name, val)
}

/**
 * Detect the tag implementation by a DOM node
 * @param   { Object } dom - DOM node we need to parse to get its tag implementation
 * @returns { Object } it returns an object containing the implementation of a custom tag (template and boot function)
 */
function getTag(dom) {
  return dom.tagName && __tagImpl[getAttr(dom, RIOT_TAG_IS) ||
    getAttr(dom, RIOT_TAG) || dom.tagName.toLowerCase()]
}
/**
 * Add a child tag to its parent into the `tags` object
 * @param   { Object } tag - child tag instance
 * @param   { String } tagName - key where the new tag will be stored
 * @param   { Object } parent - tag instance where the new child tag will be included
 */
function addChildTag(tag, tagName, parent) {
  var cachedTag = parent.tags[tagName]

  // if there are multiple children tags having the same name
  if (cachedTag) {
    // if the parent tags property is not yet an array
    // create it adding the first cached tag
    if (!isArray(cachedTag))
      // don't add the same tag twice
      if (cachedTag !== tag)
        parent.tags[tagName] = [cachedTag]
    // add the new nested tag to the array
    if (!contains(parent.tags[tagName], tag))
      parent.tags[tagName].push(tag)
  } else {
    parent.tags[tagName] = tag
  }
}

/**
 * Move the position of a custom tag in its parent tag
 * @param   { Object } tag - child tag instance
 * @param   { String } tagName - key where the tag was stored
 * @param   { Number } newPos - index where the new tag will be stored
 */
function moveChildTag(tag, tagName, newPos) {
  var parent = tag.parent,
    tags
  // no parent no move
  if (!parent) return

  tags = parent.tags[tagName]

  if (isArray(tags))
    tags.splice(newPos, 0, tags.splice(tags.indexOf(tag), 1)[0])
  else addChildTag(tag, tagName, parent)
}

/**
 * Create a new child tag including it correctly into its parent
 * @param   { Object } child - child tag implementation
 * @param   { Object } opts - tag options containing the DOM node where the tag will be mounted
 * @param   { String } innerHTML - inner html of the child node
 * @param   { Object } parent - instance of the parent tag including the child custom tag
 * @returns { Object } instance of the new child tag just created
 */
function initChildTag(child, opts, innerHTML, parent) {
  var tag = new Tag(child, opts, innerHTML),
    tagName = getTagName(opts.root),
    ptag = getImmediateCustomParentTag(parent)
  // fix for the parent attribute in the looped elements
  tag.parent = ptag
  // store the real parent tag
  // in some cases this could be different from the custom parent tag
  // for example in nested loops
  tag._parent = parent

  // add this tag to the custom parent tag
  addChildTag(tag, tagName, ptag)
  // and also to the real parent tag
  if (ptag !== parent)
    addChildTag(tag, tagName, parent)
  // empty the child node once we got its template
  // to avoid that its children get compiled multiple times
  opts.root.innerHTML = ''

  return tag
}

/**
 * Loop backward all the parents tree to detect the first custom parent tag
 * @param   { Object } tag - a Tag instance
 * @returns { Object } the instance of the first custom parent tag found
 */
function getImmediateCustomParentTag(tag) {
  var ptag = tag
  while (!getTag(ptag.root)) {
    if (!ptag.parent) break
    ptag = ptag.parent
  }
  return ptag
}

/**
 * Helper function to set an immutable property
 * @param   { Object } el - object where the new property will be set
 * @param   { String } key - object key where the new property will be stored
 * @param   { * } value - value of the new property
* @param   { Object } options - set the propery overriding the default options
 * @returns { Object } - the initial object
 */
function defineProperty(el, key, value, options) {
  Object.defineProperty(el, key, extend({
    value: value,
    enumerable: false,
    writable: false,
    configurable: true
  }, options))
  return el
}

/**
 * Get the tag name of any DOM node
 * @param   { Object } dom - DOM node we want to parse
 * @returns { String } name to identify this dom node in riot
 */
function getTagName(dom) {
  var child = getTag(dom),
    namedTag = getAttr(dom, 'name'),
    tagName = namedTag && !tmpl.hasExpr(namedTag) ?
                namedTag :
              child ? child.name : dom.tagName.toLowerCase()

  return tagName
}

/**
 * Extend any object with other properties
 * @param   { Object } src - source object
 * @returns { Object } the resulting extended object
 *
 * var obj = { foo: 'baz' }
 * extend(obj, {bar: 'bar', foo: 'bar'})
 * console.log(obj) => {bar: 'bar', foo: 'bar'}
 *
 */
function extend(src) {
  var obj, args = arguments
  for (var i = 1; i < args.length; ++i) {
    if (obj = args[i]) {
      for (var key in obj) {
        // check if this property of the source object could be overridden
        if (isWritable(src, key))
          src[key] = obj[key]
      }
    }
  }
  return src
}

/**
 * Check whether an array contains an item
 * @param   { Array } arr - target array
 * @param   { * } item - item to test
 * @returns { Boolean } Does 'arr' contain 'item'?
 */
function contains(arr, item) {
  return ~arr.indexOf(item)
}

/**
 * Check whether an object is a kind of array
 * @param   { * } a - anything
 * @returns {Boolean} is 'a' an array?
 */
function isArray(a) { return Array.isArray(a) || a instanceof Array }

/**
 * Detect whether a property of an object could be overridden
 * @param   { Object }  obj - source object
 * @param   { String }  key - object property
 * @returns { Boolean } is this property writable?
 */
function isWritable(obj, key) {
  var props = Object.getOwnPropertyDescriptor(obj, key)
  return typeof obj[key] === T_UNDEF || props && props.writable
}


/**
 * With this function we avoid that the internal Tag methods get overridden
 * @param   { Object } data - options we want to use to extend the tag instance
 * @returns { Object } clean object without containing the riot internal reserved words
 */
function cleanUpData(data) {
  if (!(data instanceof Tag) && !(data && typeof data.trigger == T_FUNCTION))
    return data

  var o = {}
  for (var key in data) {
    if (!RESERVED_WORDS_BLACKLIST.test(key)) o[key] = data[key]
  }
  return o
}

/**
 * Walk down recursively all the children tags starting dom node
 * @param   { Object }   dom - starting node where we will start the recursion
 * @param   { Function } fn - callback to transform the child node just found
 */
function walk(dom, fn) {
  if (dom) {
    // stop the recursion
    if (fn(dom) === false) return
    else {
      dom = dom.firstChild

      while (dom) {
        walk(dom, fn)
        dom = dom.nextSibling
      }
    }
  }
}

/**
 * Minimize risk: only zero or one _space_ between attr & value
 * @param   { String }   html - html string we want to parse
 * @param   { Function } fn - callback function to apply on any attribute found
 */
function walkAttributes(html, fn) {
  var m,
    re = /([-\w]+) ?= ?(?:"([^"]*)|'([^']*)|({[^}]*}))/g

  while (m = re.exec(html)) {
    fn(m[1].toLowerCase(), m[2] || m[3] || m[4])
  }
}

/**
 * Check whether a DOM node is in stub mode, useful for the riot 'if' directive
 * @param   { Object }  dom - DOM node we want to parse
 * @returns { Boolean } -
 */
function isInStub(dom) {
  while (dom) {
    if (dom.inStub) return true
    dom = dom.parentNode
  }
  return false
}

/**
 * Create a generic DOM node
 * @param   { String } name - name of the DOM node we want to create
 * @param   { Boolean } isSvg - should we use a SVG as parent node?
 * @returns { Object } DOM node just created
 */
function mkEl(name, isSvg) {
  return isSvg ?
    document.createElementNS('http://www.w3.org/2000/svg', 'svg') :
    document.createElement(name)
}

/**
 * Shorter and fast way to select multiple nodes in the DOM
 * @param   { String } selector - DOM selector
 * @param   { Object } ctx - DOM node where the targets of our search will is located
 * @returns { Object } dom nodes found
 */
function $$(selector, ctx) {
  return (ctx || document).querySelectorAll(selector)
}

/**
 * Shorter and fast way to select a single node in the DOM
 * @param   { String } selector - unique dom selector
 * @param   { Object } ctx - DOM node where the target of our search will is located
 * @returns { Object } dom node found
 */
function $(selector, ctx) {
  return (ctx || document).querySelector(selector)
}

/**
 * Simple object prototypal inheritance
 * @param   { Object } parent - parent object
 * @returns { Object } child instance
 */
function inherit(parent) {
  function Child() {}
  Child.prototype = parent
  return new Child()
}

/**
 * Get the name property needed to identify a DOM node in riot
 * @param   { Object } dom - DOM node we need to parse
 * @returns { String | undefined } give us back a string to identify this dom node
 */
function getNamedKey(dom) {
  return getAttr(dom, 'id') || getAttr(dom, 'name')
}

/**
 * Set the named properties of a tag element
 * @param { Object } dom - DOM node we need to parse
 * @param { Object } parent - tag instance where the named dom element will be eventually added
 * @param { Array } keys - list of all the tag instance properties
 */
function setNamed(dom, parent, keys) {
  // get the key value we want to add to the tag instance
  var key = getNamedKey(dom),
    isArr,
    // add the node detected to a tag instance using the named property
    add = function(value) {
      // avoid to override the tag properties already set
      if (contains(keys, key)) return
      // check whether this value is an array
      isArr = isArray(value)
      // if the key was never set
      if (!value)
        // set it once on the tag instance
        parent[key] = dom
      // if it was an array and not yet set
      else if (!isArr || isArr && !contains(value, dom)) {
        // add the dom node into the array
        if (isArr)
          value.push(dom)
        else
          parent[key] = [value, dom]
      }
    }

  // skip the elements with no named properties
  if (!key) return

  // check whether this key has been already evaluated
  if (tmpl.hasExpr(key))
    // wait the first updated event only once
    parent.one('mount', function() {
      key = getNamedKey(dom)
      add(parent[key])
    })
  else
    add(parent[key])

}

/**
 * Faster String startsWith alternative
 * @param   { String } src - source string
 * @param   { String } str - test string
 * @returns { Boolean } -
 */
function startsWith(src, str) {
  return src.slice(0, str.length) === str
}

/**
 * requestAnimationFrame function
 * Adapted from https://gist.github.com/paulirish/1579671, license MIT
 */
var rAF = (function (w) {
  var raf = w.requestAnimationFrame    ||
            w.mozRequestAnimationFrame || w.webkitRequestAnimationFrame

  if (!raf || /iP(ad|hone|od).*OS 6/.test(w.navigator.userAgent)) {  // buggy iOS6
    var lastTime = 0

    raf = function (cb) {
      var nowtime = Date.now(), timeout = Math.max(16 - (nowtime - lastTime), 0)
      setTimeout(function () { cb(lastTime = nowtime + timeout) }, timeout)
    }
  }
  return raf

})(window || {})

/**
 * Mount a tag creating new Tag instance
 * @param   { Object } root - dom node where the tag will be mounted
 * @param   { String } tagName - name of the riot tag we want to mount
 * @param   { Object } opts - options to pass to the Tag instance
 * @returns { Tag } a new Tag instance
 */
function mountTo(root, tagName, opts) {
  var tag = __tagImpl[tagName],
    // cache the inner HTML to fix #855
    innerHTML = root._innerHTML = root._innerHTML || root.innerHTML

  // clear the inner html
  root.innerHTML = ''

  if (tag && root) tag = new Tag(tag, { root: root, opts: opts }, innerHTML)

  if (tag && tag.mount) {
    tag.mount()
    // add this tag to the virtualDom variable
    if (!contains(__virtualDom, tag)) __virtualDom.push(tag)
  }

  return tag
}
/**
 * Riot public api
 */

// share methods for other riot parts, e.g. compiler
riot.util = { brackets: brackets, tmpl: tmpl }

/**
 * Create a mixin that could be globally shared across all the tags
 */
riot.mixin = (function() {
  var mixins = {},
    globals = mixins[GLOBAL_MIXIN] = {},
    _id = 0

  /**
   * Create/Return a mixin by its name
   * @param   { String }  name - mixin name (global mixin if object)
   * @param   { Object }  mixin - mixin logic
   * @param   { Boolean } g - is global?
   * @returns { Object }  the mixin logic
   */
  return function(name, mixin, g) {
    // Unnamed global
    if (isObject(name)) {
      riot.mixin('__unnamed_'+_id++, name, true)
      return
    }

    var store = g ? globals : mixins

    // Getter
    if (!mixin) {
      if (typeof store[name] === T_UNDEF) {
        throw new Error('Unregistered mixin: ' + name)
      }
      return store[name]
    }
    // Setter
    if (isFunction(mixin)) {
      extend(mixin.prototype, store[name] || {})
      store[name] = mixin
    }
    else {
      store[name] = extend(store[name] || {}, mixin)
    }
  }

})()

/**
 * Create a new riot tag implementation
 * @param   { String }   name - name/id of the new riot tag
 * @param   { String }   html - tag template
 * @param   { String }   css - custom tag css
 * @param   { String }   attrs - root tag attributes
 * @param   { Function } fn - user function
 * @returns { String } name/id of the tag just created
 */
riot.tag = function(name, html, css, attrs, fn) {
  if (isFunction(attrs)) {
    fn = attrs
    if (/^[\w\-]+\s?=/.test(css)) {
      attrs = css
      css = ''
    } else attrs = ''
  }
  if (css) {
    if (isFunction(css)) fn = css
    else styleManager.add(css)
  }
  name = name.toLowerCase()
  __tagImpl[name] = { name: name, tmpl: html, attrs: attrs, fn: fn }
  return name
}

/**
 * Create a new riot tag implementation (for use by the compiler)
 * @param   { String }   name - name/id of the new riot tag
 * @param   { String }   html - tag template
 * @param   { String }   css - custom tag css
 * @param   { String }   attrs - root tag attributes
 * @param   { Function } fn - user function
 * @returns { String } name/id of the tag just created
 */
riot.tag2 = function(name, html, css, attrs, fn) {
  if (css) styleManager.add(css)
  //if (bpair) riot.settings.brackets = bpair
  __tagImpl[name] = { name: name, tmpl: html, attrs: attrs, fn: fn }
  return name
}

/**
 * Mount a tag using a specific tag implementation
 * @param   { String } selector - tag DOM selector
 * @param   { String } tagName - tag implementation name
 * @param   { Object } opts - tag logic
 * @returns { Array } new tags instances
 */
riot.mount = function(selector, tagName, opts) {

  var els,
    allTags,
    tags = []

  // helper functions

  function addRiotTags(arr) {
    var list = ''
    each(arr, function (e) {
      if (!/[^-\w]/.test(e)) {
        e = e.trim().toLowerCase()
        list += ',[' + RIOT_TAG_IS + '="' + e + '"],[' + RIOT_TAG + '="' + e + '"]'
      }
    })
    return list
  }

  function selectAllTags() {
    var keys = Object.keys(__tagImpl)
    return keys + addRiotTags(keys)
  }

  function pushTags(root) {
    if (root.tagName) {
      var riotTag = getAttr(root, RIOT_TAG_IS) || getAttr(root, RIOT_TAG)

      // have tagName? force riot-tag to be the same
      if (tagName && riotTag !== tagName) {
        riotTag = tagName
        setAttr(root, RIOT_TAG_IS, tagName)
        setAttr(root, RIOT_TAG, tagName) // this will be removed in riot 3.0.0
      }
      var tag = mountTo(root, riotTag || root.tagName.toLowerCase(), opts)

      if (tag) tags.push(tag)
    } else if (root.length) {
      each(root, pushTags)   // assume nodeList
    }
  }

  // ----- mount code -----

  // inject styles into DOM
  styleManager.inject()

  if (isObject(tagName)) {
    opts = tagName
    tagName = 0
  }

  // crawl the DOM to find the tag
  if (typeof selector === T_STRING) {
    if (selector === '*')
      // select all the tags registered
      // and also the tags found with the riot-tag attribute set
      selector = allTags = selectAllTags()
    else
      // or just the ones named like the selector
      selector += addRiotTags(selector.split(/, */))

    // make sure to pass always a selector
    // to the querySelectorAll function
    els = selector ? $$(selector) : []
  }
  else
    // probably you have passed already a tag or a NodeList
    els = selector

  // select all the registered and mount them inside their root elements
  if (tagName === '*') {
    // get all custom tags
    tagName = allTags || selectAllTags()
    // if the root els it's just a single tag
    if (els.tagName)
      els = $$(tagName, els)
    else {
      // select all the children for all the different root elements
      var nodeList = []
      each(els, function (_el) {
        nodeList.push($$(tagName, _el))
      })
      els = nodeList
    }
    // get rid of the tagName
    tagName = 0
  }

  pushTags(els)

  return tags
}

/**
 * Update all the tags instances created
 * @returns { Array } all the tags instances
 */
riot.update = function() {
  return each(__virtualDom, function(tag) {
    tag.update()
  })
}

/**
 * Export the Virtual DOM
 */
riot.vdom = __virtualDom

/**
 * Export the Tag constructor
 */
riot.Tag = Tag
  // support CommonJS, AMD & browser
  /* istanbul ignore next */
  if (typeof exports === T_OBJECT)
    module.exports = riot
  else if (typeof define === T_FUNCTION && typeof define.amd !== T_UNDEF)
    define(function() { return riot })
  else
    window.riot = riot

})(typeof window != 'undefined' ? window : void 0);
});

var riot$1 = interopDefault(riot);

var underscore = createCommonjsModule(function (module, exports) {
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(commonjsGlobal));
});

var _$1 = interopDefault(underscore);

var where = {

  where: {

    objectify: function (header, sample) {
      var SampleValues = [];
      var len = sample.length;
      var hlen = header.length;
      for (var i = 0; i < len; i++) {
        var item = {};
        for (var j = 0; j < hlen; j++) item[header[j]] = sample[i][j];
        SampleValues.push(item);
      }
      return SampleValues;
    },

    analyze: function (data, pathin, pathout) {
      var state = {};
      var r_data = {};
      var tag = "";

      if (pathout === "begin/pro" && pathin === "begin") {
        _$1.extend(this.config, data);
        if (!this.config.ProductFeeds) this.config.ProductFeeds = [];
        this.temppro = {};

        tag = "my-type";
        state = {};
        r_data = { languages: [] };
      } else if (pathout === "begin" && pathin === "begin/pro") {
        tag = "my-app";
        state = { start: true, configure: false };
        r_data = { deflang: this.config.defaultLanguage, siteName: this.config.siteName };
      } else if (pathout === "begin/pro/type" && pathin === "begin/pro") {
        _$1.extend(this.temppro, data.info);
        this.tempdata.rootLangs = data.lan;
        tag = "my-sample-upload";
        state = { rawData: void 0, complete: false };
        r_data = { parser: "csv" };
      } else if (pathout === "begin/pro" && pathin === "begin/pro/type") {
        tag = "my-type";
        state = {};
        r_data = { values: this.temppro, languages: this.tempdata.rootLangs };
        this.temppro = {};
      } else if (pathout === "begin/pro/type/upload_parse" && pathin === "begin/pro/type") {
        this.temppro.csvDelimter = data.del;
        this.temppro.csvQuote = data.qual;
        this.tempdata.result = data.result;
        tag = "my-primary";
        state = {};
        r_data = { langs: this.tempdata.rootLangs, header: this.tempdata.result.header };
      } else if (pathout === "begin/pro/type" && pathin === "begin/pro/type/upload_parse") {
        tag = "my-sample-upload";
        state = { rawData: void 0, complete: false };
        r_data = { parser: "csv" };
      } else if (pathout === "begin/pro/type/upload_parse/primaryMap" && pathin === "begin/pro/type/upload_parse") {
        this.temppro.primaryMappings2 = data;

        tag = "my-preview";
        state = {};
        r_data = { langs: this.tempdata.rootLangs, primaryMappings2: data, SampleValues: this.objectify(this.tempdata.result.header, this.tempdata.result.sample) };
      } else if (pathout === "begin/pro/type/upload_parse" && pathin === "begin/pro/type/upload_parse/primaryMap") {
        tag = "my-primary";
        state = {};
        r_data = { langs: this.tempdata.rootLangs, header: this.tempdata.result.header };
      } else if (pathout === "begin/pro/type/upload_parse/primaryMap/preview" && pathin === "begin/pro/type/upload_parse/primaryMap") {
        this.tempdata.processed = data;
        tag = "my-choice";
        state = { root: true };
        r_data = {};
      } else if (pathout === "begin" && pathin === "begin/pro/type/upload_parse/primaryMap/preview") {
        this.config.ProductFeeds.push(this.temppro);
        this.tempdata = {};
        this.rootLangs = [];

        if (!this.temppro.categoryMapping || this.temppro.categoryMapping.Type == "discrete") {
          tag = "my-app";
          state = { start: false, configure: true, categories: true };
          r_data = { deflang: this.config.defaultLanguage, siteKeys: this.config.siteKeys };
        } else {
          tag = "my-app";
          state = { start: false, configure: true, categories: false };
          r_data = { deflang: this.config.defaultLanguage, siteKeys: this.config.siteKeys };
        }
      } else if (pathout === "begin/pro/type/upload_parse" && pathin === "begin/pro/type/upload_parse/primaryMap/preview") {
        tag = "my-primary";
        state = {};
        r_data = { langs: this.tempdata.rootLangs, header: this.tempdata.result.header };
      } else if (pathout === "begin/pro/type/upload_parse/primaryMap/preview/choice" && pathin === "begin/pro/type/upload_parse/primaryMap/preview") {

        if ((data.obj === "propertyGroups2" || data.obj === "secondaryMappings2" || data.obj === "postProcessors") && !this.temppro[data.obj]) {
          this.temppro[data.obj] = [];
          if (!this.tempdata.tempnames) this.tempdata.tempnames = [];
        } else {
          if (!this.temppro[data.obj]) this.temppro[data.obj] = {};
        }

        tag = data.type;
        state = { init: this.temppro[data.obj], names: this.tempdata.tempnames };
        r_data = { langs: this.tempdata.rootLangs, header: this.tempdata.result.header, sample: this.objectify(this.tempdata.result.header, this.tempdata.result.sample), ids: this.tempdata.processed };
      } else if (pathout === "begin/pro/type/upload_parse/primaryMap/preview" && pathin === "begin/pro/type/upload_parse/primaryMap/preview/choice") {

        this.temppro[data.type] = data.data;

        tag = "my-choice";
        state = { root: true };
        r_data = {};
      } else if (pathout === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor" && pathin === "begin/pro/type/upload_parse/primaryMap/preview/choice") {
        this.tempdata.tempnames = data.tempnames;
        this.temppost = {};
        this.temppost.type = data.type;
        this.temppost.options = {};

        tag = "my-type";
        state = {};
        r_data = { languages: [] };
      } else if (pathout === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor/type" && pathin === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor") {
        _$1.extend(this.temppost.options, data.info);
        this.tempdata.subLangs = data.lan;
        tag = "my-sample-upload";
        state = { rawData: void 0, complete: false };
        r_data = { parser: "csv" };
      } else if (pathout === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor/type/upload_parse" && pathin === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor/type") {
        this.temppost.options.csvDelimter = data.del;
        this.temppost.options.csvQuote = data.qual;
        this.tempdata.subresult = data.result;
        tag = "my-choice";
        state = { root: false };
        r_data = { header: data.result.header };
      } else if (pathout === "begin/pro/type/upload_parse/primaryMap/preview/choice" && pathin === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor") {
        tag = "my-processor";
        state = { init: this.temppro.postProcessors };
        r_data = { langs: this.tempdata.rootLangs, header: this.tempdata.result.header };
      } else if (pathout === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor" && pathin === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor/type") {
        tag = "my-type";
        state = {};
        r_data = { values: this.temppost, languages: this.tempdata.subLangs };
      } else if (pathout === "begin/pro/type/upload_parse/primaryMap/preview/choice" && pathin === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor/type/upload_parse") {
        this.temppro.postProcessors.push(this.temppost);
        tag = "my-processor";
        state = { init: this.temppro.postProcessors, names: this.tempdata.tempnames };
        r_data = { langs: this.tempdata.rootLangs, header: this.tempdata.result.header };
      } else if (pathout === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor/type/upload_parse/choice" && pathin === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor/type/upload_parse") {
        this.temppost.options.skuColumn = data.sku;
        if ((data.obj === "propertyGroups2" || data.obj === "secondaryMappings2") && !this.temppost.options[data.obj]) {
          this.temppost.options[data.obj] = [];
        } else {
          if (!this.temppost.options[data.obj]) this.temppost.options[data.obj] = {};
        }
        tag = data.type;
        state = { init: this.temppost.options[data.obj] };

        var fake = {};
        for (var i = this.tempdata.subLangs.length - 1; i >= 0; i--) {
          fake[this.tempdata.subLangs[i]] = this.temppost.options.skuColumn;
        }

        r_data = { langs: this.tempdata.subLangs, header: this.tempdata.subresult.header, sample: this.objectify(this.tempdata.subresult.header, this.tempdata.subresult.sample), ids: fake };
      } else if (pathout === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor/type/upload_parse" && pathin === "begin/pro/type/upload_parse/primaryMap/preview/choice/processor/type/upload_parse/choice") {
        this.temppost.options[data.type] = data.data;
        tag = "my-choice";
        state = { root: false };
        r_data = { header: this.tempdata.subresult.header, sku: this.temppost.options.skuColumn };
      }

      // Category Feeds _________________________________________________________________________________________________________________________________

      else if (pathout === "begin/cat" && pathin === "begin") {
          _$1.extend(this.config, data);
          if (!this.config.categoryFeeds) this.config.categoryFeeds = [];
          this.tempcat = {};

          tag = "my-type";
          state = {};
          r_data = { languages: [] };
        } else if (pathout === "begin" && pathin === "begin/cat") {
          tag = "my-app";
          state = { start: false, configure: true };
          r_data = { deflang: this.config.defaultLanguage, siteKeys: this.config.siteKeys };
        } else if (pathout === "begin/cat/type" && pathin === "begin/cat") {
          _$1.extend(this.tempcat, data.info);
          this.tempdata.rootLangs = data.lan;

          tag = "my-sample-upload";
          state = { rawData: void 0, complete: true };
          r_data = { parser: "csv" };
        } else if (pathout === "begin/cat" && pathin === "begin/cat/type") {
          tag = "my-type";
          state = {};
          r_data = { values: this.tempcat, languages: this.tempdata.rootLangs };
        } else if (pathout === "begin/cat/type/upload_parse" && pathin === "begin/cat/type") {
          this.tempcat.csvDelimter = data.del;
          this.tempcat.csvQuote = data.qual;
          this.tempdata.result = data.result;

          tag = "my-rest";
          state = {};
          r_data = { langs: this.tempdata.rootLangs, header: this.tempdata.result.header, SampleValues: this.objectify(this.tempdata.result.header, this.tempdata.result.sample) };
        } else if (pathout === "begin" && pathin === "begin/cat/type/upload_parse") {
          _$1.extend(this.tempcat, data);
          this.config.categoryFeeds.push(this.tempcat);
          this.tempdata = {};
          this.rootLangs = [];

          tag = "my-app";
          state = { start: false, configure: true, categories: falser };
          r_data = { deflang: this.config.defaultLanguage, siteKeys: this.config.siteKeys };
        }

      return { tag: tag, path: pathout, state: state, data: r_data };
    },

    config: {},
    tempdata: {}

  }
};

riot$1.tag2('rg-alerts', '<div> <div each="{opts.alerts}" class="c-alert {\'c-alert--\' + type}" if="{isvisible}" onclick="{select}"> <button class="c-button c-button--close" if="{dismissable != false}" onclick="{parent.dismiss}"> &times; </button> {text} </div> </div>', '', '', function (opts) {
	this.on('update', () => {
		if (!opts.alerts) return;
		opts.alerts.forEach(alert => {
			if (typeof alert.isvisible === 'undefined') alert.isvisible = true;
			if (alert.timeout) {
				alert.startTimer = () => {
					alert.timer = setTimeout(() => {
						this.dismiss({
							item: alert
						});
					}, alert.timeout);
				};
				alert.startTimer();
			}
		});
	});

	this.dismiss = e => {
		const alert = e.item;
		alert.isvisible = false;
		clearTimeout(alert.timer);
		this.trigger('dismiss', alert);
		this.update();
	};

	this.select = e => {
		const alert = e.item;
		if (alert.onclick) alert.onclick(alert);
		this.trigger('select', alert);
	};
});

riot$1.tag2('my-app', '<rg-alerts></rg-alerts> <div if="{start}" class="c-card u-highest" class="u-center-block" style="width: 95%; height: 40%; margin: auto"> <div class="c-card__item c-card__item--brand" align="center">Shop Details</div> <div class="c-card__item"> <p c-paragraph>Please enter the details of the shop: </p> <div class="inps"> <div class="elmts"> <label for="siteName" class="grps">Site Name : </label> <input type="text" name="siteName" maxlength="255" class="c-field grps" style="width: 65%;display:inline-block;"> </div> <div class="elmts"> <label class="grps" for="languageSelect">Default Shop Language:</label> <div class="grps"> <select name="languageSelect" onchange="{update}" class="c-field " style="width: 65%; display:inline-block; margin:2px"> <option selected></option> <option value="de">de</option> <option value="nl">nl</option> <option value="en">en</option> <option value="it">it</option> <option value="es">es</option> <option value="fr">fr</option> <option value="custom">custom</option> </select> <input type="text" name="customLang" maxlength="2" onchange="{update}" if="{languageSelect.value == \'custom\'}" class="c-field" style="width: 30%;display:inline-block;"> </div> </div> </div> <br> <div class="seperator"></div> <br> <button onclick="{next}" class="c-button c-button--success" type="button " style="margin:auto; display:block;">Continue to Product Feed Configuration</button> </div> </div> <div if="{configure}" class="c-card u-highest" class="u-center-block" style="width: 90%; height: 40%; margin: auto"> <div class="c-card__item" align="center"> <br> <button onclick="{pro}" class="c-button c-button--success" if="{!this.opts.state.categories}">Add Product Feed Configuration</button> <button onclick="{cat}" class="c-button c-button--success" if="{this.opts.state.categories}">Add Category Feed Configuration</button> <br><br> <div class="seperator"></div> <br> <div align="center"> <button onclick="{goback}" class="c-button" type="button">Go Back</button> </div> <br> </div> </div>', '', '', function (opts) {

  this.on("mount", function () {
    this.defaultLanguage = this.opts.data.deflang;
    this.start = this.opts.state.start;
    this.configure = this.opts.state.configure;
    if (this.opts.data.siteName) this.siteName.value = this.opts.data.siteName;
    if (this.defaultLanguage !== '') this.languageSelect.value = this.defaultLanguage;
    this.update();
  });

  this.alerter = function (message, type) {
    riot$1.mount('rg-alerts', {
      alerts: [{
        type: type,
        text: message,
        timeout: 3000
      }]
    });
  }.bind(this);

  this.addKeys = function (e) {
    if (this.siteKey.value) {
      if (this.siteKeys.indexOf(this.siteKey.value) == -1) this.siteKeys.push(this.siteKey.value);else this.alerter("already added", 'error');
    }
  }.bind(this);

  this.removeKeys = function (e) {
    this.siteKeys.splice(this.siteKeys.indexOf(e.item.key), 1);
  }.bind(this);

  this.next = function () {
    if (this.languageSelect.value && this.siteName.value) {
      if (this.languageSelect.value == 'custom') {
        if (this.customLang.value.length == 2) {
          this.defaultLanguage = this.customLang.value;
        } else {

          this.alerter("language code must have exactly two charachters", "error");
          return void 0;
        }
      } else this.defaultLanguage = this.languageSelect.value;
      this.start = false;
      this.configure = true;
      this.update();
    } else {
      if (!this.languageSelect.value) {
        this.alerter("You have to select the default language", "error");
      } else {
        this.alerter("You have to enter the siteName", "error");
      }
    }
  }.bind(this);

  this.pro = function () {
    this.opts.resolver({ siteName: this.siteName.value, defaultLanguage: this.defaultLanguage }, this.opts.path, this.opts.path + "/pro");
    this.unmount();
  }.bind(this);

  this.cat = function () {
    this.opts.resolver({ siteKeys: this.siteKeys, defaultLanguage: this.defaultLanguage }, this.opts.path, this.opts.path + "/cat");
    this.unmount();
  }.bind(this);

  this.goback = function () {
    this.start = true;
    this.configure = false;
    this.update();
  }.bind(this);
});

riot$1.tag2('rg-modal', '<div class="c-overlay {c-overlay--dismissable: opts.modal.dismissable}" if="{opts.modal.isvisible}" onclick="{close}"></div> <div class="o-modal {o-modal--ghost: opts.modal.ghost}" if="{opts.modal.isvisible}"> <header class="c-card__header" if="{opts.modal.heading}"> <button if="{opts.modal.dismissable}" type="button" class="c-button c-button--close" onclick="{close}"> &times; </button> <h3 class="c-heading c-heading--small">{opts.modal.heading}</h3> </header> <div class="c-card__body" align="center" name="contents"> </div> <footer class="c-card__footer c-card__footer--block"> <div class="c-input-group"> <button each="{opts.modal.buttons}" type="button" class="c-button {\'c-button--\' + type} c-button--block" onclick="{action}" riot-style="{style}"> {text} </button> </div> </footer> </div>', 'rg-modal .o-modal--ghost .c-card__footer .c-button,[riot-tag="rg-modal"] .o-modal--ghost .c-card__footer .c-button,[data-is="rg-modal"] .o-modal--ghost .c-card__footer .c-button{ margin: 0 .5em 0 0; display: block; margin: auto; }', '', function (opts) {
	this.on('mount', () => {
		if (!opts.modal) opts.modal = {};
		this.contents.innerHTML = opts.modal.contents;
	});

	this.close = () => {
		if (opts.modal.dismissable) {
			opts.modal.isvisible = false;
			this.trigger('close');
		}
	};
});

riot$1.tag2('my-type', '<rg-alerts></rg-alerts> <div class="c-card u-highest" class="u-center-block" style="width: 95%; height: 40%; margin: auto"> <div class="c-card__item c-card__item--brand" align="center">Feed Details</div> <div class="c-card__item"> <div class="inps"> <div class="elmts"> <label for="languageSelect" class="grps">Site Languages:</label> <div class="grps" style="width=60%"> <select name="languageSelect" onchange="{add}" class="c-field" style="display:inline-block; width:auto"> <option selected></option> <option value="de">de</option> <option value="nl">nl</option> <option value="en">en</option> <option value="it">it</option> <option value="es">es</option> <option value="fr">fr</option> <option value="custom">custom</option> </select> <input type="text" name="customLang" maxlength="2" onchange="{updateLanguages}" if="{languageSelect.value == \'custom\'}" class="c-field" style="display:inline-block; width:100px"> <button onclick="{add}" type="button" class="c-button c-button--info" if="{languageSelect.value == \'custom\'}" style="display:inline-block; width:auto;">ADD</button> </div> </div> <div class="elmts" each="{lang in languages}"> <label class="grps">&nbsp;&#8226;&nbsp;{lang}&nbsp;&nbsp;</label> <button onclick="{parent.remove}" class="c-button c-button--error grps" type="button">Remove</button> </div> <br> <div class="elmts"> <label for="checkInteval" class="grps">Check Interval : </label> <input name="checkInterval" placeholder="Feed Refresh Interval (in minutes)" min="10" class="c-field grps" type="number"> </div> <div class="elmts"> <label for="dwnld" class="grps">Download URL : </label> <input type="text" name="dwnld" maxlength="255" class="c-field grps"> </div> <div class="elmts"> <label for="username" class="grps">Download Username:</label> <input type="text" name="username" maxlength="255" class="c-field grps"> </div> <div class="elmts"> <label for="password" class="grps">Download Password:</label> <input type="password" name="password" maxlength="255" class="c-field grps"> </div> <div class="elmts"> <label for="typeSelect" class="grps">Select the file type you wish to upload: &nbsp;</label> <select name="typeSelect" onchange="{update}" class="c-field grps"> <option selected value="csv">csv</option> <option value="json" disabled>json</option> <option value="tsv" disabled>tsv</option> <option value="xls" disabled>xls</option> <option value="es" disabled>xml</option> </select> </div> </div> <br> <div class="seperator"></div> <br> <div align="center"> <button onclick="{next}" class="c-button c-button--success" type="button">Save and continue</button>&nbsp;<button onclick="{previous}" class="c-button c-button--error" type="button">Go Back</button> </div> </div> </div> <rg-modal if="{alert}"></rg-modal>', '', '', function (opts) {

  this.on("mount", function () {
    this.alert = false;
    this.languages = this.opts.data.languages;
    if (this.opts.data.values) {
      this.checkInterval.value = this.opts.data.values.checkInterval;
      this.dwnld.value = this.opts.data.values.downloadUrl;
      this.username.value = this.opts.data.values.downloadUser;
      this.password.value = this.opts.data.values.password;
      this.typeSelect.value = this.opts.data.values.parserType;
    }
    this.update();
  });

  this.alerter = function (message, type) {
    riot$1.mount('rg-alerts', {
      alerts: [{
        type: type,
        text: message,
        timeout: 3000
      }]
    });
  }.bind(this);

  this.add = function (e) {
    this.languageSelect[0].disabled = true;
    this.update();
    if (this.languageSelect.value) {
      if (this.languageSelect.value == 'custom') {
        if (this.customLang.value && this.customLang.value.length == 2) {
          if (this.languages.indexOf(this.customLang.value) === -1) this.languages.push(this.customLang.value);else this.alerter("already added", "error");
        } else if (this.customLang.value && this.customLang.value.length < 2) {
          this.alerter("language code must have exactly 2 characters", "error");
        }
      } else if (this.languageSelect.value != 'custom') {
        if (this.languages.indexOf(this.languageSelect.value) === -1) this.languages.push(this.languageSelect.value);else this.alerter("already added", "error");
      }
    } else this.alerter("choose an option", "error");
  }.bind(this);

  this.remove = function (e) {
    this.languages.splice(this.languages.indexOf(e.item.lang), 1);
  }.bind(this);

  this.next = function () {
    if (this.languages.length < 1) {
      this.alerter("add atleast one language", "error");
      return void 0;
    }

    this.values = {};
    this.values.checkInterval = parseInt(this.checkInterval.value);
    this.values.downloadUrl = this.dwnld.value;
    this.values.downloadUser = this.username.value;
    this.values.password = this.password.value;
    this.langs = this.languages;
    this.values.parserType = this.typeSelect.value;

    this.opts.resolver({ info: this.values, lan: this.langs }, this.opts.path, this.opts.path + "/type");
    this.unmount();
  }.bind(this);

  this.previous = function () {
    var tag = this;
    this.alert = true;
    this.update();
    var tags = riot$1.mount('rg-modal', {
      modal: {
        isvisible: true,
        dismissable: false,
        contents: "<br><h3>All changes made will be lost<h3>",
        buttons: [{
          text: 'Ok',
          type: 'info',
          action: function () {
            tag.opts.resolver(void 0, tag.opts.path, tag.opts.path.slice(0, tag.opts.path.lastIndexOf('/')));
            tag.unmount();
          }
        }, {
          text: 'Cancel',
          type: 'error',
          action: function () {
            tag.alert = false;
            tag.update();
          }
        }]
      }
    });
  }.bind(this);

  var re_weburl = new RegExp("^" + "(?:(?:https?|ftp)://)" + "(?:\\S+(?::\\S*)?@)?" + "(?:" + "(?!(?:10|127)(?:\\.\\d{1,3}){3})" + "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" + "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" + "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" + "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" + "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" + "|" + "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" + "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" + "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" + "\\.?" + ")" + "(?::\\d{2,5})?" + "(?:[/?#]\\S*)?" + "$", "i");
});

riot$1.tag2('my-sample-upload', '<rg-alerts></rg-alerts> <div class="c-card u-highest" class="u-center-block" style="width: 95%; height: 40%; margin: auto"> <div class="c-card__item c-card__item--brand" align="center">File Upload</div> <div class="c-card__item"> <div class="dropzone" name="dropZone"> <input type="file" name="fileInput"> </div> <div if="{rawData}"> <ul class="colss"> <li> <div class="indicator suggest" name="indicator"></div> </li> <li> <label class="block-label" for="delimSelect">Delimiter:</label> <select name="delimSelect" onchange="{updateDelimiter}" class="c-field" style="display:inline-block;"> <option __selected="{resolve}"> </option> <option value="-1">Custom</option> <option value="0">;</option> <option value="1">,</option> <option value="2">Tab</option> <option value="3">|</option> <option value="4">Space</option> </select> </li> <li><input type="text" name="customDelim" maxlength="1" onchange="{updateDelimiter}" if="{delimSelect.value ===\'-1\'}" class="c-field" style="width:50px; display:inline-block;"></li> <li> <span class="block-label">Text qualifier:</span> <label class="radio-label"><input type="radio" name="qualiRadio" value="0" onclick="{updateQualifier}"> "</label> <label class="radio-label"><input type="radio" name="qualiRadio" value="1" onclick="{updateQualifier}"> \'</label> </li> </ul> <br> <div class="c-card"> <div class="c-card__item c-card__item--warning" align="center" style="height:30px;">Raw Data</div> <div class="c-card__item--brand"><div style="height:175px; overflow-y: scroll; word-wrap: break-word;">{this.rawData.slice(0, this.opt)}</div></div> </div> <br> <div align="center"> <button onclick="{parseRawData}" class="c-button c-button--success">Parse</button> </div> <br> <div class="c-card" if="{verify}"> <div class="c-card__item c-card__item--warning" align="center" style="height:30px;">Parsed Data</div> <div style="overflow-y: scroll; height:250px; overflow-x: scroll; width: 100%;"> <table> <thead> <tr> <th each="{column in result.header}">{column}</th> </tr> </thead> <tbody> <tr each="{row in result.sample.slice(0, (result.sample.length>10?10:result.sample.length))}"> <td each="{field in row}">{field}</td> </tr> <tbody> </table> </div> </div> </div> <br> <div class="seperator"></div> <br> <div align="center"> <button onclick="{previous}" class="c-button c-button--error" type="button">Go Back</button> <button onclick="{accept}" if="{verify}" class="c-button c-button--success" type="button">Accept and Continue</button> </div> <br> </div> </div> <rg-modal if="{alert}"></rg-modal>', 'p.test { width: 100%; word-wrap: break-word; } table { border-collapse: collapse; } table, th, td { text-align: left; border: 1px solid black; width: 100%; } tr:nth-child(even){background-color: #f2f2f2} th { background-color: #4CAF50; color: white; }', '', function (opts) {

  const DELIMITERS = [";", ",", "\t", "|", " "],
        QUALIFIERS = ["\"", "'"];

  this.delimiter = ";";
  this.qualifier = "\"";

  this.on("mount", function () {
    this.alert = false;
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      this.dropZone.addEventListener('click', this.openDialog);
      this.dropZone.addEventListener('dragover', stop(indicateCopyAction), false);
      this.dropZone.addEventListener('drop', stop(this.handleFile), false);
      this.fileInput.addEventListener('change', stop(this.handleFile), false);
      this.setState("ready");
    } else this.setState("unsupported");

    if (this.opts.state.rawData) this.setState("success");

    this.rawData = this.opts.state.rawData;
  });

  this.previous = function () {
    var tag = this;
    this.alert = true;
    this.update();
    var tags = riot$1.mount('rg-modal', {
      modal: {
        isvisible: true,
        dismissable: false,
        contents: "<br><h3>All changes made will be lost<h3>",
        buttons: [{
          text: 'Ok',
          type: 'info',
          action: function () {
            tag.opts.resolver(void 0, tag.opts.path, tag.opts.path.slice(0, tag.opts.path.lastIndexOf('/')));
            tag.unmount();
          }
        }, {
          text: 'Cancel',
          type: 'error',
          action: function () {
            tag.alert = false;
            tag.update();
          }
        }]
      }
    });
  }.bind(this);

  this.accept = function () {
    this.opts.resolver({ result: this.result, del: this.delimiter, qual: this.qualifier }, this.opts.path, this.opts.path + "/upload_parse");
    this.unmount();
  }.bind(this);

  this.updateDelimiter = function () {
    var idx = parseInt(this.delimSelect.value);
    if (idx < 0) this.delimiter = this.customDelim.value.slice(0, 1);else this.delimiter = DELIMITERS[idx];
  }.bind(this);

  this.updateQualifier = function () {
    for (var i = 0; i < this.qualiRadio.length; i++) {
      if (this.qualiRadio[i].checked) {
        this.qualifier = QUALIFIERS[i];
        return void this.parseRawData();
      }
    }
  }.bind(this);

  this.parseRawData = function () {
    this.showInd = true;
    if (this.rawData) {
      var xhttp = new XMLHttpRequest();
      xhttp.open("POST", "http://localhost:8080/parse", true);
      xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      var body = JSON.stringify({ data: this.rawData, delimitter: this.delimiter });
      xhttp.send(body);

      var tag = this;
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
          if (this.status == 200) tag.check(this.responseText);else {
            riot$1.mount('rg-alerts', {
              alerts: [{
                type: "error",
                text: "parsing error, try another delimitter or contact webmaster",
                timeout: 3000
              }]
            });
          }
        }
      };
    }
  }.bind(this);

  this.check = function (response) {
    this.result = {};
    var obj = JSON.parse(response);
    this.result.header = obj[0];

    if (this.opts.state.complete) this.result.sample = obj.slice(1, obj.length);else this.result.sample = obj.slice(1, obj.length > 11 ? 11 : obj.length);

    if (this.result && this.result.header && this.result.header.length > 1 && this.result.sample) {
      this.indicator.className = "indicator valid";
      this.verify = true;
    } else {
      this.indicator.className = "indicator invalid";
      this.verify = false;
    }

    this.update();
  }.bind(this);

  function stop(fn) {
    return function (evt) {
      evt.stopPropagation();
      evt.preventDefault();
      return fn.apply(null, arguments);
    };
  }

  function indicateCopyAction(evt) {
    evt.dataTransfer.dropEffect = 'copy';
  }

  this.openDialog = function (evt) {
    this.fileInput.value = null;
    this.fileInput.click();
  }.bind(this);

  this.handleFile = function (evt) {
    var file = evt.dataTransfer ? evt.dataTransfer.files[0] : evt.target.files[0];
    if (file === void 0) {
      return void this.setState("error");
    }

    var reader = new FileReader();
    reader.onload = function (evt) {
      this.setState("success");
      this.rawData = evt.target.result;
      this.rawData = this.rawData.slice(0, this.rawData.lastIndexOf('\n'));

      this.opt = this.rawData.length > 10000 ? 10000 : this.rawData.length;

      var newln = this.getNewlineStr(this.rawData.slice(0, this.opt));
      var abc = this.guessQuoteAndDelimiter(this.rawData.slice(0, this.opt), newln);

      var check = DELIMITERS.indexOf(abc.delim);
      this.delimSelect.value = check;
      this.updateDelimiter();

      if (abc.quote == "\"") this.qualiRadio[0].checked = true;else this.qualiRadio[1].checked = true;

      this.update();

      this.parseRawData();
      this.update();
    }.bind(this);

    reader.onerror = function (evt) {
      this.setState("error");
      this.rawData = undefined;
      this.update();
    }.bind(this);

    if (file.size > 16 * 1024 && !this.opts.state.complete) {
      var sliceFn = 'webkitSlice' in file ? 'webkitSlice' : 'mozSlice' in file ? 'mozSlice' : 'slice';reader.readAsText(file[sliceFn](0, 16 * 1024));
    } else reader.readAsText(file);
  }.bind(this);

  this.setState = function (state) {
    this.dropZone.className = "dropzone " + state;
  };

  this.getNewlineStr = function (sample) {
    var candidates = ["\r\n", "\n\r", "\n", "\r"];
    var nrLines = {};

    var lineLengths = {};
    var threshold = 5;

    candidates.forEach(function (newlineStr) {
      nrLines[newlineStr] = 1;
      var l = [];
      var curPos = 0;
      var newlinePos = 0;
      while ((newlinePos = sample.indexOf(newlineStr, curPos)) > -1) {
        ++nrLines[newlineStr];
        var lineLength = newlinePos - curPos;
        l.push(lineLength);
        curPos = newlinePos + newlineStr.length;
      }
      lineLengths[newlineStr] = l;
    });

    ["\r\n", "\n\r"].forEach(function (newlineStr) {
      var nr = nrLines[newlineStr];
      if (nr > 1) {
        ["\n", "\r"].forEach(function (newlineStr) {
          if (nrLines[newlineStr] == nr) {
            nrLines[newlineStr] = 1;
          }
        });
      }
    });

    var remainingCandidates = [];
    candidates.forEach(function (newlineStr) {
      if (nrLines[newlineStr] > 1) {
        remainingCandidates.push(newlineStr);
      }
    });

    if (remainingCandidates.length == 0) {
      return null;
    }
    if (remainingCandidates.length == 1) {
      return remainingCandidates[0];
    }

    var finalRemainers = [];
    var maxNrLines = 0;
    remainingCandidates.forEach(function (newlineStr) {
      var curNrLines = nrLines[newlineStr];
      maxNrLines = Math.max(maxNrLines, curNrLines);
      if (curNrLines > threshold) {
        finalRemainers.push(newlineStr);
      }
    });

    if (finalRemainers.length == 0) {
      var winner = null;
      remainingCandidates.some(function (newlineStr) {
        if (nrLines[newlineStr] == maxNrLines) {
          winner = newlineStr;
          return true;
        }
        return false;
      });
      return winner;
    }
    if (finalRemainers.length == 1) {
      return finalRemainers[0];
    }

    var winner = null;
    var winnerScore = Infinity;
    finalRemainers.forEach(function (newlineStr) {
      var l = lineLengths[newlineStr];
      var sum = 0;
      l.forEach(function (d) {
        sum += d;
      });
      var avg = sum / l.length;

      var absSum = 0;
      l.forEach(function (d) {
        absSum += Math.abs(d - avg);
      });
      var score = absSum / l.length / avg;

      if (score < winnerScore) {
        winnerScore = score;
        winner = newlineStr;
      }
    });
    return winner;
  };

  this.guessQuoteAndDelimiter = function (sample, newlineStr, delimiters) {
    var exprs = [];
    var nl = newlineStr.replace("\n", "\\n").replace("\r", "\\r");
    var delimiter = "([^" + nl + "\"'])";
    var content = "[^" + nl + "]*?";
    exprs.push({
      expr: new RegExp(delimiter + "\\s*?" + "([\"'])" + content + "\\2" + "\\s*?" + "\\1", "g"),
      delimRef: 1,
      quoteRef: 2
    });

    exprs.push({
      expr: new RegExp("^" + "\\s*?" + "([\"'])" + content + "\\1" + "\\s*?" + delimiter, "g"),
      delimRef: 2,
      quoteRef: 1
    });

    exprs.push({
      expr: new RegExp(delimiter + "\\s*?" + "([\"'])" + content + "\\2" + "\\s*?" + "$", "g"),
      delimRef: 1,
      quoteRef: 2
    });

    exprs.push({
      expr: new RegExp("^" + "\\s*?" + "([\"'])" + content + "\\1" + "\\s*?" + "$", "g"),
      quoteRef: 1
    });

    var matches = [];

    exprs.every(function (d) {
      var matchesNew;
      while (matchesNew = d.expr.exec(sample)) {
        var match = {};
        if (d.delimRef && matchesNew[d.delimRef]) match.delim = matchesNew[d.delimRef];
        if (d.quoteRef && matchesNew[d.quoteRef]) match.quote = matchesNew[d.quoteRef];
        matches.push(match);
      }

      return matches.length == 0;
    });
    if (matches.length == 0) {
      return { delim: null, quote: null };
    }

    var delimCounters = {};
    var quoteCounters = {};

    matches.forEach(function (d) {
      if (d.hasOwnProperty("delim") && (!delimiters || delimiters.indexOf(d.delim) > -1)) {
        if (!delimCounters.hasOwnProperty(d.delim)) delimCounters[d.delim] = 1;else ++delimCounters[d.delim];
      }
      if (d.hasOwnProperty("quote")) {
        if (!quoteCounters.hasOwnProperty(d.quote)) quoteCounters[d.quote] = 1;else ++quoteCounters[d.quote];
      }
    });

    var delims = Object.keys(delimCounters);
    var quotes = Object.keys(quoteCounters);

    var delim = null;
    if (delims.length > 0) {
      var maxCount = -1;
      delims.forEach(function (d) {
        if (delimCounters[d] > maxCount) {
          delim = d;
          maxCount = delimCounters[d];
        }
      });
    }

    var maxCount = -1;
    var quote = '';
    quotes.forEach(function (d) {
      if (quoteCounters[d] > maxCount) {
        quote = d;
        maxCount = quoteCounters[d];
      }
    });

    if (delim == "\n") {
      delim = null;
    }

    return {
      delim: delim,
      quote: quote
    };
  };
});

var primaryMap = {
    fields: [{
        name: "id",
        label: "ID"
    }, {
        name: "label",
        label: "Label"
    }, {
        name: "imageURL",
        label: "Image URL"
    }, {
        name: "price",
        label: "Price"
    }]
};

riot$1.tag2('my-fields', '<label class="c-toggle c-toggle--info" style="width: 135px"> {opts.label.label}<div style="display:inline" if="{opts.label.label == \'ID\'}">*</div>: <input type="checkbox" name="expand" if="{opts.label.label != \'ID\'}" onchange="{update}"></input> <div class="c-toggle__track" if="{opts.label.label != \'ID\'}" style="margin-left:auto; margin-right:10px"> <div class="c-toggle__handle"></div> </div> </label> </br> <div if="{opts.label.label == \'ID\' || this.expand.checked}" class="inps"> <div class="elmts" style="display: none;"> <label for="valueType" class="grps">Type of Value : </label> <select name="valueType" onchange="{update}" class="c-field grps"> <option value="float64" __disabled="{opts.label.name!=\'price\'}" __selected="{opts.label.name==\'price\'}"> Float 64 </option> <option value="string" __disabled="{opts.label.name ==\'price\'}" __selected="{opts.label.name!=\'price\'}"> String </option> </select> </div> <div class="elmts"> <label class="grps" for="langOpt">Same column <br> for all Languages :&nbsp;</label> <select name="langOpt" onchange="{update}" class="grps c-field"> <option value="0" selected>yes</option> <option value="1" if="{langs.length > 1}">no</option> </select> </div> <div each="{lang in langs}" no-roerder class="elmts" if="{langOpt.value == 1}"> <label class="grps" for="{lang}">{lang} :</label> <select name="{lang}" class="grps c-field" onchange="{updateDiffLangParameter}"> <option selected></option> <option each="{column in header}" value="{column}" no-reorder>{column}</option> </select> </div> <div if="{langOpt.value == 0}" class="elmts"> <label class="grps" for="column">Column :</label> <select name="sameColumn" class="grps c-field" onchange="{updateSameLangParameter}"> <option selected></option> <option each="{column in header}" value="{column}" no-reorder>{column}</option> </select> </div> <div class="elmts"> <label class="c-toggle c-toggle--info grps"> Regex <input type="checkbox" name="reg" onchange="{update}"></input> <div class="c-toggle__track" style="display:inline-block; float:right"> <div class="c-toggle__handle"></div> </div> </label> <input type="text" name="regex" maxlength="50" if="{reg.checked}" class="grps c-field "></input> </div> <div class="elmts"> <label class="c-toggle c-toggle--info grps"> Prefix <input type="checkbox" name="pre" onchange="{update}"></input> <div class="c-toggle__track" style="display:inline-block; float:right"> <div class="c-toggle__handle"></div> </div> </label> <input type="text" name="prefix" maxlength="50" if="{pre.checked}" class="grps c-field "></input> </div> </div>', '', '', function (opts) {

	this.on("mount", function () {
		this.langs = this.opts.langs;
		this.header = this.opts.header;
		this.update();
	});

	this.ValueType = void 0;
	this.NumCols = [];
	this.LanguageParameters = {};

	this.updateSameLangParameter = function () {
		this.sameColumn[0].disabled = true;
		this.LanguageParameters = {};
		for (var i = 0; i < this.langs.length; i++) {
			var temp = {};
			temp[this.langs[i]] = this.sameColumn.value;
			_.extend(this.LanguageParameters, temp);
		}
	}.bind(this);

	this.updateDiffLangParameter = function (e) {
		e.target[0].disabled = true;
		var temp = {};
		temp[e.item.lang] = e.target.value;
		_.extend(this.LanguageParameters, temp);
	}.bind(this);

	this.on("update", function () {
		if (opts.label.label == 'ID' || this.expand.checked) {
			this.mapped = {};
			if (this.isMounted && this.valueType.value && Object.keys(this.LanguageParameters).length === this.langs.length) {
				this.mapped["ValueType"] = this.valueType.value;
				this.mapped["LanguageParameterNames"] = this.LanguageParameters;
				if (this.pre.checked) {
					this.mapped["Prefix"] = this.prefix.value;
				}
				if (this.reg.checked) {
					this.mapped["Regex"] = this.regex.value;
				}
			}
			this.opts.senddata(this.mapped, this.opts.label.name);
		}
		if (opts.label.label !== 'ID' && !this.expand.checked) {
			this.opts.senddata(void 0, this.opts.label.name);
		}
	});
});

riot$1.tag2('my-primary', '<rg-alerts></rg-alerts> <div class="c-card u-highest" class="u-center-block" style="width: 95%; height: 40%; margin: auto"> <div class="c-card__item c-card__item--brand" align="center">Configure Primary Mappings</div> <div class="c-card__item"> <virtual each="{element in map.fields}" no-reorder> <br> <my-fields label="{element}" mappingkind="{⁗primaryMappings2⁗}" langs="{this.langs}" header="{this.header}" senddata="{this.recieveData}"></my-fields> <br> <div class="seperator"></div> </virtual> <br> <div align="center"> <button onclick="{next}" class="c-button c-button--success" type="button">Save and continue</button>&nbsp;<button onclick="{previous}" class="c-button c-button--error" type="button">Go Back</button> </div> <br> </div> </div> <rg-modal if="{alert}"></rg-modal>', '', '', function (opts) {

    var tag = this;

    this.on("before-mount", function () {
        this.alert = false;
        this.map = primaryMap;
        this.langs = this.opts.data.langs;
        this.header = this.opts.data.header;
        this.primaryMappings2 = {};

        this.update();
    });

    this.recieveData = function (data, type) {
        tag.primaryMappings2[type] = data;
    };

    this.next = function () {
        if (!this.validate()) return void 0;
        this.opts.resolver(this.primaryMappings2, this.opts.path, this.opts.path + "/primaryMap");
        this.unmount();
    }.bind(this);

    this.alerter = function (message, type) {
        riot$1.mount('rg-alerts', {
            alerts: [{
                type: type,
                text: message,
                timeout: 3000
            }]
        });
    }.bind(this);

    this.previous = function () {
        this.alert = true;
        this.update();
        var tags = riot$1.mount('rg-modal', {
            modal: {
                isvisible: true,
                dismissable: false,
                contents: "<br><h3>All changes made will be lost<h3>",
                buttons: [{
                    text: 'Ok',
                    type: 'info',
                    action: function () {
                        tag.opts.resolver(void 0, tag.opts.path, tag.opts.path.slice(0, tag.opts.path.lastIndexOf('/')));
                        tag.unmount();
                    }
                }, {
                    text: 'Cancel',
                    type: 'error',
                    action: function () {
                        tag.alert = false;
                        tag.update();
                    }
                }]
            }
        });
    }.bind(this);

    this.validate = function () {
        for (var val in this.primaryMappings2) {
            if (this.primaryMappings2[val]) {
                if (!this.primaryMappings2[val].ValueType) {
                    this.alerter("All fields under " + val + " are required", "error");
                    return false;
                } else {
                    if (this.primaryMappings2[val].Regex === "") {
                        this.alerter("A valid value for Regex under " + val + " is required", "error");
                        return false;
                    }
                    if (this.primaryMappings2[val].Prefix === "") {
                        this.alerter("A valid value for Prefix under " + val + " is required", "error");
                        return false;
                    }
                }
            }
        }
        return true;
    }.bind(this);
});

riot$1.tag2('my-preview', '<div class="c-card u-highest" class="u-center-block" style="width: 95%; height: 40%; margin: auto"> <div class="c-card__item c-card__item--brand" align="center">Preview</div> <div class="c-card__item"> <div name="lang"> <label for="languageSelect">Languages</label> <select name="languageSelect" class="c-field" onchange="{check}" style="width: auto; display:inline-block;"> <option each="{lang in this.opts.data.langs}" value="{lang}">{lang}</option> </select> </div> <br> <div class="o-grid o-grid--wrap"> <div each="{pro in products}" class="o-grid__cell o-grid__cell--width-33 "> <div name="proImg" if="{pro.imageURL}"> <img riot-src="{pro.imageURL}" style="width:75%; height:75%;"></img> </div> <div name="proID"> Article ID = {pro.id} </div> <div name="proLbl" if="{pro.label}"> Label = {pro.label} </div> <div name="price" if="{pro.price}"> Price = {pro.price} </div> <br> </div> </div> <br> <div class="seperator"></div> <br> <div align="center"> <button onclick="{next}" class="c-button c-button--success" type="button">Accept</button> <button onclick="{back}" class="c-button c-button--error" type="button">Reconfigure</button> </div> </div> </div>', '', '', function (opts) {

    this.products = [];

    this.on("mount", function () {
        this.pm = primaryMap.fields;
        this.products = [];
        this.primaryMappings2 = this.opts.data.primaryMappings2;
        this.check();
        this.update();
    });

    this.check = function () {
        this.language = this.languageSelect.value;
        this.process();
    }.bind(this);

    this.process = function () {
        var map = {};

        for (var val in this.pm) {
            var xvar = this.pm[val].name;
            if (this.primaryMappings2[xvar]) map[xvar + "Col"] = this.primaryMappings2[xvar].LanguageParameterNames[this.language];
        }

        var product = [];
        var thiz = this;

        this.opts.data.SampleValues.forEach(function (prod) {
            var temp = {};
            for (var val in thiz.pm) {
                var xvar = thiz.pm[val].name;

                if (thiz.primaryMappings2[xvar]) {
                    if (thiz.primaryMappings2[xvar].Regex || thiz.primaryMappings2[xvar].Prefix) {
                        if (thiz.primaryMappings2[xvar].Regex) {
                            var reg = new RegExp(thiz.primaryMappings2[xvar].Regex);
                            var Xvar = prod[map[xvar + "Col"]].exec(reg);
                            temp[xvar] = Xvar;
                        }
                        if (thiz.primaryMappings2[xvar].Prefix) {
                            var Xvar = thiz.primaryMappings2[xvar].Prefix + prod[map[xvar + "Col"]];
                            temp[xvar] = Xvar;
                        }
                    } else temp[xvar] = prod[map[xvar + "Col"]];
                }
            }

            product.push(temp);
        });
        this.products = product;
    }.bind(this);

    this.back = function () {
        this.opts.resolver(void 0, this.opts.path, this.opts.path.slice(0, this.opts.path.lastIndexOf('/')));
        this.unmount();
    }.bind(this);
    this.next = function () {
        this.opts.resolver(this.products, this.opts.path, this.opts.path + "/preview");
        this.unmount();
    }.bind(this);
});

riot$1.tag2('my-choice', '<div class="c-card u-highest" class="u-center-block" style="width: 95%; height: 40%; margin: auto"> <div class="c-card__item c-card__item--brand" align="center">Configure Other Properties</div> <div class="c-card__item"> <div if="{!this.opts.state.root}"> <label class="block-label" for="skuColumn">SKU Column :</label> <select name="skuColumn" onchange="{update}" class="c-field" style="width: 20%; display:inline-block;"> <option selected></option> <option each="{column in this.header}" value="{column}" no-reorder>{column}</option> </select> </div> <br if="{!this.opts.state.root}"> <div class="o-grid o-grid--wrap" style="height:300px"> <div class="o-grid__cell o-grid__cell--width-33" if="{this.opts.state.root}"> <button class="c-button c-button--info butt" type="button" name="pr" onclick="{process}">Reconfigure Primary Mappings</button> </div> <div class="o-grid__cell o-grid__cell--width-33"> <button class="c-button c-button--info butt" type="button" name="my-secondary" id="secondaryMappings2" onclick="{process}">Secondary Mapping</button> </div> <div class="o-grid__cell o-grid__cell--width-33"> <button class="c-button c-button--info butt" type="button" name="my-property" id="propertyGroups2" onclick="{process}">Property Group</button> </div> <div class="o-grid__cell o-grid__cell--width-33"> <button class="c-button c-button--info butt" type="button" name="my-group" id="groupMappings" onclick="{process}">Group Mapping</button> </div> <div class="o-grid__cell o-grid__cell--width-33"> <button class="c-button c-button--info butt" type="button" name="my-cm" id="categoryMapping" onclick="{process}">Category Mapping</button> </div> <div class="o-grid__cell o-grid__cell--width-33" if="{this.opts.state.root}"> <button class="c-button c-button--info butt" type="button" name="my-processor" id="postProcessors" onclick="{process}">Post Processor</button> </div> </div> <br> <div class="seperator"></div> <br> <div align="center"> <button class="c-button c-button--success" type="button" onclick="{done}">Done</button> </div> </div> </div>', '.butt { width:95%; white-space: normal; word-wrap: break-word; height: 95%; }', '', function (opts) {
    this.on("mount", function () {
        if (!this.opts.state.root) this.header = this.opts.data.header;
        this.update();
        if (this.opts.data.sku) this.skuColumn.value = this.opts.data.sku;
        this.update();
    });
    this.process = function (e) {
        if (!this.opts.state.root && !this.skuColumn.value) {
            alert("Please selecta valid column for SKU");
            return void 0;
        }
        if (e.target.name === "pr") {
            this.opts.resolver(void 0, this.opts.path, "begin/pro/type/upload_parse");
            this.unmount();
        } else {
            this.opts.resolver({ type: e.target.name, obj: e.target.id, sku: this.skuColumn.value }, this.opts.path, this.opts.path + "/choice");
            this.unmount();
        }
    }.bind(this);
    this.done = function () {
        if (this.opts.state.root) this.opts.resolver(void 0, this.opts.path, "begin");else this.opts.resolver(void 0, this.opts.path, "begin/pro/type/upload_parse/primaryMap/preview/choice");
        this.unmount();
    }.bind(this);
});

riot$1.tag2('my-secondary', '<rg-alerts></rg-alerts> <div class="c-card u-highest" class="u-center-block" style="width: 95%; height: 40%; margin: auto"> <div class="c-card__item c-card__item--brand" align="center">Secondary Mapping</div> <div class="c-card__item"> <button name="new" class="c-button c-button--info" style="width:auto" type="button" onclick="{insert}" if="{!this.insertion}">Create New</button> <div if="{!this.insertion}"> <br> <div class="inps"> <div class="elmts" each="{map in secondaryMap}"> <label class="grps">&nbsp;&#8226;&nbsp;{map.ObjectName}&nbsp;&nbsp;</label> <button onclick="{parent.removeMapping}" class="c-button c-button--error grps" type="button" style="height:95%">Remove</button> </div> </div> </div> <div if="{!this.insertion && secondaryMap.length > 0}"> <br> <div align="center">PREVIEW</h4></div> <div> <label for="languageSelect">Languages</label> <select name="languageSelect" class="c-field" onchange="{process}" style="width: auto; display:inline-block;"> <option each="{lang in this.opts.data.langs}" value="{lang}">{lang}</option> </select> </div> <div class="o-grid o-grid--wrap"> <div each="{node in preview}" class="o-grid__cell o-grid__cell--width-30 " style="margin:1%;background-color: rgba(44, 62, 80, 0.16);word-wrap: break-word;"> <div> Article ID : {node.id} </div> <div> <virtual each="{map in secondaryMap}"> Article {map.ObjectName} : {isNaN(node[map.ObjectName])?⁗error⁗:node[map.ObjectName]} <br> </virtual> </div> </div> </div> </div> <div align="center" if="{!this.insertion}"> <br> <div class="seperator"></div> <br> <button name="back" onclick="{done}" class="c-button c-button--info" style="width:auto" type="button"> Done </button> <button onclick="{cancel}" class="c-button c-button--error" type="button">Cancel</button> </div> <div if="{this.insertion}" class="inps"> <form name="sm"> <div class="elmts"> <label class="grps" for="name">Object name: </label> <input type="text" name="name" maxlength="255" class="c-field grps"> </div> <div class="elmts"> <label class="grps" for="valueType">Value Type: </label> <select name="valueType" onchange="{update}" class="c-field grps"> <option selected></option> <option value="float64"> Float 64 </option> <option value="string"> String </option> </select> </div> <div class="elmts"> <label class="grps" for="langOpt">Same column for all Languages :</label> <select name="langOpt" onchange="{update}" class="c-field grps"> <option value="0">yes</option> <option value="1">no</option> </select> </div> <div if="{this.langOpt.value == 0}" class="elmts"> <label class="grps" for="column">Column :</label> <select name="sameColumn" onchange="{update}" class="c-field grps"> <option selected></option> <option each="{column in this.header}" value="{column}">{column}</option> </select> </div> <virtual each="{lang in this.langs}"> <div if="{this.langOpt.value == 1}" class="elmts"> <label class="grps" for="{lang}">{lang}:</label> <select id="{lang}" onchange="{update}" class="c-field grps"> <option selected></option> <option each="{column in this.header}" value="{column}">{column}</option> </select> </div> </virtual> <div class="elmts"> <label class="c-toggle c-toggle--success grps"> Regex: <input type="checkbox" name="reg" onchange="{update}"></input> <div class="c-toggle__track" style="display:inline-block; float:right"> <div class="c-toggle__handle"></div> </div> </label> <input type="text" name="regex" maxlength="50" if="{reg.checked}" class="grps c-field"></input> </div> <div class="elmts"> <label class="c-toggle c-toggle--success grps"> Prefix: <input type="checkbox" name="pre" onchange="{update}"></input> <div class="c-toggle__track" style="display:inline-block; float:right"> <div class="c-toggle__handle"></div> </div> </label> <input type="text" name="prefix" maxlength="50" if="{pre.checked}" class="grps c-field"></input> </div> </form> </div> <div align="center" if="{this.insertion}"> <br> <div class="seperator"></div> <br> <button onclick="{addMapping}" class="c-button c-button--info" style="width:auto" type="button">ADD</button> <button onclick="{reset}" class="c-button c-button--error" type="button">Cancel</button> </div> </div> </div>', '', '', function (opts) {

	this.insertion = false;
	var tag = this;

	this.test = function (e) {
		console.log(e);
	}.bind(this);

	this.on("mount", function () {
		this.langs = this.opts.data.langs;
		this.header = this.opts.data.header;
		this.secondaryMap = this.opts.state.init;
		this.sample = this.opts.data.sample;
		this.ids = this.opts.data.ids;

		this.process();
		this.update();
	});

	this.process = function () {
		this.preview = [];
		var lang = this.languageSelect.value;
		for (var i = 0; i < this.sample.length; i++) {
			var temp = {};
			temp.id = this.ids[i].id;
			for (var j = 0; j < this.secondaryMap.length; j++) {
				if (this.secondaryMap[j].Regex || this.secondaryMap[j].Prefix) {
					if (this.secondaryMap[j].Regex) {
						var reg = new RegExp(this.secondaryMap[j].Regex);
						temp[this.secondaryMap[j].ObjectName] = this.sample[i][this.secondaryMap[j].LanguageParameterNames[lang]].exec(reg);
					}
					if (this.secondaryMap[j].Prefix) {
						var pre = this.secondaryMap[j].Prefix;
						temp[this.secondaryMap[j].ObjectName] = pre + this.sample[i][this.secondaryMap[j].LanguageParameterNames[lang]];
					}
				} else temp[this.secondaryMap[j].ObjectName] = this.sample[i][this.secondaryMap[j].LanguageParameterNames[lang]];

				if (this.secondaryMap[j].ValueType === "float64") {
					temp[this.secondaryMap[j].ObjectName] = parseFloat(this.sample[i][this.secondaryMap[j].LanguageParameterNames[lang]]);
				}
			}
			this.preview.push(temp);
		}
	};

	this.insert = function () {
		this.insertion = true;
	}.bind(this);

	this.done = function () {
		this.opts.resolver({ data: this.secondaryMap, type: "secondaryMappings2" }, this.opts.path, this.opts.path.slice(0, this.opts.path.lastIndexOf('/')));
		this.unmount();
	}.bind(this);

	this.cancel = function () {
		this.opts.resolver({ data: this.opts.state.init.length > 0 ? this.secondaryMap : void 0, type: "secondaryMappings2" }, this.opts.path, this.opts.path.slice(0, this.opts.path.lastIndexOf('/')));
		this.unmount();
	}.bind(this);

	this.reset = function () {
		this.insertion = false;
		this.sm.reset();
	}.bind(this);

	this.addMapping = function (e) {
		this.update();
		this.temp = {};
		if (this.name.value) {
			this.temp.ObjectName = this.name.value;
			if (this.valueType.value === 'other') this.temp.ValueType = this.othervalue.value;else if (!this.valueType.value) {
				this.alerter("Please select value type", "error");
				return void 0;
			} else this.temp.ValueType = this.valueType.value;

			this.temp.LanguageParameterNames = {};

			if (this.langOpt.value == 0) {
				if (!this.sameColumn.value) {
					this.alerter("Please choose a column header", "error");
					return void 0;
				}
				for (var i = 0; i < this.langs.length; i++) {
					var temp = {};
					temp[this.langs[i]] = this.sameColumn.value;
					_.extend(this.temp.LanguageParameterNames, temp);
				}
			} else if (this.langOpt.value == 1) {
				for (var i = 0; i < this.langs.length; i++) {
					var thisLang = document.getElementById(this.langs[i]);
					if (!thisLang.value) {
						this.alerter("Please choose a column header for " + this.langs[i], "error");
						return void 0;
					}

					var temp = {};
					temp[this.langs[i]] = thisLang.value;
					_.extend(this.temp.LanguageParameterNames, temp);
				}
			}

			if (this.reg.checked) {
				if (!this.regex.value) {
					this.alerter("Please enter Regex Value", "error");
					return void 0;
				}
				this.temp.Regex = this.regex.value;
			}
			if (this.pre.checked) {
				if (!this.prefix.value) {
					this.alerter("Please enter Prefix Value", "error");
					return void 0;
				}
				this.temp.Prefix = this.prefix.value;
			}

			this.secondaryMap.push(this.temp);
			this.sm.reset();
			this.process();
			this.insertion = false;
			this.update();
		} else {
			this.alerter("Please enter object name", "error");
		}
	}.bind(this);

	this.removeMapping = function (e) {
		this.secondaryMap.splice(this.secondaryMap.indexOf(e.item), 1);
	}.bind(this);

	this.alerter = function (message, type) {
		riot$1.mount('rg-alerts', {
			alerts: [{
				type: type,
				text: message,
				timeout: 3000
			}]
		});
	}.bind(this);
});

riot$1.tag2('my-cm', '<rg-alerts></rg-alerts> <div class="c-card u-highest" class="u-center-block" style="width: 95%; height: 40%; margin: auto"> <div class="c-card__item c-card__item--brand" align="center">Category Mapping</div> <div class="c-card__item"> <div class="inps"> <div class="elmts"> <label class="grps" for="cc">Category Type :</label> <select name="ct" onchange="{update}" class="grps c-field " style="display:inline-block; width:80%"> <option selected></option> <option value="url">Category URL</option> <option value="discrete">Discrete Categories</option> </select> </div> <div class="elmts"> <label class="grps" for="cc">Category Column :</label> <select name="cc" onchange="{update}" class="grps c-field " style="display:inline-block; width:80%"> <option selected></option> <option each="{column in this.opts.data.header}" value="{column}">{column}</option> </select> </div> <div class="elmts"> <label class="grps" for="delimSelect">Delimiter:</label> <div class="grps"> <select name="delimSelect" onchange="{update}" class="c-field grps" style="display:inline-block; width:80%"> <option selected> </option> <option value="-1">Custom</option> <option value=";">;</option> <option value=",">,</option> <option value="\\t">Tab</option> <option value="|">|</option> <option value=" ">Space</option> <option value="/">/</option> </select> <input type="text" name="customDelim" maxlength="1" onkeyup="{update}" if="{delimSelect.value ==\'-1\'}" class="c-field" style="display:inline-block; width:18%; float:right"> </div> </div> </div> <br><br> <div if="{cats.length > 0}"> <div align="center">PREVIEW</h4></div> <div> <label for="languageSelect">Languages</label> <select name="languageSelect" class="c-field" onchange="{update}" style="width: auto; display:inline-block;"> <option each="{lang in this.opts.data.langs}" value="{lang}">{lang}</option> </select> </div> <br> <div class="o-grid o-grid--wrap"> <div each="{node in cats}" class="o-grid__cell o-grid__cell--width-30 " style="margin:1%;background-color: rgba(44, 62, 80, 0.16);word-wrap: break-word;"> <div> Article ID = {node.id} </div> <div> Article Categories = &nbsp; <virtual if="{this.ct.value==⁗discrete⁗}"> [ <virtual each="{cat in node.categories}"> "{cat}", </virtual> ] </virtual> <virtual if="{this.ct.value!=⁗discrete⁗}" each="{cat in node.categories}"> {cat}{delimSelect.value} </virtual> </div> </div> </div> </div> <br> <div class="seperator"></div> <br> <div align="center"> <button onclick="{process}" class="c-button c-button--success" type="button">OK</button> <button onclick="{cancel}" class="c-button c-button--error" type="button">Cancel</button> </div> </div> </div>', '', '', function (opts) {
	this.on("mount", function () {
		this.langs = this.opts.data.langs;
		this.header = this.opts.data.header;
		this.sample = this.opts.data.sample;
		this.ids = this.opts.data.ids;
		this.cc.value = this.opts.state.init.columnHeader;
		this.ct.value = this.opts.state.init.Type;
		this.delimSelect.value = this.opts.state.init.delimiter;
		this.update();
	});

	this.on("update", function () {
		if (this.cc.value && this.delimSelect.value && this.ct.value) {
			this.categoryMapping = {};
			this.categoryMapping.Type = this.ct.value;
			this.categoryMapping.columnHeader = this.cc.value;
			if (this.delimSelect.value != -1) this.categoryMapping.delimiter = this.delimSelect.value;else this.categoryMapping.delimiter = this.customDelim.value;
			this.preview();
		}
	});

	this.preview = function () {
		this.cats = [];
		var lang = this.languageSelect.value;
		for (var i = 0; i < this.sample.length; i++) {
			var temp = {};
			temp.id = this.ids[i].id;
			if (this.ct.value === "discrete") temp.categories = this.sample[i][this.categoryMapping.columnHeader].split(this.categoryMapping.delimiter);else temp.categories = this.sample[i][this.categoryMapping.columnHeader].split(this.categoryMapping.delimiter);
			this.cats.push(temp);
		}
	}.bind(this);

	this.process = function () {
		if (this.cc.value && this.delimSelect.value && this.ct.value) this.opts.resolver({ data: this.categoryMapping, type: "categoryMapping" }, this.opts.path, this.opts.path.slice(0, this.opts.path.lastIndexOf('/')));else {
			riot$1.mount('rg-alerts', {
				alerts: [{
					type: "error",
					text: "All fields are compulsary",
					timeout: 3000
				}]
			});
			return void 0;
		}

		this.unmount();
	}.bind(this);

	this.cancel = function () {
		this.opts.resolver({ data: this.opts.state.init.columnHeader ? this.categoryMapping : void 0, type: "categoryMapping" }, this.opts.path, this.opts.path.slice(0, this.opts.path.lastIndexOf('/')));
		this.unmount();
	}.bind(this);
});

riot$1.tag2('my-property', '<rg-alerts></rg-alerts> <div class="c-card u-highest" class="u-center-block" style="width: 95%; height: 40%; margin: auto"> <div class="c-card__item c-card__item--brand" align="center">Property Group Mapping</div> <div class="c-card__item"> <div if="{!this.insertion}"> <button name="new" onclick="{insert}" class="c-button c-button--success" type="button">Create New</button> <br><br> <div class="inps"> <div class="elmts" each="{prop in this.propertyGroups2}" no-reorder> <label class="grps">&nbsp;&#8226;&nbsp;{prop.Options[0].PropertyGroupID}&nbsp;&nbsp;</label> <button onclick="{parent.removePropertyGroup}" class="c-button c-button--error grps" type="button" style="height:95%">Remove</button> </div> </div> <br> <div if="{propertyGroups2.length>0}"> <div align="center">PREVIEW</h4></div> <div> <label for="languageSelect">Languages</label> <select name="languageSelect" class="c-field" onchange="{update}" style="width: auto; display:inline-block;"> <option each="{lang in this.opts.data.langs}" value="{lang}">{lang}</option> </select> </div> <br> <div class="o-grid o-grid--wrap" if="{propertyGroups2.length>0}"> <div each="{node in sample}" class="o-grid__cell o-grid__cell--width-30 " style="margin:1%;background-color: rgba(44, 62, 80, 0.16);word-wrap: break-word;"> <div> Article ID = {node[ids[languageSelect.value]]} </div> <div> <virtual each="{map in propertyGroups2}"> Article {map.Options[0].Labels[languageSelect.value]} = {node[map.LanguageParameterNames[languageSelect.value]]} <br> </virtual> </div> </div> </div> </div> <div align="center"> <br> <div class="seperator"></div> <br> <button onclick="{done}" class="c-button c-button--success" style="width:auto" type="button"> Done </button> <button onclick="{cancel}" class="c-button c-button--error" type="button">Cancel</button> </div> </div> <div if="{this.insertion}"> <form name="pm"> <div class="inps"> <div class="elmts"> <label class="grps" for="name">Property Group ID: </label> <input type="text" name="name" maxlength="255" class="grps c-field"> </div> <div class="elmts"> <label class="grps" for="valueType">Value Type: </label> <select name="valueType" onchange="{update}" class="grps c-field"> <option selected></option> <option value="float64"> Float 64 </option> <option value="string"> String </option> </select> </div> <div class="elmts"> <label class="grps" for="langOpt">Same column for all Languages :</label> <select name="langOpt" onchange="{update}" class="grps c-field"> <option value="0">yes</option> <option value="1" if="{this.langs.length > 1}">no</option> </select> </div> <div if="{this.langOpt.value == 0}" class="elmts"> <label class="grps" for="sameColumn">Column :</label> <select name="sameColumn" onchange="{update}" class="grps c-field"> <option selected></option> <option each="{column in this.header}" value="{column}" no-reorder>{column}</option> </select> </div> <virtual each="{lang in this.langs}"> <div if="{this.langOpt.value == 1}" class="elmts"> <label class="grps" for="{lang}">{lang}:</label> <select id="{lang}" onchange="{update}" class="c-field grps"> <option selected></option> <option each="{column in this.header}" value="{column}">{column}</option> </select> </div> </virtual> <div class="elmts"> <label class="grps" for="lngOpt">Same label for all Languages :</label> <select name="lngOpt" onchange="{update}" class="grps c-field"> <option value="0">yes</option> <option value="1" if="{this.langs.length > 1}">no</option> </select> </div> <virtual each="{lang in this.langs}"> <div if="{this.lngOpt.value == 1}" class="elmts"> <label class="grps" for="{lang+⁗_⁗}">{lang} Label:</label> <input id="{lang+⁗_⁗}" type="text" maxlength="25" onchange="{update}" class="grps c-field"> </input> </div> </virtual> <div if="{this.lngOpt.value == 0}" class="elmts"> <label class="grps" for="sameCol">Label :</label> <input name="sameCol" type="text" maxlength="25" onchange="{update}" class="grps c-field"> </input> </div> <div class="elmts"> <label class="c-toggle c-toggle--success grps"> Splitter <input type="checkbox" name="split" onchange="{update}" class="grps"></input> <div class="c-toggle__track" style="display:inline-block; float:right"> <div class="c-toggle__handle"></div> </div> </label> <input type="text" name="splitter" maxlength="1" if="{split.checked}" onkeyup="{update}" class="grps c-field"></input> </div> </div> <br> </form> <div align="center"> <br> <div class="seperator"></div> <br> <button onclick="{addPropertyGroup}" class="c-button c-button--success" style="width:auto" type="button"> ADD </button> <button onclick="{reset}" class="c-button c-button--error" type="button">Cancel</button> </div> </div> </div> </div>', '', '', function (opts) {

	this.on("mount", function () {
		this.langs = this.opts.data.langs;
		this.header = this.opts.data.header;
		this.propertyGroups2 = this.opts.state.init;
		this.sample = this.opts.data.sample;
		this.ids = this.opts.data.ids;
		this.update();
	});

	this.insertion = false;

	this.insert = function () {
		this.insertion = true;
	}.bind(this);

	this.done = function () {
		this.opts.resolver({ data: this.propertyGroups2, type: "propertyGroups2" }, this.opts.path, this.opts.path.slice(0, this.opts.path.lastIndexOf('/')));
		this.unmount();
	}.bind(this);

	this.mapChecker = function (value) {
		for (var i = 0; i < this.propertyGroups2.length; i++) {
			if (this.propertyGroups2[i].Options[0].PropertyGroupID === value) return false;
		}
		return true;
	}.bind(this);

	this.alerter = function (message, type) {
		riot$1.mount('rg-alerts', {
			alerts: [{
				type: type,
				text: message,
				timeout: 3000
			}]
		});
	}.bind(this);

	this.addPropertyGroup = function (e) {

		if (!this.name.value) {
			this.alerter("Please enter the Property Group ID", "error");
			return void 0;
		}
		if (!this.valueType.value) {
			this.alerter("Please select the value type", "error");
			return void 0;
		}

		this.temp = {};
		this.temp.Options = [{}];

		this.temp.Options[0].PropertyGroupID = this.name.value;

		this.temp.ValueType = this.valueType.value;

		this.temp.LanguageParameterNames = {};

		if (this.langOpt.value == 0) {
			if (!this.sameColumn.value) {
				this.alerter("Please select the column header", "error");
				return void 0;
			}
			for (var i = 0; i < this.langs.length; i++) {
				var temp = {};
				temp[this.langs[i]] = this.sameColumn.value;
				_.extend(this.temp.LanguageParameterNames, temp);
			}
		} else if (this.langOpt.value == 1) {
			for (var i = 0; i < this.langs.length; i++) {
				var thisLang = document.getElementById(this.langs[i]);
				if (!thisLang.value) {
					this.alerter("Please choose a column header for " + this.langs[i], "error");
					return void 0;
				}

				var temp = {};
				temp[this.langs[i]] = thisLang.value;
				_.extend(this.temp.LanguageParameterNames, temp);
			}
		}

		if (this.split.checked) {
			if (!this.splitter.value) {
				this.alerter("Please select a value for or disable splitter", "error");
				return void 0;
			}
			this.temp.Splitter = this.splitter.value;
		}

		var labels = {};

		if (this.lngOpt.value == 0) {
			if (!this.sameCol.value) {
				this.alerter("Please enter a value for the label", "error");
				return void 0;
			}
			for (var i = 0; i < this.langs.length; i++) {
				var tem = {};
				tem[this.langs[i]] = this.sameCol.value;
				_.extend(labels, tem);
			}
		} else if (this.lngOpt.value == 1) {
			for (var i = 0; i < this.langs.length; i++) {
				var thisLangLab = document.getElementById(this.langs[i] + "_");
				if (!thisLangLab.value) {
					this.alerter("Please enter a label for " + this.langs[i], "error");
					return void 0;
				}

				var tem = {};
				tem[this.langs[i]] = thisLangLab.value;
				_.extend(labels, tem);
			}
		}

		this.temp.Options[0].Labels = labels;

		this.propertyGroups2.push(this.temp);
		this.pm.reset();
		this.insertion = false;
		this.update();
	}.bind(this);

	this.removePropertyGroup = function (e) {
		this.propertyGroups2.splice(this.propertyGroups2.indexOf(e.item), 1);
	}.bind(this);

	this.cancel = function () {
		this.opts.resolver({ data: this.opts.state.init.length > 0 ? this.propertyGroups2 : void 0, type: "propertyGroups2" }, this.opts.path, this.opts.path.slice(0, this.opts.path.lastIndexOf('/')));
		this.unmount();
	}.bind(this);

	this.reset = function () {
		this.insertion = false;
		this.pm.reset();
	}.bind(this);
});

riot$1.tag2('my-group', '<rg-alerts></rg-alerts> <div class="c-card u-highest" class="u-center-block" style="width: 95%; height: 40%; margin: auto"> <div class="c-card__item c-card__item--brand" align="center">Group Mapping</div> <div class="c-card__item"> <div class="inps"> <div class="elmts"> <label class="grps" for="vc">Variant Column :</label> <select name="vc" onchange="{update}" class="grps c-field"> <option selected></option> <option each="{column in this.opts.data.header}" value="{column}" class="grps">{column}</option> </select> </div> <div class="elmts"> <label class="c-toggle c-toggle--success grps"> Append Variant Properties To Parent <input type="checkbox" name="ap" onchange="{update}"></input> <div class="c-toggle__track" style="display:inline-block; float:right"> <div class="c-toggle__handle"></div> </div> </label> </div> <div class="elmts"> <label class="c-toggle c-toggle--success grps"> Append Variant Properties To Parent <input type="checkbox" name="up" onchange="{update}" class="grps"></input> <div class="c-toggle__track" style="display:inline-block; float:right"> <div class="c-toggle__handle"></div> </div> </label> </div> <div class="elmts"> <label class="c-toggle c-toggle--success grps"> Splitter <input type="checkbox" name="split" onchange="{update}" class="grps"></input> <div class="c-toggle__track" style="display:inline-block; float:right"> <div class="c-toggle__handle"></div> </div> </label> <input type="text" name="splitter" maxlength="1" if="{split.checked}" onkeyup="{update}" class="grps c-field "></input> </div> </div> <br><br> <div if="{vars.length > 0}"> <div align="center">PREVIEW</h4></div> <div> <label for="languageSelect">Languages</label> <select name="languageSelect" class="c-field" onchange="{update}" style="width: auto; display:inline-block;"> <option each="{lang in this.opts.data.langs}" value="{lang}">{lang}</option> </select> </div> <br> <div class="o-grid o-grid--wrap"> <div each="{node in vars}" class="o-grid__cell o-grid__cell--width-30 " style="margin:1%;background-color: rgba(44, 62, 80, 0.16);word-wrap: break-word;"> <div> Article ID = {node.id} </div> <div> Article Variant(s) = &nbsp;[ <virtual each="{var in node.varients}"> "{var}", </virtual> ] </div> </div> </div> </div> <br> <div class="seperator"></div> <br> <div align="center"> <button name="o" onclick="{back}" class="c-button c-button--success" type="button">done</button> <button onclick="{cancel}" class="c-button c-button--error" type="button">Cancel</button> </div> </div> </div>', '', '', function (opts) {

	this.on("mount", function () {
		this.langs = this.opts.data.langs;
		this.header = this.opts.data.header;
		this.sample = this.opts.data.sample;
		this.ids = this.opts.data.ids;
		this.vc.value = this.opts.state.init.VariantsColumn;
		this.ap.checked = this.opts.state.init.AppendVariantPropertiesToParent;
		this.up.checked = this.opts.state.init.UseVariantsAsPropertySourceOnly;
		if (this.opts.state.init.Splitter) this.splitter.value = this.opts.state.init.Splitter;

		this.update();
	});

	this.back = function () {
		if (this.vc.value) {
			this.opts.resolver({ data: this.groupMappings, type: "groupMappings" }, this.opts.path, this.opts.path.slice(0, this.opts.path.lastIndexOf('/')));
		} else {
			riot$1.mount('rg-alerts', {
				alerts: [{
					type: "error",
					text: "All fields are compulsary",
					timeout: 3000
				}]
			});
			return void 0;
		}
		this.unmount();
	}.bind(this);

	this.on("update", function () {
		if (this.vc.value) {
			this.groupMappings = {};
			this.groupMappings.VariantsColumn = this.vc.value;
			this.groupMappings.AppendVariantPropertiesToParent = this.ap.checked;
			this.groupMappings.UseVariantsAsPropertySourceOnly = this.up.checked;
			if (this.split.checked) {
				this.groupMappings.Splitter = this.splitter.value;
			}
			this.process();
		}
	});

	this.process = function () {
		if (this.vc.value) {
			var preview = new Map();
			var check = this.split.checked;
			var lang = this.languageSelect.value;

			for (var i = 0; i < this.sample.length; i++) {
				var varients = [];
				if (check) varients = this.sample[i][this.groupMappings.VariantsColumn].split(this.groupMappings.Splitter);else varients = [this.sample[i][this.groupMappings.VariantsColumn]];

				var TempId = preview.get(this.ids[i].id);

				if (!TempId) {
					preview.set(this.ids[i].id, varients);
				} else {
					preview.set(this.ids[i].id, TempId.concat(varients));
				}
			}
		}

		var tag = this;
		this.vars = [];
		preview.forEach(function (value, key) {
			var temp = {};
			temp.id = key;
			temp.varients = value;
			tag.vars.push(temp);
		});
	}.bind(this);

	this.cancel = function () {
		this.opts.resolver({ data: this.opts.state.init.VariantsColumn ? this.groupMappings : void 0, type: "groupMappings" }, this.opts.path, this.opts.path.slice(0, this.opts.path.lastIndexOf('/')));
		this.unmount();
	}.bind(this);
});

riot$1.tag2('my-tree', '<div> <ul> <li each="{child in opts.children}">{child.lab}&nbsp;<button if="{child.children.length > 0}" onclick="{collapse}">&#9660;</button> <my-tree children="{child.children}" if="{child.expand}"><my-tree> </li> </ul> </div>', '', '', function (opts) {

	this.collapse = function (e) {
		e.item.child.expand = !e.item.child.expand;
	}.bind(this);
});

riot$1.tag2('my-rest', '<rg-alerts></rg-alerts> <div class="c-card u-highest" class="u-center-block" style="width: 95%; height: 40%; margin: auto"> <div class="c-card__item c-card__item--brand" align="center">Category Feed Configuration</div> <div class="c-card__item"> <div class="inps" if="{!pre}"> <div class="elmts"> <label class="grps" for="ttype">Categories Type: </label> <select name="ttype" onchange="{update}" class="grps c-field"> <option value="simple_tree">Simple Tree</option> </select> </div> <div class="elmts"> <label class="grps" for="langOpt">Same column for the labels of all Languages :</label> <select name="langOpt" onchange="{update}" class="grps c-field"> <option value="0">yes</option> <option value="1">no</option> </select> </div> <div each="{lang in this.langs}" if="{this.langOpt.value == 1}" class="elmts"> <label class="grps" for="{lang}">{lang} :</label> <select name="{lang}" onchange="{updatelangs}" class="grps c-field"> <option selected></option> <option each="{column in this.header}" value="{column}">{column}</option> </select> </div> <div if="{this.langOpt.value == 0}" class="elmts"> <label class="grps" for="column">Column for all labels :</label> <select name="sameColumn" onchange="{update}" class="grps c-field"> <option selected></option> <option each="{column in this.header}" value="{column}">{column}</option> </select> </div> <div class="elmts"> <label class="grps" for="id_column">ID Column :</label> <select name="id_column" onchange="{update}" class="grps c-field"> <option selected></option> <option each="{column in this.header}" value="{column}">{column}</option> </select> </div> <div class="elmts"> <label class="grps" for="pid_column">Parent ID column :</label> <select name="pid_column" onchange="{update}" class="c-field grps"> <option selected value="-1"></option> <option each="{column in this.header}" value="{column}">{column}</option> </select> </div> <div class="elmts"> <label class="grps" for="root_column">Root Indicator Column :</label> <select name="root_column" onchange="{update}" class="c-field grps"> <option selected value="-1"></option> <option each="{column in this.header}" value="{column}">{column}</option> </select> </div> <div class="elmts"> <label class="grps" for="root_value">Value of Root indicator: </label> <input type="text" name="root_value" maxlength="255" class="c-field grps"> </div> </div> <div align="center" if="{!pre}"> <br> <div class="seperator"></div> <br> <button onclick="{preview}" class="c-button c-button--info" style="width:auto" type="button"> Preview </button> </div> <div if="{pre}"> <div name="lang"> <label class="block-label" for="languageSelect">Language</label> <select name="languageSelect" onchange="{preview}"> <option each="{lang in this.langs}" value="{lang}">{lang}</option> </select> </div> <div> <ol> <li each="{node in tree}">{node.lab} &nbsp;<button if="{node.children.length > 0}" onclick="{collapse}">&#9660;</button> <my-tree children="{node.children}" if="{node.expand}"></my-tree> </li> </ol> </div> </div> <div align="center" if="{pre}"> <br> <div class="seperator"></div> <br> <button onclick="{finish}" class="c-button c-button--success" style="width:auto" type="button">Done</button> <button onclick="{reconfig}" class="c-button c-button--error" style="width:auto" type="button">Reconfigure</button><br> </div> </div> </div>', '', '', function (opts) {

	this.on("mount", function () {
		this.langs = this.opts.data.langs;
		this.header = this.opts.data.header;
		this.values = {};
		this.pre = false;
		this.update();
	});

	this.templang = {};

	this.reconfig = function () {
		this.pre = !this.pre;
	}.bind(this);

	this.updatelangs = function (e) {
		this.templang[e.item.lang] = e.target.value;
	}.bind(this);

	this.collapse = function (e) {
		e.item.node.expand = !e.item.node.expand;
	}.bind(this);

	this.process = function () {

		if (!this.ttype.value || !this.id_column.value || !this.pid_column.value || !this.root_column.value || !this.root_value.value) {
			this.alerter("All fields are compulsary", "error");
			return void 0;
		}

		var temp = {};
		temp.categoriesType = this.ttype.value;
		temp.label = {};

		if (this.langOpt.value == 0) {
			for (var i = 0; i < this.langs.length; i++) {
				if (!this.sameColumn.value) {
					this.alerter("Please select a column header", "error");
					return void 0;
				}
				var tem = {};
				tem[this.langs[i]] = this.sameColumn.value;
				_.extend(temp.label, tem);
			}
		} else if (this.langOpt.value == 1) {
			for (var i = 0; i < this.langs.length; i++) {
				if (!this.templang[this.langs[i]]) {
					this.alerter("Please select a column header for " + this.langs[i], "error");
					return void 0;
				}
				var tem = {};
				tem[this.langs[i]] = this.templang[this.langs[i]];
				_.extend(temp.label, tem);
			}
		}
		temp.idColumn = this.id_column.value;
		temp.parentIDColumn = this.pid_column.value;
		temp.rooIndicator = { source: "column:" + this.root_column.value, equals: this.root_value.value };

		this.values = temp;
		return true;
	}.bind(this);

	this.treecreate = function (val) {
		this.tree = [];
		this.sample = this.opts.data.SampleValues;

		for (var i = 0; i < this.sample.length; i++) {
			if (this.sample[i][this.root_column.value] == this.root_value.value) {
				var temp = {};
				temp.ID = this.sample[i][this.id_column.value];
				temp.lab = this.sample[i][this.values.label[val]];
				temp.children = [];
				temp.expand = false;
				this.tree.push(temp);
			}
		}

		for (var j = 0; j < this.tree.length; j++) {
			this.tree[j].children = this.addchildren(this.tree[j].ID, val);
		}
	}.bind(this);

	this.addchildren = function (nodeid, val) {
		var result = [];
		for (var i = 0; i < this.sample.length; i++) {
			var temp = {};
			if (this.sample[i][this.pid_column.value] == nodeid) {
				temp.ID = this.sample[i][this.id_column.value];
				temp.children = this.addchildren(this.sample[i][this.id_column.value], val);
				temp.lab = this.sample[i][this.values.label[val]];
				temp.expand = false;
				result.push(temp);
			}
		}
		return result;
	};

	this.finish = function () {
		this.process();
		this.opts.resolver(this.values, this.opts.path, "begin");
		this.unmount();
	}.bind(this);

	this.preview = function () {

		if (this.process()) {
			this.pre = true;
			this.treecreate(this.languageSelect.value);
		}
	}.bind(this);

	this.alerter = function (message, type) {
		riot$1.mount('rg-alerts', {
			alerts: [{
				type: type,
				text: message,
				timeout: 3000
			}]
		});
	}.bind(this);
});

riot$1.tag2('my-processor', '<rg-alerts></rg-alerts> <div class="c-card u-highest" class="u-center-block" style="width: 95%; height: 40%; margin: auto"> <div class="c-card__item c-card__item--brand" align="center">Post Processors</div> <div class="c-card__item"> <div if="{!this.insertion}"> <button name="new" onclick="{insert}" class="c-button c-button--info" style="width:auto" type="button">Create New</button> <br><br> <div> <div class="inps"> <div class="elmts" each="{name in names}"> <label class="grps">&nbsp;&#8226;&nbsp;{name}&nbsp;&nbsp;</label> <button onclick="{parent.removeMapping}" class="c-button c-button--error grps" type="button" style="height:95%">Remove</button> </div> </div> </div> <div align="center"> <br> <div class="seperator"></div> <br> <button name="back" onclick="{done}" class="c-button c-button--info" style="width:auto" type="button"> Done </button> <br> </div> </div> <div if="{this.insertion}" class="inps"> <div class="elmts"> <label class="grps" for="name">Name: </label> <input type="text" name="name" maxlength="255" class="grps c-field"> </div> <div class="elmts"> <label class="grps" for="name">Type: </label> <select name="type" onchange="{update}" class="grps c-field"> <option value="additionalProductInformation">Aditional Product Information</option> </select> </div> </div> <div align="center" if="{insertion}"> <br> <div class="seperator"></div> <br> <button name="new" onclick="{process}" class="c-button c-button--success" style="width:auto" type="button">Continue</button> <button name="new" onclick="{insert}" class="c-button c-button--error" style="width:auto" type="button">Cancel</button> <br> </div> </div> </div>', '', '', function (opts) {

	this.insertion = false;

	this.on("mount", function () {
		this.langs = this.opts.data.langs;
		this.header = this.opts.data.header;
		this.processors = this.opts.state.init;
		this.names = this.opts.state.names;
		this.update();
	});

	this.insert = function () {
		this.insertion = !this.insertion;
	}.bind(this);

	this.process = function () {
		if (!this.name.value || this.type.value) {
			riot$1.mount('rg-alerts', {
				alerts: [{
					type: "error",
					text: "all value are required",
					timeout: 3000
				}]
			});
		}
		this.names.push(this.name.value);
		this.opts.resolver({ type: this.type.value, tempnames: this.names }, this.opts.path, this.opts.path + "/processor");
		this.unmount();
	}.bind(this);

	this.done = function () {
		this.opts.resolver({ data: this.processors, type: "postProcessors" }, this.opts.path, this.opts.path.slice(0, this.opts.path.lastIndexOf('/')));
		this.unmount();
	}.bind(this);

	this.removeMapping = function (e) {
		this.processors.splice(this.names.indexOf(e.item), 1);
		this.names.splice(this.names.indexOf(e.item), 1);
		this.update();
	}.bind(this);
});

riot$1.tag2('my-container', '<img src="../assets/logo.png" class="logo o-image"></img> <div class="seperator"></div> <div align="center" class="info"> <h1>Feed Configuration Utility</h1> <button onclick="{getJson}" class="c-button" type="button">JSON</button> <div class="seperator"></div> </div> <div id="meta" if="{begin}"></div> <div if="{!begin}"> <div class="c-overlay"></div> <div class="o-modal"> <div class="c-card"> <header class="c-card__header" align="center"> <h2 class="c-heading">Hi!</h2> </header> <div class="c-card__body"> This is odoscope\'s feed configuration utility. This utility will guide you throught the process of configuring the feeds for your shop. However to be configurable your feeds must meet thee following requirements: <ul> <li>Your Product Feeds and Category Feeds must be in seperate files.(Multiple files for both category and product feed are allowed)</li> <li>Your Products Feeds must contain a Primary ID</li> <li>Your Category feeds must be structured as simple tree with parent id\'s for each category and should also have root indicatrors</li> </ul> If your feeds do not meet any of these requirements please contact us for a custom configuration. </div> <footer class="c-card__footer" align="center"> <button type="button" class="c-button c-button--brand" onclick="{start}">Begin</button> </footer> </div> </div> </div>', '', '', function (opts) {

  var tag = this;
  this.begin = false;

  this.start = function () {
    this.begin = true;
    var container = document.createElement('div');
    container.id = 'holder';
    this.meta.appendChild(container);
    riot$1.mount(container, 'my-app', { path: "begin", resolver: this.resolver, state: { start: true, configure: false }, data: { deflang: '', siteKeys: [] } });
  }.bind(this);

  this.getJson = function () {
    console.log(JSON.stringify(tag.where.config, null, 4));
  }.bind(this);

  this.resolver = function (data, pathin, pathout) {
    console.log(pathin + "->" + pathout);
    var step = tag.where.analyze(data, pathin, pathout);
    var container = document.createElement('div');
    container.id = 'holder';
    tag.meta.appendChild(container);
    riot$1.mount(container, step.tag, { path: step.path, resolver: tag.resolver, state: step.state, data: step.data });
  };
});

riot$1.mixin(where);
riot$1.mount('my-container');

window._ = _$1;

})));