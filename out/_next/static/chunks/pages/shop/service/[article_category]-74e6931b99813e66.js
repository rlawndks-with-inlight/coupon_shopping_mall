(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8226],{33043:function(e,n,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/shop/service/[article_category]",function(){return t(7818)}])},7818:function(e,n,t){"use strict";t.r(n),t.d(n,{default:function(){return R}});var i=t(85893),r=t(11163),l=t(67294),o=t(84798),a=t(50689),c=t(82729),d=t(52443),s=t(50066),u=t(98456),h=t(15054),g=t(1954),x=t(7312),m=t(65631);function v(){let e=(0,c._)(["\nfont-size:",";\nwidth:100%;\ntext-align:center;\nborder-collapse: collapse;\nmin-width:350px;\n"]);return v=function(){return e},e}function f(){let e=(0,c._)(["\nwidth:100%;\nheight:26px;\n"]);return f=function(){return e},e}function p(){let e=(0,c._)(["\nborder-bottom:1px solid ",";\npadding:1rem 0;\nwhite-space:pre;\n"]);return p=function(){return e},e}let y=s.ZP.table(v(),m.af.font_size.size8),_=s.ZP.tr(f()),j=s.ZP.td(p(),m.af.grey[300]);var w=e=>{var n,t;let{data:o,onChangePage:c,searchObj:d,columns:s}=e,{page:g,page_size:v}=null==e?void 0:e.searchObj;(0,r.useRouter)();let{themeMode:f}=(0,a.K$)(),[p,w]=(0,l.useState)(!1);return(0,i.jsx)(i.Fragment,{children:(0,i.jsx)("div",{style:{width:"100%",display:"flex",flexDirection:"column"},children:o.content?(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("div",{className:"subtype-container",style:{overflowX:"auto",display:"flex",width:"100%",margin:"0 auto",flexDirection:"column"},children:(0,i.jsxs)(y,{children:[(0,i.jsx)(_,{style:{fontWeight:"bold",background:"".concat("dark"==f?m.af.grey[700]:m.af.grey[200]),borderBottom:"none"},children:s&&s.map((e,n)=>(0,i.jsx)(i.Fragment,{children:(0,i.jsx)(j,{align:"left",sx:{...e.sx},children:e.label})}))}),(null==o?void 0:o.content)&&(null==o?void 0:o.content.map((e,n)=>(0,i.jsx)(_,{style:{color:"".concat("dark"==f?"#fff":m.af.grey[700])},children:s&&s.map((n,t)=>(0,i.jsx)(i.Fragment,{children:(0,i.jsx)(j,{align:"left",sx:{...n.sx},children:n.action(e)})}))})))]})}),0==o.length?(0,i.jsx)(i.Fragment,{children:(0,i.jsxs)(x.E.div,{initial:{opacity:0},animate:{opacity:1},style:{width:"100%",display:"flex",flexDirection:"column",minHeight:"250px",alignItems:"center"},children:[(0,i.jsx)("div",{style:{margin:"auto auto 8px auto"}}),(0,i.jsx)("div",{style:{margin:"8px auto auto auto"},children:"데이터가 없습니다."})]})}):(0,i.jsx)(i.Fragment,{children:(0,i.jsx)("div",{style:{margin:"1rem auto"},children:(0,i.jsx)(h.Z,{size:window.innerWidth>700?"medium":"small",count:(n=null==o?void 0:o.total,t=null==o?void 0:o.page_size,0==n?1:n%t==0?parseInt(n/t):parseInt(n/t)+1),page:g,variant:"outlined",shape:"rounded",color:"primary",onChange:(e,n)=>{c({...d,page:n})}})})})]}):(0,i.jsx)(i.Fragment,{children:(0,i.jsx)(m.X2,{style:{height:"400px"},children:(0,i.jsx)(u.Z,{sx:{margin:"auto"}})})})})})},b=t(96486),F=t.n(b),S=t(90985),k=t(93946),C=t(83321);function Z(){let e=(0,c._)(["\nmax-width:1500px;\ndisplay:flex;\nflex-direction:column;\nmargin: 0 auto;\nwidth: 90%;\nmin-height:90vh;\n"]);return Z=function(){return e},e}function q(){let e=(0,c._)(["\ndisplay:flex;\nflex-direction: column;\nwidth:200px;\nmargin-right:1rem;\n@media (max-width:1000px){\n  flex-direction: row;\n  margin-bottom:1rem;\n}\n"]);return q=function(){return e},e}function E(){let e=(0,c._)(["\nborder-bottom:1px solid ",";\npadding:0.5rem 0;\ncursor:pointer;\ntransition:0.3s;\ncolor:",";\nfont-weight:",";\n&:hover{\n  color: ",";\n}\n@media (max-width:1000px){\n  padding:0.25rem 0;\n  border-bottom:2px solid ",";\n  margin-right:0.5rem;\n}\n"]);return E=function(){return e},e}let P=s.ZP.div(Z()),N=s.ZP.div(q()),z=s.ZP.div(E(),m.af.grey[300],e=>e.isSelect?e=>e.selectColor:m.af.grey[300],e=>e.isSelect?"bold":"",e=>e.isSelect?"":e=>e.theme.palette.primary.main,e=>e.isSelect?e=>e.selectColor:"transparent");var X=e=>{var n,t,r,o;let c=[{id:"post_title",label:"제목",action:e=>{var n;return null!==(n=e.post_title)&&void 0!==n?n:"---"}},{id:"created_at",label:"생성시간",action:e=>{var n;return(0,i.jsx)(i.Fragment,{children:(0,i.jsx)("div",{style:{color:m.af.grey[500]},children:null!==(n=e.created_at)&&void 0!==n?n:"---"})})}},{id:"edit",label:"자세히보기",action:e=>(0,i.jsx)(i.Fragment,{children:(0,i.jsx)(k.Z,{onClick:()=>{var n;s.push("/shop/service/".concat(null===(n=s.query)||void 0===n?void 0:n.article_category,"/").concat(null==e?void 0:e.id))},children:(0,i.jsx)(g.JO,{icon:"bx:detail"})})})}],{func:{router:s}}=e,{themeMode:u,themePostCategoryList:h}=(0,a.K$)(),x=(0,d.u)(),[v,f]=(0,l.useState)(1),[p,y]=(0,l.useState)(20),[_,j]=(0,l.useState)([]),[b,Z]=(0,l.useState)({}),[q,E]=(0,l.useState)({}),[X,O]=(0,l.useState)([]),[D,I]=(0,l.useState)({page:1,page_size:10,category_id:null});(0,l.useEffect)(()=>{O(c)},[]),(0,l.useEffect)(()=>{var e;Z(F().find(h,{id:parseInt(null===(e=s.query)||void 0===e?void 0:e.article_category)}))},[null===(n=s.query)||void 0===n?void 0:n.article_category,h]),(0,l.useEffect)(()=>{var e,n;(null===(e=s.query)||void 0===e?void 0:e.article_category)&&K({...D,category_id:null===(n=s.query)||void 0===n?void 0:n.article_category})},[null===(t=s.query)||void 0===t?void 0:t.article_category]);let K=async e=>{E({...q,content:void 0}),E(await (0,S.iA)(e)),I(e)};return(0,i.jsx)(i.Fragment,{children:(0,i.jsxs)(P,{children:[(0,i.jsx)(m.Dx,{style:{marginBottom:"2rem"},children:null==b?void 0:b.post_category_title}),(0,i.jsxs)(m.X2,{style:{margin:"1rem auto",overflowX:"auto",whiteSpace:"nowrap",columnGap:"0.25rem"},className:"none-scroll",children:[(null==b?void 0:b.children)&&(null==b?void 0:b.children.length)>0&&(0,i.jsx)(i.Fragment,{children:(0,i.jsx)(C.Z,{onClick:()=>{var e;K({...D,category_id:null===(e=s.query)||void 0===e?void 0:e.article_category})},variant:D.category_id==(null===(r=s.query)||void 0===r?void 0:r.article_category)?"contained":"outlined",children:"전체"})}),(null==b?void 0:b.children)&&(null==b?void 0:b.children.map(e=>(0,i.jsx)(i.Fragment,{children:(0,i.jsx)(C.Z,{onClick:()=>{K({...D,category_id:null==e?void 0:e.id})},variant:D.category_id==(null==e?void 0:e.id)?"contained":"outlined",children:null==e?void 0:e.post_category_title})})))]}),(0,i.jsxs)(m.CR,{children:[(0,i.jsx)(N,{children:h.map((e,n)=>{var t;return(0,i.jsx)(i.Fragment,{children:(0,i.jsx)(z,{theme:x,isSelect:(null==e?void 0:e.id)==(null===(t=s.query)||void 0===t?void 0:t.article_category),selectColor:"dark"==u?"#fff":"#000",onClick:()=>{s.push("/shop/service/".concat(null==e?void 0:e.id))},children:e.post_category_title})})})}),(null===(o=s.query)||void 0===o?void 0:o.article_category)&&(0,i.jsx)(i.Fragment,{children:(0,i.jsx)(w,{data:q,onChangePage:K,searchObj:D,columns:X})})]})]})})},O=e=>{let{func:{router:n}}=e;return(0,i.jsx)(i.Fragment,{})},D=e=>{let{func:{router:n}}=e;return(0,i.jsx)(i.Fragment,{})};let I=(e,n)=>1==e?(0,i.jsx)(X,{...n}):2==e?(0,i.jsx)(O,{...n}):3==e?(0,i.jsx)(D,{...n}):void 0,K=()=>{let e=(0,r.useRouter)(),{themeDnsData:n}=(0,a.K$)();return(0,i.jsx)(i.Fragment,{children:I(null==n?void 0:n.shop_demo_num,{data:{},func:{router:e}})})};K.getLayout=e=>(0,i.jsx)(o.Z,{children:e});var R=K}},function(e){e.O(0,[571,3662,1712,8265,7918,1907,153,135,8422,6066,5898,5054,72,3098,1279,6397,4798,9774,2888,179],function(){return e(e.s=33043)}),_N_E=e.O()}]);