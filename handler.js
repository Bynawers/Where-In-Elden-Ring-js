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

let settingPictures = "random"
let settingCircleRadius = 100;
let settingTime = 0;
let settingLive = 3;

let round;
let accuracy;
let liveRemaining;

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
  selectCustomPicture('#customPicturesEasy');
  selectCustomRadius('#customRadiusBig');
  selectCustomTime('#customTimeEasy');
  selectCustomLive('#customLiveEasy');
  settingLive = 10;
  settingTime = 60;
  settingCircleRadius = 150;
  settingPictures = "easy";
});
$('#customGlobalDifficultyMedium').click(function() {
  selectCustomDifficulty('#customGlobalDifficultyMedium');
  selectCustomPicture('#customPicturesMedium');
  selectCustomRadius('#customRadiusMedium');
  selectCustomTime('#customTimeMedium');
  selectCustomLive('#customLiveMedium');
  settingLive = 3;
  settingTime = 30;
  settingCircleRadius = 100;
  settingPictures = "medium";
});
$('#customGlobalDifficultyHard').click(function() {
  selectCustomDifficulty('#customGlobalDifficultyHard');
  selectCustomPicture('#customPicturesHard');
  selectCustomRadius('#customRadiusLow');
  selectCustomTime('#customTimeHard');
  selectCustomLive('#customLiveHard');
  settingLive = 1;
  settingTime = 15;
  settingCircleRadius = 50;
  settingPictures = "hard";
});
$('#customGlobalDifficultyDefault').click(function() {
  selectCustomDifficulty('#customGlobalDifficultyDefault');
  selectCustomPicture('#customPicturesRandom');
  selectCustomRadius('#customRadiusMedium');
  selectCustomLive('#customLiveMedium');
  selectCustomTime('#customTimeNoTime');
  settingTime = 0;
  settingLive = 3;
  settingCircleRadius = 100;
  settingPictures = "random";

});
function selectCustomDifficulty(name) {
  $(name).css("background", "linear-gradient(0deg, rgb(87, 72, 38) 0%, rgba(231,188,88,1) 100%)");
  if (name !== "#customGlobalDifficultyEasy") { $("#customGlobalDifficultyEasy").css("background", "rgb(230, 213, 172)"); }
  if (name !== "#customGlobalDifficultyMedium") { $("#customGlobalDifficultyMedium").css("background", "rgb(230, 213, 172)"); }
  if (name !== "#customGlobalDifficultyHard") { $("#customGlobalDifficultyHard").css("background", "rgb(230, 213, 172)"); }
  if (name !== "#customGlobalDifficultyDefault") { $("#customGlobalDifficultyDefault").css("background", "rgb(230, 213, 172)"); }
}

$('#customPicturesEasy').click(function() {
  selectCustomPicture('#customPicturesEasy');
  settingPictures = "easy";
});
$('#customPicturesMedium').click(function() {
  selectCustomPicture('#customPicturesMedium');
  settingPictures = "medium";
});
$('#customPicturesHard').click(function() {
  selectCustomPicture('#customPicturesHard');
  settingPictures = "hard";
});
$('#customPicturesRandom').click(function() {
  selectCustomPicture('#customPicturesRandom');
  settingPictures = "random";
});
function selectCustomPicture(name) {
  $(name).css("background", "linear-gradient(0deg, rgb(87, 72, 38) 0%, rgba(231,188,88,1) 100%)");
  if (name !== "#customPicturesEasy") { $("#customPicturesEasy").css("background", "rgb(230, 213, 172)"); }
  if (name !== "#customPicturesMedium") { $("#customPicturesMedium").css("background", "rgb(230, 213, 172)"); }
  if (name !== "#customPicturesHard") { $("#customPicturesHard").css("background", "rgb(230, 213, 172)"); }
  if (name !== "#customPicturesRandom") { $("#customPicturesRandom").css("background", "rgb(230, 213, 172)"); }
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
  if (name !== "#customRadiusBig") { $("#customRadiusBig").css("background", "rgb(230, 213, 172)"); }
  if (name !== "#customRadiusMedium") { $("#customRadiusMedium").css("background", "rgb(230, 213, 172)"); }
  if (name !== "#customRadiusLow") { $("#customRadiusLow").css("background", "rgb(230, 213, 172)"); }
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
  settingTime = 15;
});
function selectCustomTime(name) {
  $(name).css("background", "linear-gradient(0deg, rgb(87, 72, 38) 0%, rgba(231,188,88,1) 100%)");
  if (name !== "#customTimeNoTime") { $("#customTimeNoTime").css("background", "rgb(230, 213, 172)"); }
  if (name !== "#customTimeEasy") { $("#customTimeEasy").css("background", "rgb(230, 213, 172)"); }
  if (name !== "#customTimeMedium") { $("#customTimeMedium").css("background", "rgb(230, 213, 172)"); }
  if (name !== "#customTimeHard") { $("#customTimeHard").css("background", "rgb(230, 213, 172)"); }
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
  if (name !== "#customLiveEasy") { $("#customLiveEasy").css("background", "rgb(230, 213, 172)"); }
  if (name !== "#customLiveMedium") { $("#customLiveMedium").css("background", "rgb(230, 213, 172)"); }
  if (name !== "#customLiveHard") { $("#customLiveHard").css("background", "rgb(230, 213, 172)"); }
}



$('#play').click(function() {
  $('.ruban').show();
  $('.ruban').css("display", "flex");
  $('#image').show();
  $('#map').hide();
  $('#menu').hide();
  settingPictures = "random"
  settingCircleRadius = 100;
  settingTime = 0;
  settingLive = 3;
  start();
});
$('#custom').click(function() {
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

function backMenu() {
  $('#mainMenu').show();
  $('#leaderboardMenu').hide();
  $('#customMenu').hide();
}


$("#review").click(function() {
  $("#map").hide();
  $("#image").show();
});
$("#makeGuess").click(function() {
  $("#map").show();
  $("#image").hide();
  map.invalidateSize();
});
$("#guess").click(function() {
  if(marker === undefined) { return }
  $("#guess").hide();
  $("#review").hide();
  $("#next").show();
  $('#nameLocation').show();
  $('#nameLocation').css("display", "flex");
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


// start

leaderboardRanking();

// back

function reveal() {

  if (layerName === "underground" && layerName !== goodLayer) {
    map.removeLayer(marker);
    marker = undefined;
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

  var d = map.distance(guessPosition, goodPostition);
  isInside = d < circle.getRadius();
  isInside = isInside && (goodLayer === layerName)

  circle.setStyle({
    fillColor: isInside ? 'green' : '#f03',
    color: isInside ? 'green' : 'red'
  })

  if (isInside === false) {
    polygon = L.polygon([
      goodPostition,
      guessPosition
    ]).addTo(map);
    polygon.setStyle({color: 'red'});
  }
}

async function getJSON() {
  return fetch('./answersList.json')
      .then((response) => response.json())
      .then((responseJson) => { return responseJson });
}
async function start() {
  $("#backgroundGameOver").css("opacity","0");
  
  mask = new Array(dataList.list.length).fill(false);

  round = 0;
  accuracy = 0;
  liveRemaining = 3;

  newRound(500);
}

async function newRound(ms) {

  map.setView([0, 0], -3);

  round++;
  if (round !== 1){
    if (isInside === false) { liveRemaining-- }
    if (liveRemaining === 0) { gameOver(); round--; }
    accuracy = parseInt( ( (round - (3-liveRemaining)) / round) * 100);
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
  $("#map").hide();
  $("#image").hide();
  $("#gameOver").show();
  let roundsWrite = (3-round) === 0 ? "" : "s";
  $("#gameOverRound").text("You successfully complete "+(round-3)+" round"+roundsWrite);
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


async function getJSONleaderboard() {
  return fetch('./exampleLeaderboard.json')
      .then((response) => response.json())
      .then((responseJson) => { return responseJson });
  }
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

  dataLeaderboard = await getJSONleaderboard();
  
  dataLeaderboard.list.sort((a, b) => ( parseInt(b.round) - parseInt(a.round)) || ( parseInt(b.accuracy) - parseInt(a.accuracy) ));

  dataLeaderboard.list.map((item, index) => {
    addRowLeaderboard(index+1, item.username, item.round, item.accuracy)
  })

}