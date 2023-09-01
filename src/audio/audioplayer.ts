import { Ramp, Sample } from "./sample.js";


export class AudioPlayer {


    private ctx : AudioContext;

    private globalVolume : number;
    private enabled : boolean;


    constructor(globalVolume = 1.0) {

        this.ctx = new AudioContext();

        this.enabled = true;
        this.globalVolume = globalVolume;
    }


    public createSample = (sequence : number[], 
        baseVolume = 1.0,
        type : OscillatorType = "square",
        ramp : Ramp = Ramp.Exponential,
        fadeVolumeFactor : number = 0.5,
        attackTime : number = 2) : Sample => new Sample(this.ctx, sequence, baseVolume, type, ramp, fadeVolumeFactor, attackTime);


    public playSample(s : Sample | undefined, volume = 1.0) : void {

        if (!this.enabled || s === undefined)
            return;

        try {

            s.play(volume * this.globalVolume);
        }
        catch (e) {}
    }


    public toggle = (state = !this.enabled) : boolean => (this.enabled = state);


    public setGlobalVolume(vol : number) : void {

        this.globalVolume = vol;
    }


    public isEnabled = () : boolean => this.enabled;

}
