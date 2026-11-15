import assert from 'node:assert/strict';
import {visibleProjects, justifiedRows} from '../assets/projects.js';
const cards=[{role:'shoot-edit',name:'shooting'},{role:'editor',name:'editing'},{role:'assistant-editor',name:'assisting'},{role:'editor',name:'second edit'}];
assert.deepEqual(visibleProjects(cards,'editor').map(p=>p.name),['editing','second edit']);
assert.deepEqual(visibleProjects(cards,'shoot-edit').map(p=>p.name),['shooting']);
assert.deepEqual(visibleProjects(cards,'assistant-editor').map(p=>p.name),['assisting']);
assert.deepEqual(visibleProjects(cards,'all',2),cards.slice(0,2));
assert.deepEqual(visibleProjects(cards,'missing'),[]);
assert.deepEqual(visibleProjects(cards,'all'),cards);
console.log('Passed: role distinctions, ordering, complete-card limits and empty filters. Browser layout checks are separate.');

for (const width of [620, 900, 1400]) {
  for (const ratios of [[16/9,9/16,9/16,16/9,9/16], Array(19).fill(9/16), [16/9], []]) {
    const rows = justifiedRows(ratios,width);
    assert.equal(rows.at(-1)?.end || 0,ratios.length);
    let next = 0;
    for (const row of rows) {
      assert.equal(row.start,next);
      assert.ok(row.height > 0);
      const filled = ratios.slice(row.start,row.end).reduce((sum,r) => sum+r*row.height,0)+20*(row.end-row.start-1);
      assert.ok(Math.abs(filled-width)<0.001,'Every row must fill the gallery, including the last');
      next=row.end;
    }
  }
}
console.log('Passed: justified rows retain order and proportions and fill every row.');
