var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __commonJS = (callback, module2) => () => {
  if (!module2) {
    module2 = {exports: {}};
    callback(module2.exports, module2);
  }
  return module2.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};
var __exportStar = (target, module2, desc) => {
  __markAsModule(target);
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module2) => {
  if (module2 && module2.__esModule)
    return module2;
  return __exportStar(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", {value: module2, enumerable: true}), module2);
};

// node_modules/commander/index.js
var require_commander = __commonJS((exports2, module2) => {
  var EventEmitter3 = require("events").EventEmitter;
  var spawn = require("child_process").spawn;
  var path6 = require("path");
  var fs5 = require("fs");
  var Option = class {
    constructor(flags, description) {
      this.flags = flags;
      this.required = flags.includes("<");
      this.optional = flags.includes("[");
      this.variadic = /\w\.\.\.[>\]]$/.test(flags);
      this.mandatory = false;
      const optionFlags = _parseOptionFlags(flags);
      this.short = optionFlags.shortFlag;
      this.long = optionFlags.longFlag;
      this.negate = false;
      if (this.long) {
        this.negate = this.long.startsWith("--no-");
      }
      this.description = description || "";
      this.defaultValue = void 0;
    }
    name() {
      if (this.long) {
        return this.long.replace(/^--/, "");
      }
      return this.short.replace(/^-/, "");
    }
    attributeName() {
      return camelcase(this.name().replace(/^no-/, ""));
    }
    is(arg) {
      return this.short === arg || this.long === arg;
    }
  };
  var CommanderError2 = class extends Error {
    constructor(exitCode, code, message2) {
      super(message2);
      Error.captureStackTrace(this, this.constructor);
      this.name = this.constructor.name;
      this.code = code;
      this.exitCode = exitCode;
      this.nestedError = void 0;
    }
  };
  var Command = class extends EventEmitter3 {
    constructor(name) {
      super();
      this.commands = [];
      this.options = [];
      this.parent = null;
      this._allowUnknownOption = false;
      this._args = [];
      this.rawArgs = null;
      this._scriptPath = null;
      this._name = name || "";
      this._optionValues = {};
      this._storeOptionsAsProperties = true;
      this._storeOptionsAsPropertiesCalled = false;
      this._passCommandToAction = true;
      this._actionResults = [];
      this._actionHandler = null;
      this._executableHandler = false;
      this._executableFile = null;
      this._defaultCommandName = null;
      this._exitCallback = null;
      this._aliases = [];
      this._combineFlagAndOptionalValue = true;
      this._hidden = false;
      this._hasHelpOption = true;
      this._helpFlags = "-h, --help";
      this._helpDescription = "display help for command";
      this._helpShortFlag = "-h";
      this._helpLongFlag = "--help";
      this._hasImplicitHelpCommand = void 0;
      this._helpCommandName = "help";
      this._helpCommandnameAndArgs = "help [command]";
      this._helpCommandDescription = "display help for command";
    }
    command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
      let desc = actionOptsOrExecDesc;
      let opts = execOpts;
      if (typeof desc === "object" && desc !== null) {
        opts = desc;
        desc = null;
      }
      opts = opts || {};
      const args = nameAndArgs.split(/ +/);
      const cmd = this.createCommand(args.shift());
      if (desc) {
        cmd.description(desc);
        cmd._executableHandler = true;
      }
      if (opts.isDefault)
        this._defaultCommandName = cmd._name;
      cmd._hidden = !!(opts.noHelp || opts.hidden);
      cmd._hasHelpOption = this._hasHelpOption;
      cmd._helpFlags = this._helpFlags;
      cmd._helpDescription = this._helpDescription;
      cmd._helpShortFlag = this._helpShortFlag;
      cmd._helpLongFlag = this._helpLongFlag;
      cmd._helpCommandName = this._helpCommandName;
      cmd._helpCommandnameAndArgs = this._helpCommandnameAndArgs;
      cmd._helpCommandDescription = this._helpCommandDescription;
      cmd._exitCallback = this._exitCallback;
      cmd._storeOptionsAsProperties = this._storeOptionsAsProperties;
      cmd._passCommandToAction = this._passCommandToAction;
      cmd._combineFlagAndOptionalValue = this._combineFlagAndOptionalValue;
      cmd._executableFile = opts.executableFile || null;
      this.commands.push(cmd);
      cmd._parseExpectedArgs(args);
      cmd.parent = this;
      if (desc)
        return this;
      return cmd;
    }
    createCommand(name) {
      return new Command(name);
    }
    addCommand(cmd, opts) {
      if (!cmd._name)
        throw new Error("Command passed to .addCommand() must have a name");
      function checkExplicitNames(commandArray) {
        commandArray.forEach((cmd2) => {
          if (cmd2._executableHandler && !cmd2._executableFile) {
            throw new Error(`Must specify executableFile for deeply nested executable: ${cmd2.name()}`);
          }
          checkExplicitNames(cmd2.commands);
        });
      }
      checkExplicitNames(cmd.commands);
      opts = opts || {};
      if (opts.isDefault)
        this._defaultCommandName = cmd._name;
      if (opts.noHelp || opts.hidden)
        cmd._hidden = true;
      this.commands.push(cmd);
      cmd.parent = this;
      return this;
    }
    arguments(desc) {
      return this._parseExpectedArgs(desc.split(/ +/));
    }
    addHelpCommand(enableOrNameAndArgs, description) {
      if (enableOrNameAndArgs === false) {
        this._hasImplicitHelpCommand = false;
      } else {
        this._hasImplicitHelpCommand = true;
        if (typeof enableOrNameAndArgs === "string") {
          this._helpCommandName = enableOrNameAndArgs.split(" ")[0];
          this._helpCommandnameAndArgs = enableOrNameAndArgs;
        }
        this._helpCommandDescription = description || this._helpCommandDescription;
      }
      return this;
    }
    _lazyHasImplicitHelpCommand() {
      if (this._hasImplicitHelpCommand === void 0) {
        this._hasImplicitHelpCommand = this.commands.length && !this._actionHandler && !this._findCommand("help");
      }
      return this._hasImplicitHelpCommand;
    }
    _parseExpectedArgs(args) {
      if (!args.length)
        return;
      args.forEach((arg) => {
        const argDetails = {
          required: false,
          name: "",
          variadic: false
        };
        switch (arg[0]) {
          case "<":
            argDetails.required = true;
            argDetails.name = arg.slice(1, -1);
            break;
          case "[":
            argDetails.name = arg.slice(1, -1);
            break;
        }
        if (argDetails.name.length > 3 && argDetails.name.slice(-3) === "...") {
          argDetails.variadic = true;
          argDetails.name = argDetails.name.slice(0, -3);
        }
        if (argDetails.name) {
          this._args.push(argDetails);
        }
      });
      this._args.forEach((arg, i) => {
        if (arg.variadic && i < this._args.length - 1) {
          throw new Error(`only the last argument can be variadic '${arg.name}'`);
        }
      });
      return this;
    }
    exitOverride(fn) {
      if (fn) {
        this._exitCallback = fn;
      } else {
        this._exitCallback = (err) => {
          if (err.code !== "commander.executeSubCommandAsync") {
            throw err;
          } else {
          }
        };
      }
      return this;
    }
    _exit(exitCode, code, message2) {
      if (this._exitCallback) {
        this._exitCallback(new CommanderError2(exitCode, code, message2));
      }
      process.exit(exitCode);
    }
    action(fn) {
      const listener = (args) => {
        const expectedArgsCount = this._args.length;
        const actionArgs = args.slice(0, expectedArgsCount);
        if (this._passCommandToAction) {
          actionArgs[expectedArgsCount] = this;
        } else {
          actionArgs[expectedArgsCount] = this.opts();
        }
        if (args.length > expectedArgsCount) {
          actionArgs.push(args.slice(expectedArgsCount));
        }
        const actionResult = fn.apply(this, actionArgs);
        let rootCommand = this;
        while (rootCommand.parent) {
          rootCommand = rootCommand.parent;
        }
        rootCommand._actionResults.push(actionResult);
      };
      this._actionHandler = listener;
      return this;
    }
    _checkForOptionNameClash(option) {
      if (!this._storeOptionsAsProperties || this._storeOptionsAsPropertiesCalled) {
        return;
      }
      if (option.name() === "help") {
        return;
      }
      const commandProperty = this._getOptionValue(option.attributeName());
      if (commandProperty === void 0) {
        return;
      }
      let foundClash = true;
      if (option.negate) {
        const positiveLongFlag = option.long.replace(/^--no-/, "--");
        foundClash = !this._findOption(positiveLongFlag);
      } else if (option.long) {
        const negativeLongFlag = option.long.replace(/^--/, "--no-");
        foundClash = !this._findOption(negativeLongFlag);
      }
      if (foundClash) {
        throw new Error(`option '${option.name()}' clashes with existing property '${option.attributeName()}' on Command
- call storeOptionsAsProperties(false) to store option values safely,
- or call storeOptionsAsProperties(true) to suppress this check,
- or change option name

Read more on https://git.io/JJc0W`);
      }
    }
    _optionEx(config, flags, description, fn, defaultValue) {
      const option = new Option(flags, description);
      const oname = option.name();
      const name = option.attributeName();
      option.mandatory = !!config.mandatory;
      this._checkForOptionNameClash(option);
      if (typeof fn !== "function") {
        if (fn instanceof RegExp) {
          const regex = fn;
          fn = (val, def) => {
            const m = regex.exec(val);
            return m ? m[0] : def;
          };
        } else {
          defaultValue = fn;
          fn = null;
        }
      }
      if (option.negate || option.optional || option.required || typeof defaultValue === "boolean") {
        if (option.negate) {
          const positiveLongFlag = option.long.replace(/^--no-/, "--");
          defaultValue = this._findOption(positiveLongFlag) ? this._getOptionValue(name) : true;
        }
        if (defaultValue !== void 0) {
          this._setOptionValue(name, defaultValue);
          option.defaultValue = defaultValue;
        }
      }
      this.options.push(option);
      this.on("option:" + oname, (val) => {
        const oldValue = this._getOptionValue(name);
        if (val !== null && fn) {
          val = fn(val, oldValue === void 0 ? defaultValue : oldValue);
        } else if (val !== null && option.variadic) {
          if (oldValue === defaultValue || !Array.isArray(oldValue)) {
            val = [val];
          } else {
            val = oldValue.concat(val);
          }
        }
        if (typeof oldValue === "boolean" || typeof oldValue === "undefined") {
          if (val == null) {
            this._setOptionValue(name, option.negate ? false : defaultValue || true);
          } else {
            this._setOptionValue(name, val);
          }
        } else if (val !== null) {
          this._setOptionValue(name, option.negate ? false : val);
        }
      });
      return this;
    }
    option(flags, description, fn, defaultValue) {
      return this._optionEx({}, flags, description, fn, defaultValue);
    }
    requiredOption(flags, description, fn, defaultValue) {
      return this._optionEx({mandatory: true}, flags, description, fn, defaultValue);
    }
    combineFlagAndOptionalValue(arg) {
      this._combineFlagAndOptionalValue = arg === void 0 || arg;
      return this;
    }
    allowUnknownOption(arg) {
      this._allowUnknownOption = arg === void 0 || arg;
      return this;
    }
    storeOptionsAsProperties(value) {
      this._storeOptionsAsPropertiesCalled = true;
      this._storeOptionsAsProperties = value === void 0 || value;
      if (this.options.length) {
        throw new Error("call .storeOptionsAsProperties() before adding options");
      }
      return this;
    }
    passCommandToAction(value) {
      this._passCommandToAction = value === void 0 || value;
      return this;
    }
    _setOptionValue(key, value) {
      if (this._storeOptionsAsProperties) {
        this[key] = value;
      } else {
        this._optionValues[key] = value;
      }
    }
    _getOptionValue(key) {
      if (this._storeOptionsAsProperties) {
        return this[key];
      }
      return this._optionValues[key];
    }
    parse(argv, parseOptions2) {
      if (argv !== void 0 && !Array.isArray(argv)) {
        throw new Error("first parameter to parse must be array or undefined");
      }
      parseOptions2 = parseOptions2 || {};
      if (argv === void 0) {
        argv = process.argv;
        if (process.versions && process.versions.electron) {
          parseOptions2.from = "electron";
        }
      }
      this.rawArgs = argv.slice();
      let userArgs;
      switch (parseOptions2.from) {
        case void 0:
        case "node":
          this._scriptPath = argv[1];
          userArgs = argv.slice(2);
          break;
        case "electron":
          if (process.defaultApp) {
            this._scriptPath = argv[1];
            userArgs = argv.slice(2);
          } else {
            userArgs = argv.slice(1);
          }
          break;
        case "user":
          userArgs = argv.slice(0);
          break;
        default:
          throw new Error(`unexpected parse option { from: '${parseOptions2.from}' }`);
      }
      if (!this._scriptPath && process.mainModule) {
        this._scriptPath = process.mainModule.filename;
      }
      this._name = this._name || this._scriptPath && path6.basename(this._scriptPath, path6.extname(this._scriptPath));
      this._parseCommand([], userArgs);
      return this;
    }
    parseAsync(argv, parseOptions2) {
      this.parse(argv, parseOptions2);
      return Promise.all(this._actionResults).then(() => this);
    }
    _executeSubCommand(subcommand, args) {
      args = args.slice();
      let launchWithNode = false;
      const sourceExt = [".js", ".ts", ".tsx", ".mjs"];
      this._checkForMissingMandatoryOptions();
      let scriptPath = this._scriptPath;
      if (!scriptPath && process.mainModule) {
        scriptPath = process.mainModule.filename;
      }
      let baseDir;
      try {
        const resolvedLink = fs5.realpathSync(scriptPath);
        baseDir = path6.dirname(resolvedLink);
      } catch (e) {
        baseDir = ".";
      }
      let bin = path6.basename(scriptPath, path6.extname(scriptPath)) + "-" + subcommand._name;
      if (subcommand._executableFile) {
        bin = subcommand._executableFile;
      }
      const localBin = path6.join(baseDir, bin);
      if (fs5.existsSync(localBin)) {
        bin = localBin;
      } else {
        sourceExt.forEach((ext) => {
          if (fs5.existsSync(`${localBin}${ext}`)) {
            bin = `${localBin}${ext}`;
          }
        });
      }
      launchWithNode = sourceExt.includes(path6.extname(bin));
      let proc;
      if (process.platform !== "win32") {
        if (launchWithNode) {
          args.unshift(bin);
          args = incrementNodeInspectorPort(process.execArgv).concat(args);
          proc = spawn(process.argv[0], args, {stdio: "inherit"});
        } else {
          proc = spawn(bin, args, {stdio: "inherit"});
        }
      } else {
        args.unshift(bin);
        args = incrementNodeInspectorPort(process.execArgv).concat(args);
        proc = spawn(process.execPath, args, {stdio: "inherit"});
      }
      const signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
      signals.forEach((signal) => {
        process.on(signal, () => {
          if (proc.killed === false && proc.exitCode === null) {
            proc.kill(signal);
          }
        });
      });
      const exitCallback = this._exitCallback;
      if (!exitCallback) {
        proc.on("close", process.exit.bind(process));
      } else {
        proc.on("close", () => {
          exitCallback(new CommanderError2(process.exitCode || 0, "commander.executeSubCommandAsync", "(close)"));
        });
      }
      proc.on("error", (err) => {
        if (err.code === "ENOENT") {
          const executableMissing = `'${bin}' does not exist
 - if '${subcommand._name}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name`;
          throw new Error(executableMissing);
        } else if (err.code === "EACCES") {
          throw new Error(`'${bin}' not executable`);
        }
        if (!exitCallback) {
          process.exit(1);
        } else {
          const wrappedError = new CommanderError2(1, "commander.executeSubCommandAsync", "(error)");
          wrappedError.nestedError = err;
          exitCallback(wrappedError);
        }
      });
      this.runningCommand = proc;
    }
    _dispatchSubcommand(commandName, operands, unknown) {
      const subCommand = this._findCommand(commandName);
      if (!subCommand)
        this._helpAndError();
      if (subCommand._executableHandler) {
        this._executeSubCommand(subCommand, operands.concat(unknown));
      } else {
        subCommand._parseCommand(operands, unknown);
      }
    }
    _parseCommand(operands, unknown) {
      const parsed = this.parseOptions(unknown);
      operands = operands.concat(parsed.operands);
      unknown = parsed.unknown;
      this.args = operands.concat(unknown);
      if (operands && this._findCommand(operands[0])) {
        this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
      } else if (this._lazyHasImplicitHelpCommand() && operands[0] === this._helpCommandName) {
        if (operands.length === 1) {
          this.help();
        } else {
          this._dispatchSubcommand(operands[1], [], [this._helpLongFlag]);
        }
      } else if (this._defaultCommandName) {
        outputHelpIfRequested(this, unknown);
        this._dispatchSubcommand(this._defaultCommandName, operands, unknown);
      } else {
        if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
          this._helpAndError();
        }
        outputHelpIfRequested(this, parsed.unknown);
        this._checkForMissingMandatoryOptions();
        if (parsed.unknown.length > 0) {
          this.unknownOption(parsed.unknown[0]);
        }
        if (this._actionHandler) {
          const args = this.args.slice();
          this._args.forEach((arg, i) => {
            if (arg.required && args[i] == null) {
              this.missingArgument(arg.name);
            } else if (arg.variadic) {
              args[i] = args.splice(i);
            }
          });
          this._actionHandler(args);
          this.emit("command:" + this.name(), operands, unknown);
        } else if (operands.length) {
          if (this._findCommand("*")) {
            this._dispatchSubcommand("*", operands, unknown);
          } else if (this.listenerCount("command:*")) {
            this.emit("command:*", operands, unknown);
          } else if (this.commands.length) {
            this.unknownCommand();
          }
        } else if (this.commands.length) {
          this._helpAndError();
        } else {
        }
      }
    }
    _findCommand(name) {
      if (!name)
        return void 0;
      return this.commands.find((cmd) => cmd._name === name || cmd._aliases.includes(name));
    }
    _findOption(arg) {
      return this.options.find((option) => option.is(arg));
    }
    _checkForMissingMandatoryOptions() {
      for (let cmd = this; cmd; cmd = cmd.parent) {
        cmd.options.forEach((anOption) => {
          if (anOption.mandatory && cmd._getOptionValue(anOption.attributeName()) === void 0) {
            cmd.missingMandatoryOptionValue(anOption);
          }
        });
      }
    }
    parseOptions(argv) {
      const operands = [];
      const unknown = [];
      let dest = operands;
      const args = argv.slice();
      function maybeOption(arg) {
        return arg.length > 1 && arg[0] === "-";
      }
      let activeVariadicOption = null;
      while (args.length) {
        const arg = args.shift();
        if (arg === "--") {
          if (dest === unknown)
            dest.push(arg);
          dest.push(...args);
          break;
        }
        if (activeVariadicOption && !maybeOption(arg)) {
          this.emit(`option:${activeVariadicOption.name()}`, arg);
          continue;
        }
        activeVariadicOption = null;
        if (maybeOption(arg)) {
          const option = this._findOption(arg);
          if (option) {
            if (option.required) {
              const value = args.shift();
              if (value === void 0)
                this.optionMissingArgument(option);
              this.emit(`option:${option.name()}`, value);
            } else if (option.optional) {
              let value = null;
              if (args.length > 0 && !maybeOption(args[0])) {
                value = args.shift();
              }
              this.emit(`option:${option.name()}`, value);
            } else {
              this.emit(`option:${option.name()}`);
            }
            activeVariadicOption = option.variadic ? option : null;
            continue;
          }
        }
        if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
          const option = this._findOption(`-${arg[1]}`);
          if (option) {
            if (option.required || option.optional && this._combineFlagAndOptionalValue) {
              this.emit(`option:${option.name()}`, arg.slice(2));
            } else {
              this.emit(`option:${option.name()}`);
              args.unshift(`-${arg.slice(2)}`);
            }
            continue;
          }
        }
        if (/^--[^=]+=/.test(arg)) {
          const index = arg.indexOf("=");
          const option = this._findOption(arg.slice(0, index));
          if (option && (option.required || option.optional)) {
            this.emit(`option:${option.name()}`, arg.slice(index + 1));
            continue;
          }
        }
        if (arg.length > 1 && arg[0] === "-") {
          dest = unknown;
        }
        dest.push(arg);
      }
      return {operands, unknown};
    }
    opts() {
      if (this._storeOptionsAsProperties) {
        const result = {};
        const len = this.options.length;
        for (let i = 0; i < len; i++) {
          const key = this.options[i].attributeName();
          result[key] = key === this._versionOptionName ? this._version : this[key];
        }
        return result;
      }
      return this._optionValues;
    }
    missingArgument(name) {
      const message2 = `error: missing required argument '${name}'`;
      console.error(message2);
      this._exit(1, "commander.missingArgument", message2);
    }
    optionMissingArgument(option, flag) {
      let message2;
      if (flag) {
        message2 = `error: option '${option.flags}' argument missing, got '${flag}'`;
      } else {
        message2 = `error: option '${option.flags}' argument missing`;
      }
      console.error(message2);
      this._exit(1, "commander.optionMissingArgument", message2);
    }
    missingMandatoryOptionValue(option) {
      const message2 = `error: required option '${option.flags}' not specified`;
      console.error(message2);
      this._exit(1, "commander.missingMandatoryOptionValue", message2);
    }
    unknownOption(flag) {
      if (this._allowUnknownOption)
        return;
      const message2 = `error: unknown option '${flag}'`;
      console.error(message2);
      this._exit(1, "commander.unknownOption", message2);
    }
    unknownCommand() {
      const partCommands = [this.name()];
      for (let parentCmd = this.parent; parentCmd; parentCmd = parentCmd.parent) {
        partCommands.unshift(parentCmd.name());
      }
      const fullCommand = partCommands.join(" ");
      const message2 = `error: unknown command '${this.args[0]}'.` + (this._hasHelpOption ? ` See '${fullCommand} ${this._helpLongFlag}'.` : "");
      console.error(message2);
      this._exit(1, "commander.unknownCommand", message2);
    }
    version(str, flags, description) {
      if (str === void 0)
        return this._version;
      this._version = str;
      flags = flags || "-V, --version";
      description = description || "output the version number";
      const versionOption = new Option(flags, description);
      this._versionOptionName = versionOption.attributeName();
      this.options.push(versionOption);
      this.on("option:" + versionOption.name(), () => {
        process.stdout.write(str + "\n");
        this._exit(0, "commander.version", str);
      });
      return this;
    }
    description(str, argsDescription) {
      if (str === void 0 && argsDescription === void 0)
        return this._description;
      this._description = str;
      this._argsDescription = argsDescription;
      return this;
    }
    alias(alias) {
      if (alias === void 0)
        return this._aliases[0];
      let command = this;
      if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
        command = this.commands[this.commands.length - 1];
      }
      if (alias === command._name)
        throw new Error("Command alias can't be the same as its name");
      command._aliases.push(alias);
      return this;
    }
    aliases(aliases) {
      if (aliases === void 0)
        return this._aliases;
      aliases.forEach((alias) => this.alias(alias));
      return this;
    }
    usage(str) {
      if (str === void 0) {
        if (this._usage)
          return this._usage;
        const args = this._args.map((arg) => {
          return humanReadableArgName(arg);
        });
        return [].concat(this.options.length || this._hasHelpOption ? "[options]" : [], this.commands.length ? "[command]" : [], this._args.length ? args : []).join(" ");
      }
      this._usage = str;
      return this;
    }
    name(str) {
      if (str === void 0)
        return this._name;
      this._name = str;
      return this;
    }
    prepareCommands() {
      const commandDetails = this.commands.filter((cmd) => {
        return !cmd._hidden;
      }).map((cmd) => {
        const args = cmd._args.map((arg) => {
          return humanReadableArgName(arg);
        }).join(" ");
        return [
          cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + (args ? " " + args : ""),
          cmd._description
        ];
      });
      if (this._lazyHasImplicitHelpCommand()) {
        commandDetails.push([this._helpCommandnameAndArgs, this._helpCommandDescription]);
      }
      return commandDetails;
    }
    largestCommandLength() {
      const commands = this.prepareCommands();
      return commands.reduce((max, command) => {
        return Math.max(max, command[0].length);
      }, 0);
    }
    largestOptionLength() {
      const options = [].slice.call(this.options);
      options.push({
        flags: this._helpFlags
      });
      return options.reduce((max, option) => {
        return Math.max(max, option.flags.length);
      }, 0);
    }
    largestArgLength() {
      return this._args.reduce((max, arg) => {
        return Math.max(max, arg.name.length);
      }, 0);
    }
    padWidth() {
      let width = this.largestOptionLength();
      if (this._argsDescription && this._args.length) {
        if (this.largestArgLength() > width) {
          width = this.largestArgLength();
        }
      }
      if (this.commands && this.commands.length) {
        if (this.largestCommandLength() > width) {
          width = this.largestCommandLength();
        }
      }
      return width;
    }
    optionHelp() {
      const width = this.padWidth();
      const columns = process.stdout.columns || 80;
      const descriptionWidth = columns - width - 4;
      function padOptionDetails(flags, description) {
        return pad(flags, width) + "  " + optionalWrap(description, descriptionWidth, width + 2);
      }
      ;
      const help = this.options.map((option) => {
        const fullDesc = option.description + (!option.negate && option.defaultValue !== void 0 ? " (default: " + JSON.stringify(option.defaultValue) + ")" : "");
        return padOptionDetails(option.flags, fullDesc);
      });
      const showShortHelpFlag = this._hasHelpOption && this._helpShortFlag && !this._findOption(this._helpShortFlag);
      const showLongHelpFlag = this._hasHelpOption && !this._findOption(this._helpLongFlag);
      if (showShortHelpFlag || showLongHelpFlag) {
        let helpFlags = this._helpFlags;
        if (!showShortHelpFlag) {
          helpFlags = this._helpLongFlag;
        } else if (!showLongHelpFlag) {
          helpFlags = this._helpShortFlag;
        }
        help.push(padOptionDetails(helpFlags, this._helpDescription));
      }
      return help.join("\n");
    }
    commandHelp() {
      if (!this.commands.length && !this._lazyHasImplicitHelpCommand())
        return "";
      const commands = this.prepareCommands();
      const width = this.padWidth();
      const columns = process.stdout.columns || 80;
      const descriptionWidth = columns - width - 4;
      return [
        "Commands:",
        commands.map((cmd) => {
          const desc = cmd[1] ? "  " + cmd[1] : "";
          return (desc ? pad(cmd[0], width) : cmd[0]) + optionalWrap(desc, descriptionWidth, width + 2);
        }).join("\n").replace(/^/gm, "  "),
        ""
      ].join("\n");
    }
    helpInformation() {
      let desc = [];
      if (this._description) {
        desc = [
          this._description,
          ""
        ];
        const argsDescription = this._argsDescription;
        if (argsDescription && this._args.length) {
          const width = this.padWidth();
          const columns = process.stdout.columns || 80;
          const descriptionWidth = columns - width - 5;
          desc.push("Arguments:");
          this._args.forEach((arg) => {
            desc.push("  " + pad(arg.name, width) + "  " + wrap(argsDescription[arg.name] || "", descriptionWidth, width + 4));
          });
          desc.push("");
        }
      }
      let cmdName = this._name;
      if (this._aliases[0]) {
        cmdName = cmdName + "|" + this._aliases[0];
      }
      let parentCmdNames = "";
      for (let parentCmd = this.parent; parentCmd; parentCmd = parentCmd.parent) {
        parentCmdNames = parentCmd.name() + " " + parentCmdNames;
      }
      const usage = [
        "Usage: " + parentCmdNames + cmdName + " " + this.usage(),
        ""
      ];
      let cmds = [];
      const commandHelp = this.commandHelp();
      if (commandHelp)
        cmds = [commandHelp];
      let options = [];
      if (this._hasHelpOption || this.options.length > 0) {
        options = [
          "Options:",
          "" + this.optionHelp().replace(/^/gm, "  "),
          ""
        ];
      }
      return usage.concat(desc).concat(options).concat(cmds).join("\n");
    }
    outputHelp(cb) {
      if (!cb) {
        cb = (passthru) => {
          return passthru;
        };
      }
      const cbOutput = cb(this.helpInformation());
      if (typeof cbOutput !== "string" && !Buffer.isBuffer(cbOutput)) {
        throw new Error("outputHelp callback must return a string or a Buffer");
      }
      process.stdout.write(cbOutput);
      this.emit(this._helpLongFlag);
    }
    helpOption(flags, description) {
      if (typeof flags === "boolean") {
        this._hasHelpOption = flags;
        return this;
      }
      this._helpFlags = flags || this._helpFlags;
      this._helpDescription = description || this._helpDescription;
      const helpFlags = _parseOptionFlags(this._helpFlags);
      this._helpShortFlag = helpFlags.shortFlag;
      this._helpLongFlag = helpFlags.longFlag;
      return this;
    }
    help(cb) {
      this.outputHelp(cb);
      this._exit(process.exitCode || 0, "commander.help", "(outputHelp)");
    }
    _helpAndError() {
      this.outputHelp();
      this._exit(1, "commander.help", "(outputHelp)");
    }
  };
  exports2 = module2.exports = new Command();
  exports2.program = exports2;
  exports2.Command = Command;
  exports2.Option = Option;
  exports2.CommanderError = CommanderError2;
  function camelcase(flag) {
    return flag.split("-").reduce((str, word) => {
      return str + word[0].toUpperCase() + word.slice(1);
    });
  }
  function pad(str, width) {
    const len = Math.max(0, width - str.length);
    return str + Array(len + 1).join(" ");
  }
  function wrap(str, width, indent) {
    const regex = new RegExp(".{1," + (width - 1) + "}([\\s\u200B]|$)|[^\\s\u200B]+?([\\s\u200B]|$)", "g");
    const lines = str.match(regex) || [];
    return lines.map((line, i) => {
      if (line.slice(-1) === "\n") {
        line = line.slice(0, line.length - 1);
      }
      return (i > 0 && indent ? Array(indent + 1).join(" ") : "") + line.trimRight();
    }).join("\n");
  }
  function optionalWrap(str, width, indent) {
    if (str.match(/[\n]\s+/))
      return str;
    const minWidth = 40;
    if (width < minWidth)
      return str;
    return wrap(str, width, indent);
  }
  function outputHelpIfRequested(cmd, args) {
    const helpOption = cmd._hasHelpOption && args.find((arg) => arg === cmd._helpLongFlag || arg === cmd._helpShortFlag);
    if (helpOption) {
      cmd.outputHelp();
      cmd._exit(0, "commander.helpDisplayed", "(outputHelp)");
    }
  }
  function humanReadableArgName(arg) {
    const nameOutput = arg.name + (arg.variadic === true ? "..." : "");
    return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
  }
  function _parseOptionFlags(flags) {
    let shortFlag;
    let longFlag;
    const flagParts = flags.split(/[ |,]+/);
    if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1]))
      shortFlag = flagParts.shift();
    longFlag = flagParts.shift();
    if (!shortFlag && /^-[^-]$/.test(longFlag)) {
      shortFlag = longFlag;
      longFlag = void 0;
    }
    return {shortFlag, longFlag};
  }
  function incrementNodeInspectorPort(args) {
    return args.map((arg) => {
      if (!arg.startsWith("--inspect")) {
        return arg;
      }
      let debugOption;
      let debugHost = "127.0.0.1";
      let debugPort = "9229";
      let match;
      if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
        debugOption = match[1];
      } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
        debugOption = match[1];
        if (/^\d+$/.test(match[3])) {
          debugPort = match[3];
        } else {
          debugHost = match[3];
        }
      } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
        debugOption = match[1];
        debugHost = match[3];
        debugPort = match[4];
      }
      if (debugOption && debugPort !== "0") {
        return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
      }
      return arg;
    });
  }
});

// node_modules/workerpool/src/requireFoolWebpack.js
var require_requireFoolWebpack = __commonJS((exports, module) => {
  var requireFoolWebpack = eval(`typeof require !== 'undefined' ? require : function (module) { throw new Error('Module " + module + " not found.') }`);
  module.exports = requireFoolWebpack;
});

// node_modules/workerpool/src/environment.js
var require_environment = __commonJS((exports2, module2) => {
  var requireFoolWebpack2 = require_requireFoolWebpack();
  var isNode = function(nodeProcess) {
    return typeof nodeProcess !== "undefined" && nodeProcess.versions != null && nodeProcess.versions.node != null;
  };
  module2.exports.isNode = isNode;
  module2.exports.platform = typeof process !== "undefined" && isNode(process) ? "node" : "browser";
  var worker_threads = tryRequireFoolWebpack("worker_threads");
  module2.exports.isMainThread = module2.exports.platform === "node" ? (!worker_threads || worker_threads.isMainThread) && !process.connected : typeof Window !== "undefined";
  module2.exports.cpus = module2.exports.platform === "browser" ? self.navigator.hardwareConcurrency : requireFoolWebpack2("os").cpus().length;
  function tryRequireFoolWebpack(module3) {
    try {
      return requireFoolWebpack2(module3);
    } catch (err) {
      return null;
    }
  }
});

// node_modules/workerpool/src/Promise.js
var require_Promise = __commonJS((exports2, module2) => {
  "use strict";
  function Promise2(handler, parent) {
    var me = this;
    if (!(this instanceof Promise2)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    if (typeof handler !== "function") {
      throw new SyntaxError("Function parameter handler(resolve, reject) missing");
    }
    var _onSuccess = [];
    var _onFail = [];
    this.resolved = false;
    this.rejected = false;
    this.pending = true;
    var _process = function(onSuccess, onFail) {
      _onSuccess.push(onSuccess);
      _onFail.push(onFail);
    };
    this.then = function(onSuccess, onFail) {
      return new Promise2(function(resolve2, reject) {
        var s = onSuccess ? _then(onSuccess, resolve2, reject) : resolve2;
        var f = onFail ? _then(onFail, resolve2, reject) : reject;
        _process(s, f);
      }, me);
    };
    var _resolve = function(result) {
      me.resolved = true;
      me.rejected = false;
      me.pending = false;
      _onSuccess.forEach(function(fn) {
        fn(result);
      });
      _process = function(onSuccess, onFail) {
        onSuccess(result);
      };
      _resolve = _reject = function() {
      };
      return me;
    };
    var _reject = function(error) {
      me.resolved = false;
      me.rejected = true;
      me.pending = false;
      _onFail.forEach(function(fn) {
        fn(error);
      });
      _process = function(onSuccess, onFail) {
        onFail(error);
      };
      _resolve = _reject = function() {
      };
      return me;
    };
    this.cancel = function() {
      if (parent) {
        parent.cancel();
      } else {
        _reject(new CancellationError());
      }
      return me;
    };
    this.timeout = function(delay) {
      if (parent) {
        parent.timeout(delay);
      } else {
        var timer = setTimeout(function() {
          _reject(new TimeoutError("Promise timed out after " + delay + " ms"));
        }, delay);
        me.always(function() {
          clearTimeout(timer);
        });
      }
      return me;
    };
    handler(function(result) {
      _resolve(result);
    }, function(error) {
      _reject(error);
    });
  }
  function _then(callback, resolve2, reject) {
    return function(result) {
      try {
        var res = callback(result);
        if (res && typeof res.then === "function" && typeof res["catch"] === "function") {
          res.then(resolve2, reject);
        } else {
          resolve2(res);
        }
      } catch (error) {
        reject(error);
      }
    };
  }
  Promise2.prototype["catch"] = function(onFail) {
    return this.then(null, onFail);
  };
  Promise2.prototype.always = function(fn) {
    return this.then(fn, fn);
  };
  Promise2.all = function(promises) {
    return new Promise2(function(resolve2, reject) {
      var remaining = promises.length, results = [];
      if (remaining) {
        promises.forEach(function(p, i) {
          p.then(function(result) {
            results[i] = result;
            remaining--;
            if (remaining == 0) {
              resolve2(results);
            }
          }, function(error) {
            remaining = 0;
            reject(error);
          });
        });
      } else {
        resolve2(results);
      }
    });
  };
  Promise2.defer = function() {
    var resolver3 = {};
    resolver3.promise = new Promise2(function(resolve2, reject) {
      resolver3.resolve = resolve2;
      resolver3.reject = reject;
    });
    return resolver3;
  };
  function CancellationError(message2) {
    this.message = message2 || "promise cancelled";
    this.stack = new Error().stack;
  }
  CancellationError.prototype = new Error();
  CancellationError.prototype.constructor = Error;
  CancellationError.prototype.name = "CancellationError";
  Promise2.CancellationError = CancellationError;
  function TimeoutError(message2) {
    this.message = message2 || "timeout exceeded";
    this.stack = new Error().stack;
  }
  TimeoutError.prototype = new Error();
  TimeoutError.prototype.constructor = Error;
  TimeoutError.prototype.name = "TimeoutError";
  Promise2.TimeoutError = TimeoutError;
  module2.exports = Promise2;
});

// node_modules/workerpool/src/generated/embeddedWorker.js
var require_embeddedWorker = __commonJS((exports2, module2) => {
  module2.exports = `!function(o){var t={};function n(r){if(t[r])return t[r].exports;var e=t[r]={i:r,l:!1,exports:{}};return o[r].call(e.exports,e,e.exports,n),e.l=!0,e.exports}n.m=o,n.c=t,n.d=function(r,e,o){n.o(r,e)||Object.defineProperty(r,e,{enumerable:!0,get:o})},n.r=function(r){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(r,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(r,"__esModule",{value:!0})},n.t=function(e,r){if(1&r&&(e=n(e)),8&r)return e;if(4&r&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&r&&"string"!=typeof e)for(var t in e)n.d(o,t,function(r){return e[r]}.bind(null,t));return o},n.n=function(r){var e=r&&r.__esModule?function(){return r.default}:function(){return r};return n.d(e,"a",e),e},n.o=function(r,e){return Object.prototype.hasOwnProperty.call(r,e)},n.p="",n(n.s=0)}([function(module,exports,__webpack_require__){var requireFoolWebpack=eval("typeof require !== 'undefined' ? require : function (module) { throw new Error('Module \\" + module + \\" not found.') }"),TERMINATE_METHOD_ID="__workerpool-terminate__",worker={exit:function(){}},WorkerThreads,parentPort;if("undefined"!=typeof self&&"function"==typeof postMessage&&"function"==typeof addEventListener)worker.on=function(r,e){addEventListener(r,function(r){e(r.data)})},worker.send=function(r){postMessage(r)};else{if("undefined"==typeof process)throw new Error("Script must be executed as a worker");try{WorkerThreads=requireFoolWebpack("worker_threads")}catch(error){if("object"!=typeof error||null===error||"MODULE_NOT_FOUND"!==error.code)throw error}WorkerThreads&&null!==WorkerThreads.parentPort?(parentPort=WorkerThreads.parentPort,worker.send=parentPort.postMessage.bind(parentPort),worker.on=parentPort.on.bind(parentPort)):(worker.on=process.on.bind(process),worker.send=process.send.bind(process),worker.on("disconnect",function(){process.exit(1)}),worker.exit=process.exit.bind(process))}function convertError(o){return Object.getOwnPropertyNames(o).reduce(function(r,e){return Object.defineProperty(r,e,{value:o[e],enumerable:!0})},{})}function isPromise(r){return r&&"function"==typeof r.then&&"function"==typeof r.catch}worker.methods={},worker.methods.run=function run(fn,args){var f=eval("("+fn+")");return f.apply(f,args)},worker.methods.methods=function(){return Object.keys(worker.methods)},worker.on("message",function(e){if(e===TERMINATE_METHOD_ID)return worker.exit(0);try{var r=worker.methods[e.method];if(!r)throw new Error('Unknown method "'+e.method+'"');r=r.apply(r,e.params);isPromise(r)?r.then(function(r){worker.send({id:e.id,result:r,error:null})}).catch(function(r){worker.send({id:e.id,result:null,error:convertError(r)})}):worker.send({id:e.id,result:r,error:null})}catch(r){worker.send({id:e.id,result:null,error:convertError(r)})}}),worker.register=function(r){if(r)for(var e in r)r.hasOwnProperty(e)&&(worker.methods[e]=r[e]);worker.send("ready")},exports.add=worker.register}]);`;
});

// node_modules/workerpool/src/WorkerHandler.js
var require_WorkerHandler = __commonJS((exports2, module2) => {
  "use strict";
  var Promise2 = require_Promise();
  var environment = require_environment();
  var requireFoolWebpack2 = require_requireFoolWebpack();
  var TERMINATE_METHOD_ID2 = "__workerpool-terminate__";
  var CHILD_PROCESS_EXIT_TIMEOUT = 1e3;
  function ensureWorkerThreads() {
    var WorkerThreads2 = tryRequireWorkerThreads();
    if (!WorkerThreads2) {
      throw new Error("WorkerPool: workerType = 'thread' is not supported, Node >= 11.7.0 required");
    }
    return WorkerThreads2;
  }
  function ensureWebWorker() {
    if (typeof Worker !== "function" && (typeof Worker !== "object" || typeof Worker.prototype.constructor !== "function")) {
      throw new Error("WorkerPool: Web Workers not supported");
    }
  }
  function tryRequireWorkerThreads() {
    try {
      return requireFoolWebpack2("worker_threads");
    } catch (error) {
      if (typeof error === "object" && error !== null && error.code === "MODULE_NOT_FOUND") {
        return null;
      } else {
        throw error;
      }
    }
  }
  function getDefaultWorker() {
    if (environment.platform === "browser") {
      if (typeof Blob === "undefined") {
        throw new Error("Blob not supported by the browser");
      }
      if (!window.URL || typeof window.URL.createObjectURL !== "function") {
        throw new Error("URL.createObjectURL not supported by the browser");
      }
      var blob = new Blob([require_embeddedWorker()], {type: "text/javascript"});
      return window.URL.createObjectURL(blob);
    } else {
      return __dirname + "/worker.js";
    }
  }
  function setupWorker(script, options) {
    if (options.workerType === "web") {
      ensureWebWorker();
      return setupBrowserWorker(script, Worker);
    } else if (options.workerType === "thread") {
      WorkerThreads2 = ensureWorkerThreads();
      return setupWorkerThreadWorker(script, WorkerThreads2);
    } else if (options.workerType === "process" || !options.workerType) {
      return setupProcessWorker(script, resolveForkOptions(options), requireFoolWebpack2("child_process"));
    } else {
      if (environment.platform === "browser") {
        ensureWebWorker();
        return setupBrowserWorker(script, Worker);
      } else {
        var WorkerThreads2 = tryRequireWorkerThreads();
        if (WorkerThreads2) {
          return setupWorkerThreadWorker(script, WorkerThreads2);
        } else {
          return setupProcessWorker(script, resolveForkOptions(options), requireFoolWebpack2("child_process"));
        }
      }
    }
  }
  function setupBrowserWorker(script, Worker2) {
    var worker2 = new Worker2(script);
    worker2.isBrowserWorker = true;
    worker2.on = function(event, callback) {
      this.addEventListener(event, function(message2) {
        callback(message2.data);
      });
    };
    worker2.send = function(message2) {
      this.postMessage(message2);
    };
    return worker2;
  }
  function setupWorkerThreadWorker(script, WorkerThreads2) {
    var worker2 = new WorkerThreads2.Worker(script, {
      stdout: false,
      stderr: false
    });
    worker2.isWorkerThread = true;
    worker2.send = function(message2) {
      this.postMessage(message2);
    };
    worker2.kill = function() {
      this.terminate();
      return true;
    };
    worker2.disconnect = function() {
      this.terminate();
    };
    return worker2;
  }
  function setupProcessWorker(script, options, child_process2) {
    var worker2 = child_process2.fork(script, options.forkArgs, options.forkOpts);
    worker2.isChildProcess = true;
    return worker2;
  }
  function resolveForkOptions(opts) {
    opts = opts || {};
    var processExecArgv = process.execArgv.join(" ");
    var inspectorActive = processExecArgv.indexOf("--inspect") !== -1;
    var debugBrk = processExecArgv.indexOf("--debug-brk") !== -1;
    var execArgv = [];
    if (inspectorActive) {
      execArgv.push("--inspect=" + opts.debugPort);
      if (debugBrk) {
        execArgv.push("--debug-brk");
      }
    }
    process.execArgv.forEach(function(arg) {
      if (arg.indexOf("--max-old-space-size") > -1) {
        execArgv.push(arg);
      }
    });
    return Object.assign({}, opts, {
      forkArgs: opts.forkArgs,
      forkOpts: Object.assign({}, opts.forkOpts, {
        execArgv: (opts.forkOpts && opts.forkOpts.execArgv || []).concat(execArgv)
      })
    });
  }
  function objectToError(obj) {
    var temp = new Error("");
    var props = Object.keys(obj);
    for (var i = 0; i < props.length; i++) {
      temp[props[i]] = obj[props[i]];
    }
    return temp;
  }
  function WorkerHandler(script, _options) {
    var me = this;
    var options = _options || {};
    this.script = script || getDefaultWorker();
    this.worker = setupWorker(this.script, options);
    this.debugPort = options.debugPort;
    if (!script) {
      this.worker.ready = true;
    }
    this.requestQueue = [];
    this.worker.on("message", function(response) {
      if (typeof response === "string" && response === "ready") {
        me.worker.ready = true;
        dispatchQueuedRequests();
      } else {
        var id = response.id;
        var task = me.processing[id];
        if (task !== void 0) {
          delete me.processing[id];
          if (me.terminating === true) {
            me.terminate();
          }
          if (response.error) {
            task.resolver.reject(objectToError(response.error));
          } else {
            task.resolver.resolve(response.result);
          }
        }
      }
    });
    function onError(error) {
      me.terminated = true;
      for (var id in me.processing) {
        if (me.processing[id] !== void 0) {
          me.processing[id].resolver.reject(error);
        }
      }
      me.processing = Object.create(null);
    }
    function dispatchQueuedRequests() {
      me.requestQueue.forEach(me.worker.send.bind(me.worker));
      me.requestQueue = [];
    }
    var worker2 = this.worker;
    this.worker.on("error", onError);
    this.worker.on("exit", function(exitCode, signalCode) {
      var message2 = "Workerpool Worker terminated Unexpectedly\n";
      message2 += "    exitCode: `" + exitCode + "`\n";
      message2 += "    signalCode: `" + signalCode + "`\n";
      message2 += "    workerpool.script: `" + me.script + "`\n";
      message2 += "    spawnArgs: `" + worker2.spawnargs + "`\n";
      message2 += "    spawnfile: `" + worker2.spawnfile + "`\n";
      message2 += "    stdout: `" + worker2.stdout + "`\n";
      message2 += "    stderr: `" + worker2.stderr + "`\n";
      onError(new Error(message2));
    });
    this.processing = Object.create(null);
    this.terminating = false;
    this.terminated = false;
    this.terminationHandler = null;
    this.lastId = 0;
  }
  WorkerHandler.prototype.methods = function() {
    return this.exec("methods");
  };
  WorkerHandler.prototype.exec = function(method, params, resolver3) {
    if (!resolver3) {
      resolver3 = Promise2.defer();
    }
    var id = ++this.lastId;
    this.processing[id] = {
      id,
      resolver: resolver3
    };
    var request = {
      id,
      method,
      params
    };
    if (this.terminated) {
      resolver3.reject(new Error("Worker is terminated"));
    } else if (this.worker.ready) {
      this.worker.send(request);
    } else {
      this.requestQueue.push(request);
    }
    var me = this;
    return resolver3.promise.catch(function(error) {
      if (error instanceof Promise2.CancellationError || error instanceof Promise2.TimeoutError) {
        delete me.processing[id];
        return me.terminateAndNotify(true).then(function() {
          throw error;
        }, function(err) {
          throw err;
        });
      } else {
        throw error;
      }
    });
  };
  WorkerHandler.prototype.busy = function() {
    return Object.keys(this.processing).length > 0;
  };
  WorkerHandler.prototype.terminate = function(force, callback) {
    var me = this;
    if (force) {
      for (var id in this.processing) {
        if (this.processing[id] !== void 0) {
          this.processing[id].resolver.reject(new Error("Worker terminated"));
        }
      }
      this.processing = Object.create(null);
    }
    if (typeof callback === "function") {
      this.terminationHandler = callback;
    }
    if (!this.busy()) {
      var cleanup = function(err) {
        me.terminated = true;
        me.worker = null;
        me.terminating = false;
        if (me.terminationHandler) {
          me.terminationHandler(err, me);
        } else if (err) {
          throw err;
        }
      };
      if (this.worker) {
        if (typeof this.worker.kill === "function") {
          if (this.worker.killed) {
            cleanup(new Error("worker already killed!"));
            return;
          }
          if (this.worker.isChildProcess) {
            var cleanExitTimeout = setTimeout(function() {
              me.worker.kill();
            }, CHILD_PROCESS_EXIT_TIMEOUT);
            this.worker.once("exit", function() {
              clearTimeout(cleanExitTimeout);
              me.worker.killed = true;
              cleanup();
            });
            if (this.worker.ready) {
              this.worker.send(TERMINATE_METHOD_ID2);
            } else {
              this.worker.requestQueue.push(TERMINATE_METHOD_ID2);
            }
          } else {
            this.worker.kill();
            this.worker.killed = true;
            cleanup();
          }
          return;
        } else if (typeof this.worker.terminate === "function") {
          this.worker.terminate();
          this.worker.killed = true;
        } else {
          throw new Error("Failed to terminate worker");
        }
      }
      cleanup();
    } else {
      this.terminating = true;
    }
  };
  WorkerHandler.prototype.terminateAndNotify = function(force, timeout) {
    var resolver3 = Promise2.defer();
    if (timeout) {
      resolver3.promise.timeout = timeout;
    }
    this.terminate(force, function(err, worker2) {
      if (err) {
        resolver3.reject(err);
      } else {
        resolver3.resolve(worker2);
      }
    });
    return resolver3.promise;
  };
  module2.exports = WorkerHandler;
  module2.exports._tryRequireWorkerThreads = tryRequireWorkerThreads;
  module2.exports._setupProcessWorker = setupProcessWorker;
  module2.exports._setupBrowserWorker = setupBrowserWorker;
  module2.exports._setupWorkerThreadWorker = setupWorkerThreadWorker;
  module2.exports.ensureWorkerThreads = ensureWorkerThreads;
});

// node_modules/workerpool/src/debug-port-allocator.js
var require_debug_port_allocator = __commonJS((exports2, module2) => {
  "use strict";
  var MAX_PORTS = 65535;
  module2.exports = DebugPortAllocator;
  function DebugPortAllocator() {
    this.ports = Object.create(null);
    this.length = 0;
  }
  DebugPortAllocator.prototype.nextAvailableStartingAt = function(starting) {
    while (this.ports[starting] === true) {
      starting++;
    }
    if (starting >= MAX_PORTS) {
      throw new Error("WorkerPool debug port limit reached: " + starting + ">= " + MAX_PORTS);
    }
    this.ports[starting] = true;
    this.length++;
    return starting;
  };
  DebugPortAllocator.prototype.releasePort = function(port) {
    delete this.ports[port];
    this.length--;
  };
});

// node_modules/workerpool/src/Pool.js
var require_Pool = __commonJS((exports2, module2) => {
  var Promise2 = require_Promise();
  var WorkerHandler = require_WorkerHandler();
  var environment = require_environment();
  var DebugPortAllocator = require_debug_port_allocator();
  var DEBUG_PORT_ALLOCATOR = new DebugPortAllocator();
  function Pool(script, options) {
    if (typeof script === "string") {
      this.script = script || null;
    } else {
      this.script = null;
      options = script;
    }
    this.workers = [];
    this.tasks = [];
    options = options || {};
    this.forkArgs = options.forkArgs || [];
    this.forkOpts = options.forkOpts || {};
    this.debugPortStart = options.debugPortStart || 43210;
    this.nodeWorker = options.nodeWorker;
    this.workerType = options.workerType || options.nodeWorker || "auto";
    this.maxQueueSize = options.maxQueueSize || Infinity;
    if (options && "maxWorkers" in options) {
      validateMaxWorkers(options.maxWorkers);
      this.maxWorkers = options.maxWorkers;
    } else {
      this.maxWorkers = Math.max((environment.cpus || 4) - 1, 1);
    }
    if (options && "minWorkers" in options) {
      if (options.minWorkers === "max") {
        this.minWorkers = this.maxWorkers;
      } else {
        validateMinWorkers(options.minWorkers);
        this.minWorkers = options.minWorkers;
        this.maxWorkers = Math.max(this.minWorkers, this.maxWorkers);
      }
      this._ensureMinWorkers();
    }
    this._boundNext = this._next.bind(this);
    if (this.workerType === "thread") {
      WorkerHandler.ensureWorkerThreads();
    }
  }
  Pool.prototype.exec = function(method, params) {
    if (params && !Array.isArray(params)) {
      throw new TypeError('Array expected as argument "params"');
    }
    if (typeof method === "string") {
      var resolver3 = Promise2.defer();
      if (this.tasks.length >= this.maxQueueSize) {
        throw new Error("Max queue size of " + this.maxQueueSize + " reached");
      }
      var tasks = this.tasks;
      var task = {
        method,
        params,
        resolver: resolver3,
        timeout: null
      };
      tasks.push(task);
      var originalTimeout = resolver3.promise.timeout;
      resolver3.promise.timeout = function timeout(delay) {
        if (tasks.indexOf(task) !== -1) {
          task.timeout = delay;
          return resolver3.promise;
        } else {
          return originalTimeout.call(resolver3.promise, delay);
        }
      };
      this._next();
      return resolver3.promise;
    } else if (typeof method === "function") {
      return this.exec("run", [String(method), params]);
    } else {
      throw new TypeError('Function or string expected as argument "method"');
    }
  };
  Pool.prototype.proxy = function() {
    if (arguments.length > 0) {
      throw new Error("No arguments expected");
    }
    var pool2 = this;
    return this.exec("methods").then(function(methods) {
      var proxy = {};
      methods.forEach(function(method) {
        proxy[method] = function() {
          return pool2.exec(method, Array.prototype.slice.call(arguments));
        };
      });
      return proxy;
    });
  };
  Pool.prototype._next = function() {
    if (this.tasks.length > 0) {
      var worker2 = this._getWorker();
      if (worker2) {
        var me = this;
        var task = this.tasks.shift();
        if (task.resolver.promise.pending) {
          var promise = worker2.exec(task.method, task.params, task.resolver).then(me._boundNext).catch(function() {
            if (worker2.terminated) {
              return me._removeWorker(worker2);
            }
          }).then(function() {
            me._next();
          });
          if (typeof task.timeout === "number") {
            promise.timeout(task.timeout);
          }
        } else {
          me._next();
        }
      }
    }
  };
  Pool.prototype._getWorker = function() {
    var workers = this.workers;
    for (var i = 0; i < workers.length; i++) {
      var worker2 = workers[i];
      if (worker2.busy() === false) {
        return worker2;
      }
    }
    if (workers.length < this.maxWorkers) {
      worker2 = this._createWorkerHandler();
      workers.push(worker2);
      return worker2;
    }
    return null;
  };
  Pool.prototype._removeWorker = function(worker2) {
    DEBUG_PORT_ALLOCATOR.releasePort(worker2.debugPort);
    this._removeWorkerFromList(worker2);
    this._ensureMinWorkers();
    return new Promise2(function(resolve2, reject) {
      worker2.terminate(false, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve2(worker2);
        }
      });
    });
  };
  Pool.prototype._removeWorkerFromList = function(worker2) {
    var index = this.workers.indexOf(worker2);
    if (index !== -1) {
      this.workers.splice(index, 1);
    }
  };
  Pool.prototype.terminate = function(force, timeout) {
    this.tasks.forEach(function(task) {
      task.resolver.reject(new Error("Pool terminated"));
    });
    this.tasks.length = 0;
    var f = function(worker2) {
      this._removeWorkerFromList(worker2);
    };
    var removeWorker = f.bind(this);
    var promises = [];
    var workers = this.workers.slice();
    workers.forEach(function(worker2) {
      var termPromise = worker2.terminateAndNotify(force, timeout).then(removeWorker);
      promises.push(termPromise);
    });
    return Promise2.all(promises);
  };
  Pool.prototype.stats = function() {
    var totalWorkers = this.workers.length;
    var busyWorkers = this.workers.filter(function(worker2) {
      return worker2.busy();
    }).length;
    return {
      totalWorkers,
      busyWorkers,
      idleWorkers: totalWorkers - busyWorkers,
      pendingTasks: this.tasks.length,
      activeTasks: busyWorkers
    };
  };
  Pool.prototype._ensureMinWorkers = function() {
    if (this.minWorkers) {
      for (var i = this.workers.length; i < this.minWorkers; i++) {
        this.workers.push(this._createWorkerHandler());
      }
    }
  };
  Pool.prototype._createWorkerHandler = function() {
    return new WorkerHandler(this.script, {
      forkArgs: this.forkArgs,
      forkOpts: this.forkOpts,
      debugPort: DEBUG_PORT_ALLOCATOR.nextAvailableStartingAt(this.debugPortStart),
      workerType: this.workerType
    });
  };
  function validateMaxWorkers(maxWorkers) {
    if (!isNumber(maxWorkers) || !isInteger(maxWorkers) || maxWorkers < 1) {
      throw new TypeError("Option maxWorkers must be an integer number >= 1");
    }
  }
  function validateMinWorkers(minWorkers) {
    if (!isNumber(minWorkers) || !isInteger(minWorkers) || minWorkers < 0) {
      throw new TypeError("Option minWorkers must be an integer number >= 0");
    }
  }
  function isNumber(value) {
    return typeof value === "number";
  }
  function isInteger(value) {
    return Math.round(value) == value;
  }
  module2.exports = Pool;
});

// node_modules/workerpool/src/worker.js
var require_worker = __commonJS((exports) => {
  var requireFoolWebpack = eval(`typeof require !== 'undefined' ? require : function (module) { throw new Error('Module " + module + " not found.') }`);
  var TERMINATE_METHOD_ID = "__workerpool-terminate__";
  var worker = {
    exit: function() {
    }
  };
  if (typeof self !== "undefined" && typeof postMessage === "function" && typeof addEventListener === "function") {
    worker.on = function(event, callback) {
      addEventListener(event, function(message2) {
        callback(message2.data);
      });
    };
    worker.send = function(message2) {
      postMessage(message2);
    };
  } else if (typeof process !== "undefined") {
    try {
      WorkerThreads = requireFoolWebpack("worker_threads");
    } catch (error) {
      if (typeof error === "object" && error !== null && error.code === "MODULE_NOT_FOUND") {
      } else {
        throw error;
      }
    }
    if (WorkerThreads && WorkerThreads.parentPort !== null) {
      parentPort = WorkerThreads.parentPort;
      worker.send = parentPort.postMessage.bind(parentPort);
      worker.on = parentPort.on.bind(parentPort);
    } else {
      worker.on = process.on.bind(process);
      worker.send = process.send.bind(process);
      worker.on("disconnect", function() {
        process.exit(1);
      });
      worker.exit = process.exit.bind(process);
    }
  } else {
    throw new Error("Script must be executed as a worker");
  }
  var WorkerThreads;
  var parentPort;
  function convertError(error) {
    return Object.getOwnPropertyNames(error).reduce(function(product, name) {
      return Object.defineProperty(product, name, {
        value: error[name],
        enumerable: true
      });
    }, {});
  }
  function isPromise(value) {
    return value && typeof value.then === "function" && typeof value.catch === "function";
  }
  worker.methods = {};
  worker.methods.run = function run(fn, args) {
    var f = eval("(" + fn + ")");
    return f.apply(f, args);
  };
  worker.methods.methods = function methods() {
    return Object.keys(worker.methods);
  };
  worker.on("message", function(request) {
    if (request === TERMINATE_METHOD_ID) {
      return worker.exit(0);
    }
    try {
      var method = worker.methods[request.method];
      if (method) {
        var result = method.apply(method, request.params);
        if (isPromise(result)) {
          result.then(function(result2) {
            worker.send({
              id: request.id,
              result: result2,
              error: null
            });
          }).catch(function(err) {
            worker.send({
              id: request.id,
              result: null,
              error: convertError(err)
            });
          });
        } else {
          worker.send({
            id: request.id,
            result,
            error: null
          });
        }
      } else {
        throw new Error('Unknown method "' + request.method + '"');
      }
    } catch (err) {
      worker.send({
        id: request.id,
        result: null,
        error: convertError(err)
      });
    }
  });
  worker.register = function(methods) {
    if (methods) {
      for (var name in methods) {
        if (methods.hasOwnProperty(name)) {
          worker.methods[name] = methods[name];
        }
      }
    }
    worker.send("ready");
  };
  if (typeof exports !== "undefined") {
    exports.add = worker.register;
  }
});

// node_modules/workerpool/src/index.js
var require_src = __commonJS((exports2) => {
  var environment = require_environment();
  exports2.pool = function pool2(script, options) {
    var Pool = require_Pool();
    return new Pool(script, options);
  };
  exports2.worker = function worker2(methods) {
    var worker3 = require_worker();
    worker3.add(methods);
  };
  exports2.Promise = require_Promise();
  exports2.platform = environment.platform;
  exports2.isMainThread = environment.isMainThread;
  exports2.cpus = environment.cpus;
});

// vendor/fdir/compat/fs.js
var require_fs = __commonJS((exports2, module2) => {
  var {lstat, lstatSync, readdir, readdirSync, Dirent} = require("fs");
  var {sep} = require("path");
  if (!Dirent) {
    module2.exports.readdir = function(dir, _, callback) {
      readdir(dir, (err, files) => {
        if (err)
          return process.nextTick(callback, err, null);
        if (!files.length)
          return process.nextTick(callback, null, []);
        let dirents = [];
        for (let i = 0; i < files.length; ++i) {
          let name = files[i];
          let path6 = `${dir}${sep}${name}`;
          lstat(path6, (err2, stat) => {
            if (err2)
              return process.nextTick(callback, err2, null);
            dirents[dirents.length] = getDirent(name, stat);
            if (dirents.length === files.length) {
              process.nextTick(callback, null, dirents);
            }
          });
        }
      });
    };
    module2.exports.readdirSync = function(dir) {
      const files = readdirSync(dir);
      let dirents = [];
      for (let i = 0; i < files.length; ++i) {
        let name = files[i];
        let path6 = `${dir}${sep}${name}`;
        const stat = lstatSync(path6);
        dirents[dirents.length] = getDirent(name, stat);
      }
      return dirents;
    };
    function getDirent(name, stat) {
      return {
        name,
        isFile: () => stat.isFile(),
        isDirectory: () => stat.isDirectory()
      };
    }
  } else {
    module2.exports = {readdirSync, readdir};
  }
});

// vendor/fdir/utils.js
var require_utils = __commonJS((exports2, module2) => {
  var {sep, normalize} = require("path");
  function cleanPath(dirPath) {
    let normalized = normalize(dirPath);
    if (normalized.length > 1 && normalized[normalized.length - 1] === sep)
      normalized = normalized.substring(0, normalized.length - 1);
    return normalized;
  }
  module2.exports = {cleanPath};
});

// vendor/fdir/api/fns.js
var require_fns = __commonJS((exports2, module2) => {
  var {sep} = require("path");
  module2.exports.getArray = function(state) {
    return state.paths;
  };
  module2.exports.getArrayGroup = function() {
    return [""].slice(0, 0);
  };
  module2.exports.pushFileFilterAndCount = function(filters) {
    return function(filename, _files, _dir, state) {
      if (filters.some((f) => f(filename)))
        state.counts.files++;
    };
  };
  module2.exports.pushFileFilter = function(filters) {
    return function(filename, files) {
      if (filters.some((f) => f(filename)))
        files.push(filename);
    };
  };
  module2.exports.pushFileCount = function(_filename, _files, _dir, state) {
    state.counts.files++;
  };
  module2.exports.pushFile = function(filename, files) {
    files.push(filename);
  };
  module2.exports.pushDir = function(dirPath, paths) {
    paths.push(dirPath);
  };
  module2.exports.joinPathWithBasePath = function(filename, dir) {
    return `${dir}${sep}${filename}`;
  };
  module2.exports.joinPath = function(filename) {
    return filename;
  };
  module2.exports.walkDirExclude = function(exclude) {
    return function(walk, state, path6, dir, currentDepth, callback) {
      if (!exclude(dir, path6, currentDepth)) {
        module2.exports.walkDir(walk, state, path6, dir, currentDepth, callback);
      }
    };
  };
  module2.exports.walkDir = function(walk, state, path6, _dir, currentDepth, callback) {
    state.queue++;
    state.counts.dirs++;
    walk(state, path6, currentDepth, callback);
  };
  module2.exports.groupFiles = function(dir, files, state) {
    state.counts.files += files.length;
    state.paths.push({dir, files});
  };
  module2.exports.empty = function() {
  };
  module2.exports.callbackInvokerOnlyCountsSync = function(state) {
    return state.counts;
  };
  module2.exports.callbackInvokerDefaultSync = function(state) {
    return state.paths;
  };
  module2.exports.callbackInvokerOnlyCountsAsync = callbackInvokerBuilder("counts");
  module2.exports.callbackInvokerDefaultAsync = callbackInvokerBuilder("paths");
  function report(err, callback, output, suppressErrors) {
    if (err) {
      if (!suppressErrors)
        callback(err, null);
      return;
    }
    callback(null, output);
  }
  function callbackInvokerBuilder(output) {
    return function(err, state) {
      report(err, state.callback, state[output], state.options.suppressErrors);
    };
  }
});

// vendor/fdir/api/shared.js
var require_shared = __commonJS((exports2, module2) => {
  var {sep, resolve: pathResolve} = require("path");
  var {cleanPath} = require_utils();
  var fns = require_fns();
  var readdirOpts = {withFileTypes: true};
  function init(dir, options, callback, isSync) {
    if (options.resolvePaths)
      dir = pathResolve(dir);
    if (options.normalizePath)
      dir = cleanPath(dir);
    const state = {
      paths: [""].slice(0, 0),
      queue: 0,
      counts: {files: 0, dirs: 0},
      options,
      callback
    };
    buildFunctions(options, isSync);
    return {state, callbackInvoker, dir};
  }
  function walkSingleDir(walk, state, dir, dirents, currentDepth, callback) {
    pushDir(dir, state.paths);
    if (dir === sep)
      dir = "";
    const files = getArray(state);
    for (var i = 0; i < dirents.length; ++i) {
      const dirent = dirents[i];
      if (dirent.isFile()) {
        const filename = joinPath(dirent.name, dir);
        pushFile(filename, files, dir, state);
      } else if (dirent.isDirectory()) {
        let dirPath = `${dir}${sep}${dirent.name}`;
        walkDir(walk, state, dirPath, dirent.name, currentDepth - 1, callback);
      }
    }
    groupFiles(dir, files, state);
  }
  function buildFunctions(options, isSync) {
    const {
      filters,
      onlyCountsVar,
      includeBasePath,
      includeDirs,
      groupVar,
      excludeFn
    } = options;
    buildPushFile(filters, onlyCountsVar);
    pushDir = includeDirs ? fns.pushDir : fns.empty;
    joinPath = includeBasePath ? fns.joinPathWithBasePath : fns.joinPath;
    walkDir = excludeFn ? fns.walkDirExclude(excludeFn) : fns.walkDir;
    groupFiles = groupVar ? fns.groupFiles : fns.empty;
    getArray = groupVar ? fns.getArrayGroup : fns.getArray;
    buildCallbackInvoker(onlyCountsVar, isSync);
  }
  module2.exports = {buildFunctions, init, walkSingleDir, readdirOpts};
  function buildPushFile(filters, onlyCountsVar) {
    if (filters.length && onlyCountsVar) {
      pushFile = fns.pushFileFilterAndCount(filters);
    } else if (filters.length) {
      pushFile = fns.pushFileFilter(filters);
    } else if (onlyCountsVar) {
      pushFile = fns.pushFileCount;
    } else {
      pushFile = fns.pushFile;
    }
  }
  function buildCallbackInvoker(onlyCountsVar, isSync) {
    if (onlyCountsVar) {
      callbackInvoker = isSync ? fns.callbackInvokerOnlyCountsSync : fns.callbackInvokerOnlyCountsAsync;
    } else {
      callbackInvoker = isSync ? fns.callbackInvokerDefaultSync : fns.callbackInvokerDefaultAsync;
    }
  }
  var pushFile = fns.empty;
  var pushDir = fns.empty;
  var walkDir = fns.empty;
  var joinPath = fns.empty;
  var groupFiles = fns.empty;
  var callbackInvoker = fns.empty;
  var getArray = fns.empty;
});

// vendor/fdir/api/async.js
var require_async = __commonJS((exports2, module2) => {
  var {readdir} = require_fs();
  var {init, walkSingleDir, readdirOpts} = require_shared();
  function promise(dir, options) {
    return new Promise((resolve2, reject) => {
      callback(dir, options, (err, output) => {
        if (err)
          return reject(err);
        resolve2(output);
      });
    });
  }
  function callback(dirPath, options, callback2) {
    const {state, callbackInvoker, dir} = init(dirPath, options, callback2);
    walk(state, dir, options.maxDepth, callbackInvoker);
  }
  function walk(state, dir, currentDepth, callback2) {
    if (currentDepth < 0) {
      --state.queue;
      return;
    }
    readdir(dir, readdirOpts, function(error, dirents) {
      if (error) {
        --state.queue;
        callback2(error, state);
        return;
      }
      walkSingleDir(walk, state, dir, dirents, currentDepth, callback2);
      if (--state.queue < 0)
        callback2(null, state);
    });
  }
  module2.exports = {promise, callback};
});

// vendor/fdir/api/sync.js
var require_sync = __commonJS((exports2, module2) => {
  var {readdirSync} = require_fs();
  var {init, walkSingleDir, readdirOpts} = require_shared();
  function sync(dirPath, options) {
    const {state, callbackInvoker, dir} = init(dirPath, options, null, true);
    walk(state, dir, options.maxDepth);
    return callbackInvoker(state);
  }
  function walk(state, dir, currentDepth) {
    if (currentDepth < 0) {
      return;
    }
    try {
      const dirents = readdirSync(dir, readdirOpts);
      walkSingleDir(walk, state, dir, dirents, currentDepth);
    } catch (e) {
      if (!state.options.suppressErrors)
        throw e;
    }
  }
  module2.exports = sync;
});

// vendor/fdir/builder/apiBuilder.js
var require_apiBuilder = __commonJS((exports2, module2) => {
  var {promise, callback} = require_async();
  var sync = require_sync();
  function APIBuilder(path6, options) {
    this.dir = path6;
    this.options = options;
  }
  APIBuilder.prototype.withPromise = function() {
    return promise(this.dir, this.options);
  };
  APIBuilder.prototype.withCallback = function(cb) {
    callback(this.dir, this.options, cb);
  };
  APIBuilder.prototype.sync = function() {
    return sync(this.dir, this.options);
  };
  module2.exports = APIBuilder;
});

// node_modules/picomatch/lib/constants.js
var require_constants = __commonJS((exports2, module2) => {
  "use strict";
  var path6 = require("path");
  var WIN_SLASH = "\\\\/";
  var WIN_NO_SLASH = `[^${WIN_SLASH}]`;
  var DOT_LITERAL = "\\.";
  var PLUS_LITERAL = "\\+";
  var QMARK_LITERAL = "\\?";
  var SLASH_LITERAL = "\\/";
  var ONE_CHAR = "(?=.)";
  var QMARK = "[^/]";
  var END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
  var START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
  var DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
  var NO_DOT = `(?!${DOT_LITERAL})`;
  var NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
  var NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
  var NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
  var QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
  var STAR = `${QMARK}*?`;
  var POSIX_CHARS = {
    DOT_LITERAL,
    PLUS_LITERAL,
    QMARK_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    QMARK,
    END_ANCHOR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOTS,
    NO_DOT_SLASH,
    NO_DOTS_SLASH,
    QMARK_NO_DOT,
    STAR,
    START_ANCHOR
  };
  var WINDOWS_CHARS = {
    ...POSIX_CHARS,
    SLASH_LITERAL: `[${WIN_SLASH}]`,
    QMARK: WIN_NO_SLASH,
    STAR: `${WIN_NO_SLASH}*?`,
    DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
    NO_DOT: `(?!${DOT_LITERAL})`,
    NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
    NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
    NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
    QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
    START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
    END_ANCHOR: `(?:[${WIN_SLASH}]|$)`
  };
  var POSIX_REGEX_SOURCE = {
    alnum: "a-zA-Z0-9",
    alpha: "a-zA-Z",
    ascii: "\\x00-\\x7F",
    blank: " \\t",
    cntrl: "\\x00-\\x1F\\x7F",
    digit: "0-9",
    graph: "\\x21-\\x7E",
    lower: "a-z",
    print: "\\x20-\\x7E ",
    punct: "\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~",
    space: " \\t\\r\\n\\v\\f",
    upper: "A-Z",
    word: "A-Za-z0-9_",
    xdigit: "A-Fa-f0-9"
  };
  module2.exports = {
    MAX_LENGTH: 1024 * 64,
    POSIX_REGEX_SOURCE,
    REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
    REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
    REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
    REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
    REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
    REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
    REPLACEMENTS: {
      "***": "*",
      "**/**": "**",
      "**/**/**": "**"
    },
    CHAR_0: 48,
    CHAR_9: 57,
    CHAR_UPPERCASE_A: 65,
    CHAR_LOWERCASE_A: 97,
    CHAR_UPPERCASE_Z: 90,
    CHAR_LOWERCASE_Z: 122,
    CHAR_LEFT_PARENTHESES: 40,
    CHAR_RIGHT_PARENTHESES: 41,
    CHAR_ASTERISK: 42,
    CHAR_AMPERSAND: 38,
    CHAR_AT: 64,
    CHAR_BACKWARD_SLASH: 92,
    CHAR_CARRIAGE_RETURN: 13,
    CHAR_CIRCUMFLEX_ACCENT: 94,
    CHAR_COLON: 58,
    CHAR_COMMA: 44,
    CHAR_DOT: 46,
    CHAR_DOUBLE_QUOTE: 34,
    CHAR_EQUAL: 61,
    CHAR_EXCLAMATION_MARK: 33,
    CHAR_FORM_FEED: 12,
    CHAR_FORWARD_SLASH: 47,
    CHAR_GRAVE_ACCENT: 96,
    CHAR_HASH: 35,
    CHAR_HYPHEN_MINUS: 45,
    CHAR_LEFT_ANGLE_BRACKET: 60,
    CHAR_LEFT_CURLY_BRACE: 123,
    CHAR_LEFT_SQUARE_BRACKET: 91,
    CHAR_LINE_FEED: 10,
    CHAR_NO_BREAK_SPACE: 160,
    CHAR_PERCENT: 37,
    CHAR_PLUS: 43,
    CHAR_QUESTION_MARK: 63,
    CHAR_RIGHT_ANGLE_BRACKET: 62,
    CHAR_RIGHT_CURLY_BRACE: 125,
    CHAR_RIGHT_SQUARE_BRACKET: 93,
    CHAR_SEMICOLON: 59,
    CHAR_SINGLE_QUOTE: 39,
    CHAR_SPACE: 32,
    CHAR_TAB: 9,
    CHAR_UNDERSCORE: 95,
    CHAR_VERTICAL_LINE: 124,
    CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,
    SEP: path6.sep,
    extglobChars(chars) {
      return {
        "!": {type: "negate", open: "(?:(?!(?:", close: `))${chars.STAR})`},
        "?": {type: "qmark", open: "(?:", close: ")?"},
        "+": {type: "plus", open: "(?:", close: ")+"},
        "*": {type: "star", open: "(?:", close: ")*"},
        "@": {type: "at", open: "(?:", close: ")"}
      };
    },
    globChars(win32) {
      return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
    }
  };
});

// node_modules/picomatch/lib/utils.js
var require_utils2 = __commonJS((exports2) => {
  "use strict";
  var path6 = require("path");
  var win32 = process.platform === "win32";
  var {
    REGEX_BACKSLASH,
    REGEX_REMOVE_BACKSLASH,
    REGEX_SPECIAL_CHARS,
    REGEX_SPECIAL_CHARS_GLOBAL
  } = require_constants();
  exports2.isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
  exports2.hasRegexChars = (str) => REGEX_SPECIAL_CHARS.test(str);
  exports2.isRegexChar = (str) => str.length === 1 && exports2.hasRegexChars(str);
  exports2.escapeRegex = (str) => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, "\\$1");
  exports2.toPosixSlashes = (str) => str.replace(REGEX_BACKSLASH, "/");
  exports2.removeBackslashes = (str) => {
    return str.replace(REGEX_REMOVE_BACKSLASH, (match) => {
      return match === "\\" ? "" : match;
    });
  };
  exports2.supportsLookbehinds = () => {
    const segs = process.version.slice(1).split(".").map(Number);
    if (segs.length === 3 && segs[0] >= 9 || segs[0] === 8 && segs[1] >= 10) {
      return true;
    }
    return false;
  };
  exports2.isWindows = (options) => {
    if (options && typeof options.windows === "boolean") {
      return options.windows;
    }
    return win32 === true || path6.sep === "\\";
  };
  exports2.escapeLast = (input, char, lastIdx) => {
    const idx = input.lastIndexOf(char, lastIdx);
    if (idx === -1)
      return input;
    if (input[idx - 1] === "\\")
      return exports2.escapeLast(input, char, idx - 1);
    return `${input.slice(0, idx)}\\${input.slice(idx)}`;
  };
  exports2.removePrefix = (input, state = {}) => {
    let output = input;
    if (output.startsWith("./")) {
      output = output.slice(2);
      state.prefix = "./";
    }
    return output;
  };
  exports2.wrapOutput = (input, state = {}, options = {}) => {
    const prepend = options.contains ? "" : "^";
    const append = options.contains ? "" : "$";
    let output = `${prepend}(?:${input})${append}`;
    if (state.negated === true) {
      output = `(?:^(?!${output}).*$)`;
    }
    return output;
  };
});

// node_modules/picomatch/lib/scan.js
var require_scan = __commonJS((exports2, module2) => {
  "use strict";
  var utils8 = require_utils2();
  var {
    CHAR_ASTERISK,
    CHAR_AT,
    CHAR_BACKWARD_SLASH,
    CHAR_COMMA,
    CHAR_DOT,
    CHAR_EXCLAMATION_MARK,
    CHAR_FORWARD_SLASH,
    CHAR_LEFT_CURLY_BRACE,
    CHAR_LEFT_PARENTHESES,
    CHAR_LEFT_SQUARE_BRACKET,
    CHAR_PLUS,
    CHAR_QUESTION_MARK,
    CHAR_RIGHT_CURLY_BRACE,
    CHAR_RIGHT_PARENTHESES,
    CHAR_RIGHT_SQUARE_BRACKET
  } = require_constants();
  var isPathSeparator = (code) => {
    return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
  };
  var depth = (token2) => {
    if (token2.isPrefix !== true) {
      token2.depth = token2.isGlobstar ? Infinity : 1;
    }
  };
  var scan = (input, options) => {
    const opts = options || {};
    const length = input.length - 1;
    const scanToEnd = opts.parts === true || opts.scanToEnd === true;
    const slashes = [];
    const tokens = [];
    const parts = [];
    let str = input;
    let index = -1;
    let start = 0;
    let lastIndex = 0;
    let isBrace = false;
    let isBracket = false;
    let isGlob = false;
    let isExtglob = false;
    let isGlobstar = false;
    let braceEscaped = false;
    let backslashes = false;
    let negated = false;
    let finished = false;
    let braces = 0;
    let prev;
    let code;
    let token2 = {value: "", depth: 0, isGlob: false};
    const eos = () => index >= length;
    const peek = () => str.charCodeAt(index + 1);
    const advance = () => {
      prev = code;
      return str.charCodeAt(++index);
    };
    while (index < length) {
      code = advance();
      let next;
      if (code === CHAR_BACKWARD_SLASH) {
        backslashes = token2.backslashes = true;
        code = advance();
        if (code === CHAR_LEFT_CURLY_BRACE) {
          braceEscaped = true;
        }
        continue;
      }
      if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
        braces++;
        while (eos() !== true && (code = advance())) {
          if (code === CHAR_BACKWARD_SLASH) {
            backslashes = token2.backslashes = true;
            advance();
            continue;
          }
          if (code === CHAR_LEFT_CURLY_BRACE) {
            braces++;
            continue;
          }
          if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
            isBrace = token2.isBrace = true;
            isGlob = token2.isGlob = true;
            finished = true;
            if (scanToEnd === true) {
              continue;
            }
            break;
          }
          if (braceEscaped !== true && code === CHAR_COMMA) {
            isBrace = token2.isBrace = true;
            isGlob = token2.isGlob = true;
            finished = true;
            if (scanToEnd === true) {
              continue;
            }
            break;
          }
          if (code === CHAR_RIGHT_CURLY_BRACE) {
            braces--;
            if (braces === 0) {
              braceEscaped = false;
              isBrace = token2.isBrace = true;
              finished = true;
              break;
            }
          }
        }
        if (scanToEnd === true) {
          continue;
        }
        break;
      }
      if (code === CHAR_FORWARD_SLASH) {
        slashes.push(index);
        tokens.push(token2);
        token2 = {value: "", depth: 0, isGlob: false};
        if (finished === true)
          continue;
        if (prev === CHAR_DOT && index === start + 1) {
          start += 2;
          continue;
        }
        lastIndex = index + 1;
        continue;
      }
      if (opts.noext !== true) {
        const isExtglobChar = code === CHAR_PLUS || code === CHAR_AT || code === CHAR_ASTERISK || code === CHAR_QUESTION_MARK || code === CHAR_EXCLAMATION_MARK;
        if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
          isGlob = token2.isGlob = true;
          isExtglob = token2.isExtglob = true;
          finished = true;
          if (scanToEnd === true) {
            while (eos() !== true && (code = advance())) {
              if (code === CHAR_BACKWARD_SLASH) {
                backslashes = token2.backslashes = true;
                code = advance();
                continue;
              }
              if (code === CHAR_RIGHT_PARENTHESES) {
                isGlob = token2.isGlob = true;
                finished = true;
                break;
              }
            }
            continue;
          }
          break;
        }
      }
      if (code === CHAR_ASTERISK) {
        if (prev === CHAR_ASTERISK)
          isGlobstar = token2.isGlobstar = true;
        isGlob = token2.isGlob = true;
        finished = true;
        if (scanToEnd === true) {
          continue;
        }
        break;
      }
      if (code === CHAR_QUESTION_MARK) {
        isGlob = token2.isGlob = true;
        finished = true;
        if (scanToEnd === true) {
          continue;
        }
        break;
      }
      if (code === CHAR_LEFT_SQUARE_BRACKET) {
        while (eos() !== true && (next = advance())) {
          if (next === CHAR_BACKWARD_SLASH) {
            backslashes = token2.backslashes = true;
            advance();
            continue;
          }
          if (next === CHAR_RIGHT_SQUARE_BRACKET) {
            isBracket = token2.isBracket = true;
            isGlob = token2.isGlob = true;
            finished = true;
            if (scanToEnd === true) {
              continue;
            }
            break;
          }
        }
      }
      if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
        negated = token2.negated = true;
        start++;
        continue;
      }
      if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
        isGlob = token2.isGlob = true;
        if (scanToEnd === true) {
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_LEFT_PARENTHESES) {
              backslashes = token2.backslashes = true;
              code = advance();
              continue;
            }
            if (code === CHAR_RIGHT_PARENTHESES) {
              finished = true;
              break;
            }
          }
          continue;
        }
        break;
      }
      if (isGlob === true) {
        finished = true;
        if (scanToEnd === true) {
          continue;
        }
        break;
      }
    }
    if (opts.noext === true) {
      isExtglob = false;
      isGlob = false;
    }
    let base = str;
    let prefix = "";
    let glob = "";
    if (start > 0) {
      prefix = str.slice(0, start);
      str = str.slice(start);
      lastIndex -= start;
    }
    if (base && isGlob === true && lastIndex > 0) {
      base = str.slice(0, lastIndex);
      glob = str.slice(lastIndex);
    } else if (isGlob === true) {
      base = "";
      glob = str;
    } else {
      base = str;
    }
    if (base && base !== "" && base !== "/" && base !== str) {
      if (isPathSeparator(base.charCodeAt(base.length - 1))) {
        base = base.slice(0, -1);
      }
    }
    if (opts.unescape === true) {
      if (glob)
        glob = utils8.removeBackslashes(glob);
      if (base && backslashes === true) {
        base = utils8.removeBackslashes(base);
      }
    }
    const state = {
      prefix,
      input,
      start,
      base,
      glob,
      isBrace,
      isBracket,
      isGlob,
      isExtglob,
      isGlobstar,
      negated
    };
    if (opts.tokens === true) {
      state.maxDepth = 0;
      if (!isPathSeparator(code)) {
        tokens.push(token2);
      }
      state.tokens = tokens;
    }
    if (opts.parts === true || opts.tokens === true) {
      let prevIndex;
      for (let idx = 0; idx < slashes.length; idx++) {
        const n = prevIndex ? prevIndex + 1 : start;
        const i = slashes[idx];
        const value = input.slice(n, i);
        if (opts.tokens) {
          if (idx === 0 && start !== 0) {
            tokens[idx].isPrefix = true;
            tokens[idx].value = prefix;
          } else {
            tokens[idx].value = value;
          }
          depth(tokens[idx]);
          state.maxDepth += tokens[idx].depth;
        }
        if (idx !== 0 || value !== "") {
          parts.push(value);
        }
        prevIndex = i;
      }
      if (prevIndex && prevIndex + 1 < input.length) {
        const value = input.slice(prevIndex + 1);
        parts.push(value);
        if (opts.tokens) {
          tokens[tokens.length - 1].value = value;
          depth(tokens[tokens.length - 1]);
          state.maxDepth += tokens[tokens.length - 1].depth;
        }
      }
      state.slashes = slashes;
      state.parts = parts;
    }
    return state;
  };
  module2.exports = scan;
});

// node_modules/picomatch/lib/parse.js
var require_parse = __commonJS((exports2, module2) => {
  "use strict";
  var constants = require_constants();
  var utils8 = require_utils2();
  var {
    MAX_LENGTH,
    POSIX_REGEX_SOURCE,
    REGEX_NON_SPECIAL_CHARS,
    REGEX_SPECIAL_CHARS_BACKREF,
    REPLACEMENTS
  } = constants;
  var expandRange = (args, options) => {
    if (typeof options.expandRange === "function") {
      return options.expandRange(...args, options);
    }
    args.sort();
    const value = `[${args.join("-")}]`;
    try {
      new RegExp(value);
    } catch (ex) {
      return args.map((v) => utils8.escapeRegex(v)).join("..");
    }
    return value;
  };
  var syntaxError = (type, char) => {
    return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
  };
  var parse = (input, options) => {
    if (typeof input !== "string") {
      throw new TypeError("Expected a string");
    }
    input = REPLACEMENTS[input] || input;
    const opts = {...options};
    const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
    let len = input.length;
    if (len > max) {
      throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
    }
    const bos = {type: "bos", value: "", output: opts.prepend || ""};
    const tokens = [bos];
    const capture = opts.capture ? "" : "?:";
    const win32 = utils8.isWindows(options);
    const PLATFORM_CHARS = constants.globChars(win32);
    const EXTGLOB_CHARS = constants.extglobChars(PLATFORM_CHARS);
    const {
      DOT_LITERAL,
      PLUS_LITERAL,
      SLASH_LITERAL,
      ONE_CHAR,
      DOTS_SLASH,
      NO_DOT,
      NO_DOT_SLASH,
      NO_DOTS_SLASH,
      QMARK,
      QMARK_NO_DOT,
      STAR,
      START_ANCHOR
    } = PLATFORM_CHARS;
    const globstar = (opts2) => {
      return `(${capture}(?:(?!${START_ANCHOR}${opts2.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
    };
    const nodot = opts.dot ? "" : NO_DOT;
    const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
    let star = opts.bash === true ? globstar(opts) : STAR;
    if (opts.capture) {
      star = `(${star})`;
    }
    if (typeof opts.noext === "boolean") {
      opts.noextglob = opts.noext;
    }
    const state = {
      input,
      index: -1,
      start: 0,
      dot: opts.dot === true,
      consumed: "",
      output: "",
      prefix: "",
      backtrack: false,
      negated: false,
      brackets: 0,
      braces: 0,
      parens: 0,
      quotes: 0,
      globstar: false,
      tokens
    };
    input = utils8.removePrefix(input, state);
    len = input.length;
    const extglobs = [];
    const braces = [];
    const stack = [];
    let prev = bos;
    let value;
    const eos = () => state.index === len - 1;
    const peek = state.peek = (n = 1) => input[state.index + n];
    const advance = state.advance = () => input[++state.index];
    const remaining = () => input.slice(state.index + 1);
    const consume = (value2 = "", num = 0) => {
      state.consumed += value2;
      state.index += num;
    };
    const append = (token2) => {
      state.output += token2.output != null ? token2.output : token2.value;
      consume(token2.value);
    };
    const negate = () => {
      let count = 1;
      while (peek() === "!" && (peek(2) !== "(" || peek(3) === "?")) {
        advance();
        state.start++;
        count++;
      }
      if (count % 2 === 0) {
        return false;
      }
      state.negated = true;
      state.start++;
      return true;
    };
    const increment = (type) => {
      state[type]++;
      stack.push(type);
    };
    const decrement = (type) => {
      state[type]--;
      stack.pop();
    };
    const push = (tok) => {
      if (prev.type === "globstar") {
        const isBrace = state.braces > 0 && (tok.type === "comma" || tok.type === "brace");
        const isExtglob = tok.extglob === true || extglobs.length && (tok.type === "pipe" || tok.type === "paren");
        if (tok.type !== "slash" && tok.type !== "paren" && !isBrace && !isExtglob) {
          state.output = state.output.slice(0, -prev.output.length);
          prev.type = "star";
          prev.value = "*";
          prev.output = star;
          state.output += prev.output;
        }
      }
      if (extglobs.length && tok.type !== "paren" && !EXTGLOB_CHARS[tok.value]) {
        extglobs[extglobs.length - 1].inner += tok.value;
      }
      if (tok.value || tok.output)
        append(tok);
      if (prev && prev.type === "text" && tok.type === "text") {
        prev.value += tok.value;
        prev.output = (prev.output || "") + tok.value;
        return;
      }
      tok.prev = prev;
      tokens.push(tok);
      prev = tok;
    };
    const extglobOpen = (type, value2) => {
      const token2 = {...EXTGLOB_CHARS[value2], conditions: 1, inner: ""};
      token2.prev = prev;
      token2.parens = state.parens;
      token2.output = state.output;
      const output = (opts.capture ? "(" : "") + token2.open;
      increment("parens");
      push({type, value: value2, output: state.output ? "" : ONE_CHAR});
      push({type: "paren", extglob: true, value: advance(), output});
      extglobs.push(token2);
    };
    const extglobClose = (token2) => {
      let output = token2.close + (opts.capture ? ")" : "");
      if (token2.type === "negate") {
        let extglobStar = star;
        if (token2.inner && token2.inner.length > 1 && token2.inner.includes("/")) {
          extglobStar = globstar(opts);
        }
        if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
          output = token2.close = `)$))${extglobStar}`;
        }
        if (token2.prev.type === "bos" && eos()) {
          state.negatedExtglob = true;
        }
      }
      push({type: "paren", extglob: true, value, output});
      decrement("parens");
    };
    if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
      let backslashes = false;
      let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first, rest, index) => {
        if (first === "\\") {
          backslashes = true;
          return m;
        }
        if (first === "?") {
          if (esc) {
            return esc + first + (rest ? QMARK.repeat(rest.length) : "");
          }
          if (index === 0) {
            return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : "");
          }
          return QMARK.repeat(chars.length);
        }
        if (first === ".") {
          return DOT_LITERAL.repeat(chars.length);
        }
        if (first === "*") {
          if (esc) {
            return esc + first + (rest ? star : "");
          }
          return star;
        }
        return esc ? m : `\\${m}`;
      });
      if (backslashes === true) {
        if (opts.unescape === true) {
          output = output.replace(/\\/g, "");
        } else {
          output = output.replace(/\\+/g, (m) => {
            return m.length % 2 === 0 ? "\\\\" : m ? "\\" : "";
          });
        }
      }
      if (output === input && opts.contains === true) {
        state.output = input;
        return state;
      }
      state.output = utils8.wrapOutput(output, state, options);
      return state;
    }
    while (!eos()) {
      value = advance();
      if (value === "\0") {
        continue;
      }
      if (value === "\\") {
        const next = peek();
        if (next === "/" && opts.bash !== true) {
          continue;
        }
        if (next === "." || next === ";") {
          continue;
        }
        if (!next) {
          value += "\\";
          push({type: "text", value});
          continue;
        }
        const match = /^\\+/.exec(remaining());
        let slashes = 0;
        if (match && match[0].length > 2) {
          slashes = match[0].length;
          state.index += slashes;
          if (slashes % 2 !== 0) {
            value += "\\";
          }
        }
        if (opts.unescape === true) {
          value = advance() || "";
        } else {
          value += advance() || "";
        }
        if (state.brackets === 0) {
          push({type: "text", value});
          continue;
        }
      }
      if (state.brackets > 0 && (value !== "]" || prev.value === "[" || prev.value === "[^")) {
        if (opts.posix !== false && value === ":") {
          const inner = prev.value.slice(1);
          if (inner.includes("[")) {
            prev.posix = true;
            if (inner.includes(":")) {
              const idx = prev.value.lastIndexOf("[");
              const pre = prev.value.slice(0, idx);
              const rest2 = prev.value.slice(idx + 2);
              const posix = POSIX_REGEX_SOURCE[rest2];
              if (posix) {
                prev.value = pre + posix;
                state.backtrack = true;
                advance();
                if (!bos.output && tokens.indexOf(prev) === 1) {
                  bos.output = ONE_CHAR;
                }
                continue;
              }
            }
          }
        }
        if (value === "[" && peek() !== ":" || value === "-" && peek() === "]") {
          value = `\\${value}`;
        }
        if (value === "]" && (prev.value === "[" || prev.value === "[^")) {
          value = `\\${value}`;
        }
        if (opts.posix === true && value === "!" && prev.value === "[") {
          value = "^";
        }
        prev.value += value;
        append({value});
        continue;
      }
      if (state.quotes === 1 && value !== '"') {
        value = utils8.escapeRegex(value);
        prev.value += value;
        append({value});
        continue;
      }
      if (value === '"') {
        state.quotes = state.quotes === 1 ? 0 : 1;
        if (opts.keepQuotes === true) {
          push({type: "text", value});
        }
        continue;
      }
      if (value === "(") {
        increment("parens");
        push({type: "paren", value});
        continue;
      }
      if (value === ")") {
        if (state.parens === 0 && opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError("opening", "("));
        }
        const extglob = extglobs[extglobs.length - 1];
        if (extglob && state.parens === extglob.parens + 1) {
          extglobClose(extglobs.pop());
          continue;
        }
        push({type: "paren", value, output: state.parens ? ")" : "\\)"});
        decrement("parens");
        continue;
      }
      if (value === "[") {
        if (opts.nobracket === true || !remaining().includes("]")) {
          if (opts.nobracket !== true && opts.strictBrackets === true) {
            throw new SyntaxError(syntaxError("closing", "]"));
          }
          value = `\\${value}`;
        } else {
          increment("brackets");
        }
        push({type: "bracket", value});
        continue;
      }
      if (value === "]") {
        if (opts.nobracket === true || prev && prev.type === "bracket" && prev.value.length === 1) {
          push({type: "text", value, output: `\\${value}`});
          continue;
        }
        if (state.brackets === 0) {
          if (opts.strictBrackets === true) {
            throw new SyntaxError(syntaxError("opening", "["));
          }
          push({type: "text", value, output: `\\${value}`});
          continue;
        }
        decrement("brackets");
        const prevValue = prev.value.slice(1);
        if (prev.posix !== true && prevValue[0] === "^" && !prevValue.includes("/")) {
          value = `/${value}`;
        }
        prev.value += value;
        append({value});
        if (opts.literalBrackets === false || utils8.hasRegexChars(prevValue)) {
          continue;
        }
        const escaped = utils8.escapeRegex(prev.value);
        state.output = state.output.slice(0, -prev.value.length);
        if (opts.literalBrackets === true) {
          state.output += escaped;
          prev.value = escaped;
          continue;
        }
        prev.value = `(${capture}${escaped}|${prev.value})`;
        state.output += prev.value;
        continue;
      }
      if (value === "{" && opts.nobrace !== true) {
        increment("braces");
        const open = {
          type: "brace",
          value,
          output: "(",
          outputIndex: state.output.length,
          tokensIndex: state.tokens.length
        };
        braces.push(open);
        push(open);
        continue;
      }
      if (value === "}") {
        const brace = braces[braces.length - 1];
        if (opts.nobrace === true || !brace) {
          push({type: "text", value, output: value});
          continue;
        }
        let output = ")";
        if (brace.dots === true) {
          const arr = tokens.slice();
          const range = [];
          for (let i = arr.length - 1; i >= 0; i--) {
            tokens.pop();
            if (arr[i].type === "brace") {
              break;
            }
            if (arr[i].type !== "dots") {
              range.unshift(arr[i].value);
            }
          }
          output = expandRange(range, opts);
          state.backtrack = true;
        }
        if (brace.comma !== true && brace.dots !== true) {
          const out = state.output.slice(0, brace.outputIndex);
          const toks = state.tokens.slice(brace.tokensIndex);
          brace.value = brace.output = "\\{";
          value = output = "\\}";
          state.output = out;
          for (const t of toks) {
            state.output += t.output || t.value;
          }
        }
        push({type: "brace", value, output});
        decrement("braces");
        braces.pop();
        continue;
      }
      if (value === "|") {
        if (extglobs.length > 0) {
          extglobs[extglobs.length - 1].conditions++;
        }
        push({type: "text", value});
        continue;
      }
      if (value === ",") {
        let output = value;
        const brace = braces[braces.length - 1];
        if (brace && stack[stack.length - 1] === "braces") {
          brace.comma = true;
          output = "|";
        }
        push({type: "comma", value, output});
        continue;
      }
      if (value === "/") {
        if (prev.type === "dot" && state.index === state.start + 1) {
          state.start = state.index + 1;
          state.consumed = "";
          state.output = "";
          tokens.pop();
          prev = bos;
          continue;
        }
        push({type: "slash", value, output: SLASH_LITERAL});
        continue;
      }
      if (value === ".") {
        if (state.braces > 0 && prev.type === "dot") {
          if (prev.value === ".")
            prev.output = DOT_LITERAL;
          const brace = braces[braces.length - 1];
          prev.type = "dots";
          prev.output += value;
          prev.value += value;
          brace.dots = true;
          continue;
        }
        if (state.braces + state.parens === 0 && prev.type !== "bos" && prev.type !== "slash") {
          push({type: "text", value, output: DOT_LITERAL});
          continue;
        }
        push({type: "dot", value, output: DOT_LITERAL});
        continue;
      }
      if (value === "?") {
        const isGroup = prev && prev.value === "(";
        if (!isGroup && opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
          extglobOpen("qmark", value);
          continue;
        }
        if (prev && prev.type === "paren") {
          const next = peek();
          let output = value;
          if (next === "<" && !utils8.supportsLookbehinds()) {
            throw new Error("Node.js v10 or higher is required for regex lookbehinds");
          }
          if (prev.value === "(" && !/[!=<:]/.test(next) || next === "<" && !/<([!=]|\w+>)/.test(remaining())) {
            output = `\\${value}`;
          }
          push({type: "text", value, output});
          continue;
        }
        if (opts.dot !== true && (prev.type === "slash" || prev.type === "bos")) {
          push({type: "qmark", value, output: QMARK_NO_DOT});
          continue;
        }
        push({type: "qmark", value, output: QMARK});
        continue;
      }
      if (value === "!") {
        if (opts.noextglob !== true && peek() === "(") {
          if (peek(2) !== "?" || !/[!=<:]/.test(peek(3))) {
            extglobOpen("negate", value);
            continue;
          }
        }
        if (opts.nonegate !== true && state.index === 0) {
          negate();
          continue;
        }
      }
      if (value === "+") {
        if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
          extglobOpen("plus", value);
          continue;
        }
        if (prev && prev.value === "(" || opts.regex === false) {
          push({type: "plus", value, output: PLUS_LITERAL});
          continue;
        }
        if (prev && (prev.type === "bracket" || prev.type === "paren" || prev.type === "brace") || state.parens > 0) {
          push({type: "plus", value});
          continue;
        }
        push({type: "plus", value: PLUS_LITERAL});
        continue;
      }
      if (value === "@") {
        if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
          push({type: "at", extglob: true, value, output: ""});
          continue;
        }
        push({type: "text", value});
        continue;
      }
      if (value !== "*") {
        if (value === "$" || value === "^") {
          value = `\\${value}`;
        }
        const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
        if (match) {
          value += match[0];
          state.index += match[0].length;
        }
        push({type: "text", value});
        continue;
      }
      if (prev && (prev.type === "globstar" || prev.star === true)) {
        prev.type = "star";
        prev.star = true;
        prev.value += value;
        prev.output = star;
        state.backtrack = true;
        state.globstar = true;
        consume(value);
        continue;
      }
      let rest = remaining();
      if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
        extglobOpen("star", value);
        continue;
      }
      if (prev.type === "star") {
        if (opts.noglobstar === true) {
          consume(value);
          continue;
        }
        const prior = prev.prev;
        const before = prior.prev;
        const isStart = prior.type === "slash" || prior.type === "bos";
        const afterStar = before && (before.type === "star" || before.type === "globstar");
        if (opts.bash === true && (!isStart || rest[0] && rest[0] !== "/")) {
          push({type: "star", value, output: ""});
          continue;
        }
        const isBrace = state.braces > 0 && (prior.type === "comma" || prior.type === "brace");
        const isExtglob = extglobs.length && (prior.type === "pipe" || prior.type === "paren");
        if (!isStart && prior.type !== "paren" && !isBrace && !isExtglob) {
          push({type: "star", value, output: ""});
          continue;
        }
        while (rest.slice(0, 3) === "/**") {
          const after = input[state.index + 4];
          if (after && after !== "/") {
            break;
          }
          rest = rest.slice(3);
          consume("/**", 3);
        }
        if (prior.type === "bos" && eos()) {
          prev.type = "globstar";
          prev.value += value;
          prev.output = globstar(opts);
          state.output = prev.output;
          state.globstar = true;
          consume(value);
          continue;
        }
        if (prior.type === "slash" && prior.prev.type !== "bos" && !afterStar && eos()) {
          state.output = state.output.slice(0, -(prior.output + prev.output).length);
          prior.output = `(?:${prior.output}`;
          prev.type = "globstar";
          prev.output = globstar(opts) + (opts.strictSlashes ? ")" : "|$)");
          prev.value += value;
          state.globstar = true;
          state.output += prior.output + prev.output;
          consume(value);
          continue;
        }
        if (prior.type === "slash" && prior.prev.type !== "bos" && rest[0] === "/") {
          const end = rest[1] !== void 0 ? "|$" : "";
          state.output = state.output.slice(0, -(prior.output + prev.output).length);
          prior.output = `(?:${prior.output}`;
          prev.type = "globstar";
          prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
          prev.value += value;
          state.output += prior.output + prev.output;
          state.globstar = true;
          consume(value + advance());
          push({type: "slash", value: "/", output: ""});
          continue;
        }
        if (prior.type === "bos" && rest[0] === "/") {
          prev.type = "globstar";
          prev.value += value;
          prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
          state.output = prev.output;
          state.globstar = true;
          consume(value + advance());
          push({type: "slash", value: "/", output: ""});
          continue;
        }
        state.output = state.output.slice(0, -prev.output.length);
        prev.type = "globstar";
        prev.output = globstar(opts);
        prev.value += value;
        state.output += prev.output;
        state.globstar = true;
        consume(value);
        continue;
      }
      const token2 = {type: "star", value, output: star};
      if (opts.bash === true) {
        token2.output = ".*?";
        if (prev.type === "bos" || prev.type === "slash") {
          token2.output = nodot + token2.output;
        }
        push(token2);
        continue;
      }
      if (prev && (prev.type === "bracket" || prev.type === "paren") && opts.regex === true) {
        token2.output = value;
        push(token2);
        continue;
      }
      if (state.index === state.start || prev.type === "slash" || prev.type === "dot") {
        if (prev.type === "dot") {
          state.output += NO_DOT_SLASH;
          prev.output += NO_DOT_SLASH;
        } else if (opts.dot === true) {
          state.output += NO_DOTS_SLASH;
          prev.output += NO_DOTS_SLASH;
        } else {
          state.output += nodot;
          prev.output += nodot;
        }
        if (peek() !== "*") {
          state.output += ONE_CHAR;
          prev.output += ONE_CHAR;
        }
      }
      push(token2);
    }
    while (state.brackets > 0) {
      if (opts.strictBrackets === true)
        throw new SyntaxError(syntaxError("closing", "]"));
      state.output = utils8.escapeLast(state.output, "[");
      decrement("brackets");
    }
    while (state.parens > 0) {
      if (opts.strictBrackets === true)
        throw new SyntaxError(syntaxError("closing", ")"));
      state.output = utils8.escapeLast(state.output, "(");
      decrement("parens");
    }
    while (state.braces > 0) {
      if (opts.strictBrackets === true)
        throw new SyntaxError(syntaxError("closing", "}"));
      state.output = utils8.escapeLast(state.output, "{");
      decrement("braces");
    }
    if (opts.strictSlashes !== true && (prev.type === "star" || prev.type === "bracket")) {
      push({type: "maybe_slash", value: "", output: `${SLASH_LITERAL}?`});
    }
    if (state.backtrack === true) {
      state.output = "";
      for (const token2 of state.tokens) {
        state.output += token2.output != null ? token2.output : token2.value;
        if (token2.suffix) {
          state.output += token2.suffix;
        }
      }
    }
    return state;
  };
  parse.fastpaths = (input, options) => {
    const opts = {...options};
    const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
    const len = input.length;
    if (len > max) {
      throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
    }
    input = REPLACEMENTS[input] || input;
    const win32 = utils8.isWindows(options);
    const {
      DOT_LITERAL,
      SLASH_LITERAL,
      ONE_CHAR,
      DOTS_SLASH,
      NO_DOT,
      NO_DOTS,
      NO_DOTS_SLASH,
      STAR,
      START_ANCHOR
    } = constants.globChars(win32);
    const nodot = opts.dot ? NO_DOTS : NO_DOT;
    const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
    const capture = opts.capture ? "" : "?:";
    const state = {negated: false, prefix: ""};
    let star = opts.bash === true ? ".*?" : STAR;
    if (opts.capture) {
      star = `(${star})`;
    }
    const globstar = (opts2) => {
      if (opts2.noglobstar === true)
        return star;
      return `(${capture}(?:(?!${START_ANCHOR}${opts2.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
    };
    const create = (str) => {
      switch (str) {
        case "*":
          return `${nodot}${ONE_CHAR}${star}`;
        case ".*":
          return `${DOT_LITERAL}${ONE_CHAR}${star}`;
        case "*.*":
          return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
        case "*/*":
          return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;
        case "**":
          return nodot + globstar(opts);
        case "**/*":
          return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;
        case "**/*.*":
          return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
        case "**/.*":
          return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;
        default: {
          const match = /^(.*?)\.(\w+)$/.exec(str);
          if (!match)
            return;
          const source2 = create(match[1]);
          if (!source2)
            return;
          return source2 + DOT_LITERAL + match[2];
        }
      }
    };
    const output = utils8.removePrefix(input, state);
    let source = create(output);
    if (source && opts.strictSlashes !== true) {
      source += `${SLASH_LITERAL}?`;
    }
    return source;
  };
  module2.exports = parse;
});

// node_modules/picomatch/lib/picomatch.js
var require_picomatch = __commonJS((exports2, module2) => {
  "use strict";
  var path6 = require("path");
  var scan = require_scan();
  var parse = require_parse();
  var utils8 = require_utils2();
  var constants = require_constants();
  var isObject = (val) => val && typeof val === "object" && !Array.isArray(val);
  var picomatch = (glob, options, returnState = false) => {
    if (Array.isArray(glob)) {
      const fns = glob.map((input) => picomatch(input, options, returnState));
      const arrayMatcher = (str) => {
        for (const isMatch of fns) {
          const state2 = isMatch(str);
          if (state2)
            return state2;
        }
        return false;
      };
      return arrayMatcher;
    }
    const isState = isObject(glob) && glob.tokens && glob.input;
    if (glob === "" || typeof glob !== "string" && !isState) {
      throw new TypeError("Expected pattern to be a non-empty string");
    }
    const opts = options || {};
    const posix = utils8.isWindows(options);
    const regex = isState ? picomatch.compileRe(glob, options) : picomatch.makeRe(glob, options, false, true);
    const state = regex.state;
    delete regex.state;
    let isIgnored = () => false;
    if (opts.ignore) {
      const ignoreOpts = {...options, ignore: null, onMatch: null, onResult: null};
      isIgnored = picomatch(opts.ignore, ignoreOpts, returnState);
    }
    const matcher = (input, returnObject = false) => {
      const {isMatch, match, output} = picomatch.test(input, regex, options, {glob, posix});
      const result = {glob, state, regex, posix, input, output, match, isMatch};
      if (typeof opts.onResult === "function") {
        opts.onResult(result);
      }
      if (isMatch === false) {
        result.isMatch = false;
        return returnObject ? result : false;
      }
      if (isIgnored(input)) {
        if (typeof opts.onIgnore === "function") {
          opts.onIgnore(result);
        }
        result.isMatch = false;
        return returnObject ? result : false;
      }
      if (typeof opts.onMatch === "function") {
        opts.onMatch(result);
      }
      return returnObject ? result : true;
    };
    if (returnState) {
      matcher.state = state;
    }
    return matcher;
  };
  picomatch.test = (input, regex, options, {glob, posix} = {}) => {
    if (typeof input !== "string") {
      throw new TypeError("Expected input to be a string");
    }
    if (input === "") {
      return {isMatch: false, output: ""};
    }
    const opts = options || {};
    const format2 = opts.format || (posix ? utils8.toPosixSlashes : null);
    let match = input === glob;
    let output = match && format2 ? format2(input) : input;
    if (match === false) {
      output = format2 ? format2(input) : input;
      match = output === glob;
    }
    if (match === false || opts.capture === true) {
      if (opts.matchBase === true || opts.basename === true) {
        match = picomatch.matchBase(input, regex, options, posix);
      } else {
        match = regex.exec(output);
      }
    }
    return {isMatch: Boolean(match), match, output};
  };
  picomatch.matchBase = (input, glob, options, posix = utils8.isWindows(options)) => {
    const regex = glob instanceof RegExp ? glob : picomatch.makeRe(glob, options);
    return regex.test(path6.basename(input));
  };
  picomatch.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);
  picomatch.parse = (pattern, options) => {
    if (Array.isArray(pattern))
      return pattern.map((p) => picomatch.parse(p, options));
    return parse(pattern, {...options, fastpaths: false});
  };
  picomatch.scan = (input, options) => scan(input, options);
  picomatch.compileRe = (parsed, options, returnOutput = false, returnState = false) => {
    if (returnOutput === true) {
      return parsed.output;
    }
    const opts = options || {};
    const prepend = opts.contains ? "" : "^";
    const append = opts.contains ? "" : "$";
    let source = `${prepend}(?:${parsed.output})${append}`;
    if (parsed && parsed.negated === true) {
      source = `^(?!${source}).*$`;
    }
    const regex = picomatch.toRegex(source, options);
    if (returnState === true) {
      regex.state = parsed;
    }
    return regex;
  };
  picomatch.makeRe = (input, options, returnOutput = false, returnState = false) => {
    if (!input || typeof input !== "string") {
      throw new TypeError("Expected a non-empty string");
    }
    const opts = options || {};
    let parsed = {negated: false, fastpaths: true};
    let prefix = "";
    let output;
    if (input.startsWith("./")) {
      input = input.slice(2);
      prefix = parsed.prefix = "./";
    }
    if (opts.fastpaths !== false && (input[0] === "." || input[0] === "*")) {
      output = parse.fastpaths(input, options);
    }
    if (output === void 0) {
      parsed = parse(input, options);
      parsed.prefix = prefix + (parsed.prefix || "");
    } else {
      parsed.output = output;
    }
    return picomatch.compileRe(parsed, options, returnOutput, returnState);
  };
  picomatch.toRegex = (source, options) => {
    try {
      const opts = options || {};
      return new RegExp(source, opts.flags || (opts.nocase ? "i" : ""));
    } catch (err) {
      if (options && options.debug === true)
        throw err;
      return /$^/;
    }
  };
  picomatch.constants = constants;
  module2.exports = picomatch;
});

// node_modules/picomatch/index.js
var require_picomatch2 = __commonJS((exports2, module2) => {
  "use strict";
  module2.exports = require_picomatch();
});

// vendor/fdir/builder/index.js
var require_builder = __commonJS((exports2, module2) => {
  var APIBuilder = require_apiBuilder();
  var pm = require_picomatch2();
  var globCache = {};
  function Builder() {
    this.maxDepth = Infinity;
    this.suppressErrors = true;
    this.filters = [];
  }
  Builder.prototype.crawl = function(path6) {
    return new APIBuilder(path6, this);
  };
  Builder.prototype.crawlWithOptions = function(path6, options) {
    if (!options.maxDepth)
      options.maxDepth = Infinity;
    options.groupVar = options.group;
    options.onlyCountsVar = options.onlyCounts;
    options.excludeFn = options.exclude;
    options.filters = options.filters || [];
    return new APIBuilder(path6, options);
  };
  Builder.prototype.withBasePath = function() {
    this.includeBasePath = true;
    return this;
  };
  Builder.prototype.withDirs = function() {
    this.includeDirs = true;
    return this;
  };
  Builder.prototype.withMaxDepth = function(depth) {
    this.maxDepth = depth;
    return this;
  };
  Builder.prototype.withFullPaths = function() {
    this.resolvePaths = true;
    this.includeBasePath = true;
    return this;
  };
  Builder.prototype.withErrors = function() {
    this.suppressErrors = false;
    return this;
  };
  Builder.prototype.group = function() {
    this.groupVar = true;
    return this;
  };
  Builder.prototype.normalize = function() {
    this.normalizePath = true;
    return this;
  };
  Builder.prototype.filter = function(filterFn) {
    this.filters.push(filterFn);
    return this;
  };
  Builder.prototype.glob = function(...patterns) {
    if (!pm) {
      throw new Error(`Please install picomatch: "npm i picomatch" to use glob matching.`);
    }
    var isMatch = globCache[patterns.join()];
    if (!isMatch) {
      isMatch = pm(patterns, {dot: true});
      globCache[patterns.join()] = isMatch;
    }
    this.filters.push((path6) => isMatch(path6));
    return this;
  };
  Builder.prototype.exclude = function(excludeFn) {
    this.excludeFn = excludeFn;
    return this;
  };
  Builder.prototype.onlyCounts = function() {
    this.onlyCountsVar = true;
    return this;
  };
  module2.exports = Builder;
});

// vendor/fdir/index.js
var require_fdir = __commonJS((exports2, module2) => {
  module2.exports.fdir = require_builder();
});

// node_modules/braces/lib/utils.js
var require_utils3 = __commonJS((exports2) => {
  "use strict";
  exports2.isInteger = (num) => {
    if (typeof num === "number") {
      return Number.isInteger(num);
    }
    if (typeof num === "string" && num.trim() !== "") {
      return Number.isInteger(Number(num));
    }
    return false;
  };
  exports2.find = (node, type) => node.nodes.find((node2) => node2.type === type);
  exports2.exceedsLimit = (min, max, step = 1, limit) => {
    if (limit === false)
      return false;
    if (!exports2.isInteger(min) || !exports2.isInteger(max))
      return false;
    return (Number(max) - Number(min)) / Number(step) >= limit;
  };
  exports2.escapeNode = (block, n = 0, type) => {
    let node = block.nodes[n];
    if (!node)
      return;
    if (type && node.type === type || node.type === "open" || node.type === "close") {
      if (node.escaped !== true) {
        node.value = "\\" + node.value;
        node.escaped = true;
      }
    }
  };
  exports2.encloseBrace = (node) => {
    if (node.type !== "brace")
      return false;
    if (node.commas >> 0 + node.ranges >> 0 === 0) {
      node.invalid = true;
      return true;
    }
    return false;
  };
  exports2.isInvalidBrace = (block) => {
    if (block.type !== "brace")
      return false;
    if (block.invalid === true || block.dollar)
      return true;
    if (block.commas >> 0 + block.ranges >> 0 === 0) {
      block.invalid = true;
      return true;
    }
    if (block.open !== true || block.close !== true) {
      block.invalid = true;
      return true;
    }
    return false;
  };
  exports2.isOpenOrClose = (node) => {
    if (node.type === "open" || node.type === "close") {
      return true;
    }
    return node.open === true || node.close === true;
  };
  exports2.reduce = (nodes) => nodes.reduce((acc, node) => {
    if (node.type === "text")
      acc.push(node.value);
    if (node.type === "range")
      node.type = "text";
    return acc;
  }, []);
  exports2.flatten = (...args) => {
    const result = [];
    const flat = (arr) => {
      for (let i = 0; i < arr.length; i++) {
        let ele = arr[i];
        Array.isArray(ele) ? flat(ele, result) : ele !== void 0 && result.push(ele);
      }
      return result;
    };
    flat(args);
    return result;
  };
});

// node_modules/braces/lib/stringify.js
var require_stringify = __commonJS((exports2, module2) => {
  "use strict";
  var utils8 = require_utils3();
  module2.exports = (ast, options = {}) => {
    let stringify = (node, parent = {}) => {
      let invalidBlock = options.escapeInvalid && utils8.isInvalidBrace(parent);
      let invalidNode = node.invalid === true && options.escapeInvalid === true;
      let output = "";
      if (node.value) {
        if ((invalidBlock || invalidNode) && utils8.isOpenOrClose(node)) {
          return "\\" + node.value;
        }
        return node.value;
      }
      if (node.value) {
        return node.value;
      }
      if (node.nodes) {
        for (let child of node.nodes) {
          output += stringify(child);
        }
      }
      return output;
    };
    return stringify(ast);
  };
});

// node_modules/is-number/index.js
var require_is_number = __commonJS((exports2, module2) => {
  /*!
   * is-number <https://github.com/jonschlinkert/is-number>
   *
   * Copyright (c) 2014-present, Jon Schlinkert.
   * Released under the MIT License.
   */
  "use strict";
  module2.exports = function(num) {
    if (typeof num === "number") {
      return num - num === 0;
    }
    if (typeof num === "string" && num.trim() !== "") {
      return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
    }
    return false;
  };
});

// node_modules/to-regex-range/index.js
var require_to_regex_range = __commonJS((exports2, module2) => {
  /*!
   * to-regex-range <https://github.com/micromatch/to-regex-range>
   *
   * Copyright (c) 2015-present, Jon Schlinkert.
   * Released under the MIT License.
   */
  "use strict";
  var isNumber = require_is_number();
  var toRegexRange = (min, max, options) => {
    if (isNumber(min) === false) {
      throw new TypeError("toRegexRange: expected the first argument to be a number");
    }
    if (max === void 0 || min === max) {
      return String(min);
    }
    if (isNumber(max) === false) {
      throw new TypeError("toRegexRange: expected the second argument to be a number.");
    }
    let opts = {relaxZeros: true, ...options};
    if (typeof opts.strictZeros === "boolean") {
      opts.relaxZeros = opts.strictZeros === false;
    }
    let relax = String(opts.relaxZeros);
    let shorthand = String(opts.shorthand);
    let capture = String(opts.capture);
    let wrap = String(opts.wrap);
    let cacheKey = min + ":" + max + "=" + relax + shorthand + capture + wrap;
    if (toRegexRange.cache.hasOwnProperty(cacheKey)) {
      return toRegexRange.cache[cacheKey].result;
    }
    let a = Math.min(min, max);
    let b = Math.max(min, max);
    if (Math.abs(a - b) === 1) {
      let result = min + "|" + max;
      if (opts.capture) {
        return `(${result})`;
      }
      if (opts.wrap === false) {
        return result;
      }
      return `(?:${result})`;
    }
    let isPadded = hasPadding(min) || hasPadding(max);
    let state = {min, max, a, b};
    let positives = [];
    let negatives = [];
    if (isPadded) {
      state.isPadded = isPadded;
      state.maxLen = String(state.max).length;
    }
    if (a < 0) {
      let newMin = b < 0 ? Math.abs(b) : 1;
      negatives = splitToPatterns(newMin, Math.abs(a), state, opts);
      a = state.a = 0;
    }
    if (b >= 0) {
      positives = splitToPatterns(a, b, state, opts);
    }
    state.negatives = negatives;
    state.positives = positives;
    state.result = collatePatterns(negatives, positives, opts);
    if (opts.capture === true) {
      state.result = `(${state.result})`;
    } else if (opts.wrap !== false && positives.length + negatives.length > 1) {
      state.result = `(?:${state.result})`;
    }
    toRegexRange.cache[cacheKey] = state;
    return state.result;
  };
  function collatePatterns(neg, pos, options) {
    let onlyNegative = filterPatterns(neg, pos, "-", false, options) || [];
    let onlyPositive = filterPatterns(pos, neg, "", false, options) || [];
    let intersected = filterPatterns(neg, pos, "-?", true, options) || [];
    let subpatterns = onlyNegative.concat(intersected).concat(onlyPositive);
    return subpatterns.join("|");
  }
  function splitToRanges(min, max) {
    let nines = 1;
    let zeros = 1;
    let stop = countNines(min, nines);
    let stops = new Set([max]);
    while (min <= stop && stop <= max) {
      stops.add(stop);
      nines += 1;
      stop = countNines(min, nines);
    }
    stop = countZeros(max + 1, zeros) - 1;
    while (min < stop && stop <= max) {
      stops.add(stop);
      zeros += 1;
      stop = countZeros(max + 1, zeros) - 1;
    }
    stops = [...stops];
    stops.sort(compare);
    return stops;
  }
  function rangeToPattern(start, stop, options) {
    if (start === stop) {
      return {pattern: start, count: [], digits: 0};
    }
    let zipped = zip(start, stop);
    let digits = zipped.length;
    let pattern = "";
    let count = 0;
    for (let i = 0; i < digits; i++) {
      let [startDigit, stopDigit] = zipped[i];
      if (startDigit === stopDigit) {
        pattern += startDigit;
      } else if (startDigit !== "0" || stopDigit !== "9") {
        pattern += toCharacterClass(startDigit, stopDigit, options);
      } else {
        count++;
      }
    }
    if (count) {
      pattern += options.shorthand === true ? "\\d" : "[0-9]";
    }
    return {pattern, count: [count], digits};
  }
  function splitToPatterns(min, max, tok, options) {
    let ranges = splitToRanges(min, max);
    let tokens = [];
    let start = min;
    let prev;
    for (let i = 0; i < ranges.length; i++) {
      let max2 = ranges[i];
      let obj = rangeToPattern(String(start), String(max2), options);
      let zeros = "";
      if (!tok.isPadded && prev && prev.pattern === obj.pattern) {
        if (prev.count.length > 1) {
          prev.count.pop();
        }
        prev.count.push(obj.count[0]);
        prev.string = prev.pattern + toQuantifier(prev.count);
        start = max2 + 1;
        continue;
      }
      if (tok.isPadded) {
        zeros = padZeros(max2, tok, options);
      }
      obj.string = zeros + obj.pattern + toQuantifier(obj.count);
      tokens.push(obj);
      start = max2 + 1;
      prev = obj;
    }
    return tokens;
  }
  function filterPatterns(arr, comparison, prefix, intersection, options) {
    let result = [];
    for (let ele of arr) {
      let {string: string2} = ele;
      if (!intersection && !contains(comparison, "string", string2)) {
        result.push(prefix + string2);
      }
      if (intersection && contains(comparison, "string", string2)) {
        result.push(prefix + string2);
      }
    }
    return result;
  }
  function zip(a, b) {
    let arr = [];
    for (let i = 0; i < a.length; i++)
      arr.push([a[i], b[i]]);
    return arr;
  }
  function compare(a, b) {
    return a > b ? 1 : b > a ? -1 : 0;
  }
  function contains(arr, key, val) {
    return arr.some((ele) => ele[key] === val);
  }
  function countNines(min, len) {
    return Number(String(min).slice(0, -len) + "9".repeat(len));
  }
  function countZeros(integer, zeros) {
    return integer - integer % Math.pow(10, zeros);
  }
  function toQuantifier(digits) {
    let [start = 0, stop = ""] = digits;
    if (stop || start > 1) {
      return `{${start + (stop ? "," + stop : "")}}`;
    }
    return "";
  }
  function toCharacterClass(a, b, options) {
    return `[${a}${b - a === 1 ? "" : "-"}${b}]`;
  }
  function hasPadding(str) {
    return /^-?(0+)\d/.test(str);
  }
  function padZeros(value, tok, options) {
    if (!tok.isPadded) {
      return value;
    }
    let diff = Math.abs(tok.maxLen - String(value).length);
    let relax = options.relaxZeros !== false;
    switch (diff) {
      case 0:
        return "";
      case 1:
        return relax ? "0?" : "0";
      case 2:
        return relax ? "0{0,2}" : "00";
      default: {
        return relax ? `0{0,${diff}}` : `0{${diff}}`;
      }
    }
  }
  toRegexRange.cache = {};
  toRegexRange.clearCache = () => toRegexRange.cache = {};
  module2.exports = toRegexRange;
});

// node_modules/fill-range/index.js
var require_fill_range = __commonJS((exports2, module2) => {
  /*!
   * fill-range <https://github.com/jonschlinkert/fill-range>
   *
   * Copyright (c) 2014-present, Jon Schlinkert.
   * Licensed under the MIT License.
   */
  "use strict";
  var util2 = require("util");
  var toRegexRange = require_to_regex_range();
  var isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
  var transform = (toNumber) => {
    return (value) => toNumber === true ? Number(value) : String(value);
  };
  var isValidValue = (value) => {
    return typeof value === "number" || typeof value === "string" && value !== "";
  };
  var isNumber = (num) => Number.isInteger(+num);
  var zeros = (input) => {
    let value = `${input}`;
    let index = -1;
    if (value[0] === "-")
      value = value.slice(1);
    if (value === "0")
      return false;
    while (value[++index] === "0")
      ;
    return index > 0;
  };
  var stringify = (start, end, options) => {
    if (typeof start === "string" || typeof end === "string") {
      return true;
    }
    return options.stringify === true;
  };
  var pad = (input, maxLength, toNumber) => {
    if (maxLength > 0) {
      let dash = input[0] === "-" ? "-" : "";
      if (dash)
        input = input.slice(1);
      input = dash + input.padStart(dash ? maxLength - 1 : maxLength, "0");
    }
    if (toNumber === false) {
      return String(input);
    }
    return input;
  };
  var toMaxLen = (input, maxLength) => {
    let negative = input[0] === "-" ? "-" : "";
    if (negative) {
      input = input.slice(1);
      maxLength--;
    }
    while (input.length < maxLength)
      input = "0" + input;
    return negative ? "-" + input : input;
  };
  var toSequence = (parts, options) => {
    parts.negatives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
    parts.positives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
    let prefix = options.capture ? "" : "?:";
    let positives = "";
    let negatives = "";
    let result;
    if (parts.positives.length) {
      positives = parts.positives.join("|");
    }
    if (parts.negatives.length) {
      negatives = `-(${prefix}${parts.negatives.join("|")})`;
    }
    if (positives && negatives) {
      result = `${positives}|${negatives}`;
    } else {
      result = positives || negatives;
    }
    if (options.wrap) {
      return `(${prefix}${result})`;
    }
    return result;
  };
  var toRange = (a, b, isNumbers, options) => {
    if (isNumbers) {
      return toRegexRange(a, b, {wrap: false, ...options});
    }
    let start = String.fromCharCode(a);
    if (a === b)
      return start;
    let stop = String.fromCharCode(b);
    return `[${start}-${stop}]`;
  };
  var toRegex = (start, end, options) => {
    if (Array.isArray(start)) {
      let wrap = options.wrap === true;
      let prefix = options.capture ? "" : "?:";
      return wrap ? `(${prefix}${start.join("|")})` : start.join("|");
    }
    return toRegexRange(start, end, options);
  };
  var rangeError = (...args) => {
    return new RangeError("Invalid range arguments: " + util2.inspect(...args));
  };
  var invalidRange = (start, end, options) => {
    if (options.strictRanges === true)
      throw rangeError([start, end]);
    return [];
  };
  var invalidStep = (step, options) => {
    if (options.strictRanges === true) {
      throw new TypeError(`Expected step "${step}" to be a number`);
    }
    return [];
  };
  var fillNumbers = (start, end, step = 1, options = {}) => {
    let a = Number(start);
    let b = Number(end);
    if (!Number.isInteger(a) || !Number.isInteger(b)) {
      if (options.strictRanges === true)
        throw rangeError([start, end]);
      return [];
    }
    if (a === 0)
      a = 0;
    if (b === 0)
      b = 0;
    let descending = a > b;
    let startString = String(start);
    let endString = String(end);
    let stepString = String(step);
    step = Math.max(Math.abs(step), 1);
    let padded = zeros(startString) || zeros(endString) || zeros(stepString);
    let maxLen = padded ? Math.max(startString.length, endString.length, stepString.length) : 0;
    let toNumber = padded === false && stringify(start, end, options) === false;
    let format2 = options.transform || transform(toNumber);
    if (options.toRegex && step === 1) {
      return toRange(toMaxLen(start, maxLen), toMaxLen(end, maxLen), true, options);
    }
    let parts = {negatives: [], positives: []};
    let push = (num) => parts[num < 0 ? "negatives" : "positives"].push(Math.abs(num));
    let range = [];
    let index = 0;
    while (descending ? a >= b : a <= b) {
      if (options.toRegex === true && step > 1) {
        push(a);
      } else {
        range.push(pad(format2(a, index), maxLen, toNumber));
      }
      a = descending ? a - step : a + step;
      index++;
    }
    if (options.toRegex === true) {
      return step > 1 ? toSequence(parts, options) : toRegex(range, null, {wrap: false, ...options});
    }
    return range;
  };
  var fillLetters = (start, end, step = 1, options = {}) => {
    if (!isNumber(start) && start.length > 1 || !isNumber(end) && end.length > 1) {
      return invalidRange(start, end, options);
    }
    let format2 = options.transform || ((val) => String.fromCharCode(val));
    let a = `${start}`.charCodeAt(0);
    let b = `${end}`.charCodeAt(0);
    let descending = a > b;
    let min = Math.min(a, b);
    let max = Math.max(a, b);
    if (options.toRegex && step === 1) {
      return toRange(min, max, false, options);
    }
    let range = [];
    let index = 0;
    while (descending ? a >= b : a <= b) {
      range.push(format2(a, index));
      a = descending ? a - step : a + step;
      index++;
    }
    if (options.toRegex === true) {
      return toRegex(range, null, {wrap: false, options});
    }
    return range;
  };
  var fill = (start, end, step, options = {}) => {
    if (end == null && isValidValue(start)) {
      return [start];
    }
    if (!isValidValue(start) || !isValidValue(end)) {
      return invalidRange(start, end, options);
    }
    if (typeof step === "function") {
      return fill(start, end, 1, {transform: step});
    }
    if (isObject(step)) {
      return fill(start, end, 0, step);
    }
    let opts = {...options};
    if (opts.capture === true)
      opts.wrap = true;
    step = step || opts.step || 1;
    if (!isNumber(step)) {
      if (step != null && !isObject(step))
        return invalidStep(step, opts);
      return fill(start, end, 1, step);
    }
    if (isNumber(start) && isNumber(end)) {
      return fillNumbers(start, end, step, opts);
    }
    return fillLetters(start, end, Math.max(Math.abs(step), 1), opts);
  };
  module2.exports = fill;
});

// node_modules/braces/lib/compile.js
var require_compile = __commonJS((exports2, module2) => {
  "use strict";
  var fill = require_fill_range();
  var utils8 = require_utils3();
  var compile3 = (ast, options = {}) => {
    let walk = (node, parent = {}) => {
      let invalidBlock = utils8.isInvalidBrace(parent);
      let invalidNode = node.invalid === true && options.escapeInvalid === true;
      let invalid = invalidBlock === true || invalidNode === true;
      let prefix = options.escapeInvalid === true ? "\\" : "";
      let output = "";
      if (node.isOpen === true) {
        return prefix + node.value;
      }
      if (node.isClose === true) {
        return prefix + node.value;
      }
      if (node.type === "open") {
        return invalid ? prefix + node.value : "(";
      }
      if (node.type === "close") {
        return invalid ? prefix + node.value : ")";
      }
      if (node.type === "comma") {
        return node.prev.type === "comma" ? "" : invalid ? node.value : "|";
      }
      if (node.value) {
        return node.value;
      }
      if (node.nodes && node.ranges > 0) {
        let args = utils8.reduce(node.nodes);
        let range = fill(...args, {...options, wrap: false, toRegex: true});
        if (range.length !== 0) {
          return args.length > 1 && range.length > 1 ? `(${range})` : range;
        }
      }
      if (node.nodes) {
        for (let child of node.nodes) {
          output += walk(child, node);
        }
      }
      return output;
    };
    return walk(ast);
  };
  module2.exports = compile3;
});

// node_modules/braces/lib/expand.js
var require_expand = __commonJS((exports2, module2) => {
  "use strict";
  var fill = require_fill_range();
  var stringify = require_stringify();
  var utils8 = require_utils3();
  var append = (queue = "", stash = "", enclose = false) => {
    let result = [];
    queue = [].concat(queue);
    stash = [].concat(stash);
    if (!stash.length)
      return queue;
    if (!queue.length) {
      return enclose ? utils8.flatten(stash).map((ele) => `{${ele}}`) : stash;
    }
    for (let item of queue) {
      if (Array.isArray(item)) {
        for (let value of item) {
          result.push(append(value, stash, enclose));
        }
      } else {
        for (let ele of stash) {
          if (enclose === true && typeof ele === "string")
            ele = `{${ele}}`;
          result.push(Array.isArray(ele) ? append(item, ele, enclose) : item + ele);
        }
      }
    }
    return utils8.flatten(result);
  };
  var expand = (ast, options = {}) => {
    let rangeLimit = options.rangeLimit === void 0 ? 1e3 : options.rangeLimit;
    let walk = (node, parent = {}) => {
      node.queue = [];
      let p = parent;
      let q = parent.queue;
      while (p.type !== "brace" && p.type !== "root" && p.parent) {
        p = p.parent;
        q = p.queue;
      }
      if (node.invalid || node.dollar) {
        q.push(append(q.pop(), stringify(node, options)));
        return;
      }
      if (node.type === "brace" && node.invalid !== true && node.nodes.length === 2) {
        q.push(append(q.pop(), ["{}"]));
        return;
      }
      if (node.nodes && node.ranges > 0) {
        let args = utils8.reduce(node.nodes);
        if (utils8.exceedsLimit(...args, options.step, rangeLimit)) {
          throw new RangeError("expanded array length exceeds range limit. Use options.rangeLimit to increase or disable the limit.");
        }
        let range = fill(...args, options);
        if (range.length === 0) {
          range = stringify(node, options);
        }
        q.push(append(q.pop(), range));
        node.nodes = [];
        return;
      }
      let enclose = utils8.encloseBrace(node);
      let queue = node.queue;
      let block = node;
      while (block.type !== "brace" && block.type !== "root" && block.parent) {
        block = block.parent;
        queue = block.queue;
      }
      for (let i = 0; i < node.nodes.length; i++) {
        let child = node.nodes[i];
        if (child.type === "comma" && node.type === "brace") {
          if (i === 1)
            queue.push("");
          queue.push("");
          continue;
        }
        if (child.type === "close") {
          q.push(append(q.pop(), queue, enclose));
          continue;
        }
        if (child.value && child.type !== "open") {
          queue.push(append(queue.pop(), child.value));
          continue;
        }
        if (child.nodes) {
          walk(child, node);
        }
      }
      return queue;
    };
    return utils8.flatten(walk(ast));
  };
  module2.exports = expand;
});

// node_modules/braces/lib/constants.js
var require_constants2 = __commonJS((exports2, module2) => {
  "use strict";
  module2.exports = {
    MAX_LENGTH: 1024 * 64,
    CHAR_0: "0",
    CHAR_9: "9",
    CHAR_UPPERCASE_A: "A",
    CHAR_LOWERCASE_A: "a",
    CHAR_UPPERCASE_Z: "Z",
    CHAR_LOWERCASE_Z: "z",
    CHAR_LEFT_PARENTHESES: "(",
    CHAR_RIGHT_PARENTHESES: ")",
    CHAR_ASTERISK: "*",
    CHAR_AMPERSAND: "&",
    CHAR_AT: "@",
    CHAR_BACKSLASH: "\\",
    CHAR_BACKTICK: "`",
    CHAR_CARRIAGE_RETURN: "\r",
    CHAR_CIRCUMFLEX_ACCENT: "^",
    CHAR_COLON: ":",
    CHAR_COMMA: ",",
    CHAR_DOLLAR: "$",
    CHAR_DOT: ".",
    CHAR_DOUBLE_QUOTE: '"',
    CHAR_EQUAL: "=",
    CHAR_EXCLAMATION_MARK: "!",
    CHAR_FORM_FEED: "\f",
    CHAR_FORWARD_SLASH: "/",
    CHAR_HASH: "#",
    CHAR_HYPHEN_MINUS: "-",
    CHAR_LEFT_ANGLE_BRACKET: "<",
    CHAR_LEFT_CURLY_BRACE: "{",
    CHAR_LEFT_SQUARE_BRACKET: "[",
    CHAR_LINE_FEED: "\n",
    CHAR_NO_BREAK_SPACE: "\xA0",
    CHAR_PERCENT: "%",
    CHAR_PLUS: "+",
    CHAR_QUESTION_MARK: "?",
    CHAR_RIGHT_ANGLE_BRACKET: ">",
    CHAR_RIGHT_CURLY_BRACE: "}",
    CHAR_RIGHT_SQUARE_BRACKET: "]",
    CHAR_SEMICOLON: ";",
    CHAR_SINGLE_QUOTE: "'",
    CHAR_SPACE: " ",
    CHAR_TAB: "	",
    CHAR_UNDERSCORE: "_",
    CHAR_VERTICAL_LINE: "|",
    CHAR_ZERO_WIDTH_NOBREAK_SPACE: "\uFEFF"
  };
});

// node_modules/braces/lib/parse.js
var require_parse2 = __commonJS((exports2, module2) => {
  "use strict";
  var stringify = require_stringify();
  var {
    MAX_LENGTH,
    CHAR_BACKSLASH,
    CHAR_BACKTICK,
    CHAR_COMMA,
    CHAR_DOT,
    CHAR_LEFT_PARENTHESES,
    CHAR_RIGHT_PARENTHESES,
    CHAR_LEFT_CURLY_BRACE,
    CHAR_RIGHT_CURLY_BRACE,
    CHAR_LEFT_SQUARE_BRACKET,
    CHAR_RIGHT_SQUARE_BRACKET,
    CHAR_DOUBLE_QUOTE,
    CHAR_SINGLE_QUOTE,
    CHAR_NO_BREAK_SPACE,
    CHAR_ZERO_WIDTH_NOBREAK_SPACE
  } = require_constants2();
  var parse = (input, options = {}) => {
    if (typeof input !== "string") {
      throw new TypeError("Expected a string");
    }
    let opts = options || {};
    let max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
    if (input.length > max) {
      throw new SyntaxError(`Input length (${input.length}), exceeds max characters (${max})`);
    }
    let ast = {type: "root", input, nodes: []};
    let stack = [ast];
    let block = ast;
    let prev = ast;
    let brackets = 0;
    let length = input.length;
    let index = 0;
    let depth = 0;
    let value;
    let memo = {};
    const advance = () => input[index++];
    const push = (node) => {
      if (node.type === "text" && prev.type === "dot") {
        prev.type = "text";
      }
      if (prev && prev.type === "text" && node.type === "text") {
        prev.value += node.value;
        return;
      }
      block.nodes.push(node);
      node.parent = block;
      node.prev = prev;
      prev = node;
      return node;
    };
    push({type: "bos"});
    while (index < length) {
      block = stack[stack.length - 1];
      value = advance();
      if (value === CHAR_ZERO_WIDTH_NOBREAK_SPACE || value === CHAR_NO_BREAK_SPACE) {
        continue;
      }
      if (value === CHAR_BACKSLASH) {
        push({type: "text", value: (options.keepEscaping ? value : "") + advance()});
        continue;
      }
      if (value === CHAR_RIGHT_SQUARE_BRACKET) {
        push({type: "text", value: "\\" + value});
        continue;
      }
      if (value === CHAR_LEFT_SQUARE_BRACKET) {
        brackets++;
        let closed = true;
        let next;
        while (index < length && (next = advance())) {
          value += next;
          if (next === CHAR_LEFT_SQUARE_BRACKET) {
            brackets++;
            continue;
          }
          if (next === CHAR_BACKSLASH) {
            value += advance();
            continue;
          }
          if (next === CHAR_RIGHT_SQUARE_BRACKET) {
            brackets--;
            if (brackets === 0) {
              break;
            }
          }
        }
        push({type: "text", value});
        continue;
      }
      if (value === CHAR_LEFT_PARENTHESES) {
        block = push({type: "paren", nodes: []});
        stack.push(block);
        push({type: "text", value});
        continue;
      }
      if (value === CHAR_RIGHT_PARENTHESES) {
        if (block.type !== "paren") {
          push({type: "text", value});
          continue;
        }
        block = stack.pop();
        push({type: "text", value});
        block = stack[stack.length - 1];
        continue;
      }
      if (value === CHAR_DOUBLE_QUOTE || value === CHAR_SINGLE_QUOTE || value === CHAR_BACKTICK) {
        let open = value;
        let next;
        if (options.keepQuotes !== true) {
          value = "";
        }
        while (index < length && (next = advance())) {
          if (next === CHAR_BACKSLASH) {
            value += next + advance();
            continue;
          }
          if (next === open) {
            if (options.keepQuotes === true)
              value += next;
            break;
          }
          value += next;
        }
        push({type: "text", value});
        continue;
      }
      if (value === CHAR_LEFT_CURLY_BRACE) {
        depth++;
        let dollar = prev.value && prev.value.slice(-1) === "$" || block.dollar === true;
        let brace = {
          type: "brace",
          open: true,
          close: false,
          dollar,
          depth,
          commas: 0,
          ranges: 0,
          nodes: []
        };
        block = push(brace);
        stack.push(block);
        push({type: "open", value});
        continue;
      }
      if (value === CHAR_RIGHT_CURLY_BRACE) {
        if (block.type !== "brace") {
          push({type: "text", value});
          continue;
        }
        let type = "close";
        block = stack.pop();
        block.close = true;
        push({type, value});
        depth--;
        block = stack[stack.length - 1];
        continue;
      }
      if (value === CHAR_COMMA && depth > 0) {
        if (block.ranges > 0) {
          block.ranges = 0;
          let open = block.nodes.shift();
          block.nodes = [open, {type: "text", value: stringify(block)}];
        }
        push({type: "comma", value});
        block.commas++;
        continue;
      }
      if (value === CHAR_DOT && depth > 0 && block.commas === 0) {
        let siblings = block.nodes;
        if (depth === 0 || siblings.length === 0) {
          push({type: "text", value});
          continue;
        }
        if (prev.type === "dot") {
          block.range = [];
          prev.value += value;
          prev.type = "range";
          if (block.nodes.length !== 3 && block.nodes.length !== 5) {
            block.invalid = true;
            block.ranges = 0;
            prev.type = "text";
            continue;
          }
          block.ranges++;
          block.args = [];
          continue;
        }
        if (prev.type === "range") {
          siblings.pop();
          let before = siblings[siblings.length - 1];
          before.value += prev.value + value;
          prev = before;
          block.ranges--;
          continue;
        }
        push({type: "dot", value});
        continue;
      }
      push({type: "text", value});
    }
    do {
      block = stack.pop();
      if (block.type !== "root") {
        block.nodes.forEach((node) => {
          if (!node.nodes) {
            if (node.type === "open")
              node.isOpen = true;
            if (node.type === "close")
              node.isClose = true;
            if (!node.nodes)
              node.type = "text";
            node.invalid = true;
          }
        });
        let parent = stack[stack.length - 1];
        let index2 = parent.nodes.indexOf(block);
        parent.nodes.splice(index2, 1, ...block.nodes);
      }
    } while (stack.length > 0);
    push({type: "eos"});
    return ast;
  };
  module2.exports = parse;
});

// node_modules/braces/index.js
var require_braces = __commonJS((exports2, module2) => {
  "use strict";
  var stringify = require_stringify();
  var compile3 = require_compile();
  var expand = require_expand();
  var parse = require_parse2();
  var braces = (input, options = {}) => {
    let output = [];
    if (Array.isArray(input)) {
      for (let pattern of input) {
        let result = braces.create(pattern, options);
        if (Array.isArray(result)) {
          output.push(...result);
        } else {
          output.push(result);
        }
      }
    } else {
      output = [].concat(braces.create(input, options));
    }
    if (options && options.expand === true && options.nodupes === true) {
      output = [...new Set(output)];
    }
    return output;
  };
  braces.parse = (input, options = {}) => parse(input, options);
  braces.stringify = (input, options = {}) => {
    if (typeof input === "string") {
      return stringify(braces.parse(input, options), options);
    }
    return stringify(input, options);
  };
  braces.compile = (input, options = {}) => {
    if (typeof input === "string") {
      input = braces.parse(input, options);
    }
    return compile3(input, options);
  };
  braces.expand = (input, options = {}) => {
    if (typeof input === "string") {
      input = braces.parse(input, options);
    }
    let result = expand(input, options);
    if (options.noempty === true) {
      result = result.filter(Boolean);
    }
    if (options.nodupes === true) {
      result = [...new Set(result)];
    }
    return result;
  };
  braces.create = (input, options = {}) => {
    if (input === "" || input.length < 3) {
      return [input];
    }
    return options.expand !== true ? braces.compile(input, options) : braces.expand(input, options);
  };
  module2.exports = braces;
});

// node_modules/micromatch/index.js
var require_micromatch = __commonJS((exports2, module2) => {
  "use strict";
  var util2 = require("util");
  var braces = require_braces();
  var picomatch = require_picomatch2();
  var utils8 = require_utils2();
  var isEmptyString = (val) => typeof val === "string" && (val === "" || val === "./");
  var micromatch4 = (list, patterns, options) => {
    patterns = [].concat(patterns);
    list = [].concat(list);
    let omit = new Set();
    let keep = new Set();
    let items = new Set();
    let negatives = 0;
    let onResult = (state) => {
      items.add(state.output);
      if (options && options.onResult) {
        options.onResult(state);
      }
    };
    for (let i = 0; i < patterns.length; i++) {
      let isMatch = picomatch(String(patterns[i]), {...options, onResult}, true);
      let negated = isMatch.state.negated || isMatch.state.negatedExtglob;
      if (negated)
        negatives++;
      for (let item of list) {
        let matched = isMatch(item, true);
        let match = negated ? !matched.isMatch : matched.isMatch;
        if (!match)
          continue;
        if (negated) {
          omit.add(matched.output);
        } else {
          omit.delete(matched.output);
          keep.add(matched.output);
        }
      }
    }
    let result = negatives === patterns.length ? [...items] : [...keep];
    let matches = result.filter((item) => !omit.has(item));
    if (options && matches.length === 0) {
      if (options.failglob === true) {
        throw new Error(`No matches found for "${patterns.join(", ")}"`);
      }
      if (options.nonull === true || options.nullglob === true) {
        return options.unescape ? patterns.map((p) => p.replace(/\\/g, "")) : patterns;
      }
    }
    return matches;
  };
  micromatch4.match = micromatch4;
  micromatch4.matcher = (pattern, options) => picomatch(pattern, options);
  micromatch4.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);
  micromatch4.any = micromatch4.isMatch;
  micromatch4.not = (list, patterns, options = {}) => {
    patterns = [].concat(patterns).map(String);
    let result = new Set();
    let items = [];
    let onResult = (state) => {
      if (options.onResult)
        options.onResult(state);
      items.push(state.output);
    };
    let matches = micromatch4(list, patterns, {...options, onResult});
    for (let item of items) {
      if (!matches.includes(item)) {
        result.add(item);
      }
    }
    return [...result];
  };
  micromatch4.contains = (str, pattern, options) => {
    if (typeof str !== "string") {
      throw new TypeError(`Expected a string: "${util2.inspect(str)}"`);
    }
    if (Array.isArray(pattern)) {
      return pattern.some((p) => micromatch4.contains(str, p, options));
    }
    if (typeof pattern === "string") {
      if (isEmptyString(str) || isEmptyString(pattern)) {
        return false;
      }
      if (str.includes(pattern) || str.startsWith("./") && str.slice(2).includes(pattern)) {
        return true;
      }
    }
    return micromatch4.isMatch(str, pattern, {...options, contains: true});
  };
  micromatch4.matchKeys = (obj, patterns, options) => {
    if (!utils8.isObject(obj)) {
      throw new TypeError("Expected the first argument to be an object");
    }
    let keys = micromatch4(Object.keys(obj), patterns, options);
    let res = {};
    for (let key of keys)
      res[key] = obj[key];
    return res;
  };
  micromatch4.some = (list, patterns, options) => {
    let items = [].concat(list);
    for (let pattern of [].concat(patterns)) {
      let isMatch = picomatch(String(pattern), options);
      if (items.some((item) => isMatch(item))) {
        return true;
      }
    }
    return false;
  };
  micromatch4.every = (list, patterns, options) => {
    let items = [].concat(list);
    for (let pattern of [].concat(patterns)) {
      let isMatch = picomatch(String(pattern), options);
      if (!items.every((item) => isMatch(item))) {
        return false;
      }
    }
    return true;
  };
  micromatch4.all = (str, patterns, options) => {
    if (typeof str !== "string") {
      throw new TypeError(`Expected a string: "${util2.inspect(str)}"`);
    }
    return [].concat(patterns).every((p) => picomatch(p, options)(str));
  };
  micromatch4.capture = (glob, input, options) => {
    let posix = utils8.isWindows(options);
    let regex = picomatch.makeRe(String(glob), {...options, capture: true});
    let match = regex.exec(posix ? utils8.toPosixSlashes(input) : input);
    if (match) {
      return match.slice(1).map((v) => v === void 0 ? "" : v);
    }
  };
  micromatch4.makeRe = (...args) => picomatch.makeRe(...args);
  micromatch4.scan = (...args) => picomatch.scan(...args);
  micromatch4.parse = (patterns, options) => {
    let res = [];
    for (let pattern of [].concat(patterns || [])) {
      for (let str of braces(String(pattern), options)) {
        res.push(picomatch.parse(str, options));
      }
    }
    return res;
  };
  micromatch4.braces = (pattern, options) => {
    if (typeof pattern !== "string")
      throw new TypeError("Expected a string");
    if (options && options.nobrace === true || !/\{.*\}/.test(pattern)) {
      return [pattern];
    }
    return braces(pattern, options);
  };
  micromatch4.braceExpand = (pattern, options) => {
    if (typeof pattern !== "string")
      throw new TypeError("Expected a string");
    return micromatch4.braces(pattern, {...options, expand: true});
  };
  module2.exports = micromatch4;
});

// node_modules/color-name/index.js
var require_color_name = __commonJS((exports2, module2) => {
  "use strict";
  module2.exports = {
    aliceblue: [240, 248, 255],
    antiquewhite: [250, 235, 215],
    aqua: [0, 255, 255],
    aquamarine: [127, 255, 212],
    azure: [240, 255, 255],
    beige: [245, 245, 220],
    bisque: [255, 228, 196],
    black: [0, 0, 0],
    blanchedalmond: [255, 235, 205],
    blue: [0, 0, 255],
    blueviolet: [138, 43, 226],
    brown: [165, 42, 42],
    burlywood: [222, 184, 135],
    cadetblue: [95, 158, 160],
    chartreuse: [127, 255, 0],
    chocolate: [210, 105, 30],
    coral: [255, 127, 80],
    cornflowerblue: [100, 149, 237],
    cornsilk: [255, 248, 220],
    crimson: [220, 20, 60],
    cyan: [0, 255, 255],
    darkblue: [0, 0, 139],
    darkcyan: [0, 139, 139],
    darkgoldenrod: [184, 134, 11],
    darkgray: [169, 169, 169],
    darkgreen: [0, 100, 0],
    darkgrey: [169, 169, 169],
    darkkhaki: [189, 183, 107],
    darkmagenta: [139, 0, 139],
    darkolivegreen: [85, 107, 47],
    darkorange: [255, 140, 0],
    darkorchid: [153, 50, 204],
    darkred: [139, 0, 0],
    darksalmon: [233, 150, 122],
    darkseagreen: [143, 188, 143],
    darkslateblue: [72, 61, 139],
    darkslategray: [47, 79, 79],
    darkslategrey: [47, 79, 79],
    darkturquoise: [0, 206, 209],
    darkviolet: [148, 0, 211],
    deeppink: [255, 20, 147],
    deepskyblue: [0, 191, 255],
    dimgray: [105, 105, 105],
    dimgrey: [105, 105, 105],
    dodgerblue: [30, 144, 255],
    firebrick: [178, 34, 34],
    floralwhite: [255, 250, 240],
    forestgreen: [34, 139, 34],
    fuchsia: [255, 0, 255],
    gainsboro: [220, 220, 220],
    ghostwhite: [248, 248, 255],
    gold: [255, 215, 0],
    goldenrod: [218, 165, 32],
    gray: [128, 128, 128],
    green: [0, 128, 0],
    greenyellow: [173, 255, 47],
    grey: [128, 128, 128],
    honeydew: [240, 255, 240],
    hotpink: [255, 105, 180],
    indianred: [205, 92, 92],
    indigo: [75, 0, 130],
    ivory: [255, 255, 240],
    khaki: [240, 230, 140],
    lavender: [230, 230, 250],
    lavenderblush: [255, 240, 245],
    lawngreen: [124, 252, 0],
    lemonchiffon: [255, 250, 205],
    lightblue: [173, 216, 230],
    lightcoral: [240, 128, 128],
    lightcyan: [224, 255, 255],
    lightgoldenrodyellow: [250, 250, 210],
    lightgray: [211, 211, 211],
    lightgreen: [144, 238, 144],
    lightgrey: [211, 211, 211],
    lightpink: [255, 182, 193],
    lightsalmon: [255, 160, 122],
    lightseagreen: [32, 178, 170],
    lightskyblue: [135, 206, 250],
    lightslategray: [119, 136, 153],
    lightslategrey: [119, 136, 153],
    lightsteelblue: [176, 196, 222],
    lightyellow: [255, 255, 224],
    lime: [0, 255, 0],
    limegreen: [50, 205, 50],
    linen: [250, 240, 230],
    magenta: [255, 0, 255],
    maroon: [128, 0, 0],
    mediumaquamarine: [102, 205, 170],
    mediumblue: [0, 0, 205],
    mediumorchid: [186, 85, 211],
    mediumpurple: [147, 112, 219],
    mediumseagreen: [60, 179, 113],
    mediumslateblue: [123, 104, 238],
    mediumspringgreen: [0, 250, 154],
    mediumturquoise: [72, 209, 204],
    mediumvioletred: [199, 21, 133],
    midnightblue: [25, 25, 112],
    mintcream: [245, 255, 250],
    mistyrose: [255, 228, 225],
    moccasin: [255, 228, 181],
    navajowhite: [255, 222, 173],
    navy: [0, 0, 128],
    oldlace: [253, 245, 230],
    olive: [128, 128, 0],
    olivedrab: [107, 142, 35],
    orange: [255, 165, 0],
    orangered: [255, 69, 0],
    orchid: [218, 112, 214],
    palegoldenrod: [238, 232, 170],
    palegreen: [152, 251, 152],
    paleturquoise: [175, 238, 238],
    palevioletred: [219, 112, 147],
    papayawhip: [255, 239, 213],
    peachpuff: [255, 218, 185],
    peru: [205, 133, 63],
    pink: [255, 192, 203],
    plum: [221, 160, 221],
    powderblue: [176, 224, 230],
    purple: [128, 0, 128],
    rebeccapurple: [102, 51, 153],
    red: [255, 0, 0],
    rosybrown: [188, 143, 143],
    royalblue: [65, 105, 225],
    saddlebrown: [139, 69, 19],
    salmon: [250, 128, 114],
    sandybrown: [244, 164, 96],
    seagreen: [46, 139, 87],
    seashell: [255, 245, 238],
    sienna: [160, 82, 45],
    silver: [192, 192, 192],
    skyblue: [135, 206, 235],
    slateblue: [106, 90, 205],
    slategray: [112, 128, 144],
    slategrey: [112, 128, 144],
    snow: [255, 250, 250],
    springgreen: [0, 255, 127],
    steelblue: [70, 130, 180],
    tan: [210, 180, 140],
    teal: [0, 128, 128],
    thistle: [216, 191, 216],
    tomato: [255, 99, 71],
    turquoise: [64, 224, 208],
    violet: [238, 130, 238],
    wheat: [245, 222, 179],
    white: [255, 255, 255],
    whitesmoke: [245, 245, 245],
    yellow: [255, 255, 0],
    yellowgreen: [154, 205, 50]
  };
});

// node_modules/color-convert/conversions.js
var require_conversions = __commonJS((exports2, module2) => {
  var cssKeywords = require_color_name();
  var reverseKeywords = {};
  for (const key of Object.keys(cssKeywords)) {
    reverseKeywords[cssKeywords[key]] = key;
  }
  var convert = {
    rgb: {channels: 3, labels: "rgb"},
    hsl: {channels: 3, labels: "hsl"},
    hsv: {channels: 3, labels: "hsv"},
    hwb: {channels: 3, labels: "hwb"},
    cmyk: {channels: 4, labels: "cmyk"},
    xyz: {channels: 3, labels: "xyz"},
    lab: {channels: 3, labels: "lab"},
    lch: {channels: 3, labels: "lch"},
    hex: {channels: 1, labels: ["hex"]},
    keyword: {channels: 1, labels: ["keyword"]},
    ansi16: {channels: 1, labels: ["ansi16"]},
    ansi256: {channels: 1, labels: ["ansi256"]},
    hcg: {channels: 3, labels: ["h", "c", "g"]},
    apple: {channels: 3, labels: ["r16", "g16", "b16"]},
    gray: {channels: 1, labels: ["gray"]}
  };
  module2.exports = convert;
  for (const model of Object.keys(convert)) {
    if (!("channels" in convert[model])) {
      throw new Error("missing channels property: " + model);
    }
    if (!("labels" in convert[model])) {
      throw new Error("missing channel labels property: " + model);
    }
    if (convert[model].labels.length !== convert[model].channels) {
      throw new Error("channel and label counts mismatch: " + model);
    }
    const {channels, labels} = convert[model];
    delete convert[model].channels;
    delete convert[model].labels;
    Object.defineProperty(convert[model], "channels", {value: channels});
    Object.defineProperty(convert[model], "labels", {value: labels});
  }
  convert.rgb.hsl = function(rgb) {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    const delta = max - min;
    let h;
    let s;
    if (max === min) {
      h = 0;
    } else if (r === max) {
      h = (g - b) / delta;
    } else if (g === max) {
      h = 2 + (b - r) / delta;
    } else if (b === max) {
      h = 4 + (r - g) / delta;
    }
    h = Math.min(h * 60, 360);
    if (h < 0) {
      h += 360;
    }
    const l = (min + max) / 2;
    if (max === min) {
      s = 0;
    } else if (l <= 0.5) {
      s = delta / (max + min);
    } else {
      s = delta / (2 - max - min);
    }
    return [h, s * 100, l * 100];
  };
  convert.rgb.hsv = function(rgb) {
    let rdif;
    let gdif;
    let bdif;
    let h;
    let s;
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const v = Math.max(r, g, b);
    const diff = v - Math.min(r, g, b);
    const diffc = function(c) {
      return (v - c) / 6 / diff + 1 / 2;
    };
    if (diff === 0) {
      h = 0;
      s = 0;
    } else {
      s = diff / v;
      rdif = diffc(r);
      gdif = diffc(g);
      bdif = diffc(b);
      if (r === v) {
        h = bdif - gdif;
      } else if (g === v) {
        h = 1 / 3 + rdif - bdif;
      } else if (b === v) {
        h = 2 / 3 + gdif - rdif;
      }
      if (h < 0) {
        h += 1;
      } else if (h > 1) {
        h -= 1;
      }
    }
    return [
      h * 360,
      s * 100,
      v * 100
    ];
  };
  convert.rgb.hwb = function(rgb) {
    const r = rgb[0];
    const g = rgb[1];
    let b = rgb[2];
    const h = convert.rgb.hsl(rgb)[0];
    const w = 1 / 255 * Math.min(r, Math.min(g, b));
    b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));
    return [h, w * 100, b * 100];
  };
  convert.rgb.cmyk = function(rgb) {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const k = Math.min(1 - r, 1 - g, 1 - b);
    const c = (1 - r - k) / (1 - k) || 0;
    const m = (1 - g - k) / (1 - k) || 0;
    const y = (1 - b - k) / (1 - k) || 0;
    return [c * 100, m * 100, y * 100, k * 100];
  };
  function comparativeDistance(x, y) {
    return (x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2 + (x[2] - y[2]) ** 2;
  }
  convert.rgb.keyword = function(rgb) {
    const reversed = reverseKeywords[rgb];
    if (reversed) {
      return reversed;
    }
    let currentClosestDistance = Infinity;
    let currentClosestKeyword;
    for (const keyword of Object.keys(cssKeywords)) {
      const value = cssKeywords[keyword];
      const distance = comparativeDistance(rgb, value);
      if (distance < currentClosestDistance) {
        currentClosestDistance = distance;
        currentClosestKeyword = keyword;
      }
    }
    return currentClosestKeyword;
  };
  convert.keyword.rgb = function(keyword) {
    return cssKeywords[keyword];
  };
  convert.rgb.xyz = function(rgb) {
    let r = rgb[0] / 255;
    let g = rgb[1] / 255;
    let b = rgb[2] / 255;
    r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
    g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
    b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;
    const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const z = r * 0.0193 + g * 0.1192 + b * 0.9505;
    return [x * 100, y * 100, z * 100];
  };
  convert.rgb.lab = function(rgb) {
    const xyz = convert.rgb.xyz(rgb);
    let x = xyz[0];
    let y = xyz[1];
    let z = xyz[2];
    x /= 95.047;
    y /= 100;
    z /= 108.883;
    x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
    y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
    z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
    const l = 116 * y - 16;
    const a = 500 * (x - y);
    const b = 200 * (y - z);
    return [l, a, b];
  };
  convert.hsl.rgb = function(hsl) {
    const h = hsl[0] / 360;
    const s = hsl[1] / 100;
    const l = hsl[2] / 100;
    let t2;
    let t3;
    let val;
    if (s === 0) {
      val = l * 255;
      return [val, val, val];
    }
    if (l < 0.5) {
      t2 = l * (1 + s);
    } else {
      t2 = l + s - l * s;
    }
    const t1 = 2 * l - t2;
    const rgb = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      t3 = h + 1 / 3 * -(i - 1);
      if (t3 < 0) {
        t3++;
      }
      if (t3 > 1) {
        t3--;
      }
      if (6 * t3 < 1) {
        val = t1 + (t2 - t1) * 6 * t3;
      } else if (2 * t3 < 1) {
        val = t2;
      } else if (3 * t3 < 2) {
        val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
      } else {
        val = t1;
      }
      rgb[i] = val * 255;
    }
    return rgb;
  };
  convert.hsl.hsv = function(hsl) {
    const h = hsl[0];
    let s = hsl[1] / 100;
    let l = hsl[2] / 100;
    let smin = s;
    const lmin = Math.max(l, 0.01);
    l *= 2;
    s *= l <= 1 ? l : 2 - l;
    smin *= lmin <= 1 ? lmin : 2 - lmin;
    const v = (l + s) / 2;
    const sv = l === 0 ? 2 * smin / (lmin + smin) : 2 * s / (l + s);
    return [h, sv * 100, v * 100];
  };
  convert.hsv.rgb = function(hsv) {
    const h = hsv[0] / 60;
    const s = hsv[1] / 100;
    let v = hsv[2] / 100;
    const hi = Math.floor(h) % 6;
    const f = h - Math.floor(h);
    const p = 255 * v * (1 - s);
    const q = 255 * v * (1 - s * f);
    const t = 255 * v * (1 - s * (1 - f));
    v *= 255;
    switch (hi) {
      case 0:
        return [v, t, p];
      case 1:
        return [q, v, p];
      case 2:
        return [p, v, t];
      case 3:
        return [p, q, v];
      case 4:
        return [t, p, v];
      case 5:
        return [v, p, q];
    }
  };
  convert.hsv.hsl = function(hsv) {
    const h = hsv[0];
    const s = hsv[1] / 100;
    const v = hsv[2] / 100;
    const vmin = Math.max(v, 0.01);
    let sl;
    let l;
    l = (2 - s) * v;
    const lmin = (2 - s) * vmin;
    sl = s * vmin;
    sl /= lmin <= 1 ? lmin : 2 - lmin;
    sl = sl || 0;
    l /= 2;
    return [h, sl * 100, l * 100];
  };
  convert.hwb.rgb = function(hwb) {
    const h = hwb[0] / 360;
    let wh = hwb[1] / 100;
    let bl = hwb[2] / 100;
    const ratio = wh + bl;
    let f;
    if (ratio > 1) {
      wh /= ratio;
      bl /= ratio;
    }
    const i = Math.floor(6 * h);
    const v = 1 - bl;
    f = 6 * h - i;
    if ((i & 1) !== 0) {
      f = 1 - f;
    }
    const n = wh + f * (v - wh);
    let r;
    let g;
    let b;
    switch (i) {
      default:
      case 6:
      case 0:
        r = v;
        g = n;
        b = wh;
        break;
      case 1:
        r = n;
        g = v;
        b = wh;
        break;
      case 2:
        r = wh;
        g = v;
        b = n;
        break;
      case 3:
        r = wh;
        g = n;
        b = v;
        break;
      case 4:
        r = n;
        g = wh;
        b = v;
        break;
      case 5:
        r = v;
        g = wh;
        b = n;
        break;
    }
    return [r * 255, g * 255, b * 255];
  };
  convert.cmyk.rgb = function(cmyk) {
    const c = cmyk[0] / 100;
    const m = cmyk[1] / 100;
    const y = cmyk[2] / 100;
    const k = cmyk[3] / 100;
    const r = 1 - Math.min(1, c * (1 - k) + k);
    const g = 1 - Math.min(1, m * (1 - k) + k);
    const b = 1 - Math.min(1, y * (1 - k) + k);
    return [r * 255, g * 255, b * 255];
  };
  convert.xyz.rgb = function(xyz) {
    const x = xyz[0] / 100;
    const y = xyz[1] / 100;
    const z = xyz[2] / 100;
    let r;
    let g;
    let b;
    r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    b = x * 0.0557 + y * -0.204 + z * 1.057;
    r = r > 31308e-7 ? 1.055 * r ** (1 / 2.4) - 0.055 : r * 12.92;
    g = g > 31308e-7 ? 1.055 * g ** (1 / 2.4) - 0.055 : g * 12.92;
    b = b > 31308e-7 ? 1.055 * b ** (1 / 2.4) - 0.055 : b * 12.92;
    r = Math.min(Math.max(0, r), 1);
    g = Math.min(Math.max(0, g), 1);
    b = Math.min(Math.max(0, b), 1);
    return [r * 255, g * 255, b * 255];
  };
  convert.xyz.lab = function(xyz) {
    let x = xyz[0];
    let y = xyz[1];
    let z = xyz[2];
    x /= 95.047;
    y /= 100;
    z /= 108.883;
    x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
    y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
    z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
    const l = 116 * y - 16;
    const a = 500 * (x - y);
    const b = 200 * (y - z);
    return [l, a, b];
  };
  convert.lab.xyz = function(lab) {
    const l = lab[0];
    const a = lab[1];
    const b = lab[2];
    let x;
    let y;
    let z;
    y = (l + 16) / 116;
    x = a / 500 + y;
    z = y - b / 200;
    const y2 = y ** 3;
    const x2 = x ** 3;
    const z2 = z ** 3;
    y = y2 > 8856e-6 ? y2 : (y - 16 / 116) / 7.787;
    x = x2 > 8856e-6 ? x2 : (x - 16 / 116) / 7.787;
    z = z2 > 8856e-6 ? z2 : (z - 16 / 116) / 7.787;
    x *= 95.047;
    y *= 100;
    z *= 108.883;
    return [x, y, z];
  };
  convert.lab.lch = function(lab) {
    const l = lab[0];
    const a = lab[1];
    const b = lab[2];
    let h;
    const hr = Math.atan2(b, a);
    h = hr * 360 / 2 / Math.PI;
    if (h < 0) {
      h += 360;
    }
    const c = Math.sqrt(a * a + b * b);
    return [l, c, h];
  };
  convert.lch.lab = function(lch) {
    const l = lch[0];
    const c = lch[1];
    const h = lch[2];
    const hr = h / 360 * 2 * Math.PI;
    const a = c * Math.cos(hr);
    const b = c * Math.sin(hr);
    return [l, a, b];
  };
  convert.rgb.ansi16 = function(args, saturation = null) {
    const [r, g, b] = args;
    let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation;
    value = Math.round(value / 50);
    if (value === 0) {
      return 30;
    }
    let ansi2 = 30 + (Math.round(b / 255) << 2 | Math.round(g / 255) << 1 | Math.round(r / 255));
    if (value === 2) {
      ansi2 += 60;
    }
    return ansi2;
  };
  convert.hsv.ansi16 = function(args) {
    return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
  };
  convert.rgb.ansi256 = function(args) {
    const r = args[0];
    const g = args[1];
    const b = args[2];
    if (r === g && g === b) {
      if (r < 8) {
        return 16;
      }
      if (r > 248) {
        return 231;
      }
      return Math.round((r - 8) / 247 * 24) + 232;
    }
    const ansi2 = 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);
    return ansi2;
  };
  convert.ansi16.rgb = function(args) {
    let color = args % 10;
    if (color === 0 || color === 7) {
      if (args > 50) {
        color += 3.5;
      }
      color = color / 10.5 * 255;
      return [color, color, color];
    }
    const mult = (~~(args > 50) + 1) * 0.5;
    const r = (color & 1) * mult * 255;
    const g = (color >> 1 & 1) * mult * 255;
    const b = (color >> 2 & 1) * mult * 255;
    return [r, g, b];
  };
  convert.ansi256.rgb = function(args) {
    if (args >= 232) {
      const c = (args - 232) * 10 + 8;
      return [c, c, c];
    }
    args -= 16;
    let rem;
    const r = Math.floor(args / 36) / 5 * 255;
    const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
    const b = rem % 6 / 5 * 255;
    return [r, g, b];
  };
  convert.rgb.hex = function(args) {
    const integer = ((Math.round(args[0]) & 255) << 16) + ((Math.round(args[1]) & 255) << 8) + (Math.round(args[2]) & 255);
    const string2 = integer.toString(16).toUpperCase();
    return "000000".substring(string2.length) + string2;
  };
  convert.hex.rgb = function(args) {
    const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
    if (!match) {
      return [0, 0, 0];
    }
    let colorString = match[0];
    if (match[0].length === 3) {
      colorString = colorString.split("").map((char) => {
        return char + char;
      }).join("");
    }
    const integer = parseInt(colorString, 16);
    const r = integer >> 16 & 255;
    const g = integer >> 8 & 255;
    const b = integer & 255;
    return [r, g, b];
  };
  convert.rgb.hcg = function(rgb) {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const max = Math.max(Math.max(r, g), b);
    const min = Math.min(Math.min(r, g), b);
    const chroma = max - min;
    let grayscale;
    let hue;
    if (chroma < 1) {
      grayscale = min / (1 - chroma);
    } else {
      grayscale = 0;
    }
    if (chroma <= 0) {
      hue = 0;
    } else if (max === r) {
      hue = (g - b) / chroma % 6;
    } else if (max === g) {
      hue = 2 + (b - r) / chroma;
    } else {
      hue = 4 + (r - g) / chroma;
    }
    hue /= 6;
    hue %= 1;
    return [hue * 360, chroma * 100, grayscale * 100];
  };
  convert.hsl.hcg = function(hsl) {
    const s = hsl[1] / 100;
    const l = hsl[2] / 100;
    const c = l < 0.5 ? 2 * s * l : 2 * s * (1 - l);
    let f = 0;
    if (c < 1) {
      f = (l - 0.5 * c) / (1 - c);
    }
    return [hsl[0], c * 100, f * 100];
  };
  convert.hsv.hcg = function(hsv) {
    const s = hsv[1] / 100;
    const v = hsv[2] / 100;
    const c = s * v;
    let f = 0;
    if (c < 1) {
      f = (v - c) / (1 - c);
    }
    return [hsv[0], c * 100, f * 100];
  };
  convert.hcg.rgb = function(hcg) {
    const h = hcg[0] / 360;
    const c = hcg[1] / 100;
    const g = hcg[2] / 100;
    if (c === 0) {
      return [g * 255, g * 255, g * 255];
    }
    const pure = [0, 0, 0];
    const hi = h % 1 * 6;
    const v = hi % 1;
    const w = 1 - v;
    let mg = 0;
    switch (Math.floor(hi)) {
      case 0:
        pure[0] = 1;
        pure[1] = v;
        pure[2] = 0;
        break;
      case 1:
        pure[0] = w;
        pure[1] = 1;
        pure[2] = 0;
        break;
      case 2:
        pure[0] = 0;
        pure[1] = 1;
        pure[2] = v;
        break;
      case 3:
        pure[0] = 0;
        pure[1] = w;
        pure[2] = 1;
        break;
      case 4:
        pure[0] = v;
        pure[1] = 0;
        pure[2] = 1;
        break;
      default:
        pure[0] = 1;
        pure[1] = 0;
        pure[2] = w;
    }
    mg = (1 - c) * g;
    return [
      (c * pure[0] + mg) * 255,
      (c * pure[1] + mg) * 255,
      (c * pure[2] + mg) * 255
    ];
  };
  convert.hcg.hsv = function(hcg) {
    const c = hcg[1] / 100;
    const g = hcg[2] / 100;
    const v = c + g * (1 - c);
    let f = 0;
    if (v > 0) {
      f = c / v;
    }
    return [hcg[0], f * 100, v * 100];
  };
  convert.hcg.hsl = function(hcg) {
    const c = hcg[1] / 100;
    const g = hcg[2] / 100;
    const l = g * (1 - c) + 0.5 * c;
    let s = 0;
    if (l > 0 && l < 0.5) {
      s = c / (2 * l);
    } else if (l >= 0.5 && l < 1) {
      s = c / (2 * (1 - l));
    }
    return [hcg[0], s * 100, l * 100];
  };
  convert.hcg.hwb = function(hcg) {
    const c = hcg[1] / 100;
    const g = hcg[2] / 100;
    const v = c + g * (1 - c);
    return [hcg[0], (v - c) * 100, (1 - v) * 100];
  };
  convert.hwb.hcg = function(hwb) {
    const w = hwb[1] / 100;
    const b = hwb[2] / 100;
    const v = 1 - b;
    const c = v - w;
    let g = 0;
    if (c < 1) {
      g = (v - c) / (1 - c);
    }
    return [hwb[0], c * 100, g * 100];
  };
  convert.apple.rgb = function(apple) {
    return [apple[0] / 65535 * 255, apple[1] / 65535 * 255, apple[2] / 65535 * 255];
  };
  convert.rgb.apple = function(rgb) {
    return [rgb[0] / 255 * 65535, rgb[1] / 255 * 65535, rgb[2] / 255 * 65535];
  };
  convert.gray.rgb = function(args) {
    return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
  };
  convert.gray.hsl = function(args) {
    return [0, 0, args[0]];
  };
  convert.gray.hsv = convert.gray.hsl;
  convert.gray.hwb = function(gray) {
    return [0, 100, gray[0]];
  };
  convert.gray.cmyk = function(gray) {
    return [0, 0, 0, gray[0]];
  };
  convert.gray.lab = function(gray) {
    return [gray[0], 0, 0];
  };
  convert.gray.hex = function(gray) {
    const val = Math.round(gray[0] / 100 * 255) & 255;
    const integer = (val << 16) + (val << 8) + val;
    const string2 = integer.toString(16).toUpperCase();
    return "000000".substring(string2.length) + string2;
  };
  convert.rgb.gray = function(rgb) {
    const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
    return [val / 255 * 100];
  };
});

// node_modules/color-convert/route.js
var require_route = __commonJS((exports2, module2) => {
  var conversions = require_conversions();
  function buildGraph() {
    const graph = {};
    const models = Object.keys(conversions);
    for (let len = models.length, i = 0; i < len; i++) {
      graph[models[i]] = {
        distance: -1,
        parent: null
      };
    }
    return graph;
  }
  function deriveBFS(fromModel) {
    const graph = buildGraph();
    const queue = [fromModel];
    graph[fromModel].distance = 0;
    while (queue.length) {
      const current = queue.pop();
      const adjacents = Object.keys(conversions[current]);
      for (let len = adjacents.length, i = 0; i < len; i++) {
        const adjacent = adjacents[i];
        const node = graph[adjacent];
        if (node.distance === -1) {
          node.distance = graph[current].distance + 1;
          node.parent = current;
          queue.unshift(adjacent);
        }
      }
    }
    return graph;
  }
  function link(from, to) {
    return function(args) {
      return to(from(args));
    };
  }
  function wrapConversion(toModel, graph) {
    const path6 = [graph[toModel].parent, toModel];
    let fn = conversions[graph[toModel].parent][toModel];
    let cur = graph[toModel].parent;
    while (graph[cur].parent) {
      path6.unshift(graph[cur].parent);
      fn = link(conversions[graph[cur].parent][cur], fn);
      cur = graph[cur].parent;
    }
    fn.conversion = path6;
    return fn;
  }
  module2.exports = function(fromModel) {
    const graph = deriveBFS(fromModel);
    const conversion = {};
    const models = Object.keys(graph);
    for (let len = models.length, i = 0; i < len; i++) {
      const toModel = models[i];
      const node = graph[toModel];
      if (node.parent === null) {
        continue;
      }
      conversion[toModel] = wrapConversion(toModel, graph);
    }
    return conversion;
  };
});

// node_modules/color-convert/index.js
var require_color_convert = __commonJS((exports2, module2) => {
  var conversions = require_conversions();
  var route = require_route();
  var convert = {};
  var models = Object.keys(conversions);
  function wrapRaw(fn) {
    const wrappedFn = function(...args) {
      const arg0 = args[0];
      if (arg0 === void 0 || arg0 === null) {
        return arg0;
      }
      if (arg0.length > 1) {
        args = arg0;
      }
      return fn(args);
    };
    if ("conversion" in fn) {
      wrappedFn.conversion = fn.conversion;
    }
    return wrappedFn;
  }
  function wrapRounded(fn) {
    const wrappedFn = function(...args) {
      const arg0 = args[0];
      if (arg0 === void 0 || arg0 === null) {
        return arg0;
      }
      if (arg0.length > 1) {
        args = arg0;
      }
      const result = fn(args);
      if (typeof result === "object") {
        for (let len = result.length, i = 0; i < len; i++) {
          result[i] = Math.round(result[i]);
        }
      }
      return result;
    };
    if ("conversion" in fn) {
      wrappedFn.conversion = fn.conversion;
    }
    return wrappedFn;
  }
  models.forEach((fromModel) => {
    convert[fromModel] = {};
    Object.defineProperty(convert[fromModel], "channels", {value: conversions[fromModel].channels});
    Object.defineProperty(convert[fromModel], "labels", {value: conversions[fromModel].labels});
    const routes = route(fromModel);
    const routeModels = Object.keys(routes);
    routeModels.forEach((toModel) => {
      const fn = routes[toModel];
      convert[fromModel][toModel] = wrapRounded(fn);
      convert[fromModel][toModel].raw = wrapRaw(fn);
    });
  });
  module2.exports = convert;
});

// node_modules/ansi-styles/index.js
var require_ansi_styles = __commonJS((exports2, module2) => {
  "use strict";
  var wrapAnsi16 = (fn, offset) => (...args) => {
    const code = fn(...args);
    return `[${code + offset}m`;
  };
  var wrapAnsi256 = (fn, offset) => (...args) => {
    const code = fn(...args);
    return `[${38 + offset};5;${code}m`;
  };
  var wrapAnsi16m = (fn, offset) => (...args) => {
    const rgb = fn(...args);
    return `[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
  };
  var ansi2ansi = (n) => n;
  var rgb2rgb = (r, g, b) => [r, g, b];
  var setLazyProperty = (object, property, get) => {
    Object.defineProperty(object, property, {
      get: () => {
        const value = get();
        Object.defineProperty(object, property, {
          value,
          enumerable: true,
          configurable: true
        });
        return value;
      },
      enumerable: true,
      configurable: true
    });
  };
  var colorConvert;
  var makeDynamicStyles = (wrap, targetSpace, identity, isBackground) => {
    if (colorConvert === void 0) {
      colorConvert = require_color_convert();
    }
    const offset = isBackground ? 10 : 0;
    const styles = {};
    for (const [sourceSpace, suite] of Object.entries(colorConvert)) {
      const name = sourceSpace === "ansi16" ? "ansi" : sourceSpace;
      if (sourceSpace === targetSpace) {
        styles[name] = wrap(identity, offset);
      } else if (typeof suite === "object") {
        styles[name] = wrap(suite[targetSpace], offset);
      }
    }
    return styles;
  };
  function assembleStyles() {
    const codes = new Map();
    const styles = {
      modifier: {
        reset: [0, 0],
        bold: [1, 22],
        dim: [2, 22],
        italic: [3, 23],
        underline: [4, 24],
        inverse: [7, 27],
        hidden: [8, 28],
        strikethrough: [9, 29]
      },
      color: {
        black: [30, 39],
        red: [31, 39],
        green: [32, 39],
        yellow: [33, 39],
        blue: [34, 39],
        magenta: [35, 39],
        cyan: [36, 39],
        white: [37, 39],
        blackBright: [90, 39],
        redBright: [91, 39],
        greenBright: [92, 39],
        yellowBright: [93, 39],
        blueBright: [94, 39],
        magentaBright: [95, 39],
        cyanBright: [96, 39],
        whiteBright: [97, 39]
      },
      bgColor: {
        bgBlack: [40, 49],
        bgRed: [41, 49],
        bgGreen: [42, 49],
        bgYellow: [43, 49],
        bgBlue: [44, 49],
        bgMagenta: [45, 49],
        bgCyan: [46, 49],
        bgWhite: [47, 49],
        bgBlackBright: [100, 49],
        bgRedBright: [101, 49],
        bgGreenBright: [102, 49],
        bgYellowBright: [103, 49],
        bgBlueBright: [104, 49],
        bgMagentaBright: [105, 49],
        bgCyanBright: [106, 49],
        bgWhiteBright: [107, 49]
      }
    };
    styles.color.gray = styles.color.blackBright;
    styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
    styles.color.grey = styles.color.blackBright;
    styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;
    for (const [groupName, group] of Object.entries(styles)) {
      for (const [styleName, style] of Object.entries(group)) {
        styles[styleName] = {
          open: `[${style[0]}m`,
          close: `[${style[1]}m`
        };
        group[styleName] = styles[styleName];
        codes.set(style[0], style[1]);
      }
      Object.defineProperty(styles, groupName, {
        value: group,
        enumerable: false
      });
    }
    Object.defineProperty(styles, "codes", {
      value: codes,
      enumerable: false
    });
    styles.color.close = "[39m";
    styles.bgColor.close = "[49m";
    setLazyProperty(styles.color, "ansi", () => makeDynamicStyles(wrapAnsi16, "ansi16", ansi2ansi, false));
    setLazyProperty(styles.color, "ansi256", () => makeDynamicStyles(wrapAnsi256, "ansi256", ansi2ansi, false));
    setLazyProperty(styles.color, "ansi16m", () => makeDynamicStyles(wrapAnsi16m, "rgb", rgb2rgb, false));
    setLazyProperty(styles.bgColor, "ansi", () => makeDynamicStyles(wrapAnsi16, "ansi16", ansi2ansi, true));
    setLazyProperty(styles.bgColor, "ansi256", () => makeDynamicStyles(wrapAnsi256, "ansi256", ansi2ansi, true));
    setLazyProperty(styles.bgColor, "ansi16m", () => makeDynamicStyles(wrapAnsi16m, "rgb", rgb2rgb, true));
    return styles;
  }
  Object.defineProperty(module2, "exports", {
    enumerable: true,
    get: assembleStyles
  });
});

// node_modules/has-flag/index.js
var require_has_flag = __commonJS((exports2, module2) => {
  "use strict";
  module2.exports = (flag, argv = process.argv) => {
    const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
    const position = argv.indexOf(prefix + flag);
    const terminatorPosition = argv.indexOf("--");
    return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
  };
});

// node_modules/supports-color/index.js
var require_supports_color = __commonJS((exports2, module2) => {
  "use strict";
  var os5 = require("os");
  var tty = require("tty");
  var hasFlag = require_has_flag();
  var {env} = process;
  var forceColor;
  if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
    forceColor = 0;
  } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
    forceColor = 1;
  }
  if ("FORCE_COLOR" in env) {
    if (env.FORCE_COLOR === "true") {
      forceColor = 1;
    } else if (env.FORCE_COLOR === "false") {
      forceColor = 0;
    } else {
      forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
    }
  }
  function translateLevel(level) {
    if (level === 0) {
      return false;
    }
    return {
      level,
      hasBasic: true,
      has256: level >= 2,
      has16m: level >= 3
    };
  }
  function supportsColor(haveStream, streamIsTTY) {
    if (forceColor === 0) {
      return 0;
    }
    if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
      return 3;
    }
    if (hasFlag("color=256")) {
      return 2;
    }
    if (haveStream && !streamIsTTY && forceColor === void 0) {
      return 0;
    }
    const min = forceColor || 0;
    if (env.TERM === "dumb") {
      return min;
    }
    if (process.platform === "win32") {
      const osRelease = os5.release().split(".");
      if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
        return Number(osRelease[2]) >= 14931 ? 3 : 2;
      }
      return 1;
    }
    if ("CI" in env) {
      if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((sign) => sign in env) || env.CI_NAME === "codeship") {
        return 1;
      }
      return min;
    }
    if ("TEAMCITY_VERSION" in env) {
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
    }
    if (env.COLORTERM === "truecolor") {
      return 3;
    }
    if ("TERM_PROGRAM" in env) {
      const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (env.TERM_PROGRAM) {
        case "iTerm.app":
          return version >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    if (/-256(color)?$/i.test(env.TERM)) {
      return 2;
    }
    if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
      return 1;
    }
    if ("COLORTERM" in env) {
      return 1;
    }
    return min;
  }
  function getSupportLevel(stream) {
    const level = supportsColor(stream, stream && stream.isTTY);
    return translateLevel(level);
  }
  module2.exports = {
    supportsColor: getSupportLevel,
    stdout: translateLevel(supportsColor(true, tty.isatty(1))),
    stderr: translateLevel(supportsColor(true, tty.isatty(2)))
  };
});

// node_modules/chalk/source/util.js
var require_util = __commonJS((exports2, module2) => {
  "use strict";
  var stringReplaceAll = (string2, substring, replacer) => {
    let index = string2.indexOf(substring);
    if (index === -1) {
      return string2;
    }
    const substringLength = substring.length;
    let endIndex = 0;
    let returnValue = "";
    do {
      returnValue += string2.substr(endIndex, index - endIndex) + substring + replacer;
      endIndex = index + substringLength;
      index = string2.indexOf(substring, endIndex);
    } while (index !== -1);
    returnValue += string2.substr(endIndex);
    return returnValue;
  };
  var stringEncaseCRLFWithFirstIndex = (string2, prefix, postfix, index) => {
    let endIndex = 0;
    let returnValue = "";
    do {
      const gotCR = string2[index - 1] === "\r";
      returnValue += string2.substr(endIndex, (gotCR ? index - 1 : index) - endIndex) + prefix + (gotCR ? "\r\n" : "\n") + postfix;
      endIndex = index + 1;
      index = string2.indexOf("\n", endIndex);
    } while (index !== -1);
    returnValue += string2.substr(endIndex);
    return returnValue;
  };
  module2.exports = {
    stringReplaceAll,
    stringEncaseCRLFWithFirstIndex
  };
});

// node_modules/chalk/source/templates.js
var require_templates = __commonJS((exports2, module2) => {
  "use strict";
  var TEMPLATE_REGEX = /(?:\\(u(?:[a-f\d]{4}|\{[a-f\d]{1,6}\})|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
  var STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
  var STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
  var ESCAPE_REGEX = /\\(u(?:[a-f\d]{4}|{[a-f\d]{1,6}})|x[a-f\d]{2}|.)|([^\\])/gi;
  var ESCAPES = new Map([
    ["n", "\n"],
    ["r", "\r"],
    ["t", "	"],
    ["b", "\b"],
    ["f", "\f"],
    ["v", "\v"],
    ["0", "\0"],
    ["\\", "\\"],
    ["e", ""],
    ["a", "\x07"]
  ]);
  function unescape(c) {
    const u = c[0] === "u";
    const bracket = c[1] === "{";
    if (u && !bracket && c.length === 5 || c[0] === "x" && c.length === 3) {
      return String.fromCharCode(parseInt(c.slice(1), 16));
    }
    if (u && bracket) {
      return String.fromCodePoint(parseInt(c.slice(2, -1), 16));
    }
    return ESCAPES.get(c) || c;
  }
  function parseArguments(name, arguments_) {
    const results = [];
    const chunks = arguments_.trim().split(/\s*,\s*/g);
    let matches;
    for (const chunk of chunks) {
      const number = Number(chunk);
      if (!Number.isNaN(number)) {
        results.push(number);
      } else if (matches = chunk.match(STRING_REGEX)) {
        results.push(matches[2].replace(ESCAPE_REGEX, (m, escape, character) => escape ? unescape(escape) : character));
      } else {
        throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name}')`);
      }
    }
    return results;
  }
  function parseStyle(style) {
    STYLE_REGEX.lastIndex = 0;
    const results = [];
    let matches;
    while ((matches = STYLE_REGEX.exec(style)) !== null) {
      const name = matches[1];
      if (matches[2]) {
        const args = parseArguments(name, matches[2]);
        results.push([name].concat(args));
      } else {
        results.push([name]);
      }
    }
    return results;
  }
  function buildStyle(chalk, styles) {
    const enabled = {};
    for (const layer of styles) {
      for (const style of layer.styles) {
        enabled[style[0]] = layer.inverse ? null : style.slice(1);
      }
    }
    let current = chalk;
    for (const [styleName, styles2] of Object.entries(enabled)) {
      if (!Array.isArray(styles2)) {
        continue;
      }
      if (!(styleName in current)) {
        throw new Error(`Unknown Chalk style: ${styleName}`);
      }
      current = styles2.length > 0 ? current[styleName](...styles2) : current[styleName];
    }
    return current;
  }
  module2.exports = (chalk, temporary) => {
    const styles = [];
    const chunks = [];
    let chunk = [];
    temporary.replace(TEMPLATE_REGEX, (m, escapeCharacter, inverse, style, close, character) => {
      if (escapeCharacter) {
        chunk.push(unescape(escapeCharacter));
      } else if (style) {
        const string2 = chunk.join("");
        chunk = [];
        chunks.push(styles.length === 0 ? string2 : buildStyle(chalk, styles)(string2));
        styles.push({inverse, styles: parseStyle(style)});
      } else if (close) {
        if (styles.length === 0) {
          throw new Error("Found extraneous } in Chalk template literal");
        }
        chunks.push(buildStyle(chalk, styles)(chunk.join("")));
        chunk = [];
        styles.pop();
      } else {
        chunk.push(character);
      }
    });
    chunks.push(chunk.join(""));
    if (styles.length > 0) {
      const errMessage = `Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? "" : "s"} (\`}\`)`;
      throw new Error(errMessage);
    }
    return chunks.join("");
  };
});

// node_modules/chalk/source/index.js
var require_source = __commonJS((exports2, module2) => {
  "use strict";
  var ansiStyles = require_ansi_styles();
  var {stdout: stdoutColor, stderr: stderrColor} = require_supports_color();
  var {
    stringReplaceAll,
    stringEncaseCRLFWithFirstIndex
  } = require_util();
  var {isArray} = Array;
  var levelMapping = [
    "ansi",
    "ansi",
    "ansi256",
    "ansi16m"
  ];
  var styles = Object.create(null);
  var applyOptions = (object, options = {}) => {
    if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
      throw new Error("The `level` option should be an integer from 0 to 3");
    }
    const colorLevel = stdoutColor ? stdoutColor.level : 0;
    object.level = options.level === void 0 ? colorLevel : options.level;
  };
  var ChalkClass = class {
    constructor(options) {
      return chalkFactory(options);
    }
  };
  var chalkFactory = (options) => {
    const chalk2 = {};
    applyOptions(chalk2, options);
    chalk2.template = (...arguments_) => chalkTag(chalk2.template, ...arguments_);
    Object.setPrototypeOf(chalk2, Chalk.prototype);
    Object.setPrototypeOf(chalk2.template, chalk2);
    chalk2.template.constructor = () => {
      throw new Error("`chalk.constructor()` is deprecated. Use `new chalk.Instance()` instead.");
    };
    chalk2.template.Instance = ChalkClass;
    return chalk2.template;
  };
  function Chalk(options) {
    return chalkFactory(options);
  }
  for (const [styleName, style] of Object.entries(ansiStyles)) {
    styles[styleName] = {
      get() {
        const builder = createBuilder(this, createStyler(style.open, style.close, this._styler), this._isEmpty);
        Object.defineProperty(this, styleName, {value: builder});
        return builder;
      }
    };
  }
  styles.visible = {
    get() {
      const builder = createBuilder(this, this._styler, true);
      Object.defineProperty(this, "visible", {value: builder});
      return builder;
    }
  };
  var usedModels = ["rgb", "hex", "keyword", "hsl", "hsv", "hwb", "ansi", "ansi256"];
  for (const model of usedModels) {
    styles[model] = {
      get() {
        const {level} = this;
        return function(...arguments_) {
          const styler = createStyler(ansiStyles.color[levelMapping[level]][model](...arguments_), ansiStyles.color.close, this._styler);
          return createBuilder(this, styler, this._isEmpty);
        };
      }
    };
  }
  for (const model of usedModels) {
    const bgModel = "bg" + model[0].toUpperCase() + model.slice(1);
    styles[bgModel] = {
      get() {
        const {level} = this;
        return function(...arguments_) {
          const styler = createStyler(ansiStyles.bgColor[levelMapping[level]][model](...arguments_), ansiStyles.bgColor.close, this._styler);
          return createBuilder(this, styler, this._isEmpty);
        };
      }
    };
  }
  var proto = Object.defineProperties(() => {
  }, {
    ...styles,
    level: {
      enumerable: true,
      get() {
        return this._generator.level;
      },
      set(level) {
        this._generator.level = level;
      }
    }
  });
  var createStyler = (open, close, parent) => {
    let openAll;
    let closeAll;
    if (parent === void 0) {
      openAll = open;
      closeAll = close;
    } else {
      openAll = parent.openAll + open;
      closeAll = close + parent.closeAll;
    }
    return {
      open,
      close,
      openAll,
      closeAll,
      parent
    };
  };
  var createBuilder = (self2, _styler, _isEmpty) => {
    const builder = (...arguments_) => {
      if (isArray(arguments_[0]) && isArray(arguments_[0].raw)) {
        return applyStyle(builder, chalkTag(builder, ...arguments_));
      }
      return applyStyle(builder, arguments_.length === 1 ? "" + arguments_[0] : arguments_.join(" "));
    };
    Object.setPrototypeOf(builder, proto);
    builder._generator = self2;
    builder._styler = _styler;
    builder._isEmpty = _isEmpty;
    return builder;
  };
  var applyStyle = (self2, string2) => {
    if (self2.level <= 0 || !string2) {
      return self2._isEmpty ? "" : string2;
    }
    let styler = self2._styler;
    if (styler === void 0) {
      return string2;
    }
    const {openAll, closeAll} = styler;
    if (string2.indexOf("") !== -1) {
      while (styler !== void 0) {
        string2 = stringReplaceAll(string2, styler.close, styler.open);
        styler = styler.parent;
      }
    }
    const lfIndex = string2.indexOf("\n");
    if (lfIndex !== -1) {
      string2 = stringEncaseCRLFWithFirstIndex(string2, closeAll, openAll, lfIndex);
    }
    return openAll + string2 + closeAll;
  };
  var template;
  var chalkTag = (chalk2, ...strings) => {
    const [firstString] = strings;
    if (!isArray(firstString) || !isArray(firstString.raw)) {
      return strings.join(" ");
    }
    const arguments_ = strings.slice(1);
    const parts = [firstString.raw[0]];
    for (let i = 1; i < firstString.length; i++) {
      parts.push(String(arguments_[i - 1]).replace(/[{}\\]/g, "\\$&"), String(firstString.raw[i]));
    }
    if (template === void 0) {
      template = require_templates();
    }
    return template(chalk2, parts.join(""));
  };
  Object.defineProperties(Chalk.prototype, styles);
  var chalk = Chalk();
  chalk.supportsColor = stdoutColor;
  chalk.stderr = Chalk({level: stderrColor ? stderrColor.level : 0});
  chalk.stderr.supportsColor = stderrColor;
  module2.exports = chalk;
});

// node_modules/mimic-fn/index.js
var require_mimic_fn = __commonJS((exports2, module2) => {
  "use strict";
  var mimicFn = (to, from) => {
    for (const prop of Reflect.ownKeys(from)) {
      Object.defineProperty(to, prop, Object.getOwnPropertyDescriptor(from, prop));
    }
    return to;
  };
  module2.exports = mimicFn;
  module2.exports.default = mimicFn;
});

// node_modules/onetime/index.js
var require_onetime = __commonJS((exports2, module2) => {
  "use strict";
  var mimicFn = require_mimic_fn();
  var calledFunctions = new WeakMap();
  var onetime = (function_, options = {}) => {
    if (typeof function_ !== "function") {
      throw new TypeError("Expected a function");
    }
    let returnValue;
    let callCount = 0;
    const functionName = function_.displayName || function_.name || "<anonymous>";
    const onetime2 = function(...arguments_) {
      calledFunctions.set(onetime2, ++callCount);
      if (callCount === 1) {
        returnValue = function_.apply(this, arguments_);
        function_ = null;
      } else if (options.throw === true) {
        throw new Error(`Function \`${functionName}\` can only be called once`);
      }
      return returnValue;
    };
    mimicFn(onetime2, function_);
    calledFunctions.set(onetime2, callCount);
    return onetime2;
  };
  module2.exports = onetime;
  module2.exports.default = onetime;
  module2.exports.callCount = (function_) => {
    if (!calledFunctions.has(function_)) {
      throw new Error(`The given function \`${function_.name}\` is not wrapped by the \`onetime\` package`);
    }
    return calledFunctions.get(function_);
  };
});

// node_modules/signal-exit/signals.js
var require_signals = __commonJS((exports2, module2) => {
  module2.exports = [
    "SIGABRT",
    "SIGALRM",
    "SIGHUP",
    "SIGINT",
    "SIGTERM"
  ];
  if (process.platform !== "win32") {
    module2.exports.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
  }
  if (process.platform === "linux") {
    module2.exports.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
  }
});

// node_modules/signal-exit/index.js
var require_signal_exit = __commonJS((exports2, module2) => {
  var assert = require("assert");
  var signals = require_signals();
  var isWin = /^win/i.test(process.platform);
  var EE = require("events");
  if (typeof EE !== "function") {
    EE = EE.EventEmitter;
  }
  var emitter;
  if (process.__signal_exit_emitter__) {
    emitter = process.__signal_exit_emitter__;
  } else {
    emitter = process.__signal_exit_emitter__ = new EE();
    emitter.count = 0;
    emitter.emitted = {};
  }
  if (!emitter.infinite) {
    emitter.setMaxListeners(Infinity);
    emitter.infinite = true;
  }
  module2.exports = function(cb, opts) {
    assert.equal(typeof cb, "function", "a callback must be provided for exit handler");
    if (loaded === false) {
      load();
    }
    var ev = "exit";
    if (opts && opts.alwaysLast) {
      ev = "afterexit";
    }
    var remove = function() {
      emitter.removeListener(ev, cb);
      if (emitter.listeners("exit").length === 0 && emitter.listeners("afterexit").length === 0) {
        unload();
      }
    };
    emitter.on(ev, cb);
    return remove;
  };
  module2.exports.unload = unload;
  function unload() {
    if (!loaded) {
      return;
    }
    loaded = false;
    signals.forEach(function(sig) {
      try {
        process.removeListener(sig, sigListeners[sig]);
      } catch (er) {
      }
    });
    process.emit = originalProcessEmit;
    process.reallyExit = originalProcessReallyExit;
    emitter.count -= 1;
  }
  function emit(event, code, signal) {
    if (emitter.emitted[event]) {
      return;
    }
    emitter.emitted[event] = true;
    emitter.emit(event, code, signal);
  }
  var sigListeners = {};
  signals.forEach(function(sig) {
    sigListeners[sig] = function listener() {
      var listeners = process.listeners(sig);
      if (listeners.length === emitter.count) {
        unload();
        emit("exit", null, sig);
        emit("afterexit", null, sig);
        if (isWin && sig === "SIGHUP") {
          sig = "SIGINT";
        }
        process.kill(process.pid, sig);
      }
    };
  });
  module2.exports.signals = function() {
    return signals;
  };
  module2.exports.load = load;
  var loaded = false;
  function load() {
    if (loaded) {
      return;
    }
    loaded = true;
    emitter.count += 1;
    signals = signals.filter(function(sig) {
      try {
        process.on(sig, sigListeners[sig]);
        return true;
      } catch (er) {
        return false;
      }
    });
    process.emit = processEmit;
    process.reallyExit = processReallyExit;
  }
  var originalProcessReallyExit = process.reallyExit;
  function processReallyExit(code) {
    process.exitCode = code || 0;
    emit("exit", process.exitCode, null);
    emit("afterexit", process.exitCode, null);
    originalProcessReallyExit.call(process, process.exitCode);
  }
  var originalProcessEmit = process.emit;
  function processEmit(ev, arg) {
    if (ev === "exit") {
      if (arg !== void 0) {
        process.exitCode = arg;
      }
      var ret = originalProcessEmit.apply(this, arguments);
      emit("exit", process.exitCode, null);
      emit("afterexit", process.exitCode, null);
      return ret;
    } else {
      return originalProcessEmit.apply(this, arguments);
    }
  }
});

// node_modules/restore-cursor/index.js
var require_restore_cursor = __commonJS((exports2, module2) => {
  "use strict";
  var onetime = require_onetime();
  var signalExit = require_signal_exit();
  module2.exports = onetime(() => {
    signalExit(() => {
      process.stderr.write("[?25h");
    }, {alwaysLast: true});
  });
});

// node_modules/cli-cursor/index.js
var require_cli_cursor = __commonJS((exports2) => {
  "use strict";
  var restoreCursor = require_restore_cursor();
  var isHidden = false;
  exports2.show = (writableStream = process.stderr) => {
    if (!writableStream.isTTY) {
      return;
    }
    isHidden = false;
    writableStream.write("[?25h");
  };
  exports2.hide = (writableStream = process.stderr) => {
    if (!writableStream.isTTY) {
      return;
    }
    restoreCursor();
    isHidden = true;
    writableStream.write("[?25l");
  };
  exports2.toggle = (force, writableStream) => {
    if (force !== void 0) {
      isHidden = force;
    }
    if (isHidden) {
      exports2.show(writableStream);
    } else {
      exports2.hide(writableStream);
    }
  };
});

// node_modules/cli-spinners/spinners.json
var require_spinners = __commonJS((exports2, module2) => {
  module2.exports = {
    dots: {
      interval: 80,
      frames: [
        "\u280B",
        "\u2819",
        "\u2839",
        "\u2838",
        "\u283C",
        "\u2834",
        "\u2826",
        "\u2827",
        "\u2807",
        "\u280F"
      ]
    },
    dots2: {
      interval: 80,
      frames: [
        "\u28FE",
        "\u28FD",
        "\u28FB",
        "\u28BF",
        "\u287F",
        "\u28DF",
        "\u28EF",
        "\u28F7"
      ]
    },
    dots3: {
      interval: 80,
      frames: [
        "\u280B",
        "\u2819",
        "\u281A",
        "\u281E",
        "\u2816",
        "\u2826",
        "\u2834",
        "\u2832",
        "\u2833",
        "\u2813"
      ]
    },
    dots4: {
      interval: 80,
      frames: [
        "\u2804",
        "\u2806",
        "\u2807",
        "\u280B",
        "\u2819",
        "\u2838",
        "\u2830",
        "\u2820",
        "\u2830",
        "\u2838",
        "\u2819",
        "\u280B",
        "\u2807",
        "\u2806"
      ]
    },
    dots5: {
      interval: 80,
      frames: [
        "\u280B",
        "\u2819",
        "\u281A",
        "\u2812",
        "\u2802",
        "\u2802",
        "\u2812",
        "\u2832",
        "\u2834",
        "\u2826",
        "\u2816",
        "\u2812",
        "\u2810",
        "\u2810",
        "\u2812",
        "\u2813",
        "\u280B"
      ]
    },
    dots6: {
      interval: 80,
      frames: [
        "\u2801",
        "\u2809",
        "\u2819",
        "\u281A",
        "\u2812",
        "\u2802",
        "\u2802",
        "\u2812",
        "\u2832",
        "\u2834",
        "\u2824",
        "\u2804",
        "\u2804",
        "\u2824",
        "\u2834",
        "\u2832",
        "\u2812",
        "\u2802",
        "\u2802",
        "\u2812",
        "\u281A",
        "\u2819",
        "\u2809",
        "\u2801"
      ]
    },
    dots7: {
      interval: 80,
      frames: [
        "\u2808",
        "\u2809",
        "\u280B",
        "\u2813",
        "\u2812",
        "\u2810",
        "\u2810",
        "\u2812",
        "\u2816",
        "\u2826",
        "\u2824",
        "\u2820",
        "\u2820",
        "\u2824",
        "\u2826",
        "\u2816",
        "\u2812",
        "\u2810",
        "\u2810",
        "\u2812",
        "\u2813",
        "\u280B",
        "\u2809",
        "\u2808"
      ]
    },
    dots8: {
      interval: 80,
      frames: [
        "\u2801",
        "\u2801",
        "\u2809",
        "\u2819",
        "\u281A",
        "\u2812",
        "\u2802",
        "\u2802",
        "\u2812",
        "\u2832",
        "\u2834",
        "\u2824",
        "\u2804",
        "\u2804",
        "\u2824",
        "\u2820",
        "\u2820",
        "\u2824",
        "\u2826",
        "\u2816",
        "\u2812",
        "\u2810",
        "\u2810",
        "\u2812",
        "\u2813",
        "\u280B",
        "\u2809",
        "\u2808",
        "\u2808"
      ]
    },
    dots9: {
      interval: 80,
      frames: [
        "\u28B9",
        "\u28BA",
        "\u28BC",
        "\u28F8",
        "\u28C7",
        "\u2867",
        "\u2857",
        "\u284F"
      ]
    },
    dots10: {
      interval: 80,
      frames: [
        "\u2884",
        "\u2882",
        "\u2881",
        "\u2841",
        "\u2848",
        "\u2850",
        "\u2860"
      ]
    },
    dots11: {
      interval: 100,
      frames: [
        "\u2801",
        "\u2802",
        "\u2804",
        "\u2840",
        "\u2880",
        "\u2820",
        "\u2810",
        "\u2808"
      ]
    },
    dots12: {
      interval: 80,
      frames: [
        "\u2880\u2800",
        "\u2840\u2800",
        "\u2804\u2800",
        "\u2882\u2800",
        "\u2842\u2800",
        "\u2805\u2800",
        "\u2883\u2800",
        "\u2843\u2800",
        "\u280D\u2800",
        "\u288B\u2800",
        "\u284B\u2800",
        "\u280D\u2801",
        "\u288B\u2801",
        "\u284B\u2801",
        "\u280D\u2809",
        "\u280B\u2809",
        "\u280B\u2809",
        "\u2809\u2819",
        "\u2809\u2819",
        "\u2809\u2829",
        "\u2808\u2899",
        "\u2808\u2859",
        "\u2888\u2829",
        "\u2840\u2899",
        "\u2804\u2859",
        "\u2882\u2829",
        "\u2842\u2898",
        "\u2805\u2858",
        "\u2883\u2828",
        "\u2843\u2890",
        "\u280D\u2850",
        "\u288B\u2820",
        "\u284B\u2880",
        "\u280D\u2841",
        "\u288B\u2801",
        "\u284B\u2801",
        "\u280D\u2809",
        "\u280B\u2809",
        "\u280B\u2809",
        "\u2809\u2819",
        "\u2809\u2819",
        "\u2809\u2829",
        "\u2808\u2899",
        "\u2808\u2859",
        "\u2808\u2829",
        "\u2800\u2899",
        "\u2800\u2859",
        "\u2800\u2829",
        "\u2800\u2898",
        "\u2800\u2858",
        "\u2800\u2828",
        "\u2800\u2890",
        "\u2800\u2850",
        "\u2800\u2820",
        "\u2800\u2880",
        "\u2800\u2840"
      ]
    },
    dots8Bit: {
      interval: 80,
      frames: [
        "\u2800",
        "\u2801",
        "\u2802",
        "\u2803",
        "\u2804",
        "\u2805",
        "\u2806",
        "\u2807",
        "\u2840",
        "\u2841",
        "\u2842",
        "\u2843",
        "\u2844",
        "\u2845",
        "\u2846",
        "\u2847",
        "\u2808",
        "\u2809",
        "\u280A",
        "\u280B",
        "\u280C",
        "\u280D",
        "\u280E",
        "\u280F",
        "\u2848",
        "\u2849",
        "\u284A",
        "\u284B",
        "\u284C",
        "\u284D",
        "\u284E",
        "\u284F",
        "\u2810",
        "\u2811",
        "\u2812",
        "\u2813",
        "\u2814",
        "\u2815",
        "\u2816",
        "\u2817",
        "\u2850",
        "\u2851",
        "\u2852",
        "\u2853",
        "\u2854",
        "\u2855",
        "\u2856",
        "\u2857",
        "\u2818",
        "\u2819",
        "\u281A",
        "\u281B",
        "\u281C",
        "\u281D",
        "\u281E",
        "\u281F",
        "\u2858",
        "\u2859",
        "\u285A",
        "\u285B",
        "\u285C",
        "\u285D",
        "\u285E",
        "\u285F",
        "\u2820",
        "\u2821",
        "\u2822",
        "\u2823",
        "\u2824",
        "\u2825",
        "\u2826",
        "\u2827",
        "\u2860",
        "\u2861",
        "\u2862",
        "\u2863",
        "\u2864",
        "\u2865",
        "\u2866",
        "\u2867",
        "\u2828",
        "\u2829",
        "\u282A",
        "\u282B",
        "\u282C",
        "\u282D",
        "\u282E",
        "\u282F",
        "\u2868",
        "\u2869",
        "\u286A",
        "\u286B",
        "\u286C",
        "\u286D",
        "\u286E",
        "\u286F",
        "\u2830",
        "\u2831",
        "\u2832",
        "\u2833",
        "\u2834",
        "\u2835",
        "\u2836",
        "\u2837",
        "\u2870",
        "\u2871",
        "\u2872",
        "\u2873",
        "\u2874",
        "\u2875",
        "\u2876",
        "\u2877",
        "\u2838",
        "\u2839",
        "\u283A",
        "\u283B",
        "\u283C",
        "\u283D",
        "\u283E",
        "\u283F",
        "\u2878",
        "\u2879",
        "\u287A",
        "\u287B",
        "\u287C",
        "\u287D",
        "\u287E",
        "\u287F",
        "\u2880",
        "\u2881",
        "\u2882",
        "\u2883",
        "\u2884",
        "\u2885",
        "\u2886",
        "\u2887",
        "\u28C0",
        "\u28C1",
        "\u28C2",
        "\u28C3",
        "\u28C4",
        "\u28C5",
        "\u28C6",
        "\u28C7",
        "\u2888",
        "\u2889",
        "\u288A",
        "\u288B",
        "\u288C",
        "\u288D",
        "\u288E",
        "\u288F",
        "\u28C8",
        "\u28C9",
        "\u28CA",
        "\u28CB",
        "\u28CC",
        "\u28CD",
        "\u28CE",
        "\u28CF",
        "\u2890",
        "\u2891",
        "\u2892",
        "\u2893",
        "\u2894",
        "\u2895",
        "\u2896",
        "\u2897",
        "\u28D0",
        "\u28D1",
        "\u28D2",
        "\u28D3",
        "\u28D4",
        "\u28D5",
        "\u28D6",
        "\u28D7",
        "\u2898",
        "\u2899",
        "\u289A",
        "\u289B",
        "\u289C",
        "\u289D",
        "\u289E",
        "\u289F",
        "\u28D8",
        "\u28D9",
        "\u28DA",
        "\u28DB",
        "\u28DC",
        "\u28DD",
        "\u28DE",
        "\u28DF",
        "\u28A0",
        "\u28A1",
        "\u28A2",
        "\u28A3",
        "\u28A4",
        "\u28A5",
        "\u28A6",
        "\u28A7",
        "\u28E0",
        "\u28E1",
        "\u28E2",
        "\u28E3",
        "\u28E4",
        "\u28E5",
        "\u28E6",
        "\u28E7",
        "\u28A8",
        "\u28A9",
        "\u28AA",
        "\u28AB",
        "\u28AC",
        "\u28AD",
        "\u28AE",
        "\u28AF",
        "\u28E8",
        "\u28E9",
        "\u28EA",
        "\u28EB",
        "\u28EC",
        "\u28ED",
        "\u28EE",
        "\u28EF",
        "\u28B0",
        "\u28B1",
        "\u28B2",
        "\u28B3",
        "\u28B4",
        "\u28B5",
        "\u28B6",
        "\u28B7",
        "\u28F0",
        "\u28F1",
        "\u28F2",
        "\u28F3",
        "\u28F4",
        "\u28F5",
        "\u28F6",
        "\u28F7",
        "\u28B8",
        "\u28B9",
        "\u28BA",
        "\u28BB",
        "\u28BC",
        "\u28BD",
        "\u28BE",
        "\u28BF",
        "\u28F8",
        "\u28F9",
        "\u28FA",
        "\u28FB",
        "\u28FC",
        "\u28FD",
        "\u28FE",
        "\u28FF"
      ]
    },
    line: {
      interval: 130,
      frames: [
        "-",
        "\\",
        "|",
        "/"
      ]
    },
    line2: {
      interval: 100,
      frames: [
        "\u2802",
        "-",
        "\u2013",
        "\u2014",
        "\u2013",
        "-"
      ]
    },
    pipe: {
      interval: 100,
      frames: [
        "\u2524",
        "\u2518",
        "\u2534",
        "\u2514",
        "\u251C",
        "\u250C",
        "\u252C",
        "\u2510"
      ]
    },
    simpleDots: {
      interval: 400,
      frames: [
        ".  ",
        ".. ",
        "...",
        "   "
      ]
    },
    simpleDotsScrolling: {
      interval: 200,
      frames: [
        ".  ",
        ".. ",
        "...",
        " ..",
        "  .",
        "   "
      ]
    },
    star: {
      interval: 70,
      frames: [
        "\u2736",
        "\u2738",
        "\u2739",
        "\u273A",
        "\u2739",
        "\u2737"
      ]
    },
    star2: {
      interval: 80,
      frames: [
        "+",
        "x",
        "*"
      ]
    },
    flip: {
      interval: 70,
      frames: [
        "_",
        "_",
        "_",
        "-",
        "`",
        "`",
        "'",
        "\xB4",
        "-",
        "_",
        "_",
        "_"
      ]
    },
    hamburger: {
      interval: 100,
      frames: [
        "\u2631",
        "\u2632",
        "\u2634"
      ]
    },
    growVertical: {
      interval: 120,
      frames: [
        "\u2581",
        "\u2583",
        "\u2584",
        "\u2585",
        "\u2586",
        "\u2587",
        "\u2586",
        "\u2585",
        "\u2584",
        "\u2583"
      ]
    },
    growHorizontal: {
      interval: 120,
      frames: [
        "\u258F",
        "\u258E",
        "\u258D",
        "\u258C",
        "\u258B",
        "\u258A",
        "\u2589",
        "\u258A",
        "\u258B",
        "\u258C",
        "\u258D",
        "\u258E"
      ]
    },
    balloon: {
      interval: 140,
      frames: [
        " ",
        ".",
        "o",
        "O",
        "@",
        "*",
        " "
      ]
    },
    balloon2: {
      interval: 120,
      frames: [
        ".",
        "o",
        "O",
        "\xB0",
        "O",
        "o",
        "."
      ]
    },
    noise: {
      interval: 100,
      frames: [
        "\u2593",
        "\u2592",
        "\u2591"
      ]
    },
    bounce: {
      interval: 120,
      frames: [
        "\u2801",
        "\u2802",
        "\u2804",
        "\u2802"
      ]
    },
    boxBounce: {
      interval: 120,
      frames: [
        "\u2596",
        "\u2598",
        "\u259D",
        "\u2597"
      ]
    },
    boxBounce2: {
      interval: 100,
      frames: [
        "\u258C",
        "\u2580",
        "\u2590",
        "\u2584"
      ]
    },
    triangle: {
      interval: 50,
      frames: [
        "\u25E2",
        "\u25E3",
        "\u25E4",
        "\u25E5"
      ]
    },
    arc: {
      interval: 100,
      frames: [
        "\u25DC",
        "\u25E0",
        "\u25DD",
        "\u25DE",
        "\u25E1",
        "\u25DF"
      ]
    },
    circle: {
      interval: 120,
      frames: [
        "\u25E1",
        "\u2299",
        "\u25E0"
      ]
    },
    squareCorners: {
      interval: 180,
      frames: [
        "\u25F0",
        "\u25F3",
        "\u25F2",
        "\u25F1"
      ]
    },
    circleQuarters: {
      interval: 120,
      frames: [
        "\u25F4",
        "\u25F7",
        "\u25F6",
        "\u25F5"
      ]
    },
    circleHalves: {
      interval: 50,
      frames: [
        "\u25D0",
        "\u25D3",
        "\u25D1",
        "\u25D2"
      ]
    },
    squish: {
      interval: 100,
      frames: [
        "\u256B",
        "\u256A"
      ]
    },
    toggle: {
      interval: 250,
      frames: [
        "\u22B6",
        "\u22B7"
      ]
    },
    toggle2: {
      interval: 80,
      frames: [
        "\u25AB",
        "\u25AA"
      ]
    },
    toggle3: {
      interval: 120,
      frames: [
        "\u25A1",
        "\u25A0"
      ]
    },
    toggle4: {
      interval: 100,
      frames: [
        "\u25A0",
        "\u25A1",
        "\u25AA",
        "\u25AB"
      ]
    },
    toggle5: {
      interval: 100,
      frames: [
        "\u25AE",
        "\u25AF"
      ]
    },
    toggle6: {
      interval: 300,
      frames: [
        "\u101D",
        "\u1040"
      ]
    },
    toggle7: {
      interval: 80,
      frames: [
        "\u29BE",
        "\u29BF"
      ]
    },
    toggle8: {
      interval: 100,
      frames: [
        "\u25CD",
        "\u25CC"
      ]
    },
    toggle9: {
      interval: 100,
      frames: [
        "\u25C9",
        "\u25CE"
      ]
    },
    toggle10: {
      interval: 100,
      frames: [
        "\u3282",
        "\u3280",
        "\u3281"
      ]
    },
    toggle11: {
      interval: 50,
      frames: [
        "\u29C7",
        "\u29C6"
      ]
    },
    toggle12: {
      interval: 120,
      frames: [
        "\u2617",
        "\u2616"
      ]
    },
    toggle13: {
      interval: 80,
      frames: [
        "=",
        "*",
        "-"
      ]
    },
    arrow: {
      interval: 100,
      frames: [
        "\u2190",
        "\u2196",
        "\u2191",
        "\u2197",
        "\u2192",
        "\u2198",
        "\u2193",
        "\u2199"
      ]
    },
    arrow2: {
      interval: 80,
      frames: [
        "\u2B06\uFE0F ",
        "\u2197\uFE0F ",
        "\u27A1\uFE0F ",
        "\u2198\uFE0F ",
        "\u2B07\uFE0F ",
        "\u2199\uFE0F ",
        "\u2B05\uFE0F ",
        "\u2196\uFE0F "
      ]
    },
    arrow3: {
      interval: 120,
      frames: [
        "\u25B9\u25B9\u25B9\u25B9\u25B9",
        "\u25B8\u25B9\u25B9\u25B9\u25B9",
        "\u25B9\u25B8\u25B9\u25B9\u25B9",
        "\u25B9\u25B9\u25B8\u25B9\u25B9",
        "\u25B9\u25B9\u25B9\u25B8\u25B9",
        "\u25B9\u25B9\u25B9\u25B9\u25B8"
      ]
    },
    bouncingBar: {
      interval: 80,
      frames: [
        "[    ]",
        "[=   ]",
        "[==  ]",
        "[=== ]",
        "[ ===]",
        "[  ==]",
        "[   =]",
        "[    ]",
        "[   =]",
        "[  ==]",
        "[ ===]",
        "[====]",
        "[=== ]",
        "[==  ]",
        "[=   ]"
      ]
    },
    bouncingBall: {
      interval: 80,
      frames: [
        "( \u25CF    )",
        "(  \u25CF   )",
        "(   \u25CF  )",
        "(    \u25CF )",
        "(     \u25CF)",
        "(    \u25CF )",
        "(   \u25CF  )",
        "(  \u25CF   )",
        "( \u25CF    )",
        "(\u25CF     )"
      ]
    },
    smiley: {
      interval: 200,
      frames: [
        "\u{1F604} ",
        "\u{1F61D} "
      ]
    },
    monkey: {
      interval: 300,
      frames: [
        "\u{1F648} ",
        "\u{1F648} ",
        "\u{1F649} ",
        "\u{1F64A} "
      ]
    },
    hearts: {
      interval: 100,
      frames: [
        "\u{1F49B} ",
        "\u{1F499} ",
        "\u{1F49C} ",
        "\u{1F49A} ",
        "\u2764\uFE0F "
      ]
    },
    clock: {
      interval: 100,
      frames: [
        "\u{1F55B} ",
        "\u{1F550} ",
        "\u{1F551} ",
        "\u{1F552} ",
        "\u{1F553} ",
        "\u{1F554} ",
        "\u{1F555} ",
        "\u{1F556} ",
        "\u{1F557} ",
        "\u{1F558} ",
        "\u{1F559} ",
        "\u{1F55A} "
      ]
    },
    earth: {
      interval: 180,
      frames: [
        "\u{1F30D} ",
        "\u{1F30E} ",
        "\u{1F30F} "
      ]
    },
    material: {
      interval: 17,
      frames: [
        "\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581",
        "\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581",
        "\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581",
        "\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581",
        "\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581",
        "\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581",
        "\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581",
        "\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581",
        "\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581",
        "\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581",
        "\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588",
        "\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588",
        "\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588",
        "\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588",
        "\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588",
        "\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588",
        "\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588",
        "\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588",
        "\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588",
        "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581",
        "\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581",
        "\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581",
        "\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581",
        "\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
        "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581"
      ]
    },
    moon: {
      interval: 80,
      frames: [
        "\u{1F311} ",
        "\u{1F312} ",
        "\u{1F313} ",
        "\u{1F314} ",
        "\u{1F315} ",
        "\u{1F316} ",
        "\u{1F317} ",
        "\u{1F318} "
      ]
    },
    runner: {
      interval: 140,
      frames: [
        "\u{1F6B6} ",
        "\u{1F3C3} "
      ]
    },
    pong: {
      interval: 80,
      frames: [
        "\u2590\u2802       \u258C",
        "\u2590\u2808       \u258C",
        "\u2590 \u2802      \u258C",
        "\u2590 \u2820      \u258C",
        "\u2590  \u2840     \u258C",
        "\u2590  \u2820     \u258C",
        "\u2590   \u2802    \u258C",
        "\u2590   \u2808    \u258C",
        "\u2590    \u2802   \u258C",
        "\u2590    \u2820   \u258C",
        "\u2590     \u2840  \u258C",
        "\u2590     \u2820  \u258C",
        "\u2590      \u2802 \u258C",
        "\u2590      \u2808 \u258C",
        "\u2590       \u2802\u258C",
        "\u2590       \u2820\u258C",
        "\u2590       \u2840\u258C",
        "\u2590      \u2820 \u258C",
        "\u2590      \u2802 \u258C",
        "\u2590     \u2808  \u258C",
        "\u2590     \u2802  \u258C",
        "\u2590    \u2820   \u258C",
        "\u2590    \u2840   \u258C",
        "\u2590   \u2820    \u258C",
        "\u2590   \u2802    \u258C",
        "\u2590  \u2808     \u258C",
        "\u2590  \u2802     \u258C",
        "\u2590 \u2820      \u258C",
        "\u2590 \u2840      \u258C",
        "\u2590\u2820       \u258C"
      ]
    },
    shark: {
      interval: 120,
      frames: [
        "\u2590|\\____________\u258C",
        "\u2590_|\\___________\u258C",
        "\u2590__|\\__________\u258C",
        "\u2590___|\\_________\u258C",
        "\u2590____|\\________\u258C",
        "\u2590_____|\\_______\u258C",
        "\u2590______|\\______\u258C",
        "\u2590_______|\\_____\u258C",
        "\u2590________|\\____\u258C",
        "\u2590_________|\\___\u258C",
        "\u2590__________|\\__\u258C",
        "\u2590___________|\\_\u258C",
        "\u2590____________|\\\u258C",
        "\u2590____________/|\u258C",
        "\u2590___________/|_\u258C",
        "\u2590__________/|__\u258C",
        "\u2590_________/|___\u258C",
        "\u2590________/|____\u258C",
        "\u2590_______/|_____\u258C",
        "\u2590______/|______\u258C",
        "\u2590_____/|_______\u258C",
        "\u2590____/|________\u258C",
        "\u2590___/|_________\u258C",
        "\u2590__/|__________\u258C",
        "\u2590_/|___________\u258C",
        "\u2590/|____________\u258C"
      ]
    },
    dqpb: {
      interval: 100,
      frames: [
        "d",
        "q",
        "p",
        "b"
      ]
    },
    weather: {
      interval: 100,
      frames: [
        "\u2600\uFE0F ",
        "\u2600\uFE0F ",
        "\u2600\uFE0F ",
        "\u{1F324} ",
        "\u26C5\uFE0F ",
        "\u{1F325} ",
        "\u2601\uFE0F ",
        "\u{1F327} ",
        "\u{1F328} ",
        "\u{1F327} ",
        "\u{1F328} ",
        "\u{1F327} ",
        "\u{1F328} ",
        "\u26C8 ",
        "\u{1F328} ",
        "\u{1F327} ",
        "\u{1F328} ",
        "\u2601\uFE0F ",
        "\u{1F325} ",
        "\u26C5\uFE0F ",
        "\u{1F324} ",
        "\u2600\uFE0F ",
        "\u2600\uFE0F "
      ]
    },
    christmas: {
      interval: 400,
      frames: [
        "\u{1F332}",
        "\u{1F384}"
      ]
    },
    grenade: {
      interval: 80,
      frames: [
        "\u060C   ",
        "\u2032   ",
        " \xB4 ",
        " \u203E ",
        "  \u2E0C",
        "  \u2E0A",
        "  |",
        "  \u204E",
        "  \u2055",
        " \u0DF4 ",
        "  \u2053",
        "   ",
        "   ",
        "   "
      ]
    },
    point: {
      interval: 125,
      frames: [
        "\u2219\u2219\u2219",
        "\u25CF\u2219\u2219",
        "\u2219\u25CF\u2219",
        "\u2219\u2219\u25CF",
        "\u2219\u2219\u2219"
      ]
    },
    layer: {
      interval: 150,
      frames: [
        "-",
        "=",
        "\u2261"
      ]
    },
    betaWave: {
      interval: 80,
      frames: [
        "\u03C1\u03B2\u03B2\u03B2\u03B2\u03B2\u03B2",
        "\u03B2\u03C1\u03B2\u03B2\u03B2\u03B2\u03B2",
        "\u03B2\u03B2\u03C1\u03B2\u03B2\u03B2\u03B2",
        "\u03B2\u03B2\u03B2\u03C1\u03B2\u03B2\u03B2",
        "\u03B2\u03B2\u03B2\u03B2\u03C1\u03B2\u03B2",
        "\u03B2\u03B2\u03B2\u03B2\u03B2\u03C1\u03B2",
        "\u03B2\u03B2\u03B2\u03B2\u03B2\u03B2\u03C1"
      ]
    },
    aesthetic: {
      interval: 80,
      frames: [
        "\u25B0\u25B1\u25B1\u25B1\u25B1\u25B1\u25B1",
        "\u25B0\u25B0\u25B1\u25B1\u25B1\u25B1\u25B1",
        "\u25B0\u25B0\u25B0\u25B1\u25B1\u25B1\u25B1",
        "\u25B0\u25B0\u25B0\u25B0\u25B1\u25B1\u25B1",
        "\u25B0\u25B0\u25B0\u25B0\u25B0\u25B1\u25B1",
        "\u25B0\u25B0\u25B0\u25B0\u25B0\u25B0\u25B1",
        "\u25B0\u25B0\u25B0\u25B0\u25B0\u25B0\u25B0",
        "\u25B0\u25B1\u25B1\u25B1\u25B1\u25B1\u25B1"
      ]
    }
  };
});

// node_modules/cli-spinners/index.js
var require_cli_spinners = __commonJS((exports2, module2) => {
  "use strict";
  var spinners = Object.assign({}, require_spinners());
  var spinnersList = Object.keys(spinners);
  Object.defineProperty(spinners, "random", {
    get() {
      const randomIndex = Math.floor(Math.random() * spinnersList.length);
      const spinnerName = spinnersList[randomIndex];
      return spinners[spinnerName];
    }
  });
  module2.exports = spinners;
  module2.exports.default = spinners;
});

// node_modules/log-symbols/index.js
var require_log_symbols = __commonJS((exports2, module2) => {
  "use strict";
  var chalk = require_source();
  var isSupported = process.platform !== "win32" || process.env.CI || process.env.TERM === "xterm-256color";
  var main = {
    info: chalk.blue("\u2139"),
    success: chalk.green("\u2714"),
    warning: chalk.yellow("\u26A0"),
    error: chalk.red("\u2716")
  };
  var fallbacks = {
    info: chalk.blue("i"),
    success: chalk.green("\u221A"),
    warning: chalk.yellow("\u203C"),
    error: chalk.red("\xD7")
  };
  module2.exports = isSupported ? main : fallbacks;
});

// node_modules/ansi-regex/index.js
var require_ansi_regex = __commonJS((exports2, module2) => {
  "use strict";
  module2.exports = ({onlyFirst = false} = {}) => {
    const pattern = [
      "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
      "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
    ].join("|");
    return new RegExp(pattern, onlyFirst ? void 0 : "g");
  };
});

// node_modules/strip-ansi/index.js
var require_strip_ansi = __commonJS((exports2, module2) => {
  "use strict";
  var ansiRegex = require_ansi_regex();
  module2.exports = (string2) => typeof string2 === "string" ? string2.replace(ansiRegex(), "") : string2;
});

// node_modules/clone/clone.js
var require_clone = __commonJS((exports2, module2) => {
  var clone2 = function() {
    "use strict";
    function clone3(parent, circular, depth, prototype) {
      var filter;
      if (typeof circular === "object") {
        depth = circular.depth;
        prototype = circular.prototype;
        filter = circular.filter;
        circular = circular.circular;
      }
      var allParents = [];
      var allChildren = [];
      var useBuffer = typeof Buffer != "undefined";
      if (typeof circular == "undefined")
        circular = true;
      if (typeof depth == "undefined")
        depth = Infinity;
      function _clone(parent2, depth2) {
        if (parent2 === null)
          return null;
        if (depth2 == 0)
          return parent2;
        var child;
        var proto;
        if (typeof parent2 != "object") {
          return parent2;
        }
        if (clone3.__isArray(parent2)) {
          child = [];
        } else if (clone3.__isRegExp(parent2)) {
          child = new RegExp(parent2.source, __getRegExpFlags(parent2));
          if (parent2.lastIndex)
            child.lastIndex = parent2.lastIndex;
        } else if (clone3.__isDate(parent2)) {
          child = new Date(parent2.getTime());
        } else if (useBuffer && Buffer.isBuffer(parent2)) {
          if (Buffer.allocUnsafe) {
            child = Buffer.allocUnsafe(parent2.length);
          } else {
            child = new Buffer(parent2.length);
          }
          parent2.copy(child);
          return child;
        } else {
          if (typeof prototype == "undefined") {
            proto = Object.getPrototypeOf(parent2);
            child = Object.create(proto);
          } else {
            child = Object.create(prototype);
            proto = prototype;
          }
        }
        if (circular) {
          var index = allParents.indexOf(parent2);
          if (index != -1) {
            return allChildren[index];
          }
          allParents.push(parent2);
          allChildren.push(child);
        }
        for (var i in parent2) {
          var attrs;
          if (proto) {
            attrs = Object.getOwnPropertyDescriptor(proto, i);
          }
          if (attrs && attrs.set == null) {
            continue;
          }
          child[i] = _clone(parent2[i], depth2 - 1);
        }
        return child;
      }
      return _clone(parent, depth);
    }
    clone3.clonePrototype = function clonePrototype(parent) {
      if (parent === null)
        return null;
      var c = function() {
      };
      c.prototype = parent;
      return new c();
    };
    function __objToStr(o) {
      return Object.prototype.toString.call(o);
    }
    ;
    clone3.__objToStr = __objToStr;
    function __isDate(o) {
      return typeof o === "object" && __objToStr(o) === "[object Date]";
    }
    ;
    clone3.__isDate = __isDate;
    function __isArray(o) {
      return typeof o === "object" && __objToStr(o) === "[object Array]";
    }
    ;
    clone3.__isArray = __isArray;
    function __isRegExp(o) {
      return typeof o === "object" && __objToStr(o) === "[object RegExp]";
    }
    ;
    clone3.__isRegExp = __isRegExp;
    function __getRegExpFlags(re) {
      var flags = "";
      if (re.global)
        flags += "g";
      if (re.ignoreCase)
        flags += "i";
      if (re.multiline)
        flags += "m";
      return flags;
    }
    ;
    clone3.__getRegExpFlags = __getRegExpFlags;
    return clone3;
  }();
  if (typeof module2 === "object" && module2.exports) {
    module2.exports = clone2;
  }
});

// node_modules/defaults/index.js
var require_defaults = __commonJS((exports2, module2) => {
  var clone2 = require_clone();
  module2.exports = function(options, defaults) {
    options = options || {};
    Object.keys(defaults).forEach(function(key) {
      if (typeof options[key] === "undefined") {
        options[key] = clone2(defaults[key]);
      }
    });
    return options;
  };
});

// node_modules/wcwidth/combining.js
var require_combining = __commonJS((exports2, module2) => {
  module2.exports = [
    [768, 879],
    [1155, 1158],
    [1160, 1161],
    [1425, 1469],
    [1471, 1471],
    [1473, 1474],
    [1476, 1477],
    [1479, 1479],
    [1536, 1539],
    [1552, 1557],
    [1611, 1630],
    [1648, 1648],
    [1750, 1764],
    [1767, 1768],
    [1770, 1773],
    [1807, 1807],
    [1809, 1809],
    [1840, 1866],
    [1958, 1968],
    [2027, 2035],
    [2305, 2306],
    [2364, 2364],
    [2369, 2376],
    [2381, 2381],
    [2385, 2388],
    [2402, 2403],
    [2433, 2433],
    [2492, 2492],
    [2497, 2500],
    [2509, 2509],
    [2530, 2531],
    [2561, 2562],
    [2620, 2620],
    [2625, 2626],
    [2631, 2632],
    [2635, 2637],
    [2672, 2673],
    [2689, 2690],
    [2748, 2748],
    [2753, 2757],
    [2759, 2760],
    [2765, 2765],
    [2786, 2787],
    [2817, 2817],
    [2876, 2876],
    [2879, 2879],
    [2881, 2883],
    [2893, 2893],
    [2902, 2902],
    [2946, 2946],
    [3008, 3008],
    [3021, 3021],
    [3134, 3136],
    [3142, 3144],
    [3146, 3149],
    [3157, 3158],
    [3260, 3260],
    [3263, 3263],
    [3270, 3270],
    [3276, 3277],
    [3298, 3299],
    [3393, 3395],
    [3405, 3405],
    [3530, 3530],
    [3538, 3540],
    [3542, 3542],
    [3633, 3633],
    [3636, 3642],
    [3655, 3662],
    [3761, 3761],
    [3764, 3769],
    [3771, 3772],
    [3784, 3789],
    [3864, 3865],
    [3893, 3893],
    [3895, 3895],
    [3897, 3897],
    [3953, 3966],
    [3968, 3972],
    [3974, 3975],
    [3984, 3991],
    [3993, 4028],
    [4038, 4038],
    [4141, 4144],
    [4146, 4146],
    [4150, 4151],
    [4153, 4153],
    [4184, 4185],
    [4448, 4607],
    [4959, 4959],
    [5906, 5908],
    [5938, 5940],
    [5970, 5971],
    [6002, 6003],
    [6068, 6069],
    [6071, 6077],
    [6086, 6086],
    [6089, 6099],
    [6109, 6109],
    [6155, 6157],
    [6313, 6313],
    [6432, 6434],
    [6439, 6440],
    [6450, 6450],
    [6457, 6459],
    [6679, 6680],
    [6912, 6915],
    [6964, 6964],
    [6966, 6970],
    [6972, 6972],
    [6978, 6978],
    [7019, 7027],
    [7616, 7626],
    [7678, 7679],
    [8203, 8207],
    [8234, 8238],
    [8288, 8291],
    [8298, 8303],
    [8400, 8431],
    [12330, 12335],
    [12441, 12442],
    [43014, 43014],
    [43019, 43019],
    [43045, 43046],
    [64286, 64286],
    [65024, 65039],
    [65056, 65059],
    [65279, 65279],
    [65529, 65531],
    [68097, 68099],
    [68101, 68102],
    [68108, 68111],
    [68152, 68154],
    [68159, 68159],
    [119143, 119145],
    [119155, 119170],
    [119173, 119179],
    [119210, 119213],
    [119362, 119364],
    [917505, 917505],
    [917536, 917631],
    [917760, 917999]
  ];
});

// node_modules/wcwidth/index.js
var require_wcwidth = __commonJS((exports2, module2) => {
  "use strict";
  var defaults = require_defaults();
  var combining = require_combining();
  var DEFAULTS = {
    nul: 0,
    control: 0
  };
  module2.exports = function wcwidth2(str) {
    return wcswidth(str, DEFAULTS);
  };
  module2.exports.config = function(opts) {
    opts = defaults(opts || {}, DEFAULTS);
    return function wcwidth2(str) {
      return wcswidth(str, opts);
    };
  };
  function wcswidth(str, opts) {
    if (typeof str !== "string")
      return wcwidth(str, opts);
    var s = 0;
    for (var i = 0; i < str.length; i++) {
      var n = wcwidth(str.charCodeAt(i), opts);
      if (n < 0)
        return -1;
      s += n;
    }
    return s;
  }
  function wcwidth(ucs, opts) {
    if (ucs === 0)
      return opts.nul;
    if (ucs < 32 || ucs >= 127 && ucs < 160)
      return opts.control;
    if (bisearch(ucs))
      return 0;
    return 1 + (ucs >= 4352 && (ucs <= 4447 || ucs == 9001 || ucs == 9002 || ucs >= 11904 && ucs <= 42191 && ucs != 12351 || ucs >= 44032 && ucs <= 55203 || ucs >= 63744 && ucs <= 64255 || ucs >= 65040 && ucs <= 65049 || ucs >= 65072 && ucs <= 65135 || ucs >= 65280 && ucs <= 65376 || ucs >= 65504 && ucs <= 65510 || ucs >= 131072 && ucs <= 196605 || ucs >= 196608 && ucs <= 262141));
  }
  function bisearch(ucs) {
    var min = 0;
    var max = combining.length - 1;
    var mid;
    if (ucs < combining[0][0] || ucs > combining[max][1])
      return false;
    while (max >= min) {
      mid = Math.floor((min + max) / 2);
      if (ucs > combining[mid][1])
        min = mid + 1;
      else if (ucs < combining[mid][0])
        max = mid - 1;
      else
        return true;
    }
    return false;
  }
});

// node_modules/is-interactive/index.js
var require_is_interactive = __commonJS((exports2, module2) => {
  "use strict";
  module2.exports = ({stream = process.stdout} = {}) => {
    return Boolean(stream && stream.isTTY && process.env.TERM !== "dumb" && !("CI" in process.env));
  };
});

// node_modules/bl/node_modules/readable-stream/lib/internal/streams/stream.js
var require_stream = __commonJS((exports2, module2) => {
  module2.exports = require("stream");
});

// node_modules/bl/node_modules/readable-stream/lib/internal/streams/buffer_list.js
var require_buffer_list = __commonJS((exports2, module2) => {
  "use strict";
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly)
        symbols = symbols.filter(function(sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
      keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      if (i % 2) {
        ownKeys(Object(source), true).forEach(function(key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function(key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }
    return target;
  }
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {value, enumerable: true, configurable: true, writable: true});
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor)
        descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps)
      _defineProperties(Constructor.prototype, protoProps);
    if (staticProps)
      _defineProperties(Constructor, staticProps);
    return Constructor;
  }
  var _require = require("buffer");
  var Buffer2 = _require.Buffer;
  var _require2 = require("util");
  var inspect2 = _require2.inspect;
  var custom = inspect2 && inspect2.custom || "inspect";
  function copyBuffer(src, target, offset) {
    Buffer2.prototype.copy.call(src, target, offset);
  }
  module2.exports = /* @__PURE__ */ function() {
    function BufferList() {
      _classCallCheck(this, BufferList);
      this.head = null;
      this.tail = null;
      this.length = 0;
    }
    _createClass(BufferList, [{
      key: "push",
      value: function push(v) {
        var entry = {
          data: v,
          next: null
        };
        if (this.length > 0)
          this.tail.next = entry;
        else
          this.head = entry;
        this.tail = entry;
        ++this.length;
      }
    }, {
      key: "unshift",
      value: function unshift(v) {
        var entry = {
          data: v,
          next: this.head
        };
        if (this.length === 0)
          this.tail = entry;
        this.head = entry;
        ++this.length;
      }
    }, {
      key: "shift",
      value: function shift() {
        if (this.length === 0)
          return;
        var ret = this.head.data;
        if (this.length === 1)
          this.head = this.tail = null;
        else
          this.head = this.head.next;
        --this.length;
        return ret;
      }
    }, {
      key: "clear",
      value: function clear() {
        this.head = this.tail = null;
        this.length = 0;
      }
    }, {
      key: "join",
      value: function join(s) {
        if (this.length === 0)
          return "";
        var p = this.head;
        var ret = "" + p.data;
        while (p = p.next) {
          ret += s + p.data;
        }
        return ret;
      }
    }, {
      key: "concat",
      value: function concat(n) {
        if (this.length === 0)
          return Buffer2.alloc(0);
        var ret = Buffer2.allocUnsafe(n >>> 0);
        var p = this.head;
        var i = 0;
        while (p) {
          copyBuffer(p.data, ret, i);
          i += p.data.length;
          p = p.next;
        }
        return ret;
      }
    }, {
      key: "consume",
      value: function consume(n, hasStrings) {
        var ret;
        if (n < this.head.data.length) {
          ret = this.head.data.slice(0, n);
          this.head.data = this.head.data.slice(n);
        } else if (n === this.head.data.length) {
          ret = this.shift();
        } else {
          ret = hasStrings ? this._getString(n) : this._getBuffer(n);
        }
        return ret;
      }
    }, {
      key: "first",
      value: function first() {
        return this.head.data;
      }
    }, {
      key: "_getString",
      value: function _getString(n) {
        var p = this.head;
        var c = 1;
        var ret = p.data;
        n -= ret.length;
        while (p = p.next) {
          var str = p.data;
          var nb = n > str.length ? str.length : n;
          if (nb === str.length)
            ret += str;
          else
            ret += str.slice(0, n);
          n -= nb;
          if (n === 0) {
            if (nb === str.length) {
              ++c;
              if (p.next)
                this.head = p.next;
              else
                this.head = this.tail = null;
            } else {
              this.head = p;
              p.data = str.slice(nb);
            }
            break;
          }
          ++c;
        }
        this.length -= c;
        return ret;
      }
    }, {
      key: "_getBuffer",
      value: function _getBuffer(n) {
        var ret = Buffer2.allocUnsafe(n);
        var p = this.head;
        var c = 1;
        p.data.copy(ret);
        n -= p.data.length;
        while (p = p.next) {
          var buf = p.data;
          var nb = n > buf.length ? buf.length : n;
          buf.copy(ret, ret.length - n, 0, nb);
          n -= nb;
          if (n === 0) {
            if (nb === buf.length) {
              ++c;
              if (p.next)
                this.head = p.next;
              else
                this.head = this.tail = null;
            } else {
              this.head = p;
              p.data = buf.slice(nb);
            }
            break;
          }
          ++c;
        }
        this.length -= c;
        return ret;
      }
    }, {
      key: custom,
      value: function value(_, options) {
        return inspect2(this, _objectSpread({}, options, {
          depth: 0,
          customInspect: false
        }));
      }
    }]);
    return BufferList;
  }();
});

// node_modules/bl/node_modules/readable-stream/lib/internal/streams/destroy.js
var require_destroy = __commonJS((exports2, module2) => {
  "use strict";
  function destroy(err, cb) {
    var _this = this;
    var readableDestroyed = this._readableState && this._readableState.destroyed;
    var writableDestroyed = this._writableState && this._writableState.destroyed;
    if (readableDestroyed || writableDestroyed) {
      if (cb) {
        cb(err);
      } else if (err) {
        if (!this._writableState) {
          process.nextTick(emitErrorNT, this, err);
        } else if (!this._writableState.errorEmitted) {
          this._writableState.errorEmitted = true;
          process.nextTick(emitErrorNT, this, err);
        }
      }
      return this;
    }
    if (this._readableState) {
      this._readableState.destroyed = true;
    }
    if (this._writableState) {
      this._writableState.destroyed = true;
    }
    this._destroy(err || null, function(err2) {
      if (!cb && err2) {
        if (!_this._writableState) {
          process.nextTick(emitErrorAndCloseNT, _this, err2);
        } else if (!_this._writableState.errorEmitted) {
          _this._writableState.errorEmitted = true;
          process.nextTick(emitErrorAndCloseNT, _this, err2);
        } else {
          process.nextTick(emitCloseNT, _this);
        }
      } else if (cb) {
        process.nextTick(emitCloseNT, _this);
        cb(err2);
      } else {
        process.nextTick(emitCloseNT, _this);
      }
    });
    return this;
  }
  function emitErrorAndCloseNT(self2, err) {
    emitErrorNT(self2, err);
    emitCloseNT(self2);
  }
  function emitCloseNT(self2) {
    if (self2._writableState && !self2._writableState.emitClose)
      return;
    if (self2._readableState && !self2._readableState.emitClose)
      return;
    self2.emit("close");
  }
  function undestroy() {
    if (this._readableState) {
      this._readableState.destroyed = false;
      this._readableState.reading = false;
      this._readableState.ended = false;
      this._readableState.endEmitted = false;
    }
    if (this._writableState) {
      this._writableState.destroyed = false;
      this._writableState.ended = false;
      this._writableState.ending = false;
      this._writableState.finalCalled = false;
      this._writableState.prefinished = false;
      this._writableState.finished = false;
      this._writableState.errorEmitted = false;
    }
  }
  function emitErrorNT(self2, err) {
    self2.emit("error", err);
  }
  function errorOrDestroy(stream, err) {
    var rState = stream._readableState;
    var wState = stream._writableState;
    if (rState && rState.autoDestroy || wState && wState.autoDestroy)
      stream.destroy(err);
    else
      stream.emit("error", err);
  }
  module2.exports = {
    destroy,
    undestroy,
    errorOrDestroy
  };
});

// node_modules/bl/node_modules/readable-stream/errors.js
var require_errors = __commonJS((exports2, module2) => {
  "use strict";
  var codes = {};
  function createErrorType(code, message2, Base) {
    if (!Base) {
      Base = Error;
    }
    function getMessage(arg1, arg2, arg3) {
      if (typeof message2 === "string") {
        return message2;
      } else {
        return message2(arg1, arg2, arg3);
      }
    }
    class NodeError extends Base {
      constructor(arg1, arg2, arg3) {
        super(getMessage(arg1, arg2, arg3));
      }
    }
    NodeError.prototype.name = Base.name;
    NodeError.prototype.code = code;
    codes[code] = NodeError;
  }
  function oneOf(expected, thing) {
    if (Array.isArray(expected)) {
      const len = expected.length;
      expected = expected.map((i) => String(i));
      if (len > 2) {
        return `one of ${thing} ${expected.slice(0, len - 1).join(", ")}, or ` + expected[len - 1];
      } else if (len === 2) {
        return `one of ${thing} ${expected[0]} or ${expected[1]}`;
      } else {
        return `of ${thing} ${expected[0]}`;
      }
    } else {
      return `of ${thing} ${String(expected)}`;
    }
  }
  function startsWith(str, search, pos) {
    return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
  }
  function endsWith(str, search, this_len) {
    if (this_len === void 0 || this_len > str.length) {
      this_len = str.length;
    }
    return str.substring(this_len - search.length, this_len) === search;
  }
  function includes(str, search, start) {
    if (typeof start !== "number") {
      start = 0;
    }
    if (start + search.length > str.length) {
      return false;
    } else {
      return str.indexOf(search, start) !== -1;
    }
  }
  createErrorType("ERR_INVALID_OPT_VALUE", function(name, value) {
    return 'The value "' + value + '" is invalid for option "' + name + '"';
  }, TypeError);
  createErrorType("ERR_INVALID_ARG_TYPE", function(name, expected, actual) {
    let determiner;
    if (typeof expected === "string" && startsWith(expected, "not ")) {
      determiner = "must not be";
      expected = expected.replace(/^not /, "");
    } else {
      determiner = "must be";
    }
    let msg;
    if (endsWith(name, " argument")) {
      msg = `The ${name} ${determiner} ${oneOf(expected, "type")}`;
    } else {
      const type = includes(name, ".") ? "property" : "argument";
      msg = `The "${name}" ${type} ${determiner} ${oneOf(expected, "type")}`;
    }
    msg += `. Received type ${typeof actual}`;
    return msg;
  }, TypeError);
  createErrorType("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF");
  createErrorType("ERR_METHOD_NOT_IMPLEMENTED", function(name) {
    return "The " + name + " method is not implemented";
  });
  createErrorType("ERR_STREAM_PREMATURE_CLOSE", "Premature close");
  createErrorType("ERR_STREAM_DESTROYED", function(name) {
    return "Cannot call " + name + " after a stream was destroyed";
  });
  createErrorType("ERR_MULTIPLE_CALLBACK", "Callback called multiple times");
  createErrorType("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable");
  createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");
  createErrorType("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError);
  createErrorType("ERR_UNKNOWN_ENCODING", function(arg) {
    return "Unknown encoding: " + arg;
  }, TypeError);
  createErrorType("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event");
  module2.exports.codes = codes;
});

// node_modules/bl/node_modules/readable-stream/lib/internal/streams/state.js
var require_state = __commonJS((exports2, module2) => {
  "use strict";
  var ERR_INVALID_OPT_VALUE = require_errors().codes.ERR_INVALID_OPT_VALUE;
  function highWaterMarkFrom(options, isDuplex, duplexKey) {
    return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
  }
  function getHighWaterMark(state, options, duplexKey, isDuplex) {
    var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
    if (hwm != null) {
      if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
        var name = isDuplex ? duplexKey : "highWaterMark";
        throw new ERR_INVALID_OPT_VALUE(name, hwm);
      }
      return Math.floor(hwm);
    }
    return state.objectMode ? 16 : 16 * 1024;
  }
  module2.exports = {
    getHighWaterMark
  };
});

// node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS((exports2, module2) => {
  if (typeof Object.create === "function") {
    module2.exports = function inherits(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
      }
    };
  } else {
    module2.exports = function inherits(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function() {
        };
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor();
        ctor.prototype.constructor = ctor;
      }
    };
  }
});

// node_modules/inherits/inherits.js
var require_inherits = __commonJS((exports2, module2) => {
  try {
    util2 = require("util");
    if (typeof util2.inherits !== "function")
      throw "";
    module2.exports = util2.inherits;
  } catch (e) {
    module2.exports = require_inherits_browser();
  }
  var util2;
});

// node_modules/util-deprecate/node.js
var require_node = __commonJS((exports2, module2) => {
  module2.exports = require("util").deprecate;
});

// node_modules/bl/node_modules/readable-stream/lib/_stream_writable.js
var require_stream_writable = __commonJS((exports2, module2) => {
  "use strict";
  module2.exports = Writable;
  function CorkedRequest(state) {
    var _this = this;
    this.next = null;
    this.entry = null;
    this.finish = function() {
      onCorkedFinish(_this, state);
    };
  }
  var Duplex;
  Writable.WritableState = WritableState;
  var internalUtil = {
    deprecate: require_node()
  };
  var Stream = require_stream();
  var Buffer2 = require("buffer").Buffer;
  var OurUint8Array = global.Uint8Array || function() {
  };
  function _uint8ArrayToBuffer(chunk) {
    return Buffer2.from(chunk);
  }
  function _isUint8Array(obj) {
    return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
  }
  var destroyImpl = require_destroy();
  var _require = require_state();
  var getHighWaterMark = _require.getHighWaterMark;
  var _require$codes = require_errors().codes;
  var ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE;
  var ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED;
  var ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK;
  var ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE;
  var ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
  var ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES;
  var ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END;
  var ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;
  var errorOrDestroy = destroyImpl.errorOrDestroy;
  require_inherits()(Writable, Stream);
  function nop() {
  }
  function WritableState(options, stream, isDuplex) {
    Duplex = Duplex || require_stream_duplex();
    options = options || {};
    if (typeof isDuplex !== "boolean")
      isDuplex = stream instanceof Duplex;
    this.objectMode = !!options.objectMode;
    if (isDuplex)
      this.objectMode = this.objectMode || !!options.writableObjectMode;
    this.highWaterMark = getHighWaterMark(this, options, "writableHighWaterMark", isDuplex);
    this.finalCalled = false;
    this.needDrain = false;
    this.ending = false;
    this.ended = false;
    this.finished = false;
    this.destroyed = false;
    var noDecode = options.decodeStrings === false;
    this.decodeStrings = !noDecode;
    this.defaultEncoding = options.defaultEncoding || "utf8";
    this.length = 0;
    this.writing = false;
    this.corked = 0;
    this.sync = true;
    this.bufferProcessing = false;
    this.onwrite = function(er) {
      onwrite(stream, er);
    };
    this.writecb = null;
    this.writelen = 0;
    this.bufferedRequest = null;
    this.lastBufferedRequest = null;
    this.pendingcb = 0;
    this.prefinished = false;
    this.errorEmitted = false;
    this.emitClose = options.emitClose !== false;
    this.autoDestroy = !!options.autoDestroy;
    this.bufferedRequestCount = 0;
    this.corkedRequestsFree = new CorkedRequest(this);
  }
  WritableState.prototype.getBuffer = function getBuffer() {
    var current = this.bufferedRequest;
    var out = [];
    while (current) {
      out.push(current);
      current = current.next;
    }
    return out;
  };
  (function() {
    try {
      Object.defineProperty(WritableState.prototype, "buffer", {
        get: internalUtil.deprecate(function writableStateBufferGetter() {
          return this.getBuffer();
        }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
      });
    } catch (_) {
    }
  })();
  var realHasInstance;
  if (typeof Symbol === "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === "function") {
    realHasInstance = Function.prototype[Symbol.hasInstance];
    Object.defineProperty(Writable, Symbol.hasInstance, {
      value: function value(object) {
        if (realHasInstance.call(this, object))
          return true;
        if (this !== Writable)
          return false;
        return object && object._writableState instanceof WritableState;
      }
    });
  } else {
    realHasInstance = function realHasInstance2(object) {
      return object instanceof this;
    };
  }
  function Writable(options) {
    Duplex = Duplex || require_stream_duplex();
    var isDuplex = this instanceof Duplex;
    if (!isDuplex && !realHasInstance.call(Writable, this))
      return new Writable(options);
    this._writableState = new WritableState(options, this, isDuplex);
    this.writable = true;
    if (options) {
      if (typeof options.write === "function")
        this._write = options.write;
      if (typeof options.writev === "function")
        this._writev = options.writev;
      if (typeof options.destroy === "function")
        this._destroy = options.destroy;
      if (typeof options.final === "function")
        this._final = options.final;
    }
    Stream.call(this);
  }
  Writable.prototype.pipe = function() {
    errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
  };
  function writeAfterEnd(stream, cb) {
    var er = new ERR_STREAM_WRITE_AFTER_END();
    errorOrDestroy(stream, er);
    process.nextTick(cb, er);
  }
  function validChunk(stream, state, chunk, cb) {
    var er;
    if (chunk === null) {
      er = new ERR_STREAM_NULL_VALUES();
    } else if (typeof chunk !== "string" && !state.objectMode) {
      er = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer"], chunk);
    }
    if (er) {
      errorOrDestroy(stream, er);
      process.nextTick(cb, er);
      return false;
    }
    return true;
  }
  Writable.prototype.write = function(chunk, encoding, cb) {
    var state = this._writableState;
    var ret = false;
    var isBuf = !state.objectMode && _isUint8Array(chunk);
    if (isBuf && !Buffer2.isBuffer(chunk)) {
      chunk = _uint8ArrayToBuffer(chunk);
    }
    if (typeof encoding === "function") {
      cb = encoding;
      encoding = null;
    }
    if (isBuf)
      encoding = "buffer";
    else if (!encoding)
      encoding = state.defaultEncoding;
    if (typeof cb !== "function")
      cb = nop;
    if (state.ending)
      writeAfterEnd(this, cb);
    else if (isBuf || validChunk(this, state, chunk, cb)) {
      state.pendingcb++;
      ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
    }
    return ret;
  };
  Writable.prototype.cork = function() {
    this._writableState.corked++;
  };
  Writable.prototype.uncork = function() {
    var state = this._writableState;
    if (state.corked) {
      state.corked--;
      if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest)
        clearBuffer(this, state);
    }
  };
  Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
    if (typeof encoding === "string")
      encoding = encoding.toLowerCase();
    if (!(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((encoding + "").toLowerCase()) > -1))
      throw new ERR_UNKNOWN_ENCODING(encoding);
    this._writableState.defaultEncoding = encoding;
    return this;
  };
  Object.defineProperty(Writable.prototype, "writableBuffer", {
    enumerable: false,
    get: function get() {
      return this._writableState && this._writableState.getBuffer();
    }
  });
  function decodeChunk(state, chunk, encoding) {
    if (!state.objectMode && state.decodeStrings !== false && typeof chunk === "string") {
      chunk = Buffer2.from(chunk, encoding);
    }
    return chunk;
  }
  Object.defineProperty(Writable.prototype, "writableHighWaterMark", {
    enumerable: false,
    get: function get() {
      return this._writableState.highWaterMark;
    }
  });
  function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
    if (!isBuf) {
      var newChunk = decodeChunk(state, chunk, encoding);
      if (chunk !== newChunk) {
        isBuf = true;
        encoding = "buffer";
        chunk = newChunk;
      }
    }
    var len = state.objectMode ? 1 : chunk.length;
    state.length += len;
    var ret = state.length < state.highWaterMark;
    if (!ret)
      state.needDrain = true;
    if (state.writing || state.corked) {
      var last = state.lastBufferedRequest;
      state.lastBufferedRequest = {
        chunk,
        encoding,
        isBuf,
        callback: cb,
        next: null
      };
      if (last) {
        last.next = state.lastBufferedRequest;
      } else {
        state.bufferedRequest = state.lastBufferedRequest;
      }
      state.bufferedRequestCount += 1;
    } else {
      doWrite(stream, state, false, len, chunk, encoding, cb);
    }
    return ret;
  }
  function doWrite(stream, state, writev, len, chunk, encoding, cb) {
    state.writelen = len;
    state.writecb = cb;
    state.writing = true;
    state.sync = true;
    if (state.destroyed)
      state.onwrite(new ERR_STREAM_DESTROYED("write"));
    else if (writev)
      stream._writev(chunk, state.onwrite);
    else
      stream._write(chunk, encoding, state.onwrite);
    state.sync = false;
  }
  function onwriteError(stream, state, sync, er, cb) {
    --state.pendingcb;
    if (sync) {
      process.nextTick(cb, er);
      process.nextTick(finishMaybe, stream, state);
      stream._writableState.errorEmitted = true;
      errorOrDestroy(stream, er);
    } else {
      cb(er);
      stream._writableState.errorEmitted = true;
      errorOrDestroy(stream, er);
      finishMaybe(stream, state);
    }
  }
  function onwriteStateUpdate(state) {
    state.writing = false;
    state.writecb = null;
    state.length -= state.writelen;
    state.writelen = 0;
  }
  function onwrite(stream, er) {
    var state = stream._writableState;
    var sync = state.sync;
    var cb = state.writecb;
    if (typeof cb !== "function")
      throw new ERR_MULTIPLE_CALLBACK();
    onwriteStateUpdate(state);
    if (er)
      onwriteError(stream, state, sync, er, cb);
    else {
      var finished = needFinish(state) || stream.destroyed;
      if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
        clearBuffer(stream, state);
      }
      if (sync) {
        process.nextTick(afterWrite, stream, state, finished, cb);
      } else {
        afterWrite(stream, state, finished, cb);
      }
    }
  }
  function afterWrite(stream, state, finished, cb) {
    if (!finished)
      onwriteDrain(stream, state);
    state.pendingcb--;
    cb();
    finishMaybe(stream, state);
  }
  function onwriteDrain(stream, state) {
    if (state.length === 0 && state.needDrain) {
      state.needDrain = false;
      stream.emit("drain");
    }
  }
  function clearBuffer(stream, state) {
    state.bufferProcessing = true;
    var entry = state.bufferedRequest;
    if (stream._writev && entry && entry.next) {
      var l = state.bufferedRequestCount;
      var buffer = new Array(l);
      var holder = state.corkedRequestsFree;
      holder.entry = entry;
      var count = 0;
      var allBuffers = true;
      while (entry) {
        buffer[count] = entry;
        if (!entry.isBuf)
          allBuffers = false;
        entry = entry.next;
        count += 1;
      }
      buffer.allBuffers = allBuffers;
      doWrite(stream, state, true, state.length, buffer, "", holder.finish);
      state.pendingcb++;
      state.lastBufferedRequest = null;
      if (holder.next) {
        state.corkedRequestsFree = holder.next;
        holder.next = null;
      } else {
        state.corkedRequestsFree = new CorkedRequest(state);
      }
      state.bufferedRequestCount = 0;
    } else {
      while (entry) {
        var chunk = entry.chunk;
        var encoding = entry.encoding;
        var cb = entry.callback;
        var len = state.objectMode ? 1 : chunk.length;
        doWrite(stream, state, false, len, chunk, encoding, cb);
        entry = entry.next;
        state.bufferedRequestCount--;
        if (state.writing) {
          break;
        }
      }
      if (entry === null)
        state.lastBufferedRequest = null;
    }
    state.bufferedRequest = entry;
    state.bufferProcessing = false;
  }
  Writable.prototype._write = function(chunk, encoding, cb) {
    cb(new ERR_METHOD_NOT_IMPLEMENTED("_write()"));
  };
  Writable.prototype._writev = null;
  Writable.prototype.end = function(chunk, encoding, cb) {
    var state = this._writableState;
    if (typeof chunk === "function") {
      cb = chunk;
      chunk = null;
      encoding = null;
    } else if (typeof encoding === "function") {
      cb = encoding;
      encoding = null;
    }
    if (chunk !== null && chunk !== void 0)
      this.write(chunk, encoding);
    if (state.corked) {
      state.corked = 1;
      this.uncork();
    }
    if (!state.ending)
      endWritable(this, state, cb);
    return this;
  };
  Object.defineProperty(Writable.prototype, "writableLength", {
    enumerable: false,
    get: function get() {
      return this._writableState.length;
    }
  });
  function needFinish(state) {
    return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
  }
  function callFinal(stream, state) {
    stream._final(function(err) {
      state.pendingcb--;
      if (err) {
        errorOrDestroy(stream, err);
      }
      state.prefinished = true;
      stream.emit("prefinish");
      finishMaybe(stream, state);
    });
  }
  function prefinish(stream, state) {
    if (!state.prefinished && !state.finalCalled) {
      if (typeof stream._final === "function" && !state.destroyed) {
        state.pendingcb++;
        state.finalCalled = true;
        process.nextTick(callFinal, stream, state);
      } else {
        state.prefinished = true;
        stream.emit("prefinish");
      }
    }
  }
  function finishMaybe(stream, state) {
    var need = needFinish(state);
    if (need) {
      prefinish(stream, state);
      if (state.pendingcb === 0) {
        state.finished = true;
        stream.emit("finish");
        if (state.autoDestroy) {
          var rState = stream._readableState;
          if (!rState || rState.autoDestroy && rState.endEmitted) {
            stream.destroy();
          }
        }
      }
    }
    return need;
  }
  function endWritable(stream, state, cb) {
    state.ending = true;
    finishMaybe(stream, state);
    if (cb) {
      if (state.finished)
        process.nextTick(cb);
      else
        stream.once("finish", cb);
    }
    state.ended = true;
    stream.writable = false;
  }
  function onCorkedFinish(corkReq, state, err) {
    var entry = corkReq.entry;
    corkReq.entry = null;
    while (entry) {
      var cb = entry.callback;
      state.pendingcb--;
      cb(err);
      entry = entry.next;
    }
    state.corkedRequestsFree.next = corkReq;
  }
  Object.defineProperty(Writable.prototype, "destroyed", {
    enumerable: false,
    get: function get() {
      if (this._writableState === void 0) {
        return false;
      }
      return this._writableState.destroyed;
    },
    set: function set(value) {
      if (!this._writableState) {
        return;
      }
      this._writableState.destroyed = value;
    }
  });
  Writable.prototype.destroy = destroyImpl.destroy;
  Writable.prototype._undestroy = destroyImpl.undestroy;
  Writable.prototype._destroy = function(err, cb) {
    cb(err);
  };
});

// node_modules/bl/node_modules/readable-stream/lib/_stream_duplex.js
var require_stream_duplex = __commonJS((exports2, module2) => {
  "use strict";
  var objectKeys = Object.keys || function(obj) {
    var keys2 = [];
    for (var key in obj) {
      keys2.push(key);
    }
    return keys2;
  };
  module2.exports = Duplex;
  var Readable = require_stream_readable();
  var Writable = require_stream_writable();
  require_inherits()(Duplex, Readable);
  {
    keys = objectKeys(Writable.prototype);
    for (var v = 0; v < keys.length; v++) {
      method = keys[v];
      if (!Duplex.prototype[method])
        Duplex.prototype[method] = Writable.prototype[method];
    }
  }
  var keys;
  var method;
  function Duplex(options) {
    if (!(this instanceof Duplex))
      return new Duplex(options);
    Readable.call(this, options);
    Writable.call(this, options);
    this.allowHalfOpen = true;
    if (options) {
      if (options.readable === false)
        this.readable = false;
      if (options.writable === false)
        this.writable = false;
      if (options.allowHalfOpen === false) {
        this.allowHalfOpen = false;
        this.once("end", onend);
      }
    }
  }
  Object.defineProperty(Duplex.prototype, "writableHighWaterMark", {
    enumerable: false,
    get: function get() {
      return this._writableState.highWaterMark;
    }
  });
  Object.defineProperty(Duplex.prototype, "writableBuffer", {
    enumerable: false,
    get: function get() {
      return this._writableState && this._writableState.getBuffer();
    }
  });
  Object.defineProperty(Duplex.prototype, "writableLength", {
    enumerable: false,
    get: function get() {
      return this._writableState.length;
    }
  });
  function onend() {
    if (this._writableState.ended)
      return;
    process.nextTick(onEndNT, this);
  }
  function onEndNT(self2) {
    self2.end();
  }
  Object.defineProperty(Duplex.prototype, "destroyed", {
    enumerable: false,
    get: function get() {
      if (this._readableState === void 0 || this._writableState === void 0) {
        return false;
      }
      return this._readableState.destroyed && this._writableState.destroyed;
    },
    set: function set(value) {
      if (this._readableState === void 0 || this._writableState === void 0) {
        return;
      }
      this._readableState.destroyed = value;
      this._writableState.destroyed = value;
    }
  });
});

// node_modules/bl/node_modules/readable-stream/lib/internal/streams/end-of-stream.js
var require_end_of_stream = __commonJS((exports2, module2) => {
  "use strict";
  var ERR_STREAM_PREMATURE_CLOSE = require_errors().codes.ERR_STREAM_PREMATURE_CLOSE;
  function once(callback) {
    var called = false;
    return function() {
      if (called)
        return;
      called = true;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      callback.apply(this, args);
    };
  }
  function noop() {
  }
  function isRequest(stream) {
    return stream.setHeader && typeof stream.abort === "function";
  }
  function eos(stream, opts, callback) {
    if (typeof opts === "function")
      return eos(stream, null, opts);
    if (!opts)
      opts = {};
    callback = once(callback || noop);
    var readable = opts.readable || opts.readable !== false && stream.readable;
    var writable = opts.writable || opts.writable !== false && stream.writable;
    var onlegacyfinish = function onlegacyfinish2() {
      if (!stream.writable)
        onfinish();
    };
    var writableEnded = stream._writableState && stream._writableState.finished;
    var onfinish = function onfinish2() {
      writable = false;
      writableEnded = true;
      if (!readable)
        callback.call(stream);
    };
    var readableEnded = stream._readableState && stream._readableState.endEmitted;
    var onend = function onend2() {
      readable = false;
      readableEnded = true;
      if (!writable)
        callback.call(stream);
    };
    var onerror = function onerror2(err) {
      callback.call(stream, err);
    };
    var onclose = function onclose2() {
      var err;
      if (readable && !readableEnded) {
        if (!stream._readableState || !stream._readableState.ended)
          err = new ERR_STREAM_PREMATURE_CLOSE();
        return callback.call(stream, err);
      }
      if (writable && !writableEnded) {
        if (!stream._writableState || !stream._writableState.ended)
          err = new ERR_STREAM_PREMATURE_CLOSE();
        return callback.call(stream, err);
      }
    };
    var onrequest = function onrequest2() {
      stream.req.on("finish", onfinish);
    };
    if (isRequest(stream)) {
      stream.on("complete", onfinish);
      stream.on("abort", onclose);
      if (stream.req)
        onrequest();
      else
        stream.on("request", onrequest);
    } else if (writable && !stream._writableState) {
      stream.on("end", onlegacyfinish);
      stream.on("close", onlegacyfinish);
    }
    stream.on("end", onend);
    stream.on("finish", onfinish);
    if (opts.error !== false)
      stream.on("error", onerror);
    stream.on("close", onclose);
    return function() {
      stream.removeListener("complete", onfinish);
      stream.removeListener("abort", onclose);
      stream.removeListener("request", onrequest);
      if (stream.req)
        stream.req.removeListener("finish", onfinish);
      stream.removeListener("end", onlegacyfinish);
      stream.removeListener("close", onlegacyfinish);
      stream.removeListener("finish", onfinish);
      stream.removeListener("end", onend);
      stream.removeListener("error", onerror);
      stream.removeListener("close", onclose);
    };
  }
  module2.exports = eos;
});

// node_modules/bl/node_modules/readable-stream/lib/internal/streams/async_iterator.js
var require_async_iterator = __commonJS((exports2, module2) => {
  "use strict";
  var _Object$setPrototypeO;
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {value, enumerable: true, configurable: true, writable: true});
    } else {
      obj[key] = value;
    }
    return obj;
  }
  var finished = require_end_of_stream();
  var kLastResolve = Symbol("lastResolve");
  var kLastReject = Symbol("lastReject");
  var kError = Symbol("error");
  var kEnded = Symbol("ended");
  var kLastPromise = Symbol("lastPromise");
  var kHandlePromise = Symbol("handlePromise");
  var kStream = Symbol("stream");
  function createIterResult(value, done) {
    return {
      value,
      done
    };
  }
  function readAndResolve(iter) {
    var resolve2 = iter[kLastResolve];
    if (resolve2 !== null) {
      var data = iter[kStream].read();
      if (data !== null) {
        iter[kLastPromise] = null;
        iter[kLastResolve] = null;
        iter[kLastReject] = null;
        resolve2(createIterResult(data, false));
      }
    }
  }
  function onReadable(iter) {
    process.nextTick(readAndResolve, iter);
  }
  function wrapForNext(lastPromise, iter) {
    return function(resolve2, reject) {
      lastPromise.then(function() {
        if (iter[kEnded]) {
          resolve2(createIterResult(void 0, true));
          return;
        }
        iter[kHandlePromise](resolve2, reject);
      }, reject);
    };
  }
  var AsyncIteratorPrototype = Object.getPrototypeOf(function() {
  });
  var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
    get stream() {
      return this[kStream];
    },
    next: function next() {
      var _this = this;
      var error = this[kError];
      if (error !== null) {
        return Promise.reject(error);
      }
      if (this[kEnded]) {
        return Promise.resolve(createIterResult(void 0, true));
      }
      if (this[kStream].destroyed) {
        return new Promise(function(resolve2, reject) {
          process.nextTick(function() {
            if (_this[kError]) {
              reject(_this[kError]);
            } else {
              resolve2(createIterResult(void 0, true));
            }
          });
        });
      }
      var lastPromise = this[kLastPromise];
      var promise;
      if (lastPromise) {
        promise = new Promise(wrapForNext(lastPromise, this));
      } else {
        var data = this[kStream].read();
        if (data !== null) {
          return Promise.resolve(createIterResult(data, false));
        }
        promise = new Promise(this[kHandlePromise]);
      }
      this[kLastPromise] = promise;
      return promise;
    }
  }, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function() {
    return this;
  }), _defineProperty(_Object$setPrototypeO, "return", function _return() {
    var _this2 = this;
    return new Promise(function(resolve2, reject) {
      _this2[kStream].destroy(null, function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve2(createIterResult(void 0, true));
      });
    });
  }), _Object$setPrototypeO), AsyncIteratorPrototype);
  var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator2(stream) {
    var _Object$create;
    var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
      value: stream,
      writable: true
    }), _defineProperty(_Object$create, kLastResolve, {
      value: null,
      writable: true
    }), _defineProperty(_Object$create, kLastReject, {
      value: null,
      writable: true
    }), _defineProperty(_Object$create, kError, {
      value: null,
      writable: true
    }), _defineProperty(_Object$create, kEnded, {
      value: stream._readableState.endEmitted,
      writable: true
    }), _defineProperty(_Object$create, kHandlePromise, {
      value: function value(resolve2, reject) {
        var data = iterator[kStream].read();
        if (data) {
          iterator[kLastPromise] = null;
          iterator[kLastResolve] = null;
          iterator[kLastReject] = null;
          resolve2(createIterResult(data, false));
        } else {
          iterator[kLastResolve] = resolve2;
          iterator[kLastReject] = reject;
        }
      },
      writable: true
    }), _Object$create));
    iterator[kLastPromise] = null;
    finished(stream, function(err) {
      if (err && err.code !== "ERR_STREAM_PREMATURE_CLOSE") {
        var reject = iterator[kLastReject];
        if (reject !== null) {
          iterator[kLastPromise] = null;
          iterator[kLastResolve] = null;
          iterator[kLastReject] = null;
          reject(err);
        }
        iterator[kError] = err;
        return;
      }
      var resolve2 = iterator[kLastResolve];
      if (resolve2 !== null) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        resolve2(createIterResult(void 0, true));
      }
      iterator[kEnded] = true;
    });
    stream.on("readable", onReadable.bind(null, iterator));
    return iterator;
  };
  module2.exports = createReadableStreamAsyncIterator;
});

// node_modules/bl/node_modules/readable-stream/lib/internal/streams/from.js
var require_from = __commonJS((exports2, module2) => {
  "use strict";
  function asyncGeneratorStep(gen, resolve2, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }
    if (info.done) {
      resolve2(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }
  function _asyncToGenerator(fn) {
    return function() {
      var self2 = this, args = arguments;
      return new Promise(function(resolve2, reject) {
        var gen = fn.apply(self2, args);
        function _next(value) {
          asyncGeneratorStep(gen, resolve2, reject, _next, _throw, "next", value);
        }
        function _throw(err) {
          asyncGeneratorStep(gen, resolve2, reject, _next, _throw, "throw", err);
        }
        _next(void 0);
      });
    };
  }
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly)
        symbols = symbols.filter(function(sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
      keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      if (i % 2) {
        ownKeys(Object(source), true).forEach(function(key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function(key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }
    return target;
  }
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {value, enumerable: true, configurable: true, writable: true});
    } else {
      obj[key] = value;
    }
    return obj;
  }
  var ERR_INVALID_ARG_TYPE = require_errors().codes.ERR_INVALID_ARG_TYPE;
  function from(Readable, iterable, opts) {
    var iterator;
    if (iterable && typeof iterable.next === "function") {
      iterator = iterable;
    } else if (iterable && iterable[Symbol.asyncIterator])
      iterator = iterable[Symbol.asyncIterator]();
    else if (iterable && iterable[Symbol.iterator])
      iterator = iterable[Symbol.iterator]();
    else
      throw new ERR_INVALID_ARG_TYPE("iterable", ["Iterable"], iterable);
    var readable = new Readable(_objectSpread({
      objectMode: true
    }, opts));
    var reading = false;
    readable._read = function() {
      if (!reading) {
        reading = true;
        next();
      }
    };
    function next() {
      return _next2.apply(this, arguments);
    }
    function _next2() {
      _next2 = _asyncToGenerator(function* () {
        try {
          var _ref = yield iterator.next(), value = _ref.value, done = _ref.done;
          if (done) {
            readable.push(null);
          } else if (readable.push(yield value)) {
            next();
          } else {
            reading = false;
          }
        } catch (err) {
          readable.destroy(err);
        }
      });
      return _next2.apply(this, arguments);
    }
    return readable;
  }
  module2.exports = from;
});

// node_modules/bl/node_modules/readable-stream/lib/_stream_readable.js
var require_stream_readable = __commonJS((exports2, module2) => {
  "use strict";
  module2.exports = Readable;
  var Duplex;
  Readable.ReadableState = ReadableState;
  var EE = require("events").EventEmitter;
  var EElistenerCount = function EElistenerCount2(emitter, type) {
    return emitter.listeners(type).length;
  };
  var Stream = require_stream();
  var Buffer2 = require("buffer").Buffer;
  var OurUint8Array = global.Uint8Array || function() {
  };
  function _uint8ArrayToBuffer(chunk) {
    return Buffer2.from(chunk);
  }
  function _isUint8Array(obj) {
    return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
  }
  var debugUtil = require("util");
  var debug;
  if (debugUtil && debugUtil.debuglog) {
    debug = debugUtil.debuglog("stream");
  } else {
    debug = function debug2() {
    };
  }
  var BufferList = require_buffer_list();
  var destroyImpl = require_destroy();
  var _require = require_state();
  var getHighWaterMark = _require.getHighWaterMark;
  var _require$codes = require_errors().codes;
  var ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE;
  var ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF;
  var ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED;
  var ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;
  var StringDecoder;
  var createReadableStreamAsyncIterator;
  var from;
  require_inherits()(Readable, Stream);
  var errorOrDestroy = destroyImpl.errorOrDestroy;
  var kProxyEvents = ["error", "close", "destroy", "pause", "resume"];
  function prependListener(emitter, event, fn) {
    if (typeof emitter.prependListener === "function")
      return emitter.prependListener(event, fn);
    if (!emitter._events || !emitter._events[event])
      emitter.on(event, fn);
    else if (Array.isArray(emitter._events[event]))
      emitter._events[event].unshift(fn);
    else
      emitter._events[event] = [fn, emitter._events[event]];
  }
  function ReadableState(options, stream, isDuplex) {
    Duplex = Duplex || require_stream_duplex();
    options = options || {};
    if (typeof isDuplex !== "boolean")
      isDuplex = stream instanceof Duplex;
    this.objectMode = !!options.objectMode;
    if (isDuplex)
      this.objectMode = this.objectMode || !!options.readableObjectMode;
    this.highWaterMark = getHighWaterMark(this, options, "readableHighWaterMark", isDuplex);
    this.buffer = new BufferList();
    this.length = 0;
    this.pipes = null;
    this.pipesCount = 0;
    this.flowing = null;
    this.ended = false;
    this.endEmitted = false;
    this.reading = false;
    this.sync = true;
    this.needReadable = false;
    this.emittedReadable = false;
    this.readableListening = false;
    this.resumeScheduled = false;
    this.paused = true;
    this.emitClose = options.emitClose !== false;
    this.autoDestroy = !!options.autoDestroy;
    this.destroyed = false;
    this.defaultEncoding = options.defaultEncoding || "utf8";
    this.awaitDrain = 0;
    this.readingMore = false;
    this.decoder = null;
    this.encoding = null;
    if (options.encoding) {
      if (!StringDecoder)
        StringDecoder = require("string_decoder/").StringDecoder;
      this.decoder = new StringDecoder(options.encoding);
      this.encoding = options.encoding;
    }
  }
  function Readable(options) {
    Duplex = Duplex || require_stream_duplex();
    if (!(this instanceof Readable))
      return new Readable(options);
    var isDuplex = this instanceof Duplex;
    this._readableState = new ReadableState(options, this, isDuplex);
    this.readable = true;
    if (options) {
      if (typeof options.read === "function")
        this._read = options.read;
      if (typeof options.destroy === "function")
        this._destroy = options.destroy;
    }
    Stream.call(this);
  }
  Object.defineProperty(Readable.prototype, "destroyed", {
    enumerable: false,
    get: function get() {
      if (this._readableState === void 0) {
        return false;
      }
      return this._readableState.destroyed;
    },
    set: function set(value) {
      if (!this._readableState) {
        return;
      }
      this._readableState.destroyed = value;
    }
  });
  Readable.prototype.destroy = destroyImpl.destroy;
  Readable.prototype._undestroy = destroyImpl.undestroy;
  Readable.prototype._destroy = function(err, cb) {
    cb(err);
  };
  Readable.prototype.push = function(chunk, encoding) {
    var state = this._readableState;
    var skipChunkCheck;
    if (!state.objectMode) {
      if (typeof chunk === "string") {
        encoding = encoding || state.defaultEncoding;
        if (encoding !== state.encoding) {
          chunk = Buffer2.from(chunk, encoding);
          encoding = "";
        }
        skipChunkCheck = true;
      }
    } else {
      skipChunkCheck = true;
    }
    return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
  };
  Readable.prototype.unshift = function(chunk) {
    return readableAddChunk(this, chunk, null, true, false);
  };
  function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
    debug("readableAddChunk", chunk);
    var state = stream._readableState;
    if (chunk === null) {
      state.reading = false;
      onEofChunk(stream, state);
    } else {
      var er;
      if (!skipChunkCheck)
        er = chunkInvalid(state, chunk);
      if (er) {
        errorOrDestroy(stream, er);
      } else if (state.objectMode || chunk && chunk.length > 0) {
        if (typeof chunk !== "string" && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer2.prototype) {
          chunk = _uint8ArrayToBuffer(chunk);
        }
        if (addToFront) {
          if (state.endEmitted)
            errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());
          else
            addChunk(stream, state, chunk, true);
        } else if (state.ended) {
          errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
        } else if (state.destroyed) {
          return false;
        } else {
          state.reading = false;
          if (state.decoder && !encoding) {
            chunk = state.decoder.write(chunk);
            if (state.objectMode || chunk.length !== 0)
              addChunk(stream, state, chunk, false);
            else
              maybeReadMore(stream, state);
          } else {
            addChunk(stream, state, chunk, false);
          }
        }
      } else if (!addToFront) {
        state.reading = false;
        maybeReadMore(stream, state);
      }
    }
    return !state.ended && (state.length < state.highWaterMark || state.length === 0);
  }
  function addChunk(stream, state, chunk, addToFront) {
    if (state.flowing && state.length === 0 && !state.sync) {
      state.awaitDrain = 0;
      stream.emit("data", chunk);
    } else {
      state.length += state.objectMode ? 1 : chunk.length;
      if (addToFront)
        state.buffer.unshift(chunk);
      else
        state.buffer.push(chunk);
      if (state.needReadable)
        emitReadable(stream);
    }
    maybeReadMore(stream, state);
  }
  function chunkInvalid(state, chunk) {
    var er;
    if (!_isUint8Array(chunk) && typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
      er = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer", "Uint8Array"], chunk);
    }
    return er;
  }
  Readable.prototype.isPaused = function() {
    return this._readableState.flowing === false;
  };
  Readable.prototype.setEncoding = function(enc) {
    if (!StringDecoder)
      StringDecoder = require("string_decoder/").StringDecoder;
    var decoder = new StringDecoder(enc);
    this._readableState.decoder = decoder;
    this._readableState.encoding = this._readableState.decoder.encoding;
    var p = this._readableState.buffer.head;
    var content = "";
    while (p !== null) {
      content += decoder.write(p.data);
      p = p.next;
    }
    this._readableState.buffer.clear();
    if (content !== "")
      this._readableState.buffer.push(content);
    this._readableState.length = content.length;
    return this;
  };
  var MAX_HWM = 1073741824;
  function computeNewHighWaterMark(n) {
    if (n >= MAX_HWM) {
      n = MAX_HWM;
    } else {
      n--;
      n |= n >>> 1;
      n |= n >>> 2;
      n |= n >>> 4;
      n |= n >>> 8;
      n |= n >>> 16;
      n++;
    }
    return n;
  }
  function howMuchToRead(n, state) {
    if (n <= 0 || state.length === 0 && state.ended)
      return 0;
    if (state.objectMode)
      return 1;
    if (n !== n) {
      if (state.flowing && state.length)
        return state.buffer.head.data.length;
      else
        return state.length;
    }
    if (n > state.highWaterMark)
      state.highWaterMark = computeNewHighWaterMark(n);
    if (n <= state.length)
      return n;
    if (!state.ended) {
      state.needReadable = true;
      return 0;
    }
    return state.length;
  }
  Readable.prototype.read = function(n) {
    debug("read", n);
    n = parseInt(n, 10);
    var state = this._readableState;
    var nOrig = n;
    if (n !== 0)
      state.emittedReadable = false;
    if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
      debug("read: emitReadable", state.length, state.ended);
      if (state.length === 0 && state.ended)
        endReadable(this);
      else
        emitReadable(this);
      return null;
    }
    n = howMuchToRead(n, state);
    if (n === 0 && state.ended) {
      if (state.length === 0)
        endReadable(this);
      return null;
    }
    var doRead = state.needReadable;
    debug("need readable", doRead);
    if (state.length === 0 || state.length - n < state.highWaterMark) {
      doRead = true;
      debug("length less than watermark", doRead);
    }
    if (state.ended || state.reading) {
      doRead = false;
      debug("reading or ended", doRead);
    } else if (doRead) {
      debug("do read");
      state.reading = true;
      state.sync = true;
      if (state.length === 0)
        state.needReadable = true;
      this._read(state.highWaterMark);
      state.sync = false;
      if (!state.reading)
        n = howMuchToRead(nOrig, state);
    }
    var ret;
    if (n > 0)
      ret = fromList(n, state);
    else
      ret = null;
    if (ret === null) {
      state.needReadable = state.length <= state.highWaterMark;
      n = 0;
    } else {
      state.length -= n;
      state.awaitDrain = 0;
    }
    if (state.length === 0) {
      if (!state.ended)
        state.needReadable = true;
      if (nOrig !== n && state.ended)
        endReadable(this);
    }
    if (ret !== null)
      this.emit("data", ret);
    return ret;
  };
  function onEofChunk(stream, state) {
    debug("onEofChunk");
    if (state.ended)
      return;
    if (state.decoder) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) {
        state.buffer.push(chunk);
        state.length += state.objectMode ? 1 : chunk.length;
      }
    }
    state.ended = true;
    if (state.sync) {
      emitReadable(stream);
    } else {
      state.needReadable = false;
      if (!state.emittedReadable) {
        state.emittedReadable = true;
        emitReadable_(stream);
      }
    }
  }
  function emitReadable(stream) {
    var state = stream._readableState;
    debug("emitReadable", state.needReadable, state.emittedReadable);
    state.needReadable = false;
    if (!state.emittedReadable) {
      debug("emitReadable", state.flowing);
      state.emittedReadable = true;
      process.nextTick(emitReadable_, stream);
    }
  }
  function emitReadable_(stream) {
    var state = stream._readableState;
    debug("emitReadable_", state.destroyed, state.length, state.ended);
    if (!state.destroyed && (state.length || state.ended)) {
      stream.emit("readable");
      state.emittedReadable = false;
    }
    state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
    flow(stream);
  }
  function maybeReadMore(stream, state) {
    if (!state.readingMore) {
      state.readingMore = true;
      process.nextTick(maybeReadMore_, stream, state);
    }
  }
  function maybeReadMore_(stream, state) {
    while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
      var len = state.length;
      debug("maybeReadMore read 0");
      stream.read(0);
      if (len === state.length)
        break;
    }
    state.readingMore = false;
  }
  Readable.prototype._read = function(n) {
    errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED("_read()"));
  };
  Readable.prototype.pipe = function(dest, pipeOpts) {
    var src = this;
    var state = this._readableState;
    switch (state.pipesCount) {
      case 0:
        state.pipes = dest;
        break;
      case 1:
        state.pipes = [state.pipes, dest];
        break;
      default:
        state.pipes.push(dest);
        break;
    }
    state.pipesCount += 1;
    debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
    var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
    var endFn = doEnd ? onend : unpipe;
    if (state.endEmitted)
      process.nextTick(endFn);
    else
      src.once("end", endFn);
    dest.on("unpipe", onunpipe);
    function onunpipe(readable, unpipeInfo) {
      debug("onunpipe");
      if (readable === src) {
        if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
          unpipeInfo.hasUnpiped = true;
          cleanup();
        }
      }
    }
    function onend() {
      debug("onend");
      dest.end();
    }
    var ondrain = pipeOnDrain(src);
    dest.on("drain", ondrain);
    var cleanedUp = false;
    function cleanup() {
      debug("cleanup");
      dest.removeListener("close", onclose);
      dest.removeListener("finish", onfinish);
      dest.removeListener("drain", ondrain);
      dest.removeListener("error", onerror);
      dest.removeListener("unpipe", onunpipe);
      src.removeListener("end", onend);
      src.removeListener("end", unpipe);
      src.removeListener("data", ondata);
      cleanedUp = true;
      if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain))
        ondrain();
    }
    src.on("data", ondata);
    function ondata(chunk) {
      debug("ondata");
      var ret = dest.write(chunk);
      debug("dest.write", ret);
      if (ret === false) {
        if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
          debug("false write response, pause", state.awaitDrain);
          state.awaitDrain++;
        }
        src.pause();
      }
    }
    function onerror(er) {
      debug("onerror", er);
      unpipe();
      dest.removeListener("error", onerror);
      if (EElistenerCount(dest, "error") === 0)
        errorOrDestroy(dest, er);
    }
    prependListener(dest, "error", onerror);
    function onclose() {
      dest.removeListener("finish", onfinish);
      unpipe();
    }
    dest.once("close", onclose);
    function onfinish() {
      debug("onfinish");
      dest.removeListener("close", onclose);
      unpipe();
    }
    dest.once("finish", onfinish);
    function unpipe() {
      debug("unpipe");
      src.unpipe(dest);
    }
    dest.emit("pipe", src);
    if (!state.flowing) {
      debug("pipe resume");
      src.resume();
    }
    return dest;
  };
  function pipeOnDrain(src) {
    return function pipeOnDrainFunctionResult() {
      var state = src._readableState;
      debug("pipeOnDrain", state.awaitDrain);
      if (state.awaitDrain)
        state.awaitDrain--;
      if (state.awaitDrain === 0 && EElistenerCount(src, "data")) {
        state.flowing = true;
        flow(src);
      }
    };
  }
  Readable.prototype.unpipe = function(dest) {
    var state = this._readableState;
    var unpipeInfo = {
      hasUnpiped: false
    };
    if (state.pipesCount === 0)
      return this;
    if (state.pipesCount === 1) {
      if (dest && dest !== state.pipes)
        return this;
      if (!dest)
        dest = state.pipes;
      state.pipes = null;
      state.pipesCount = 0;
      state.flowing = false;
      if (dest)
        dest.emit("unpipe", this, unpipeInfo);
      return this;
    }
    if (!dest) {
      var dests = state.pipes;
      var len = state.pipesCount;
      state.pipes = null;
      state.pipesCount = 0;
      state.flowing = false;
      for (var i = 0; i < len; i++) {
        dests[i].emit("unpipe", this, {
          hasUnpiped: false
        });
      }
      return this;
    }
    var index = indexOf(state.pipes, dest);
    if (index === -1)
      return this;
    state.pipes.splice(index, 1);
    state.pipesCount -= 1;
    if (state.pipesCount === 1)
      state.pipes = state.pipes[0];
    dest.emit("unpipe", this, unpipeInfo);
    return this;
  };
  Readable.prototype.on = function(ev, fn) {
    var res = Stream.prototype.on.call(this, ev, fn);
    var state = this._readableState;
    if (ev === "data") {
      state.readableListening = this.listenerCount("readable") > 0;
      if (state.flowing !== false)
        this.resume();
    } else if (ev === "readable") {
      if (!state.endEmitted && !state.readableListening) {
        state.readableListening = state.needReadable = true;
        state.flowing = false;
        state.emittedReadable = false;
        debug("on readable", state.length, state.reading);
        if (state.length) {
          emitReadable(this);
        } else if (!state.reading) {
          process.nextTick(nReadingNextTick, this);
        }
      }
    }
    return res;
  };
  Readable.prototype.addListener = Readable.prototype.on;
  Readable.prototype.removeListener = function(ev, fn) {
    var res = Stream.prototype.removeListener.call(this, ev, fn);
    if (ev === "readable") {
      process.nextTick(updateReadableListening, this);
    }
    return res;
  };
  Readable.prototype.removeAllListeners = function(ev) {
    var res = Stream.prototype.removeAllListeners.apply(this, arguments);
    if (ev === "readable" || ev === void 0) {
      process.nextTick(updateReadableListening, this);
    }
    return res;
  };
  function updateReadableListening(self2) {
    var state = self2._readableState;
    state.readableListening = self2.listenerCount("readable") > 0;
    if (state.resumeScheduled && !state.paused) {
      state.flowing = true;
    } else if (self2.listenerCount("data") > 0) {
      self2.resume();
    }
  }
  function nReadingNextTick(self2) {
    debug("readable nexttick read 0");
    self2.read(0);
  }
  Readable.prototype.resume = function() {
    var state = this._readableState;
    if (!state.flowing) {
      debug("resume");
      state.flowing = !state.readableListening;
      resume(this, state);
    }
    state.paused = false;
    return this;
  };
  function resume(stream, state) {
    if (!state.resumeScheduled) {
      state.resumeScheduled = true;
      process.nextTick(resume_, stream, state);
    }
  }
  function resume_(stream, state) {
    debug("resume", state.reading);
    if (!state.reading) {
      stream.read(0);
    }
    state.resumeScheduled = false;
    stream.emit("resume");
    flow(stream);
    if (state.flowing && !state.reading)
      stream.read(0);
  }
  Readable.prototype.pause = function() {
    debug("call pause flowing=%j", this._readableState.flowing);
    if (this._readableState.flowing !== false) {
      debug("pause");
      this._readableState.flowing = false;
      this.emit("pause");
    }
    this._readableState.paused = true;
    return this;
  };
  function flow(stream) {
    var state = stream._readableState;
    debug("flow", state.flowing);
    while (state.flowing && stream.read() !== null) {
      ;
    }
  }
  Readable.prototype.wrap = function(stream) {
    var _this = this;
    var state = this._readableState;
    var paused = false;
    stream.on("end", function() {
      debug("wrapped end");
      if (state.decoder && !state.ended) {
        var chunk = state.decoder.end();
        if (chunk && chunk.length)
          _this.push(chunk);
      }
      _this.push(null);
    });
    stream.on("data", function(chunk) {
      debug("wrapped data");
      if (state.decoder)
        chunk = state.decoder.write(chunk);
      if (state.objectMode && (chunk === null || chunk === void 0))
        return;
      else if (!state.objectMode && (!chunk || !chunk.length))
        return;
      var ret = _this.push(chunk);
      if (!ret) {
        paused = true;
        stream.pause();
      }
    });
    for (var i in stream) {
      if (this[i] === void 0 && typeof stream[i] === "function") {
        this[i] = function methodWrap(method) {
          return function methodWrapReturnFunction() {
            return stream[method].apply(stream, arguments);
          };
        }(i);
      }
    }
    for (var n = 0; n < kProxyEvents.length; n++) {
      stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
    }
    this._read = function(n2) {
      debug("wrapped _read", n2);
      if (paused) {
        paused = false;
        stream.resume();
      }
    };
    return this;
  };
  if (typeof Symbol === "function") {
    Readable.prototype[Symbol.asyncIterator] = function() {
      if (createReadableStreamAsyncIterator === void 0) {
        createReadableStreamAsyncIterator = require_async_iterator();
      }
      return createReadableStreamAsyncIterator(this);
    };
  }
  Object.defineProperty(Readable.prototype, "readableHighWaterMark", {
    enumerable: false,
    get: function get() {
      return this._readableState.highWaterMark;
    }
  });
  Object.defineProperty(Readable.prototype, "readableBuffer", {
    enumerable: false,
    get: function get() {
      return this._readableState && this._readableState.buffer;
    }
  });
  Object.defineProperty(Readable.prototype, "readableFlowing", {
    enumerable: false,
    get: function get() {
      return this._readableState.flowing;
    },
    set: function set(state) {
      if (this._readableState) {
        this._readableState.flowing = state;
      }
    }
  });
  Readable._fromList = fromList;
  Object.defineProperty(Readable.prototype, "readableLength", {
    enumerable: false,
    get: function get() {
      return this._readableState.length;
    }
  });
  function fromList(n, state) {
    if (state.length === 0)
      return null;
    var ret;
    if (state.objectMode)
      ret = state.buffer.shift();
    else if (!n || n >= state.length) {
      if (state.decoder)
        ret = state.buffer.join("");
      else if (state.buffer.length === 1)
        ret = state.buffer.first();
      else
        ret = state.buffer.concat(state.length);
      state.buffer.clear();
    } else {
      ret = state.buffer.consume(n, state.decoder);
    }
    return ret;
  }
  function endReadable(stream) {
    var state = stream._readableState;
    debug("endReadable", state.endEmitted);
    if (!state.endEmitted) {
      state.ended = true;
      process.nextTick(endReadableNT, state, stream);
    }
  }
  function endReadableNT(state, stream) {
    debug("endReadableNT", state.endEmitted, state.length);
    if (!state.endEmitted && state.length === 0) {
      state.endEmitted = true;
      stream.readable = false;
      stream.emit("end");
      if (state.autoDestroy) {
        var wState = stream._writableState;
        if (!wState || wState.autoDestroy && wState.finished) {
          stream.destroy();
        }
      }
    }
  }
  if (typeof Symbol === "function") {
    Readable.from = function(iterable, opts) {
      if (from === void 0) {
        from = require_from();
      }
      return from(Readable, iterable, opts);
    };
  }
  function indexOf(xs, x) {
    for (var i = 0, l = xs.length; i < l; i++) {
      if (xs[i] === x)
        return i;
    }
    return -1;
  }
});

// node_modules/bl/node_modules/readable-stream/lib/_stream_transform.js
var require_stream_transform = __commonJS((exports2, module2) => {
  "use strict";
  module2.exports = Transform;
  var _require$codes = require_errors().codes;
  var ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED;
  var ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK;
  var ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING;
  var ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;
  var Duplex = require_stream_duplex();
  require_inherits()(Transform, Duplex);
  function afterTransform(er, data) {
    var ts = this._transformState;
    ts.transforming = false;
    var cb = ts.writecb;
    if (cb === null) {
      return this.emit("error", new ERR_MULTIPLE_CALLBACK());
    }
    ts.writechunk = null;
    ts.writecb = null;
    if (data != null)
      this.push(data);
    cb(er);
    var rs = this._readableState;
    rs.reading = false;
    if (rs.needReadable || rs.length < rs.highWaterMark) {
      this._read(rs.highWaterMark);
    }
  }
  function Transform(options) {
    if (!(this instanceof Transform))
      return new Transform(options);
    Duplex.call(this, options);
    this._transformState = {
      afterTransform: afterTransform.bind(this),
      needTransform: false,
      transforming: false,
      writecb: null,
      writechunk: null,
      writeencoding: null
    };
    this._readableState.needReadable = true;
    this._readableState.sync = false;
    if (options) {
      if (typeof options.transform === "function")
        this._transform = options.transform;
      if (typeof options.flush === "function")
        this._flush = options.flush;
    }
    this.on("prefinish", prefinish);
  }
  function prefinish() {
    var _this = this;
    if (typeof this._flush === "function" && !this._readableState.destroyed) {
      this._flush(function(er, data) {
        done(_this, er, data);
      });
    } else {
      done(this, null, null);
    }
  }
  Transform.prototype.push = function(chunk, encoding) {
    this._transformState.needTransform = false;
    return Duplex.prototype.push.call(this, chunk, encoding);
  };
  Transform.prototype._transform = function(chunk, encoding, cb) {
    cb(new ERR_METHOD_NOT_IMPLEMENTED("_transform()"));
  };
  Transform.prototype._write = function(chunk, encoding, cb) {
    var ts = this._transformState;
    ts.writecb = cb;
    ts.writechunk = chunk;
    ts.writeencoding = encoding;
    if (!ts.transforming) {
      var rs = this._readableState;
      if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark)
        this._read(rs.highWaterMark);
    }
  };
  Transform.prototype._read = function(n) {
    var ts = this._transformState;
    if (ts.writechunk !== null && !ts.transforming) {
      ts.transforming = true;
      this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
    } else {
      ts.needTransform = true;
    }
  };
  Transform.prototype._destroy = function(err, cb) {
    Duplex.prototype._destroy.call(this, err, function(err2) {
      cb(err2);
    });
  };
  function done(stream, er, data) {
    if (er)
      return stream.emit("error", er);
    if (data != null)
      stream.push(data);
    if (stream._writableState.length)
      throw new ERR_TRANSFORM_WITH_LENGTH_0();
    if (stream._transformState.transforming)
      throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
    return stream.push(null);
  }
});

// node_modules/bl/node_modules/readable-stream/lib/_stream_passthrough.js
var require_stream_passthrough = __commonJS((exports2, module2) => {
  "use strict";
  module2.exports = PassThrough;
  var Transform = require_stream_transform();
  require_inherits()(PassThrough, Transform);
  function PassThrough(options) {
    if (!(this instanceof PassThrough))
      return new PassThrough(options);
    Transform.call(this, options);
  }
  PassThrough.prototype._transform = function(chunk, encoding, cb) {
    cb(null, chunk);
  };
});

// node_modules/bl/node_modules/readable-stream/lib/internal/streams/pipeline.js
var require_pipeline = __commonJS((exports2, module2) => {
  "use strict";
  var eos;
  function once(callback) {
    var called = false;
    return function() {
      if (called)
        return;
      called = true;
      callback.apply(void 0, arguments);
    };
  }
  var _require$codes = require_errors().codes;
  var ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS;
  var ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
  function noop(err) {
    if (err)
      throw err;
  }
  function isRequest(stream) {
    return stream.setHeader && typeof stream.abort === "function";
  }
  function destroyer(stream, reading, writing, callback) {
    callback = once(callback);
    var closed = false;
    stream.on("close", function() {
      closed = true;
    });
    if (eos === void 0)
      eos = require_end_of_stream();
    eos(stream, {
      readable: reading,
      writable: writing
    }, function(err) {
      if (err)
        return callback(err);
      closed = true;
      callback();
    });
    var destroyed = false;
    return function(err) {
      if (closed)
        return;
      if (destroyed)
        return;
      destroyed = true;
      if (isRequest(stream))
        return stream.abort();
      if (typeof stream.destroy === "function")
        return stream.destroy();
      callback(err || new ERR_STREAM_DESTROYED("pipe"));
    };
  }
  function call(fn) {
    fn();
  }
  function pipe(from, to) {
    return from.pipe(to);
  }
  function popCallback(streams) {
    if (!streams.length)
      return noop;
    if (typeof streams[streams.length - 1] !== "function")
      return noop;
    return streams.pop();
  }
  function pipeline() {
    for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
      streams[_key] = arguments[_key];
    }
    var callback = popCallback(streams);
    if (Array.isArray(streams[0]))
      streams = streams[0];
    if (streams.length < 2) {
      throw new ERR_MISSING_ARGS("streams");
    }
    var error;
    var destroys = streams.map(function(stream, i) {
      var reading = i < streams.length - 1;
      var writing = i > 0;
      return destroyer(stream, reading, writing, function(err) {
        if (!error)
          error = err;
        if (err)
          destroys.forEach(call);
        if (reading)
          return;
        destroys.forEach(call);
        callback(error);
      });
    });
    return streams.reduce(pipe);
  }
  module2.exports = pipeline;
});

// node_modules/bl/node_modules/readable-stream/readable.js
var require_readable = __commonJS((exports2, module2) => {
  var Stream = require("stream");
  if (process.env.READABLE_STREAM === "disable" && Stream) {
    module2.exports = Stream.Readable;
    Object.assign(module2.exports, Stream);
    module2.exports.Stream = Stream;
  } else {
    exports2 = module2.exports = require_stream_readable();
    exports2.Stream = Stream || exports2;
    exports2.Readable = exports2;
    exports2.Writable = require_stream_writable();
    exports2.Duplex = require_stream_duplex();
    exports2.Transform = require_stream_transform();
    exports2.PassThrough = require_stream_passthrough();
    exports2.finished = require_end_of_stream();
    exports2.pipeline = require_pipeline();
  }
});

// node_modules/bl/BufferList.js
var require_BufferList = __commonJS((exports2, module2) => {
  "use strict";
  var {Buffer: Buffer2} = require("buffer");
  var symbol = Symbol.for("BufferList");
  function BufferList(buf) {
    if (!(this instanceof BufferList)) {
      return new BufferList(buf);
    }
    BufferList._init.call(this, buf);
  }
  BufferList._init = function _init(buf) {
    Object.defineProperty(this, symbol, {value: true});
    this._bufs = [];
    this.length = 0;
    if (buf) {
      this.append(buf);
    }
  };
  BufferList.prototype._new = function _new(buf) {
    return new BufferList(buf);
  };
  BufferList.prototype._offset = function _offset(offset) {
    if (offset === 0) {
      return [0, 0];
    }
    let tot = 0;
    for (let i = 0; i < this._bufs.length; i++) {
      const _t = tot + this._bufs[i].length;
      if (offset < _t || i === this._bufs.length - 1) {
        return [i, offset - tot];
      }
      tot = _t;
    }
  };
  BufferList.prototype._reverseOffset = function(blOffset) {
    const bufferId = blOffset[0];
    let offset = blOffset[1];
    for (let i = 0; i < bufferId; i++) {
      offset += this._bufs[i].length;
    }
    return offset;
  };
  BufferList.prototype.get = function get(index) {
    if (index > this.length || index < 0) {
      return void 0;
    }
    const offset = this._offset(index);
    return this._bufs[offset[0]][offset[1]];
  };
  BufferList.prototype.slice = function slice(start, end) {
    if (typeof start === "number" && start < 0) {
      start += this.length;
    }
    if (typeof end === "number" && end < 0) {
      end += this.length;
    }
    return this.copy(null, 0, start, end);
  };
  BufferList.prototype.copy = function copy(dst, dstStart, srcStart, srcEnd) {
    if (typeof srcStart !== "number" || srcStart < 0) {
      srcStart = 0;
    }
    if (typeof srcEnd !== "number" || srcEnd > this.length) {
      srcEnd = this.length;
    }
    if (srcStart >= this.length) {
      return dst || Buffer2.alloc(0);
    }
    if (srcEnd <= 0) {
      return dst || Buffer2.alloc(0);
    }
    const copy2 = !!dst;
    const off = this._offset(srcStart);
    const len = srcEnd - srcStart;
    let bytes = len;
    let bufoff = copy2 && dstStart || 0;
    let start = off[1];
    if (srcStart === 0 && srcEnd === this.length) {
      if (!copy2) {
        return this._bufs.length === 1 ? this._bufs[0] : Buffer2.concat(this._bufs, this.length);
      }
      for (let i = 0; i < this._bufs.length; i++) {
        this._bufs[i].copy(dst, bufoff);
        bufoff += this._bufs[i].length;
      }
      return dst;
    }
    if (bytes <= this._bufs[off[0]].length - start) {
      return copy2 ? this._bufs[off[0]].copy(dst, dstStart, start, start + bytes) : this._bufs[off[0]].slice(start, start + bytes);
    }
    if (!copy2) {
      dst = Buffer2.allocUnsafe(len);
    }
    for (let i = off[0]; i < this._bufs.length; i++) {
      const l = this._bufs[i].length - start;
      if (bytes > l) {
        this._bufs[i].copy(dst, bufoff, start);
        bufoff += l;
      } else {
        this._bufs[i].copy(dst, bufoff, start, start + bytes);
        bufoff += l;
        break;
      }
      bytes -= l;
      if (start) {
        start = 0;
      }
    }
    if (dst.length > bufoff)
      return dst.slice(0, bufoff);
    return dst;
  };
  BufferList.prototype.shallowSlice = function shallowSlice(start, end) {
    start = start || 0;
    end = typeof end !== "number" ? this.length : end;
    if (start < 0) {
      start += this.length;
    }
    if (end < 0) {
      end += this.length;
    }
    if (start === end) {
      return this._new();
    }
    const startOffset = this._offset(start);
    const endOffset = this._offset(end);
    const buffers = this._bufs.slice(startOffset[0], endOffset[0] + 1);
    if (endOffset[1] === 0) {
      buffers.pop();
    } else {
      buffers[buffers.length - 1] = buffers[buffers.length - 1].slice(0, endOffset[1]);
    }
    if (startOffset[1] !== 0) {
      buffers[0] = buffers[0].slice(startOffset[1]);
    }
    return this._new(buffers);
  };
  BufferList.prototype.toString = function toString(encoding, start, end) {
    return this.slice(start, end).toString(encoding);
  };
  BufferList.prototype.consume = function consume(bytes) {
    bytes = Math.trunc(bytes);
    if (Number.isNaN(bytes) || bytes <= 0)
      return this;
    while (this._bufs.length) {
      if (bytes >= this._bufs[0].length) {
        bytes -= this._bufs[0].length;
        this.length -= this._bufs[0].length;
        this._bufs.shift();
      } else {
        this._bufs[0] = this._bufs[0].slice(bytes);
        this.length -= bytes;
        break;
      }
    }
    return this;
  };
  BufferList.prototype.duplicate = function duplicate() {
    const copy = this._new();
    for (let i = 0; i < this._bufs.length; i++) {
      copy.append(this._bufs[i]);
    }
    return copy;
  };
  BufferList.prototype.append = function append(buf) {
    if (buf == null) {
      return this;
    }
    if (buf.buffer) {
      this._appendBuffer(Buffer2.from(buf.buffer, buf.byteOffset, buf.byteLength));
    } else if (Array.isArray(buf)) {
      for (let i = 0; i < buf.length; i++) {
        this.append(buf[i]);
      }
    } else if (this._isBufferList(buf)) {
      for (let i = 0; i < buf._bufs.length; i++) {
        this.append(buf._bufs[i]);
      }
    } else {
      if (typeof buf === "number") {
        buf = buf.toString();
      }
      this._appendBuffer(Buffer2.from(buf));
    }
    return this;
  };
  BufferList.prototype._appendBuffer = function appendBuffer(buf) {
    this._bufs.push(buf);
    this.length += buf.length;
  };
  BufferList.prototype.indexOf = function(search, offset, encoding) {
    if (encoding === void 0 && typeof offset === "string") {
      encoding = offset;
      offset = void 0;
    }
    if (typeof search === "function" || Array.isArray(search)) {
      throw new TypeError('The "value" argument must be one of type string, Buffer, BufferList, or Uint8Array.');
    } else if (typeof search === "number") {
      search = Buffer2.from([search]);
    } else if (typeof search === "string") {
      search = Buffer2.from(search, encoding);
    } else if (this._isBufferList(search)) {
      search = search.slice();
    } else if (Array.isArray(search.buffer)) {
      search = Buffer2.from(search.buffer, search.byteOffset, search.byteLength);
    } else if (!Buffer2.isBuffer(search)) {
      search = Buffer2.from(search);
    }
    offset = Number(offset || 0);
    if (isNaN(offset)) {
      offset = 0;
    }
    if (offset < 0) {
      offset = this.length + offset;
    }
    if (offset < 0) {
      offset = 0;
    }
    if (search.length === 0) {
      return offset > this.length ? this.length : offset;
    }
    const blOffset = this._offset(offset);
    let blIndex = blOffset[0];
    let buffOffset = blOffset[1];
    for (; blIndex < this._bufs.length; blIndex++) {
      const buff = this._bufs[blIndex];
      while (buffOffset < buff.length) {
        const availableWindow = buff.length - buffOffset;
        if (availableWindow >= search.length) {
          const nativeSearchResult = buff.indexOf(search, buffOffset);
          if (nativeSearchResult !== -1) {
            return this._reverseOffset([blIndex, nativeSearchResult]);
          }
          buffOffset = buff.length - search.length + 1;
        } else {
          const revOffset = this._reverseOffset([blIndex, buffOffset]);
          if (this._match(revOffset, search)) {
            return revOffset;
          }
          buffOffset++;
        }
      }
      buffOffset = 0;
    }
    return -1;
  };
  BufferList.prototype._match = function(offset, search) {
    if (this.length - offset < search.length) {
      return false;
    }
    for (let searchOffset = 0; searchOffset < search.length; searchOffset++) {
      if (this.get(offset + searchOffset) !== search[searchOffset]) {
        return false;
      }
    }
    return true;
  };
  (function() {
    const methods = {
      readDoubleBE: 8,
      readDoubleLE: 8,
      readFloatBE: 4,
      readFloatLE: 4,
      readInt32BE: 4,
      readInt32LE: 4,
      readUInt32BE: 4,
      readUInt32LE: 4,
      readInt16BE: 2,
      readInt16LE: 2,
      readUInt16BE: 2,
      readUInt16LE: 2,
      readInt8: 1,
      readUInt8: 1,
      readIntBE: null,
      readIntLE: null,
      readUIntBE: null,
      readUIntLE: null
    };
    for (const m in methods) {
      (function(m2) {
        if (methods[m2] === null) {
          BufferList.prototype[m2] = function(offset, byteLength) {
            return this.slice(offset, offset + byteLength)[m2](0, byteLength);
          };
        } else {
          BufferList.prototype[m2] = function(offset) {
            return this.slice(offset, offset + methods[m2])[m2](0);
          };
        }
      })(m);
    }
  })();
  BufferList.prototype._isBufferList = function _isBufferList(b) {
    return b instanceof BufferList || BufferList.isBufferList(b);
  };
  BufferList.isBufferList = function isBufferList(b) {
    return b != null && b[symbol];
  };
  module2.exports = BufferList;
});

// node_modules/bl/bl.js
var require_bl = __commonJS((exports2, module2) => {
  "use strict";
  var DuplexStream = require_readable().Duplex;
  var inherits = require_inherits();
  var BufferList = require_BufferList();
  function BufferListStream(callback) {
    if (!(this instanceof BufferListStream)) {
      return new BufferListStream(callback);
    }
    if (typeof callback === "function") {
      this._callback = callback;
      const piper = function piper2(err) {
        if (this._callback) {
          this._callback(err);
          this._callback = null;
        }
      }.bind(this);
      this.on("pipe", function onPipe(src) {
        src.on("error", piper);
      });
      this.on("unpipe", function onUnpipe(src) {
        src.removeListener("error", piper);
      });
      callback = null;
    }
    BufferList._init.call(this, callback);
    DuplexStream.call(this);
  }
  inherits(BufferListStream, DuplexStream);
  Object.assign(BufferListStream.prototype, BufferList.prototype);
  BufferListStream.prototype._new = function _new(callback) {
    return new BufferListStream(callback);
  };
  BufferListStream.prototype._write = function _write(buf, encoding, callback) {
    this._appendBuffer(buf);
    if (typeof callback === "function") {
      callback();
    }
  };
  BufferListStream.prototype._read = function _read(size) {
    if (!this.length) {
      return this.push(null);
    }
    size = Math.min(size, this.length);
    this.push(this.slice(0, size));
    this.consume(size);
  };
  BufferListStream.prototype.end = function end(chunk) {
    DuplexStream.prototype.end.call(this, chunk);
    if (this._callback) {
      this._callback(null, this.slice());
      this._callback = null;
    }
  };
  BufferListStream.prototype._destroy = function _destroy(err, cb) {
    this._bufs.length = 0;
    this.length = 0;
    cb(err);
  };
  BufferListStream.prototype._isBufferList = function _isBufferList(b) {
    return b instanceof BufferListStream || b instanceof BufferList || BufferListStream.isBufferList(b);
  };
  BufferListStream.isBufferList = BufferList.isBufferList;
  module2.exports = BufferListStream;
  module2.exports.BufferListStream = BufferListStream;
  module2.exports.BufferList = BufferList;
});

// node_modules/ora/index.js
var require_ora = __commonJS((exports2, module2) => {
  "use strict";
  var readline = require("readline");
  var chalk = require_source();
  var cliCursor = require_cli_cursor();
  var cliSpinners = require_cli_spinners();
  var logSymbols2 = require_log_symbols();
  var stripAnsi = require_strip_ansi();
  var wcwidth = require_wcwidth();
  var isInteractive = require_is_interactive();
  var {BufferListStream} = require_bl();
  var TEXT = Symbol("text");
  var PREFIX_TEXT = Symbol("prefixText");
  var ASCII_ETX_CODE = 3;
  var StdinDiscarder = class {
    constructor() {
      this.requests = 0;
      this.mutedStream = new BufferListStream();
      this.mutedStream.pipe(process.stdout);
      const self2 = this;
      this.ourEmit = function(event, data, ...args) {
        const {stdin} = process;
        if (self2.requests > 0 || stdin.emit === self2.ourEmit) {
          if (event === "keypress") {
            return;
          }
          if (event === "data" && data.includes(ASCII_ETX_CODE)) {
            process.emit("SIGINT");
          }
          Reflect.apply(self2.oldEmit, this, [event, data, ...args]);
        } else {
          Reflect.apply(process.stdin.emit, this, [event, data, ...args]);
        }
      };
    }
    start() {
      this.requests++;
      if (this.requests === 1) {
        this.realStart();
      }
    }
    stop() {
      if (this.requests <= 0) {
        throw new Error("`stop` called more times than `start`");
      }
      this.requests--;
      if (this.requests === 0) {
        this.realStop();
      }
    }
    realStart() {
      if (process.platform === "win32") {
        return;
      }
      this.rl = readline.createInterface({
        input: process.stdin,
        output: this.mutedStream
      });
      this.rl.on("SIGINT", () => {
        if (process.listenerCount("SIGINT") === 0) {
          process.emit("SIGINT");
        } else {
          this.rl.close();
          process.kill(process.pid, "SIGINT");
        }
      });
    }
    realStop() {
      if (process.platform === "win32") {
        return;
      }
      this.rl.close();
      this.rl = void 0;
    }
  };
  var stdinDiscarder;
  var Ora = class {
    constructor(options) {
      if (!stdinDiscarder) {
        stdinDiscarder = new StdinDiscarder();
      }
      if (typeof options === "string") {
        options = {
          text: options
        };
      }
      this.options = {
        text: "",
        color: "cyan",
        stream: process.stderr,
        discardStdin: true,
        ...options
      };
      this.spinner = this.options.spinner;
      this.color = this.options.color;
      this.hideCursor = this.options.hideCursor !== false;
      this.interval = this.options.interval || this.spinner.interval || 100;
      this.stream = this.options.stream;
      this.id = void 0;
      this.isEnabled = typeof this.options.isEnabled === "boolean" ? this.options.isEnabled : isInteractive({stream: this.stream});
      this.isSilent = typeof this.options.isSilent === "boolean" ? this.options.isSilent : false;
      this.text = this.options.text;
      this.prefixText = this.options.prefixText;
      this.linesToClear = 0;
      this.indent = this.options.indent;
      this.discardStdin = this.options.discardStdin;
      this.isDiscardingStdin = false;
    }
    get indent() {
      return this._indent;
    }
    set indent(indent = 0) {
      if (!(indent >= 0 && Number.isInteger(indent))) {
        throw new Error("The `indent` option must be an integer from 0 and up");
      }
      this._indent = indent;
    }
    _updateInterval(interval) {
      if (interval !== void 0) {
        this.interval = interval;
      }
    }
    get spinner() {
      return this._spinner;
    }
    set spinner(spinner) {
      this.frameIndex = 0;
      if (typeof spinner === "object") {
        if (spinner.frames === void 0) {
          throw new Error("The given spinner must have a `frames` property");
        }
        this._spinner = spinner;
      } else if (process.platform === "win32") {
        this._spinner = cliSpinners.line;
      } else if (spinner === void 0) {
        this._spinner = cliSpinners.dots;
      } else if (cliSpinners[spinner]) {
        this._spinner = cliSpinners[spinner];
      } else {
        throw new Error(`There is no built-in spinner named '${spinner}'. See https://github.com/sindresorhus/cli-spinners/blob/master/spinners.json for a full list.`);
      }
      this._updateInterval(this._spinner.interval);
    }
    get text() {
      return this[TEXT];
    }
    set text(value) {
      this[TEXT] = value;
      this.updateLineCount();
    }
    get prefixText() {
      return this[PREFIX_TEXT];
    }
    set prefixText(value) {
      this[PREFIX_TEXT] = value;
      this.updateLineCount();
    }
    get isSpinning() {
      return this.id !== void 0;
    }
    getFullPrefixText(prefixText = this[PREFIX_TEXT], postfix = " ") {
      if (typeof prefixText === "string") {
        return prefixText + postfix;
      }
      if (typeof prefixText === "function") {
        return prefixText() + postfix;
      }
      return "";
    }
    updateLineCount() {
      const columns = this.stream.columns || 80;
      const fullPrefixText = this.getFullPrefixText(this.prefixText, "-");
      this.lineCount = 0;
      for (const line of stripAnsi(fullPrefixText + "--" + this[TEXT]).split("\n")) {
        this.lineCount += Math.max(1, Math.ceil(wcwidth(line) / columns));
      }
    }
    get isEnabled() {
      return this._isEnabled && !this.isSilent;
    }
    set isEnabled(value) {
      if (typeof value !== "boolean") {
        throw new TypeError("The `isEnabled` option must be a boolean");
      }
      this._isEnabled = value;
    }
    get isSilent() {
      return this._isSilent;
    }
    set isSilent(value) {
      if (typeof value !== "boolean") {
        throw new TypeError("The `isSilent` option must be a boolean");
      }
      this._isSilent = value;
    }
    frame() {
      const {frames} = this.spinner;
      let frame = frames[this.frameIndex];
      if (this.color) {
        frame = chalk[this.color](frame);
      }
      this.frameIndex = ++this.frameIndex % frames.length;
      const fullPrefixText = typeof this.prefixText === "string" && this.prefixText !== "" ? this.prefixText + " " : "";
      const fullText = typeof this.text === "string" ? " " + this.text : "";
      return fullPrefixText + frame + fullText;
    }
    clear() {
      if (!this.isEnabled || !this.stream.isTTY) {
        return this;
      }
      for (let i = 0; i < this.linesToClear; i++) {
        if (i > 0) {
          this.stream.moveCursor(0, -1);
        }
        this.stream.clearLine();
        this.stream.cursorTo(this.indent);
      }
      this.linesToClear = 0;
      return this;
    }
    render() {
      if (this.isSilent) {
        return this;
      }
      this.clear();
      this.stream.write(this.frame());
      this.linesToClear = this.lineCount;
      return this;
    }
    start(text) {
      if (text) {
        this.text = text;
      }
      if (this.isSilent) {
        return this;
      }
      if (!this.isEnabled) {
        if (this.text) {
          this.stream.write(`- ${this.text}
`);
        }
        return this;
      }
      if (this.isSpinning) {
        return this;
      }
      if (this.hideCursor) {
        cliCursor.hide(this.stream);
      }
      if (this.discardStdin && process.stdin.isTTY) {
        this.isDiscardingStdin = true;
        stdinDiscarder.start();
      }
      this.render();
      this.id = setInterval(this.render.bind(this), this.interval);
      return this;
    }
    stop() {
      if (!this.isEnabled) {
        return this;
      }
      clearInterval(this.id);
      this.id = void 0;
      this.frameIndex = 0;
      this.clear();
      if (this.hideCursor) {
        cliCursor.show(this.stream);
      }
      if (this.discardStdin && process.stdin.isTTY && this.isDiscardingStdin) {
        stdinDiscarder.stop();
        this.isDiscardingStdin = false;
      }
      return this;
    }
    succeed(text) {
      return this.stopAndPersist({symbol: logSymbols2.success, text});
    }
    fail(text) {
      return this.stopAndPersist({symbol: logSymbols2.error, text});
    }
    warn(text) {
      return this.stopAndPersist({symbol: logSymbols2.warning, text});
    }
    info(text) {
      return this.stopAndPersist({symbol: logSymbols2.info, text});
    }
    stopAndPersist(options = {}) {
      if (this.isSilent) {
        return this;
      }
      const prefixText = options.prefixText || this.prefixText;
      const text = options.text || this.text;
      const fullText = typeof text === "string" ? " " + text : "";
      this.stop();
      this.stream.write(`${this.getFullPrefixText(prefixText, " ")}${options.symbol || " "}${fullText}
`);
      return this;
    }
  };
  var oraFactory = function(options) {
    return new Ora(options);
  };
  module2.exports = oraFactory;
  module2.exports.promise = (action, options) => {
    if (typeof action.then !== "function") {
      throw new TypeError("Parameter `action` must be a Promise");
    }
    const spinner = new Ora(options);
    spinner.start();
    (async () => {
      try {
        await action;
        spinner.succeed();
      } catch {
        spinner.fail();
      }
    })();
    return spinner;
  };
});

// vendor/sha1.js
var require_sha1 = __commonJS((exports, module) => {
  /*
   * [js-sha1]{@link https://github.com/emn178/js-sha1}
   *
   * @version 0.6.0
   * @author Chen, Yi-Cyuan [emn178@gmail.com]
   * @copyright Chen, Yi-Cyuan 2014-2017
   * @license MIT
   */
  (function() {
    "use strict";
    var root = typeof window === "object" ? window : {};
    var NODE_JS = !root.JS_SHA1_NO_NODE_JS && typeof process === "object" && process.versions && process.versions.node;
    if (NODE_JS) {
      root = global;
    }
    var COMMON_JS = !root.JS_SHA1_NO_COMMON_JS && typeof module === "object" && module.exports;
    var AMD = typeof define === "function" && define.amd;
    var HEX_CHARS = "0123456789abcdef".split("");
    var EXTRA = [-2147483648, 8388608, 32768, 128];
    var SHIFT = [24, 16, 8, 0];
    var OUTPUT_TYPES = ["hex", "array", "digest", "arrayBuffer"];
    var blocks = [];
    var createOutputMethod = function(outputType) {
      return function(message2) {
        return new Sha1(true).update(message2)[outputType]();
      };
    };
    var createMethod = function() {
      var method = createOutputMethod("hex");
      if (NODE_JS) {
      }
      method.create = function() {
        return new Sha1();
      };
      method.update = function(message2) {
        return method.create().update(message2);
      };
      for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
        var type = OUTPUT_TYPES[i];
        method[type] = createOutputMethod(type);
      }
      return method;
    };
    var nodeWrap = function(method) {
      var crypto = eval("require('crypto')");
      var Buffer = eval("require('buffer').Buffer");
      var nodeMethod = function(message2) {
        if (typeof message2 === "string") {
          return crypto.createHash("sha1").update(message2, "utf8").digest("hex");
        } else if (message2.constructor === ArrayBuffer) {
          message2 = new Uint8Array(message2);
        } else if (message2.length === void 0) {
          return method(message2);
        }
        return crypto.createHash("sha1").update(new Buffer(message2)).digest("hex");
      };
      return nodeMethod;
    };
    function Sha1(sharedMemory) {
      if (sharedMemory) {
        blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
        this.blocks = blocks;
      } else {
        this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      }
      this.h0 = 1732584193;
      this.h1 = 4023233417;
      this.h2 = 2562383102;
      this.h3 = 271733878;
      this.h4 = 3285377520;
      this.block = this.start = this.bytes = this.hBytes = 0;
      this.finalized = this.hashed = false;
      this.first = true;
    }
    Sha1.prototype.update = function(message2) {
      if (this.finalized) {
        return;
      }
      var notString = typeof message2 !== "string";
      if (notString && message2.constructor === root.ArrayBuffer) {
        message2 = new Uint8Array(message2);
      }
      var code, index = 0, i, length = message2.length || 0, blocks = this.blocks;
      while (index < length) {
        if (this.hashed) {
          this.hashed = false;
          blocks[0] = this.block;
          blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
        }
        if (notString) {
          for (i = this.start; index < length && i < 64; ++index) {
            blocks[i >> 2] |= message2[index] << SHIFT[i++ & 3];
          }
        } else {
          for (i = this.start; index < length && i < 64; ++index) {
            code = message2.charCodeAt(index);
            if (code < 128) {
              blocks[i >> 2] |= code << SHIFT[i++ & 3];
            } else if (code < 2048) {
              blocks[i >> 2] |= (192 | code >> 6) << SHIFT[i++ & 3];
              blocks[i >> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
            } else if (code < 55296 || code >= 57344) {
              blocks[i >> 2] |= (224 | code >> 12) << SHIFT[i++ & 3];
              blocks[i >> 2] |= (128 | code >> 6 & 63) << SHIFT[i++ & 3];
              blocks[i >> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
            } else {
              code = 65536 + ((code & 1023) << 10 | message2.charCodeAt(++index) & 1023);
              blocks[i >> 2] |= (240 | code >> 18) << SHIFT[i++ & 3];
              blocks[i >> 2] |= (128 | code >> 12 & 63) << SHIFT[i++ & 3];
              blocks[i >> 2] |= (128 | code >> 6 & 63) << SHIFT[i++ & 3];
              blocks[i >> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
            }
          }
        }
        this.lastByteIndex = i;
        this.bytes += i - this.start;
        if (i >= 64) {
          this.block = blocks[16];
          this.start = i - 64;
          this.hash();
          this.hashed = true;
        } else {
          this.start = i;
        }
      }
      if (this.bytes > 4294967295) {
        this.hBytes += this.bytes / 4294967296 << 0;
        this.bytes = this.bytes % 4294967296;
      }
      return this;
    };
    Sha1.prototype.finalize = function() {
      if (this.finalized) {
        return;
      }
      this.finalized = true;
      var blocks = this.blocks, i = this.lastByteIndex;
      blocks[16] = this.block;
      blocks[i >> 2] |= EXTRA[i & 3];
      this.block = blocks[16];
      if (i >= 56) {
        if (!this.hashed) {
          this.hash();
        }
        blocks[0] = this.block;
        blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
      }
      blocks[14] = this.hBytes << 3 | this.bytes >>> 29;
      blocks[15] = this.bytes << 3;
      this.hash();
    };
    Sha1.prototype.hash = function() {
      var a = this.h0, b = this.h1, c = this.h2, d = this.h3, e = this.h4;
      var f, j, t, blocks = this.blocks;
      for (j = 16; j < 80; ++j) {
        t = blocks[j - 3] ^ blocks[j - 8] ^ blocks[j - 14] ^ blocks[j - 16];
        blocks[j] = t << 1 | t >>> 31;
      }
      for (j = 0; j < 20; j += 5) {
        f = b & c | ~b & d;
        t = a << 5 | a >>> 27;
        e = t + f + e + 1518500249 + blocks[j] << 0;
        b = b << 30 | b >>> 2;
        f = a & b | ~a & c;
        t = e << 5 | e >>> 27;
        d = t + f + d + 1518500249 + blocks[j + 1] << 0;
        a = a << 30 | a >>> 2;
        f = e & a | ~e & b;
        t = d << 5 | d >>> 27;
        c = t + f + c + 1518500249 + blocks[j + 2] << 0;
        e = e << 30 | e >>> 2;
        f = d & e | ~d & a;
        t = c << 5 | c >>> 27;
        b = t + f + b + 1518500249 + blocks[j + 3] << 0;
        d = d << 30 | d >>> 2;
        f = c & d | ~c & e;
        t = b << 5 | b >>> 27;
        a = t + f + a + 1518500249 + blocks[j + 4] << 0;
        c = c << 30 | c >>> 2;
      }
      for (; j < 40; j += 5) {
        f = b ^ c ^ d;
        t = a << 5 | a >>> 27;
        e = t + f + e + 1859775393 + blocks[j] << 0;
        b = b << 30 | b >>> 2;
        f = a ^ b ^ c;
        t = e << 5 | e >>> 27;
        d = t + f + d + 1859775393 + blocks[j + 1] << 0;
        a = a << 30 | a >>> 2;
        f = e ^ a ^ b;
        t = d << 5 | d >>> 27;
        c = t + f + c + 1859775393 + blocks[j + 2] << 0;
        e = e << 30 | e >>> 2;
        f = d ^ e ^ a;
        t = c << 5 | c >>> 27;
        b = t + f + b + 1859775393 + blocks[j + 3] << 0;
        d = d << 30 | d >>> 2;
        f = c ^ d ^ e;
        t = b << 5 | b >>> 27;
        a = t + f + a + 1859775393 + blocks[j + 4] << 0;
        c = c << 30 | c >>> 2;
      }
      for (; j < 60; j += 5) {
        f = b & c | b & d | c & d;
        t = a << 5 | a >>> 27;
        e = t + f + e - 1894007588 + blocks[j] << 0;
        b = b << 30 | b >>> 2;
        f = a & b | a & c | b & c;
        t = e << 5 | e >>> 27;
        d = t + f + d - 1894007588 + blocks[j + 1] << 0;
        a = a << 30 | a >>> 2;
        f = e & a | e & b | a & b;
        t = d << 5 | d >>> 27;
        c = t + f + c - 1894007588 + blocks[j + 2] << 0;
        e = e << 30 | e >>> 2;
        f = d & e | d & a | e & a;
        t = c << 5 | c >>> 27;
        b = t + f + b - 1894007588 + blocks[j + 3] << 0;
        d = d << 30 | d >>> 2;
        f = c & d | c & e | d & e;
        t = b << 5 | b >>> 27;
        a = t + f + a - 1894007588 + blocks[j + 4] << 0;
        c = c << 30 | c >>> 2;
      }
      for (; j < 80; j += 5) {
        f = b ^ c ^ d;
        t = a << 5 | a >>> 27;
        e = t + f + e - 899497514 + blocks[j] << 0;
        b = b << 30 | b >>> 2;
        f = a ^ b ^ c;
        t = e << 5 | e >>> 27;
        d = t + f + d - 899497514 + blocks[j + 1] << 0;
        a = a << 30 | a >>> 2;
        f = e ^ a ^ b;
        t = d << 5 | d >>> 27;
        c = t + f + c - 899497514 + blocks[j + 2] << 0;
        e = e << 30 | e >>> 2;
        f = d ^ e ^ a;
        t = c << 5 | c >>> 27;
        b = t + f + b - 899497514 + blocks[j + 3] << 0;
        d = d << 30 | d >>> 2;
        f = c ^ d ^ e;
        t = b << 5 | b >>> 27;
        a = t + f + a - 899497514 + blocks[j + 4] << 0;
        c = c << 30 | c >>> 2;
      }
      this.h0 = this.h0 + a << 0;
      this.h1 = this.h1 + b << 0;
      this.h2 = this.h2 + c << 0;
      this.h3 = this.h3 + d << 0;
      this.h4 = this.h4 + e << 0;
    };
    Sha1.prototype.hex = function() {
      this.finalize();
      var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4;
      return HEX_CHARS[h0 >> 28 & 15] + HEX_CHARS[h0 >> 24 & 15] + HEX_CHARS[h0 >> 20 & 15] + HEX_CHARS[h0 >> 16 & 15] + HEX_CHARS[h0 >> 12 & 15] + HEX_CHARS[h0 >> 8 & 15] + HEX_CHARS[h0 >> 4 & 15] + HEX_CHARS[h0 & 15] + HEX_CHARS[h1 >> 28 & 15] + HEX_CHARS[h1 >> 24 & 15] + HEX_CHARS[h1 >> 20 & 15] + HEX_CHARS[h1 >> 16 & 15] + HEX_CHARS[h1 >> 12 & 15] + HEX_CHARS[h1 >> 8 & 15] + HEX_CHARS[h1 >> 4 & 15] + HEX_CHARS[h1 & 15] + HEX_CHARS[h2 >> 28 & 15] + HEX_CHARS[h2 >> 24 & 15] + HEX_CHARS[h2 >> 20 & 15] + HEX_CHARS[h2 >> 16 & 15] + HEX_CHARS[h2 >> 12 & 15] + HEX_CHARS[h2 >> 8 & 15] + HEX_CHARS[h2 >> 4 & 15] + HEX_CHARS[h2 & 15] + HEX_CHARS[h3 >> 28 & 15] + HEX_CHARS[h3 >> 24 & 15] + HEX_CHARS[h3 >> 20 & 15] + HEX_CHARS[h3 >> 16 & 15] + HEX_CHARS[h3 >> 12 & 15] + HEX_CHARS[h3 >> 8 & 15] + HEX_CHARS[h3 >> 4 & 15] + HEX_CHARS[h3 & 15] + HEX_CHARS[h4 >> 28 & 15] + HEX_CHARS[h4 >> 24 & 15] + HEX_CHARS[h4 >> 20 & 15] + HEX_CHARS[h4 >> 16 & 15] + HEX_CHARS[h4 >> 12 & 15] + HEX_CHARS[h4 >> 8 & 15] + HEX_CHARS[h4 >> 4 & 15] + HEX_CHARS[h4 & 15];
    };
    Sha1.prototype.toString = Sha1.prototype.hex;
    Sha1.prototype.digest = function() {
      this.finalize();
      var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4;
      return [
        h0 >> 24 & 255,
        h0 >> 16 & 255,
        h0 >> 8 & 255,
        h0 & 255,
        h1 >> 24 & 255,
        h1 >> 16 & 255,
        h1 >> 8 & 255,
        h1 & 255,
        h2 >> 24 & 255,
        h2 >> 16 & 255,
        h2 >> 8 & 255,
        h2 & 255,
        h3 >> 24 & 255,
        h3 >> 16 & 255,
        h3 >> 8 & 255,
        h3 & 255,
        h4 >> 24 & 255,
        h4 >> 16 & 255,
        h4 >> 8 & 255,
        h4 & 255
      ];
    };
    var alphabet = "0123456789abcdefghjkmnpqrtuvwxyz";
    var alias = {o: 0, i: 1, l: 1, s: 5};
    Sha1.prototype.b32 = function() {
      var bytes = this.digest();
      var skip = 0;
      var bits = 0;
      var out = "";
      for (var i = 0; i < bytes.length; ) {
        var byte = bytes[i];
        if (skip < 0) {
          bits |= byte >> -skip;
        } else {
          bits = byte << skip & 248;
        }
        if (skip > 3) {
          skip -= 8;
          i += 1;
          continue;
        }
        if (skip < 4) {
          out += alphabet[bits >> 3];
          skip += 5;
        }
      }
      out = out + (skip < 0 ? alphabet[bits >> 3] : "");
      return out;
    };
    Sha1.prototype.array = Sha1.prototype.digest;
    Sha1.prototype.arrayBuffer = function() {
      this.finalize();
      var buffer = new ArrayBuffer(20);
      var dataView = new DataView(buffer);
      dataView.setUint32(0, this.h0);
      dataView.setUint32(4, this.h1);
      dataView.setUint32(8, this.h2);
      dataView.setUint32(12, this.h3);
      dataView.setUint32(16, this.h4);
      return buffer;
    };
    var exports = createMethod();
    if (COMMON_JS) {
      module.exports = exports;
    } else {
      root.sha1 = exports;
      if (AMD) {
        define(function() {
          return exports;
        });
      }
    }
  })();
});

// src/compiler/helpers.imba1
var require_helpers = __commonJS((exports2) => {
  function iter$11(a) {
    return a ? a.toArray ? a.toArray() : a : [];
  }
  var self2 = {};
  var sha1 = require_sha1();
  var ansiMap = {
    reset: [0, 0],
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29],
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    gray: [90, 39],
    redBright: [91, 39],
    greenBright: [92, 39],
    yellowBright: [93, 39],
    blueBright: [94, 39],
    magentaBright: [95, 39],
    cyanBright: [96, 39],
    whiteBright: [97, 39]
  };
  var ansi2 = exports2.ansi = {
    bold: function(text) {
      return "[1m" + text + "[22m";
    },
    red: function(text) {
      return "[31m" + text + "[39m";
    },
    green: function(text) {
      return "[32m" + text + "[39m";
    },
    yellow: function(text) {
      return "[33m" + text + "[39m";
    },
    blue: function(text) {
      return "[94m" + text + "[39m";
    },
    gray: function(text) {
      return "[90m" + text + "[39m";
    },
    white: function(text) {
      return "[37m" + text + "[39m";
    },
    f: function(name, text) {
      let pair = ansiMap[name];
      return "[" + pair[0] + "m" + text + "[" + pair[1] + "m";
    }
  };
  ansi2.warn = ansi2.yellow;
  ansi2.error = ansi2.red;
  exports2.brace = self2.brace = function(str) {
    var lines = str.match(/\n/);
    if (lines) {
      return "{" + str + "\n}";
    } else {
      return "{\n" + str + "\n}";
    }
    ;
  };
  exports2.normalizeIndentation = self2.normalizeIndentation = function(str) {
    var m;
    var reg = /\n+([^\n\S]*)/g;
    var ind = null;
    var length_;
    while (m = reg.exec(str)) {
      var attempt = m[1];
      if (ind === null || 0 < (length_ = attempt.length) && length_ < ind.length) {
        ind = attempt;
      }
      ;
    }
    ;
    if (ind) {
      str = str.replace(RegExp("\\n" + ind, "g"), "\n");
    }
    ;
    return str;
  };
  exports2.flatten = self2.flatten = function(arr) {
    var out = [];
    arr.forEach(function(v) {
      return v instanceof Array ? out.push.apply(out, self2.flatten(v)) : out.push(v);
    });
    return out;
  };
  exports2.clearLocationMarkers = self2.clearLocationMarkers = function(str) {
    return str.replace(/\/\*\%([\w\|]*)\$\*\//g, "");
  };
  exports2.pascalCase = self2.pascalCase = function(str) {
    return str.replace(/(^|[\-\_\s])(\w)/g, function(m, v, l) {
      return l.toUpperCase();
    });
  };
  exports2.camelCase = self2.camelCase = function(str) {
    str = String(str);
    return str.replace(/([\-\_\s])(\w)/g, function(m, v, l) {
      return l.toUpperCase();
    });
  };
  exports2.dashToCamelCase = self2.dashToCamelCase = function(str) {
    str = String(str);
    if (str.indexOf("-") >= 0) {
      str = str.replace(/([\-\s])(\w)/g, function(m, v, l) {
        return l.toUpperCase();
      });
    }
    ;
    return str;
  };
  exports2.snakeCase = self2.snakeCase = function(str) {
    var str = str.replace(/([\-\s])(\w)/g, "_");
    return str.replace(/()([A-Z])/g, "_$1", function(m, v, l) {
      return l.toUpperCase();
    });
  };
  exports2.dasherize = self2.dasherize = function(str) {
    return str.replace(/([a-z\d])([A-Z])/g, "$1-$2").toLowerCase();
  };
  exports2.setterSym = self2.setterSym = function(sym) {
    return self2.dashToCamelCase("set-" + sym);
  };
  exports2.quote = self2.quote = function(str) {
    return '"' + str + '"';
  };
  exports2.singlequote = self2.singlequote = function(str) {
    return "'" + str + "'";
  };
  exports2.symbolize = self2.symbolize = function(str) {
    str = String(str);
    var end = str.charAt(str.length - 1);
    if (end == "=") {
      str = "set" + str[0].toUpperCase() + str.slice(1, -1);
    } else if (end == "?") {
      str = "is" + str[0].toUpperCase() + str.slice(1, -1);
    } else if (end == "!") {
      str = "do" + str[0].toUpperCase() + str.slice(1, -1);
    }
    ;
    if (str.indexOf("-") >= 0) {
      str = str.replace(/([\-\s])(\w)/g, function(m, v, l) {
        return l.toUpperCase();
      });
    }
    ;
    return str;
  };
  exports2.indent = self2.indent = function(str) {
    return String(str).replace(/^/g, "	").replace(/\n/g, "\n	").replace(/\n\t$/g, "\n");
  };
  exports2.bracketize = self2.bracketize = function(str, ind) {
    if (ind === void 0)
      ind = true;
    if (ind) {
      str = "\n" + self2.indent(str) + "\n";
    }
    ;
    return "{" + str + "}";
  };
  exports2.parenthesize = self2.parenthesize = function(str) {
    return "(" + String(str) + ")";
  };
  exports2.unionOfLocations = self2.unionOfLocations = function() {
    var $0 = arguments, i = $0.length;
    var locs = new Array(i > 0 ? i : 0);
    while (i > 0)
      locs[i - 1] = $0[--i];
    var a = Infinity;
    var b = -Infinity;
    for (let i2 = 0, items = iter$11(locs), len = items.length, loc; i2 < len; i2++) {
      loc = items[i2];
      if (loc && loc._loc != void 0) {
        loc = loc._loc;
      }
      ;
      if (loc && loc.loc instanceof Function) {
        loc = loc.loc();
      }
      ;
      if (loc instanceof Array) {
        if (a > loc[0]) {
          a = loc[0];
        }
        ;
        if (b < loc[0]) {
          b = loc[1];
        }
        ;
      } else if (typeof loc == "number" || loc instanceof Number) {
        if (a > loc) {
          a = loc;
        }
        ;
        if (b < loc) {
          b = loc;
        }
        ;
      }
      ;
    }
    ;
    return [a, b];
  };
  exports2.locationToLineColMap = self2.locationToLineColMap = function(code) {
    var lines = code.split(/\n/g);
    var map = [];
    var chr;
    var loc = 0;
    var col = 0;
    var line = 0;
    while (chr = code[loc]) {
      map[loc] = [line, col];
      if (chr == "\n") {
        line++;
        col = 0;
      } else {
        col++;
      }
      ;
      loc++;
    }
    ;
    map[loc] = [line, col];
    map[loc + 1] = [line, col];
    return map;
  };
  exports2.markLineColForTokens = self2.markLineColForTokens = function(tokens, code) {
    return self2;
  };
  exports2.parseArgs = self2.parseArgs = function(argv, o) {
    var env_;
    if (o === void 0)
      o = {};
    var aliases = o.alias || (o.alias = {});
    var groups = o.group || (o.group = []);
    var schema2 = o.schema || {};
    schema2.main = {};
    var options = {};
    var explicit = {};
    argv = argv || process.argv.slice(2);
    var curr = null;
    var i = 0;
    var m;
    while (i < argv.length) {
      var arg = argv[i];
      i++;
      if (m = arg.match(/^\-([a-zA-Z]+)(\=\S+)?$/)) {
        curr = null;
        let chars = m[1].split("");
        for (let i2 = 0, items = iter$11(chars), len = items.length, item; i2 < len; i2++) {
          item = items[i2];
          var key = aliases[item] || item;
          chars[i2] = key;
          options[key] = true;
        }
        ;
        if (chars.length == 1) {
          curr = chars;
        }
        ;
        continue;
      } else if (m = arg.match(/^\-\-([a-z0-9\-\_A-Z]+)(\=\S+)?$/)) {
        var val = true;
        key = m[1];
        if (key.indexOf("no-") == 0) {
          key = key.substr(3);
          val = false;
        }
        ;
        key = self2.dashToCamelCase(key);
        if (m[2]) {
          val = m[2].slice(1);
        }
        ;
        options[key] = val;
        curr = key;
        continue;
      } else {
        var desc = schema2[curr];
        if (!(curr && schema2[curr])) {
          curr = "main";
        }
        ;
        if (arg.match(/^\d+$/)) {
          arg = parseInt(arg);
        }
        ;
        val = options[curr];
        if (val == true || val == false) {
          options[curr] = arg;
        } else if (typeof val == "string" || val instanceof String || (typeof val == "number" || val instanceof Number)) {
          options[curr] = [val].concat(arg);
        } else if (val instanceof Array) {
          val.push(arg);
        } else {
          options[curr] = arg;
        }
        ;
        if (!(desc && desc.multi)) {
          curr = "main";
        }
        ;
      }
      ;
    }
    ;
    for (let j = 0, items = iter$11(groups), len = items.length; j < len; j++) {
      let name = self2.dashToCamelCase(items[j]);
      for (let v, i_ = 0, keys = Object.keys(options), l = keys.length, k; i_ < l; i_++) {
        k = keys[i_];
        v = options[k];
        if (k.indexOf(name) == 0) {
          let key2 = k.substr(name.length).replace(/^\w/, function(m2) {
            return m2.toLowerCase();
          });
          if (key2) {
            options[name] || (options[name] = {});
            options[name][key2] = v;
          } else {
            options[name] || (options[name] = {});
          }
          ;
        }
        ;
      }
      ;
    }
    ;
    if (typeof (env_ = options.env) == "string" || env_ instanceof String) {
      options["ENV_" + options.env] = true;
    }
    ;
    return options;
  };
  exports2.printExcerpt = self2.printExcerpt = function(code, loc, pars) {
    if (!pars || pars.constructor !== Object)
      pars = {};
    var hl = pars.hl !== void 0 ? pars.hl : false;
    var gutter = pars.gutter !== void 0 ? pars.gutter : true;
    var type = pars.type !== void 0 ? pars.type : "warn";
    var pad = pars.pad !== void 0 ? pars.pad : 2;
    var lines = code.split(/\n/g);
    var locmap = self2.locationToLineColMap(code);
    var lc = locmap[loc[0]] || [0, 0];
    var ln = lc[0];
    var col = lc[1];
    var line = lines[ln];
    var ln0 = Math.max(0, ln - pad);
    var ln1 = Math.min(ln0 + pad + 1 + pad, lines.length);
    let lni = ln - ln0;
    var l = ln0;
    var res1 = [];
    while (l < ln1) {
      res1.push(lines[l++]);
    }
    ;
    var out = res1;
    if (gutter) {
      out = out.map(function(line2, i) {
        let prefix = "" + (ln0 + i + 1);
        let str;
        while (prefix.length < String(ln1).length) {
          prefix = " " + prefix;
        }
        ;
        if (i == lni) {
          str = "   -> " + prefix + " | " + line2;
          if (hl) {
            str = ansi2.f(hl, str);
          }
          ;
        } else {
          str = "      " + prefix + " | " + line2;
          if (hl) {
            str = ansi2.f("gray", str);
          }
          ;
        }
        ;
        return str;
      });
    }
    ;
    let res = out.join("\n");
    return res;
  };
  exports2.printWarning = self2.printWarning = function(code, warn) {
    let msg = warn.message;
    let excerpt = self2.printExcerpt(code, warn.loc, {hl: "whiteBright", type: "warn", pad: 1});
    return msg + "\n" + excerpt;
  };
  exports2.identifierForPath = self2.identifierForPath = function(str) {
    var hash = sha1.create();
    hash.update(str);
    var id = hash.b32().replace(/^\d+/, "");
    return id.slice(0, 6);
  };
});

// node_modules/flatted/cjs/index.js
var require_cjs = __commonJS((exports2) => {
  "use strict";
  /*! (c) 2020 Andrea Giammarchi */
  var {parse: $parse, stringify: $stringify} = JSON;
  var {keys} = Object;
  var Primitive = String;
  var primitive = "string";
  var ignore = {};
  var object = "object";
  var noop = (_, value) => value;
  var primitives = (value) => value instanceof Primitive ? Primitive(value) : value;
  var Primitives = (_, value) => typeof value === primitive ? new Primitive(value) : value;
  var revive = (input, parsed, output, $) => {
    const lazy = [];
    for (let ke = keys(output), {length} = ke, y = 0; y < length; y++) {
      const k = ke[y];
      const value = output[k];
      if (value instanceof Primitive) {
        const tmp3 = input[value];
        if (typeof tmp3 === object && !parsed.has(tmp3)) {
          parsed.add(tmp3);
          output[k] = ignore;
          lazy.push({k, a: [input, parsed, tmp3, $]});
        } else
          output[k] = $.call(output, k, tmp3);
      } else if (output[k] !== ignore)
        output[k] = $.call(output, k, value);
    }
    for (let {length} = lazy, i = 0; i < length; i++) {
      const {k, a} = lazy[i];
      output[k] = $.call(output, k, revive.apply(null, a));
    }
    return output;
  };
  var set = (known, input, value) => {
    const index = Primitive(input.push(value) - 1);
    known.set(value, index);
    return index;
  };
  var parse = (text, reviver) => {
    const input = $parse(text, Primitives).map(primitives);
    const value = input[0];
    const $ = reviver || noop;
    const tmp3 = typeof value === object && value ? revive(input, new Set(), value, $) : value;
    return $.call({"": tmp3}, "", tmp3);
  };
  exports2.parse = parse;
  var stringify = (value, replacer, space) => {
    const $ = replacer && typeof replacer === object ? (k, v) => k === "" || -1 < replacer.indexOf(k) ? v : void 0 : replacer || noop;
    const known = new Map();
    const input = [];
    const output = [];
    let i = +set(known, input, $.call({"": value}, "", value));
    let firstRun = !i;
    while (i < input.length) {
      firstRun = true;
      output[i] = $stringify(input[i++], replace, space);
    }
    return "[" + output.join(",") + "]";
    function replace(key, value2) {
      if (firstRun) {
        firstRun = !firstRun;
        return value2;
      }
      const after = $.call(this, key, value2);
      switch (typeof after) {
        case object:
          if (after === null)
            return after;
        case primitive:
          return known.get(after) || set(known, input, after);
      }
      return after;
    }
  };
  exports2.stringify = stringify;
});

// src/bundler/utils.imba
var require_utils4 = __commonJS((exports2) => {
  __export(exports2, {
    createHash: () => createHash2,
    defaultLoaders: () => defaultLoaders,
    deserializeData: () => deserializeData2,
    diagnosticToESB: () => diagnosticToESB2,
    ensureDir: () => ensureDir,
    exists: () => exists,
    getCacheDir: () => getCacheDir2,
    idGenerator: () => idGenerator,
    pluck: () => pluck2,
    readFile: () => readFile,
    rename: () => rename,
    resolveConfig: () => resolveConfig2,
    resolveFile: () => resolveFile,
    resolvePackage: () => resolvePackage2,
    resolvePath: () => resolvePath,
    serializeData: () => serializeData2,
    writeFile: () => writeFile,
    writePath: () => writePath
  });
  var fs5 = __toModule(require("fs"));
  var path6 = __toModule(require("path"));
  var crypto4 = __toModule(require("crypto"));
  var os6 = __toModule(require("os"));
  var flatted = __toModule(require_cjs());
  function iter$11(a) {
    let v;
    return a ? (v = a.toIterable) ? v.call(a) : a : [];
  }
  var sys$36 = Symbol.for("#mtime");
  var sys$43 = Symbol.for("#path");
  var defaultLoaders = {
    ".png": "file",
    ".svg": "file",
    ".woff2": "file",
    ".woff": "file",
    ".ttf": "file",
    ".otf": "file"
  };
  function getCacheDir2(options) {
    let dir = process.env.IMBA_CACHEDIR || path6.default.resolve(__dirname, "..", ".imba-cache");
    console.log("cache dir here", dir, __filename);
    if (!fs5.default.existsSync(dir)) {
      console.log("cache dir does not exist - create");
      fs5.default.mkdirSync(dir);
    }
    ;
    return dir;
  }
  function diagnosticToESB2(item, add = {}) {
    return {
      text: item.message,
      location: Object.assign({
        line: item.range.start.line + 1,
        column: item.range.start.character,
        length: item.range.end.offset - item.range.start.offset,
        lineText: item.lineText
      }, add)
    };
  }
  async function writePath(src, body) {
    await ensureDir(src);
    return fs5.default.promises.writeFile(src, body);
  }
  function writeFile(src, body) {
    return fs5.default.promises.writeFile(src, body);
  }
  function readFile(src, encoding = "utf8") {
    return fs5.default.promises.readFile(src, encoding);
  }
  function exists(src) {
    let p = fs5.default.promises.access(src, fs5.default.constants.F_OK);
    return p.then(function() {
      return true;
    }).catch(function() {
      return false;
    });
  }
  function rename(src, pattern) {
    let dir = path6.default.dirname(src);
    let ext = path6.default.extname(src);
    let name = path6.default.basename(src, ext);
    return path6.default.join(dir, pattern.replace("*", name));
    let parsed = path6.default.parse(src);
    if (typeof pattern == "string") {
      if (pattern[0] == ".") {
        return path6.default.join(dir, name + pattern);
        parsed.ext = pattern;
      } else if (pattern.indexOf("")) {
        parsed.name = pattern;
      }
      ;
    } else {
      Object.assign(parsed, pattern);
    }
    ;
    console.log("rename", parsed);
    return path6.default.format(parsed);
  }
  function pluck2(array, cb) {
    for (let i = 0, sys$114 = iter$11(array), sys$29 = sys$114.length; i < sys$29; i++) {
      let item = sys$114[i];
      if (cb(item)) {
        array.splice(i, 1);
        return item;
      }
      ;
    }
    ;
    return null;
  }
  function resolveConfig2(cwd, name) {
    try {
      let src = path6.default.resolve(cwd || ".", name || "imbaconfig.json");
      let config2 = JSON.parse(fs5.default.readFileSync(src, "utf8"));
      config2[sys$36] = fs5.default.statSync(src).mtimeMs || 0;
      config2[sys$43] = src;
      return resolve(config2);
    } catch (e) {
      return resolve({});
    }
    ;
  }
  function resolvePath(name, cwd = ".", cb = null) {
    let src = path6.default.resolve(cwd, name);
    let dir = path6.default.dirname(src);
    if (fs5.default.existsSync(src)) {
      return src;
    }
    ;
    let up = path6.default.dirname(dir);
    return up != dir ? resolvePath(name, up) : null;
  }
  function resolveFile(name, cwd, handler) {
    let src;
    if (src = resolvePath(name, cwd)) {
      let file = {
        path: src,
        body: fs5.default.readFileSync(src, "utf-8")
      };
      return handler(file);
    }
    ;
    return null;
  }
  function resolvePackage2(cwd) {
    return resolveFile("package.json", cwd, function(_0) {
      return JSON.parse(_0.body);
    });
  }
  function idGenerator(alphabet = "abcdefghijklmnopqrstuvwxyz") {
    let remap = {};
    for (let len = alphabet.length, k = 0, rd = len - k; rd > 0 ? k < len : k > len; rd > 0 ? k++ : k--) {
      remap[k.toString(alphabet.length)] = alphabet[k];
    }
    ;
    return function(num) {
      return num.toString(alphabet.length).split("").map(function(_0) {
        return remap[_0];
      }).join("");
    };
  }
  function createHash2(body) {
    return crypto4.default.createHash("sha1").update(body).digest("base64").replace(/[\=\+\/]/g, "").slice(0, 8).toUpperCase();
  }
  function serializeData2(data) {
    return flatted.stringify(data);
  }
  function deserializeData2(data) {
    return flatted.parse(data);
  }
  var dirExistsCache = {};
  function ensureDir(src) {
    let stack = [];
    let dirname = src;
    return new Promise(function(resolve2) {
      while (dirname = path6.default.dirname(dirname)) {
        if (dirExistsCache[dirname] || fs5.default.existsSync(dirname)) {
          break;
        }
        ;
        stack.push(dirname);
      }
      ;
      while (stack.length) {
        let dir = stack.pop();
        fs5.default.mkdirSync(dirExistsCache[dirname] = dir);
      }
      ;
      return resolve2(src);
    });
  }
});

// node_modules/fs.realpath/old.js
var require_old = __commonJS((exports2) => {
  var pathModule = require("path");
  var isWindows = process.platform === "win32";
  var fs5 = require("fs");
  var DEBUG = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);
  function rethrow() {
    var callback;
    if (DEBUG) {
      var backtrace = new Error();
      callback = debugCallback;
    } else
      callback = missingCallback;
    return callback;
    function debugCallback(err) {
      if (err) {
        backtrace.message = err.message;
        err = backtrace;
        missingCallback(err);
      }
    }
    function missingCallback(err) {
      if (err) {
        if (process.throwDeprecation)
          throw err;
        else if (!process.noDeprecation) {
          var msg = "fs: missing callback " + (err.stack || err.message);
          if (process.traceDeprecation)
            console.trace(msg);
          else
            console.error(msg);
        }
      }
    }
  }
  function maybeCallback(cb) {
    return typeof cb === "function" ? cb : rethrow();
  }
  var normalize = pathModule.normalize;
  if (isWindows) {
    nextPartRe = /(.*?)(?:[\/\\]+|$)/g;
  } else {
    nextPartRe = /(.*?)(?:[\/]+|$)/g;
  }
  var nextPartRe;
  if (isWindows) {
    splitRootRe = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
  } else {
    splitRootRe = /^[\/]*/;
  }
  var splitRootRe;
  exports2.realpathSync = function realpathSync(p, cache2) {
    p = pathModule.resolve(p);
    if (cache2 && Object.prototype.hasOwnProperty.call(cache2, p)) {
      return cache2[p];
    }
    var original = p, seenLinks = {}, knownHard = {};
    var pos;
    var current;
    var base;
    var previous;
    start();
    function start() {
      var m = splitRootRe.exec(p);
      pos = m[0].length;
      current = m[0];
      base = m[0];
      previous = "";
      if (isWindows && !knownHard[base]) {
        fs5.lstatSync(base);
        knownHard[base] = true;
      }
    }
    while (pos < p.length) {
      nextPartRe.lastIndex = pos;
      var result = nextPartRe.exec(p);
      previous = current;
      current += result[0];
      base = previous + result[1];
      pos = nextPartRe.lastIndex;
      if (knownHard[base] || cache2 && cache2[base] === base) {
        continue;
      }
      var resolvedLink;
      if (cache2 && Object.prototype.hasOwnProperty.call(cache2, base)) {
        resolvedLink = cache2[base];
      } else {
        var stat = fs5.lstatSync(base);
        if (!stat.isSymbolicLink()) {
          knownHard[base] = true;
          if (cache2)
            cache2[base] = base;
          continue;
        }
        var linkTarget = null;
        if (!isWindows) {
          var id = stat.dev.toString(32) + ":" + stat.ino.toString(32);
          if (seenLinks.hasOwnProperty(id)) {
            linkTarget = seenLinks[id];
          }
        }
        if (linkTarget === null) {
          fs5.statSync(base);
          linkTarget = fs5.readlinkSync(base);
        }
        resolvedLink = pathModule.resolve(previous, linkTarget);
        if (cache2)
          cache2[base] = resolvedLink;
        if (!isWindows)
          seenLinks[id] = linkTarget;
      }
      p = pathModule.resolve(resolvedLink, p.slice(pos));
      start();
    }
    if (cache2)
      cache2[original] = p;
    return p;
  };
  exports2.realpath = function realpath(p, cache2, cb) {
    if (typeof cb !== "function") {
      cb = maybeCallback(cache2);
      cache2 = null;
    }
    p = pathModule.resolve(p);
    if (cache2 && Object.prototype.hasOwnProperty.call(cache2, p)) {
      return process.nextTick(cb.bind(null, null, cache2[p]));
    }
    var original = p, seenLinks = {}, knownHard = {};
    var pos;
    var current;
    var base;
    var previous;
    start();
    function start() {
      var m = splitRootRe.exec(p);
      pos = m[0].length;
      current = m[0];
      base = m[0];
      previous = "";
      if (isWindows && !knownHard[base]) {
        fs5.lstat(base, function(err) {
          if (err)
            return cb(err);
          knownHard[base] = true;
          LOOP();
        });
      } else {
        process.nextTick(LOOP);
      }
    }
    function LOOP() {
      if (pos >= p.length) {
        if (cache2)
          cache2[original] = p;
        return cb(null, p);
      }
      nextPartRe.lastIndex = pos;
      var result = nextPartRe.exec(p);
      previous = current;
      current += result[0];
      base = previous + result[1];
      pos = nextPartRe.lastIndex;
      if (knownHard[base] || cache2 && cache2[base] === base) {
        return process.nextTick(LOOP);
      }
      if (cache2 && Object.prototype.hasOwnProperty.call(cache2, base)) {
        return gotResolvedLink(cache2[base]);
      }
      return fs5.lstat(base, gotStat);
    }
    function gotStat(err, stat) {
      if (err)
        return cb(err);
      if (!stat.isSymbolicLink()) {
        knownHard[base] = true;
        if (cache2)
          cache2[base] = base;
        return process.nextTick(LOOP);
      }
      if (!isWindows) {
        var id = stat.dev.toString(32) + ":" + stat.ino.toString(32);
        if (seenLinks.hasOwnProperty(id)) {
          return gotTarget(null, seenLinks[id], base);
        }
      }
      fs5.stat(base, function(err2) {
        if (err2)
          return cb(err2);
        fs5.readlink(base, function(err3, target) {
          if (!isWindows)
            seenLinks[id] = target;
          gotTarget(err3, target);
        });
      });
    }
    function gotTarget(err, target, base2) {
      if (err)
        return cb(err);
      var resolvedLink = pathModule.resolve(previous, target);
      if (cache2)
        cache2[base2] = resolvedLink;
      gotResolvedLink(resolvedLink);
    }
    function gotResolvedLink(resolvedLink) {
      p = pathModule.resolve(resolvedLink, p.slice(pos));
      start();
    }
  };
});

// node_modules/fs.realpath/index.js
var require_fs2 = __commonJS((exports2, module2) => {
  module2.exports = realpath;
  realpath.realpath = realpath;
  realpath.sync = realpathSync;
  realpath.realpathSync = realpathSync;
  realpath.monkeypatch = monkeypatch;
  realpath.unmonkeypatch = unmonkeypatch;
  var fs5 = require("fs");
  var origRealpath = fs5.realpath;
  var origRealpathSync = fs5.realpathSync;
  var version = process.version;
  var ok = /^v[0-5]\./.test(version);
  var old = require_old();
  function newError(er) {
    return er && er.syscall === "realpath" && (er.code === "ELOOP" || er.code === "ENOMEM" || er.code === "ENAMETOOLONG");
  }
  function realpath(p, cache2, cb) {
    if (ok) {
      return origRealpath(p, cache2, cb);
    }
    if (typeof cache2 === "function") {
      cb = cache2;
      cache2 = null;
    }
    origRealpath(p, cache2, function(er, result) {
      if (newError(er)) {
        old.realpath(p, cache2, cb);
      } else {
        cb(er, result);
      }
    });
  }
  function realpathSync(p, cache2) {
    if (ok) {
      return origRealpathSync(p, cache2);
    }
    try {
      return origRealpathSync(p, cache2);
    } catch (er) {
      if (newError(er)) {
        return old.realpathSync(p, cache2);
      } else {
        throw er;
      }
    }
  }
  function monkeypatch() {
    fs5.realpath = realpath;
    fs5.realpathSync = realpathSync;
  }
  function unmonkeypatch() {
    fs5.realpath = origRealpath;
    fs5.realpathSync = origRealpathSync;
  }
});

// node_modules/concat-map/index.js
var require_concat_map = __commonJS((exports2, module2) => {
  module2.exports = function(xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
      var x = fn(xs[i], i);
      if (isArray(x))
        res.push.apply(res, x);
      else
        res.push(x);
    }
    return res;
  };
  var isArray = Array.isArray || function(xs) {
    return Object.prototype.toString.call(xs) === "[object Array]";
  };
});

// node_modules/balanced-match/index.js
var require_balanced_match = __commonJS((exports2, module2) => {
  "use strict";
  module2.exports = balanced;
  function balanced(a, b, str) {
    if (a instanceof RegExp)
      a = maybeMatch(a, str);
    if (b instanceof RegExp)
      b = maybeMatch(b, str);
    var r = range(a, b, str);
    return r && {
      start: r[0],
      end: r[1],
      pre: str.slice(0, r[0]),
      body: str.slice(r[0] + a.length, r[1]),
      post: str.slice(r[1] + b.length)
    };
  }
  function maybeMatch(reg, str) {
    var m = str.match(reg);
    return m ? m[0] : null;
  }
  balanced.range = range;
  function range(a, b, str) {
    var begs, beg, left, right, result;
    var ai = str.indexOf(a);
    var bi = str.indexOf(b, ai + 1);
    var i = ai;
    if (ai >= 0 && bi > 0) {
      begs = [];
      left = str.length;
      while (i >= 0 && !result) {
        if (i == ai) {
          begs.push(i);
          ai = str.indexOf(a, i + 1);
        } else if (begs.length == 1) {
          result = [begs.pop(), bi];
        } else {
          beg = begs.pop();
          if (beg < left) {
            left = beg;
            right = bi;
          }
          bi = str.indexOf(b, i + 1);
        }
        i = ai < bi && ai >= 0 ? ai : bi;
      }
      if (begs.length) {
        result = [left, right];
      }
    }
    return result;
  }
});

// node_modules/brace-expansion/index.js
var require_brace_expansion = __commonJS((exports2, module2) => {
  var concatMap = require_concat_map();
  var balanced = require_balanced_match();
  module2.exports = expandTop;
  var escSlash = "\0SLASH" + Math.random() + "\0";
  var escOpen = "\0OPEN" + Math.random() + "\0";
  var escClose = "\0CLOSE" + Math.random() + "\0";
  var escComma = "\0COMMA" + Math.random() + "\0";
  var escPeriod = "\0PERIOD" + Math.random() + "\0";
  function numeric(str) {
    return parseInt(str, 10) == str ? parseInt(str, 10) : str.charCodeAt(0);
  }
  function escapeBraces(str) {
    return str.split("\\\\").join(escSlash).split("\\{").join(escOpen).split("\\}").join(escClose).split("\\,").join(escComma).split("\\.").join(escPeriod);
  }
  function unescapeBraces(str) {
    return str.split(escSlash).join("\\").split(escOpen).join("{").split(escClose).join("}").split(escComma).join(",").split(escPeriod).join(".");
  }
  function parseCommaParts(str) {
    if (!str)
      return [""];
    var parts = [];
    var m = balanced("{", "}", str);
    if (!m)
      return str.split(",");
    var pre = m.pre;
    var body = m.body;
    var post = m.post;
    var p = pre.split(",");
    p[p.length - 1] += "{" + body + "}";
    var postParts = parseCommaParts(post);
    if (post.length) {
      p[p.length - 1] += postParts.shift();
      p.push.apply(p, postParts);
    }
    parts.push.apply(parts, p);
    return parts;
  }
  function expandTop(str) {
    if (!str)
      return [];
    if (str.substr(0, 2) === "{}") {
      str = "\\{\\}" + str.substr(2);
    }
    return expand(escapeBraces(str), true).map(unescapeBraces);
  }
  function embrace(str) {
    return "{" + str + "}";
  }
  function isPadded(el) {
    return /^-?0\d/.test(el);
  }
  function lte(i, y) {
    return i <= y;
  }
  function gte(i, y) {
    return i >= y;
  }
  function expand(str, isTop) {
    var expansions = [];
    var m = balanced("{", "}", str);
    if (!m || /\$$/.test(m.pre))
      return [str];
    var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
    var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
    var isSequence = isNumericSequence || isAlphaSequence;
    var isOptions = m.body.indexOf(",") >= 0;
    if (!isSequence && !isOptions) {
      if (m.post.match(/,.*\}/)) {
        str = m.pre + "{" + m.body + escClose + m.post;
        return expand(str);
      }
      return [str];
    }
    var n;
    if (isSequence) {
      n = m.body.split(/\.\./);
    } else {
      n = parseCommaParts(m.body);
      if (n.length === 1) {
        n = expand(n[0], false).map(embrace);
        if (n.length === 1) {
          var post = m.post.length ? expand(m.post, false) : [""];
          return post.map(function(p) {
            return m.pre + n[0] + p;
          });
        }
      }
    }
    var pre = m.pre;
    var post = m.post.length ? expand(m.post, false) : [""];
    var N;
    if (isSequence) {
      var x = numeric(n[0]);
      var y = numeric(n[1]);
      var width = Math.max(n[0].length, n[1].length);
      var incr2 = n.length == 3 ? Math.abs(numeric(n[2])) : 1;
      var test = lte;
      var reverse = y < x;
      if (reverse) {
        incr2 *= -1;
        test = gte;
      }
      var pad = n.some(isPadded);
      N = [];
      for (var i = x; test(i, y); i += incr2) {
        var c;
        if (isAlphaSequence) {
          c = String.fromCharCode(i);
          if (c === "\\")
            c = "";
        } else {
          c = String(i);
          if (pad) {
            var need = width - c.length;
            if (need > 0) {
              var z = new Array(need + 1).join("0");
              if (i < 0)
                c = "-" + z + c.slice(1);
              else
                c = z + c;
            }
          }
        }
        N.push(c);
      }
    } else {
      N = concatMap(n, function(el) {
        return expand(el, false);
      });
    }
    for (var j = 0; j < N.length; j++) {
      for (var k = 0; k < post.length; k++) {
        var expansion = pre + N[j] + post[k];
        if (!isTop || isSequence || expansion)
          expansions.push(expansion);
      }
    }
    return expansions;
  }
});

// node_modules/minimatch/minimatch.js
var require_minimatch = __commonJS((exports2, module2) => {
  module2.exports = minimatch;
  minimatch.Minimatch = Minimatch;
  var path6 = {sep: "/"};
  try {
    path6 = require("path");
  } catch (er) {
  }
  var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {};
  var expand = require_brace_expansion();
  var plTypes = {
    "!": {open: "(?:(?!(?:", close: "))[^/]*?)"},
    "?": {open: "(?:", close: ")?"},
    "+": {open: "(?:", close: ")+"},
    "*": {open: "(?:", close: ")*"},
    "@": {open: "(?:", close: ")"}
  };
  var qmark = "[^/]";
  var star = qmark + "*?";
  var twoStarDot = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?";
  var twoStarNoDot = "(?:(?!(?:\\/|^)\\.).)*?";
  var reSpecials = charSet("().*{}+?[]^$\\!");
  function charSet(s) {
    return s.split("").reduce(function(set, c) {
      set[c] = true;
      return set;
    }, {});
  }
  var slashSplit = /\/+/;
  minimatch.filter = filter;
  function filter(pattern, options) {
    options = options || {};
    return function(p, i, list) {
      return minimatch(p, pattern, options);
    };
  }
  function ext(a, b) {
    a = a || {};
    b = b || {};
    var t = {};
    Object.keys(b).forEach(function(k) {
      t[k] = b[k];
    });
    Object.keys(a).forEach(function(k) {
      t[k] = a[k];
    });
    return t;
  }
  minimatch.defaults = function(def) {
    if (!def || !Object.keys(def).length)
      return minimatch;
    var orig = minimatch;
    var m = function minimatch2(p, pattern, options) {
      return orig.minimatch(p, pattern, ext(def, options));
    };
    m.Minimatch = function Minimatch2(pattern, options) {
      return new orig.Minimatch(pattern, ext(def, options));
    };
    return m;
  };
  Minimatch.defaults = function(def) {
    if (!def || !Object.keys(def).length)
      return Minimatch;
    return minimatch.defaults(def).Minimatch;
  };
  function minimatch(p, pattern, options) {
    if (typeof pattern !== "string") {
      throw new TypeError("glob pattern string required");
    }
    if (!options)
      options = {};
    if (!options.nocomment && pattern.charAt(0) === "#") {
      return false;
    }
    if (pattern.trim() === "")
      return p === "";
    return new Minimatch(pattern, options).match(p);
  }
  function Minimatch(pattern, options) {
    if (!(this instanceof Minimatch)) {
      return new Minimatch(pattern, options);
    }
    if (typeof pattern !== "string") {
      throw new TypeError("glob pattern string required");
    }
    if (!options)
      options = {};
    pattern = pattern.trim();
    if (path6.sep !== "/") {
      pattern = pattern.split(path6.sep).join("/");
    }
    this.options = options;
    this.set = [];
    this.pattern = pattern;
    this.regexp = null;
    this.negate = false;
    this.comment = false;
    this.empty = false;
    this.make();
  }
  Minimatch.prototype.debug = function() {
  };
  Minimatch.prototype.make = make;
  function make() {
    if (this._made)
      return;
    var pattern = this.pattern;
    var options = this.options;
    if (!options.nocomment && pattern.charAt(0) === "#") {
      this.comment = true;
      return;
    }
    if (!pattern) {
      this.empty = true;
      return;
    }
    this.parseNegate();
    var set = this.globSet = this.braceExpand();
    if (options.debug)
      this.debug = console.error;
    this.debug(this.pattern, set);
    set = this.globParts = set.map(function(s) {
      return s.split(slashSplit);
    });
    this.debug(this.pattern, set);
    set = set.map(function(s, si, set2) {
      return s.map(this.parse, this);
    }, this);
    this.debug(this.pattern, set);
    set = set.filter(function(s) {
      return s.indexOf(false) === -1;
    });
    this.debug(this.pattern, set);
    this.set = set;
  }
  Minimatch.prototype.parseNegate = parseNegate;
  function parseNegate() {
    var pattern = this.pattern;
    var negate = false;
    var options = this.options;
    var negateOffset = 0;
    if (options.nonegate)
      return;
    for (var i = 0, l = pattern.length; i < l && pattern.charAt(i) === "!"; i++) {
      negate = !negate;
      negateOffset++;
    }
    if (negateOffset)
      this.pattern = pattern.substr(negateOffset);
    this.negate = negate;
  }
  minimatch.braceExpand = function(pattern, options) {
    return braceExpand(pattern, options);
  };
  Minimatch.prototype.braceExpand = braceExpand;
  function braceExpand(pattern, options) {
    if (!options) {
      if (this instanceof Minimatch) {
        options = this.options;
      } else {
        options = {};
      }
    }
    pattern = typeof pattern === "undefined" ? this.pattern : pattern;
    if (typeof pattern === "undefined") {
      throw new TypeError("undefined pattern");
    }
    if (options.nobrace || !pattern.match(/\{.*\}/)) {
      return [pattern];
    }
    return expand(pattern);
  }
  Minimatch.prototype.parse = parse;
  var SUBPARSE = {};
  function parse(pattern, isSub) {
    if (pattern.length > 1024 * 64) {
      throw new TypeError("pattern is too long");
    }
    var options = this.options;
    if (!options.noglobstar && pattern === "**")
      return GLOBSTAR;
    if (pattern === "")
      return "";
    var re = "";
    var hasMagic = !!options.nocase;
    var escaping = false;
    var patternListStack = [];
    var negativeLists = [];
    var stateChar;
    var inClass = false;
    var reClassStart = -1;
    var classStart = -1;
    var patternStart = pattern.charAt(0) === "." ? "" : options.dot ? "(?!(?:^|\\/)\\.{1,2}(?:$|\\/))" : "(?!\\.)";
    var self2 = this;
    function clearStateChar() {
      if (stateChar) {
        switch (stateChar) {
          case "*":
            re += star;
            hasMagic = true;
            break;
          case "?":
            re += qmark;
            hasMagic = true;
            break;
          default:
            re += "\\" + stateChar;
            break;
        }
        self2.debug("clearStateChar %j %j", stateChar, re);
        stateChar = false;
      }
    }
    for (var i = 0, len = pattern.length, c; i < len && (c = pattern.charAt(i)); i++) {
      this.debug("%s	%s %s %j", pattern, i, re, c);
      if (escaping && reSpecials[c]) {
        re += "\\" + c;
        escaping = false;
        continue;
      }
      switch (c) {
        case "/":
          return false;
        case "\\":
          clearStateChar();
          escaping = true;
          continue;
        case "?":
        case "*":
        case "+":
        case "@":
        case "!":
          this.debug("%s	%s %s %j <-- stateChar", pattern, i, re, c);
          if (inClass) {
            this.debug("  in class");
            if (c === "!" && i === classStart + 1)
              c = "^";
            re += c;
            continue;
          }
          self2.debug("call clearStateChar %j", stateChar);
          clearStateChar();
          stateChar = c;
          if (options.noext)
            clearStateChar();
          continue;
        case "(":
          if (inClass) {
            re += "(";
            continue;
          }
          if (!stateChar) {
            re += "\\(";
            continue;
          }
          patternListStack.push({
            type: stateChar,
            start: i - 1,
            reStart: re.length,
            open: plTypes[stateChar].open,
            close: plTypes[stateChar].close
          });
          re += stateChar === "!" ? "(?:(?!(?:" : "(?:";
          this.debug("plType %j %j", stateChar, re);
          stateChar = false;
          continue;
        case ")":
          if (inClass || !patternListStack.length) {
            re += "\\)";
            continue;
          }
          clearStateChar();
          hasMagic = true;
          var pl = patternListStack.pop();
          re += pl.close;
          if (pl.type === "!") {
            negativeLists.push(pl);
          }
          pl.reEnd = re.length;
          continue;
        case "|":
          if (inClass || !patternListStack.length || escaping) {
            re += "\\|";
            escaping = false;
            continue;
          }
          clearStateChar();
          re += "|";
          continue;
        case "[":
          clearStateChar();
          if (inClass) {
            re += "\\" + c;
            continue;
          }
          inClass = true;
          classStart = i;
          reClassStart = re.length;
          re += c;
          continue;
        case "]":
          if (i === classStart + 1 || !inClass) {
            re += "\\" + c;
            escaping = false;
            continue;
          }
          if (inClass) {
            var cs = pattern.substring(classStart + 1, i);
            try {
              RegExp("[" + cs + "]");
            } catch (er) {
              var sp = this.parse(cs, SUBPARSE);
              re = re.substr(0, reClassStart) + "\\[" + sp[0] + "\\]";
              hasMagic = hasMagic || sp[1];
              inClass = false;
              continue;
            }
          }
          hasMagic = true;
          inClass = false;
          re += c;
          continue;
        default:
          clearStateChar();
          if (escaping) {
            escaping = false;
          } else if (reSpecials[c] && !(c === "^" && inClass)) {
            re += "\\";
          }
          re += c;
      }
    }
    if (inClass) {
      cs = pattern.substr(classStart + 1);
      sp = this.parse(cs, SUBPARSE);
      re = re.substr(0, reClassStart) + "\\[" + sp[0];
      hasMagic = hasMagic || sp[1];
    }
    for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
      var tail = re.slice(pl.reStart + pl.open.length);
      this.debug("setting tail", re, pl);
      tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function(_, $1, $2) {
        if (!$2) {
          $2 = "\\";
        }
        return $1 + $1 + $2 + "|";
      });
      this.debug("tail=%j\n   %s", tail, tail, pl, re);
      var t = pl.type === "*" ? star : pl.type === "?" ? qmark : "\\" + pl.type;
      hasMagic = true;
      re = re.slice(0, pl.reStart) + t + "\\(" + tail;
    }
    clearStateChar();
    if (escaping) {
      re += "\\\\";
    }
    var addPatternStart = false;
    switch (re.charAt(0)) {
      case ".":
      case "[":
      case "(":
        addPatternStart = true;
    }
    for (var n = negativeLists.length - 1; n > -1; n--) {
      var nl = negativeLists[n];
      var nlBefore = re.slice(0, nl.reStart);
      var nlFirst = re.slice(nl.reStart, nl.reEnd - 8);
      var nlLast = re.slice(nl.reEnd - 8, nl.reEnd);
      var nlAfter = re.slice(nl.reEnd);
      nlLast += nlAfter;
      var openParensBefore = nlBefore.split("(").length - 1;
      var cleanAfter = nlAfter;
      for (i = 0; i < openParensBefore; i++) {
        cleanAfter = cleanAfter.replace(/\)[+*?]?/, "");
      }
      nlAfter = cleanAfter;
      var dollar = "";
      if (nlAfter === "" && isSub !== SUBPARSE) {
        dollar = "$";
      }
      var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast;
      re = newRe;
    }
    if (re !== "" && hasMagic) {
      re = "(?=.)" + re;
    }
    if (addPatternStart) {
      re = patternStart + re;
    }
    if (isSub === SUBPARSE) {
      return [re, hasMagic];
    }
    if (!hasMagic) {
      return globUnescape(pattern);
    }
    var flags = options.nocase ? "i" : "";
    try {
      var regExp = new RegExp("^" + re + "$", flags);
    } catch (er) {
      return new RegExp("$.");
    }
    regExp._glob = pattern;
    regExp._src = re;
    return regExp;
  }
  minimatch.makeRe = function(pattern, options) {
    return new Minimatch(pattern, options || {}).makeRe();
  };
  Minimatch.prototype.makeRe = makeRe;
  function makeRe() {
    if (this.regexp || this.regexp === false)
      return this.regexp;
    var set = this.set;
    if (!set.length) {
      this.regexp = false;
      return this.regexp;
    }
    var options = this.options;
    var twoStar = options.noglobstar ? star : options.dot ? twoStarDot : twoStarNoDot;
    var flags = options.nocase ? "i" : "";
    var re = set.map(function(pattern) {
      return pattern.map(function(p) {
        return p === GLOBSTAR ? twoStar : typeof p === "string" ? regExpEscape(p) : p._src;
      }).join("\\/");
    }).join("|");
    re = "^(?:" + re + ")$";
    if (this.negate)
      re = "^(?!" + re + ").*$";
    try {
      this.regexp = new RegExp(re, flags);
    } catch (ex) {
      this.regexp = false;
    }
    return this.regexp;
  }
  minimatch.match = function(list, pattern, options) {
    options = options || {};
    var mm = new Minimatch(pattern, options);
    list = list.filter(function(f) {
      return mm.match(f);
    });
    if (mm.options.nonull && !list.length) {
      list.push(pattern);
    }
    return list;
  };
  Minimatch.prototype.match = match;
  function match(f, partial) {
    this.debug("match", f, this.pattern);
    if (this.comment)
      return false;
    if (this.empty)
      return f === "";
    if (f === "/" && partial)
      return true;
    var options = this.options;
    if (path6.sep !== "/") {
      f = f.split(path6.sep).join("/");
    }
    f = f.split(slashSplit);
    this.debug(this.pattern, "split", f);
    var set = this.set;
    this.debug(this.pattern, "set", set);
    var filename;
    var i;
    for (i = f.length - 1; i >= 0; i--) {
      filename = f[i];
      if (filename)
        break;
    }
    for (i = 0; i < set.length; i++) {
      var pattern = set[i];
      var file = f;
      if (options.matchBase && pattern.length === 1) {
        file = [filename];
      }
      var hit = this.matchOne(file, pattern, partial);
      if (hit) {
        if (options.flipNegate)
          return true;
        return !this.negate;
      }
    }
    if (options.flipNegate)
      return false;
    return this.negate;
  }
  Minimatch.prototype.matchOne = function(file, pattern, partial) {
    var options = this.options;
    this.debug("matchOne", {this: this, file, pattern});
    this.debug("matchOne", file.length, pattern.length);
    for (var fi = 0, pi = 0, fl = file.length, pl = pattern.length; fi < fl && pi < pl; fi++, pi++) {
      this.debug("matchOne loop");
      var p = pattern[pi];
      var f = file[fi];
      this.debug(pattern, p, f);
      if (p === false)
        return false;
      if (p === GLOBSTAR) {
        this.debug("GLOBSTAR", [pattern, p, f]);
        var fr = fi;
        var pr = pi + 1;
        if (pr === pl) {
          this.debug("** at the end");
          for (; fi < fl; fi++) {
            if (file[fi] === "." || file[fi] === ".." || !options.dot && file[fi].charAt(0) === ".")
              return false;
          }
          return true;
        }
        while (fr < fl) {
          var swallowee = file[fr];
          this.debug("\nglobstar while", file, fr, pattern, pr, swallowee);
          if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
            this.debug("globstar found match!", fr, fl, swallowee);
            return true;
          } else {
            if (swallowee === "." || swallowee === ".." || !options.dot && swallowee.charAt(0) === ".") {
              this.debug("dot detected!", file, fr, pattern, pr);
              break;
            }
            this.debug("globstar swallow a segment, and continue");
            fr++;
          }
        }
        if (partial) {
          this.debug("\n>>> no match, partial?", file, fr, pattern, pr);
          if (fr === fl)
            return true;
        }
        return false;
      }
      var hit;
      if (typeof p === "string") {
        if (options.nocase) {
          hit = f.toLowerCase() === p.toLowerCase();
        } else {
          hit = f === p;
        }
        this.debug("string match", p, f, hit);
      } else {
        hit = f.match(p);
        this.debug("pattern match", p, f, hit);
      }
      if (!hit)
        return false;
    }
    if (fi === fl && pi === pl) {
      return true;
    } else if (fi === fl) {
      return partial;
    } else if (pi === pl) {
      var emptyFileEnd = fi === fl - 1 && file[fi] === "";
      return emptyFileEnd;
    }
    throw new Error("wtf?");
  };
  function globUnescape(s) {
    return s.replace(/\\(.)/g, "$1");
  }
  function regExpEscape(s) {
    return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }
});

// node_modules/path-is-absolute/index.js
var require_path_is_absolute = __commonJS((exports2, module2) => {
  "use strict";
  function posix(path6) {
    return path6.charAt(0) === "/";
  }
  function win32(path6) {
    var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
    var result = splitDeviceRe.exec(path6);
    var device = result[1] || "";
    var isUnc = Boolean(device && device.charAt(1) !== ":");
    return Boolean(result[2] || isUnc);
  }
  module2.exports = process.platform === "win32" ? win32 : posix;
  module2.exports.posix = posix;
  module2.exports.win32 = win32;
});

// node_modules/glob/common.js
var require_common = __commonJS((exports2) => {
  exports2.alphasort = alphasort;
  exports2.alphasorti = alphasorti;
  exports2.setopts = setopts;
  exports2.ownProp = ownProp;
  exports2.makeAbs = makeAbs;
  exports2.finish = finish;
  exports2.mark = mark;
  exports2.isIgnored = isIgnored;
  exports2.childrenIgnored = childrenIgnored;
  function ownProp(obj, field) {
    return Object.prototype.hasOwnProperty.call(obj, field);
  }
  var path6 = require("path");
  var minimatch = require_minimatch();
  var isAbsolute = require_path_is_absolute();
  var Minimatch = minimatch.Minimatch;
  function alphasorti(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  }
  function alphasort(a, b) {
    return a.localeCompare(b);
  }
  function setupIgnores(self2, options) {
    self2.ignore = options.ignore || [];
    if (!Array.isArray(self2.ignore))
      self2.ignore = [self2.ignore];
    if (self2.ignore.length) {
      self2.ignore = self2.ignore.map(ignoreMap);
    }
  }
  function ignoreMap(pattern) {
    var gmatcher = null;
    if (pattern.slice(-3) === "/**") {
      var gpattern = pattern.replace(/(\/\*\*)+$/, "");
      gmatcher = new Minimatch(gpattern, {dot: true});
    }
    return {
      matcher: new Minimatch(pattern, {dot: true}),
      gmatcher
    };
  }
  function setopts(self2, pattern, options) {
    if (!options)
      options = {};
    if (options.matchBase && pattern.indexOf("/") === -1) {
      if (options.noglobstar) {
        throw new Error("base matching requires globstar");
      }
      pattern = "**/" + pattern;
    }
    self2.silent = !!options.silent;
    self2.pattern = pattern;
    self2.strict = options.strict !== false;
    self2.realpath = !!options.realpath;
    self2.realpathCache = options.realpathCache || Object.create(null);
    self2.follow = !!options.follow;
    self2.dot = !!options.dot;
    self2.mark = !!options.mark;
    self2.nodir = !!options.nodir;
    if (self2.nodir)
      self2.mark = true;
    self2.sync = !!options.sync;
    self2.nounique = !!options.nounique;
    self2.nonull = !!options.nonull;
    self2.nosort = !!options.nosort;
    self2.nocase = !!options.nocase;
    self2.stat = !!options.stat;
    self2.noprocess = !!options.noprocess;
    self2.absolute = !!options.absolute;
    self2.maxLength = options.maxLength || Infinity;
    self2.cache = options.cache || Object.create(null);
    self2.statCache = options.statCache || Object.create(null);
    self2.symlinks = options.symlinks || Object.create(null);
    setupIgnores(self2, options);
    self2.changedCwd = false;
    var cwd = process.cwd();
    if (!ownProp(options, "cwd"))
      self2.cwd = cwd;
    else {
      self2.cwd = path6.resolve(options.cwd);
      self2.changedCwd = self2.cwd !== cwd;
    }
    self2.root = options.root || path6.resolve(self2.cwd, "/");
    self2.root = path6.resolve(self2.root);
    if (process.platform === "win32")
      self2.root = self2.root.replace(/\\/g, "/");
    self2.cwdAbs = isAbsolute(self2.cwd) ? self2.cwd : makeAbs(self2, self2.cwd);
    if (process.platform === "win32")
      self2.cwdAbs = self2.cwdAbs.replace(/\\/g, "/");
    self2.nomount = !!options.nomount;
    options.nonegate = true;
    options.nocomment = true;
    self2.minimatch = new Minimatch(pattern, options);
    self2.options = self2.minimatch.options;
  }
  function finish(self2) {
    var nou = self2.nounique;
    var all = nou ? [] : Object.create(null);
    for (var i = 0, l = self2.matches.length; i < l; i++) {
      var matches = self2.matches[i];
      if (!matches || Object.keys(matches).length === 0) {
        if (self2.nonull) {
          var literal = self2.minimatch.globSet[i];
          if (nou)
            all.push(literal);
          else
            all[literal] = true;
        }
      } else {
        var m = Object.keys(matches);
        if (nou)
          all.push.apply(all, m);
        else
          m.forEach(function(m2) {
            all[m2] = true;
          });
      }
    }
    if (!nou)
      all = Object.keys(all);
    if (!self2.nosort)
      all = all.sort(self2.nocase ? alphasorti : alphasort);
    if (self2.mark) {
      for (var i = 0; i < all.length; i++) {
        all[i] = self2._mark(all[i]);
      }
      if (self2.nodir) {
        all = all.filter(function(e) {
          var notDir = !/\/$/.test(e);
          var c = self2.cache[e] || self2.cache[makeAbs(self2, e)];
          if (notDir && c)
            notDir = c !== "DIR" && !Array.isArray(c);
          return notDir;
        });
      }
    }
    if (self2.ignore.length)
      all = all.filter(function(m2) {
        return !isIgnored(self2, m2);
      });
    self2.found = all;
  }
  function mark(self2, p) {
    var abs = makeAbs(self2, p);
    var c = self2.cache[abs];
    var m = p;
    if (c) {
      var isDir = c === "DIR" || Array.isArray(c);
      var slash = p.slice(-1) === "/";
      if (isDir && !slash)
        m += "/";
      else if (!isDir && slash)
        m = m.slice(0, -1);
      if (m !== p) {
        var mabs = makeAbs(self2, m);
        self2.statCache[mabs] = self2.statCache[abs];
        self2.cache[mabs] = self2.cache[abs];
      }
    }
    return m;
  }
  function makeAbs(self2, f) {
    var abs = f;
    if (f.charAt(0) === "/") {
      abs = path6.join(self2.root, f);
    } else if (isAbsolute(f) || f === "") {
      abs = f;
    } else if (self2.changedCwd) {
      abs = path6.resolve(self2.cwd, f);
    } else {
      abs = path6.resolve(f);
    }
    if (process.platform === "win32")
      abs = abs.replace(/\\/g, "/");
    return abs;
  }
  function isIgnored(self2, path7) {
    if (!self2.ignore.length)
      return false;
    return self2.ignore.some(function(item) {
      return item.matcher.match(path7) || !!(item.gmatcher && item.gmatcher.match(path7));
    });
  }
  function childrenIgnored(self2, path7) {
    if (!self2.ignore.length)
      return false;
    return self2.ignore.some(function(item) {
      return !!(item.gmatcher && item.gmatcher.match(path7));
    });
  }
});

// node_modules/glob/sync.js
var require_sync2 = __commonJS((exports2, module2) => {
  module2.exports = globSync;
  globSync.GlobSync = GlobSync;
  var fs5 = require("fs");
  var rp = require_fs2();
  var minimatch = require_minimatch();
  var Minimatch = minimatch.Minimatch;
  var Glob = require_glob().Glob;
  var util2 = require("util");
  var path6 = require("path");
  var assert = require("assert");
  var isAbsolute = require_path_is_absolute();
  var common = require_common();
  var alphasort = common.alphasort;
  var alphasorti = common.alphasorti;
  var setopts = common.setopts;
  var ownProp = common.ownProp;
  var childrenIgnored = common.childrenIgnored;
  var isIgnored = common.isIgnored;
  function globSync(pattern, options) {
    if (typeof options === "function" || arguments.length === 3)
      throw new TypeError("callback provided to sync glob\nSee: https://github.com/isaacs/node-glob/issues/167");
    return new GlobSync(pattern, options).found;
  }
  function GlobSync(pattern, options) {
    if (!pattern)
      throw new Error("must provide pattern");
    if (typeof options === "function" || arguments.length === 3)
      throw new TypeError("callback provided to sync glob\nSee: https://github.com/isaacs/node-glob/issues/167");
    if (!(this instanceof GlobSync))
      return new GlobSync(pattern, options);
    setopts(this, pattern, options);
    if (this.noprocess)
      return this;
    var n = this.minimatch.set.length;
    this.matches = new Array(n);
    for (var i = 0; i < n; i++) {
      this._process(this.minimatch.set[i], i, false);
    }
    this._finish();
  }
  GlobSync.prototype._finish = function() {
    assert(this instanceof GlobSync);
    if (this.realpath) {
      var self2 = this;
      this.matches.forEach(function(matchset, index) {
        var set = self2.matches[index] = Object.create(null);
        for (var p in matchset) {
          try {
            p = self2._makeAbs(p);
            var real = rp.realpathSync(p, self2.realpathCache);
            set[real] = true;
          } catch (er) {
            if (er.syscall === "stat")
              set[self2._makeAbs(p)] = true;
            else
              throw er;
          }
        }
      });
    }
    common.finish(this);
  };
  GlobSync.prototype._process = function(pattern, index, inGlobStar) {
    assert(this instanceof GlobSync);
    var n = 0;
    while (typeof pattern[n] === "string") {
      n++;
    }
    var prefix;
    switch (n) {
      case pattern.length:
        this._processSimple(pattern.join("/"), index);
        return;
      case 0:
        prefix = null;
        break;
      default:
        prefix = pattern.slice(0, n).join("/");
        break;
    }
    var remain = pattern.slice(n);
    var read;
    if (prefix === null)
      read = ".";
    else if (isAbsolute(prefix) || isAbsolute(pattern.join("/"))) {
      if (!prefix || !isAbsolute(prefix))
        prefix = "/" + prefix;
      read = prefix;
    } else
      read = prefix;
    var abs = this._makeAbs(read);
    if (childrenIgnored(this, read))
      return;
    var isGlobStar = remain[0] === minimatch.GLOBSTAR;
    if (isGlobStar)
      this._processGlobStar(prefix, read, abs, remain, index, inGlobStar);
    else
      this._processReaddir(prefix, read, abs, remain, index, inGlobStar);
  };
  GlobSync.prototype._processReaddir = function(prefix, read, abs, remain, index, inGlobStar) {
    var entries = this._readdir(abs, inGlobStar);
    if (!entries)
      return;
    var pn = remain[0];
    var negate = !!this.minimatch.negate;
    var rawGlob = pn._glob;
    var dotOk = this.dot || rawGlob.charAt(0) === ".";
    var matchedEntries = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (e.charAt(0) !== "." || dotOk) {
        var m;
        if (negate && !prefix) {
          m = !e.match(pn);
        } else {
          m = e.match(pn);
        }
        if (m)
          matchedEntries.push(e);
      }
    }
    var len = matchedEntries.length;
    if (len === 0)
      return;
    if (remain.length === 1 && !this.mark && !this.stat) {
      if (!this.matches[index])
        this.matches[index] = Object.create(null);
      for (var i = 0; i < len; i++) {
        var e = matchedEntries[i];
        if (prefix) {
          if (prefix.slice(-1) !== "/")
            e = prefix + "/" + e;
          else
            e = prefix + e;
        }
        if (e.charAt(0) === "/" && !this.nomount) {
          e = path6.join(this.root, e);
        }
        this._emitMatch(index, e);
      }
      return;
    }
    remain.shift();
    for (var i = 0; i < len; i++) {
      var e = matchedEntries[i];
      var newPattern;
      if (prefix)
        newPattern = [prefix, e];
      else
        newPattern = [e];
      this._process(newPattern.concat(remain), index, inGlobStar);
    }
  };
  GlobSync.prototype._emitMatch = function(index, e) {
    if (isIgnored(this, e))
      return;
    var abs = this._makeAbs(e);
    if (this.mark)
      e = this._mark(e);
    if (this.absolute) {
      e = abs;
    }
    if (this.matches[index][e])
      return;
    if (this.nodir) {
      var c = this.cache[abs];
      if (c === "DIR" || Array.isArray(c))
        return;
    }
    this.matches[index][e] = true;
    if (this.stat)
      this._stat(e);
  };
  GlobSync.prototype._readdirInGlobStar = function(abs) {
    if (this.follow)
      return this._readdir(abs, false);
    var entries;
    var lstat;
    var stat;
    try {
      lstat = fs5.lstatSync(abs);
    } catch (er) {
      if (er.code === "ENOENT") {
        return null;
      }
    }
    var isSym = lstat && lstat.isSymbolicLink();
    this.symlinks[abs] = isSym;
    if (!isSym && lstat && !lstat.isDirectory())
      this.cache[abs] = "FILE";
    else
      entries = this._readdir(abs, false);
    return entries;
  };
  GlobSync.prototype._readdir = function(abs, inGlobStar) {
    var entries;
    if (inGlobStar && !ownProp(this.symlinks, abs))
      return this._readdirInGlobStar(abs);
    if (ownProp(this.cache, abs)) {
      var c = this.cache[abs];
      if (!c || c === "FILE")
        return null;
      if (Array.isArray(c))
        return c;
    }
    try {
      return this._readdirEntries(abs, fs5.readdirSync(abs));
    } catch (er) {
      this._readdirError(abs, er);
      return null;
    }
  };
  GlobSync.prototype._readdirEntries = function(abs, entries) {
    if (!this.mark && !this.stat) {
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (abs === "/")
          e = abs + e;
        else
          e = abs + "/" + e;
        this.cache[e] = true;
      }
    }
    this.cache[abs] = entries;
    return entries;
  };
  GlobSync.prototype._readdirError = function(f, er) {
    switch (er.code) {
      case "ENOTSUP":
      case "ENOTDIR":
        var abs = this._makeAbs(f);
        this.cache[abs] = "FILE";
        if (abs === this.cwdAbs) {
          var error = new Error(er.code + " invalid cwd " + this.cwd);
          error.path = this.cwd;
          error.code = er.code;
          throw error;
        }
        break;
      case "ENOENT":
      case "ELOOP":
      case "ENAMETOOLONG":
      case "UNKNOWN":
        this.cache[this._makeAbs(f)] = false;
        break;
      default:
        this.cache[this._makeAbs(f)] = false;
        if (this.strict)
          throw er;
        if (!this.silent)
          console.error("glob error", er);
        break;
    }
  };
  GlobSync.prototype._processGlobStar = function(prefix, read, abs, remain, index, inGlobStar) {
    var entries = this._readdir(abs, inGlobStar);
    if (!entries)
      return;
    var remainWithoutGlobStar = remain.slice(1);
    var gspref = prefix ? [prefix] : [];
    var noGlobStar = gspref.concat(remainWithoutGlobStar);
    this._process(noGlobStar, index, false);
    var len = entries.length;
    var isSym = this.symlinks[abs];
    if (isSym && inGlobStar)
      return;
    for (var i = 0; i < len; i++) {
      var e = entries[i];
      if (e.charAt(0) === "." && !this.dot)
        continue;
      var instead = gspref.concat(entries[i], remainWithoutGlobStar);
      this._process(instead, index, true);
      var below = gspref.concat(entries[i], remain);
      this._process(below, index, true);
    }
  };
  GlobSync.prototype._processSimple = function(prefix, index) {
    var exists = this._stat(prefix);
    if (!this.matches[index])
      this.matches[index] = Object.create(null);
    if (!exists)
      return;
    if (prefix && isAbsolute(prefix) && !this.nomount) {
      var trail = /[\/\\]$/.test(prefix);
      if (prefix.charAt(0) === "/") {
        prefix = path6.join(this.root, prefix);
      } else {
        prefix = path6.resolve(this.root, prefix);
        if (trail)
          prefix += "/";
      }
    }
    if (process.platform === "win32")
      prefix = prefix.replace(/\\/g, "/");
    this._emitMatch(index, prefix);
  };
  GlobSync.prototype._stat = function(f) {
    var abs = this._makeAbs(f);
    var needDir = f.slice(-1) === "/";
    if (f.length > this.maxLength)
      return false;
    if (!this.stat && ownProp(this.cache, abs)) {
      var c = this.cache[abs];
      if (Array.isArray(c))
        c = "DIR";
      if (!needDir || c === "DIR")
        return c;
      if (needDir && c === "FILE")
        return false;
    }
    var exists;
    var stat = this.statCache[abs];
    if (!stat) {
      var lstat;
      try {
        lstat = fs5.lstatSync(abs);
      } catch (er) {
        if (er && (er.code === "ENOENT" || er.code === "ENOTDIR")) {
          this.statCache[abs] = false;
          return false;
        }
      }
      if (lstat && lstat.isSymbolicLink()) {
        try {
          stat = fs5.statSync(abs);
        } catch (er) {
          stat = lstat;
        }
      } else {
        stat = lstat;
      }
    }
    this.statCache[abs] = stat;
    var c = true;
    if (stat)
      c = stat.isDirectory() ? "DIR" : "FILE";
    this.cache[abs] = this.cache[abs] || c;
    if (needDir && c === "FILE")
      return false;
    return c;
  };
  GlobSync.prototype._mark = function(p) {
    return common.mark(this, p);
  };
  GlobSync.prototype._makeAbs = function(f) {
    return common.makeAbs(this, f);
  };
});

// node_modules/wrappy/wrappy.js
var require_wrappy = __commonJS((exports2, module2) => {
  module2.exports = wrappy;
  function wrappy(fn, cb) {
    if (fn && cb)
      return wrappy(fn)(cb);
    if (typeof fn !== "function")
      throw new TypeError("need wrapper function");
    Object.keys(fn).forEach(function(k) {
      wrapper[k] = fn[k];
    });
    return wrapper;
    function wrapper() {
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }
      var ret = fn.apply(this, args);
      var cb2 = args[args.length - 1];
      if (typeof ret === "function" && ret !== cb2) {
        Object.keys(cb2).forEach(function(k) {
          ret[k] = cb2[k];
        });
      }
      return ret;
    }
  }
});

// node_modules/once/once.js
var require_once = __commonJS((exports2, module2) => {
  var wrappy = require_wrappy();
  module2.exports = wrappy(once);
  module2.exports.strict = wrappy(onceStrict);
  once.proto = once(function() {
    Object.defineProperty(Function.prototype, "once", {
      value: function() {
        return once(this);
      },
      configurable: true
    });
    Object.defineProperty(Function.prototype, "onceStrict", {
      value: function() {
        return onceStrict(this);
      },
      configurable: true
    });
  });
  function once(fn) {
    var f = function() {
      if (f.called)
        return f.value;
      f.called = true;
      return f.value = fn.apply(this, arguments);
    };
    f.called = false;
    return f;
  }
  function onceStrict(fn) {
    var f = function() {
      if (f.called)
        throw new Error(f.onceError);
      f.called = true;
      return f.value = fn.apply(this, arguments);
    };
    var name = fn.name || "Function wrapped with `once`";
    f.onceError = name + " shouldn't be called more than once";
    f.called = false;
    return f;
  }
});

// node_modules/inflight/inflight.js
var require_inflight = __commonJS((exports2, module2) => {
  var wrappy = require_wrappy();
  var reqs = Object.create(null);
  var once = require_once();
  module2.exports = wrappy(inflight);
  function inflight(key, cb) {
    if (reqs[key]) {
      reqs[key].push(cb);
      return null;
    } else {
      reqs[key] = [cb];
      return makeres(key);
    }
  }
  function makeres(key) {
    return once(function RES() {
      var cbs = reqs[key];
      var len = cbs.length;
      var args = slice(arguments);
      try {
        for (var i = 0; i < len; i++) {
          cbs[i].apply(null, args);
        }
      } finally {
        if (cbs.length > len) {
          cbs.splice(0, len);
          process.nextTick(function() {
            RES.apply(null, args);
          });
        } else {
          delete reqs[key];
        }
      }
    });
  }
  function slice(args) {
    var length = args.length;
    var array = [];
    for (var i = 0; i < length; i++)
      array[i] = args[i];
    return array;
  }
});

// node_modules/glob/glob.js
var require_glob = __commonJS((exports2, module2) => {
  module2.exports = glob;
  var fs5 = require("fs");
  var rp = require_fs2();
  var minimatch = require_minimatch();
  var Minimatch = minimatch.Minimatch;
  var inherits = require_inherits();
  var EE = require("events").EventEmitter;
  var path6 = require("path");
  var assert = require("assert");
  var isAbsolute = require_path_is_absolute();
  var globSync = require_sync2();
  var common = require_common();
  var alphasort = common.alphasort;
  var alphasorti = common.alphasorti;
  var setopts = common.setopts;
  var ownProp = common.ownProp;
  var inflight = require_inflight();
  var util2 = require("util");
  var childrenIgnored = common.childrenIgnored;
  var isIgnored = common.isIgnored;
  var once = require_once();
  function glob(pattern, options, cb) {
    if (typeof options === "function")
      cb = options, options = {};
    if (!options)
      options = {};
    if (options.sync) {
      if (cb)
        throw new TypeError("callback provided to sync glob");
      return globSync(pattern, options);
    }
    return new Glob(pattern, options, cb);
  }
  glob.sync = globSync;
  var GlobSync = glob.GlobSync = globSync.GlobSync;
  glob.glob = glob;
  function extend(origin, add) {
    if (add === null || typeof add !== "object") {
      return origin;
    }
    var keys = Object.keys(add);
    var i = keys.length;
    while (i--) {
      origin[keys[i]] = add[keys[i]];
    }
    return origin;
  }
  glob.hasMagic = function(pattern, options_) {
    var options = extend({}, options_);
    options.noprocess = true;
    var g = new Glob(pattern, options);
    var set = g.minimatch.set;
    if (!pattern)
      return false;
    if (set.length > 1)
      return true;
    for (var j = 0; j < set[0].length; j++) {
      if (typeof set[0][j] !== "string")
        return true;
    }
    return false;
  };
  glob.Glob = Glob;
  inherits(Glob, EE);
  function Glob(pattern, options, cb) {
    if (typeof options === "function") {
      cb = options;
      options = null;
    }
    if (options && options.sync) {
      if (cb)
        throw new TypeError("callback provided to sync glob");
      return new GlobSync(pattern, options);
    }
    if (!(this instanceof Glob))
      return new Glob(pattern, options, cb);
    setopts(this, pattern, options);
    this._didRealPath = false;
    var n = this.minimatch.set.length;
    this.matches = new Array(n);
    if (typeof cb === "function") {
      cb = once(cb);
      this.on("error", cb);
      this.on("end", function(matches) {
        cb(null, matches);
      });
    }
    var self2 = this;
    this._processing = 0;
    this._emitQueue = [];
    this._processQueue = [];
    this.paused = false;
    if (this.noprocess)
      return this;
    if (n === 0)
      return done();
    var sync = true;
    for (var i = 0; i < n; i++) {
      this._process(this.minimatch.set[i], i, false, done);
    }
    sync = false;
    function done() {
      --self2._processing;
      if (self2._processing <= 0) {
        if (sync) {
          process.nextTick(function() {
            self2._finish();
          });
        } else {
          self2._finish();
        }
      }
    }
  }
  Glob.prototype._finish = function() {
    assert(this instanceof Glob);
    if (this.aborted)
      return;
    if (this.realpath && !this._didRealpath)
      return this._realpath();
    common.finish(this);
    this.emit("end", this.found);
  };
  Glob.prototype._realpath = function() {
    if (this._didRealpath)
      return;
    this._didRealpath = true;
    var n = this.matches.length;
    if (n === 0)
      return this._finish();
    var self2 = this;
    for (var i = 0; i < this.matches.length; i++)
      this._realpathSet(i, next);
    function next() {
      if (--n === 0)
        self2._finish();
    }
  };
  Glob.prototype._realpathSet = function(index, cb) {
    var matchset = this.matches[index];
    if (!matchset)
      return cb();
    var found = Object.keys(matchset);
    var self2 = this;
    var n = found.length;
    if (n === 0)
      return cb();
    var set = this.matches[index] = Object.create(null);
    found.forEach(function(p, i) {
      p = self2._makeAbs(p);
      rp.realpath(p, self2.realpathCache, function(er, real) {
        if (!er)
          set[real] = true;
        else if (er.syscall === "stat")
          set[p] = true;
        else
          self2.emit("error", er);
        if (--n === 0) {
          self2.matches[index] = set;
          cb();
        }
      });
    });
  };
  Glob.prototype._mark = function(p) {
    return common.mark(this, p);
  };
  Glob.prototype._makeAbs = function(f) {
    return common.makeAbs(this, f);
  };
  Glob.prototype.abort = function() {
    this.aborted = true;
    this.emit("abort");
  };
  Glob.prototype.pause = function() {
    if (!this.paused) {
      this.paused = true;
      this.emit("pause");
    }
  };
  Glob.prototype.resume = function() {
    if (this.paused) {
      this.emit("resume");
      this.paused = false;
      if (this._emitQueue.length) {
        var eq = this._emitQueue.slice(0);
        this._emitQueue.length = 0;
        for (var i = 0; i < eq.length; i++) {
          var e = eq[i];
          this._emitMatch(e[0], e[1]);
        }
      }
      if (this._processQueue.length) {
        var pq = this._processQueue.slice(0);
        this._processQueue.length = 0;
        for (var i = 0; i < pq.length; i++) {
          var p = pq[i];
          this._processing--;
          this._process(p[0], p[1], p[2], p[3]);
        }
      }
    }
  };
  Glob.prototype._process = function(pattern, index, inGlobStar, cb) {
    assert(this instanceof Glob);
    assert(typeof cb === "function");
    if (this.aborted)
      return;
    this._processing++;
    if (this.paused) {
      this._processQueue.push([pattern, index, inGlobStar, cb]);
      return;
    }
    var n = 0;
    while (typeof pattern[n] === "string") {
      n++;
    }
    var prefix;
    switch (n) {
      case pattern.length:
        this._processSimple(pattern.join("/"), index, cb);
        return;
      case 0:
        prefix = null;
        break;
      default:
        prefix = pattern.slice(0, n).join("/");
        break;
    }
    var remain = pattern.slice(n);
    var read;
    if (prefix === null)
      read = ".";
    else if (isAbsolute(prefix) || isAbsolute(pattern.join("/"))) {
      if (!prefix || !isAbsolute(prefix))
        prefix = "/" + prefix;
      read = prefix;
    } else
      read = prefix;
    var abs = this._makeAbs(read);
    if (childrenIgnored(this, read))
      return cb();
    var isGlobStar = remain[0] === minimatch.GLOBSTAR;
    if (isGlobStar)
      this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb);
    else
      this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb);
  };
  Glob.prototype._processReaddir = function(prefix, read, abs, remain, index, inGlobStar, cb) {
    var self2 = this;
    this._readdir(abs, inGlobStar, function(er, entries) {
      return self2._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
    });
  };
  Glob.prototype._processReaddir2 = function(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
    if (!entries)
      return cb();
    var pn = remain[0];
    var negate = !!this.minimatch.negate;
    var rawGlob = pn._glob;
    var dotOk = this.dot || rawGlob.charAt(0) === ".";
    var matchedEntries = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (e.charAt(0) !== "." || dotOk) {
        var m;
        if (negate && !prefix) {
          m = !e.match(pn);
        } else {
          m = e.match(pn);
        }
        if (m)
          matchedEntries.push(e);
      }
    }
    var len = matchedEntries.length;
    if (len === 0)
      return cb();
    if (remain.length === 1 && !this.mark && !this.stat) {
      if (!this.matches[index])
        this.matches[index] = Object.create(null);
      for (var i = 0; i < len; i++) {
        var e = matchedEntries[i];
        if (prefix) {
          if (prefix !== "/")
            e = prefix + "/" + e;
          else
            e = prefix + e;
        }
        if (e.charAt(0) === "/" && !this.nomount) {
          e = path6.join(this.root, e);
        }
        this._emitMatch(index, e);
      }
      return cb();
    }
    remain.shift();
    for (var i = 0; i < len; i++) {
      var e = matchedEntries[i];
      var newPattern;
      if (prefix) {
        if (prefix !== "/")
          e = prefix + "/" + e;
        else
          e = prefix + e;
      }
      this._process([e].concat(remain), index, inGlobStar, cb);
    }
    cb();
  };
  Glob.prototype._emitMatch = function(index, e) {
    if (this.aborted)
      return;
    if (isIgnored(this, e))
      return;
    if (this.paused) {
      this._emitQueue.push([index, e]);
      return;
    }
    var abs = isAbsolute(e) ? e : this._makeAbs(e);
    if (this.mark)
      e = this._mark(e);
    if (this.absolute)
      e = abs;
    if (this.matches[index][e])
      return;
    if (this.nodir) {
      var c = this.cache[abs];
      if (c === "DIR" || Array.isArray(c))
        return;
    }
    this.matches[index][e] = true;
    var st = this.statCache[abs];
    if (st)
      this.emit("stat", e, st);
    this.emit("match", e);
  };
  Glob.prototype._readdirInGlobStar = function(abs, cb) {
    if (this.aborted)
      return;
    if (this.follow)
      return this._readdir(abs, false, cb);
    var lstatkey = "lstat\0" + abs;
    var self2 = this;
    var lstatcb = inflight(lstatkey, lstatcb_);
    if (lstatcb)
      fs5.lstat(abs, lstatcb);
    function lstatcb_(er, lstat) {
      if (er && er.code === "ENOENT")
        return cb();
      var isSym = lstat && lstat.isSymbolicLink();
      self2.symlinks[abs] = isSym;
      if (!isSym && lstat && !lstat.isDirectory()) {
        self2.cache[abs] = "FILE";
        cb();
      } else
        self2._readdir(abs, false, cb);
    }
  };
  Glob.prototype._readdir = function(abs, inGlobStar, cb) {
    if (this.aborted)
      return;
    cb = inflight("readdir\0" + abs + "\0" + inGlobStar, cb);
    if (!cb)
      return;
    if (inGlobStar && !ownProp(this.symlinks, abs))
      return this._readdirInGlobStar(abs, cb);
    if (ownProp(this.cache, abs)) {
      var c = this.cache[abs];
      if (!c || c === "FILE")
        return cb();
      if (Array.isArray(c))
        return cb(null, c);
    }
    var self2 = this;
    fs5.readdir(abs, readdirCb(this, abs, cb));
  };
  function readdirCb(self2, abs, cb) {
    return function(er, entries) {
      if (er)
        self2._readdirError(abs, er, cb);
      else
        self2._readdirEntries(abs, entries, cb);
    };
  }
  Glob.prototype._readdirEntries = function(abs, entries, cb) {
    if (this.aborted)
      return;
    if (!this.mark && !this.stat) {
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (abs === "/")
          e = abs + e;
        else
          e = abs + "/" + e;
        this.cache[e] = true;
      }
    }
    this.cache[abs] = entries;
    return cb(null, entries);
  };
  Glob.prototype._readdirError = function(f, er, cb) {
    if (this.aborted)
      return;
    switch (er.code) {
      case "ENOTSUP":
      case "ENOTDIR":
        var abs = this._makeAbs(f);
        this.cache[abs] = "FILE";
        if (abs === this.cwdAbs) {
          var error = new Error(er.code + " invalid cwd " + this.cwd);
          error.path = this.cwd;
          error.code = er.code;
          this.emit("error", error);
          this.abort();
        }
        break;
      case "ENOENT":
      case "ELOOP":
      case "ENAMETOOLONG":
      case "UNKNOWN":
        this.cache[this._makeAbs(f)] = false;
        break;
      default:
        this.cache[this._makeAbs(f)] = false;
        if (this.strict) {
          this.emit("error", er);
          this.abort();
        }
        if (!this.silent)
          console.error("glob error", er);
        break;
    }
    return cb();
  };
  Glob.prototype._processGlobStar = function(prefix, read, abs, remain, index, inGlobStar, cb) {
    var self2 = this;
    this._readdir(abs, inGlobStar, function(er, entries) {
      self2._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
    });
  };
  Glob.prototype._processGlobStar2 = function(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
    if (!entries)
      return cb();
    var remainWithoutGlobStar = remain.slice(1);
    var gspref = prefix ? [prefix] : [];
    var noGlobStar = gspref.concat(remainWithoutGlobStar);
    this._process(noGlobStar, index, false, cb);
    var isSym = this.symlinks[abs];
    var len = entries.length;
    if (isSym && inGlobStar)
      return cb();
    for (var i = 0; i < len; i++) {
      var e = entries[i];
      if (e.charAt(0) === "." && !this.dot)
        continue;
      var instead = gspref.concat(entries[i], remainWithoutGlobStar);
      this._process(instead, index, true, cb);
      var below = gspref.concat(entries[i], remain);
      this._process(below, index, true, cb);
    }
    cb();
  };
  Glob.prototype._processSimple = function(prefix, index, cb) {
    var self2 = this;
    this._stat(prefix, function(er, exists) {
      self2._processSimple2(prefix, index, er, exists, cb);
    });
  };
  Glob.prototype._processSimple2 = function(prefix, index, er, exists, cb) {
    if (!this.matches[index])
      this.matches[index] = Object.create(null);
    if (!exists)
      return cb();
    if (prefix && isAbsolute(prefix) && !this.nomount) {
      var trail = /[\/\\]$/.test(prefix);
      if (prefix.charAt(0) === "/") {
        prefix = path6.join(this.root, prefix);
      } else {
        prefix = path6.resolve(this.root, prefix);
        if (trail)
          prefix += "/";
      }
    }
    if (process.platform === "win32")
      prefix = prefix.replace(/\\/g, "/");
    this._emitMatch(index, prefix);
    cb();
  };
  Glob.prototype._stat = function(f, cb) {
    var abs = this._makeAbs(f);
    var needDir = f.slice(-1) === "/";
    if (f.length > this.maxLength)
      return cb();
    if (!this.stat && ownProp(this.cache, abs)) {
      var c = this.cache[abs];
      if (Array.isArray(c))
        c = "DIR";
      if (!needDir || c === "DIR")
        return cb(null, c);
      if (needDir && c === "FILE")
        return cb();
    }
    var exists;
    var stat = this.statCache[abs];
    if (stat !== void 0) {
      if (stat === false)
        return cb(null, stat);
      else {
        var type = stat.isDirectory() ? "DIR" : "FILE";
        if (needDir && type === "FILE")
          return cb();
        else
          return cb(null, type, stat);
      }
    }
    var self2 = this;
    var statcb = inflight("stat\0" + abs, lstatcb_);
    if (statcb)
      fs5.lstat(abs, statcb);
    function lstatcb_(er, lstat) {
      if (lstat && lstat.isSymbolicLink()) {
        return fs5.stat(abs, function(er2, stat2) {
          if (er2)
            self2._stat2(f, abs, null, lstat, cb);
          else
            self2._stat2(f, abs, er2, stat2, cb);
        });
      } else {
        self2._stat2(f, abs, er, lstat, cb);
      }
    }
  };
  Glob.prototype._stat2 = function(f, abs, er, stat, cb) {
    if (er && (er.code === "ENOENT" || er.code === "ENOTDIR")) {
      this.statCache[abs] = false;
      return cb();
    }
    var needDir = f.slice(-1) === "/";
    this.statCache[abs] = stat;
    if (abs.slice(-1) === "/" && stat && !stat.isDirectory())
      return cb(null, false, stat);
    var c = true;
    if (stat)
      c = stat.isDirectory() ? "DIR" : "FILE";
    this.cache[abs] = this.cache[abs] || c;
    if (needDir && c === "FILE")
      return cb();
    return cb(null, c, stat);
  };
});

// node_modules/tmp/node_modules/rimraf/rimraf.js
var require_rimraf = __commonJS((exports2, module2) => {
  var assert = require("assert");
  var path6 = require("path");
  var fs5 = require("fs");
  var glob = void 0;
  try {
    glob = require_glob();
  } catch (_err) {
  }
  var defaultGlobOpts = {
    nosort: true,
    silent: true
  };
  var timeout = 0;
  var isWindows = process.platform === "win32";
  var defaults = (options) => {
    const methods = [
      "unlink",
      "chmod",
      "stat",
      "lstat",
      "rmdir",
      "readdir"
    ];
    methods.forEach((m) => {
      options[m] = options[m] || fs5[m];
      m = m + "Sync";
      options[m] = options[m] || fs5[m];
    });
    options.maxBusyTries = options.maxBusyTries || 3;
    options.emfileWait = options.emfileWait || 1e3;
    if (options.glob === false) {
      options.disableGlob = true;
    }
    if (options.disableGlob !== true && glob === void 0) {
      throw Error("glob dependency not found, set `options.disableGlob = true` if intentional");
    }
    options.disableGlob = options.disableGlob || false;
    options.glob = options.glob || defaultGlobOpts;
  };
  var rimraf = (p, options, cb) => {
    if (typeof options === "function") {
      cb = options;
      options = {};
    }
    assert(p, "rimraf: missing path");
    assert.equal(typeof p, "string", "rimraf: path should be a string");
    assert.equal(typeof cb, "function", "rimraf: callback function required");
    assert(options, "rimraf: invalid options argument provided");
    assert.equal(typeof options, "object", "rimraf: options should be object");
    defaults(options);
    let busyTries = 0;
    let errState = null;
    let n = 0;
    const next = (er) => {
      errState = errState || er;
      if (--n === 0)
        cb(errState);
    };
    const afterGlob = (er, results) => {
      if (er)
        return cb(er);
      n = results.length;
      if (n === 0)
        return cb();
      results.forEach((p2) => {
        const CB = (er2) => {
          if (er2) {
            if ((er2.code === "EBUSY" || er2.code === "ENOTEMPTY" || er2.code === "EPERM") && busyTries < options.maxBusyTries) {
              busyTries++;
              return setTimeout(() => rimraf_(p2, options, CB), busyTries * 100);
            }
            if (er2.code === "EMFILE" && timeout < options.emfileWait) {
              return setTimeout(() => rimraf_(p2, options, CB), timeout++);
            }
            if (er2.code === "ENOENT")
              er2 = null;
          }
          timeout = 0;
          next(er2);
        };
        rimraf_(p2, options, CB);
      });
    };
    if (options.disableGlob || !glob.hasMagic(p))
      return afterGlob(null, [p]);
    options.lstat(p, (er, stat) => {
      if (!er)
        return afterGlob(null, [p]);
      glob(p, options.glob, afterGlob);
    });
  };
  var rimraf_ = (p, options, cb) => {
    assert(p);
    assert(options);
    assert(typeof cb === "function");
    options.lstat(p, (er, st) => {
      if (er && er.code === "ENOENT")
        return cb(null);
      if (er && er.code === "EPERM" && isWindows)
        fixWinEPERM(p, options, er, cb);
      if (st && st.isDirectory())
        return rmdir(p, options, er, cb);
      options.unlink(p, (er2) => {
        if (er2) {
          if (er2.code === "ENOENT")
            return cb(null);
          if (er2.code === "EPERM")
            return isWindows ? fixWinEPERM(p, options, er2, cb) : rmdir(p, options, er2, cb);
          if (er2.code === "EISDIR")
            return rmdir(p, options, er2, cb);
        }
        return cb(er2);
      });
    });
  };
  var fixWinEPERM = (p, options, er, cb) => {
    assert(p);
    assert(options);
    assert(typeof cb === "function");
    options.chmod(p, 438, (er2) => {
      if (er2)
        cb(er2.code === "ENOENT" ? null : er);
      else
        options.stat(p, (er3, stats) => {
          if (er3)
            cb(er3.code === "ENOENT" ? null : er);
          else if (stats.isDirectory())
            rmdir(p, options, er, cb);
          else
            options.unlink(p, cb);
        });
    });
  };
  var fixWinEPERMSync = (p, options, er) => {
    assert(p);
    assert(options);
    try {
      options.chmodSync(p, 438);
    } catch (er2) {
      if (er2.code === "ENOENT")
        return;
      else
        throw er;
    }
    let stats;
    try {
      stats = options.statSync(p);
    } catch (er3) {
      if (er3.code === "ENOENT")
        return;
      else
        throw er;
    }
    if (stats.isDirectory())
      rmdirSync(p, options, er);
    else
      options.unlinkSync(p);
  };
  var rmdir = (p, options, originalEr, cb) => {
    assert(p);
    assert(options);
    assert(typeof cb === "function");
    options.rmdir(p, (er) => {
      if (er && (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM"))
        rmkids(p, options, cb);
      else if (er && er.code === "ENOTDIR")
        cb(originalEr);
      else
        cb(er);
    });
  };
  var rmkids = (p, options, cb) => {
    assert(p);
    assert(options);
    assert(typeof cb === "function");
    options.readdir(p, (er, files) => {
      if (er)
        return cb(er);
      let n = files.length;
      if (n === 0)
        return options.rmdir(p, cb);
      let errState;
      files.forEach((f) => {
        rimraf(path6.join(p, f), options, (er2) => {
          if (errState)
            return;
          if (er2)
            return cb(errState = er2);
          if (--n === 0)
            options.rmdir(p, cb);
        });
      });
    });
  };
  var rimrafSync = (p, options) => {
    options = options || {};
    defaults(options);
    assert(p, "rimraf: missing path");
    assert.equal(typeof p, "string", "rimraf: path should be a string");
    assert(options, "rimraf: missing options");
    assert.equal(typeof options, "object", "rimraf: options should be object");
    let results;
    if (options.disableGlob || !glob.hasMagic(p)) {
      results = [p];
    } else {
      try {
        options.lstatSync(p);
        results = [p];
      } catch (er) {
        results = glob.sync(p, options.glob);
      }
    }
    if (!results.length)
      return;
    for (let i = 0; i < results.length; i++) {
      const p2 = results[i];
      let st;
      try {
        st = options.lstatSync(p2);
      } catch (er) {
        if (er.code === "ENOENT")
          return;
        if (er.code === "EPERM" && isWindows)
          fixWinEPERMSync(p2, options, er);
      }
      try {
        if (st && st.isDirectory())
          rmdirSync(p2, options, null);
        else
          options.unlinkSync(p2);
      } catch (er) {
        if (er.code === "ENOENT")
          return;
        if (er.code === "EPERM")
          return isWindows ? fixWinEPERMSync(p2, options, er) : rmdirSync(p2, options, er);
        if (er.code !== "EISDIR")
          throw er;
        rmdirSync(p2, options, er);
      }
    }
  };
  var rmdirSync = (p, options, originalEr) => {
    assert(p);
    assert(options);
    try {
      options.rmdirSync(p);
    } catch (er) {
      if (er.code === "ENOENT")
        return;
      if (er.code === "ENOTDIR")
        throw originalEr;
      if (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM")
        rmkidsSync(p, options);
    }
  };
  var rmkidsSync = (p, options) => {
    assert(p);
    assert(options);
    options.readdirSync(p).forEach((f) => rimrafSync(path6.join(p, f), options));
    const retries = isWindows ? 100 : 1;
    let i = 0;
    do {
      let threw = true;
      try {
        const ret = options.rmdirSync(p, options);
        threw = false;
        return ret;
      } finally {
        if (++i < retries && threw)
          continue;
      }
    } while (true);
  };
  module2.exports = rimraf;
  rimraf.sync = rimrafSync;
});

// node_modules/tmp/lib/tmp.js
var require_tmp = __commonJS((exports2, module2) => {
  /*!
   * Tmp
   *
   * Copyright (c) 2011-2017 KARASZI Istvan <github@spam.raszi.hu>
   *
   * MIT Licensed
   */
  var fs5 = require("fs");
  var os5 = require("os");
  var path6 = require("path");
  var crypto3 = require("crypto");
  var _c = {fs: fs5.constants, os: os5.constants};
  var rimraf = require_rimraf();
  var RANDOM_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var TEMPLATE_PATTERN = /XXXXXX/;
  var DEFAULT_TRIES = 3;
  var CREATE_FLAGS = (_c.O_CREAT || _c.fs.O_CREAT) | (_c.O_EXCL || _c.fs.O_EXCL) | (_c.O_RDWR || _c.fs.O_RDWR);
  var IS_WIN32 = os5.platform() === "win32";
  var EBADF = _c.EBADF || _c.os.errno.EBADF;
  var ENOENT = _c.ENOENT || _c.os.errno.ENOENT;
  var DIR_MODE = 448;
  var FILE_MODE = 384;
  var EXIT = "exit";
  var _removeObjects = [];
  var FN_RMDIR_SYNC = fs5.rmdirSync.bind(fs5);
  var FN_RIMRAF_SYNC = rimraf.sync;
  var _gracefulCleanup = false;
  function tmpName(options, callback) {
    const args = _parseArguments(options, callback), opts = args[0], cb = args[1];
    try {
      _assertAndSanitizeOptions(opts);
    } catch (err) {
      return cb(err);
    }
    let tries = opts.tries;
    (function _getUniqueName() {
      try {
        const name = _generateTmpName(opts);
        fs5.stat(name, function(err) {
          if (!err) {
            if (tries-- > 0)
              return _getUniqueName();
            return cb(new Error("Could not get a unique tmp filename, max tries reached " + name));
          }
          cb(null, name);
        });
      } catch (err) {
        cb(err);
      }
    })();
  }
  function tmpNameSync(options) {
    const args = _parseArguments(options), opts = args[0];
    _assertAndSanitizeOptions(opts);
    let tries = opts.tries;
    do {
      const name = _generateTmpName(opts);
      try {
        fs5.statSync(name);
      } catch (e) {
        return name;
      }
    } while (tries-- > 0);
    throw new Error("Could not get a unique tmp filename, max tries reached");
  }
  function file(options, callback) {
    const args = _parseArguments(options, callback), opts = args[0], cb = args[1];
    tmpName(opts, function _tmpNameCreated(err, name) {
      if (err)
        return cb(err);
      fs5.open(name, CREATE_FLAGS, opts.mode || FILE_MODE, function _fileCreated(err2, fd) {
        if (err2)
          return cb(err2);
        if (opts.discardDescriptor) {
          return fs5.close(fd, function _discardCallback(possibleErr) {
            return cb(possibleErr, name, void 0, _prepareTmpFileRemoveCallback(name, -1, opts, false));
          });
        } else {
          const discardOrDetachDescriptor = opts.discardDescriptor || opts.detachDescriptor;
          cb(null, name, fd, _prepareTmpFileRemoveCallback(name, discardOrDetachDescriptor ? -1 : fd, opts, false));
        }
      });
    });
  }
  function fileSync(options) {
    const args = _parseArguments(options), opts = args[0];
    const discardOrDetachDescriptor = opts.discardDescriptor || opts.detachDescriptor;
    const name = tmpNameSync(opts);
    var fd = fs5.openSync(name, CREATE_FLAGS, opts.mode || FILE_MODE);
    if (opts.discardDescriptor) {
      fs5.closeSync(fd);
      fd = void 0;
    }
    return {
      name,
      fd,
      removeCallback: _prepareTmpFileRemoveCallback(name, discardOrDetachDescriptor ? -1 : fd, opts, true)
    };
  }
  function dir(options, callback) {
    const args = _parseArguments(options, callback), opts = args[0], cb = args[1];
    tmpName(opts, function _tmpNameCreated(err, name) {
      if (err)
        return cb(err);
      fs5.mkdir(name, opts.mode || DIR_MODE, function _dirCreated(err2) {
        if (err2)
          return cb(err2);
        cb(null, name, _prepareTmpDirRemoveCallback(name, opts, false));
      });
    });
  }
  function dirSync(options) {
    const args = _parseArguments(options), opts = args[0];
    const name = tmpNameSync(opts);
    fs5.mkdirSync(name, opts.mode || DIR_MODE);
    return {
      name,
      removeCallback: _prepareTmpDirRemoveCallback(name, opts, true)
    };
  }
  function _removeFileAsync(fdPath, next) {
    const _handler = function(err) {
      if (err && !_isENOENT(err)) {
        return next(err);
      }
      next();
    };
    if (0 <= fdPath[0])
      fs5.close(fdPath[0], function() {
        fs5.unlink(fdPath[1], _handler);
      });
    else
      fs5.unlink(fdPath[1], _handler);
  }
  function _removeFileSync(fdPath) {
    let rethrownException = null;
    try {
      if (0 <= fdPath[0])
        fs5.closeSync(fdPath[0]);
    } catch (e) {
      if (!_isEBADF(e) && !_isENOENT(e))
        throw e;
    } finally {
      try {
        fs5.unlinkSync(fdPath[1]);
      } catch (e) {
        if (!_isENOENT(e))
          rethrownException = e;
      }
    }
    if (rethrownException !== null) {
      throw rethrownException;
    }
  }
  function _prepareTmpFileRemoveCallback(name, fd, opts, sync) {
    const removeCallbackSync = _prepareRemoveCallback(_removeFileSync, [fd, name], sync);
    const removeCallback = _prepareRemoveCallback(_removeFileAsync, [fd, name], sync, removeCallbackSync);
    if (!opts.keep)
      _removeObjects.unshift(removeCallbackSync);
    return sync ? removeCallbackSync : removeCallback;
  }
  function _prepareTmpDirRemoveCallback(name, opts, sync) {
    const removeFunction = opts.unsafeCleanup ? rimraf : fs5.rmdir.bind(fs5);
    const removeFunctionSync = opts.unsafeCleanup ? FN_RIMRAF_SYNC : FN_RMDIR_SYNC;
    const removeCallbackSync = _prepareRemoveCallback(removeFunctionSync, name, sync);
    const removeCallback = _prepareRemoveCallback(removeFunction, name, sync, removeCallbackSync);
    if (!opts.keep)
      _removeObjects.unshift(removeCallbackSync);
    return sync ? removeCallbackSync : removeCallback;
  }
  function _prepareRemoveCallback(removeFunction, fileOrDirName, sync, cleanupCallbackSync) {
    let called = false;
    return function _cleanupCallback(next) {
      if (!called) {
        const toRemove = cleanupCallbackSync || _cleanupCallback;
        const index = _removeObjects.indexOf(toRemove);
        if (index >= 0)
          _removeObjects.splice(index, 1);
        called = true;
        if (sync || removeFunction === FN_RMDIR_SYNC || removeFunction === FN_RIMRAF_SYNC) {
          return removeFunction(fileOrDirName);
        } else {
          return removeFunction(fileOrDirName, next || function() {
          });
        }
      }
    };
  }
  function _garbageCollector() {
    if (!_gracefulCleanup)
      return;
    while (_removeObjects.length) {
      try {
        _removeObjects[0]();
      } catch (e) {
      }
    }
  }
  function _randomChars(howMany) {
    let value = [], rnd = null;
    try {
      rnd = crypto3.randomBytes(howMany);
    } catch (e) {
      rnd = crypto3.pseudoRandomBytes(howMany);
    }
    for (var i = 0; i < howMany; i++) {
      value.push(RANDOM_CHARS[rnd[i] % RANDOM_CHARS.length]);
    }
    return value.join("");
  }
  function _isBlank(s) {
    return s === null || _isUndefined(s) || !s.trim();
  }
  function _isUndefined(obj) {
    return typeof obj === "undefined";
  }
  function _parseArguments(options, callback) {
    if (typeof options === "function") {
      return [{}, options];
    }
    if (_isUndefined(options)) {
      return [{}, callback];
    }
    const actualOptions = {};
    for (const key of Object.getOwnPropertyNames(options)) {
      actualOptions[key] = options[key];
    }
    return [actualOptions, callback];
  }
  function _generateTmpName(opts) {
    const tmpDir = opts.tmpdir;
    if (!_isUndefined(opts.name))
      return path6.join(tmpDir, opts.dir, opts.name);
    if (!_isUndefined(opts.template))
      return path6.join(tmpDir, opts.dir, opts.template).replace(TEMPLATE_PATTERN, _randomChars(6));
    const name = [
      opts.prefix ? opts.prefix : "tmp",
      "-",
      process.pid,
      "-",
      _randomChars(12),
      opts.postfix ? "-" + opts.postfix : ""
    ].join("");
    return path6.join(tmpDir, opts.dir, name);
  }
  function _assertAndSanitizeOptions(options) {
    options.tmpdir = _getTmpDir(options);
    const tmpDir = options.tmpdir;
    if (!_isUndefined(options.name))
      _assertIsRelative(options.name, "name", tmpDir);
    if (!_isUndefined(options.dir))
      _assertIsRelative(options.dir, "dir", tmpDir);
    if (!_isUndefined(options.template)) {
      _assertIsRelative(options.template, "template", tmpDir);
      if (!options.template.match(TEMPLATE_PATTERN))
        throw new Error(`Invalid template, found "${options.template}".`);
    }
    if (!_isUndefined(options.tries) && isNaN(options.tries) || options.tries < 0)
      throw new Error(`Invalid tries, found "${options.tries}".`);
    options.tries = _isUndefined(options.name) ? options.tries || DEFAULT_TRIES : 1;
    options.keep = !!options.keep;
    options.detachDescriptor = !!options.detachDescriptor;
    options.discardDescriptor = !!options.discardDescriptor;
    options.unsafeCleanup = !!options.unsafeCleanup;
    options.dir = _isUndefined(options.dir) ? "" : path6.relative(tmpDir, _resolvePath(options.dir, tmpDir));
    options.template = _isUndefined(options.template) ? void 0 : path6.relative(tmpDir, _resolvePath(options.template, tmpDir));
    options.template = _isBlank(options.template) ? void 0 : path6.relative(options.dir, options.template);
    options.name = _isUndefined(options.name) ? void 0 : _sanitizeName(options.name);
    options.prefix = _isUndefined(options.prefix) ? "" : options.prefix;
    options.postfix = _isUndefined(options.postfix) ? "" : options.postfix;
  }
  function _resolvePath(name, tmpDir) {
    const sanitizedName = _sanitizeName(name);
    if (sanitizedName.startsWith(tmpDir)) {
      return path6.resolve(sanitizedName);
    } else {
      return path6.resolve(path6.join(tmpDir, sanitizedName));
    }
  }
  function _sanitizeName(name) {
    if (_isBlank(name)) {
      return name;
    }
    return name.replace(/["']/g, "");
  }
  function _assertIsRelative(name, option, tmpDir) {
    if (option === "name") {
      if (path6.isAbsolute(name))
        throw new Error(`${option} option must not contain an absolute path, found "${name}".`);
      let basename = path6.basename(name);
      if (basename === ".." || basename === "." || basename !== name)
        throw new Error(`${option} option must not contain a path, found "${name}".`);
    } else {
      if (path6.isAbsolute(name) && !name.startsWith(tmpDir)) {
        throw new Error(`${option} option must be relative to "${tmpDir}", found "${name}".`);
      }
      let resolvedPath = _resolvePath(name, tmpDir);
      if (!resolvedPath.startsWith(tmpDir))
        throw new Error(`${option} option must be relative to "${tmpDir}", found "${resolvedPath}".`);
    }
  }
  function _isEBADF(error) {
    return _isExpectedError(error, -EBADF, "EBADF");
  }
  function _isENOENT(error) {
    return _isExpectedError(error, -ENOENT, "ENOENT");
  }
  function _isExpectedError(error, errno, code) {
    return IS_WIN32 ? error.code === code : error.code === code && error.errno === errno;
  }
  function setGracefulCleanup() {
    _gracefulCleanup = true;
  }
  function _getTmpDir(options) {
    return path6.resolve(_sanitizeName(options && options.tmpdir || os5.tmpdir()));
  }
  process.addListener(EXIT, _garbageCollector);
  Object.defineProperty(module2.exports, "tmpdir", {
    enumerable: true,
    configurable: false,
    get: function() {
      return _getTmpDir();
    }
  });
  module2.exports.dir = dir;
  module2.exports.dirSync = dirSync;
  module2.exports.file = file;
  module2.exports.fileSync = fileSync;
  module2.exports.tmpName = tmpName;
  module2.exports.tmpNameSync = tmpNameSync;
  module2.exports.setGracefulCleanup = setGracefulCleanup;
});

// src/bin/imba.imba
var path5 = __toModule(require("path"));
var fs4 = __toModule(require("fs"));
var commander = __toModule(require_commander());

// src/bundler/pooler.imba
var np = require("path");
var workerPool = require_src();
var workerScript = np.resolve(__dirname, "..", "dist", "compiler-worker.js");
var pool = null;
var refs = 0;
function incr() {
  refs += 1;
  return pool || (pool = workerPool.pool(workerScript, {maxWorkers: 2}));
}
function decr() {
  refs -= 1;
  if (refs < 1 && pool) {
    return pool.terminate();
  }
  ;
}
function startWorkers() {
  incr();
  return {
    stop: decr,
    exec: function(...pars) {
      return pool.exec(...pars);
    }
  };
}

// src/bundler/fs.imba
var fdir = __toModule(require_fdir());

// src/bundler/resolver.imba
function iter$(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : [];
}
var sys$1 = Symbol.for("#init");
var sys$2 = Symbol.for("#ready");
var micromatch = require_micromatch();
var np2 = require("path");
var PathEntry = class {
  constructor(key, mappings) {
    this.key = key;
    this.pre = key.replace(/\*$/, "");
    this.mappings = mappings;
    this.cache = {};
  }
  match(path6) {
    if (path6.indexOf(this.pre) == 0) {
      let sub = path6.slice(this.pre.length);
      return this.mappings.map(function(_0) {
        return _0.replace("*", sub);
      });
    } else {
      return null;
    }
    ;
  }
};
var Resolver = class {
  [sys$1]($$ = null) {
    this.config = $$ ? $$.config : void 0;
    this.files = $$ ? $$.files : void 0;
    this.program = $$ ? $$.program : void 0;
  }
  constructor(o = {}) {
    this[sys$1]();
    this.config = o.config;
    this.files = o.files;
    this.program = o.program;
    this.fs = o.fs;
    this.paths = this.config.paths || {};
    this.dirs = {};
    this.aliases = {};
    this.cache = {};
    this.extensions = this.config.extensions || ["", ".imba", ".imba1", ".ts", ".js", ".css", ".svg", ".json"];
    this.resolve = this.resolve.bind(this);
    this;
  }
  setup() {
    var $0$1;
    if (!(this[sys$2] != 1 ? (this[sys$2] = 1, true) : false)) {
      return;
    }
    ;
    this.dirs = {};
    this.aliases = {};
    this.entries = [];
    let t = Date.now();
    for (let sys$53 = this.paths, sys$36 = 0, sys$43 = Object.keys(sys$53), sys$123 = sys$43.length, dir, rules; sys$36 < sys$123; sys$36++) {
      dir = sys$43[sys$36];
      rules = sys$53[dir];
      this.entries.push(new PathEntry(dir, rules));
      let rels = this.dirs[dir] = [];
      let prefix = dir.replace("/*", "/");
      this.dirs[prefix.replace(/\/\*?$/)] = rels;
      for (let sys$63 = 0, sys$72 = iter$(rules), sys$114 = sys$72.length; sys$63 < sys$114; sys$63++) {
        let rule = sys$72[sys$63];
        let replacer = rule.replace("/*", "/");
        let matches = micromatch(this.files, [rule]);
        for (let sys$82 = 0, sys$92 = iter$(matches), sys$103 = sys$92.length; sys$82 < sys$103; sys$82++) {
          let match = sys$92[sys$82];
          let alias = match.replace(replacer, prefix);
          let stripped = match.replace(replacer, "");
          let ext = alias.slice(alias.lastIndexOf("."));
          this.aliases[alias] = [match];
          let unprefixed = alias.replace(/\.\w+$/, "");
          let wildcard = ($0$1 = this.aliases)[unprefixed] || ($0$1[unprefixed] = []);
          wildcard.push(match);
        }
        ;
      }
      ;
    }
    ;
    this.pathsMatcher = new RegExp("^(" + this.entries.map(function(_0) {
      return _0.pre;
    }).join("|") + ")");
    return;
  }
  find(test) {
    var sys$133;
    sys$133 = [];
    for (let sys$143 = 0, sys$152 = iter$(this.files), sys$162 = sys$152.length; sys$143 < sys$162; sys$143++) {
      let file = sys$152[sys$143];
      if (!file.match(test)) {
        continue;
      }
      ;
      sys$133.push(file);
    }
    ;
    return sys$133;
  }
  testWithExtensions(path6, exts = this.extensions) {
    if (this.files.indexOf(path6) >= 0) {
      return path6;
    }
    ;
    for (let sys$172 = 0, sys$183 = iter$(exts), sys$192 = sys$183.length; sys$172 < sys$192; sys$172++) {
      let ext = sys$183[sys$172];
      let m = path6 + ext;
      if (this.files.indexOf(m) >= 0) {
        return m;
      }
      ;
    }
    ;
    return null;
  }
  relative(dir, path6) {
    let res = np2.relative(dir, path6);
    if (res[0] != ".") {
      res = "./" + res;
    }
    ;
    return res;
  }
  expand(path6) {
    if (this.cache[path6]) {
      return this.cache[path6];
    }
    ;
    this.setup();
    let test = [];
    for (let sys$20 = 0, sys$21 = iter$(this.entries), sys$282 = sys$21.length, m; sys$20 < sys$282; sys$20++) {
      let entry = sys$21[sys$20];
      if (m = entry.match(path6)) {
        for (let sys$222 = 0, sys$232 = iter$(m), sys$273 = sys$232.length; sys$222 < sys$273; sys$222++) {
          let item = sys$232[sys$222];
          test.push(item);
          for (let sys$242 = 0, sys$252 = iter$(this.extensions), sys$262 = sys$252.length; sys$242 < sys$262; sys$242++) {
            let ext = sys$252[sys$242];
            test.push(item + ext);
          }
          ;
        }
        ;
      }
      ;
    }
    ;
    return this.cache[path6] = test;
  }
  resolve(o, lookupMap) {
    this.setup();
    let path6 = o.path;
    let found;
    let namespace = "file";
    let colonIndex = path6.indexOf(":");
    let qIndex = path6.indexOf("?");
    if (colonIndex >= 0) {
      namespace = path6.substr(0, colonIndex);
      path6 = path6.slice(colonIndex + 1);
    }
    ;
    if (qIndex > 0) {
      [path6, namespace] = path6.split("?");
    }
    ;
    let isRel = path6.match(/^\.+\//);
    if (isRel) {
      let m = 0;
      let norm = np2.resolve(o.resolveDir, path6);
      for (let sys$29 = 0, sys$302 = iter$(this.extensions), sys$31 = sys$302.length; sys$29 < sys$31; sys$29++) {
        let ext = sys$302[sys$29];
        let m2 = norm + ext;
        if (this.fs.existsSync(m2)) {
          path6 = namespace == "file" ? m2 : this.fs.relative(m2);
          return {path: path6, namespace};
        }
        ;
      }
      ;
      return {path: this.fs.relative(m), namespace};
    } else if (!this.pathsMatcher.test(path6)) {
      return null;
    } else if (this.fs) {
      for (let sys$322 = 0, sys$332 = iter$(this.expand(path6, namespace)), sys$342 = sys$332.length; sys$322 < sys$342; sys$322++) {
        let m = sys$332[sys$322];
        if (lookupMap) {
          lookupMap[m] = true;
        }
        ;
        if (this.fs.existsSync(m)) {
          path6 = namespace == "file" ? this.fs.resolve(m) : m;
          return {path: path6, namespace};
        }
        ;
      }
      ;
      return null;
    }
    ;
    return {path: path6, namespace};
  }
};

// src/program/monarch/common.ts
var MonarchBracket;
(function(MonarchBracket2) {
  MonarchBracket2[MonarchBracket2["None"] = 0] = "None";
  MonarchBracket2[MonarchBracket2["Open"] = 1] = "Open";
  MonarchBracket2[MonarchBracket2["Close"] = -1] = "Close";
})(MonarchBracket || (MonarchBracket = {}));
function isFuzzyActionArr(what) {
  return Array.isArray(what);
}
function isFuzzyAction(what) {
  return !isFuzzyActionArr(what);
}
function isString(what) {
  return typeof what === "string";
}
function isIAction(what) {
  return !isString(what);
}
function empty(s) {
  return s ? false : true;
}
function fixCase(lexer2, str) {
  return lexer2.ignoreCase && str ? str.toLowerCase() : str;
}
function sanitize(s) {
  return s.replace(/[&<>'"_]/g, "-");
}
function log(lexer2, msg) {
  console.log(`${lexer2.languageId}: ${msg}`);
}
function createError(lexer2, msg) {
  return new Error(`${lexer2.languageId}: ${msg}`);
}
var substitutionCache = {};
function compileSubstitution(str) {
  const parts = [];
  let i = 0;
  let l = str.length;
  let part = "";
  let sub = 0;
  while (i < l) {
    let chr = str[i++];
    if (chr == "$") {
      let next = str[i++];
      if (next == "$") {
        part += "$";
        continue;
      }
      if (part)
        parts.push(part);
      part = "";
      if (next == "#") {
        parts.push(0);
      } else if (next == "S") {
        parts.push(parseInt(str[i++]) + 100);
      } else {
        parts.push(parseInt(next) + 1);
      }
    } else {
      part += chr;
    }
  }
  if (part)
    parts.push(part);
  substitutionCache[str] = parts;
  return parts;
}
function substituteMatches(lexer2, str, id, matches, state) {
  let stateMatches = null;
  let parts = substitutionCache[str] || compileSubstitution(str);
  let out = "";
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i];
    if (typeof part == "string") {
      out += part;
    } else if (part > 100) {
      if (stateMatches === null)
        stateMatches = state.split(".");
      out += stateMatches[part - 101] || "";
    } else if (part === 100) {
      out += state;
    } else if (part === 0) {
      out += id;
    } else if (part > 0) {
      out += matches[part - 1];
    }
  }
  return out;
}
var FIND_RULES_MAP = {};
function findRules(lexer2, inState) {
  let state = inState;
  if (FIND_RULES_MAP[state]) {
    return lexer2.tokenizer[FIND_RULES_MAP[state]];
  }
  while (state && state.length > 0) {
    const rules = lexer2.tokenizer[state];
    if (rules) {
      FIND_RULES_MAP[inState] = state;
      return rules;
    }
    const idx = state.lastIndexOf(".");
    if (idx < 0) {
      state = null;
    } else {
      state = state.substr(0, idx);
    }
  }
  return null;
}
function stateExists(lexer2, inState) {
  let state = inState;
  while (state && state.length > 0) {
    const exist = lexer2.stateNames[state];
    if (exist) {
      return true;
    }
    const idx = state.lastIndexOf(".");
    if (idx < 0) {
      state = null;
    } else {
      state = state.substr(0, idx);
    }
  }
  return false;
}

// src/program/monarch/compile.ts
function isArrayOf(elemType, obj) {
  if (!obj) {
    return false;
  }
  if (!Array.isArray(obj)) {
    return false;
  }
  for (const el of obj) {
    if (!elemType(el)) {
      return false;
    }
  }
  return true;
}
function bool(prop, defValue) {
  if (typeof prop === "boolean") {
    return prop;
  }
  return defValue;
}
function string(prop, defValue) {
  if (typeof prop === "string") {
    return prop;
  }
  return defValue;
}
function arrayToHash(array) {
  const result = {};
  for (const e of array) {
    result[e] = true;
  }
  return result;
}
function createKeywordMatcher(arr, caseInsensitive = false) {
  if (caseInsensitive) {
    arr = arr.map(function(x) {
      return x.toLowerCase();
    });
  }
  const hash = arrayToHash(arr);
  if (caseInsensitive) {
    return function(word) {
      return hash[word.toLowerCase()] !== void 0 && hash.hasOwnProperty(word.toLowerCase());
    };
  } else {
    return function(word) {
      return hash[word] !== void 0 && hash.hasOwnProperty(word);
    };
  }
}
function compileRegExp(lexer2, str) {
  let n = 0;
  while (str.indexOf("@") >= 0 && n < 5) {
    n++;
    str = str.replace(/@(\w+)/g, function(s, attr) {
      let sub = "";
      if (typeof lexer2[attr] === "string") {
        sub = lexer2[attr];
      } else if (lexer2[attr] && lexer2[attr] instanceof RegExp) {
        sub = lexer2[attr].source;
      } else {
        if (lexer2[attr] === void 0) {
          throw createError(lexer2, "language definition does not contain attribute '" + attr + "', used at: " + str);
        } else {
          throw createError(lexer2, "attribute reference '" + attr + "' must be a string, used at: " + str);
        }
      }
      return empty(sub) ? "" : "(?:" + sub + ")";
    });
  }
  return new RegExp(str, lexer2.ignoreCase ? "i" : "");
}
function selectScrutinee(id, matches, state, num) {
  if (num < 0) {
    return id;
  }
  if (num < matches.length) {
    return matches[num];
  }
  if (num >= 100) {
    num = num - 100;
    let parts = state.split(".");
    parts.unshift(state);
    if (num < parts.length) {
      return parts[num];
    }
  }
  return null;
}
function createGuard(lexer2, ruleName, tkey, val) {
  let scrut = -1;
  let oppat = tkey;
  let matches = tkey.match(/^\$(([sS]?)(\d\d?)|#)(.*)$/);
  if (matches) {
    if (matches[3]) {
      scrut = parseInt(matches[3]);
      if (matches[2]) {
        scrut = scrut + 100;
      }
    }
    oppat = matches[4];
  }
  let op = "~";
  let pat = oppat;
  if (!oppat || oppat.length === 0) {
    op = "!=";
    pat = "";
  } else if (/^\w*$/.test(pat)) {
    op = "==";
  } else {
    matches = oppat.match(/^(@|!@|~|!~|==|!=)(.*)$/);
    if (matches) {
      op = matches[1];
      pat = matches[2];
    }
  }
  let tester;
  if ((op === "~" || op === "!~") && /^(\w|\|)*$/.test(pat)) {
    let inWords = createKeywordMatcher(pat.split("|"), lexer2.ignoreCase);
    tester = function(s) {
      return op === "~" ? inWords(s) : !inWords(s);
    };
  } else if (op === "@" || op === "!@") {
    let words = lexer2[pat];
    if (!words) {
      throw createError(lexer2, "the @ match target '" + pat + "' is not defined, in rule: " + ruleName);
    }
    if (!isArrayOf(function(elem) {
      return typeof elem === "string";
    }, words)) {
      throw createError(lexer2, "the @ match target '" + pat + "' must be an array of strings, in rule: " + ruleName);
    }
    let inWords = createKeywordMatcher(words, lexer2.ignoreCase);
    tester = function(s) {
      return op === "@" ? inWords(s) : !inWords(s);
    };
  } else if (op === "~" || op === "!~") {
    if (pat.indexOf("$") < 0) {
      let re = compileRegExp(lexer2, "^" + pat + "$");
      tester = function(s) {
        return op === "~" ? re.test(s) : !re.test(s);
      };
    } else {
      tester = function(s, id, matches2, state) {
        let re = compileRegExp(lexer2, "^" + substituteMatches(lexer2, pat, id, matches2, state) + "$");
        return re.test(s);
      };
    }
  } else {
    if (pat.indexOf("$") < 0) {
      let patx = fixCase(lexer2, pat);
      tester = function(s) {
        return op === "==" ? s === patx : s !== patx;
      };
    } else {
      let patx = fixCase(lexer2, pat);
      tester = function(s, id, matches2, state, eos) {
        let patexp = substituteMatches(lexer2, patx, id, matches2, state);
        return op === "==" ? s === patexp : s !== patexp;
      };
    }
  }
  if (scrut === -1) {
    return {
      name: tkey,
      value: val,
      test: function(id, matches2, state, eos) {
        return tester(id, id, matches2, state, eos);
      }
    };
  } else {
    return {
      name: tkey,
      value: val,
      test: function(id, matches2, state, eos) {
        let scrutinee = selectScrutinee(id, matches2, state, scrut);
        return tester(!scrutinee ? "" : scrutinee, id, matches2, state, eos);
      }
    };
  }
}
function compileAction(lexer2, ruleName, action) {
  if (!action) {
    return {token: ""};
  } else if (typeof action === "string") {
    return action;
  } else if (action.token || action.token === "") {
    if (typeof action.token !== "string") {
      throw createError(lexer2, "a 'token' attribute must be of type string, in rule: " + ruleName);
    } else {
      let newAction = {token: action.token};
      if (action.token.indexOf("$") >= 0) {
        newAction.tokenSubst = true;
      }
      if (typeof action.bracket === "string") {
        if (action.bracket === "@open") {
          newAction.bracket = MonarchBracket.Open;
        } else if (action.bracket === "@close") {
          newAction.bracket = MonarchBracket.Close;
        } else {
          throw createError(lexer2, "a 'bracket' attribute must be either '@open' or '@close', in rule: " + ruleName);
        }
      }
      if (action.next) {
        if (typeof action.next !== "string") {
          throw createError(lexer2, "the next state must be a string value in rule: " + ruleName);
        } else {
          let next = action.next;
          if (!/^(@pop|@push|@popall)$/.test(next)) {
            if (next[0] === "@") {
              next = next.substr(1);
            }
            if (next.indexOf("$") < 0) {
              if (!stateExists(lexer2, substituteMatches(lexer2, next, "", [], ""))) {
                throw createError(lexer2, "the next state '" + action.next + "' is not defined in rule: " + ruleName);
              }
            }
          }
          newAction.next = next;
        }
      }
      if (typeof action.goBack === "number") {
        newAction.goBack = action.goBack;
      }
      if (typeof action.switchTo === "string") {
        newAction.switchTo = action.switchTo;
      }
      if (typeof action.log === "string") {
        newAction.log = action.log;
      }
      if (typeof action._push === "string") {
        newAction._push = action._push;
      }
      if (typeof action._pop === "string") {
        newAction._pop = action._pop;
      }
      if (typeof action.mark === "string") {
        newAction.mark = action.mark;
      }
      if (typeof action.fn === "string") {
        newAction.fn = action.fn;
      }
      if (typeof action.nextEmbedded === "string") {
        newAction.nextEmbedded = action.nextEmbedded;
        lexer2.usesEmbedded = true;
      }
      return newAction;
    }
  } else if (Array.isArray(action)) {
    let results = [];
    for (let i = 0, len = action.length; i < len; i++) {
      results[i] = compileAction(lexer2, ruleName, action[i]);
    }
    return {group: results};
  } else if (action.cases) {
    let cases = [];
    for (let tkey in action.cases) {
      if (action.cases.hasOwnProperty(tkey)) {
        const val = compileAction(lexer2, ruleName, action.cases[tkey]);
        if (tkey === "@default" || tkey === "@" || tkey === "") {
          cases.push({test: void 0, value: val, name: tkey});
        } else if (tkey === "@eos") {
          cases.push({test: function(id, matches, state, eos) {
            return eos;
          }, value: val, name: tkey});
        } else {
          cases.push(createGuard(lexer2, ruleName, tkey, val));
        }
      }
    }
    const def = lexer2.defaultToken;
    return {
      test: function(id, matches, state, eos) {
        for (const _case of cases) {
          const didmatch = !_case.test || _case.test(id, matches, state, eos);
          if (didmatch) {
            return _case.value;
          }
        }
        return def;
      }
    };
  } else {
    throw createError(lexer2, "an action must be a string, an object with a 'token' or 'cases' attribute, or an array of actions; in rule: " + ruleName);
  }
}
var Rule = class {
  constructor(name) {
    this.regex = new RegExp("");
    this.action = {token: ""};
    this.matchOnlyAtLineStart = false;
    this.name = "";
    this.name = name;
    this.stats = {time: 0, count: 0, hits: 0};
  }
  setRegex(lexer2, re) {
    let sregex;
    if (typeof re === "string") {
      sregex = re;
    } else if (re instanceof RegExp) {
      sregex = re.source;
    } else {
      throw createError(lexer2, "rules must start with a match string or regular expression: " + this.name);
    }
    if (sregex.length == 2 && sregex[0] == "\\" && /[\{\}\(\)\[\]]/.test(sregex[1])) {
      this.string = sregex[1];
    }
    this.matchOnlyAtLineStart = sregex.length > 0 && sregex[0] === "^";
    this.name = this.name + ": " + sregex;
    this.regex = compileRegExp(lexer2, "^(?:" + (this.matchOnlyAtLineStart ? sregex.substr(1) : sregex) + ")");
  }
  setAction(lexer2, act) {
    this.action = compileAction(lexer2, this.name, act);
  }
};
function compile(languageId, json) {
  if (!json || typeof json !== "object") {
    throw new Error("Monarch: expecting a language definition object");
  }
  let lexer2 = {};
  lexer2.languageId = languageId;
  lexer2.noThrow = false;
  lexer2.maxStack = 100;
  lexer2.start = typeof json.start === "string" ? json.start : null;
  lexer2.ignoreCase = bool(json.ignoreCase, false);
  lexer2.tokenPostfix = string(json.tokenPostfix, "." + lexer2.languageId);
  lexer2.defaultToken = string(json.defaultToken, "source");
  lexer2.usesEmbedded = false;
  let lexerMin = json;
  lexerMin.languageId = languageId;
  lexerMin.ignoreCase = lexer2.ignoreCase;
  lexerMin.noThrow = lexer2.noThrow;
  lexerMin.usesEmbedded = lexer2.usesEmbedded;
  lexerMin.stateNames = json.tokenizer;
  lexerMin.defaultToken = lexer2.defaultToken;
  function addRules(state, newrules, rules) {
    for (const rule of rules) {
      let include = rule.include;
      if (include) {
        if (typeof include !== "string") {
          throw createError(lexer2, "an 'include' attribute must be a string at: " + state);
        }
        if (include[0] === "@") {
          include = include.substr(1);
        }
        if (!json.tokenizer[include]) {
          throw createError(lexer2, "include target '" + include + "' is not defined at: " + state);
        }
        addRules(state + "." + include, newrules, json.tokenizer[include]);
      } else {
        const newrule = new Rule(state);
        if (Array.isArray(rule) && rule.length >= 1 && rule.length <= 3) {
          newrule.setRegex(lexerMin, rule[0]);
          if (rule.length >= 3) {
            if (typeof rule[1] === "string") {
              newrule.setAction(lexerMin, {token: rule[1], next: rule[2]});
            } else if (typeof rule[1] === "object") {
              const rule1 = rule[1];
              rule1.next = rule[2];
              newrule.setAction(lexerMin, rule1);
            } else {
              throw createError(lexer2, "a next state as the last element of a rule can only be given if the action is either an object or a string, at: " + state);
            }
          } else {
            newrule.setAction(lexerMin, rule[1]);
          }
        } else {
          if (!rule.regex) {
            throw createError(lexer2, "a rule must either be an array, or an object with a 'regex' or 'include' field at: " + state);
          }
          if (rule.name) {
            if (typeof rule.name === "string") {
              newrule.name = rule.name;
            }
          }
          if (rule.matchOnlyAtStart) {
            newrule.matchOnlyAtLineStart = bool(rule.matchOnlyAtLineStart, false);
          }
          newrule.setRegex(lexerMin, rule.regex);
          newrule.setAction(lexerMin, rule.action);
        }
        newrules.push(newrule);
      }
    }
  }
  if (!json.tokenizer || typeof json.tokenizer !== "object") {
    throw createError(lexer2, "a language definition must define the 'tokenizer' attribute as an object");
  }
  lexer2.tokenizer = [];
  for (let key in json.tokenizer) {
    if (json.tokenizer.hasOwnProperty(key)) {
      if (!lexer2.start) {
        lexer2.start = key;
      }
      const rules = json.tokenizer[key];
      lexer2.tokenizer[key] = new Array();
      addRules("tokenizer." + key, lexer2.tokenizer[key], rules);
    }
  }
  lexer2.usesEmbedded = lexerMin.usesEmbedded;
  if (json.brackets) {
    if (!Array.isArray(json.brackets)) {
      throw createError(lexer2, "the 'brackets' attribute must be defined as an array");
    }
  } else {
    json.brackets = [
      {open: "{", close: "}", token: "delimiter.curly"},
      {open: "[", close: "]", token: "delimiter.square"},
      {open: "(", close: ")", token: "delimiter.parenthesis"},
      {open: "<", close: ">", token: "delimiter.angle"}
    ];
  }
  let brackets = [];
  for (let el of json.brackets) {
    let desc = el;
    if (desc && Array.isArray(desc) && desc.length === 3) {
      desc = {token: desc[2], open: desc[0], close: desc[1]};
    }
    if (desc.open === desc.close) {
      throw createError(lexer2, "open and close brackets in a 'brackets' attribute must be different: " + desc.open + "\n hint: use the 'bracket' attribute if matching on equal brackets is required.");
    }
    if (typeof desc.open === "string" && typeof desc.token === "string" && typeof desc.close === "string") {
      brackets.push({
        token: desc.token + lexer2.tokenPostfix,
        open: fixCase(lexer2, desc.open),
        close: fixCase(lexer2, desc.close)
      });
    } else {
      throw createError(lexer2, "every element in the 'brackets' array must be a '{open,close,token}' object or array");
    }
  }
  lexer2.brackets = brackets;
  lexer2.noThrow = true;
  return lexer2;
}

// src/program/monarch/token.ts
var Token = class {
  constructor(offset, type, language) {
    this.offset = offset | 0;
    this.type = type;
    this.language = language;
    this.kind = 0;
    this.mods = 0;
    this.value = null;
    this.stack = null;
  }
  toString() {
    return this.value || "";
  }
  get span() {
    return {offset: this.offset, length: this.value ? this.value.length : 0};
  }
  get indent() {
    return 0;
  }
  match(val) {
    if (typeof val == "string") {
      if (val.indexOf(" ") > 0) {
        val = val.split(" ");
      } else {
        let idx = this.type.indexOf(val);
        return val[0] == "." ? idx >= 0 : idx == 0;
      }
    }
    if (val instanceof Array) {
      for (let item of val) {
        let idx = this.type.indexOf(item);
        let hit = item[0] == "." ? idx >= 0 : idx == 0;
        if (hit)
          return true;
      }
    }
    if (val instanceof RegExp) {
      return val.test(this.type);
    }
    return false;
  }
};
var TokenizationResult = class {
  constructor(tokens, endState) {
    this.tokens = tokens;
    this.endState = endState;
  }
};

// src/program/monarch/lexer.ts
var CACHE_STACK_DEPTH = 10;
function statePart(state, index) {
  return state.split(".")[index];
}
var MonarchStackElementFactory2 = class {
  static create(parent, state) {
    return this._INSTANCE.create(parent, state);
  }
  constructor(maxCacheDepth) {
    this._maxCacheDepth = maxCacheDepth;
    this._entries = Object.create(null);
  }
  create(parent, state) {
    if (parent !== null && parent.depth >= this._maxCacheDepth) {
      return new MonarchStackElement(parent, state);
    }
    let stackElementId = MonarchStackElement.getStackElementId(parent);
    if (stackElementId.length > 0) {
      stackElementId += "|";
    }
    stackElementId += state;
    let result = this._entries[stackElementId];
    if (result) {
      return result;
    }
    result = new MonarchStackElement(parent, state);
    this._entries[stackElementId] = result;
    return result;
  }
};
var MonarchStackElementFactory = MonarchStackElementFactory2;
MonarchStackElementFactory._INSTANCE = new MonarchStackElementFactory2(CACHE_STACK_DEPTH);
var MonarchStackElement = class {
  constructor(parent, state) {
    this.parent = parent;
    this.state = state;
    this.depth = (this.parent ? this.parent.depth : 0) + 1;
  }
  static getStackElementId(element) {
    let result = "";
    while (element !== null) {
      if (result.length > 0) {
        result += "|";
      }
      result += element.state;
      element = element.parent;
    }
    return result;
  }
  static _equals(a, b) {
    while (a !== null && b !== null) {
      if (a === b) {
        return true;
      }
      if (a.state !== b.state) {
        return false;
      }
      a = a.parent;
      b = b.parent;
    }
    if (a === null && b === null) {
      return true;
    }
    return false;
  }
  get indent() {
    return this.state.lastIndexOf("	") - this.state.indexOf("	");
  }
  get scope() {
    return this.part(2);
  }
  get detail() {
    return this.part(2);
  }
  part(index) {
    return this.state.split(".")[index];
  }
  equals(other) {
    return MonarchStackElement._equals(this, other);
  }
  push(state) {
    return MonarchStackElementFactory.create(this, state);
  }
  pop() {
    return this.parent;
  }
  popall() {
    let result = this;
    while (result.parent) {
      result = result.parent;
    }
    return result;
  }
  switchTo(state) {
    return MonarchStackElementFactory.create(this.parent, state);
  }
};
var MonarchLineStateFactory2 = class {
  static create(stack) {
    return this._INSTANCE.create(stack);
  }
  constructor(maxCacheDepth) {
    this._maxCacheDepth = maxCacheDepth;
    this._entries = Object.create(null);
  }
  create(stack) {
    if (stack !== null && stack.depth >= this._maxCacheDepth) {
      return new MonarchLineState(stack);
    }
    let stackElementId = MonarchStackElement.getStackElementId(stack);
    let result = this._entries[stackElementId];
    if (result) {
      return result;
    }
    result = new MonarchLineState(stack);
    this._entries[stackElementId] = result;
    return result;
  }
};
var MonarchLineStateFactory = MonarchLineStateFactory2;
MonarchLineStateFactory._INSTANCE = new MonarchLineStateFactory2(CACHE_STACK_DEPTH);
var MonarchLineState = class {
  constructor(stack) {
    this.stack = stack;
  }
  clone() {
    return MonarchLineStateFactory.create(this.stack);
  }
  equals(other) {
    if (!(other instanceof MonarchLineState)) {
      return false;
    }
    if (!this.stack.equals(other.stack)) {
      return false;
    }
    return true;
  }
};
var MonarchClassicTokensCollector = class {
  constructor() {
    this._tokens = [];
    this._language = null;
    this._lastToken = new Token(0, "start", "imba");
    this._lastTokenType = null;
  }
  enterMode(startOffset, modeId) {
    this._language = modeId;
  }
  emit(startOffset, type, stack) {
    if (this._lastTokenType === type && false) {
      console.log("add to last token", type);
      return this._lastToken;
    }
    let token2 = new Token(startOffset, type, this._language);
    this._lastTokenType = type;
    this._lastToken = token2;
    this._tokens.push(token2);
    return token2;
  }
  finalize(endState) {
    return new TokenizationResult(this._tokens, endState);
  }
};
var MonarchTokenizer = class {
  constructor(modeId, lexer2) {
    this._modeId = modeId;
    this._lexer = lexer2;
    this._profile = false;
  }
  dispose() {
  }
  getLoadStatus() {
    return {loaded: true};
  }
  getInitialState() {
    let rootState = MonarchStackElementFactory.create(null, this._lexer.start);
    return MonarchLineStateFactory.create(rootState);
  }
  tokenize(line, lineState, offsetDelta) {
    let tokensCollector = new MonarchClassicTokensCollector();
    let endLineState = this._tokenize(line, lineState, offsetDelta, tokensCollector);
    return tokensCollector.finalize(endLineState);
  }
  _tokenize(line, lineState, offsetDelta, collector) {
    return this._myTokenize(line, lineState, offsetDelta, collector);
  }
  _safeRuleName(rule) {
    if (rule) {
      return rule.name;
    }
    return "(unknown)";
  }
  _rescope(from, to, tokens, toState) {
    let a = (from || "").split("-");
    let b = (to || "").split("-");
    if (from == to)
      return;
    let diff = 1;
    while (a[diff] && a[diff] == b[diff]) {
      diff++;
    }
    let level = a.length;
    while (level > diff) {
      tokens.push("pop." + a[--level] + "." + level);
    }
    while (b.length > diff) {
      let id = "push." + b[diff++] + "." + (diff - 1);
      if (toState) {
        let indent = statePart(toState, 1);
        id += "." + indent;
      }
      tokens.push(id);
    }
  }
  _myTokenize(line, lineState, offsetDelta, tokensCollector) {
    tokensCollector.enterMode(offsetDelta, this._modeId);
    const lineLength = line.length;
    let stack = lineState.stack;
    let lastToken = null;
    let pos = 0;
    let profile = this._profile;
    let groupMatching = null;
    let forceEvaluation = true;
    let append = [];
    let tries = 0;
    let rules = [];
    let rulesState = null;
    while (forceEvaluation || pos < lineLength) {
      tries++;
      if (tries > 1e3) {
        console.log("infinite recursion");
        throw "infinite recursion in tokenizer?";
      }
      const pos0 = pos;
      const stackLen0 = stack.depth;
      const groupLen0 = groupMatching ? groupMatching.groups.length : 0;
      const state = stack.state;
      let matches = null;
      let matched = null;
      let action = null;
      let rule = null;
      if (groupMatching) {
        matches = groupMatching.matches;
        const groupEntry = groupMatching.groups.shift();
        matched = groupEntry.matched;
        action = groupEntry.action;
        rule = groupMatching.rule;
        if (groupMatching.groups.length === 0) {
          groupMatching = null;
        }
      } else {
        if (!forceEvaluation && pos >= lineLength) {
          break;
        }
        forceEvaluation = false;
        rules = this._lexer.tokenizer[state];
        if (!rules) {
          rules = findRules(this._lexer, state);
          if (!rules) {
            throw createError(this._lexer, "tokenizer state is not defined: " + state);
          }
        }
        let restOfLine = line.substr(pos);
        for (const rule2 of rules) {
          if (rule2.string !== void 0) {
            if (restOfLine[0] === rule2.string) {
              matches = [rule2.string];
              matched = rule2.string;
              action = rule2.action;
              break;
            }
          } else if (pos === 0 || !rule2.matchOnlyAtLineStart) {
            if (profile) {
              rule2.stats.count++;
              let now = performance.now();
              matches = restOfLine.match(rule2.regex);
              rule2.stats.time += performance.now() - now;
              if (matches) {
                rule2.stats.hits++;
              }
            } else {
              matches = restOfLine.match(rule2.regex);
            }
            if (matches) {
              matched = matches[0];
              action = rule2.action;
              break;
            }
          }
        }
      }
      if (!matches) {
        matches = [""];
        matched = "";
      }
      if (!action) {
        if (pos < lineLength) {
          matches = [line.charAt(pos)];
          matched = matches[0];
        }
        action = this._lexer.defaultToken;
      }
      if (matched === null) {
        break;
      }
      pos += matched.length;
      while (isFuzzyAction(action) && isIAction(action) && action.test) {
        action = action.test(matched, matches, state, pos === lineLength);
      }
      let result = null;
      if (typeof action === "string" || Array.isArray(action)) {
        result = action;
      } else if (action.group) {
        result = action.group;
      } else if (action.token !== null && action.token !== void 0) {
        if (action.tokenSubst) {
          result = substituteMatches(this._lexer, action.token, matched, matches, state);
        } else {
          result = action.token;
        }
        if (action.goBack) {
          pos = Math.max(0, pos - action.goBack);
        }
        if (action.switchTo && typeof action.switchTo === "string") {
          let nextState = substituteMatches(this._lexer, action.switchTo, matched, matches, state);
          if (nextState[0] === "@") {
            nextState = nextState.substr(1);
          }
          if (!findRules(this._lexer, nextState)) {
            throw createError(this._lexer, "trying to switch to a state '" + nextState + "' that is undefined in rule: " + this._safeRuleName(rule));
          } else {
            let from = stack.scope;
            let to = statePart(nextState, 2);
            if (from !== to)
              this._rescope(from, to, append, nextState);
            stack = stack.switchTo(nextState);
          }
        } else if (action.transform && typeof action.transform === "function") {
          throw createError(this._lexer, "action.transform not supported");
        } else if (action.next) {
          if (action.next === "@push") {
            if (stack.depth >= this._lexer.maxStack) {
              throw createError(this._lexer, "maximum tokenizer stack size reached: [" + stack.state + "," + stack.parent.state + ",...]");
            } else {
              stack = stack.push(state);
            }
          } else if (action.next === "@pop") {
            if (stack.depth <= 1) {
              throw createError(this._lexer, "trying to pop an empty stack in rule: " + this._safeRuleName(rule));
            } else {
              let prev = stack;
              stack = stack.pop();
              let from = statePart(prev.state, 2);
              let to = statePart(stack.state, 2);
              if (from !== to)
                this._rescope(from, to, append, stack.state);
            }
          } else if (action.next === "@popall") {
            stack = stack.popall();
          } else {
            let nextState = substituteMatches(this._lexer, action.next, matched, matches, state);
            if (nextState[0] === "@") {
              nextState = nextState.substr(1);
            }
            let nextScope = statePart(nextState, 2);
            if (!findRules(this._lexer, nextState)) {
              throw createError(this._lexer, "trying to set a next state '" + nextState + "' that is undefined in rule: " + this._safeRuleName(rule));
            } else {
              if (nextScope != stack.scope)
                this._rescope(stack.scope || "", nextScope, append, nextState);
              stack = stack.push(nextState);
            }
          }
        }
        if (action.log && typeof action.log === "string") {
          log(this._lexer, this._lexer.languageId + ": " + substituteMatches(this._lexer, action.log, matched, matches, state));
        }
        if (action.mark) {
          tokensCollector.emit(pos0 + offsetDelta, action.mark, stack);
        }
      }
      if (result === null) {
        throw createError(this._lexer, "lexer rule has no well-defined action in rule: " + this._safeRuleName(rule));
      }
      if (Array.isArray(result)) {
        if (groupMatching && groupMatching.groups.length > 0) {
          throw createError(this._lexer, "groups cannot be nested: " + this._safeRuleName(rule));
        }
        if (matches.length !== result.length + 1) {
          throw createError(this._lexer, "matched number of groups does not match the number of actions in rule: " + this._safeRuleName(rule));
        }
        let totalLen = 0;
        for (let i = 1; i < matches.length; i++) {
          totalLen += matches[i].length;
        }
        if (totalLen !== matched.length) {
          throw createError(this._lexer, "with groups, all characters should be matched in consecutive groups in rule: " + this._safeRuleName(rule));
        }
        groupMatching = {
          rule,
          matches,
          groups: []
        };
        for (let i = 0; i < result.length; i++) {
          groupMatching.groups[i] = {
            action: result[i],
            matched: matches[i + 1]
          };
        }
        pos -= matched.length;
        continue;
      } else {
        if (result === "@rematch") {
          pos -= matched.length;
          matched = "";
          matches = null;
          result = "";
        }
        if (matched.length === 0) {
          if (lineLength === 0 || stackLen0 !== stack.depth || state !== stack.state || (!groupMatching ? 0 : groupMatching.groups.length) !== groupLen0) {
            if (typeof result == "string" && result)
              tokensCollector.emit(pos + offsetDelta, result, stack);
            while (append.length > 0) {
              tokensCollector.emit(pos + offsetDelta, append.shift(), stack);
            }
            continue;
          } else {
            throw createError(this._lexer, "no progress in tokenizer in rule: " + this._safeRuleName(rule));
          }
        }
        let tokenType = null;
        if (isString(result) && result.indexOf("@brackets") === 0) {
          let rest = result.substr("@brackets".length);
          let bracket = findBracket(this._lexer, matched);
          if (!bracket) {
            throw createError(this._lexer, "@brackets token returned but no bracket defined as: " + matched);
          }
          tokenType = sanitize(bracket.token + rest);
        } else {
          let token3 = result === "" ? "" : result + this._lexer.tokenPostfix;
          tokenType = sanitize(token3);
        }
        let token2 = tokensCollector.emit(pos0 + offsetDelta, tokenType, stack);
        token2.stack = stack;
        if (lastToken && lastToken != token2) {
          lastToken.value = line.slice(lastToken.offset - offsetDelta, pos0);
        }
        lastToken = token2;
        while (append.length > 0) {
          tokensCollector.emit(pos + offsetDelta, append.shift(), stack);
        }
      }
    }
    if (lastToken && !lastToken.value) {
      lastToken.value = line.slice(lastToken.offset - offsetDelta);
    }
    return MonarchLineStateFactory.create(stack);
  }
};
function findBracket(lexer2, matched) {
  if (!matched) {
    return null;
  }
  matched = fixCase(lexer2, matched);
  let brackets = lexer2.brackets;
  for (const bracket of brackets) {
    if (bracket.open === matched) {
      return {token: bracket.token, bracketType: MonarchBracket.Open};
    } else if (bracket.close === matched) {
      return {token: bracket.token, bracketType: MonarchBracket.Close};
    }
  }
  return null;
}

// src/program/grammars/xml.imba
var grammar = {
  defaultToken: "",
  tokenPostfix: ".xml",
  ignoreCase: true,
  qualifiedName: /(?:[\w\.\-]+:)?[\w\.\-]+/,
  tokenizer: {
    root: [
      [/[^<&]+/, ""],
      {include: "@whitespace"},
      [/(<)(@qualifiedName)/, [
        {token: "delimiter"},
        {token: "tag", next: "@tag"}
      ]],
      [/(<\/)(@qualifiedName)(\s*)(>)/, [
        {token: "delimiter"},
        {token: "tag"},
        "",
        {token: "delimiter"}
      ]],
      [/(<\?)(@qualifiedName)/, [
        {token: "delimiter"},
        {token: "metatag", next: "@tag"}
      ]],
      [/(<\!)(@qualifiedName)/, [
        {token: "delimiter"},
        {token: "metatag", next: "@tag"}
      ]],
      [/<\!\[CDATA\[/, {token: "delimiter.cdata", next: "@cdata"}],
      [/&\w+;/, "string.escape"]
    ],
    cdata: [
      [/[^\]]+/, ""],
      [/\]\]>/, {token: "delimiter.cdata", next: "@pop"}],
      [/\]/, ""]
    ],
    tag: [
      [/[ \t\r\n]+/, ""],
      [/(@qualifiedName)(\s*=\s*)("[^"]*"|'[^']*')/, ["attribute.name", "", "attribute.value"]],
      [/(@qualifiedName)(\s*=\s*)("[^">?\/]*|'[^'>?\/]*)(?=[\?\/]\>)/, ["attribute.name", "", "attribute.value"]],
      [/(@qualifiedName)(\s*=\s*)("[^">]*|'[^'>]*)/, ["attribute.name", "", "attribute.value"]],
      [/@qualifiedName/, "attribute.name"],
      [/\?>/, {token: "delimiter", next: "@pop"}],
      [/(\/)(>)/, [
        {token: "tag"},
        {token: "delimiter", next: "@pop"}
      ]],
      [/>/, {token: "delimiter", next: "@pop"}]
    ],
    whitespace: [
      [/[ \t\r\n]+/, ""],
      [/<!--/, {token: "comment", next: "@comment"}]
    ],
    comment: [
      [/[^<\-]+/, "comment.content"],
      [/-->/, {token: "comment", next: "@pop"}],
      [/<!--/, "comment.content.invalid"],
      [/[<\-]/, "comment.content"]
    ]
  }
};

// src/program/monarch.imba
var tokenizers = {};
var Monarch = class {
  static getTokenizer(langId) {
    if (langId == "xml" && !tokenizers[langId]) {
      return this.createTokenizer("xml", grammar);
    }
    ;
    return tokenizers[langId];
  }
  static createTokenizer(langId, grammar2) {
    let compiled = compile(langId, grammar2);
    return tokenizers[langId] = new MonarchTokenizer(langId, compiled);
  }
};

// src/compiler/assets.imba
function iter$2(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : [];
}
function parseAsset(raw, name) {
  var $0$1, $0$2;
  let text = raw.body;
  let xml2 = Monarch.getTokenizer("xml");
  let state = xml2.getInitialState();
  let out = xml2.tokenize(text, state, 0);
  let attrs = {};
  let desc = {attributes: attrs, flags: []};
  let currAttr;
  let contentStart = 0;
  for (let sys$114 = 0, sys$29 = iter$2(out.tokens), sys$36 = sys$29.length; sys$114 < sys$36; sys$114++) {
    let tok = sys$29[sys$114];
    let val = tok.value;
    if (tok.type == "attribute.name.xml") {
      currAttr = tok;
      attrs[val] = true;
    }
    ;
    if (tok.type == "attribute.value.xml") {
      let len = val.length;
      if (len > 2 && val[0] == val[len - 1] && (val[0] == '"' || val[0] == "'")) {
        val = val.slice(1, -1);
      }
      ;
      attrs[currAttr.value] = val;
    }
    ;
    if (tok.type == "delimiter.xml" && val == ">") {
      contentStart = tok.offset + 1;
      break;
    }
    ;
  }
  ;
  desc.content = text.slice(contentStart).replace("</svg>", "");
  if (attrs.class) {
    desc.flags = attrs.class.split(/\s+/g);
    $0$1 = attrs.class, delete attrs.class, $0$1;
  }
  ;
  if (name) {
    desc.flags.push("asset-" + name.toLowerCase());
  }
  ;
  $0$2 = attrs.xmlns, delete attrs.xmlns, $0$2;
  return desc;
}

// src/bundler/component.imba
var events = __toModule(require("events"));

// src/bundler/logger.imba
var ora = __toModule(require_ora());
var sys$12 = Symbol.for("#spinner");
var sys$22 = Symbol.for("#ctime");
var sys$3 = Symbol.for("#IMBA_OPTIONS");
var helpers = require_helpers();
var ansi = helpers.ansi;
var notWin = process.platform !== "win32" || process.env.CI || process.env.TERM === "xterm-256color";
var logSymbols = {
  info: ansi.f("yellowBright", notWin ? "\u2139" : "i"),
  success: ansi.green(notWin ? "\u2714" : "\u221A"),
  warning: ansi.yellow(notWin ? "\u26A0" : "!!"),
  error: ansi.red(notWin ? "\xD7" : "\u2716"),
  debug: ansi.blue(notWin ? "\u2139" : "i")
};
var logLevels = ["debug", "info", "success", "warning", "error", "silent"];
var addressTypeName = {
  "-1": "socket",
  "4": "ip4",
  "6": "ip6"
};
function format(str, ...rest) {
  let fmt2 = helpers.ansi.f;
  str = str.replace(/\%([\w\.]+)/g, function(m, f) {
    let part = rest.shift();
    if (f == "kb") {
      return fmt2("dim", (part / 1e3).toFixed(1) + "kb");
    } else if (f == "path" || f == "bold") {
      return fmt2("bold", part);
    } else if (f == "dim") {
      return fmt2("dim", part);
    } else if (f == "address") {
      let typ = addressTypeName[part.addressType];
      if (part.port) {
        return fmt2("blueBright", [part.address || "0.0.0.0", part.port].join(":"));
      } else {
        return fmt2("blueBright", typ);
      }
      ;
    } else if (f == "ms") {
      return fmt2("yellow", Math.round(part) + "ms");
    } else if (f == "d") {
      return fmt2("blueBright", part);
    } else if (f == "red") {
      return fmt2("redBright", part);
    } else if (f == "green") {
      return fmt2("greenBright", part);
    } else if (f == "yellow") {
      return fmt2("yellowBright", part);
    } else if (f == "ref") {
      return fmt2("yellowBright", "#" + (part.id || part));
    } else if (f == "elapsed") {
      if (part != void 0) {
        rest.unshift(part);
      }
      ;
      let elapsed = Date.now() - globalThis[sys$22];
      return fmt2("yellow", Math.round(elapsed) + "ms");
    } else {
      return part;
    }
    ;
  });
  return [str, ...rest];
}
var Spinner = null;
var Logger = class {
  constructor({prefix = null, loglevel} = {}) {
    this[sys$22] = Date.now();
    this.prefix = prefix ? format(...prefix)[0] : "";
    this.loglevel = loglevel || globalThis[sys$3].loglevel || "warning";
  }
  write(kind, ...parts) {
    if (logLevels.indexOf(kind) < logLevels.indexOf(this.loglevel)) {
      return this;
    }
    ;
    let sym = logSymbols[kind] || kind;
    let [str, ...rest] = format(...parts);
    if (this.prefix) {
      str = this.prefix + str;
    }
    ;
    if (this[sys$12] && this[sys$12].isSpinning) {
      if (kind == "success") {
        this[sys$12].clear();
        console.log(sym + " " + str, ...rest);
        this[sys$12].frame();
      }
      ;
      return this[sys$12].text = str;
    } else {
      return console.log(sym + " " + str, ...rest);
    }
    ;
  }
  debug(...pars) {
    return this.write("debug", ...pars);
  }
  log(...pars) {
    return this.write("info", ...pars);
  }
  info(...pars) {
    return this.write("info", ...pars);
  }
  warn(...pars) {
    return this.write("warn", ...pars);
  }
  error(...pars) {
    return this.write("error", ...pars);
  }
  success(...pars) {
    return this.write("success", ...pars);
  }
  spinner() {
    return;
    return Spinner = ora.default("Loading").start();
  }
  get [sys$12]() {
    return Spinner;
  }
  async time(label, cb) {
    let t = Date.now();
    if (cb) {
      let res = await cb();
      this.info("" + label + " %ms", Date.now() - t);
      return res;
    }
    ;
  }
};

// src/bundler/component.imba
var sys$13 = Symbol.for("#logger");
var sys$23 = Symbol.for("#timestamps");
var Component = class extends events.EventEmitter {
  get log() {
    return this[sys$13] || (this[sys$13] = new Logger());
  }
  time(name = "default") {
    let now = Date.now();
    this[sys$23] || (this[sys$23] = {});
    let prev = this[sys$23][name] || now;
    let diff = now - prev;
    this[sys$23][name] = now;
    return diff;
  }
  timed(name = "default") {
    let str;
    return str = "time " + name + ": " + this.time(name);
  }
};
var component_default = Component;

// src/bundler/changes.imba
function iter$3(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : [];
}
var ChangeLog = class {
  constructor(o = {}) {
    this.log = [];
    this.maps = new WeakMap();
    this.cursors = o.ignoreInitial ? null : new WeakMap();
    this.depth = 0;
    this.offset = 0;
    this.pulled = 0;
    this.options = o;
    this.batch = null;
  }
  flush() {
    if (this.batch) {
      if (this.options.withFlags) {
        this.log.push(...Array.from(this.batch));
      } else {
        for (let [item, marks] of iter$3(this.batch)) {
          this.log.push(item);
        }
        ;
      }
      ;
      this.batch = null;
    }
    ;
    return this;
  }
  push(item) {
    return this.mark(item);
  }
  mark(item, flag = 2) {
    if (!this.cursors) {
      return;
    }
    ;
    if (this.batch) {
      return this.batch.set(item, (this.batch.get(item) || 0) | flag);
    } else {
      this.batch = new Map();
      return this.batch.set(item, flag);
    }
    ;
  }
  trim() {
    this.offset += this.log.length;
    this.log.length = 0;
    return this;
  }
  get cursor() {
    return this.offset + this.log.length;
  }
  get length() {
    return this.log.length;
  }
  pull(target) {
    if (this.batch) {
      this.flush();
    }
    ;
    let map = this.cursors || (this.cursors = new WeakMap());
    let pos = map.get(target);
    let cur = this.cursor;
    if (pos == void 0 || pos < cur) {
      map.set(target, cur);
      let start = Math.max((pos || 0) - this.offset, 0);
      return this.log.slice(start);
    }
    ;
    return false;
  }
};
var changes_default = ChangeLog;

// src/bundler/fs.imba
function iter$4(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : [];
}
var sys$14 = Symbol.for("#cache");
var sys$6 = Symbol.for("#watchers");
var sys$7 = Symbol.for("#watched");
var sys$8 = Symbol.for("#tree");
var sys$9 = Symbol.for("#mtime");
var sys$10 = Symbol.for("#body");
var sys$11 = Symbol.for("#hash");
var sys$132 = Symbol.for("#files");
var sys$142 = Symbol.for("#map");
var nodefs = require("fs");
var np3 = require("path");

// src/bundler/config.imba
var schema = {
  loader: "merge",
  node: "merge",
  browser: "merge",
  defaults: "merge"
};
var defaultConfig = {
  buildfile: "imbabuild.json",
  outdir: "dist",
  node: {
    platform: "node",
    format: "cjs",
    outdir: "dist",
    sourcemap: true,
    target: ["node12.19.0"],
    external: ["dependencies", "!imba"]
  },
  browser: {
    platform: "browser",
    format: "esm",
    outdir: "dist",
    splitting: true,
    target: [
      "es2020",
      "chrome58",
      "firefox57",
      "safari11",
      "edge16"
    ]
  },
  bundles: [],
  defaults: {
    web: {
      target: [
        "es2020",
        "chrome58",
        "firefox57",
        "safari11",
        "edge16"
      ]
    },
    worker: {
      splitting: false,
      hashing: true,
      format: "iife",
      platform: "worker"
    },
    serviceworker: {
      splitting: false,
      hashing: false,
      format: "iife",
      platform: "worker"
    }
  }
};
function clone(object) {
  return JSON.parse(JSON.stringify(object));
}
function merge(config, defaults) {
  for (let sys$114 = 0, sys$29 = Object.keys(defaults), sys$36 = sys$29.length, key, value; sys$114 < sys$36; sys$114++) {
    key = sys$29[sys$114];
    value = defaults[key];
    let typ = schema[key];
    if (config.hasOwnProperty(key)) {
      if (typ == "merge") {
        config[key] = merge(config[key], value);
      }
      ;
    } else {
      config[key] = clone(value);
    }
    ;
  }
  ;
  return config;
}
function resolve(config, cwd) {
  config = merge(config, defaultConfig);
  return config;
}

// src/bundler/fs.imba
var utils = require_utils4();
var micromatch2 = require_micromatch();
var blankStat = {
  size: 0,
  blocks: 0,
  atimeMs: 0,
  mtimeMs: 0,
  ctimeMs: 0,
  birthtimeMs: 0,
  atime: "",
  mtime: "",
  ctime: "",
  birthtime: ""
};
var FLAGS = {
  CHECKED: 1,
  EXISTS: 2,
  REGISTERED: 4,
  WATCHED: 8,
  RESOLVED: 16,
  REMOVED: 32,
  ADDED: 64
};
var matchToRegexCache = {};
function matchToRegex(str) {
  return matchToRegexCache[str] || (matchToRegexCache[str] = (str = str.replace(/(\*\*|\*|\.)/g, function(m, t) {
    if (t == "**") {
      return "(.*)";
    } else if (t == "*") {
      return "([^/]+)";
    } else if (t == ".") {
      return "\\.";
    }
    ;
  }), new RegExp(str)));
}
var FSTree = class extends Array {
  constructor(...items) {
    super(...items);
    this[sys$14] = {};
  }
  withExtension(ext) {
    return this.match(".(" + ext.replace(/,/g, "|") + ")$");
  }
  match(match) {
    var $0$1;
    if (typeof match == "string") {
      let regex = matchToRegex(match);
      return ($0$1 = this[sys$14])[match] || ($0$1[match] = this.filter(function(_0) {
        return regex.test(_0.rel);
      }));
    }
    ;
  }
  add(node) {
    let idx = this.indexOf(node);
    if (idx == -1) {
      this.push(node);
      this[sys$14] = {};
    }
    ;
    return this;
  }
  get paths() {
    return this.map(function(_0) {
      return _0.rel;
    });
  }
  remove(node) {
    let idx = this.indexOf(node);
    if (idx >= 0) {
      this.splice(idx, 1);
      for (let sys$43 = this[sys$14], sys$29 = 0, sys$36 = Object.keys(sys$43), sys$53 = sys$36.length, key, res; sys$29 < sys$53; sys$29++) {
        key = sys$36[sys$29];
        res = sys$43[key];
        res.remove(node);
      }
      ;
    }
    ;
    return this;
  }
};
var FSNode = class {
  static create(program2, src, abs) {
    let ext = src.slice(src.lastIndexOf("."));
    let types = {
      ".json": JSONFile,
      ".imba": ImbaFile,
      ".imba1": Imba1File,
      ".svg": SVGFile
    };
    let cls = types[ext] || FileNode;
    return new cls(program2, src, abs);
  }
  constructor(root, rel, abs) {
    this.fs = root;
    this.rel = rel;
    this.abs = abs;
    this.flags = 0;
    this[sys$6] = new Set();
    this[sys$7] = false;
  }
  get program() {
    return this.fs.program;
  }
  get name() {
    return np3.basename(this.rel);
  }
  memo(key, cb) {
    return this.program.cache.memo("" + this.abs + ":" + key, this.mtimesync, cb);
  }
  watch(observer) {
    this[sys$6].add(observer);
    if (this[sys$7] != true ? (this[sys$7] = true, true) : false) {
      return this.program.watcher.add(this.abs);
    }
    ;
  }
  get isRegistered() {
    return this.flags & FLAGS.REGISTERED;
  }
  register() {
    var $0$2;
    if ((this.flags & ($0$2 = FLAGS.REGISTERED)) == 0 ? (this.flags |= $0$2, true) : false) {
      this.fs[sys$8].add(this);
    }
    ;
    return this;
  }
  deregister() {
    var $0$3;
    if (this.flags & ($0$3 = FLAGS.REGISTERED) ? (this.flags &= ~$0$3, true) : false) {
      return this.fs[sys$8].remove(this);
    }
    ;
  }
  touch() {
    this[sys$9] = Date.now();
    this[sys$10] = void 0;
    return this;
  }
  existsSync() {
    if (this.isRegistered) {
      return true;
    }
    ;
    let real = nodefs.existsSync(this.abs);
    if (real) {
      this.register();
      return true;
    } else {
      return false;
    }
    ;
  }
  unwatch(observer) {
    this[sys$6].delete(observer);
    if (this[sys$7] && this[sys$6].size == 0) {
      this[sys$7] = false;
      return this.program.watcher.unwatch(this.abs);
    }
    ;
  }
};
var DirNode = class extends FSNode {
};
var FileNode = class extends FSNode {
  constructor(root, rel, abs) {
    super(...arguments);
    this.cache = {};
  }
  [Symbol.toPrimitive](hint) {
    return this.abs;
  }
  get reldir() {
    return this.rel.slice(0, this.rel.lastIndexOf("/") + 1);
  }
  get absdir() {
    return this.abs.slice(0, this.abs.lastIndexOf("/") + 1);
  }
  get dir() {
    return this.fs.lookup(this.absdir, DirNode);
  }
  async write(body, hash) {
    if (!hash || (this[sys$11] != hash ? (this[sys$11] = hash, true) : false)) {
      await utils.ensureDir(this.abs);
      if (this.rel.indexOf("../") != 0 || true) {
        this.fs.log.success("write %path %kb", this.rel, body.length);
      }
      ;
      return nodefs.promises.writeFile(this.abs, body);
    }
    ;
  }
  writeSync(body, hash) {
    if (!hash || (this[sys$11] != hash ? (this[sys$11] = hash, true) : false)) {
      if (this.rel.indexOf("../") != 0 || true) {
        this.fs.log.success("write %path %kb", this.rel, body.length);
      }
      ;
      return nodefs.writeFileSync(this.abs, body);
    }
    ;
  }
  read(enc = "utf8") {
    return this[sys$10] || nodefs.promises.readFile(this.abs, enc);
  }
  readSync(enc = "utf8") {
    return this[sys$10] || (this[sys$10] = nodefs.readFileSync(this.abs, enc));
  }
  stat() {
    return nodefs.promises.stat(this.abs).then(function(_0) {
      return _0;
    }).catch(function() {
      return blankStat;
    });
  }
  get mtimesync() {
    return this.existsSync() ? nodefs.statSync(this.abs).mtimeMs : 1;
  }
  async mtime() {
    if (!this[sys$9]) {
      let s = await this.stat();
      this[sys$9] = s.mtimeMs;
    }
    ;
    return this[sys$9];
  }
  unlink() {
    return nodefs.promises.unlink(this.abs);
  }
  extractStarPattern(pat) {
    let regex = new RegExp(pat.replace(/\*/g, "([^/]+)"));
    return (this.rel.match(regex) || []).slice(1);
  }
};
var ImbaFile = class extends FileNode {
  compile(o, context = this.program) {
    var self2 = this;
    return this.memo(o.platform, async function() {
      o = Object.assign({
        platform: o.platform,
        format: "esm",
        imbaPath: "imba",
        styles: "extern",
        hmr: true,
        bundle: true,
        sourcePath: self2.rel,
        sourceId: self2.program.cache.getPathAlias(self2.abs),
        cwd: self2.fs.cwd,
        sourcemap: "inline",
        config: self2.program.config
      }, {});
      o.format = "esm";
      let code = await self2.read();
      let t = Date.now();
      let out = await context.workers.exec("compile_imba", [code, o]);
      self2.program.log.success("compile %path %path in %ms", self2.rel, o.platform, Date.now() - t, o.sourceId);
      return out;
    });
  }
};
var Imba1File = class extends FileNode {
  compile(o, context = this.program) {
    var self2 = this;
    return this.memo(o.platform, async function() {
      o = Object.assign({
        platform: "node",
        format: "esm",
        sourcePath: self2.rel,
        filename: self2.rel,
        inlineHelpers: 1,
        cwd: self2.fs.cwd
      }, o);
      o.target = o.platform;
      let code = await self2.read();
      let params = {
        code,
        options: o,
        type: "imba1"
      };
      let t = Date.now();
      let out = await context.workers.exec("compile_imba1", [code, o]);
      self2.program.log.success("compile %path in %ms", self2.rel, Date.now() - t);
      return out;
    });
  }
};
var SVGFile = class extends FileNode {
  compile(o) {
    var self2 = this;
    return this.memo(o.format, async function() {
      let svgbody = await self2.read();
      let parsed = parseAsset({body: svgbody});
      return {js: "export default " + JSON.stringify(parsed) + ";"};
    });
  }
};
var JSONFile = class extends FileNode {
  constructor() {
    super(...arguments);
  }
  load() {
    try {
      this.raw = this.readSync();
      this.data = JSON.parse(this.raw);
    } catch (sys$123) {
      this.data = {};
    }
    ;
    return this;
  }
  save() {
    let out = JSON.stringify(this.data, null, 2);
    if (out != this.raw) {
      this.raw = out;
      this.writeSync(out);
    }
    ;
    return this;
  }
};
var FileSystem = class extends component_default {
  constructor(dir, base, program2) {
    super();
    this.cwd = np3.resolve(base, dir);
    this.program = program2;
    this.nodemap = {};
    this.existsCache = {};
    this.changelog = new changes_default();
    this[sys$132] = null;
    this[sys$8] = new FSTree();
    this[sys$142] = {};
  }
  toString() {
    return this.cwd;
  }
  valueOf() {
    return this.cwd;
  }
  existsSync(src) {
    let entry = this.nodemap[src];
    if (entry) {
      return entry.existsSync();
    } else {
      if (this.existsCache[src] != void 0) {
        return this.existsCache[src];
      }
      ;
      return this.existsCache[src] = nodefs.existsSync(this.resolve(src));
    }
    ;
  }
  lookup(src, typ = FileNode) {
    var $0$4;
    src = this.relative(src);
    return ($0$4 = this.nodemap)[src] || ($0$4[src] = typ.create(this, src, this.resolve(src)));
  }
  nodes(arr) {
    var self2 = this;
    return arr.map(function(_0) {
      return self2.lookup(_0);
    });
  }
  get outdir() {
    return this.program.outdir;
  }
  get files() {
    if (!this[sys$132]) {
      this.prescan();
    }
    ;
    return this[sys$132];
  }
  resolve(...src) {
    return np3.resolve(this.cwd, ...src);
  }
  relative(src) {
    return np3.relative(this.cwd, this.resolve(src));
  }
  async writePath(src, body) {
    await utils.ensureDir(this.resolve(src));
    return this.writeFile(this.resolve(src), body);
  }
  async ensureDir(src) {
    return await utils.ensureDir(this.resolve(src));
  }
  writeFile(src, body) {
    return nodefs.promises.writeFile(this.resolve(src), body);
  }
  unlink(src, body) {
    return nodefs.promises.unlink(this.resolve(src));
  }
  readFile(src, enc = "utf8") {
    return nodefs.promises.readFile(this.resolve(src), enc);
  }
  stat(src) {
    return nodefs.promises.stat(this.resolve(src)).then(function(_0) {
      return _0;
    }).catch(function() {
      return blankStat;
    });
  }
  touchFile(src) {
    this.changelog.mark(src);
    this.lookup(src).touch();
    return this.emit("change");
  }
  addFile(src) {
    this.changelog.mark(src);
    this.lookup(src).register();
    return this.emit("change");
  }
  removeFile(src) {
    this.changelog.mark(src);
    this.lookup(src).deregister();
    return this.emit("change");
  }
  prescan(items = null) {
    var $0$5;
    if (this[sys$132]) {
      return this[sys$132];
    }
    ;
    this[sys$132] = items || this.crawl();
    for (let sys$152 = 0, sys$162 = iter$4(this[sys$132]), sys$172 = sys$162.length; sys$152 < sys$172; sys$152++) {
      let item = sys$162[sys$152];
      let li = item.lastIndexOf(".");
      let ext = item.slice(li) || ".*";
      let map = ($0$5 = this[sys$132])[ext] || ($0$5[ext] = []);
      if (!map.push) {
        console.log("ext?!", ext, item);
      }
      ;
      map.push(item);
    }
    ;
    return this[sys$132];
  }
  reset() {
    this[sys$132] = null;
    return this;
  }
  glob(match = [], ignore = null, ext = null) {
    var self2 = this;
    this.prescan();
    let sources = this[sys$8];
    if (ext) {
      sources = this[sys$8].withExtension(ext);
    }
    ;
    if (match instanceof RegExp && !ignore) {
      return sources.filter(function(_0) {
        return match.test(_0.rel);
      });
    } else if (typeof match == "string") {
      if (match.indexOf("*") >= 0) {
        match = [match];
      } else {
        return new FSTree(this.existsSync(match) ? this.lookup(match) : null);
      }
      ;
    }
    ;
    if (!match || match.length == 0) {
      if (!ignore) {
        return sources.slice(0);
      }
      ;
      match = ["*"];
    }
    ;
    let res = micromatch2(sources.paths, match, {ignore});
    return new FSTree(...res.map(function(_0) {
      return self2.nodemap[_0];
    }));
  }
  find(regex, ext = null) {
    this.prescan();
    let sources = ext ? [] : this[sys$132];
    if (typeof ext == "string") {
      ext = ext.split(",");
    }
    ;
    if (ext instanceof Array) {
      for (let sys$183 = 0, sys$192 = iter$4(ext), sys$20 = sys$192.length; sys$183 < sys$20; sys$183++) {
        let item = sys$192[sys$183];
        sources = sources.concat(this[sys$132]["." + item] || []);
      }
      ;
    }
    ;
    return sources.filter(function(_0) {
      return regex.test(_0);
    });
  }
  scan(match) {
    this.prescan();
    let matched = [];
    for (let sys$21 = 0, sys$222 = iter$4(this[sys$132]), sys$232 = sys$222.length; sys$21 < sys$232; sys$21++) {
      let src = sys$222[sys$21];
      let m = false;
      if (match instanceof RegExp) {
        m = match.test(src);
        if (m) {
          matched.push(this.lookup(src));
        }
        ;
      }
      ;
    }
    ;
    return matched;
  }
  crawl(o = {}) {
    var $0$6, $0$7;
    let slice = this.cwd.length + 1;
    let filter = function(a) {
      return a[0] != ".";
    };
    let grouped = true;
    let api = new fdir.fdir().crawlWithOptions(this.cwd, {
      includeBasePath: !grouped,
      group: grouped,
      includeDirs: false,
      maxDepth: 8,
      filters: [filter],
      exclude: function(_0, _1, _2) {
        if (_2 == 7) {
          if (o.includeRoots && !o.includeRoots[_0]) {
            return true;
          }
          ;
          if (o.excludeRoots && o.excludeRoots[_0]) {
            return true;
          }
          ;
        }
        ;
        return /^(\.|node_modules)/.test(_0);
      }
    });
    let res = api.sync();
    if (!grouped) {
      return res.map(function(_0) {
        return _0.slice(slice);
      });
    }
    ;
    let paths = [];
    for (let sys$242 = 0, sys$252 = iter$4(res), sys$29 = sys$252.length; sys$242 < sys$29; sys$242++) {
      let entry = sys$252[sys$242];
      let absdir = entry.dir;
      let reldir = absdir.slice(slice);
      let dir = ($0$6 = this.nodemap)[reldir] || ($0$6[reldir] = new DirNode(this, reldir, absdir));
      for (let sys$262 = 0, sys$273 = iter$4(entry.files), sys$282 = sys$273.length; sys$262 < sys$282; sys$262++) {
        let f = sys$273[sys$262];
        let rel = reldir + "/" + f;
        let abs = absdir + "/" + f;
        let file = ($0$7 = this.nodemap)[rel] || ($0$7[rel] = FSNode.create(this, rel, abs));
        file.register();
        paths.push(rel);
      }
      ;
    }
    ;
    return paths;
  }
};

// src/bundler/program.imba
var chokidar = __toModule(require("chokidar"));

// src/bundler/cache.imba
var path = __toModule(require("path"));
var fs = __toModule(require("fs"));
var os = __toModule(require("os"));
var crypto = __toModule(require("crypto"));
function iter$5(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : [];
}
var sys$15 = Symbol.for("#key");
var utils2 = require_utils4();
var hashedKeyCache = {};
var keyPathCache = {};
var Cache = class {
  constructor(options) {
    this[sys$15] = Symbol();
    this.o = options;
    console.log("cache dir?", this.o.cachedir);
    this.dir = this.o.cachedir;
    this.aliaspath = path.default.resolve(this.dir, ".imba-aliases");
    this.aliasmap = "";
    this.aliascache = {};
    this.data = {
      aliases: {},
      cache: {}
    };
    this.mintime = this.o.mtime || 0;
    this.idFaucet = utils2.idGenerator();
    this.preload();
  }
  preload() {
    if (!fs.default.existsSync(this.dir)) {
      fs.default.mkdirSync(this.dir);
    }
    ;
    let entries = fs.default.readdirSync(this.dir);
    for (let sys$29 = 0, sys$36 = iter$5(entries), sys$43 = sys$36.length; sys$29 < sys$43; sys$29++) {
      let entry = sys$36[sys$29];
      this.cache[entry] = {exists: 1};
    }
    ;
    if (!fs.default.existsSync(this.aliaspath)) {
      fs.default.appendFileSync(this.aliaspath, "");
    }
    ;
    this.refreshAliasMap();
    return this;
  }
  setup() {
    return true;
  }
  save() {
    return this;
  }
  deserialize() {
    return this;
  }
  serialize() {
    return this;
  }
  get cache() {
    var $0$1;
    return ($0$1 = this.data).cache || ($0$1.cache = {});
  }
  get aliases() {
    var $0$2;
    return ($0$2 = this.data).aliases || ($0$2.aliases = {});
  }
  alias(src) {
    if (!this.aliases[src]) {
      let nr = Object.keys(this.aliases).length;
      this.aliases[src] = this.idFaucet(nr) + "0";
    }
    ;
    return this.aliases[src];
  }
  normalizeKey(key) {
    if (hashedKeyCache[key]) {
      return hashedKeyCache[key];
    }
    ;
    let hash = crypto.default.createHash("sha1");
    hash.update(key);
    return hashedKeyCache[key] = hash.digest("hex");
  }
  fullKeyPath(key) {
    return keyPathCache[key] || (keyPathCache[key] = path.default.resolve(this.dir, key));
  }
  getKeyTime(key) {
    let cached = this.cache[key];
    if (cached && cached.time) {
      return cached.time;
    }
    ;
    if (cached && cached.exists) {
      let path6 = this.fullKeyPath(key);
      return fs.default.statSync(path6).mtimeMs;
    } else {
      return 0;
    }
    ;
  }
  refreshAliasMap() {
    return this.aliasmap = fs.default.readFileSync(this.aliaspath, "utf8").split(/\r?\n/);
  }
  getPathAlias(path6) {
    return this.getKeyAlias(path6);
  }
  getKeyAlias(key) {
    if (this.aliascache[key]) {
      return this.aliascache[key];
    }
    ;
    let index = this.aliasmap.indexOf(key);
    if (index == -1) {
      fs.default.appendFileSync(this.aliaspath, key + "\n", "utf8");
      this.refreshAliasMap();
      index = this.aliasmap.indexOf(key);
    }
    ;
    if (index >= 0) {
      return this.aliascache[key] = this.idFaucet(index);
    } else {
      console.log("key not added?", key, this.aliasmap);
      throw "could not add key to aliasmap";
    }
    ;
  }
  async getKeyValue(key) {
    let path6 = this.fullKeyPath(key);
    let val = await fs.default.promises.readFile(path6, "utf8");
    return JSON.parse(val);
  }
  setKeyValue(key, value) {
    let path6 = this.fullKeyPath(key);
    let json = JSON.stringify(value);
    return fs.default.promises.writeFile(path6, json);
  }
  memo(name, time, cb) {
    var self2 = this;
    let key = this.normalizeKey(name);
    if (this.mintime > time) {
      time = this.mintime;
    }
    ;
    let cached = this.cache[key];
    if (cached && cached.time >= time) {
      return cached.promise;
    }
    ;
    let keytime = this.getKeyTime(key);
    if (keytime > time) {
      cached = this.cache[key] = {
        time: Date.now(),
        promise: this.getKeyValue(key)
      };
    } else {
      cached = this.cache[key] = {
        time: Date.now(),
        promise: cb()
      };
      cached.promise.then(function(val) {
        return self2.setKeyValue(key, val);
      });
    }
    ;
    return cached.promise;
  }
};
var cache_default = Cache;

// src/bundler/program.imba
function iter$6(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : [];
}
var sys$16 = Symbol.for("#resolver");
var sys$24 = Symbol.for("#workers");
var sys$32 = Symbol.for("#hasesb");
var sys$4 = Symbol.for("#esb");
var sys$5 = Symbol.for("#setup");
var utils3 = require_utils4();
var np5 = require("path");
var micromatch3 = require_micromatch();
var esbuild = require("esbuild");
var workerPool2 = require_src();
var workerScript2 = np5.resolve(__dirname, "..", "compiler-worker.js");
var VirtualWatcher = class {
  on(ev) {
    return true;
  }
  add(watched) {
    return true;
  }
  path() {
    return this;
  }
  stop() {
    return true;
  }
};
var Program = class extends component_default {
  constructor(config, options) {
    var self2;
    super();
    self2 = this;
    this.key = Symbol();
    this.config = config;
    this.options = options;
    this.outdir = config.outdir || "build";
    this.mtime = options.force ? Date.now() : options.mtime || 0;
    this.package = options.package;
    this.fs = new FileSystem(options.cwd, ".", this);
    this.cache = new cache_default(options);
    this.manifest = this.fs.lookup("imbabuild.json").load();
    this.watcher = options.watch2 ? chokidar.default.watch([this.cwd], {
      ignoreInitial: true,
      depth: 0,
      ignored: [".*", ".git/**", ".cache"],
      cwd: this.cwd
    }) : new VirtualWatcher();
    this.watcher.on("change", function(src, stats) {
      return self2.fs.touchFile(src);
    });
    this.watcher.on("unlink", function(src, stats) {
      return self2.fs.removeFile(src);
    });
    this.watcher.on("add", function(src, stats) {
      return self2.fs.addFile(src);
    });
    this.watcher.on("raw", function(event, src, details) {
      return true;
    });
    this.watcher.add(np5.resolve(this.imbaPath, "src"));
    this;
  }
  get cwd() {
    return this.fs.cwd;
  }
  get imbaPath() {
    return this.options.imbaPath;
  }
  get program() {
    return this;
  }
  get resolver() {
    return this[sys$16] || (this[sys$16] = new Resolver({config: this.config, files: this.fs.files, program: this, fs: this.fs}));
  }
  get workers() {
    return this[sys$24] || (this[sys$24] = startWorkers());
  }
  async esb() {
    this[sys$32] = true;
    console.log("called program esb");
    return this[sys$4] || (this[sys$4] = await esbuild.startService({}));
  }
  setup() {
    var self2 = this;
    return this[sys$5] || (this[sys$5] = new Promise(function(resolve2) {
      return resolve2(self2);
    }));
  }
  async build() {
    await this.setup();
    if (!this.options.watch) {
      return this.workers.terminate();
    }
    ;
  }
  async clean() {
    let sources = this.fs.nodes(this.fs.find(/\.imba1?(\.web)?\.\w+$/, "mjs,js,cjs,css,meta"));
    for (let sys$63 = 0, sys$72 = iter$6(sources), sys$82 = sys$72.length; sys$63 < sys$82; sys$63++) {
      let file = sys$72[sys$63];
      await file.unlink();
    }
    ;
    this.log.info("cleaned %d files in %elapsed", sources.length);
    this.fs.reset();
    return;
  }
  async dispose() {
    if (this[sys$32]) {
      (await this.esb()).stop();
    }
    ;
    if (this[sys$24]) {
      return this[sys$24].terminate();
    }
    ;
  }
};
var program_default = Program;

// src/bundler/runner.imba
var path2 = __toModule(require("path"));
var child_process = __toModule(require("child_process"));
function iter$7(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : [];
}
var sys$17 = Symbol.for("#init");
var sys$25 = Symbol.for("#next");
var sys$33 = Symbol.for("#prev");
var cluster = require("cluster");
var Instance = class {
  [sys$17]($$ = null) {
    var $0$1;
    this.runner = $$ && ($0$1 = $$.runner) !== void 0 ? $0$1 : null;
    this.args = $$ && ($0$1 = $$.args) !== void 0 ? $0$1 : {};
    this.mode = $$ && ($0$1 = $$.mode) !== void 0 ? $0$1 : "cluster";
    this.name = $$ && ($0$1 = $$.name) !== void 0 ? $0$1 : "worker";
    this.restarts = $$ && ($0$1 = $$.restarts) !== void 0 ? $0$1 : 0;
  }
  get manifest() {
    return this.runner.manifest;
  }
  constructor(runner2, options) {
    this[sys$17](options);
    this.options = options;
    this.runner = runner2;
    this.atime = Date.now();
    this.state = "closed";
    this.log = new Logger({prefix: ["%bold%dim", this.name, ": "]});
    this.current = null;
    this.restarts = 0;
  }
  start() {
    var self2 = this;
    if (this.current && this.current[sys$25]) {
      return;
    }
    ;
    let o = this.runner.o;
    console.log("imbapath", o.imbaPath);
    let loader = o.imbaPath ? path2.default.resolve(o.imbaPath, "register.js") : "imba/register.js";
    let path6 = this.manifest.main.source.path;
    let args = {
      windowsHide: true,
      args: o.extras,
      exec: path6,
      execArgv: [
        o.inspect && "--inspect",
        o.sourcemap && "--enable-source-maps",
        "-r",
        loader
      ].filter(function(_0) {
        return _0;
      })
    };
    let env = {
      IMBA_RESTARTS: this.restarts,
      IMBA_SERVE: true,
      IMBA_MANIFEST_PATH: this.manifest.path,
      IMBA_PATH: o.imbaPath
    };
    this.log.info("starting");
    if (o.execMode == "fork") {
      args.env = Object.assign({}, process.env, env);
      return child_process.default.fork(path2.default.resolve(path6), args.args, args);
    }
    ;
    cluster.setupMaster(args);
    let worker2 = cluster.fork(env);
    worker2.nr = this.restarts++;
    let prev = worker2[sys$33] = this.current;
    if (prev) {
      this.log.info("reloading");
      prev[sys$25] = worker2;
    }
    ;
    worker2.on("exit", function(code, signal) {
      if (signal) {
        return self2.log.info("killed by signal: %d", signal);
      } else if (code != 0) {
        return self2.log.error("exited with error code: %red", code);
      } else if (!worker2[sys$25]) {
        return self2.log.info("exited");
      }
      ;
    });
    worker2.on("listening", function(address) {
      var _a;
      self2.log.success("listening on %address", address);
      return (_a = prev == null ? void 0 : prev.send) == null ? void 0 : _a.call(prev, ["emit", "reloaded"]);
    });
    worker2.on("error", function() {
      return self2.log.info("%red", "errorerd");
    });
    worker2.on("message", function(message2, handle) {
      if (message2 == "reload") {
        console.log("RELOAD MESSAGE");
        return self2.reload();
      }
      ;
    });
    return this.current = worker2;
  }
  reload() {
    this.start();
    return this;
  }
};
var Runner = class extends component_default {
  constructor(manifest3, options) {
    super();
    this.o = options;
    this.manifest = manifest3;
    this.workers = new Set();
  }
  start() {
    let max = this.o.instances || 1;
    let nr = 1;
    let args = {
      windowsHide: true,
      args: this.o.extras,
      execArgv: [
        this.o.inspect && "--inspect",
        this.o.sourcemap && "--enable-source-maps"
      ].filter(function(_0) {
        return _0;
      })
    };
    let name = this.o.name || path2.default.basename(this.manifest.main.source.path);
    while (nr <= max) {
      let opts = {
        number: nr,
        name: max > 1 ? "" + name + " " + nr + "/" + max : name
      };
      this.workers.add(new Instance(this, opts));
      nr++;
    }
    ;
    for (let worker2 of iter$7(this.workers)) {
      worker2.start();
    }
    ;
    return this;
  }
  reload() {
    for (let worker2 of iter$7(this.workers)) {
      worker2.reload();
    }
    ;
    return this;
  }
};
var runner_default = Runner;

// src/bundler/bundle.imba
var esbuild2 = __toModule(require("esbuild"));
var util = __toModule(require("util"));
var utils5 = __toModule(require_utils4());

// src/imba/utils.imba
function iter$8(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : [];
}
var sys$18 = Symbol.for("#type");
var sys$182 = Symbol.for("#__listeners__");
function serializeData(data) {
  let sym = Symbol();
  let refs2 = {};
  let nr = 0;
  let replacer = function(key, value) {
    if (value && value[sys$18]) {
      let ref = value[sym] || (value[sym] = "$$" + nr++ + "$$");
      refs2[ref] = value;
      return key == ref ? value : ref;
    }
    ;
    return value;
  };
  let json = JSON.stringify(data, replacer, 2);
  json = JSON.stringify(Object.assign({$$: refs2}, JSON.parse(json)), replacer, 2);
  return json;
}
function deserializeData(data, reviver = null) {
  var $0$1;
  let objects = {};
  let reg = /\$\$\d+\$\$/;
  let parser = function(key, value) {
    if (typeof value == "string") {
      if (value[0] == "$" && reg.test(value)) {
        return objects[value] || (objects[value] = reviver ? reviver(value) : {});
      }
      ;
    }
    ;
    return value;
  };
  let parsed = JSON.parse(data, parser);
  if (parsed.$$) {
    for (let sys$43 = parsed.$$, sys$29 = 0, sys$36 = Object.keys(sys$43), sys$53 = sys$36.length, k, v, obj; sys$29 < sys$53; sys$29++) {
      k = sys$36[sys$29];
      v = sys$43[k];
      if (obj = objects[k]) {
        Object.assign(obj, v);
      }
      ;
    }
    ;
    $0$1 = parsed.$$, delete parsed.$$, $0$1;
  }
  ;
  return parsed;
}
function patchManifest(prev, curr) {
  var $0$3, $0$2, $0$4, $0$5;
  let origs = {};
  let diff = {
    added: [],
    changed: [],
    removed: [],
    all: [],
    urls: {}
  };
  if (prev.assets) {
    for (let sys$63 = 0, sys$72 = iter$8(prev.assets), sys$82 = sys$72.length; sys$63 < sys$82; sys$63++) {
      let item = sys$72[sys$63];
      let ref = item.originalPath || item.path;
      origs[ref] = item;
      if (item.url) {
        ($0$3 = curr.urls)[$0$2 = item.url] || ($0$3[$0$2] = item);
      }
      ;
    }
    ;
  }
  ;
  for (let sys$92 = 0, sys$103 = iter$8(curr.assets || []), sys$114 = sys$103.length; sys$92 < sys$114; sys$92++) {
    let item = sys$103[sys$92];
    let ref = item.originalPath || item.path;
    let orig = origs[ref];
    if (item.url && prev.urls) {
      prev.urls[item.url] = item;
    }
    ;
    if (orig) {
      if (orig.hash != item.hash) {
        orig.invalidated = Date.now();
        orig.replacedBy = item;
        item.replaces = orig;
        diff.changed.push(item);
        diff.all.push(item);
        if (orig == prev.main) {
          diff.main = item;
        }
        ;
      }
      ;
      $0$4 = origs[ref], delete origs[ref], $0$4;
    } else {
      diff.added.push(item);
      diff.all.push(item);
    }
    ;
  }
  ;
  for (let sys$123 = 0, sys$133 = Object.keys(origs), sys$143 = sys$133.length, path6, item; sys$123 < sys$143; sys$123++) {
    path6 = sys$133[sys$123];
    item = origs[path6];
    item.removed = Date.now();
    diff.all.push(item);
  }
  ;
  for (let sys$152 = 0, sys$162 = iter$8(diff.all), sys$172 = sys$162.length; sys$152 < sys$172; sys$152++) {
    let item = sys$162[sys$152];
    let typ = diff[$0$5 = item.type] || (diff[$0$5] = []);
    typ.push(item);
  }
  ;
  diff.removed = Object.values(origs);
  curr.changes = diff;
  return curr;
}

// src/imba/manifest.imba
var events2 = __toModule(require("events"));
var fs3 = __toModule(require("fs"));
var path3 = __toModule(require("path"));
var sys$19 = Symbol.for("#refresh");
var sys$26 = Symbol.for("#manifest");
var sys$34 = Symbol.for("#abspath");
var sys$42 = Symbol.for("#raw");
var sys$52 = Symbol.for("#watch");
var Asset = class {
  constructor(manifest3) {
    this[sys$26] = manifest3;
  }
  get abspath() {
    return this[sys$34] || (this[sys$34] = this[sys$26].resolve(this));
  }
  readSync() {
    return fs3.default.readFileSync(this.abspath, "utf-8");
  }
  toString() {
    console.log("asset toString", this.url);
    return this.url;
  }
};
var AssetReference = class {
  constructor(manifest3, path6) {
    this.manifest = manifest3;
    this.path = path6;
  }
  get web() {
    try {
      return this.manifest.inputs.web[this.path];
    } catch (e) {
    }
    ;
  }
  get js() {
    var _a;
    return (_a = this.web) == null ? void 0 : _a.js;
  }
  get css() {
    var _a;
    return (_a = this.web) == null ? void 0 : _a.css;
  }
};
var Manifest = class extends events2.EventEmitter {
  constructor(options = {}) {
    var self2;
    super();
    self2 = this;
    this.options = options;
    this.path = options.path;
    this.dir = this.path && path3.default.dirname(this.path);
    this.refs = {};
    this.reviver = function(key) {
      return new Asset(self2);
    };
    this.init(options.data);
  }
  assetReference(path6, ...rest) {
    var $0$1;
    if (typeof path6 != "string") {
      return path6;
    }
    ;
    return ($0$1 = this.refs)[path6] || ($0$1[path6] = new AssetReference(this, path6));
  }
  get assetsDir() {
    return this.data.assetsDir;
  }
  get assetsUrl() {
    return this.data.assetsUrl;
  }
  get changes() {
    return this.data.changes || {};
  }
  get inputs() {
    return this.data.inputs;
  }
  get urls() {
    return this.data.urls || {};
  }
  get main() {
    return this.data.main;
  }
  get cwd() {
    return process.cwd();
  }
  resolve(path6) {
    if (path6._ == "input") {
      return path3.default.resolve(this.cwd, path6.path);
    } else if (path6._ == "output") {
      return path3.default.resolve(this.dir, path6.path);
    } else {
      return path3.default.resolve(this.cwd, path6.path || path6);
    }
    ;
  }
  read(path6) {
    return fs3.default.readFileSync(this.resolve(path6), "utf-8");
  }
  loadFromFile(path6) {
    return fs3.default.readFileSync(path6, "utf-8");
  }
  init(data = null) {
    if (data || this.path) {
      this.update(data);
    }
    ;
    return this;
  }
  update(raw) {
    if (raw == null) {
      if (this.path) {
        raw = this.loadFromFile(this.path);
      } else {
        console.warn("cannot update manifest without path");
      }
      ;
    }
    ;
    if (typeof raw == "string") {
      let str = raw;
      raw = deserializeData(raw, this.reviver);
      raw[sys$42] = str;
    }
    ;
    this.data = patchManifest(this.data || {}, raw);
    if (this.data.changes.all.length) {
      this.emit("change", this.diff, this);
    }
    ;
    if (this.data.changes.main) {
      this.emit("change:main", this.data.main, this);
    }
    ;
    return this.data.changes;
  }
  serializeForBrowser() {
    return this.data[sys$42];
  }
  [sys$19](data) {
    return true;
  }
  watch() {
    var self2 = this;
    if (this[sys$52] != true ? (this[sys$52] = true, true) : false) {
      return this.path && fs3.default.watch(this.path, function(ev, name) {
        console.log("watch manifest!", ev, self2.path);
        let exists = fs3.default.existsSync(self2.path);
        let stat = exists && fs3.default.statSync(self2.path);
        if (exists) {
          self2.update();
        }
        ;
        return;
      });
    }
    ;
  }
  on(event, cb) {
    this.watch();
    return super.on(...arguments);
  }
};
var defaultPath = globalThis.IMBA_MANIFEST_PATH || (globalThis.IMBA_ENTRYPOINT ? globalThis.IMBA_ENTRYPOINT + ".manifest" : null);
var manifest = new Manifest({path: defaultPath});
globalThis[sys$26] = manifest;

// src/bundler/bundle.imba
var os3 = __toModule(require("os"));
var path4 = __toModule(require("path"));

// src/compiler/sourcemapper.imba
var SourceMapper = class {
  static strip(input) {
    return input.replace(/\/\*\%([\w\|]*)\$\*\//g, "");
  }
  static run(input, o = {}) {
    let output = input.replace(/\/\*\%([\w\|]*)\$\*\//g, "");
    return {
      code: output,
      map: null,
      toString: function() {
        return this.code;
      }
    };
  }
};

// src/bundler/watcher.imba
var chokidar3 = __toModule(require("chokidar"));
function iter$9(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : [];
}
var sys$110 = Symbol.for("#watcher");
var FLAGS2 = {
  CHANGE: 1,
  ADD: 2,
  UNLINK: 4
};
var Watcher = class extends component_default {
  constructor(fs5) {
    super();
    this.fs = fs5;
    this.history = new changes_default({withFlags: true});
    this.events = [];
    this.map = {};
    this.map[fs5.cwd] = 1;
  }
  get instance() {
    var self2 = this;
    if (this[sys$110]) {
      return this[sys$110];
    }
    ;
    let initial = Object.keys(this.map);
    this[sys$110] = chokidar3.default.watch(initial, {
      ignoreInitial: true,
      depth: 1,
      ignored: this.isIgnored.bind(this),
      cwd: this.fs.cwd
    });
    this[sys$110].on("change", function(src, stats) {
      self2.history.mark(src, FLAGS2.CHANGE);
      self2.emit("change", src);
      return self2.emit("touch", src);
    });
    this[sys$110].on("unlink", function(src, stats) {
      self2.history.mark(src, FLAGS2.UNLINK);
      self2.emit("unlink", src);
      return self2.emit("touch", src);
    });
    this[sys$110].on("add", function(src, stats) {
      console.log("add", src);
      self2.history.mark(src, FLAGS2.ADD);
      self2.emit("add", src);
      return self2.emit("touch", src);
    });
    return this[sys$110];
  }
  isIgnored(path6) {
    if (path6.match(/(\/\.(git|cache)\/|\.DS_Store)/)) {
      return true;
    }
    ;
    return false;
  }
  add(...paths) {
    let uniq = [];
    for (let sys$29 = 0, sys$36 = iter$9(paths), sys$43 = sys$36.length; sys$29 < sys$43; sys$29++) {
      let path6 = sys$36[sys$29];
      if (!this.map[path6]) {
        this.map[path6] = true;
        uniq.push(path6);
      }
      ;
    }
    ;
    if (this[sys$110] && uniq.length) {
      this[sys$110].add(...uniq);
    }
    ;
    return this;
  }
  has(path6) {
    return !!this.map[path6];
  }
  sync(target) {
    return this.history.pull(target);
  }
  start() {
    this.instance;
    return this;
  }
};
var watcher_default = Watcher;

// src/bundler/bundle.imba
function iter$10(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : [];
}
var sys$111 = Symbol.for("#key");
var sys$27 = Symbol.for("#bundles");
var sys$35 = Symbol.for("#watchedPaths");
var sys$102 = Symbol.for("#prev");
var sys$112 = Symbol.for("#watching");
var sys$122 = Symbol.for("#rebuildTimeout");
var sys$272 = Symbol.for("#hash");
var sys$30 = Symbol.for("#contents");
var sys$37 = Symbol.for("#file");
var sys$38 = Symbol.for("#output");
var sys$422 = Symbol.for("#type");
var sys$56 = Symbol.for("#ordered");
var sys$61 = Symbol.for("#resolved");
var sys$62 = Symbol.for("#text");
var ASSETS_URL = "/__assets__/";
var Bundle = class extends component_default {
  get isNode() {
    return this.platform == "node";
  }
  get isWeb() {
    return !this.isNode;
  }
  get isMain() {
    return this.options.isMain;
  }
  get outdir() {
    return this.options.outdir || this.fs.cwd;
  }
  get fs() {
    return this.program.fs;
  }
  get o() {
    return this.options;
  }
  get config() {
    return this.o.config || this.parent.config;
  }
  get program() {
    return this.bundler.program;
  }
  constructor(bundler, o) {
    var $0$1, $0$2, $0$4, $0$3;
    super();
    this[sys$111] = Symbol();
    this[sys$27] = {};
    this[sys$35] = {};
    this.bundler = bundler;
    this.styles = {};
    this.options = o;
    this.id = this.options.id;
    this.result = null;
    this.built = false;
    this.meta = {};
    this.name = this.options.name;
    this.cwd = this.fs.cwd;
    this.parent = o.parent;
    this.platform = o.platform || "browser";
    this.entryPoints = o.entryPoints;
    this.pathLookups = {};
    this.children = new Set();
    this.presult = {};
    if (this.parent) {
      this.watcher = this.parent.watcher;
    }
    ;
    if (o.watch || o.watcher) {
      this.watcher || (this.watcher = o.watcher || new watcher_default(this.fs));
    }
    ;
    let externals = [];
    let package2 = bundler.package || {};
    for (let sys$43 = 0, sys$53 = iter$10(o.external), sys$92 = sys$53.length; sys$43 < sys$92; sys$43++) {
      let ext = sys$53[sys$43];
      if (ext == "dependencies") {
        let deps = Object.keys(package2.dependencies || {});
        if (o.execOnly) {
          deps.push(...Object.keys(package2.devDependencies || {}));
        }
        ;
        for (let sys$63 = 0, sys$72 = iter$10(deps), sys$82 = sys$72.length; sys$63 < sys$82; sys$63++) {
          let dep = sys$72[sys$63];
          if (o.external.indexOf("!" + dep) < 0) {
            externals.push(dep);
          }
          ;
        }
        ;
      }
      ;
      if (ext == ".json") {
        externals.push("*.json");
      }
      ;
      externals.push(ext);
    }
    ;
    this.esoptions = {
      entryPoints: this.entryPoints,
      bundle: o.bundle === false ? false : true,
      define: o.define,
      platform: o.platform == "node" ? "node" : "browser",
      format: o.format || "esm",
      outfile: o.outfile,
      outbase: o.outbase || this.fs.cwd,
      outdir: o.outfile ? void 0 : this.fs.cwd,
      outExtension: {
        ".js": ".__dist__.js",
        ".css": ".__dist__.css"
      },
      globalName: o.globalName,
      publicPath: o.publicPath || ASSETS_URL,
      banner: o.banner || "//BANNER",
      footer: o.footer,
      splitting: o.splitting,
      sourcemap: o.sourcemap,
      minify: o.minify,
      incremental: !!this.watcher,
      loader: o.loader || {
        ".png": "file",
        ".svg": "file",
        ".woff2": "file",
        ".woff": "file",
        ".ttf": "file",
        ".otf": "file"
      },
      write: false,
      metafile: "metafile.json",
      external: externals,
      tsconfig: o.tsconfig,
      plugins: (o.plugins || []).concat({name: "imba", setup: this.plugin.bind(this)}),
      pure: o.pure,
      treeShaking: o.treeShaking,
      resolveExtensions: [
        ".imba.mjs",
        ".imba",
        ".imba1.mjs",
        ".imba1",
        ".ts",
        ".mjs",
        ".cjs",
        ".js"
      ]
    };
    this.imbaoptions = {
      platform: o.platform,
      imbaPath: o.imbaPath,
      css: "external"
    };
    if (this.esoptions.platform == "browser") {
      this.esoptions.resolveExtensions.unshift(".web.imba", ".web.js");
    } else {
      this.esoptions.resolveExtensions.unshift(".node.imba", ".node.js");
    }
    ;
    if (!this.isNode && false) {
      let defines = ($0$1 = this.esoptions).define || ($0$1.define = {});
      let env = o.env || process.env.NODE_ENV || "production";
      defines[$0$2 = "process.env.NODE_ENV"] || (defines[$0$2] = "'" + env + "'");
      defines.ENV_DEBUG || (defines.ENV_DEBUG = "false");
    }
    ;
    if (o.bundle == false) {
      this.esoptions.bundle = false;
      $0$3 = this.esoptions.external, delete this.esoptions.external, $0$3;
    }
    ;
    if (o.splitting && this.esoptions.format != "esm") {
      this.esoptions.format = "esm";
    }
    ;
    if (this.isMain) {
      this.manifest = new Manifest({data: {}, path: path4.default.resolve(o.outdir, ".imbabuild")});
      if (this.isNode) {
        this.esoptions.banner = "globalThis.IMBA_MANIFEST_PATH = '" + this.manifest.path + "';";
      }
      ;
      this.spinner = this.log.spinner();
    }
    ;
  }
  setup() {
    return this;
  }
  watchPath(path6) {
    if (!this[sys$35][path6]) {
      this[sys$35][path6] = 1;
      if (this.parent) {
        this.parent.watchPath(path6);
      } else if (this.watcher && path6.indexOf(":") == -1) {
        this.watcher.add(path6.slice(0, path6.lastIndexOf("/")));
      }
      ;
    }
    ;
    return this;
  }
  plugin(build2) {
    var self2 = this;
    let externs = this.esoptions.external || [];
    let imbaDir = this.program.imbaPath;
    let isCSS = function(f) {
      return /^styles:/.test(f) || /\.css$/.test(f);
    };
    const namespaceMap = {
      svg: "asset",
      link: "web",
      script: "web",
      style: "web"
    };
    let toLoadResult = function(object, compilation) {
      if (compilation.errors) {
        return console.log("converting errors");
      }
      ;
    };
    build2.onResolve({filter: /^\//}, function(args) {
      console.log("abs resolving absolute path", args, {path: args.path, external: true});
      return {path: args.path, external: true};
      if (isCSS(args.importer)) {
        return {path: args.path, external: true};
      }
      ;
    });
    build2.onResolve({filter: /^imba(\/|$)/}, function(args) {
      if (args.path == "imba") {
        let sub = "index.imba";
        if (self2.isNode) {
          sub = "dist/node/imba.js";
          return {path: "imba", external: true};
          return {path: path4.default.resolve(imbaDir, sub), external: true};
        }
        ;
        return {path: path4.default.resolve(imbaDir, sub)};
      }
      ;
      self2.log.debug("IMBA RESOLVE", args.path, args.importer);
      if (args.path.match(/^imba\/(program|compiler|dist|runtime|src\/)/)) {
        return null;
      }
      ;
      let real = "" + imbaDir + "/src/" + args.path + ".imba";
      return {path: real};
    });
    build2.onResolve({filter: /\?([\w\-]+)$/}, function(args) {
      let res = self2.program.resolver.resolve(args, self2.pathLookups);
      let ns = res.namespace = namespaceMap[res.namespace] || res.namespace;
      console.log("onResolve asset", res);
      if (ns == "serviceworker") {
        res.namespace = "entry";
        res.path = "" + ns + ":" + res.path;
      }
      ;
      return res;
    });
    build2.onResolve({filter: /^(serviceworker|worker)\:/}, function(args) {
      let res = self2.program.resolver.resolve(args, self2.pathLookups);
      res.path = "" + res.namespace + ":" + res.path;
      res.namespace = "entry";
      return res;
    });
    build2.onResolve({filter: /^styles:/}, function({path: path6}) {
      return {path: path6.slice(7), namespace: "styles"};
    });
    build2.onResolve({filter: /^[\w\@]/}, function(args) {
      if (externs.indexOf(args.path) >= 0) {
        return {external: true};
      }
      ;
      if (args.importer.indexOf(".imba") > 0) {
        return self2.program.resolver.resolve(args, self2.pathLookups);
      }
      ;
    });
    build2.onLoad({filter: /.*/, namespace: "asset-svg"}, async function({path: path6}) {
      let file = self2.fs.lookup(path6);
      let out = await file.compile({format: "esm"}, self2);
      return {loader: "js", contents: out.js};
    });
    build2.onLoad({filter: /.*/, namespace: "asset-web"}, function({path: path6, namespace}) {
      let body = 'export default {input:"asset-web:$"}'.replace("$", path6);
      return {loader: "js", contents: body};
    });
    build2.onLoad({filter: /.*/, namespace: "asset-worker"}, async function(args) {
      var $0$5;
      let id = "asset-worker:" + args.path;
      let opts = {
        platform: "worker",
        format: "esm",
        entryPoints: [args.path],
        outdir: self2.o.outdir,
        minify: self2.o.minify,
        parent: self2
      };
      if (self2.config.defaults.worker) {
        opts = Object.assign({}, self2.config.defaults.worker, opts);
      }
      ;
      let bundler = ($0$5 = self2[sys$27])[id] || ($0$5[id] = new Bundle(self2.program, opts));
      let bundle2 = await bundler.rebuild();
      self2.presult[id] = bundle2.meta;
      let input = bundle2.meta.inputs[args.path];
      let data = {
        input: id
      };
      if (self2.isWeb) {
        data.url = input.js.url;
        data.hash = input.js.hash;
      }
      ;
      let body = "export default " + JSON.stringify(data);
      return {loader: "js", contents: body};
    });
    build2.onLoad({filter: /.*/, namespace: "asset"}, async function({path: path6}) {
      let file = self2.fs.lookup(path6);
      let out = await file.compile({format: "esm"}, self2);
      return {loader: "js", contents: out.js};
    });
    build2.onLoad({filter: /.*/, namespace: "script"}, function(args) {
      return {loader: "text", contents: args.path};
    });
    build2.onLoad({filter: /.*/, namespace: "web"}, function(args) {
      let body = 'export default "$"'.replace("$", args.path);
      return {loader: "js", contents: body};
    });
    build2.onLoad({filter: /.*/, namespace: "worker"}, async function(args) {
      var $0$6;
      let src = "worker:" + args.path;
      self2.log.debug("onLoad worker", args.path, src);
      let opts = {
        platform: "worker",
        splitting: false,
        format: "esm",
        entryPoints: [args.path],
        outdir: self2.options.outdir,
        minify: self2.o.minify,
        parent: self2
      };
      let bundler = ($0$6 = self2[sys$27])[src] || ($0$6[src] = new Bundle(self2.program, opts));
      let bundle2 = await bundler.rebuild();
      self2.presult[src] = bundle2.meta;
      let input = bundle2.meta.inputs[args.path];
      return {loader: "text", contents: input.js.url};
    });
    build2.onLoad({filter: /^(serviceworker)\:.*/, namespace: "entry"}, async function(args) {
      var $0$8, $0$7;
      let parts = args.path.split(":");
      let path6 = parts.pop();
      let type = parts.shift();
      let opts = {
        entryPoints: [path6],
        outdir: self2.options.outdir,
        sourcemap: self2.o.sourcemap && true,
        parent: self2
      };
      if (self2.config.defaults[type]) {
        opts = Object.assign({}, self2.config.defaults[type], opts);
      }
      ;
      let bundler = ($0$8 = self2[sys$27])[$0$7 = args.path] || ($0$8[$0$7] = new Bundle(self2.program, opts));
      let bundle2 = await bundler.rebuild();
      self2.presult["entry:" + args.path] = bundle2.meta;
      let input = bundle2.meta.inputs[path6];
      return {loader: "text", contents: input.js.url};
    });
    return build2.onLoad({filter: /\.imba1?$/}, async function({path: path6, namespace}) {
      var $0$9;
      let src = self2.fs.lookup(path6);
      let res = await src.compile(self2.imbaoptions, self2);
      let cached = res[$0$9 = self2[sys$111]] || (res[$0$9] = {
        file: {
          loader: "js",
          contents: SourceMapper.strip(res.js || ""),
          errors: res.errors.map(function(_0) {
            return utils5.diagnosticToESB(_0, {file: src.abs, namespace});
          }),
          warnings: res.warnings.map(function(_0) {
            return utils5.diagnosticToESB(_0, {file: src.abs, namespace});
          })
        },
        styles: {
          loader: "css",
          contents: SourceMapper.strip(res.css || ""),
          resolveDir: src.absdir
        }
      });
      return cached[namespace];
    });
  }
  async build(force = false) {
    var self2 = this;
    if ((this.built != true ? (this.built = true, true) : false) || force) {
      this.esb = await esbuild2.startService();
      this.workers = await startWorkers();
      let t = Date.now();
      try {
        this.presult = {[sys$102]: this.presult};
        this.result = await this.esb.build(this.esoptions);
      } catch (e) {
        this.result = e;
      }
      ;
      await this.transform(this.result);
      if (this.isMain) {
        await this.write(this.result);
      }
      ;
      if (!this.o.watch) {
        this.esb.stop();
        this.esb = null;
        this.workers.stop();
        this.workers = null;
      }
      ;
      if (this.watcher && this.isMain && (this[sys$112] != true ? (this[sys$112] = true, true) : false)) {
        this.watcher.start();
        this.watcher.on("touch", function() {
          clearTimeout(self2[sys$122]);
          return self2[sys$122] = setTimeout(function() {
            clearTimeout(self2[sys$122]);
            return self2.rebuild({watcher: self2.watcher});
          }, 100);
        });
      }
      ;
    }
    ;
    return this.result;
  }
  async rebuild({force = false} = {}) {
    if (!(this.built && this.esb && this.result && this.result.rebuild instanceof Function)) {
      return this.build(true);
    }
    ;
    if (this.watcher && !force) {
      let changes3 = this.watcher.sync(this);
      let dirty = false;
      for (let sys$133 = 0, sys$143 = iter$10(changes3), sys$152 = sys$143.length; sys$133 < sys$152; sys$133++) {
        let [path6, flags] = sys$143[sys$133];
        if (this[sys$35][path6] || flags != 1) {
          dirty = true;
        }
        ;
      }
      ;
      console.log("watching - rebuild?", dirty);
      if (!dirty) {
        return this.result;
      }
      ;
    }
    ;
    let t = Date.now();
    let prev = this.result;
    try {
      this.presult = {[sys$102]: this.presult};
      let rebuilt = await this.result.rebuild();
      this.result = rebuilt;
    } catch (e) {
      this.result = e;
    }
    ;
    await this.transform(this.result, prev);
    if (this.isMain) {
      await this.write(this.result, prev);
      if (this.result.errors) {
        this.log.error("failed rebuilding in %ms", Date.now() - t);
      } else {
        this.log.info("finished rebuilding in %ms", Date.now() - t);
      }
      ;
    }
    ;
    return this.result;
  }
  async write(result) {
    var $0$10, $0$11;
    let meta = result.meta;
    let ins = meta.inputs;
    let outs = meta.outputs;
    let urls = meta.urls;
    if (meta.errors) {
      return;
    }
    ;
    let manifest3 = result.manifest = {
      assetsUrl: ASSETS_URL,
      path: this.manifest.path,
      inputs: {
        node: ins,
        web: {},
        worker: {}
      },
      outputs: outs,
      urls
    };
    let main = manifest3.main = ins[this.entryPoints[0]].js;
    manifest3.outdir = this.o.tmpdir || this.o.outdir;
    let writeFiles = {};
    let webEntries = [];
    for (let sys$162 = 0, sys$172 = Object.keys(ins), sys$183 = sys$172.length, path6, input; sys$162 < sys$183; sys$162++) {
      path6 = sys$172[sys$162];
      input = ins[path6];
      if (path6.indexOf("web:") == 0) {
        webEntries.push(path6.slice(4));
      } else if (path6.indexOf("asset-web:") == 0) {
        webEntries.push(path6.slice(10));
        webEntries[path6.slice(10)] = input;
      }
      ;
    }
    ;
    if (webEntries.length) {
      let opts = {
        platform: "browser",
        splitting: true,
        entryPoints: webEntries,
        outdir: this.o.outdir,
        minify: this.o.minify,
        sourcemap: this.o.sourcemap && true,
        parent: this
      };
      let bundler = ($0$10 = this[sys$27]).web || ($0$10.web = new Bundle(this.program, opts));
      let bundle2 = await bundler.rebuild();
      manifest3.inputs.web = bundle2.meta.inputs;
      for (let sys$21 = bundle2.meta.inputs, sys$192 = 0, sys$20 = Object.keys(sys$21), sys$222 = sys$20.length, k, v; sys$192 < sys$222; sys$192++) {
        k = sys$20[sys$192];
        v = sys$21[k];
        if (webEntries[k]) {
          webEntries[k].asset = v.js;
        }
        ;
      }
      ;
      for (let sys$252 = bundle2.meta.outputs, sys$232 = 0, sys$242 = Object.keys(sys$252), sys$262 = sys$242.length, k, v; sys$232 < sys$262; sys$232++) {
        k = sys$242[sys$232];
        v = sys$252[k];
        outs[k] = v;
        if (v.url) {
          urls[v.url] = v;
        }
        ;
      }
      ;
    }
    ;
    manifest3.assets = Object.values(manifest3.outputs);
    manifest3.hash = utils5.createHash(Object.values(outs).map(function(_0) {
      return _0.hash || _0.path;
    }).sort().join("-"));
    if (this[sys$272] != ($0$11 = manifest3.hash) ? (this[sys$272] = $0$11, true) : false) {
      let json = serializeData(manifest3);
      for (let sys$282 = 0, sys$29 = iter$10(manifest3.assets), sys$31 = sys$29.length; sys$282 < sys$31; sys$282++) {
        let asset = sys$29[sys$282];
        let path6 = path4.default.resolve(this.o.outdir, asset.path);
        let file = this.fs.lookup(path6);
        await file.write(asset[sys$30], asset.hash);
      }
      ;
      if (manifest3.path) {
        let mfile = this.fs.lookup(manifest3.path);
        await mfile.writeSync(json, manifest3.hash);
      }
      ;
      this.manifest.update(json);
    }
    ;
    try {
      this.log.debug(main.path, main.hash);
    } catch (e) {
    }
    ;
    return result;
  }
  async transform(result, prev) {
    var self2 = this;
    let t = Date.now();
    if (result instanceof Error) {
      console.log("result is error!!", result);
      for (let sys$322 = 0, sys$332 = iter$10(result.errors), sys$342 = sys$332.length; sys$322 < sys$342; sys$322++) {
        let err = sys$332[sys$322];
        this.watchPath(err.location.file);
      }
      ;
      result.rebuild = prev && prev.rebuild.bind(prev);
      result.meta = {
        inputs: {},
        outputs: {},
        urls: {},
        errors: result.errors,
        warnings: result.warnings
      };
      return result;
    }
    ;
    let files = result.outputFiles || [];
    let metafile = utils5.pluck(files, function(_0) {
      return _0.path.indexOf(self2.esoptions.metafile) >= 0;
    });
    let meta = JSON.parse(metafile.text);
    meta = result.meta = {
      inputs: meta.inputs,
      outputs: meta.outputs,
      urls: {}
    };
    let ins = meta.inputs;
    let outs = meta.outputs;
    let urls = meta.urls;
    let reloutdir = path4.default.relative(this.fs.cwd, this.esoptions.outdir);
    for (let sys$352 = 0, sys$36 = iter$10(files), sys$39 = sys$36.length; sys$352 < sys$39; sys$352++) {
      let file = sys$36[sys$352];
      let path6 = path4.default.relative(this.fs.cwd, file.path);
      if (outs[path6]) {
        outs[path6][sys$37] = file;
        outs[path6][sys$30] = file.contents;
        file[sys$38] = outs[path6];
      } else {
        console.log("could not map the file to anything!!", file.path, path6, reloutdir);
      }
      ;
    }
    ;
    let tests = {
      js: ".__dist__.js",
      css: ".__dist__.css",
      map: ".__dist__.js.map"
    };
    for (let sys$40 = 0, sys$41 = Object.keys(ins), sys$46 = sys$41.length, path6, input; sys$40 < sys$46; sys$40++) {
      path6 = sys$41[sys$40];
      input = ins[path6];
      input[sys$422] = input._ = "input";
      input.path = path6;
      input.imports = input.imports.map(function(_0) {
        return ins[_0.path];
      });
      this.watchPath(path6);
      let outname = path6.replace(/\.(imba1?|[cm]?jsx?|tsx?)$/, "");
      let jsout;
      for (let sys$43 = 0, sys$44 = Object.keys(tests), sys$45 = sys$44.length, key, ext; sys$43 < sys$45; sys$43++) {
        key = sys$44[sys$43];
        ext = tests[key];
        let name = outname + ext;
        if (reloutdir) {
          name = "" + reloutdir + "/" + name;
        }
        ;
        if (outs[name]) {
          input[key] = outs[name];
          outs[name].source = input;
          if (key == "js") {
            jsout = outs[name];
          } else if (jsout) {
            jsout[key] = outs[name];
          }
          ;
        }
        ;
      }
      ;
    }
    ;
    let urlOutputMap = {};
    let walker = {};
    walker.collectCSSInputs = function(input, matched = [], visited = []) {
      if (visited.indexOf(input) >= 0) {
        return matched;
      }
      ;
      visited.push(input);
      if (input.path.match(/(^styles:)|(\.css$)/)) {
        matched.push(input);
      }
      ;
      for (let sys$47 = 0, sys$48 = iter$10(input.imports), sys$49 = sys$48.length; sys$47 < sys$49; sys$47++) {
        let item = sys$48[sys$47];
        walker.collectCSSInputs(item, matched, visited);
      }
      ;
      return matched;
    };
    for (let sys$50 = 0, sys$51 = Object.keys(outs), sys$60 = sys$51.length, path6, output, m; sys$50 < sys$60; sys$50++) {
      path6 = sys$51[sys$50];
      output = outs[path6];
      output[sys$422] = output._ = "output";
      output.path = path6;
      output.type = (path4.default.extname(path6) || "").slice(1);
      if (this.isWeb || output.type == "css") {
        output.path = "public/__assets__/" + path6;
        output.url = "/__assets__/" + path6;
      }
      ;
      let inputs = [];
      for (let sys$54 = output.inputs, sys$522 = 0, sys$53 = Object.keys(sys$54), sys$55 = sys$53.length, src, m2; sys$522 < sys$55; sys$522++) {
        src = sys$53[sys$522];
        m2 = sys$54[src];
        inputs.push([ins[src], m2.bytesInOutput]);
      }
      ;
      output.inputs = inputs;
      if (output.type == "css" && !output[sys$56]) {
        let origPaths = inputs.map(function(_0) {
          return _0[0].path;
        });
        let corrPaths = [];
        if (output.source) {
          walker.collectCSSInputs(output.source, corrPaths);
        }
        ;
        let offset = 0;
        let body = output[sys$37].text;
        let chunks = [];
        for (let sys$57 = 0, sys$58 = iter$10(inputs), sys$59 = sys$58.length; sys$57 < sys$59; sys$57++) {
          let [input, bytes] = sys$58[sys$57];
          let header = "/* " + input.path + " */\n";
          if (!this.o.minify) {
            offset += header.length;
          }
          ;
          let chunk = header + body.substr(offset, bytes) + "/* chunk:end */";
          let index = corrPaths.indexOf(input);
          offset += bytes;
          if (!this.o.minify) {
            offset += 1;
          }
          ;
          chunks[index] = chunk;
        }
        ;
        let text = chunks.filter(function(_0) {
          return _0;
        }).join("\n");
        output[sys$56] = true;
        output[sys$30] = text;
      }
      ;
      if (output.imports) {
        output.imports = output.imports.map(function(_0) {
          let chunk = _0.path.indexOf("/chunk.");
          if (chunk >= 0) {
            _0.path = reloutdir + _0.path.slice(chunk);
          }
          ;
          return outs[_0.path];
        });
      }
      ;
      if (m = path6.match(/\.([A-Z\d]{8})\.\w+$/)) {
        output.hash = m[1];
      } else if (m = path6.match(/chunk\.([A-Z\d]{8})\.\w+\.(js|css)(\.map)?$/)) {
        output.hash = m[1];
      }
      ;
      if (output.url) {
        urlOutputMap[output.url] = output;
      }
      ;
    }
    ;
    walker.replacePaths = async function(body, output) {
      let array = output[sys$30];
      let length = body.length;
      let start = 0;
      let idx = 0;
      let end = 0;
      let delim;
      let breaks = {"'": 1, '"': 1, "(": 1, ")": 1};
      let path6;
      while (true) {
        start = body.indexOf("/__assets__/", end);
        if (start == -1) {
          break;
        }
        ;
        delim = body[start - 1];
        end = start + 10;
        if (delim == "(") {
          delim = ")";
        }
        ;
        while (body[end] != delim) {
          end++;
        }
        ;
        path6 = body.slice(start, end);
        let asset = urlOutputMap[path6];
        if (asset) {
          await walker.resolveAsset(asset);
          if (asset.url != path6) {
            body = body.slice(0, start) + asset.url + body.slice(end);
          }
          ;
        }
        ;
      }
      ;
      return body;
    };
    walker.resolveAsset = async function(asset) {
      if (asset[sys$61] || asset.hash) {
        return asset;
      }
      ;
      asset[sys$61] = true;
      if (asset.type == "js") {
        asset[sys$62] = asset[sys$37].text;
        asset[sys$30] = await walker.replacePaths(asset[sys$62], asset);
      }
      ;
      if (asset.type == "map") {
        let js = asset.source.js;
        if (js) {
          await walker.resolveAsset(js);
          asset.hash = js.hash;
        }
        ;
      }
      ;
      asset.hash || (asset.hash = utils5.createHash(asset[sys$30]));
      if (true) {
        let sub = self2.o.hashing !== false ? "." + asset.hash + "." : ".";
        asset.originalPath = asset.path;
        if (asset.url) {
          asset.url = asset.url.replace(".__dist__.", sub);
        }
        ;
        asset.path = asset.path.replace(".__dist__.", sub);
        if (asset.type == "js" && asset.map) {
          let orig = path4.default.basename(asset.originalPath) + ".map";
          let replaced = path4.default.basename(asset.path) + ".map";
          asset[sys$30] = asset[sys$30].replace(orig, replaced);
        }
        ;
      }
      ;
      return asset;
    };
    let newouts = {};
    for (let sys$63 = 0, sys$64 = Object.keys(outs), sys$65 = sys$64.length, path6, output; sys$63 < sys$65; sys$63++) {
      path6 = sys$64[sys$63];
      output = outs[path6];
      await walker.resolveAsset(output);
      if (!this.isNode && output.url) {
        urls[output.url] = output;
      }
      ;
      newouts[output.path] = output;
    }
    ;
    console.log(Object.keys(this.presult));
    for (let sys$66 = 0, sys$67 = Object.keys(ins), sys$68 = sys$67.length, path6, input; sys$66 < sys$68; sys$66++) {
      path6 = sys$67[sys$66];
      input = ins[path6];
      if (this.presult[path6]) {
        this.log.debug("Add presult outputs " + path6);
        let real = path6.slice(path6.indexOf(":") + 1);
        let asset = this.presult[path6].inputs[real];
        if (asset && asset.js) {
          input.asset = asset.js;
        }
        ;
        Object.assign(newouts, this.presult[path6].outputs);
      }
      ;
    }
    ;
    outs = meta.outputs = newouts;
    this.log.debug("transformed", Date.now() - t);
    return result;
  }
};
var bundle_default = Bundle;

// src/bin/imba.imba
var utils7 = __toModule(require_utils4());
var tmp = __toModule(require_tmp());
var sys$113 = Symbol.for("#parse");
var sys$28 = Symbol.for("#IMBA_OPTIONS");
var t0 = Date.now();
var fmt = {
  int: function(val) {
    return parseInt(val);
  },
  i: function(val) {
    return val == "max" ? 0 : parseInt(val);
  }
};
var logLevel = {
  debug: "Show everything",
  info: "Show info, warnings & errors",
  warning: "Show warnings & errors",
  error: "Show errors",
  silent: "Show nothing",
  [sys$113]: function(val) {
    if (!this[val]) {
      let msg = "Must be one of " + Object.keys(logLevel).join(",");
      throw new commander.CommanderError(1, "commander.optionArgumentRejected", message);
    }
    ;
    return val;
  }
};
function parseOptions(options, extras = []) {
  if (options.opts instanceof Function) {
    options = options.opts();
  }
  ;
  let cwd = options.cwd || (options.cwd = process.cwd());
  options.imbaPath || (options.imbaPath = path5.default.resolve(__dirname, ".."));
  options.extras = extras;
  let statFiles = [
    __filename,
    path5.default.resolve(__dirname, "..", "dist", "compiler-worker.js"),
    path5.default.resolve(__dirname, "..", "dist", "node", "compiler.js")
  ];
  options.mtime = Math.max(...statFiles.map(function(_0) {
    return fs4.default.statSync(_0).mtimeMs;
  }));
  options.config = utils7.resolveConfig(cwd, options.config || "imbaconfig.json");
  options.package = utils7.resolvePackage(cwd);
  if (options.loglevel && !logLevel[options.loglevel]) {
    console.log("--loglevel must be one of", Object.keys(logLevel));
    process.exit(0);
  }
  ;
  if (options.verbose) {
    options.loglevel || (options.loglevel = "info");
  }
  ;
  if (options.watch || options.dev) {
    options.loglevel || (options.loglevel = "info");
  }
  ;
  if (options.clean) {
    options.mtime = Date.now();
  }
  ;
  options.loglevel || (options.loglevel = "warning");
  options.cachedir = utils7.getCacheDir(options);
  globalThis[sys$28] = options;
  return options;
}
async function build(entry, o) {
  o = parseOptions(o);
  console.log("build with entry?", entry, o);
  let prog = new program_default(o.config, o);
  let params = Object.assign({}, o.config.node, o, {
    entryPoints: [entry],
    isMain: true
  });
  let bundle2 = new bundle_default(prog, params);
  let out = await bundle2.build();
  return console.log("done building!!");
}
async function run(entry, o, extras) {
  var _a;
  let exec;
  o = parseOptions(o, extras);
  let t = Date.now();
  let prog = new program_default(o.config, o);
  let file = prog.fs.lookup(entry);
  let params = Object.assign({}, o.config.node, {
    entryPoints: [entry],
    exports: null,
    include: null,
    minify: o.minify,
    platform: "node",
    watch: o.watch,
    outdir: o.outdir,
    outbase: prog.cwd,
    sourcemap: true,
    hashing: false,
    execOnly: true,
    isMain: true,
    config: o.config,
    imbaPath: o.imbaPath
  });
  tmp.default.setGracefulCleanup();
  if (!params.outdir) {
    let tmpdir = tmp.default.dirSync({unsafeCleanup: true});
    params.outdir = params.tmpdir = tmpdir.name;
  }
  ;
  params.outbase = prog.cwd;
  let bundle2 = new bundle_default(prog, params);
  let out = await bundle2.build();
  if (exec = (_a = out == null ? void 0 : out.manifest) == null ? void 0 : _a.main) {
    if (!o.watch && o.instances == 1) {
      o.execMode = "fork";
    }
    ;
    o.name || (o.name = entry);
    let runner2 = new runner_default(bundle2.manifest, o);
    runner2.start();
    if (o.watch) {
      bundle2.manifest.on("change:main", function() {
        console.log("manifest change:main!!");
        return runner2.reload();
      });
    }
    ;
  }
  ;
  return;
}
var binary = commander.program.storeOptionsAsProperties(false).version("2.0.0").name("imba");
function increaseVerbosity(dummy, prev) {
  return prev + 1;
}
commander.program.command("exec <script>", {isDefault: true}).description("Run stuff").option("-b, --build", "").option("-d, --dev", "Enable development mode").option("-w, --watch", "Continously build and watch project while running").option("-m, --minify", "Minify generated files").option("-i, --instances [count]", "Number of instances to start", fmt.i, 1).option("-v, --verbose", "verbosity (repeat to increase)", increaseVerbosity, 0).option("--name [name]", "Give name to process").option("--outdir <value>", "").option("--loglevel [value]", "Set loglevel info|warning|error|debug|silent").option("--sourcemap <value>", "", "inline").option("--inspect", "Debug stuff").option("--no-sourcemap", "Omit sourcemaps").option("--no-hashing", "Disable hashing").option("--clean", "Disregard previosly cached compilations").action(run);
commander.program.command("build [script]").description("clone a repository into a newly created directory").option("-w, --watch", "Continously build and watch project while running").option("-c, --clean", "Disregard previosly cached compilations").option("-m, --minify", "Minify generated files").option("-v, --verbose", "Verbose logging").option("--outfile <value>", "Disregard previosly cached compilations").option("--platform <platform>", "Disregard previosly cached compilations", "browser").option("--outdir <value>", "").option("--pubdir <value>", "Directory for public items - default to").option("--no-hashing", "Disable hashing").action(build);
binary.parse(process.argv);
