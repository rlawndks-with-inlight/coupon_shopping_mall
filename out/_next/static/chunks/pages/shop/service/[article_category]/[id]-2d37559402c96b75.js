(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4794],{55936:function(e,t,l){(window.__NEXT_P=window.__NEXT_P||[]).push(["/shop/service/[article_category]/[id]",function(){return l(59493)}])},95677:function(e,t,l){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var l in t)Object.defineProperty(e,l,{enumerable:!0,get:t[l]})}(t,{noSSR:function(){return o},default:function(){return a}});let r=l(38754),i=(l(67294),r._(l(8976)));function n(e){return{default:(null==e?void 0:e.default)||e}}function o(e,t){return delete t.webpack,delete t.modules,e(t)}function a(e,t){let l=i.default,r={loading:e=>{let{error:t,isLoading:l,pastDelay:r}=e;return null}};e instanceof Promise?r.loader=()=>e:"function"==typeof e?r.loader=e:"object"==typeof e&&(r={...r,...e}),r={...r,...t};let a=r.loader;return(r.loadableGenerated&&(r={...r,...r.loadableGenerated},delete r.loadableGenerated),"boolean"!=typeof r.ssr||r.ssr)?l({...r,loader:()=>null!=a?a().then(n):Promise.resolve(n(()=>null))}):(delete r.webpack,delete r.modules,o(l,r))}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},92254:function(e,t,l){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"LoadableContext",{enumerable:!0,get:function(){return n}});let r=l(38754),i=r._(l(67294)),n=i.default.createContext(null)},8976:function(e,t,l){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"default",{enumerable:!0,get:function(){return b}});let r=l(38754),i=r._(l(67294)),n=l(92254),o=[],a=[],s=!1;function u(e){let t=e(),l={loading:!0,loaded:null,error:null};return l.promise=t.then(e=>(l.loading=!1,l.loaded=e,e)).catch(e=>{throw l.loading=!1,l.error=e,e}),l}class d{promise(){return this._res.promise}retry(){this._clearTimeouts(),this._res=this._loadFn(this._opts.loader),this._state={pastDelay:!1,timedOut:!1};let{_res:e,_opts:t}=this;e.loading&&("number"==typeof t.delay&&(0===t.delay?this._state.pastDelay=!0:this._delay=setTimeout(()=>{this._update({pastDelay:!0})},t.delay)),"number"==typeof t.timeout&&(this._timeout=setTimeout(()=>{this._update({timedOut:!0})},t.timeout))),this._res.promise.then(()=>{this._update({}),this._clearTimeouts()}).catch(e=>{this._update({}),this._clearTimeouts()}),this._update({})}_update(e){this._state={...this._state,error:this._res.error,loaded:this._res.loaded,loading:this._res.loading,...e},this._callbacks.forEach(e=>e())}_clearTimeouts(){clearTimeout(this._delay),clearTimeout(this._timeout)}getCurrentValue(){return this._state}subscribe(e){return this._callbacks.add(e),()=>{this._callbacks.delete(e)}}constructor(e,t){this._loadFn=e,this._opts=t,this._callbacks=new Set,this._delay=null,this._timeout=null,this.retry()}}function c(e){return function(e,t){let l=Object.assign({loader:null,loading:null,delay:200,timeout:null,webpack:null,modules:null},t),r=null;function o(){if(!r){let t=new d(e,l);r={getCurrentValue:t.getCurrentValue.bind(t),subscribe:t.subscribe.bind(t),retry:t.retry.bind(t),promise:t.promise.bind(t)}}return r.promise()}if(!s){let e=l.webpack?l.webpack():l.modules;e&&a.push(t=>{for(let l of e)if(t.includes(l))return o()})}function u(e,t){!function(){o();let e=i.default.useContext(n.LoadableContext);e&&Array.isArray(l.modules)&&l.modules.forEach(t=>{e(t)})}();let a=i.default.useSyncExternalStore(r.subscribe,r.getCurrentValue,r.getCurrentValue);return i.default.useImperativeHandle(t,()=>({retry:r.retry}),[]),i.default.useMemo(()=>{var t;return a.loading||a.error?i.default.createElement(l.loading,{isLoading:a.loading,pastDelay:a.pastDelay,timedOut:a.timedOut,error:a.error,retry:r.retry}):a.loaded?i.default.createElement((t=a.loaded)&&t.default?t.default:t,e):null},[e,a])}return u.preload=()=>o(),u.displayName="LoadableComponent",i.default.forwardRef(u)}(u,e)}function p(e,t){let l=[];for(;e.length;){let r=e.pop();l.push(r(t))}return Promise.all(l).then(()=>{if(e.length)return p(e,t)})}c.preloadAll=()=>new Promise((e,t)=>{p(o).then(e,t)}),c.preloadReady=e=>(void 0===e&&(e=[]),new Promise(t=>{let l=()=>(s=!0,t());p(a,e).then(l,l)})),window.__NEXT_PRELOADREADY=c.preloadReady;let b=c},61372:function(e,t,l){"use strict";var r=l(85893),i=l(67294),n=l(2734);t.Z=(0,i.memo)(function(){let e=(0,n.Z)(),t=e.palette.primary.main;return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("defs",{children:(0,r.jsxs)("linearGradient",{id:"BG",x1:"19.496%",x2:"77.479%",y1:"71.822%",y2:"16.69%",children:[(0,r.jsx)("stop",{offset:"0%",stopColor:t}),(0,r.jsx)("stop",{offset:"100%",stopColor:t,stopOpacity:"0"})]})}),(0,r.jsx)("path",{fill:"url(#BG)",fillRule:"nonzero",d:"M0 198.78c0 41.458 14.945 79.236 39.539 107.786 28.214 32.765 69.128 53.365 114.734 53.434a148.44 148.44 0 0056.495-11.036c9.051-3.699 19.182-3.274 27.948 1.107a75.779 75.779 0 0033.957 8.01c5.023 0 9.942-.494 14.7-1.433 13.58-2.67 25.94-8.99 36.09-17.94 6.378-5.627 14.547-8.456 22.897-8.446h.142c27.589 0 53.215-8.732 74.492-23.696 19.021-13.36 34.554-31.696 44.904-53.224C474.92 234.58 480 213.388 480 190.958c0-76.93-59.774-139.305-133.498-139.305-7.516 0-14.88.663-22.063 1.899C305.418 21.42 271.355 0 232.499 0a103.651 103.651 0 00-45.88 10.661c-13.24 6.487-25.011 15.705-34.64 26.939-32.698.544-62.931 11.69-87.676 30.291C25.351 97.155 0 144.882 0 198.781z",opacity:"0.2"})]})})},64073:function(e,t,l){"use strict";var r=l(85893),i=l(45697),n=l.n(i),o=l(82145),a=l(67294),s=l(93946),u=l(87357);let d=(0,a.forwardRef)((e,t)=>{let{children:l,size:i="medium",...n}=e;return(0,r.jsx)(h,{size:i,children:(0,r.jsx)(s.Z,{size:i,ref:t,...n,children:l})})});d.propTypes={children:n().node,color:n().oneOf(["inherit","default","primary","secondary","info","success","warning","error"]),size:n().oneOf(["small","medium","large"])},t.Z=d;let c={hover:{scale:1.1},tap:{scale:.95}},p={hover:{scale:1.09},tap:{scale:.97}},b={hover:{scale:1.08},tap:{scale:.99}};function h(e){let{size:t,children:l}=e;return(0,r.jsx)(u.Z,{component:o.m.div,whileTap:"tap",whileHover:"hover",variants:"small"===t&&c||"large"===t&&b||p,sx:{display:"inline-flex"},children:l})}h.propTypes={children:n().node,size:n().oneOf(["small","medium","large"])}},18881:function(e,t,l){"use strict";l.d(t,{Fk:function(){return i},l2:function(){return r}});let r=e=>{let t=(null==e?void 0:e.durationIn)||.64,l=(null==e?void 0:e.easeIn)||[.43,.13,.23,.96];return{duration:t,ease:l}},i=e=>{let t=(null==e?void 0:e.durationOut)||.48,l=(null==e?void 0:e.easeOut)||[.43,.13,.23,.96];return{duration:t,ease:l}}},91561:function(e,t,l){"use strict";var r=l(85893),i=l(45697),n=l.n(i),o=l(67294),a=l(1954),s=l(87357);let u=(0,o.forwardRef)((e,t)=>{let{icon:l,width:i=20,sx:n,...o}=e;return(0,r.jsx)(s.Z,{ref:t,component:a.JO,icon:l,sx:{width:i,height:i,...n},...o})});u.propTypes={sx:n().object,width:n().oneOfType([n().number,n().string]),icon:n().oneOfType([n().element,n().string])},t.Z=u},74507:function(e,t,l){"use strict";l.d(t,{Z:function(){return d}});var r=l(85893),i=l(45697),n=l.n(i),o=l(14564),a=l(90948),s=l(41796);let u=(0,a.ZP)("span")(e=>{let{arrow:t,theme:l}=e,r="solid 1px ".concat((0,s.Fq)(l.palette.grey[500],.12)),i={borderRadius:"0 0 3px 0",top:-6,borderBottom:r,borderRight:r},n={borderRadius:"3px 0 0 0",bottom:-6,borderTop:r,borderLeft:r},o={borderRadius:"0 3px 0 0",left:-6,borderTop:r,borderRight:r},a={borderRadius:"0 0 0 3px",right:-6,borderBottom:r,borderLeft:r};return{display:"none",[l.breakpoints.up("sm")]:{zIndex:1,width:12,height:12,content:"''",display:"block",position:"absolute",transform:"rotate(-135deg)",background:l.palette.background.paper},..."top-left"===t&&{...i,left:20},..."top-center"===t&&{...i,left:0,right:0,margin:"auto"},..."top-right"===t&&{...i,right:20},..."bottom-left"===t&&{...n,left:20},..."bottom-center"===t&&{...n,left:0,right:0,margin:"auto"},..."bottom-right"===t&&{...n,right:20},..."left-top"===t&&{...o,top:20},..."left-center"===t&&{...o,top:0,bottom:0,margin:"auto"},..."left-bottom"===t&&{...o,bottom:20},..."right-top"===t&&{...a,top:20},..."right-center"===t&&{...a,top:0,bottom:0,margin:"auto"},..."right-bottom"===t&&{...a,bottom:20}}});function d(e){let{open:t,children:l,arrow:i="top-right",disabledArrow:n,sx:a,...s}=e,{style:d,anchorOrigin:c,transformOrigin:p}=function(e){let t;switch(e){case"top-left":t={style:{ml:-.75},anchorOrigin:{vertical:"bottom",horizontal:"left"},transformOrigin:{vertical:"top",horizontal:"left"}};break;case"top-center":t={style:{},anchorOrigin:{vertical:"bottom",horizontal:"center"},transformOrigin:{vertical:"top",horizontal:"center"}};break;case"top-right":default:t={style:{ml:.75},anchorOrigin:{vertical:"bottom",horizontal:"right"},transformOrigin:{vertical:"top",horizontal:"right"}};break;case"bottom-left":t={style:{ml:-.75},anchorOrigin:{vertical:"top",horizontal:"left"},transformOrigin:{vertical:"bottom",horizontal:"left"}};break;case"bottom-center":t={style:{},anchorOrigin:{vertical:"top",horizontal:"center"},transformOrigin:{vertical:"bottom",horizontal:"center"}};break;case"bottom-right":t={style:{ml:.75},anchorOrigin:{vertical:"top",horizontal:"right"},transformOrigin:{vertical:"bottom",horizontal:"right"}};break;case"left-top":t={style:{mt:-.75},anchorOrigin:{vertical:"top",horizontal:"right"},transformOrigin:{vertical:"top",horizontal:"left"}};break;case"left-center":t={anchorOrigin:{vertical:"center",horizontal:"right"},transformOrigin:{vertical:"center",horizontal:"left"}};break;case"left-bottom":t={style:{mt:.75},anchorOrigin:{vertical:"bottom",horizontal:"right"},transformOrigin:{vertical:"bottom",horizontal:"left"}};break;case"right-top":t={style:{mt:-.75},anchorOrigin:{vertical:"top",horizontal:"left"},transformOrigin:{vertical:"top",horizontal:"right"}};break;case"right-center":t={anchorOrigin:{vertical:"center",horizontal:"left"},transformOrigin:{vertical:"center",horizontal:"right"}};break;case"right-bottom":t={style:{mt:.75},anchorOrigin:{vertical:"bottom",horizontal:"left"},transformOrigin:{vertical:"bottom",horizontal:"right"}}}return t}(i);return(0,r.jsxs)(o.ZP,{open:!!t,anchorEl:t,anchorOrigin:c,transformOrigin:p,PaperProps:{sx:{p:1,width:"auto",overflow:"inherit",...d,"& .MuiMenuItem-root":{px:1,typography:"body2",borderRadius:.75,"& svg":{mr:2,width:20,height:20,flexShrink:0}},...a}},...s,children:[!n&&(0,r.jsx)(u,{arrow:i}),l]})}d.propTypes={sx:n().object,open:n().object,children:n().node,disabledArrow:n().bool,arrow:n().oneOf(["top-left","top-center","top-right","bottom-left","bottom-center","bottom-right","left-top","left-center","left-bottom","right-top","right-center","right-bottom"])}},14241:function(e,t,l){"use strict";var r=l(85893),i=l(6585),n=l(90948),o=l(8298);let a=(0,n.ZP)("div")(e=>{let{theme:t}=e;return{zIndex:11,position:"fixed",right:"2rem",bottom:"4rem"}});t.Z=e=>{let{children:t,className:l}=e,n=(0,o.Z)({threshold:10,disableHysteresis:!0});return(0,r.jsx)(i.Z,{in:n,children:(0,r.jsx)(a,{className:l,onClick:()=>{let e=document.querySelector("body");e&&e.scrollIntoView({behavior:"smooth"})},role:"presentation",children:t})})}},19358:function(e,t,l){"use strict";l.d(t,{E:function(){return n}});var r=l(67294),i=l(24129);let n=()=>{let e=(0,r.useContext)(i.V);if(!e)throw Error("useAuthContext context must be use inside AuthProvider");return e}},59493:function(e,t,l){"use strict";l.r(t),l.d(t,{default:function(){return X}});var r=l(85893),i=l(11163),n=l(67294),o=l(92200),a=l(50689),s=l(82729),u=l(52443),d=l(26447),c=l(15861),p=l(50135),b=l(83321),h=l(96486),f=l.n(h),v=l(5152),m=l.n(v),g=l(9008),y=l.n(g),_=l(84475),x=l(7295),j=l(65631),w=l(82367),k=l(19358),O=l(92418),z=l(49824),F=l(81272),Z=l(20273),C=l(50066);function P(){let e=(0,s._)(["\nmax-width:1500px;\ndisplay:flex;\nflex-direction:column;\nmargin: 0 auto;\nwidth: 90%;\nmin-height:90vh;\n"]);return P=function(){return e},e}let R=m()(()=>Promise.all([l.e(2937),l.e(1167)]).then(l.t.bind(l,71167,23)),{loadableGenerated:{webpack:()=>[71167]},ssr:!1,loading:()=>(0,r.jsx)("p",{children:"Loading ..."})}),S=C.ZP.div(P());var E=e=>{var t,l,i,o,s;let{user:h}=(0,k.E)(),{setModal:v}=(0,x.d)(),{func:{router:m}}=e,{translate:g,currentLang:C}=(0,O.Z)(),{themeMode:P,themePostCategoryList:E,themeDnsData:T}=(0,a.K$)();(0,u.u)();let[I,q]=(0,n.useState)({}),[L,N]=(0,n.useState)(!0),[G,K]=(0,n.useState)({parent_id:-1,post_title:"",post_content:"",is_reply:0,post_title_file:void 0});(0,n.useEffect)(()=>{M()},[null===(t=m.query)||void 0===t?void 0:t.article_category,E]);let M=async()=>{var e,t,l;q(f().find(E,{id:parseInt(null===(e=m.query)||void 0===e?void 0:e.article_category)})),(null===(t=m.query)||void 0===t?void 0:t.id)>0&&K(await (0,z.kj)("post","get",{id:null===(l=m.query)||void 0===l?void 0:l.id})),N(!1)},D=async()=>{var e,t,l;((null===(e=m.query)||void 0===e?void 0:e.id)=="add"?await (0,z.kj)("post","create",{...G,category_id:null===(t=m.query)||void 0===t?void 0:t.article_category}):await (0,z.kj)("post","update",{...G}))&&(_.Am.success(g("성공적으로 저장 되었습니다.")),m.push("/shop/service/".concat(null===(l=m.query)||void 0===l?void 0:l.article_category)))};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(y(),{children:(0,r.jsxs)("title",{children:[null==T?void 0:T.name," ",(null==G?void 0:G.post_title)?" - ".concat((0,F.Iz)(G,"post_title",C)):""]})}),(0,r.jsxs)(S,{children:[(0,r.jsxs)(j.Dx,{style:{marginBottom:"2rem"},children:[(0,F.Iz)(I,"post_category_title",C)," ",(null===(l=m.query)||void 0===l?void 0:l.id)=="add"?"작성":""]}),!L&&(0,r.jsx)(r.Fragment,{children:(0,r.jsx)(d.Z,{spacing:3,children:(null===(i=m.query)||void 0===i?void 0:i.id)=="add"||(null==G?void 0:G.user_id)==(null==h?void 0:h.id)?(0,r.jsxs)(r.Fragment,{children:[1==I.post_category_type&&(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(c.Z,{variant:"subtitle2",sx:{color:"text.secondary"},children:g("대표이미지등록")}),(0,r.jsx)(w.Z,{file:G.post_title_file||G.post_title_img,onDrop:e=>{let t=e[0];if(!t.type.includes("image")){_.Am.error("이미지 형식만 가능합니다.");return}if(t.size>=3145728){_.Am.error("이미지 용량은 3MB 이내만 가능합니다.");return}t&&K({...G,post_title_file:Object.assign(t,{preview:URL.createObjectURL(t)})})},onDelete:()=>{K({...G,post_title_file:void 0,post_title_img:""})},fileExplain:{width:g("(512x512 추천)")}})]}),(0,r.jsx)(p.Z,{label:g("제목"),value:G.post_title,onChange:e=>{K({...G,post_title:e.target.value})}}),(0,r.jsx)(Z.Z,{value:G.post_content,setValue:e=>{K({...G,post_content:e})}}),(0,r.jsx)(b.Z,{variant:"contained",style:{height:"48px",width:"120px",margin:"1rem 0 1rem auto"},onClick:()=>{v({func:()=>{D()},icon:"material-symbols:edit-outline",title:g("저장 하시겠습니까?")})},children:g("저장")})]}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(j.X2,{style:{columnGap:"0.5rem",fontSize:"1rem",alignItems:"center"},children:[(0,r.jsxs)("div",{children:[g("제목"),": "]}),(0,r.jsx)("h1",{style:{fontSize:"1rem"},children:(0,F.Iz)(G,"post_title",C)})]}),(0,r.jsx)("img",{src:null==G?void 0:G.post_title_img,style:{width:"100%"}}),(0,r.jsx)(R,{className:"none-padding",value:null!==(o=(0,F.Iz)(G,"post_content",C))&&void 0!==o?o:"<body></body>",readOnly:!0,theme:"bubble",bounds:".app"}),(null==G?void 0:G.replies)&&(null==G?void 0:G.replies.map((e,t)=>(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(j.X2,{style:{columnGap:"0.5rem",fontSize:"1rem",alignItems:"center"},children:[(0,r.jsxs)("div",{children:[g("답변제목"),": "]}),(0,r.jsx)("h1",{style:{fontSize:"1rem"},children:(0,F.Iz)(e,"post_title",C)})]}),(0,r.jsx)(R,{className:"none-padding",value:null!==(s=(0,F.Iz)(e,"post_content",C))&&void 0!==s?s:"<body></body>",readOnly:!0,theme:"bubble",bounds:".app"})]})))]})})})]})]})},T=e=>{let{user:t}=(0,k.E)(),{themeDnsData:l}=(0,a.K$)();return(0,i.useRouter)(),(0,r.jsx)(r.Fragment,{})},I=e=>{let{user:t}=(0,k.E)(),{themeDnsData:l}=(0,a.K$)();return(0,i.useRouter)(),(0,r.jsx)(r.Fragment,{})},q=l(18718);function L(){let e=(0,s._)(["\nmax-width:1600px;\ndisplay:flex;\nflex-direction:column;\nmargin: 0 auto;\nwidth: 90%;\nmin-height:90vh;\nmargin-top: 2rem;\n"]);return L=function(){return e},e}let N=m()(()=>Promise.all([l.e(2937),l.e(1167)]).then(l.t.bind(l,71167,23)),{loadableGenerated:{webpack:()=>[71167]},ssr:!1,loading:()=>(0,r.jsx)("p",{children:"Loading ..."})}),G=C.ZP.div(L());var K=e=>{var t,l,o,s,u,c;let{setModal:h}=(0,x.d)(),{user:v}=(0,k.E)(),{themeDnsData:m,themePostCategoryList:g}=(0,a.K$)(),y=(0,i.useRouter)(),[O,F]=(0,n.useState)({}),[C,P]=(0,n.useState)(!0),[R,S]=(0,n.useState)({parent_id:-1,post_title:"",post_content:"",is_reply:0,post_title_file:void 0});(0,n.useEffect)(()=>{E()},[null===(t=y.query)||void 0===t?void 0:t.article_category,g]);let E=async()=>{var e,t,l;F(f().find(g,{id:parseInt(null===(e=y.query)||void 0===e?void 0:e.article_category)})),(null===(t=y.query)||void 0===t?void 0:t.id)>0&&S(await (0,z.kj)("post","get",{id:null===(l=y.query)||void 0===l?void 0:l.id})),P(!1)},T=async()=>{var e,t,l;((null===(e=y.query)||void 0===e?void 0:e.id)=="add"?await (0,z.kj)("post","create",{...R,category_id:null===(t=y.query)||void 0===t?void 0:t.article_category}):await (0,z.kj)("post","update",{...R}))&&(_.ZP.success("성공적으로 저장 되었습니다."),y.push("/shop/service/".concat(null===(l=y.query)||void 0===l?void 0:l.article_category)))};return(0,r.jsx)(r.Fragment,{children:(0,r.jsx)(G,{children:(0,r.jsxs)(j.NS,{children:[(0,r.jsx)(q.cY,{}),(0,r.jsxs)(q.Lt,{children:[(0,r.jsx)(q.r3,{children:null===(l=f().find(g,{id:parseInt(null===(o=y.query)||void 0===o?void 0:o.article_category)}))||void 0===l?void 0:l.post_category_title}),!C&&(0,r.jsx)(r.Fragment,{children:(0,r.jsx)(d.Z,{spacing:3,children:(null===(s=y.query)||void 0===s?void 0:s.id)=="add"||(null==R?void 0:R.user_id)==(null==v?void 0:v.id)?(0,r.jsxs)(r.Fragment,{children:[1==O.post_category_type&&(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(Typography,{variant:"subtitle2",sx:{color:"text.secondary"},children:"대표이미지등록"}),(0,r.jsx)(w.Z,{file:R.post_title_file||R.post_title_img,onDrop:e=>{let t=e[0];if(!t.type.includes("image")){_.ZP.error("이미지 형식만 가능합니다.");return}if(t.size>=3145728){_.ZP.error("이미지 용량은 3MB 이내만 가능합니다.");return}t&&S({...R,post_title_file:Object.assign(t,{preview:URL.createObjectURL(t)})})},onDelete:()=>{S({...R,post_title_file:void 0,post_title_img:""})},fileExplain:{width:"(512x512 추천)"}})]}),(0,r.jsx)(p.Z,{label:"제목",value:R.post_title,onChange:e=>{S({...R,post_title:e.target.value})}}),(0,r.jsx)(Z.Z,{value:R.post_content,setValue:e=>{S({...R,post_content:e})}}),(0,r.jsx)(b.Z,{variant:"contained",style:{height:"48px",width:"120px",margin:"1rem 0 1rem auto"},onClick:()=>{h({func:()=>{T()},icon:"material-symbols:edit-outline",title:"저장 하시겠습니까?"})},children:"저장"})]}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(j.X2,{style:{columnGap:"0.5rem",fontSize:"1rem",alignItems:"center"},children:[(0,r.jsx)("div",{children:"제목: "}),(0,r.jsx)("h1",{style:{fontSize:"1rem"},children:null==R?void 0:R.post_title})]}),(0,r.jsx)("img",{src:null==R?void 0:R.post_title_img,style:{width:"100%"}}),(0,r.jsx)(N,{className:"none-padding",value:null!==(u=null==R?void 0:R.post_content)&&void 0!==u?u:"<body></body>",readOnly:!0,theme:"bubble",bounds:".app"}),(null==R?void 0:R.replies)&&(null==R?void 0:R.replies.map((e,t)=>(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(j.X2,{style:{columnGap:"0.5rem",fontSize:"1rem",alignItems:"center"},children:[(0,r.jsx)("div",{children:"답변제목: "}),(0,r.jsx)("h1",{style:{fontSize:"1rem"},children:null==e?void 0:e.post_title})]}),(0,r.jsx)(N,{className:"none-padding",value:null!==(c=null==e?void 0:e.post_content)&&void 0!==c?c:"<body></body>",readOnly:!0,theme:"bubble",bounds:".app"})]})))]})})})]})]})})})},M=e=>{let{user:t}=(0,k.E)(),{themeDnsData:l}=(0,a.K$)();return(0,i.useRouter)(),(0,r.jsx)(r.Fragment,{})},D=e=>{let{user:t}=(0,k.E)(),{themeDnsData:l}=(0,a.K$)();return(0,i.useRouter)(),(0,r.jsx)(r.Fragment,{})},A=e=>{let{user:t}=(0,k.E)(),{themeDnsData:l}=(0,a.K$)();return(0,i.useRouter)(),(0,r.jsx)(r.Fragment,{})};let B=(e,t)=>{if(1==e)return(0,r.jsx)(E,{...t});if(2==e)return(0,r.jsx)(T,{...t});if(3==e)return(0,r.jsx)(I,{...t});if(4==e)return(0,r.jsx)(K,{...t});if(5==e)return(0,r.jsx)(M,{...t});if(6==e)return(0,r.jsx)(D,{...t});if(7==e)return(0,r.jsx)(A,{...t})},V=()=>{let e=(0,i.useRouter)(),{themeDnsData:t}=(0,a.K$)();return(0,r.jsx)(r.Fragment,{children:B(null==t?void 0:t.shop_demo_num,{data:{},func:{router:e}})})};V.getLayout=e=>(0,r.jsx)(o.Z,{children:e});var X=V},93990:function(e,t,l){"use strict";l.d(t,{IW:function(){return u},Ls:function(){return i},U3:function(){return s},XK:function(){return o},v3:function(){return n},vY:function(){return a}});var r=l(41796);function i(e){let t=(null==e?void 0:e.color)||"#000000",l=(null==e?void 0:e.blur)||6,i=(null==e?void 0:e.opacity)||.8,n=null==e?void 0:e.imgUrl;return n?{position:"relative",backgroundImage:"url(".concat(n,")"),"&:before":{position:"absolute",top:0,left:0,zIndex:9,content:'""',width:"100%",height:"100%",backdropFilter:"blur(".concat(l,"px)"),WebkitBackdropFilter:"blur(".concat(l,"px)"),backgroundColor:(0,r.Fq)(t,i)}}:{backdropFilter:"blur(".concat(l,"px)"),WebkitBackdropFilter:"blur(".concat(l,"px)"),backgroundColor:(0,r.Fq)(t,i)}}function n(e){let t=(null==e?void 0:e.direction)||"to bottom",l=null==e?void 0:e.startColor,r=null==e?void 0:e.endColor,i=null==e?void 0:e.imgUrl,n=null==e?void 0:e.color;return i?{background:"linear-gradient(".concat(t,", ").concat(l||n,", ").concat(r||n,"), url(").concat(i,")"),backgroundSize:"cover",backgroundRepeat:"no-repeat",backgroundPosition:"center center"}:{background:"linear-gradient(".concat(t,", ").concat(l,", ").concat(r,")")}}function o(e){return{background:"-webkit-linear-gradient(".concat(e,")"),WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}function a(e){return{filter:e,WebkitFilter:e,MozFilter:e}}let s={msOverflowStyle:"none",scrollbarWidth:"none",overflowY:"scroll","&::-webkit-scrollbar":{display:"none"}},u={msOverflowStyle:"none",scrollbarWidth:"none",overflowX:"scroll","&::-webkit-scrollbar":{display:"none"}}},81272:function(e,t,l){"use strict";l.d(t,{Ff:function(){return i},Iz:function(){return p},O8:function(){return c},WN:function(){return r},d8:function(){return s},f9:function(){return d},iK:function(){return a},ir:function(){return u},kX:function(){return o},kY:function(){return n}});let r=[{label:"일반형",value:0},{label:"가나다 또는 abc 형",value:1}],i=[{label:"일반유저",value:0},{label:"셀러",value:10},{label:"관리자",value:40},{label:"개발사",value:50}],n=[{label:"불가능(단일)",value:0},{label:"가능(여러개)",value:1}],o=[{label:"수기결제",value:1},{label:"인증결제",value:2},{label:"가상계좌",value:10}],a=[{value:"001",label:"한국은행"},{value:"002",label:"산업은행"},{value:"003",label:"기업은행"},{value:"004",label:"KB국민은행"},{value:"007",label:"수협은행"},{value:"008",label:"수출입은행"},{value:"011",label:"NH농협은행"},{value:"012",label:"농축협(단위)"},{value:"020",label:"우리은행"},{value:"023",label:"SC제일은행"},{value:"027",label:"한국씨티"},{value:"031",label:"대구은행"},{value:"032",label:"부산은행"},{value:"034",label:"광주은행"},{value:"035",label:"제주은행"},{value:"037",label:"전북은행"},{value:"039",label:"경남은행"},{value:"045",label:"새마을금고중앙회"},{value:"048",label:"신협중앙회"},{value:"050",label:"저축은행"},{value:"064",label:"산림조합중앙회"},{value:"071",label:"우체국"},{value:"081",label:"하나은행"},{value:"088",label:"신한은행"},{value:"089",label:"케이뱅크"},{value:"090",label:"카카오뱅크"},{value:"092",label:"토스뱅크"},{value:"105",label:"웰컴저축은행"}],s=[{label:"남자",value:"M"},{label:"여자",value:"F"}],u=[{label:"내국인",value:"L"},{label:"외국인",value:"F"}],d=[{label:"SKT",value:"01"},{label:"KT",value:"02"},{label:"LGU+",value:"03"},{label:"알뜰폰SKT",value:"04"},{label:"알뜰폰KT",value:"05"},{label:"알뜰폰LGU",value:"06"}],c=[{label:"배너슬라이드",type:"banner",default_value:{type:"banner",list:[],style:{min_height:200}}},{label:"버튼형 배너슬라이드",type:"button-banner",default_value:{type:"button-banner",list:[],style:{}}},{label:"상품슬라이드",type:"items",default_value:{type:"items",title:"",sub_title:"",list:[],style:{}}},{label:"ID 선택형 상품슬라이드",type:"items-ids",default_value:{type:"items-ids",title:"",sub_title:"",list:[],style:{}}},{label:"카테고리탭별 상품리스트",type:"items-with-categories",default_value:{type:"items-with-categories",title:"",sub_title:"",is_vertical:0,list:[],style:{}}},{label:"에디터",type:"editor",default_value:{type:"editor",content:""}},{label:"동영상 슬라이드",type:"video-slide",default_value:{type:"video-slide",title:"",sub_title:"",list:[],style:{}}},{label:"게시판",type:"post",default_value:{type:"post",list:[],style:{}}},{label:"셀러섹션",type:"sellers",default_value:{type:"sellers",list:[],style:{}}},{label:"상품후기",type:"item-reviews",default_value:{type:"item-reviews",list:[],style:{}}},{label:"선택형 상품후기",type:"item-reviews-select",default_value:{type:"item-reviews-select",title:"",sub_title:"",list:[],style:{}}}],p=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0,l=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"ko";return(null==e?void 0:e.lang_obj)&&(null==e?void 0:e.lang_obj[t])&&(null==e?void 0:e.lang_obj[t][null==l?void 0:l.value])||e[t]}},20273:function(e,t,l){"use strict";var r=l(85893),i=l(5152),n=l.n(i),o=l(67294),a=l(49824),s=l(17543);let u=n()(()=>Promise.all([l.e(2937),l.e(1167)]).then(l.t.bind(l,71167,23)),{loadableGenerated:{webpack:()=>[71167]},ssr:!1,loading:()=>(0,r.jsx)("p",{children:"Loading ..."})});t.Z=e=>{let{value:t,setValue:l}=e,i=(0,o.useRef)(null),n=(0,o.useMemo)(()=>({toolbar:{container:[[{header:"1"},{header:"2"},{font:[]}],[{size:[]}],["bold","italic","underline","strike","blockquote"],[{list:"ordered"},{list:"bullet"},{indent:"-1"},{indent:"+1"}],["link","image","video"],[{align:""},{align:"center"},{align:"right"},{align:"justify"}],["clean"]]},clipboard:{matchVisual:!1}}),[]);return(0,r.jsx)(r.Fragment,{children:(0,r.jsx)(u,{className:"max-height-editor",theme:"snow",id:"content",placeholder:"",value:t,modules:n,formats:["header","font","size","bold","italic","underline","strike","blockquote","list","bullet","indent","link","image","video","color","align"],ref:i,onChange:async e=>{let t=e;if(e.includes('<img src="')&&e.includes("base64,")){let l=e.split('<img src="');for(var r=0;r<l.length;r++)if(l[r].includes("base64,")){let e=l[r],i=(e=await e.split('"></p>'))[0];e=await (0,s._x)(e[0],"note.png");let n=await (0,a.P1)({file:e});t=await t.replace(i,null==n?void 0:n.url)}}l(t)}})})}},5152:function(e,t,l){e.exports=l(95677)}},function(e){e.O(0,[3662,3548,8203,9421,5422,153,135,6886,7273,8282,6066,5898,2077,1325,2519,2200,8344,8254,2367,9774,2888,179],function(){return e(e.s=55936)}),_N_E=e.O()}]);