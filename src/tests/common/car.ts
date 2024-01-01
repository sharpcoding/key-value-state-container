type Event = "started" | "accelerated" | "braked" | "stopped";

export type Car = {
  engine: {
    horsepower: number;
    cylinders: number;
  };
  body: {
    type: "sedan" | "coupe";
    color: "black" | "red" | "white";
  };
  status: "working" | "broken";
  year: number;
};

export type BlackBox = {
  events: Event[];
}

export type Moving = {
  start: () => void;
  stop: () => void;
}
