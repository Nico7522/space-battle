import { AUDIO } from '../config/constants';
import { saveManager } from './SaveManager';

type AudioContextConstructor = new () => AudioContext;

const getAudioContextConstructor = (): AudioContextConstructor | undefined => {
    const scope = window as unknown as {
        AudioContext?: AudioContextConstructor;
        webkitAudioContext?: AudioContextConstructor;
    };

    return scope.AudioContext ?? scope.webkitAudioContext;
};

/**
 * Sound effects and music synthesized locally with the Web Audio API.
 * No external audio file is needed and nothing is loaded from the network.
 */
export class AudioManager {

    private context: AudioContext | null = null;
    private sfxGain: GainNode | null = null;
    private musicGain: GainNode | null = null;
    private noiseBuffer: AudioBuffer | null = null;
    private musicStarted = false;
    private musicOscillators: OscillatorNode[] = [];

    get soundEnabled (): boolean
    {
        return saveManager.soundEnabled;
    }

    get musicEnabled (): boolean
    {
        return saveManager.musicEnabled;
    }

    unlock (): void
    {
        const context = this.ensureContext();

        if (!context)
        {
            return;
        }

        if (context.state === 'suspended')
        {
            void context.resume().catch(() => undefined);
        }

        if (this.musicEnabled)
        {
            this.startMusic();
        }
    }

    setSoundEnabled (enabled: boolean): void
    {
        saveManager.setSoundEnabled(enabled);
        this.applyVolumes();
    }

    setMusicEnabled (enabled: boolean): void
    {
        saveManager.setMusicEnabled(enabled);
        this.applyVolumes();

        if (enabled)
        {
            this.unlock();
        }
    }

    playClick (): void
    {
        this.playTone(720, 0.05, 'sine', 0.18, 520);
    }

    playHover (): void
    {
        this.playTone(520, 0.035, 'sine', 0.06, 620);
    }

    playShoot (): void
    {
        this.playTone(880 + Math.random() * 90, 0.07, 'square', 0.13, 260);
    }

    playExplosion (): void
    {
        const context = this.ensureContext();

        if (!context || !this.sfxGain)
        {
            return;
        }

        if (context.state === 'suspended')
        {
            void context.resume().catch(() => undefined);
        }

        const now = context.currentTime;
        const source = context.createBufferSource();
        const filter = context.createBiquadFilter();
        const gain = context.createGain();

        source.buffer = this.getNoiseBuffer(context);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(220, now + 0.24);

        gain.gain.setValueAtTime(0.36, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        source.start(now);
        source.stop(now + 0.3);

        this.playTone(180, 0.22, 'triangle', 0.28, 60);
    }

    playLevel (): void
    {
        this.playToneAt(440, 0, 0.12, 'triangle', 0.18);
        this.playToneAt(660, 0.1, 0.22, 'triangle', 0.18);
    }

    playGameOver (): void
    {
        this.playTone(320, 0.7, 'sawtooth', 0.22, 70);
        this.playToneAt(160, 0.06, 0.65, 'triangle', 0.2 * 0.0001);
    }

    playVictory (): void
    {
        const notes = [523.25, 659.25, 783.99, 1046.5];

        notes.forEach((frequency, index) => {
            this.playToneAt(frequency, index * 0.11, 0.3, 'triangle', 0.2);
        });
    }

    playRecord (): void
    {
        const notes = [784, 988, 1175, 1568];

        notes.forEach((frequency, index) => {
            this.playToneAt(frequency, index * 0.07, 0.26, 'sine', 0.18);
        });
    }

    private ensureContext (): AudioContext | null
    {
        if (this.context)
        {
            return this.context;
        }

        const AudioContextClass = getAudioContextConstructor();

        if (!AudioContextClass)
        {
            return null;
        }

        try
        {
            const context = new AudioContextClass();
            const sfxGain = context.createGain();
            const musicGain = context.createGain();

            sfxGain.connect(context.destination);
            musicGain.connect(context.destination);

            this.context = context;
            this.sfxGain = sfxGain;
            this.musicGain = musicGain;
            this.applyVolumes();

            return context;
        }
        catch
        {
            return null;
        }
    }

    private applyVolumes (): void
    {
        if (!this.context)
        {
            return;
        }

        const now = this.context.currentTime;

        this.sfxGain?.gain.setValueAtTime(this.soundEnabled ? AUDIO.sfxVolume : 0, now);
        this.musicGain?.gain.setValueAtTime(this.musicEnabled ? AUDIO.musicVolume : 0, now);
    }

    private startMusic (): void
    {
        if (this.musicStarted || !this.context || !this.musicGain)
        {
            return;
        }

        const context = this.context;
        const filter = context.createBiquadFilter();
        const lfo = context.createOscillator();
        const lfoGain = context.createGain();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(520, context.currentTime);
        filter.Q.setValueAtTime(0.8, context.currentTime);

        lfo.frequency.setValueAtTime(0.09, context.currentTime);
        lfoGain.gain.setValueAtTime(180, context.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();

        filter.connect(this.musicGain);

        const frequencies = [110, 164.81, 220, 329.63];

        frequencies.forEach((frequency, index) => {
            const oscillator = context.createOscillator();
            const voiceGain = context.createGain();

            oscillator.type = index % 2 === 0 ? 'sine' : 'triangle';
            oscillator.frequency.setValueAtTime(frequency, context.currentTime);
            oscillator.detune.setValueAtTime(index % 2 === 0 ? -6 : 6, context.currentTime);
            voiceGain.gain.setValueAtTime(0.12 - index * 0.02, context.currentTime);

            oscillator.connect(voiceGain);
            voiceGain.connect(filter);
            oscillator.start();

            this.musicOscillators.push(oscillator);
        });

        this.musicStarted = true;
    }

    private getNoiseBuffer (context: AudioContext): AudioBuffer
    {
        if (this.noiseBuffer)
        {
            return this.noiseBuffer;
        }

        const length = Math.floor(context.sampleRate * 0.4);
        const buffer = context.createBuffer(1, length, context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let index = 0; index < length; index += 1)
        {
            data[index] = Math.random() * 2 - 1;
        }

        this.noiseBuffer = buffer;

        return buffer;
    }

    private playTone (
        frequency: number,
        duration: number,
        type: OscillatorType,
        volume: number,
        endFrequency?: number
    ): void
    {
        this.playToneAt(frequency, 0, duration, type, volume, endFrequency);
    }

    private playToneAt (
        frequency: number,
        delay: number,
        duration: number,
        type: OscillatorType,
        volume: number,
        endFrequency?: number
    ): void
    {
        const context = this.ensureContext();

        if (!context || !this.sfxGain)
        {
            return;
        }

        if (context.state === 'suspended')
        {
            void context.resume().catch(() => undefined);
        }

        const start = context.currentTime + delay;
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, start);

        if (endFrequency)
        {
            oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
        }

        gain.gain.setValueAtTime(Math.max(0.0001, volume), start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

        oscillator.connect(gain);
        gain.connect(this.sfxGain);
        oscillator.start(start);
        oscillator.stop(start + duration + 0.02);
    }

}

export const audioManager = new AudioManager();
