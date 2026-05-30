export function defineStyleNodes(deps) {
  const {
    AST,
    Node,
    ListNode,
    ValueNode,
    LIT,
    C,
    M,
    SourceMapper,
    StyleRule,
    StyleTheme,
    Color,
    colord,
    constants,
    helpers,
    iter$,
    idx$,
    STACK,
    TagDeclaration,
    TagLike,
    ClassBody,
    TagBody,
    TagFlag,
    TagStyleAttr,
  } = deps;

  class StyleNode extends Node {}

  class StyleSelector extends StyleNode {}

  // all weird parts of a selector? Or do we just compile it?

  class StyleRuleSet extends StyleNode {
    constructor(selectors, body) {
      super(...arguments);
      this._placeholders = [];
      this._selectors = selectors;
      this._body = body;
    }

    isStatic() {
      return true;
    }

    isGlobal() {
      return !!this.option("global");
    }

    addPlaceholder(item) {
      this._placeholders.push(item);
      return this;
    }

    cssid() {
      return (
        this._cssid ||
        (this._cssid = "" + STACK.root().sourceId() + "-" + this.tid())
      );
    }

    visit(stack, o) {
      let cmp = (this._tagDeclaration = stack.up(TagDeclaration));

      let tags = stack.parents(TagLike);

      if (tags[0] && cmp && tags[0].isSelf() && tags[1]) {
        tags[0] = cmp;
      }

      if (tags.length == 0 && cmp) {
        tags = [cmp];
      }

      this._css = {};
      this._flag = stack.up(TagFlag);
      this._tag = this._flag && this._flag._tag;

      let keywordName = String(this.option("name") || "");
      if (keywordName[0] == "%") {
        // need to be safely converted to a reference? Can do that later
        this._mixin = this.scope__().mixin(keywordName.slice(1));
        ((this._mixin._rule = this), this._mixin);
        this._mixin._options.id = this.cssid();
      }

      if (this.option("export")) {
        STACK.root().mixinExports().add(this._mixin.name(), this._mixin._options);
      }

      let sel = String(this._selectors).trim();

      if (stack.parent() instanceof ClassBody) {
        // Declaration in a tag declaration
        let owner = stack.up(2);
        if (owner instanceof TagDeclaration) {
          this._css.type = "component";

          if (!this._variable) {
            this._sel = sel || "&";
            this._css.scope = cmp;
          }
        } else {
          throw "css not allowed in class declaration";
        }
      } else if (stack.parent() instanceof TagBody) {
        this._tag = tags[tags.length - 1];
        this._sel = sel || "&";
        this._css.type = "scoped";
        this._css.scope = this._tag;

        // FIX the selector based on the tag
      } else if (this.option("toplevel")) {
        let inbody = stack.up(TagBody);

        if (inbody) {
          // Inside some logical nesting
          this._tag = stack.up(TagLike);
          this._sel = sel || "&";

          this._css.scope = this._tag;
          this._css.ns = this.cssid();
          this._css.id = this.cssid();
          this._css.type = "scoped";
          this._name = this.cssid();
          this.set({ inTagTree: true });
        } else {
          this._css.scope = this.isGlobal() ? null : this.scope__().closure();
          this._sel || (this._sel = sel);
        }
      } else if (o.rule) {
        this._sel ||
          (this._sel =
            this._selectors &&
            this._selectors.toString &&
            this._selectors.toString().trim());
        // console.log "inside other rule? {@sel} | {o:rule.@sel} |"
        if (this._sel.indexOf("&") == -1) {
          this._sel = "& " + this._sel;
        }
      } else if (
        !this._name &&
        this._tag &&
        this._flag &&
        !this._flag._condition
      ) {
        this._css.scope = this._tag;
        this._name = this._tag.cssid();
        this._sel = "&";
      } else if (!this._name) {
        this._name = this.cssid(); // (cmp ? (cmp.cssns + oid) : (sourceId + oid))
        this._sel = "." + this._name;
      }

      this._selectors && this._selectors.traverse && this._selectors.traverse();

      this._styles = {};

      this._body &&
        this._body.traverse &&
        this._body.traverse({
          rule: this,
          styles: this._styles,
          rootRule: o.rule || this,
        });

      // add the placeholderes
      if (this._placeholders.length) {
        if (this.option("inTagTree")) {
          for (
            let i = 0, items = iter$(this._placeholders), len = items.length, ph;
            i < len;
            i++
          ) {
            ph = items[i];
            let setter = new TagStyleAttr(ph.name());
            setter._tag = this._tag;
            ((setter._value = ph.runtimeValue()), setter);
            setter.set({
              propname: ph._propname,
              unit: ph.option("unit"),
              styleterm: ph,
            });
            ph._setter = setter;
            setter.traverse();
          }
        } else if (!this._flag) {
          for (
            let i = 0, items = iter$(this._placeholders), len = items.length;
            i < len;
            i++
          ) {
            items[i].warn("Only allowed inside tag tree");
          }
        }
      }

      if (o.rule && o.styles) {
        if (o.styles[this._sel]) {
          let base = o.styles[this._sel];
          helpers.deepAssign(base, this._styles);
        } else {
          o.styles[this._sel] = this._styles;
        }
      } else {
        let component = this._tagDeclaration;
        let opts = {
          selectors: [],
          ns: this._css.ns,
          id: this._css.id,
          type: this._css.type,
          scope: this._css.scope,
          tags: tags,
          component: cmp,
          inline: !!this._flag,
          global: !!this.isGlobal(),
          mixins: {},
          apply: {},
          depth: this._tag ? this._tag._level : 0,
        };

        this._css = new StyleRule(null, this._sel, this._styles, opts).toString();
        STACK._css.add(this._css, opts);
      }
      return this;
    }

    toRaw() {
      return "" + this._name;
    }

    c() {
      if (this.option("toplevel") && this.option("export")) {
        // console.log "EXPORT??!",@identifier,@mixin,@name
        return "";
      }

      if (this._tvar) {
        let out = ["" + this._tvar + " = '" + this._name + "'"];
        let add = function (_0) {
          return out.push(_0);
        };
        let cvar = this._tag.cvar();
        let bvar = this._tag.bvar();

        for (
          let i = 0, items = iter$(this._placeholders), len = items.length;
          i < len;
          i++
        ) {
          let item = items[i]._setter;
          // TODO - this logic should definitely move into TagAttr.c
          let iref = "" + cvar + "[" + item.osym() + "]";
          let val = item.value();

          // TODO optimize the css variable setters
          if (true) {
            add("" + M(item.js(this._o), item));
          }
        }

        // console.log out.join('\n'),STACK.isExpression
        let expr = STACK.isExpression();
        return expr ? "(" + out.join(",") + ")" : out.join(";\n");
        // return "{@tvar} = '{@flagIf}'"
      }

      if (STACK.tsc() && this._placeholders.length) {
        let out = [];
        for (
          let i = 0, items = iter$(this._placeholders), len = items.length;
          i < len;
          i++
        ) {
          out.push(items[i].runtimeValue().c());
        }
        let expr = STACK.isExpression();
        return expr ? "(" + out.join(",") + ")" : out.join(";\n");
      }

      if (
        this.option("inClassBody") ||
        this.option("inTagTree") ||
        this.option("toplevel")
      ) {
        return "";
      }

      let out = "'" + this._name + "'";
      return out;
    }
  }

  // nodes # bunch of style properties and potentially nested rules

  class StyleBody extends ListNode {
    visit() {
      let items = this._nodes;
      let i = 0;

      let prevname;
      for (let j = 0, ary = iter$(items), len = ary.length, item; j < len; j++) {
        item = ary[j];
        if (!(item instanceof StyleDeclaration)) {
          continue;
        }
        if (!item._property._name) {
          item._property.setName(prevname);
        }

        prevname = item._property._name;
      }

      while (i < items.length) {
        let item = items[i];
        let res = item.traverse();

        if (res != item) {
          if (res instanceof Array) {
            items.splice.apply(items, [].concat([i, 1], Array.from(res)));
            continue;
          }
        }

        // has changed?
        if (item == items[i]) {
          i++;
        }
      }
      return this;
    }

    toJSON() {
      return this.values();
    }
  }

  class StyleDeclaration extends StyleNode {
    constructor(property, expr) {
      super(...arguments);
      this._property = property;
      this._expr =
        expr instanceof StyleExpressions ? expr : new StyleExpressions(expr);
      this;
    }

    clone(name, params) {
      if (params == null) {
        params = this._expr.clone();
      }
      if (typeof params == "string" || typeof params == "number") {
        params = [params];
      }
      if (
        !(params instanceof Array) &&
        (!(params instanceof ListNode) || params instanceof StyleOperation)
      ) {
        params = [params];
      }
      return new StyleDeclaration(this._property.clone(name), params);
    }

    visit(stack, o) {
      // see if property can be expanded
      var self = this,
        v_;
      let theme = stack.theme();
      let list = stack.parent();
      let name = String(self._property.name());
      let alias = theme.expandProperty(name);
      if (self._expr) {
        self._expr.traverse({
          rule: o.rule,
          rootRule: o.rootRule,
          decl: self,
          property: self._property,
        });
      }

      if (alias instanceof Array) {
        list.replace(
          self,
          alias.map(function (_0) {
            return self.clone(_0);
          }),
        );
        return;
      } else if (alias && alias != name) {
        self._property = self._property.clone(alias);
      }

      let method = String(alias || name).replace(/-/g, "_");

      if (self._expr) {
        self._expr.traverse({ decl: self, property: self._property });
      }

      let res;
      let expanded = [];
      if (self._property.isColor && self._property.isColor()) {
        res = theme.colormix(name.slice(1), self._expr.toArray());
        // console.log "prop is color!!!",res
      } else if (theme[method] && !self.option("plain")) {
        res = theme[method].apply(theme, self._expr.toArray());
      }

      if (res instanceof Array) {
        self._expr = new StyleExpressions(res);
      } else if (res instanceof Object) {
        for (
          let v, i = 0, keys = Object.keys(res), l = keys.length, k;
          i < l;
          i++
        ) {
          k = keys[i];
          v = res[k];
          if (k.indexOf("&") >= 0) {
            let body = new StyleBody([]);
            let rule = new StyleRuleSet(LIT(k), body);
            expanded.push(rule);
            for (
              let v2, j = 0, keys1 = Object.keys(v), l = keys1.length, k2;
              j < l;
              j++
            ) {
              // need recursive thing here
              k2 = keys1[j];
              v2 = v[k2];
              body.add(self.clone(k2, v2));
            }
          } else {
            expanded.push(
              self.clone(k, v).set({ plain: k == name || k == alias }),
            );
          }
        }
        list.replace(self, expanded);
        return;
      }

      if (self._expr) {
        self._expr.traverse({ decl: self, property: self._property });
        self._expr.set({ parens: false });
      }

      if (o.styles) {
        let key = self._property.toKey();

        let val = self._expr;
        if (o.selector) {
          key = JSON.stringify([o.selector, key]);
        }

        if (self._property.isUnit()) {
          if (self._property.number() != 1) {
            val = LIT(
              "calc(" + val.c() + " / " + self._property.number() + ")",
            );
          }
        }

        // if this key has already been set we need to delete it
        // because we rely on the key order of the object.
        // Should move over to using an array for this probably
        if (o.styles[key]) {
          ((v_ = o.styles[key]), delete o.styles[key], v_);
        }

        o.styles[key] = val.c({ property: self._property });
      }
      return self;
    }

    toCSS() {
      return "" + this._property.c() + ": " + AST.cary(this._expr).join(" ");
    }

    toJSON() {
      return this.toCSS();
    }
  }

  class StyleProperty extends StyleNode {
    constructor(token) {
      super(...arguments);
      var m;
      this._token = token;
      let raw = String(this._token);

      // also split
      this._parts = raw.replace(/(^|\b)\$/g, "--").split(/\b(?=[\^\.\@\!])/g); // .split(/[\.\@]/g)

      for (
        let i = 0, items = iter$(this._parts), len = items.length;
        i < len;
        i++
      ) {
        this._parts[i] = items[i].replace(/^\.(?=[^\.])/, "@.");
      }

      this._name = String(this._parts[0]);

      if (raw[0] == "#") {
        this._kind = "color";
        if (constants.HEX_REGEX.test(this._name)) {
          this.error(
            "Color name " +
              this._name +
              " cannot be identical to valid hex color",
            { loc: token[0] || token },
          );
        }
      }

      if ((m = this._name.match(/^(\d+)([a-zA-Z]+)$/))) {
        this._number = parseInt(m[1]);
        this._unit = m[2];
      }

      if (!this._name.match(/^[\#\w\-]/)) {
        this._parts.unshift((this._name = null));
      }

      this;
    }

    setName(value) {
      var m;
      if ((m = value.match(/^(\d+)([a-zA-Z]+)$/))) {
        this._number = parseInt(m[1]);
        this._unit = m[2];
      } else {
        this._number = this._unit = null;
      }
      this._name = value;
      return this;
    }

    name() {
      return this._name || (this._name = String(this._parts[0]));
    }

    number() {
      return this._number;
    }

    setNumber(value) {
      this._number = value;
      return this;
    }

    unit() {
      return this._unit;
    }

    setUnit(value) {
      this._unit = value;
      return this;
    }

    kind() {
      return this._kind;
    }

    setKind(value) {
      this._kind = value;
      return this;
    }

    clone(newname) {
      return new StyleProperty(
        [newname || this._name].concat(this.modifiers()).join(""),
      );
    }

    addModifier(modifier) {
      this._parts.push(modifier);
      return this;
    }

    isUnit() {
      return this._unit;
    }

    isColor() {
      return this._kind == "color" || this._name[0] == "#";
    }

    modifiers() {
      return this._parts.slice(1);
    }

    toJSON() {
      return this._name + this.modifiers().join("§");
    }

    toString() {
      return this._name + this.modifiers().join("§");
    }

    toKey() {
      let name = this.isUnit()
        ? "--u_" + this._unit
        : this.isColor()
          ? "--c_" + this._name.slice(1)
          : this._name;
      return [name].concat(this.modifiers()).join("§");
    }

    c() {
      return this.toString();
    }
  }

  // modifiers
  // values

  // lookup shorthand. If shorthand represents multiple
  // props then we compile it to multiple props
  class StylePropertyIdentifier extends StyleNode {
    constructor(name) {
      super(...arguments);
      this._name = name;
      if (String(name)[0] == "$") {
        this._name = "--" + String(name).slice(1);
      }
      // val[0] == '$' ? "var(--{val.slice(1)})" : val
    }

    toJSON() {
      return String(this._name);
    }

    toString() {
      return String(this._name);
    }
  }

  class StylePropertyModifier extends StyleNode {
    constructor(name) {
      super(...arguments);
      this._name = name;
    }

    toJSON() {
      return String(this._name);
    }

    toString() {
      return String(this._name);
    }
  }

  class StyleExpressions extends ListNode {
    load(list) {
      if (list instanceof Array) {
        list = list.map(function (_0) {
          return _0 instanceof StyleExpression ? _0 : new StyleExpression(_0);
        });
      }
      return [].concat(list);
    }

    c(o) {
      let out = AST.cary(this._nodes, o).join(", ");
      if (this.option("parens")) {
        out = "( " + out + " )";
      }
      return out;
    }

    clone() {
      return new StyleExpressions(this._nodes.slice(0));
    }

    toArray() {
      return this._nodes
        .filter(function (_0) {
          return _0 instanceof StyleExpression;
        })
        .map(function (_0) {
          return _0.toArray();
        });
    }
  }

  class StyleExpression extends ListNode {
    load(list) {
      return [].concat(list);
    }

    toString() {
      return AST.cary(this._nodes).join(" ");
    }

    clone() {
      return new StyleExpression(this._nodes.slice(0));
    }

    c(o) {
      if (o && o.as == "js") {
        return AST.cary(this._nodes, o).join(" ");
      }
      return this.toString();
    }

    toJSON() {
      return this.toString();
    }

    toArray() {
      return this._nodes;
    }

    toIterable() {
      return this._nodes;
    }

    addParam(param, op) {
      param._op = op;
      this.last().addParam(param);
      return this;
    }

    reclaimParams() {
      let items = this.filter(function (_0) {
        return _0.param;
      });
      for (let i = 0, ary = iter$(items), len = ary.length, item; i < len; i++) {
        item = ary[i];
        let param = item.param;
        let op = param._op;
        this.add([op, param], { after: item });
        item._params = [];
      }

      return;
    }

    visit(stack, o) {
      if (o && o.property) {
        let name = o.property._name;
        if (name == "gt" || name == "grid-template") {
          this.reclaimParams();
        }
      }
      return super.visit(...arguments);
    }
  }

  class StyleParens extends ValueNode {
    visit(stack, o) {
      super.visit(...arguments);
      return this.set({
        calc: !stack.up(StyleParens) && !stack.up(StyleFunction),
      });
    }

    c(o) {
      let plain = this._value.c();

      // TODO warn when option(:unit) is set

      if (o && o.as == "js") {
        return plain;
      } else if (this.option("calc")) {
        let unit = this._options && String(this._options.unit || "");
        if (unit) {
          return "calc(calc(" + plain + ") * 1" + unit + ")";
        } else {
          return "calc(" + plain + ")";
        }
      } else {
        return "(" + plain + ")";
      }
    }
  }

  class StyleOperation extends ListNode {
    c(o) {
      return AST.cary(this._nodes, o).join(" ");
    }
  }

  class StyleTerm extends ValueNode {
    valueOf() {
      return String(this._value);
    }

    toString() {
      return String(this._value);
    }

    toRaw() {
      return this.valueOf();
    }

    toAlpha() {
      return this.valueOf();
    }

    visit(stack, o) {
      this._token = this._value;
      this._property = o.property;
      this._propname = o.property && o.property._name;
      this.alone =
        stack.up() instanceof StyleExpression && stack.up().values().length == 1;
      let resolved = stack.theme().$value(this, 0, this._propname);
      if (!(stack.up(StyleParens) || stack.up(StyleFunction))) {
        this._resolvedValue = resolved;
      }
      return this;
    }

    get param() {
      return this._params && this._params[0];
    }

    kind() {
      return this._kind;
    }

    runtimeValue() {
      return this.value();
    }

    addParam(param) {
      this._params || (this._params = []);
      this._params.push(param);
      return this;
    }

    c(o) {
      let out =
        this._resolvedValue && !(this._resolvedValue instanceof Node)
          ? C(this._resolvedValue)
          : this.valueOf();
      return out;
    }
  }

  class StyleInterpolationExpression extends StyleTerm {
    name(v) {
      return this._name;
    }

    setName(v) {
      this._name = v;
      return this;
    }

    loc() {
      return [this._startLoc, this._endLoc];
    }

    visit(stack, o) {
      super.visit(...arguments);
      if (o.rootRule) {
        o.rootRule.addPlaceholder(this);
      }
      this._id = "" + this.sourceId() + "_" + this.tid(); // could use a different counter?
      this._name = "--" + this._id;
      return (this._runtimeValue = this.value());
      // @propname = stack.theme.expandProperty
    }

    runtimeValue() {
      return this._runtimeValue;
    }

    get unit() {
      return (this._options && String(this._options.unit)) || "";
    }

    c() {
      return "var(--" + this._id + ")";
    }
  }

  class StyleFunction extends Node {
    constructor(value, params) {
      super(...arguments);
      this._name = value;
      this._params = params;
    }

    kind() {
      return "function";
    }

    visit(stack, o) {
      this._property = o.property;
      this._propname = o.property && o.property._name;
      if (this._params && this._params.traverse) {
        this._params.traverse();
      }

      let name = String(this._name);
      let parts = this._params.toArray().flat();

      if (this._property.isColor() && name.match(/^(lch|rgba?|hsla?)$/)) {
        this._lcha = [];
        for (
          let i = 0, items = iter$(parts), len = items.length, part;
          i < len;
          i++
        ) {
          part = items[i];
          if (part._value == "/") {
            continue;
          }
          this._lcha.push(part);
        }

        if (name != "lch") {
          let alpha = this._lcha[3];
          let kind = name.slice(0, 3);

          for (
            let i = 0, items = iter$(this._lcha), len = items.length, part;
            i < len;
            i++
          ) {
            part = items[i];
            if (!(part instanceof StyleDimension) && i < 3) {
              return this.error(
                "Dynamic part not allowed in non-lch #color definitions",
                { loc: part },
              );
            }
          }

          try {
            let inside = this._params.c();
            if (alpha && !(alpha instanceof StyleDimension)) {
              inside = inside.replace(alpha.c(), "1");
            }
            let full = "" + name + "(" + inside + ")";

            let col = colord(full).toLch();
            this._lcha = [col.l, col.c, col.h, col.a];
            if (alpha) {
              this._lcha[3] = alpha;
            }
          } catch (e) {
            this.error("Failed to parse color", { loc: this });
          }
        }
      }
      return this;
    }

    lcha() {
      return this._lcha || [0, 0, 0, 1];
    }

    toString() {
      return this.c();
    }

    c(o) {
      var res;
      let name = String(this._name);
      let pars = this._params.c();
      let out = "" + name + "(" + pars + ")";

      if (this._property && this._property.isColor()) {
        if (name == "hsl") {
          let parts = this._params.toArray().flat();
          if (parts.length == 3) {
            return AST.cary(parts).join(",");
          }
        }

        if ((res = Color.from(out))) {
          return res.toVar();
        }
      }

      if (o && o.as == "js") {
        out = helpers.singlequote(out);
      }
      return out;
    }
  }

  class StyleURL extends ValueNode {
    c() {
      let out = String(this._value);
      return SourceMapper.strip(out);
    }
  }

  class StyleIdentifier extends StyleTerm {
    color() {
      return this._color;
    }

    setColor(value) {
      this._color = value;
      return this;
    }

    visit(stack) {
      let raw = this.toString();
      if (raw.match(/^[lcha]$/)) {
        super.visit(...arguments);
        let mix = stack.up(StyleColorMix);
        this._colormix = mix;
        return (this._resolvedValue =
          "var(--u_" + this._colormix._name + raw.toUpperCase() + ")");
      } else {
        if (raw.match(/^([a-zA-Z]+\d+|black|white)$/)) {
          this.setColor("" + raw);
          if (this.param) {
            this.setColor(this.color() + "/" + this.param.toAlpha());
          }
        }
        return super.visit(...arguments);
      }
    }

    c(o) {
      if (this._colormix) {
        return (
          "var(--u_" + this._colormix._name + this.toString().toUpperCase() + ")"
        );
      }

      if (this.color()) {
        let val = this.color().toString();
        let asvar =
          this.option("parameterize") ||
          (this._property && this._property.isColor());
        let pre = asvar ? "/*##*/" : "/*#*/";
        return pre + val;
      }

      let val = this.toString();
      if (val[0] == "$") {
        val = "var(--" + val.slice(1) + ")";
        if (o && o.as == "js") {
          val = helpers.singlequote(val);
        }
        return val;
      } else {
        return super.c(...arguments);
      }
    }
  }

  class StyleString extends StyleTerm {}

  class StyleColor extends StyleTerm {
    visit() {
      var m;
      super.visit(...arguments);
      let raw = this.toRaw();
      let name = (this._name = raw.slice(1));

      // only needed for the property color?
      if ((m = raw.match(constants.HEX_REGEX))) {
        this._hex = true;
        let col = colord(raw).toLch();
        this._lcha = [col.l, col.c, col.h, col.a];
      } else {
        this._lcha = [
          "var(--u_" + name + "L)",
          "var(--u_" + name + "C)",
          "var(--u_" + name + "H)",
          "var(--u_" + name + "A,1)",
        ];
      }

      let a = this.param && this.param.toAlpha();
      if (a != null) {
        if (a[0] == "$") {
          a = "var(--" + a.slice(1) + ",100%)";
        }
        return (this._lcha[3] = a);
      }
    }

    lcha() {
      return this._lcha;
    }

    c(o) {
      var ary;
      let raw = this.toRaw();
      let name = raw.slice(1);
      let rich = Color.from(raw);

      if (this._property && this._property.isColor()) {
        console.log("deprecated");
        return rich.toVar();
      }

      var ary = iter$(this._lcha);
      let l = ary[0],
        c = ary[1],
        h = ary[2],
        a = ary[3];
      if (this._hex && a == 1) {
        return raw;
      }

      return "lch(" + l + " " + c + " " + h + " / " + a + ")";
    }
  }

  class StyleColorMix extends StyleTerm {
    params() {
      return this.option("params");
    }

    lcha() {
      return this._lcha;
    }

    visit() {
      let pars = this.params().toArray().flat();
      let name = (this._name = this.toRaw().slice(1));
      this.params().traverse();
      super.visit(...arguments);

      this._lcha = [];

      for (
        let i = 0, items = iter$(pars), len = items.length, part;
        i < len;
        i++
      ) {
        part = items[i];
        if (part._value == "/") {
          continue;
        }
        this._lcha.push(part);
      }

      if (this._lcha.length == 3) {
        this._lcha.push(LIT("var(--u_" + name + "A,1)"));
      }
      return this;
    }

    c(o) {
      var ary;
      let raw = this.toRaw();
      let name = raw.slice(1);
      var ary = iter$(AST.cary(this._lcha));
      let l = ary[0],
        c = ary[1],
        h = ary[2],
        a = ary[3];
      return "lch(" + l + " " + c + " " + h + " / " + a + ")";
    }
  }

  class StyleVar extends StyleTerm {
    c(o) {
      return this.toString();
    }
  }

  var VALID_CSS_UNITS =
    "cm mm Q in pc pt px em ex ch rem vw vh vmin vmax % s ms fr deg rad grad turn Hz kHz cqw cqh cqi cqb cqmin cqmax".split(
      " ",
    );

  class StyleDimension extends StyleTerm {
    constructor(value) {
      super(...arguments);
      this._value = value;
      let m = String(value).match(/^([\-\+]?[\d\.]*)([a-zA-Z]+|%)?$/);
      this._number = parseFloat(m[1]);
      this._unit = m[2] || null;
    }

    get unit() {
      return this._unit || "";
    }

    number() {
      return this._number;
    }

    setNumber(value) {
      this._number = value;
      return this;
    }

    setUnit(value) {
      this._unit = value;
      return this;
    }

    clone(num, unit) {
      if (num === undefined) num = this._number;
      if (unit === undefined) unit = this._unit;
      let cloned = new StyleDimension(this.value());
      cloned._unit = unit;
      cloned._number = num;
      return cloned;
    }

    visit(stack) {
      if (this._unit && this._unit.match(/^[lcha]$/)) {
        if ((this._colormix = stack.up(StyleColorMix))) {
          this._unit = "" + this._colormix._name + this._unit.toUpperCase();
        }
        // if par isa StyleDimension
        // 		let u = par:_unit
        // 		if u and regex.test(u)
        // 			par:_unit = "{@name}{u.toUpperCase()}"
      }
      return super.visit(...arguments);
    }

    toString() {
      return "" + this._number + (this._unit || "");
    }

    toFloat(pct) {
      if (pct === undefined) pct = 0.01;
      let num = this._number;
      if (this._unit == "%") {
        num = num * pct;
      }
      return num;
    }

    toRaw() {
      return this._unit ? this.toString() : this._number;
    }

    c(o) {
      let out =
        this._resolvedValue && !(this._resolvedValue instanceof Node)
          ? C(this._resolvedValue)
          : this.valueOf();
      if (o && o.as == "js" && this._unit) {
        out = helpers.singlequote(out);
      }
      return out;
    }

    valueOf() {
      if (this._unit == "u") {
        return this._number * 4 + "px";
      } else if (this._unit == null) {
        return this._number;
      } else if (idx$(this._unit, VALID_CSS_UNITS) >= 0) {
        return String(this._value);
      } else {
        let fallback = this._colormix ? "" : ",1" + this._unit;
        if (this._number == 1) {
          return "var(--u_" + this._unit + fallback + ")";
        } else {
          return (
            "calc(var(--u_" + this._unit + fallback + ") * " + this._number + ")"
          );
          // return String(@value)
        }
      }
    }

    toAlpha() {
      if (!this._unit) {
        return this._number + "%";
      } else {
        return this.valueOf();
      }
    }
  }

  class StyleNumber extends StyleDimension {}


  return {
    StyleNode,
    StyleSelector,
    StyleRuleSet,
    StyleBody,
    StyleDeclaration,
    StyleProperty,
    StylePropertyIdentifier,
    StylePropertyModifier,
    StyleExpressions,
    StyleExpression,
    StyleParens,
    StyleOperation,
    StyleTerm,
    StyleInterpolationExpression,
    StyleFunction,
    StyleURL,
    StyleIdentifier,
    StyleString,
    StyleColor,
    StyleColorMix,
    StyleVar,
    StyleDimension,
    StyleNumber,
  };
}
