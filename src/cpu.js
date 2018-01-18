#define __id\
  ((opcode>>>12)&0xf)

#define __h\
  ((opcode>>>8)&0xf)

#define __v\
  ((opcode>>>4)&0xf)

#define __nnn\
  (opcode&0xfff)

#define __kk\
  (opcode&0xff)

#define __n\
  (opcode&0xf)

chip8.CstrProcessor = (function() {
  // General purpose
  var v = [], pc, i, timer;

  // CPU step
  function step() {
    var opcode = mem.read.uh(pc);
    pc+=2;

    // Console
    console.dir(emu.hex(opcode));

    switch(__id) {
      case 0x1:
        pc = __nnn;
        break;

      case 0x3:
        if (v[__h] === __kk) {
          pc+=2;
        }
        break;

      case 0x6:
        v[__h] = __kk;
        break;

      case 0x7:
        v[__h] += __kk;
        break;

      case 0xa:
        i = __nnn;
        break;

      case 0xc:
        v[__h] = Math.floor(Math.random() * 256) & __kk;
        break;

      case 0xd:
        for (var pt=i; pt<i+__n; pt++) {
          var chunk  = mem.read.ub(pt);
          var bin    = emu.bin(chunk);
          var pixels = bin.split("");

          for (var pos=0; pos<pixels.length; pos++) {
            if (pixels[pos] === '1') {
              //console.dir(v[__h]+' '+v[__v]);
              render.draw(v[__h]+pos, v[__v]+(pt-i));
            }
          }

          // for (var end=v[__h]+8; end>v[__h]; end--) {
          //   render.draw(v[__h], v[__v]);
          // }
          //console.dir('draw -> '+emu.bin(hah));
        }
        break;

      default:
        emu.exit('Unknown opcode -> '+emu.hex(opcode));
        break;
    }
  }

  return {
    reset: function() {
      ioZero(v, 16);

      // Start of Chip 8 apps
      pc = 0x200;
      i  = 0;

      // Timers
      timer = {
        root: 0, sound: 0
      };
    },

    start: function() {
      step();
      window.requestAnimationFrame(cpu.start);
    }
  }
})();
