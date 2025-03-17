interface Period {
  id: number;
  uuid: string;
  membership: number;
  start: string;
  end: string;
  state: "issued" | "planned";
}
