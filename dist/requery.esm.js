import s from "jquery";
import { default as T } from "jquery";
const g = /* @__PURE__ */ new WeakMap();
function u(e) {
  return g.get(e) ?? null;
}
function C(e, t, n = {}) {
  if (g.has(e)) {
    const i = g.get(e);
    Object.assign(i.data, t), Object.assign(i.initial, t);
  } else
    g.set(e, {
      data: { ...t },
      initial: { ...t },
      // snapshot for rqReset
      watchers: {},
      // { [key]: Function[] }
      computed: {},
      // { [key]: Function }
      onChange: typeof n.onChange == "function" ? n.onChange : null,
      debug: n.debug === !0
    });
}
function x(e, t) {
  const n = u(e);
  if (n)
    return n.computed[t] ? n.computed[t](n.data) : n.data[t];
}
function l(e, t, n, i) {
  const r = u(e);
  if (!r) {
    console.warn("reQuery: rqSet called on element with no state.", e);
    return;
  }
  const a = r.data[t];
  if (Object.is(a, n)) return;
  r.data[t] = n, r.debug && console.log(`[reQuery] "${t}":`, a, "→", n), r.onChange && r.onChange(t, n, a);
  const o = r.watchers[t];
  o && o.forEach((c) => c(n, a)), typeof i == "function" && i(e, t, n, r.data);
}
function b(e, t, n, i) {
  const r = u(e);
  if (!r) {
    console.warn("reQuery: rqMutate called on element with no state.", e);
    return;
  }
  const a = n(r.data[t]);
  l(e, t, a, i);
}
function w(e, t, n) {
  const i = u(e);
  if (!i) {
    console.warn("reQuery: rqWatch called on element with no state.", e);
    return;
  }
  i.watchers[t] || (i.watchers[t] = []), i.watchers[t].push(n);
}
function S(e, t, n) {
  const i = u(e);
  if (!i) {
    console.warn("reQuery: rqComputed called on element with no state.", e);
    return;
  }
  i.computed[t] = n;
}
function E(e) {
  g.delete(e);
}
function $(e, t, n, i) {
  const r = s(e);
  r.find(`[data-rq-text="${t}"]`).add(
    r.filter(`[data-rq-text="${t}"]`)
  ).each(function() {
    this.textContent = n == null ? "" : String(n);
  }), r.find(`[data-rq-html="${t}"]`).add(
    r.filter(`[data-rq-html="${t}"]`)
  ).each(function() {
    this.innerHTML = n == null ? "" : String(n);
  }), r.find(`[data-rq-val="${t}"]`).add(
    r.filter(`[data-rq-val="${t}"]`)
  ).each(function() {
    const a = this;
    a.type === "checkbox" ? a.checked = !!n : a.type === "radio" ? a.checked = a.value === String(n) : a.value = n == null ? "" : String(n);
  }), r.find(`[data-rq-show="${t}"]`).add(
    r.filter(`[data-rq-show="${t}"]`)
  ).each(function() {
    n ? s(this).show() : s(this).hide();
  }), r.find("[data-rq-attr]").add(r.filter("[data-rq-attr]")).each(function() {
  }), r.find("*").add(r).each(function() {
    const a = this.attributes;
    for (let o = 0; o < a.length; o++) {
      const c = a[o].name;
      if (a[o].value === t) {
        if (c.startsWith("data-rq-attr-")) {
          const f = c.slice(13);
          n == null ? this.removeAttribute(f) : this.setAttribute(f, String(n));
        }
        if (c.startsWith("data-rq-class-")) {
          const f = c.slice(14);
          this.classList.toggle(f, !!n);
        }
      }
    }
  });
}
function W(e, t) {
  Object.keys(t).forEach((n) => {
    $(e, n, t[n]);
  });
}
function N(e, t) {
  s(e).on("input change", "[data-rq-val]", function() {
    const i = this.getAttribute("data-rq-val");
    let r;
    this.type === "checkbox" ? r = this.checked : this.type === "number" || this.type === "range" ? r = this.valueAsNumber : r = this.value, t(i, r);
  });
}
function y(e, t, n) {
  s(e).find(`template[data-rq-each="${t}"]`).each(function() {
    const r = s(this), a = this.content;
    let o = r.next(`[data-rq-list="${t}"]`);
    o.length || (o = s("<div>").attr("data-rq-list", t), r.after(o)), o.empty(), Array.isArray(n) && n.forEach((c, p) => {
      const f = s(document.importNode(a, !0)), q = c !== null && typeof c == "object" ? { ...c, $index: p } : { value: c, $index: p };
      f.find("*").add(f).each(function() {
        Object.keys(q).forEach((h) => {
          Q(this, h, q[h]);
        });
      }), o.append(f);
    });
  });
}
function Q(e, t, n) {
  const i = e.attributes;
  if (i)
    for (let r = 0; r < i.length; r++) {
      const a = i[r].name;
      if (i[r].value === t) {
        if (a === "data-rq-text")
          e.textContent = n == null ? "" : String(n);
        else if (a === "data-rq-html")
          e.innerHTML = n == null ? "" : String(n);
        else if (a === "data-rq-val")
          e.value = n == null ? "" : String(n);
        else if (a === "data-rq-show")
          e.style.display = n ? "" : "none";
        else if (a.startsWith("data-rq-attr-")) {
          const c = a.slice(13);
          n == null ? e.removeAttribute(c) : e.setAttribute(c, String(n));
        } else if (a.startsWith("data-rq-class-")) {
          const c = a.slice(14);
          e.classList.toggle(c, !!n);
        }
      }
    }
}
function V(e, t, n, i) {
  if (!t || typeof t != "object") return;
  const r = s(e);
  Object.entries(t).forEach(([a, o]) => {
    typeof o == "function" && I(r, a, o, n, i);
  });
}
function I(e, t, n, i, r) {
  e.find("*").add(e).each(function() {
    const a = this.attributes;
    for (let o = 0; o < a.length; o++) {
      const c = a[o].name, p = a[o].value;
      if (!c.startsWith("data-rq-on-") || p !== t) continue;
      const f = c.slice(11), q = `[data-rq-on-${f}="${t}"]`;
      e.on(f + ".rq", q, function(h) {
        const O = i(), m = n(O, h, e);
        m && typeof m == "object" && Object.entries(m).forEach(([j, A]) => {
          r(j, A);
        });
      });
      break;
    }
  });
}
function d(e, t, n, i) {
  $(e, t, n), y(e, t, n);
}
s.fn.rqState = function(e = {}, t = {}) {
  return this.each(function() {
    const n = this;
    let i = { ...e };
    if (t.persist)
      try {
        const o = JSON.parse(localStorage.getItem(t.persist) || "null");
        o && typeof o == "object" && Object.keys(i).forEach((c) => {
          Object.prototype.hasOwnProperty.call(o, c) && (i[c] = o[c]);
        });
      } catch {
      }
    let r = t;
    if (t.persist) {
      const o = t.persist, c = typeof t.onChange == "function" ? t.onChange : null;
      r = {
        ...t,
        onChange(p, f, q) {
          try {
            const h = u(n);
            h && localStorage.setItem(o, JSON.stringify(h.data));
          } catch {
          }
          c && c(p, f, q);
        }
      };
    }
    C(n, i, r), N(n, (o, c) => {
      l(n, o, c, d);
    }), t.actions && V(
      n,
      t.actions,
      () => {
        var o;
        return ((o = u(n)) == null ? void 0 : o.data) ?? {};
      },
      (o, c) => l(n, o, c, d)
    );
    const a = u(n);
    a && (W(n, a.data), Object.entries(a.data).forEach(([o, c]) => {
      Array.isArray(c) && y(n, o, c);
    }), typeof t.onInit == "function" && t.onInit({ ...a.data }));
  });
};
s.fn.rqGet = function(e) {
  const t = this[0];
  if (t) {
    if (e === void 0) {
      const n = u(t);
      return n ? { ...n.data } : void 0;
    }
    return x(t, e);
  }
};
s.fn.rqSet = function(e, t) {
  if (e !== null && typeof e == "object") {
    const n = e;
    return this.each(function() {
      Object.entries(n).forEach(([i, r]) => {
        l(this, i, r, d);
      });
    });
  }
  return this.each(function() {
    l(this, e, t, d);
  });
};
s.fn.rqMutate = function(e, t) {
  return this.each(function() {
    b(this, e, t, d);
  });
};
s.fn.rqWatch = function(e, t) {
  return this.each(function() {
    w(this, e, t);
  });
};
s.fn.rqComputed = function(e, t) {
  return this.each(function() {
    S(this, e, t);
  });
};
s.fn.rqReset = function(e) {
  return this.each(function() {
    const t = u(this);
    if (!t) return;
    const n = this;
    e !== void 0 ? Object.prototype.hasOwnProperty.call(t.initial, e) && l(n, e, t.initial[e], d) : Object.keys(t.initial).forEach((i) => {
      l(n, i, t.initial[i], d);
    });
  });
};
s.fn.rqDestroy = function() {
  return this.each(function() {
    E(this), s(this).off(".rq");
  });
};
s.reQuery = {
  /**
   * Register a plugin with access to reQuery internals.
   *
   * @param {Function} pluginFn - Called immediately with a context object.
   */
  use(e) {
    if (typeof e != "function") {
      console.warn("reQuery.use: expected a function, got", typeof e);
      return;
    }
    e({
      $: s,
      getRecord: u,
      setState: (t, n, i) => l(t, n, i, d),
      mutateState: (t, n, i) => b(t, n, i, d),
      addWatcher: w,
      addComputed: S
    });
  }
};
export {
  T as default
};
