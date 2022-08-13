var map = L.map('map', {
  crs: L.CRS.Simple,
  smoothZoom: false,
  smoothZoomDelay: 10000,
  minZoom: -10,
  maxZoom: 4,
  zoomSnap: 0,
  zoomControl: false,
  attributionControl: false,
  preferCanvas: true
});

let round;
let accuracy;
let liveRemaining;

let goodPostition;
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
map.fitBounds(bounds);
map.setView([0, 0], -3);

$('#nameLocation').hide();
$('#map').hide();
$('#image').hide();
$('#gameOver').hide();
$('.ruban').hide();

start();

// Marker 
map.on('click', addMarker);

function addMarker(e){
  if (canClick === false || lockClick === true) { return; }

  if (marker !== undefined) {
	  map.removeLayer(marker);
  }
  marker = new L.marker(e.latlng).addTo(map);
  guessPosition = e.latlng;

  $("#guess").css("background", "linear-gradient(0deg, rgba(72,62,228,1) 0%, rgba(0,212,255,1) 100%)");
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

$('#play').click(function() {
  $('.ruban').show();
  $('#image').show();
  $('#map').hide();
  $('#menu').hide(); 
});
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
  newRound();
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

$("#playAgain").click(function() {
  $("#gameOver").hide();
  $('.gameOverContainer').css('opacity', '0');
  $("#image").show();
  start();
});


function reveal() {

  map.setView(goodPostition, -.1);
  lockClick = true;

  circle = L.circle(goodPostition, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 100
  }).addTo(map);

  var d = map.distance(guessPosition, goodPostition);
  isInside = d < circle.getRadius();

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

  dataList = await getJSON();

  mask = new Array(dataList.list.length).fill(false);

  round = 1;
  accuracy = 0;
  liveRemaining = 3;

  $("#round").text("Round: "+round);
  $("#accuracy").text("Accuracy: "+accuracy+"%");
  $("#liveRemaining").text("Live Remaining: "+liveRemaining);
  await randomize()
  .then(result => {
    $('#screen').css('opacity', '1');
    $('#loading').css('opacity', '0');
  })
  .catch(err => { alert("error loading"); })
}

async function newRound() {

  map.setView([0, 0], -3);

  if (isInside === false) { liveRemaining-- }
  if (liveRemaining === 0) { gameOver(); round--; }

  accuracy = parseInt( ( (round - (3-liveRemaining)) / round) * 100);
  round++;

  guessPosition = [];

  $("#round").text("Round: "+round);
  $("#accuracy").text("Accuracy: "+accuracy+"%");
  $("#liveRemaining").text("Live Remaining: "+liveRemaining);

  map.removeLayer(circle);
  map.removeLayer(marker);
  if (polygon !== undefined) { map.removeLayer(polygon); }

  marker = undefined;

  lockClick = false;

  loading();

  await randomize()
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

async function randomize() {
  await sleep(300);
  $('#screen').show();

  answerId = getRandomInt(dataList.list.length);

  while (mask[answerId] === true) {

    if (!mask.includes(false)) {
      mask = new Array(dataList.list.length).fill(false);
      alert("reset")
    }
    answerId = getRandomInt(dataList.list.length);
  }
  mask[answerId] = true;

  $("#screen").attr("src", dataList.list[answerId].img);
  $("#nameLocation").text(dataList.list[answerId].name);
  goodPostition = dataList.list[answerId].coords;
  nameLocation = dataList.list[answerId].name;

  await sleep(200);
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