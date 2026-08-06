const fs = require('fs');
let code = fs.readFileSync('src/components/GlobalRadioAndMp3PlayerModal.tsx', 'utf8');

const newSynthCode = `      const playTechnoStep = () => {
        if (ctx.state === 'suspended') ctx.resume();
        const time = ctx.currentTime;
        
        const pos = step % 16;
        
        // 1. KICK DRUM (Four on the floor)
        if (pos % 4 === 0) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(150, time);
          osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.4);
          gain.gain.setValueAtTime(1.0, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(time);
          osc.stop(time + 0.4);
        }

        // 2. CLAP / SNARE (On beats 2 and 4, which is pos 4 and 12)
        if (pos === 4 || pos === 12) {
          const noiseOsc = ctx.createOscillator();
          const noiseFilter = ctx.createBiquadFilter();
          const noiseGain = ctx.createGain();
          noiseOsc.type = 'square';
          noiseOsc.frequency.setValueAtTime(100, time);
          noiseFilter.type = 'bandpass';
          noiseFilter.frequency.setValueAtTime(1000, time);
          noiseGain.gain.setValueAtTime(0.8, time);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
          noiseOsc.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(ctx.destination);
          noiseOsc.start(time);
          noiseOsc.stop(time + 0.2);
        }

        // 3. HI-HAT (Closed on every odd 16th, Open on the off-beat 8ths)
        if (pos % 2 !== 0) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(8000, time);
          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(7000, time);
          
          // Open hi-hat on pos 2, 6, 10, 14
          const isOpen = (pos % 4 === 2);
          const duration = isOpen ? 0.3 : 0.05;
          const vol = isOpen ? 0.4 : 0.15;
          
          gain.gain.setValueAtTime(vol, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          osc.start(time);
          osc.stop(time + duration);
        }

        // 4. BASSLINE (Acid / Synthwave style, off-beat syncopation)
        const bassPattern = [
          null, 36.71, null, 36.71,
          null, 36.71, 41.20, null,
          null, 36.71, null, 36.71,
          null, 36.71, 41.20, 27.50
        ]; // D1, D1, D1, E1, D1, D1, E1, A0
        
        if (bassPattern[pos]) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(bassPattern[pos], time);
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          // Filter envelope
          filter.frequency.setValueAtTime(100, time);
          filter.frequency.linearRampToValueAtTime(3000, time + 0.05);
          filter.frequency.linearRampToValueAtTime(100, time + 0.25);
          
          gain.gain.setValueAtTime(0.6, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);
          
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          osc.start(time);
          osc.stop(time + 0.25);
        }
        
        // 5. CHORDS (Ethereal Pad every 16 steps)
        if (pos === 0) {
          const chordFreqs = (step % 64 < 32) ? [146.83, 174.61, 220.00] : [130.81, 164.81, 196.00]; // Dm then C
          chordFreqs.forEach(freq => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);
            
            // Pad Envelope (slow attack, slow release)
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.15, time + 1.0);
            gain.gain.linearRampToValueAtTime(0, time + 2.0);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + 2.0);
          });
        }
        
        step++;
      };`;

// replace between const playTechnoStep = () => { and       synthTimerRef.current = setInterval(playTechnoStep, stepTime * 1000);
code = code.replace(/const playTechnoStep = \(\) => \{[\s\S]*?step\+\+;\n      \};\n/g, newSynthCode + "\n");
fs.writeFileSync('src/components/GlobalRadioAndMp3PlayerModal.tsx', code);
