(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1112],{58032:function(e,t,r){"use strict";r.d(t,{Z:function(){return Z}});var n=r(63366),o=r(87462),i=r(67294),a=r(86010),s=r(94780),l=r(49990),d=r(98216),u=r(71657),c=r(1588),h=r(34867);function f(e){return(0,h.Z)("MuiFab",e)}let p=(0,c.Z)("MuiFab",["root","primary","secondary","extended","circular","focusVisible","disabled","colorInherit","sizeSmall","sizeMedium","sizeLarge","info","error","warning","success"]);var v=r(90948),g=r(85893);let m=["children","className","color","component","disabled","disableFocusRipple","focusVisibleClassName","size","variant"],b=e=>{let{color:t,variant:r,classes:n,size:i}=e,a={root:["root",r,`size${(0,d.Z)(i)}`,"inherit"===t?"colorInherit":t]},l=(0,s.Z)(a,f,n);return(0,o.Z)({},n,l)},x=(0,v.ZP)(l.Z,{name:"MuiFab",slot:"Root",shouldForwardProp:e=>(0,v.FO)(e)||"classes"===e,overridesResolver:(e,t)=>{let{ownerState:r}=e;return[t.root,t[r.variant],t[`size${(0,d.Z)(r.size)}`],"inherit"===r.color&&t.colorInherit,t[(0,d.Z)(r.size)],t[r.color]]}})(({theme:e,ownerState:t})=>{var r,n;return(0,o.Z)({},e.typography.button,{minHeight:36,transition:e.transitions.create(["background-color","box-shadow","border-color"],{duration:e.transitions.duration.short}),borderRadius:"50%",padding:0,minWidth:0,width:56,height:56,zIndex:(e.vars||e).zIndex.fab,boxShadow:(e.vars||e).shadows[6],"&:active":{boxShadow:(e.vars||e).shadows[12]},color:e.vars?e.vars.palette.text.primary:null==(r=(n=e.palette).getContrastText)?void 0:r.call(n,e.palette.grey[300]),backgroundColor:(e.vars||e).palette.grey[300],"&:hover":{backgroundColor:(e.vars||e).palette.grey.A100,"@media (hover: none)":{backgroundColor:(e.vars||e).palette.grey[300]},textDecoration:"none"},[`&.${p.focusVisible}`]:{boxShadow:(e.vars||e).shadows[6]}},"small"===t.size&&{width:40,height:40},"medium"===t.size&&{width:48,height:48},"extended"===t.variant&&{borderRadius:24,padding:"0 16px",width:"auto",minHeight:"auto",minWidth:48,height:48},"extended"===t.variant&&"small"===t.size&&{width:"auto",padding:"0 8px",borderRadius:17,minWidth:34,height:34},"extended"===t.variant&&"medium"===t.size&&{width:"auto",padding:"0 16px",borderRadius:20,minWidth:40,height:40},"inherit"===t.color&&{color:"inherit"})},({theme:e,ownerState:t})=>(0,o.Z)({},"inherit"!==t.color&&"default"!==t.color&&null!=(e.vars||e).palette[t.color]&&{color:(e.vars||e).palette[t.color].contrastText,backgroundColor:(e.vars||e).palette[t.color].main,"&:hover":{backgroundColor:(e.vars||e).palette[t.color].dark,"@media (hover: none)":{backgroundColor:(e.vars||e).palette[t.color].main}}}),({theme:e})=>({[`&.${p.disabled}`]:{color:(e.vars||e).palette.action.disabled,boxShadow:(e.vars||e).shadows[0],backgroundColor:(e.vars||e).palette.action.disabledBackground}})),w=i.forwardRef(function(e,t){let r=(0,u.Z)({props:e,name:"MuiFab"}),{children:i,className:s,color:l="default",component:d="button",disabled:c=!1,disableFocusRipple:h=!1,focusVisibleClassName:f,size:p="large",variant:v="circular"}=r,w=(0,n.Z)(r,m),Z=(0,o.Z)({},r,{color:l,component:d,disabled:c,disableFocusRipple:h,size:p,variant:v}),E=b(Z);return(0,g.jsx)(x,(0,o.Z)({className:(0,a.Z)(E.root,s),component:d,disabled:c,focusRipple:!h,focusVisibleClassName:(0,a.Z)(E.focusVisible,f),ownerState:Z,ref:t},w,{classes:E,children:i}))});var Z=w},6585:function(e,t,r){"use strict";var n=r(87462),o=r(63366),i=r(67294),a=r(98885),s=r(2734),l=r(30577),d=r(51705),u=r(85893);let c=["addEndListener","appear","children","easing","in","onEnter","onEntered","onEntering","onExit","onExited","onExiting","style","timeout","TransitionComponent"],h={entering:{transform:"none"},entered:{transform:"none"}},f=i.forwardRef(function(e,t){let r=(0,s.Z)(),f={enter:r.transitions.duration.enteringScreen,exit:r.transitions.duration.leavingScreen},{addEndListener:p,appear:v=!0,children:g,easing:m,in:b,onEnter:x,onEntered:w,onEntering:Z,onExit:E,onExited:y,onExiting:k,style:C,timeout:z=f,TransitionComponent:R=a.ZP}=e,_=(0,o.Z)(e,c),N=i.useRef(null),S=(0,d.Z)(N,g.ref,t),F=e=>t=>{if(e){let r=N.current;void 0===t?e(r):e(r,t)}},T=F(Z),j=F((e,t)=>{(0,l.n)(e);let n=(0,l.C)({style:C,timeout:z,easing:m},{mode:"enter"});e.style.webkitTransition=r.transitions.create("transform",n),e.style.transition=r.transitions.create("transform",n),x&&x(e,t)}),L=F(w),O=F(k),I=F(e=>{let t=(0,l.C)({style:C,timeout:z,easing:m},{mode:"exit"});e.style.webkitTransition=r.transitions.create("transform",t),e.style.transition=r.transitions.create("transform",t),E&&E(e)}),M=F(y);return(0,u.jsx)(R,(0,n.Z)({appear:v,in:b,nodeRef:N,onEnter:j,onEntered:L,onEntering:T,onExit:I,onExited:M,onExiting:O,addEndListener:e=>{p&&p(N.current,e)},timeout:z},_,{children:(e,t)=>i.cloneElement(g,(0,n.Z)({style:(0,n.Z)({transform:"scale(0)",visibility:"exited"!==e||b?void 0:"hidden"},h[e],C,g.props.style),ref:S},t))}))});t.Z=f},8298:function(e,t,r){"use strict";r.d(t,{Z:function(){return d}});var n=r(87462),o=r(63366),i=r(67294);let a=["getTrigger","target"];function s(e,t){let{disableHysteresis:r=!1,threshold:n=100,target:o}=t,i=e.current;return o&&(e.current=void 0!==o.pageYOffset?o.pageYOffset:o.scrollTop),(!!r||void 0===i||!(e.current<i))&&e.current>n}let l="undefined"!=typeof window?window:null;function d(e={}){let{getTrigger:t=s,target:r=l}=e,d=(0,o.Z)(e,a),u=i.useRef(),[c,h]=i.useState(()=>t(u,d));return i.useEffect(()=>{let e=()=>{h(t(u,(0,n.Z)({target:r},d)))};return e(),r.addEventListener("scroll",e,{passive:!0}),()=>{r.removeEventListener("scroll",e,{passive:!0})}},[r,t,JSON.stringify(d)]),c}},23113:function(e,t,r){(window.__NEXT_P=window.__NEXT_P||[]).push(["/blog/pay/check-out",function(){return r(69236)}])},69236:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return u}});var n=r(85893),o=r(11163);r(67294);var i=r(84798),a=e=>{let{func:{router:t}}=e;return(0,n.jsx)(n.Fragment,{})},s=r(50689);let l=(e,t)=>{if(1==e)return(0,n.jsx)(a,{...t})},d=()=>{let e=(0,o.useRouter)(),{themeDnsData:t}=(0,s.K$)();return(0,n.jsx)(n.Fragment,{children:l(null==t?void 0:t.blog_demo_num,{data:{},func:{router:e}})})};d.getLayout=e=>(0,n.jsx)(i.Z,{children:e});var u=d}},function(e){e.O(0,[571,1712,8265,7918,1907,153,135,6066,5898,6397,4798,9774,2888,179],function(){return e(e.s=23113)}),_N_E=e.O()}]);