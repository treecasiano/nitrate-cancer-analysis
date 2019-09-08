module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        ws: true,
        changeOrigin: true,
      },
      "/files": {
        target: "http://localhost:3000",
        ws: true,
        changeOrigin: true,
      },
      "/js": {
        target: "http://localhost:3000",
        ws: true,
        changeOrigin: true,
      },
      "/upload": {
        target: "http://localhost:3000",
        ws: true,
        changeOrigin: true,
      },
    },
  },
};
