/* ============ 生日拾光 ============ */
function birthdayCardSummary(b){
  return `${b.lightColor?`光｜${esc(b.lightColor)}`:'光｜尚未填寫'}${b.cardKeyword?`　・　字｜${esc(b.cardKeyword)}`:''}`;
}
function pageBirthday(){
  const list=getB().sort((a,b)=>(b.orderDate||'').localeCompare(a.orderDate||'')||(b.createdAt-a.createdAt));
  const c=birthdayStatusCounts();
  return `<div class="page-head"><div class="eyebrow">Birthday Light</div><h1 class="page-title">生日拾光｜訂單與製作管理</h1><p class="page-desc">獨立管理訂單、旅人近況與照片、此刻的光、抽牌訊息、兩張正反面小卡與寄件進度。</p></div>
  <div class="stat-grid" style="grid-template-columns:repeat(5,1fr);">${Object.entries(c).map(([k,v])=>`<div class="stat-card"><div class="num">${v}</div><div class="lbl">${k}</div></div>`).join('')}</div>
  <div class="section-title"><h3>生日拾光</h3><div style="display:flex;gap:8px;flex-wrap:wrap"><label class="btn btn-soft btn-sm" style="cursor:pointer">匯入下單資料<input id="birthday-order-import" type="file" accept="application/json,.json" hidden></label><a class="btn btn-primary btn-sm" href="#/birthday-new">＋ 新增生日拾光</a></div></div>
  ${list.length?`<div class="journey-list">${list.map(b=>`<div class="paper-card"><div class="jc-head"><div><div class="jc-name">${esc(b.cardName||b.name||'未命名')}</div><div class="jc-meta">${esc(b.timeCode||'—')}　・　${fmtShort(b.orderDate)}</div></div><span class="type-badge type-light">${esc(b.status||'待確認')}</span></div><div class="jc-block"><div class="k">兩張卡內容</div><div class="v">${birthdayCardSummary(b)}</div></div><div class="form-actions"><a class="btn btn-ghost btn-sm" href="#/birthday-edit/${b.id}">開啟／編輯</a><button class="btn btn-danger btn-sm" data-del-birthday="${b.id}">刪除</button></div></div>`).join('')}</div>`:`<div class="empty">目前還沒有生日拾光訂單。</div>`}`;
}
function pageBirthdayForm(id){
  const b=id?getB().find(x=>x.id===id):null, editing=!!b;
  const code=b?.timeCode||nextBirthdayCode();
  const statuses=['待確認','待製作','製作中','待寄出','已寄出'];
  return `<div class="page-head"><div class="eyebrow">Birthday Light</div><h1 class="page-title">${editing?'生日拾光紀錄':'新增生日拾光'}</h1><p class="page-desc">時光編碼由系統自動生成。旅人照片只作本次製作參考，不放入卡片，也不作人格／命運判讀。</p></div>
  <form id="birthday-form" class="form-card">
    <div class="form-section"><h3>01｜訂單資料</h3>
      <div class="form-grid"><div class="field"><label>時光編碼｜自動生成</label><input name="timeCode" value="${esc(code)}" readonly></div><div class="field"><label>狀態</label><select name="status">${statuses.map(x=>`<option ${x===(b?.status||'待確認')?'selected':''}>${x}</option>`).join('')}</select></div><div class="field"><label>訂購日期</label><input type="date" name="orderDate" value="${esc(b?.orderDate||todayStr())}"></div><div class="field"><label>訂單成立日期</label><input type="date" name="confirmedDate" value="${esc(b?.confirmedDate||'')}"></div><div class="field"><label>旅人姓名</label><input name="name" value="${esc(b?.name||'')}"></div><div class="field"><label>卡片稱呼</label><input name="cardName" value="${esc(b?.cardName||'')}"></div><div class="field"><label>生日</label><input type="date" name="birthday" value="${esc(b?.birthday||'')}"></div><div class="field"><label>手機</label><input name="phone" value="${esc(b?.phone||'')}"></div><div class="field"><label>LINE 顯示名稱</label><input name="lineName" value="${esc(b?.lineName||'')}"></div><div class="field"><label>付款後五碼</label><input name="paymentLast5" value="${esc(b?.paymentLast5||'')}"></div><div class="field"><label>付款狀態</label><select name="paymentStatus"><option ${b?.paymentStatus==='待確認'?'selected':''}>待確認</option><option ${b?.paymentStatus==='已確認'?'selected':''}>已確認</option></select></div><div class="field"><label>收件姓名</label><input name="recipient" value="${esc(b?.recipient||'')}"></div><div class="field full"><label>收件地址</label><input name="address" value="${esc(b?.address||'')}"></div></div>
    </div>
    <div class="form-section"><h3>02｜旅人留下的現在</h3><div class="field"><label>最近的你，是什麼樣的狀態呢？</label><textarea name="recentState">${esc(b?.recentState||'')}</textarea></div><div class="field"><label>最近常出現在心裡的一句話｜選填</label><textarea name="recentPhrase">${esc(b?.recentPhrase||'')}</textarea></div><div class="field"><label>近三個月正面半身照／全身照</label><input id="birthday-photo" type="file" accept="image/*"><input type="hidden" name="photoData" value="${esc(b?.photoData||'')}"><div id="birthday-photo-preview" style="margin-top:10px;">${b?.photoData?`<img src="${b.photoData}" alt="旅人近照" style="max-width:180px;max-height:240px;border-radius:12px;object-fit:cover;border:1px solid var(--line);">`:''}</div><div class="hint">僅供本次生日拾光製作參考；系統會縮圖保存以降低資料量。</div></div></div>
    <div class="form-section"><h3>03｜此刻的光</h3><div class="form-grid"><div class="field"><label>主要顏色／光的名稱</label><input name="lightColor" value="${esc(b?.lightColor||'')}"></div><div class="field"><label>顏色細節</label><input name="lightDetail" value="${esc(b?.lightDetail||'')}"></div></div><div class="field"><label>第一個感受</label><textarea name="lightFirst">${esc(b?.lightFirst||'')}</textarea></div><div class="field"><label>浮現的關鍵字／畫面／身體或直覺感受</label><textarea name="lightRaw">${esc(b?.lightRaw||'')}</textarea></div><div class="field"><label>這道光帶給我的能量感受</label><textarea name="lightEnergy">${esc(b?.lightEnergy||'')}</textarea></div></div>
    <div class="form-section"><h3>04｜我想給旅人的訊息</h3><div class="field"><label>原始訊息</label><textarea name="lightMessage">${esc(b?.lightMessage||'')}</textarea></div><div class="field"><label>如果只能留下一件事｜核心</label><textarea name="lightCore">${esc(b?.lightCore||'')}</textarea></div></div>
    <div class="form-section"><h3>05｜這一次拾起的牌</h3><div class="form-grid"><div class="field"><label>使用牌卡</label><input name="deckName" value="${esc(b?.deckName||'')}"></div><div class="field"><label>實際抽到</label><input name="cardDrawn" value="${esc(b?.cardDrawn||'')}"></div><div class="field"><label>第一個關鍵字｜我的字</label><input name="cardKeyword" value="${esc(b?.cardKeyword||'')}"></div></div><div class="field"><label>看到牌的第一感受／注意到什麼</label><textarea name="cardFeeling">${esc(b?.cardFeeling||'')}</textarea></div><div class="field"><label>與旅人的光放在一起，我感受到</label><textarea name="cardWithLight">${esc(b?.cardWithLight||'')}</textarea></div><div class="field"><label>真正想留下給旅人的提醒</label><textarea name="cardMessage">${esc(b?.cardMessage||'')}</textarea></div></div>
    <div class="form-section"><h3>06｜兩張小卡｜4個內容面</h3><p class="page-desc" style="margin-bottom:14px;">只固定內容結構；排版、視覺、尺寸與材質之後再討論。</p><div class="field"><label>卡片1正面｜我的光・此刻的你</label><textarea name="card1Front">${esc(b?.card1Front||b?.card1Copy||'')}</textarea></div><div class="field"><label>卡片1背面｜留給此刻的你</label><textarea name="card1Back">${esc(b?.card1Back||'')}</textarea></div><div class="field"><label>卡片2正面｜我的字・給你的提醒</label><textarea name="card2Front">${esc(b?.card2Front||b?.card2Copy||'')}</textarea></div><div class="field"><label>卡片2背面｜這個字想提醒你的事</label><textarea name="card2Back">${esc(b?.card2Back||'')}</textarea></div><div class="field"><label>文案狀態</label><select name="copyStatus"><option ${b?.copyStatus==='草稿'?'selected':''}>草稿</option><option ${b?.copyStatus==='待修改'?'selected':''}>待修改</option><option ${b?.copyStatus==='已確認'?'selected':''}>已確認</option></select></div>${editing?`<button type="button" class="btn btn-soft" data-copy-birthday="${b.id}">製作生日拾光｜複製AI草稿資料</button>`:''}</div>
    <div class="form-section"><h3>07｜卡片與寄件</h3><div class="form-grid"><div class="field"><label>卡片製作狀態</label><select name="cardStatus"><option ${b?.cardStatus==='未製作'?'selected':''}>未製作</option><option ${b?.cardStatus==='製作中'?'selected':''}>製作中</option><option ${b?.cardStatus==='已完成'?'selected':''}>已完成</option></select></div><div class="field"><label>完成日期</label><input type="date" name="completedDate" value="${esc(b?.completedDate||'')}"></div><div class="field"><label>寄件日期</label><input type="date" name="shipDate" value="${esc(b?.shipDate||'')}"></div><div class="field"><label>寄件方式／追蹤資訊</label><input name="shippingInfo" value="${esc(b?.shippingInfo||'')}"></div></div><div class="field"><label>旅人回饋</label><textarea name="feedback">${esc(b?.feedback||'')}</textarea></div><div class="field"><label>公開回饋同意</label><select name="feedbackConsent"><option ${b?.feedbackConsent==='未詢問'?'selected':''}>未詢問</option><option ${b?.feedbackConsent==='不同意'?'selected':''}>不同意</option><option ${b?.feedbackConsent==='同意匿名公開'?'selected':''}>同意匿名公開</option></select></div></div>
    <div class="form-section"><details><summary style="cursor:pointer;font-weight:700;">08｜陪伴者私密紀錄｜禁止輸出</summary><div class="field" style="margin-top:12px;"><label>這次製作我自己的感受</label><textarea name="privateFeeling">${esc(b?.privateFeeling||'')}</textarea></div><div class="field"><label>我不確定／只是猜測的地方</label><textarea name="privateUncertain">${esc(b?.privateUncertain||'')}</textarea></div><div class="field"><label>做完後還留意到什麼</label><textarea name="privateAfter">${esc(b?.privateAfter||'')}</textarea></div></details></div>
    <div class="form-actions"><button type="submit" class="btn btn-primary">${editing?'儲存生日拾光':'建立生日拾光'}</button><a href="#/birthday" class="btn btn-ghost">取消</a></div>
  </form>`;
}
function birthdayProductionText(b){
  return `製作生日拾光\n\n請先依以下實際資料整理《生日拾光｜兩張正反面小卡專屬文案草稿》，不要直接製作正式卡片。\n\n【最高規則】\n- 光的顏色與訊息是陪伴者實際感受到的內容；不可用固定色彩心理、脈輪、傳統象徵或色彩字典自行補義。\n- 牌卡訊息以陪伴者實際抽牌後的感受為準；不可用標準牌義自行補寫。\n- 不可根據生日推算命運、人格或年度運勢。\n- 不可使用私密紀錄。資料不足就留白或指出不足，不可發明。\n- 目前交付內容為兩張獨立正反面小卡：卡片1「我的光｜此刻的你」；卡片2「我的字｜給你的提醒」。排版視覺尚未定案。\n\n【旅人】\n稱呼：${b.cardName||b.name||''}\n生日：${b.birthday||''}\n最近狀態：${b.recentState||''}\n最近一句話：${b.recentPhrase||''}\n\n【此刻的光】\n光／顏色：${b.lightColor||''}\n顏色細節：${b.lightDetail||''}\n第一感受：${b.lightFirst||''}\n浮現內容：${b.lightRaw||''}\n能量感受：${b.lightEnergy||''}\n原始訊息：${b.lightMessage||''}\n最重要核心：${b.lightCore||''}\n\n【這一次拾起的牌】\n牌卡：${b.deckName||''}\n抽到：${b.cardDrawn||''}\n關鍵字：${b.cardKeyword||''}\n第一感受：${b.cardFeeling||''}\n與光放在一起：${b.cardWithLight||''}\n想留下的提醒：${b.cardMessage||''}\n\n請輸出：\n卡片1正面｜此刻的光／光的名稱與一句核心句\n卡片1背面｜留給此刻的你：光的專屬訊息\n卡片2正面｜我的字：關鍵字與一句核心提醒\n卡片2背面｜給你的提醒：牌卡與光整合後的專屬訊息。`;
}


/* ============ 預約管理 / 副業收入 ============ */
function money(n){return Number(n||0).toLocaleString('zh-TW')}
function bookingStatusLabel(s){return ({pending:'待確認',confirmed:'已成立',cancelled:'已取消'})[s]||s||'—'}
function pageBookings(){
  const rows=[...(CLOUD.bookings||[])];
  const pending=rows.filter(x=>x.status==='pending');
  const active=rows.filter(x=>x.status!=='cancelled');
  return `<div class="page-head"><div class="eyebrow">Booking</div><h1 class="page-title">預約管理</h1><p class="page-desc">旅人送出表單後會先停在待確認；完成付款與 LINE 核對後，再按「確認成立」。</p></div>
  <div class="stat-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));">
    <div class="stat-card"><div class="icon ic-a">${ICON.book}</div><div class="num">${pending.length}</div><div class="lbl">待確認</div></div>
    <div class="stat-card"><div class="icon ic-b">${ICON.path}</div><div class="num">${active.length}</div><div class="lbl">有效預約</div></div>
    <div class="stat-card"><div class="icon ic-d">${ICON.dash}</div><div class="num">${rows.length}</div><div class="lbl">全部預約</div></div>
  </div>
  <div class="section-title"><h3>旅人預約</h3></div>
  ${rows.length?`<div class="journey-list">${rows.map(x=>`<div class="paper-card">
    <div class="jc-head"><div><div class="jc-name">${esc(x.traveler_name||'旅人')}</div><div class="jc-meta">${esc(x.journey||'')}・${fmtDate(x.booking_date)} ${esc(String(x.booking_time||'').slice(0,5))}</div></div><span class="type-badge">${esc(bookingStatusLabel(x.status))}</span></div>
    <div class="jc-block"><div class="k">聯絡資訊</div><div class="v">${esc(x.contact_method||'—')}｜${esc(x.instagram||x.line_display_name||'—')}</div></div>
    ${x.status==='pending'?`<div class="form-actions"><button class="btn btn-primary btn-sm" data-confirm-booking="${x.id}">確認成立</button><button class="btn btn-danger btn-sm" data-cancel-booking="${x.id}">取消預約</button></div>`:''}
  </div>`).join('')}</div>`:`<div class="empty">${ICON.book}<p>目前沒有預約資料。</p></div>`}`;
}
function pageIncome(){
  const rows=[...(CLOUD.income||[])];
  const valid=rows.filter(x=>!['pending','cancelled'].includes(x.status));
  const total=valid.reduce((n,x)=>n+(Number(x.amount)||0)+(Number(x.shipping)||0),0);
  const paid=rows.filter(x=>x.status==='paid').reduce((n,x)=>n+(Number(x.amount)||0)+(Number(x.shipping)||0),0);
  return `<div class="page-head"><div class="eyebrow">Side Income</div><h1 class="page-title">副業收入</h1><p class="page-desc">與正式預約、生日拾光共用同一份 Supabase 資料，不另外重複記帳。</p></div>
  <div class="stat-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));">
    <div class="stat-card"><div class="icon ic-a">${ICON.dash}</div><div class="num">$${money(total)}</div><div class="lbl">有效收入</div></div>
    <div class="stat-card"><div class="icon ic-b">${ICON.book}</div><div class="num">$${money(paid)}</div><div class="lbl">已付款</div></div>
    <div class="stat-card"><div class="icon ic-d">${ICON.path}</div><div class="num">${rows.length}</div><div class="lbl">收入筆數</div></div>
  </div>
  <div class="section-title"><h3>收入明細</h3></div>
  ${rows.length?`<div class="journey-list">${rows.map(x=>`<div class="paper-card"><div class="jc-head"><div><div class="jc-name">${esc(x.traveler_name||'旅人')}・${esc(x.service_name||'')}</div><div class="jc-meta">${fmtDate(x.service_date)}・${esc(x.status||'')}</div></div><div style="font-size:20px;font-weight:800">$${money((Number(x.amount)||0)+(Number(x.shipping)||0))}</div></div><div class="jc-block"><div class="k">金額拆分</div><div class="v">服務 $${money(x.amount)}${Number(x.shipping)?`｜郵寄 $${money(x.shipping)}`:''}</div></div></div>`).join('')}</div>`:`<div class="empty"><p>目前沒有收入資料。</p></div>`}`;
}
async function patchCloud(table,id,data){
  const r=await sbReq('/rest/v1/'+table+'?id=eq.'+encodeURIComponent(id),{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify(data)});
  if(!r.ok)throw new Error(await r.text());
}

/* ============ 備份 ============ */
function pageBackup(){
  return `
    <div class="page-head">
      <div class="eyebrow">Backup</div>
      <h1 class="page-title">匯出／匯入備份</h1>
      <p class="page-desc">正式資料以 Supabase 雲端為主。你仍可以隨時匯出一份 JSON 備份，作為額外保護。</p>
    </div>
    <div class="backup-grid">
      <div class="backup-card">
        <h4>匯出備份</h4>
        <p>將目前旅人、旅程、生日拾光、預約與收入資料下載成一份 JSON 檔案。</p>
        <button id="btn-export" class="btn btn-primary btn-block">${ICON.backup} 匯出備份檔</button>
      </div>
      <div class="backup-card">
        <h4>匯入備份</h4>
        <p>選擇先前匯出的備份檔，將資料還原回來（會覆蓋目前的資料）。</p>
        <label class="file-drop" for="file-import">點一下選擇備份檔（.json）</label>
        <input id="file-import" type="file" accept="application/json" style="display:none;">
      </div>
    </div>
    <div class="section-title" style="margin-top:26px;"><h3>目前資料量</h3></div>
    <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);max-width:640px;">
      <div class="stat-card"><div class="icon ic-a">${ICON.people}</div><div class="num">${getT().length}</div><div class="lbl">旅人</div></div>
      <div class="stat-card"><div class="icon ic-b">${ICON.path}</div><div class="num">${getJ().length}</div><div class="lbl">旅程紀錄</div></div>
      <div class="stat-card"><div class="icon ic-d">${ICON.moon}</div><div class="num">${getB().length}</div><div class="lbl">生日拾光</div></div>
    </div>
  `;
}

