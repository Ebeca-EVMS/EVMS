let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");

closeBtn.addEventListener("click", ()=>{
    sidebar.classList.toggle("open");
});

//-------Firebase------//
// Import the functions you need from the SDKs you need
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDI10CdrfR4LW10hLEKFRaYRXF1UxlBYjk",
    authDomain: "utem-ebeca.firebaseapp.com",
    databaseURL: "https://utem-ebeca-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "utem-ebeca",
    storageBucket: "utem-ebeca.appspot.com",
    messagingSenderId: "188395985240",
    appId: "1:188395985240:web:1519d31cbf610768bded2d",
    measurementId: "G-8BEZKNNGJS"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// getting reference to the database
var database = firebase.database();

//getting reference to the data we want
var dataRef1 = database.ref('M02/Bat_Hum');
var dataRef2 = database.ref('M02/Bat_Temp');
var dataRef3 = database.ref('M02/Voltage');
var dataRef4 = database.ref('M02/speed');
var dataRef5 = database.ref('M02/latitude');
var dataRef6 = database.ref('M02/longitude');

//fetch the data
dataRef1.on('value', function (getdata1) {
    var humi = getdata1.val();
    document.getElementById('humidity').innerHTML = humi + "%";
})

dataRef2.on('value', function (getdata2) {
    var temp = getdata2.val();
    document.getElementById('temperature').innerHTML = temp + "&#8451;";
})

dataRef3.on('value', function (getdata3) {
    var vol = getdata3.val();
    updatechart(vol);
    var batteryPercentage = calculateBatteryPercentage(vol);
    document.getElementById('batteryPercentageDisplay').innerHTML = batteryPercentage + "%";
})

dataRef4.on('value', function (getdata4) {
    var speed = getdata4.val().toFixed(1);
    document.getElementById('speed').innerHTML = speed + "km/h";
})


//----battery percentage----//
function calculateBatteryPercentage(vol) {
    // Define voltage ranges and their corresponding percentage values
    const voltageRanges = [53.6, 53.2, 52.8, 52.4, 52, 51.6, 51.2,50.0,48,40];
    const percentageValues = [100, 90, 70, 40, 30, 20, 10, 17, 14, 9,0];

    // Find the appropriate percentage based on the provided voltage
    for (let i = 0; i < voltageRanges.length; i++) {
        if (vol >= voltageRanges[i]) {
            return percentageValues[i];
        }
    }

    // If voltage is below the lowest range, return 0%
    return 0;

}

//-------CHARTS--------//
//generate voltage line chart

//getting server time from firebase
var serverTimeRef = firebase.database().ref('/.info/serverTimeOffset');

function updatechart(vol) {
    serverTimeRef.on('value', function (snapshot) {
        var serverTime = snapshot.val();
        // Convert the server time to a Date object
        var epoch = Date.now(serverTime);
        var timestamp = new Date(epoch);
        timestamp = timestamp.getHours() + ":" + timestamp.getMinutes() + ":" + timestamp.getSeconds();
        // Update your voltage level chart using the new server time

        // Update the chart data
        voltageLevelChart.data.labels.push(timestamp);
        voltageLevelChart.data.datasets[0].data.push(vol);

        // Limit the number of data points displayed on the chart
        const maxDataPoints = 10;
        if (voltageLevelChart.data.labels.length > maxDataPoints) {
            voltageLevelChart.data.labels.shift();
            voltageLevelChart.data.datasets[0].data.shift();
        }
        // Redraw the chart
        voltageLevelChart.update();
    });
}

// Create a chart using Chart.js
var ctx = document.getElementById('voltageLevelChart').getContext('2d');
var voltageLevelChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Voltage Level',
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
        }]
    },
    options: {
        scales: {
            x: [{
                type: 'linear',
            }],
            y: {
                min: 0,
                max: 60,
                ticks: {
                    beginAtZero: true,
                }
            }
        }
    }
});

//---current level chart
var serverTimeRef1 = firebase.database().ref('/.info/serverTimeOffset');

// Get current level from firebase
firebase.database().ref('M02/OutC').on('value', function (snapshot) {
    var data2 = snapshot.val();
    updatechart2(data2);
});

function updatechart2(data2) {
    serverTimeRef1.on('value', function (snapshot) {
        var serverTime = snapshot.val();
        // Convert the server time to a Date object
        var epoch = Date.now(serverTime);
        var timestamp = new Date(epoch);
        timestamp = timestamp.getHours() + ":" + timestamp.getMinutes() + ":" + timestamp.getSeconds();
        // Update your voltage level chart using the new server time

        // Update the chart data
        currentLevelChart.data.labels.push(timestamp);
        currentLevelChart.data.datasets[0].data.push(data2);

        // Limit the number of data points displayed on the chart
        const maxDataPoints = 10;
        if (currentLevelChart.data.labels.length > maxDataPoints) {
            currentLevelChart.data.labels.shift();
            currentLevelChart.data.datasets[0].data.shift();
        }
        // Redraw the chart
        currentLevelChart.update();
    });
}


// Create a chart using Chart.js
var ctx = document.getElementById('currentLevelChart').getContext('2d');
var currentLevelChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Output current',
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
        }]
    },
    options: {
        scales: {
            x: [{
                type: 'linear',
            }],
            y: {
                min: 0,
                max: 40,
                ticks: {
                    beginAtZero: true,
                }
            }
        }
    }
});

//--car icon
// Define car icon
var carIcon = L.icon({
    iconUrl: 'assets/images/car-icon.png', // Path to the car icon image
    iconSize: [32, 32], // Size of the icon
    iconAnchor: [16, 16], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -32] // Point from which the popup should open relative to the iconAnchor
});

//---map
var map = L.map('mapid').setView([2.194, 102.248], 18);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var vehicleMarker = L.marker([2.194, 102.248], { icon: carIcon }).addTo(map);

// Assuming `vehiclePosition` is an array containing the current vehicle position [latitude, longitude]
// Listen for value changes in the Firebase Realtime Database
firebase.database().ref('M02').on('value', function (snapshot) {
    var data = snapshot.val();
    var latitude = data.latitude;
    var longitude = data.longitude;
    // Update the marker location
    vehicleMarker.setLatLng([latitude, longitude]);

    // Pan the map to the updated marker location
    map.panTo([latitude, longitude]);
});
