"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[3068],{13068:function(e,n,i){i.r(n);var l=i(82729),a=i(85893),t=i(83321),s=i(86886),r=i(66242),o=i(26447),d=i(78445),c=i(15861),g=i(50135),u=i(69661),x=i(11163),h=i(67294),m=i(65631),j=i(50689),p=i(82367),v=i(13033),f=i(17543),_=i(50066),b=i(5152),Z=i.n(b),y=i(23871),w=i(86745),k=i(84475),C=i(7295);function P(){let e=(0,l._)(["\nwidth:100%;\nbackground:#b3c9db;\nmin-height:400px;\ndisplay:flex;\npadding-bottom: 1rem;\n"]);return P=function(){return e},e}function L(){let e=(0,l._)(["\n\n"]);return L=function(){return e},e}function R(){let e=(0,l._)(["\nborder-radius:16px;\nbackground:#fff;\nmargin-top:0.5rem;\nwidth:400px;\n\n"]);return R=function(){return e},e}function D(){let e=(0,l._)(["\nwidth:400px;\nheight:200px;\nborder-top-right-radius:16px;\nborder-top-left-radius:16px;\n"]);return D=function(){return e},e}function O(){let e=(0,l._)(["\ndisplay:flex;\nflex-direction:column;\npadding:0.5rem;\n"]);return O=function(){return e},e}let U=Z()(()=>Promise.all([i.e(2937),i.e(1167)]).then(i.t.bind(i,71167,23)),{loadableGenerated:{webpack:()=>[71167]},ssr:!1,loading:()=>(0,a.jsx)("p",{children:"Loading ..."})}),F=[{value:0,label:"기본정보"},{value:1,label:"카카오톡 설정"},{value:2,label:"회사정보"}],z=_.ZP.div(P());_.ZP.div(L());let S=_.ZP.div(R()),A=_.ZP.div(D()),E=_.ZP.div(O()),N=()=>{let{setModal:e}=(0,C.d)(),{themeMode:n,themeDnsData:i}=(0,j.K$)(),l=(0,x.useRouter)(),[v,_]=(0,h.useState)(!0),[b,Z]=(0,h.useState)(0),[P,L]=(0,h.useState)(y.XH.brands);(0,h.useEffect)(()=>{D()},[]);let R=(e,n)=>{let i=Object.keys(n);for(var l=0;l<i.length;l++)n[i[l]]&&(e[i[l]]=n[i[l]]);return e},D=async()=>{let e=await (0,w.DT)({id:l.query.brand_id|(null==i?void 0:i.id)});L(e=R(P,e)),_(!1)},O=async()=>{((null==P?void 0:P.id)?await (0,w.ZA)({...P,id:null==P?void 0:P.id}):await (0,w.o0)({...P}))&&(k.Am.success("성공적으로 저장 되었습니다."),window.location.href="/manager/settings/brands")};return(0,a.jsx)(a.Fragment,{children:!v&&(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(m.X2,{style:{margin:"0 0 1rem 0",columnGap:"0.5rem"},children:F.map(e=>(0,a.jsx)(t.Z,{variant:e.value==b?"contained":"outlined",onClick:()=>{Z(e.value)},children:e.label}))}),(0,a.jsxs)(s.ZP,{container:!0,spacing:3,children:[0==b&&(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(s.ZP,{item:!0,xs:12,md:6,children:(0,a.jsx)(r.Z,{sx:{p:2,height:"100%"},children:(0,a.jsx)(o.Z,{spacing:3,children:(0,a.jsxs)(o.Z,{spacing:1,children:[(0,a.jsx)(d.Z,{title:"브랜드 이미지 설정",sx:{padding:"0"}}),(0,a.jsx)(c.Z,{variant:"subtitle2",sx:{color:"text.secondary"},children:"브랜드로고"}),(0,a.jsx)(p.Z,{file:P.logo_file||P.logo_img,onDrop:e=>{let n=e[0];n&&L({...P,logo_file:Object.assign(n,{preview:URL.createObjectURL(n)})})},onDelete:()=>{L({...P,logo_img:"",logo_file:void 0})}}),(0,a.jsx)(c.Z,{variant:"subtitle2",sx:{color:"text.secondary"},children:"브랜드 다크모드 로고"}),(0,a.jsx)(p.Z,{file:P.dark_logo_file||P.dark_logo_img,onDrop:e=>{let n=e[0];n&&L({...P,dark_logo_file:Object.assign(n,{preview:URL.createObjectURL(n)})})},onDelete:()=>{L({...P,dark_logo_img:"",dark_logo_file:void 0})}}),(0,a.jsx)(c.Z,{variant:"subtitle2",sx:{color:"text.secondary"},children:"브랜드 파비콘"}),(0,a.jsx)(p.Z,{file:P.favicon_file||P.favicon_img,onDrop:e=>{let n=e[0];n&&L({...P,favicon_file:Object.assign(n,{preview:URL.createObjectURL(n)})})},onDelete:()=>{L({...P,favicon_img:"",favicon_file:void 0})}})]})})})}),(0,a.jsx)(s.ZP,{item:!0,xs:12,md:6,children:(0,a.jsx)(r.Z,{sx:{p:2,height:"100%"},children:(0,a.jsxs)(o.Z,{spacing:3,children:[(0,a.jsx)(g.Z,{label:"쇼핑몰명",value:P.name,onChange:e=>{L({...P,name:e.target.value})}}),(0,a.jsx)(g.Z,{label:"도메인",value:P.dns,onChange:e=>{L({...P,dns:e.target.value})}}),(0,a.jsx)(g.Z,{label:"메인색상",value:P.theme_css.main_color,type:"color",style:{border:"none"},onChange:e=>{L({...P,theme_css:{...P.theme_css,main_color:e.target.value}})}}),(0,a.jsxs)(o.Z,{spacing:1,children:[(0,a.jsx)(c.Z,{variant:"subtitle2",sx:{color:"text.secondary"},children:"비고"}),(0,a.jsx)(U,{className:"max-height-editor",theme:"snow",id:"note",placeholder:"",value:P.note,modules:y.JA.modules,formats:y.JA.formats,onChange:async e=>{let n=e;if(e.includes('<img src="')&&e.includes("base64,")){let a=e.split('<img src="');for(var i,l=0;l<a.length;l++)if(a[l].includes("base64,")){let e=a[l],t=(e=await e.split('"></p>'))[0];e=await (0,f._x)(e[0],"note.png");let s=new FormData;s.append("file",e);let r=await (0,w.P1)({formData:s});n=await n.replace(t,null==r?void 0:null===(i=r.data)||void 0===i?void 0:i.url)}}L({...P,note:n})}})]})]})})})]}),1==b&&(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(s.ZP,{item:!0,xs:12,md:6,children:(0,a.jsx)(r.Z,{sx:{p:2,height:"100%"},children:(0,a.jsxs)(o.Z,{spacing:3,children:[(0,a.jsx)(o.Z,{spacing:1,children:(0,a.jsx)(d.Z,{title:"카카오 미리보기 설정",sx:{padding:"0"}})}),(0,a.jsx)(g.Z,{fullWidth:!0,label:"미리보기 디스트립션",multiline:!0,rows:4,value:P.og_description,onChange:e=>{L({...P,og_description:e.target.value})}}),(0,a.jsxs)(o.Z,{spacing:1,children:[(0,a.jsx)(c.Z,{variant:"subtitle2",sx:{color:"text.secondary"},children:"미리보기 이미지"}),(0,a.jsx)(p.Z,{file:P.og_file||P.og_img,onDrop:e=>{let n=e[0];n&&L({...P,og_file:Object.assign(n,{preview:URL.createObjectURL(n)})})},onDelete:()=>{L({...P,og_img:"",og_file:void 0})}})]})]})})}),(0,a.jsx)(s.ZP,{item:!0,xs:12,md:6,children:(0,a.jsx)(r.Z,{sx:{p:2,height:"100%"},children:(0,a.jsx)(o.Z,{spacing:3,children:(0,a.jsxs)(o.Z,{spacing:1,children:[(0,a.jsx)(d.Z,{title:"카카오톡 링크 전송 시 예시",sx:{padding:"0"}}),(0,a.jsxs)(z,{children:[(0,a.jsx)(u.Z,{style:{margin:"0.5rem"}}),(0,a.jsxs)(m.X2,{style:{flexDirection:"column",marginTop:"0.5rem"},children:[(0,a.jsx)("div",{children:"사용자"}),(0,a.jsx)("div",{style:{background:"#fff",padding:"0.5rem",borderRadius:"16px",color:"blue",textDecoration:"underline",width:"auto",maxWidth:"300px"},children:window.location.origin}),(0,a.jsxs)(S,{children:[(null==P?void 0:P.og_img)||(null==P?void 0:P.og_file)?(0,a.jsx)(a.Fragment,{children:(0,a.jsx)(A,{style:{backgroundImage:"url(".concat((null==P?void 0:P.og_file)?URL.createObjectURL(null==P?void 0:P.og_file):null==P?void 0:P.og_img,")"),backgroundSize:"cover",backgroundRepeat:"no-repeat",backgroundPosition:"center"}})}):(0,a.jsx)(a.Fragment,{}),(0,a.jsxs)(E,{children:[(0,a.jsx)("div",{children:(null==P?void 0:P.name)?null==P?void 0:P.name:"미리보기가 없습니다."}),(0,a.jsx)("div",{style:{fontSize:m.af.font_size.size8,color:m.af.grey[700],wordBreak:"break-all"},children:(null==P?void 0:P.og_description)?null==P?void 0:P.og_description:"여기를 눌러 링크를 확인하세요."}),(0,a.jsx)("div",{style:{fontSize:m.af.font_size.size9,color:m.af.grey[500],marginTop:"0.5rem"},children:window.location.origin})]})]})]})]})]})})})})]}),2==b&&(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(s.ZP,{item:!0,xs:12,md:6,children:(0,a.jsx)(r.Z,{sx:{p:2,height:"100%"},children:(0,a.jsxs)(o.Z,{spacing:3,children:[(0,a.jsx)(g.Z,{label:"회사명",value:P.company_name,onChange:e=>{L({...P,company_name:e.target.value})}}),(0,a.jsx)(g.Z,{label:"사업자번호",value:P.business_num,onChange:e=>{L({...P,business_num:e.target.value})}}),(0,a.jsx)(g.Z,{label:"주민등록번호",value:P.resident_num,onChange:e=>{L({...P,resident_num:e.target.value})}}),(0,a.jsx)(g.Z,{label:"대표자명",value:P.ceo_name,onChange:e=>{L({...P,ceo_name:e.target.value})}}),(0,a.jsx)(g.Z,{label:"개인정보 책임자명",value:P.pvcy_rep_name,onChange:e=>{L({...P,pvcy_rep_name:e.target.value})}})]})})}),(0,a.jsx)(s.ZP,{item:!0,xs:12,md:6,children:(0,a.jsx)(r.Z,{sx:{p:2,height:"100%"},children:(0,a.jsxs)(o.Z,{spacing:3,children:[(0,a.jsx)(g.Z,{label:"주소",value:P.addr,onChange:e=>{L({...P,addr:e.target.value})}}),(0,a.jsx)(g.Z,{label:"휴대폰번호",value:P.phone_num,onChange:e=>{L({...P,phone_num:e.target.value})}}),(0,a.jsx)(g.Z,{label:"팩스번호",value:P.fax_num,onChange:e=>{L({...P,fax_num:e.target.value})}})]})})})]}),(0,a.jsx)(s.ZP,{item:!0,xs:12,md:12,children:(0,a.jsx)(r.Z,{sx:{p:3},children:(0,a.jsx)(o.Z,{spacing:1,style:{display:"flex"},children:(0,a.jsx)(t.Z,{variant:"contained",style:{height:"48px",width:"120px",marginLeft:"auto"},onClick:()=>{e({func:()=>{O()},icon:"material-symbols:edit-outline",title:"저장 하시겠습니까?"})},children:"저장"})})})})]})]})})};N.getLayout=e=>(0,a.jsx)(v.Z,{children:e}),n.default=N}}]);