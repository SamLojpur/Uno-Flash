(this["webpackJsonpuno-flash"]=this["webpackJsonpuno-flash"]||[]).push([[0],{42:function(e,n,t){},44:function(e,n,t){},63:function(e,n,t){"use strict";t.r(n);var c=t(0),r=t.n(c),i=t(16),s=t.n(i),a=(t(42),t(13)),o=(t(43),t(44),t(20)),d=t(27),l=t(23),j=t(66),u=t(70),b=t(35),h=t.n(b),O=t(1),f={Red:"#D72600",Blue:"#0956BF",Green:"#379711",Yellow:"#ECD407"},x={One:"1",Two:"2",Three:"3",Four:"4",Five:"5",Six:"6",Seven:"7",Eight:"8",Nine:"9",Ten:"10"},m=function(e){var n=e.card,t=e.onClick,r=void 0===t?function(){}:t;console.log(n),console.log(n.lock_expiry-Date.now());var i=n.lock_expiry-Date.now(),s=Object(c.useState)(i>0),o=Object(a.a)(s,2),d=o[0],l=o[1];return Object(c.useEffect)((function(){i>0&&(l(!0),setTimeout((function(){console.log("unlocking"+n.id),l(!1)}),1e3))}),[n,i]),Object(O.jsx)("div",{children:Object(O.jsxs)(u.a,{onClick:d?function(){}:function(){return r(n.id)},style:{fontSize:"2rem",width:"4rem",height:"5rem",background:h()(f[n.color]||"grey").desaturate(d?.5:0).hex()},children:[Object(O.jsx)("div",{style:{marginTop:"1rem"},children:n.color&&n.value?x[n.value]:"?"}),Object(O.jsx)(j.a,{size:d?60:0,style:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)"}})]})})},p=function(e){var n=e.handId,t=e.cards,c=e.isVertical,r=void 0!==c&&c,i=e.sendToDiscard,s=function(e){i(n,e)};return Object(O.jsx)("div",{style:{display:"flex",justifyContent:"center",flexDirection:r?"column":"row",alignItems:"center"},children:t.map((function(e,n){return Object(O.jsx)(m,{card:e,onClick:s},e.id)}))})},v=function(e){var n=e.cards,t=n[n.length-1];return Object(O.jsx)("div",{style:{position:"relative"},children:Object(O.jsx)(m,{card:t})})},w=function(e){var n=e.cards,t=e.drawCard,c=n[0];return Object(O.jsx)("div",{style:{position:"relative"},children:Object(O.jsx)(m,{card:c,onClick:t})})},y=t(22),g=t.n(y),X=t(6),_=t(68),C=function(e){var n=e.winnerText,t=(e.users,e.user_id,e.show),c=e.onHide;return Object(O.jsxs)(_.a,{show:t,onHide:c,centered:!0,children:[Object(O.jsx)(_.a.Header,{children:Object(O.jsx)(_.a.Title,{children:"Game over!"})}),Object(O.jsx)(_.a.Body,{children:n})]})},k=function(e,n){return e.findIndex((function(e){return e.id===n}))},S=function(e){var n=e.user,t=Object(X.g)(),r=Object(X.f)(),i=Object(c.useState)(),s=Object(a.a)(i,2),j=s[0],u=s[1],b=Object(c.useState)({winner:null,user_id:null,room_id:null,table_pos:null,discard:null,deck:null,hands:{}}),h=Object(a.a)(b,2),f=h[0],x=h[1];Object(c.useEffect)((function(){var e;console.log("connecting to production server"),(e=new WebSocket("wss://uno-flash.herokuapp.com/ws/")).onopen=function(c){var r=null,i=null;void 0!==g.a.get("user_id")&&(r=g.a.get("user_id")),console.log(t.room_id),"unknown"!==t.room_id&&(i=t.room_id);var s={user_id:r,room_id:i,name:null===n||void 0===n?void 0:n.name};e.send(JSON.stringify(s))},e.onmessage=function(e){var n=JSON.parse(e.data);console.log(n),g.a.set("user_id",n.user_id),t.room_id&&"unknown"!==t.room_id||r.replace(n.room_id),x(n)},u(e)}),[]);var m,y,_=function(e,n){var t=function(e,n){var t=k(e,n),c=e[t],r=e.slice(0,t),i=e.slice(t+1);return[c,[].concat(Object(l.a)(r),Object(l.a)(i))]}(f.hands[e],n),c=Object(a.a)(t,2),r=c[0],i=c[1];j.send(JSON.stringify({Play:n})),x(Object(d.a)(Object(d.a)({},f),{},{hands:Object(o.a)({},e,i),discard:[r].concat(Object(l.a)(f.discard))}))};if(null===f.user_id)return null;f.winner&&(m=f.winner===f.user_id?"You win!":((null===(y=f.users.find((function(e){return f.winner===e.uuid})))||void 0===y?void 0:y.name)||"User "+f.winner)+" wins!");return Object(O.jsxs)(O.Fragment,{children:[Object(O.jsx)(C,{show:!!f.winner,winnerText:m,onHide:function(){return r.replace("/")}}),Object(O.jsx)(p,{handId:"left",cards:f.hands[(f.table_pos+1)%4]||[],isVertical:!0,sendToDiscard:_}),Object(O.jsxs)("div",{style:{display:"flex",flexGrow:1,flexDirection:"column",justifyContent:"space-between",alignItems:"center",width:"100%"},children:[Object(O.jsx)(p,{handId:"top",cards:f.hands[(f.table_pos+2)%4]||[],sendToDiscard:_}),Object(O.jsxs)("div",{style:{display:"flex",flexGrow:1,justifyContent:"center",alignItems:"center",width:"100%"},children:[Object(O.jsx)(v,{cards:f.discard}),Object(O.jsx)(w,{cards:f.deck,drawCard:function(){j.send(JSON.stringify({Draw:1}))}})]}),Object(O.jsx)(p,{handId:f.table_pos,cards:f.hands[f.table_pos]||[],sendToDiscard:_})]}),Object(O.jsx)(p,{handId:(f.table_pos+3)%4,cards:f.hands[(f.table_pos+3)%4]||[],isVertical:!0,sendToDiscard:_})]})},T=(t(58),t(69)),D=t(67),I=t(71),B=function(e){var n=e.setUser,t=Object(c.useState)(""),r=Object(a.a)(t,2),i=r[0],s=r[1],o=Object(c.useState)(""),d=Object(a.a)(o,2),l=d[0],j=d[1],b=Object(X.f)();return Object(O.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%"},children:[Object(O.jsx)("div",{style:{flexGrow:1}}),Object(O.jsx)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",flexDirection:"column"},children:Object(O.jsxs)(u.a,{style:{width:"25rem",padding:"1rem"},children:[Object(O.jsxs)(u.a.Body,{children:[Object(O.jsx)("label",{for:"username",children:"Username"}),Object(O.jsx)("input",{id:"username",class:"form-control",type:"text",placeholder:"Xx_Haxorman420_xX",label:i,onChange:function(e){s(e.target.value)}})]}),Object(O.jsxs)(u.a.Body,{children:[Object(O.jsx)(T.a,{variant:"primary",style:{marginBottom:"1rem"},onClick:function(){n({name:i}),b.push("/room/")},children:"Create Room"}),Object(O.jsxs)(D.a,{children:[Object(O.jsx)(I.a,{value:l,onChange:function(e){j(e.target.value)},placeholder:"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX","aria-label":"Room Code","aria-describedby":"basic-addon2"}),Object(O.jsx)(D.a.Append,{children:Object(O.jsx)(T.a,{variant:"primary",onClick:function(){n({name:i}),b.push("/room/"+l)},children:"Join Room"})})]})]})]})}),Object(O.jsx)("div",{style:{flexGrow:1}})]})},F=t(26),J=function(){var e=Object(c.useState)(),n=Object(a.a)(e,2),t=n[0],r=n[1];return Object(O.jsx)("div",{className:"App",children:Object(O.jsx)("header",{className:"App-header",children:Object(O.jsx)("div",{style:{display:"flex",width:"100%",height:"100vh"},children:Object(O.jsx)(F.a,{children:Object(O.jsxs)(X.c,{children:[Object(O.jsx)(X.a,{path:"/room/:room_id?",children:Object(O.jsx)(S,{user:t})}),Object(O.jsx)(X.a,{children:Object(O.jsx)(B,{setUser:r})})]})})})})})},N=function(e){e&&e instanceof Function&&t.e(3).then(t.bind(null,72)).then((function(n){var t=n.getCLS,c=n.getFID,r=n.getFCP,i=n.getLCP,s=n.getTTFB;t(e),c(e),r(e),i(e),s(e)}))};s.a.render(Object(O.jsx)(r.a.StrictMode,{children:Object(O.jsx)(J,{})}),document.getElementById("root")),N()}},[[63,1,2]]]);
//# sourceMappingURL=main.f6425ef6.chunk.js.map