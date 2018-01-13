







// 0x000 - 0x1fff reserved for interpreter
// 0x200 - 0xffff start/end






var chip8 = (function() {
  // General purpose
  var v = [], mem = [], pc, i, timer;

  // Request for app read
  function app(path, fn) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      fn(xhr.response);
    };
    xhr.responseType = 'arraybuffer';
    xhr.open('GET', path);
    xhr.send();
  }

  // CPU step
  function step() {
    var opcode = read(pc);
    pc++;

    switch(opcode) {
      default:
        exit('Unknown opcode -> '+hex(opcode));
        break;
    }
  }

  // Mem read
  function read(addr) {
    if (addr >= 0x200 && addr <= 0xfff) {
      return mem[pc];
    }
    
    exit('Unknown mem read -> '+pc);
    return 0;
  }

  // Convert to hex
  function hex(number) {
    return '0x'+(number>>>0).toString(16);
  }

  // Generic output function
  function exit(str) {
    throw str;
  }

  return {
    reset: function() {
      for (var i=0; i< 16; i++) { v[i] = 0; };
      for (var i=0; i< 0x1000; i++) { mem[i] = 0; };

      // Start of Chip 8 apps
      pc = 0x200;
      i  = 0;

      // Timers
      timer = {
        root: 0, sound: 0
      };

      // Game
      app('bin/BRIX', function(resp) {
        // Read app as Uint8
        var data = new Uint8Array(resp);

        // Write to mem
        for (var i=0; i<data.byteLength; i++) {
          mem[0x200 + i] = data[i];
        }

        // Start emulation
        step();
      });
    }
  }
})();

