export const STATUSES = ['available', 'pencilled', 'booked', 'enquire'];
const DAY = 86400000;
export function todayLondon() {
  const parts = new Intl.DateTimeFormat('en-GB', {timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const value = type => parts.find(p => p.type === type).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}
export function isoDate(date) { return date.toISOString().slice(0,10); }
export function dateValue(iso) { return new Date(`${iso}T12:00:00Z`); }
export function addDays(iso, days) { return isoDate(new Date(dateValue(iso).getTime()+days*DAY)); }
export function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(dateValue(value).getTime()) && isoDate(dateValue(value)) === value;
}
export function validateAvailability(data) {
  if (!data || data.timezone !== 'Europe/London' || !Array.isArray(data.ranges) || data.ranges.length > 1000) throw new Error('Invalid availability data');
  if (data.updated_at !== null && (typeof data.updated_at !== 'string' || !validDate(data.updated_at.slice(0,10)) || Number.isNaN(Date.parse(data.updated_at)))) throw new Error('Invalid update date');
  if (data.ranges.length && data.updated_at === null) throw new Error('A published schedule needs an update date');
  const ranges = data.ranges.map(range => {
    if (!validDate(range.start) || !validDate(range.end) || range.end < range.start || !STATUSES.includes(range.status)) throw new Error('Invalid date range');
    return {start:range.start,end:range.end,status:range.status};
  });
  return {timezone:'Europe/London',updated_at:data.updated_at,ranges};
}
export async function loadAvailability() {
  const response = await fetch('https://nacho-availability.nuttypony18.chatgpt.site/api/availability', {cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(10000)});
  if (!response.ok) throw new Error('Availability could not be loaded');
  return validateAvailability(await response.json());
}
export function statusFor(data, date) {
  // Later ranges override earlier ones, allowing a pencil to become a booking.
  let status = 'enquire';
  data.ranges.forEach(range => { if (range.start <= date && date <= range.end) status = range.status; });
  return status;
}
export function formatDate(date, lang='en') {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-GB', {day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(dateValue(date));
}
export function datesBetween(start, end) {
  const dates=[];
  for(let date=start;date<=end;date=addDays(date,1)) dates.push(date);
  return dates;
}
const COPY = {
  en:{available:'Available',pencilled:'Pencilled',booked:'Booked',enquire:'Enquire',short:{available:'Free',pencilled:'Pencil',booked:'Booked',enquire:'Ask'},previous:'Previous month',next:'Next month',select:'Select dates to include in your enquiry.',selected:'Selected dates',clear:'Clear selection',email:'Enquire about these dates ↗',empty:'Select one or more dates',updated:'Last updated',unpublished:'Availability has not yet been published. Please enquire about your dates.',failed:'Availability could not be loaded. Please email to confirm your dates.',period:'Next 8 weeks · London dates',note:'Availability is indicative. Dates are confirmed after discussing scope and budget.',weekdays:['Mon','Tue','Wed','Thu','Fri','Sat','Sun']},
  es:{available:'Disponible',pencilled:'En opción',booked:'Reservado',enquire:'Consultar',short:{available:'Libre',pencilled:'Opción',booked:'Ocup.',enquire:'Pedir'},previous:'Mes anterior',next:'Mes siguiente',select:'Selecciona las fechas que quieres incluir en tu consulta.',selected:'Fechas seleccionadas',clear:'Borrar selección',email:'Consultar estas fechas ↗',empty:'Selecciona una o varias fechas',updated:'Última actualización',unpublished:'La disponibilidad aún no está publicada. Consulta tus fechas.',failed:'No se pudo cargar la disponibilidad. Confirma tus fechas por email.',period:'Próximas 8 semanas · Fechas de Londres',note:'Disponibilidad orientativa. Las fechas se confirman tras acordar el alcance y el presupuesto.',weekdays:['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']}
};
export class AvailabilityCalendar {
  constructor(host, data, {days=56,admin=false,onSelect=()=>{},selection=new Set()}={}) {
    this.host=host;this.data=data;this.admin=admin;this.onSelect=onSelect;this.selected=selection;
    this.today=todayLondon();this.last=addDays(this.today,days-1);
    const d=dateValue(this.today);this.firstMonth=d.getUTCFullYear()*12+d.getUTCMonth();this.month=this.firstMonth;
    const last=dateValue(this.last);this.lastMonth=last.getUTCFullYear()*12+last.getUTCMonth();
    host.addEventListener('click', e => {
      const nav=e.target.closest('[data-month-step]');
      if(nav && !nav.disabled){this.month+=Number(nav.dataset.monthStep);this.render();this.host.querySelector(`[data-month-step="${nav.dataset.monthStep}"]`).focus();return;}
      const button=e.target.closest('[data-date]');
      if(!button || button.disabled)return;
      if(!this.admin){this.selected.has(button.dataset.date)?this.selected.delete(button.dataset.date):this.selected.add(button.dataset.date);}
      this.onSelect(button.dataset.date);this.render();this.host.querySelector(`[data-date="${button.dataset.date}"]`)?.focus();
    });
    host.addEventListener('keydown', e => {
      const button=e.target.closest('[data-date]');
      const step={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[e.key];
      if(!button || !step)return;
      let date=addDays(button.dataset.date,step);
      while(date>=this.today&&date<=this.last&&!this.admin&&statusFor(this.data,date)==='booked')date=addDays(date,step);
      if(date<this.today||date>this.last)return;
      e.preventDefault();const d=dateValue(date);this.month=d.getUTCFullYear()*12+d.getUTCMonth();this.render();this.host.querySelector(`[data-date="${date}"]`)?.focus();
    });
    this.render();
  }
  get lang(){return document.documentElement.lang==='es'?'es':'en';}
  get copy(){return COPY[this.lang];}
  setData(data){this.data=data;this.render();}
  setSelection(dates){this.selected=new Set(dates);this.render();}
  render(){
    const text=this.copy,year=Math.floor(this.month/12),month=this.month%12;
    const first=new Date(Date.UTC(year,month,1,12)),offset=(first.getUTCDay()+6)%7;
    const title=new Intl.DateTimeFormat(this.lang==='es'?'es-ES':'en-GB',{month:'long',year:'numeric',timeZone:'UTC'}).format(first);
    this.host.replaceChildren();
    const header=document.createElement('div');header.className='av-month-header';
    const prev=document.createElement('button');prev.type='button';prev.dataset.monthStep='-1';prev.textContent='←';prev.setAttribute('aria-label',text.previous);prev.disabled=this.month===this.firstMonth;
    const heading=document.createElement('h3');heading.textContent=title.charAt(0).toUpperCase()+title.slice(1);heading.setAttribute('aria-live','polite');
    const next=document.createElement('button');next.type='button';next.dataset.monthStep='1';next.textContent='→';next.setAttribute('aria-label',text.next);next.disabled=this.month===this.lastMonth;
    header.append(prev,heading,next);this.host.append(header);
    const weekdays=document.createElement('div');weekdays.className='av-weekdays';weekdays.setAttribute('aria-hidden','true');
    text.weekdays.forEach(day=>{const span=document.createElement('span');span.textContent=day;weekdays.append(span);});this.host.append(weekdays);
    const grid=document.createElement('div');grid.className='av-days';grid.setAttribute('role','group');grid.setAttribute('aria-label',title);
    for(let i=0;i<42;i++){
      const date=new Date(Date.UTC(year,month,1-offset+i,12)),iso=isoDate(date),outside=date.getUTCMonth()!==month||iso<this.today||iso>this.last;
      const status=statusFor(this.data,iso),button=document.createElement('button');button.type='button';button.dataset.date=iso;
      button.className=`av-day av-${status}${outside?' av-outside':''}${this.selected.has(iso)?' av-selected':''}`;
      button.disabled=outside||(!this.admin&&status==='booked');button.setAttribute('aria-pressed',String(this.selected.has(iso)));button.setAttribute('aria-label',`${formatDate(iso,this.lang)} — ${text[status]}`);
      if(iso===this.today)button.setAttribute('aria-current','date');
      const number=document.createElement('span');number.className='av-number';number.textContent=date.getUTCDate();
      const label=document.createElement('span');label.className='av-day-label';label.textContent=outside?'':text.short[status];button.append(number,label);grid.append(button);
    }
    this.host.append(grid);
  }
}
async function initPublicAvailability(host){
  let data,failed=false;
  try{data=await loadAvailability();}catch{data={timezone:'Europe/London',updated_at:null,ranges:[]};failed=true;}
  host.replaceChildren();
  const top=document.createElement('div');top.className='av-intro';
  const heading=document.createElement('h2');heading.setAttribute('data-en','Availability');heading.setAttribute('data-es','Disponibilidad');
  const meta=document.createElement('p');meta.className='av-meta';top.append(heading,meta);
  const layout=document.createElement('div');layout.className='av-layout';
  const calendarHost=document.createElement('div');calendarHost.className='av-calendar';
  const side=document.createElement('div');side.className='av-enquiry';
  const instruction=document.createElement('p');
  const summary=document.createElement('p');summary.className='av-selection';summary.setAttribute('aria-live','polite');
  const email=document.createElement('a');email.className='av-email';
  const clear=document.createElement('button');clear.type='button';clear.className='av-clear';
  const note=document.createElement('p');note.className='av-note';
  const updated=document.createElement('p');updated.className='av-updated';
  side.append(instruction,summary,email,clear,note,updated);layout.append(calendarHost,side);
  const legend=document.createElement('ul');legend.className='av-legend';legend.setAttribute('aria-label','Availability status');
  host.append(top,legend,layout);
  const calendar=new AvailabilityCalendar(calendarHost,data,{onSelect:updateCopy});
  clear.addEventListener('click',()=>{calendar.setSelection([]);updateCopy();});
  function updateCopy(){
    const lang=calendar.lang,text=calendar.copy,dates=[...calendar.selected].sort();
    heading.textContent=lang==='es'?'Disponibilidad':'Availability';meta.textContent=text.period;instruction.textContent=text.select;note.textContent=text.note;
    legend.replaceChildren();STATUSES.forEach(status=>{const li=document.createElement('li');li.className=`av-key av-${status}`;li.textContent=text[status];legend.append(li);});
    summary.textContent=dates.length?`${text.selected}: ${dates.map(d=>formatDate(d,lang)).join(' · ')}`:text.empty;
    email.textContent=text.email;email.setAttribute('aria-disabled',String(!dates.length));email.tabIndex=dates.length?0:-1;
    if(dates.length){const body=lang==='es'?`Hola Nacho,\n\nQuería consultar tu disponibilidad para estas fechas (Europe/London):\n${dates.map(d=>formatDate(d,lang)).join('\n')}\n\nProyecto:\nAlcance y entregas:\nPresupuesto:\n\nGracias.`:`Hi Nacho,\n\nI'd like to enquire about these dates (Europe/London):\n${dates.map(d=>formatDate(d,lang)).join('\n')}\n\nProject:\nScope and deliverables:\nBudget:\n\nThanks.`;
      email.href=`mailto:info4nacho@gmail.com?subject=${encodeURIComponent(lang==='es'?'Consulta de montaje — fechas':'Editing enquiry — dates')}&body=${encodeURIComponent(body)}`;
    }else email.removeAttribute('href');
    clear.textContent=text.clear;clear.disabled=!dates.length;
    updated.textContent=failed?text.failed:data.updated_at?`${text.updated}: ${formatDate(data.updated_at.slice(0,10),lang)}`:text.unpublished;
  }
  new MutationObserver(()=>{calendar.render();updateCopy();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  updateCopy();
}
document.querySelectorAll('[data-public-availability]').forEach(initPublicAvailability);
