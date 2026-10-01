'use strict';
const galleryDialog=document.querySelector('.gallery-dialog');
const galleryLinks=[...document.querySelectorAll('.gallery-open')];
let galleryIndex=0;
function showProduction(index){galleryIndex=(index+galleryLinks.length)%galleryLinks.length;const link=galleryLinks[galleryIndex];const img=galleryDialog.querySelector('img');img.src=link.href;img.alt=link.querySelector('img').alt;document.getElementById('gallery-label').textContent=link.querySelector('.gallery-caption').firstChild.textContent;}
galleryLinks.forEach((link,index)=>link.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();showProduction(index);galleryDialog.showModal();}));
galleryDialog.querySelector('.gallery-close').addEventListener('click',()=>galleryDialog.close());
galleryDialog.querySelectorAll('[data-direction]').forEach(button=>button.addEventListener('click',()=>showProduction(galleryIndex+Number(button.dataset.direction))));
galleryDialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();showProduction(galleryIndex+(event.key==='ArrowRight'?1:-1));}});
galleryDialog.addEventListener('click',event=>{if(event.target!==galleryDialog)return;const r=galleryDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)galleryDialog.close();});
