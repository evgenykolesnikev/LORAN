const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use(
  "/loran_service",
  createProxyMiddleware({
    target: "http://localhost:4002",
    changeOrigin: true,
    pathRewrite: {
      "^/loran_service": "",
    },
  })
);

app.use(
  "/loran_calculator",
  createProxyMiddleware({
    target: "http://localhost:5000",
    changeOrigin: true,
    pathRewrite: {
      "^/loran_calculator": "",
    },
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(3000, () => {
  console.log("Proxy server is running on http://localhost:3000");
});
