'use strict';

const axios = require('axios');
const ip = require('ip');
const sleep = require('sleep');

let pin16, pin4, pin5, pin14;

let photoresistor, stepper;

let isStepperRunning = true;

const {
  EtherPortClient
} = require('etherport-client');
const five = require('johnny-five');
const board = new five.Board({
  port: new EtherPortClient({
    host: '192.168.0.31',
    port: 3030
  }),
  repl: true,
  debug: true
});



board.on('ready', () => {
  pin16 = new five.Pin(16);
  pin4 = new five.Pin(4);
  pin5 = new five.Pin(5);
  pin14 = new five.Pin(14);

  photoresistor = new five.Sensor({
    pin: "A0",
    freq: 50
  });
  board.repl.inject({
    pot: photoresistor
  });

  
  stepper = new five.Stepper({
    type: five.Stepper.TYPE.FOUR_WIRE,
    stepsPerRev: 200,
    pins: {
      motor1: 16,
      motor2: 4,
      motor3: 5,
      motor4: 14
    }
  });

  console.log('board ready')
  commands['lightWatch']()

  // axios.post('http://127.0.0.1:1880/register', {
  //   "ip": ip.address(),
  //   "id": "stepper",
  //   "command": "drive"
  // })
  // .then((res) => {
  //   commands['drive'](stepper)
  // })
  // .catch((error) => {
  //   console.error(error)
  // })

});

const commands = {
  lightWatch:function(){
    photoresistor.scale().on("data", function(data) {
      //let voltage = data * (5.0 / 1023.0);
      console.log(data);
      if(data < 3 && !isStepperRunning){
        commands['drive'](stepper);
        console.log('set isStepperRunning = true');
        isStepperRunning = true;
      }
      if(data > 3){
        pin16.low();
        pin14.low();
        pin4.low();
        pin5.low();
        console.log('set isStepperRunning = false');
        isStepperRunning = false;
      }      
    });
  },
  drive:function(){
    stepper.rpm(180).ccw().step(2000, function() {
      console.log("done");
      // pin16.low();
      // pin14.low();
      // pin4.low();
      // pin5.low();
      console.log('set isStepperRunning = false');
      isStepperRunning = false;
    });
  }
}