"use strict";
// CHAT （送受信・ロードに関わる記述）
// ------------------------------
const cgiPath = './index.cgi';
const gameCode = document.querySelector('body').dataset.game;
let numPath;
let logKey;
let lastnumber = 0;
let userId;
let romMode = 0;
let mainTab = 1;
let tabList = {};
let memberList = {};
let memberReady = {};
let readyStartTab = 1;
let unitList = {};
let chatPalettes = {};
let selectedSheet = '';
let shareMemo = [];
let beforeComm = {};
let bgmHistory = {};
let bgHistory = {};
// 個人設定
let config  = localStorage.getItem('ytchatCommonConfig') ? JSON.parse(localStorage.getItem('ytchatCommonConfig')) : {};
config.fontLightness    ||= localStorage.getItem('fontLightness') || 100;
config.fontShadow       = config.fontShadow == 0 ? 0 : 1;
config.fontFamily       ||= localStorage.getItem('fontFamily') || '';
config.fontFamilyMin    ||= localStorage.getItem('fontFamilyMin') || '';
config.paletteDestinate ||= localStorage.getItem('paletteDestinate') || 'fall';
config.subFormBehavior  ||= localStorage.getItem('subFormBehavior') ? JSON.parse(localStorage.getItem('subFormBehavior')) : {};
config.layoutSheet      ||= localStorage.getItem('layout-sheet') || 'right-top';
config.layoutSide       ||= localStorage.getItem('layout-side') || 'R';
config.layoutTabBar     ||= 'bottom';
config.markName         = config.markName == 0 ? 0 : 1;
config.markList         ||= localStorage.getItem('markList') ? JSON.parse(localStorage.getItem('markList')) : [];
config.exceptList       ||= localStorage.getItem('exceptList') ? JSON.parse(localStorage.getItem('exceptList')) : [];
config.volumes          ||= {};
config.seType           ||= localStorage.getItem('seType') ? JSON.parse(localStorage.getItem('seType')) : {};

// ルーム設定
let roomConfigAll = localStorage.getItem('ytchatRoomConfig') ? JSON.parse(localStorage.getItem('ytchatRoomConfig')) : {};
roomConfigAll[roomId] ||= {};
let roomConfig = roomConfigAll[roomId];
roomConfig.logKey     ||= '';
roomConfig.name       ||= [];
roomConfig.sheetMemo  ||= {};
roomConfig.tab        ||= [];
roomConfig.fontSize   ||= {};
roomConfig.statusList ||= [];
roomConfig.selectedName     ||= {};
roomConfig.selectedAddress  ||= {};
roomConfig.checkedOpenLater ||= {};
roomConfig.diceColumn ||= [1,2];
if(!roomConfig.diceForms){
  roomConfig.diceForms = [
      [
        {'type':'dice','value':''},
      ],
      [
        {'type':'dice','value':'2d'},
        {'type':'dice','value': gameSystem == 'dx3' ? 'ER' : ''},
        {'type':'dice','value':''},
        {'type':'dice','value':''},
        {'type':'dice','value':''},
        {'type':'dice','value':''},
      ],
    ];
  if(gameSystem == 'dx3'){
    roomConfig.diceForms[1] = [
      {'type':'dice','value':'1d'},
      {'type':'dice','value':'ER'},
      {'type':'dice','value':'RE'},
      {'type':'dice','value':'@HP={肉体}+10'},
      {'type':'dice','value':''},
      {'type':'dice','value':''},
    ]
  } else if (gameSystem === 'sw2') {
    roomConfig.diceForms[1][2] = {type: 'dice', value: '成長ダイス'};
  }
}
let nameList   = roomConfig.name;
let diceColumn = roomConfig.diceColumn;
let diceForms  = roomConfig.diceForms;

// 旧データ
if(localStorage.getItem(roomId+'-logKey')){
  if (localStorage.getItem(roomId+'-logKey'    )) roomConfig.logKey     = localStorage.getItem(roomId+'-logKey')
  if (localStorage.getItem(roomId+'-name'      )) roomConfig.name       = JSON.parse(localStorage.getItem(roomId+'-name'))
  if (localStorage.getItem(roomId+'-sheetMemo' )) roomConfig.sheetMemo  = JSON.parse(localStorage.getItem(roomId+'-sheetMemo'))
  if (localStorage.getItem(roomId+'-fontSize'  )) roomConfig.fontSize   = JSON.parse(localStorage.getItem(roomId+'-fontSize'))
  if (localStorage.getItem(roomId+'-statusList')) roomConfig.statusList = JSON.parse(localStorage.getItem(roomId+'-statusList'))
  if (localStorage.getItem(roomId+'-diceColumn')) roomConfig.diceColumn = JSON.parse(localStorage.getItem(roomId+'-diceColumn'))
  if (localStorage.getItem(roomId+'-diceForms' )) roomConfig.diceForms  = JSON.parse(localStorage.getItem(roomId+'-diceForms'))

  localStorage.removeItem(roomId+'-logKey')
  localStorage.removeItem(roomId+'-name')
  localStorage.removeItem(roomId+'-sheetMemo')
  localStorage.removeItem(roomId+'-fontSize')
  localStorage.removeItem(roomId+'-statusList')
  localStorage.removeItem(roomId+'-diceColumn')
  localStorage.removeItem(roomId+'-diceForms')
}

//
const handleErrors = function(response) {
  if (response.status !== 200) {
    throw Error(response.statusText);
  }
  return response;
}
const hashToQuery = function(hash) {
  return new URLSearchParams(hash);
}

// コンフィグ保存 ----------------------------------------
let windowLoaded = 0;
function saveCommonConfig(){
  if(!windowLoaded) return;
  console.log('saveCommonConfig()');
  localStorage.setItem('ytchatCommonConfig', JSON.stringify(config));
}
let roomLoaded = 0;
function saveRoomConfig(){
  if(!roomLoaded) return;
  console.log('saveRoomConfig()',roomConfig);
  localStorage.setItem('ytchatRoomConfig', JSON.stringify(roomConfigAll));
}
// ロード時処理 ----------------------------------------
window.addEventListener('load', function() {
  fetch('./room/'+roomId+'/log-key.dat', {
    method: "GET",
    cache: 'no-cache',
  })
  .then(response => response.text())
  .then(data => {
    //key取得後処理
    logKey = data;

    userId = config.userId || localStorage.getItem('userid'); //ユーザーID取得
    if(!userId){
      userId = randomId(7); //ランダムユーザーID付与
      config.userId = userId;
    }
    document.cookie = 'ytchat-userid='+userId; //Cookieに保存（ログ用）
    nameList = roomConfig.name;
    if(Object.keys(nameList).length){
      document.getElementById('in-name').value       = nameList[0]['name'];
      document.getElementById('in-color').value      = nameList[0]['color'];
      pickr['in-color'].setColor(nameList[0]['color']);
    }
    
    //入室済み
    if(roomConfig.name && logKey === roomConfig.logKey){
      if(nameList[0] && nameList[0]['name']){
        console.log('自動再入室:'+nameList[0]['name']);
        memberCheck();
        roomLoad(1);
      }
      else {
        console.log('自動再入室失敗');
        boxOpen('enter-form');
      }
    }
    //入室してない
    else {
      boxOpen('enter-form');
    }
  })
  .catch(error => {
    return;
  })
  .finally(()=>{
    // 個人コンフィグ反映
    configFontSet();
    configLayoutSet();
    configMarkSet();
    configFormSet();
    configVolumeSet();
    configSeTypeSet();
    //ルームコンフィグ反映
    if(document.getElementById('config-room-game')){
      document.getElementById('config-room-game').value = bcdiceAPI ? 'bcdice' : gameSystem;
      if(bcdiceAPI){
        document.getElementById('config-room-bcdice-url').value = bcdiceAPI;
        bcdiceGet(bcdiceAPI, 1);
        document.getElementById('config-room-bcdice-options').style.display = 'block';
      }
    }
    windowLoaded = 1;
    saveCommonConfig();
  })
});
// BCDice-API取得 ----------------------------------------
function bcdiceGet(apiUrl, set){
  console.log('BCDiceGet >> API: '+apiUrl);
  const select = document.getElementById('config-room-bcdice-game');
  fetch(apiUrl+'/v2/game_system', {
    method: "GET",
    cache: 'no-cache',
  })
  .then(handleErrors)
  .then(response => response.json())
  .then(data => {
    data['game_system'].sort(function(a,b){
      if(a.name < b.name) return -1;
      if(a.name > b.name) return 1;
      return 0;
    });
    while (0 < select.childNodes.length) {
      select.removeChild(select.childNodes[0]);
    }
    for(let key in data['game_system']){
      let op = document.createElement("option");
      op.text = data['game_system'][key]['name'];
      op.value = data['game_system'][key]['id'];
      if(bcdiceSystem === data['game_system'][key]['id']){
        op.selected = true;
      }
      select.appendChild(op);
    }
  })
  .catch(error => {
    alert('APIサーバー（'+apiUrl+'）にアクセスできませんでした。URLが間違っているか、サーバーがダウンしている可能性があります。');
  });
}
// 入室 ----------------------------------------
function enterRoom() {
  const name = document.getElementById('in-name').value;
  let color = document.getElementById('in-color').value;
  if(!name){ return alert('名前が入力されていません'); }
  color = color || '#FFFFFF';
  const sendData = {
    'mode': 'write',
    'tab' : mainTab,
    'room': roomId,
    'logKey' : logKey,
    'player': name,
    'system': 'enter',
    'color' : color,
    'userId': userId
  }
  fetch(cgiPath, {
    method: "POST",
    cache: 'no-cache',
    body: hashToQuery(sendData),
  })
  .then(handleErrors)
  .then(response => response.json())
  .then(data => {
    console.log('入室:'+name);
    if(data['status'] === 'ok'){
      nameList[0] = { 'name': name, 'color': color };
      roomConfig.logKey = logKey;
      roomLoaded = 1;
      saveRoomConfig();
      roomLoaded = 0;
      boxClose('enter-form');
      roomLoad();
    }
    else {
      alert('入室に失敗しました。リロードが必要な可能性があります。');
    }
  })
  .catch(error => {
    alert('入室に失敗\n('+error+')');
  });
}
// 見学入室
function enterRomRoom() {
  romMode = 1;
  document.body.classList.add('rom');
  boxClose('enter-form');
  sheetClose();
  roomLoad();
}
// 退室 ----------------------------------------
function exitRoom() {
  if(romMode){ location.href = './'; return; } // 見学ちゃんは移動で済ます
  const name = nameList[0]['name'];
  const color = nameList[0]['color'] || '#FFFFFF';
  if(name === ''){ return console.log('退室:名前がありません'); }
  const sendData = {
    'mode': 'write',
    'tab' : mainTab,
    'room': roomId,
    'logKey' : logKey,
    'player': name,
    'system': 'exit',
    'color' : color,
    'userId': userId
  }
  fetch(cgiPath, {
    method: "POST",
    cache: 'no-cache',
    body: hashToQuery(sendData),
  })
  .then(handleErrors)
  .then(response => {
    console.log('退室:'+name);
    delete roomConfig.logKey;
    delete roomConfig.sheetMemo;
    delete roomConfig.statusList;
    for (let area of roomConfig.diceForms) {
      for (let line of area){
        line['value'] = '';
      }
    }
    saveRoomConfig();
    location.href = './';
  })
  .catch(error => {
    alert('退室に失敗\n('+error+')');
  });
}

// 部屋情報取得 ----------------------------------------
function roomLoad(re){
  fetch('./room/'+ roomId +'/room.dat', {
    method: "GET",
    cache: 'no-cache',
  })
  .then(handleErrors)
  .then(response => response.json())
  .then(data => {
    //
    numPath = './room/'+ roomId +'/log-num-'+logKey+'.dat';
    //タブ取得
    tabList = data['tab'];
    for (let key in tabList) {
      tabAdd(key);
    }
    tabOptionSet();
    viewTabChange(1);
    //背景取得
    if(data['bg']) {
      const bgFront = document.querySelector('.bg-front');
      bgFront.style.backgroundImage = 'url('+resolveCloudAssetUrl(data['bg']['url'])+')';
      bgFront.dataset.mode = data['bg']['mode'] ?? '';
      document.getElementById('bg-title').innerHTML = `<a class="link" onclick="imgView('${data['bg']['url']}');">${data['bg']['title']}</a>`;
    }
    bgHistory = data['bg-history'] || {};
    bgHistoryUpdate();
    //BGM取得
    setYoutubePlayer();
    if(data['bgm']) {
      currentBgm['url'] = data['bgm']['url'];
      currentBgm['vol'] = data['bgm']['vol'];
      currentBgm['title'] = data['bgm']['title'];
      bgmOpen();
    }
    bgmHistory = data['bgm-history'] || {};
    bgmHistoryUpdate();
    //トピック取得
    topicChange(data['topic'])
    // マップ
    updateMap(data['map'] ?? '');
    //ラウンド取得
    if(!data['round']){ data['round'] = 0; }
    setRound(data['round']);
    //ユニット取得
    unitList = data['unit'] || {};
    for (let key in unitList) {
      unitAdd(key);
    }
    const statusBody = document.getElementById('status-body');
    roomConfig.statusList.reverse().forEach(function(name) {
      if(unitList[name] && unitList[name]['id']){
        const obj = document.getElementById('stt-unit-'+unitList[name]['id']);
        statusBody.insertBefore(obj, statusBody.firstElementChild);
      }
    });
    statusUpdate();
    if(window.matchMedia('(max-width:1024px)').matches){ sheetClose(); }
    //共有メモ取得
    shareMemo = data['memo'] || [];
    memoUpdate();
    //メンバー
    memberList = data['member'] || {};
    //見学でない
    if(!romMode){
      //ユニット
      if(unitList[nameList[0]['name']]){ sheetSelect(unitList[nameList[0]['name']]['id']); }
      else { sheetSelect('default'); }
      //ダイス
      [...Array(diceForms[0].length)].map(() => diceAdd(0));
      [...Array(diceForms[1].length)].map(() => diceAdd(1));
      diceScale(0,diceColumn[0]);
      diceScale(1,diceColumn[1]);
      diceTriggerPaletteUpdate();
      //名前欄項目作成
      const nameNum = roomConfig.selectedName[0]||0;
      document.getElementById('main-name1').value       = nameList[nameNum]['name'];
      document.getElementById('main-name1').style.color = nameList[nameNum]['color'];
      document.getElementById('form-color').value       = nameList[nameNum]['color'];
      npcBoxSet();
      //秘話宛先
      addressUpdate();
      if(roomConfig.selectedAddress[0] || roomConfig.checkedOpenLater[0]){
        document.getElementById('form-address').value = roomConfig.selectedAddress[0];
        document.getElementById('secret-openlater').checked = roomConfig.checkedOpenLater[0];
        changeAddress(0);
      }
      //ユニット追加項目デフォルト値
      if(unitList[nameList[0]['name']] == null){
        document.getElementById('new-unit-name-value').value     = nameList[0]['name'];
      }
      document.getElementById('new-unit-color-value').value      = nameList[0]['color'];
      pickr['new-unit-color-value'].setColor(nameList[0]['color']);
    }
    //
    logCheck();
    if(bcdiceAPI){ bcdiceSystemInfo(); }
    roomLoaded = 1;
    //
    document.getElementById('dark-back').style.display = 'none';
  })
  .catch(error => {
    console.error(error);
    alert('部屋データのロードに失敗');
  });
}

// 入室者チェック ----------------------------------------
function memberCheck() {
  const name = !romMode ? nameList[0]['name']: null;
  const sendData = {
    'mode': 'write',
    'room': roomId,
    'logKey' : logKey,
    'player': (romMode ? '' : name),
    'system': 'reload',
    'userId': (romMode ? '' : userId)
  }
  return fetch(cgiPath, {
    method: "POST",
    cache: 'no-cache',
    body: hashToQuery(sendData),
  })
  .then(handleErrors)
  .then(response => response.json())
  .then(data => {
    console.log('memberCheck');
    memberList = data;
    addressUpdate();
  })
  .catch(error => {
    console.error(error);
  });
}

// 更新チェック ----------------------------------------
let logCheckCount = 0;
function logCheck() {
  console.log('logCheck:'+lastnumber);
  fetch(numPath, {
    method: "GET",
    cache: 'no-cache',
  })
  .then(response => {
    if (response.status === 200) {
      return response.text()
    }
    else {
      console.log('更新のチェックに失敗:'+response.status);
      if(response.status === 404 && !resetFlag) {
        alert('ログがリセットされました。退室してページを再読み込みします。');
        delete roomConfig.logKey;
        saveRoomConfig();
        location.reload();
      }
      throw Error(response.statusText);
    }
  })
  .then(data => {
    if(data != lastnumber){
      logGet();
    }
  })
  .catch(error =>{
    console.error(error);
  })
  .finally(data => {
    logCheckCount += 1;
    if(!romMode && logCheckCount >= 150){ memberCheck(); logCheckCount = 0; }
    setTimeout( function(){logCheck();}, checkTimeMem);
  });
}

// 新規ログ取得 ----------------------------------------
let lock = 0;
let beforeUser = {};
let beforeName = {};
let beforeColor = {};
let beforePicture = {};
let beforeSecret = {};
let beforeLater = {};
let tabLogLinage = {};
let beforeLastnumber = 0;
let loadedLog = 0;
let rawLogs = {};
const pictureClasses = {};
function logGet(onCompleted = null){
  console.log('logGet');
  if(lock) return 0;
  lock = 1;
  const sendData = {
    'mode'    : 'read',
    'num'     : lastnumber,
    'room'    : roomId,
    'userId'  : userId,
    'loadedLog': loadedLog,
  }
  fetch(cgiPath, {
    method: "POST",
    cache: 'no-cache',
    body: hashToQuery(sendData),
  })
  .then(handleErrors)
  .then(response => response.json())
  .then(data => {
    let soundFlag = {};
    let refreshNavigationFlag = false;
    let statusUpdateFlag = 0;
    let addressUpdateFlag = 0;
    const statusUpdateTargets = [];
    let lastTab = 0;
    data['logs'].forEach( (value, index, array) => {
      // 秘話チェック
      if(value['address'] && !(userId === value['address'] || userId === value['userId'])){
        lastnumber = value['num'];
        return true; 
      }
      if(!value['tab']){ value['tab'] = 1; }
      let scrollOK = scrollCheck(value['tab']); //スクロールするかチェック
      
      const classes = [];
      let newLog;
      if(   beforeUser[value['tab']] !== value['userId']
         || beforeName[value['tab']] !== value['name']
         || beforeColor[value['tab']] !== value['color']
         || beforePicture[value['tab']] !== value['picture']
         || beforeSecret[value['tab']] !== value['address']
         || beforeLater[value['tab']] !== value['openlater']
         || value['name'] == '!SYSTEM'
        ){
        newLog = document.createElement('dl');
        newLog.dataset.user = value['userName'];
        newLog.dataset.id   = value['userId'];
        if(value['name'] == '!SYSTEM'){
          newLog.classList.add('system');
          if     (value['system'].match(/^topic/)){ newLog.classList.add('topic'); }
          else if(value['system'].match(/^map/)  ){ newLog.classList.add('map'); }
          else if(value['system'].match(/^memo/) ){ newLog.classList.add('memo'); }
          else if(value['system'].match(/^bgm/)  ){ newLog.classList.add('bgm'); }
          else if(value['system'].match(/^bg/)   ){ newLog.classList.add('bg'); }
          else if(value['system'].match(/^ready/)){ newLog.classList.add('ready'); }
          else if(value['system'].match(/^round/)){ newLog.classList.add('round'); }
          else if(value['system'].match(/^enter/)){ newLog.classList.add('enter'); }
          else if(value['system'].match(/^exit/) ){ newLog.classList.add('exit'); }
          else if(value['system'].match(/^tab/)  ){ newLog.classList.add('tab'); }
          else if(value['system'].match(/^change/)){ newLog.classList.add('change'); }
          newLog.innerHTML = '<dt id="line-'+value['num']+'-name"></dt>';
        }
        else {
          // 発言者画像
          if (
              (value['picture'] != null && value['picture'] !== '' && value['picture'] !== 'none') ||
              (
                  (value['system'] == null || value['system'] === '') &&
                  value['picture'] !== 'none' &&
                  document.querySelector(`#status-body > [data-name="${value['name']}"]`) != null
              )
          ) {
            const pictureNode = document.createElement('dt');
            pictureNode.classList.add('picture');
            newLog.appendChild(pictureNode);
            newLog.classList.add('contains-picture');

            if (!resolveMessagePicture(pictureNode, value['picture'], value['name'])) {
              pictureNode.remove();
              newLog.classList.remove('contains-picture');
            }
          }

          let newName = document.createElement('dt');
          newName.id = `line-${value['num']}-name`;
          newName.style.color = value['color'];
          newName.innerHTML = value['name'];
          if(userId == value['userId']){ newName.setAttribute('onclick',`rewriteNameOpen(${value['num']},this.innerHTML)`); }
          newLog.append(newName);
          if(value['address']){
            newLog.classList.add('secret');
            if(value['openlater']){
              newLog.classList.add('openlater');
            }
          }
        }
      }
      // システム処理（読み込み時は飛ばす）
      if(loadedLog && value['system']){
        // ルーム設定変更
        if(value['system'] === 'change'){
          alert("ゲームルーム設定が変更されました。\nリロードします。");
          location.reload();
        }
        // TOPIC更新
        else if(value['system'] === 'topic') { topicChange(value['info']); }
        // マップ操作
        else if(value['system'] === 'map') {
          updateMap(value['info'] ?? '');
        }
        // ユニット更新
        else if (value['system'].match(/^unit:\((.*?)\)$/)){
          const stts = RegExp.$1.split(' \| ');
          if (!unitList[value['name']]){
            unitList[value['name']] = { 'color': value['color'], 'status': {}, 'sttnames': [] };
            unitAdd(value['name']);
            statusListSave();
          }
          else {
            unitList[value['name']]['sttnames'] = [];
          }
          for (let i in stts) {
            if (!stts[i].includes('>')) continue;
            let array = stts[i].split('\>');
            const sttName = array.shift();
            const sttValue = array.join('\>');
            if(sttName === 'memo'){
              unitList[value['name']]['memo'] = sttValue;
            }
            else if(sttName === 'url'){
              unitList[value['name']]['url'] = sttValue;
            }
            else {
              unitList[value['name']]['status'][sttName] = sttValue;
              unitList[value['name']]['sttnames'].push(sttName);
            }
          }
          statusUpdateFlag = 1;
          statusUpdateTargets.push(value['name']);
          unitStatusFormUpdate(value['name']);
        }
        // チェック更新
        else if (value['system'].match(/^check:(0|1)/)){
          const check = Number(RegExp.$1);
          if (unitList[value['name']]){
            unitList[value['name']]['check'] = check;
            checkButtonMainVisibleToggle();
            statusUpdateFlag = 1;
            statusUpdateTargets.push(value['name']);
          }
        }
        else if (value['system'].match(/^round/)){
          for (let name in unitList) {
            unitList[name]['check'] = '';
          }
          if(value['system'].match(/^round:(.+?)$/)){
            setRound(RegExp.$1);
          }
          statusUpdateFlag = 1;
        }
        // ユニット削除
        else if (value['system'].match(/^unit-delete:(.+)/)){
          const unitName = RegExp.$1;
          if(unitList[unitName]){
            const unitId = unitList[unitName]['id'];
            delete unitList[unitName];
            const ok = unitDelete(unitId);
            if(!ok == 1) {
              value['comm'] = 'ユニット「'+unitName+'」の削除中にエラーが発生しました。';
            }
          }
          else {
            value['comm'] = 'ユニット「'+unitName+'」は存在しないため削除できませんでした。';
          }
        }
        // 入室時
        else if (value['system'].match(/^enter/)){
          //ユニット作成
          if(value['system'].match(/ unit/)){
            if (!unitList[value['userName']]){
              unitList[value['userName']] = { 'color': value['color'], 'status': {}, 'sttnames': [] };
              unitAdd(value['userName']);
              statusListSave();
            }
            statusUpdateFlag = 1;
          }
        }
        // 退室時メンバー削除
        if (value['system'].match(/^exit/)){
          if(value['userId']){
            delete memberList[value['userId']];
            addressUpdateFlag = 1;
          }
        }
        //BGM処理
        else if(value['system'].match(/^bgm/)) {
          if(value['system'].match(/^bgm:([0-9]+):(.+)$/)){
            currentBgm['url']   = RegExp.$2;
            currentBgm['vol']   = Number(RegExp.$1);
            currentBgm['title'] = value['info'];
            bgmHistory[currentBgm['url']] = [ value['info'] , currentBgm['vol'] ];
            bgmHistoryUpdate();
          }
          else {
            currentBgm['url']   = '';
            currentBgm['vol']   = 0;
            currentBgm['title'] = '－';
          }
          bgmSet();
        }
        //背景処理
        else if(value['system'].match(/^bg/)) {
          let bgUrl; let bgTitle; let mode;
          if(value['system'].match(/^bg:(?:(resize|tiling):)?(.+)$/)){
            mode = RegExp.$1 ?? 'resize';
            bgUrl  = 'url('+resolveCloudAssetUrl(RegExp.$2)+')';
            bgTitle = `<a class="link" onclick="imgView('${resolveCloudAssetUrl(RegExp.$2)}');">${value['info']}</a>`;
            bgHistory[RegExp.$2] = value['info'];
            bgHistoryUpdate();
          }
          else {
            bgUrl = getComputedStyle(document.body).getPropertyValue('background-image');
            bgTitle = '－';
          }
          document.getElementById('bg-title').innerHTML = bgTitle;
          document.querySelector('.bg-back').style.backgroundImage = document.querySelector('.bg-front').style.backgroundImage;
          document.body.removeChild(document.querySelector('.bg-front'));
          let bgFront =  document.createElement('div');
          bgFront.classList.add('bg-image','bg-front');
          bgFront.style.backgroundImage = bgUrl;
          bgFront.dataset.mode = mode;
          document.body.appendChild(bgFront);
        }
        // レディチェック
        else if (value['system'].match(/^ready$/)){
          if (!romMode) {
            soundFlag['ready'] = 1;
            document.getElementById('ready-check').classList.add('open');
          }
        }
        // タブ追加
        else if(value['system'].match(/^tab:([0-9]+)=(.*)$/)) {
          const tabNum  = RegExp.$1;
          const tabName = RegExp.$2;
          if(tabName){
            tabList[tabNum] = tabName;
            if(!document.getElementById('chat-tab'+tabNum)){ scrollOK = 1; }
            tabAdd(tabNum);
            value['tab'] = tabNum;
          }
          else {
            delete tabList[tabNum];
            document.getElementById('tablist-tab'+tabNum).remove();
            document.getElementById('chat-tab'+tabNum).remove();
          }
          tabOptionSet();
        }
      }
      // システム処理
      if(value['system']){
        // 共有メモ更新
        if(value['system'].match(/^memo:([0-9]+)$/)) {
          const num = RegExp.$1;
          let head = value['info'] ? value['info'] : shareMemo[num];
          if(value['info']) { shareMemo[num] = value['info'].replace(/<br>/g, "\n"); } else { shareMemo[num] = ''; }
          value['info'] = '';
          head = tagConvert( (head.split(/<br>/))[0] ).replace(/<.+?>/g,'');
          if(head.length > 8){ head = head.substr(0,8)+'...'; }
          value['comm'] = value['comm'].replace(/^共有メモ([0-9]+)/, "<button onclick=\"memoSelectAndZoom("+num+")\">共有メモ#$1"+(head?"("+head+")":'')+"</button>");
          memoUpdate();
          if(selectedSheet == "memo"){
            if(selectedMemo == num){ memoSelect(num); }
            else if(value['userId'] == userId){ memoSelect(num); }
          }
        }
        else if (value['system'].match(/^round:/)) {
          value['comm'] = `<h4>${value['comm']}</h4>`;
          if (value['system'] === 'round:0') {
            classes.push('round-reset');
          }
        }
        // 画像
        else if(value['system'] === 'image') {
          const url = resolveCloudAssetUrl(value['info']);
          value['info'] = `<img class="insert" src="${url}" ${ scrollOK ? 'onload="scrollBottom('+value['tab']+')"': '' }>`;
        }
        // 背景
        else if(value['system'].match(/^bg:(?:(resize|tiling):)?(.+)$/)){
          const mode = RegExp.$1 ?? 'resize';
          const url = resolveCloudAssetUrl(RegExp.$2);
          value['info'] += `<div class="insert bg" style="background-image: url(${url});" data-mode="${mode}"></div>`;
        }
        // BGM
        else if(value['system'].match(/^bgm:([0-9]+):(.+)$/)){
          const url = RegExp.$2;
          value['info'] = `<a class="link" onclick="bgmOpen()">${value['info']}</a>`;
          value['info'] += `<small>${RegExp.$1}％</small>`;
          if(url.match(/^https:\/\/youtu\.be\/(.+)$/)){
            value['info'] += ` <a class="link-yt" target="_blank" href="${url}"></a>`;
          }
        }
        // 背景/BGM削除
        else if(value['system'].match(/^(bg|bgm)$/)) {
          value['info'] = '';
        }
        // ランダム表の定義
        else if (value['system'] === 'define-random-table') {
          const m = value['comm'].match(/^(?:.+?「)(.+)(?:」.+?)$/);
          value['comm'] += tagConvert(`（ <snippet>x$${m[1]}+y</snippet> ）`.replaceAll(/</g, '&lt;').replaceAll(/>/g, '&gt;'));
        }
        // ユニット状態
        else if (value['system'] === 'state-add') {
          if (value['info'] != null && value['info'] !== '') {
            const info = JSON.parse(value['info']);
            const parts = [];
            if (info['state']['duration']) {
              const duration =
                  `${info['state']['duration']['value'] ?? ''}${info['state']['duration']['unit'] ?? ''}`;
              parts.push(`持続時間：${duration}`);
            }
            if (info['state']['source'] && info['state']['source'] !== '#self') {
              parts.push(`発生源：${info['state']['source']}`);
            }
            if (info['state']['description']) {
              parts.push(`効果：${info['state']['description']}`);
            }
            if (info['state']['additionalFieldNames'] != null) {
              for (const additionalFieldName of info['state']['additionalFieldNames']) {
                if (info['state'][additionalFieldName] != null && info['state'][additionalFieldName] !== '') {
                  parts.push(`${additionalFieldName}：${info['state'][additionalFieldName]}`);
                }
              }
            }
            value['info'] = parts.join('∥').replaceAll(/\n/g, '<br>');

            updateGlobalUnitState(info['all']);
          }

          statusUpdateFlag = 1;
          document.querySelector('body').dispatchEvent(new Event('state-added'));
        }
        else if (value['system'].match(/^state-(?:modify|remove)$/)) {
          const mode = value['system'].match(/(modify|remove)$/)[1];

          if (value['info'] != null && value['info'] !== '') {
            const info = JSON.parse(value['info']);

            if (info['differences']) {
              if (info['differences'].length > 0) {
                /**
                 * @param {string} text
                 * @return {string}
                 */
                function escape(text) {
                  const dummy = document.createElement('span');
                  dummy.textContent = text;
                  return dummy.innerHTML;
                }

                const differenceList = document.createElement('ul');
                differenceList.classList.add('state-differences');

                info['differences'].forEach(
                    /** @param {{stateId: string, stateName: string, unit: string, difference: Object<string, {before: number, after: number, unit?: string|{before: string|null, after: string|null}|null}>}} difference */difference => {
                      /** @var {HTMLElement} */
                      const unitNode =
                          differenceList.querySelector(`li[data-unit-name=${escape(difference.unit)}]`) ??
                          (unitName => {
                            const li = document.createElement('li');
                            li.classList.add('unit');
                            li.dataset.unitName = unitName;

                            const unitNameNode = document.createElement('span');
                            unitNameNode.classList.add('unit-name');
                            unitNameNode.textContent = unitName;
                            li.appendChild(unitNameNode);

                            const ul = document.createElement('ul');
                            ul.classList.add('state-list');
                            li.appendChild(ul);

                            differenceList.appendChild(li);

                            return li;
                          })(difference.unit);

                      {
                        const stateNode = document.createElement('li');
                        stateNode.classList.add('state');

                        const stateNameNode = document.createElement('span');
                        stateNameNode.classList.add('state-name');
                        stateNameNode.textContent = difference.stateName;
                        stateNode.appendChild(stateNameNode);

                        if (mode === 'modify') {
                          const propertyListNode = document.createElement('ul');
                          propertyListNode.classList.add('property-list');

                          for (const [propertyName, d] of Object.entries(difference.difference)) {
                            const propertyDifferenceNode = document.createElement('li');
                            propertyDifferenceNode.classList.add('property');

                            const propertyNameNode = document.createElement('span');
                            propertyNameNode.classList.add('property-name');
                            propertyNameNode.dataset.propertyName = propertyName;
                            propertyNameNode.textContent = (propertyName => {
                              switch (propertyName) {
                                case 'duration':
                                  return '持続時間';
                                default:
                                  return propertyName;
                              }
                            })(propertyName);
                            propertyDifferenceNode.appendChild(propertyNameNode);

                            const differenceNode = document.createElement('span');
                            differenceNode.classList.add('difference');

                            const beforeValueNode = document.createElement('span');
                            beforeValueNode.classList.add('before');
                            if (d.unit != null && d.unit !== '') {
                              beforeValueNode.dataset.unit = d.unit?.before ?? d.unit;
                            }
                            beforeValueNode.textContent = d.before?.toString() ?? '';
                            differenceNode.appendChild(beforeValueNode);

                            differenceNode.appendChild(document.createTextNode("→"));

                            const afterValueNode = document.createElement('span');
                            afterValueNode.classList.add('after');
                            if (d.unit != null && d.unit !== '') {
                              afterValueNode.dataset.unit = d.unit?.after ?? d.unit;
                            }
                            afterValueNode.dataset.value = afterValueNode.textContent = d.after?.toString() ?? '';
                            differenceNode.appendChild(afterValueNode);

                            propertyDifferenceNode.appendChild(differenceNode);

                            propertyListNode.appendChild(propertyDifferenceNode);
                          }

                          stateNode.appendChild(propertyListNode);
                        }

                        unitNode.querySelector('.state-list').appendChild(stateNode);
                      }
                    }
                );

                value['info'] = differenceList.outerHTML;
              } else {
                value['comm'] = "状態の変更がありませんでした。";
                value['info'] = '';
              }
            } else {
              value['info'] = '';
            }

            updateGlobalUnitState(info['all']);
          }

          statusUpdateFlag = 1;
          document.querySelector('body').dispatchEvent(new Event('state-modified'));
        }
        // レディチェック
        else if (value['system'].match(/^ready/)){
          if(!memberList[value['userId']]){ memberList[value['userId']] = {'name':value['name']}; }
          if     (value['system'].match(/ok/)){ memberReady[value['userId']] = 'ok'; }
          else if(value['system'].match(/no/)){ memberReady[value['userId']] = 'no'; }
          else {
            let message = value['comm'].substring(0, value['comm'].lastIndexOf(`by ${memberList[value['userId']]['name']}`)).trim();
            if (message === 'レディチェックを開始') {
              message = null;
            }
            memberReady = {};
            memberReady[value['userId']] = 'ok';
            readyStartTab = value['tab'];
            setReadyCheckMessage(message);
            value['comm'] = `<button onclick="openReadyCheckWindow(${message ? `'${btoa(encodeURI(message))}'` : ''})">レディチェックを開始</button>${message ? `<span class="ready-check-message">${message}</span>` : ''} by ${memberList[value['userId']]['name']}`;
          }
          readyCheckSet(loadedLog);
        }
        // 発言名修正
        else if(value['system'].match(/^rewritename:([0-9]+)$/)) {
          const targetNum = RegExp.$1;
          const base = document.getElementById(`line-${targetNum}-name`);
          if(base && base.parentNode.dataset.id === value['userId']){
            if(base.parentNode.classList.contains('secret')){
              base.innerHTML = base.textContent.replace(/^.* > (.+?)$/, `${value['name']} > $1`)
            }
            else {
              base.innerHTML = value['name'];
            }
            base.style.color = value['color'];
          }
          lastnumber = value['num'];
          if(scrollOK) { scrollBottom(value['tab']); }
          return;
        }
        // 発言修正
        else if(value['system'].match(/^rewrite:([0-9]+)$/)) {
          const targetNum = RegExp.$1;
          const baseComm = document.getElementById(`line-${targetNum}-comm`);
          if(baseComm && baseComm.parentNode.dataset.id === value['userId']){
            refreshNavigationFlag |= baseComm.querySelector('h1, h2, h3, h4, h5, h6') != null;
            rawLogs[targetNum] = value['comm'];
            baseComm.dataset.date += '／'+value['date'];
            baseComm.innerHTML = tagConvert(value['comm'])
            if(userId === value['userId']){
              baseComm.innerHTML += `<button class="rewrite" onclick="rewriteOpen(${targetNum})"></button>`;
            }
            baseComm.innerHTML += `<span class="rewrited"></span>`
            refreshNavigationFlag |= baseComm.querySelector('h1, h2, h3, h4, h5, h6') != null;
          }
          lastnumber = value['num'];
          if(scrollOK) { scrollBottom(value['tab']); }
          return;
        }
        // トピック
        else if (value['system'] === 'topic') {
          if (isStoryteller()) {
            if (parseInt(document.getElementById('round-value').textContent.trim()) === 0) {
              value['comm'] = null;
              value['info'] = null;
            }
          }
        }
        // マップ更新はログに流さない
        else if (value['system'] === 'map') {
          value['comm'] = null;
          value['info'] = null;
        }
      }
      
      // メンバー追加
      if(loadedLog && value['userId'] && !memberList[value['userId']]){
        addressUpdateFlag = 1;
        memberList[value['userId']] = { 'name':value['userName'], 'date':Math.floor(Date.now() / 1000) };
      }
      // ユニット色更新
      if(loadedLog && unitList[value['name']]){
        unitList[value['name']]['color'] = value['color'];
        document.querySelector("#stt-unit-"+unitList[value['name']]['id']+" dt").style.color = value['color'];
        document.querySelector("#sheet-unit-"+unitList[value['name']]['id']+" h2").style.color = value['color'];
      }
      
      // 表示情報がなければ次
      if(!value['comm'] && !value['info']){
        if(lastnumber < value['num']){ lastnumber = value['num']; }
        return;
      }
      
      // 対象のタブ
      const targetTab = document.getElementById("chat-logs-tab"+value['tab']);
      if(!targetTab){
        lastnumber = value['num'];
        return;
      }

      // 名前追加
      if(newLog){
        targetTab.appendChild(newLog);
      }
      
      // コメント処理
      if(value['comm']){
        rawLogs[value['num']] = value['comm'];
        const targetDl = targetTab.lastElementChild;
        if(!romMode && userId !== value['userId'] && !targetDl.classList.contains('system')){
          [soundFlag['mark'] , value['comm']] = wordMark(value['comm']);
        }
        value['comm'] = tagConvert(value['comm']);
        let newComm = document.createElement('dd');
        newComm.id = 'line-' + value['num'] + '-comm';
        newComm.classList.add('comm');
        if (classes.length > 0) {
          newComm.classList.add(...classes);
        }
        newComm.dataset.date = value['date'];
        newComm.innerHTML = value['comm'];
        if(!targetDl.classList.contains('system') && userId === value['userId']){ newComm.innerHTML += `<button class="rewrite" onclick="rewriteOpen(${value['num']})"></button>` }
        targetDl.appendChild(newComm);
        targetDl.style.gridTemplateRows = `max-content repeat(${targetDl.querySelectorAll('dd').length}, max-content) 1fr`;
        refreshNavigationFlag |= newComm.querySelector('h1, h2, h3, h4, h5, h6') != null;
        soundFlag['normal'] = 1;
      }
      if(value['info']){
        let newInfo = document.createElement('dd');
        if(value['system']){
          if     (value['system'].match(/^unit/)){ newInfo.classList.add('unit'); }
          else if(value['system'].match(/^choice/)){ newInfo.classList.add('choice'); }
          else if(value['system'].match(/^deck/)){ newInfo.classList.add('choice'); }
          else if(value['system'].match(/^check/)){ newInfo.classList.add('dice'); }
          else if(value['system'].match(/^dice:?(.*)$/) ){ newInfo.classList.add('dice'); newInfo.dataset.game = RegExp.$1; }
          
          if(value['system'].match(/^(topic|choice|deck)/)) { value['info'] = tagConvert(value['info']) }
          else if(value['system'].match(/^(unit)/)) { value['info'] = tagConvertUnit(value['info']) }
          else { value['info'] = dashSet(value['info']) }
        }
        newInfo.classList.add('info');
        newInfo.id = 'line-' + value['num'] + '-info';
        newInfo.dataset.date = value['date'];
        if(value['code']){ newInfo.dataset.code = htmlUnEscape(value['code']); }
        newInfo.innerHTML = value['info'];
        targetTab.lastElementChild.appendChild(newInfo);

        if (newInfo.classList.contains('dice')) {
          const rowCount = newInfo.innerHTML.split('<br>').length;

          // ５行以上のダイスロール結果は折り畳めるようにする.
          if (rowCount >= 5) {
            newInfo.innerHTML = `<details open><summary><span class="code">${newInfo.dataset.code}</span><span class="row-count">[${rowCount} rows]</span></summary>${newInfo.innerHTML}</details>`;
          }
        }

        // ランダム表の結果をスニペット化する.
        newInfo.querySelectorAll('.chart-result').forEach(
            info => {
              const source = info.textContent.trim();
              const indexOfDelimiter = source.indexOf(':');
              const key = source.substring(0, indexOfDelimiter + 1);
              const result = source.substring(indexOfDelimiter + 1);
              info.innerHTML = tagConvert(`<snippet>${result}</snippet>`.replaceAll('<', '&lt;').replaceAll('>', '&gt;'));
              info.prepend(document.createTextNode(key));
            }
        );

        // 貫通・突破の結果をスニペット化する.
        newInfo.querySelectorAll('.hit-labels').forEach(
            x => x.innerHTML = tagConvert(`<snippet>${x.textContent}</snippet>`.replaceAll('<', '&lt;').replaceAll('>', '&gt;'))
        );

        // 成長ロールの結果をスニペット化する.
        newInfo.querySelectorAll('.grow-result-unit').forEach(
            x => x.innerHTML = tagConvert(`<snippet>${x.textContent}</snippet>`.replaceAll('<', '&lt;').replaceAll('>', '&gt;'))
        );

        soundFlag['normal'] = 1;
      }
      
      // 最終処理
      beforeUser[value['tab']] = value['userId'];
      beforeName[value['tab']] = value['name'];
      beforeColor[value['tab']] = value['color'];
      beforePicture[value['tab']] = value['picture'];
      beforeSecret[value['tab']] = value['address'];
      beforeLater[value['tab']] = value['openlater'];
      lastTab = Number(value['tab']);
      if(lastnumber < value['num']){ lastnumber = value['num']; }
      // スクロールする／しないなら未読数追加
      if(scrollOK) {
        scrollBottom(value['tab']);
      }
      else {
        const notice  = document.querySelector('#chat-tab'+value['tab']+' > .notice-unread');
        const list    = document.querySelector('#tablist-tab'+value['tab']);
        notice.dataset.unread  = Number( notice.dataset.unread) + 1;
        list.dataset.unread    = Number(   list.dataset.unread) + 1;
      }
    });
    // ナビゲーション更新
    if (refreshNavigationFlag) {
      refreshHeadlineNavigator();
    }
    // ステータス更新
    if(statusUpdateFlag){
      statusUpdate(statusUpdateTargets.length > 0 ? statusUpdateTargets : null);
    }
    // メンバー一覧更新
    if(addressUpdateFlag){
      addressUpdate();
    }
    // 着信音声
    if(beforeLastnumber && Object.keys(soundFlag).length > 0){
      const master = config.volumes['master'] / 100;
      if(master > 0){
        let sound; let vol = 0;
        if     (soundFlag['ready']){ sound = new Audio(config.seType['ready']||defSeType['ready']); vol = config.volumes['ready']; }
        else if(soundFlag['mark'] ){ sound = new Audio(config.seType['mark']||defSeType['mark']);  vol = config.volumes['mark']; }
        if(vol < 1){
          sound = new Audio(config.seType['chat'+lastTab]||defSeType['chat']);
          vol = config.volumes['chat'];
        }
        if(!muteOn && sound && vol > 0){
          const se = sound;
          se.volume = (vol / 100) * master;
          se.currentTime = 0;
          se.play();
        }
      }
    }
    beforeLastnumber = lastnumber;
    loadedLog++;
    // チャットパレット更新
    if(data['palette']){
      Object.keys(data['palette']).forEach( (unitName) => {
        if(unitList[unitName]){
          const id = unitList[unitName]['id'];
          const paletteText = data['palette'][unitName]
          
          if(unitList[unitName]['palette'] !== paletteText){
            document.querySelector(`#sheet-unit-${id} .chat-palette.texts`).value = paletteText;
            unitList[unitName]['palette'] = paletteText;
            paletteSet(id, paletteText);
            console.log('チャットパレット更新:'+unitName)
          }
        }
      });
    }

    // 発言者画像設定
    if (data['pictures']) {
      for (const unitName of Object.keys(data['pictures'])) {
        const base64 = data['pictures'][unitName];
        const uriEncoded = atob(base64);
        const json = decodeURIComponent(uriEncoded);
        const settings = JSON.parse(json);

        for (const item of settings) {
          const pictureId = item['id'];
          const pictureName = item['name'];
          const pictureUrl = item['url'];

          addPictureSettings(unitName, pictureId, pictureName, pictureUrl);
        }
      }
    }
  })
  .catch(error => {
    console.error('新規ログの取得に失敗: ', error);
  })
  .finally(data => {
    lock = 0;
    if (onCompleted instanceof Function) {
      onCompleted();
    }
  });
}
function refreshHeadlineNavigator() {
  const tab = document.getElementById('chat-tab1');

  if (tab == null) {
    return;
  }

  /** @var {Object<string, {node: HTMLElement, isOld: boolean}>} */
  const headlineNodes = {};

  const old = oldLogs[tab.dataset.tab] ?? [];

  old.concat([tab]).forEach(
      (logNode, index) => logNode.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(
          headlineNode => {
            if (headlineNode.nodeName === 'H4' && headlineNode.closest('dd.comm.round-reset') != null) {
              return;
            }

            const headlineLevel = parseInt(headlineNode.nodeName.match(/^h([1-6])$/i)[1]);

            for (let level = headlineLevel + 1; level <= 6; level++) {
              delete headlineNodes[level.toString()];
            }

            headlineNodes[headlineLevel.toString()] = {
              node: headlineNode,
              isOld: index < old.length
            };
          }
      )
  );

  const headlineNav =
      tab.querySelector('.headline-list') ??
      (tab => {
        const headlineNav = document.createElement('nav');
        headlineNav.classList.add('headline-list-container');
        headlineNav.innerHTML = `
            <div class="headline-list">
                <div class="level" data-level="1">
                    <a class="headline-text" data-level="1"></a>
                    <div class="level" data-level="2">
                        <a class="headline-text" data-level="2"></a>
                        <div class="level" data-level="3">
                            <a class="headline-text" data-level="3"></a>
                            <div class="level" data-level="4">
                                <a class="headline-text" data-level="4"></a>
                                <div class="level" data-level="5">
                                    <a class="headline-text" data-level="5"></a>
                                    <div class="level" data-level="6">
                                        <a class="headline-text" data-level="6"></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        headlineNav.querySelectorAll('.headline-text').forEach(
            a => a.addEventListener(
                'click',
                () => {
                  const relatedId = a.dataset.relatedId;

                  if (relatedId === '') {
                    return;
                  }

                  const logContainer = a.closest('.chat.view').querySelector('.logs');
                  const targetNode = logContainer.querySelector(`#${relatedId}`);

                  if (targetNode == null) {
                    console.warn(`Node #${relatedId} is not found.`);
                    return;
                  }

                  const targetY =
                      targetNode.getBoundingClientRect().top + logContainer.scrollTop - headlineNav.getBoundingClientRect().height - logContainer.getBoundingClientRect().height / 5;

                  logContainer.scroll({top: targetY, behavior: 'smooth'});
                }
            )
        );

        tab.prepend(headlineNav);
        return headlineNav;
      })(tab);

  for (let headlineLevel = 1; headlineLevel <= 6; headlineLevel++) {
    const headlineTextNode = headlineNav.querySelector(`.level[data-level="${headlineLevel}"] > .headline-text`);
    headlineTextNode.innerHTML = '';
    headlineTextNode.removeAttribute('data-related-id');
  }

  for (const [headlineLevel, o] of Object.entries(headlineNodes)) {
    const headlineTextNode = headlineNav.querySelector(`.level[data-level="${headlineLevel}"] > .headline-text`);
    headlineTextNode.innerHTML = o.node.innerHTML;
    headlineTextNode.dataset.relatedId =
        o.isOld
            ? ''
            : o.node.closest('.comm[id]')?.getAttribute('id') ?? '';
  }
}
// 文字装飾 ----------------------------------------
function quoteCreate(comm) {
  function core(comm) {
    if (!comm.includes('&gt;')) {
      return comm;
    }

    const lines = [];
    /** @var {null|Array<string>} */
    let currentQuoted = null;
    for (const line of comm.split('\n')) {
      const m = line.match(/^&gt;\s*(.+?)\s*$/);
      if (m == null) {
        if (currentQuoted != null) {
          lines.push(`&lt;quoted&gt;\n${currentQuoted.join('\n')}\n&lt;/quoted&gt;`);
          currentQuoted = null;
        } else if (lines.length > 0) {
          lines.push('\n');
        }
        lines.push(line);
      } else {
        if (currentQuoted == null) {
          currentQuoted = [];
        }
        currentQuoted.push(m[1]);
      }
    }

    if (currentQuoted != null) {
      lines.push(`&lt;quoted&gt;\n${currentQuoted.join('\n')}\n&lt;/quoted&gt;`);
    }

    const resolved = lines.join('');

    if (resolved !== comm && /(&gt;|\n)&gt;/.test(resolved)) {
      return quoteCreate(resolved);
    }

    return resolved;
  }

  return core(comm)
      .replaceAll(/&lt;quoted&gt;\n+/g, '&lt;quoted&gt;')
      .replaceAll(/\n+&lt;\/quoted&gt;/g, '&lt;/quoted&gt;');
}
function tagConvert (comm){
  function resolveDataStructure(source) {
    return source.replaceAll(/(?:&lt;|<)data-structure(?:&gt;|>)(.+?)(?:&lt;|<)\/data-structure(?:&gt;|>)/gim, makeDataStructure);
  }

  comm = resolveDataStructure(comm);

  comm = comm
    .replaceAll('<br>',"\n")

  const pictureUrls = [];
  comm = comm.replace(
      /&lt;picture&gt;(.+?)&lt;\/picture&gt;/g,
      (_, url) => {
        const index = pictureUrls.length;
        pictureUrls.push(url);
        return `<img data-url-index="${index}" />`;
      }
  );

  let linkURL = [];
  comm = comm
    .replace(/\[\[(.+?)&gt;(https?:\/\/[^\s\<]+)\]\]/g, (all, text, url)=>{
      linkURL.push(url)
      return `<a href="<!url#${linkURL.length}>" target="_blank">${text}</a>`
    })
    .replace(/https?:\/\/[^\s\<]+/g, (url)=>{
      linkURL.push(url)
      return `<a href="<!url#${linkURL.length}>" target="_blank"><!url#${linkURL.length}></a>`
    })
  
  comm = dashSet(comm);
  
  comm = comm
    .replace(/&lt;br&gt;/gi,'<br>')
    .replace(/&lt;hr&gt;/gi,'<hr>');

  while (/(^|\n|>)-{3,}(<|\n|$)/.test(comm)) {
    comm = comm
      .replace(/(^|\n|>)-{3,}(<)?(\n|$)/, '$1<hr>$2');
  }

  {
    const re = /(^|\n|>)(#{1,6})\s*(.+?)($|\n)/;
    let m;
    while (m = comm.match(re)) {
      const level = m[2].length;
      const text = m[3];
      comm = (
          comm.substr(0, m.index) +
          (m[1] === '\n' || m[1] === '>' ? m[1] : '') +
          `<h${level}>${text}</h${level}>` +
          comm.substr(m.index + m[0].length)
      );
    }
  }

  comm = quoteCreate(comm);

  comm = comm
    .replace(/(^\s*・(?!・)\s*.+?(\n|$))+/gim, makeFuncToCreateList('・'))
    .replace(/(^\s*\*\s*.+?(\n|$))+/gim, makeFuncToCreateList('*', ' '))
    .replace(/(?:^(?:\|(?:.*?))+\|[hc]?(?:\n|$))+/gim, tableCreate)
    .replace(/&lt;ruby&gt;(.+?)&lt;rt&gt;(.*?)&lt;\/ruby&gt;/gi,'<ruby>$1<rt>$2</ruby>')
    .replace(/[|｜ǀ∣│┃](.+?)《(.*?)》/gi,'<ruby>$1<rp>(</rp><rt>$2</rt><rp>)</rp></ruby>')
    .replace(/([♠♤♥♡♣♧♦♢]+)/gi,'<span class="trump">$1</span>')
    .replace(/:([a-z0-9_]+?):/g,'<span class="material-symbols-outlined"><i>:</i>$1<i>:</i></span>')
  
  comm = makeGridByBoxDrawingCharacters(comm);
  
  Object.keys(replaceRule).forEach(key => {
    comm = comm.replaceAll(key, replaceRule[key]);
  });
  replaceRegex.forEach(item => {
    for (const [key, value] of Object.entries(item)) {
      comm = comm.replace(new RegExp(key.replaceAll(/</g, '&lt;').replaceAll(/>/g, '&gt;'),'gu'), value);
    }
  });
  
  comm = comm.replace(/<ruby>(.+?)(?:<rp>\(<\/rp>)?<rt>(.*?)(?:<rp>\)<\/rp>)?<\/ruby>/gi,'<ruby><rp>｜</rp>$1<rp>《</rp><rt>$2<rp>》</rp></ruby>');

  comm = resolveFormula(comm);

  comm = comm.replace(/&lt;unit:\s*([^\/]+?)\s*\/&gt;/g, '&lt;unit:$1&gt;$1&lt;/unit&gt;');
  comm = comm.replace(/&lt;unit:\s*(.+?)\s*&gt;(.+?)&lt;\/unit&gt;/g, '<span class="unit-reference" data-unit-name="$1">$2</span>');

  let tooltipSet = [];
  let str = '';
  while(comm && comm !== str){
    str = comm;
    comm = comm
      .replace(/'''(.*?)'''/gis, '<i>$1</i>')
      .replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/gis       ,'<b>$1</b>')
      .replace(/''(.*?)''/gis, '<b>$1</b>')
      .replace(/\*\*(.*?)\*\*/gis, '<b>$1</b>')
      .replace(/&lt;i&gt;(.*?)&lt;\/i&gt;/gis       ,'<i>$1</i>')
      .replace(/&lt;s&gt;(.*?)&lt;\/s&gt;/gis       ,'<s>$1</s>')
      .replace(/%%(.*?)%%/gis,'<s>$1</s>')
      .replace(/~~(.*?)~~/gis,'<s>$1</s>')
      .replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/gis       ,'<span class="under">$1</span>')
      .replace(/__(.*?)__/gis, '<span class="under">$1</span>')
      .replace(/&lt;o&gt;(.*?)&lt;\/o&gt;/gis       ,'<span class="over">$1</span>')
      .replace(/&lt;em&gt;(.*?)&lt;\/em&gt;/gis     ,'<em>$1</em>')
      .replace(/《《(.*?)》》/gis, '<em>$1</em>')
      .replace(/&lt;mi&gt;(.*?)&lt;\/mi&gt;/gis     ,'<i class="serif">$1</i>')
      .replace(/&lt;hide&gt;(.*?)&lt;\/hide&gt;/gis  ,'<span class="hide">$1</span>')
      .replace(/{{(.*?)}}/gis ,'<span class="hide">$1</span>')
      .replace(/&lt;big&gt;(.*?)&lt;\/big&gt;/gis    ,'<span class="large">$1</span>')
      .replace(/&lt;small&gt;(.*?)&lt;\/small&gt;/gis,'<span class="small">$1</span>')
      .replace(/&lt;c:([0-9a-zA-Z\#]*?)&gt;(.*?)&lt;\/c&gt;/gis,'<span style="color:$1">$2</span>')
      .replace(/&lt;left&gt;(.*?)&lt;\/left&gt;/gis    ,'<div class="left">$1</div>')
      .replace(/&lt;center&gt;(.*?)&lt;\/center&gt;\n?/gis,'<div class="center">$1</div>')
      .replace(/&lt;right&gt;(.*?)&lt;\/right&gt;\n?/gis  ,'<div class="right">$1</div>')
      .replace(/&lt;add-line-spacing&gt;(.*?)&lt;\/add-line-spacing&gt;\n?/gis  ,'<div class="add-line-spacing">$1</div>')
      .replace(/&lt;quoted&gt;(.*?)&lt;\/quoted&gt;\n?/gis  ,'<blockquote class="decoration">$1</blockquote>')
      .replace(/&lt;h([1-6])&gt;(.*?)&lt;\/h\1&gt;\n?/gis ,'<h$1>$2</h$1>')
      .replace(/&lt;tip&gt;(.*?)=&gt;(.*?)&lt;\/tip&gt;/gi, (all,term,desc) => {
        tooltipSet.push( { 'term':term, 'desc':desc } );
        return `<!tooltip#${tooltipSet.length}>`;
      })
      .replace(/&lt;snippet&gt;(.+?)&lt;\/snippet&gt;/i, '<code class="snippet" onclick="onSnippetClicked(this)">$1</code>')
      .replace(/<!url#([0-9]+)>/gi, (all,num) => {
        return linkURL[Number(num)-1];
      })
      .replace(
          /<img data-url-index="(.+?)" \/>/g,
          (_, indexText) => `<img class="picture" src="${resolveCloudAssetUrl(pictureUrls[Number(indexText)])}" alt="picture" onload="scrollBottom(1)" onclick="imgView(this.src)" />`
      )
  }
  comm = comm.replaceAll(/(<\/ul>)\n/g, '$1');
  Object.keys(tooltips).forEach(key => {
    if (!key) return;
    if(comm.match(key)){
      comm = comm.replace(new RegExp(key,'g'), (term) => {
        tooltipSet.push( { 'term':term, 'desc':resolveDataStructure(tooltips[key]) } );
        return `<!tooltip#${tooltipSet.length}>`;
      });
    }
  });
  comm = comm.replace(/<!tooltip#([0-9]+)>/gi, (all,num) => {
    return `<div class="tooltip" onmouseover="tooltipHover(event)">${tooltipSet[Number(num)-1]['term']}<div class="tooltip-text">${dashSet(tooltipSet[Number(num)-1]['desc'])}</div></div>`;
  })

  return comm.replaceAll('\n',"<br>");
}
function tagConvertUnit (comm){
  comm = comm
    .replaceAll('<br>',"\n")

  let linkURL = [];
  comm = comm
    .replace(/<chara-image:(https?:\/\/[^\s\<]+)(?:,(.+?))(?:,(.+?))>/g, (all, url, fit, position)=>{
      linkURL.push(url)
      return `<div class="chara-image" style="background-image:url(<!url#${linkURL.length}>);background-size:${fit};background-position:${position};"></div>`
    })
    .replace(/<a href="(https?:\/\/[^\s\<]+)"/g, (all, url)=>{
      linkURL.push(url)
      return `<a href="<!url#${linkURL.length}>"`
    })
    .replace(/\[\[(.+?)>(https?:\/\/[^\s\<]+)\]\]/g, (all, text, url)=>{
      linkURL.push(url)
      return `<a href="<!url#${linkURL.length}>" target="_blank">${text}</a>`
    })
    .replace(/https?:\/\/[^\s\<]+/g, (url)=>{
      linkURL.push(url)
      return `<a href="<!url#${linkURL.length}>" target="_blank"><!url#${linkURL.length}></a>`
    })
  
  comm = dashSet(comm);

  comm = comm
    .replace(/<!url#([0-9]+)>/gi, (all,num) => {
      return linkURL[Number(num)-1];
    })
  
  return comm.replaceAll('\n',"<br>");
}
function makeFuncToCreateList (sign, space = '') {
  const re = new RegExp(`^\\s*[${sign}]${space}\\s*`, 'gm');
  return (text, _, eol) => '<ul>' + text.replace(re, '<li>').replace(/\n/, '') + '</ul>' + (eol.match(/[\n\r]/) ? eol : '');
}
function tableCreate (text){
  let output = '';
  let data = [];
  text.trim().split("\n").forEach(line => {
    if    (line.match(/c$/)){ output += tableColCreate(line); }
    else if(line.match(/h$/)){ output += tableHeaderCreate(line); }
    else {
      line = line.replace(/^\|/,'').replace(/\|$/,'');
      data.push(line.split('|'));
    }
  });
  let rowNum = 0;
  for (let row of data){
    if(!row) continue;
    output += "<tr>";
    let colNum = 0;
    let colspan = 1;
    for (let col of row){
      let rowspan = 1;
      let td = 'td';
      while(data[rowNum+rowspan] && data[rowNum+rowspan][colNum] && data[rowNum+rowspan][colNum] === '~'){ rowspan++; }
      colNum++;
      if     (col === '&gt;') { colspan++; continue; }
      else if(col === '~')    { continue; }
      else if(String(col).match(/^~/)){ col = col.slice(1); td = 'th' }
      output += "<"+td;
      if(colspan > 1){ output += ` colspan="${colspan}"`; }
      if(rowspan > 1){ output += ` rowspan="${rowspan}"`; }
      const classes = [];
      col = col.trim();
      if (
          (col.startsWith('&lt;center&gt;') && col.endsWith('&lt;/center&gt;')) ||
          (col.startsWith('&lt;right&gt;') && col.endsWith('&lt;/right&gt;'))
      ) {
        const m = col.match(/^&lt;(center|right)&gt;(.*?)&lt;\/(?:center|right)&gt;$/i);
        classes.push(`align-${m[1]}`);
        col = m[2];
      }
      if (classes.length > 0) {
        output += ` class="${classes.join(' ')}"`;
      }
      output += `>${col}</${td}>`;
    }
    output += "</tr>";
    rowNum++;
  }
  return '<table>'+output+'</table>';
}
function tableColCreate(text) {
  let out;
  let col = text.split('|');
  for(let value of col){
    out.push(tableStyleCreate(value));
  }
  return '<colgroup>'+out.join('')+'</colgroup>';
}
function tableStyleCreate(text) {
  if(text.match(/([0-9]+)(px|em|\%)/)){
    let num = RegExp.$1; const type = RegExp.$2;
    if     (type === 'px' && num > 300){ num = 300 }
    else if(type === 'em' && num >  20){ num =  20 }
    else if(type ===  '%' && num > 100){ num = 100 }
    return `<col style="width:calc(${num}${type} + 1em)">`;
  }
  else { return '<col>' }
}
function tableHeaderCreate(line) {
  line = line.replace(/^\|/,'').replace(/\|h$/,'');
  let output = "<thead><tr>";
  let colspan = 1;
  for (let col of line.split('|')){
    let td = 'td';
    if     (col === '&gt;'){ colspan++; continue; }
    else if(String(col).match(/^~/)){ col = col.slice(1); td = 'th' }
    output += "<"+td;
    if(colspan > 1){ output += ` colspan="${colspan}"`; }
    output += '>'+col;
  }
  output += "</tr></thead>";
  return output;
}

/**
 * @param {string} source
 * @return {string}
 */
function resolveFormula(source) {
  if (source.includes('&lt;f&gt;')) {
    return resolveFormula(
        source
            .replaceAll('&lt;f&gt;', '&lt;formula&gt;')
            .replaceAll('&lt;/f&gt;', '&lt;/formula&gt;')
    );
  }

  if (!/&lt;formula&gt;/i.test(source)) {
    return source;
  }

  /**
   * @param {string} formula
   * @return {Number}
   */
  function resolveOperands(formula) {
    if (!/^[-+/*\d]+$/.test(formula)) {
      throw new Error(`Invalid formula: [${formula}]`);
    }

    return Function(`return (${formula})`)();
  }

  /**
   * @param {string} formula
   * @return {Number}
   */
  function resolve(formula) {
    let current = formula;

    while (/\([-+/*\d]+\)/.test(current)) {
      current = current.replace(/\(([-+/*\d]+)\)/, (_, part) => resolveOperands(part).toString());
    }

    return resolveOperands(current);
  }

  return source.replace(
      /&lt;formula&gt;\s*(.+?)\s*&lt;\/formula&gt;/ig,
      (_, contents) => {
        if (/^[-+]?\d+$/.test(contents)) {
          // 単項の数値であればそのままの文字列にする.
          return contents;
        }

        const formulaNode = document.createElement('span');
        formulaNode.classList.add('formula');

        const leftNode = document.createElement('span');
        leftNode.classList.add('left');
        leftNode.innerHTML = contents;
        formulaNode.appendChild(leftNode);

        const equalsSignNode = document.createElement('i');
        equalsSignNode.classList.add('equals-sign');
        equalsSignNode.textContent = '=';
        formulaNode.appendChild(equalsSignNode);

        const rightNode = document.createElement('span');
        rightNode.classList.add('right');
        if (contents.includes('{')) {
          rightNode.textContent = '?';
          rightNode.classList.add('unresolved');
        } else {
          try {
            rightNode.innerHTML = `&lt;snippet&gt;${resolve(contents)}&lt;/snippet&gt;`;
          } catch (e) {
            console.error(e);
            rightNode.textContent = 'ERROR';
            rightNode.classList.add('error');
          }
        }
        formulaNode.appendChild(rightNode);

        return formulaNode.outerHTML;
      }
  );
}
// 連続ダッシュ接続 ----------------------------------------
function dashSet (comm){
  return comm.replace(/(―+)/g,'<span class="dash">$1</span>');
}
// ワード強調処理 ----------------------------------------
function wordMark (comm){
  let hit = 0;
  let wordList = config.markList.concat();
  if(config.markName == 1) { wordList.unshift(nameList[0]['name']); }
  for (let i in config.exceptList){
    if(config.exceptList[i] && comm.match(config.exceptList[i])) return [0,comm];
  }
  for (let i in wordList){
    if(!wordList[i]) continue;
    comm = comm.replace(wordList[i], ( str, offset, s ) => {
      const greater = s.indexOf( '>', offset );
      const lesser = s.indexOf( '<', offset );
      if( greater < lesser || ( greater != -1 && lesser == -1 ) ) { return str; }
      else { hit = 1; return '<mark>' + str +'</mark>'; }
    });
  }
  return [hit,comm];
}

/**
 * @param {string} sourceTag
 * @return {string}
 */
function makeDataStructure(sourceTag) {
  const m = sourceTag.match(/^(?:&lt;|<)data-structure(?:&gt;|>)\s*(.+?)\s*(?:&lt;|<)\/data-structure(?:&gt;|>)$/);
  const sourceJson = m != null ? m[1] : null;

  return sourceJson != null ? createDataStructureNodeByJson(sourceJson)?.outerHTML ?? '' : '';
}

/**
 * @param {string} source
 * @return {string}
 */
function makeGridByBoxDrawingCharacters(source) {
  if (!/[┌┏][─━┄┅┈┉┬┭┮┯┰┱┲┳]+[┐┓]/.test(source)) {
    return source;
  }

  const sourceLines = source.split('\n');
  const destinationLines = [];
  const gridSourceLines = [];

  /**
   * @param {Array<string>} sourceLines
   * @return {string}
   */
  function makeGridBox(sourceLines) {
    /** @var {Array<string[]>} */
    const parts = [];

    for (let sourceLineIndex = 0; sourceLineIndex < sourceLines.length; sourceLineIndex++) {
      const sourceLine = sourceLines[sourceLineIndex];

      if (sourceLineIndex % 2 === 1) {
        /**
         * @param {string} source
         * @return {Array<string>}
         */
        function splitToParts1(source) {
          let text = source;
          const parts = [];

          while (text !== '') {
            const m = text.match(/[│┃┆┇┊┋╎╏]/);

            if (m == null) {
              console.warn(text);
              break;
            }

            if (m.index > 0) {
              parts.push(text.substring(0, m.index));
            }

            parts.push(m[0]);

            text = text.substring(m.index + m.length);
          }

          if (text !== '') {
            parts.push(text);
          }

          return parts.map(x => /^[\s　]+$/.test(x) ? '' : x);
        }

        parts.push(splitToParts1(sourceLine));
      } else {
        /**
         * @param {string} source
         * @return {Array<string>}
         */
        function splitToParts2(source) {
          let text = source;
          const parts = [];

          while (text !== '') {
            const m = text.match(/[┌┍┎┏┐┑┒┓└┕┖┗┘┙┚┛├┝┞┟┠┡┢┣┤┥┦┧┨┩┪┫┬┭┮┯┰┱┲┳┴┵┶┷┸┹┺┻┼┽┾┿╀╁╂╃╄╅╆╇╈╉╊╋]/);

            if (m == null) {
              console.warn(text);
              break;
            }

            if (m.index > 0) {
              parts.push(text.substring(0, m.index).charAt(0));
            }

            parts.push(m[0]);

            text = text.substring(m.index + m.length);
          }

          if (text !== '') {
            parts.push(text);
          }

          return parts.map(x => /^[\s　]+$/.test(x) ? '' : x);
        }

        parts.push(splitToParts2(sourceLine));
      }
    }

    const gridElement = document.createElement('div');
    gridElement.classList.add('content-grid');

    for (let sourceRowIndex = 1; sourceRowIndex < parts.length; sourceRowIndex += 2) {
      const destinationRowIndex = Math.ceil(sourceRowIndex / 2);

      for (let sourceColumnIndex = 1; sourceColumnIndex < parts[sourceRowIndex].length; sourceColumnIndex += 2) {
        const destinationColumnIndex = Math.ceil(sourceColumnIndex / 2);

        const content = parts[sourceRowIndex][sourceColumnIndex] ?? '';
        const leftSide = parts[sourceRowIndex][sourceColumnIndex - 1] ?? '│';
        const rightSide = parts[sourceRowIndex][sourceColumnIndex + 1] ?? '│';
        const topSide = parts[sourceRowIndex - 1][sourceColumnIndex] ?? '─';
        const bottomSide = (parts[sourceRowIndex + 1] ?? [])[sourceColumnIndex] ?? '─';

        const itemElement = document.createElement('div');
        itemElement.classList.add('grid-item');
        itemElement.textContent = content;
        itemElement.style.gridRowStart = destinationRowIndex.toString();
        itemElement.style.gridColumnStart = destinationColumnIndex.toString();

        /**
         * @param {string} character
         * @return {string}
         */
        function getHorizontalSideCodeByCharacter(character) {
          if (character === '│') {
            return 'thin';
          } else if (character === '┃') {
            return 'bold';
          } else if (/^[┆┇┊┋╎╏]$/.test(character)) {
            return 'dash';
          } else {
            console.warn(`Unexpected character: ${character}`);
            return '';
          }
        }

        /**
         * @param {string} character
         * @return {string}
         */
        function getVerticalSideCodeByCharacter(character) {
          if (character === '─') {
            return 'thin';
          } else if (character === '━') {
            return 'bold';
          } else if (/^[┄┅┈┉╌╍]$/.test(character)) {
            return 'dash';
          } else {
            console.warn(`Unexpected character: ${character}`);
            return '';
          }
        }

        itemElement.dataset.leftSide = getHorizontalSideCodeByCharacter(leftSide);
        itemElement.dataset.rightSide = getHorizontalSideCodeByCharacter(rightSide);
        itemElement.dataset.topSide = getVerticalSideCodeByCharacter(topSide);
        itemElement.dataset.bottomSide = getVerticalSideCodeByCharacter(bottomSide);

        gridElement.appendChild(itemElement);
      }
    }

    return gridElement.outerHTML;
  }

  for (const sourceLine of sourceLines) {
    if (/^\s*[┌┏][─━┄┅┈┉┬┭┮┯┰┱┲┳]+[┐┓]\s*$/.test(sourceLine)) {
      gridSourceLines.push(sourceLine.trim());
    } else if (/^\s*[└┗][─━┄┅┈┉┴┵┶┷┸┹┺┻]+[┘┛]\s*$/.test(sourceLine)) {
      gridSourceLines.push(sourceLine.trim());
      destinationLines.push(makeGridBox(gridSourceLines.slice()));
      gridSourceLines.splice(0);
    } else if (gridSourceLines.length > 0) {
      gridSourceLines.push(sourceLine.trim());
    } else {
      destinationLines.push(sourceLine);
    }
  }

  return destinationLines.join('\n');
}

/**
 * @param {HTMLElement} snippetNode
 */
function onSnippetClicked(snippetNode) {
  navigator.clipboard.writeText(snippetNode.textContent.trim()).catch(
      x => alert(`クリップボードへのコピーに失敗しました。\n( ${x} )`)
  );
}

// 発言者画像 ----------------------------------------
/**
 * @param {HTMLElement} pictureNode
 * @param {string} pictureUrl
 * @param {string} unitName
 */
function resolveMessagePicture(pictureNode, pictureUrl, unitName) {
  if (pictureNode.classList.contains('resolved')) {
    return true;
  }

  let url = pictureUrl;

  if ((url == null || url === '') && unitName != null && unitName !== '') {
    const unitNode = document.querySelector(`#status-body > [data-name="${unitName}"][data-image-url]`);
    if (unitNode != null) {
      url = unitNode.dataset.imageUrl;
    }
  }

  if (url != null && url !== '') {
    url = resolveCloudAssetUrl(url);

    let className;
    if (url in pictureClasses) {
      className = pictureClasses[url];
    } else {
      className = `style-${randomId(16)}`;
      pictureClasses[url] = className;

      const styleNode = document.createElement('style');
      styleNode.textContent = `.${className} > span { background-image: url(${url}); }`;
      document.querySelector('head').appendChild(styleNode);
    }

    {
      const pictureCoreNode = document.createElement('span');

      pictureCoreNode.addEventListener('click', () => imgView(url));

      pictureNode.appendChild(pictureCoreNode);
    }

    pictureNode.classList.add(className, 'resolved');
    pictureNode.parentNode.classList.add('picture-resolved');

    return true;
  }

  return false;
}

// トピック変更 ----------------------------------------
let rawTopic = '';
function topicChange (topicValue){
  rawTopic = topicValue || '';
  const topicElement = document.getElementById("topic-value");

  if (topicElement.classList.contains('storyteller-keywords')) {
    storyteller.updateTopicNode(topicElement, topicValue);
    return;
  }

  topicElement.innerHTML = tagConvert(rawTopic);

  topicElement.querySelectorAll('a[href]').forEach(
      hyperlinkElement => {
        const uri = hyperlinkElement.getAttribute('href');
        if (!uri.match(/\.(png|gif|webp|jpe?g|svg)($|\?)/i)) {
          return;
        }

        const imageElement = document.createElement('img');
        imageElement.setAttribute('src', uri);
        imageElement.setAttribute('loading', 'lazy');

        const imageContainerElement = document.createElement('span');
        imageContainerElement.classList.add('image-container');
        imageContainerElement.append(imageElement);

        hyperlinkElement.after(imageContainerElement);
        hyperlinkElement.parentNode.removeChild(hyperlinkElement);

        imageElement.addEventListener('click', () => imgView(uri));
      }
  );
}

/**
 * @param {string} encodedSourceText
 */
function updateMap(encodedSourceText) {
  document.querySelectorAll('.map-window').forEach(
      node => node.dispatchEvent(
          new MapUpdateEvent(encodedSourceText)
      )
  );
}

// ステータス表更新 ----------------------------------------
class ManipulatorHandle {
  /** @var {Function} */
  #closer;

  /** @var {Function} */
  #onClosed;

  /** @var {boolean} */
  #closed = false;

  /**
   * @param {Function} closer
   */
  constructor(closer) {
    this.#closer = closer;
  }

  close() {
    if (this.#closed) {
      return;
    }

    this.#closed = true;
    this.#closer();
    this.#onClosed?.call(null);
  }

  /**
   * @param {Function} callback
   */
  set onClosed(callback) {
    this.#onClosed = callback;
  }
}
/**
 * @param {HTMLElement} manipulatorNode
 * @param {HTMLElement} targetNode
 * @return {ManipulatorHandle}
 */
function openManipulatorNode(manipulatorNode, targetNode) {
  const documentBody = document.querySelector('body');

  documentBody.append(manipulatorNode);

  const statusContainerBounds = targetNode.getBoundingClientRect();

  manipulatorNode.style.left = `calc(${statusContainerBounds.right}px - 4.00em)`;

  if(config.layoutSide === 'deep'){
    manipulatorNode.style.bottom = `calc(100vh - ${statusContainerBounds.top}px + 0.25em)`;
  } else {
    manipulatorNode.style.top = `calc(${statusContainerBounds.bottom}px + 0.25em)`;
  }

  {
    const manipulatorBounds = manipulatorNode.getBoundingClientRect();
    const windowWidth = window.innerWidth;

    if (manipulatorBounds.right > windowWidth) {
      manipulatorNode.style.left = `calc(${statusContainerBounds.right}px - 4.00em - ${manipulatorBounds.right - windowWidth}px)`;
    }
  }

  /** @var {Function|null} */
  let onOuterClicked = null;

  const manipulatorRemover = () => {
    manipulatorNode.remove();

    if (onOuterClicked != null) {
      documentBody.removeEventListener('click', onOuterClicked);
      onOuterClicked = null;
    }
  };

  const manipulatorHandle = new ManipulatorHandle(manipulatorRemover);

  onOuterClicked = () => manipulatorHandle.close();

  setTimeout(() => documentBody.addEventListener('click', onOuterClicked), 0);

  return manipulatorHandle;
}
function openManipulation(event) {
  function findStatusContainer(node) {
    if (node.hasAttribute('data-manipulation-tokens')) {
      return node;
    }

    if (node.parentNode == null) {
      return null;
    }

    return findStatusContainer(node.parentNode);
  }

  const statusContainer = findStatusContainer(event.target);
  if (statusContainer == null) {
    return;
  }
  const tokens = statusContainer.dataset.manipulationTokens.split(',');
  if (tokens.length === 0) {
    return;
  }

  const unitName = statusContainer.closest('[data-name]').dataset.name;
  const statusName = statusContainer.dataset.stt;

  const documentBody = document.querySelector('body');

  const manipulator = document.createElement('ul');
  manipulator.classList.add('status-manipulator');
  manipulator.dataset.name = statusName;

  const manipulatorHandle = openManipulatorNode(manipulator, statusContainer);

  for (const token of tokens) {
    const manipulationItem = document.createElement('li');
    manipulationItem.classList.add('manipulation');
    manipulationItem.textContent = token;
    manipulationItem.dataset.token = token;
    manipulationItem.addEventListener(
        'click',
        (token => {
          return () => {
            const command = `${unitName}@${statusName}${token}`;
            {
              const temporaryNode = document.createElement('textarea');
              const temporaryNodeId = 'status-manipulator-form';
              temporaryNode.setAttribute('id', temporaryNodeId);
              temporaryNode.style.display = 'none';
              temporaryNode.value = command;

              documentBody.append(temporaryNode);

              formSubmit(temporaryNodeId, unitName);

              temporaryNode.parentNode.removeChild(temporaryNode);
            }
            manipulatorHandle.close();
          };
        })(token)
    );

    manipulator.append(manipulationItem);
  }
}

/**
 * @param {Array<string>|null} targetNames
 */
function statusUpdate (targetNames = null) {
  for (let name in unitList) {
    if (targetNames != null && !targetNames.includes(name)) {
      continue;
    }

    setUnitLink(name);

    const id = unitList[name]['id'];
    unitList[name]['sttnames'] = Array.from(new Set(unitList[name]['sttnames'])); //重複削除
    const status = unitList[name]['sttnames'] || setStatus;
    let viewCount = 0;
    let rowCount = 0;
    /** @var {Object.<string, int>} */
    let itemCountsByRow = {};
    let lastRowLabels = [];
    for (let i in status) {
      const stt = status[i];
      let obj = document.querySelector(`#stt-unit-${id} [data-stt="${stt}"]`) || '';
      let value = unitList[name]['status'][stt] ?? '';
      value = value?.toString();
      if(obj){
        const parent = [].slice.call( obj.parentNode.children );
        const index = parent.indexOf( obj ) - 1;
        if(parseInt(i) !== index){ obj.remove(); obj = ''; }
      }
      if(!obj){
        const add = `<li data-stt="${stt}"><dl><dt>${stt}</dt><dd class="num-font"><span class="value"></span><div class="gauge"><i style="width:0%;"></i></div></dd></dl></li>`;
        document.querySelector(`#stt-unit-${id} > dd.details > ul.details [id^="stt-memo-"]`).insertAdjacentHTML('beforebegin', add);
      }
      const valueContainer = document.querySelector(`#stt-unit-${id} [data-stt="${stt}"]`);
      const valueNum = document.querySelector(`#stt-unit-${id} [data-stt="${stt}"] .value`);
      const valueGauge = document.querySelector(`#stt-unit-${id} [data-stt="${stt}"] .gauge`);
      const valueGaugeNow = document.querySelector(`#stt-unit-${id} [data-stt="${stt}"] .gauge i`);
      let isNumeric;
      let manipulationTokens;
      /** @return {int[]} */
      function makeRange(start, end) {
        const range = [];
        if (start < end) {
          for (let i = start; i <= end; i++) {
            range.push(i);
          }
        } else {
          for (let i = start; i >= end; i--) {
            range.push(i);
          }
        }
        return range;
      }
      if(value && value.match(/&nbsp;|\s/)){
        valueNum.innerHTML = '<span>'+value.split(/&nbsp;|\s/).join('</span> <span>', )+'</span>';
        isNumeric = false;
      }
      else if (value && value.match(/^-?[0-9]+\/[0-9]+$/)){
        const [now, max] = value.split("/").map(Number);
        let per = (now / max) * 100;
        const signal = (per >= 75) ? 'safe'
                     : (per >= 50) ? 'caution'
                     : (per >= 25) ? 'warning'
                     : (per >=  1) ? 'danger'
                     : 'knockdown';
        if(per < 0) { per = 0; }
        if(valueNum.innerHTML !== value){
          valueNum.innerHTML = value;
          valueGauge.classList.remove('none');
          gaugeUpdate(valueGauge,valueGaugeNow,per,signal);
        }

        isNumeric = true;
        manipulationTokens = [];
        if (now !== 0) {
          manipulationTokens.push('=0');
        }
        if (gameSystem === 'sw2' && stt.includes('HP') && now !== 1) {
          // SW2 の HP には「 1 にする」選択肢を提供する.
          manipulationTokens.push('=1');
        }
        if (now !== max) {
          manipulationTokens.push(`=${max}`);
        }
        const allowMinusValue = gameSystem === 'sw2' && stt.includes('HP');
        manipulationTokens =
            manipulationTokens
                .concat(now < max ? makeRange(1, max - now).slice(0, 30) : [])
                .concat(now > 0 || allowMinusValue ? makeRange(-1, allowMinusValue ? -30 : -now).slice(0, 30) : []);
      }
      else if (stt === '侵蝕' && value){
        const per = (value / 200) * 100;
        const signal = (value >= 400) ? 'monster' : (value >= 300) ? 'grave'
                     : (value >= 240) ? 'fatal'   : (value >= 200) ? 'critical'
                     : (value >= 160) ? 'danger'  : (value >= 130) ? 'warning'
                     : (value >= 100) ? 'caution' : (value >=  80) ? 'attention'
                     : (value >=  60) ? 'notice'  : 'safe';
        if(valueNum.innerHTML !== value){
          valueNum.innerHTML = value;
          valueGauge.classList.remove('none');
          gaugeUpdate(valueGauge,valueGaugeNow,per,signal);
        }

        isNumeric = true;
        manipulationTokens = makeRange(1, 30);
      }
      else {
        valueNum.innerHTML = value;
        valueGauge.classList.add('none');

        if ((isNumeric = /^-?\d+$/.test(value))) {
          const now = parseInt(value);
          manipulationTokens = now !== 0 ? ['=0'] : [];
          manipulationTokens =
              manipulationTokens
                  .concat(makeRange(1, Math.max(20, Math.ceil(now / 2))).slice(0, 30))
                  .concat(makeRange(-1, Math.min(-20, -Math.ceil(now / 2))).slice(0, 30));
        }
      }
      // 値が入ってない項目は非表示
      const sttObj = document.querySelector(`#stt-unit-${id} [data-stt="${stt}"]`);
      let labelSize;
      let rowIndex = rowCount + 1;
      if(!value && value !== 0){
        sttObj.style.display = 'none';
      }
      else {
        sttObj.style.display = '';
        viewCount++;

        /**
         * @param {string} label
         * @return {number}
         */
        function computeLabelSize(label) {
          return [...label]
              .map(char => char.charCodeAt(0) <= 0xFF ? 0.7 : 1.0)
              .reduce((x, y) => x + y);
        }

        labelSize = computeLabelSize(stt);

        if (labelSize > 4.5) {
          rowCount++;
          if (lastRowLabels.length > 0) {
            rowCount++;
            rowIndex++;
            lastRowLabels = [];
          }
        } else {
          lastRowLabels.push(stt);

          if (lastRowLabels.length >= 2) {
            rowCount++;
            lastRowLabels = [];
          }
        }
      }

      valueContainer.removeEventListener('click', openManipulation);

      if (isNumeric && manipulationTokens != null) {
        valueContainer.dataset.manipulationAllowed = 'yes';
        valueContainer.dataset.manipulationTokens = manipulationTokens.map(x => typeof x === 'number' && x > 0 ? `+${x}` : x).join(',');
        valueContainer.addEventListener('click', openManipulation);
      } else {
        valueContainer.dataset.manipulationAllowed = 'no';
        valueContainer.dataset.manipulationTokens = '';
      }

      if (sttObj instanceof HTMLElement) {
        sttObj.dataset.labelSize = labelSize != null ? (labelSize > 4.5 ? 'large' : 'standard') : '';
        sttObj.dataset.rowIndex = rowIndex.toString();
      }

      {
        const key = rowIndex.toString();

        if (!(key in itemCountsByRow)) {
          itemCountsByRow[key] = 0;
        }

        itemCountsByRow[key] += 1;
      }
    }

    if (lastRowLabels.length > 0) {
      rowCount++;
    }

    document.querySelectorAll(`#stt-unit-${id} dd[data-stt]`).forEach(dd => {
      let exist = 0;
      for(const name of status){
        if(name === dd.dataset.stt) { exist = 1; }
      }
      if(!exist){ dd.remove(); }
    });
    const memoNode = document.getElementById('stt-memo-'+id);
    if (memoNode != null) {
      memoNode.dataset.memo = (unitList[name]['memo'] == null) ? '' : unitList[name]['memo'];
      if (memoNode.dataset.memo !== '' && lastRowLabels.length == 0) {
        rowCount++;
        memoNode.classList.add('separated-row');
      } else {
        memoNode.classList.remove('separated-row');
      }
    }
    if(Number(unitList[name]['check'])){
      document.getElementById('stt-unit-'+id).classList.add('check');
      document.querySelector(`#sheet-unit-${id} .dice-button.checks`).classList.add('checked');
    }
    else {
      document.getElementById('stt-unit-'+id).classList.remove('check');
      document.querySelector(`#sheet-unit-${id} .dice-button.checks`).classList.remove('checked');
    }

    // 持続状態
    {
      const r = updateUnitState(id);
      rowCount += r.stateCount;
    }

    {
      const unitNode = document.getElementById(`stt-unit-${id}`);
      unitNode.dataset.numberOfItems = viewCount.toString();
      unitNode.dataset.numberOfRows = rowCount.toString();
      unitNode.style.setProperty('--unit-property-row-count', rowCount.toString());

      {
        const itemCountAttributeNames = [];

        for (let i = 0; i < unitNode.attributes.length; i++) {
          const name = unitNode.attributes.item(i).name;
          if (name.startsWith('data-number-of-items-in-row-')) {
            itemCountAttributeNames.push(name);
          }
        }

        for (const name of itemCountAttributeNames) {
          unitNode.attributes.removeNamedItem(name);
        }
      }

      for (const [rowIndex, itemCount] of Object.entries(itemCountsByRow)) {
        unitNode.setAttribute(`data-number-of-items-in-row-${rowIndex}`, itemCount.toString());
      }
    }
  }
  document.getElementById('status').dataset.num = Object.keys(unitList).length;
}
let gaugePromise = Promise.resolve();
function gaugeUpdate(maxObj,nowObj,per,signal){
  gaugePromise = gaugePromise.then(() => {
    return new Promise(resolve => {
      setTimeout( function(){
        maxObj.dataset.signal = signal;
        nowObj.style.width = per+'%';
        resolve();
      }, 50);
    });
  });
}
// ユニット削除 ----------------------------------------
function unitDelete (unitId) {
  let okFlag = 0;
  const sttElement   = document.getElementById(  'stt-unit-'+unitId);
  const sheetElement = document.getElementById('sheet-unit-'+unitId);
  if (sttElement)  { sttElement.parentNode.removeChild(sttElement);     okFlag = 1; }
  if (sheetElement){ sheetElement.parentNode.removeChild(sheetElement); okFlag = 1; }
  
  if(okFlag && selectedSheet === unitId){ sheetSelect('default'); }
  
  document.getElementById('status').dataset.num = Object.keys(unitList).length;

  document.querySelector('body').dispatchEvent(new Event('unit-removed'));
  
  return okFlag;
}

// レディチェック ----------------------------------------
async function readyCheckSet(firstLoaded){
  if(firstLoaded) { await memberCheck(); }
  const ul = document.getElementById('ready-list');
  ul.innerHTML = '';
  let max = 0;
  let okNum = 0;
  let noNum = 0;
  Object.keys(memberList).sort(function(a, b) {
    if (memberList[a]['name'] > memberList[b]['name']) {
      return 1;
    } else {
      return -1;
    }
  }).forEach(key => {
    let li = document.createElement('li');
    li.dataset.id = key;
    li.classList.add(memberReady[key]);
    if (key === userId) {
      li.classList.add('mine');
    }
    li.innerHTML = memberList[key]['name'];
    ul.append(li);
    max++;
    if(memberReady[key] == 'ok'){ okNum++ }
    if(memberReady[key] == 'no'){ noNum++ }
  });

  if (userId != null) {
    document.querySelector('#ready-check button[name="ready-ok"]').classList.toggle('selected', memberReady[userId] === 'ok');
    document.querySelector('#ready-check button[name="ready-no"]').classList.toggle('selected', memberReady[userId] === 'no');
  }
  if(max === okNum + noNum){
    const targetTab = document.getElementById("chat-logs-tab"+readyStartTab);
    let newLog = document.createElement('dl');
    newLog.classList.add('system','ready');
    newLog.innerHTML = `<dt></dt><dd class="comm"><button onclick="boxOpen('ready-check')">レディチェックが完了</button> <span class="material-symbols-outlined">check</span>${okNum}/${max} <span class="material-symbols-outlined">close</span>${noNum}/${max} </dd>`;
    targetTab.appendChild(newLog);
    scrollBottom(readyStartTab);
    beforeUser[readyStartTab] = '';
    beforeName[readyStartTab] = '';
  }
}

// 送信 ----------------------------------------
function commSend(comm,tab,name,color,address,bcdice,picture=null,onCompleted=null,onError=null){
  if(romMode){ return alert('見学入室では送信できません'); }
  if(name === undefined){ return alert('送信する名前がありません'); }
  if(comm === '' || comm === undefined){ return alert('送信するテキストがありません'); }
  if(nameList[0] === undefined){ return alert('入室していません'); }
  const openlater = (address && ((tab && document.getElementById('secret-openlater-tab'+tab).checked) || (!tab && document.getElementById('secret-openlater').checked))) ? 1 : '';
  const status = unitList[name] && unitList[name]['sttnames'] ? unitList[name]['sttnames'] : setStatus;
  const sendData = {
    'mode': 'write',
    'tab' : tab || mainTab,
    'room': roomId,
    'logKey' : logKey,
    'game': gameSystem,
    'status' : status.join(' <> '),
    'statusDefault' : sttDefaultValues.join(' <> '),
    'player' : nameList[0]['name'],
    'name'   : name,
    'color'  : color ?? '',
    'picture': picture ?? '',
    'comm'   : comm,
    'bcdice' : bcdice || '',
    'userId' : userId,
    'address': address || '',
    'addressName': address ? memberList[address]['name'] : '',
    'openlater': openlater,
  }
  if(base64Mode){
    sendData.comm = btoa(unescape(encodeURIComponent(sendData.comm)));
    sendData.base64mode = 1;
  }
  fetch(cgiPath, {
    method: "POST",
    cache: 'no-cache',
    body: hashToQuery(sendData),
  })
  .then(handleErrors)
  .then(response => response.json())
  .then(data => {
    console.log(data['text'],comm);
    if(data['status'] === 'error'){
      alert(data['text']);
    }
    else {
      logGet(onCompleted);
    }
  })
  .catch(error => {
    console.error('発言の送信に失敗: ', error);
    if (onError != null) {
      onError(error);
    }
  });
}
// 送信前処理 ----------------------------------------
async function formSubmit(objId,unitName){
  unitName = htmlEscape(unitName);
  const obj = document.getElementById(objId);
  let stt  = obj.dataset.commStatus || '';
  let pre  = obj.dataset.commPre || '';
  let part = obj.dataset.part || '';
  let comm = obj.value;
  let commLock = obj.dataset.lock || 0; //発言を送信後に消さないかどうか
  if(commLock === 'memo') { return; }
  if(stt !== ''){
    pre = '@' + document.getElementById(`edit-stt-${unitList[unitName]['id']}-${stt}-name`).value
    .replace('>','＞')
    .replace('<','＜')
    .replace('#','＃');
    if(pre.match(/^[@]$/)) {
      pre = '';
      comm = '@statusupdate'
    }
  }
  if(pre.match(/^[@＠]/)) { // ステータスリモコンからの入力前処理
    const calcOn = document.getElementById('stt-calc-on-'+unitList[unitName]['id']).selected;
    if(calcOn && !pre.match(/^@(メモ|memo)$/)){
      if      (!comm.match(/[\+\-\*\/=:＋－＊／＝：0-9０-９]/)) { comm = ':' + comm; }
      else if (!comm.match(/^[\+\-\*\/=:＋－＊／＝：]/)) { comm = '=' + comm; }
    }
    else {
      comm = `:"${comm}"`;
      commLock = 'full';
    }
  }
  if (!comm && !pre.match(/^\/(topic|map|rewrite)/)) return console.log('発言が空欄'); // 発言が空なら処理中断（TOPICとマップと発言修正除く）
  beforeComm[objId] = comm; // 直前の送信履歴に保存
  comm = pre + comm;

  // 発言先タブチェック
  let target = 0;
  if(obj.closest('[data-tab]')){ target = obj.closest('[data-tab]').dataset.tab; }
  
  // どの名前で送信するかチェック
  const nameNum = target ? document.getElementById(`form-name-tab${target}`).value : document.getElementById('form-name').value;
  let name  = unitName || nameList[nameNum]['name'];
  
  // 秘話送信先チェック
  let address = '';
  if(!unitName){
    address = target ? document.getElementById(`form-address-tab${target}`).value : document.getElementById('form-address').value;
  }
  
  // チャットパレットチェック
  if(obj.dataset.paletteTarget){ //チャットパレットからはそのユニット参照
    comm = paletteCheck(unitList[unitName]['id'], comm);
  }
  else if(unitList[name]) { //通常発言欄からは発言者名と同名のユニット参照
    comm = paletteCheck(unitList[name]['id'], comm);
  }
  else { //それ以外は開いてるユニット参照
    comm = paletteCheck(selectedSheet, comm);
  }
  
  // 部位名
  if(part !== ''){ name = document.getElementById("edit-stt-"+part+"-name").value; }
  
  // タブと名前とコマンドチェック
  let tabname;
  [target, comm, tabname] = tabCheck(target, comm);
  [name, comm]   = nameCheck(name, comm);
  
  // 名前色
  const color = nameToColor[name];
  
  // 発言が空になってたら処理中止
  if(comm == ''){ return }
  
  // 発言者画像
  let picture;
  if (objId === 'form-comm-main') {
    const selector = document.querySelector('#main-form .comm-config-area .picture-area .picture-select-area label.active select');
    if (selector != null && selector.value !== '') {
      picture = selector.value;
    } else {
      picture = 'none';
    }
  } else {
    picture = null;
  }
  
  // 発言に使ったフォーム初期化処理
  
  if     (commLock === 'full'){  }
  else if(commLock === 'dice'){ obj.value = obj.value.split(/\s/)[0]; }
  else if(commLock === 'name'){ obj.value = (tabname?`[${tabname}]`:'')+name+"@"; }
  else if(commLock === 'off'){  obj.value = (tabname?`[${tabname}]`:''); }
  else{ obj.value = ''; }
  if (obj.classList.contains('autosize')) {
    autosizeUpdate(obj);
  }
  obj.focus();
  if(commLock === 'dice' || commLock === 'name' || commLock === 'off'){
    roomConfig.diceForms[obj.dataset.area][obj.dataset.num]['value'] = obj.value;
    saveRoomConfig();
  }
  
  await new Promise((resolution, rejection) => {
    //BCDice
    if(bcdiceAPI){
      let hit = 0;
      let halfComm = toHalfWidth(comm);
      if(bcdiceCommandPattern){ //システム用の接頭辞チェック
        if(halfComm.match(bcdiceCommandPattern)){ hit = 1; }
      }

      if(hit){
        let bcdice;
        bcdiceRoll(halfComm)
        .then(data => {
          if(data['ok']){
            bcdice = bcdiceSystem+data['text'];
          }
          commSend(comm, target, name, color, address, bcdice, picture, resolution, rejection);
        })
        .catch(error => {
          console.error(error);
          commSend(comm, target, name, color, address, bcdice, picture, resolution, rejection);
        })
      }
      else { commSend(comm, target, name, color, address, null, picture, resolution, rejection); }
    }
    // 通常送信処理
    else {
      commSend(comm, target, name, color, address, null, picture, resolution, rejection);
    }
  });
}
// タブコマンドチェック ----------------------------------------
function tabCheck(tab, comm){
  let tabname;
  let reg = new RegExp("^(?:[\\[［]("+Object.values(tabList).join('|')+")?[\\]］])?");
  let newComm = comm.replace(reg, function(whole, mTab){
    if(mTab){ tab = tabnameToNum[mTab]; tabname = mTab; }
    return '';
  });
  return [tab, newComm, tabname];
}
// 名前・ステータスコマンドチェック ----------------------------------------
let nameToColor = {};
function nameCheck(name, comm){
  // 名前リストを作る
  nameToColor = {};
  let names = [];
  for(let key in unitList){
    names.push(escapeRegExp(key));
    nameToColor[key] = unitList[key]['color'];
  }
  for(let i in nameList){
    names.push(escapeRegExp(nameList[i]['name']));
    nameToColor[nameList[i]['name']] = nameList[i]['color'];
  }
  // コメントチェック
  let reg1 = new RegExp("^("+names.join('|')+")?([@＠])");
  let reg2;
  // 名前
  let newNameFlag = 0;
  let newComm = comm.replace(reg1, function(whole, mName, atMark){
    let after = '';
    if(mName){
      name = mName;
    }
    else {
      after = atMark;
    }
    unitStatusNameUpdate(name);
    const status = (unitList[name] && unitList[name]['sttnames']) ? unitList[name]['sttnames'] : setStatus;
    console.log(status, after);
    reg2 = new RegExp("^("+after+")((?:"+status.join('|')+")|メモ|memo|check|delete|new|add)?");
    return after;
  });
  // ステータス
  newComm = newComm.replace(reg2, function(whole, atMark, mStatus){
    let after = '';
    if(mStatus){
      after = '@'+mStatus;
    }
    else {
      after = atMark;
    }
    return after;
  });
  return [name, newComm];
}
function escapeRegExp(str) {
  return str.replace(/[-\/\\^$*+?.()\[\]{}]/g, '\\$&');
}
// BCDice-APIに送信 ----------------------------------------
function bcdiceRoll(comm){
  const sendData  = new FormData();
  sendData.append('command', comm)
  return fetch(bcdiceAPI+'/v2/game_system/'+bcdiceSystem+'/roll', {
    method: "POST",
    cache: 'no-cache',
    body: sendData,
  })
  .then(handleErrors)
  .then(response => response.json());
}
// BCDice-APIから情報取得 ----------------------------------------
let bcdiceCommandPattern;
function bcdiceSystemInfo(){
  return fetch(bcdiceAPI+'/v2/game_system/'+bcdiceSystem, {
    method: "GET",
    cache: 'no-cache',
  })
  .then(handleErrors)
  .then(response => response.json())
  .then(data => {
    bcdiceCommandPattern = new RegExp(data['command_pattern'], 'i');
    console.log(bcdiceCommandPattern)
    document.getElementById('help-bcdice-info').innerHTML = data['help_message'].replace(/\n/g,"<br>");
  })
  .catch(error => {
    alert('APIサーバーからの情報取得に失敗しました\n');
    console.error(error);
  });
}
// 新規ユニット送信処理 ----------------------------------------
autosizeUpdate(document.getElementById('new-unit-stt-value'));
function newUnitSubmit(){
  let name  = document.getElementById('new-unit-name-value').value;
  let color = document.getElementById('new-unit-color-value').value;
  let url   = document.getElementById('new-unit-url-value').value;
  if(!name){ return alert('作成するユニットの名前が入力されていません'); }
  
  let comm  = '@new ';
  if(document.getElementById('new-unit-urlload').checked){
    comm += url;
  }
  else {
    comm += document.getElementById('new-unit-stt-value').value;
    comm += ' url:'+url;
  }
  let target = 0;
  commSend(comm, target, name, color);
  if(document.getElementById('new-unit-addname').checked){
    nameList.push( { "name":name, "color":color } );
    npcBoxSet();
    saveRoomConfig();
  }
}
// ユニット操作送信処理 ----------------------------------------
function unitCommandSubmit(type,unitId,n){
  let name  = unitId ? unitIdToName[unitId] :  nameList[document.getElementById('form-name').value]['name'];
  if(n){ name = document.getElementById("edit-stt-"+unitId+"-"+n+"-name").value; }
  if(!unitList[name]){ return alert('ユニット「'+name+'」は存在しません'); }
  const color  = unitList[name]['color'] ? unitList[name]['color'] : '';
  const comm   = '@' + type;
  const target = 0;
  if(type === 'delete'){
    const flag = confirm("ユニット「"+name+"」を削除します");
    if(!flag){ return }
  }
  commSend(comm, target, name, color);
  if(!unitId){
    document.getElementById('form-comm-main').focus();
  }
}
function unitCheckSubmit(unitId){
  let name  = unitId ? unitIdToName[unitId] :  nameList[document.getElementById('form-name').value]['name'];
  if(unitList[name] && unitList[name]['check']){
    unitCommandSubmit('uncheck',unitId)
  }
  else { unitCommandSubmit('check',unitId) }
}
// 発言名変更送信 ----------------------------------------
function rewriteNameSubmit(){
  const obj = document.getElementById('rewrite-name');
  const num  = obj.dataset.num;
  const name  = nameList[obj.value]['name'];
  const color = nameList[obj.value]['color'];
  commSend('/rewritename:'+num,0,name,color)
}

// レディチェック回答 ----------------------------------------
function readyCheckSubmit(check,target){
  if     (memberReady[userId] == 'ok' &&  check){ alert('すでに✔しています'); return; }
  else if(memberReady[userId] == 'no' && !check){ alert('すでに×しています'); return; }

  const name  = nameList[0]['name'];
  const color = nameList[0]['color'];
  commSend( (check?'/ready-ok':'/ready-no'), target, name, color );
}

// ラウンド更新送信 ----------------------------------------
function roundSubmit(num){
  let comm  = '/round' + num;
  commSend(comm,0,nameList[0]['name']);
}
// メモ更新送信 ----------------------------------------
function getSelectedMemoNum() {
  return (selectedMemo === '') ? '' : Number(selectedMemo)+1;
}
function memoSubmitCore(content) {
  const num = getSelectedMemoNum();
  let comm = '/memo' + num + ' ' + (content ?? '');
  commSend(comm,0,nameList[0]['name'],null,null,null,null,() => {
    if (num === '') {
      memoSelect(parseInt(document.querySelector(`#memo-list li[data-num]:last-child`).dataset.num) - 1);
    }
  });
}
function memoSubmit() {
  memoSubmitCore(document.getElementById("sheet-memo-value").value);
}
// メモ削除送信 ----------------------------------------
function memoSubmitToRemove() {
  if (!confirm(`共有メモ #${getSelectedMemoNum()} を削除しますか？`)) {
    return;
  }

  memoSubmitCore('');
}
// BGM更新送信 ----------------------------------------
function bgmSubmit(){
  const url    = document.getElementById("bgm-set-url");
  const title  = document.getElementById("bgm-set-title");
  const volume = document.getElementById("bgm-set-volume");
  if (!url.value.match(/^https?:\/\/./)) return;
  let comm = '/bgm ' + title.value + ' vol=' + volume.value + ' ' + url.value;
  commSend(comm,0,nameList[0]['name']);
  
  url.value = '';
  title.value = '';
  volume.value = 100;
  document.getElementById('bgm-set-volume-text').innerHTML = '100'
  document.getElementById("bgm-set-preview").src = '';
  bgmPreviewEnd();
}
// 背景更新送信 ----------------------------------------
function bgSubmit(){
  const url   = document.getElementById("bg-set-url");
  const title = document.getElementById("bg-set-title");
  let fillMode;
  document.getElementsByName('background-fill-mode').forEach(
    element => {
      if (element.checked) {
        fillMode = element.getAttribute('value');
      }
    }
  );
  if (!url.value.match(/^https?:\/\/./)) return;
  let comm = `/bg mode=${fillMode} ` + title.value + ' ' + url.value;
  commSend(comm,0,nameList[0]['name']);
  
  url.value = '';
  title.value = '';
  document.getElementById("bg-set-preview").src = '';
}
// タブ設定変更送信 ----------------------------------------
function tabAddSubmit(){
  const input = document.getElementById("tab-add-name");
  if(!input.value){ return alert('タブ名が入力されていません。') }
  let comm = '/tab-add ' + input.value;
  commSend(comm,0,nameList[0]['name']);

  input.value = "";
}
function tabRenameSubmit(){
  const before = document.getElementById("tab-rename-list");
  const after  = document.getElementById("tab-rename-name");
  if(!before.value){ return alert('タブが選択されていません。') }
  if(!after.value ){ return alert('変更後のタブ名が入力されていません。') }
  let comm = '/tab-rename ' + before.value + '->' + after.value;
  commSend(comm,0,nameList[0]['name']);

  before.value = "";
  after.value = "";
}
function tabDeleteSubmit(){
  const input = document.getElementById("tab-delete-list");
  if(!input.value){ return alert('タブ名が入力されていません。') }
  let comm = '/tab-delete ' + input.value;
  commSend(comm,0,nameList[0]['name']);

  input.value = "";
}

// サブフォーム ---------------------------------------
//クリック
document.getElementById('main-form').addEventListener("click",function(e){
  if (e.target.matches(".dice-button button")) {
    subFormSubmit(e.target.dataset.id)
  }
});
function subFormSubmit(targetId){
  const type = document.getElementById(targetId).dataset.lock;
  if(config.subFormBehavior[type] === 'copy'){
    document.getElementById("form-comm-main").value = document.getElementById(targetId).value;
  }
  else if(config.subFormBehavior[type] === 'add'){
    formSubmit("form-comm-main");
    setTimeout( ()=>{formSubmit(targetId)}, 250 );
  }
  else {
    formSubmit(targetId);
  }
}
// ダブルクリック
document.getElementById('sheet-area').addEventListener("dblclick",function(e){
  
});

// チャットパレット ----------------------------------------
//クリック
document.getElementById('sheet-area').addEventListener("click",function(e){
  if (e.target.matches("div.chat-palette span:not(.param)")) {
    const name = htmlEscape( e.target.closest(".chat-palette").dataset.name );
    const targetId = config.paletteDestinate === 'main' ? "form-comm-main" : "chat-palette-comm-unit-"+unitList[name]['id'];
    document.getElementById(targetId).value = e.target.dataset.value;
    autosizeUpdate(document.getElementById(targetId));
  }
});
// ダブルクリック
document.getElementById('sheet-area').addEventListener("dblclick",function(e){
  if (e.target.matches("div.chat-palette span:not(.param)")) {
    const name = htmlEscape( e.target.closest(".chat-palette").dataset.name );
    const targetId = config.paletteDestinate === 'main' ? "form-comm-main" : "chat-palette-comm-unit-"+unitList[name]['id'];
    document.getElementById(targetId).value = e.target.dataset.value;
    formSubmit(targetId,name);
  }
});
// チャットパレット変数チェック
let paletteSetNest;
function paletteCheck(id, comm){
  paletteSetNest = 0;
  return comm.replace(/[{｛](.+?)[｝}]/gi, function(raw, varNameRaw){
    return paletteParamSet(id,varNameRaw);
  });
}
function paletteParamSet(id,varNameRaw){
  const varName = toHalfWidth(varNameRaw).toLowerCase();
  paletteSetNest++;
  if(paletteSetNest >= 100){ return '{'+varNameRaw+'}'; }
  const list = paletteValueList(id);
  const reg = new RegExp('^//' + varName.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&') + '[=＝](.*)$', 'i');
  for(let i=0; i<list.length; i++){
    if(toHalfWidth(list[i]).match(reg)){
      return RegExp.$1.replace(/[{｛](.+?)[｝}]/gi, function(all, varNameRawChild){
        return paletteParamSet(id, varNameRawChild);
      });
    }
  }
  return '{'+varNameRaw+'}';
}
// チャットパレット・ダイス欄のvalue一覧
function paletteValueList(id){
  let arr = [];
  // ダイス欄
  for(let area in [0,1]){
    for(let num in diceForms[area]){
      try {
        arr.push(diceForms[area][num]['value']);
      }
      catch (e) {
      }
    }
  }
  // チャットパレット
  if(document.querySelector(`#sheet-unit-${id} .chat-palette.texts`)){
    const lines = document.querySelector(`#sheet-unit-${id} .chat-palette.texts`).value.split(/\n/g);
    for(let i=0; i<lines.length; i++){
      arr.push(lines[i]);
    }
  }
  // ステータス
  const unitName = unitIdToName[id];
  if(unitList[unitName]){
    for(const statusName of unitList[unitName]['sttnames']){
      const statusValue = unitList[unitName]['status'][statusName] ?? '';
      const [currentValue,] = statusValue.split('/');
      arr.push(`//${statusName}=${currentValue}`)
    }
  }

  return arr;
}
function toHalfWidth(text) {
  return text.replace(/[Ａ-Ｚａ-ｚ０-９！＂＃＄％＆＇（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝]/g, function(s){
    return String.fromCharCode(s.charCodeAt(0)-0xFEE0);
  })
  .replace(/[‐－―]/g, "-")
  .replace(/[～〜]/g, "~")
  .replace(/　/g, " ");
}
// ルーム設定変更 ----------------------------------------
function roomChange(){
  let flag = confirm("この内容で更新します。\nよろしいですか？\n（更新すると、ページのリロードが入ります）");
  if(!flag){ return false; }
  const sendData = {
    'mode': 'change',
    'room': roomId,
    'logKey': logKey,
    'config-room-password': document.getElementById('config-room-password').value,
    'config-room-name': document.getElementById('config-room-name').value,
    'config-room-tab': document.getElementById('config-room-tab').value,
    'config-room-status': document.getElementById('config-room-status').value,
    'config-room-game': document.getElementById('config-room-game').value,
    'config-room-bcdice-url': document.getElementById('config-room-bcdice-url').value,
    'config-room-bcdice-game': document.getElementById('config-room-bcdice-game').value,
  }
  fetch(cgiPath, {
    method: "POST",
    cache: 'no-cache',
    body: hashToQuery(sendData),
  })
  .then(handleErrors)
  .then(response => response.json())
  .then(data => {
    if(data['status'] === 'ok') {
      location.reload();
    }
    else {
      alert(data['text']);
    }
  })
  .catch(error => {
    console.log('ルームの設定変更に失敗');
  });
}

// ログリセット ----------------------------------------
let resetFlag = 0;
function resetRoom(){
  const password = document.getElementById('room-reset-password').value;
  const logtitle = document.getElementById('room-reset-logtitle').value;
  const filename = document.getElementById('room-reset-filename').value;
  const roomResetAll = document.getElementById('room-reset-all').checked ? 1 : 0;
  const roomDelete   = document.getElementById('room-delete').checked ? 1 : 0;
  const sendData = {
    'mode': 'reset',
    'room': roomId,
    'logKey': logKey,
    'password': password,
    'title': logtitle || '',
    'filename': filename || '',
    'allReset': roomResetAll,
    'roomDelete': roomDelete,
  }
  fetch(cgiPath, {
    method: "POST",
    cache: 'no-cache',
    body: hashToQuery(sendData),
  })
  .then(handleErrors)
  .then(response => response.json())
  .then(data => {
    if(data['status'] === 'ok') {
      resetFlag = 1;
      console.log(data['text']);
      alert("ルームをリセットしました。作成したログに移動します。\nログを作成せず、ルームの削除のみ場合、トップページに移動します。");
      location.href = data['url'];
    }
    else {
      alert(data['text']);
    }
  })
  .catch(error => {
    console.error('ログの削除に失敗: ', error);
  });
}
// ファイル名取得 ----------------------------------------
function getFileName(){
  const sendData = {
    'mode': 'getfilename',
    'room': roomId,
  }
  fetch(cgiPath, {
    method: "POST",
    cache: 'no-cache',
    body: hashToQuery(sendData),
  })
  .then(handleErrors)
  .then(response => response.json())
  .then(data => {
    if(data['status'] === 'ok') {
      document.getElementById('room-reset-filename').value = data['filename'];
    }
  })
  .catch(error => {
    console.error(error)
  });
}

// エスケープ ----------------------------------------
function htmlEscape(str) {
    if (!str) return;
    return str.replace(/[<>]/g, function(match) {
      const escape = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        //'"': '&quot;',
        //"'": '&#39;',
        //'`': '&#x60;'
      };
      return escape[match];
    });
}
function htmlUnEscape(str) {
    if (!str) return;
    return str.replace(/(&lt;|&gt;)/g, function(match) {
      const escape = {
        '&lt;': '<',
        '&gt;': '>',
        '&amp;': '&',
      };
      return escape[match];
    });
}

/**
 * @param {int|string} roundValue
 */
function setRound(roundValue) {
  document.getElementById('round-value').innerHTML = roundValue.toString();

  const roundAvailable = parseInt(roundValue.toString()) > 0;

  if (isStoryteller()) {
    document.querySelector('#edit-topic > h2').textContent = `${roundAvailable ? "トピック" : "キーワードリスト"}編集`;

    const editTopicNode = document.querySelector('#edit-topic');
    editTopicNode.classList.toggle('storyteller-keyword-area', !roundAvailable);
    editTopicNode.classList.toggle('in-round', roundAvailable);

    document.getElementById('topic-value').classList.toggle('storyteller-keywords', !roundAvailable);
  }

  topicChange(rawTopic ?? '');
}

// ランダムID ----------------------------------------
function randomId(num){
  const l = num;
  const c = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const cl = c.length;
  let r = "";
  for(var i=0; i<l; i++){
    r += c[Math.floor(Math.random()*cl)];
  }
  return r;
}
