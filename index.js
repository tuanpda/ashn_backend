const bodyParse = require("body-parser");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const verifyToken = require("./services/verify-token");
const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();
dotenv.config();

app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:4042",
  "http://localhost:3000",
  "http://27.73.37.94:4042",
  "http://27.73.37.94:3000",
  "http://14.224.148.17:4042",
  "http://14.224.148.17:3000",
  "http://14.224.148.17:80",
  "http://14.224.148.17",
  "http://ansinhxahoiphudien.vn",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Tạo đường dẫn tuyệt đối tới thư mục static (nơi chứa PDF)
const staticFolderPath = path.join(__dirname, "static");

// Cho phép truy cập file trong static thông qua URL: /static/...
app.use("/static", express.static(staticFolderPath));

app.use(morgan("dev"));
app.use(bodyParse.urlencoded({ extended: false }));
app.use(bodyParse.json());

const staticFilesDirectory = path.join(__dirname, "public");
app.use(express.static(staticFilesDirectory));

// Tăng giới hạn kích thước thực thể lên 50MB
app.use(bodyParse.json({ limit: "50mb" }));
app.use(bodyParse.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/auth", require("./api/auth"));
app.use("/api/nodemailer", require("./api/nodemailer"));

// Middleware xác thực chỉ áp dụng cho các endpoint cần được bảo vệ
app.use(["/", "/api", "/api/users", "/api/danhmucs"], verifyToken);

app.get("/", (req, res) => {
  res.send("<h1>🤖 API SQLSERVER from NODEJS - TEST</h1>");
});

app.use("/api/users", require("./api/users"));
app.use("/api/danhmucs", require("./api/danhmucs"));
// app.use('/api/nodemailer', require('./api/nodemailer'));
app.use("/api/kekhai", require("./api/kekhai"));
app.use("/api/tochucdvt", require("./api/tochucdvt"));
app.use("/api/nguoihuong", require("./api/nguoihuong"));

// kê khai router cho các công ty riêng nhau
// công ty hà an kekhai_2902141757 (mst: 2902141757)
app.use("/api/org/kekhai_2902141757", require("./api/org/kekhai_2902141757"));

app.listen(process.env.PORT, () => {
  const port = process.env.PORT;

  console.log(`Server running at http://localhost:${port}`);
});
