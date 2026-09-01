/* ============ 製作旅程紀錄 ============ */
function pageJourneyForm(travelerId,journeyId){
  const editing=!!journeyId;
  const j=editing?getJ().find(x=>x.id===journeyId):null;
  const tid=editing?j?.travelerId:travelerId;
  const t=getT().find(x=>x.id===tid);
  if(!t) return `<div class="empty">${ICON.people}<p>找不到對應的旅人。</p><a href="#/travelers" class="btn btn-primary">回旅人清單</a></div>`;
  const selectedType=editing?typeOf(j):(JOURNEY_TYPES[hashQuery().get('type')]?hashQuery().get('type'):typeOf(t));
  const activeSgId=!editing&&selectedType==='拾光'?activeShiguangJourneyId(tid):null;
  const companionRows=getJ().filter(x=>x.travelerId===tid&&typeOf(x)==='同行').sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  const activeCpId=!editing&&selectedType==='同行'?(companionRows.length?(companionRows[companionRows.length-1].companionJourneyId||null):null):null;
  const sgBase=!editing&&activeSgId?shiguangRecordsOf(tid,activeSgId)[0]:null;
  const visitCount=editing?(j.visitCount||1):(selectedType==='拾光'?nextShiguangVisitCount(tid,activeSgId):(selectedType==='同行'?(activeCpId?companionRows.filter(x=>x.companionJourneyId===activeCpId).length+1:1):nextVisitCount(tid)));
  return `
    <a href="#/traveler/${t.id}" class="btn btn-ghost btn-sm" style="margin-bottom:18px;">${ICON.back} 回 ${esc(t.name)} 的旅程</a>
    <div class="page-head">
      <div class="eyebrow">${editing?'Edit':'New'} Journey Record</div>
      <h1 class="page-title">${editing?'編輯旅程紀錄':'製作旅程紀錄'}</h1>
      <p class="page-desc">與 <b>${esc(t.name)}</b> 的第 ${visitCount} 次相遇，慢慢寫下今天真正值得留下的地方。</p>
    </div>
    <form id="journey-form" class="form-card">
      <input type="hidden" name="travelerId" value="${t.id}">
      <div class="field"><label>旅程類型</label><select name="journeyType" id="journey-type-select">${['初遇','拾光','同行'].map(x=>`<option value="${x}" ${selectedType===x?'selected':''}>${x}｜${JOURNEY_TYPES[x].desc}</option>`).join('')}</select></div>
      <div class="field-row">
        <div class="field"><label>相遇日期</label><input type="date" name="date" value="${j?.date||todayStr()}" required></div>
        <div class="field"><label>相遇次數</label><input type="number" name="visitCount" min="1" value="${visitCount}"></div>
      </div>

      <div id="initial-fields" style="display:${selectedType==='初遇'?'block':'none'}">
        <div class="field"><label>01｜來到這裡的他 <span class="hint">有值得留下的地方再寫即可</span></label><textarea name="arrival" placeholder="剛來到這裡時，他帶著什麼事情、感受或狀態？">${esc(j?.arrival||'')}</textarea></div>
        <div class="field"><label>02｜今天主要走過什麼</label><textarea name="walked" placeholder="自由記錄今天實際談到、走過的重要內容，不需要寫成逐字稿。">${esc(j?.walked||j?.topics||'')}</textarea></div>
        <div class="field" style="padding:16px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.42);"><label>03｜此刻的光</label>
          <div class="field-row"><div class="field"><label>顏色</label><input type="text" name="lightColor" placeholder="例如：霧藍" value="${esc(j?.lightColor||'')}"></div><div class="field"><label>旅人的回應</label><input type="text" name="lightResponse" placeholder="旅人聽見後實際怎麼回應？" value="${esc(j?.lightResponse||'')}"></div></div>
          <div class="field"><label>我感受到的訊息</label><textarea name="lightMessage" placeholder="記錄當下實際感受到的訊息，不套用固定顏色字典。">${esc(j?.lightMessage||'')}</textarea></div>
        </div>
        <div class="field" style="padding:16px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.42);"><label>04｜陪伴中的看見</label>
          <div class="field"><label>我注意到</label><textarea name="noticed" placeholder="記錄陪伴中實際注意到的地方。">${esc(j?.noticed||j?.observations||'')}</textarea></div>
          <div class="field"><label>我還在好奇 <span class="hint">選填・不會進入旅人製作資料</span></label><textarea name="curious" placeholder="尚未被旅人確認的推測或你想繼續留意的地方。">${esc(j?.curious||'')}</textarea></div>
        </div>
        <div class="field"><label>05｜旅人的重要原話</label><textarea name="importantQuote" placeholder="盡量保留旅人真正說過的句子，不先改寫。">${esc(j?.importantQuote||j?.quotes||'')}</textarea></div>
        <div class="field"><label>06｜這一次拾起了什麼</label><textarea name="pickedUp" placeholder="這次真正出現的重要看見、理解、承認或選擇。">${esc(j?.pickedUp||j?.direction||'')}</textarea></div>
        <div class="field"><label>07｜留給接下來的觀察 <span class="hint">選填</span></label><textarea name="nextObservation" placeholder="有需要才留下；沒有就空白，不強制作業。">${esc(j?.nextObservation||'')}</textarea></div>
        <details style="margin-top:12px;"><summary style="cursor:pointer;font-weight:700;color:var(--muted);">僅自己可見｜陪伴備註（選填）</summary><div class="field" style="margin-top:12px;"><textarea name="privateNote" placeholder="使用方式、下次需要記得的事情或其他私人備註。此欄不會進入旅人製作資料。">${esc(j?.privateNote||'')}</textarea></div></details>
      </div>

      <div id="shiguang-fields" style="display:${selectedType==='拾光'?'block':'none'}">
        <div style="padding:16px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.42);margin-bottom:16px;"><label style="font-weight:700;">這一段拾光旅程</label>
          <div class="field"><label>我的起點</label><textarea name="sgStartingPoint" placeholder="旅程開始時，旅人真正正在經歷的狀態。">${esc(j?.sgStartingPoint||sgBase?.sgStartingPoint||'')}</textarea></div>
          <div class="field"><label>我想靠近的地方</label><textarea name="sgDesiredPlace" placeholder="不是KPI，而是這一段旅程想慢慢靠近的方向。">${esc(j?.sgDesiredPlace||sgBase?.sgDesiredPlace||'')}</textarea></div>
          <div class="field"><label>可能經過的方向 <span class="hint">選填・可以改變</span></label><textarea name="sgPossibleDirections">${esc(j?.sgPossibleDirections||sgBase?.sgPossibleDirections||'')}</textarea></div>
        </div>
        <div class="field"><label>01｜今天從哪裡回來 <span class="hint">選填</span></label><textarea name="sgReturnedFrom">${esc(j?.sgReturnedFrom||'')}</textarea></div>
        <div class="field"><label>02｜今天走過哪裡</label><textarea name="sgWalked">${esc(j?.sgWalked||j?.topics||'')}</textarea></div>
        <div class="field"><label>03｜我注意到</label><textarea name="sgNoticed">${esc(j?.sgNoticed||j?.observations||'')}</textarea></div>
        <div class="field"><label>04｜我還在好奇 <span class="hint">私人・不輸出</span></label><textarea name="sgCurious">${esc(j?.sgCurious||'')}</textarea></div>
        <div class="field"><label>05｜旅人的重要原話</label><textarea name="sgQuote">${esc(j?.sgQuote||j?.quotes||'')}</textarea></div>
        <div class="field"><label>06｜今天拾起了什麼</label><textarea name="sgPickedUp">${esc(j?.sgPickedUp||j?.direction||'')}</textarea></div>
        <div class="field"><label>07｜目前的位置 <span class="hint">選填</span></label><textarea name="sgCurrentPosition">${esc(j?.sgCurrentPosition||'')}</textarea></div>
        <div class="field"><label>08｜這次旅程怎麼走</label><select name="sgMapStatus"><option value="">請選擇</option>${['繼續往前','新增了一個地方','停在這裡','改道了','沒有明顯變化'].map(x=>`<option ${j?.sgMapStatus===x?'selected':''}>${x}</option>`).join('')}</select></div>
        <div class="field"><label>發生了什麼？ <span class="hint">有轉折／停留再寫</span></label><textarea name="sgMapChange">${esc(j?.sgMapChange||'')}</textarea></div>
        <div class="field"><label>09｜留給生活 <span class="hint">選填・不強制作業</span></label><textarea name="sgLifeObservation">${esc(j?.sgLifeObservation||'')}</textarea></div>
        <div class="helper-box" style="margin-bottom:16px;">沿途拾光改為獨立紀錄。儲存這次相遇後，可回到旅人頁面直接新增生活中的發現。</div>
        <details><summary style="cursor:pointer;font-weight:700;color:var(--muted);">僅自己可見｜陪伴資料</summary>
          <div class="field" style="margin-top:12px;"><label>方法／工具 <span class="hint">選填・不輸出</span></label><input name="sgTools" value="${esc(j?.sgTools||'')}" placeholder="生命對話、色彩訊息、書寫、靈氣…"></div>
          <div class="field"><label>陪伴者私人備註 <span class="hint">不輸出</span></label><textarea name="sgPrivateNote">${esc(j?.sgPrivateNote||'')}</textarea></div>
        </details>
        <details style="margin-top:16px;"><summary style="cursor:pointer;font-weight:700;">完成／回望這段旅程</summary>
          <div class="field" style="margin-top:12px;"><label>現在的我</label><textarea name="sgFinalSelf">${esc(j?.sgFinalSelf||'')}</textarea></div>
          <div class="field"><label>一路最重要的轉折</label><textarea name="sgFinalTurningPoint">${esc(j?.sgFinalTurningPoint||'')}</textarea></div>
          <div class="field"><label>這趟旅程拾起了什麼</label><textarea name="sgFinalPickedUp">${esc(j?.sgFinalPickedUp||'')}</textarea></div>
          <div class="field"><label>想帶往接下來生活的東西</label><textarea name="sgCarryForward">${esc(j?.sgCarryForward||'')}</textarea></div>
          <div class="field"><label>最後重要原話 <span class="hint">選填</span></label><textarea name="sgFinalQuote">${esc(j?.sgFinalQuote||'')}</textarea></div>
        </details>
      </div>

      <div id="companion-fields" style="display:${selectedType==='同行'?'block':'none'}">
        <div class="helper-box"><b>同行｜約三個月・5次正式相遇</b><br>不以成功／失敗判斷旅程；反覆、停住、還不知道，都可以如實留下。</div>
        <details open><summary style="cursor:pointer;font-weight:700;">同行｜旅程起點 <span class="hint">第一段旅程填寫；後續可保留</span></summary>
          <div class="field-row" style="margin-top:12px;"><div class="field"><label>開始日期</label><input type="date" name="cpStartDate" value="${esc(j?.cpStartDate||j?.date||todayStr())}"></div><div class="field"><label>預計結束</label><input type="date" name="cpExpectedEnd" value="${esc(j?.cpExpectedEnd||'')}"></div></div>
          <div class="field"><label>為什麼開始這段同行</label><textarea name="cpWhy">${esc(j?.cpWhy||'')}</textarea></div>
          <div class="field"><label>生活裡反覆出現的是</label><textarea name="cpRepeats">${esc(j?.cpRepeats||'')}</textarea></div>
          <div class="field"><label>想慢慢練習的是</label><textarea name="cpPractice">${esc(j?.cpPractice||'')}</textarea></div>
          <div class="field"><label>如果有一點不同，可能會注意到</label><textarea name="cpDifference">${esc(j?.cpDifference||'')}</textarea></div>
          <div class="field"><label>現在的我</label><textarea name="cpStartingSelf">${esc(j?.cpStartingSelf||'')}</textarea></div>
        </details>
        <div class="field"><label>01｜最近發生了什麼</label><textarea name="cpRecent">${esc(j?.cpRecent||'')}</textarea></div>
        <div class="field"><label>02｜今天我們走進哪一件事</label><textarea name="cpFocus">${esc(j?.cpFocus||'')}</textarea></div>
        <div class="field"><label>03｜當時的我怎麼反應</label><textarea name="cpReaction">${esc(j?.cpReaction||'')}</textarea></div>
        <div class="field"><label>04｜我開始注意到</label><textarea name="cpNoticed">${esc(j?.cpNoticed||'')}</textarea></div>
        <div class="field-row"><div class="field"><label>05｜和以前相比</label><select name="cpCompared"><option value=""></option>${['有一點不一樣','還是很熟悉','又回到原本方式','目前還不知道'].map(x=>`<option ${j?.cpCompared===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="field"><label>補充</label><input name="cpComparedNote" value="${esc(j?.cpComparedNote||'')}"></div></div>
        <div class="field"><label>06｜重要原話</label><textarea name="cpQuote">${esc(j?.cpQuote||'')}</textarea></div>
        <div class="field"><label>07｜我正在長出的 <span class="hint">選填</span></label><textarea name="cpGrowing">${esc(j?.cpGrowing||'')}</textarea></div>
        <div class="field"><label>08｜還在反覆的 <span class="hint">選填</span></label><textarea name="cpRepeating">${esc(j?.cpRepeating||'')}</textarea></div>
        <div class="field"><label>09｜這段時間我想試試看 <span class="hint">選填・不是作業</span></label><textarea name="cpTry">${esc(j?.cpTry||'')}</textarea></div>
        <div class="field"><label>生活拾光 <span class="hint">旅人生活中想留下的重要片刻</span></label><textarea name="cpLifePickup">${esc(j?.cpLifePickup||'')}</textarea></div>
        <div class="field"><label>生活軌跡 <span class="hint">真正值得成為軌跡節點的事件／選擇／反覆</span></label><textarea name="cpLifeTrack">${esc(j?.cpLifeTrack||'')}</textarea></div>
        <details><summary style="cursor:pointer;font-weight:700;color:var(--muted);">僅自己可見｜陪伴資料</summary>
          <div class="field" style="margin-top:12px;"><label>我還在好奇 <span class="hint">不輸出</span></label><textarea name="cpCurious">${esc(j?.cpCurious||'')}</textarea></div>
          <div class="field"><label>方法／工具 <span class="hint">不輸出</span></label><input name="cpTools" value="${esc(j?.cpTools||'')}"></div>
          <div class="field"><label>私人備註 <span class="hint">不輸出</span></label><textarea name="cpPrivateNote">${esc(j?.cpPrivateNote||'')}</textarea></div>
        </details>
        <details style="margin-top:16px;"><summary style="cursor:pointer;font-weight:700;">最後一次｜回望</summary>
          <div class="field" style="margin-top:12px;"><label>三個月前的我</label><textarea name="cpFinalBefore">${esc(j?.cpFinalBefore||'')}</textarea></div>
          <div class="field"><label>我曾經反覆走回去的是</label><textarea name="cpFinalRepeated">${esc(j?.cpFinalRepeated||'')}</textarea></div>
          <div class="field"><label>我第一次發現不一樣的是</label><textarea name="cpFinalDifferent">${esc(j?.cpFinalDifferent||'')}</textarea></div>
          <div class="field"><label>我做過哪些以前較不容易做的選擇</label><textarea name="cpFinalChoices">${esc(j?.cpFinalChoices||'')}</textarea></div>
          <div class="field"><label>現在的我正在長出</label><textarea name="cpFinalGrowing">${esc(j?.cpFinalGrowing||'')}</textarea></div>
          <div class="field"><label>還在路上的</label><textarea name="cpFinalOnRoad">${esc(j?.cpFinalOnRoad||'')}</textarea></div>
          <div class="field"><label>接下來想繼續保留的是</label><textarea name="cpFinalKeep">${esc(j?.cpFinalKeep||'')}</textarea></div>
          <div class="field"><label>最後重要原話</label><textarea name="cpFinalQuote">${esc(j?.cpFinalQuote||'')}</textarea></div>
        </details>
      </div>
      <div id="legacy-fields" style="display:none"></div>
      <div class="form-actions"><button type="submit" class="btn btn-primary">${ICON.book} ${editing?'儲存修改':'完成紀錄'}</button><a href="#/traveler/${t.id}" class="btn btn-ghost">取消</a></div>
    </form>`;
}

