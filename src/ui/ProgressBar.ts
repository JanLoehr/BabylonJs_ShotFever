import { Color3 } from "@babylonjs/core";
import { Container } from "@babylonjs/gui";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Slider } from "@babylonjs/gui/2D/controls/sliders/slider";

export class ProgressBar {
  private slider: Slider;

  constructor(
    adt: AdvancedDynamicTexture,
    container: Container,
    color: Color3 = Color3.Red(),
    width: number = 600,
    height: number = 200
  ) {
    let slider = new Slider();
    slider.color = color.toHexString();
    slider.displayThumb = false;
    slider.minimum = 0;
    slider.maximum = 1;
    slider.value = 0;
    slider.height = `${height}px`;
    slider.width = `${width}px`;

    if (adt) {
      adt.addControl(slider);
    }
    if (container) {
      container.addControl(slider);
    }

    this.slider = slider;
  }

  public setValue(value: number) {
    this.slider.value = Math.min(1, Math.max(value, 0));
  }
}
