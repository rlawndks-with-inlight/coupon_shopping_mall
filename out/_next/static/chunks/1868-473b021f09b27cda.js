"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1868],{53156:function(e,t,n){n.d(t,{Z:function(){return Z}});var r=n(63366),i=n(87462),o=n(67294),l=n(86010),s=n(14142),a=n(34867),u=n(94780),d=n(29628),c=n(70182);let f=(0,c.ZP)();var h=n(66500),p=n(85893);let g=["className","component","disableGutters","fixed","maxWidth","classes"],m=(0,h.Z)(),v=f("div",{name:"MuiContainer",slot:"Root",overridesResolver:(e,t)=>{let{ownerState:n}=e;return[t.root,t[`maxWidth${(0,s.Z)(String(n.maxWidth))}`],n.fixed&&t.fixed,n.disableGutters&&t.disableGutters]}}),y=e=>(0,d.Z)({props:e,name:"MuiContainer",defaultTheme:m}),x=(e,t)=>{let{classes:n,fixed:r,disableGutters:i,maxWidth:o}=e,l={root:["root",o&&`maxWidth${(0,s.Z)(String(o))}`,r&&"fixed",i&&"disableGutters"]};return(0,u.Z)(l,e=>(0,a.Z)(t,e),n)};var w=n(98216),b=n(90948),W=n(71657);let k=function(e={}){let{createStyledComponent:t=v,useThemeProps:n=y,componentName:s="MuiContainer"}=e,a=t(({theme:e,ownerState:t})=>(0,i.Z)({width:"100%",marginLeft:"auto",boxSizing:"border-box",marginRight:"auto",display:"block"},!t.disableGutters&&{paddingLeft:e.spacing(2),paddingRight:e.spacing(2),[e.breakpoints.up("sm")]:{paddingLeft:e.spacing(3),paddingRight:e.spacing(3)}}),({theme:e,ownerState:t})=>t.fixed&&Object.keys(e.breakpoints.values).reduce((t,n)=>{let r=e.breakpoints.values[n];return 0!==r&&(t[e.breakpoints.up(n)]={maxWidth:`${r}${e.breakpoints.unit}`}),t},{}),({theme:e,ownerState:t})=>(0,i.Z)({},"xs"===t.maxWidth&&{[e.breakpoints.up("xs")]:{maxWidth:Math.max(e.breakpoints.values.xs,444)}},t.maxWidth&&"xs"!==t.maxWidth&&{[e.breakpoints.up(t.maxWidth)]:{maxWidth:`${e.breakpoints.values[t.maxWidth]}${e.breakpoints.unit}`}})),u=o.forwardRef(function(e,t){let o=n(e),{className:u,component:d="div",disableGutters:c=!1,fixed:f=!1,maxWidth:h="lg"}=o,m=(0,r.Z)(o,g),v=(0,i.Z)({},o,{component:d,disableGutters:c,fixed:f,maxWidth:h}),y=x(v,s);return(0,p.jsx)(a,(0,i.Z)({as:d,ownerState:v,className:(0,l.Z)(y.root,u),ref:t},m))});return u}({createStyledComponent:(0,b.ZP)("div",{name:"MuiContainer",slot:"Root",overridesResolver:(e,t)=>{let{ownerState:n}=e;return[t.root,t[`maxWidth${(0,w.Z)(String(n.maxWidth))}`],n.fixed&&t.fixed,n.disableGutters&&t.disableGutters]}}),useThemeProps:e=>(0,W.Z)({props:e,name:"MuiContainer"})});var Z=k},26447:function(e,t,n){var r=n(63366),i=n(87462),o=n(67294),l=n(95408),s=n(98700),a=n(39707),u=n(59766),d=n(90948),c=n(71657),f=n(85893);let h=["component","direction","spacing","divider","children"],p=e=>({row:"Left","row-reverse":"Right",column:"Top","column-reverse":"Bottom"})[e],g=(0,d.ZP)("div",{name:"MuiStack",slot:"Root",overridesResolver:(e,t)=>[t.root]})(({ownerState:e,theme:t})=>{let n=(0,i.Z)({display:"flex",flexDirection:"column"},(0,l.k9)({theme:t},(0,l.P$)({values:e.direction,breakpoints:t.breakpoints.values}),e=>({flexDirection:e})));if(e.spacing){let r=(0,s.hB)(t),i=Object.keys(t.breakpoints.values).reduce((t,n)=>(("object"==typeof e.spacing&&null!=e.spacing[n]||"object"==typeof e.direction&&null!=e.direction[n])&&(t[n]=!0),t),{}),o=(0,l.P$)({values:e.direction,base:i}),a=(0,l.P$)({values:e.spacing,base:i});"object"==typeof o&&Object.keys(o).forEach((e,t,n)=>{let r=o[e];if(!r){let r=t>0?o[n[t-1]]:"column";o[e]=r}}),n=(0,u.Z)(n,(0,l.k9)({theme:t},a,(t,n)=>({"& > :not(style) + :not(style)":{margin:0,[`margin${p(n?o[n]:e.direction)}`]:(0,s.NA)(r,t)}})))}return(0,l.dt)(t.breakpoints,n)}),m=o.forwardRef(function(e,t){let n=(0,c.Z)({props:e,name:"MuiStack"}),l=(0,a.Z)(n),{component:s="div",direction:u="column",spacing:d=0,divider:p,children:m}=l,v=(0,r.Z)(l,h);return(0,f.jsx)(g,(0,i.Z)({as:s,ownerState:{direction:u,spacing:d},ref:t},v,{children:p?function(e,t){let n=o.Children.toArray(e).filter(Boolean);return n.reduce((e,r,i)=>(e.push(r),i<n.length-1&&e.push(o.cloneElement(t,{key:`separator-${i}`})),e),[])}(m,p):m}))});t.Z=m},98396:function(e,t,n){n.d(t,{Z:function(){return c}});var r,i=n(67294),o=n(34168),l=n(20539),s=n(58974);function a(e,t,n,r,o){let l="undefined"!=typeof window&&void 0!==window.matchMedia,[a,u]=i.useState(()=>o&&l?n(e).matches:r?r(e).matches:t);return(0,s.Z)(()=>{let t=!0;if(!l)return;let r=n(e),i=()=>{t&&u(r.matches)};return i(),r.addListener(i),()=>{t=!1,r.removeListener(i)}},[e,n,l]),a}let u=(r||(r=n.t(i,2))).useSyncExternalStore;function d(e,t,n,r){let o=i.useCallback(()=>t,[t]),l=i.useMemo(()=>{if(null!==r){let{matches:t}=r(e);return()=>t}return o},[o,e,r]),[s,a]=i.useMemo(()=>{if(null===n)return[o,()=>()=>{}];let t=n(e);return[()=>t.matches,e=>(t.addListener(e),()=>{t.removeListener(e)})]},[o,n,e]),d=u(a,s,l);return d}function c(e,t={}){let n=(0,o.Z)(),r="undefined"!=typeof window&&void 0!==window.matchMedia,{defaultMatches:i=!1,matchMedia:s=r?window.matchMedia:null,ssrMatchMedia:c=null,noSsr:f}=(0,l.Z)({name:"MuiUseMediaQuery",props:t,theme:n}),h="function"==typeof e?e(n):e;h=h.replace(/^@media( ?)/m,"");let p=(void 0!==u?d:a)(h,i,s,c,f);return p}},46385:function(e,t,n){let r,i;n.d(t,{v:function(){return H}});var o=n(33234),l=n(96681),s=n(67294),a=n(45487),u=n(66405),d=n(37367);let c=new WeakMap;function f({target:e,contentRect:t,borderBoxSize:n}){var r;null===(r=c.get(e))||void 0===r||r.forEach(r=>{r({target:e,contentSize:t,get size(){return function(e,t){if(t){let{inlineSize:e,blockSize:n}=t[0];return{width:e,height:n}}return e instanceof SVGElement&&"getBBox"in e?e.getBBox():{width:e.offsetWidth,height:e.offsetHeight}}(e,n)}})})}function h(e){e.forEach(f)}let p=new Set;var g=n(23967),m=n(3038);let v=()=>({current:0,offset:[],progress:0,scrollLength:0,targetOffset:0,targetLength:0,containerLength:0,velocity:0}),y=()=>({time:0,x:v(),y:v()}),x={x:{length:"Width",position:"Left"},y:{length:"Height",position:"Top"}};function w(e,t,n,r){let i=n[t],{length:o,position:l}=x[t],s=i.current,a=n.time;i.current=e["scroll"+l],i.scrollLength=e["scroll"+o]-e["client"+o],i.offset.length=0,i.offset[0]=0,i.offset[1]=i.scrollLength,i.progress=(0,g.Y)(0,i.scrollLength,i.current);let u=r-a;i.velocity=u>50?0:(0,m.R)(i.current-s,u)}let b={Enter:[[0,1],[1,1]],Exit:[[0,0],[1,0]],Any:[[1,0],[0,1]],All:[[0,0],[1,1]]},W={start:0,center:.5,end:1};function k(e,t,n=0){let r=0;if(void 0!==W[e]&&(e=W[e]),"string"==typeof e){let t=parseFloat(e);e.endsWith("px")?r=t:e.endsWith("%")?e=t/100:e.endsWith("vw")?r=t/100*document.documentElement.clientWidth:e.endsWith("vh")?r=t/100*document.documentElement.clientHeight:e=t}return"number"==typeof e&&(r=t*e),n+r}let Z=[0,0];var E=n(64606),L=n(30533);let S={x:0,y:0},M=new WeakMap,B=new WeakMap,R=new WeakMap,P=e=>e===document.documentElement?window:e;var $=n(58868);function z(e,t){(0,a.K)(!!(!t||t.current),`You have defined a ${e} options but the provided ref is not yet hydrated, probably because it's defined higher up the tree. Try calling useScroll() in the same component as the ref, or setting its \`layoutEffect: false\` option.`)}let O=()=>({scrollX:(0,o.B)(0),scrollY:(0,o.B)(0),scrollXProgress:(0,o.B)(0),scrollYProgress:(0,o.B)(0)});function H({container:e,target:t,layoutEffect:n=!0,...o}={}){let f=(0,l.h)(O),g=n?$.L:s.useEffect;return g(()=>(z("target",t),z("container",e),function(e,{container:t=document.documentElement,...n}={}){let o=R.get(t);o||(o=new Set,R.set(t,o));let l=y(),s=function(e,t,n,r={}){return{measure:()=>(function(e,t=e,n){if(n.x.targetOffset=0,n.y.targetOffset=0,t!==e){let r=t;for(;r&&r!==e;)n.x.targetOffset+=r.offsetLeft,n.y.targetOffset+=r.offsetTop,r=r.offsetParent}n.x.targetLength=t===e?t.scrollWidth:t.clientWidth,n.y.targetLength=t===e?t.scrollHeight:t.clientHeight,n.x.containerLength=e.clientWidth,n.y.containerLength=e.clientHeight})(e,r.target,n),update:t=>{w(e,"x",n,t),w(e,"y",n,t),n.time=t,(r.offset||r.target)&&function(e,t,n){let{offset:r=b.All}=n,{target:i=e,axis:o="y"}=n,l="y"===o?"height":"width",s=i!==e?function(e,t){let n={x:0,y:0},r=e;for(;r&&r!==t;)if(r instanceof HTMLElement)n.x+=r.offsetLeft,n.y+=r.offsetTop,r=r.offsetParent;else if(r instanceof SVGGraphicsElement&&"getBBox"in r){let{top:e,left:t}=r.getBBox();for(n.x+=t,n.y+=e;r&&"svg"!==r.tagName;)r=r.parentNode}return n}(i,e):S,a=i===e?{width:e.scrollWidth,height:e.scrollHeight}:{width:i.clientWidth,height:i.clientHeight},u={width:e.clientWidth,height:e.clientHeight};t[o].offset.length=0;let d=!t[o].interpolate,c=r.length;for(let e=0;e<c;e++){let n=function(e,t,n,r){let i=Array.isArray(e)?e:Z,o=0;return"number"==typeof e?i=[e,e]:"string"==typeof e&&(i=(e=e.trim()).includes(" ")?e.split(" "):[e,W[e]?e:"0"]),k(i[0],n,r)-k(i[1],t)}(r[e],u[l],a[l],s[o]);d||n===t[o].interpolatorOffsets[e]||(d=!0),t[o].offset[e]=n}d&&(t[o].interpolate=(0,E.s)(t[o].offset,(0,L.Y)(r)),t[o].interpolatorOffsets=[...t[o].offset]),t[o].progress=t[o].interpolate(t[o].current)}(e,n,r)},notify:()=>t(n)}}(t,e,l,n);if(o.add(s),!M.has(t)){let e=()=>{for(let e of o)e.measure()},n=()=>{for(let e of o)e.update(d.frameData.timestamp)},l=()=>{for(let e of o)e.notify()},s=()=>{u.Wi.read(e,!1,!0),u.Wi.update(n,!1,!0),u.Wi.update(l,!1,!0)};M.set(t,s);let f=P(t);window.addEventListener("resize",s,{passive:!0}),t!==document.documentElement&&B.set(t,"function"==typeof t?(p.add(t),i||(i=()=>{let e={width:window.innerWidth,height:window.innerHeight},t={target:window,size:e,contentSize:e};p.forEach(e=>e(t))},window.addEventListener("resize",i)),()=>{p.delete(t),!p.size&&i&&(i=void 0)}):function(e,t){r||"undefined"==typeof ResizeObserver||(r=new ResizeObserver(h));let n=function(e,t,n){var r;if("string"==typeof e){let i=document;t&&((0,a.k)(!!t.current,"Scope provided, but no element detected."),i=t.current),n?(null!==(r=n[e])&&void 0!==r||(n[e]=i.querySelectorAll(e)),e=n[e]):e=i.querySelectorAll(e)}else e instanceof Element&&(e=[e]);return Array.from(e||[])}(e);return n.forEach(e=>{let n=c.get(e);n||(n=new Set,c.set(e,n)),n.add(t),null==r||r.observe(e)}),()=>{n.forEach(e=>{let n=c.get(e);null==n||n.delete(t),(null==n?void 0:n.size)||null==r||r.unobserve(e)})}}(t,s)),f.addEventListener("scroll",s,{passive:!0})}let f=M.get(t);return u.Wi.read(f,!1,!0),()=>{var e;(0,u.Pn)(f);let n=R.get(t);if(!n||(n.delete(s),n.size))return;let r=M.get(t);M.delete(t),r&&(P(t).removeEventListener("scroll",r),null===(e=B.get(t))||void 0===e||e(),window.removeEventListener("resize",r))}}(({x:e,y:t})=>{f.scrollX.set(e.current),f.scrollXProgress.set(e.progress),f.scrollY.set(t.current),f.scrollYProgress.set(t.progress)},{...o,container:(null==e?void 0:e.current)||void 0,target:(null==t?void 0:t.current)||void 0})),[]),f}}}]);