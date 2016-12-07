maxcube-cli
=======

eQ-3 Max! Cube command line interface


## Start
```
node maxcube-cli.js <ip> [<port>]
```

## Commands
    exit                              Exits application
    status [rf_address]               Get status of all or specified devices
    comm                              Get comm status
    temp <rf_address> <degrees>       Sets setpoint temperature of specified device
    mode <rf_address> <mode> [until]  Sets mode (AUTO, MANUAL, BOOST or VACATION) of specified device. Mode VACATION needs until date/time (ISO 8601, e.g. 2019-06-20T10:00:00Z)