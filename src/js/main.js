import { products } from '../data/products.js';

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const money = n => n === 0 ? 'Free' : `$${n}`;
const artClass = n => `art-${n}`;
let filters = {search:'',category:'',genre:'',max:null,free:false,sort:'featured'};
let cart = loadCart();
let lastFocus = null;
let toastTimer;

function loadCart(){try{const saved=JSON.parse(localStorage.getItem('sd-cart')||'[]');return Array.isArray(saved)?saved.filter(x=>products.some(p=>p.id===x)):[]}catch{return []}}
function saveCart(){localStorage.setItem('sd-cart',JSON.stringify(cart));renderCart()}
function categories(){return [...new Set(products.map(p=>p.category))]}
function renderFilters(){
  $('#category-filter').innerHTML='<option value="">All categories</option>'+categories().map(x=>`<option>${x}</option>`).join('');
  $('#genre-filter').innerHTML='<option value="">All moods</option>'+[...new Set(products.map(p=>p.genre))].sort().map(x=>`<option>${x}</option>`).join('');
  const quick=['All sounds','Sample Packs','Drum Kits','Presets','MIDI Packs','Free Downloads'];
  $('#category-chips').innerHTML=quick.map((label,i)=>`<button class="chip ${i===0?'active':''}" data-chip="${i===0?'':label==='Presets'?'Presets':label}">${label}</button>`).join('');
}
function filteredProducts(){let list=products.filter(p=>{
  const q=filters.search.toLowerCase();
  return (!q||`${p.name} ${p.description} ${p.category} ${p.genre} ${p.tags.join(' ')}`.toLowerCase().includes(q))&&(!filters.category||p.category===filters.category||filters.category==='Presets'&&p.category==='Presets')&&(!filters.genre||p.genre===filters.genre)&&(filters.max===null||p.price<=filters.max)&&(!filters.free||p.price===0);
});
  if(filters.sort==='newest')list.sort((a,b)=>b.year-a.year||a.name.localeCompare(b.name));
  if(filters.sort==='low')list.sort((a,b)=>a.price-b.price);
  if(filters.sort==='high')list.sort((a,b)=>b.price-a.price);
  if(filters.sort==='featured')list.sort((a,b)=>Number(b.featured)-Number(a.featured));
  return list;
}
function renderProducts(){
 const list=filteredProducts();$('#result-count').textContent=list.length;$('#product-grid').innerHTML=list.map(p=>{
  const coverTitle=p.name==='Field Notes Vol. 02'?'FIELD<br>NOTES':p.name==='Good Company'?'GOOD<br>COMPANY':p.name==='Signal Starter Kit'?'SIGNAL<br>STARTER':p.name.toUpperCase().replace(' ','<br>');
  const inCart=cart.includes(p.id);
  return `<article class="product-card"><div class="product-cover ${artClass(p.art)}" role="img" aria-label="Original abstract cover art for ${p.name}"><div class="cover-shape"></div><div class="cover-meta"><span>SD—${String(p.art).padStart(3,'0')}</span><span>${p.genre.toUpperCase()}</span></div><div class="cover-title">${coverTitle}<small>${p.category.toUpperCase()}</small></div>${p.badge?`<span class="product-badge">${p.badge}</span>`:''}<button class="preview-btn" data-preview="${p.id}" aria-label="Preview ${p.name}">▶</button></div><div class="product-card-info"><div class="card-top"><a href="#product-${p.id}" class="card-title" data-details="${p.id}">${p.name}</a><span class="card-price">${money(p.price)}${p.oldPrice?` <s>${money(p.oldPrice)}</s>`:''}</span></div><p class="card-desc">${p.description}</p><div class="card-tags">${p.tags.slice(0,3).map(t=>`<span class="tag">${t}</span>`).join('')}</div><div class="card-actions"><button class="add-btn" data-add="${p.id}">${inCart?'In your bag ✓':p.price===0?'Get for free':'Add to bag'}</button><button class="details-btn" data-details="${p.id}">Details ↗</button></div><div class="card-preview-status" id="preview-status-${p.id}"></div></div></article>`;
 }).join('');$('#empty-state').hidden=!!list.length;$('#product-grid').hidden=!list.length;
}
function renderCart(){
 const items=cart.map(id=>products.find(p=>p.id===id)).filter(Boolean);
 const count=items.length;$$('.cart-count').forEach(el=>el.textContent=count);
 $('#cart-empty').hidden=count>0;$('#cart-summary').hidden=count===0;
 $('#cart-items').innerHTML=items.map(p=>`<div class="cart-item"><div class="mini-cover ${p.id==='signal-starter'?'cover-green':`art-${p.art}`}" aria-hidden="true"><span>${p.name.toUpperCase().split(' ').slice(0,2).join('<br>')}</span></div><div><b>${p.name}</b><small>Digital product · ${p.format}</small><button class="remove-item" data-remove="${p.id}">Remove</button></div><span class="cart-item-price">${money(p.price)}</span></div>`).join('');
 const sum=items.reduce((n,p)=>n+p.price,0);$('#cart-subtotal').textContent=money(sum);
}
function showToast(message){const el=$('.toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600)}
function openPanel(el){lastFocus=document.activeElement;$('.overlay').classList.add('open');el.classList.add('open');el.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';const focusable=el.querySelector('button,a,input');focusable?.focus()}
function closePanels(){const active=$('.cart-drawer.open,.modal.open');if(!active)return;$('.overlay').classList.remove('open');$$('.cart-drawer,.modal').forEach(el=>{el.classList.remove('open');el.setAttribute('aria-hidden','true')});document.body.style.overflow='';lastFocus?.focus()}
function openCart(){closeMenu();openPanel($('#cart-drawer'))}
function addToCart(id){if(cart.includes(id)){showToast('This digital item is already in your bag.');openCart();return}cart.push(id);saveCart();showToast('Added to your bag.');openCart()}
function renderDetails(id){const p=products.find(x=>x.id===id);if(!p)return;$('#modal-content').innerHTML=`<div class="product-detail"><div class="detail-art ${artClass(p.art)}"><span>${p.name.toUpperCase()}</span></div><div class="detail-info"><div class="eyebrow">${p.category.toUpperCase()} / ${p.genre.toUpperCase()}</div><h2>${p.name}</h2><p>${p.description} This is an original demo listing created for the Signal Dept. storefront concept.</p><div class="detail-price">${money(p.price)} ${p.oldPrice?`<s>${money(p.oldPrice)}</s>`:''}</div><button class="btn btn-dark" data-add="${p.id}">${cart.includes(p.id)?'In your bag ✓':p.price===0?'Get for free':'Add to bag'} <span>↗</span></button><div class="preview-row"><button data-preview="${p.id}" aria-label="Preview ${p.name}">▶</button><span>Audio preview</span><span class="preview-detail-status" style="margin-left:auto;color:var(--muted)">No demo audio file available</span></div><div class="detail-specs"><div><span>Included</span><b>${p.count}</b></div><div><span>Format</span><b>${p.format}</b></div><div><span>Download size</span><b>${p.size}</b></div><div><span>Works with</span><b>${p.software}</b></div></div><div class="card-tags">${p.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div></div></div>`;openPanel($('#product-modal'))}
function startCheckout(){if(!cart.length)return;const items=cart.map(id=>products.find(p=>p.id===id));$('#checkout-order').innerHTML=items.map(p=>`<div><span>${p.name}</span><span>${money(p.price)}</span></div>`).join('')+`<div class="order-total"><span>Demo total</span><b>${money(items.reduce((s,p)=>s+p.price,0))}</b></div>`;closePanels();setTimeout(()=>openPanel($('#checkout-modal')),60)}
function closeMenu(){const menu=$('.mobile-menu');menu.classList.remove('open');menu.setAttribute('aria-hidden','true');$('.menu-toggle').setAttribute('aria-expanded','false')}
function setTheme(theme){document.body.dataset.theme=theme;localStorage.setItem('sd-theme',theme);document.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#11120f':'#f4f3ee'}
function initTheme(){const saved=localStorage.getItem('sd-theme');setTheme(saved|| (matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'))}
function applyFilters(){filters.search=$('#search').value.trim();filters.category=$('#category-filter').value;filters.genre=$('#genre-filter').value;filters.max=$('#max-price').value===''?null:Number($('#max-price').value);filters.free=$('#free-filter').checked;filters.sort=$('#sort').value;$$('.chip').forEach(chip=>chip.classList.toggle('active',chip.dataset.chip===filters.category));renderProducts()}
function clearFilters(){filters={search:'',category:'',genre:'',max:null,free:false,sort:'featured'};$('#search').value='';$('#category-filter').value='';$('#genre-filter').value='';$('#max-price').value='';$('#free-filter').checked=false;$('#sort').value='featured';applyFilters()}

renderFilters();initTheme();renderProducts();renderCart();
$('#search').addEventListener('input',applyFilters);['category-filter','genre-filter','max-price','free-filter','sort'].forEach(id=>$('#'+id).addEventListener('input',applyFilters));
$('#category-chips').addEventListener('click',e=>{const chip=e.target.closest('[data-chip]');if(!chip)return;$('#category-filter').value=chip.dataset.chip;applyFilters()});
$('#clear-filters').addEventListener('click',clearFilters);$('#empty-clear').addEventListener('click',clearFilters);
document.addEventListener('click',e=>{
 const libraryLink=e.target.closest('a[href="#library"]');if(libraryLink){e.preventDefault();closeMenu();openPanel($('#library-modal'));return}
 const add=e.target.closest('[data-add]');if(add){e.preventDefault();if($('#product-modal').classList.contains('open'))closePanels();addToCart(add.dataset.add);return}
 const detail=e.target.closest('[data-details]');if(detail){e.preventDefault();renderDetails(detail.dataset.details);return}
 const preview=e.target.closest('[data-preview]');if(preview){const p=products.find(x=>x.id===preview.dataset.preview);const msg=`Preview unavailable for ${p.name} — no audio demo file is bundled.`;const status=$(`#preview-status-${p.id}`);if(status)status.textContent=msg;const detailStatus=$('.preview-detail-status');if(detailStatus)detailStatus.textContent='No demo audio file available';showToast('Preview unavailable — no audio file is bundled.');return}
 const remove=e.target.closest('[data-remove]');if(remove){cart=cart.filter(id=>id!==remove.dataset.remove);saveCart();return}
 const cat=e.target.closest('[data-category-link]');if(cat){const category=cat.dataset.categoryLink;setTimeout(()=>{$('#category-filter').value=category;applyFilters()},0);return}
 if(e.target.closest('[data-free-cta]')){setTimeout(()=>{clearFilters();$('#free-filter').checked=true;applyFilters()},0);return}
});
$('.cart-trigger').addEventListener('click',openCart);$('.close-drawer').addEventListener('click',closePanels);$('.overlay').addEventListener('click',closePanels);$$('.modal-close').forEach(b=>b.addEventListener('click',closePanels));$$('.close-cart-link').forEach(a=>a.addEventListener('click',closePanels));$('.checkout-trigger').addEventListener('click',startCheckout);
$('#checkout-form').addEventListener('submit',e=>{e.preventDefault();cart=[];saveCart();closePanels();e.target.reset();showToast('Demo order complete. No payment was processed.');});
$('#newsletter-form').addEventListener('submit',e=>{e.preventDefault();$('#newsletter-message').textContent='Thanks for joining. This demo form does not save or send your email.';e.target.reset()});
$('.theme-toggle').addEventListener('click',()=>setTheme(document.body.dataset.theme==='dark'?'light':'dark'));
$('.menu-toggle').addEventListener('click',()=>{const menu=$('.mobile-menu');const open=!menu.classList.contains('open');menu.classList.toggle('open',open);menu.setAttribute('aria-hidden',String(!open));$('.menu-toggle').setAttribute('aria-expanded',String(open))});$$('.mobile-menu a').forEach(a=>a.addEventListener('click',closeMenu));
$$('[data-search-focus]').forEach(b=>b.addEventListener('click',()=>{$('#search').focus();$('#store').scrollIntoView({behavior:'smooth'})}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closePanels();closeMenu()}if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();$('#search').focus();$('#store').scrollIntoView({behavior:'smooth'})}});
