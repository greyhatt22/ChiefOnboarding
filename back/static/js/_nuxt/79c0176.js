/*! For license information please see LICENSES */
(window.webpackJsonp=window.webpackJsonp||[]).push([[40],{662:function(e,t,n){e.exports=function(){"use strict";var e=Object.prototype.toString,t=Array.isArray||function(object){return"[object Array]"===e.call(object)};function n(object){return"function"==typeof object}function r(e){return t(e)?"array":typeof e}function o(e){return e.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")}function l(e,t){return null!=e&&"object"==typeof e&&t in e}function c(e,t){return null!=e&&"object"!=typeof e&&e.hasOwnProperty&&e.hasOwnProperty(t)}var d=RegExp.prototype.test;function f(e,t){return d.call(e,t)}var h=/\S/;function v(e){return!f(h,e)}var m={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"};function _(e){return String(e).replace(/[&<>"'`=\/]/g,(function(s){return m[s]}))}var y=/\s*/,x=/\s+/,k=/\s*=/,w=/\s*\}/,$=/#|\^|\/|>|\{|&|=|!/;function C(template,e){if(!template)return[];var n,r,l,c=!1,d=[],f=[],h=[],m=!1,_=!1,C="",V=0;function F(){if(m&&!_)for(;h.length;)delete f[h.pop()];else h=[];m=!1,_=!1}function E(e){if("string"==typeof e&&(e=e.split(x,2)),!t(e)||2!==e.length)throw new Error("Invalid tags: "+e);n=new RegExp(o(e[0])+"\\s*"),r=new RegExp("\\s*"+o(e[1])),l=new RegExp("\\s*"+o("}"+e[1]))}E(e||j.tags);for(var O,M,U,I,A,L,B=new T(template);!B.eos();){if(O=B.pos,U=B.scanUntil(n))for(var i=0,N=U.length;i<N;++i)v(I=U.charAt(i))?(h.push(f.length),C+=I):(_=!0,c=!0,C+=" "),f.push(["text",I,O,O+1]),O+=1,"\n"===I&&(F(),C="",V=0,c=!1);if(!B.scan(n))break;if(m=!0,M=B.scan($)||"name",B.scan(y),"="===M?(U=B.scanUntil(k),B.scan(k),B.scanUntil(r)):"{"===M?(U=B.scanUntil(l),B.scan(w),B.scanUntil(r),M="&"):U=B.scanUntil(r),!B.scan(r))throw new Error("Unclosed tag at "+B.pos);if(A=">"==M?[M,U,O,B.pos,C,V,c]:[M,U,O,B.pos],V++,f.push(A),"#"===M||"^"===M)d.push(A);else if("/"===M){if(!(L=d.pop()))throw new Error('Unopened section "'+U+'" at '+O);if(L[1]!==U)throw new Error('Unclosed section "'+L[1]+'" at '+O)}else"name"===M||"{"===M||"&"===M?_=!0:"="===M&&E(U)}if(F(),L=d.pop())throw new Error('Unclosed section "'+L[1]+'" at '+B.pos);return S(P(f))}function P(e){for(var t,n,r=[],i=0,o=e.length;i<o;++i)(t=e[i])&&("text"===t[0]&&n&&"text"===n[0]?(n[1]+=t[1],n[3]=t[3]):(r.push(t),n=t));return r}function S(e){for(var t,n=[],r=n,o=[],i=0,l=e.length;i<l;++i)switch((t=e[i])[0]){case"#":case"^":r.push(t),o.push(t),r=t[4]=[];break;case"/":o.pop()[5]=t[2],r=o.length>0?o[o.length-1][4]:n;break;default:r.push(t)}return n}function T(e){this.string=e,this.tail=e,this.pos=0}function V(view,e){this.view=view,this.cache={".":this.view},this.parent=e}function F(){this.templateCache={_cache:{},set:function(e,t){this._cache[e]=t},get:function(e){return this._cache[e]},clear:function(){this._cache={}}}}T.prototype.eos=function(){return""===this.tail},T.prototype.scan=function(e){var t=this.tail.match(e);if(!t||0!==t.index)return"";var n=t[0];return this.tail=this.tail.substring(n.length),this.pos+=n.length,n},T.prototype.scanUntil=function(e){var t,n=this.tail.search(e);switch(n){case-1:t=this.tail,this.tail="";break;case 0:t="";break;default:t=this.tail.substring(0,n),this.tail=this.tail.substring(n)}return this.pos+=t.length,t},V.prototype.push=function(view){return new V(view,this)},V.prototype.lookup=function(e){var t,r=this.cache;if(r.hasOwnProperty(e))t=r[e];else{for(var o,d,f,h=this,v=!1;h;){if(e.indexOf(".")>0)for(o=h.view,d=e.split("."),f=0;null!=o&&f<d.length;)f===d.length-1&&(v=l(o,d[f])||c(o,d[f])),o=o[d[f++]];else o=h.view[e],v=l(h.view,e);if(v){t=o;break}h=h.parent}r[e]=t}return n(t)&&(t=t.call(this.view)),t},F.prototype.clearCache=function(){void 0!==this.templateCache&&this.templateCache.clear()},F.prototype.parse=function(template,e){var t=this.templateCache,n=template+":"+(e||j.tags).join(":"),r=void 0!==t,o=r?t.get(n):void 0;return null==o&&(o=C(template,e),r&&t.set(n,o)),o},F.prototype.render=function(template,view,e,t){var n=this.getConfigTags(t),r=this.parse(template,n),o=view instanceof V?view:new V(view,void 0);return this.renderTokens(r,o,e,template,t)},F.prototype.renderTokens=function(e,t,n,r,o){for(var l,symbol,c,d="",i=0,f=e.length;i<f;++i)c=void 0,"#"===(symbol=(l=e[i])[0])?c=this.renderSection(l,t,n,r,o):"^"===symbol?c=this.renderInverted(l,t,n,r,o):">"===symbol?c=this.renderPartial(l,t,n,o):"&"===symbol?c=this.unescapedValue(l,t):"name"===symbol?c=this.escapedValue(l,t,o):"text"===symbol&&(c=this.rawValue(l)),void 0!==c&&(d+=c);return d},F.prototype.renderSection=function(e,r,o,l,c){var d=this,f="",h=r.lookup(e[1]);function v(template){return d.render(template,r,o,c)}if(h){if(t(h))for(var m=0,_=h.length;m<_;++m)f+=this.renderTokens(e[4],r.push(h[m]),o,l,c);else if("object"==typeof h||"string"==typeof h||"number"==typeof h)f+=this.renderTokens(e[4],r.push(h),o,l,c);else if(n(h)){if("string"!=typeof l)throw new Error("Cannot use higher-order sections without the original template");null!=(h=h.call(r.view,l.slice(e[3],e[5]),v))&&(f+=h)}else f+=this.renderTokens(e[4],r,o,l,c);return f}},F.prototype.renderInverted=function(e,n,r,o,l){var c=n.lookup(e[1]);if(!c||t(c)&&0===c.length)return this.renderTokens(e[4],n,r,o,l)},F.prototype.indentPartial=function(e,t,n){for(var r=t.replace(/[^ \t]/g,""),o=e.split("\n"),i=0;i<o.length;i++)o[i].length&&(i>0||!n)&&(o[i]=r+o[i]);return o.join("\n")},F.prototype.renderPartial=function(e,t,r,o){if(r){var l=this.getConfigTags(o),c=n(r)?r(e[1]):r[e[1]];if(null!=c){var d=e[6],f=e[5],h=e[4],v=c;0==f&&h&&(v=this.indentPartial(c,h,d));var m=this.parse(v,l);return this.renderTokens(m,t,r,v,o)}}},F.prototype.unescapedValue=function(e,t){var n=t.lookup(e[1]);if(null!=n)return n},F.prototype.escapedValue=function(e,t,n){var r=this.getConfigEscape(n)||j.escape,o=t.lookup(e[1]);if(null!=o)return"number"==typeof o&&r===j.escape?String(o):r(o)},F.prototype.rawValue=function(e){return e[1]},F.prototype.getConfigTags=function(e){return t(e)?e:e&&"object"==typeof e?e.tags:void 0},F.prototype.getConfigEscape=function(e){return e&&"object"==typeof e&&!t(e)?e.escape:void 0};var j={name:"mustache.js",version:"4.1.0",tags:["{{","}}"],clearCache:void 0,escape:void 0,parse:void 0,render:void 0,Scanner:void 0,Context:void 0,Writer:void 0,set templateCache(e){E.templateCache=e},get templateCache(){return E.templateCache}},E=new F;return j.clearCache=function(){return E.clearCache()},j.parse=function(template,e){return E.parse(template,e)},j.render=function(template,view,e,t){if("string"!=typeof template)throw new TypeError('Invalid template! Template should be a "string" but "'+r(template)+'" was given as the first argument for mustache#render(template, view, partials)');return E.render(template,view,e,t)},j.escape=_,j.Scanner=T,j.Context=V,j.Writer=F,j}()},663:function(e,t,n){var content=n(671);"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,n(17).default)("19b267cc",content,!0,{sourceMap:!1})},668:function(e,t,n){"use strict";n(127);var r=n(662),o=n.n(r),l={name:"ContentDisplay",props:{content:{default:function(){return[]},type:Array},disableMustache:{default:!1,type:Boolean}},methods:{getYoutubeLink:function(e){var t=/.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;return null!==e.trim().match(t)&&2===e.trim().match(t).length?"https://youtube.com/embed/"+e.trim().match(t)[1]:""},mustaching:function(content){return this.disableMustache?content:void 0===content?"":o.a.render(content,this.$store.state.baseInfo.new_hire||this.$store.state.admins[0])},downloadFile:function(e){this.$newhirepart.getFileURL(e.id,e.uuid).then((function(e){window.open(e,"_blank")}))}}},c=(n(670),n(23)),d=n(24),f=n.n(d),h=n(215),v=n(175),component=Object(c.a)(l,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",e._l(e.content,(function(i,t){return n("div",{key:t},["p"===i.type?n("p",[n("span",{domProps:{innerHTML:e._s(e.mustaching(i.content))}})]):e._e(),e._v(" "),"h1"===i.type?n("h1",[n("span",{domProps:{innerHTML:e._s(e.mustaching(i.content))}})]):e._e(),e._v(" "),"h2"===i.type?n("h2",[n("span",{domProps:{innerHTML:e._s(e.mustaching(i.content))}})]):e._e(),e._v(" "),"h3"===i.type?n("h3",[n("span",{domProps:{innerHTML:e._s(e.mustaching(i.content))}})]):e._e(),e._v(" "),"ul"===i.type?n("ul",{staticClass:"mb-3"},e._l(i.items,(function(t){return n("li",[n("span",{domProps:{innerHTML:e._s(e.mustaching(t.content))}})])})),0):e._e(),e._v(" "),"file"===i.type?n("h3",[n("label",[e._v("Files")]),n("br"),e._v(" "),e._l(i.files,(function(t,r){return n("v-chip",{key:r,on:{click:function(n){return e.downloadFile(t)}}},[e._v("\n        "+e._s(t.name)+"\n      ")])}))],2):e._e(),e._v(" "),"image"===i.type&&i.files.length?n("h3",[n("v-img",{attrs:{src:i.files[0].file_url}})],1):e._e(),e._v(" "),"video"===i.type&&i.files.length?n("div",[n("video",{staticStyle:{width:"100%"},attrs:{controls:""}},[n("source",{attrs:{src:i.files[0].file_url,type:"video/"+i.files[0].ext}})])]):e._e(),e._v(" "),"youtube"===i.type?n("div",[""!==e.getYoutubeLink(i.content)?n("iframe",{attrs:{src:e.getYoutubeLink(i.content),width:"560",height:"315",frameborder:"0",allow:"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",allowfullscreen:""}}):e._e()]):e._e(),e._v(" "),"quote"===i.type?n("blockquote",{style:"border-left-color: "+e.$store.state.baseInfo.org.base_color},[e._v("\n      "+e._s(i.content)+"\n    ")]):e._e()])})),0)}),[],!1,null,null,null);t.a=component.exports;f()(component,{VChip:h.a,VImg:v.a})},669:function(e,t,n){var content=n(674);"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,n(17).default)("87b00410",content,!0,{sourceMap:!1})},670:function(e,t,n){"use strict";n(663)},671:function(e,t,n){var r=n(16)(!1);r.push([e.i,"blockquote,h1,h2,h3{margin-bottom:10px}blockquote{margin-top:10px;padding:20px 30px;background:#f9f9f9;border-left:2px solid #ffbb42}p{margin-bottom:20px!important}",""]),e.exports=r},673:function(e,t,n){"use strict";n(669)},674:function(e,t,n){var r=n(16)(!1);r.push([e.i,".v-file input[type=file][data-v-62316f79]{display:none}",""]),e.exports=r},675:function(e,t,n){"use strict";n(21),n(25);var r={name:"UploadNewHireFile",props:{value:{type:Array,default:function(){return[]}},label:{type:String,default:"File input"},color:{required:!0,type:String}},data:function(e){return{uploadingFile:!1}},watch:{value:{handler:function(e){this.$emit("input",e)},deep:!0}},methods:{upload:function(e){var t=this;this.uploadingFile=!0,this.$org.getPreSignedURL({name:e.name}).then((function(data){t.$org.uploadToAWS(data.url,e).then((function(){t.$org.confirmUploaded(data.id).then((function(e){t.value=e}))}))}))}}},o=(n(673),n(23)),l=n(24),c=n.n(l),d=n(865),component=Object(o.a)(r,(function(){var e=this,t=e.$createElement;return(e._self._c||t)("v-file-input",{staticClass:"mt-2",attrs:{color:e.color,label:e.label,placeholder:"Select your file","prepend-icon":"mdi-paperclip",outlined:""},on:{change:e.upload},model:{value:e.files,callback:function(t){e.files=t},expression:"files"}})}),[],!1,null,"62316f79",null),f=component.exports;c()(component,{VFileInput:d.a});var h={name:"CustomForm",components:{UploadForm:f},props:{value:{type:Array,required:!0},org:{type:Object,required:!0},id:{type:Number,required:!0},external:{type:Boolean,default:!1}},data:function(){return{formPart:[]}},watch:{formPart:{handler:function(e){this.$emit("input",e)},deep:!0}},mounted:function(){var e=this;setTimeout((function(){e.formPart=JSON.parse(JSON.stringify(e.value))}),200)}},v=n(712),m=n(713),_=n(714),y=n(65),x=n(655),k=Object(o.a)(h,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"mt-3 formpart"},e._l(e.value,(function(i,t){return n("div",{key:t},["input"===i.type?n("div",[n("v-text-field",{staticClass:"my-0",attrs:{color:e.org.base_color,label:i.text,outline:""},model:{value:i.value,callback:function(t){e.$set(i,"value",t)},expression:"i.value"}})],1):e._e(),e._v(" "),"upload"===i.type?n("div",[n("UploadForm",{attrs:{id:e.id,label:i.text,color:e.org.base_color},model:{value:i.value,callback:function(t){e.$set(i,"value",t)},expression:"i.value"}})],1):e._e(),e._v(" "),"text"===i.type?n("div",[n("v-textarea",{staticClass:"my-0",attrs:{color:e.org.base_color,label:i.text,outline:""},model:{value:i.value,callback:function(t){e.$set(i,"value",t)},expression:"i.value"}})],1):e._e(),e._v(" "),"check"===i.type?n("div",[n("p",{staticStyle:{color:"rgba(0,0,0,.54)"}},[e._v("\n        "+e._s(i.text)+"\n      ")]),e._v(" "),e._l(i.items,(function(t){return n("v-checkbox",{key:t.name,staticClass:"my-0",attrs:{color:e.org.base_color,label:t.name},model:{value:t.value,callback:function(n){e.$set(t,"value",n)},expression:"n.value"}})}))],2):e._e(),e._v(" "),"select"===i.type?n("div",[n("v-radio-group",{attrs:{label:i.text,color:e.org.base_color},model:{value:i.value,callback:function(t){e.$set(i,"value",t)},expression:"i.value"}},e._l(i.options,(function(t){return n("v-radio",{key:t.name,attrs:{color:e.org.base_color,label:t.name,value:t.name}})})),1)],1):e._e()])})),0)}),[],!1,null,null,null);t.a=k.exports;c()(k,{VCheckbox:v.a,VRadio:m.a,VRadioGroup:_.a,VTextField:y.a,VTextarea:x.a})},678:function(e,t,n){"use strict";n(7);var r=n(662),o=n.n(r),l=n(668),c=n(675),d={name:"PreboardingPage",components:{ContentDisplay:l.a,CustomForm:c.a},props:{pages:{type:Array,required:!0},newHire:{type:Object,required:!0},org:{type:Object,required:!0},completedTodos:{type:Array,default:function(){return[]}},disableMustache:{type:Boolean,default:!1}},data:function(){return{form:[],dialogForm:[],index:0,showModal:!1,sendingForm:!1,submittingForm:!1}},computed:{page:function(){return this.pages[this.index]}},methods:{Mustaching:function(content){return this.disableMustache?content:o.a.render(content,this.newHire)},clickNext:function(){this.index++,this.index>this.pages.length-1&&(this.index=0),this.form=[]},sendFormBack:function(){var e=this;this.sendingForm=!0,this.$newhirepreboarding.sendFormBack({id:this.pages[this.index].page_id,form:this.form}).then((function(data){e.pages[e.index].completed=!0})).finally((function(){e.sendingForm=!1}))}}},f=n(23),h=n(24),v=n.n(h),m=n(140),_=n(208),y=n(43),x=n(68),component=Object(f.a)(d,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("v-toolbar",{attrs:{color:"org.base_color",dark:"",extended:"",flat:""}}),e._v(" "),e.page?n("v-card",{staticClass:"mx-auto mb-4",staticStyle:{"margin-top":"-64px"},attrs:{"max-width":"590"}},[n("v-card-title",[n("h2",[e._v("\n        "+e._s(e.Mustaching(e.page.name))+"\n      ")])]),e._v(" "),n("v-card-text",[null!==e.page.content&&e.page.content.length?n("ContentDisplay",{attrs:{content:e.page.content,"disable-mustache":e.disableMustache}}):n("div",e._l(e.page.content,(function(t){return n("div",{key:t.id},[n("blockquote",{staticClass:"blockquote"},[e._v("\n            "+e._s(t.message)+"\n          ")])])})),0),e._v(" "),e.page.completed?e._e():n("CustomForm",{attrs:{id:e.page.id,org:e.org},on:{input:function(t){e.form=arguments[0]}},model:{value:e.page.form,callback:function(t){e.$set(e.page,"form",t)},expression:"page.form"}}),e._v(" "),e.page.form.length>0&&!e.page.completed?n("v-btn",{staticStyle:{"margin-left":"0px"},attrs:{color:e.org.base_color,loading:e.sendingForm,dark:""},on:{click:e.sendFormBack}},[e._v("\n        "+e._s(e.$t("buttons.submit"))+"\n      ")]):e._e(),e._v(" "),e.page.completed?n("div",[n("p",[e._v(e._s(e.$t("preboarding.completedForm")))])]):e._e(),e._v(" "),e.pages.length>1?n("div",{staticClass:"text-center mt-2"},[n("v-btn",{staticStyle:{color:"white"},attrs:{color:e.org.base_color},on:{click:e.clickNext}},[e._v("\n          "+e._s(e.$t("buttons.next"))+" ->\n        ")])],1):e._e()],1)],1):e._e()],1)}),[],!1,null,null,null);t.a=component.exports;v()(component,{VBtn:m.a,VCard:_.a,VCardText:y.b,VCardTitle:y.c,VToolbar:x.a})},691:function(e,t,n){"use strict";var r={components:{PreboardingPage:n(678).a},props:{value:{type:Object,required:!0},errors:{type:Object,required:!0},inline:{type:Boolean,default:!1}},data:function(){return{dialog:!1,search:""}},computed:{errorMessages:function(){return JSON.parse(JSON.stringify(this.errors))}},watch:{value:{handler:function(e){this.$emit("input",e)},deep:!0},errors:function(e){"content"in e&&this.$store.dispatch("showSnackbar","Content: "+e.content[0])}}},o=n(23),l=n(24),c=n.n(l),d=n(140),f=n(208),h=n(644),v=n(652),m=n(646),_=n(119),y=n(648),x=n(649),k=n(68),w=n(111),component=Object(o.a)(r,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("v-container",{staticClass:"py-2 px-0"},[n("v-row",[n("v-col",{attrs:{sm:"4"}},[n("v-col",{staticClass:"py-0",attrs:{sm:"12"}},[n("VTextFieldEmoji",{attrs:{label:e.$t("forms.title"),errors:e.errorMessages.name},on:{removeError:function(t){e.errorMessages.name=""}},model:{value:e.value.name,callback:function(t){e.$set(e.value,"name",t)},expression:"value.name"}})],1),e._v(" "),n("v-col",{staticClass:"py-0",attrs:{sm:"12"}},[n("TagsSelector",{staticClass:"pt-2",model:{value:e.value.tags,callback:function(t){e.$set(e.value,"tags",t)},expression:"value.tags"}})],1),e._v(" "),n("v-dialog",{staticClass:"mt-3",attrs:{fullscreen:"","hide-overlay":"",transition:"dialog-bottom-transition"},scopedSlots:e._u([{key:"activator",fn:function(t){var r=t.on;return[n("v-col",{attrs:{sm:"12"}},[n("v-btn",e._g({attrs:{color:"dark",dark:""}},r),[e._v("\n              "+e._s(e.$t("preboarding.previewPage"))+"\n            ")])],1)]}}]),model:{value:e.dialog,callback:function(t){e.dialog=t},expression:"dialog"}},[e._v(" "),n("v-card",[n("v-toolbar",{attrs:{dark:"",color:"dark"}},[n("v-btn",{attrs:{icon:"",dark:""},on:{click:function(t){e.dialog=!1}}},[n("v-icon",[e._v("close")])],1),e._v(" "),n("v-toolbar-title",[e._v(e._s(e.$t("newhires.preview")))]),e._v(" "),n("v-spacer"),e._v(" "),n("v-toolbar-items",[n("v-btn",{attrs:{dark:"",text:""},on:{click:function(t){e.dialog=!1}}},[e._v("\n                Close\n              ")])],1)],1),e._v(" "),n("PreboardingPage",{attrs:{pages:[e.value],"new-hire":e.$store.state.newhires.all[0],org:e.$store.state.org,"disable-mustache":""}})],1)],1)],1),e._v(" "),n("v-col",{attrs:{sm:"8"}},[n("Editor",{ref:"editor",model:{value:e.value.content,callback:function(t){e.$set(e.value,"content",t)},expression:"value.content"}}),e._v(" "),n("CustomForm",{model:{value:e.value.form,callback:function(t){e.$set(e.value,"form",t)},expression:"value.form"}})],1)],1)],1)}),[],!1,null,null,null);t.a=component.exports;c()(component,{VBtn:d.a,VCard:f.a,VCol:h.a,VContainer:v.a,VDialog:m.a,VIcon:_.a,VRow:y.a,VSpacer:x.a,VToolbar:k.a,VToolbarItems:w.a,VToolbarTitle:w.b})},752:function(e,t,n){var content=n(843);"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,n(17).default)("0fdc6e99",content,!0,{sourceMap:!1})},842:function(e,t,n){"use strict";n(752)},843:function(e,t,n){var r=n(16)(!1);r.push([e.i,".border-bottom[data-v-4374cd46]{border-bottom:1px solid #e4e4e4}.second[data-v-4374cd46]{margin-left:10px}.first[data-v-4374cd46]{margin-right:10px}",""]),e.exports=r},913:function(e,t,n){"use strict";n.r(t);n(7);var r={layout:"admin",components:{PreboardingForm:n(691).a},data:function(){return{loading:!0,saving:!1,removing:!1,duplicating:!1,submittingForm:!1,errors:{},employee:{},preboarding:{}}},watch:{$route:function(e,t){this.getPreboarding()}},mounted:function(){this.getPreboarding()},methods:{getPreboarding:function(){var e=this;return this.$preboarding.get(this.$route.params.id).then((function(data){e.preboarding=data})).catch((function(t){e.$store.dispatch("showSnackbar",e.$t("preboarding.couldNotGet"))})).finally((function(){e.loading=!1}))},savePreboarding:function(){var e=this;this.saving=!0,this.$preboarding.update(this.$route.params.id,this.preboarding).then((function(data){e.$router.push({name:"admin-templates-preboarding"}),e.$store.dispatch("showSnackbar",e.$t("preboarding.updated"))})).catch((function(t){e.errors=t})).finally((function(){e.saving=!1}))},duplicatePreboarding:function(){var e=this;this.duplicating=!0,this.$preboarding.update(this.$route.params.id,this.preboarding).then((function(data){e.$preboarding.duplicate(e.$route.params.id).then((function(data){e.$router.push({name:"admin-templates-preboarding"}),e.$store.dispatch("showSnackbar",e.$t("preboarding.savedAndDuplicated"))})).catch((function(t){e.errors=t})).finally((function(){e.duplicating=!1}))}))},removePreboarding:function(){var e=this;this.removing=!0,this.$preboarding.remove(this.$route.params.id).then((function(data){e.$router.push({name:"admin-templates-preboarding"}),e.$store.dispatch("showSnackbar",e.$t("preboarding.removed"))})).catch((function(t){e.errors=t})).finally((function(){e.removing=!1}))}}},o=(n(842),n(23)),l=n(24),c=n.n(l),d=n(140),component=Object(o.a)(r,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("TemplateCompInner",[n("template",{slot:"header"},[n("h1",{staticClass:"heading",staticStyle:{"margin-top":"10px"}},[e._v("\n      "+e._s(e.$t("preboarding.change"))+"\n    ")])]),e._v(" "),n("template",{slot:"header-right"},[n("v-btn",{attrs:{loading:e.duplicating,color:"secondary"},on:{click:e.duplicatePreboarding}},[e._v("\n      "+e._s(e.$t("buttons.duplicate"))+"\n    ")]),e._v(" "),n("v-btn",{staticStyle:{"margin-right":"0px"},attrs:{loading:e.removing,color:"error"},on:{click:e.removePreboarding}},[e._v("\n      "+e._s(e.$t("buttons.remove"))+"\n    ")])],1),e._v(" "),n("template",{slot:"formpart"},[n("LoadingIcon",{attrs:{"is-loading":e.loading}}),e._v(" "),e.loading?e._e():n("div",[n("PreboardingForm",{ref:"form",attrs:{errors:e.errors},model:{value:e.preboarding,callback:function(t){e.preboarding=t},expression:"preboarding"}})],1)],1),e._v(" "),n("template",{slot:"footer"},[n("v-btn",{staticStyle:{float:"right"},attrs:{loading:e.saving,color:"primary"},on:{click:e.savePreboarding}},[e._v("\n      "+e._s(e.$t("buttons.save"))+"\n    ")])],1)],2)}),[],!1,null,"4374cd46",null);t.default=component.exports;c()(component,{VBtn:d.a})}}]);