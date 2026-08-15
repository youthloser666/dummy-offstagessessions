import { BlendFunction as xe, Effect as he, EffectAttribute as Re } from "postprocessing";
import Se, { forwardRef as _e, useMemo as ie, useEffect as Y, useRef as D, useCallback as ne, useState as Te } from "react";
import { useThree as oe, useFrame as Ee, createPortal as we } from "@react-three/fiber";
import * as p from "three";
import { Color as be, Vector3 as ve, Uniform as b, ShaderMaterial as C, Vector2 as T, Texture as R, Scene as Ce, Camera as Fe } from "three";
import { useFBO as ae } from "@react-three/drei";
const u = {
  blend: 5,
  intensity: 2,
  force: 1.1,
  distortion: 0.4,
  curl: 1.9,
  radius: 0.3,
  swirl: 4,
  pressure: 0.8,
  densityDissipation: 0.96,
  velocityDissipation: 1,
  fluidColor: "#3300ff",
  backgroundColor: "#070410",
  showBackground: !0,
  rainbow: !1,
  dyeRes: 512,
  simRes: 128,
  blendFunction: xe.NORMAL
}, fe = 60;
var re = { exports: {} }, z = {};
var me;
function De() {
  if (me) return z;
  me = 1;
  var o = Symbol.for("react.transitional.element"), r = Symbol.for("react.fragment");
  function a(n, c, s) {
    var i = null;
    if (s !== void 0 && (i = "" + s), c.key !== void 0 && (i = "" + c.key), "key" in c) {
      s = {};
      for (var S in c)
        S !== "key" && (s[S] = c[S]);
    } else s = c;
    return c = s.ref, {
      $$typeof: o,
      type: n,
      key: i,
      ref: c !== void 0 ? c : null,
      props: s
    };
  }
  return z.Fragment = r, z.jsx = a, z.jsxs = a, z;
}
var M = {};
var pe;
function Ue() {
  return pe || (pe = 1, process.env.NODE_ENV !== "production" && (function() {
    function o(e) {
      if (e == null) return null;
      if (typeof e == "function")
        return e.$$typeof === x ? null : e.displayName || e.name || null;
      if (typeof e == "string") return e;
      switch (e) {
        case _:
          return "Fragment";
        case N:
          return "Profiler";
        case B:
          return "StrictMode";
        case J:
          return "Suspense";
        case v:
          return "SuspenseList";
        case E:
          return "Activity";
      }
      if (typeof e == "object")
        switch (typeof e.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), e.$$typeof) {
          case H:
            return "Portal";
          case X:
            return e.displayName || "Context";
          case V:
            return (e._context.displayName || "Context") + ".Consumer";
          case q:
            var t = e.render;
            return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
          case A:
            return t = e.displayName || null, t !== null ? t : o(e.type) || "Memo";
          case k:
            t = e._payload, e = e._init;
            try {
              return o(e(t));
            } catch {
            }
        }
      return null;
    }
    function r(e) {
      return "" + e;
    }
    function a(e) {
      try {
        r(e);
        var t = !1;
      } catch {
        t = !0;
      }
      if (t) {
        t = console;
        var f = t.error, d = typeof Symbol == "function" && Symbol.toStringTag && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return f.call(
          t,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          d
        ), r(e);
      }
    }
    function n(e) {
      if (e === _) return "<>";
      if (typeof e == "object" && e !== null && e.$$typeof === k)
        return "<...>";
      try {
        var t = o(e);
        return t ? "<" + t + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function c() {
      var e = l.A;
      return e === null ? null : e.getOwner();
    }
    function s() {
      return Error("react-stack-top-frame");
    }
    function i(e) {
      if (y.call(e, "key")) {
        var t = Object.getOwnPropertyDescriptor(e, "key").get;
        if (t && t.isReactWarning) return !1;
      }
      return e.key !== void 0;
    }
    function S(e, t) {
      function f() {
        w || (w = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          t
        ));
      }
      f.isReactWarning = !0, Object.defineProperty(e, "key", {
        get: f,
        configurable: !0
      });
    }
    function U() {
      var e = o(this.type);
      return Z[e] || (Z[e] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), e = this.props.ref, e !== void 0 ? e : null;
    }
    function O(e, t, f, d, ee, ue) {
      var m = f.ref;
      return e = {
        $$typeof: G,
        type: e,
        key: t,
        props: f,
        _owner: d
      }, (m !== void 0 ? m : null) !== null ? Object.defineProperty(e, "ref", {
        enumerable: !1,
        get: U
      }) : Object.defineProperty(e, "ref", { enumerable: !1, value: null }), e._store = {}, Object.defineProperty(e._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(e, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty(e, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: ee
      }), Object.defineProperty(e, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: ue
      }), Object.freeze && (Object.freeze(e.props), Object.freeze(e)), e;
    }
    function I(e, t, f, d, ee, ue) {
      var m = t.children;
      if (m !== void 0)
        if (d)
          if (g(m)) {
            for (d = 0; d < m.length; d++)
              W(m[d]);
            Object.freeze && Object.freeze(m);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else W(m);
      if (y.call(t, "key")) {
        m = o(e);
        var j = Object.keys(t).filter(function(ge) {
          return ge !== "key";
        });
        d = 0 < j.length ? "{key: someKey, " + j.join(": ..., ") + ": ...}" : "{key: someKey}", de[m + d] || (j = 0 < j.length ? "{" + j.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          d,
          m,
          j,
          m
        ), de[m + d] = !0);
      }
      if (m = null, f !== void 0 && (a(f), m = "" + f), i(t) && (a(t.key), m = "" + t.key), "key" in t) {
        f = {};
        for (var se in t)
          se !== "key" && (f[se] = t[se]);
      } else f = t;
      return m && S(
        f,
        typeof e == "function" ? e.displayName || e.name || "Unknown" : e
      ), O(
        e,
        m,
        f,
        c(),
        ee,
        ue
      );
    }
    function W(e) {
      $(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e !== null && e.$$typeof === k && (e._payload.status === "fulfilled" ? $(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
    }
    function $(e) {
      return typeof e == "object" && e !== null && e.$$typeof === G;
    }
    var P = Se, G = Symbol.for("react.transitional.element"), H = Symbol.for("react.portal"), _ = Symbol.for("react.fragment"), B = Symbol.for("react.strict_mode"), N = Symbol.for("react.profiler"), V = Symbol.for("react.consumer"), X = Symbol.for("react.context"), q = Symbol.for("react.forward_ref"), J = Symbol.for("react.suspense"), v = Symbol.for("react.suspense_list"), A = Symbol.for("react.memo"), k = Symbol.for("react.lazy"), E = Symbol.for("react.activity"), x = Symbol.for("react.client.reference"), l = P.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, y = Object.prototype.hasOwnProperty, g = Array.isArray, h = console.createTask ? console.createTask : function() {
      return null;
    };
    P = {
      react_stack_bottom_frame: function(e) {
        return e();
      }
    };
    var w, Z = {}, Q = P.react_stack_bottom_frame.bind(
      P,
      s
    )(), K = h(n(s)), de = {};
    M.Fragment = _, M.jsx = function(e, t, f) {
      var d = 1e4 > l.recentlyCreatedOwnerStacks++;
      return I(
        e,
        t,
        f,
        !1,
        d ? Error("react-stack-top-frame") : Q,
        d ? h(n(e)) : K
      );
    }, M.jsxs = function(e, t, f) {
      var d = 1e4 > l.recentlyCreatedOwnerStacks++;
      return I(
        e,
        t,
        f,
        !0,
        d ? Error("react-stack-top-frame") : Q,
        d ? h(n(e)) : K
      );
    };
  })()), M;
}
var ye;
function Oe() {
  return ye || (ye = 1, process.env.NODE_ENV === "production" ? re.exports = De() : re.exports = Ue()), re.exports;
}
var L = Oe(), Ve = `uniform sampler2D tFluid;

uniform vec3 uColor;
uniform vec3 uBackgroundColor;

uniform float uDistort;
uniform float uIntensity;
uniform float uRainbow;
uniform float uBlend;
uniform float uShowBackground;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

    vec3 fluidColor = texture2D(tFluid, uv).rgb;

    vec2 distortedUv = uv - fluidColor.rg * uDistort * 0.001;

    vec4 texture = texture2D(inputBuffer, distortedUv);

    float intensity = length(fluidColor) * uIntensity * 0.0001;

    vec3 selectedColor = uColor * length(fluidColor);

    vec4 colorForFluidEffect = vec4(uRainbow == 1.0 ? fluidColor : selectedColor, 1.0);

    vec4 computedBgColor = uShowBackground != 0.0 ? vec4(uBackgroundColor, 1.0) : vec4(0.0, 0.0, 0.0, 0.0);

    outputColor = mix(texture, colorForFluidEffect, intensity);

    vec4 computedFluidColor = mix(texture, colorForFluidEffect, uBlend * 0.01);

    vec4 finalColor;

    if(texture.a < 0.1) {
        finalColor = mix(computedBgColor, colorForFluidEffect, intensity);
    } else {
        finalColor = mix(computedFluidColor, computedBgColor, 1.0 - texture.a);
    }

    outputColor = finalColor;
}`;
const te = (o) => {
  const r = new be(o);
  return new ve(r.r, r.g, r.b);
}, le = (o, r) => Math.pow(o, r * fe);
class ke extends he {
  state;
  constructor(r) {
    const a = {
      tFluid: new b(r.tFluid),
      uDistort: new b(r.distortion),
      uRainbow: new b(r.rainbow),
      uIntensity: new b(r.intensity),
      uBlend: new b(r.blend),
      uShowBackground: new b(r.showBackground),
      uColor: new b(te(r.fluidColor)),
      uBackgroundColor: new b(te(r.backgroundColor))
    };
    super("FluidEffect", Ve, {
      blendFunction: r.blendFunction,
      attributes: Re.CONVOLUTION,
      uniforms: new Map(Object.entries(a))
    }), this.state = r;
  }
  updateUniform(r, a) {
    const n = this.uniforms.get(r);
    n && (n.value = a);
  }
  update() {
    this.updateUniform("uIntensity", this.state.intensity), this.updateUniform("uDistort", this.state.distortion), this.updateUniform("uRainbow", this.state.rainbow), this.updateUniform("uBlend", this.state.blend), this.updateUniform("uShowBackground", this.state.showBackground), this.updateUniform("uColor", te(this.state.fluidColor)), this.updateUniform("uBackgroundColor", te(this.state.backgroundColor));
  }
}
const Pe = _e(function(r, a) {
  const n = ie(() => new ke(r), []);
  return Y(() => {
    n.state = { ...r }, n.update();
  }, [n, r]), Y(() => () => {
    n.dispose?.();
  }, [n]), /* @__PURE__ */ L.jsx("primitive", { ref: a, object: n, dispose: null });
}), ce = (o, r, a) => {
  const n = ae(o, r, a), c = ae(o, r, a), s = D({
    read: n,
    write: c,
    swap: () => {
      const i = s.read;
      s.read = s.write, s.write = i;
    },
    dispose: () => {
      n.dispose(), c.dispose();
    },
    setGenerateMipmaps: (i) => {
      n.texture.generateMipmaps = i, c.texture.generateMipmaps = i;
    }
  }).current;
  return s;
}, Be = () => {
  const o = ce(u.dyeRes, u.dyeRes, {
    type: p.HalfFloatType,
    format: p.RGBAFormat,
    minFilter: p.LinearFilter,
    depthBuffer: !1
  }), r = ce(u.simRes, u.simRes, {
    type: p.HalfFloatType,
    format: p.RGFormat,
    minFilter: p.LinearFilter,
    depthBuffer: !1
  }), a = ce(u.simRes, u.simRes, {
    type: p.HalfFloatType,
    format: p.RedFormat,
    minFilter: p.NearestFilter,
    depthBuffer: !1
  }), n = ae(u.simRes, u.simRes, {
    type: p.HalfFloatType,
    format: p.RedFormat,
    minFilter: p.NearestFilter,
    depthBuffer: !1
  }), c = ae(u.simRes, u.simRes, {
    type: p.HalfFloatType,
    format: p.RedFormat,
    minFilter: p.NearestFilter,
    depthBuffer: !1
  }), s = ie(() => ({
    density: o,
    velocity: r,
    pressure: a,
    divergence: n,
    curl: c
  }), [c, o, n, a, r]);
  return Y(() => {
    for (const i of Object.values(s))
      "write" in i ? i.setGenerateMipmaps(!1) : i.texture.generateMipmaps = !1;
    return () => {
      for (const i of Object.values(s))
        i.dispose();
    };
  }, [s]), s;
};
var F = `#ifdef USE_V_UV
  varying vec2 vUv;
#endif

#ifdef USE_OFFSETS
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform vec2 texelSize;
#endif

void main() {
  #ifdef USE_V_UV
    vUv = uv;
  #endif

  #ifdef USE_OFFSETS
    vL = uv - vec2(texelSize.x, 0.0);
    vR = uv + vec2(texelSize.x, 0.0);
    vT = uv + vec2(0.0, texelSize.y);
    vB = uv - vec2(0.0, texelSize.y);
  #endif

  gl_Position = vec4(position, 1.0);
}`, Ae = `precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uClearValue;

void main() { gl_FragColor = uClearValue * texture2D(uTexture, vUv); }`, je = `precision highp float;

varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

uniform sampler2D uVelocity;

void main() {
    float L = texture2D(uVelocity, vL).y;

    float R = texture2D(uVelocity, vR).y;

    float T = texture2D(uVelocity, vT).x;

    float B = texture2D(uVelocity, vB).x;

    float vorticity = R - L - T + B;

    gl_FragColor = vec4(vorticity, 0.0, 0.0, 1.0);
}`, Le = `precision highp float;

varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;

uniform sampler2D uVelocity;

void main() {
    float L = texture2D(uVelocity, vL).x;

    float R = texture2D(uVelocity, vR).x;

    float T = texture2D(uVelocity, vT).y;

    float B = texture2D(uVelocity, vB).y;

    vec2 C = texture2D(uVelocity, vUv).xy;

    if(vL.x < 0.0) {
        L = -C.x;
    }

    if(vR.x > 1.0) {
        R = -C.x;
    }

    if(vT.y > 1.0) {
        T = -C.y;
    }

    if(vB.y < 0.0) {
        B = -C.y;
    }

    float div = 0.5 * (R - L + T - B);

    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}`, Ne = `precision highp float;

varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;

uniform sampler2D uPressure;
uniform sampler2D uVelocity;

void main() {
    float L = texture2D(uPressure, vL).x;

    float R = texture2D(uPressure, vR).x;

    float T = texture2D(uPressure, vT).x;

    float B = texture2D(uPressure, vB).x;

    vec2 velocity = texture2D(uVelocity, vUv).xy;

    velocity.xy -= vec2(R - L, T - B);

    gl_FragColor = vec4(velocity, 0.0, 1.0);
}`, ze = `precision highp float;

varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;

uniform sampler2D uPressure;
uniform sampler2D uDivergence;

void main() {
    float L = texture2D(uPressure, vL).x;

    float R = texture2D(uPressure, vR).x;

    float T = texture2D(uPressure, vT).x;

    float B = texture2D(uPressure, vB).x;

    float C = texture2D(uPressure, vUv).x;

    float divergence = texture2D(uDivergence, vUv).x;

    float pressure = (L + R + B + T - divergence) * 0.25;

    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}`, Me = `varying vec2 vUv;

uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 uColor;
uniform vec2 uPointer;
uniform float uRadius;

void main() {
    vec2 p = vUv - uPointer.xy;

    p.x *= aspectRatio;

    vec3 splat = exp(-dot(p, p) / uRadius) * uColor;

    vec3 base = texture2D(uTarget, vUv).xyz;

    gl_FragColor = vec4(base + splat, 1.0);
}`, Ye = `precision highp float;

varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float uDissipation;

void main() {
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;

    gl_FragColor = uDissipation * texture2D(uSource, coord);

    gl_FragColor.a = 1.0;
}`, Ie = `precision highp float;

varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float uCurlValue;
uniform float dt;

void main() {
    float L = texture2D(uCurl, vL).x;

    float R = texture2D(uCurl, vR).x;

    float T = texture2D(uCurl, vT).x;

    float B = texture2D(uCurl, vB).x;

    float C = texture2D(uCurl, vUv).x;

    vec2 force = vec2(abs(T) - abs(B), abs(R) - abs(L)) * 0.5;

    force /= length(force) + 1.;

    force *= uCurlValue * C;

    force.y *= -1.;

    vec2 vel = texture2D(uVelocity, vUv).xy;

    gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
}`;
const We = () => {
  const o = oe((a) => a.size), r = ie(() => {
    const a = new C({
      name: "Fluid/Advection",
      uniforms: {
        uVelocity: {
          value: new R()
        },
        uSource: {
          value: new R()
        },
        dt: {
          value: 1 / fe
        },
        uDissipation: {
          value: 1
        },
        texelSize: { value: new T() }
      },
      fragmentShader: Ye,
      vertexShader: F,
      defines: {
        USE_V_UV: ""
      },
      depthTest: !1,
      depthWrite: !1
    }), n = new C({
      name: "Fluid/Clear",
      uniforms: {
        uTexture: {
          value: new R()
        },
        uClearValue: {
          value: u.pressure
        },
        texelSize: {
          value: new T()
        }
      },
      fragmentShader: Ae,
      vertexShader: F,
      defines: {
        USE_V_UV: ""
      },
      depthTest: !1,
      depthWrite: !1
    }), c = new C({
      name: "Fluid/Curl",
      uniforms: {
        uVelocity: {
          value: new R()
        },
        texelSize: {
          value: new T()
        }
      },
      fragmentShader: je,
      vertexShader: F,
      defines: {
        USE_OFFSETS: ""
      },
      depthTest: !1,
      depthWrite: !1
    }), s = new C({
      name: "Fluid/Divergence",
      uniforms: {
        uVelocity: {
          value: new R()
        },
        texelSize: {
          value: new T()
        }
      },
      fragmentShader: Le,
      vertexShader: F,
      defines: {
        USE_V_UV: "",
        USE_OFFSETS: ""
      },
      depthTest: !1,
      depthWrite: !1
    }), i = new C({
      name: "Fluid/GradientSubtract",
      uniforms: {
        uPressure: {
          value: new R()
        },
        uVelocity: {
          value: new R()
        },
        texelSize: {
          value: new T()
        }
      },
      fragmentShader: Ne,
      vertexShader: F,
      defines: {
        USE_V_UV: "",
        USE_OFFSETS: ""
      },
      depthTest: !1,
      depthWrite: !1
    }), S = new C({
      name: "Fluid/Pressure",
      uniforms: {
        uPressure: {
          value: new R()
        },
        uDivergence: {
          value: new R()
        },
        texelSize: {
          value: new T()
        }
      },
      fragmentShader: ze,
      vertexShader: F,
      defines: {
        USE_V_UV: "",
        USE_OFFSETS: ""
      },
      depthTest: !1,
      depthWrite: !1
    }), U = new C({
      name: "Fluid/Splat",
      uniforms: {
        uTarget: {
          value: new R()
        },
        aspectRatio: {
          value: o.width / o.height
        },
        uColor: {
          value: new ve()
        },
        uPointer: {
          value: new T()
        },
        uRadius: {
          value: u.radius / 100
        },
        texelSize: {
          value: new T()
        }
      },
      fragmentShader: Me,
      vertexShader: F,
      defines: {
        USE_V_UV: ""
      },
      depthTest: !1,
      depthWrite: !1
    }), O = new C({
      name: "Fluid/Vorticity",
      uniforms: {
        uVelocity: {
          value: new R()
        },
        uCurl: {
          value: new R()
        },
        uCurlValue: {
          value: u.curl
        },
        dt: {
          value: 1 / fe
        },
        texelSize: {
          value: new T()
        }
      },
      fragmentShader: Ie,
      vertexShader: F,
      defines: {
        USE_V_UV: "",
        USE_OFFSETS: ""
      },
      depthTest: !1,
      depthWrite: !1
    });
    return {
      splat: U,
      curl: c,
      clear: n,
      divergence: s,
      pressure: S,
      gradientSubstract: i,
      advection: a,
      vorticity: O
    };
  }, [o]);
  return Y(() => {
    for (const a of Object.values(r)) {
      const n = o.width / (o.height + 400);
      a.uniforms.texelSize.value.set(
        1 / (u.simRes * n),
        1 / u.simRes
      );
    }
    return () => {
      for (const a of Object.values(r))
        a.dispose();
    };
  }, [r, o]), r;
}, $e = ({ force: o }) => {
  const r = oe((i) => i.size), a = D([]).current, n = D(new T()), c = D(!1), s = ne(
    (i) => {
      const S = i.x - n.current.x, U = i.y - n.current.y;
      if (!c.current) {
        c.current = !0, n.current.set(i.x, i.y);
        return;
      }
      n.current.set(i.x, i.y);
      const O = {
        mouseX: i.x / r.width,
        mouseY: 1 - i.y / r.height,
        velocityX: S * o,
        velocityY: -U * o
      };
      a.push(O);
    },
    [o, r.height, r.width, a]
  );
  return Y(() => (addEventListener("pointermove", s), () => {
    removeEventListener("pointermove", s);
  }), [s]), a;
}, Ze = ({
  blend: o = u.blend,
  force: r = u.force,
  radius: a = u.radius,
  curl: n = u.curl,
  swirl: c = u.swirl,
  intensity: s = u.intensity,
  distortion: i = u.distortion,
  fluidColor: S = u.fluidColor,
  backgroundColor: U = u.backgroundColor,
  showBackground: O = u.showBackground,
  rainbow: I = u.rainbow,
  pressure: W = u.pressure,
  densityDissipation: $ = u.densityDissipation,
  velocityDissipation: P = u.velocityDissipation,
  blendFunction: G = u.blendFunction
}) => {
  const H = oe((y) => y.size), _ = oe((y) => y.gl), [B] = Te(() => new Ce()), N = ie(() => new Fe(), []), V = D(null), X = D(null), q = D(new T()), J = D(new ve()), v = Be(), A = We(), k = $e({ force: r }), E = ne(
    (y) => {
      V.current && (V.current.material = A[y], V.current.material.needsUpdate = !0);
    },
    [A]
  ), x = ne(
    (y) => {
      const g = v[y];
      "write" in g ? (_.setRenderTarget(g.write), _.clear(), _.render(B, N), g.swap()) : (_.setRenderTarget(g), _.clear(), _.render(B, N));
    },
    [N, B, v, _]
  ), l = ne(
    (y, g, h) => {
      const w = A[y];
      w && w.uniforms[g] && (w.uniforms[g].value = h);
    },
    [A]
  );
  return Ee((y, g) => {
    if (!(!V.current || !X.current)) {
      for (let h = k.length - 1; h >= 0; h--) {
        const { mouseX: w, mouseY: Z, velocityX: Q, velocityY: K } = k[h];
        q.current.set(w, Z), J.current.set(Q, K, 10), E("splat"), l("splat", "uTarget", v.velocity.read.texture), l("splat", "uPointer", q.current), l("splat", "uColor", J.current), l("splat", "uRadius", a / 100), x("velocity"), l("splat", "uTarget", v.density.read.texture), x("density"), k.pop();
      }
      E("curl"), l("curl", "uVelocity", v.velocity.read.texture), x("curl"), E("vorticity"), l("vorticity", "uVelocity", v.velocity.read.texture), l("vorticity", "uCurl", v.curl.texture), l("vorticity", "uCurlValue", n), x("velocity"), E("divergence"), l("divergence", "uVelocity", v.velocity.read.texture), x("divergence"), E("clear"), l("clear", "uTexture", v.pressure.read.texture), l("clear", "uClearValue", le(W, g)), x("pressure"), E("pressure"), l("pressure", "uDivergence", v.divergence.texture);
      for (let h = 0; h < c; h++)
        l("pressure", "uPressure", v.pressure.read.texture), x("pressure");
      E("gradientSubstract"), l("gradientSubstract", "uPressure", v.pressure.read.texture), l("gradientSubstract", "uVelocity", v.velocity.read.texture), x("velocity"), E("advection"), l("advection", "uVelocity", v.velocity.read.texture), l("advection", "uSource", v.velocity.read.texture), l("advection", "uDissipation", le(P, g)), x("velocity"), l("advection", "uVelocity", v.velocity.read.texture), l("advection", "uSource", v.density.read.texture), l("advection", "uDissipation", le($, g)), x("density");
    }
  }), /* @__PURE__ */ L.jsxs(L.Fragment, { children: [
    we(
      /* @__PURE__ */ L.jsx("mesh", { ref: V, scale: [H.width, H.height, 1], children: /* @__PURE__ */ L.jsx("planeGeometry", { args: [2, 2] }) }),
      B
    ),
    /* @__PURE__ */ L.jsx(
      Pe,
      {
        blendFunction: G,
        intensity: s,
        rainbow: I,
        distortion: i,
        backgroundColor: U,
        blend: o,
        fluidColor: S,
        showBackground: O,
        ref: X,
        tFluid: v.density.read.texture
      }
    )
  ] });
};
export {
  u as DEFAULT_CONFIG,
  Ze as Fluid
};
//# sourceMappingURL=index.es.js.map
