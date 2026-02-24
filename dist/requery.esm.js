import c from "jquery";
import { default as T } from "jquery";
const q = /* @__PURE__ */ new WeakMap();
function d(e) {
  return q.get(e) ?? null;
}
function j(e, t, n = {}) {
  if (q.has(e)) {
    const i = q.get(e);
    Object.assign(i.data, t);
  } else
    q.set(e, {
      data: { ...t },
      watchers: {},
      // { [key]: Function[] }
      computed: {}
      // { [key]: Function }
    });
}
function x(e, t) {
  const n = d(e);
  if (n)
    return n.computed[t] ? n.computed[t](n.data) : n.data[t];
}
function p(e, t, n, i) {
  const r = d(e);
  if (!r) {
    console.warn("reQuery: rqSet called on element with no state.", e);
    return;
  }
  const a = r.data[t];
  if (Object.is(a, n)) return;
  r.data[t] = n;
  const o = r.watchers[t];
  o && o.forEach((s) => s(n, a)), typeof i == "function" && i(e, t, n, r.data);
}
function W(e, t, n, i) {
  const r = d(e);
  if (!r) {
    console.warn("reQuery: rqMutate called on element with no state.", e);
    return;
  }
  const a = n(r.data[t]);
  p(e, t, a, i);
}
function E(e, t, n) {
  const i = d(e);
  if (!i) {
    console.warn("reQuery: rqWatch called on element with no state.", e);
    return;
  }
  i.watchers[t] || (i.watchers[t] = []), i.watchers[t].push(n);
}
function O(e, t, n) {
  const i = d(e);
  if (!i) {
    console.warn("reQuery: rqComputed called on element with no state.", e);
    return;
  }
  i.computed[t] = n;
}
function g(e, t, n, i) {
  const r = c(e);
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
    n ? c(this).show() : c(this).hide();
  }), r.find("[data-rq-attr]").add(r.filter("[data-rq-attr]")).each(function() {
  }), r.find("*").add(r).each(function() {
    const a = this.attributes;
    for (let o = 0; o < a.length; o++) {
      const s = a[o].name;
      if (a[o].value === t) {
        if (s.startsWith("data-rq-attr-")) {
          const f = s.slice(13);
          n == null ? this.removeAttribute(f) : this.setAttribute(f, String(n));
        }
        if (s.startsWith("data-rq-class-")) {
          const f = s.slice(14);
          this.classList.toggle(f, !!n);
        }
      }
    }
  });
}
function V(e, t) {
  Object.keys(t).forEach((n) => {
    g(e, n, t[n]);
  });
}
function y(e, t) {
  c(e).on("input change", "[data-rq-val]", function() {
    const i = this.getAttribute("data-rq-val");
    let r;
    this.type === "checkbox" ? r = this.checked : this.type === "number" || this.type === "range" ? r = this.valueAsNumber : r = this.value, t(i, r);
  });
}
function $(e, t, n) {
  c(e).find(`template[data-rq-each="${t}"]`).each(function() {
    const r = c(this), a = this.content;
    let o = r.next(`[data-rq-list="${t}"]`);
    o.length || (o = c("<div>").attr("data-rq-list", t), r.after(o)), o.empty(), Array.isArray(n) && n.forEach((s, u) => {
      const f = c(document.importNode(a, !0)), l = s !== null && typeof s == "object" ? { ...s, $index: u } : { value: s, $index: u };
      f.find("*").add(f).each(function() {
        Object.keys(l).forEach((h) => {
          C(this, h, l[h]);
        });
      }), o.append(f);
    });
  });
}
function C(e, t, n) {
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
          const s = a.slice(13);
          n == null ? e.removeAttribute(s) : e.setAttribute(s, String(n));
        } else if (a.startsWith("data-rq-class-")) {
          const s = a.slice(14);
          e.classList.toggle(s, !!n);
        }
      }
    }
}
function N(e, t, n, i) {
  if (!t || typeof t != "object") return;
  const r = c(e);
  Object.entries(t).forEach(([a, o]) => {
    typeof o == "function" && B(r, a, o, n, i);
  });
}
function B(e, t, n, i, r) {
  e.find("*").add(e).each(function() {
    const a = this.attributes;
    for (let o = 0; o < a.length; o++) {
      const s = a[o].name, u = a[o].value;
      if (!s.startsWith("data-rq-on-") || u !== t) continue;
      const f = s.slice(11), l = `[data-rq-on-${f}="${t}"]`;
      e.on(f + ".rq", l, function(h) {
        const w = i(), b = n(w, h, e);
        b && typeof b == "object" && Object.entries(b).forEach(([S, A]) => {
          r(S, A);
        });
      });
      break;
    }
  });
}
function m(e, t, n, i) {
  g(e, t, n), $(e, t, n);
}
c.fn.rqState = function(e = {}, t = {}) {
  return this.each(function() {
    j(this, e, t);
    const n = this;
    y(n, (r, a) => {
      p(n, r, a, m);
    }), t.actions && N(
      n,
      t.actions,
      () => {
        var r;
        return ((r = d(n)) == null ? void 0 : r.data) ?? {};
      },
      (r, a) => p(n, r, a, m)
    );
    const i = d(n);
    i && (V(n, i.data), Object.entries(i.data).forEach(([r, a]) => {
      Array.isArray(a) && $(n, r, a);
    }));
  });
};
c.fn.rqGet = function(e) {
  const t = this[0];
  if (t)
    return x(t, e);
};
c.fn.rqSet = function(e, t) {
  return this.each(function() {
    p(this, e, t, m);
  });
};
c.fn.rqMutate = function(e, t) {
  return this.each(function() {
    W(this, e, t, m);
  });
};
c.fn.rqWatch = function(e, t) {
  return this.each(function() {
    E(this, e, t);
  });
};
c.fn.rqComputed = function(e, t) {
  return this.each(function() {
    O(this, e, t);
  });
};
export {
  T as default
};
