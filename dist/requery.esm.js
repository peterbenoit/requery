import s from "jquery";
import { default as T } from "jquery";
const g = /* @__PURE__ */ new WeakMap();
function u(e) {
  return g.get(e) ?? null;
}
function j(e, t, n = {}) {
  if (g.has(e)) {
    const o = g.get(e);
    Object.assign(o.data, t), Object.assign(o.initial, t);
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
function y(e, t) {
  const n = u(e);
  if (n)
    return n.computed[t] ? n.computed[t](n.data) : n.data[t];
}
function h(e, t, n, o) {
  const r = u(e);
  if (!r) {
    console.warn("reQuery: rqSet called on element with no state.", e);
    return;
  }
  const i = r.data[t];
  if (Object.is(i, n)) return;
  r.data[t] = n, r.debug && console.log(`[reQuery] "${t}":`, i, "→", n), r.onChange && r.onChange(t, n, i);
  const a = r.watchers[t];
  a && a.forEach((c) => c(n, i)), typeof o == "function" && o(e, t, n, r.data);
}
function A(e, t, n, o) {
  const r = u(e);
  if (!r) {
    console.warn("reQuery: rqMutate called on element with no state.", e);
    return;
  }
  const i = n(r.data[t]);
  h(e, t, i, o);
}
function C(e, t, n) {
  const o = u(e);
  if (!o) {
    console.warn("reQuery: rqWatch called on element with no state.", e);
    return;
  }
  o.watchers[t] || (o.watchers[t] = []), o.watchers[t].push(n);
}
function x(e, t, n) {
  const o = u(e);
  if (!o) {
    console.warn("reQuery: rqComputed called on element with no state.", e);
    return;
  }
  o.computed[t] = n;
}
function E(e) {
  g.delete(e);
}
function b(e, t, n, o) {
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
    const i = this;
    i.type === "checkbox" ? i.checked = !!n : i.type === "radio" ? i.checked = i.value === String(n) : i.value = n == null ? "" : String(n);
  }), r.find(`[data-rq-show="${t}"]`).add(
    r.filter(`[data-rq-show="${t}"]`)
  ).each(function() {
    n ? s(this).show() : s(this).hide();
  }), r.find("[data-rq-attr]").add(r.filter("[data-rq-attr]")).each(function() {
  }), r.find("*").add(r).each(function() {
    const i = this.attributes;
    for (let a = 0; a < i.length; a++) {
      const c = i[a].name;
      if (i[a].value === t) {
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
    b(e, n, t[n]);
  });
}
function N(e, t) {
  s(e).on("input change", "[data-rq-val]", function() {
    const o = this.getAttribute("data-rq-val");
    let r;
    this.type === "checkbox" ? r = this.checked : this.type === "number" || this.type === "range" ? r = this.valueAsNumber : r = this.value, t(o, r);
  });
}
function w(e, t, n) {
  s(e).find(`template[data-rq-each="${t}"]`).each(function() {
    const r = s(this), i = this.content;
    let a = r.next(`[data-rq-list="${t}"]`);
    a.length || (a = s("<div>").attr("data-rq-list", t), r.after(a)), a.empty(), Array.isArray(n) && n.forEach((c, l) => {
      const f = s(document.importNode(i, !0)), p = c !== null && typeof c == "object" ? { ...c, $index: l } : { value: c, $index: l };
      f.find("*").add(f).each(function() {
        Object.keys(p).forEach((d) => {
          V(this, d, p[d]);
        });
      }), a.append(f);
    });
  });
}
function V(e, t, n) {
  const o = e.attributes;
  if (o)
    for (let r = 0; r < o.length; r++) {
      const i = o[r].name;
      if (o[r].value === t) {
        if (i === "data-rq-text")
          e.textContent = n == null ? "" : String(n);
        else if (i === "data-rq-html")
          e.innerHTML = n == null ? "" : String(n);
        else if (i === "data-rq-val")
          e.value = n == null ? "" : String(n);
        else if (i === "data-rq-show")
          e.style.display = n ? "" : "none";
        else if (i.startsWith("data-rq-attr-")) {
          const c = i.slice(13);
          n == null ? e.removeAttribute(c) : e.setAttribute(c, String(n));
        } else if (i.startsWith("data-rq-class-")) {
          const c = i.slice(14);
          e.classList.toggle(c, !!n);
        }
      }
    }
}
function I(e, t, n, o) {
  if (!t || typeof t != "object") return;
  const r = s(e);
  Object.entries(t).forEach(([i, a]) => {
    typeof a == "function" && B(r, i, a, n, o);
  });
}
function B(e, t, n, o, r) {
  e.find("*").add(e).each(function() {
    const i = this.attributes;
    for (let a = 0; a < i.length; a++) {
      const c = i[a].name, l = i[a].value;
      if (!c.startsWith("data-rq-on-") || l !== t) continue;
      const f = c.slice(11), p = `[data-rq-on-${f}="${t}"]`;
      e.on(f + ".rq", p, function(d) {
        const $ = o(), m = n($, d, e);
        m && typeof m == "object" && Object.entries(m).forEach(([S, O]) => {
          r(S, O);
        });
      });
      break;
    }
  });
}
function q(e, t, n, o) {
  b(e, t, n), w(e, t, n);
}
s.fn.rqState = function(e = {}, t = {}) {
  return this.each(function() {
    const n = this;
    let o = { ...e };
    if (t.persist)
      try {
        const a = JSON.parse(localStorage.getItem(t.persist) || "null");
        a && typeof a == "object" && Object.keys(o).forEach((c) => {
          Object.prototype.hasOwnProperty.call(a, c) && (o[c] = a[c]);
        });
      } catch {
      }
    let r = t;
    if (t.persist) {
      const a = t.persist, c = typeof t.onChange == "function" ? t.onChange : null;
      r = {
        ...t,
        onChange(l, f, p) {
          try {
            const d = u(n);
            d && localStorage.setItem(a, JSON.stringify(d.data));
          } catch {
          }
          c && c(l, f, p);
        }
      };
    }
    j(n, o, r), N(n, (a, c) => {
      h(n, a, c, q);
    }), t.actions && I(
      n,
      t.actions,
      () => {
        var a;
        return ((a = u(n)) == null ? void 0 : a.data) ?? {};
      },
      (a, c) => h(n, a, c, q)
    );
    const i = u(n);
    i && (W(n, i.data), Object.entries(i.data).forEach(([a, c]) => {
      Array.isArray(c) && w(n, a, c);
    }), typeof t.onInit == "function" && t.onInit({ ...i.data }));
  });
};
s.fn.rqGet = function(e) {
  const t = this[0];
  if (t) {
    if (e === void 0) {
      const n = u(t);
      return n ? { ...n.data } : void 0;
    }
    return y(t, e);
  }
};
s.fn.rqSet = function(e, t) {
  if (e !== null && typeof e == "object") {
    const n = e;
    return this.each(function() {
      Object.entries(n).forEach(([o, r]) => {
        h(this, o, r, q);
      });
    });
  }
  return this.each(function() {
    h(this, e, t, q);
  });
};
s.fn.rqMutate = function(e, t) {
  return this.each(function() {
    A(this, e, t, q);
  });
};
s.fn.rqWatch = function(e, t) {
  return this.each(function() {
    C(this, e, t);
  });
};
s.fn.rqComputed = function(e, t) {
  return this.each(function() {
    x(this, e, t);
  });
};
s.fn.rqReset = function(e) {
  return this.each(function() {
    const t = u(this);
    if (!t) return;
    const n = this;
    e !== void 0 ? Object.prototype.hasOwnProperty.call(t.initial, e) && h(n, e, t.initial[e], q) : Object.keys(t.initial).forEach((o) => {
      h(n, o, t.initial[o], q);
    });
  });
};
s.fn.rqDestroy = function() {
  return this.each(function() {
    E(this), s(this).off(".rq");
  });
};
export {
  T as default
};
