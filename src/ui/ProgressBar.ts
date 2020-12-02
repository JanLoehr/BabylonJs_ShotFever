import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Slider } from "@babylonjs/gui/2D/controls/sliders/slider";

export class ProgressBar {
  private slider: Slider;

  constructor(adt: AdvancedDynamicTexture, width: number = 600, height: number = 200) {
    let slider = new Slider();
    slider.color = "#f00";
    slider.displayThumb = false;
    slider.minimum = 0;
    slider.maximum = 1;
    slider.value = 0;
    slider.height = `${height}px`;
    slider.width = `${width}px`;

    adt.addControl(slider);

    this.slider = slider;
  }

  public setValue(value: number) {
    this.slider.value = Math.min(1, Math.max(value, 0));
  }
}
