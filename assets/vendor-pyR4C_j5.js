function Re(x){return x&&x.__esModule&&Object.prototype.hasOwnProperty.call(x,"default")?x.default:x}var se={exports:{}},f={};/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var pe;function Se(){if(pe)return f;pe=1;var x=Symbol.for("react.transitional.element"),_=Symbol.for("react.portal"),C=Symbol.for("react.fragment"),g=Symbol.for("react.strict_mode"),R=Symbol.for("react.profiler"),S=Symbol.for("react.consumer"),H=Symbol.for("react.context"),q=Symbol.for("react.forward_ref"),A=Symbol.for("react.suspense"),$=Symbol.for("react.memo"),y=Symbol.for("react.lazy"),a=Symbol.for("react.activity"),M=Symbol.for("react.view_transition"),N=Symbol.iterator;function F(e){return e===null||typeof e!="object"?null:(e=N&&e[N]||e["@@iterator"],typeof e=="function"?e:null)}var D={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},w=Object.assign,ee={};function z(e,n,c){this.props=e,this.context=n,this.refs=ee,this.updater=c||D}z.prototype.isReactComponent={},z.prototype.setState=function(e,n){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,n,"setState")},z.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function V(){}V.prototype=z.prototype;function W(e,n,c){this.props=e,this.context=n,this.refs=ee,this.updater=c||D}var G=W.prototype=new V;G.constructor=W,w(G,z.prototype),G.isPureReactComponent=!0;var te=Array.isArray;function K(){}var m={H:null,A:null,T:null,S:null},re=Object.prototype.hasOwnProperty;function X(e,n,c){var o=c.ref;return{$$typeof:x,type:e,key:n,ref:o!==void 0?o:null,props:c}}function ae(e,n){return X(e.type,n,e.props)}function Q(e){return typeof e=="object"&&e!==null&&e.$$typeof===x}function oe(e){var n={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(c){return n[c]})}var J=/\/+/g;function U(e,n){return typeof e=="object"&&e!==null&&e.key!=null?oe(""+e.key):n.toString(36)}function ne(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(K,K):(e.status="pending",e.then(function(n){e.status==="pending"&&(e.status="fulfilled",e.value=n)},function(n){e.status==="pending"&&(e.status="rejected",e.reason=n)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function j(e,n,c,o,s){var u=typeof e;(u==="undefined"||u==="boolean")&&(e=null);var d=!1;if(e===null)d=!0;else switch(u){case"bigint":case"string":case"number":d=!0;break;case"object":switch(e.$$typeof){case x:case _:d=!0;break;case y:return d=e._init,j(d(e._payload),n,c,o,s)}}if(d)return s=s(e),d=o===""?"."+U(e,0):o,te(s)?(c="",d!=null&&(c=d.replace(J,"$&/")+"/"),j(s,n,c,"",function(E){return E})):s!=null&&(Q(s)&&(s=ae(s,c+(s.key==null||e&&e.key===s.key?"":(""+s.key).replace(J,"$&/")+"/")+d)),n.push(s)),1;d=0;var v=o===""?".":o+":";if(te(e))for(var p=0;p<e.length;p++)o=e[p],u=v+U(o,p),d+=j(o,n,c,u,s);else if(p=F(e),typeof p=="function")for(e=p.call(e),p=0;!(o=e.next()).done;)o=o.value,u=v+U(o,p++),d+=j(o,n,c,u,s);else if(u==="object"){if(typeof e.then=="function")return j(ne(e),n,c,o,s);throw n=String(e),Error("Objects are not valid as a React child (found: "+(n==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":n)+"). If you meant to render a collection of children, use an array instead.")}return d}function Z(e,n,c){if(e==null)return e;var o=[],s=0;return j(e,o,"","",function(u){return n.call(c,u,s++)}),o}function ce(e){if(e._status===-1){var n=e._result,c=n();c.then(function(o){(e._status===0||e._status===-1)&&(e._status=1,e._result=o,c.status===void 0&&(c.status="fulfilled",c.value=o))},function(o){(e._status===0||e._status===-1)&&(e._status=2,e._result=o,c.status===void 0&&(c.status="rejected",c.reason=o))}),e._status===-1&&(e._status=0,e._result=c)}if(e._status===1)return e._result.default;throw e._result}var r=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var n=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(n))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)};function t(e){var n=m.T,c={};c.types=n!==null?n.types:null,m.T=c;try{var o=e(),s=m.S;s!==null&&s(c,o),typeof o=="object"&&o!==null&&typeof o.then=="function"&&o.then(K,r)}catch(u){r(u)}finally{n!==null&&c.types!==null&&(n.types=c.types),m.T=n}}function l(e){var n=m.T;if(n!==null){var c=n.types;c===null?n.types=[e]:c.indexOf(e)===-1&&c.push(e)}else t(l.bind(null,e))}var h={map:Z,forEach:function(e,n,c){Z(e,function(){n.apply(this,arguments)},c)},count:function(e){var n=0;return Z(e,function(){n++}),n},toArray:function(e){return Z(e,function(n){return n})||[]},only:function(e){if(!Q(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};return f.Activity=a,f.Children=h,f.Component=z,f.Fragment=C,f.Profiler=R,f.PureComponent=W,f.StrictMode=g,f.Suspense=A,f.ViewTransition=M,f.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=m,f.__COMPILER_RUNTIME={__proto__:null,c:function(e){return m.H.useMemoCache(e)}},f.addTransitionType=l,f.cache=function(e){return function(){return e.apply(null,arguments)}},f.cacheSignal=function(){return null},f.cloneElement=function(e,n,c){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var o=w({},e.props),s=e.key;if(n!=null)for(u in n.key!==void 0&&(s=""+n.key),n)!re.call(n,u)||u==="key"||u==="__self"||u==="__source"||u==="ref"&&n.ref===void 0||(o[u]=n[u]);var u=arguments.length-2;if(u===1)o.children=c;else if(1<u){for(var d=Array(u),v=0;v<u;v++)d[v]=arguments[v+2];o.children=d}return X(e.type,s,o)},f.createContext=function(e){return e={$$typeof:H,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:S,_context:e},e},f.createElement=function(e,n,c){var o,s={},u=null;if(n!=null)for(o in n.key!==void 0&&(u=""+n.key),n)re.call(n,o)&&o!=="key"&&o!=="__self"&&o!=="__source"&&(s[o]=n[o]);var d=arguments.length-2;if(d===1)s.children=c;else if(1<d){for(var v=Array(d),p=0;p<d;p++)v[p]=arguments[p+2];s.children=v}if(e&&e.defaultProps)for(o in d=e.defaultProps,d)s[o]===void 0&&(s[o]=d[o]);return X(e,u,s)},f.createRef=function(){return{current:null}},f.forwardRef=function(e){return{$$typeof:q,render:e}},f.isValidElement=Q,f.lazy=function(e){return{$$typeof:y,_payload:{_status:-1,_result:e},_init:ce}},f.memo=function(e,n){return{$$typeof:$,type:e,compare:n===void 0?null:n}},f.startTransition=t,f.unstable_useCacheRefresh=function(){return m.H.useCacheRefresh()},f.use=function(e){return m.H.use(e)},f.useActionState=function(e,n,c){return m.H.useActionState(e,n,c)},f.useCallback=function(e,n){return m.H.useCallback(e,n)},f.useContext=function(e){return m.H.useContext(e)},f.useDebugValue=function(){},f.useDeferredValue=function(e,n){return m.H.useDeferredValue(e,n)},f.useEffect=function(e,n){return m.H.useEffect(e,n)},f.useEffectEvent=function(e){return m.H.useEffectEvent(e)},f.useId=function(){return m.H.useId()},f.useImperativeHandle=function(e,n,c){return m.H.useImperativeHandle(e,n,c)},f.useInsertionEffect=function(e,n){return m.H.useInsertionEffect(e,n)},f.useLayoutEffect=function(e,n){return m.H.useLayoutEffect(e,n)},f.useMemo=function(e,n){return m.H.useMemo(e,n)},f.useOptimistic=function(e,n){return m.H.useOptimistic(e,n)},f.useReducer=function(e,n,c){return m.H.useReducer(e,n,c)},f.useRef=function(e){return m.H.useRef(e)},f.useState=function(e){return m.H.useState(e)},f.useSyncExternalStore=function(e,n,c){return m.H.useSyncExternalStore(e,n,c)},f.useTransition=function(){return m.H.useTransition()},f.version="19.3.1",f}var ve;function me(){return ve||(ve=1,se.exports=Se()),se.exports}var Y=me();const cr=Re(Y);var le={exports:{}},T={};/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ke;function Ae(){if(ke)return T;ke=1;var x=me();function _(y){var a="https://react.dev/errors/"+y;if(1<arguments.length){a+="?args[]="+encodeURIComponent(arguments[1]);for(var M=2;M<arguments.length;M++)a+="&args[]="+encodeURIComponent(arguments[M])}return"Minified React error #"+y+"; visit "+a+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function C(){}var g={d:{f:C,r:function(){throw Error(_(522))},D:C,C,L:C,m:C,X:C,S:C,M:C},p:0,findDOMNode:null},R=Symbol.for("react.portal"),S=Symbol.for("react.recoverable"),H=Symbol.for("react.optimistic_key");function q(y,a,M){var N=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:R,key:N==null?null:N===H?H:""+N,children:y,containerInfo:a,implementation:M}}var A=x.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function $(y,a){if(y==="font")return"";if(typeof a=="string")return a==="use-credentials"?a:""}return T.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=g,T.browser=function(y){return{$$typeof:S,_reason:y}},T.createPortal=function(y,a){var M=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!a||a.nodeType!==1&&a.nodeType!==9&&a.nodeType!==11)throw Error(_(299));return q(y,a,null,M)},T.flushSync=function(y){var a=A.T,M=g.p;try{if(A.T=null,g.p=2,y)return y()}finally{A.T=a,g.p=M,g.d.f()}},T.preconnect=function(y,a){typeof y=="string"&&(a?(a=a.crossOrigin,a=typeof a=="string"?a==="use-credentials"?a:"":void 0):a=null,g.d.C(y,a))},T.prefetchDNS=function(y){typeof y=="string"&&g.d.D(y)},T.preinit=function(y,a){if(typeof y=="string"&&a&&typeof a.as=="string"){var M=a.as,N=$(M,a.crossOrigin),F=typeof a.integrity=="string"?a.integrity:void 0,D=typeof a.fetchPriority=="string"?a.fetchPriority:void 0;M==="style"?g.d.S(y,typeof a.precedence=="string"?a.precedence:void 0,{crossOrigin:N,integrity:F,fetchPriority:D}):M==="script"&&g.d.X(y,{crossOrigin:N,integrity:F,fetchPriority:D,nonce:typeof a.nonce=="string"?a.nonce:void 0})}},T.preinitModule=function(y,a){if(typeof y=="string")if(typeof a=="object"&&a!==null){if(a.as==null||a.as==="script"){var M=$(a.as,a.crossOrigin);g.d.M(y,{crossOrigin:M,integrity:typeof a.integrity=="string"?a.integrity:void 0,nonce:typeof a.nonce=="string"?a.nonce:void 0,fetchPriority:typeof a.fetchPriority=="string"?a.fetchPriority:void 0})}}else a==null&&g.d.M(y)},T.preload=function(y,a){if(typeof y=="string"&&typeof a=="object"&&a!==null&&typeof a.as=="string"){var M=a.as,N=$(M,a.crossOrigin);g.d.L(y,M,{crossOrigin:N,integrity:typeof a.integrity=="string"?a.integrity:void 0,nonce:typeof a.nonce=="string"?a.nonce:void 0,type:typeof a.type=="string"?a.type:void 0,fetchPriority:typeof a.fetchPriority=="string"?a.fetchPriority:void 0,referrerPolicy:typeof a.referrerPolicy=="string"?a.referrerPolicy:void 0,imageSrcSet:typeof a.imageSrcSet=="string"?a.imageSrcSet:void 0,imageSizes:typeof a.imageSizes=="string"?a.imageSizes:void 0,media:typeof a.media=="string"?a.media:void 0})}},T.preloadModule=function(y,a){if(typeof y=="string")if(a){var M=$(a.as,a.crossOrigin);g.d.m(y,{as:typeof a.as=="string"&&a.as!=="script"?a.as:void 0,crossOrigin:M,integrity:typeof a.integrity=="string"?a.integrity:void 0,nonce:typeof a.nonce=="string"?a.nonce:void 0,fetchPriority:typeof a.fetchPriority=="string"?a.fetchPriority:void 0})}else g.d.m(y)},T.requestFormReset=function(y){g.d.r(y)},T.unstable_batchedUpdates=function(y,a){return y(a)},T.useFormState=function(y,a,M){return A.H.useFormState(y,a,M)},T.useFormStatus=function(){return A.H.useHostTransitionStatus()},T.version="19.3.1",T}var _e;function ir(){if(_e)return le.exports;_e=1;function x(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(x)}catch(_){console.error(_)}}return x(),le.exports=Ae(),le.exports}/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $e=x=>x.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),ge=(...x)=>x.filter((_,C,g)=>!!_&&_.trim()!==""&&g.indexOf(_)===C).join(" ").trim();/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Pe={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oe=Y.forwardRef(({color:x="currentColor",size:_=24,strokeWidth:C=2,absoluteStrokeWidth:g,className:R="",children:S,iconNode:H,...q},A)=>Y.createElement("svg",{ref:A,...Pe,width:_,height:_,stroke:x,strokeWidth:g?Number(C)*24/Number(_):C,className:ge("lucide",R),...q},[...H.map(([$,y])=>Y.createElement($,y)),...Array.isArray(S)?S:[S]]));/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=(x,_)=>{const C=Y.forwardRef(({className:g,...R},S)=>Y.createElement(Oe,{ref:S,iconNode:_,className:ge(`lucide-${$e(x)}`,g),...R}));return C.displayName=`${x}`,C};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Le=[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]],sr=i("Activity",Le);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const He=[["path",{d:"M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z",key:"3s7exb"}],["path",{d:"M10 2c1 .5 2 2 2 5",key:"fcco2y"}]],lr=i("Apple",He);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ie=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]],ur=i("ArrowRight",Ie);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ze=[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]],yr=i("Award",ze);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const je=[["circle",{cx:"18.5",cy:"17.5",r:"3.5",key:"15x4ox"}],["circle",{cx:"5.5",cy:"17.5",r:"3.5",key:"1noe27"}],["circle",{cx:"15",cy:"5",r:"1",key:"19l28e"}],["path",{d:"M12 17.5V14l-3-3 4-3 2 3h2",key:"1npguv"}]],dr=i("Bike",je);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qe=[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]],hr=i("BookOpen",qe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const De=[["path",{d:"M12 8V4H8",key:"hb8ula"}],["rect",{width:"16",height:"12",x:"4",y:"8",rx:"2",key:"enze0r"}],["path",{d:"M2 14h2",key:"vft8re"}],["path",{d:"M20 14h2",key:"4cs60a"}],["path",{d:"M15 13v2",key:"1xurst"}],["path",{d:"M9 13v2",key:"rq6x2g"}]],fr=i("Bot",De);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ue=[["path",{d:"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",key:"1b4qmf"}],["path",{d:"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",key:"i71pzd"}],["path",{d:"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",key:"10jefs"}],["path",{d:"M10 6h4",key:"1itunk"}],["path",{d:"M10 10h4",key:"tcdvrf"}],["path",{d:"M10 14h4",key:"kelpxr"}],["path",{d:"M10 18h4",key:"1ulq68"}]],pr=i("Building2",Ue);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Be=[["rect",{width:"16",height:"20",x:"4",y:"2",rx:"2",ry:"2",key:"76otgf"}],["path",{d:"M9 22v-4h6v4",key:"r93iot"}],["path",{d:"M8 6h.01",key:"1dz90k"}],["path",{d:"M16 6h.01",key:"1x0f13"}],["path",{d:"M12 6h.01",key:"1vi96p"}],["path",{d:"M12 10h.01",key:"1nrarc"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M16 10h.01",key:"1m94wz"}],["path",{d:"M16 14h.01",key:"1gbofw"}],["path",{d:"M8 10h.01",key:"19clt8"}],["path",{d:"M8 14h.01",key:"6423bh"}]],vr=i("Building",Be);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fe=[["rect",{width:"16",height:"20",x:"4",y:"2",rx:"2",key:"1nb95v"}],["line",{x1:"8",x2:"16",y1:"6",y2:"6",key:"x4nwl0"}],["line",{x1:"16",x2:"16",y1:"14",y2:"18",key:"wjye3r"}],["path",{d:"M16 10h.01",key:"1m94wz"}],["path",{d:"M12 10h.01",key:"1nrarc"}],["path",{d:"M8 10h.01",key:"19clt8"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M8 18h.01",key:"lrp35t"}]],kr=i("Calculator",Fe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ve=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]],_r=i("Calendar",Ve);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ze=[["path",{d:"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",key:"1tc9qg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]],mr=i("Camera",Ze);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ye=[["path",{d:"M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2",key:"5owen"}],["circle",{cx:"7",cy:"17",r:"2",key:"u2ysq9"}],["path",{d:"M9 17h6",key:"r8uit2"}],["circle",{cx:"17",cy:"17",r:"2",key:"axvx0g"}]],gr=i("Car",Ye);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const We=[["path",{d:"M3 3v16a2 2 0 0 0 2 2h16",key:"c24i48"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]],Mr=i("ChartColumn",We);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ge=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],xr=i("Check",Ge);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ke=[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]],Cr=i("ChevronDown",Ke);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xe=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],wr=i("ChevronRight",Xe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qe=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],Er=i("CircleAlert",Qe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Je=[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],Tr=i("CircleCheckBig",Je);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const et=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],br=i("CircleCheck",et);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tt=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]],Nr=i("CircleHelp",tt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rt=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]],Rr=i("Clock",rt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nt=[["rect",{width:"16",height:"16",x:"4",y:"4",rx:"2",key:"14l7u7"}],["rect",{width:"6",height:"6",x:"9",y:"9",rx:"1",key:"5aljv4"}],["path",{d:"M15 2v2",key:"13l42r"}],["path",{d:"M15 20v2",key:"15mkzm"}],["path",{d:"M2 15h2",key:"1gxd5l"}],["path",{d:"M2 9h2",key:"1bbxkp"}],["path",{d:"M20 15h2",key:"19e6y8"}],["path",{d:"M20 9h2",key:"19tzq7"}],["path",{d:"M9 2v2",key:"165o2o"}],["path",{d:"M9 20v2",key:"i2bqo8"}]],Sr=i("Cpu",nt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const at=[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]],Ar=i("Download",at);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ot=[["path",{d:"M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z",key:"1ptgy4"}],["path",{d:"M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97",key:"1sl1rz"}]],$r=i("Droplets",ot);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ct=[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]],Pr=i("ExternalLink",ct);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const it=[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]],Or=i("EyeOff",it);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const st=[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],Lr=i("Eye",st);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const lt=[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"m9 15 2 2 4-4",key:"1grp1n"}]],Hr=i("FileCheck",lt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ut=[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M8 13h2",key:"yr2amv"}],["path",{d:"M14 13h2",key:"un5t4a"}],["path",{d:"M8 17h2",key:"2yhykz"}],["path",{d:"M14 17h2",key:"10kma7"}]],Ir=i("FileSpreadsheet",ut);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yt=[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]],zr=i("FileText",yt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const dt=[["path",{d:"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",key:"96xj49"}]],jr=i("Flame",dt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ht=[["path",{d:"M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z",key:"1dudjm"}],["path",{d:"M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z",key:"l2t8xc"}],["path",{d:"M16 17h4",key:"1dejxt"}],["path",{d:"M4 13h4",key:"1bwh8b"}]],qr=i("Footprints",ht);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ft=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]],Dr=i("Globe",ft);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pt=[["path",{d:"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",key:"j76jl0"}],["path",{d:"M22 10v6",key:"1lu8f3"}],["path",{d:"M6 12.5V16a6 3 0 0 0 12 0v-3.5",key:"1r8lef"}]],Ur=i("GraduationCap",pt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vt=[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}]],Br=i("Heart",vt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kt=[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"1d0kgt"}]],Fr=i("House",kt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _t=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],Vr=i("Info",_t);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mt=[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]],Zr=i("LayoutDashboard",mt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gt=[["path",{d:"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z",key:"nnexq3"}],["path",{d:"M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",key:"mt58a7"}]],Yr=i("Leaf",gt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Mt=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],Wr=i("LoaderCircle",Mt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xt=[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]],Gr=i("Lock",xt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ct=[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]],Kr=i("LogOut",Ct);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wt=[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]],Xr=i("Mail",wt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Et=[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]],Qr=i("MapPin",Et);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Tt=[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]],Jr=i("MessageSquare",Tt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bt=[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]],en=i("Moon",bt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Nt=[["polygon",{points:"3 11 22 2 13 21 11 13 3 11",key:"1ltx0t"}]],tn=i("Navigation",Nt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rt=[["path",{d:"M13.234 20.252 21 12.3",key:"1cbrk9"}],["path",{d:"m16 6-8.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486",key:"1pkts6"}]],rn=i("Paperclip",Rt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const St=[["path",{d:"M12 20h9",key:"t2du7b"}],["path",{d:"M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",key:"1ykcvy"}]],nn=i("PenLine",St);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const At=[["path",{d:"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",key:"foiqr5"}]],an=i("Phone",At);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $t=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],on=i("Plus",$t);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pt=[["path",{d:"M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5",key:"x6z5xu"}],["path",{d:"M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12",key:"1x4zh5"}],["path",{d:"m14 16-3 3 3 3",key:"f6jyew"}],["path",{d:"M8.293 13.596 7.196 9.5 3.1 10.598",key:"wf1obh"}],["path",{d:"m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843",key:"9tzpgr"}],["path",{d:"m13.378 9.633 4.096 1.098 1.097-4.096",key:"1oe83g"}]],cn=i("Recycle",Pt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ot=[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]],sn=i("RefreshCw",Ot);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Lt=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]],ln=i("Search",Lt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ht=[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]],un=i("Send",Ht);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const It=[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],yn=i("Settings",It);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zt=[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]],dn=i("Share2",zt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jt=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],hn=i("ShieldCheck",jt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qt=[["path",{d:"M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z",key:"hou9p0"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M16 10a4 4 0 0 1-8 0",key:"1ltviw"}]],fn=i("ShoppingBag",qt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dt=[["line",{x1:"21",x2:"14",y1:"4",y2:"4",key:"obuewd"}],["line",{x1:"10",x2:"3",y1:"4",y2:"4",key:"1q6298"}],["line",{x1:"21",x2:"12",y1:"12",y2:"12",key:"1iu8h1"}],["line",{x1:"8",x2:"3",y1:"12",y2:"12",key:"ntss68"}],["line",{x1:"21",x2:"16",y1:"20",y2:"20",key:"14d8ph"}],["line",{x1:"12",x2:"3",y1:"20",y2:"20",key:"m0wm8r"}],["line",{x1:"14",x2:"14",y1:"2",y2:"6",key:"14e1ph"}],["line",{x1:"8",x2:"8",y1:"10",y2:"14",key:"1i6ji0"}],["line",{x1:"16",x2:"16",y1:"18",y2:"22",key:"1lctlv"}]],pn=i("SlidersHorizontal",Dt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ut=[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]],vn=i("Sparkles",Ut);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Bt=[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",key:"r04s7s"}]],kn=i("Star",Bt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ft=[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 3v1",key:"1asbbs"}],["path",{d:"M12 20v1",key:"1wcdkc"}],["path",{d:"M3 12h1",key:"lp3yf2"}],["path",{d:"M20 12h1",key:"1vloll"}],["path",{d:"m18.364 5.636-.707.707",key:"1hakh0"}],["path",{d:"m6.343 17.657-.707.707",key:"18m9nf"}],["path",{d:"m5.636 5.636.707.707",key:"1xv1c5"}],["path",{d:"m17.657 17.657.707.707",key:"vl76zb"}]],_n=i("SunMedium",Ft);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vt=[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]],mn=i("Sun",Vt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Zt=[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]],gn=i("Trash2",Zt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yt=[["polyline",{points:"22 17 13.5 8.5 8.5 13.5 2 7",key:"1r2t7k"}],["polyline",{points:"16 17 22 17 22 11",key:"11uiuu"}]],Mn=i("TrendingDown",Yt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wt=[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]],xn=i("TrendingUp",Wt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gt=[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]],Cn=i("TriangleAlert",Gt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Kt=[["path",{d:"M6 9H4.5a2.5 2.5 0 0 1 0-5H6",key:"17hqa7"}],["path",{d:"M18 9h1.5a2.5 2.5 0 0 0 0-5H18",key:"lmptdp"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22",key:"1nw9bq"}],["path",{d:"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22",key:"1np0yb"}],["path",{d:"M18 2H6v7a6 6 0 0 0 12 0V2Z",key:"u46fv3"}]],wn=i("Trophy",Kt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xt=[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]],En=i("Upload",Xt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qt=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["polyline",{points:"16 11 18 13 22 9",key:"1pwet4"}]],Tn=i("UserCheck",Qt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Jt=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"19",x2:"19",y1:"8",y2:"14",key:"1bvyxn"}],["line",{x1:"22",x2:"16",y1:"11",y2:"11",key:"1shjgl"}]],bn=i("UserPlus",Jt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const er=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"17",x2:"22",y1:"8",y2:"13",key:"3nzzx3"}],["line",{x1:"22",x2:"17",y1:"8",y2:"13",key:"1swrse"}]],Nn=i("UserX",er);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tr=[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]],Rn=i("User",tr);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rr=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]],Sn=i("Users",rr);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nr=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],An=i("X",nr);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ar=[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]],$n=i("Zap",ar);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const or=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"11",x2:"11",y1:"8",y2:"14",key:"1vmskp"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]],Pn=i("ZoomIn",or);var ue={};(function x(_,C,g,R){var S=!!(_.Worker&&_.Blob&&_.Promise&&_.OffscreenCanvas&&_.OffscreenCanvasRenderingContext2D&&_.HTMLCanvasElement&&_.HTMLCanvasElement.prototype.transferControlToOffscreen&&_.URL&&_.URL.createObjectURL),H=typeof Path2D=="function"&&typeof DOMMatrix=="function",q=(function(){if(!_.OffscreenCanvas)return!1;try{var r=new OffscreenCanvas(1,1),t=r.getContext("2d");t.fillRect(0,0,1,1);var l=r.transferToImageBitmap();t.createPattern(l,"no-repeat")}catch{return!1}return!0})();function A(){}function $(r){var t=C.exports.Promise,l=t!==void 0?t:_.Promise;return typeof l=="function"?new l(r):(r(A,A),null)}var y=(function(r,t){return{transform:function(l){if(r)return l;if(t.has(l))return t.get(l);var h=new OffscreenCanvas(l.width,l.height),e=h.getContext("2d");return e.drawImage(l,0,0),t.set(l,h),h},clear:function(){t.clear()}}})(q,new Map),a=(function(){var r=Math.floor(16.666666666666668),t,l,h={},e=0;return typeof requestAnimationFrame=="function"&&typeof cancelAnimationFrame=="function"?(t=function(n){var c=Math.random();return h[c]=requestAnimationFrame(function o(s){e===s||e+r-1<s?(e=s,delete h[c],n()):h[c]=requestAnimationFrame(o)}),c},l=function(n){h[n]&&cancelAnimationFrame(h[n])}):(t=function(n){return setTimeout(n,r)},l=function(n){return clearTimeout(n)}),{frame:t,cancel:l}})(),M=(function(){var r,t,l={};function h(e){function n(c,o){e.postMessage({options:c||{},callback:o})}e.init=function(o){var s=o.transferControlToOffscreen();e.postMessage({canvas:s},[s])},e.fire=function(o,s,u){if(t)return n(o,null),t;var d=Math.random().toString(36).slice(2);return t=$(function(v){function p(E){E.data.callback===d&&(delete l[d],e.removeEventListener("message",p),t=null,y.clear(),u(),v())}e.addEventListener("message",p),n(o,d),l[d]=p.bind(null,{data:{callback:d}})}),t},e.reset=function(){e.postMessage({reset:!0});for(var o in l)l[o](),delete l[o]}}return function(){if(r)return r;if(!g&&S){var e=["var CONFETTI, SIZE = {}, module = {};","("+x.toString()+")(this, module, true, SIZE);","onmessage = function(msg) {","  if (msg.data.options) {","    CONFETTI(msg.data.options).then(function () {","      if (msg.data.callback) {","        postMessage({ callback: msg.data.callback });","      }","    });","  } else if (msg.data.reset) {","    CONFETTI && CONFETTI.reset();","  } else if (msg.data.resize) {","    SIZE.width = msg.data.resize.width;","    SIZE.height = msg.data.resize.height;","  } else if (msg.data.canvas) {","    SIZE.width = msg.data.canvas.width;","    SIZE.height = msg.data.canvas.height;","    CONFETTI = module.exports.create(msg.data.canvas);","  }","}"].join(`
`);try{r=new Worker(URL.createObjectURL(new Blob([e])))}catch(n){return typeof console<"u"&&typeof console.warn=="function"&&console.warn("🎊 Could not load worker",n),null}h(r)}return r}})(),N={particleCount:50,angle:90,spread:45,startVelocity:45,decay:.9,gravity:1,drift:0,ticks:200,x:.5,y:.5,shapes:["square","circle"],zIndex:100,colors:["#26ccff","#a25afd","#ff5e7e","#88ff5a","#fcff42","#ffa62d","#ff36ff"],disableForReducedMotion:!1,scalar:1};function F(r,t){return t?t(r):r}function D(r){return r!=null}function w(r,t,l){return F(r&&D(r[t])?r[t]:N[t],l)}function ee(r){return r<0?0:Math.floor(r)}function z(r,t){return Math.floor(Math.random()*(t-r))+r}function V(r){return parseInt(r,16)}function W(r){return r.map(G)}function G(r){var t=String(r).replace(/[^0-9a-f]/gi,"");return t.length<6&&(t=t[0]+t[0]+t[1]+t[1]+t[2]+t[2]),{r:V(t.substring(0,2)),g:V(t.substring(2,4)),b:V(t.substring(4,6))}}function te(r){var t=w(r,"origin",Object);return t.x=w(t,"x",Number),t.y=w(t,"y",Number),t}function K(r){r.width=document.documentElement.clientWidth,r.height=document.documentElement.clientHeight}function m(r){var t=r.getBoundingClientRect();r.width=t.width,r.height=t.height}function re(r){var t=document.createElement("canvas");return t.style.position="fixed",t.style.top="0px",t.style.left="0px",t.style.pointerEvents="none",t.style.zIndex=r,t}function X(r,t,l,h,e,n,c,o,s){r.save(),r.translate(t,l),r.rotate(n),r.scale(h,e),r.arc(0,0,1,c,o,s),r.restore()}function ae(r){var t=r.angle*(Math.PI/180),l=r.spread*(Math.PI/180);return{x:r.x,y:r.y,wobble:Math.random()*10,wobbleSpeed:Math.min(.11,Math.random()*.1+.05),velocity:r.startVelocity*.5+Math.random()*r.startVelocity,angle2D:-t+(.5*l-Math.random()*l),tiltAngle:(Math.random()*(.75-.25)+.25)*Math.PI,color:r.color,shape:r.shape,tick:0,totalTicks:r.ticks,decay:r.decay,drift:r.drift,random:Math.random()+2,tiltSin:0,tiltCos:0,wobbleX:0,wobbleY:0,gravity:r.gravity*3,ovalScalar:.6,scalar:r.scalar,flat:r.flat}}function Q(r,t){t.x+=Math.cos(t.angle2D)*t.velocity+t.drift,t.y+=Math.sin(t.angle2D)*t.velocity+t.gravity,t.velocity*=t.decay,t.flat?(t.wobble=0,t.wobbleX=t.x+10*t.scalar,t.wobbleY=t.y+10*t.scalar,t.tiltSin=0,t.tiltCos=0,t.random=1):(t.wobble+=t.wobbleSpeed,t.wobbleX=t.x+10*t.scalar*Math.cos(t.wobble),t.wobbleY=t.y+10*t.scalar*Math.sin(t.wobble),t.tiltAngle+=.1,t.tiltSin=Math.sin(t.tiltAngle),t.tiltCos=Math.cos(t.tiltAngle),t.random=Math.random()+2);var l=t.tick++/t.totalTicks,h=t.x+t.random*t.tiltCos,e=t.y+t.random*t.tiltSin,n=t.wobbleX+t.random*t.tiltCos,c=t.wobbleY+t.random*t.tiltSin;if(r.fillStyle="rgba("+t.color.r+", "+t.color.g+", "+t.color.b+", "+(1-l)+")",r.beginPath(),H&&t.shape.type==="path"&&typeof t.shape.path=="string"&&Array.isArray(t.shape.matrix))r.fill(j(t.shape.path,t.shape.matrix,t.x,t.y,Math.abs(n-h)*.1,Math.abs(c-e)*.1,Math.PI/10*t.wobble));else if(t.shape.type==="bitmap"){var o=Math.PI/10*t.wobble,s=Math.abs(n-h)*.1,u=Math.abs(c-e)*.1,d=t.shape.bitmap.width*t.scalar,v=t.shape.bitmap.height*t.scalar,p=new DOMMatrix([Math.cos(o)*s,Math.sin(o)*s,-Math.sin(o)*u,Math.cos(o)*u,t.x,t.y]);p.multiplySelf(new DOMMatrix(t.shape.matrix));var E=r.createPattern(y.transform(t.shape.bitmap),"no-repeat");E.setTransform(p),r.globalAlpha=1-l,r.fillStyle=E,r.fillRect(t.x-d/2,t.y-v/2,d,v),r.globalAlpha=1}else if(t.shape==="circle")r.ellipse?r.ellipse(t.x,t.y,Math.abs(n-h)*t.ovalScalar,Math.abs(c-e)*t.ovalScalar,Math.PI/10*t.wobble,0,2*Math.PI):X(r,t.x,t.y,Math.abs(n-h)*t.ovalScalar,Math.abs(c-e)*t.ovalScalar,Math.PI/10*t.wobble,0,2*Math.PI);else if(t.shape==="star")for(var k=Math.PI/2*3,b=4*t.scalar,P=8*t.scalar,O=t.x,I=t.y,B=5,L=Math.PI/B;B--;)O=t.x+Math.cos(k)*P,I=t.y+Math.sin(k)*P,r.lineTo(O,I),k+=L,O=t.x+Math.cos(k)*b,I=t.y+Math.sin(k)*b,r.lineTo(O,I),k+=L;else r.moveTo(Math.floor(t.x),Math.floor(t.y)),r.lineTo(Math.floor(t.wobbleX),Math.floor(e)),r.lineTo(Math.floor(n),Math.floor(c)),r.lineTo(Math.floor(h),Math.floor(t.wobbleY));return r.closePath(),r.fill(),t.tick<t.totalTicks}function oe(r,t,l,h,e){var n=t.slice(),c=r.getContext("2d"),o,s,u=$(function(d){function v(){o=s=null,c.clearRect(0,0,h.width,h.height),y.clear(),e(),d()}function p(){g&&!(h.width===R.width&&h.height===R.height)&&(h.width=r.width=R.width,h.height=r.height=R.height),!h.width&&!h.height&&(l(r),h.width=r.width,h.height=r.height),c.clearRect(0,0,h.width,h.height),n=n.filter(function(E){return Q(c,E)}),n.length?o=a.frame(p):v()}o=a.frame(p),s=v});return{addFettis:function(d){return n=n.concat(d),u},canvas:r,promise:u,reset:function(){o&&a.cancel(o),s&&s()}}}function J(r,t){var l=!r,h=!!w(t||{},"resize"),e=!1,n=w(t,"disableForReducedMotion",Boolean),c=S&&!!w(t||{},"useWorker"),o=c?M():null,s=l?K:m,u=r&&o?!!r.__confetti_initialized:!1,d=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion)").matches,v;function p(k,b,P){for(var O=w(k,"particleCount",ee),I=w(k,"angle",Number),B=w(k,"spread",Number),L=w(k,"startVelocity",Number),Me=w(k,"decay",Number),xe=w(k,"gravity",Number),Ce=w(k,"drift",Number),ye=w(k,"colors",W),we=w(k,"ticks",Number),de=w(k,"shapes"),Ee=w(k,"scalar"),Te=!!w(k,"flat"),he=te(k),fe=O,ie=[],be=r.width*he.x,Ne=r.height*he.y;fe--;)ie.push(ae({x:be,y:Ne,angle:I,spread:B,startVelocity:L,color:ye[fe%ye.length],shape:de[z(0,de.length)],ticks:we,decay:Me,gravity:xe,drift:Ce,scalar:Ee,flat:Te}));return v?v.addFettis(ie):(v=oe(r,ie,s,b,P),v.promise)}function E(k){var b=n||w(k,"disableForReducedMotion",Boolean),P=w(k,"zIndex",Number);if(b&&d)return $(function(L){L()});l&&v?r=v.canvas:l&&!r&&(r=re(P),document.body.appendChild(r)),h&&!u&&s(r);var O={width:r.width,height:r.height};o&&!u&&o.init(r),u=!0,o&&(r.__confetti_initialized=!0);function I(){if(o){var L={getBoundingClientRect:function(){if(!l)return r.getBoundingClientRect()}};s(L),o.postMessage({resize:{width:L.width,height:L.height}});return}O.width=O.height=null}function B(){v=null,h&&(e=!1,_.removeEventListener("resize",I)),l&&r&&(document.body.contains(r)&&document.body.removeChild(r),r=null,u=!1)}return h&&!e&&(e=!0,_.addEventListener("resize",I,!1)),o?o.fire(k,O,B):p(k,O,B)}return E.reset=function(){o&&o.reset(),v&&v.reset()},E}var U;function ne(){return U||(U=J(null,{useWorker:!0,resize:!0})),U}function j(r,t,l,h,e,n,c){var o=new Path2D(r),s=new Path2D;s.addPath(o,new DOMMatrix(t));var u=new Path2D;return u.addPath(s,new DOMMatrix([Math.cos(c)*e,Math.sin(c)*e,-Math.sin(c)*n,Math.cos(c)*n,l,h])),u}function Z(r){if(!H)throw new Error("path confetti are not supported in this browser");var t,l;typeof r=="string"?t=r:(t=r.path,l=r.matrix);var h=new Path2D(t),e=document.createElement("canvas"),n=e.getContext("2d");if(!l){for(var c=1e3,o=c,s=c,u=0,d=0,v,p,E=0;E<c;E+=2)for(var k=0;k<c;k+=2)n.isPointInPath(h,E,k,"nonzero")&&(o=Math.min(o,E),s=Math.min(s,k),u=Math.max(u,E),d=Math.max(d,k));v=u-o,p=d-s;var b=10,P=Math.min(b/v,b/p);l=[P,0,0,P,-Math.round(v/2+o)*P,-Math.round(p/2+s)*P]}return{type:"path",path:t,matrix:l}}function ce(r){var t,l=1,h="#000000",e='"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", "Twemoji Mozilla", "system emoji", sans-serif';typeof r=="string"?t=r:(t=r.text,l="scalar"in r?r.scalar:l,e="fontFamily"in r?r.fontFamily:e,h="color"in r?r.color:h);var n=10*l,c=""+n+"px "+e,o=new OffscreenCanvas(n,n),s=o.getContext("2d");s.font=c;var u=s.measureText(t),d=Math.ceil(u.actualBoundingBoxRight+u.actualBoundingBoxLeft),v=Math.ceil(u.actualBoundingBoxAscent+u.actualBoundingBoxDescent),p=2,E=u.actualBoundingBoxLeft+p,k=u.actualBoundingBoxAscent+p;d+=p+p,v+=p+p,o=new OffscreenCanvas(d,v),s=o.getContext("2d"),s.font=c,s.fillStyle=h,s.fillText(t,E,k);var b=1/l;return{type:"bitmap",bitmap:o.transferToImageBitmap(),matrix:[b,0,0,b,-d*b/2,-v*b/2]}}C.exports=function(){return ne().apply(this,arguments)},C.exports.reset=function(){ne().reset()},C.exports.create=J,C.exports.shapeFromPath=Z,C.exports.shapeFromText=ce})((function(){return typeof window<"u"?window:typeof self<"u"?self:this||{}})(),ue,!1);const On=ue.exports;ue.exports.create;export{an as $,yr as A,pr as B,Cr as C,$r as D,Pr as E,qr as F,Dr as G,dr as H,Vr as I,lr as J,fn as K,Yr as L,en as M,Rr as N,Pn as O,nn as P,Lr as Q,cn as R,mn as S,xn as T,bn as U,Xr as V,_r as W,An as X,jr as Y,$n as Z,Br as _,ir as a,kr as a0,kn as a1,zr as a2,un as a3,Tr as a4,ln as a5,Cn as a6,tn as a7,yn as a8,Rn as a9,Wr as aa,Fr as ab,gn as ac,Ir as ad,vr as ae,Mr as af,Ar as ag,Nn as ah,Tn as ai,rn as aj,Hr as ak,En as al,wn as am,dn as an,pn as ao,sn as ap,Nr as aq,cr as ar,wr as as,Gr as at,Or as au,Y as b,_n as c,Jr as d,hn as e,Ur as f,Re as g,vn as h,Kr as i,Sn as j,hr as k,Zr as l,mr as m,Sr as n,br as o,fr as p,Er as q,me as r,xr as s,ur as t,On as u,sr as v,Qr as w,gr as x,on as y,Mn as z};
