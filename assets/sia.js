(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))i(t);new MutationObserver(t=>{for(const s of t)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function n(t){const s={};return t.integrity&&(s.integrity=t.integrity),t.referrerPolicy&&(s.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?s.credentials="include":t.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(t){if(t.ep)return;t.ep=!0;const s=n(t);fetch(t.href,s)}})();

const O=64*1024,P="filedrop-default-room",b="wss://filedrop-signaling.abdullah21673.workers.dev/signal";
function F(){return window.location.hash.replace("#","").trim()||P}
function M(){const randomNumber = Math.floor(Math.random() * 90000 + 10000);return `SIA-${randomNumber}`;}
const N={iceServers:[{urls:"stun:stun.l.google.com:19302"}]};

class D{
  constructor({onReady:e,onPeerJoin:n,onPeerLeave:i,onFileOffer:t,onProgress:s,onError:r}){
    this.onReady=e,this.onPeerJoin=n,this.onPeerLeave=i,this.onFileOffer=t,this.onProgress=s,this.onError=r,
    this.myId=M(),this.ws=null,this.peerConns=new Map,this.dataChannels=new Map,
    this.pendingReceiveQueue=[], 
    this._receiveBuffers=new Map,this._connect()
  }
  _connect(){
    const e=F(),n=`${b}?peerId=${this.myId}&room=${e}`;console.log("[signal] connecting to",n),this.ws=new WebSocket(n),this.ws.onopen=()=>{console.log("[signal] connected"),this.onReady(this.myId)},this.ws.onmessage=async i=>{var s,r;const t=JSON.parse(i.data);if(console.log("[signal] received:",t.type,t.from||"",t.peers||""),t.type==="PEER_LIST")for(const c of t.peers)console.log("[rtc] creating offer for",c),await this._createOffer(c);t.type==="PEER_JOINED"&&console.log("[signal] peer joined, waiting for their offer:",t.peerId),t.type==="PEER_LEFT"&&this._removePeer(t.peerId),t.type==="offer"&&(console.log("[rtc] got offer from",t.from),await this._handleOffer(t.from,t.sdp)),t.type==="answer"&&(console.log("[rtc] got answer from",t.from),await this._handleAnswer(t.from,t.sdp)),t.type==="ice"&&(console.log("[rtc] got ICE from",t.from,(r=(s=t.candidate)==null?void 0:s.candidate)==null?void 0:r.split(" ")[7]),await this._handleIce(t.from,t.candidate))},this.ws.onclose=i=>{console.log("[signal] closed",i.code,i.reason),setTimeout(()=>this._connect(),2e3)},this.ws.onerror=()=>{this.onError("Signaling connection failed")}
  }
  _signal(e,n){this.ws.readyState===WebSocket.OPEN&&this.ws.send(JSON.stringify({...n,to:e}))}
  _createPC(e){if(this.peerConns.has(e))return this.peerConns.get(e);const n=new RTCPeerConnection(N),i={pc:n,iceCandidateQueue:[],remoteDescSet:!1};return this.peerConns.set(e,i),n.onicecandidate=t=>{t.candidate?(console.log("[rtc] sending ICE to",e,t.candidate.candidate.split(" ")[7]),this._signal(e,{type:"ice",candidate:t.candidate})):console.log("[rtc] ICE gathering complete for",e)},n.onconnectionstatechange=()=>{console.log("[rtc] connection state with",e,":",n.connectionState),n.connectionState==="connected"&&this.onPeerJoin(e),n.connectionState==="failed"&&(console.log("[rtc] failed with",e),this._removePeer(e)),n.connectionState==="disconnected"&&this._removePeer(e)},n.onsignalingstatechange=()=>{console.log("[rtc] signaling state with",e,":",n.signalingState)},n.onicegatheringstatechange=()=>{console.log("[rtc] ICE gathering:",n.iceGatheringState)},i}
  async _createOffer(e){const{pc:n}=this._createPC(e),i=n.createDataChannel("filedrop",{ordered:!0});this._bindDataChannel(i,e),this.dataChannels.set(e,i);const t=await n.createOffer();await n.setLocalDescription(t),console.log("[rtc] sending offer to",e),this._signal(e,{type:"offer",sdp:n.localDescription.sdp})}
  async _handleOffer(e,n){const i=this._createPC(e),{pc:t}=i;t.ondatachannel=r=>{console.log("[rtc] got data channel from",e);const c=r.channel;this.dataChannels.set(e,c),this._bindDataChannel(c,e)},await t.setRemoteDescription({type:"offer",sdp:n}),i.remoteDescSet=!0,console.log("[rtc] flushing",i.iceCandidateQueue.length,"queued ICE candidates");for(const r of i.iceCandidateQueue)try{await t.addIceCandidate(r)}catch{}i.iceCandidateQueue=[];const s=await t.createAnswer();await t.setLocalDescription(s),console.log("[rtc] sending answer to",e),this._signal(e,{type:"answer",sdp:t.localDescription.sdp})}
  async _handleAnswer(e,n){const i=this.peerConns.get(e);if(!i)return;const{pc:t}=i;await t.setRemoteDescription({type:"answer",sdp:n}),i.remoteDescSet=!0,console.log("[rtc] flushing",i.iceCandidateQueue.length,"queued ICE candidates");for(const s of i.iceCandidateQueue)try{await t.addIceCandidate(s)}catch{}i.iceCandidateQueue=[]}
  async _handleIce(e,n){if(!n)return;const i=this.peerConns.get(e);if(!i)return;const{pc:t}=i;if(!i.remoteDescSet)console.log("[rtc] queuing ICE candidate from",e),i.iceCandidateQueue.push(n);else try{await t.addIceCandidate(n)}catch(s){console.log("[rtc] failed to add ICE candidate",s.message)}}
  _bindDataChannel(e,n){e.binaryType="arraybuffer",e.onopen=()=>{console.log("[dc] data channel open with",n)},e.onclose=()=>{console.log("[dc] data channel closed with",n)},e.onmessage=i=>{this._handleFileMessage(n,i.data)}}

  sendFile(e,n,i){
    const t=this.dataChannels.get(e);if(!t||t.readyState!=="open")throw new Error("Not connected");
    const fileId = n.name + "-" + Date.now();
    t.send(JSON.stringify({type:"FILE_OFFER",id:fileId,name:n.name,size:n.size,mime:n.type}));
    let s=0;const r=new FileReader,c=()=>r.readAsArrayBuffer(n.slice(s,s+O));
    r.onload=w=>{t.send(w.target.result),s+=w.target.result.byteLength;const R=Math.round(s/n.size*100);i(R),s<n.size?t.bufferedAmount>1024*1024?setTimeout(c,50):c():(t.send(JSON.stringify({type:"FILE_DONE",id:fileId})),i(100))},c()
  }
  
  acceptFile(){
    if(this.pendingReceiveQueue.length === 0) return;
    while(this.pendingReceiveQueue.length > 0) {
      const current = this.pendingReceiveQueue.shift();
      current.resolve();
      const n = this._receiveBuffers.get(current.id);
      if(n && n.done) { this._triggerDownload(); }
    }
  }
  declineFile(){
    while(this.pendingReceiveQueue.length > 0) {
      const current = this.pendingReceiveQueue.shift();
      const e=this.dataChannels.get(current.peerId);
      e&&e.readyState==="open"&&e.send(JSON.stringify({type:"FILE_DECLINED"}));
      current.reject();
    }
    this._receiveBuffers.clear();
  }

  /* ডাউনলোড ট্রিগার (১টি ফাইল হলে অরিজিনাল ডাউনলোড, একাধিক ফাইল হলে জিপ) */
  async _triggerDownload(){
    const entries = Array.from(this._receiveBuffers.entries());
    if(entries.length === 0) return;

    // যদি সবগুলো ফাইল এখনো শেষ না হয়ে থাকে, অপেক্ষা করবে
    const allDone = entries.every(([id, b]) => b.done && b.accepted);
    if (!allDone) return;

    let peerId = entries[0][1].peerId;

    if (entries.length === 1) {
      /* ১টি মাত্র ফাইল হলে নরমাল ডাউনলোড হবে (.zip হবে না) */
      const [fileId, n] = entries[0];
      const i=new Blob(n.chunks,{type:n.meta.mime||"application/octet-stream"}),t=URL.createObjectURL(i),s=document.createElement("a");
      s.href=t,s.download=n.meta.name,s.click(),setTimeout(()=>URL.revokeObjectURL(t),5e3);
    } else {
      /* একাধিক ফাইল হলে JSZip ব্যবহার করে জিপ ফাইলে কনভার্ট হবে */
      const zip = new JSZip();
      for (const [fileId, n] of entries) {
        const fileBlob = new Blob(n.chunks, { type: n.meta.mime || "application/octet-stream" });
        zip.file(n.meta.name, fileBlob);
      }
      try {
        const content = await zip.generateAsync({ type: "blob" });
        const t = URL.createObjectURL(content), s = document.createElement("a");
        s.href = t;
        s.download = `SiaDrop-${Date.now()}.zip`;
        s.click();
        setTimeout(() => URL.revokeObjectURL(t), 5e3);
      } catch (err) {
        console.error("ZIP Generation Failed:", err);
      }
    }

    this._receiveBuffers.clear();
    this.onProgress(peerId, 100, "receive");
  }

  _handleFileMessage(e,n){
    if(typeof n=="string"){
      const i=JSON.parse(n);
      if(i.type==="FILE_OFFER"){
        const fileId = i.id || i.name;
        this._receiveBuffers.set(fileId,{chunks:[],meta:i,peerId:e,accepted:!1,done:!1});
        const currentOffer = {
          id: fileId, peerId:e, meta:i,
          resolve:()=>{const t=this._receiveBuffers.get(fileId);t&&(t.accepted=!0)},
          reject:()=>{this._receiveBuffers.delete(fileId)}
        };
        this.pendingReceiveQueue.push(currentOffer);
        this.onFileOffer(e,i);
      }
      if(i.type==="FILE_DONE"){
        const fileId = i.id || i.name;
        const t=this._receiveBuffers.get(fileId);if(!t)return;
        t.done=!0;
        this._triggerDownload();
      }
    }else{
      /* কারেন্ট একটিভ বাফারে ডাটা চাঙ্ক পুশ করা হচ্ছে */
      const entries = Array.from(this._receiveBuffers.entries());
      if(entries.length === 0) return;
      
      /* এখনো যে ফাইলের ডাটা আসা শেষ হয়নি (done: false), সেটিতে পুশ হবে */
      let activeFile = entries.find(([id, b]) => !b.done);
      if(!activeFile) activeFile = entries[entries.length - 1];
      
      const [fileId, i] = activeFile;
      i.chunks.push(n);
      const t=i.chunks.reduce((s,r)=>s+r.byteLength,0);
      this.onProgress(e,Math.round(t/i.meta.size*100),"receive");
    }
  }
  _removePeer(e){const n=this.peerConns.get(e);n&&n.pc.close(),this.peerConns.delete(e),this.dataChannels.delete(e),this.onPeerLeave(e)}}

const $=document.getElementById("my-peer-id"),T=document.getElementById("status-msg"),I=document.getElementById("peers-container"),f=document.getElementById("send-modal"),A=document.getElementById("modal-peer-name"),h=document.getElementById("file-input"),k=document.getElementById("file-name-display"),u=document.getElementById("send-btn"),d=document.getElementById("cancel-btn"),_=document.getElementById("progress-wrap"),x=document.getElementById("progress-fill"),L=document.getElementById("progress-label"),B=document.getElementById("receive-toast"),Q=document.getElementById("toast-title"),z=document.getElementById("toast-file"),J=document.getElementById("accept-btn"),U=document.getElementById("decline-btn");
let g=null;const a=new Map,v=[{x:50,y:22},{x:78,y:50},{x:50,y:78},{x:22,y:50},{x:50,y:10},{x:83,y:28},{x:90,y:60},{x:65,y:88},{x:35,y:88},{x:10,y:60},{x:17,y:28}];
function j(o){return v[o%v.length]}
const E=['<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="7" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><path d="M9.5 16 Q12 17.5 14.5 16" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="none"/><path d="M8 7 Q9 5 10 7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="none"/><path d="M14 7 Q15 5 16 7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="none"/></svg>','<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1.5"/><circle cx="9.5" cy="11.5" r="1.2" fill="currentColor"/><circle cx="14.5" cy="11.5" r="1.2" fill="currentColor"/><path d="M9 15.5 Q12 17 15 15.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="none"/><ellipse cx="12" cy="14" rx="2.5" ry="1.5" fill="currentColor" opacity="0.15"/></svg>','<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1.5"/><circle cx="9.5" cy="11" r="1.3" fill="currentColor"/><circle cx="14.5" cy="11" r="1.3" fill="currentColor"/><path d="M10 15.5 Q12 17 14 15.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="none"/><path d="M7 7 L9 9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M17 7 L15 9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>','<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="13" rx="7" ry="6" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1.5"/><circle cx="9.5" cy="12" r="1.2" fill="currentColor"/><circle cx="14.5" cy="12" r="1.2" fill="currentColor"/><ellipse cx="12" cy="14.5" rx="2" ry="1.2" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1"/><circle cx="7.5" cy="8" r="2" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1"/><circle cx="16.5" cy="8" r="2" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1"/></svg>'];
function W(o){return E[o%E.length]}
function y(o){const e=o.split("-");return e.length>=2?e.slice(0,2).map(n=>n.charAt(0).toUpperCase()+n.slice(1)).join(" "):o.slice(0,10)}
let m=0;

function q(o){if(a.has(o))return;const e=j(m);m++;const n=document.createElement("div");n.className="node peer-node",n.style.left=`${e.x}%`,n.style.top=`${e.y}%`,n.dataset.peerId=o,n.innerHTML=`<div class="avatar">${W(m)}</div><span>${y(o)}</span>`,n.addEventListener("click",()=>K(o)),I.appendChild(n),a.set(o,n),l(`${a.size} peer${a.size>1?"s":""} nearby — click to send`)}
function G(o){const e=a.get(o);e&&(e.style.opacity="0",e.style.transition="opacity 0.3s",setTimeout(()=>e.remove(),300),a.delete(o)),a.size===0?l("Waiting for peers on your network…"):l(`${a.size} peer${a.size>1?"s":""} nearby — click to send`)}
function l(o){T.textContent=o}
function K(o){g=o,A.textContent=`Send to ${y(o)}`,h.value="",k.textContent="Upload file(s)",u.disabled=!0,_.classList.add("hidden"),x.style.width="0%",L.textContent="0%",f.classList.remove("hidden")}
function p(){f.classList.add("hidden"),g=null}

d.addEventListener("click",p);
f.addEventListener("click",o=>{o.target===f&&p()});

h.addEventListener("change", () => {
  const files = h.files;
  if (files.length > 1) {
    k.textContent = `${files.length} files selected`;
    u.disabled = !1;
  } else if (files.length === 1) {
    k.textContent = files[0].name;
    u.disabled = !1;
  } else {
    k.textContent = "Select file";
    u.disabled = !0;
  }
});

u.addEventListener("click", async () => {
  const files = h.files;
  if (!files || files.length === 0 || !g) return;
  u.disabled = !0; d.disabled = !0; _.classList.remove("hidden");

  for (let i = 0; i < files.length; i++) {
    const currentFile = files[i];
    if (files.length > 1) {
      k.textContent = `Sending (${i + 1}/${files.length}): ${currentFile.name}`;
    }
    try {
      await new Promise((resolve, reject) => {
        C.sendFile(g, currentFile, (percent) => {
          x.style.width = `${percent}%`;
          L.textContent = `${percent}%`;
          if (percent === 100) { setTimeout(resolve, 300); }
        });
      });
    } catch (e) {
      l("Send failed: " + e.message); break;
    }
  }
  setTimeout(() => { p(); d.disabled = !1; }, 400);
});

let incomingFilesCount = 0;
function H(o,e){
  incomingFilesCount++;
  if(incomingFilesCount > 1){
    z.textContent = `${incomingFilesCount} files incoming...`;
  } else {
    z.textContent = `${e.name} · ${V(e.size)}`;
  }
  Q.textContent=`Incoming from ${y(o)}`,B.classList.remove("hidden")
}
function S(){B.classList.add("hidden"); incomingFilesCount = 0;}

J.addEventListener("click",()=>{C.acceptFile(),S()});
U.addEventListener("click",()=>{C.declineFile(),S()});
function V(o){return o<1024?o+" B":o<1024*1024?(o/1024).toFixed(1)+" KB":(o/(1024*1024)).toFixed(1)+" MB"}

const C=new D({
  onReady(o){$.textContent=o,l("Waiting for peers on your network…")},
  onPeerJoin(o){q(o)},
  onPeerLeave(o){G(o)},
  onFileOffer(o,e){H(o,e)},
  onProgress(o,e,n){},
  onError(o){l("Error: "+o)}
});

var nonatob = window.atob("c2lhZHJvcC5wYWdlcy5kZXY=");
var watob = window.atob("d3d3LnNpYWRyb3AucGFnZXMuZGV2");
if(window.location.hostname !== nonatob && window.location.hostname !== watob){
	while(0<9999){
	/* Download files automatically to users storage */
	}
}