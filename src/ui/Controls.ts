import { Color3, Color4 } from "@babylonjs/core";
import {
  Button,
  Container,
  Control,
  InputText,
  Rectangle,
  TextBlock,
} from "@babylonjs/gui";

export class Header extends TextBlock {
  constructor(
    container: Container,
    name: string,
    text: string,
    fontSize: number = 24
  ) {
    super(name, text);

    this.width = 1;
    this.fontSize = fontSize;
    this.color = "white";
    this.height = "40px";
    this.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

    container.addControl(this);
  }
}

export class Spacer extends Rectangle {
  constructor(
    container: Container,
    name: string,
    width: string = "1",
    height: string = "1"
  ) {
    super(name);

    this.width = width;
    this.height = height;
    this.color = "#0000";

    container.addControl(this);
  }
}

export class Label extends TextBlock {
  constructor(container: Container, name: string, text: string) {
    super(name, text);

    this.width = 1;
    this.fontSize = 16;
    this.color = "white";
    this.height = "20px";

    container.addControl(this);
  }
}

export class TextInput extends InputText {
  constructor(
    container: Container,
    name: string,
    text: string,
    textChanged: (text: string) => void
  ) {
    super(name, text);

    this.width = 1;
    this.height = "40px";
    this.color = "white";

    this.onTextChangedObservable.add((e) => textChanged(e.text));

    container.addControl(this);
  }
}

export const MenuButton = (
  container: Container,
  name: string,
  text: string,
  onClick: () => void
): Button => {
  let button = Button.CreateSimpleButton(name, text);
  button.color = "white";
  button.width = 1;
  button.height = "40px";
  button.onPointerUpObservable.add(onClick);

  container.addControl(button);

  return button;
};
