var MaxCube = require('maxcube');
var vorpal = require('vorpal')();

var ip = process.argv[2];
var port = process.argv[3] || 62910;

if (!ip) {
  console.error('This command needs the ip address of the Max! Cube as argument.');
  return;
}

var maxCube = new MaxCube(ip, port);

maxCube.on('closed', function () {
    vorpal.log('Connection closed');
});

maxCube.on('connected', function () {
    vorpal.log('Connected');
});

vorpal
  .command('status [rf_address]', 'Get status of all or specified devices')
  .alias('s')
  .option('-v, --verbose', 'Verbose output')
  .action(function(args, callback) {
    var self = this;
    maxCube.getDeviceStatus(args.rf_address).then(function (devices) {
      if (args.options.verbose) {
        self.log(devices);
      } else {
        devices.forEach(function (device) {
          var deviceInfo = maxCube.getDeviceInfo(device.rf_address);
          self.log(device.rf_address + ' (' + deviceInfo.device_name + ', ' + deviceInfo.room_name + ') - temp: ' + device.temp + ', ' + 
            'setpoint: ' + device.setpoint + ', ' +
            'valve: ' + device.valve + ', ' +
            'mode: ' + device.mode
          );
        });
      }
      self.log(maxCube.getCommStatus());
      callback();
    });
  });

vorpal
  .command('flush', 'Flush device/room cache')
  .action(function (args, callback) {
    var self = this;
    maxCube.flushDeviceCache().then(function (success) {
      self.log('Device/room cache cleared');
    callback();
  });
  });

vorpal
  .command('comm', 'Get comm status')
  .action(function (args, callback) {
    this.log(maxCube.getCommStatus());
    callback();
  });

vorpal
  .command('temp <rf_address> <degrees>', 'Sets setpoint temperature of specified device')
  .autocomplete({ data: function () {
      return Object.keys(maxCube.getDevices());
  } })
  .action(function (args, callback) {
    var self = this;
    maxCube.setTemperature(args.rf_address, args.degrees).then(function (success) {
      if (success) {
      self.log('Temperature set');
      } else {
        self.log('Error setting temperature');
      }
      callback();
   });
  });

vorpal
  .find('exit')
  .alias('x')
  .action(function (args, callback) {
    maxCube.close();
  });

vorpal.history('maxcube-cli');

vorpal
  .delimiter('maxcube$')
  .show();