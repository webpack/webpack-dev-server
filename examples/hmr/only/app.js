import "./example.js";

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept((err) => {
    if (err) {
      console.error("Cannot apply HMR update.", err);
    }
  });
}
