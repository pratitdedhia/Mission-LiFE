function Se(w){return w&&w.__esModule&&Object.prototype.hasOwnProperty.call(w,"default")?w.default:w}var se={exports:{}},f={};/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var pe;function Ne(){if(pe)return f;pe=1;var w=Symbol.for("react.transitional.element"),m=Symbol.for("react.portal"),C=Symbol.for("react.fragment"),k=Symbol.for("react.strict_mode"),S=Symbol.for("react.profiler"),N=Symbol.for("react.consumer"),I=Symbol.for("react.context"),q=Symbol.for("react.forward_ref"),A=Symbol.for("react.suspense"),O=Symbol.for("react.memo"),d=Symbol.for("react.lazy"),a=Symbol.for("react.activity"),M=Symbol.for("react.view_transition"),R=Symbol.iterator;function F(e){return e===null||typeof e!="object"?null:(e=R&&e[R]||e["@@iterator"],typeof e=="function"?e:null)}var D={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},E=Object.assign,ee={};function j(e,n,c){this.props=e,this.context=n,this.refs=ee,this.updater=c||D}j.prototype.isReactComponent={},j.prototype.setState=function(e,n){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,n,"setState")},j.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function V(){}V.prototype=j.prototype;function W(e,n,c){this.props=e,this.context=n,this.refs=ee,this.updater=c||D}var G=W.prototype=new V;G.constructor=W,E(G,j.prototype),G.isPureReactComponent=!0;var te=Array.isArray;function K(){}var _={H:null,A:null,T:null,S:null},re=Object.prototype.hasOwnProperty;function X(e,n,c){var o=c.ref;return{$$typeof:w,type:e,key:n,ref:o!==void 0?o:null,props:c}}function ae(e,n){return X(e.type,n,e.props)}function Q(e){return typeof e=="object"&&e!==null&&e.$$typeof===w}function oe(e){var n={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(c){return n[c]})}var J=/\/+/g;function B(e,n){return typeof e=="object"&&e!==null&&e.key!=null?oe(""+e.key):n.toString(36)}function ne(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(K,K):(e.status="pending",e.then(function(n){e.status==="pending"&&(e.status="fulfilled",e.value=n)},function(n){e.status==="pending"&&(e.status="rejected",e.reason=n)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function z(e,n,c,o,i){var l=typeof e;(l==="undefined"||l==="boolean")&&(e=null);var h=!1;if(e===null)h=!0;else switch(l){case"bigint":case"string":case"number":h=!0;break;case"object":switch(e.$$typeof){case w:case m:h=!0;break;case d:return h=e._init,z(h(e._payload),n,c,o,i)}}if(h)return i=i(e),h=o===""?"."+B(e,0):o,te(i)?(c="",h!=null&&(c=h.replace(J,"$&/")+"/"),z(i,n,c,"",function(T){return T})):i!=null&&(Q(i)&&(i=ae(i,c+(i.key==null||e&&e.key===i.key?"":(""+i.key).replace(J,"$&/")+"/")+h)),n.push(i)),1;h=0;var v=o===""?".":o+":";if(te(e))for(var p=0;p<e.length;p++)o=e[p],l=v+B(o,p),h+=z(o,n,c,l,i);else if(p=F(e),typeof p=="function")for(e=p.call(e),p=0;!(o=e.next()).done;)o=o.value,l=v+B(o,p++),h+=z(o,n,c,l,i);else if(l==="object"){if(typeof e.then=="function")return z(ne(e),n,c,o,i);throw n=String(e),Error("Objects are not valid as a React child (found: "+(n==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":n)+"). If you meant to render a collection of children, use an array instead.")}return h}function Y(e,n,c){if(e==null)return e;var o=[],i=0;return z(e,o,"","",function(l){return n.call(c,l,i++)}),o}function ce(e){if(e._status===-1){var n=e._result,c=n();c.then(function(o){(e._status===0||e._status===-1)&&(e._status=1,e._result=o,c.status===void 0&&(c.status="fulfilled",c.value=o))},function(o){(e._status===0||e._status===-1)&&(e._status=2,e._result=o,c.status===void 0&&(c.status="rejected",c.reason=o))}),e._status===-1&&(e._status=0,e._result=c)}if(e._status===1)return e._result.default;throw e._result}var r=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var n=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(n))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)};function t(e){var n=_.T,c={};c.types=n!==null?n.types:null,_.T=c;try{var o=e(),i=_.S;i!==null&&i(c,o),typeof o=="object"&&o!==null&&typeof o.then=="function"&&o.then(K,r)}catch(l){r(l)}finally{n!==null&&c.types!==null&&(n.types=c.types),_.T=n}}function u(e){var n=_.T;if(n!==null){var c=n.types;c===null?n.types=[e]:c.indexOf(e)===-1&&c.push(e)}else t(u.bind(null,e))}var y={map:Y,forEach:function(e,n,c){Y(e,function(){n.apply(this,arguments)},c)},count:function(e){var n=0;return Y(e,function(){n++}),n},toArray:function(e){return Y(e,function(n){return n})||[]},only:function(e){if(!Q(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};return f.Activity=a,f.Children=y,f.Component=j,f.Fragment=C,f.Profiler=S,f.PureComponent=W,f.StrictMode=k,f.Suspense=A,f.ViewTransition=M,f.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=_,f.__COMPILER_RUNTIME={__proto__:null,c:function(e){return _.H.useMemoCache(e)}},f.addTransitionType=u,f.cache=function(e){return function(){return e.apply(null,arguments)}},f.cacheSignal=function(){return null},f.cloneElement=function(e,n,c){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var o=E({},e.props),i=e.key;if(n!=null)for(l in n.key!==void 0&&(i=""+n.key),n)!re.call(n,l)||l==="key"||l==="__self"||l==="__source"||l==="ref"&&n.ref===void 0||(o[l]=n[l]);var l=arguments.length-2;if(l===1)o.children=c;else if(1<l){for(var h=Array(l),v=0;v<l;v++)h[v]=arguments[v+2];o.children=h}return X(e.type,i,o)},f.createContext=function(e){return e={$$typeof:I,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:N,_context:e},e},f.createElement=function(e,n,c){var o,i={},l=null;if(n!=null)for(o in n.key!==void 0&&(l=""+n.key),n)re.call(n,o)&&o!=="key"&&o!=="__self"&&o!=="__source"&&(i[o]=n[o]);var h=arguments.length-2;if(h===1)i.children=c;else if(1<h){for(var v=Array(h),p=0;p<h;p++)v[p]=arguments[p+2];i.children=v}if(e&&e.defaultProps)for(o in h=e.defaultProps,h)i[o]===void 0&&(i[o]=h[o]);return X(e,l,i)},f.createRef=function(){return{current:null}},f.forwardRef=function(e){return{$$typeof:q,render:e}},f.isValidElement=Q,f.lazy=function(e){return{$$typeof:d,_payload:{_status:-1,_result:e},_init:ce}},f.memo=function(e,n){return{$$typeof:O,type:e,compare:n===void 0?null:n}},f.startTransition=t,f.unstable_useCacheRefresh=function(){return _.H.useCacheRefresh()},f.use=function(e){return _.H.use(e)},f.useActionState=function(e,n,c){return _.H.useActionState(e,n,c)},f.useCallback=function(e,n){return _.H.useCallback(e,n)},f.useContext=function(e){return _.H.useContext(e)},f.useDebugValue=function(){},f.useDeferredValue=function(e,n){return _.H.useDeferredValue(e,n)},f.useEffect=function(e,n){return _.H.useEffect(e,n)},f.useEffectEvent=function(e){return _.H.useEffectEvent(e)},f.useId=function(){return _.H.useId()},f.useImperativeHandle=function(e,n,c){return _.H.useImperativeHandle(e,n,c)},f.useInsertionEffect=function(e,n){return _.H.useInsertionEffect(e,n)},f.useLayoutEffect=function(e,n){return _.H.useLayoutEffect(e,n)},f.useMemo=function(e,n){return _.H.useMemo(e,n)},f.useOptimistic=function(e,n){return _.H.useOptimistic(e,n)},f.useReducer=function(e,n,c){return _.H.useReducer(e,n,c)},f.useRef=function(e){return _.H.useRef(e)},f.useState=function(e){return _.H.useState(e)},f.useSyncExternalStore=function(e,n,c){return _.H.useSyncExternalStore(e,n,c)},f.useTransition=function(){return _.H.useTransition()},f.version="19.3.1",f}var ve;function _e(){return ve||(ve=1,se.exports=Ne()),se.exports}var Z=_e();const qt=Se(Z);var ue={exports:{}},x={};/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ge;function Ae(){if(ge)return x;ge=1;var w=_e();function m(d){var a="https://react.dev/errors/"+d;if(1<arguments.length){a+="?args[]="+encodeURIComponent(arguments[1]);for(var M=2;M<arguments.length;M++)a+="&args[]="+encodeURIComponent(arguments[M])}return"Minified React error #"+d+"; visit "+a+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function C(){}var k={d:{f:C,r:function(){throw Error(m(522))},D:C,C,L:C,m:C,X:C,S:C,M:C},p:0,findDOMNode:null},S=Symbol.for("react.portal"),N=Symbol.for("react.recoverable"),I=Symbol.for("react.optimistic_key");function q(d,a,M){var R=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:S,key:R==null?null:R===I?I:""+R,children:d,containerInfo:a,implementation:M}}var A=w.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function O(d,a){if(d==="font")return"";if(typeof a=="string")return a==="use-credentials"?a:""}return x.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=k,x.browser=function(d){return{$$typeof:N,_reason:d}},x.createPortal=function(d,a){var M=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!a||a.nodeType!==1&&a.nodeType!==9&&a.nodeType!==11)throw Error(m(299));return q(d,a,null,M)},x.flushSync=function(d){var a=A.T,M=k.p;try{if(A.T=null,k.p=2,d)return d()}finally{A.T=a,k.p=M,k.d.f()}},x.preconnect=function(d,a){typeof d=="string"&&(a?(a=a.crossOrigin,a=typeof a=="string"?a==="use-credentials"?a:"":void 0):a=null,k.d.C(d,a))},x.prefetchDNS=function(d){typeof d=="string"&&k.d.D(d)},x.preinit=function(d,a){if(typeof d=="string"&&a&&typeof a.as=="string"){var M=a.as,R=O(M,a.crossOrigin),F=typeof a.integrity=="string"?a.integrity:void 0,D=typeof a.fetchPriority=="string"?a.fetchPriority:void 0;M==="style"?k.d.S(d,typeof a.precedence=="string"?a.precedence:void 0,{crossOrigin:R,integrity:F,fetchPriority:D}):M==="script"&&k.d.X(d,{crossOrigin:R,integrity:F,fetchPriority:D,nonce:typeof a.nonce=="string"?a.nonce:void 0})}},x.preinitModule=function(d,a){if(typeof d=="string")if(typeof a=="object"&&a!==null){if(a.as==null||a.as==="script"){var M=O(a.as,a.crossOrigin);k.d.M(d,{crossOrigin:M,integrity:typeof a.integrity=="string"?a.integrity:void 0,nonce:typeof a.nonce=="string"?a.nonce:void 0,fetchPriority:typeof a.fetchPriority=="string"?a.fetchPriority:void 0})}}else a==null&&k.d.M(d)},x.preload=function(d,a){if(typeof d=="string"&&typeof a=="object"&&a!==null&&typeof a.as=="string"){var M=a.as,R=O(M,a.crossOrigin);k.d.L(d,M,{crossOrigin:R,integrity:typeof a.integrity=="string"?a.integrity:void 0,nonce:typeof a.nonce=="string"?a.nonce:void 0,type:typeof a.type=="string"?a.type:void 0,fetchPriority:typeof a.fetchPriority=="string"?a.fetchPriority:void 0,referrerPolicy:typeof a.referrerPolicy=="string"?a.referrerPolicy:void 0,imageSrcSet:typeof a.imageSrcSet=="string"?a.imageSrcSet:void 0,imageSizes:typeof a.imageSizes=="string"?a.imageSizes:void 0,media:typeof a.media=="string"?a.media:void 0})}},x.preloadModule=function(d,a){if(typeof d=="string")if(a){var M=O(a.as,a.crossOrigin);k.d.m(d,{as:typeof a.as=="string"&&a.as!=="script"?a.as:void 0,crossOrigin:M,integrity:typeof a.integrity=="string"?a.integrity:void 0,nonce:typeof a.nonce=="string"?a.nonce:void 0,fetchPriority:typeof a.fetchPriority=="string"?a.fetchPriority:void 0})}else k.d.m(d)},x.requestFormReset=function(d){k.d.r(d)},x.unstable_batchedUpdates=function(d,a){return d(a)},x.useFormState=function(d,a,M){return A.H.useFormState(d,a,M)},x.useFormStatus=function(){return A.H.useHostTransitionStatus()},x.version="19.3.1",x}var me;function Dt(){if(me)return ue.exports;me=1;function w(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(w)}catch(m){console.error(m)}}return w(),ue.exports=Ae(),ue.exports}/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oe=w=>w.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),ke=(...w)=>w.filter((m,C,k)=>!!m&&m.trim()!==""&&k.indexOf(m)===C).join(" ").trim();/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Pe={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $e=Z.forwardRef(({color:w="currentColor",size:m=24,strokeWidth:C=2,absoluteStrokeWidth:k,className:S="",children:N,iconNode:I,...q},A)=>Z.createElement("svg",{ref:A,...Pe,width:m,height:m,stroke:w,strokeWidth:k?Number(C)*24/Number(m):C,className:ke("lucide",S),...q},[...I.map(([O,d])=>Z.createElement(O,d)),...Array.isArray(N)?N:[N]]));/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const s=(w,m)=>{const C=Z.forwardRef(({className:k,...S},N)=>Z.createElement($e,{ref:N,iconNode:m,className:ke(`lucide-${Oe(w)}`,k),...S}));return C.displayName=`${w}`,C};/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Le=[["path",{d:"M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z",key:"3s7exb"}],["path",{d:"M10 2c1 .5 2 2 2 5",key:"fcco2y"}]],Bt=s("Apple",Le);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ie=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]],Ut=s("ArrowRight",Ie);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const He=[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]],Ft=s("Award",He);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const je=[["circle",{cx:"18.5",cy:"17.5",r:"3.5",key:"15x4ox"}],["circle",{cx:"5.5",cy:"17.5",r:"3.5",key:"1noe27"}],["circle",{cx:"15",cy:"5",r:"1",key:"19l28e"}],["path",{d:"M12 17.5V14l-3-3 4-3 2 3h2",key:"1npguv"}]],Vt=s("Bike",je);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ze=[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]],Yt=s("BookOpen",ze);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qe=[["path",{d:"M12 8V4H8",key:"hb8ula"}],["rect",{width:"16",height:"12",x:"4",y:"8",rx:"2",key:"enze0r"}],["path",{d:"M2 14h2",key:"vft8re"}],["path",{d:"M20 14h2",key:"4cs60a"}],["path",{d:"M15 13v2",key:"1xurst"}],["path",{d:"M9 13v2",key:"rq6x2g"}]],Zt=s("Bot",qe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const De=[["path",{d:"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",key:"1b4qmf"}],["path",{d:"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",key:"i71pzd"}],["path",{d:"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",key:"10jefs"}],["path",{d:"M10 6h4",key:"1itunk"}],["path",{d:"M10 10h4",key:"tcdvrf"}],["path",{d:"M10 14h4",key:"kelpxr"}],["path",{d:"M10 18h4",key:"1ulq68"}]],Wt=s("Building2",De);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Be=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]],Gt=s("Calendar",Be);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ue=[["path",{d:"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",key:"1tc9qg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]],Kt=s("Camera",Ue);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fe=[["path",{d:"M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2",key:"5owen"}],["circle",{cx:"7",cy:"17",r:"2",key:"u2ysq9"}],["path",{d:"M9 17h6",key:"r8uit2"}],["circle",{cx:"17",cy:"17",r:"2",key:"axvx0g"}]],Xt=s("Car",Fe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ve=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],Qt=s("Check",Ve);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ye=[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]],Jt=s("ChevronDown",Ye);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ze=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],er=s("ChevronRight",Ze);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const We=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],tr=s("CircleAlert",We);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ge=[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],rr=s("CircleCheckBig",Ge);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ke=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],nr=s("CircleCheck",Ke);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xe=[["rect",{width:"16",height:"16",x:"4",y:"4",rx:"2",key:"14l7u7"}],["rect",{width:"6",height:"6",x:"9",y:"9",rx:"1",key:"5aljv4"}],["path",{d:"M15 2v2",key:"13l42r"}],["path",{d:"M15 20v2",key:"15mkzm"}],["path",{d:"M2 15h2",key:"1gxd5l"}],["path",{d:"M2 9h2",key:"1bbxkp"}],["path",{d:"M20 15h2",key:"19e6y8"}],["path",{d:"M20 9h2",key:"19tzq7"}],["path",{d:"M9 2v2",key:"165o2o"}],["path",{d:"M9 20v2",key:"i2bqo8"}]],ar=s("Cpu",Xe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qe=[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]],or=s("Download",Qe);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Je=[["path",{d:"M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z",key:"1ptgy4"}],["path",{d:"M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97",key:"1sl1rz"}]],cr=s("Droplets",Je);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const et=[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]],ir=s("ExternalLink",et);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tt=[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]],sr=s("EyeOff",tt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rt=[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],ur=s("Eye",rt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nt=[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M8 13h2",key:"yr2amv"}],["path",{d:"M14 13h2",key:"un5t4a"}],["path",{d:"M8 17h2",key:"2yhykz"}],["path",{d:"M14 17h2",key:"10kma7"}]],lr=s("FileSpreadsheet",nt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const at=[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]],dr=s("FileText",at);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ot=[["path",{d:"M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z",key:"1dudjm"}],["path",{d:"M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z",key:"l2t8xc"}],["path",{d:"M16 17h4",key:"1dejxt"}],["path",{d:"M4 13h4",key:"1bwh8b"}]],hr=s("Footprints",ot);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ct=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]],yr=s("Globe",ct);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const it=[["path",{d:"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",key:"j76jl0"}],["path",{d:"M22 10v6",key:"1lu8f3"}],["path",{d:"M6 12.5V16a6 3 0 0 0 12 0v-3.5",key:"1r8lef"}]],fr=s("GraduationCap",it);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const st=[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}]],pr=s("Heart",st);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ut=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],vr=s("Info",ut);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const lt=[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]],gr=s("LayoutDashboard",lt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const dt=[["path",{d:"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z",key:"nnexq3"}],["path",{d:"M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",key:"mt58a7"}]],mr=s("Leaf",dt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ht=[["path",{d:"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",key:"1gvzjb"}],["path",{d:"M9 18h6",key:"x1upvd"}],["path",{d:"M10 22h4",key:"ceow96"}]],_r=s("Lightbulb",ht);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yt=[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]],kr=s("Lock",yt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ft=[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]],Mr=s("LogOut",ft);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pt=[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]],wr=s("Mail",pt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vt=[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]],Cr=s("MapPin",vt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gt=[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]],Er=s("Moon",gt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mt=[["polygon",{points:"3 11 22 2 13 21 11 13 3 11",key:"1ltx0t"}]],Tr=s("Navigation",mt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _t=[["path",{d:"M12 20h9",key:"t2du7b"}],["path",{d:"M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",key:"1ykcvy"}]],xr=s("PenLine",_t);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kt=[["path",{d:"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",key:"foiqr5"}]],br=s("Phone",kt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Mt=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],Rr=s("Plus",Mt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wt=[["path",{d:"M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5",key:"x6z5xu"}],["path",{d:"M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12",key:"1x4zh5"}],["path",{d:"m14 16-3 3 3 3",key:"f6jyew"}],["path",{d:"M8.293 13.596 7.196 9.5 3.1 10.598",key:"wf1obh"}],["path",{d:"m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843",key:"9tzpgr"}],["path",{d:"m13.378 9.633 4.096 1.098 1.097-4.096",key:"1oe83g"}]],Sr=s("Recycle",wt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ct=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]],Nr=s("Search",Ct);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Et=[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]],Ar=s("Send",Et);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Tt=[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],Or=s("Settings",Tt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xt=[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]],Pr=s("Share2",xt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bt=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],$r=s("ShieldCheck",bt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rt=[["path",{d:"M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z",key:"hou9p0"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M16 10a4 4 0 0 1-8 0",key:"1ltviw"}]],Lr=s("ShoppingBag",Rt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const St=[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]],Ir=s("Sparkles",St);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Nt=[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 3v1",key:"1asbbs"}],["path",{d:"M12 20v1",key:"1wcdkc"}],["path",{d:"M3 12h1",key:"lp3yf2"}],["path",{d:"M20 12h1",key:"1vloll"}],["path",{d:"m18.364 5.636-.707.707",key:"1hakh0"}],["path",{d:"m6.343 17.657-.707.707",key:"18m9nf"}],["path",{d:"m5.636 5.636.707.707",key:"1xv1c5"}],["path",{d:"m17.657 17.657.707.707",key:"vl76zb"}]],Hr=s("SunMedium",Nt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const At=[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]],jr=s("Sun",At);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ot=[["polyline",{points:"22 17 13.5 8.5 8.5 13.5 2 7",key:"1r2t7k"}],["polyline",{points:"16 17 22 17 22 11",key:"11uiuu"}]],zr=s("TrendingDown",Ot);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pt=[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]],qr=s("TrendingUp",Pt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $t=[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]],Dr=s("TriangleAlert",$t);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Lt=[["path",{d:"M6 9H4.5a2.5 2.5 0 0 1 0-5H6",key:"17hqa7"}],["path",{d:"M18 9h1.5a2.5 2.5 0 0 0 0-5H18",key:"lmptdp"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22",key:"1nw9bq"}],["path",{d:"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22",key:"1np0yb"}],["path",{d:"M18 2H6v7a6 6 0 0 0 12 0V2Z",key:"u46fv3"}]],Br=s("Trophy",Lt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const It=[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]],Ur=s("User",It);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ht=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]],Fr=s("Users",Ht);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jt=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],Vr=s("X",jt);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zt=[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]],Yr=s("Zap",zt);var le={};(function w(m,C,k,S){var N=!!(m.Worker&&m.Blob&&m.Promise&&m.OffscreenCanvas&&m.OffscreenCanvasRenderingContext2D&&m.HTMLCanvasElement&&m.HTMLCanvasElement.prototype.transferControlToOffscreen&&m.URL&&m.URL.createObjectURL),I=typeof Path2D=="function"&&typeof DOMMatrix=="function",q=(function(){if(!m.OffscreenCanvas)return!1;try{var r=new OffscreenCanvas(1,1),t=r.getContext("2d");t.fillRect(0,0,1,1);var u=r.transferToImageBitmap();t.createPattern(u,"no-repeat")}catch{return!1}return!0})();function A(){}function O(r){var t=C.exports.Promise,u=t!==void 0?t:m.Promise;return typeof u=="function"?new u(r):(r(A,A),null)}var d=(function(r,t){return{transform:function(u){if(r)return u;if(t.has(u))return t.get(u);var y=new OffscreenCanvas(u.width,u.height),e=y.getContext("2d");return e.drawImage(u,0,0),t.set(u,y),y},clear:function(){t.clear()}}})(q,new Map),a=(function(){var r=Math.floor(16.666666666666668),t,u,y={},e=0;return typeof requestAnimationFrame=="function"&&typeof cancelAnimationFrame=="function"?(t=function(n){var c=Math.random();return y[c]=requestAnimationFrame(function o(i){e===i||e+r-1<i?(e=i,delete y[c],n()):y[c]=requestAnimationFrame(o)}),c},u=function(n){y[n]&&cancelAnimationFrame(y[n])}):(t=function(n){return setTimeout(n,r)},u=function(n){return clearTimeout(n)}),{frame:t,cancel:u}})(),M=(function(){var r,t,u={};function y(e){function n(c,o){e.postMessage({options:c||{},callback:o})}e.init=function(o){var i=o.transferControlToOffscreen();e.postMessage({canvas:i},[i])},e.fire=function(o,i,l){if(t)return n(o,null),t;var h=Math.random().toString(36).slice(2);return t=O(function(v){function p(T){T.data.callback===h&&(delete u[h],e.removeEventListener("message",p),t=null,d.clear(),l(),v())}e.addEventListener("message",p),n(o,h),u[h]=p.bind(null,{data:{callback:h}})}),t},e.reset=function(){e.postMessage({reset:!0});for(var o in u)u[o](),delete u[o]}}return function(){if(r)return r;if(!k&&N){var e=["var CONFETTI, SIZE = {}, module = {};","("+w.toString()+")(this, module, true, SIZE);","onmessage = function(msg) {","  if (msg.data.options) {","    CONFETTI(msg.data.options).then(function () {","      if (msg.data.callback) {","        postMessage({ callback: msg.data.callback });","      }","    });","  } else if (msg.data.reset) {","    CONFETTI && CONFETTI.reset();","  } else if (msg.data.resize) {","    SIZE.width = msg.data.resize.width;","    SIZE.height = msg.data.resize.height;","  } else if (msg.data.canvas) {","    SIZE.width = msg.data.canvas.width;","    SIZE.height = msg.data.canvas.height;","    CONFETTI = module.exports.create(msg.data.canvas);","  }","}"].join(`
`);try{r=new Worker(URL.createObjectURL(new Blob([e])))}catch(n){return typeof console<"u"&&typeof console.warn=="function"&&console.warn("🎊 Could not load worker",n),null}y(r)}return r}})(),R={particleCount:50,angle:90,spread:45,startVelocity:45,decay:.9,gravity:1,drift:0,ticks:200,x:.5,y:.5,shapes:["square","circle"],zIndex:100,colors:["#26ccff","#a25afd","#ff5e7e","#88ff5a","#fcff42","#ffa62d","#ff36ff"],disableForReducedMotion:!1,scalar:1};function F(r,t){return t?t(r):r}function D(r){return r!=null}function E(r,t,u){return F(r&&D(r[t])?r[t]:R[t],u)}function ee(r){return r<0?0:Math.floor(r)}function j(r,t){return Math.floor(Math.random()*(t-r))+r}function V(r){return parseInt(r,16)}function W(r){return r.map(G)}function G(r){var t=String(r).replace(/[^0-9a-f]/gi,"");return t.length<6&&(t=t[0]+t[0]+t[1]+t[1]+t[2]+t[2]),{r:V(t.substring(0,2)),g:V(t.substring(2,4)),b:V(t.substring(4,6))}}function te(r){var t=E(r,"origin",Object);return t.x=E(t,"x",Number),t.y=E(t,"y",Number),t}function K(r){r.width=document.documentElement.clientWidth,r.height=document.documentElement.clientHeight}function _(r){var t=r.getBoundingClientRect();r.width=t.width,r.height=t.height}function re(r){var t=document.createElement("canvas");return t.style.position="fixed",t.style.top="0px",t.style.left="0px",t.style.pointerEvents="none",t.style.zIndex=r,t}function X(r,t,u,y,e,n,c,o,i){r.save(),r.translate(t,u),r.rotate(n),r.scale(y,e),r.arc(0,0,1,c,o,i),r.restore()}function ae(r){var t=r.angle*(Math.PI/180),u=r.spread*(Math.PI/180);return{x:r.x,y:r.y,wobble:Math.random()*10,wobbleSpeed:Math.min(.11,Math.random()*.1+.05),velocity:r.startVelocity*.5+Math.random()*r.startVelocity,angle2D:-t+(.5*u-Math.random()*u),tiltAngle:(Math.random()*(.75-.25)+.25)*Math.PI,color:r.color,shape:r.shape,tick:0,totalTicks:r.ticks,decay:r.decay,drift:r.drift,random:Math.random()+2,tiltSin:0,tiltCos:0,wobbleX:0,wobbleY:0,gravity:r.gravity*3,ovalScalar:.6,scalar:r.scalar,flat:r.flat}}function Q(r,t){t.x+=Math.cos(t.angle2D)*t.velocity+t.drift,t.y+=Math.sin(t.angle2D)*t.velocity+t.gravity,t.velocity*=t.decay,t.flat?(t.wobble=0,t.wobbleX=t.x+10*t.scalar,t.wobbleY=t.y+10*t.scalar,t.tiltSin=0,t.tiltCos=0,t.random=1):(t.wobble+=t.wobbleSpeed,t.wobbleX=t.x+10*t.scalar*Math.cos(t.wobble),t.wobbleY=t.y+10*t.scalar*Math.sin(t.wobble),t.tiltAngle+=.1,t.tiltSin=Math.sin(t.tiltAngle),t.tiltCos=Math.cos(t.tiltAngle),t.random=Math.random()+2);var u=t.tick++/t.totalTicks,y=t.x+t.random*t.tiltCos,e=t.y+t.random*t.tiltSin,n=t.wobbleX+t.random*t.tiltCos,c=t.wobbleY+t.random*t.tiltSin;if(r.fillStyle="rgba("+t.color.r+", "+t.color.g+", "+t.color.b+", "+(1-u)+")",r.beginPath(),I&&t.shape.type==="path"&&typeof t.shape.path=="string"&&Array.isArray(t.shape.matrix))r.fill(z(t.shape.path,t.shape.matrix,t.x,t.y,Math.abs(n-y)*.1,Math.abs(c-e)*.1,Math.PI/10*t.wobble));else if(t.shape.type==="bitmap"){var o=Math.PI/10*t.wobble,i=Math.abs(n-y)*.1,l=Math.abs(c-e)*.1,h=t.shape.bitmap.width*t.scalar,v=t.shape.bitmap.height*t.scalar,p=new DOMMatrix([Math.cos(o)*i,Math.sin(o)*i,-Math.sin(o)*l,Math.cos(o)*l,t.x,t.y]);p.multiplySelf(new DOMMatrix(t.shape.matrix));var T=r.createPattern(d.transform(t.shape.bitmap),"no-repeat");T.setTransform(p),r.globalAlpha=1-u,r.fillStyle=T,r.fillRect(t.x-h/2,t.y-v/2,h,v),r.globalAlpha=1}else if(t.shape==="circle")r.ellipse?r.ellipse(t.x,t.y,Math.abs(n-y)*t.ovalScalar,Math.abs(c-e)*t.ovalScalar,Math.PI/10*t.wobble,0,2*Math.PI):X(r,t.x,t.y,Math.abs(n-y)*t.ovalScalar,Math.abs(c-e)*t.ovalScalar,Math.PI/10*t.wobble,0,2*Math.PI);else if(t.shape==="star")for(var g=Math.PI/2*3,b=4*t.scalar,P=8*t.scalar,$=t.x,H=t.y,U=5,L=Math.PI/U;U--;)$=t.x+Math.cos(g)*P,H=t.y+Math.sin(g)*P,r.lineTo($,H),g+=L,$=t.x+Math.cos(g)*b,H=t.y+Math.sin(g)*b,r.lineTo($,H),g+=L;else r.moveTo(Math.floor(t.x),Math.floor(t.y)),r.lineTo(Math.floor(t.wobbleX),Math.floor(e)),r.lineTo(Math.floor(n),Math.floor(c)),r.lineTo(Math.floor(y),Math.floor(t.wobbleY));return r.closePath(),r.fill(),t.tick<t.totalTicks}function oe(r,t,u,y,e){var n=t.slice(),c=r.getContext("2d"),o,i,l=O(function(h){function v(){o=i=null,c.clearRect(0,0,y.width,y.height),d.clear(),e(),h()}function p(){k&&!(y.width===S.width&&y.height===S.height)&&(y.width=r.width=S.width,y.height=r.height=S.height),!y.width&&!y.height&&(u(r),y.width=r.width,y.height=r.height),c.clearRect(0,0,y.width,y.height),n=n.filter(function(T){return Q(c,T)}),n.length?o=a.frame(p):v()}o=a.frame(p),i=v});return{addFettis:function(h){return n=n.concat(h),l},canvas:r,promise:l,reset:function(){o&&a.cancel(o),i&&i()}}}function J(r,t){var u=!r,y=!!E(t||{},"resize"),e=!1,n=E(t,"disableForReducedMotion",Boolean),c=N&&!!E(t||{},"useWorker"),o=c?M():null,i=u?K:_,l=r&&o?!!r.__confetti_initialized:!1,h=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion)").matches,v;function p(g,b,P){for(var $=E(g,"particleCount",ee),H=E(g,"angle",Number),U=E(g,"spread",Number),L=E(g,"startVelocity",Number),Me=E(g,"decay",Number),we=E(g,"gravity",Number),Ce=E(g,"drift",Number),de=E(g,"colors",W),Ee=E(g,"ticks",Number),he=E(g,"shapes"),Te=E(g,"scalar"),xe=!!E(g,"flat"),ye=te(g),fe=$,ie=[],be=r.width*ye.x,Re=r.height*ye.y;fe--;)ie.push(ae({x:be,y:Re,angle:H,spread:U,startVelocity:L,color:de[fe%de.length],shape:he[j(0,he.length)],ticks:Ee,decay:Me,gravity:we,drift:Ce,scalar:Te,flat:xe}));return v?v.addFettis(ie):(v=oe(r,ie,i,b,P),v.promise)}function T(g){var b=n||E(g,"disableForReducedMotion",Boolean),P=E(g,"zIndex",Number);if(b&&h)return O(function(L){L()});u&&v?r=v.canvas:u&&!r&&(r=re(P),document.body.appendChild(r)),y&&!l&&i(r);var $={width:r.width,height:r.height};o&&!l&&o.init(r),l=!0,o&&(r.__confetti_initialized=!0);function H(){if(o){var L={getBoundingClientRect:function(){if(!u)return r.getBoundingClientRect()}};i(L),o.postMessage({resize:{width:L.width,height:L.height}});return}$.width=$.height=null}function U(){v=null,y&&(e=!1,m.removeEventListener("resize",H)),u&&r&&(document.body.contains(r)&&document.body.removeChild(r),r=null,l=!1)}return y&&!e&&(e=!0,m.addEventListener("resize",H,!1)),o?o.fire(g,$,U):p(g,$,U)}return T.reset=function(){o&&o.reset(),v&&v.reset()},T}var B;function ne(){return B||(B=J(null,{useWorker:!0,resize:!0})),B}function z(r,t,u,y,e,n,c){var o=new Path2D(r),i=new Path2D;i.addPath(o,new DOMMatrix(t));var l=new Path2D;return l.addPath(i,new DOMMatrix([Math.cos(c)*e,Math.sin(c)*e,-Math.sin(c)*n,Math.cos(c)*n,u,y])),l}function Y(r){if(!I)throw new Error("path confetti are not supported in this browser");var t,u;typeof r=="string"?t=r:(t=r.path,u=r.matrix);var y=new Path2D(t),e=document.createElement("canvas"),n=e.getContext("2d");if(!u){for(var c=1e3,o=c,i=c,l=0,h=0,v,p,T=0;T<c;T+=2)for(var g=0;g<c;g+=2)n.isPointInPath(y,T,g,"nonzero")&&(o=Math.min(o,T),i=Math.min(i,g),l=Math.max(l,T),h=Math.max(h,g));v=l-o,p=h-i;var b=10,P=Math.min(b/v,b/p);u=[P,0,0,P,-Math.round(v/2+o)*P,-Math.round(p/2+i)*P]}return{type:"path",path:t,matrix:u}}function ce(r){var t,u=1,y="#000000",e='"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", "Twemoji Mozilla", "system emoji", sans-serif';typeof r=="string"?t=r:(t=r.text,u="scalar"in r?r.scalar:u,e="fontFamily"in r?r.fontFamily:e,y="color"in r?r.color:y);var n=10*u,c=""+n+"px "+e,o=new OffscreenCanvas(n,n),i=o.getContext("2d");i.font=c;var l=i.measureText(t),h=Math.ceil(l.actualBoundingBoxRight+l.actualBoundingBoxLeft),v=Math.ceil(l.actualBoundingBoxAscent+l.actualBoundingBoxDescent),p=2,T=l.actualBoundingBoxLeft+p,g=l.actualBoundingBoxAscent+p;h+=p+p,v+=p+p,o=new OffscreenCanvas(h,v),i=o.getContext("2d"),i.font=c,i.fillStyle=y,i.fillText(t,T,g);var b=1/u;return{type:"bitmap",bitmap:o.transferToImageBitmap(),matrix:[b,0,0,b,-h*b/2,-v*b/2]}}C.exports=function(){return ne().apply(this,arguments)},C.exports.reset=function(){ne().reset()},C.exports.create=J,C.exports.shapeFromPath=Y,C.exports.shapeFromText=ce})((function(){return typeof window<"u"?window:typeof self<"u"?self:this||{}})(),le,!1);const Zr=le.exports;le.exports.create;export{lr as $,Ft as A,Wt as B,Jt as C,cr as D,Vt as E,hr as F,yr as G,_r as H,vr as I,pr as J,br as K,mr as L,Er as M,rr as N,Nr as O,xr as P,Dr as Q,Sr as R,jr as S,zr as T,Ur as U,Tr as V,ir as W,Vr as X,Or as Y,Yr as Z,Ar as _,Dt as a,qr as a0,Gt as a1,dr as a2,Br as a3,Pr as a4,wr as a5,kr as a6,sr as a7,ur as a8,or as a9,qt as aa,Z as b,fr as c,Mr as d,Hr as e,Yt as f,Se as g,gr as h,nr as i,Fr as j,Zt as k,er as l,tr as m,Kt as n,Qt as o,Ir as p,Ut as q,_e as r,Zr as s,Cr as t,Xt as u,Rr as v,$r as w,ar as x,Bt as y,Lr as z};
