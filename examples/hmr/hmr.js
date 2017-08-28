require('./example');

if (module.hot) {
  module.hot.accept((err) => {
    if (err) {
      console.error('Cannot apply hot update', err);
    }
  });
}
