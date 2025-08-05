const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { pool } = require("../database/dbinfo");
const jwt = require("jsonwebtoken");
const verifyToken = require("../services/verify-token");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

var folderAvatar = "/home/thuan/aspd_client/static/avatar";
var urlServer = "http://ansinhxahoiphudien.vn/";

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    /* Nhớ sửa đường dẫn khi deploy lên máy chủ */
    // đường dẫn cho máy dev MacOS
    // cb(null, "/Users/apple/Documents/code/p_Tcdvthu/tcdvthu_client/static/");
    // đường dẫn khi deploy máy chủ PHỦ DIỄN
    cb(null, folderAvatar);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

var upload = multer({ storage: storage });
/* Get all users */
router.get("/", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(`SELECT * FROM users order by createdAt desc`);
    const users = result.recordset;
    res.json(users);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get user tra cứu biên lai
router.get("/taikhoan-tracuu-bienlai-dientu", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(`SELECT * FROM users_tracuu_bienlai_bhxh order by createdAt desc`);
    const users = result.recordset;
    res.json(users);
  } catch (error) {
    res.status(500).json(error);
  }
});

/* Get email */
router.get("/findemail", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("email", req.query.email)
      .query(`SELECT * FROM users WHERE email = @email`);
    const email = result.recordset;
    res.json(email);
  } catch (error) {
    res.status(500).json(error);
  }
});

/* Get user by id */
router.get("/:_id", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("_id", req.params._id)
      .query(`SELECT * FROM users WHERE _id = @_id`);
    const user = result.recordset[0];
    if (!user) {
      res.status(403).json({
        success: false,
        message: "Authenticate failed, not found user",
      });
    } else {
      res.json(user);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

/* Cập nhật 1 user thường không qua auth */
router.patch("/user/:_id", upload.single("avatar"), async (req, res) => {
  let linkAvatar;
  if (!req.file) {
    linkAvatar = req.body.avatar;
  } else {
    linkAvatar = `${urlServer}/avatar/${req.file.filename}`;
  }
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("_id", req.params._id)
      .query(`SELECT * FROM users WHERE _id = @_id`);
    let user = result.recordset[0];
    if (user) {
      if (req.body.email) user.email = req.body.email;
      if (req.body.username) user.username = req.body.username;
      if (req.body.name) user.name = req.body.name;
      if (req.body.password) {
        var password = req.body.password;
        const encryptedPassword = await bcrypt.hash(password, 10);
        user.password = encryptedPassword;
      }
      if (req.body.role) user.role = req.body.role;
      if (req.body.mahuyen) user.mahuyen = req.body.mahuyen;
      await pool
        .request()
        .input("_id", req.params._id)
        .input("email", user.email)
        .input("username", user.username)
        .input("name", user.name)
        .input("password", user.password)
        .input("updatedAt", req.body.updatedAt)
        .input("avatar", linkAvatar)
        .input("role", user.role)
        .input("mahuyen", user.mahuyen)
        .query(
          `UPDATE users SET 
              email = @email, 
              password = @password, 
              username = @username, 
              name = @name,
              updatedAt = @updatedAt,
              avatar = @avatar,
              role = @role,
              mahuyen = @mahuyen
          WHERE _id = @_id;`
        );
      res.json({
        success: true,
        message: "Update success !",
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// cập nhật thông tin người dùng
router.post("/user/fix", upload.single("avatar"), async (req, res) => {
  let linkAvatar;
  // console.log(req.body);
  if (!req.file) {
    linkAvatar = req.body.avatar;
  } else {
    // xóa file ảnh cũ
    const basePath = folderAvatar;
    // "D:\\PROJECT\\TCDVTHU\\client\\static\\avatar"; // đổi đường dẫn khi up lên máy chủ
    const fileName = path.basename(req.body.avatarOld);
    // console.log(fileName);
    // Ghép đường dẫn và tên tệp bằng phương thức path.join()
    const filePath = path.join(basePath, fileName);
    // console.log(filePath);
    if (fileName !== "image-default.jpg") {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Đã xảy ra lỗi khi xóa tệp:", err);
          // Không return ở đây để vẫn tiếp tục xóa record
        }
      });
    }
    linkAvatar = `${urlServer}/avatar/${req.file.filename}`;
  }
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("_id", req.body._id)
      .query(`SELECT * FROM users WHERE _id = @_id`);
    let user = result.recordset[0];
    // console.log(user);
    if (user) {
      await pool
        .request()
        .input("_id", req.body._id)
        .input("matinh", req.body.matinh)
        .input("tentinh", req.body.tentinh)
        .input("mahuyen", req.body.mahuyen)
        .input("tenhuyen", req.body.tenhuyen)
        .input("maxa", req.body.maxa)
        .input("tenxa", req.body.tenxa)
        .input("madaily", req.body.madaily)
        .input("tendaily", req.body.tendaily)
        .input("diachi", req.body.diachi)
        .input("cccd", req.body.cccd)
        .input("sodienthoai", req.body.sodienthoai)
        .input("email", req.body.email)
        .input("name", req.body.name)
        .input("avatar", linkAvatar)
        .input("active", req.body.active)
        .input("updatedAt", req.body.updatedAt)
        .input("updatedBy", req.body.updatedBy)
        .input("ghichu", req.body.ghichu)
        .query(
          `UPDATE users SET 
              matinh = @matinh,
              tentinh = @tentinh,
              mahuyen = @mahuyen,
              tenhuyen = @tenhuyen,
              maxa = @maxa,
              tenxa = @tenxa,
              madaily = @madaily,
              tendaily = @tendaily,
              diachi = @diachi,
              cccd = @cccd,
              sodienthoai = @sodienthoai,
              email = @email, 
              name = @name,
              avatar = @avatar,
              active = @active,
              updatedAt = @updatedAt,
              updatedBy = @updatedBy,
              ghichu = @ghichu
          WHERE _id = @_id;`
        );
      res.json({
        success: true,
        message: "Update success !",
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// cập nhật thông tin người dùng
router.post("/user/fix-info", upload.single("avatar"), async (req, res) => {
  let linkAvatar;
  // console.log(req.body);
  if (!req.file) {
    linkAvatar = req.body.avatar;
  } else {
    // xóa file ảnh cũ
    const basePath = folderAvatar;
    // "D:\\PROJECT\\TCDVTHU\\client\\static\\avatar"; // đổi đường dẫn khi up lên máy chủ
    const fileName = path.basename(req.body.avatarOld);
    // console.log(fileName);
    // Ghép đường dẫn và tên tệp bằng phương thức path.join()
    const filePath = path.join(basePath, fileName);
    // console.log(filePath);
    if (fileName !== "default-image.png") {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Đã xảy ra lỗi khi xóa tệp:", err);
          // Không return ở đây để vẫn tiếp tục xóa record
        }
      });
    }
    linkAvatar = `${urlServer}/avatar/${req.file.filename}`;
  }
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("_id", req.body._id)
      .query(`SELECT * FROM users WHERE _id = @_id`);
    let user = result.recordset[0];
    // console.log(user);
    if (user) {
      await pool
        .request()
        .input("_id", req.body._id)
        .input("sodienthoai", req.body.sodienthoai)
        .input("email", req.body.email)
        .input("name", req.body.name)
        .input("avatar", linkAvatar)
        .input("updatedAt", req.body.updatedAt)
        .input("updatedBy", req.body.updatedBy)
        .query(
          `UPDATE users SET 
              sodienthoai = @sodienthoai,
              email = @email, 
              name = @name,
              avatar = @avatar,
              updatedAt = @updatedAt,
              updatedBy = @updatedBy
          WHERE _id = @_id;`
        );
      res.json({
        success: true,
        message: "Update success !",
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// cập nhật thông tin người dùng
router.post(
  "/user/fix-info-pass",
  upload.single("avatar"),
  async (req, res) => {
    let linkAvatar;
    const password = req.body.password;
    const newPassword = req.body.newPassword;
    // console.log(req.body);
    if (!req.file) {
      linkAvatar = req.body.avatar;
    } else {
      // xóa file ảnh cũ
      const basePath = folderAvatar;
      // "D:\\PROJECT\\TCDVTHU\\client\\static\\avatar"; // đổi đường dẫn khi up lên máy chủ
      const fileName = path.basename(req.body.avatarOld);
      // console.log(fileName);
      // Ghép đường dẫn và tên tệp bằng phương thức path.join()
      const filePath = path.join(basePath, fileName);
      // console.log(filePath);
      if (fileName !== "default-image.png") {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Đã xảy ra lỗi khi xóa tệp:", err);
            // Không return ở đây để vẫn tiếp tục xóa record
          }
        });
      }
      linkAvatar = `${urlServer}/avatar/${req.file.filename}`;
    }
    try {
      await pool.connect();
      const result = await pool
        .request()
        .input("_id", req.body._id)
        .query(`SELECT * FROM users WHERE _id = @_id`);
      let user = result.recordset[0];
      // console.log(user);
      if (user && req.body.password) {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          const encryptedPassword = await bcrypt.hash(newPassword, 10);

          await pool
            .request()
            .input("_id", req.body._id)
            .input("sodienthoai", req.body.sodienthoai)
            .input("email", req.body.email)
            .input("name", req.body.name)
            .input("password", encryptedPassword)
            .input("avatar", linkAvatar)
            .input("updatedAt", req.body.updatedAt)
            .input("updatedBy", req.body.updatedBy)
            .query(
              `UPDATE users SET 
              sodienthoai = @sodienthoai,
              email = @email, 
              name = @name,
              password = @password,
              avatar = @avatar,
              updatedAt = @updatedAt,
              updatedBy = @updatedBy
          WHERE _id = @_id;`
            );
          res.json({
            success: true,
            message: "Update success !",
          });
        } else {
          res.json({
            success: 5,
            message: "Sai pass !",
          });
        }
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

// Đổi mật khẩu và email
router.post("/user/changepass", async (req, res) => {
  // console.log(req.body);
  const password = req.body.password;
  const newPassword = req.body.newPassword;
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("_id", req.body._id)
      .query(`SELECT * FROM users WHERE _id = @_id`);
    let user = result.recordset[0];
    // console.log(user);
    if (user && req.body.password) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const encryptedPassword = await bcrypt.hash(newPassword, 10);

        await pool
          .request()
          .input("_id", req.body._id)
          .input("password", encryptedPassword)
          .input("email", req.body.email)
          .query(
            `UPDATE users SET
            password = @password,
            email = @email
          WHERE _id = @_id;`
          );
        res.json({
          success: true,
          message: "Update success !",
        });
      } else {
        res.json({
          success: 5,
          message: "Sai pass !",
        });
      }
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// Đổi Email
router.post("/user/changeemail", async (req, res) => {
  // console.log(req.body);
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("_id", req.body._id)
      .query(`SELECT * FROM users WHERE _id = @_id`);
    let user = result.recordset[0];
    // console.log(user);
    if (user) {
      await pool
        .request()
        .input("_id", req.body._id)
        .input("email", req.body.email)
        .query(
          `UPDATE users SET 
              email = @email
          WHERE _id = @_id;`
        );
      res.json({
        success: true,
        message: "Update success !",
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

/* Lấy 1 user auth */
router.get("/auth/user", verifyToken, async (req, res) => {
  // console.log(req.user);
  res.json({
    user: req.user,
  });

  // console.log(req.decoded);
  // console.log(req.decoded._id);
  // const _id = req.decoded._id;
  // try {
  //   await pool.connect();
  //   const result = await pool
  //     .request()
  //     .query(`SELECT * FROM users WHERE _id = ${_id}`);
  //   const user = result.recordset[0];
  //   if (!user) {
  //     res.status(403).json({
  //       success: false,
  //       message: "Authenticate failed, not found user",
  //     });
  //   } else {
  //     res.json(user);
  //   }
  // } catch (error) {
  //   res.status(500).json(error);
  // }
});

// router.get("/me", verifyToken, (req, res) => {
//   res.json({
//     username: req.user.username,
//   });
// });

/* Login user auth */
router.post("/auth/login", async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("username", username)
      .query(`SELECT * FROM users WHERE username = @username`);
    const user = result.recordset[0];
    if (!user) {
      res.status(403).json({
        success: 9,
        message: "Authenticate failed, not found user",
      });
    } else {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        let token = jwt.sign(user, process.env.SECRET, { expiresIn: "1h" });
        // res.json({ success: 8, user, token });
        // Ghi token vào cookie (thử code mới)
        // res.cookie("token", token, {
        //   httpOnly: true,
        //   secure: false, // ✅ Nếu dùng HTTPS thì để true
        //   sameSite: "lax", // Hoặc 'strict' nếu bạn muốn tăng bảo mật
        //   maxAge: 60 * 60 * 1000, // 1 tiếng
        // });
        res.json({ success: 8, user });
        //console.log(user);
      } else {
        res.status(403).json({
          success: 7,
          message: "Authenticate failed, wrong password",
        });
      }
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

/* Tạo user auth kèm token */
router.post("/account", upload.single("avatar"), async (req, res) => {
  // console.log(req.body);
  var password = req.body.password;
  const encryptedPassword = await bcrypt.hash(password, 10);

  let linkAvatar;
  const file = req.file;
  if (!file) {
    linkAvatar = req.body.avatar;
  } else {
    // Đổi đường dẫn khi deploy lên máy chủ
    linkAvatar = `${urlServer}/avatar/${req.file.filename}`;
  }

  let newMaDaiLy = "DT0001"; // mặc định nếu chưa có người nào

  // Lấy mã đại lý lớn nhất hiện tại
  const madailyResult = await pool.request().query(`
      SELECT TOP 1 madaily 
      FROM users 
      WHERE madaily LIKE 'DT%' 
      ORDER BY madaily DESC;
    `);

  if (madailyResult.recordset.length > 0) {
    const lastMa = madailyResult.recordset[0].madaily; // VD: "DT0099"
    const numberPart = parseInt(lastMa.slice(2), 10); // Lấy phần số: 99
    const nextNumber = numberPart + 1; // Tăng: 100
    const paddedNumber = nextNumber.toString().padStart(4, "0"); // "0100"
    newMaDaiLy = `DT${paddedNumber}`; // "DT0100"
  }

  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("matochuc", req.body.matochuc)
      .input("tentochuc", req.body.tentochuc)
      .input("matinh", req.body.matinh)
      .input("tentinh", req.body.tentinh)
      .input("mahuyen", req.body.mahuyen)
      .input("tenhuyen", req.body.tenhuyen)
      .input("maxa", req.body.maxa)
      .input("tenxa", req.body.tenxa)
      .input("madaily", newMaDaiLy)
      .input("tendaily", req.body.tendaily)
      .input("nvcongty", req.body.nvcongty)
      .input("diachi", req.body.diachi)
      .input("masobhxh", req.body.masobhxh)
      .input("cccd", req.body.cccd)
      .input("sodienthoai", req.body.sodienthoai)
      .input("email", req.body.email)
      .input("username", req.body.username)
      .input("name", req.body.name)
      .input("password", encryptedPassword)
      .input("role", req.body.role)
      .input("avatar", linkAvatar)
      .input("active", req.body.active)
      .input("createdBy", req.body.createdBy)
      .input("createdAt", req.body.createdAt)
      .input("updatedBy", req.body.updatedBy)
      .input("updatedAt", req.body.updatedAt)
      .input("res_sent", req.body.res_sent)
      .input("macqbhxh", req.body.macqbhxh)
      .input("tencqbhxh", req.body.tencqbhxh).query(`
                INSERT INTO users (matochuc, tentochuc, matinh, tentinh, mahuyen, tenhuyen, maxa, tenxa, madaily, tendaily, nvcongty,
                  diachi, masobhxh, cccd, sodienthoai, email, username, name, password, role, avatar, active, 
                  createdBy, createdAt, updatedBy, updatedAt, res_sent, macqbhxh, tencqbhxh) 
                VALUES (@matochuc, @tentochuc, @matinh, @tentinh, @mahuyen, @tenhuyen, @maxa, @tenxa, @madaily, @tendaily, @nvcongty,
                  @diachi, @masobhxh, @cccd, @sodienthoai, @email, @username, @name, @password, @role, @avatar, @active,
                  @createdBy, @createdAt, @updatedBy, @updatedAt, @res_sent, @macqbhxh, @tencqbhxh);
            `);
    const user = req.body;
    let token = jwt.sign({ user }, process.env.SECRET, { expiresIn: "1h" });
    res.json({ user, token, message: "Create user success!", success: true });
  } catch (error) {
    res.json({ success: false });
    res.status(500).json(error);
  }
});

// tạo user tra cứu biên lai điện tử bhxh
router.post(
  "/account-tracuubienlaidientu-bhxh",
  upload.single("avatar"),
  async (req, res) => {
    // console.log(req.body);
    var password = req.body.password;
    const encryptedPassword = await bcrypt.hash(password, 10);

    let linkAvatar;
    const file = req.file;
    if (!file) {
      linkAvatar = req.body.avatar;
    } else {
      // Đổi đường dẫn khi deploy lên máy chủ
      linkAvatar = `${urlServer}/avatar/${req.file.filename}`;
    }
    try {
      await pool.connect();
      const result = await pool
        .request()
        .input("masobhxh", req.body.masobhxh)
        .input("name", req.body.name)
        .input("password", encryptedPassword)
        .input("email", req.body.email)
        .input("donvi", req.body.donvi)
        .input("sodienthoai", req.body.sodienthoai)
        .input("cccd", req.body.cccd)
        .input("avatar", linkAvatar)
        .input("active", req.body.active)
        .input("createdBy", req.body.createdBy)
        .input("createdAt", req.body.createdAt).query(`
                INSERT INTO users_tracuu_bienlai_bhxh (masobhxh, name, password, email, donvi, sodienthoai, cccd,
                avatar, active, createdBy, createdAt) 
                VALUES (@masobhxh, @name, @password, @email, @donvi, @sodienthoai, @cccd,
                @avatar, @active, @createdBy, @createdAt);
            `);
      const user = req.body;
      res.json({ user, message: "Create user success!", success: true });
    } catch (error) {
      console.error("Lỗi tạo user:", error);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi khi tạo user", error });
    }
  }
);

// cập nhật thông tin user tra cứu biên lai
router.post(
  "/user/fix-tracuu-bienlaidientu",
  upload.single("avatar"),
  async (req, res) => {
    let linkAvatar;
    // console.log(req.body);
    if (!req.file) {
      linkAvatar = req.body.avatar;
    } else {
      // xóa file ảnh cũ
      const basePath = folderAvatar;
      // "D:\\PROJECT\\TCDVTHU\\client\\static\\avatar"; // đổi đường dẫn khi up lên máy chủ
      const fileName = path.basename(req.body.avatarOld);
      // console.log(fileName);
      // Ghép đường dẫn và tên tệp bằng phương thức path.join()
      const filePath = path.join(basePath, fileName);
      // console.log(filePath);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("error", err);
          return;
        }
      });
      linkAvatar = `${urlServer}/avatar/${req.file.filename}`;
    }
    try {
      await pool.connect();
      const result = await pool
        .request()
        .input("_id", req.body._id)
        .query(`SELECT * FROM users_tracuu_bienlai_bhxh WHERE _id = @_id`);
      let user = result.recordset[0];
      // console.log(user);
      if (user) {
        await pool
          .request()
          .input("_id", req.body._id)
          .input("cccd", req.body.cccd)
          .input("sodienthoai", req.body.sodienthoai)
          .input("masobhxh", req.body.masobhxh)
          .input("email", req.body.email)
          .input("name", req.body.name)
          .input("avatar", linkAvatar)
          .input("active", req.body.active)
          .input("donvi", req.body.donvi)
          .query(
            `UPDATE users_tracuu_bienlai_bhxh SET 
              cccd = @cccd,
              sodienthoai = @sodienthoai,
              masobhxh = @masobhxh,
              email = @email, 
              name = @name,
              avatar = @avatar,
              active = @active,
              donvi = @donvi
          WHERE _id = @_id;`
          );
        res.json({
          success: true,
          message: "Update success !",
        });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

// import user
router.post("/import-uses", async (req, res) => {
  // console.log(req.body);
  let dataUsers = req.body;

  try {
    await pool.connect();
    for (const item of dataUsers) {
      var password = item.password;
      const encryptedPassword = await bcrypt.hash(password, 10);

      // console.log(encryptedPassword);

      try {
        const result = await pool
          .request()
          .input("matochuc", dataUsers.matochuc)
          .input("tentochuc", dataUsers.tentochuc)
          .input("matinh", dataUsers.matinh)
          .input("tentinh", dataUsers.tentinh)
          .input("mahuyen", dataUsers.mahuyen)
          .input("tenhuyen", dataUsers.tenhuyen)
          .input("maxa", dataUsers.maxa)
          .input("tenxa", dataUsers.tenxa)
          .input("madaily", dataUsers.madaily)
          .input("tendaily", dataUsers.tendaily)
          .input("nvcongty", dataUsers.nvcongty)
          .input("diachi", dataUsers.diachi)
          .input("masobhxh", dataUsers.masobhxh)
          .input("cccd", dataUsers.cccd)
          .input("sodienthoai", dataUsers.sodienthoai)
          .input("email", dataUsers.email)
          .input("username", dataUsers.username)
          .input("name", dataUsers.name)
          .input("password", encryptedPassword)
          .input("role", dataUsers.role)
          .input("avatar", dataUsers.avatar)
          .input("active", dataUsers.active)
          .input("createdBy", dataUsers.createdBy)
          .input("createdAt", dataUsers.createdAt)
          .input("updatedBy", dataUsers.updatedBy)
          .input("updatedAt", dataUsers.updatedAt)
          .input("res_sent", dataUsers.res_sent)
          .input("macqbhxh", dataUsers.macqbhxh)
          .input("tencqbhxh", dataUsers.tencqbhxh).query(`
                  INSERT INTO users (matochuc, tentochuc, matinh, tentinh, mahuyen, tenhuyen, maxa, tenxa, madaily, tendaily, nvcongty,
                    diachi, masobhxh, cccd, sodienthoai, email, username, name, password, role, avatar, active,
                    createdBy, createdAt, updatedBy, updatedAt, res_sent, macqbhxh, tencqbhxh)
                  VALUES (@matochuc, @tentochuc, @matinh, @tentinh, @mahuyen, @tenhuyen, @maxa, @tenxa, @madaily, @tendaily, @nvcongty,
                    @diachi, @masobhxh, @cccd, @sodienthoai, @email, @username, @name, @password, @role, @avatar, @active,
                    @createdBy, @createdAt, @updatedBy, @updatedAt, @res_sent, @macqbhxh, @tencqbhxh);
              `);
        const user = req.body;
        let token = jwt.sign({ user }, process.env.SECRET, { expiresIn: "1h" });
        res.json({
          user,
          token,
          message: "Create user success!",
          success: true,
        });
        console.log(token);
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
  }

  // var password = req.body.password;
  // const encryptedPassword = await bcrypt.hash(password, 10);

  // try {
  //   await pool.connect();
  //   const result = await pool
  //     .request()
  //     .input("matochuc", req.body.matochuc)
  //     .input("tentochuc", req.body.tentochuc)
  //     .input("matinh", req.body.matinh)
  //     .input("tentinh", req.body.tentinh)
  //     .input("mahuyen", req.body.mahuyen)
  //     .input("tenhuyen", req.body.tenhuyen)
  //     .input("maxa", req.body.maxa)
  //     .input("tenxa", req.body.tenxa)
  //     .input("madaily", req.body.madaily)
  //     .input("tendaily", req.body.tendaily)
  //     .input("nvcongty", req.body.nvcongty)
  //     .input("diachi", req.body.diachi)
  //     .input("masobhxh", req.body.masobhxh)
  //     .input("cccd", req.body.cccd)
  //     .input("sodienthoai", req.body.sodienthoai)
  //     .input("email", req.body.email)
  //     .input("username", req.body.username)
  //     .input("name", req.body.name)
  //     .input("password", encryptedPassword)
  //     .input("role", req.body.role)
  //     .input("avatar", linkAvatar)
  //     .input("active", req.body.active)
  //     .input("createdBy", req.body.createdBy)
  //     .input("createdAt", req.body.createdAt)
  //     .input("updatedBy", req.body.updatedBy)
  //     .input("updatedAt", req.body.updatedAt)
  //     .input("res_sent", req.body.res_sent)
  //     .input("macqbhxh", req.body.macqbhxh)
  //     .input("tencqbhxh", req.body.tencqbhxh).query(`
  //               INSERT INTO users (matochuc, tentochuc, matinh, tentinh, mahuyen, tenhuyen, maxa, tenxa, madaily, tendaily, nvcongty,
  //                 diachi, masobhxh, cccd, sodienthoai, email, username, name, password, role, avatar, active,
  //                 createdBy, createdAt, updatedBy, updatedAt, res_sent, macqbhxh, tencqbhxh)
  //               VALUES (@matochuc, @tentochuc, @matinh, @tentinh, @mahuyen, @tenhuyen, @maxa, @tenxa, @madaily, @tendaily, @nvcongty,
  //                 @diachi, @masobhxh, @cccd, @sodienthoai, @email, @username, @name, @password, @role, @avatar, @active,
  //                 @createdBy, @createdAt, @updatedBy, @updatedAt, @res_sent, @macqbhxh, @tencqbhxh);
  //           `);
  //   const user = req.body;
  //   let token = jwt.sign({ user }, process.env.SECRET, { expiresIn: "1h" });
  //   res.json({ user, token, message: "Create user success!", success: true });
  // } catch (error) {
  //   res.status(500).json(error);
  // }
});

// cập nhật thông tin user auth
router.patch("/auth/user", verifyToken, async (req, res) => {
  const _id = req.decoded._id;
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(`SELECT * FROM users WHERE _id = ${_id}`);
    let user = result.recordset[0];
    //console.log(user.email);
    if (user) {
      if (req.body.email) user.email = req.body.email;
      if (req.body.username) user.username = req.body.username;
      if (req.body.name) user.name = req.body.name;
      if (req.body.password) {
        var password = req.body.password;
        const encryptedPassword = await bcrypt.hash(password, 10);
        user.password = encryptedPassword;
      }
      await pool
        .request()
        .input("_id", _id)
        .input("email", user.email)
        .input("username", user.username)
        .input("name", user.name)
        .input("password", user.password)
        .input("updatedAt", req.body.updatedAt)
        .query(
          `UPDATE users SET 
              email = @email, 
              password = @password, 
              username = @username, 
              name = @name,
              updatedAt = @updatedAt
          WHERE _id = ${_id};`
        );
      res.json({
        success: true,
        message: "Update success !",
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

/* Xóa dữ liệu */
router.delete("/:_id", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("_id", req.params._id)
      .query(`SELECT * FROM users WHERE _id = @_id`);
    let user = result.recordset.length ? result.recordset[0] : null;
    if (user) {
      await pool
        .request()
        .input("_id", req.params._id)
        .query(`DELETE FROM users WHERE _id = @_id;`);
      res.json(user);
    } else {
      res.status(404).json({
        message: "Không tìm thấy user này",
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// xóa user
router.post("/delete/user", async (req, res) => {
  // console.log(req.body);
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("_id", req.body._id)
      .query(`SELECT * FROM users WHERE _id = @_id`);

    let user = result.recordset.length ? result.recordset[0] : null;
    // console.log(user);
    if (user) {
      // xóa file trong thư mục
      const basePath = folderAvatar;
      // "D:\\PROJECT\\TCDVTHU\\client\\static\\avatar"; // đổi đường dẫn khi up lên máy chủ
      const fileName = path.basename(req.body.avatar);
      // Ghép đường dẫn và tên tệp bằng phương thức path.join()
      const filePath = path.join(basePath, fileName);
      //   console.log(filePath);
      // Nếu không phải ảnh mặc định thì mới xóa file
      if (fileName !== "default-image.png") {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Đã xảy ra lỗi khi xóa tệp:", err);
            // Không return ở đây để vẫn tiếp tục xóa record
          }
        });
      }
      await pool
        .request()
        .input("_id", req.body._id)
        .query(`DELETE FROM users WHERE _id = @_id;`);
      res.json({ success: true });
    } else {
      res.status(404).json({
        message: "Record not found",
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// xóa user tra cứu biên lai
router.post("/delete/user-tracuuu-bienlai-dientu", async (req, res) => {
  // console.log(req.body);
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("_id", req.body._id)
      .query(`SELECT * FROM users_tracuu_bienlai_bhxh WHERE _id = @_id`);

    let user = result.recordset.length ? result.recordset[0] : null;
    // console.log(user);
    if (user) {
      // xóa file trong thư mục
      const basePath = folderAvatar;
      // "D:\\PROJECT\\TCDVTHU\\client\\static\\avatar"; // đổi đường dẫn khi up lên máy chủ
      const fileName = path.basename(req.body.avatar);
      // Ghép đường dẫn và tên tệp bằng phương thức path.join()
      const filePath = path.join(basePath, fileName);
      //   console.log(filePath);
      // Nếu không phải ảnh mặc định thì mới xóa file
      if (fileName !== "default-image.png") {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Đã xảy ra lỗi khi xóa tệp:", err);
            // Không return ở đây để vẫn tiếp tục xóa record
          }
        });
      }
      await pool
        .request()
        .input("_id", req.body._id)
        .query(`DELETE FROM users_tracuu_bienlai_bhxh WHERE _id = @_id;`);
      res.json({ success: true });
    } else {
      res.status(404).json({
        message: "Record not found",
      });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
