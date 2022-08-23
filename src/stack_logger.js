/* eslint-disable no-underscore-dangle */
import util from 'util';

export default class StackLogger {
  #store = {
    indent: 0, // indentation for this instance
    indentSize: 0, // indentation for next instance from ours
    indentor: ' ', // indentation character
    autoTick: false, // whether or not to auto tick printers
  };

  /**
   * Create stacking loggers by means of indentation
   * @param {{}} [opts] Options
   * @param {number} [opts.indent] Indentation from 0 for this instance.
   * @param {any} [opts.indentor] Indentation fill for indentation range.
   * @param {number} [opts.indentSize] Size for subsequent instances created from self.
   * @param {boolean} [opts.autoTick] Whether or not to auto tick printers.
   */
  constructor(opts) {
    opts = opts || {};
    this.#store.indent = opts.indent && typeof opts.indent === 'number' ? opts.indent : 0;
    this.#store.indentor = opts.indentor || ' ';
    this.#store.indentSize = opts.indentSize && typeof opts.indentSize === 'number' ? opts.indentSize : 2;
    this.#store.autoTick = typeof opts.autoTick === 'boolean' ? opts.autoTick : true;
  }

  /**
   * Get/Set the current instance's indentation
   * @param {number} [value] New indentation
   */
  indentation(val) {
    if (val && typeof val === 'number') this.#store.indent = val;
    return this.#store.indent;
  }

  /**
   * Get/Set the current instance's indentation
   * @param {any} [indentor] The new indentor
   */
  indentor(indentor) {
    if (indentor) this.#store.indentor = indentor;
    return this.#store.indentor;
  }

  /**
   * Get/Set the currently held indentSize
   * @param {number} [size] New indentSize
   */
  indentSize(size) {
    if (size && typeof size === 'number') this.#store.indentSize = size;
    return this.#store.indentSize;
  }

  /**
   * Opts to extend self with
   * @param {{}} [opts] Options
   * @param {number} [opts.indent] Indentation from 0 for this instance.
   * @param {any} [opts.indentor] Indentation fill for indentation range.
   * @param {number} [opts.indentSize] Size for subsequent instances created from self.
   */
  extend(opts) {
    return new StackLogger({...this.#store, ...(typeof opts === 'object' ? opts : {})});
  }

  /**
   * Create a logger instance whose indentation is extended from the former
   * If `indent` is omitted, it will autoTick with `opts.indentSize`
   * If `indentSize` is omitted, it will not increment and use `this`
   * @param {number} [indent] Size to add to self's `indentation`
   * @param {number} [indentSize] Size to add to self's `indentSize`
   */
  tick(indent, indentSize) {
    return this.extend({
      indent: this.#store.indent + (typeof indent === 'number' ? indent : this.#store.indentSize),
      indentSize: this.#store.indentSize + (typeof indentSize === 'number' ? indent : 0),
    });
  }

  /**
   * Write raw text to stdout
   * * Adds no indentation and no EOL
   * * Returns self without extending indentation
   * @param {...any} msgs Messages to write out
   */
  write(...msgs) {
    process.stdout.write(this.getText(0, msgs));
    return this;
  }

  /**
   * Write indented text to stdout
   * * Adds indentation but no EOL
   * * Returns a stacklogger with extended indentation if `opts.autoTick` else `this`
   * @param {...any} msgs Messages to write out
   */
  print(...msgs) {
    process.stdout.write(this.getText(this.#store.indent, msgs));
    return this.#store.autoTick ? this.tick(this.#store.indentSize) : this;
  }

  /**
   * Write indented line to stdout
   * * Adds indentation and EOL
   * * Returns a stacklogger with extended indentation if `opts.autoTick` else `this`
   * @param {...any} msgs Messages to write out
   */
  log(...msgs) {
    process.stdout.write(this.getText(this.#store.indent, msgs).concat('\n'));
    return this.#store.autoTick ? this.tick(this.#store.indentSize) : this;
  }

  /**
   * Write primarily to stderr with an EOL
   * * Adds indentation and EOL
   * * Returns a stacklogger with extended indentation if `opts.autoTick` else `this`
   * @param {...any} msgs Messages to write out
   */
  error(...msgs) {
    return this.warn(...msgs);
  }

  /**
   * Write primarily to stderr with an EOL
   * * Adds indentation and EOL
   * * Returns a stacklogger with extended indentation if `opts.autoTick` else `this`
   * @param {...any} msgs Messages to write out
   */
  warn(...msgs) {
    process.stderr.write(this.getText(this.#store.indent, msgs).concat('\n'));
    return this.#store.autoTick ? this.tick(this.#store.indentSize) : this;
  }

  /**
   * Generate formated text with proper indentation
   * @param {number} [indent] Proper indentation
   * @param {string|string[]} [msgs] Message(s) to be written
   */
  getText(indent, msgs) {
    if (typeof indent === 'object' && !Array.isArray(indent)) ({msgs, indent} = indent);
    if (Array.isArray(indent)) [msgs, indent] = [indent, msgs];
    if (typeof indent === 'string') [msgs, indent] = [[indent], msgs];
    indent = typeof indent !== 'number' ? this.#store.indent : indent;
    msgs = Array.isArray(msgs) ? msgs : [msgs];
    msgs = indent
      ? [this.#store.indentor.repeat(indent).concat(util.formatWithOptions({color: true}, msgs[0])), ...msgs.slice(1)]
      : msgs;
    return util.formatWithOptions({colors: true}, ...msgs);
  }
}
