(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8932],{38565:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/shop/auth/sign-up",function(){return n(34508)}])},91561:function(e,t,n){"use strict";var r=n(85893),o=n(45697),l=n.n(o),i=n(67294),a=n(1954),c=n(87357);let s=(0,i.forwardRef)((e,t)=>{let{icon:n,width:o=20,sx:l,...i}=e;return(0,r.jsx)(c.Z,{ref:t,component:a.JO,icon:n,sx:{width:o,height:o,...l},...i})});s.propTypes={sx:l().object,width:l().oneOfType([l().number,l().string]),icon:l().oneOfType([l().element,l().string])},t.Z=s},34508:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return $}});var r=n(85893),o=n(11163),l=n(67294),i=n(84798),a=n(50689),c=n(82729),s=n(45697),d=n.n(s),u=n(14621),h=n(57249),p=n(19370),m=n(44472),x=n(83578),g=n(50480),f=n(15861),j=n(69368),k=n(67720),v=n(50135),y=n(87109),b=n(94054),_=n(33841),w=n(57709),Z=n(83321),C=n(65631),z=n(50066),T=n(90948),S=n(91561),F=n(93990),P=n(52443),X=n(61339),O=n(84475),W=n(1954),I=n(90985);function K(){let e=(0,c._)(["\nmax-width:700px;\ndisplay:flex;\nflex-direction:column;\nmargin: 0 auto 5rem auto;\nwidth: 90%;\nmin-height:90vh;\n"]);return K=function(){return e},e}let N=z.ZP.div(K()),A=["약관동의","정보입력","가입완료"],E=(0,T.ZP)(u.Z)(e=>{let{theme:t}=e;return{["&.".concat(h.Z.alternativeLabel)]:{top:22},["&.".concat(h.Z.active)]:{["& .".concat(h.Z.line)]:{...(0,F.v3)({startColor:t.palette.primary.light,endColor:t.palette.primary.main})}},["&.".concat(h.Z.completed)]:{["& .".concat(h.Z.line)]:{...(0,F.v3)({startColor:t.palette.primary.light,endColor:t.palette.primary.main})}},["& .".concat(h.Z.line)]:{height:3,border:0,borderRadius:1,backgroundColor:t.palette.divider}}}),R=(0,T.ZP)("div")(e=>{let{theme:t,ownerState:n}=e;return{zIndex:1,width:50,height:50,display:"flex",borderRadius:"50%",alignItems:"center",justifyContent:"center",color:t.palette.text.disabled,backgroundColor:"light"===t.palette.mode?t.palette.grey[300]:t.palette.grey[700],...n.active&&{boxShadow:"0 4px 10px 0 rgba(0,0,0,.25)",color:t.palette.common.white,...(0,F.v3)({startColor:t.palette.primary.light,endColor:t.palette.primary.main})},...n.completed&&{color:t.palette.common.white,...(0,F.v3)({startColor:t.palette.primary.light,endColor:t.palette.primary.main})}}});function J(e){let{active:t,completed:n,className:o,icon:l}=e,i={1:(0,r.jsx)(S.Z,{icon:"eva:settings-2-outline",width:24}),2:(0,r.jsx)(S.Z,{icon:"eva:person-add-outline",width:24}),3:(0,r.jsx)(S.Z,{icon:"fluent-mdl2:completed",width:24})};return(0,r.jsx)(R,{ownerState:{completed:n,active:t},className:o,children:i[String(l)]})}J.propTypes={active:d().bool,icon:d().number,completed:d().bool,className:d().string};let L={marginTop:"1rem"};var Y=e=>{let{func:{router:t}}=e,{themeDnsData:n}=(0,a.K$)(),o=(0,P.u)(),[i,c]=(0,l.useState)(0),[s,d]=(0,l.useState)({check_0:!1,check_1:!1,check_2:!1,check_3:!1,check_4:!1,check_5:!1}),[u,h]=(0,l.useState)({user_name:"",user_pw:"",passwordCheck:"",nick_name:"",phone_num:"",phoneCheck:""}),[z,T]=(0,l.useState)(0),S=async()=>{if(0==i&&(!s.check_1||!s.check_2)){O.Am.error("필수 항목에 체크해 주세요.");return}if(1==i){if(!u.user_name||!u.user_pw||!u.passwordCheck||!u.nick_name||!u.phone_num){O.Am.error("필수 항목을 입력해 주세요.");return}console.log(await (0,I.gC)({...u,brand_id:null==n?void 0:n.id}))}if(2==i){t.push("/shop");return}c(i+1),window.scrollTo(0,0)},F=async()=>{T(1),console.log(await (0,I.Ul)({phone_num:u.phone_num}))};return(0,r.jsx)(r.Fragment,{children:(0,r.jsxs)(N,{children:[(0,r.jsx)(C.Dx,{children:"회원가입"}),(0,r.jsx)(p.Z,{alternativeLabel:!0,activeStep:i,connector:(0,r.jsx)(E,{}),children:A.map(e=>(0,r.jsx)(m.Z,{children:(0,r.jsx)(x.Z,{StepIconComponent:J,children:e})},e))}),(0,r.jsx)("div",{style:{marginTop:"2rem"}}),0==i&&(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(g.Z,{label:(0,r.jsx)(f.Z,{style:{fontWeight:"bold",fontSize:C.af.font_size.size5},children:" 이용약관 및 개인정보수집 및 이용, 쇼핑정보 수신(선택)에 모두 동의합니다."}),control:(0,r.jsx)(j.Z,{checked:s.check_0}),onChange:e=>{let t={};if(e.target.checked)for(let e in s)t[e]=!0;else for(let e in s)t[e]=!1;d(t)}}),(0,r.jsx)("div",{style:{marginTop:"1rem"}}),(0,r.jsx)(k.Z,{}),(0,r.jsx)("div",{style:{marginTop:"1rem"}}),(0,r.jsx)(g.Z,{label:(0,r.jsx)(f.Z,{style:{fontSize:C.af.font_size.size6},children:"이용약관 동의 (필수)"}),control:(0,r.jsx)(j.Z,{checked:s.check_1,onChange:e=>{d({...s,check_1:e.target.checked})}})}),(0,r.jsx)("div",{style:{marginTop:"0.5rem"}}),(0,r.jsx)("div",{style:{height:"10rem",overflowY:"auto",border:"1px solid ".concat(C.af.grey[300])},children:(0,r.jsx)(X.default,{type:0})}),(0,r.jsx)("div",{style:{marginTop:"1rem"}}),(0,r.jsx)(g.Z,{label:(0,r.jsx)(f.Z,{style:{fontSize:C.af.font_size.size6},children:"개인정보 수집 및 이용 동의 (필수)"}),control:(0,r.jsx)(j.Z,{checked:s.check_2,onChange:e=>{d({...s,check_2:e.target.checked})}})}),(0,r.jsx)("div",{style:{marginTop:"0.5rem"}}),(0,r.jsx)("div",{style:{height:"10rem",overflowY:"auto",border:"1px solid ".concat(C.af.grey[300])},children:(0,r.jsx)(X.default,{type:1})}),(0,r.jsx)("div",{style:{marginTop:"1rem"}}),(0,r.jsx)(g.Z,{label:(0,r.jsx)(f.Z,{style:{fontSize:C.af.font_size.size6},children:"쇼핑정보 수신 동의 (선택)"}),control:(0,r.jsx)(j.Z,{checked:s.check_3,onChange:e=>{d({...s,check_3:e.target.checked})}})}),(0,r.jsx)("div",{style:{marginTop:"1rem"}}),(0,r.jsx)(k.Z,{}),(0,r.jsx)("div",{style:{marginTop:"1rem"}}),(0,r.jsxs)(C.X2,{children:[(0,r.jsx)(g.Z,{label:(0,r.jsx)(f.Z,{style:{fontSize:C.af.font_size.size7},children:"SMS 수신 동의 (선택)"}),control:(0,r.jsx)(j.Z,{checked:s.check_4,onChange:e=>{d({...s,check_4:e.target.checked})}})}),(0,r.jsx)(g.Z,{label:(0,r.jsx)(f.Z,{style:{fontSize:C.af.font_size.size7},children:"이메일 수신 동의 (선택)"}),control:(0,r.jsx)(j.Z,{checked:s.check_5,onChange:e=>{d({...s,check_5:e.target.checked})}})})]}),(0,r.jsx)("div",{style:{marginTop:"0.5rem"}}),(0,r.jsx)("div",{style:{height:"10rem",overflowY:"auto",border:"1px solid ".concat(C.af.grey[300]),padding:"2rem",fontSize:C.af.font_size.size7},children:"할인쿠폰 및 혜택, 이벤트, 신상품 소식 등 쇼핑몰에서 제공하는 유익한 쇼핑정보를 SMS나 이메일로 받아보실 수 있습니다. 단, 주문/거래 정보 및 주요 정책과 관련된 내용은 수신동의 여부와 관계없이 발송됩니다. 선택 약관에 동의하지 않으셔도 회원가입은 가능하며, 회원가입 후 회원정보수정 페이지에서 언제든지 수신여부를 변경하실 수 있습니다."})]}),1==i&&(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(v.Z,{label:"아이디",onChange:e=>{h({...u,user_name:e.target.value})},value:u.user_name,style:L,autoComplete:"new-password",onKeyPress:e=>{e.key},InputProps:{startAdornment:(0,r.jsx)(y.Z,{position:"start",children:(0,r.jsx)(W.JO,{icon:"eva:person-fill",width:24})})}}),(0,r.jsx)(v.Z,{label:"비밀번호",onChange:e=>{h({...u,user_pw:e.target.value})},type:"password",value:u.user_pw,style:L,autoComplete:"new-password",onKeyPress:e=>{e.key}}),(0,r.jsx)(v.Z,{label:"비밀번호 확인",onChange:e=>{h({...u,passwordCheck:e.target.value})},type:"password",value:u.passwordCheck,style:L,autoComplete:"new-password",onKeyPress:e=>{e.key}}),(0,r.jsx)(v.Z,{label:"이름",onChange:e=>{h({...u,nick_name:e.target.value})},value:u.nick_name,style:L,autoComplete:"new-password",onKeyPress:e=>{e.key}}),(0,r.jsxs)(b.Z,{variant:"outlined",style:{width:"100%",marginTop:"1rem"},children:[(0,r.jsx)(_.Z,{children:"휴대폰번호"}),(0,r.jsx)(w.Z,{label:"휴대폰번호",placeholder:"하이픈(-) 제외 입력",onChange:e=>{h({...u,phone_num:e.target.value})},value:u.phone_num,endAdornment:(0,r.jsx)(r.Fragment,{children:(0,r.jsx)(Z.Z,{style:{width:"124px",height:"56px",transform:"translateX(14px)"},variant:"contained",onClick:()=>{0==z&&F()},children:"인증번호발송"})})})]}),(0,r.jsxs)(b.Z,{variant:"outlined",style:{width:"100%",marginTop:"1rem"},children:[(0,r.jsx)(_.Z,{children:"휴대폰번호"}),(0,r.jsx)(w.Z,{label:"휴대폰번호",placeholder:"하이픈(-) 제외 입력",onChange:e=>{h({...u,phoneCheck:e.target.value})},value:u.phoneCheck,endAdornment:(0,r.jsx)(r.Fragment,{children:(0,r.jsx)(Z.Z,{style:{width:"124px",height:"56px",transform:"translateX(14px)"},variant:"contained",onClick:()=>{},children:"인증번호확인"})})})]})]}),2==i&&(0,r.jsx)(r.Fragment,{children:(0,r.jsxs)(C.JX,{children:[(0,r.jsx)(W.JO,{icon:"fluent-mdl2:completed",style:{margin:"8rem auto 1rem auto",fontSize:C.af.font_size.size1,color:o.palette.primary.main}}),(0,r.jsx)("div",{style:{margin:"auto auto 8rem auto"},children:"회원가입이 완료되었습니다."})]})}),(0,r.jsxs)(C.X2,{style:{width:"100%",justifyContent:"space-between"},children:[(0,r.jsx)(Z.Z,{variant:"outlined",style:{height:"56px",marginTop:"1rem",width:"49%"},onClick:()=>{if(0==i){t.back();return}c(i-1),window.scrollTo(0,0)},children:"이전"}),(0,r.jsx)(Z.Z,{variant:"contained",style:{height:"56px",marginTop:"1rem",width:"49%"},onClick:S,children:2==i?"완료":"다음"})]})]})})},B=e=>{let{func:{router:t}}=e;return(0,r.jsx)(r.Fragment,{})},M=e=>{let{func:{router:t}}=e;return(0,r.jsx)(r.Fragment,{})};let U=(e,t)=>1==e?(0,r.jsx)(Y,{...t}):2==e?(0,r.jsx)(B,{...t}):3==e?(0,r.jsx)(M,{...t}):void 0,q=()=>{let e=(0,o.useRouter)(),{themeDnsData:t}=(0,a.K$)();return(0,r.jsx)(r.Fragment,{children:U(null==t?void 0:t.shop_demo_num,{data:{},func:{router:e}})})};q.getLayout=e=>(0,r.jsx)(i.Z,{children:e});var $=q},93990:function(e,t,n){"use strict";n.d(t,{IW:function(){return c},Ls:function(){return o},XK:function(){return i},v3:function(){return l},vY:function(){return a}});var r=n(41796);function o(e){let t=(null==e?void 0:e.color)||"#000000",n=(null==e?void 0:e.blur)||6,o=(null==e?void 0:e.opacity)||.8,l=null==e?void 0:e.imgUrl;return l?{position:"relative",backgroundImage:"url(".concat(l,")"),"&:before":{position:"absolute",top:0,left:0,zIndex:9,content:'""',width:"100%",height:"100%",backdropFilter:"blur(".concat(n,"px)"),WebkitBackdropFilter:"blur(".concat(n,"px)"),backgroundColor:(0,r.Fq)(t,o)}}:{backdropFilter:"blur(".concat(n,"px)"),WebkitBackdropFilter:"blur(".concat(n,"px)"),backgroundColor:(0,r.Fq)(t,o)}}function l(e){let t=(null==e?void 0:e.direction)||"to bottom",n=null==e?void 0:e.startColor,r=null==e?void 0:e.endColor,o=null==e?void 0:e.imgUrl,l=null==e?void 0:e.color;return o?{background:"linear-gradient(".concat(t,", ").concat(n||l,", ").concat(r||l,"), url(").concat(o,")"),backgroundSize:"cover",backgroundRepeat:"no-repeat",backgroundPosition:"center center"}:{background:"linear-gradient(".concat(t,", ").concat(n,", ").concat(r,")")}}function i(e){return{background:"-webkit-linear-gradient(".concat(e,")"),WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}function a(e){return{filter:e,WebkitFilter:e,MozFilter:e}}let c={msOverflowStyle:"none",scrollbarWidth:"none",overflowX:"scroll","&::-webkit-scrollbar":{display:"none"}}}},function(e){e.O(0,[571,1712,8265,7918,1907,153,135,6066,5898,2519,6298,6397,4798,1339,9774,2888,179],function(){return e(e.s=38565)}),_N_E=e.O()}]);