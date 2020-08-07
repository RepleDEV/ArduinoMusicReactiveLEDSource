#define LED_R 9
#define LED_G 10
#define LED_B 11

String receivedInput = "";

void setup() {
  Serial.begin(9600);
  pinMode(LED_R,OUTPUT);
  pinMode(LED_G,OUTPUT);
  pinMode(LED_B,OUTPUT);
}

void loop() {
  receiveData();
  delay(25);
}

void receiveData() {
  int receivedChar;

  while (Serial.available() > 0) {
    receivedChar = Serial.read();
    receivedInput += (char)receivedChar;
    if (receivedChar == '\n') {
      set_color(receivedInput);
      receivedInput = "";
    }
  }
}


void set_color(String cmd_str) {
  char cmd[cmd_str.length() + 1];
  strcpy(cmd, cmd_str.c_str());
  String colors[3];

  const char separator[2] = ",";

  char *token;

  token = strtok(cmd,separator);

  byte i = 0;
  while (token != NULL) {
    colors[i] = token;
    i++;
    token = strtok(NULL,separator);
  }

  analogWrite(LED_R,colors[0].toInt());
  analogWrite(LED_G,colors[1].toInt());
  analogWrite(LED_B,colors[2].toInt());
}
