import { settingsStorage } from "settings";
import * as messaging from "messaging";
import { me } from "companion";

messaging.peerSocket.onopen = () => {
  console.log("Companion Socket Open");
}

messaging.peerSocket.close = () => {
  console.log("Companion Socket Closed");
}

let KEY_MAIN = "main";
let KEY_GRADIENT = "gradient";

function sendValue(select, color) {
  if (color) {
    sendSettingData({key:select, val: color});
  }
}

function sendSettingData(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  } else {
    console.log("companion - no connection");
    me.wakeInterval = 1000;
    setTimeout(sendSettingData(data),2500);
    me.wakeInterval = undefined;
  }
}

if (me.launchReasons.settingsChanged) {
  // Send the value of the setting
  let mainObject = settingsStorage.getItem(KEY_MAIN);
  let gradientObject = settingsStorage.getItem(KEY_GRADIENT);
  let mainString = mainObject.slice(9,16);
  let gradientString = gradientObject.slice(9,16);
  sendValue(KEY_MAIN, mainString);
  sendValue(KEY_GRADIENT, gradientString);
}

settingsStorage.onchange = function(evt) {
  let mainObject = settingsStorage.getItem(KEY_MAIN);
  let gradientObject = settingsStorage.getItem(KEY_GRADIENT);
  let mainString = mainObject.slice(9,16);
  let gradientString = gradientObject.slice(9,16);
  sendValue(evt.key, (evt.newValue).slice(9,16));
  if (me.launchReasons.settingChanged) {
    sendValue(KEY_MAIN, mainString);
    sendValue(KEY_GRADIENT, gradientString);
  }
}
