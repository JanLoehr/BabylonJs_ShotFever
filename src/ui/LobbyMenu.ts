import { AdvancedDynamicTexture, StackPanel } from "@babylonjs/gui";
import { Header, Label, MenuButton, Spacer } from "./Controls";

export class Lobby {
  private root: StackPanel;
  private playerPanel: StackPanel;

  constructor(
    adt: AdvancedDynamicTexture,
    isHost: boolean,
    roomName: string,
    onStart: () => void
  ) {
    this.root = new StackPanel("lobby_root");
    this.root.width = 0.5;

    this.playerPanel = new StackPanel("lobby_root");

    adt.addControl(this.root);

    new Header(this.root, "lobby_header", "LOBBY");
    new Label(this.root, "roomName", `of room: ${roomName}`);
    new Spacer(this.root, "spacer", "1", "10px");

    new Header(this.root, "player_header", "PLAYERS", 18);
    new Spacer(this.root, "spacer", "1", "10px");

    this.root.addControl(this.playerPanel);
    new Spacer(this.root, "spacer", "1", "20px");

    if (isHost) {
      MenuButton(this.root, "startGame", "START", onStart);
    }
  }

  public dispose() {
    this.root.dispose();
  }

  public setPlayers(names: string[]) {
    this.playerPanel.clearControls();

    names.forEach((n) => {
      new Label(this.playerPanel, n, n);
    });
  }
}
