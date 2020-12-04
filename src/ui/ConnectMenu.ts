import {
  AdvancedDynamicTexture,
  Button,
  InputText,
  StackPanel,
  TextBlock,
} from "@babylonjs/gui";
import { Header, MenuButton, Spacer, TextInput } from "./Controls";

export class ConnectMenu {
  private root: StackPanel;

  constructor(
    adt: AdvancedDynamicTexture,
    onHostChanged: (host: string) => {},
    onNameChanged: (name: string) => {},
    onHost: () => void,
    onJoin: () => void
  ) {
    let panel = new StackPanel();
    panel.width = 0.5;

    this.root = panel;
    adt.addControl(panel);

    new Header(panel, "host_label", "CONNECT");

    new Spacer(panel, "headerSpacer", "1", "30px");

    new TextInput(panel, "hostId", "Enter room id", (t: string) =>
      onHostChanged(t)
    );

    new TextInput(panel, "playerName", "Enter player name", (t: string) =>
      onNameChanged(t)
    );

    new Spacer(panel, "buttonSpacer", "1", "20px");

    MenuButton(panel, "hostButton", "Host", onHost);

    MenuButton(panel, "connectButton", "Connect", onJoin);
  }

  public dispose() {
    this.root.dispose();
  }
}
