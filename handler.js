var map = L.map('map', {
  crs: L.CRS.Simple,
  smoothZoom: false,
  smoothZoomDelay: 10000,
  minZoom: -4,
  maxZoom:.5,
  zoomSnap: 0,
  zoomControl: false,
  attributionControl: false,
  preferCanvas: true
});

let layerName = "outterworld";

let settingCircleRadius = 100;
let settingTime = 0;
let settingLive = 3;

let isGameOver = false;

let round;
let accuracy;
let liveRemaining;

let custom = false;
let goodPostition;
let goodLayer;
let nameLocation;
let answerId;

let mask = [];
let isInside;
let lockClick = false;
let canClick = true;
let dataList = {};
let guessPosition = [];
let marker = undefined;
let circle = undefined;
let polygon = undefined;

let bounds = [[-3200,-3400], [3200,3400]];
let image = L.imageOverlay('./assets/map.jpg', bounds).addTo(map);

let underground = L.imageOverlay('./assets/underground.jpg', bounds);

map.fitBounds(bounds);
map.setView([0, 0], -3);

$('#gameOver').hide();

// Marker 
map.on('click', addMarker);

function addMarker(e){
  if (canClick === false || lockClick === true) { return; }

  if (marker !== undefined) {
	  map.removeLayer(marker);
  }
  marker = new L.marker(e.latlng).addTo(map);
  guessPosition = e.latlng;

  $("#guess").css("background", "linear-gradient(0deg, rgba(203,181,129,1) 0%, rgba(231,188,88,1) 100%)");
  $("#guess").css("cursor", "pointer");
};

// Zoom
var zoomOptions = {
  zoomInText: '+',
  zoomOutText: '-',
};
var zoom = L.control.zoom(zoomOptions);
zoom.addTo(map);

// Attribution
var attrOptions = {
  prefix: 'Where in Elden-Ring'
};
var attr = L.control.attribution(attrOptions);
 attr.addTo(map);

// Button
function grant_privileges() {
  canClick = true;
  map.doubleClickZoom.enable(); 
  map.dragging.enable();
  map.touchZoom.enable();
  map.scrollWheelZoom.enable();
  map.boxZoom.enable();
  map.keyboard.enable();
  if (map.tap) map.tap.enable();
}
function degrant_privileges() {
  canClick = false;
  map.doubleClickZoom.disable(); 
  map.dragging.disable();
  map.touchZoom.disable();
  map.scrollWheelZoom.disable();
  map.boxZoom.disable();
  map.keyboard.disable();
  if (map.tap) map.tap.disable();
}

$('#customGlobalDifficultyEasy').click(function() {
  selectCustomDifficulty('#customGlobalDifficultyEasy');
  selectCustomRadius('#customRadiusBig');
  selectCustomTime('#customTimeEasy');
  selectCustomLive('#customLiveEasy');
  settingLive = 10;
  settingTime = 60;
  settingCircleRadius = 150;
});
$('#customGlobalDifficultyMedium').click(function() {
  selectCustomDifficulty('#customGlobalDifficultyMedium');
  selectCustomRadius('#customRadiusMedium');
  selectCustomTime('#customTimeMedium');
  selectCustomLive('#customLiveMedium');
  settingLive = 3;
  settingTime = 30;
  settingCircleRadius = 100;
});
$('#customGlobalDifficultyHard').click(function() {
  selectCustomDifficulty('#customGlobalDifficultyHard');
  selectCustomRadius('#customRadiusLow');
  selectCustomTime('#customTimeHard');
  selectCustomLive('#customLiveHard');
  settingLive = 1;
  settingTime = 5;
  settingCircleRadius = 50;
});
$('#customGlobalDifficultyDefault').click(function() {
  selectCustomDifficulty('#customGlobalDifficultyDefault');
  selectCustomRadius('#customRadiusMedium');
  selectCustomLive('#customLiveMedium');
  selectCustomTime('#customTimeNoTime');
  settingTime = 0;
  settingLive = 3;
  settingCircleRadius = 100;
});
function selectCustomDifficulty(name) {
  $(name).css("background", "linear-gradient(0deg, rgb(87, 72, 38) 0%, rgba(231,188,88,1) 100%)");
  if (name !== "#customGlobalDifficultyEasy") { $("#customGlobalDifficultyEasy").css("background", "rgb(203,181,129)"); }
  if (name !== "#customGlobalDifficultyMedium") { $("#customGlobalDifficultyMedium").css("background", "rgb(203,181,129)"); }
  if (name !== "#customGlobalDifficultyHard") { $("#customGlobalDifficultyHard").css("background", "rgb(203,181,129)"); }
  if (name !== "#customGlobalDifficultyDefault") { $("#customGlobalDifficultyDefault").css("background", "rgb(203,181,129)"); }
}

$('#customRadiusBig').click(function() {
  selectCustomRadius('#customRadiusBig');
  settingCircleRadius = 150;
});
$('#customRadiusMedium').click(function() {
  selectCustomRadius('#customRadiusMedium');
  settingCircleRadius = 100;
});
$('#customRadiusLow').click(function() {
  selectCustomRadius('#customRadiusLow');
  settingCircleRadius = 50;
});
function selectCustomRadius(name) {
  $(name).css("background", "linear-gradient(0deg, rgb(87, 72, 38) 0%, rgba(231,188,88,1) 100%)");
  if (name !== "#customRadiusBig") { $("#customRadiusBig").css("background", "rgb(203,181,129)"); }
  if (name !== "#customRadiusMedium") { $("#customRadiusMedium").css("background", "rgb(203,181,129)"); }
  if (name !== "#customRadiusLow") { $("#customRadiusLow").css("background", "rgb(203,181,129)"); }
}

$('#customTimeNoTime').click(function() {
  selectCustomTime('#customTimeNoTime');
  settingTime = 0;
});
$('#customTimeEasy').click(function() {
  selectCustomTime('#customTimeEasy');
  settingTime = 60;
});
$('#customTimeMedium').click(function() {
  selectCustomTime('#customTimeMedium');
  settingTime = 30;
});
$('#customTimeHard').click(function() {
  selectCustomTime('#customTimeHard');
  settingTime = 5;
});
function selectCustomTime(name) {
  $(name).css("background", "linear-gradient(0deg, rgb(87, 72, 38) 0%, rgba(231,188,88,1) 100%)");
  if (name !== "#customTimeNoTime") { $("#customTimeNoTime").css("background", "rgb(203,181,129)") }
  if (name !== "#customTimeEasy") { $("#customTimeEasy").css("background", "rgb(203,181,129)"); }
  if (name !== "#customTimeMedium") { $("#customTimeMedium").css("background", "rgb(203,181,129)"); }
  if (name !== "#customTimeHard") { $("#customTimeHard").css("background", "rgb(203,181,129)"); }
}

$('#customLiveEasy').click(function() {
  selectCustomLive('#customLiveEasy');
  settingLive = 10;
});
$('#customLiveMedium').click(function() {
  selectCustomLive('#customLiveMedium');
  settingLive = 3;
});
$('#customLiveHard').click(function() {
  selectCustomLive('#customLiveHard');
  settingLive = 1;
});
function selectCustomLive(name) {
  $(name).css("background", "linear-gradient(0deg, rgb(87, 72, 38) 0%, rgba(231,188,88,1) 100%)");
  if (name !== "#customLiveEasy") { $("#customLiveEasy").css("background", "rgb(203,181,129)"); }
  if (name !== "#customLiveMedium") { $("#customLiveMedium").css("background", "rgb(203,181,129)"); }
  if (name !== "#customLiveHard") { $("#customLiveHard").css("background", "rgb(203,181,129)"); }
}



$('#play').click(function() {
  $('.ruban').show();
  $('.ruban').css("display", "flex");
  $('#image').show();
  $('#map').hide();
  $('#menu').hide();
  settingCircleRadius = 100;
  settingTime = 0;
  settingLive = 3;
  custom = false;
  start();
});
$('#playCustom').click(function() {
  $('.ruban').show();
  $('.ruban').css("display", "flex");
  $('#image').show();
  $('#map').hide();
  $('#menu').hide();
  custom = true;
  start();
});

$('#custom').click(function() {
  selectCustomDifficulty('#customGlobalDifficultyDefault');
  selectCustomRadius('#customRadiusMedium');
  selectCustomLive('#customLiveMedium');
  selectCustomTime('#customTimeNoTime');
  settingTime = 0;
  settingLive = 3;
  settingCircleRadius = 100;
  settingPictures = "random";

  $('#customMenu').show();
  $('#customMenu').css("display", "flex");
  $('#mainMenu').hide();
  $('#leaderboardMenu').hide();
});
$('#leaderboardBtn').click(function() {
  $('#customMenu').hide();
  $('#mainMenu').hide();
  $('#leaderboardMenu').show();
  $('#leaderboardMenu').css("display", "flex");
});
$('#back').click(function() {
  backMenu();
});
$('#back2').click(function() {
  backMenu();
});

$("#review").click(function() {
  $("#map").hide();
  $("#image").show();
});
$("#makeGuess").click(function() {
  switchImageMap();
});
$("#guess").click(function() {
  if(marker === undefined) { return }
  if (settingTime > 0) { $(".timer").text("end"); }
  reveal();
});
$("#next").click(function() {
  $('#map').hide();
  $('#image').show();
  $("#guess").show();
  $("#review").show();
  $("#next").hide();
  $('#nameLocation').hide();
  $("#guess").css("background", "rgb(141, 141, 141)");
  $("#guess").css("cursor", "not-allowed");
  newRound(500);
});

$("#review").mouseover(function() {
  degrant_privileges();
});
$("#review").mouseout(function() {
  grant_privileges();
});
$("#guess").mouseover(function() {
  degrant_privileges();
});
$("#guess").mouseout(function() {
  grant_privileges();
});
$("#next").mouseover(function() {
  degrant_privileges();
});
$("#next").mouseout(function() {
  grant_privileges();
});
$("#underground").mouseover(function() {
  degrant_privileges();
});
$("#underground").mouseout(function() {
  grant_privileges();
});

$("#playAgain").click(function() {
  $("#gameOver").hide();
  $('.gameOverContainer').css('opacity', '0');
  $("#image").show();

  if (custom === true) {
    
  }
  start();
});

$("#underground").click(function() {
  if (lockClick === true){ return; }

  map.setView([0, 0], -3);

  if (layerName === "outterworld") {
    $("#imageUnderground").attr("src","./assets/outterworld.jpg");
    underground.addTo(map);
    layerName = "underground";
  }
  else {
    $("#imageUnderground").attr("src","./assets/nokron.jpg");
    map.removeLayer(underground);
    layerName = "outterworld";
  }

  if (marker !== undefined) { 
    map.removeLayer(marker); 
    marker = undefined;
    guessPosition = [];
    $("#guess").css("background", "rgb(141, 141, 141)");
    $("#guess").css("cursor", "not-allowed");
  }
});
// fonctionnal

function backMenu() {
  $('#mainMenu').show();
  $('#leaderboardMenu').hide();
  $('#customMenu').hide();
}
function switchImageMap() {
  $("#map").show();
  $("#image").hide();
  map.invalidateSize();
}

// start

leaderboardRanking();

// back

function reveal() {

  switchImageMap();

  $("#guess").hide();
  $("#review").hide();
  $("#next").show();
  $('#nameLocation').show();
  $('#nameLocation').css("display", "flex");

  if (layerName === "underground" && layerName !== goodLayer) {
    if (marker !== undefined) {
      map.removeLayer(marker);
      marker = undefined;
    }
    guessPosition = [];
    map.removeLayer(underground);
    layerName === "outterworld";
    $('#imageCave').css('opacity', '.5');
  }

  map.setView(goodPostition, -.5);
  lockClick = true;

  circle = L.circle(goodPostition, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: settingCircleRadius
  }).addTo(map);

  if (guessPosition.length === 0) {
    isInside = false;
  }
  else {
    var d = map.distance(guessPosition, goodPostition);
    isInside = d < circle.getRadius();
    isInside = isInside && (goodLayer === layerName);

    if (isInside === false) {
      polygon = L.polygon([
        goodPostition,
        guessPosition
      ]).addTo(map);
      polygon.setStyle({color: 'red'});
    }
  }

  circle.setStyle({
    fillColor: isInside ? 'green' : '#f03',
    color: isInside ? 'green' : 'red'
  })
}


async function getJSON(name) {
  return fetch(name)
      .then((response) => response.json())
      .then((responseJson) => { return responseJson });
}
async function start() {
  $("#backgroundGameOver").css("opacity","0");

  dataList = await getJSON('./answersList.json');

  isGameOver = false;
  timer();
  
  mask = new Array(dataList.list.length).fill(false);

  round = 0;
  accuracy = 0;
  liveRemaining = settingLive;

  newRound(200);
}
async function setTimer(s) {
  
  while(s !== 0){
    s--;
    await sleep(1000);
    let rightPrintTime = s < 10 ? "0" + s : s;
    if (lockClick === false && isGameOver !== true) { $(".timer").text("0:"+rightPrintTime) }
    else { return; }
  }
  $(".timer").text("end");
  reveal();
}
function timer() {
  if (settingTime !== 0) {
    $("#timerOnImage").css("display","flex");
    $("#timerOnMap").css("display","flex");
    $(".timer").text("0:"+settingTime);
    setTimer(settingTime);
  }
}


async function newRound(ms) {

  map.setView([0, 0], -3);

  timer();

  round++;
  if (round !== 1){
    if (isInside === false) { liveRemaining-- }
    if (liveRemaining === 0) { 
      round--; 
      accuracy = parseInt( ( (round - (settingLive-liveRemaining)) / round) * 100);
      gameOver(); 
    }
    else {
      accuracy = parseInt( ( (round - (settingLive-liveRemaining)) / round) * 100);
    }
    guessPosition = [];

    if (circle !== undefined) { map.removeLayer(circle); }
    if (marker !== undefined) { map.removeLayer(marker); }
    if (polygon !== undefined) { map.removeLayer(polygon); }
  }

  $("#round").text("Round: "+round);
  $("#accuracy").text("Accuracy: "+accuracy+"%");
  $("#liveRemaining").text("Live Remaining: "+liveRemaining);

  marker = undefined;

  lockClick = false;

  loading();
  await randomize(ms)
  .then(result => {
    $('#screen').css('opacity', '1');
    $('#loading').css('opacity', '0');
  })
  .catch(err => { alert("error loading"); })
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loading() {
  $("#screen").css('opacity', '0');
  $('#loading').css('opacity', '1');
  $('#screen').hide();
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

async function randomize(ms) {
  await sleep((3/5)*ms);
  $('#screen').show();

  answerId = getRandomInt(dataList.list.length);

  while (mask[answerId] === true) {

    if (!mask.includes(false)) {
      mask = new Array(dataList.list.length).fill(false);
    }
    answerId = getRandomInt(dataList.list.length);
  }
  mask[answerId] = true;

  $("#screen").attr("src", dataList.list[answerId].img);
  $("#nameLocation").text(dataList.list[answerId].name);
  goodPostition = dataList.list[answerId].coords;
  nameLocation = dataList.list[answerId].name;
  goodLayer = dataList.list[answerId].layer;

  await sleep((2/5)*ms);
}

function gameOver() {
  isGameOver = true;

  $("#map").hide();
  $("#image").hide();
  $("#gameOver").show();
  let roundsWrite = (settingLive-round) === 0 ? "" : "s";
  $("#gameOverRound").text("You successfully complete "+(round-settingLive)+" round"+roundsWrite);
  $("#gameOverAccuracy").text("Your accuracy was "+accuracy+"%");
  $("#backgroundGameOver").css("opacity","1");
  $('.gameOverContainer').css('opacity', '1');
}

map.addEventListener('mousemove', function(ev) {
  lat = parseInt(ev.latlng.lat);
  lng = parseInt(ev.latlng.lng);
  $("#mousePosition").text("x: "+lat+" y: "+lng)
});

map.on('keypress', function(e){
  var event = e.originalEvent
  if (event.key === 'c') {
    window.prompt("Copy to clipboard: Ctrl+C, Enter", "["+lat+", "+lng+"]");
  }
});



function addRowLeaderboard(rank, name, round, accuracy) {
  const div = document.createElement('div');
  
  let color = rank === 1 ? "gold" : rank === 2 ? "#c0c0c0" : rank === 3 ? "#cd7f32" : "white";
  let size = rank === 1 || rank === 2 || rank === 3 ? "20px" : "15px";
  let marginPodium = rank === 3 ? "10px" : "0px";

  div.innerHTML = `
    <div class="leaderboardElement">
      <div style="width: 65%; color: `+color+`; font-size: `+size+`">
      `+rank+` - `+name+`
      </div>
      <div style="width: 35%; display: flex; align-content: center; justify-content: flex-end; color: `+color+`; font-size: `+size+`; margin-bottom: `+marginPodium+`">
      `+round+` (`+accuracy+`%)
      </div>
    </div>
  `;
  document.getElementById('leaderboardRender').appendChild(div);
}

async function leaderboardRanking() {
  dataLeaderboard = await getJSON('./exampleLeaderboard.json');
  dataLeaderboard.list.sort((a, b) => ( parseInt(b.round) - parseInt(a.round)) || ( parseInt(b.accuracy) - parseInt(a.accuracy) ));
  dataLeaderboard.list.map((item, index) => {
    addRowLeaderboard(index+1, item.username, item.round, item.accuracy)
  })

}