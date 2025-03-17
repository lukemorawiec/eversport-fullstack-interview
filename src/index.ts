import { app } from "./server";

const port = 3099;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
