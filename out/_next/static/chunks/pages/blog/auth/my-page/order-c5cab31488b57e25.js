(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1403],{533:function(e,n,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/blog/auth/my-page/order",function(){return t(32430)}])},32430:function(e,n,t){"use strict";t.r(n),t.d(n,{default:function(){return E}});var i=t(85893),r=t(11163),l=t(67294),d=t(92200),o=t(82729),s=t(50066),c=t(13577),u=t(11703),a=t(40044),p=t(83321),f=t(50689),m=t(96486),x=t.n(m),h=t(21222),_=t(17543);function g(){let e=(0,o._)(["\ndisplay:flex;\nflex-direction:column;\npadding:1rem;\n"]);return g=function(){return e},e}function y(){let e=(0,o._)(["\ndisplay:flex;\njustify-content:space-between;\nmargin:1.5rem 0 2rem 0;\n"]);return y=function(){return e},e}function j(){let e=(0,o._)(["\nmargin: 1rem 0;\n"]);return j=function(){return e},e}function v(){let e=(0,o._)(["\ndisplay:flex;\nflex-direction:column;\n"]);return v=function(){return e},e}let w=s.ZP.div(g());s.ZP.div(y());let b=s.ZP.div(j()),Z=s.ZP.div(v()),k=[{product_id:64,option_id:312,quantity:2,seller_id:3},{product_id:64,option_id:122,quantity:3,seller_id:3},{product_id:66,option_id:1112,quantity:1,seller_id:4}];var C=e=>{let{func:{router:n}}=e,{themeMode:t}=(0,f.K$)(),[r,d]=(0,l.useState)(k[0].seller_id),[o,s]=(0,l.useState)([]),[m,g]=(0,l.useState)([]);return(0,l.useEffect)(()=>{let e=[...k],n=[...h.J1],t=[...h.n8],i=[...h.z2],r=[];for(var l=0;l<i.length;l++)r=[...r,...i[l].children];g(e=e.map(e=>({...e,product:x().find(n,{id:e.product_id}),option:x().find(r,{id:e.option_id}),seller:x().find(t,{id:e.seller_id})})))},[]),(0,i.jsx)(i.Fragment,{children:(0,i.jsxs)(c.Hm,{children:[(0,i.jsx)(c.Dx,{children:"주문/배송 조회"}),(0,i.jsx)(u.Z,{indicatorColor:"primary",textColor:"primary",scrollButtons:"false",variant:"scrollable",value:r,onChange:(e,n)=>{d(n)},sx:{width:"100%",float:"left"},children:x().uniqBy(m,"seller.title").map((e,n)=>(0,i.jsx)(a.Z,{label:e.seller.title,value:e.seller.id,sx:{borderBottom:"1px solid",borderColor:"inherit",textColor:"inherit",fontSize:"1rem",fontWeight:"bold",marginRight:"1rem"},style:{marginRight:"1rem"}}))}),(0,i.jsx)(w,{style:{background:"".concat("dark"==t?"#000":"#F6F6F6")},children:m.map((e,n)=>(0,i.jsx)(i.Fragment,{children:e.seller_id==r&&(0,i.jsx)(i.Fragment,{children:(0,i.jsx)(b,{style:{background:"".concat("dark"==t?"#222":"#fff")},children:(0,i.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",padding:"1rem"},children:[(0,i.jsxs)("div",{style:{display:"flex"},children:[(0,i.jsx)("img",{src:e.product.product_img,width:"48px",height:"48px",style:{margin:"0 1rem 0 0"}}),(0,i.jsxs)("div",{style:{display:"flex",flexDirection:"column"},children:[(0,i.jsx)("div",{children:e.product.name}),(0,i.jsxs)("div",{children:[(0,_.D9)(e.product.product_sale_price+e.option.price),"원"]}),(0,i.jsxs)("div",{children:["옵션 : ",e.option.name," / ",e.quantity,"개"]}),(0,i.jsxs)("div",{style:{marginTop:"0.5rem"},children:[(0,_.D9)((e.product.product_sale_price+e.option.price)*e.quantity),"원"]})]})]}),(0,i.jsxs)(Z,{children:[(0,i.jsx)(p.Z,{variant:"outlined",style:{marginBottom:"1rem",whiteSpace:"nowrap"},children:"주문정보"}),(0,i.jsx)(p.Z,{variant:"outlined",style:{marginBottom:"1rem",whiteSpace:"nowrap"},children:"배송정보"})]})]})})})}))})]})})};let F=(e,n)=>{if(1==e)return(0,i.jsx)(C,{...n})},q=()=>{let e=(0,r.useRouter)(),{themeDnsData:n}=(0,f.K$)();return(0,i.jsx)(i.Fragment,{children:F(null==n?void 0:n.blog_demo_num,{data:{},func:{router:e}})})};q.getLayout=e=>(0,i.jsx)(d.Z,{children:e});var E=q}},function(e){e.O(0,[3662,3548,8203,9421,5422,153,135,6066,5898,6958,2200,8089,9774,2888,179],function(){return e(e.s=533)}),_N_E=e.O()}]);