export class HomeController {
  home() {
    return {
      name: "myapi",
      description: "this is my api",
      author: "Ifunanya",
      time: new Date(),
    };
  }

  health() {
    return {
      status: "ok",
    };
  }
}
