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
  var v = [], stack = [], pc, i, timer;
  var requestAF;

  // CPU step
  function step() {
    var opcode = mem.read.uh(pc);
    pc+=2;

    // Console
    console.dir(emu.hex(opcode));

    switch(__id) {
      case 0x0:
        switch(__kk) {
          case 0x00: // Not needed?
            return;

          case 0xe0:
            render.clear();
            return;

          case 0xee:
            pc = stack.pop();
            return;
        }
        emu.exit('Unknown opcode 0x0 -> '+emu.hex(opcode));
        return;

      case 0x1:
        pc = __nnn;
        return;

      case 0x2:
        stack.push(pc);
        pc = __nnn;
        return;

      case 0x3:
        if (v[__h] === __kk) {
          pc+=2;
        }
        return;

      case 0x4:
        if (v[__h] !== __kk) {
          pc+=2;
        }
        return;

      case 0x5:
        if (v[__h] === v[__v]) {
          pc+=2;
        }
        return;

      case 0x6:
        v[__h] = __kk;
        return;

      case 0x7:
        v[__h] += __kk;
        return;

      case 0x8:
        switch(__n) {
          case 0x0:
            v[__h] = v[__v];
            return;

          case 0x1:
            v[__h] |= v[__v];
            return;

          case 0x2:
            v[__h] &= v[__v];
            return;

          case 0x3:
            v[__h] ^= v[__v];
            return;

          case 0x4:
            {
              var temp = v[__h] + v[__v];
              v[0xf] = temp > 255 ? 1 : 0;
              v[__h] = temp&255;
            }
            return;

          case 0x5:
            {
              v[0xf] = v[__h] > v[__v] ? 1 : 0;
              v[__h] -= v[__v];
            }
            // Set Vx = Vx - Vy, set VF = NOT borrow. If Vx > Vy, then VF is set to 1, otherwise 0. Then Vy is subtracted from Vx, and the results stored in Vx.
            return;
        }
        emu.exit('Unknown opcode 0x8 -> '+emu.hex(opcode));
        return;

      case 0xa:
        i = __nnn;
        return;

      case 0xc:
        v[__h] = Math.floor(Math.random() * 256) & __kk;
        return;

      case 0xd:
        for (var pt=i; pt<i+__n; pt++) {
          var chunk  = mem.read.ub(pt);
          var pixels = emu.pixelData(chunk);

          for (var pos=0; pos<pixels.size; pos++) {
            if (pixels[pos] === '1') { // TODO: XOR check
              render.draw(v[__h]+pos, v[__v]+(pt-i));
            }
          }
        }
        return;

      case 0xf:
        switch(__kk) {
          case 0x07:
            v[__h] = timer.root;
            return;

          case 0x15:
            timer.root = v[__h];
            return;

          case 0x33:
            {
              var temp = v[__h];
              while (temp.size < 3) {
                temp = '0' + temp;
              }
              var str = temp.toChars();
              for (var pos=0; pos<3; pos++) {
                mem.write.ub(i+pos, str[pos]);
              }
            }
            return;

          case 0x55:
            for (var pt=0; pt<__h; pt++) {
              mem.write.ub(i, v[pt]);
            }
            return;

          case 0x65:
            for (var pt=i; pt<i+0xf; pt++) {
              v[pt] = mem.read.ub(pt);
            }
            return;

          case 0x1e:
            i += v[__h];
            return;
        }
        emu.exit('Unknown opcode 0xf -> '+emu.hex(opcode));
        return;
    }
    emu.exit('Unknown opcode -> '+emu.hex(opcode));
  }

  return {
    reset: function() {
      ioZero(v, 16);
      ioZero(stack, 16);

      // Start of Chip 8 apps
      pc = 0x200;
      i  = 0;

      // Timers
      timer = {
        root: 0, sound: 0
      };
    },

    start: function() {
      for (var i=0; i<64; i++) {
        step();
      }
      requestAF = requestAnimationFrame(cpu.start);
    },

    stop: function() {
      cancelAnimationFrame(requestAF);
      requestAF = undefined;
    }
  }
})();
