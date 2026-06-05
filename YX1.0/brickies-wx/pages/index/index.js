var STATE = { START: 0, PLAYING: 1, PAUSED: 2, GAME_OVER: 3, LEVEL_COMPLETE: 4, LAUNCHING: 5 };
var gameState = STATE.START;
var score = 0, lives = 3, level = 1, maxLevel = 10, combo = 0, cycle = 0;
var WIN_SCORE = 100000, hasWon = false, speedPenalty = 0;
var W = 0, H = 0, ctx = null, canvas = null, dpr = 1;
var paddle = { x: 0, y: 0, w: 90, h: 14, speed: 7, targetX: 0 };
var ball = { x: 0, y: 0, r: 7, dx: 0, dy: 0, speed: 5, attached: true };
var bricks = [], particles = [], trails = [], powerUps = [], activePowerUps = {}, extraBalls = [];
var inventory = [null, null, null, null], inventoryUses = 5;
var activePet = null, petAnimFrame = 0;
var petImageCache = {}, petProcessedCache = {}, petMood = 'idle', petMoodTimer = 0;
var petProcessCanvas = null;
var petX = 0, petY = 0, petTargetX = 0, petTargetY = 0;
var petSpeech = '', petSpeechTimer = 0;
var PET_DISPLAY_SIZE = 64;
var petIsDragging = false, petDragOffsetX = 0, petDragOffsetY = 0;
var petPokeScale = 1, petPokeTimer = 0, petDidDrag = false;
var petTouchStartX = 0, petTouchStartY = 0;
var BRICK_W = 48, BRICK_H = 18, BRICK_PAD = 4, BRICK_TOP = 55, BRICK_LEFT = 0;

var LEVEL_LAYOUTS = [
  [[1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1],[0,1,1,1,1,1,1,1,0],[0,0,1,1,1,1,1,0,0],[0,0,0,1,1,1,0,0,0],[0,0,0,0,1,0,0,0,0]],
  [[0,0,0,0,1,0,0,0,0],[0,0,0,1,1,1,0,0,0],[0,0,1,1,1,1,1,0,0],[0,1,1,1,1,1,1,1,0],[1,1,1,1,1,1,1,1,1],[0,1,1,1,1,1,1,1,0],[0,0,1,1,1,1,1,0,0],[0,0,0,1,1,1,0,0,0],[0,0,0,0,1,0,0,0,0]],
  [[1,0,0,0,0,0,0,0,1],[1,1,0,0,0,0,0,1,1],[1,1,1,0,0,0,1,1,1],[1,1,1,1,0,1,1,1,1],[1,1,1,1,1,1,1,1,1],[1,1,1,1,0,1,1,1,1],[1,1,1,0,0,0,1,1,1],[1,1,0,0,0,0,0,1,1],[1,0,0,0,0,0,0,0,1]],
  [[0,0,1,1,0,1,1,0,0],[0,1,1,1,1,1,1,1,0],[1,1,0,1,1,1,0,1,1],[1,0,0,0,1,0,0,0,1],[1,1,0,0,1,0,0,1,1],[1,1,1,0,1,0,1,1,1],[0,1,1,1,1,1,1,1,0],[0,0,1,1,1,1,1,0,0],[0,0,0,1,1,1,0,0,0]],
  [[1,0,1,0,1,0,1,0,1],[0,1,0,1,0,1,0,1,0],[1,0,1,0,1,0,1,0,1],[0,1,0,1,1,1,0,1,0],[1,0,1,1,1,1,1,0,1],[0,1,0,1,1,1,0,1,0],[1,0,1,0,1,0,1,0,1],[0,1,0,1,0,1,0,1,0],[1,0,1,0,1,0,1,0,1]],
  [[1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,1],[1,0,1,1,1,1,1,0,1],[1,0,1,0,0,0,1,0,1],[1,0,1,0,0,0,1,0,1],[1,0,1,0,0,0,1,0,1],[1,0,1,1,1,1,1,0,1],[1,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1]],
  [[1,0,0,0,0,0,0,0,1],[0,1,1,1,1,1,1,1,0],[0,1,0,0,0,0,0,1,0],[0,1,0,1,1,1,0,1,0],[0,1,0,1,1,1,0,1,0],[0,1,0,1,1,1,0,1,0],[0,1,0,0,0,0,0,1,0],[0,1,1,1,1,1,1,1,0],[1,0,0,0,0,0,0,0,1]],
  [[0,0,1,1,1,1,1,0,0],[0,1,1,0,1,0,1,1,0],[1,1,0,0,1,0,0,1,1],[1,0,0,1,1,1,0,0,1],[1,0,1,1,1,1,1,0,1],[1,0,0,1,1,1,0,0,1],[1,1,0,0,1,0,0,1,1],[0,1,1,0,1,0,1,1,0],[0,0,1,1,1,1,1,0,0]],
  [[1,1,0,0,0,0,0,1,1],[1,1,1,0,0,0,1,1,1],[0,1,1,1,0,1,1,1,0],[0,0,1,1,1,1,1,0,0],[0,0,0,1,1,1,0,0,0],[0,0,1,1,1,1,1,0,0],[0,1,1,1,0,1,1,1,0],[1,1,1,0,0,0,1,1,1],[1,1,0,0,0,0,0,1,1]]
];

var LEVEL_THEMES = [
  { name:'深海', bg:'#0a0e2e', bgGlow:'rgba(0,60,120,0.5)', bricks:[['#00d4ff','#0099cc'],['#4dabf7','#2b8fd9'],['#74c0fc','#4da8f0'],['#a5d8ff','#7ec4f0'],['#63e6be','#3bc9a0'],['#38d9a9','#20c997'],['#66d9e8','#3bc4d6'],['#99e9f2','#6fd8e8']], ball:['#ffffff','#00d4ff','#0066aa'], ballGlow:'#00d4ff', trail:'#00d4ff', paddle:['#0066aa','#00d4ff','#0066aa'] },
  { name:'落日', bg:'#1a0a0a', bgGlow:'rgba(120,40,0,0.5)', bricks:[['#ff6b6b','#d94444'],['#ff8787','#e86060'],['#ffa94d','#e08a2a'],['#ffc078','#e8a050'],['#ffd43b','#d4b020'],['#ffe066','#e8c840'],['#ff922b','#d97520'],['#fd7e14','#d06810']], ball:['#ffffff','#ff6b6b','#cc2233'], ballGlow:'#ff6b6b', trail:'#ff6b6b', paddle:['#cc2233','#ff6b6b','#cc2233'] },
  { name:'翠林', bg:'#0a1a0e', bgGlow:'rgba(0,80,30,0.5)', bricks:[['#51cf66','#38a84f'],['#69db7c','#4fc462'],['#8ce99a','#6fd47e'],['#b2f2bb','#8ce6a0'],['#ffd43b','#d4b020'],['#a9e34b','#8bc830'],['#c0eb75','#a0d858'],['#96f2d7','#6ee8c0']], ball:['#ffffff','#51cf66','#1a7a30'], ballGlow:'#51cf66', trail:'#51cf66', paddle:['#1a7a30','#51cf66','#1a7a30'] },
  { name:'星河', bg:'#120a20', bgGlow:'rgba(80,20,120,0.5)', bricks:[['#9775fa','#7550e0'],['#a78bfa','#8570e8'],['#b197fc','#9580f0'],['#c4b1fc','#a898f0'],['#da77f2','#c055e0'],['#e599f7','#cc78e8'],['#f783ac','#e0699a'],['#faa2c1','#e888b0']], ball:['#ffffff','#b197fc','#6633cc'], ballGlow:'#b197fc', trail:'#b197fc', paddle:['#6633cc','#b197fc','#6633cc'] },
  { name:'烈焰', bg:'#1a0a00', bgGlow:'rgba(140,50,0,0.5)', bricks:[['#ff4500','#cc3700'],['#ff6a00','#d95800'],['#ff8c00','#cc7000'],['#ffae00','#d99000'],['#ffd700','#ccb000'],['#ffec3d','#d9c820'],['#ff6347','#d94e34'],['#ff7f50','#d96640']], ball:['#ffffff','#ffd700','#cc6600'], ballGlow:'#ffd700', trail:'#ff8c00', paddle:['#cc6600','#ffd700','#cc6600'] },
  { name:'冰川', bg:'#0a1520', bgGlow:'rgba(40,100,140,0.5)', bricks:[['#a8d8ea','#7ec0d8'],['#c4e3f0','#9ccde0'],['#dceef8','#b8ddf0'],['#e8f4fc','#c8e4f8'],['#74b9d0','#5098b8'],['#5fa8c8','#4090b0'],['#8cc8e0','#60b0d0'],['#a0d4e8','#78c0d8']], ball:['#ffffff','#a8d8ea','#4090b0'], ballGlow:'#a8d8ea', trail:'#74b9d0', paddle:['#4090b0','#a8d8ea','#4090b0'] },
  { name:'暗夜', bg:'#0a0a14', bgGlow:'rgba(30,30,60,0.5)', bricks:[['#868e96','#6c737a'],['#adb5bd','#8c939a'],['#ced4da','#b0b8c0'],['#dee2e6','#c4c8cc'],['#495057','#363b40'],['#6c757d','#555b60'],['#868e96','#6c737a'],['#adb5bd','#8c939a']], ball:['#ffffff','#ced4da','#495057'], ballGlow:'#ced4da', trail:'#868e96', paddle:['#495057','#ced4da','#495057'] },
  { name:'樱花', bg:'#1a0a14', bgGlow:'rgba(120,30,60,0.5)', bricks:[['#f783ac','#d96090'],['#faa2c1','#e880a8'],['#fcc2d7','#f0a0c0'],['#f06595','#d84878'],['#e64980','#cc3068'],['#d6336c','#b82058'],['#f783ac','#d96090'],['#faa2c1','#e880a8']], ball:['#ffffff','#f783ac','#d6336c'], ballGlow:'#f783ac', trail:'#f06595', paddle:['#d6336c','#f783ac','#d6336c'] },
  { name:'雷霆', bg:'#0e0e00', bgGlow:'rgba(100,100,0,0.4)', bricks:[['#ffe066','#d4b830'],['#ffd43b','#c8a020'],['#fab005','#d89000'],['#f59f00','#d08000'],['#e67700','#c06000'],['#ffec99','#e0d060'],['#ffe066','#d4b830'],['#ffd43b','#c8a020']], ball:['#ffffff','#ffe066','#c8a020'], ballGlow:'#ffe066', trail:'#fab005', paddle:['#c8a020','#ffe066','#c8a020'] },
  { name:'烈焰', bg:'#1a0a00', bgGlow:'rgba(140,50,0,0.5)', bricks:[['#ff4500','#cc3700'],['#ff6a00','#d95800'],['#ff8c00','#cc7000'],['#ffae00','#d99000'],['#ffd700','#ccb000'],['#ffec3d','#d9c820'],['#ff6347','#d94e34'],['#ff7f50','#d96640']], ball:['#ffffff','#ffd700','#cc6600'], ballGlow:'#ffd700', trail:'#ff8c00', paddle:['#cc6600','#ffd700','#cc6600'] }
];

var POWERUP_TYPES = {
  WIDE: { color: '#69db7c', symbol: 'W', duration: 8000 },
  MULTI: { color: '#4dabf7', symbol: 'M', duration: 0 },
  SLOW: { color: '#ffd43b', symbol: 'S', duration: 6000 },
  LIFE: { color: '#ff6b6b', symbol: '♥', duration: 0 },
  BIG: { color: '#ff9ff3', symbol: 'B', duration: 0 }
};

var PET_CHARACTERS = [
  { id: 'usagi', name: '乌萨奇', imgSrc: '/img/wsq.png' },
  { id: 'chiikawa', name: '吉伊', imgSrc: '/img/jyi.png' },
  { id: 'hachi', name: '小八', imgSrc: '/img/xiaob.jpg' },
  { id: 'capybara', name: '水豚噜噜', imgSrc: '/img/shuit.png' },
  { id: 'mao', name: '猫猫', imgSrc: '/img/mao.png' }
];

var PET_SPEECHES = {
  idle: ['~', '...'],
  happy: ['好棒!', '耶!', '加油!'],
  excited: ['太强了!', '连击!', '无敌!'],
  nervous: ['小心!', '注意!'],
  sad: ['呜...', '别灰心'],
  love: ['♥', '嘿嘿']
};

function getTheme() { return LEVEL_THEMES[(level - 1) % LEVEL_THEMES.length]; }
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

function buildTransparentPetCanvas(img) {
  if (!petProcessCanvas) return img;
  var w = img.width, h = img.height;
  petProcessCanvas.width = w;
  petProcessCanvas.height = h;
  var octx = petProcessCanvas.getContext('2d');
  octx.clearRect(0, 0, w, h);
  octx.drawImage(img, 0, 0);
  var imageData = octx.getImageData(0, 0, w, h);
  var data = imageData.data;
  var visited = new Uint8Array(w * h);

  function isBgPixel(r, g, b) {
    if (r > 232 && g > 232 && b > 232) return true;
    if (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && r >= 160 && r <= 228) return true;
    return false;
  }

  function pushBg(x, y, queue) {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    var i = y * w + x;
    if (visited[i]) return;
    var pi = i * 4;
    if (!isBgPixel(data[pi], data[pi + 1], data[pi + 2])) return;
    visited[i] = 1;
    data[pi + 3] = 0;
    queue.push(x, y);
  }

  var queue = [];
  for (var x = 0; x < w; x++) { pushBg(x, 0, queue); pushBg(x, h - 1, queue); }
  for (var y = 0; y < h; y++) { pushBg(0, y, queue); pushBg(w - 1, y, queue); }
  for (var qi = 0; qi < queue.length; qi += 2) {
    var px = queue[qi], py = queue[qi + 1];
    pushBg(px + 1, py, queue);
    pushBg(px - 1, py, queue);
    pushBg(px, py + 1, queue);
    pushBg(px, py - 1, queue);
  }

  octx.putImageData(imageData, 0, 0);
  return petProcessCanvas;
}

function preloadPetImages() {
  if (!canvas) return;
  for (var i = 0; i < PET_CHARACTERS.length; i++) {
    (function(ch) {
      var img = canvas.createImage();
      img.onload = function() {
        petImageCache[ch.id] = img;
        try { petProcessedCache[ch.id] = buildTransparentPetCanvas(img); } catch(e) { petProcessedCache[ch.id] = img; }
      };
      img.src = ch.imgSrc;
    })(PET_CHARACTERS[i]);
  }
}

function getPetSize() { return PET_DISPLAY_SIZE * petPokeScale; }

function getPetBounds() {
  var size = getPetSize();
  return { left: petX - size / 2, top: petY - size, right: petX + size / 2, bottom: petY };
}

function hitTestPet(mx, my) {
  if (!activePet) return false;
  var b = getPetBounds();
  return mx >= b.left && mx <= b.right && my >= b.top && my <= b.bottom;
}

function canInteractWithPet() {
  return activePet && (gameState === STATE.PLAYING || gameState === STATE.LAUNCHING);
}

function setPetMood(mood, duration) {
  petMood = mood;
  petMoodTimer = duration || 90;
  var speeches = PET_SPEECHES[mood] || PET_SPEECHES.idle;
  petSpeech = speeches[Math.floor(Math.random() * speeches.length)];
  petSpeechTimer = 60;
}

function pokePet() {
  setPetMood('excited', 50);
  petPokeTimer = 12;
  var pokeWords = ['嘿嘿!', '好开心!', '再来!', '耶!', '戳我干嘛~'];
  petSpeech = pokeWords[Math.floor(Math.random() * pokeWords.length)];
  petSpeechTimer = 70;
  spawnParticles(petX, petY - getPetSize() / 2, '#ffd43b', 8);
}

function movePetTo(mx, my) {
  var size = getPetSize();
  petX = clamp(mx - petDragOffsetX, size / 2 + 4, W - size / 2 - 4);
  petY = clamp(my - petDragOffsetY, 40 + size, H - 50);
  petTargetX = petX;
  petTargetY = petY;
}

function grantPet() {
  var pet = PET_CHARACTERS[Math.floor(Math.random() * PET_CHARACTERS.length)];
  activePet = pet;
  petX = W - 50;
  petY = H - 95;
  petTargetX = petX;
  petTargetY = petY;
  petMood = 'happy';
  petMoodTimer = 120;
  petSpeech = '你好，我是' + pet.name + '!';
  petSpeechTimer = 90;
  petIsDragging = false;
  petDidDrag = false;
  return pet;
}

function updatePet() {
  if (!activePet) return;
  petAnimFrame++;
  if (petPokeTimer > 0) {
    petPokeTimer--;
    petPokeScale = 1 + (petPokeTimer / 12) * 0.25;
  } else {
    petPokeScale = 1;
  }
  if (petMoodTimer > 0) {
    petMoodTimer--;
    if (petMoodTimer <= 0) petMood = 'idle';
  }
  if (petSpeechTimer > 0) petSpeechTimer--;
  if (petIsDragging) return;
  petX += (petTargetX - petX) * 0.08;
  petY += (petTargetY - petY) * 0.08;
  if (petMood === 'excited') {
    petTargetX = W - 50 + Math.sin(petAnimFrame * 0.15) * 10;
    petTargetY = H - 95 + Math.cos(petAnimFrame * 0.2) * 6;
  } else if (petMood === 'nervous') {
    petTargetX = W - 50 + Math.sin(petAnimFrame * 0.3) * 5;
    petTargetY = H - 95;
  } else if (petMood === 'sad') {
    petTargetX = W - 50;
    petTargetY = H - 90;
  } else {
    petTargetX = W - 50;
    petTargetY = H - 95 + Math.sin(petAnimFrame * 0.04) * 4;
  }
  var size = getPetSize();
  petX = clamp(petX, size / 2 + 4, W - size / 2 - 4);
  petY = clamp(petY, 40 + size, H - 50);
}

function drawPetOnCanvas() {
  if (!activePet) return;
  var img = petProcessedCache[activePet.id] || petImageCache[activePet.id];
  var size = getPetSize();
  var bounce = 0;
  if (petMood === 'happy' || petMood === 'excited') bounce = Math.abs(Math.sin(petAnimFrame * 0.15)) * 5;
  if (petMood === 'sad') bounce = -2;
  var drawY = petY - bounce;
  var drawX = petX - size / 2;
  var drawTop = drawY - size;

  ctx.save();
  ctx.globalAlpha = petIsDragging ? 0.88 : 1;
  if (img && img.width) {
    ctx.drawImage(img, drawX, drawTop, size, size);
  } else {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(activePet.name, petX, drawTop + size / 2);
  }
  if (petSpeechTimer > 0 && petSpeech) {
    ctx.globalAlpha = Math.min(1, petSpeechTimer / 12);
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    var sw = ctx.measureText(petSpeech).width + 12;
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    drawRoundRect(petX - sw / 2, drawTop - 10, sw, 18, 8);
    ctx.fill();
    ctx.fillStyle = '#444';
    ctx.fillText(petSpeech, petX, drawTop + 5);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function playSound(freq, dur, type, vol) {
  try {
    var ac = wx.createInnerAudioContext();
    ac.src = '';
    ac.volume = vol || 0.15;
    ac.play();
    ac.destroy();
  } catch(e) {}
}

function initPaddle() {
  paddle.w = 90;
  paddle.x = (W - paddle.w) / 2;
  paddle.y = H - 50;
  paddle.targetX = paddle.x;
}

function initBall() {
  ball.r = 7;
  ball.speed = 4.5 + level * 0.3 + speedPenalty + cycle * 0.8;
  ball.attached = true;
  ball.x = paddle.x + paddle.w / 2;
  ball.y = paddle.y - ball.r - 1;
  ball.dx = 0; ball.dy = 0;
  extraBalls = [];
}

function createBricks() {
  bricks = [];
  var layout = LEVEL_LAYOUTS[(level - 1) % LEVEL_LAYOUTS.length];
  var rows = layout.length, cols = layout[0].length;
  var theme = getTheme();
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      if (!layout[r][c]) continue;
      var hp = 1;
      if (level >= 2 || cycle >= 1) hp = Math.max(hp, 2);
      if (level >= 3 || cycle >= 2) hp = Math.max(hp, 2);
      if (level >= 4 || cycle >= 3) hp = Math.max(hp, 3);
      if (level >= 5 || cycle >= 4) hp = Math.max(hp, 3);
      hp += cycle;
      if (r < 2) hp += Math.floor(cycle / 2);
      if (r < 1) hp += 1;
      var hasPU = Math.random() < 0.12;
      var puType = null;
      if (hasPU) { var t = Object.keys(POWERUP_TYPES); puType = t[Math.floor(Math.random() * t.length)]; }
      bricks.push({ x: BRICK_LEFT + c * (BRICK_W + BRICK_PAD), y: BRICK_TOP + r * (BRICK_H + BRICK_PAD), w: BRICK_W, h: BRICK_H, hp: hp, maxHp: hp, color: theme.bricks[r % theme.bricks.length], alive: true, powerUp: puType, shakeTime: 0 });
    }
  }
}

function spawnParticles(x, y, color, count) {
  for (var i = 0; i < count; i++) {
    var a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 3;
    particles.push({ x: x, y: y, dx: Math.cos(a) * s, dy: Math.sin(a) * s, life: 1, decay: 0.015 + Math.random() * 0.025, size: 2 + Math.random() * 4, color: color });
  }
}

function activatePowerUp(type) {
  if (type === 'WIDE') { paddle.w = 130; activePowerUps.WIDE = Date.now() + POWERUP_TYPES.WIDE.duration; }
  else if (type === 'MULTI') { for (var i = 0; i < 2; i++) { var a = -Math.PI / 2 + (Math.random() - 0.5) * 1.2; extraBalls.push({ x: ball.x, y: ball.y, r: ball.r, speed: ball.speed, dx: Math.cos(a) * ball.speed, dy: Math.sin(a) * ball.speed, alive: true }); } }
  else if (type === 'SLOW') { ball.speed = Math.max(2.5, ball.speed * 0.65); var m = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy); if (m > 0) { ball.dx = (ball.dx / m) * ball.speed; ball.dy = (ball.dy / m) * ball.speed; } activePowerUps.SLOW = Date.now() + POWERUP_TYPES.SLOW.duration; }
  else if (type === 'LIFE') { lives = Math.min(lives + 1, 5); }
  else if (type === 'BIG') { var a = -Math.PI / 2 + (Math.random() - 0.5) * 1.0; extraBalls.push({ x: ball.x, y: ball.y, r: 3, growTarget: 14, speed: ball.speed, dx: Math.cos(a) * ball.speed, dy: Math.sin(a) * ball.speed, alive: true }); }
}

function updatePowerUpTimers() {
  var now = Date.now();
  if (activePowerUps.WIDE && now > activePowerUps.WIDE) { paddle.w = 90; delete activePowerUps.WIDE; }
  if (activePowerUps.SLOW && now > activePowerUps.SLOW) { ball.speed = 4.5 + level * 0.3; var m = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy); if (m > 0) { ball.dx = (ball.dx / m) * ball.speed; ball.dy = (ball.dy / m) * ball.speed; } delete activePowerUps.SLOW; }
}

function ballBrickCollision(bx, by, br, brick) {
  var cx = clamp(bx, brick.x, brick.x + brick.w), cy = clamp(by, brick.y, brick.y + brick.h);
  var dx = bx - cx, dy = by - cy;
  return (dx * dx + dy * dy) < (br * br);
}

function updateBall(b) {
  if (b.attached) { b.x = paddle.x + paddle.w / 2; b.y = paddle.y - b.r - 1; return; }
  b.x += b.dx; b.y += b.dy;
  if (b.growTarget && b.r < b.growTarget) b.r = Math.min(b.r + 0.15, b.growTarget);
  if (b.x - b.r <= 0) { b.x = b.r; b.dx = Math.abs(b.dx); }
  if (b.x + b.r >= W) { b.x = W - b.r; b.dx = -Math.abs(b.dx); }
  if (b.y - b.r <= 0) { b.y = b.r; b.dy = Math.abs(b.dy); }
  if (b.dy > 0 && b.y + b.r >= paddle.y && b.y + b.r <= paddle.y + paddle.h + 4 && b.x >= paddle.x - 2 && b.x <= paddle.x + paddle.w + 2) {
    var hp = clamp((b.x - paddle.x) / paddle.w, 0, 1);
    var angle = -Math.PI * (0.15 + hp * 0.7);
    b.dx = Math.cos(angle) * b.speed; b.dy = Math.sin(angle) * b.speed;
    b.y = paddle.y - b.r - 1; combo = 0;
  }
  for (var i = 0; i < bricks.length; i++) {
    var brick = bricks[i];
    if (!brick.alive) continue;
    if (ballBrickCollision(b.x, b.y, b.r, brick)) {
      brick.hp--; brick.shakeTime = 6; combo++;
      if (activePet) {
        if (combo >= 5) setPetMood('excited', 60);
        else if (combo >= 3) setPetMood('happy', 45);
      }
      var bonus = combo > 1 ? combo : 1;
      score += 10 * bonus;
      if (brick.hp <= 0) { brick.alive = false; spawnParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color[0], 12); if (brick.powerUp) { powerUps.push({ x: brick.x + brick.w / 2, y: brick.y + brick.h / 2, w: 24, h: 24, dy: 2, type: brick.powerUp, color: POWERUP_TYPES[brick.powerUp].color, symbol: POWERUP_TYPES[brick.powerUp].symbol, alive: true }); } }
      else { spawnParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color[0], 4); }
      var bcx = brick.x + brick.w / 2, bcy = brick.y + brick.h / 2;
      var ddx = b.x - bcx, ddy = b.y - bcy;
      var ox = (brick.w / 2 + b.r) - Math.abs(ddx), oy = (brick.h / 2 + b.r) - Math.abs(ddy);
      if (ox < oy) b.dx = ddx > 0 ? Math.abs(b.dx) : -Math.abs(b.dx);
      else b.dy = ddy > 0 ? Math.abs(b.dy) : -Math.abs(b.dy);
      break;
    }
  }
  if (trails.length < 200) trails.push({ x: b.x, y: b.y, life: 1 });
}

function launchBall() {
  if (!ball.attached) return;
  ball.attached = false;
  var angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
  ball.dx = Math.cos(angle) * ball.speed; ball.dy = Math.sin(angle) * ball.speed;
  gameState = STATE.PLAYING;
}

function resetGame() {
  score = 0; lives = 3; level = 1; combo = 0; cycle = 0; speedPenalty = 0; hasWon = false;
  inventory = [null, null, null, null]; inventoryUses = 5;
  particles = []; trails = []; powerUps = []; activePowerUps = {}; activePet = null;
  petMood = 'idle'; petIsDragging = false; petDidDrag = false; petPokeScale = 1; petPokeTimer = 0;
  initPaddle(); initBall(); createBricks();
}

function startLevel() {
  combo = 0; particles = []; trails = []; powerUps = []; activePowerUps = {};
  inventory = [null, null, null, null];
  initPaddle(); initBall(); createBricks();
  gameState = STATE.LAUNCHING;
}

function update() {
  if (gameState !== STATE.PLAYING && gameState !== STATE.LAUNCHING) return;
  updatePet();
  updatePowerUpTimers();
  paddle.targetX = clamp(paddle.targetX, 0, W - paddle.w);
  paddle.x += (paddle.targetX - paddle.x) * 0.3;
  paddle.x = clamp(paddle.x, 0, W - paddle.w);
  if (ball.attached) { ball.x = paddle.x + paddle.w / 2; ball.y = paddle.y - ball.r - 1; }
  updateBall(ball);
  for (var ei = extraBalls.length - 1; ei >= 0; ei--) { updateBall(extraBalls[ei]); if (extraBalls[ei].y - extraBalls[ei].r > H) extraBalls[ei].alive = false; if (!extraBalls[ei].alive) extraBalls.splice(ei, 1); }
  if (!ball.attached && ball.y - ball.r > H) {
    if (extraBalls.length > 0) { var rep = extraBalls.shift(); ball.x = rep.x; ball.y = rep.y; ball.dx = rep.dx; ball.dy = rep.dy; ball.speed = rep.speed; ball.attached = false; }
    else { lives--; combo = 0; speedPenalty += 0.5;
      if (activePet) {
        if (lives <= 1) setPetMood('nervous', 120);
        else setPetMood('sad', 60);
      }
      if (lives <= 0) { gameState = STATE.GAME_OVER; } else { initBall(); gameState = STATE.LAUNCHING; } }
  }
  for (var pi = powerUps.length - 1; pi >= 0; pi--) {
    var pu = powerUps[pi]; pu.y += pu.dy;
    if (pu.y + pu.h >= paddle.y && pu.y <= paddle.y + paddle.h && pu.x + pu.w / 2 >= paddle.x && pu.x - pu.w / 2 <= paddle.x + paddle.w) {
      var stored = false;
      for (var si = 0; si < inventory.length; si++) { if (inventory[si] === null) { inventory[si] = pu.type; stored = true; break; } }
      if (!stored) activatePowerUp(pu.type);
      spawnParticles(pu.x, pu.y, pu.color, 8); powerUps.splice(pi, 1); continue;
    }
    if (pu.y > H + 30) powerUps.splice(pi, 1);
  }
  for (var ti = trails.length - 1; ti >= 0; ti--) { trails[ti].life -= 0.06; if (trails[ti].life <= 0) trails.splice(ti, 1); }
  for (var ppi = particles.length - 1; ppi >= 0; ppi--) { var p = particles[ppi]; p.x += p.dx; p.y += p.dy; p.dy += 0.05; p.life -= p.decay; if (p.life <= 0) particles.splice(ppi, 1); }
  var allDead = true;
  for (var bi = 0; bi < bricks.length; bi++) { if (bricks[bi].alive) { allDead = false; break; } }
  if (allDead && gameState === STATE.PLAYING) {
    if (score >= WIN_SCORE && !hasWon) { hasWon = true; gameState = STATE.GAME_OVER; return; }
    if (level === 9 && !activePet) { grantPet(); }
    if (level >= maxLevel) { cycle++; level = 1; } else { level++; }
    gameState = STATE.LEVEL_COMPLETE;
  }
}

function drawRoundRect(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

function draw() {
  var theme = getTheme();
  ctx.fillStyle = theme.bg; ctx.fillRect(0, 0, W, H);
  var grd = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, W);
  grd.addColorStop(0, theme.bgGlow); grd.addColorStop(1, 'rgba(10,10,40,0)');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);

  for (var ti = 0; ti < trails.length; ti++) { var t = trails[ti]; ctx.globalAlpha = t.life * 0.35; ctx.fillStyle = theme.trail; ctx.beginPath(); ctx.arc(t.x, t.y, ball.r * t.life * 0.7, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalAlpha = 1;

  for (var bi = 0; bi < bricks.length; bi++) {
    var brick = bricks[bi]; if (!brick.alive) continue;
    var sx = 0, sy = 0;
    if (brick.shakeTime > 0) { sx = (Math.random() - 0.5) * 3; sy = (Math.random() - 0.5) * 3; brick.shakeTime--; }
    ctx.globalAlpha = 0.5 + (brick.hp / brick.maxHp) * 0.5;
    ctx.save(); ctx.shadowColor = brick.color[0]; ctx.shadowBlur = 6;
    var bGrd = ctx.createLinearGradient(brick.x + sx, brick.y + sy, brick.x + sx + brick.w, brick.y + brick.h + sy);
    bGrd.addColorStop(0, brick.color[0]); bGrd.addColorStop(0.5, brick.color[1]); bGrd.addColorStop(1, brick.color[0]);
    ctx.fillStyle = bGrd; drawRoundRect(brick.x + sx, brick.y + sy, brick.w, brick.h, 4); ctx.fill(); ctx.restore();
    ctx.globalAlpha = 0.35; ctx.fillStyle = '#fff'; drawRoundRect(brick.x + sx + 3, brick.y + sy + 2, brick.w - 6, brick.h / 2.5, 2); ctx.fill();
    ctx.globalAlpha = 1;
    if (brick.hp > 1) { ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(brick.hp, brick.x + brick.w / 2 + sx, brick.y + brick.h / 2 + sy); }
  }
  ctx.globalAlpha = 1;

  for (var pi = 0; pi < powerUps.length; pi++) {
    var pu = powerUps[pi]; ctx.save(); ctx.shadowColor = pu.color; ctx.shadowBlur = 10; ctx.fillStyle = pu.color; ctx.beginPath(); ctx.arc(pu.x, pu.y, 12, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(pu.symbol, pu.x, pu.y);
  }

  ctx.save(); ctx.shadowColor = theme.ballGlow; ctx.shadowBlur = 15;
  var pGrd = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x + paddle.w, paddle.y);
  pGrd.addColorStop(0, theme.paddle[0]); pGrd.addColorStop(0.5, theme.paddle[1]); pGrd.addColorStop(1, theme.paddle[2]);
  ctx.fillStyle = pGrd; drawRoundRect(paddle.x, paddle.y, paddle.w, paddle.h, 7); ctx.fill(); ctx.restore();

  function drawBallObj(b) {
    var isBig = b.growTarget && b.growTarget > 10;
    var gc = isBig ? '#ff9ff3' : theme.ballGlow;
    var bc = isBig ? ['#ffffff','#ff9ff3','#c44ddb'] : theme.ball;
    ctx.save(); ctx.shadowColor = gc; ctx.shadowBlur = isBig ? 20 : 15;
    var bg = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.1, b.x, b.y, b.r);
    bg.addColorStop(0, bc[0]); bg.addColorStop(0.4, bc[1]); bg.addColorStop(1, bc[2]);
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(b.x - b.r * 0.25, b.y - b.r * 0.25, b.r * 0.35, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.globalAlpha = 1; ctx.restore();
  }
  drawBallObj(ball);
  for (var ebi = 0; ebi < extraBalls.length; ebi++) drawBallObj(extraBalls[ebi]);

  for (var ppi = 0; ppi < particles.length; ppi++) { var p = particles[ppi]; ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalAlpha = 1;

  drawPetOnCanvas();
  drawHUD();

  if (gameState === STATE.START) drawStartScreen();
  else if (gameState === STATE.LAUNCHING) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '14px Arial'; ctx.textAlign = 'center'; ctx.fillText('点击屏幕发射小球', W / 2, H - 10); }
  else if (gameState === STATE.GAME_OVER) drawGameOverScreen();
  else if (gameState === STATE.LEVEL_COMPLETE) drawLevelCompleteScreen();
}

function drawHUD() {
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, W, 36);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 15px Arial'; ctx.textAlign = 'left'; ctx.fillText('得分: ' + score, 12, 24);
  ctx.textAlign = 'center'; ctx.fillStyle = '#00d4ff';
  var cs = cycle > 0 ? ' [第' + (cycle + 1) + '轮]' : '';
  ctx.fillText('关卡 ' + level + ' · ' + getTheme().name + cs, W / 2, 24);
  ctx.textAlign = 'right'; var hs = ''; for (var i = 0; i < lives; i++) hs += '♥ '; ctx.fillStyle = '#ff6b6b'; ctx.fillText(hs, W - 12, 24);
  if (combo > 1) { ctx.fillStyle = '#ffd43b'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center'; ctx.fillText('连击 x' + combo, W / 2, 50); }

  var slotW = 40, slotH = 32, slotGap = 6;
  var totalSW = inventory.length * slotW + (inventory.length - 1) * slotGap;
  var slotSX = (W - totalSW) / 2, slotY = H - 38;
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, slotY - 6, W, 44);
  for (var ii = 0; ii < inventory.length; ii++) {
    var sx = slotSX + ii * (slotW + slotGap);
    var hasItem = inventory[ii] !== null, canUse = hasItem && inventoryUses > 0;
    ctx.strokeStyle = canUse ? 'rgba(0,212,255,0.8)' : 'rgba(255,255,255,0.2)'; ctx.lineWidth = canUse ? 2 : 1;
    drawRoundRect(sx, slotY, slotW, slotH, 5); ctx.stroke();
    if (hasItem) { var pi = POWERUP_TYPES[inventory[ii]]; ctx.globalAlpha = canUse ? 1 : 0.4; ctx.fillStyle = pi.color; drawRoundRect(sx + 2, slotY + 2, slotW - 4, slotH - 4, 4); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(pi.symbol, sx + slotW / 2, slotY + slotH / 2); ctx.globalAlpha = 1; }
  }
  ctx.fillStyle = inventoryUses > 0 ? '#ffd43b' : '#ff6b6b'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText('使用: ' + inventoryUses, W - 10, slotY + slotH / 2);
}

function drawStartScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 32px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(255,200,50,0.8)'; ctx.shadowBlur = 30;
  ctx.fillText('重生之球来砖往', W / 2, H * 0.25);
  ctx.shadowBlur = 0;
  ctx.font = '16px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('滑动手指控制挡板', W / 2, H * 0.4);
  ctx.fillText('点击屏幕发射小球', W / 2, H * 0.45);
  ctx.fillText('拾取道具存入背包', W / 2, H * 0.5);
  ctx.fillStyle = '#ffd43b'; ctx.fillText('第9关获得随机桌宠！', W / 2, H * 0.56);
  ctx.fillText('点击/拖拽桌宠可互动', W / 2, H * 0.61);
  ctx.fillStyle = '#ff6b6b'; ctx.fillText('累计100000分通关！', W / 2, H * 0.67);

  ctx.fillStyle = 'rgba(0,212,255,0.8)'; ctx.font = 'bold 20px Arial';
  drawRoundRect(W / 2 - 80, H * 0.72, 160, 44, 22); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillText('开始游戏', W / 2, H * 0.72 + 22);
}

function drawGameOverScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = hasWon ? '#ffd700' : '#ff6b6b'; ctx.font = 'bold 28px Arial'; ctx.textAlign = 'center';
  ctx.fillText(hasWon ? '恭喜通关！' : '游戏结束', W / 2, H * 0.3);
  ctx.fillStyle = '#00d4ff'; ctx.font = '22px Arial'; ctx.fillText('得分: ' + score, W / 2, H * 0.4);
  ctx.fillStyle = '#fff'; ctx.font = '16px Arial'; ctx.fillText('到达关卡: ' + level, W / 2, H * 0.47);
  ctx.strokeStyle = 'rgba(0,212,255,0.8)'; ctx.lineWidth = 2;
  drawRoundRect(W / 2 - 80, H * 0.55, 160, 44, 22); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 18px Arial'; ctx.fillText('重新开始', W / 2, H * 0.55 + 22);
}

function drawLevelCompleteScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#ff6bcb'; ctx.font = 'bold 28px Arial'; ctx.textAlign = 'center'; ctx.fillText('关卡完成！', W / 2, H * 0.3);
  ctx.fillStyle = '#00d4ff'; ctx.font = '22px Arial'; ctx.fillText('得分: ' + score, W / 2, H * 0.4);
  if (activePet) { ctx.fillStyle = '#ffd43b'; ctx.font = '16px Arial'; ctx.fillText('桌宠: ' + activePet.name, W / 2, H * 0.47); }
  ctx.strokeStyle = 'rgba(0,212,255,0.8)'; ctx.lineWidth = 2;
  drawRoundRect(W / 2 - 80, H * 0.55, 160, 44, 22); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 18px Arial'; ctx.fillText('下一关', W / 2, H * 0.55 + 22);
}

function handleTap(x, y) {
  var sx = x * dpr, sy = y * dpr;
  if (gameState === STATE.START) {
    if (sx > W / 2 - 80 && sx < W / 2 + 80 && sy > H * 0.72 && sy < H * 0.72 + 44) { resetGame(); gameState = STATE.LAUNCHING; }
  } else if (gameState === STATE.LAUNCHING) {
    launchBall();
  } else if (gameState === STATE.GAME_OVER) {
    if (sx > W / 2 - 80 && sx < W / 2 + 80 && sy > H * 0.55 && sy < H * 0.55 + 44) { resetGame(); gameState = STATE.LAUNCHING; }
  } else if (gameState === STATE.LEVEL_COMPLETE) {
    if (sx > W / 2 - 80 && sx < W / 2 + 80 && sy > H * 0.55 && sy < H * 0.55 + 44) { startLevel(); }
  }
}

Page({
  onReady: function() {
    var self = this;
    var query = wx.createSelectorQuery();
    query.select('#gameCanvas').fields({ node: true, size: true }).exec(function(res) {
      canvas = res[0].node;
      ctx = canvas.getContext('2d');
      dpr = wx.getWindowInfo().pixelRatio;
      var ww = wx.getWindowInfo().windowWidth;
      var wh = wx.getWindowInfo().windowHeight;
      W = ww * dpr;
      H = wh * dpr;
      canvas.width = W;
      canvas.height = H;
      try { petProcessCanvas = wx.createOffscreenCanvas({ type: '2d', width: 1, height: 1 }); } catch(e) {}
      BRICK_LEFT = (W - (9 * (BRICK_W + BRICK_PAD) - BRICK_PAD)) / 2;
      preloadPetImages();
      resetGame();
      gameState = STATE.START;
      function loop() { update(); draw(); canvas.requestAnimationFrame(loop); }
      canvas.requestAnimationFrame(loop);
    });

    wx.onTouchStart(function(e) {
      var t = e.touches[0];
      var sx = t.x * dpr, sy = t.y * dpr;
      if (canInteractWithPet() && hitTestPet(sx, sy)) {
        petIsDragging = true;
        petDidDrag = false;
        petTouchStartX = sx;
        petTouchStartY = sy;
        petDragOffsetX = sx - petX;
        petDragOffsetY = sy - petY;
        setPetMood('happy', 40);
        return;
      }
      handleTap(t.x, t.y);
    });

    wx.onTouchMove(function(e) {
      var t = e.touches[0];
      var sx = t.x * dpr, sy = t.y * dpr;
      if (petIsDragging) {
        if (Math.abs(sx - petTouchStartX) > 8 || Math.abs(sy - petTouchStartY) > 8) petDidDrag = true;
        movePetTo(sx, sy);
        return;
      }
      paddle.targetX = clamp(t.x * dpr - paddle.w / 2, 0, W - paddle.w);
    });

    wx.onTouchEnd(function(e) {
      if (petIsDragging) {
        if (!petDidDrag && canInteractWithPet()) pokePet();
        petIsDragging = false;
        petDidDrag = false;
      }
    });
  }
});
