import {AvailabilityCalendar,loadAvailability,validateAvailability,todayLondon,addDays,validDate,datesBetween,formatDate} from './availability.js';
const form=document.getElementById('availabilityForm'),start=document.getElementById('rangeStart'),end=document.getElementById('rangeEnd'),status=document.getElementById('rangeStatus');
const apply=document.getElementById('applyRange'),message=document.getElementById('adminMessage'),list=document.getElementById('rangeList'),reset=document.getElementById('resetDraft'),copy=document.getElementById('copyUpdate'),json=document.getElementById('updateJson'),publishMessage=document.getElementById('publishMessage');
const names={available:'Available',pencilled:'Pencilled',booked:'Booked',enquire:'Enquire'};
let published,draft,calendar,anchor=null;
const today=todayLondon(),last=addDays(today,364);
[start,end].forEach(input=>{input.min=today;input.max=last;});
const clone=value=>JSON.parse(JSON.stringify(value));
function renderDraft(){
  calendar.setData(draft);list.replaceChildren();
  if(!draft.ranges.length){const li=document.createElement('li');li.textContent='No date ranges set. Clients will be asked to enquire.';list.append(li);}
  draft.ranges.forEach((range,index)=>{
    const li=document.createElement('li'),label=document.createElement('span'),state=document.createElement('span'),remove=document.createElement('button');
    label.textContent=`${formatDate(range.start)} – ${formatDate(range.end)}`;state.className='admin-range-status';state.textContent=names[range.status];label.append(state);
    remove.type='button';remove.textContent='Remove';remove.setAttribute('aria-label',`Remove ${names[range.status]} range ${range.start} to ${range.end}`);
    remove.addEventListener('click',()=>{draft.ranges.splice(index,1);draft.updated_at=new Date().toISOString();renderDraft();message.textContent='Range removed from draft. Publish to update the website.';});
    li.append(label,remove);list.append(li);
  });
  const dirty=JSON.stringify(draft)!==JSON.stringify(published);copy.disabled=!dirty;reset.disabled=!dirty;json.value=JSON.stringify(draft,null,2)+'\n';publishMessage.textContent='';
}
function selectRange(){
  if(validDate(start.value)&&validDate(end.value)&&start.value<=end.value&&start.value>=today&&end.value<=last)calendar.setSelection(datesBetween(start.value,end.value));
}
[start,end].forEach(input=>input.addEventListener('change',()=>{anchor=null;selectRange();}));
form.addEventListener('submit',event=>{
  event.preventDefault();if(!draft)return;
  if(!validDate(start.value)||!validDate(end.value)||start.value>end.value||start.value<today||end.value>last){message.textContent='Choose a valid start and end date within the next 12 months.';return;}
  if(draft.ranges.length>=1000){message.textContent='Remove old ranges before adding more.';return;}
  draft.ranges.push({start:start.value,end:end.value,status:status.value});draft.updated_at=new Date().toISOString();anchor=null;renderDraft();selectRange();
  message.textContent=`${names[status.value]} applied to the draft. Publish below to make it live.`;
});
reset.addEventListener('click',()=>{draft=clone(published);anchor=null;calendar.setSelection([]);start.value='';end.value='';renderDraft();message.textContent='Draft discarded. Showing the published schedule.';});
copy.addEventListener('click',async()=>{
  publishMessage.textContent='Checking for newer changes…';
  try{
    const latest=await loadAvailability();
    if(JSON.stringify(latest)!==JSON.stringify(published)){publishMessage.textContent='The published schedule changed while this editor was open. Reload the page before publishing to avoid overwriting newer changes.';return;}
  }catch{publishMessage.textContent='Could not check the published schedule. Try again before publishing.';return;}
  const payload=JSON.stringify(validateAvailability(draft),null,2)+'\n';json.value=payload;
  try{await navigator.clipboard.writeText(payload);publishMessage.textContent='Copied. Open the GitHub editor, replace the file contents and commit to main.';}
  catch{document.getElementById('updateDetails').open=true;json.focus();json.select();publishMessage.textContent='Copy the selected update text, then paste it into the GitHub editor.';}
});
try{
  published=await loadAvailability();draft=clone(published);
  calendar=new AvailabilityCalendar(document.getElementById('adminCalendar'),draft,{days:365,admin:true,onSelect(date){
    if(anchor===null){anchor=date;start.value=date;end.value=date;}else{start.value=anchor<date?anchor:date;end.value=anchor<date?date:anchor;anchor=null;}
    selectRange();
  }});
  apply.disabled=false;document.getElementById('adminLoadStatus').textContent=published.updated_at?`Published schedule last updated ${formatDate(published.updated_at.slice(0,10))}.`:'No availability has been published yet. Set your dates below.';
  renderDraft();
}catch{document.getElementById('adminLoadStatus').textContent='The published schedule could not be loaded. Reload before editing; publishing is disabled.';}
