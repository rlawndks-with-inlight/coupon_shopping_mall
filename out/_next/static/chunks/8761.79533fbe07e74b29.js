"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8761],{53156:function(e,t,r){r.d(t,{Z:function(){return j}});var i=r(63366),n=r(87462),o=r(67294),a=r(86010),l=r(14142),s=r(34867),c=r(94780),d=r(29628),u=r(70182);let p=(0,u.ZP)();var h=r(66500),m=r(85893);let v=["className","component","disableGutters","fixed","maxWidth","classes"],f=(0,h.Z)(),x=p("div",{name:"MuiContainer",slot:"Root",overridesResolver:(e,t)=>{let{ownerState:r}=e;return[t.root,t[`maxWidth${(0,l.Z)(String(r.maxWidth))}`],r.fixed&&t.fixed,r.disableGutters&&t.disableGutters]}}),g=e=>(0,d.Z)({props:e,name:"MuiContainer",defaultTheme:f}),b=(e,t)=>{let{classes:r,fixed:i,disableGutters:n,maxWidth:o}=e,a={root:["root",o&&`maxWidth${(0,l.Z)(String(o))}`,i&&"fixed",n&&"disableGutters"]};return(0,c.Z)(a,e=>(0,s.Z)(t,e),r)};var Z=r(98216),y=r(90948),k=r(71657);let w=function(e={}){let{createStyledComponent:t=x,useThemeProps:r=g,componentName:l="MuiContainer"}=e,s=t(({theme:e,ownerState:t})=>(0,n.Z)({width:"100%",marginLeft:"auto",boxSizing:"border-box",marginRight:"auto",display:"block"},!t.disableGutters&&{paddingLeft:e.spacing(2),paddingRight:e.spacing(2),[e.breakpoints.up("sm")]:{paddingLeft:e.spacing(3),paddingRight:e.spacing(3)}}),({theme:e,ownerState:t})=>t.fixed&&Object.keys(e.breakpoints.values).reduce((t,r)=>{let i=e.breakpoints.values[r];return 0!==i&&(t[e.breakpoints.up(r)]={maxWidth:`${i}${e.breakpoints.unit}`}),t},{}),({theme:e,ownerState:t})=>(0,n.Z)({},"xs"===t.maxWidth&&{[e.breakpoints.up("xs")]:{maxWidth:Math.max(e.breakpoints.values.xs,444)}},t.maxWidth&&"xs"!==t.maxWidth&&{[e.breakpoints.up(t.maxWidth)]:{maxWidth:`${e.breakpoints.values[t.maxWidth]}${e.breakpoints.unit}`}})),c=o.forwardRef(function(e,t){let o=r(e),{className:c,component:d="div",disableGutters:u=!1,fixed:p=!1,maxWidth:h="lg"}=o,f=(0,i.Z)(o,v),x=(0,n.Z)({},o,{component:d,disableGutters:u,fixed:p,maxWidth:h}),g=b(x,l);return(0,m.jsx)(s,(0,n.Z)({as:d,ownerState:x,className:(0,a.Z)(g.root,c),ref:t},f))});return c}({createStyledComponent:(0,y.ZP)("div",{name:"MuiContainer",slot:"Root",overridesResolver:(e,t)=>{let{ownerState:r}=e;return[t.root,t[`maxWidth${(0,Z.Z)(String(r.maxWidth))}`],r.fixed&&t.fixed,r.disableGutters&&t.disableGutters]}}),useThemeProps:e=>(0,k.Z)({props:e,name:"MuiContainer"})});var j=w},67720:function(e,t,r){var i=r(63366),n=r(87462),o=r(67294),a=r(86010),l=r(94780),s=r(41796),c=r(90948),d=r(71657),u=r(35097),p=r(85893);let h=["absolute","children","className","component","flexItem","light","orientation","role","textAlign","variant"],m=e=>{let{absolute:t,children:r,classes:i,flexItem:n,light:o,orientation:a,textAlign:s,variant:c}=e;return(0,l.Z)({root:["root",t&&"absolute",c,o&&"light","vertical"===a&&"vertical",n&&"flexItem",r&&"withChildren",r&&"vertical"===a&&"withChildrenVertical","right"===s&&"vertical"!==a&&"textAlignRight","left"===s&&"vertical"!==a&&"textAlignLeft"],wrapper:["wrapper","vertical"===a&&"wrapperVertical"]},u.V,i)},v=(0,c.ZP)("div",{name:"MuiDivider",slot:"Root",overridesResolver:(e,t)=>{let{ownerState:r}=e;return[t.root,r.absolute&&t.absolute,t[r.variant],r.light&&t.light,"vertical"===r.orientation&&t.vertical,r.flexItem&&t.flexItem,r.children&&t.withChildren,r.children&&"vertical"===r.orientation&&t.withChildrenVertical,"right"===r.textAlign&&"vertical"!==r.orientation&&t.textAlignRight,"left"===r.textAlign&&"vertical"!==r.orientation&&t.textAlignLeft]}})(({theme:e,ownerState:t})=>(0,n.Z)({margin:0,flexShrink:0,borderWidth:0,borderStyle:"solid",borderColor:(e.vars||e).palette.divider,borderBottomWidth:"thin"},t.absolute&&{position:"absolute",bottom:0,left:0,width:"100%"},t.light&&{borderColor:e.vars?`rgba(${e.vars.palette.dividerChannel} / 0.08)`:(0,s.Fq)(e.palette.divider,.08)},"inset"===t.variant&&{marginLeft:72},"middle"===t.variant&&"horizontal"===t.orientation&&{marginLeft:e.spacing(2),marginRight:e.spacing(2)},"middle"===t.variant&&"vertical"===t.orientation&&{marginTop:e.spacing(1),marginBottom:e.spacing(1)},"vertical"===t.orientation&&{height:"100%",borderBottomWidth:0,borderRightWidth:"thin"},t.flexItem&&{alignSelf:"stretch",height:"auto"}),({theme:e,ownerState:t})=>(0,n.Z)({},t.children&&{display:"flex",whiteSpace:"nowrap",textAlign:"center",border:0,"&::before, &::after":{position:"relative",width:"100%",borderTop:`thin solid ${(e.vars||e).palette.divider}`,top:"50%",content:'""',transform:"translateY(50%)"}}),({theme:e,ownerState:t})=>(0,n.Z)({},t.children&&"vertical"===t.orientation&&{flexDirection:"column","&::before, &::after":{height:"100%",top:"0%",left:"50%",borderTop:0,borderLeft:`thin solid ${(e.vars||e).palette.divider}`,transform:"translateX(0%)"}}),({ownerState:e})=>(0,n.Z)({},"right"===e.textAlign&&"vertical"!==e.orientation&&{"&::before":{width:"90%"},"&::after":{width:"10%"}},"left"===e.textAlign&&"vertical"!==e.orientation&&{"&::before":{width:"10%"},"&::after":{width:"90%"}})),f=(0,c.ZP)("span",{name:"MuiDivider",slot:"Wrapper",overridesResolver:(e,t)=>{let{ownerState:r}=e;return[t.wrapper,"vertical"===r.orientation&&t.wrapperVertical]}})(({theme:e,ownerState:t})=>(0,n.Z)({display:"inline-block",paddingLeft:`calc(${e.spacing(1)} * 1.2)`,paddingRight:`calc(${e.spacing(1)} * 1.2)`},"vertical"===t.orientation&&{paddingTop:`calc(${e.spacing(1)} * 1.2)`,paddingBottom:`calc(${e.spacing(1)} * 1.2)`})),x=o.forwardRef(function(e,t){let r=(0,d.Z)({props:e,name:"MuiDivider"}),{absolute:o=!1,children:l,className:s,component:c=l?"div":"hr",flexItem:u=!1,light:x=!1,orientation:g="horizontal",role:b="hr"!==c?"separator":void 0,textAlign:Z="center",variant:y="fullWidth"}=r,k=(0,i.Z)(r,h),w=(0,n.Z)({},r,{absolute:o,component:c,flexItem:u,light:x,orientation:g,role:b,textAlign:Z,variant:y}),j=m(w);return(0,p.jsx)(v,(0,n.Z)({as:c,className:(0,a.Z)(j.root,s),role:b,ref:t,ownerState:w},k,{children:l?(0,p.jsx)(f,{className:j.wrapper,ownerState:w,children:l}):null}))});t.Z=x},23795:function(e,t,r){r.d(t,{Z:function(){return A}});var i=r(63366),n=r(87462),o=r(67294),a=r(86010),l=r(94780),s=r(98216),c=r(90948),d=r(71657),u=r(79674),p=r(51705),h=r(15861),m=r(1588),v=r(34867);function f(e){return(0,v.Z)("MuiLink",e)}let x=(0,m.Z)("MuiLink",["root","underlineNone","underlineHover","underlineAlways","button","focusVisible"]);var g=r(54844),b=r(41796);let Z={primary:"primary.main",textPrimary:"text.primary",secondary:"secondary.main",textSecondary:"text.secondary",error:"error.main"},y=e=>Z[e]||e;var k=({theme:e,ownerState:t})=>{let r=y(t.color),i=(0,g.DW)(e,`palette.${r}`,!1)||t.color,n=(0,g.DW)(e,`palette.${r}Channel`);return"vars"in e&&n?`rgba(${n} / 0.4)`:(0,b.Fq)(i,.4)},w=r(85893);let j=["className","color","component","onBlur","onFocus","TypographyClasses","underline","variant","sx"],C=e=>{let{classes:t,component:r,focusVisible:i,underline:n}=e,o={root:["root",`underline${(0,s.Z)(n)}`,"button"===r&&"button",i&&"focusVisible"]};return(0,l.Z)(o,f,t)},R=(0,c.ZP)(h.Z,{name:"MuiLink",slot:"Root",overridesResolver:(e,t)=>{let{ownerState:r}=e;return[t.root,t[`underline${(0,s.Z)(r.underline)}`],"button"===r.component&&t.button]}})(({theme:e,ownerState:t})=>(0,n.Z)({},"none"===t.underline&&{textDecoration:"none"},"hover"===t.underline&&{textDecoration:"none","&:hover":{textDecoration:"underline"}},"always"===t.underline&&(0,n.Z)({textDecoration:"underline"},"inherit"!==t.color&&{textDecorationColor:k({theme:e,ownerState:t})},{"&:hover":{textDecorationColor:"inherit"}}),"button"===t.component&&{position:"relative",WebkitTapHighlightColor:"transparent",backgroundColor:"transparent",outline:0,border:0,margin:0,borderRadius:0,padding:0,cursor:"pointer",userSelect:"none",verticalAlign:"middle",MozAppearance:"none",WebkitAppearance:"none","&::-moz-focus-inner":{borderStyle:"none"},[`&.${x.focusVisible}`]:{outline:"auto"}})),$=o.forwardRef(function(e,t){let r=(0,d.Z)({props:e,name:"MuiLink"}),{className:l,color:s="primary",component:c="a",onBlur:h,onFocus:m,TypographyClasses:v,underline:f="always",variant:x="inherit",sx:g}=r,b=(0,i.Z)(r,j),{isFocusVisibleRef:y,onBlur:k,onFocus:$,ref:A}=(0,u.Z)(),[W,P]=o.useState(!1),S=(0,p.Z)(t,A),M=(0,n.Z)({},r,{color:s,component:c,focusVisible:W,underline:f,variant:x}),L=C(M);return(0,w.jsx)(R,(0,n.Z)({color:s,className:(0,a.Z)(L.root,l),classes:v,component:c,onBlur:e=>{k(e),!1===y.current&&P(!1),h&&h(e)},onFocus:e=>{$(e),!0===y.current&&P(!0),m&&m(e)},ref:S,ownerState:M,variant:x,sx:[...Object.keys(Z).includes(s)?[]:[{color:s}],...Array.isArray(g)?g:[g]]},b))});var A=$},26447:function(e,t,r){var i=r(63366),n=r(87462),o=r(67294),a=r(95408),l=r(98700),s=r(39707),c=r(59766),d=r(90948),u=r(71657),p=r(85893);let h=["component","direction","spacing","divider","children"],m=e=>({row:"Left","row-reverse":"Right",column:"Top","column-reverse":"Bottom"})[e],v=(0,d.ZP)("div",{name:"MuiStack",slot:"Root",overridesResolver:(e,t)=>[t.root]})(({ownerState:e,theme:t})=>{let r=(0,n.Z)({display:"flex",flexDirection:"column"},(0,a.k9)({theme:t},(0,a.P$)({values:e.direction,breakpoints:t.breakpoints.values}),e=>({flexDirection:e})));if(e.spacing){let i=(0,l.hB)(t),n=Object.keys(t.breakpoints.values).reduce((t,r)=>(("object"==typeof e.spacing&&null!=e.spacing[r]||"object"==typeof e.direction&&null!=e.direction[r])&&(t[r]=!0),t),{}),o=(0,a.P$)({values:e.direction,base:n}),s=(0,a.P$)({values:e.spacing,base:n});"object"==typeof o&&Object.keys(o).forEach((e,t,r)=>{let i=o[e];if(!i){let i=t>0?o[r[t-1]]:"column";o[e]=i}}),r=(0,c.Z)(r,(0,a.k9)({theme:t},s,(t,r)=>({"& > :not(style) + :not(style)":{margin:0,[`margin${m(r?o[r]:e.direction)}`]:(0,l.NA)(i,t)}})))}return(0,a.dt)(t.breakpoints,r)}),f=o.forwardRef(function(e,t){let r=(0,u.Z)({props:e,name:"MuiStack"}),a=(0,s.Z)(r),{component:l="div",direction:c="column",spacing:d=0,divider:m,children:f}=a,x=(0,i.Z)(a,h);return(0,p.jsx)(v,(0,n.Z)({as:l,ownerState:{direction:c,spacing:d},ref:t},x,{children:m?function(e,t){let r=o.Children.toArray(e).filter(Boolean);return r.reduce((e,i,n)=>(e.push(i),n<r.length-1&&e.push(o.cloneElement(t,{key:`separator-${n}`})),e),[])}(f,m):f}))});t.Z=f},31026:function(e,t,r){r.d(t,{Pq:function(){return n},TD:function(){return a},pc:function(){return o}});var i=r(50689);let n=()=>{let{themeDnsData:e,themeMode:t}=(0,i.K$)();return e["".concat("dark"==t?"dark_":"","logo_img")]},o=[{value:1,title:"데모 1 (일반 쇼핑몰에 적합)"},{value:2,title:"데모 2"},{value:3,title:"데모 3"},{value:4,title:"데모 4 (위탁 쇼핑몰에 적합)"},{value:5,title:"데모 5"},{value:6,title:"데모 6"},{value:7,title:"데모 7"}],a=[{value:1,title:"데모 1"},{value:2,title:"데모 2"},{value:3,title:"데모 3"}]},88761:function(e,t,r){r.r(t),r.d(t,{default:function(){return f}});var i=r(85893),n=r(41664),o=r.n(n),a=r(11163),l=r(87357),s=r(53156),c=r(15861),d=r(23795),u=r(67720),p=r(86886),h=r(26447),m=r(31026);let v=[{headline:"Minimal",children:[{name:"About us",href:"#"},{name:"Contact us",href:"#"},{name:"FAQs",href:"#"}]},{headline:"Legal",children:[{name:"Terms and Condition",href:"#"},{name:"Privacy Policy",href:"#"}]},{headline:"Contact",children:[{name:"support@minimals.cc",href:"#"},{name:"Los Angeles, 359  Hidden Valley Road",href:"#"}]}];function f(){let{pathname:e}=(0,a.useRouter)(),t=(0,i.jsx)(l.Z,{component:"footer",sx:{py:5,textAlign:"center",position:"relative",bgcolor:"background.default"},children:(0,i.jsxs)(s.Z,{children:[(0,i.jsx)("img",{src:(0,m.Pq)(),style:{marginBottom:"0.5rem",width:"120px",margin:"auto"}}),(0,i.jsxs)(c.Z,{variant:"caption",component:"div",children:["\xa9 All rights reserved",(0,i.jsx)("br",{})," made by \xa0",(0,i.jsx)(d.Z,{href:"https://minimals.cc/",children:" comagain "})]})]})}),r=(0,i.jsxs)(l.Z,{component:"footer",sx:{position:"relative",bgcolor:"background.default"},children:[(0,i.jsx)(u.Z,{}),(0,i.jsxs)(s.Z,{sx:{pt:10},children:[(0,i.jsxs)(p.ZP,{container:!0,justifyContent:{xs:"center",md:"space-between"},sx:{textAlign:{xs:"center",md:"left"}},children:[(0,i.jsx)(p.ZP,{item:!0,xs:12,sx:{mb:3},children:(0,i.jsx)("img",{src:(0,m.Pq)(),style:{height:"48px"}})}),(0,i.jsx)(p.ZP,{item:!0,xs:8,md:3,children:(0,i.jsx)(c.Z,{variant:"body2",sx:{pr:{md:5}},children:"The starting point for your next project with Minimal UI Kit, built on the newest version of Material-UI \xa9, ready to be customized to your style."})}),(0,i.jsx)(p.ZP,{item:!0,xs:12,md:7,children:(0,i.jsx)(h.Z,{spacing:5,justifyContent:"space-between",direction:{xs:"column",md:"row"},children:v.map(e=>(0,i.jsxs)(h.Z,{spacing:2,alignItems:{xs:"center",md:"flex-start"},children:[(0,i.jsx)(c.Z,{component:"div",variant:"overline",children:e.headline}),e.children.map(e=>(0,i.jsx)(d.Z,{component:o(),href:e.href,color:"inherit",variant:"body2",children:e.name},e.name))]},e.headline))})})]}),(0,i.jsx)(c.Z,{variant:"caption",component:"div",sx:{mt:10,pb:5,textAlign:{xs:"center",md:"left"}}})]})]});return"/"===e?t:r}}}]);