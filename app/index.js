import clock from "clock";
import document from "document";
import userActivity from "user-activity";
import { battery } from "power";
import { preferences } from "user-settings";
import { HeartRateSensor } from "heart-rate";
import { user } from "user-profile";
import { locale } from "user-settings";
import * as messaging from "messaging";
import * as fs from "fs";
import { me as device } from "device";

import * as util from "../common/utils";

// Update the clock every second
clock.granularity = "seconds";
//Clock preferences 12h/24h
const clockPref = preferences.clockDisplay;
// Counter for switching colors by click
try {
  let stats = fs.statSync("profile.txt");
  let json_numread = fs.readFileSync("profile.txt", "json");
} catch (err) {
  let json_profile = {"profilenum": 0};
  fs.writeFileSync("profile.txt", json_profile, "json");
  let json_numread = fs.readFileSync("profile.txt", "json");
}

if (!device.screen) device.screen = { width: 348, height: 250};
//let json_nr = fs.readFileSync("/mnt/assets/resources/profile.txt", "json");
let counter = json_numread.profilenum || 0;
// Switch for Battery Display
let switcher = false;
// Timestamp fot heartRate
let lastValueTimestamp = Date.now();

// Get a handle on the various elements
// Clock
let myHour = document.getElementById("myHour");
let myMinute = document.getElementById("myMinute");
let mySecond = document.getElementById("mySecond");
let myDate = document.getElementById("myDate");
let myDay = document.getElementById("myDay");
// Battery
let myBat = document.getElementById("myBattery");
let myBatIcn = document.getElementById("batIcon");
let myBatRect = document.getElementById("batRect");
// Current values
let dailysteps = document.getElementById("mySteps");
let dailystairs = document.getElementById("myStairs");
let dailycals = document.getElementById("myCals");
let dailymins = document.getElementById("myMins");
// Goals
let dailystepsGoal = document.getElementById("myStepsGoal");
let dailystairsGoal = document.getElementById("myStairsGoal");
let dailycalsGoal = document.getElementById("myCalsGoal");
let dailyminsGoal = document.getElementById("myMinsGoal");
// Display partition
let leftsection = document.getElementById("leftSide");
let rightsection = document.getElementById("rightSide");
// Heartrate
let currentheart = document.getElementById("myHR");
let restingheart = document.getElementById("myRestHR");
let heartRing = document.getElementById("hrtArc");
// Beam for values
let stepRect = document.getElementById("stepsRect");
let calRect = document.getElementById("calsRect");
let stairRect = document.getElementById("stairsRect");
let minRect = document.getElementById("minsRect");
let stepBeam = document.getElementById("stepsBeam");
let calBeam = document.getElementById("calsBeam");
let stairBeam = document.getElementById("stairsBeam");
let activeBeam = document.getElementById("activeBeam");
let stepgrad = document.getElementById("stepGradient");
let calgrad = document.getElementById("calGradient");
let stairgrad = document.getElementById("stairGradient");
let activegrad = document.getElementById("activeGradient");
let colBtn = document.getElementById("colorBtn");
let batBtn = document.getElementById("batteryBtn");

// Variables for color-reset nr. 2
try {
  let stats = fs.statSync("color.txt");
  let json_colread = fs.readFileSync("color.txt", "json");
} catch (err) {
  let json_colors = {"maincolor": "#777777", "gradientcolor": "#eeeeee"};
  fs.writeFileSync("color.txt", json_colors, "json");
  let json_colread = fs.readFileSync("color.txt", "json");
}
let json_col = fs.readFileSync("color.txt", "json");
let maingrey = json_col.maincolor;
let gradientgrey = json_col.gradientcolor;

function updateStats() {
  // Get Goals to reach and current values
  const distanceGoal = userActivity.goals.distance;
  const metricSteps = "steps";
  const amountSteps = userActivity.today.adjusted[metricSteps] || 0;
  const stepsGoal = userActivity.goals[metricSteps];
  const metricCals = "calories";
  const amountCals = userActivity.today.adjusted[metricCals] || 0;
  const caloriesGoal = userActivity.goals[metricCals];
  const metricActive = "activeMinutes";
  const amountActive = userActivity.today.adjusted[metricActive] || 0;
  const activeGoal = userActivity.goals[metricActive];
  const metricElevation = "elevationGain";
  const amountElevation = userActivity.today.adjusted[metricElevation] || 0
  const elevationGoal = userActivity.goals[metricElevation];
  let stepString = util.thsdDot(amountSteps);
  let calString = util.thsdDot(amountCals);

  dailysteps.text = stepString;
  dailystepsGoal.text = util.thsdDot(stepsGoal);
  let stepWidth = Math.floor(100-100*(amountSteps/stepsGoal));
  if ( stepWidth < 0 ) {
    stepWidth = 0;
  }
  stepRect.width = stepWidth;
  dailycals.text = calString;
  dailycalsGoal.text = util.thsdDot(caloriesGoal);
  let calWidth = Math.floor(100-100*(amountCals/caloriesGoal));
  if ( calWidth < 0 ) {
    calWidth = 0;
  }
  calRect.width = calWidth;
  dailystairs.text = amountElevation;
  dailystairsGoal.text = elevationGoal;
  let stairWidth = Math.floor(100-100*(amountElevation/elevationGoal));
  if ( stairWidth < 0 ) {
    stairWidth = 0;
  }
  stairRect.width = stairWidth;
  dailymins.text = amountActive;
  dailyminsGoal.text = activeGoal;
  let activeWidth = Math.floor(100-100*(amountActive/activeGoal));
  if ( activeWidth < 0 ) {
    activeWidth = 0;
  }
  minRect.width = activeWidth;
}

var hrm = new HeartRateSensor();

hrm.onreading = function () {
  currentheart.text = ( hrm.heartRate > 0 ) ? hrm.heartRate : "--";
  lastValueTimestamp = Date.now();
  let heartAngle = Math.floor(360*((hrm.heartRate-30)/170)); //heartrate lower than 30 should not occur and 200 schould be enough anyway
  if ( heartAngle > 360 ) {
    heartAngle = 360;
  } else if ( heartAngle < 0 ) {
    heartAngle = 0;
  }
  heartRing.sweepAngle = heartAngle;
}
hrm.start();

// Update the display
function updateClock() {
  let lang = locale.language;
  let today = new Date();
  let day = today.getDate();
  let wday = today.getDay();
  let month = today.getMonth();
  let year = today.getFullYear();
  let hours = util.monoDigits(util.zeroPad(util.formatHour(today.getHours(), clockPref)));
  let mins = util.monoDigits(util.zeroPad(today.getMinutes()));
  let secs = util.zeroPad(today.getSeconds());
  let bat = util.monoDigits(Math.floor(battery.chargeLevel)); //Not yet supported...
  let rest = ( user.restingHeartRate > 0 ) ? user.restingHeartRate : "--";
  let prefix = lang.substring(0,2);
  if ( (typeof util.monthName[prefix] === 'undefined') || (typeof util.weekday[prefix] === 'undefined') ) {
    prefix = 'en';
  }
  myHour.text = `${hours}`;
  myMinute.text = `${mins}`;
  mySecond.text = `${secs}`;
  let batHeight = Math.round((100-battery.chargeLevel)*0.15);
  myBatRect.height = batHeight;
  myBat.text = `${bat}` + "%";
  if (prefix === 'en') {
    myDate.text = `${util.monthName[prefix][month].toUpperCase()} ${day}`; 
  } else {
    myDate.text = `${day}. ${util.monthName[prefix][month].toUpperCase()}`; 
  }
  myDay.text = `${util.weekday[prefix][wday].toUpperCase()}`;
  restingheart.text = "R:"+`${rest}`;
  updateStats();
  if ( (Date.now() - lastValueTimestamp)/1000 > 5 ) {
    currentheart.text = "--";
    heartRing.sweepAngle = 0;
  }
}

// Apply theme colors to elements
function applyTheme(background, foreground) {
  myMinute.style.fill = background;
  mySecond.style.fill = background;
  leftsection.style.fill = background;
  stepBeam.style.fill = background;
  calBeam.style.fill = background;
  stairBeam.style.fill = background;
  activeBeam.style.fill = background;
  stepgrad.style.fill = foreground;
  calgrad.style.fill = foreground;
  stairgrad.style.fill = foreground;
  activegrad.style.fill = foreground;
}

function switchColor() {
  let json_nr = {
          "profilenum": 0,
  };
  switch (counter) {
      case 0:
        if ( typeof maingrey == 'undefined' || maingrey == '' ) {
          maingrey = "#777777";
        }
        if ( typeof gradientgrey == 'undefined' || gradientgrey == '' ) {
          gradientgrey = "#eeeeee";
        }
        applyTheme(maingrey, gradientgrey); //default: grey; customizable
        json_nr = {"profilenum": 0};
        counter = 1;
        break;
      case 1:
        applyTheme("#cc0000", "#ffd900"); //red
        json_nr = { "profilenum": 1};
        counter = 2;
        break;
      case 2:
        applyTheme("#ff9d00", "#ffff00"); //orange
        json_nr = { "profilenum": 2,};
        counter = 3;
        break;
      case 3:
        applyTheme("#b400ff", "#003aff"); //violett
        json_nr = { "profilenum": 3};
        counter = 4;
        break;
      case 4:
        applyTheme("#5b4cff", "#17f30c"); //blau
        json_nr = { "profilenum": 4};
        counter = 5;
        break;
      case 5:
        applyTheme("aqua", "azure"); //aqua
        json_nr = { "profilenum": 5};
        counter = 6;
        break;
      case 6:
        applyTheme("#008888", "#00eeee"); //cyan
        json_nr = { "profilenum": 6};
        counter = 7;
        break;
      case 7:
        applyTheme("#7780a0", "#d9e1ff"); //blueish grey
        json_nr = { "profilenum": 7};
        counter = 8;
        break;
      case 8:
        applyTheme("#776600", "#eedd00"); //gold
        json_nr = { "profilenum": 8};
        counter = 9;
        break;
      case 9:
        applyTheme("#770000", "#ff4747"); //dunkelrot
        myMinute.style.fill = "#cc0000";
        mySecond.style.fill = "#cc0000";
        json_nr = { "profilenum": 9};
        counter = 0;
        break;
      default:
        applyTheme("#770000", "#ff4747"); //dunkelrot
        myMinute.style.fill = "#bb0000";
        mySecond.style.fill = "#bb0000";
        json_nr = { "profilenum": 0};
        counter = 0;
    }
    fs.writeFileSync("profile.txt", json_nr, "json");
}

colBtn.onactivate = function(evt) {
  switchColor();
}

batBtn.onactivate = function(evt) {
  if ( switcher === false) {
    myBat.style.display = "inline";
    myBatIcn.style.display = "inline";
    switcher = true;
  } else {
    myBat.style.display = "none";
    myBatIcn.style.display = "none";
    switcher = false;
  }
}

// Update the clock every tick event
clock.ontick = () => updateClock();

// Don't start with a blank screen
switchColor();
updateClock();

// Messaging
messaging.peerSocket.onopen = () => {
  console.log("App Socket Open");
}

messaging.peerSocket.close = () => {
  console.log("App Socket Closed");
}

// Listen for the onmessage event
messaging.peerSocket.onmessage = function(evt) {
  if ( evt.data.key == "main" ) {
    maingrey = evt.data.val;
  } else if ( evt.data.key == "gradient" ) {
    gradientgrey = evt.data.val;
  }
  if (typeof maingrey === 'undefined' || util.hexcolor(maingrey) == false) {
    maingrey = "#777777";
    console.log("Maincolor set to #777777 due to error");
  }
  if (typeof gradientgrey === 'undefined' || util.hexcolor(gradientgrey) == false) {
    gradientgrey = "#eeeeee";
    console.log("Gradientcolor set to #eeeeee due to error");
  }
  let json_data = {
    "maincolor": maingrey,
    "gradientcolor": gradientgrey,
  };
  fs.writeFileSync("color.txt", json_data, "json");
}
