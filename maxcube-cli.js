var MaxCube = require('maxcube');
var vorpal = require('vorpal')();
var Table = require('cli-table2');

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
  .option('-p, --plain', 'Plain output, no table')
  .action(function(args, callback) {
    var self = this;
    maxCube.getDeviceStatus(args.rf_address).then(function (devices) {
      if (args.options.verbose) {
        if (args.options.plain) {
          self.log(devices);
        } else {
          var table = new Table({
            head: ['RF address', 'name', 'room', 'mode', 'setpoint', 'valve', 'temp', 'battery_low', 'initialized', 'fromCmd', 'error', 'valid', 'dst_active', 'gateway_known', 'panel_locked', 'link_error'],
            colWidths: [10, 20]
          });
          devices.forEach(function (device) {
            var deviceInfo = maxCube.getDeviceInfo(device.rf_address);
            table.push([
              device.rf_address,
              deviceInfo.device_name,
              deviceInfo.room_name,
              device.mode,
              device.setpoint,
              device.valve,
              device.temp,
              device.battery_low,
              device.initialized,
              device.fromCmd,
              device.error,
              device.valid,
              device.dst_active,
              device.gateway_known,
              device.panel_locked,
              device.link_error
              ]);
          });
          self.log(table.toString());
        }
      } else {
        if (args.options.plain) {
          devices.forEach(function (device) {
            var deviceInfo = maxCube.getDeviceInfo(device.rf_address);
            self.log(device.rf_address + ' (' + deviceInfo.device_name + ', ' + deviceInfo.room_name + ')');
            self.log('    temp: ' + device.temp + ', ' +
              'setpoint: ' + device.setpoint + ', ' +
              'valve: ' + device.valve + ', ' +
              'mode: ' + device.mode
              );
          });
        } else {
          var table = new Table({
            head: ['RF address', 'name', 'room', 'mode', 'setpoint', 'valve', 'temp'],
            colWidths: [10, 20]
          });
          devices.forEach(function (device) {
            var deviceInfo = maxCube.getDeviceInfo(device.rf_address);
            table.push([
              device.rf_address,
              deviceInfo.device_name,
              deviceInfo.room_name,
              device.mode,
              device.setpoint,
              device.valve,
              device.temp
              ]);
          });
          self.log(table.toString());
        }
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
  .command('mode <rf_address> <mode> [until]', 'Sets mode (AUTO, MANUAL, BOOST or VACATION) of specified device. Mode VACATION needs until date/time (ISO 8601, e.g. 2019-06-20T10:00:00Z)')
  .autocomplete({ data: function () {
      return Object.keys(maxCube.getDevices()).concat(['AUTO', 'MANUAL', 'BOOST', 'VACATION']);
  } })
  .validate(function (args) {
    if (args.mode === 'VACATION' && !args.until) {
      return 'Error: until date needed for mode VACATION';
    } else {
      return true;
    }
  })
  .action(function (args, callback) {
    var self = this;
    maxCube.setTemperature(args.rf_address, null, args.mode, args.date_until).then(function (success) {
      if (success) {
      self.log('Mode set');
      } else {
        self.log('Error setting mode');
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