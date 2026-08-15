(function(S,D){typeof exports=="object"&&typeof module<"u"?D(exports,require("postprocessing"),require("react"),require("@react-three/fiber"),require("three"),require("@react-three/drei")):typeof define=="function"&&define.amd?define(["exports","postprocessing","react","@react-three/fiber","three","@react-three/drei"],D):(S=typeof globalThis<"u"?globalThis:S||self,D(S.reactFluidDistortion={},S.postprocessing,S.React,S.reactThreeFiber,S.THREE,S.drei))})(this,(function(S,D,v,P,r,Y){"use strict";function ve(n){const t=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(n){for(const a in n)if(a!=="default"){const u=Object.getOwnPropertyDescriptor(n,a);Object.defineProperty(t,a,u.get?u:{enumerable:!0,get:()=>n[a]})}}return t.default=n,Object.freeze(t)}const g=ve(r),i={blend:5,intensity:2,force:1.1,distortion:.4,curl:1.9,radius:.3,swirl:4,pressure:.8,densityDissipation:.96,velocityDissipation:1,fluidColor:"#3300ff",backgroundColor:"#070410",showBackground:!0,rainbow:!1,dyeRes:512,simRes:128,blendFunction:D.BlendFunction.NORMAL},ne=60;var I={exports:{}},N={};var se;function de(){if(se)return N;se=1;var n=Symbol.for("react.transitional.element"),t=Symbol.for("react.fragment");function a(u,f,l){var s=null;if(l!==void 0&&(s=""+l),f.key!==void 0&&(s=""+f.key),"key"in f){l={};for(var w in f)w!=="key"&&(l[w]=f[w])}else l=f;return f=l.ref,{$$typeof:n,type:u,key:s,ref:f!==void 0?f:null,props:l}}return N.Fragment=t,N.jsx=a,N.jsxs=a,N}var z={};var le;function me(){return le||(le=1,process.env.NODE_ENV!=="production"&&(function(){function n(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===_?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case F:return"Fragment";case E:return"Profiler";case A:return"StrictMode";case $:return"Suspense";case m:return"SuspenseList";case C:return"Activity"}if(typeof e=="object")switch(typeof e.tag=="number"&&console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."),e.$$typeof){case Q:return"Portal";case K:return e.displayName||"Context";case O:return(e._context.displayName||"Context")+".Consumer";case q:var o=e.render;return e=e.displayName,e||(e=o.displayName||o.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case L:return o=e.displayName||null,o!==null?o:n(e.type)||"Memo";case k:o=e._payload,e=e._init;try{return n(e(o))}catch{}}return null}function t(e){return""+e}function a(e){try{t(e);var o=!1}catch{o=!0}if(o){o=console;var d=o.error,p=typeof Symbol=="function"&&Symbol.toStringTag&&e[Symbol.toStringTag]||e.constructor.name||"Object";return d.call(o,"The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",p),t(e)}}function u(e){if(e===F)return"<>";if(typeof e=="object"&&e!==null&&e.$$typeof===k)return"<...>";try{var o=n(e);return o?"<"+o+">":"<...>"}catch{return"<...>"}}function f(){var e=c.A;return e===null?null:e.getOwner()}function l(){return Error("react-stack-top-frame")}function s(e){if(h.call(e,"key")){var o=Object.getOwnPropertyDescriptor(e,"key").get;if(o&&o.isReactWarning)return!1}return e.key!==void 0}function w(e,o){function d(){T||(T=!0,console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",o))}d.isReactWarning=!0,Object.defineProperty(e,"key",{get:d,configurable:!0})}function U(){var e=n(this.type);return H[e]||(H[e]=!0,console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.")),e=this.props.ref,e!==void 0?e:null}function V(e,o,d,p,re,ue){var y=d.ref;return e={$$typeof:Z,type:e,key:o,props:d,_owner:p},(y!==void 0?y:null)!==null?Object.defineProperty(e,"ref",{enumerable:!1,get:U}):Object.defineProperty(e,"ref",{enumerable:!1,value:null}),e._store={},Object.defineProperty(e._store,"validated",{configurable:!1,enumerable:!1,writable:!0,value:0}),Object.defineProperty(e,"_debugInfo",{configurable:!1,enumerable:!1,writable:!0,value:null}),Object.defineProperty(e,"_debugStack",{configurable:!1,enumerable:!1,writable:!0,value:re}),Object.defineProperty(e,"_debugTask",{configurable:!1,enumerable:!1,writable:!0,value:ue}),Object.freeze&&(Object.freeze(e.props),Object.freeze(e)),e}function G(e,o,d,p,re,ue){var y=o.children;if(y!==void 0)if(p)if(x(y)){for(p=0;p<y.length;p++)X(y[p]);Object.freeze&&Object.freeze(y)}else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");else X(y);if(h.call(o,"key")){y=n(e);var M=Object.keys(o).filter(function(Oe){return Oe!=="key"});p=0<M.length?"{key: someKey, "+M.join(": ..., ")+": ...}":"{key: someKey}",fe[y+p]||(M=0<M.length?"{"+M.join(": ..., ")+": ...}":"{}",console.error(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,p,y,M,y),fe[y+p]=!0)}if(y=null,d!==void 0&&(a(d),y=""+d),s(o)&&(a(o.key),y=""+o.key),"key"in o){d={};for(var ie in o)ie!=="key"&&(d[ie]=o[ie])}else d=o;return y&&w(d,typeof e=="function"?e.displayName||e.name||"Unknown":e),V(e,y,d,f(),re,ue)}function X(e){J(e)?e._store&&(e._store.validated=1):typeof e=="object"&&e!==null&&e.$$typeof===k&&(e._payload.status==="fulfilled"?J(e._payload.value)&&e._payload.value._store&&(e._payload.value._store.validated=1):e._store&&(e._store.validated=1))}function J(e){return typeof e=="object"&&e!==null&&e.$$typeof===Z}var j=v,Z=Symbol.for("react.transitional.element"),Q=Symbol.for("react.portal"),F=Symbol.for("react.fragment"),A=Symbol.for("react.strict_mode"),E=Symbol.for("react.profiler"),O=Symbol.for("react.consumer"),K=Symbol.for("react.context"),q=Symbol.for("react.forward_ref"),$=Symbol.for("react.suspense"),m=Symbol.for("react.suspense_list"),L=Symbol.for("react.memo"),k=Symbol.for("react.lazy"),C=Symbol.for("react.activity"),_=Symbol.for("react.client.reference"),c=j.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,h=Object.prototype.hasOwnProperty,x=Array.isArray,b=console.createTask?console.createTask:function(){return null};j={react_stack_bottom_frame:function(e){return e()}};var T,H={},ee=j.react_stack_bottom_frame.bind(j,l)(),te=b(u(l)),fe={};z.Fragment=F,z.jsx=function(e,o,d){var p=1e4>c.recentlyCreatedOwnerStacks++;return G(e,o,d,!1,p?Error("react-stack-top-frame"):ee,p?b(u(e)):te)},z.jsxs=function(e,o,d){var p=1e4>c.recentlyCreatedOwnerStacks++;return G(e,o,d,!0,p?Error("react-stack-top-frame"):ee,p?b(u(e)):te)}})()),z}var ce;function pe(){return ce||(ce=1,process.env.NODE_ENV==="production"?I.exports=de():I.exports=me()),I.exports}var B=pe(),ye=`uniform sampler2D tFluid;

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
}`;const W=n=>{const t=new r.Color(n);return new r.Vector3(t.r,t.g,t.b)},oe=(n,t)=>Math.pow(n,t*ne);class ge extends D.Effect{state;constructor(t){const a={tFluid:new r.Uniform(t.tFluid),uDistort:new r.Uniform(t.distortion),uRainbow:new r.Uniform(t.rainbow),uIntensity:new r.Uniform(t.intensity),uBlend:new r.Uniform(t.blend),uShowBackground:new r.Uniform(t.showBackground),uColor:new r.Uniform(W(t.fluidColor)),uBackgroundColor:new r.Uniform(W(t.backgroundColor))};super("FluidEffect",ye,{blendFunction:t.blendFunction,attributes:D.EffectAttribute.CONVOLUTION,uniforms:new Map(Object.entries(a))}),this.state=t}updateUniform(t,a){const u=this.uniforms.get(t);u&&(u.value=a)}update(){this.updateUniform("uIntensity",this.state.intensity),this.updateUniform("uDistort",this.state.distortion),this.updateUniform("uRainbow",this.state.rainbow),this.updateUniform("uBlend",this.state.blend),this.updateUniform("uShowBackground",this.state.showBackground),this.updateUniform("uColor",W(this.state.fluidColor)),this.updateUniform("uBackgroundColor",W(this.state.backgroundColor))}}const he=v.forwardRef(function(t,a){const u=v.useMemo(()=>new ge(t),[]);return v.useEffect(()=>{u.state={...t},u.update()},[u,t]),v.useEffect(()=>()=>{u.dispose?.()},[u]),B.jsx("primitive",{ref:a,object:u,dispose:null})}),ae=(n,t,a)=>{const u=Y.useFBO(n,t,a),f=Y.useFBO(n,t,a),l=v.useRef({read:u,write:f,swap:()=>{const s=l.read;l.read=l.write,l.write=s},dispose:()=>{u.dispose(),f.dispose()},setGenerateMipmaps:s=>{u.texture.generateMipmaps=s,f.texture.generateMipmaps=s}}).current;return l},xe=()=>{const n=ae(i.dyeRes,i.dyeRes,{type:g.HalfFloatType,format:g.RGBAFormat,minFilter:g.LinearFilter,depthBuffer:!1}),t=ae(i.simRes,i.simRes,{type:g.HalfFloatType,format:g.RGFormat,minFilter:g.LinearFilter,depthBuffer:!1}),a=ae(i.simRes,i.simRes,{type:g.HalfFloatType,format:g.RedFormat,minFilter:g.NearestFilter,depthBuffer:!1}),u=Y.useFBO(i.simRes,i.simRes,{type:g.HalfFloatType,format:g.RedFormat,minFilter:g.NearestFilter,depthBuffer:!1}),f=Y.useFBO(i.simRes,i.simRes,{type:g.HalfFloatType,format:g.RedFormat,minFilter:g.NearestFilter,depthBuffer:!1}),l=v.useMemo(()=>({density:n,velocity:t,pressure:a,divergence:u,curl:f}),[f,n,u,a,t]);return v.useEffect(()=>{for(const s of Object.values(l))"write"in s?s.setGenerateMipmaps(!1):s.texture.generateMipmaps=!1;return()=>{for(const s of Object.values(l))s.dispose()}},[l]),l};var R=`#ifdef USE_V_UV
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
}`,Se=`precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uClearValue;

void main() { gl_FragColor = uClearValue * texture2D(uTexture, vUv); }`,_e=`precision highp float;

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
}`,be=`precision highp float;

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
}`,we=`precision highp float;

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
}`,Fe=`precision highp float;

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
}`,Ce=`varying vec2 vUv;

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
}`,Re=`precision highp float;

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
}`,Te=`precision highp float;

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
}`;const De=()=>{const n=P.useThree(a=>a.size),t=v.useMemo(()=>{const a=new r.ShaderMaterial({name:"Fluid/Advection",uniforms:{uVelocity:{value:new r.Texture},uSource:{value:new r.Texture},dt:{value:1/ne},uDissipation:{value:1},texelSize:{value:new r.Vector2}},fragmentShader:Re,vertexShader:R,defines:{USE_V_UV:""},depthTest:!1,depthWrite:!1}),u=new r.ShaderMaterial({name:"Fluid/Clear",uniforms:{uTexture:{value:new r.Texture},uClearValue:{value:i.pressure},texelSize:{value:new r.Vector2}},fragmentShader:Se,vertexShader:R,defines:{USE_V_UV:""},depthTest:!1,depthWrite:!1}),f=new r.ShaderMaterial({name:"Fluid/Curl",uniforms:{uVelocity:{value:new r.Texture},texelSize:{value:new r.Vector2}},fragmentShader:_e,vertexShader:R,defines:{USE_OFFSETS:""},depthTest:!1,depthWrite:!1}),l=new r.ShaderMaterial({name:"Fluid/Divergence",uniforms:{uVelocity:{value:new r.Texture},texelSize:{value:new r.Vector2}},fragmentShader:be,vertexShader:R,defines:{USE_V_UV:"",USE_OFFSETS:""},depthTest:!1,depthWrite:!1}),s=new r.ShaderMaterial({name:"Fluid/GradientSubtract",uniforms:{uPressure:{value:new r.Texture},uVelocity:{value:new r.Texture},texelSize:{value:new r.Vector2}},fragmentShader:we,vertexShader:R,defines:{USE_V_UV:"",USE_OFFSETS:""},depthTest:!1,depthWrite:!1}),w=new r.ShaderMaterial({name:"Fluid/Pressure",uniforms:{uPressure:{value:new r.Texture},uDivergence:{value:new r.Texture},texelSize:{value:new r.Vector2}},fragmentShader:Fe,vertexShader:R,defines:{USE_V_UV:"",USE_OFFSETS:""},depthTest:!1,depthWrite:!1}),U=new r.ShaderMaterial({name:"Fluid/Splat",uniforms:{uTarget:{value:new r.Texture},aspectRatio:{value:n.width/n.height},uColor:{value:new r.Vector3},uPointer:{value:new r.Vector2},uRadius:{value:i.radius/100},texelSize:{value:new r.Vector2}},fragmentShader:Ce,vertexShader:R,defines:{USE_V_UV:""},depthTest:!1,depthWrite:!1}),V=new r.ShaderMaterial({name:"Fluid/Vorticity",uniforms:{uVelocity:{value:new r.Texture},uCurl:{value:new r.Texture},uCurlValue:{value:i.curl},dt:{value:1/ne},texelSize:{value:new r.Vector2}},fragmentShader:Te,vertexShader:R,defines:{USE_V_UV:"",USE_OFFSETS:""},depthTest:!1,depthWrite:!1});return{splat:U,curl:f,clear:u,divergence:l,pressure:w,gradientSubstract:s,advection:a,vorticity:V}},[n]);return v.useEffect(()=>{for(const a of Object.values(t)){const u=n.width/(n.height+400);a.uniforms.texelSize.value.set(1/(i.simRes*u),1/i.simRes)}return()=>{for(const a of Object.values(t))a.dispose()}},[t,n]),t},Ue=({force:n})=>{const t=P.useThree(s=>s.size),a=v.useRef([]).current,u=v.useRef(new r.Vector2),f=v.useRef(!1),l=v.useCallback(s=>{const w=s.x-u.current.x,U=s.y-u.current.y;if(!f.current){f.current=!0,u.current.set(s.x,s.y);return}u.current.set(s.x,s.y);const V={mouseX:s.x/t.width,mouseY:1-s.y/t.height,velocityX:w*n,velocityY:-U*n};a.push(V)},[n,t.height,t.width,a]);return v.useEffect(()=>(addEventListener("pointermove",l),()=>{removeEventListener("pointermove",l)}),[l]),a},Ve=({blend:n=i.blend,force:t=i.force,radius:a=i.radius,curl:u=i.curl,swirl:f=i.swirl,intensity:l=i.intensity,distortion:s=i.distortion,fluidColor:w=i.fluidColor,backgroundColor:U=i.backgroundColor,showBackground:V=i.showBackground,rainbow:G=i.rainbow,pressure:X=i.pressure,densityDissipation:J=i.densityDissipation,velocityDissipation:j=i.velocityDissipation,blendFunction:Z=i.blendFunction})=>{const Q=P.useThree(h=>h.size),F=P.useThree(h=>h.gl),[A]=v.useState(()=>new r.Scene),E=v.useMemo(()=>new r.Camera,[]),O=v.useRef(null),K=v.useRef(null),q=v.useRef(new r.Vector2),$=v.useRef(new r.Vector3),m=xe(),L=De(),k=Ue({force:t}),C=v.useCallback(h=>{O.current&&(O.current.material=L[h],O.current.material.needsUpdate=!0)},[L]),_=v.useCallback(h=>{const x=m[h];"write"in x?(F.setRenderTarget(x.write),F.clear(),F.render(A,E),x.swap()):(F.setRenderTarget(x),F.clear(),F.render(A,E))},[E,A,m,F]),c=v.useCallback((h,x,b)=>{const T=L[h];T&&T.uniforms[x]&&(T.uniforms[x].value=b)},[L]);return P.useFrame((h,x)=>{if(!(!O.current||!K.current)){for(let b=k.length-1;b>=0;b--){const{mouseX:T,mouseY:H,velocityX:ee,velocityY:te}=k[b];q.current.set(T,H),$.current.set(ee,te,10),C("splat"),c("splat","uTarget",m.velocity.read.texture),c("splat","uPointer",q.current),c("splat","uColor",$.current),c("splat","uRadius",a/100),_("velocity"),c("splat","uTarget",m.density.read.texture),_("density"),k.pop()}C("curl"),c("curl","uVelocity",m.velocity.read.texture),_("curl"),C("vorticity"),c("vorticity","uVelocity",m.velocity.read.texture),c("vorticity","uCurl",m.curl.texture),c("vorticity","uCurlValue",u),_("velocity"),C("divergence"),c("divergence","uVelocity",m.velocity.read.texture),_("divergence"),C("clear"),c("clear","uTexture",m.pressure.read.texture),c("clear","uClearValue",oe(X,x)),_("pressure"),C("pressure"),c("pressure","uDivergence",m.divergence.texture);for(let b=0;b<f;b++)c("pressure","uPressure",m.pressure.read.texture),_("pressure");C("gradientSubstract"),c("gradientSubstract","uPressure",m.pressure.read.texture),c("gradientSubstract","uVelocity",m.velocity.read.texture),_("velocity"),C("advection"),c("advection","uVelocity",m.velocity.read.texture),c("advection","uSource",m.velocity.read.texture),c("advection","uDissipation",oe(j,x)),_("velocity"),c("advection","uVelocity",m.velocity.read.texture),c("advection","uSource",m.density.read.texture),c("advection","uDissipation",oe(J,x)),_("density")}}),B.jsxs(B.Fragment,{children:[P.createPortal(B.jsx("mesh",{ref:O,scale:[Q.width,Q.height,1],children:B.jsx("planeGeometry",{args:[2,2]})}),A),B.jsx(he,{blendFunction:Z,intensity:l,rainbow:G,distortion:s,backgroundColor:U,blend:n,fluidColor:w,showBackground:V,ref:K,tFluid:m.density.read.texture})]})};S.DEFAULT_CONFIG=i,S.Fluid=Ve,Object.defineProperty(S,Symbol.toStringTag,{value:"Module"})}));
//# sourceMappingURL=index.umd.js.map
