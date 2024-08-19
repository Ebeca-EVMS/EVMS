#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ArduinoJson.h>
#include <Firebase_ESP_Client.h>

//Provide the token generation process info.
#include "addons/TokenHelper.h"
//Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

// Insert your network credentials
#define WIFI_SSID "M01"
#define WIFI_PASSWORD "123456789"

// Insert Firebase project API Key
#define API_KEY "AIzaSyDI10CdrfR4LW10hLEKFRaYRXF1UxlBYjk"

//Define the user Email and password that already registerd or added in your project
#define USER_EMAIL "m01@ebeca.com"
#define USER_PASSWORD "0192066919"

// Insert RTDB URLefine the RTDB URL */
#define DATABASE_URL "https://utem-ebeca-default-rtdb.asia-southeast1.firebasedatabase.app/" 


//Define Firebase Data object
FirebaseData fbdo;

FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
int count = 0;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to ");
  Serial.print(WIFI_SSID);
  while (WiFi.status() != WL_CONNECTED) 
  {
    Serial.print(".");
    delay(500);
  }

  Serial.println();
  Serial.print("Connected to ");
  Serial.println(WIFI_SSID);

  /* Assign the api key (required) */
  config.api_key = API_KEY;

  /* Assign the user sign in credentials */
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  /* Assign the RTDB URL (required) */
  config.database_url = DATABASE_URL;

  /* Assign the callback function for the long running token generation task */
  config.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {

  //initial Json document from arduino Mega
  StaticJsonDocument <1000> doc;
  DeserializationError error = deserializeJson(doc, Serial);

  //taking value from json array data
  float latitude = doc["latitude"];
  float longitude = doc["longitude"];
  float speed = doc["speed"];
  float voltage = doc["voltage"];
  float InC = doc["InC"];
  float OutC = doc["OutC"];
  float temperature1 = doc["temperature1"];
  float humidity1 = doc["humidity1"];

  if (Firebase.ready() && (millis() - sendDataPrevMillis > 3000 || sendDataPrevMillis == 0)){
    //send data in 5 second interval
    sendDataPrevMillis = millis();
    Firebase.RTDB.setFloat(&fbdo, "Variable/Bat_Temp", temperature1);
    Firebase.RTDB.setFloat(&fbdo, "Variable/Bat_Hum", humidity1);
    Firebase.RTDB.setFloat(&fbdo, "Variable/speed", speed);
    Firebase.RTDB.setFloat(&fbdo, "Variable/latitude", latitude);
    Firebase.RTDB.setFloat(&fbdo, "Variable/longitude", longitude);
    Firebase.RTDB.setFloat(&fbdo, "Variable/Voltage", voltage);
    Firebase.RTDB.setFloat(&fbdo, "Variable/InC", InC);
    Firebase.RTDB.setFloat(&fbdo, "Variable/OutC", OutC);
  }
}


