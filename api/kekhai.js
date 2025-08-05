const express = require("express");
const router = express.Router();
const { pool } = require("../database/dbinfo");
const {
  Table,
  NVarChar,
  Int,
  Float,
  Transaction,
  Bit,
  Date: SqlDate,
  DateTime,
} = require("mssql");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { log } = require("console");
const axios = require("axios");

let checkDB = process.env.SQL_DATABASE;
let thumucbienlai = "";
let thumucbienlaidahuy = "";
let thumucbienlaidoisoat = "";
let urlServer = "";
let urlServerBackend;
if (checkDB === "tcdvthu") {
  thumucbienlai = "/home/thuan/aspd_client/static/bienlaidientu/bienlai";
  thumucbienlaidoisoat = "/home/thuan/aspd_client/static/bienlaidientu/bienlaidoisoat";
  // thumucbienlai = "D:\\"
  // thumucbienlai = "/Users/wolf/Code\ Project/"; // macos

  thumucbienlaidahuy =
    "/home/thuan/aspd_client/static/bienlaidientu/bienlaidahuy";
  urlServer = "ansinhxahoiphudien";
  urlServerBackend = "ansinhxahoiphudien:1552"; // phủ diễn
}

console.log("=====================");
console.log("Bạn đang sử dụng cơ sở dữ liệu: " + checkDB);
console.log("Thư mục biên lai: " + thumucbienlai);
console.log("URL máy chủ: " + urlServer);
console.log("URL máy chủ backend: " + urlServerBackend);
console.log("=====================");

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, thumucbienlai);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var storageHuy = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, thumucbienlaidahuy);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var storageDoisoat = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, thumucbienlaidoisoat);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var upload = multer({ storage: storage });
var uploadHuy = multer({ storage: storageHuy });
var uploadDoisoat = multer({ storage: storageDoisoat });

// Ghi biên lai điện tử
router.post("/upload-bienlai", upload.single("pdf"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Không có file" });
  }

  return res.json({ message: "Lưu thành công", path: req.file.path });
});

// Ghi biên lai đã hủy
router.post("/upload-bienlai-huy", uploadHuy.single("pdf"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Không có file" });
  }

  return res.json({
    message: "Lưu vào thư mục đã hủy thành công",
    path: req.file.path,
  });
});

router.post("/upload-bienlai-doisoat", uploadDoisoat.single("pdf"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Không có file" });
  }

  return res.json({ message: "Lưu thành công biên lai đối soát", path: req.file.path });
});

// add ke khai chạy lẻ từng dòng
router.post("/add-kekhai", async (req, res) => {
  // console.log(req.body);

  try {
    await pool.connect();
    // Tạo số hồ sơ duy nhất
    const maxSoHoSoResult = await pool
      .request()
      .query("SELECT MAX(_id) as max_so_ho_so FROM kekhai");
    const newSoHoSo = (maxSoHoSoResult.recordset[0].max_so_ho_so || 0) + 1;
    const soHoso =
      newSoHoSo + "/" + req.body.nvt_masobhxh + "/" + req.body.nvt_cccd;

    const result = await pool
      .request()
      .input("sohoso", soHoso)
      .input("matochuc", req.body.matochuc)
      .input("tentochuc", req.body.tentochuc)
      .input("madaily", req.body.madaily)
      .input("tendaily", req.body.tendaily)
      .input("maloaihinh", req.body.maloaihinh)
      .input("tenloaihinh", req.body.tenloaihinh)
      .input("hoten", req.body.hoten)
      .input("masobhxh", req.body.masobhxh)
      .input("cccd", req.body.cccd)
      .input("dienthoai", req.body.dienthoai)
      .input("maphuongan", req.body.maphuongan)
      .input("tenphuongan", req.body.tenphuongan)
      .input("ngaysinh", req.body.ngaysinh)
      .input("gioitinh", req.body.gioitinh)
      .input("nguoithu", req.body.nguoithu)
      .input("tienluongcs", req.body.tienluongcs)
      .input("sotien", req.body.sotien)
      .input("tylengansachdiaphuong", req.body.tylengansachdiaphuong)
      .input("hotrokhac", req.body.hotrokhac)
      .input("tungay", req.body.tungay)
      .input("tyledong", req.body.tyledong)
      .input("muctiendong", req.body.muctiendong)
      .input("maphuongthucdong", req.body.maphuongthucdong)
      .input("tenphuongthucdong", req.body.tenphuongthucdong)
      .input("tuthang", req.body.tuthang)
      .input("tientunguyendong", req.body.tientunguyendong)
      .input("tienlai", req.body.tienlai)
      .input("madoituong", req.body.madoituong)
      .input("tendoituong", req.body.tendoituong)
      .input("tylensnnht", req.body.tylensnnht)
      .input("tiennsnnht", req.body.tiennsnnht)
      .input("tylensdp", req.body.tylensdp)
      .input("tiennsdp", req.body.tiennsdp)
      .input("matinh", req.body.matinh)
      .input("tentinh", req.body.tentinh)
      .input("maquanhuyen", req.body.maquanhuyen)
      .input("tenquanhuyen", req.body.tenquanhuyen)
      .input("maxaphuong", req.body.maxaphuong)
      .input("tenxaphuong", req.body.tenxaphuong)
      .input("benhvientinh", req.body.benhvientinh)
      .input("mabenhvien", req.body.mabenhvien)
      .input("tenbenhvien", req.body.tenbenhvien)
      .input("tothon", req.body.tothon)
      .input("ghichu", req.body.ghichu)
      .input("createdAt", req.body.createdAt)
      .input("createdBy", req.body.createdBy)
      .input("updatedAt", req.body.updatedAt)
      .input("updatedBy", req.body.updatedBy)
      .input("dotkekhai", newSoHoSo)
      .input("kykekhai", req.body.kykekhai)
      .input("ngaykekhai", req.body.ngaykekhai)
      .input("trangthai", req.body.trangthai)
      .input("maxaphuong_new", req.body.maxaphuong_new)
      .input("tenxaphuong_new", req.body.tenxaphuong_new).query(`
                  INSERT INTO kekhai (sohoso, matochuc, tentochuc, madaily, tendaily, maloaihinh, tenloaihinh, hoten, masobhxh, cccd, dienthoai,	
                    maphuongan, tenphuongan, ngaysinh, gioitinh, nguoithu, tienluongcs, sotien,	
                    tylengansachdiaphuong, hotrokhac, tungay, tyledong, muctiendong,	
                    maphuongthucdong, tenphuongthucdong, tuthang, tientunguyendong, tienlai, madoituong,	
                    tendoituong, tylensnnht, tiennsnnht, tylensdp, tiennsdp, matinh, tentinh, maquanhuyen, tenquanhuyen,	
                    maxaphuong, tenxaphuong, benhvientinh, mabenhvien, tenbenhvien, tothon, ghichu,	
                    createdAt, createdBy, updatedAt, updatedBy, dotkekhai, kykekhai, ngaykekhai, trangthai, maxaphuong_new, tenxaphuong_new) 
                  VALUES (@sohoso, @matochuc, @tentochuc, @madaily, @tendaily, @maloaihinh, @tenloaihinh, @hoten, @masobhxh, @cccd, @dienthoai,	
                    @maphuongan, @tenphuongan, @ngaysinh, @gioitinh, @nguoithu, @tienluongcs, @sotien,	
                    @tylengansachdiaphuong, @hotrokhac, @tungay, @tyledong, @muctiendong,	
                    @maphuongthucdong, @tenphuongthucdong, @tuthang, @tientunguyendong, @tienlai, @madoituong,	
                    @tendoituong, @tylensnnht, @tiennsnnht, @tylensdp, @tiennsdp, @matinh, @tentinh, @maquanhuyen, @tenquanhuyen,	
                    @maxaphuong, @tenxaphuong, @benhvientinh, @mabenhvien, @tenbenhvien, @tothon, @ghichu,	
                    @createdAt, @createdBy, @updatedAt, @updatedBy, @dotkekhai, @kykekhai, @ngaykekhai, @trangthai, @maxaphuong_new, @tenxaphuong_new);
              `);
    const kekhai = req.body;
    res.json(kekhai);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/update-hoso-kekhai", async (req, res) => {
  // console.log(req.body);
  try {
    await pool.connect();

    const result = await pool
      .request()
      .input("_id", req.body._id)
      .input("maloaihinh", req.body.maloaihinh)
      .input("tenloaihinh", req.body.tenloaihinh)
      .input("hoten", req.body.hoten)
      .input("masobhxh", req.body.masobhxh)
      .input("cccd", req.body.cccd)
      .input("dienthoai", req.body.dienthoai)
      .input("maphuongan", req.body.maphuongan)
      .input("tenphuongan", req.body.tenphuongan)
      .input("ngaysinh", req.body.ngaysinh)
      .input("gioitinh", req.body.gioitinh)
      .input("nguoithu", req.body.nguoithu)
      .input("tienluongcs", req.body.tienluongcs)
      .input("sotien", req.body.sotien)
      .input("tylengansachdiaphuong", req.body.tylengansachdiaphuong)
      .input("hotrokhac", req.body.hotrokhac)
      .input("tungay", req.body.tungay)
      .input("denngay", req.body.denngay)
      .input("tyledong", req.body.tyledong)
      .input("muctiendong", req.body.muctiendong)
      .input("maphuongthucdong", req.body.maphuongthucdong)
      .input("tenphuongthucdong", req.body.tenphuongthucdong)
      .input("tuthang", req.body.tuthang)
      .input("denthang", req.body.denthang)
      .input("sothang", req.body.sothang)
      .input("tientunguyendong", req.body.tientunguyendong)
      .input("tienlai", req.body.tienlai)
      .input("madoituong", req.body.madoituong)
      .input("tendoituong", req.body.tendoituong)
      .input("tylensnnht", req.body.tylensnnht)
      .input("tiennsnnht", req.body.tiennsnnht)
      .input("tylensdp", req.body.tylensdp)
      .input("tiennsdp", req.body.tiennsdp)
      .input("matinh", req.body.matinh)
      .input("tentinh", req.body.tentinh)
      .input("maquanhuyen", req.body.maquanhuyen)
      .input("tenquanhuyen", req.body.tenquanhuyen)
      .input("maxaphuong", req.body.maxaphuong)
      .input("tenxaphuong", req.body.tenxaphuong)
      .input("mabenhvien", req.body.mabenhvien)
      .input("tenbenhvien", req.body.tenbenhvien)
      .input("tothon", req.body.tothon)
      .input("ghichu", req.body.ghichu)
      .input("updatedAt", req.body.updatedAt)
      .input("updatedBy", req.body.updatedBy)
      .input("status_hosoloi", 0)
      .input("trangthai", req.body.trangthai).query(`
                  UPDATE kekhai
                      SET
                        maloaihinh = @maloaihinh,
                        tenloaihinh = @tenloaihinh,
                        hoten = @hoten,
                        masobhxh = @masobhxh,
                        cccd = @cccd,
                        dienthoai = @dienthoai,
                        maphuongan = @maphuongan,
                        tenphuongan = @tenphuongan,
                        ngaysinh = @ngaysinh,
                        gioitinh = @gioitinh,
                        nguoithu = @nguoithu,
                        tienluongcs = @tienluongcs,
                        sotien = @sotien,
                        tylengansachdiaphuong = @tylengansachdiaphuong,
                        hotrokhac = @hotrokhac,
                        tungay = @tungay,
                        denngay = @denngay,
                        tyledong = @tyledong,
                        muctiendong = @muctiendong,
                        maphuongthucdong = @maphuongthucdong,
                        tenphuongthucdong = @tenphuongthucdong,
                        tuthang = @tuthang,
                        denthang = @denthang,
                        sothang = @sothang,
                        tientunguyendong = @tientunguyendong,
                        tienlai = @tienlai,
                        madoituong = @madoituong,
                        tendoituong = @tendoituong,
                        tylensnnht = @tylensnnht,
                        tiennsnnht = @tiennsnnht,
                        tylensdp = @tylensdp,
                        tiennsdp = @tiennsdp,
                        matinh = @matinh,
                        tentinh = @tentinh,
                        maquanhuyen = @maquanhuyen,
                        tenquanhuyen = @tenquanhuyen,
                        maxaphuong = @maxaphuong,
                        tenxaphuong = @tenxaphuong,
                        mabenhvien = @mabenhvien,
                        tenbenhvien = @tenbenhvien,
                        tothon = @tothon,
                        ghichu = @ghichu,
                        updatedAt = @updatedAt,
                        updatedBy = @updatedBy,
                        status_hosoloi = @status_hosoloi,
                        trangthai = @trangthai
              WHERE _id = @_id;

              `);
    const kekhai = req.body;
    res.json(kekhai);
  } catch (error) {
    res.status(500).json(error);
  }
});

// // add ke khai chạy theo bộ
// router.post("/add-kekhai-series", async (req, res) => {
//   let dataKekhai = req.body;
//   let transaction = null;
//   const listSuccess = [];
//   const listFailed = [];

//   try {
//     // bắt đầu kết nối
//     await pool.connect();
//     // Bắt đầu giao dịch
//     transaction = new Transaction(pool);
//     await transaction.begin();

//     // Lấy số hồ sơ lớn nhất hiện tại để tạo số hồ sơ duy nhất
//     const maxSoHoSoResult = await pool
//       .request()
//       .query("SELECT MAX(_id) as max_so_ho_so FROM kekhai");
//     let maxSohoso = maxSoHoSoResult.recordset[0].max_so_ho_so || 0;

//     for (const item of dataKekhai) {
//       // Tạo số hồ sơ mới
//       const newSoHoSo = maxSohoso + 1;
//       const soHoso = `${newSoHoSo}/${item.nvt_masobhxh}/${item.nvt_cccd}`;

//       const result = await transaction
//         .request()
//         .input("sohoso", soHoso)
//         .input("matochuc", item.matochuc)
//         .input("tentochuc", item.tentochuc)
//         .input("madaily", item.madaily)
//         .input("tendaily", item.tendaily)
//         .input("maloaihinh", item.maloaihinh)
//         .input("tenloaihinh", item.tenloaihinh)
//         .input("hoten", item.hoten)
//         .input("masobhxh", item.masobhxh)
//         .input("cccd", item.cccd)
//         .input("dienthoai", item.dienthoai)
//         .input("maphuongan", item.maphuongan)
//         .input("tenphuongan", item.tenphuongan)
//         .input("ngaysinh", item.ngaysinh)
//         .input("gioitinh", item.gioitinh)
//         .input("nguoithu", item.nguoithu)
//         .input("tienluongcs", item.tienluongcs)
//         .input("sotien", item.sotien)
//         .input("tylengansachdiaphuong", item.tylengansachdiaphuong)
//         .input("hotrokhac", item.hotrokhac)
//         .input("tungay", item.tungay)
//         .input("tyledong", item.tyledong)
//         .input("muctiendong", item.muctiendong)
//         .input("maphuongthucdong", item.maphuongthucdong)
//         .input("tenphuongthucdong", item.tenphuongthucdong)
//         .input("tuthang", item.tuthang)
//         .input("tientunguyendong", item.tientunguyendong)
//         .input("tienlai", item.tienlai)
//         .input("madoituong", item.madoituong)
//         .input("tendoituong", item.tendoituong)
//         .input("tylensnnht", item.tylensnnht)
//         .input("tiennsnnht", item.tiennsnnht)
//         .input("tylensdp", item.tylensdp)
//         .input("tiennsdp", item.tiennsdp)
//         .input("matinh", item.matinh)
//         .input("tentinh", item.tentinh)
//         .input("maquanhuyen", item.maquanhuyen)
//         .input("tenquanhuyen", item.tenquanhuyen)
//         .input("maxaphuong", item.maxaphuong)
//         .input("tenxaphuong", item.tenxaphuong)
//         .input("benhvientinh", item.benhvientinh)
//         .input("mabenhvien", item.mabenhvien)
//         .input("tenbenhvien", item.tenbenhvien)
//         .input("tothon", item.tothon)
//         .input("ghichu", item.ghichu)
//         .input("createdAt", item.createdAt)
//         .input("createdBy", item.createdBy)
//         .input("updatedAt", item.updatedAt)
//         .input("updatedBy", item.updatedBy)
//         .input("dotkekhai", newSoHoSo)
//         .input("kykekhai", item.kykekhai)
//         .input("ngaykekhai", item.ngaykekhai)
//         .input("ngaybienlai", item.ngaybienlai)
//         .input("sobienlai", item.sobienlai)
//         .input("trangthai", item.trangthai).query(`
//                   INSERT INTO kekhai (sohoso, matochuc, tentochuc, madaily, tendaily, maloaihinh, tenloaihinh, hoten, masobhxh, cccd, dienthoai,
//                     maphuongan, tenphuongan, ngaysinh, gioitinh, nguoithu, tienluongcs, sotien,
//                     tylengansachdiaphuong, hotrokhac, tungay, tyledong, muctiendong,
//                     maphuongthucdong, tenphuongthucdong, tuthang, tientunguyendong, tienlai, madoituong,
//                     tendoituong, tylensnnht, tiennsnnht, tylensdp, tiennsdp, matinh, tentinh, maquanhuyen, tenquanhuyen,
//                     maxaphuong, tenxaphuong, benhvientinh, mabenhvien, tenbenhvien, tothon, ghichu,
//                     createdAt, createdBy, updatedAt, updatedBy, dotkekhai, kykekhai, ngaykekhai, ngaybienlai, sobienlai, trangthai)
//                   VALUES (@sohoso, @matochuc, @tentochuc, @madaily, @tendaily, @maloaihinh, @tenloaihinh, @hoten, @masobhxh, @cccd, @dienthoai,
//                     @maphuongan, @tenphuongan, @ngaysinh, @gioitinh, @nguoithu, @tienluongcs, @sotien,
//                     @tylengansachdiaphuong, @hotrokhac, @tungay, @tyledong, @muctiendong,
//                     @maphuongthucdong, @tenphuongthucdong, @tuthang, @tientunguyendong, @tienlai, @madoituong,
//                     @tendoituong, @tylensnnht, @tiennsnnht, @tylensdp, @tiennsdp, @matinh, @tentinh, @maquanhuyen, @tenquanhuyen,
//                     @maxaphuong, @tenxaphuong, @benhvientinh, @mabenhvien, @tenbenhvien, @tothon, @ghichu,
//                     @createdAt, @createdBy, @updatedAt, @updatedBy, @dotkekhai, @kykekhai, @ngaykekhai, @ngaybienlai, @sobienlai, @trangthai);
//               `);

//       // Lưu thông tin cần thiết vào danh sách
//       listSuccess.push({
//         sohoso: soHoso,
//         dotkekhai: newSoHoSo,
//         kykekhai: item.kykekhai,
//         ngaykekhai: item.ngaykekhai,
//         trangthai: item.trangthai,
//         hoten: item.hoten,
//         masobhxh: item.masobhxh,
//         cccd: item.cccd,
//         dienthoai: item.dienthoai,
//       });
//     }

//     // Nếu thành công, hoàn thành giao dịch
//     await transaction.commit();
//     res.json({
//       success: true,
//       message: "Data inserted successfully",
//       data: listSuccess,
//     });
//   } catch (error) {
//     // Nếu có lỗi, hoàn tác giao dịch
//     if (transaction) {
//       await transaction.rollback();
//     }

//     res.status(500).json({
//       status: "error",
//       error: error.message,
//     });
//   } finally {
//     if (pool.connected) {
//       await pool.close(); // Đóng kết nối
//     }
//   }
// });

// add ke khai chạy theo bộ
router.post("/add-kekhai-series", async (req, res) => {
  // console.log(req.body);

  let dataKekhai = req.body;
  let transaction = null;
  const listSuccess = [];
  const listFailed = [];
  // console.log(dataKekhai.ngaybienlai);

  try {
    // bắt đầu kết nối
    await pool.connect();

    const currentYear = new Date().getFullYear();
    // Lấy max số biên lai hiện tại cho năm tài chính
    const resultBienlai = await pool.request().input("namtaichinh", currentYear)
      .query(`SELECT MAX(sobienlai) AS max
        FROM bienlai
        WHERE namtaichinh = @namtaichinh;`);

    let maxInvoiceStr = resultBienlai.recordset[0].max || "0000000";
    let maxInvoiceNum = parseInt(maxInvoiceStr, 10);
    // console.log("Max Invoice Number:", maxInvoiceNum);

    // Lấy số hồ sơ lớn nhất hiện tại để tạo số hồ sơ duy nhất
    const maxSoHoSoResult = await pool
      .request()
      .query("SELECT MAX(_id) as max_so_ho_so FROM kekhai");
    let maxSohoso = maxSoHoSoResult.recordset[0].max_so_ho_so || 0;

    for (const item of dataKekhai) {
      // Tạo số hồ sơ mới
      const newSoHoSo = maxSohoso + 1;
      const soHoso = `${newSoHoSo}/${item.nvt_masobhxh}/${item.nvt_cccd}`;

      // tạo biên lai
      // Tăng số biên lai mỗi vòng lặp
      maxInvoiceNum += 1;
      const nextInvoice = String(maxInvoiceNum).padStart(7, "0");
      // console.log("Next Invoice Number:", nextInvoice);

      try {
        // Bắt đầu giao dịch
        transaction = new Transaction(pool);
        await transaction.begin();
        await transaction
          .request()
          .input("sohoso", soHoso)
          .input("matochuc", item.matochuc)
          .input("tentochuc", item.tentochuc)
          .input("madaily", item.madaily)
          .input("tendaily", item.tendaily)
          .input("maloaihinh", item.maloaihinh)
          .input("tenloaihinh", item.tenloaihinh)
          .input("hoten", item.hoten)
          .input("masobhxh", item.masobhxh)
          .input("cccd", item.cccd)
          .input("dienthoai", item.dienthoai)
          .input("maphuongan", item.maphuongan)
          .input("tenphuongan", item.tenphuongan)
          .input("ngaysinh", item.ngaysinh)
          .input("gioitinh", item.gioitinh)
          .input("nguoithu", item.nguoithu)
          .input("manguoithu", item.manguoithu)
          .input("tienluongcs", item.tienluongcs)
          .input("sotien", item.sotien)
          .input("tylengansachdiaphuong", item.tylengansachdiaphuong)
          .input("hotrokhac", item.hotrokhac)
          .input("tungay", item.tungay)
          .input("denngay", item.denngay)
          .input("tyledong", item.tyledong)
          .input("muctiendong", item.muctiendong)
          .input("sothang", item.sothang)
          .input("maphuongthucdong", item.maphuongthucdong)
          .input("tenphuongthucdong", item.tenphuongthucdong)
          .input("tuthang", item.tuthang)
          .input("denthang", item.denthang)
          .input("tientunguyendong", item.tientunguyendong)
          .input("tienlai", item.tienlai)
          .input("madoituong", item.madoituong)
          .input("tendoituong", item.tendoituong)
          .input("tylensnnht", item.tylensnnht)
          .input("tiennsnnht", item.tiennsnnht)
          .input("tylensdp", item.tylensdp)
          .input("tiennsdp", item.tiennsdp)
          .input("matinh", item.matinh)
          .input("tentinh", item.tentinh)
          .input("maquanhuyen", item.maquanhuyen)
          .input("tenquanhuyen", item.tenquanhuyen)
          .input("maxaphuong", item.maxaphuong)
          .input("tenxaphuong", item.tenxaphuong)
          .input("benhvientinh", item.benhvientinh)
          .input("mabenhvien", item.mabenhvien)
          .input("tenbenhvien", item.tenbenhvien)
          .input("tothon", item.tothon)
          .input("ghichu", item.ghichu)
          .input("createdAt", item.createdAt)
          .input("createdBy", item.createdBy)
          .input("updatedAt", item.updatedAt)
          .input("updatedBy", item.updatedBy)
          .input("dotkekhai", newSoHoSo)
          .input("kykekhai", item.kykekhai)
          .input("ngaykekhai", item.ngaykekhai)
          .input("ngaybienlai", item.ngaybienlai)
          .input("sobienlai", nextInvoice)
          .input("trangthai", item.trangthai)
          .input("status_hosoloi", item.status_hosoloi)
          .input("status_naptien", item.status_naptien)
          .input("hosoIdentity", item.hosoIdentity)
          .input("tennguoitao", item.tennguoitao)
          .input("hinhthucnap", item.hinhthucnap)
          .input("maxaphuong_new", item.maxaphuong_new)
          .input("tenxaphuong_new", item.tenxaphuong_new).query(`
                  INSERT INTO kekhai (sohoso, matochuc, tentochuc, madaily, tendaily, maloaihinh, tenloaihinh, hoten, masobhxh, cccd, dienthoai,	
                    maphuongan, tenphuongan, ngaysinh, gioitinh, nguoithu, manguoithu, tienluongcs, sotien,	
                    tylengansachdiaphuong, hotrokhac, tungay, denngay, tyledong, muctiendong, sothang,
                    maphuongthucdong, tenphuongthucdong, tuthang, denthang, tientunguyendong, tienlai, madoituong,	
                    tendoituong, tylensnnht, tiennsnnht, tylensdp, tiennsdp, matinh, tentinh, maquanhuyen, tenquanhuyen,	
                    maxaphuong, tenxaphuong, benhvientinh, mabenhvien, tenbenhvien, tothon, ghichu,	
                    createdAt, createdBy, updatedAt, updatedBy, dotkekhai, kykekhai, ngaykekhai, ngaybienlai, sobienlai, trangthai, 
                    status_hosoloi, status_naptien, hosoIdentity, tennguoitao, hinhthucnap, maxaphuong_new, tenxaphuong_new) 
                  VALUES (@sohoso, @matochuc, @tentochuc, @madaily, @tendaily, @maloaihinh, @tenloaihinh, @hoten, @masobhxh, @cccd, @dienthoai,	
                    @maphuongan, @tenphuongan, @ngaysinh, @gioitinh, @nguoithu,@manguoithu, @tienluongcs, @sotien,	
                    @tylengansachdiaphuong, @hotrokhac, @tungay, @denngay, @tyledong, @muctiendong,	@sothang,
                    @maphuongthucdong, @tenphuongthucdong, @tuthang, @denthang, @tientunguyendong, @tienlai, @madoituong,	
                    @tendoituong, @tylensnnht, @tiennsnnht, @tylensdp, @tiennsdp, @matinh, @tentinh, @maquanhuyen, @tenquanhuyen,	
                    @maxaphuong, @tenxaphuong, @benhvientinh, @mabenhvien, @tenbenhvien, @tothon, @ghichu,	
                    @createdAt, @createdBy, @updatedAt, @updatedBy, @dotkekhai, @kykekhai, @ngaykekhai, @ngaybienlai, @sobienlai, @trangthai, 
                    @status_hosoloi, @status_naptien, @hosoIdentity, @tennguoitao, @hinhthucnap, @maxaphuong_new, @tenxaphuong_new);
              `);

        // Commit transaction nếu không có lỗi
        await transaction.commit();

        // Lưu thông tin cần thiết vào danh sách
        // Lưu thông tin cần thiết vào danh sách
        listSuccess.push({
          ...item, // Gộp toàn bộ dữ liệu từ item
          sohoso: soHoso, // Thêm trường bổ sung
          dotkekhai: newSoHoSo,
        });
      } catch (err) {
        // Rollback transaction nếu có lỗi
        if (transaction) {
          await transaction.rollback();
        }

        // Thêm dòng vào danh sách lỗi
        listFailed.push({
          item,
          error: err.message,
        });
      }
    }

    // Trả về kết quả
    res.json({
      success: true,
      message: "Quá trình xử lý hoàn tất",
      listSuccess,
      listFailed,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi trong quá trình xử lý",
      error: error.message,
    });
  } finally {
    if (pool.connected) {
      await pool.close(); // Đóng kết nối
    }
  }
});

// đẩy thông tin lên cổng
router.post("/pushinfotoportbhxhvn", async (req, res) => {
  let dataKekhai = req.body;
  // console.log(dataKekhai);

  let transaction = null;
  const listSuccess = [];

  try {
    // bắt đầu kết nối
    await pool.connect();
    // Bắt đầu giao dịch
    transaction = new Transaction(pool);
    await transaction.begin();

    const result = await transaction
      .request()
      .input("maSoBhxh", dataKekhai.maSoBhxh)
      .input("hoTen", dataKekhai.hoTen)
      .input("soCccd", dataKekhai.soCccd)
      .input("ngaySinh", dataKekhai.ngaySinh)
      .input("gioiTinh", dataKekhai.gioiTinh)
      .input("loaiDt", dataKekhai.loaiDt)
      .input("soTien", dataKekhai.soTien)
      .input("soThang", dataKekhai.soThang)
      .input("maToChucDvt", dataKekhai.maToChucDvt)
      .input("tenToChucDvt", dataKekhai.tenToChucDvt)
      .input("maNhanVienThu", dataKekhai.maNhanVienThu)
      .input("tenNhanVienThu", dataKekhai.tenNhanVienThu)
      .input("maCqBhxh", dataKekhai.maCqBhxh)
      .input("tenCqBhxh", dataKekhai.tenCqBhxh)
      .input("keyfrombhvn", dataKekhai.keyfrombhvn)
      .input("tuNgay", dataKekhai.tuNgay)
      .input("denNgay", dataKekhai.denNgay).query(`
                  INSERT INTO thongtin (maSoBhxh, hoTen, soCccd, ngaySinh, gioiTinh, loaiDt, soTien, soThang, maToChucDvt, tenToChucDvt, maNhanVienThu,
                    tenNhanVienThu, maCqBhxh, tenCqBhxh, keyfrombhvn, tuNgay, denNgay)
                  VALUES (@maSoBhxh, @hoTen, @soCccd, @ngaySinh, @gioiTinh, @loaiDt, @soTien, @soThang, @maToChucDvt, @tenToChucDvt, @maNhanVienThu,
                    @tenNhanVienThu, @maCqBhxh, @tenCqBhxh, @keyfrombhvn, @tuNgay, @denNgay);
              `);
    // console.log("jjj");

    // Nếu thành công, hoàn thành giao dịch
    await transaction.commit();
    res.json({
      success: true,
      data: {
        maLoi: "0",
        moTaLoi: "",
        maXacNhan: "POS0000000002",
        noiDung:
          "BHXH Việt Nam xác nhận: Ông Trần Văn A, Số CCCD xx xx. Ngày 31/07/2023 đã đóng 804600 đồng, tương ứng quá trình tham gia BHXH từ ngày 31/07/2023 đến ngày 30/07/2024. Sử dụng MÃ XÁC NHẬN POS0000000002 để tra cứu thông tin chi tiết tại địa chỉ https://baohiemxahoi.gov.vn",
      },
    });
  } catch (error) {
    // Nếu có lỗi, hoàn tác giao dịch
    if (transaction) {
      await transaction.rollback();
    }

    res.status(500).json({
      status: "error",
      error: error.message,
    });
  } finally {
    if (pool.connected) {
      await pool.close(); // Đóng kết nối
    }
  }
});

// router.post("/pushinfotoportbhxhvn", async (req, res) => {
//   const dataKekhai = req.body;

//   try {
//     // Bắt đầu kết nối
//     await pool.connect();

//     // Thực hiện truy vấn ghi dữ liệu không dùng transaction
//     await pool
//       .request()
//       .input("maSoBhxh", dataKekhai.maSoBhxh)
//       .input("hoTen", dataKekhai.hoTen)
//       .input("soCccd", dataKekhai.soCccd)
//       .input("ngaySinh", dataKekhai.ngaySinh)
//       .input("gioiTinh", dataKekhai.gioiTinh)
//       .input("loaiDt", dataKekhai.loaiDt)
//       .input("soTien", dataKekhai.soTien)
//       .input("soThang", dataKekhai.soThang)
//       .input("maToChucDvt", dataKekhai.maToChucDvt)
//       .input("tenToChucDvt", dataKekhai.tenToChucDvt)
//       .input("maNhanVienThu", dataKekhai.maNhanVienThu)
//       .input("tenNhanVienThu", dataKekhai.tenNhanVienThu)
//       .input("maCqBhxh", dataKekhai.maCqBhxh)
//       .input("tenCqBhxh", dataKekhai.tenCqBhxh)
//       .input("keyfrombhvn", dataKekhai.keyfrombhvn)
//       .input("tuNgay", dataKekhai.tuNgay)
//       .input("denNgay", dataKekhai.denNgay).query(`
//         INSERT INTO thongtin (
//           maSoBhxh, hoTen, soCccd, ngaySinh, gioiTinh, loaiDt, soTien, soThang,
//           maToChucDvt, tenToChucDvt, maNhanVienThu, tenNhanVienThu,
//           maCqBhxh, tenCqBhxh, keyfrombhvn, tuNgay, denNgay
//         ) VALUES (
//           @maSoBhxh, @hoTen, @soCccd, @ngaySinh, @gioiTinh, @loaiDt, @soTien, @soThang,
//           @maToChucDvt, @tenToChucDvt, @maNhanVienThu, @tenNhanVienThu,
//           @maCqBhxh, @tenCqBhxh, @keyfrombhvn, @tuNgay, @denNgay
//         );
//       `);

//     res.json({
//       success: true,
//       data: {
//         maLoi: "0",
//         moTaLoi: "",
//         maXacNhan: "POS0000000002",
//         noiDung:
//           "BHXH Việt Nam xác nhận: Ông Trần Văn A, Số CCCD xx xx. Ngày 31/07/2023 đã đóng 804600 đồng, tương ứng quá trình tham gia BHXH từ ngày 31/07/2023 đến ngày 30/07/2024. Sử dụng MÃ XÁC NHẬN POS0000000002 để tra cứu thông tin chi tiết tại địa chỉ https://baohiemxahoi.gov.vn",
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "error",
//       error: error.message,
//     });
//   } finally {
//     if (pool.connected) {
//       await pool.close();
//     }
//   }
// });

router.post("/saveresponsefrombhvntodb", async (req, res) => {
  let dataKekhai = req.body;
  // console.log(dataKekhai);

  let transaction = null;

  try {
    // bắt đầu kết nối
    await pool.connect();
    // Bắt đầu giao dịch
    transaction = new Transaction(pool);
    await transaction.begin();

    const result = await transaction
      .request()
      .input("maSoBhxh", dataKekhai.maSoBhxh)
      .input("hoTen", dataKekhai.hoTen)
      .input("soCccd", dataKekhai.soCccd)
      .input("ngaySinh", dataKekhai.ngaySinh)
      .input("gioiTinh", dataKekhai.gioiTinh)
      .input("loaiDt", dataKekhai.loaiDt)
      .input("soTien", dataKekhai.soTien)
      .input("soThang", dataKekhai.soThang)
      .input("maToChucDvt", dataKekhai.maToChucDvt)
      .input("tenToChucDvt", dataKekhai.tenToChucDvt)
      .input("maNhanVienThu", dataKekhai.maNhanVienThu)
      .input("tenNhanVienThu", dataKekhai.tenNhanVienThu)
      .input("maCqBhxh", dataKekhai.maCqBhxh)
      .input("tenCqBhxh", dataKekhai.tenCqBhxh)
      .input("keyfrombhvn", dataKekhai.keyfrombhvn)
      .input("tuNgay", dataKekhai.tuNgay)
      .input("denNgay", dataKekhai.denNgay)
      .input("maLoi", dataKekhai.maLoi)
      .input("moTaLoi", dataKekhai.moTaLoi)
      .input("maXacNhan", dataKekhai.maXacNhan)
      .input("noiDung", dataKekhai.noiDung)
      .input("soHoSo", dataKekhai.soHoSo)
      .input("dotKeKhai", dataKekhai.dotKeKhai)
      .input("kyKeKhai", dataKekhai.kyKeKhai)
      .input("ngayKeKhai", dataKekhai.ngayKeKhai)
      .input("createdBy", dataKekhai.createdBy)
      .input("hosoIdentity", dataKekhai.hosoIdentity).query(`
                  INSERT INTO res_bhvn_info (maSoBhxh, hoTen, soCccd, ngaySinh, gioiTinh, loaiDt, soTien, soThang, maToChucDvt, tenToChucDvt, maNhanVienThu,
                    tenNhanVienThu, maCqBhxh, tenCqBhxh, keyfrombhvn, tuNgay, denNgay, maLoi, moTaLoi, maXacNhan, noiDung,
                    soHoSo, dotKeKhai, kyKeKhai, ngayKeKhai, createdBy, hosoIdentity)
                  VALUES (@maSoBhxh, @hoTen, @soCccd, @ngaySinh, @gioiTinh, @loaiDt, @soTien, @soThang, @maToChucDvt, @tenToChucDvt, @maNhanVienThu,
                    @tenNhanVienThu, @maCqBhxh, @tenCqBhxh, @keyfrombhvn, @tuNgay, @denNgay, @maLoi, @moTaLoi, @maXacNhan, @noiDung,
                    @soHoSo, @dotKeKhai, @kyKeKhai, @ngayKeKhai, @createdBy, @hosoIdentity);
              `);

    // Nếu thành công, hoàn thành giao dịch
    await transaction.commit();
    res.json({
      success: true,
      datares: {
        maLoi: dataKekhai.maLoi,
        moTaLoi: dataKekhai.moTaLoi,
        maXacNhan: dataKekhai.maXacNhan,
      },
    });
  } catch (error) {
    // Nếu có lỗi, hoàn tác giao dịch
    if (transaction) {
      await transaction.rollback();
    }

    res.status(500).json({
      status: "error",
      error: error.message,
    });
  } finally {
    if (pool.connected) {
      await pool.close(); // Đóng kết nối
    }
  }
});

router.post("/ghidulieubienlai", async (req, res) => {
  let dulieubienlai = req.body;
  // console.log(req.body.hoTen);

  let transaction = null;

  try {
    // bắt đầu kết nối
    await pool.connect();
    // Bắt đầu giao dịch
    transaction = new Transaction(pool);
    await transaction.begin();

    const result = await transaction
      .request()
      .input("_id_hskk", dulieubienlai._id_hskk)
      .input("sobienlai", dulieubienlai.sobienlai)
      .input("ngaybienlai", dulieubienlai.ngaybienlai)
      .input("hoten", dulieubienlai.hoTen)
      .input("masobhxh", dulieubienlai.maSoBhxh)
      .input("ngaysinh", dulieubienlai.ngaySinh)
      .input("gioitinh", dulieubienlai.gioiTinh)
      .input("cccd", dulieubienlai.soCccd)
      .input("sodienthoai", dulieubienlai.soDienThoai)
      .input("nguoithutien", dulieubienlai.nguoithutien)
      .input("loaihinh", dulieubienlai.maloaihinh)
      .input("sothang", dulieubienlai.soThang)
      .input("tungay", dulieubienlai.tuNgay)
      .input("denngay", dulieubienlai.denNgay)
      .input("tuthang", dulieubienlai.tuThang)
      .input("denthang", dulieubienlai.denThang)
      .input("sotien", dulieubienlai.soTien)
      .input("madaily", dulieubienlai.maDaiLy)
      .input("tendaily", dulieubienlai.tenDaiLy)
      .input("hosoIdentity", dulieubienlai.hosoIdentity)
      .input("maxacnhan", dulieubienlai.maXacNhan)
      .input("tothon", dulieubienlai.tothon)
      .input("tenquanhuyen", dulieubienlai.tenquanhuyen)
      .input("tentinh", dulieubienlai.tentinh)
      .input("active", 3)
      .input("urlNameInvoice", dulieubienlai.urlNameInvoice)
      .input("cccd_nguoithutien", dulieubienlai.cccd_nguoithutien).query(`
                  INSERT INTO bienlaidientu (_id_hskk, sobienlai, ngaybienlai, hoten, masobhxh, ngaysinh, gioitinh, cccd, sodienthoai, nguoithutien, loaihinh, sothang,
                    tungay, denngay, tuthang, denthang, sotien, madaily, tendaily, hosoIdentity, maxacnhan, tothon, tenquanhuyen, tentinh, active, urlNameInvoice, cccd_nguoithutien)
                  VALUES (@_id_hskk, @sobienlai, @ngaybienlai, @hoten, @masobhxh, @ngaysinh, @gioitinh, @cccd, @sodienthoai, @nguoithutien, @loaihinh, @sothang,
                    @tungay, @denngay, @tuthang, @denthang, @sotien, @madaily, @tendaily, @hosoIdentity, @maxacnhan, @tothon, @tenquanhuyen, @tentinh, @active, @urlNameInvoice, @cccd_nguoithutien);
              `);

    // cập nhật số biên lai
    await transaction
      .request()
      .input("sobienlai", dulieubienlai.sobienlai)
      .input("ngaykhoitao", dulieubienlai.ngaybienlai)
      .input("namtaichinh", dulieubienlai.currentYear)
      .input("ghichu", dulieubienlai.maSoBhxh)
      .input("active", 3)
      .input("hosoIdentity", dulieubienlai.hosoIdentity).query(`
          INSERT INTO bienlai (sobienlai, ngaykhoitao, namtaichinh, ghichu, active, hosoIdentity) 
          VALUES (@sobienlai, @ngaykhoitao, @namtaichinh, @ghichu, @active, @hosoIdentity)
        `);

    // Nếu thành công, hoàn thành giao dịch
    await transaction.commit();
    res.json({
      success: true,
    });
  } catch (error) {
    // Nếu có lỗi, hoàn tác giao dịch
    if (transaction) {
      await transaction.rollback();
    }

    res.status(500).json({
      status: "error",
      error: error.message,
    });
  } finally {
    if (pool.connected) {
      await pool.close(); // Đóng kết nối
    }
  }
});

router.post("/find-bienlaidientu-huybienlai", async (req, res) => {
  // console.log(req.body);

  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("hosoIdentity", req.body.hosoIdentity)
      .query(`select * from bienlaidientu where hosoIdentity = @hosoIdentity`);
    const hs = result.recordset[0];
    res.json({
      success: true,
      hs,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// xác nhận phê duyệt hồ sơ
router.post("/apply-invoice-status", async (req, res) => {
  const { _id, hoten, masobhxh, hosoIdentity, nguoipheduyet, ngaypheduyet } =
    req.body;

  let transaction = null;

  try {
    await pool.connect();

    transaction = new Transaction(pool);
    await transaction.begin();

    // Câu 1: cập nhật bảng kekhai
    const request1 = transaction.request();
    await request1
      .input("_id", _id)
      .input("nguoipheduyet", nguoipheduyet)
      .input("ngaypheduyet", ngaypheduyet)
      .query(
        `UPDATE kekhai SET status_naptien=1, nguoipheduyet=@nguoipheduyet, ngaypheduyet=@ngaypheduyet WHERE _id=@_id`
      );

    // Câu 2: cập nhật bảng bienlaidientu
    const request2 = transaction.request();
    await request2
      .input("hosoIdentity", hosoIdentity)
      .query(
        `UPDATE bienlaidientu SET active=1 WHERE hosoIdentity=@hosoIdentity`
      );

    // Câu 3: cập nhật bảng bienlai
    const request3 = transaction.request();
    await request3
      .input("hosoIdentity", hosoIdentity)
      .query(`UPDATE bienlai SET active=1 WHERE hosoIdentity=@hosoIdentity`);

    await transaction.commit();

    res.json({
      success: true,
      message: `Cập nhật thành công cho _id: ${_id}`,
      data: {
        _id,
        hoten,
        masobhxh,
      },
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({
      success: false,
      message: `Thất bại cập nhật _id: ${_id}`,
      error: error.message,
      data: {
        _id,
        hoten,
        masobhxh,
      },
    });
  } finally {
    if (pool.connected) await pool.close();
  }
});

// xác nhận huỷ duyệt hồ sơ
router.post("/cancel-invoice-status", async (req, res) => {
  // console.log(req.body);

  const {
    _id,
    hoten,
    masobhxh,
    nguoipheduyet,
    ngaypheduyet,
    hosoIdentity,
    lydohuy,
    ngayhuybienlai,
    nguoihuybienlai,
  } = req.body;

  let transaction = null;

  try {
    await pool.connect();

    transaction = new Transaction(pool);
    await transaction.begin();

    // Câu 1: cập nhật bảng kekhai
    const request = transaction.request();
    await request
      .input("_id", _id)
      .input("lydohuy", lydohuy)
      .input("nguoipheduyet", nguoipheduyet)
      .input("ngaypheduyet", ngaypheduyet)
      .query(
        `UPDATE kekhai SET trangthai=1, lydohuy=@lydohuy, nguoipheduyet=@nguoipheduyet, ngaypheduyet=@ngaypheduyet WHERE _id=@_id`
      );

    // Câu 2: cập nhật bảng bienlaidientu
    const request2 = transaction.request();
    await request2
      .input("hosoIdentity", hosoIdentity)
      .input("lydohuy", lydohuy)
      .input("ngayhuybienlai", ngayhuybienlai)
      .input("nguoihuybienlai", nguoihuybienlai)
      .query(
        `UPDATE bienlaidientu SET active=0, lydohuy=@lydohuy, ngayhuybienlai=@ngayhuybienlai, 
            nguoihuybienlai=@nguoihuybienlai
          WHERE hosoIdentity=@hosoIdentity`
      );

    // Câu 3: cập nhật bảng bienlai
    const request3 = transaction.request();
    await request3
      .input("hosoIdentity", hosoIdentity)
      .input("lydohuy", lydohuy)
      .input("ngayhuybienlai", ngayhuybienlai)
      .input("nguoihuybienlai", nguoihuybienlai)
      .query(
        `UPDATE bienlai SET active=0, lydohuy=@lydohuy, ngayhuybienlai=@ngayhuybienlai, 
            nguoihuybienlai=@nguoihuybienlai
          WHERE hosoIdentity=@hosoIdentity`
      );

    console.log("check trước");
    await transaction.commit();
    console.log("check sau");

    res.json({
      success: true,
      message: `Cập nhật thành công cho _id: ${_id}`,
      data: {
        _id,
        hoten,
        masobhxh,
        lydohuy,
      },
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({
      success: false,
      message: `Thất bại cập nhật _id: ${_id}`,
      error: error.message,
      data: {
        _id,
        hoten,
        masobhxh,
      },
    });
  } finally {
    if (pool.connected) await pool.close();
  }
});

// reset hồ sơ từ đã huỷ duyệt sang chưa phê duyệt
router.post("/reset-hoso-from-dahuy-to-chuaduyet", async (req, res) => {
  // console.log(req.body);
  const { _id, hoten, masobhxh, hosoIdentity } = req.body;
  let transaction = null;
  try {
    await pool.connect();

    transaction = new Transaction(pool);
    await transaction.begin();

    const request = transaction.request();
    await request
      .input("_id", _id)
      .query(`UPDATE kekhai SET trangthai=0 where _id=@_id`);

    // Câu 2: cập nhật bảng bienlaidientu
    const request2 = transaction.request();
    await request2.input("hosoIdentity", hosoIdentity).query(
      `UPDATE bienlaidientu SET active=3, lydohuy='', ngayhuybienlai='', 
            nguoihuybienlai=''
          WHERE hosoIdentity=@hosoIdentity`
    );

    // Câu 3: cập nhật bảng bienlai
    const request3 = transaction.request();
    await request3.input("hosoIdentity", hosoIdentity).query(
      `UPDATE bienlai SET active=3, lydohuy='', ngayhuybienlai='', 
            nguoihuybienlai=''
          WHERE hosoIdentity=@hosoIdentity`
    );

    await transaction.commit();

    res.json({
      success: true,
      message: `Cập nhật thành công cho _id: ${_id}`,
      data: {
        _id,
        hoten,
        masobhxh,
      },
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({
      success: false,
      message: `Thất bại cập nhật _id: ${_id}`,
      error: error.message,
      data: {
        _id,
        hoten,
        masobhxh,
      },
    });
  } finally {
    if (pool.connected) await pool.close();
  }
});

// xác nhận reset hồ sơ từ đã phê duyệt sang chưa phê duyệt
router.post("/reset-hoso-from-daduyet-to-chuaduyet", async (req, res) => {
  const { _id, hoten, masobhxh, hosoIdentity } = req.body;

  let transaction = null;

  try {
    await pool.connect();

    transaction = new Transaction(pool);
    await transaction.begin();

    // Câu 1: cập nhật bảng kekhai
    const request1 = transaction.request();
    await request1
      .input("_id", _id)
      .query(`UPDATE kekhai SET status_naptien=0 WHERE _id=@_id`);

    // Câu 2: cập nhật bảng bienlaidientu
    const request2 = transaction.request();
    await request2
      .input("hosoIdentity", hosoIdentity)
      .query(
        `UPDATE bienlaidientu SET active=3 WHERE hosoIdentity=@hosoIdentity`
      );

    // Câu 3: cập nhật bảng bienlai
    const request3 = transaction.request();
    await request3
      .input("hosoIdentity", hosoIdentity)
      .query(`UPDATE bienlai SET active=3 WHERE hosoIdentity=@hosoIdentity`);

    await transaction.commit();

    res.json({
      success: true,
      message: `Cập nhật thành công cho _id: ${_id}`,
      data: {
        _id,
        hoten,
        masobhxh,
      },
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({
      success: false,
      message: `Thất bại cập nhật _id: ${_id}`,
      error: error.message,
      data: {
        _id,
        hoten,
        masobhxh,
      },
    });
  } finally {
    if (pool.connected) await pool.close();
  }
});

// danh sách kê khai all
router.get("/all-ds-kekhai", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(`SELECT * FROM kekhai_2902141757`);
    const kekhai = result.recordset;
    res.json(kekhai);
  } catch (error) {
    res.status(500).json(error);
  }
});

// đổi trạng thái hồ sơ
router.post("/updatestatushoso", async (req, res) => {
  // console.log(req.body);

  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("_id", req.body._id)
      .input("maxacnhan", req.body.maXacNhan)
      .input("motaloi", req.body.moTaLoi)
      .query(
        `UPDATE kekhai SET trangthai=0, maxacnhan=@maxacnhan, motaloi=@motaloi where _id=@_id`
      );
    const kekhai = result.recordset;
    res.json(kekhai);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.patch("/capnhatkekhai", async (req, res) => {
  // console.log(req.body);

  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("_id", req.body._id)
      .query(`select * from kekhai where _id=@_id`);
    let hoso = result.recordset[0];
    console.log(hoso);

    if (hoso) {
      await pool
        .request()
        .input("_id", _id)
        .input("trangthai", "0")
        .input("maxacnhan", req.body.maXacNhan)
        .input("motaloi", req.body.moTaLoi)
        .query(
          `UPDATE kekhai SET 
                  trangthai = @trangthai, 
                  maxacnhan = @maxacnhan, 
                  motaloi = @motaloi
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

// all danh sách kê khai with loại hình
router.get("/getalldskkwithmalh", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("maloaihinh", req.query.maloaihinh)
      .query(`SELECT * FROM kekhai where maloaihinh=@maloaihinh`);
    const kekhai = result.recordset;
    res.json(kekhai);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/bienlaidientu", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("_id_hskk", req.query._id_hskk)
      .input("hosoIdentity", req.query.hosoIdentity)
      .query(
        `SELECT * FROM bienlaidientu where _id_hskk=@_id_hskk and hosoIdentity=@hosoIdentity`
      );
    const bieblai = result.recordset;
    res.json(bieblai);
  } catch (error) {
    res.status(500).json(error);
  }
});

// all danh sách kê khai with loại hình with madaily
router.get("/getalldskkwithmalh", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("maloaihinh", req.query.maloaihinh)
      .input("madaily", req.query.madaily)
      .query(
        `SELECT * FROM kekhai where maloaihinh=@maloaihinh and madaily=@madaily`
      );
    const kekhai = result.recordset;
    res.json(kekhai);
  } catch (error) {
    res.status(500).json(error);
  }
});

// all danh sách kê khai with loại hình with madaily
router.get("/danhmucdaily", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool.request().query(`SELECT * FROM dm_diemthu`);
    const daily = result.recordset;
    res.json(daily);
  } catch (error) {
    res.status(500).json(error);
  }
});

// lấy ds kê khai dự vào identity của hồ sơ
router.post("/getdskekhaiwithhsidentity", async (req, res) => {
  try {
    await pool.connect();

    const dshsidentity = req.body.map((id) => `'${id}'`).join(", ");
    // console.log("Chuỗi IN:", dshsidentity);

    const query = `SELECT * FROM kekhai WHERE hosoIdentity IN (${dshsidentity})`;

    const result = await pool.request().query(query);

    res.json(result.recordset);
  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).json({ message: "Lỗi truy vấn", error });
  }
});

// all danh sách kê khai with loại hình with madaily
router.get("/getallkekhaiwithuser", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("maloaihinh", req.query.maloaihinh)
      .input("madaily", req.query.madaily)
      .query(
        `SELECT * FROM kekhai where madaily=@madaily and maloaihinh=@maloaihinh`
      );
    const kekhai = result.recordset;
    res.json(kekhai);
  } catch (error) {
    res.status(500).json(error);
  }
});

// tìm hồ sơ theo từ ngày đến ngày - đối với ar và bi
router.get("/hskekhaifromtotungay", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("maloaihinh", req.query.maloaihinh)
      .input("madaily", req.query.madaily)
      .input("tungay", req.query.tungay)
      .input("denngay", req.query.denngay)
      .query(
        `select * from kekhai where maloaihinh=@maloaihinh and madaily=@madaily and tungay between @tungay and @denngay`
      );
    const kekhai = result.recordset;
    res.json(kekhai);
  } catch (error) {
    res.status(500).json(error);
  }
});

// truy van tim lich su ke khai theo bo ho so
// tim theo ky ke khai
router.get("/kykekhai-search-series", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("kykekhai", req.query.kykekhai)
      .query(
        `SELECT sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, trangthai, maloaihinh, tenloaihinh, COUNT(*) AS so_luong
        FROM kekhai where kykekhai=@kykekhai
        GROUP BY sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, trangthai, maloaihinh, tenloaihinh`
      );
    const kekhai = result.recordset;
    res.json({
      success: true,
      kekhai,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// cho điểm thu & nhân viên công ty nhưng tài khoản điểm thu
// router.get("/kykekhai-search-series-pagi", async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1; // Chuyển đổi page thành số nguyên
//     const limit = parseInt(req.query.limit, 10) || 10;
//     const offset = (page - 1) * limit;

//     const kykekhai = req.query.kykekhai;
//     const madaily = req.query.madaily;
//     const sohoso = req.query.sohoso;
//     const dotkekhai = req.query.dotkekhai;
//     const ngaykekhai = req.query.ngaykekhai;
//     const ngaykekhaiden = req.query.ngaykekhaiden;
//     const maloaihinh = req.query.maloaihinh;

//     // Chuyển đổi ngày người dùng nhập vào sang định dạng DD-MM-YYYY
//     const [year, month, day] = ngaykekhai.split("-");
//     let ngaykekhaiInput = day + "-" + month + "-" + year;
//     const [yeard, monthd, dayd] = ngaykekhaiden.split("-");
//     let ngaykekhaidenInput = dayd + "-" + monthd + "-" + yeard;

//     let queryFirst = `SELECT tendaily, sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, trangthai, maloaihinh, tenloaihinh, COUNT(*) AS so_luong
//         FROM kekhai where madaily=@madaily
//         `;
//     let queryPlus = `GROUP BY tendaily, sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, trangthai, maloaihinh, tenloaihinh
//         ORDER BY cast(dotkekhai as int) desc OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

//     let queryCountFirst = `with t as (
//           SELECT sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, trangthai, maloaihinh, tenloaihinh, COUNT(*) AS so_luong
//           FROM kekhai where madaily=@madaily
//           `;

//     let queryCountPlus = `GROUP BY sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, trangthai, maloaihinh, tenloaihinh
//           )
//           SELECT COUNT(*) AS totalCount FROM t`;

//     if (req.query.kykekhai) {
//       queryFirst += ` and kykekhai=@kykekhai`;
//       queryCountFirst += ` and kykekhai=@kykekhai`;
//     }

//     if (req.query.sohoso) {
//       queryFirst += ` and sohoso=@sohoso`;
//       queryCountFirst += ` and sohoso=@sohoso`;
//     }

//     if (req.query.dotkekhai) {
//       queryFirst += ` and dotkekhai=@dotkekhai`;
//       queryCountFirst += ` and dotkekhai=@dotkekhai`;
//     }

//     if (req.query.ngaykekhai && !req.query.ngaykekhaiden) {
//       queryFirst += " AND CONVERT(VARCHAR(10), ngaykekhai, 105) = @ngaykekhai";
//       queryCountFirst +=
//         " AND CONVERT(VARCHAR(10), ngaykekhai, 105) = @ngaykekhai";
//     }
//     if (req.query.ngaykekhai && req.query.ngaykekhaiden) {
//       queryFirst +=
//         " AND CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN @ngaykekhai and @ngaykekhaiden";
//       queryCountFirst +=
//         " AND CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN @ngaykekhai and @ngaykekhaiden";
//     }
//     if (maloaihinh) {
//       queryFirst += " AND maloaihinh = @maloaihinh";
//       queryCountFirst += " AND maloaihinh = @maloaihinh";
//     }

//     const query = queryFirst + " " + queryPlus;
//     const queryCount = queryCountFirst + " " + queryCountPlus;

//     await pool.connect();

//     const result = await pool
//       .request()
//       .input("kykekhai", kykekhai)
//       .input("madaily", madaily)
//       .input("sohoso", sohoso)
//       .input("dotkekhai", dotkekhai)
//       .input("maloaihinh", maloaihinh)
//       .input("ngaykekhai", ngaykekhaiInput)
//       .input("ngaykekhaiden", ngaykekhaidenInput)
//       .input("offset", offset)
//       .input("limit", limit)
//       .query(query);

//     const data = result.recordset;

//     // Đếm tổng số lượng bản ghi
//     const countResult = await pool
//       .request()
//       .input("kykekhai", kykekhai)
//       .input("madaily", madaily)
//       .input("sohoso", sohoso)
//       .input("dotkekhai", dotkekhai)
//       .input("maloaihinh", maloaihinh)
//       .input("ngaykekhai", ngaykekhaiInput)
//       .input("ngaykekhaiden", ngaykekhaidenInput)
//       .query(queryCount);
//     const totalCount = countResult.recordset[0].totalCount;

//     const totalPages = Math.ceil(totalCount / limit);

//     const info = {
//       count: totalCount,
//       pages: totalPages,
//       next: page < totalPages ? `${req.path}?page=${page + 1}` : null,
//       prev: page > 1 ? `${req.path}?page=${page - 1}` : null,
//     };

//     // Tạo đối tượng JSON phản hồi
//     const response = {
//       info: info,
//       results: data,
//     };

//     res.json(response);
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

// sửa cho điểm thu ngày 06/5/2025
router.get("/kykekhai-search-series-pagi", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const {
      kykekhai,
      madaily,
      sohoso,
      dotkekhai,
      ngaykekhai,
      ngaykekhaiden,
      maloaihinh,
    } = req.query;

    // Chuyển đổi ngày sang định dạng DD-MM-YYYY nếu có
    let ngaykekhaiInput = null;
    let ngaykekhaidenInput = null;

    if (ngaykekhai) {
      const [year, month, day] = ngaykekhai.split("-");
      ngaykekhaiInput = `${day}-${month}-${year}`;
    }
    if (ngaykekhaiden) {
      const [yeard, monthd, dayd] = ngaykekhaiden.split("-");
      ngaykekhaidenInput = `${dayd}-${monthd}-${yeard}`;
    }

    // Truy vấn chính
    let queryFirst = `
      SELECT 
        sohoso,
        MIN(dotkekhai) AS dotkekhai,
        MIN(kykekhai) AS kykekhai,
        MIN(ngaykekhai) AS ngaykekhai,
        MIN(madaily) AS madaily,
        MIN(tendaily) AS tendaily,
        MIN(maloaihinh) AS maloaihinh,
        MIN(tenloaihinh) AS tenloaihinh,
        MIN(tennguoitao) AS tennguoitao,
        COUNT(*) AS so_luong
      FROM kekhai
      WHERE madaily = @madaily
    `;

    // Truy vấn đếm
    let queryCountFirst = `
      WITH t AS (
        SELECT sohoso
        FROM kekhai
        WHERE madaily = @madaily
    `;

    // Xây dựng điều kiện WHERE
    const conditions = [];

    if (kykekhai) {
      conditions.push(" AND kykekhai = @kykekhai");
    }
    if (sohoso) {
      conditions.push(" AND sohoso = @sohoso");
    }
    if (dotkekhai) {
      conditions.push(" AND dotkekhai = @dotkekhai");
    }
    if (ngaykekhai && !ngaykekhaiden) {
      conditions.push(
        " AND CONVERT(VARCHAR(10), ngaykekhai, 105) = @ngaykekhai"
      );
    }
    if (ngaykekhai && ngaykekhaiden) {
      conditions.push(
        " AND CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN @ngaykekhai AND @ngaykekhaiden"
      );
    }
    if (maloaihinh) {
      conditions.push(" AND maloaihinh = @maloaihinh");
    }

    // Gộp điều kiện vào truy vấn
    queryFirst += conditions.join(" ");
    queryCountFirst += conditions.join(" ");

    // Kết thúc truy vấn
    queryFirst += `
      GROUP BY sohoso
      ORDER BY CAST(MIN(dotkekhai) AS INT) DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    queryCountFirst += `
      GROUP BY sohoso
      )
      SELECT COUNT(*) AS totalCount FROM t
    `;

    await pool.connect();

    const request = pool
      .request()
      .input("kykekhai", kykekhai)
      .input("madaily", madaily)
      .input("sohoso", sohoso)
      .input("dotkekhai", dotkekhai)
      .input("ngaykekhai", ngaykekhaiInput)
      .input("ngaykekhaiden", ngaykekhaidenInput)
      .input("maloaihinh", maloaihinh)
      .input("offset", offset)
      .input("limit", limit);

    const result = await request.query(queryFirst);
    const countResult = await request.query(queryCountFirst);

    const totalCount = countResult.recordset[0]?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / limit);

    const info = {
      count: totalCount,
      pages: totalPages,
      next: page < totalPages ? `${req.path}?page=${page + 1}` : null,
      prev: page > 1 ? `${req.path}?page=${page - 1}` : null,
    };

    res.json({
      info,
      results: result.recordset,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// tim ho so ke khai cho nhan vien thu
router.get("/kykekhai-search-series-pagi-nvcty", async (req, res) => {
  // console.log(req.query);

  try {
    const page = parseInt(req.query.page) || 1; // Chuyển đổi page thành số nguyên
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const kykekhai = req.query.kykekhai;
    const sohoso = req.query.sohoso;
    const dotkekhai = req.query.dotkekhai;
    const ngaykekhai = req.query.ngaykekhai;
    const ngaykekhaiden = req.query.ngaykekhaiden;
    const tendaily = req.query.tendaily;
    const maloaihinh = req.query.maloaihinh;

    // Chuyển đổi ngày người dùng nhập vào sang định dạng DD-MM-YYYY
    const [year, month, day] = ngaykekhai.split("-");
    let ngaykekhaiInput = day + "-" + month + "-" + year;
    const [yeard, monthd, dayd] = ngaykekhaiden.split("-");
    let ngaykekhaidenInput = dayd + "-" + monthd + "-" + yeard;

    let queryFirst = `SELECT tendaily, sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, trangthai, maloaihinh, tenloaihinh, COUNT(*) AS so_luong
        FROM kekhai where 1=1
        `;
    let queryPlus = `GROUP BY tendaily, sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, trangthai, maloaihinh, tenloaihinh
        ORDER BY cast(dotkekhai as int) desc OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    let queryCountFirst = `with t as (
          SELECT sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, trangthai, maloaihinh, tenloaihinh, COUNT(*) AS so_luong
          FROM kekhai where 1=1
          `;

    let queryCountPlus = `GROUP BY sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, trangthai, maloaihinh, tenloaihinh
          )
          SELECT COUNT(*) AS totalCount FROM t`;

    if (req.query.kykekhai) {
      queryFirst += ` and kykekhai=@kykekhai`;
      queryCountFirst += ` and kykekhai=@kykekhai`;
    }

    if (req.query.sohoso) {
      queryFirst += ` and sohoso=@sohoso`;
      queryCountFirst += ` and sohoso=@sohoso`;
    }

    if (req.query.dotkekhai) {
      queryFirst += ` and dotkekhai=@dotkekhai`;
      queryCountFirst += ` and dotkekhai=@dotkekhai`;
    }

    if (req.query.ngaykekhai && !req.query.ngaykekhaiden) {
      queryFirst += " AND CONVERT(VARCHAR(10), ngaykekhai, 105) = @ngaykekhai";
      queryCountFirst +=
        " AND CONVERT(VARCHAR(10), ngaykekhai, 105) = @ngaykekhai";
    }
    if (req.query.ngaykekhai && req.query.ngaykekhaiden) {
      queryFirst +=
        " AND CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN @ngaykekhai and @ngaykekhaiden";
      queryCountFirst +=
        " AND CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN @ngaykekhai and @ngaykekhaiden";
    }
    if (req.query.tendaily) {
      queryFirst += " AND tendaily like @tendaily";
      queryCountFirst += " AND tendaily like @tendaily";
    }
    if (maloaihinh) {
      queryFirst += " AND maloaihinh = @maloaihinh";
      queryCountFirst += " AND maloaihinh = @maloaihinh";
    }

    const query = queryFirst + " " + queryPlus;
    const queryCount = queryCountFirst + " " + queryCountPlus;

    await pool.connect();

    const result = await pool
      .request()
      .input("kykekhai", kykekhai)
      .input("sohoso", sohoso)
      .input("dotkekhai", dotkekhai)
      .input("maloaihinh", maloaihinh)
      .input("ngaykekhai", ngaykekhaiInput)
      .input("ngaykekhaiden", ngaykekhaidenInput)
      .input("tendaily", `%${tendaily}%`)
      .input("offset", offset)
      .input("limit", limit)
      .query(query);

    const data = result.recordset;

    // Đếm tổng số lượng bản ghi
    const countResult = await pool
      .request()
      .input("kykekhai", kykekhai)
      .input("sohoso", sohoso)
      .input("dotkekhai", dotkekhai)
      .input("maloaihinh", maloaihinh)
      .input("ngaykekhai", ngaykekhaiInput)
      .input("ngaykekhaiden", ngaykekhaidenInput)
      .input("tendaily", `%${tendaily}%`)
      .query(queryCount);
    const totalCount = countResult.recordset[0].totalCount;

    const totalPages = Math.ceil(totalCount / limit);

    const info = {
      count: totalCount,
      pages: totalPages,
      next: page < totalPages ? `${req.path}?page=${page + 1}` : null,
      prev: page > 1 ? `${req.path}?page=${page - 1}` : null,
    };

    // Tạo đối tượng JSON phản hồi
    const response = {
      info: info,
      results: data,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json(error);
  }
});

// tim ho so ke khai cho nhan vien tổng hợp toàn công ty
// router.get("/kykekhai-search-series-pagi-tonghop", async (req, res) => {
//   // console.log(req.query);

//   try {
//     const page = parseInt(req.query.page) || 1; // Chuyển đổi page thành số nguyên
//     const limit = parseInt(req.query.limit, 10) || 10;
//     const offset = (page - 1) * limit;

//     const kykekhai = req.query.kykekhai;
//     const sohoso = req.query.sohoso;
//     const dotkekhai = req.query.dotkekhai;
//     const ngaykekhai = req.query.ngaykekhai;
//     const ngaykekhaiden = req.query.ngaykekhaiden;
//     const maloaihinh = req.query.maloaihinh;

//     // Chuyển đổi ngày người dùng nhập vào sang định dạng DD-MM-YYYY
//     const [year, month, day] = ngaykekhai.split("-");
//     let ngaykekhaiInput = day + "-" + month + "-" + year;
//     const [yeard, monthd, dayd] = ngaykekhaiden.split("-");
//     let ngaykekhaidenInput = dayd + "-" + monthd + "-" + yeard;

//     let queryFirst = `SELECT sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, tendaily, trangthai, maloaihinh, tenloaihinh, COUNT(*) AS so_luong
//         FROM kekhai where 1=1
//         `;
//     let queryPlus = `GROUP BY sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, tendaily, trangthai, maloaihinh, tenloaihinh
//         ORDER BY cast(dotkekhai as int) desc OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

//     let queryCountFirst = `with t as (
//           SELECT sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, tendaily, trangthai, maloaihinh, tenloaihinh, COUNT(*) AS so_luong
//           FROM kekhai where 1=1
//           `;

//     let queryCountPlus = `GROUP BY sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, tendaily, trangthai, maloaihinh, tenloaihinh
//           )
//           SELECT COUNT(*) AS totalCount FROM t`;

//     if (req.query.kykekhai) {
//       queryFirst += ` and kykekhai=@kykekhai`;
//       queryCountFirst += ` and kykekhai=@kykekhai`;
//     }

//     if (req.query.sohoso) {
//       queryFirst += ` and sohoso=@sohoso`;
//       queryCountFirst += ` and sohoso=@sohoso`;
//     }

//     if (req.query.dotkekhai) {
//       queryFirst += ` and dotkekhai=@dotkekhai`;
//       queryCountFirst += ` and dotkekhai=@dotkekhai`;
//     }

//     if (req.query.ngaykekhai && !req.query.ngaykekhaiden) {
//       queryFirst += " AND CONVERT(VARCHAR(10), ngaykekhai, 105) = @ngaykekhai";
//       queryCountFirst +=
//         " AND CONVERT(VARCHAR(10), ngaykekhai, 105) = @ngaykekhai";
//     }
//     if (req.query.ngaykekhai && req.query.ngaykekhaiden) {
//       queryFirst +=
//         " AND CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN @ngaykekhai and @ngaykekhaiden";
//       queryCountFirst +=
//         " AND CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN @ngaykekhai and @ngaykekhaiden";
//     }
//     if (maloaihinh) {
//       queryFirst += " AND maloaihinh = @maloaihinh";
//       queryCountFirst += " AND maloaihinh = @maloaihinh";
//     }

//     const query = queryFirst + " " + queryPlus;
//     const queryCount = queryCountFirst + " " + queryCountPlus;

//     await pool.connect();

//     const result = await pool
//       .request()
//       .input("kykekhai", kykekhai)
//       .input("sohoso", sohoso)
//       .input("dotkekhai", dotkekhai)
//       .input("maloaihinh", maloaihinh)
//       .input("ngaykekhai", ngaykekhaiInput)
//       .input("ngaykekhaiden", ngaykekhaidenInput)
//       .input("offset", offset)
//       .input("limit", limit)
//       .query(query);

//     const data = result.recordset;

//     // Đếm tổng số lượng bản ghi
//     const countResult = await pool
//       .request()
//       .input("kykekhai", kykekhai)
//       .input("sohoso", sohoso)
//       .input("dotkekhai", dotkekhai)
//       .input("maloaihinh", maloaihinh)
//       .input("ngaykekhai", ngaykekhaiInput)
//       .input("ngaykekhaiden", ngaykekhaidenInput)
//       .query(queryCount);
//     const totalCount = countResult.recordset[0].totalCount;

//     const totalPages = Math.ceil(totalCount / limit);

//     const info = {
//       count: totalCount,
//       pages: totalPages,
//       next: page < totalPages ? `${req.path}?page=${page + 1}` : null,
//       prev: page > 1 ? `${req.path}?page=${page - 1}` : null,
//     };

//     // Tạo đối tượng JSON phản hồi
//     const response = {
//       info: info,
//       results: data,
//     };

//     res.json(response);
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

// đang test để sửa. ngày 06/5/2025
router.get("/kykekhai-search-series-pagi-tonghop", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const kykekhai = req.query.kykekhai;
    const sohoso = req.query.sohoso;
    const dotkekhai = req.query.dotkekhai;
    const ngaykekhai = req.query.ngaykekhai;
    const ngaykekhaiden = req.query.ngaykekhaiden;
    const maloaihinh = req.query.maloaihinh;

    // Xử lý định dạng ngày
    let ngaykekhaiInput = null;
    let ngaykekhaidenInput = null;

    if (ngaykekhai) {
      const [year, month, day] = ngaykekhai.split("-");
      ngaykekhaiInput = `${day}-${month}-${year}`;
    }
    if (ngaykekhaiden) {
      const [yeard, monthd, dayd] = ngaykekhaiden.split("-");
      ngaykekhaidenInput = `${dayd}-${monthd}-${yeard}`;
    }

    let queryFirst = `
      SELECT 
        sohoso,
        MIN(dotkekhai) AS dotkekhai,
        MIN(kykekhai) AS kykekhai,
        MIN(ngaykekhai) AS ngaykekhai,
        MIN(madaily) AS madaily,
        MIN(tendaily) AS tendaily,
        MIN(maloaihinh) AS maloaihinh,
        MIN(tenloaihinh) AS tenloaihinh,
        MIN(tennguoitao) AS tennguoitao,
        COUNT(*) AS so_luong
      FROM kekhai
      WHERE 1=1
    `;

    let queryCountFirst = `
      WITH t AS (
        SELECT 
          sohoso
        FROM kekhai
        WHERE 1=1
    `;

    const queryWhere = [];

    if (kykekhai) {
      queryWhere.push(" AND kykekhai = @kykekhai");
    }
    if (sohoso) {
      queryWhere.push(" AND sohoso = @sohoso");
    }
    if (dotkekhai) {
      queryWhere.push(" AND dotkekhai = @dotkekhai");
    }
    if (ngaykekhai && !ngaykekhaiden) {
      queryWhere.push(
        " AND CONVERT(VARCHAR(10), ngaykekhai, 105) = @ngaykekhai"
      );
    }
    if (ngaykekhai && ngaykekhaiden) {
      queryWhere.push(
        " AND CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN @ngaykekhai AND @ngaykekhaiden"
      );
    }
    if (maloaihinh) {
      queryWhere.push(" AND maloaihinh = @maloaihinh");
    }

    queryFirst += queryWhere.join(" ");
    queryCountFirst += queryWhere.join(" ");

    queryFirst += `
      GROUP BY sohoso
      ORDER BY CAST(MIN(dotkekhai) AS INT) DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    queryCountFirst += `
      GROUP BY sohoso
    )
    SELECT COUNT(*) AS totalCount FROM t
    `;

    await pool.connect();

    const request = pool
      .request()
      .input("kykekhai", kykekhai)
      .input("sohoso", sohoso)
      .input("dotkekhai", dotkekhai)
      .input("maloaihinh", maloaihinh)
      .input("ngaykekhai", ngaykekhaiInput)
      .input("ngaykekhaiden", ngaykekhaidenInput)
      .input("offset", offset)
      .input("limit", limit);

    const result = await request.query(queryFirst);
    const countResult = await request.query(queryCountFirst);

    const totalCount = countResult.recordset[0]?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / limit);

    const info = {
      count: totalCount,
      pages: totalPages,
      next: page < totalPages ? `${req.path}?page=${page + 1}` : null,
      prev: page > 1 ? `${req.path}?page=${page - 1}` : null,
    };

    res.json({
      info,
      results: result.recordset,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// tìm kiếm hồ sơ đối với nhân viên công ty
router.get("/kykekhai-search-hoso-pheduyeths", async (req, res) => {
  // console.log(req.query);

  try {
    const {
      kykekhai,
      sohoso,
      dotkekhai,
      ngaykekhai,
      ngaykekhaiden,
      masobhxh,
      hoten,
      tennguoitao,
      maloaihinh,
      trangthaihs,
      page = 1,
      limit = 30,
    } = req.query;

    // Chuyển đổi page và limit thành số nguyên
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offset = (pageNumber - 1) * limitNumber;

    // Chuyển đổi ngày người dùng nhập vào sang định dạng DD-MM-YYYY
    // const [year, month, day] = ngaykekhai.split("-");
    // let ngaykekhaiInput = day + "-" + month + "-" + year;
    // const [yeard, monthd, dayd] = ngaykekhaiden.split("-");
    // let ngaykekhaidenInput = dayd + "-" + monthd + "-" + yeard;
    // // console.log(ngaykekhaiInput);

    // Khởi tạo câu truy vấn cơ bản
    let query = "SELECT * FROM kekhai WHERE 1=1";
    let queryCount = "SELECT COUNT(*) AS totalCount FROM kekhai WHERE 1=1";

    // Thêm các điều kiện tìm kiếm nếu có
    // console.log(trangthaihs);

    if (trangthaihs) {
      if (trangthaihs == "dapheduyet") {
        query += " AND trangthai = 0 and status_naptien=1";
        queryCount += " AND trangthai = 0 and status_naptien=1";
      } else if (trangthaihs == "dahuyduyet") {
        query += " AND trangthai = 1";
        queryCount += " AND trangthai = 1";
      } else if (trangthaihs == "chuapheduyet") {
        query += " AND trangthai = 0 and status_naptien=0";
        queryCount += " AND trangthai = 0 and status_naptien=0";
      }
    }

    if (kykekhai) {
      query += " AND kykekhai = @kykekhai";
      queryCount += " AND kykekhai = @kykekhai";
    }
    if (sohoso) {
      query += " AND sohoso = @sohoso";
      queryCount += " AND sohoso = @sohoso";
    }
    if (dotkekhai) {
      query += " AND dotkekhai = @dotkekhai";
      queryCount += " AND dotkekhai = @dotkekhai";
    }
    // if (ngaykekhai && !ngaykekhaiden) {
    //   query += " AND CONVERT(VARCHAR(10), ngaykekhai, 105) = @ngaykekhai";
    //   queryCount += " AND CONVERT(VARCHAR(10), ngaykekhai, 105) = @ngaykekhai";
    // }
    // if (ngaykekhai && ngaykekhaiden) {
    //   query +=
    //     " AND CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN @ngaykekhai and @ngaykekhaiden";
    //   queryCount +=
    //     " AND CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN @ngaykekhai and @ngaykekhaiden";
    // }
    if (ngaykekhai && !ngaykekhaiden) {
      query += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) = @ngaykekhai`;
      queryCount += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) = @ngaykekhai`;
    }

    if (ngaykekhai && ngaykekhaiden) {
      query += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) BETWEEN @ngaykekhai AND @ngaykekhaiden`;
      queryCount += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) BETWEEN @ngaykekhai AND @ngaykekhaiden`;
    }

    if (masobhxh) {
      query += " AND masobhxh = @masobhxh";
      queryCount += " AND masobhxh = @masobhxh";
    }
    if (hoten) {
      query += " AND hoten like @hoten";
      queryCount += " AND hoten like @hoten";
    }
    if (tennguoitao) {
      query += " AND tennguoitao like @tennguoitao";
      queryCount += " AND tennguoitao like @tennguoitao";
    }
    if (maloaihinh) {
      query += " AND maloaihinh = @maloaihinh";
      queryCount += " AND maloaihinh = @maloaihinh";
    }

    // Thêm phần phân trang CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN '13-12-2024' AND '14-12-2024';
    query +=
      " ORDER BY _id desc OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY";

    // console.log(query);

    // Kết nối và thực thi truy vấn
    await pool.connect();

    const result = await pool
      .request()
      .input("kykekhai", kykekhai)
      .input("sohoso", sohoso)
      .input("dotkekhai", dotkekhai)
      .input("ngaykekhai", ngaykekhai)
      .input("ngaykekhaiden", ngaykekhaiden)
      .input("masobhxh", masobhxh)
      .input("maloaihinh", maloaihinh)
      .input("hoten", `%${hoten}%`)
      .input("tennguoitao", `%${tennguoitao}%`)
      .input("offset", offset)
      .input("limit", limitNumber)
      .query(query);

    const countResult = await pool
      .request()
      .input("kykekhai", kykekhai)
      .input("sohoso", sohoso)
      .input("dotkekhai", dotkekhai)
      .input("ngaykekhai", ngaykekhai)
      .input("ngaykekhaiden", ngaykekhaiden)
      .input("masobhxh", masobhxh)
      .input("maloaihinh", maloaihinh)
      .input("hoten", `%${hoten}%`)
      .input("tennguoitao", `%${tennguoitao}%`)
      .query(queryCount);

    const totalCount = countResult.recordset[0].totalCount;
    const totalPages = Math.ceil(totalCount / limitNumber);

    const info = {
      count: totalCount,
      pages: totalPages,
      next:
        pageNumber < totalPages
          ? `${req.path}?page=${pageNumber + 1}&limit=${limit}`
          : null,
      prev:
        pageNumber > 1
          ? `${req.path}?page=${pageNumber - 1}&limit=${limit}`
          : null,
    };

    // console.log(result.recordset);

    res.json({ info, results: result.recordset });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// tìm kiếm hồ sơ đối với điểm thu
router.get("/kykekhai-search-hoso-diemthu-pheduyeths", async (req, res) => {
  // console.log(req.query);

  try {
    const {
      kykekhai,
      sohoso,
      dotkekhai,
      ngaykekhai,
      ngaykekhaiden,
      masobhxh,
      maloaihinh,
      hoten,
      madaily,
      cccd,
      trangthaihs,
      page = 1,
      limit = 30,
    } = req.query;

    // Chuyển đổi page và limit thành số nguyên
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offset = (pageNumber - 1) * limitNumber;

    // Chuyển đổi ngày người dùng nhập vào sang định dạng DD-MM-YYYY
    // const [year, month, day] = ngaykekhai.split("-");
    // let ngaykekhaiInput = day + "-" + month + "-" + year;
    // const [yeard, monthd, dayd] = ngaykekhaiden.split("-");
    // let ngaykekhaidenInput = dayd + "-" + monthd + "-" + yeard;
    // console.log(ngaykekhaiInput);

    // Khởi tạo câu truy vấn cơ bản
    let query = `SELECT * FROM kekhai WHERE RIGHT(sohoso, 12) = '${cccd}'`;
    let queryCount = `SELECT COUNT(*) AS totalCount FROM kekhai WHERE RIGHT(sohoso, 12) = '${cccd}'`;

    // Thêm các điều kiện tìm kiếm nếu có
    if (trangthaihs) {
      if (trangthaihs == "dapheduyet") {
        query += " AND trangthai = 0 and status_naptien=1";
        queryCount += " AND trangthai = 0 and status_naptien=1";
      } else if (trangthaihs == "dahuyduyet") {
        query += " AND trangthai = 1";
        queryCount += " AND trangthai = 1";
      } else if (trangthaihs == "chuapheduyet") {
        query += " AND trangthai = 0 and status_naptien=0";
        queryCount += " AND trangthai = 0 and status_naptien=0";
      }
    }

    if (kykekhai) {
      query += " AND kykekhai = @kykekhai";
      queryCount += " AND kykekhai = @kykekhai";
    }
    if (sohoso) {
      query += " AND sohoso = @sohoso";
      queryCount += " AND sohoso = @sohoso";
    }
    if (dotkekhai) {
      query += " AND dotkekhai = @dotkekhai";
      queryCount += " AND dotkekhai = @dotkekhai";
    }
    // if (ngaykekhai && !ngaykekhaiden) {
    //   query += " AND CONVERT(VARCHAR(10), ngaykekhai, 105) = @ngaykekhai";
    //   queryCount += " AND CONVERT(VARCHAR(10), ngaykekhai, 105) = @ngaykekhai";
    // }
    // if (ngaykekhai && ngaykekhaiden) {
    //   query +=
    //     " AND CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN @ngaykekhai and @ngaykekhaiden";
    //   queryCount +=
    //     " AND CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN @ngaykekhai and @ngaykekhaiden";
    // }

    if (ngaykekhai && !ngaykekhaiden) {
      query += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) = @ngaykekhai`;
      queryCount += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) = @ngaykekhai`;
    }

    if (ngaykekhai && ngaykekhaiden) {
      query += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) BETWEEN @ngaykekhai AND @ngaykekhaiden`;
      queryCount += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) BETWEEN @ngaykekhai AND @ngaykekhaiden`;
    }

    if (masobhxh) {
      query += " AND masobhxh = @masobhxh";
      queryCount += " AND masobhxh = @masobhxh";
    }
    if (hoten) {
      query += " AND hoten like @hoten";
      queryCount += " AND hoten like @hoten";
    }
    if (maloaihinh) {
      query += " AND maloaihinh = @maloaihinh";
      queryCount += " AND maloaihinh = @maloaihinh";
    }

    // Thêm phần phân trang CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN '13-12-2024' AND '14-12-2024';
    query +=
      " ORDER BY _id desc OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY";

    // console.log(query);

    // Kết nối và thực thi truy vấn
    await pool.connect();

    const result = await pool
      .request()
      .input("kykekhai", kykekhai)
      .input("sohoso", sohoso)
      .input("dotkekhai", dotkekhai)
      .input("ngaykekhai", ngaykekhai)
      .input("ngaykekhaiden", ngaykekhaiden)
      .input("masobhxh", masobhxh)
      .input("maloaihinh", maloaihinh)
      .input("hoten", `%${hoten}%`)
      .input("madaily", madaily)
      .input("offset", offset)
      .input("limit", limitNumber)
      .query(query);

    const countResult = await pool
      .request()
      .input("kykekhai", kykekhai)
      .input("sohoso", sohoso)
      .input("dotkekhai", dotkekhai)
      .input("ngaykekhai", ngaykekhai)
      .input("ngaykekhaiden", ngaykekhaiden)
      .input("masobhxh", masobhxh)
      .input("maloaihinh", maloaihinh)
      .input("hoten", `%${hoten}%`)
      .input("madaily", madaily)
      .query(queryCount);

    const totalCount = countResult.recordset[0].totalCount;
    const totalPages = Math.ceil(totalCount / limitNumber);

    const info = {
      count: totalCount,
      pages: totalPages,
      next:
        pageNumber < totalPages
          ? `${req.path}?page=${pageNumber + 1}&limit=${limit}`
          : null,
      prev:
        pageNumber > 1
          ? `${req.path}?page=${pageNumber - 1}&limit=${limit}`
          : null,
    };

    res.json({ info, results: result.recordset });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// tìm kiếm hồ sơ đối với nhân viên công ty
router.get("/kykekhai-search-hoso", async (req, res) => {
  // console.log(req.query);

  try {
    const {
      kykekhai,
      sohoso,
      dotkekhai,
      ngaykekhai,
      ngaykekhaiden,
      masobhxh,
      hoten,
      tendaily,
      maloaihinh,
      // trangthaihs,
      page = 1,
      limit = 30,
    } = req.query;

    // Chuyển đổi page và limit thành số nguyên
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offset = (pageNumber - 1) * limitNumber;

    // Chuyển đổi ngày người dùng nhập vào sang định dạng DD-MM-YYYY
    // const [year, month, day] = ngaykekhai.split("-");
    // let ngaykekhaiInput = day + "-" + month + "-" + year;
    // const [yeard, monthd, dayd] = ngaykekhaiden.split("-");
    // let ngaykekhaidenInput = dayd + "-" + monthd + "-" + yeard;
    // // console.log(ngaykekhaiInput);

    // Khởi tạo câu truy vấn cơ bản
    let query = "SELECT * FROM kekhai WHERE 1=1";
    let queryCount = "SELECT COUNT(*) AS totalCount FROM kekhai WHERE 1=1";

    // Thêm các điều kiện tìm kiếm nếu có
    // console.log(trangthaihs);

    // if (trangthaihs) {
    //   if(trangthaihs == 'dapheduyet'){
    //     query += " AND trangthai = 0 and status_naptien=1";
    //     queryCount += " AND trangthai = 0 and status_naptien=1";
    //   }else if(trangthaihs == 'dahuyduyet'){
    //     query += " AND trangthai = 1";
    //     queryCount += " AND trangthai = 1";
    //   }else if(trangthaihs == 'chuapheduyet'){
    //     query += " AND trangthai = 0 and status_naptien=0";
    //     queryCount += " AND trangthai = 0 and status_naptien=0";
    //   }
    // }

    if (kykekhai) {
      query += " AND kykekhai = @kykekhai";
      queryCount += " AND kykekhai = @kykekhai";
    }
    if (sohoso) {
      query += " AND sohoso = @sohoso";
      queryCount += " AND sohoso = @sohoso";
    }
    if (dotkekhai) {
      query += " AND dotkekhai = @dotkekhai";
      queryCount += " AND dotkekhai = @dotkekhai";
    }
    // if (ngaykekhai && !ngaykekhaiden) {
    //   query += " AND CONVERT(VARCHAR(10), ngaykekhai, 105) = @ngaykekhai";
    //   queryCount += " AND CONVERT(VARCHAR(10), ngaykekhai, 105) = @ngaykekhai";
    // }
    // if (ngaykekhai && ngaykekhaiden) {
    //   query +=
    //     " AND CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN @ngaykekhai and @ngaykekhaiden";
    //   queryCount +=
    //     " AND CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN @ngaykekhai and @ngaykekhaiden";
    // }
    if (ngaykekhai && !ngaykekhaiden) {
      query += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) = @ngaykekhai`;
      queryCount += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) = @ngaykekhai`;
    }

    if (ngaykekhai && ngaykekhaiden) {
      query += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) BETWEEN @ngaykekhai AND @ngaykekhaiden`;
      queryCount += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) BETWEEN @ngaykekhai AND @ngaykekhaiden`;
    }

    if (masobhxh) {
      query += " AND masobhxh = @masobhxh";
      queryCount += " AND masobhxh = @masobhxh";
    }
    if (hoten) {
      query += " AND hoten like @hoten";
      queryCount += " AND hoten like @hoten";
    }
    if (tendaily) {
      query += " AND tendaily like @tendaily";
      queryCount += " AND tendaily like @tendaily";
    }
    if (maloaihinh) {
      query += " AND maloaihinh = @maloaihinh";
      queryCount += " AND maloaihinh = @maloaihinh";
    }

    // Thêm phần phân trang CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN '13-12-2024' AND '14-12-2024';
    query +=
      " ORDER BY _id desc OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY";

    // console.log(query);

    // Kết nối và thực thi truy vấn
    await pool.connect();

    const result = await pool
      .request()
      .input("kykekhai", kykekhai)
      .input("sohoso", sohoso)
      .input("dotkekhai", dotkekhai)
      .input("ngaykekhai", ngaykekhai)
      .input("ngaykekhaiden", ngaykekhaiden)
      .input("masobhxh", masobhxh)
      .input("maloaihinh", maloaihinh)
      .input("hoten", `%${hoten}%`)
      .input("tendaily", `%${tendaily}%`)
      .input("offset", offset)
      .input("limit", limitNumber)
      .query(query);

    const countResult = await pool
      .request()
      .input("kykekhai", kykekhai)
      .input("sohoso", sohoso)
      .input("dotkekhai", dotkekhai)
      .input("ngaykekhai", ngaykekhai)
      .input("ngaykekhaiden", ngaykekhaiden)
      .input("masobhxh", masobhxh)
      .input("maloaihinh", maloaihinh)
      .input("hoten", `%${hoten}%`)
      .input("tendaily", `%${tendaily}%`)
      .query(queryCount);

    const totalCount = countResult.recordset[0].totalCount;
    const totalPages = Math.ceil(totalCount / limitNumber);

    const info = {
      count: totalCount,
      pages: totalPages,
      next:
        pageNumber < totalPages
          ? `${req.path}?page=${pageNumber + 1}&limit=${limit}`
          : null,
      prev:
        pageNumber > 1
          ? `${req.path}?page=${pageNumber - 1}&limit=${limit}`
          : null,
    };

    // console.log(result.recordset);

    res.json({ info, results: result.recordset });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// tìm kiếm hồ sơ đối với điểm thu
router.get("/kykekhai-search-hoso-diemthu", async (req, res) => {
  // console.log(req.query);

  try {
    const {
      kykekhai,
      sohoso,
      dotkekhai,
      ngaykekhai,
      ngaykekhaiden,
      masobhxh,
      maloaihinh,
      hoten,
      madaily,
      cccd,
      // trangthaihs,
      page = 1,
      limit = 30,
    } = req.query;

    // Chuyển đổi page và limit thành số nguyên
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offset = (pageNumber - 1) * limitNumber;

    // Chuyển đổi ngày người dùng nhập vào sang định dạng DD-MM-YYYY
    // const [year, month, day] = ngaykekhai.split("-");
    // let ngaykekhaiInput = day + "-" + month + "-" + year;
    // const [yeard, monthd, dayd] = ngaykekhaiden.split("-");
    // let ngaykekhaidenInput = dayd + "-" + monthd + "-" + yeard;
    // console.log(ngaykekhaiInput);

    // Khởi tạo câu truy vấn cơ bản
    let query = `SELECT * FROM kekhai WHERE RIGHT(sohoso, 12) = '${cccd}'`;
    let queryCount = `SELECT COUNT(*) AS totalCount FROM kekhai WHERE RIGHT(sohoso, 12) = '${cccd}'`;

    // Thêm các điều kiện tìm kiếm nếu có
    // if (trangthaihs) {
    //   if(trangthaihs == 'dapheduyet'){
    //     query += " AND trangthai = 0 and status_naptien=1";
    //     queryCount += " AND trangthai = 0 and status_naptien=1";
    //   }else if(trangthaihs == 'dahuyduyet'){
    //     query += " AND trangthai = 1";
    //     queryCount += " AND trangthai = 1";
    //   }else if(trangthaihs == 'chuapheduyet'){
    //     query += " AND trangthai = 0 and status_naptien=0";
    //     queryCount += " AND trangthai = 0 and status_naptien=0";
    //   }
    // }

    if (kykekhai) {
      query += " AND kykekhai = @kykekhai";
      queryCount += " AND kykekhai = @kykekhai";
    }
    if (sohoso) {
      query += " AND sohoso = @sohoso";
      queryCount += " AND sohoso = @sohoso";
    }
    if (dotkekhai) {
      query += " AND dotkekhai = @dotkekhai";
      queryCount += " AND dotkekhai = @dotkekhai";
    }
    // if (ngaykekhai && !ngaykekhaiden) {
    //   query += " AND CONVERT(VARCHAR(10), ngaykekhai, 105) = @ngaykekhai";
    //   queryCount += " AND CONVERT(VARCHAR(10), ngaykekhai, 105) = @ngaykekhai";
    // }
    // if (ngaykekhai && ngaykekhaiden) {
    //   query +=
    //     " AND CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN @ngaykekhai and @ngaykekhaiden";
    //   queryCount +=
    //     " AND CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN @ngaykekhai and @ngaykekhaiden";
    // }

    if (ngaykekhai && !ngaykekhaiden) {
      query += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) = @ngaykekhai`;
      queryCount += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) = @ngaykekhai`;
    }

    if (ngaykekhai && ngaykekhaiden) {
      query += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) BETWEEN @ngaykekhai AND @ngaykekhaiden`;
      queryCount += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) BETWEEN @ngaykekhai AND @ngaykekhaiden`;
    }

    if (masobhxh) {
      query += " AND masobhxh = @masobhxh";
      queryCount += " AND masobhxh = @masobhxh";
    }
    if (hoten) {
      query += " AND hoten like @hoten";
      queryCount += " AND hoten like @hoten";
    }
    if (maloaihinh) {
      query += " AND maloaihinh = @maloaihinh";
      queryCount += " AND maloaihinh = @maloaihinh";
    }

    // Thêm phần phân trang CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN '13-12-2024' AND '14-12-2024';
    query +=
      " ORDER BY _id desc OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY";

    // console.log(query);

    // Kết nối và thực thi truy vấn
    await pool.connect();

    const result = await pool
      .request()
      .input("kykekhai", kykekhai)
      .input("sohoso", sohoso)
      .input("dotkekhai", dotkekhai)
      .input("ngaykekhai", ngaykekhai)
      .input("ngaykekhaiden", ngaykekhaiden)
      .input("masobhxh", masobhxh)
      .input("maloaihinh", maloaihinh)
      .input("hoten", `%${hoten}%`)
      .input("madaily", madaily)
      .input("offset", offset)
      .input("limit", limitNumber)
      .query(query);

    const countResult = await pool
      .request()
      .input("kykekhai", kykekhai)
      .input("sohoso", sohoso)
      .input("dotkekhai", dotkekhai)
      .input("ngaykekhai", ngaykekhai)
      .input("ngaykekhaiden", ngaykekhaiden)
      .input("masobhxh", masobhxh)
      .input("maloaihinh", maloaihinh)
      .input("hoten", `%${hoten}%`)
      .input("madaily", madaily)
      .query(queryCount);

    const totalCount = countResult.recordset[0].totalCount;
    const totalPages = Math.ceil(totalCount / limitNumber);

    const info = {
      count: totalCount,
      pages: totalPages,
      next:
        pageNumber < totalPages
          ? `${req.path}?page=${pageNumber + 1}&limit=${limit}`
          : null,
      prev:
        pageNumber > 1
          ? `${req.path}?page=${pageNumber - 1}&limit=${limit}`
          : null,
    };

    res.json({ info, results: result.recordset });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// tìm kiếm hồ sơ  ĐÃ GỬI LÊN CỔNG đối với nhân viên công ty
router.get("/kykekhai-search-hoso-daguilencong", async (req, res) => {
  // console.log(req.query);

  try {
    const {
      kykekhai,
      sohoso,
      dotkekhai,
      ngaykekhai,
      ngaykekhaiden,
      masobhxh,
      hoten,
      tendaily,
      maloaihinh,
      page = 1,
      limit = 30,
    } = req.query;

    // Chuyển đổi page và limit thành số nguyên
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offset = (pageNumber - 1) * limitNumber;

    // Chuyển đổi ngày người dùng nhập vào sang định dạng DD-MM-YYYY
    // const [year, month, day] = ngaykekhai.split("-");
    // let ngaykekhaiInput = day + "-" + month + "-" + year;
    // const [yeard, monthd, dayd] = ngaykekhaiden.split("-");
    // let ngaykekhaidenInput = dayd + "-" + monthd + "-" + yeard;
    // // console.log(ngaykekhaiInput);

    // Khởi tạo câu truy vấn cơ bản
    let query =
      "SELECT * FROM kekhai WHERE status_naptien=1 and trangthai=0 and 1=1";
    let queryCount =
      "SELECT COUNT(*) AS totalCount FROM kekhai WHERE status_naptien=1 and trangthai=0 and 1=1";

    // Thêm các điều kiện tìm kiếm nếu có
    if (kykekhai) {
      query += " AND kykekhai = @kykekhai";
      queryCount += " AND kykekhai = @kykekhai";
    }
    if (sohoso) {
      query += " AND sohoso = @sohoso";
      queryCount += " AND sohoso = @sohoso";
    }
    if (dotkekhai) {
      query += " AND dotkekhai = @dotkekhai";
      queryCount += " AND dotkekhai = @dotkekhai";
    }
    // if (ngaykekhai && !ngaykekhaiden) {
    //   query += " AND CONVERT(VARCHAR(10), ngaykekhai, 105) = @ngaykekhai";
    //   queryCount += " AND CONVERT(VARCHAR(10), ngaykekhai, 105) = @ngaykekhai";
    // }
    // if (ngaykekhai && ngaykekhaiden) {
    //   query +=
    //     " AND CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN @ngaykekhai and @ngaykekhaiden";
    //   queryCount +=
    //     " AND CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN @ngaykekhai and @ngaykekhaiden";
    // }
    if (ngaykekhai && !ngaykekhaiden) {
      query += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) = @ngaykekhai`;
      queryCount += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) = @ngaykekhai`;
      console.log(query);
    }

    if (ngaykekhai && ngaykekhaiden) {
      query += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) BETWEEN @ngaykekhai AND @ngaykekhaiden`;
      queryCount += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) BETWEEN @ngaykekhai AND @ngaykekhaiden`;
    }

    if (masobhxh) {
      query += " AND masobhxh = @masobhxh";
      queryCount += " AND masobhxh = @masobhxh";
    }
    if (hoten) {
      query += " AND hoten like @hoten";
      queryCount += " AND hoten like @hoten";
    }
    if (tendaily) {
      query += " AND tendaily like @tendaily";
      queryCount += " AND tendaily like @tendaily";
    }
    if (maloaihinh) {
      query += " AND maloaihinh = @maloaihinh";
      queryCount += " AND maloaihinh = @maloaihinh";
    }

    // Thêm phần phân trang CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN '13-12-2024' AND '14-12-2024';
    query +=
      " ORDER BY _id desc OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY";

    // console.log(query);

    // Kết nối và thực thi truy vấn
    await pool.connect();

    const result = await pool
      .request()
      .input("kykekhai", kykekhai)
      .input("sohoso", sohoso)
      .input("dotkekhai", dotkekhai)
      .input("ngaykekhai", ngaykekhai)
      .input("ngaykekhaiden", ngaykekhaiden)
      .input("masobhxh", masobhxh)
      .input("maloaihinh", maloaihinh)
      .input("hoten", `%${hoten}%`)
      .input("tendaily", `%${tendaily}%`)
      .input("offset", offset)
      .input("limit", limitNumber)
      .query(query);

    const countResult = await pool
      .request()
      .input("kykekhai", kykekhai)
      .input("sohoso", sohoso)
      .input("dotkekhai", dotkekhai)
      .input("ngaykekhai", ngaykekhai)
      .input("ngaykekhaiden", ngaykekhaiden)
      .input("masobhxh", masobhxh)
      .input("maloaihinh", maloaihinh)
      .input("hoten", `%${hoten}%`)
      .input("tendaily", `%${tendaily}%`)
      .query(queryCount);

    const totalCount = countResult.recordset[0].totalCount;
    const totalPages = Math.ceil(totalCount / limitNumber);

    const info = {
      count: totalCount,
      pages: totalPages,
      next:
        pageNumber < totalPages
          ? `${req.path}?page=${pageNumber + 1}&limit=${limit}`
          : null,
      prev:
        pageNumber > 1
          ? `${req.path}?page=${pageNumber - 1}&limit=${limit}`
          : null,
    };

    // console.log(result.recordset);

    res.json({ info, results: result.recordset });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// tìm kiếm hồ sơ đối với điểm thu
router.get("/kykekhai-search-hoso-diemthu-daguilencong", async (req, res) => {
  // console.log(req.query);

  try {
    const {
      kykekhai,
      sohoso,
      dotkekhai,
      ngaykekhai,
      ngaykekhaiden,
      masobhxh,
      maloaihinh,
      hoten,
      madaily,
      page = 1,
      limit = 30,
    } = req.query;

    // Chuyển đổi page và limit thành số nguyên
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offset = (pageNumber - 1) * limitNumber;

    // Chuyển đổi ngày người dùng nhập vào sang định dạng DD-MM-YYYY
    // const [year, month, day] = ngaykekhai.split("-");
    // let ngaykekhaiInput = day + "-" + month + "-" + year;
    // const [yeard, monthd, dayd] = ngaykekhaiden.split("-");
    // let ngaykekhaidenInput = dayd + "-" + monthd + "-" + yeard;
    // console.log(ngaykekhaiInput);
    // Khởi tạo câu truy vấn cơ bản
    let query =
      "SELECT * FROM kekhai WHERE madaily=@madaily and status_naptien=1 and trangthai=0 and 1=1";
    let queryCount =
      "SELECT COUNT(*) AS totalCount FROM kekhai WHERE madaily=@madaily and status_naptien=1 and trangthai=0 and 1=1";

    // Thêm các điều kiện tìm kiếm nếu có
    if (kykekhai) {
      query += " AND kykekhai = @kykekhai";
      queryCount += " AND kykekhai = @kykekhai";
    }
    if (sohoso) {
      query += " AND sohoso = @sohoso";
      queryCount += " AND sohoso = @sohoso";
    }
    if (dotkekhai) {
      query += " AND dotkekhai = @dotkekhai";
      queryCount += " AND dotkekhai = @dotkekhai";
    }
    // if (ngaykekhai && !ngaykekhaiden) {
    //   query += " AND CONVERT(VARCHAR(10), ngaykekhai, 105) = @ngaykekhai";
    //   queryCount += " AND CONVERT(VARCHAR(10), ngaykekhai, 105) = @ngaykekhai";
    // }
    // if (ngaykekhai && ngaykekhaiden) {
    //   query +=
    //     " AND CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN @ngaykekhai and @ngaykekhaiden";
    //   queryCount +=
    //     " AND CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN @ngaykekhai and @ngaykekhaiden";
    // }

    if (ngaykekhai && !ngaykekhaiden) {
      query += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) = @ngaykekhai`;
      queryCount += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) = @ngaykekhai`;
    }

    if (ngaykekhai && ngaykekhaiden) {
      query += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) BETWEEN @ngaykekhai AND @ngaykekhaiden`;
      queryCount += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaykekhai, 105)) BETWEEN @ngaykekhai AND @ngaykekhaiden`;
    }

    if (masobhxh) {
      query += " AND masobhxh = @masobhxh";
      queryCount += " AND masobhxh = @masobhxh";
    }
    if (hoten) {
      query += " AND hoten like @hoten";
      queryCount += " AND hoten like @hoten";
    }
    if (maloaihinh) {
      query += " AND maloaihinh = @maloaihinh";
      queryCount += " AND maloaihinh = @maloaihinh";
    }

    // Thêm phần phân trang CONVERT(VARCHAR(10), ngaykekhai, 105) BETWEEN '13-12-2024' AND '14-12-2024';
    query +=
      " ORDER BY _id desc OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY";

    // console.log(query);

    // Kết nối và thực thi truy vấn
    await pool.connect();

    const result = await pool
      .request()
      .input("kykekhai", kykekhai)
      .input("sohoso", sohoso)
      .input("dotkekhai", dotkekhai)
      .input("ngaykekhai", ngaykekhai)
      .input("ngaykekhaiden", ngaykekhaiden)
      .input("masobhxh", masobhxh)
      .input("maloaihinh", maloaihinh)
      .input("hoten", `%${hoten}%`)
      .input("madaily", madaily)
      .input("offset", offset)
      .input("limit", limitNumber)
      .query(query);

    const countResult = await pool
      .request()
      .input("kykekhai", kykekhai)
      .input("sohoso", sohoso)
      .input("dotkekhai", dotkekhai)
      .input("ngaykekhai", ngaykekhai)
      .input("ngaykekhaiden", ngaykekhaiden)
      .input("masobhxh", masobhxh)
      .input("maloaihinh", maloaihinh)
      .input("hoten", `%${hoten}%`)
      .input("madaily", madaily)
      .query(queryCount);

    const totalCount = countResult.recordset[0].totalCount;
    const totalPages = Math.ceil(totalCount / limitNumber);

    const info = {
      count: totalCount,
      pages: totalPages,
      next:
        pageNumber < totalPages
          ? `${req.path}?page=${pageNumber + 1}&limit=${limit}`
          : null,
      prev:
        pageNumber > 1
          ? `${req.path}?page=${pageNumber - 1}&limit=${limit}`
          : null,
    };

    // console.log(result.recordset);

    res.json({ info, results: result.recordset });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// xuất mẫu hồ sơ liệt kê danh sách
router.get("/get-all-kekhai-xuatmau", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("sohoso", req.query.sohoso)
      .query(`SELECT * from kekhai where sohoso=@sohoso`);
    const kekhai = result.recordset;
    res.json({
      success: true,
      kekhai,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/sobienlai", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("namtaichinh", req.query.namtaichinh)
      .query(`SELECT MAX(sobienlai) AS max
        FROM bienlai
        WHERE namtaichinh = @namtaichinh;`);
    const bienlai = result.recordset[0];
    console.log(bienlai);

    res.json({
      success: true,
      bienlai: bienlai.max,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/bienlaidientu", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(`SELECT * FROM bienlaidientu ORDER BY _id DESC`);
    const bienlai = result.recordset;
    res.json({
      success: true,
      bienlai,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// // update hồ sơ lỗi từ công ty về. gán status_hosoloi == 1
// router.post("/trahosoloi", async (req, res) => {
//   // console.log(req.body);
//   try {
//     await pool.connect();
//     const result = await pool
//       .request()
//       .input("_id", req.body.id)
//       .query(`update kekhai set status_hosoloi=1 where _id=@_id`);
//     const bienlai = result.recordset;
//     res.json({
//       success: true,
//       bienlai,
//     });
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

router.post("/trahosoloi", async (req, res) => {
  const { items } = req.body; // Mảng các hồ sơ cần gửi
  let transaction = null;

  try {
    // Kết nối tới SQL Server và bắt đầu giao dịch
    await pool.connect();
    transaction = new Transaction(pool);
    await transaction.begin();

    // Lặp qua các items và thực hiện cập nhật cho từng hồ sơ
    for (let item of items) {
      await transaction
        .request()
        .input("_id", item.id)
        .query("UPDATE kekhai SET status_hosoloi = 1 WHERE _id = @_id");
    }

    // Nếu tất cả các truy vấn thành công, commit giao dịch
    await transaction.commit();

    // Trả về kết quả thành công
    res.json({
      success: true,
      message: "Tất cả hồ sơ đã được gửi và cập nhật thành công.",
    });
  } catch (error) {
    // Nếu có lỗi, rollback transaction và trả về lỗi
    if (transaction) {
      await transaction.rollback();
    }

    res.status(500).json({
      success: false,
      message: "Có lỗi khi gửi hoặc cập nhật hồ sơ. Vui lòng thử lại.",
      error: error.message,
    });
  } finally {
    // Đảm bảo đóng kết nối sau khi giao dịch
    await pool.close();
  }
});

// report
// hồ sơ lỗi tại điểm thu
router.post("/hosoloitrave-diemthu", async (req, res) => {
  // console.log(req.body);

  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("cccd", req.body.cccd)
      .query(
        `select * from kekhai where trangthai = 1 and RIGHT(sohoso,12)=@cccd order by _id desc`
      );
    const hs = result.recordset;
    res.json({
      success: true,
      hs,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// hồ sơ lỗi view tổng hợp
router.get("/hosoloitrave-tonghop", async (req, res) => {
  // console.log(req.body);

  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(`select * from kekhai where trangthai = 1 order by _id desc`);
    const hs = result.recordset;
    res.json({
      success: true,
      hs,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// hồ sơ chưa đẩy lên cổng tài khoản tổng hợp
router.get("/hosochuadaylencongbhvn", async (req, res) => {
  // console.log(req.body);

  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `select * from kekhai where trangthai = 0 and status_naptien=0 order by _id desc`
      );
    const hs = result.recordset;
    res.json({
      success: true,
      hs,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// hồ sơ chưa đẩy lên cổng tài khoản điểm thu
router.post("/hosochuadaylencongbhvn-diemthu", async (req, res) => {
  // console.log(req.body);

  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("cccd", req.body.cccd)
      .query(
        `select * from kekhai where trangthai = 0 and status_naptien=0 and RIGHT(sohoso,12)=@cccd order by _id desc`
      );
    const hs = result.recordset;
    res.json({
      success: true,
      hs,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// hồ sơ đã đẩy lên cổng tài khoản tổng hợp
router.get("/hosodadaylencongbhvn", async (req, res) => {
  // console.log(req.body);

  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(
        `select * from kekhai where trangthai = 0 and status_naptien=1 order by _id desc`
      );
    const hs = result.recordset;
    res.json({
      success: true,
      hs,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// hồ sơ chưa đẩy lên cổng tài khoản điểm thu
router.post("/hosodadaylencongbhvn-diemthu", async (req, res) => {
  // console.log(req.body);

  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("cccd", req.body.cccd)
      .query(
        `select * from kekhai where trangthai = 0 and status_naptien=1 and RIGHT(sohoso,12)=@cccd order by _id desc`
      );
    const hs = result.recordset;
    res.json({
      success: true,
      hs,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// hồ sơ đã đẩy lên cổng tài khoản tổng hợp
router.get("/allsonguoidakekhai", async (req, res) => {
  // console.log(req.body);

  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(`select * from kekhai order by _id desc`);
    const hs = result.recordset;
    res.json({
      success: true,
      hs,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// hồ sơ chưa đẩy lên cổng tài khoản điểm thu
router.post("/allsonguoidakekhai-diemthu", async (req, res) => {
  // console.log(req.body);

  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("cccd", req.body.cccd)
      .query(
        `select * from kekhai where RIGHT(sohoso,12)=@cccd order by _id desc`
      );
    const hs = result.recordset;
    res.json({
      success: true,
      hs,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// hồ sơ chưa đẩy lên cổng tài khoản điểm thu
router.get("/view-item-bienlai", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("hosoIdentity", req.query.hosoIdentity)
      .query(`select * from bienlaidientu where hosoIdentity=@hosoIdentity`);
    const hs = result.recordset[0];
    res.json({
      success: true,
      hs,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/thongke-hosokekhai", async (req, res) => {
  // console.log(req.body);

  const { cccd } = req.body;

  if (!cccd) {
    return res.status(400).json({ success: false, message: "Thiếu CCCD" });
  }

  try {
    await pool.connect();
    const request = pool.request().input("cccd", cccd);

    const query = `
      SELECT 
          COUNT(*) AS tong_hoso,
          COALESCE(SUM(CASE WHEN trangthai = 1 THEN 1 ELSE 0 END), 0) AS hoso_loi,
          COALESCE(SUM(CASE WHEN status_naptien = 1 THEN 1 ELSE 0 END), 0) AS hoso_dagui,
          COALESCE(SUM(CASE WHEN status_naptien = 0 AND trangthai = 1 THEN 1 ELSE 0 END), 0) AS hoso_chuaduyet,
          COALESCE(SUM(CASE WHEN trangthai = 0 AND status_naptien=0 THEN 1 ELSE 0 END), 0) AS hoso_chuagui,
          COUNT(DISTINCT sohoso) AS tong_sohoso,
          COALESCE(
              SUM(CASE WHEN status_naptien = 1 THEN CAST(sotien AS FLOAT) ELSE 0 END),
              0
            ) AS tong_sotien,
          COALESCE(SUM(CASE WHEN maloaihinh = 'AR' THEN 1 ELSE 0 END), 0) AS tong_AR,
          COALESCE(SUM(CASE WHEN maloaihinh = 'BI' THEN 1 ELSE 0 END), 0) AS tong_BI,
          COALESCE(SUM(CASE WHEN maloaihinh = 'IS' THEN 1 ELSE 0 END), 0) AS tong_IS
      FROM kekhai
      WHERE RIGHT(sohoso, 12) = @cccd
    `;

    const result = await request.query(query);
    const data = result.recordset[0];

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Lỗi thống kê:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
});

router.post("/thongke-hosokekhai-with-thang-nam", async (req, res) => {
  const { cccd, thang, nam } = req.body;

  if (!cccd || !thang || !nam) {
    return res.status(400).json({ success: false, message: "Thiếu CCCD, tháng hoặc năm" });
  }

  try {
    await pool.connect();
    const request = pool.request()
      .input("cccd", cccd)
      .input("thang", parseInt(thang))
      .input("nam", parseInt(nam));

    const query = `
      SELECT 
          COUNT(*) AS tong_hoso,
          COALESCE(SUM(CASE WHEN trangthai = 1 THEN 1 ELSE 0 END), 0) AS hoso_loi,
          COALESCE(SUM(CASE WHEN status_naptien = 1 THEN 1 ELSE 0 END), 0) AS hoso_dagui,
          COALESCE(SUM(CASE WHEN status_naptien = 0 AND trangthai = 1 THEN 1 ELSE 0 END), 0) AS hoso_chuaduyet,
          COALESCE(SUM(CASE WHEN trangthai = 0 AND status_naptien = 0 THEN 1 ELSE 0 END), 0) AS hoso_chuagui,
          COUNT(DISTINCT sohoso) AS tong_sohoso,
          COALESCE(
              SUM(CASE WHEN status_naptien = 1 THEN CAST(sotien AS FLOAT) ELSE 0 END),
              0
            ) AS tong_sotien,
          COALESCE(SUM(CASE WHEN maloaihinh = 'AR' THEN 1 ELSE 0 END), 0) AS tong_AR,
          COALESCE(SUM(CASE WHEN maloaihinh = 'BI' THEN 1 ELSE 0 END), 0) AS tong_BI,
          COALESCE(SUM(CASE WHEN maloaihinh = 'IS' THEN 1 ELSE 0 END), 0) AS tong_IS
      FROM kekhai
      WHERE RIGHT(sohoso, 12) = @cccd
        AND MONTH(TRY_CONVERT(DATETIME, ngaykekhai, 105)) = @thang
        AND YEAR(TRY_CONVERT(DATETIME, ngaykekhai, 105)) = @nam
      
    `;

    const result = await request.query(query);
    const data = result.recordset[0];

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Lỗi thống kê:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
});


router.get("/thongke-hosokekhai-tonghop", async (req, res) => {
  try {
    await pool.connect();
    const request = pool.request();

    const query = `
      SELECT 
          COUNT(*) AS tong_hoso,
          COALESCE(SUM(CASE WHEN trangthai = 1 THEN 1 ELSE 0 END), 0) AS hoso_loi,
          COALESCE(SUM(CASE WHEN status_naptien = 1 THEN 1 ELSE 0 END), 0) AS hoso_dagui,
          COALESCE(SUM(CASE WHEN status_naptien = 0 AND trangthai = 1 THEN 1 ELSE 0 END), 0) AS hoso_chuaduyet,
          COALESCE(SUM(CASE WHEN trangthai = 0 AND status_naptien=0 THEN 1 ELSE 0 END), 0) AS hoso_chuagui,
          COUNT(DISTINCT sohoso) AS tong_sohoso,
          COALESCE(
              SUM(CASE WHEN status_naptien = 1 THEN CAST(sotien AS FLOAT) ELSE 0 END),
              0
            ) AS tong_sotien,
          COALESCE(SUM(CASE WHEN maloaihinh = 'AR' THEN 1 ELSE 0 END), 0) AS tong_AR,
          COALESCE(SUM(CASE WHEN maloaihinh = 'BI' THEN 1 ELSE 0 END), 0) AS tong_BI,
          COALESCE(SUM(CASE WHEN maloaihinh = 'IS' THEN 1 ELSE 0 END), 0) AS tong_IS
      FROM kekhai
    `;

    const result = await request.query(query);
    const data = result.recordset[0];

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Lỗi thống kê:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
});

router.get("/thongke-hosokekhai-tonghop-with-thang-nam", async (req, res) => {
  try {
    const { thang, nam } = req.query;

    if (!thang || !nam) {
      return res.status(400).json({ success: false, message: "Thiếu tham số tháng hoặc năm" });
    }

    await pool.connect();
    const request = pool.request();
    request.input("thang", parseInt(thang));
    request.input("nam", parseInt(nam));

    const query = `
      SELECT 
          COUNT(*) AS tong_hoso,
          COALESCE(SUM(CASE WHEN trangthai = 1 THEN 1 ELSE 0 END), 0) AS hoso_loi,
          COALESCE(SUM(CASE WHEN status_naptien = 1 THEN 1 ELSE 0 END), 0) AS hoso_dagui,
          COALESCE(SUM(CASE WHEN status_naptien = 0 AND trangthai = 1 THEN 1 ELSE 0 END), 0) AS hoso_chuaduyet,
          COALESCE(SUM(CASE WHEN trangthai = 0 AND status_naptien=0 THEN 1 ELSE 0 END), 0) AS hoso_chuagui,
          COUNT(DISTINCT sohoso) AS tong_sohoso,
          COALESCE(
              SUM(CASE WHEN status_naptien = 1 THEN CAST(sotien AS FLOAT) ELSE 0 END),
              0
            ) AS tong_sotien,
          COALESCE(SUM(CASE WHEN maloaihinh = 'AR' THEN 1 ELSE 0 END), 0) AS tong_AR,
          COALESCE(SUM(CASE WHEN maloaihinh = 'BI' THEN 1 ELSE 0 END), 0) AS tong_BI,
          COALESCE(SUM(CASE WHEN maloaihinh = 'IS' THEN 1 ELSE 0 END), 0) AS tong_IS
      FROM kekhai
        WHERE 
      MONTH(TRY_CONVERT(DATETIME, ngaykekhai, 105)) = @thang
      AND YEAR(TRY_CONVERT(DATETIME, ngaykekhai, 105)) = @nam
    `;

    const result = await request.query(query);
    const data = result.recordset[0];

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Lỗi thống kê:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
});


// chart mã loại kê khai theo tháng và năm (lọc theo cả năm và tháng)
router.get("/baocao-loaihinh-kekhai-theo-thang-nam", async (req, res) => {
  try {
    await pool.connect();
    const request = pool.request();

    const nam = parseInt(req.query.nam);
    const thang = parseInt(req.query.thang);

    const query = `
      SELECT 
        maloaihinh,
        COUNT(*) AS soLuong
      FROM kekhai
      WHERE 
        TRY_CONVERT(datetime, ngaykekhai, 105) IS NOT NULL
        AND YEAR(CONVERT(datetime, ngaykekhai, 105)) = ${nam}
        AND MONTH(CONVERT(datetime, ngaykekhai, 105)) = ${thang}
      GROUP BY maloaihinh
      ORDER BY maloaihinh
    `;

    const result = await request.query(query);
    const data = result.recordset;

    res.json({ success: true, data });
  } catch (error) {
    console.error("Lỗi truy vấn báo cáo theo tháng và năm:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
});

// chart mã loại kê khai theo tháng và năm (lọc theo cả năm và tháng) theo đại lý
router.get("/baocao-loaihinh-kekhai-theo-thang-nam-daily", async (req, res) => {
  try {
    await pool.connect();
    const request = pool.request();

    const nam = parseInt(req.query.nam);
    const thang = parseInt(req.query.thang);
    const cccd = req.query.cccd;

    const query = `
      SELECT 
        maloaihinh,
        COUNT(*) AS soLuong
      FROM kekhai
      WHERE 
        TRY_CONVERT(datetime, ngaykekhai, 105) IS NOT NULL
        AND YEAR(CONVERT(datetime, ngaykekhai, 105)) = ${nam}
        AND MONTH(CONVERT(datetime, ngaykekhai, 105)) = ${thang}
        AND RIGHT(sohoso, 12) = '${cccd}'
      GROUP BY maloaihinh
      ORDER BY maloaihinh
    `;

    const result = await request.query(query);
    const data = result.recordset;

    res.json({ success: true, data });
  } catch (error) {
    console.error("Lỗi truy vấn báo cáo theo tháng và năm:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
});

router.get("/baocao-loaihinh-kekhai-theo-thang-nam-daily-tonghop", async (req, res) => {
  try {
    await pool.connect();
    const request = pool.request();

    const nam = parseInt(req.query.nam);
    const thang = parseInt(req.query.thang);

    const query = `
      SELECT 
        maloaihinh,
        COUNT(*) AS soLuong
      FROM kekhai
      WHERE 
        TRY_CONVERT(datetime, ngaykekhai, 105) IS NOT NULL
        AND YEAR(CONVERT(datetime, ngaykekhai, 105)) = ${nam}
        AND MONTH(CONVERT(datetime, ngaykekhai, 105)) = ${thang}
      GROUP BY maloaihinh
      ORDER BY maloaihinh
    `;

    const result = await request.query(query);
    const data = result.recordset;

    res.json({ success: true, data });
  } catch (error) {
    console.error("Lỗi truy vấn báo cáo theo tháng và năm:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
});

router.get("/baocao-tongtien-theo-daily-thang-nam", async (req, res) => {
  try {
    await pool.connect();
    const request = pool.request();

    const nam = parseInt(req.query.nam);
    const thang = parseInt(req.query.thang);

    const query = `
      SELECT
          RIGHT(sohoso, 12) AS cccd,
          tennguoitao,
          SUM(CAST(sotien AS FLOAT)) AS tongtien
      FROM kekhai
      WHERE
          TRY_CONVERT(datetime, ngaykekhai, 105) IS NOT NULL
          AND YEAR(TRY_CONVERT(datetime, ngaykekhai, 105)) = ${nam}
          AND MONTH(TRY_CONVERT(datetime, ngaykekhai, 105)) = ${thang}
          AND status_naptien = 1
      GROUP BY RIGHT(sohoso, 12), tennguoitao
      ORDER BY tongtien DESC;
    `;

    const result = await request.query(query);
    const data = result.recordset;

    res.json({ success: true, data });
  } catch (error) {
    console.error("Lỗi truy vấn báo cáo tổng tiền theo đại lý:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
});

router.get("/baocao-tongtien-daily-theo-thang-nam", async (req, res) => {
  try {
    await pool.connect();
    const request = pool.request();

    const cccd = req.query.cccd;
    const nam = parseInt(req.query.nam);

    if (!cccd || !nam) {
      return res.status(400).json({
        success: false,
        message: "Thiếu cccd hoặc năm",
      });
    }

    const query = `
      SELECT 
        MONTH(CONVERT(datetime, ngaykekhai, 105)) AS thang,
        SUM(CAST(sotien AS FLOAT)) AS tongtien
      FROM kekhai
      WHERE 
        TRY_CONVERT(datetime, ngaykekhai, 105) IS NOT NULL
        AND YEAR(CONVERT(datetime, ngaykekhai, 105)) = @nam
        AND RIGHT(sohoso, 12) = @cccd
        AND status_naptien = 1
      GROUP BY MONTH(CONVERT(datetime, ngaykekhai, 105))
      ORDER BY thang;

    `;

    request.input("nam", nam);
    request.input("cccd", cccd);

    const result = await request.query(query);
    const data = result.recordset;

    res.json({ success: true, data });
  } catch (error) {
    console.error("Lỗi truy vấn tổng tiền theo tháng:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
});

// tra cứu biên lai điện tử cho cán bộ BHXH
router.get("/search-bienlai-dientu-bhxh", async (req, res) => {
  // console.log(req.query);

  try {
    await pool.connect();

    const { loaihinh, ngaybienlaitu, ngaybienlaiden, masobhxh, hoten } =
      req.query;

    // Mảng chứa điều kiện lọc
    const conditions = [];
    const request = pool.request(); // chuẩn bị request cho SQL Server

    if (loaihinh) {
      conditions.push("loaihinh = @loaihinh");
      request.input("loaihinh", loaihinh);
    }

    if (ngaybienlaitu) {
      conditions.push(
        "CONVERT(date, TRY_CONVERT(datetime, ngaybienlai, 105)) >= @ngaybienlaitu"
      );
      request.input("ngaybienlaitu", ngaybienlaitu);
    }

    if (ngaybienlaiden) {
      conditions.push(
        "CONVERT(date, TRY_CONVERT(datetime, ngaybienlai, 105)) <= @ngaybienlaiden"
      );
      request.input("ngaybienlaiden", ngaybienlaiden);
    }

    if (masobhxh) {
      conditions.push("masobhxh LIKE '%' + @masobhxh + '%'");
      request.input("masobhxh", masobhxh);
    }

    if (hoten) {
      conditions.push("hoten LIKE N'%' + @hoten + '%'");
      request.input("hoten", hoten);
    }

    // Gộp điều kiện thành chuỗi WHERE
    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT * FROM bienlaidientu
      ${whereClause}
      ORDER BY ngaybienlai DESC
    `;

    const result = await request.query(query);

    res.json({
      success: true,
      hs: result.recordset,
    });
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi truy vấn dữ liệu", error });
  }
});

// API tìm kiếm dữ liệu từ bảng dulieuthe
router.get("/tim-dulieuthe", async (req, res) => {
  // console.log(req.query);

  const { hoTen, soSoBhxh } = req.query;

  // Nếu cả hai đều rỗng thì trả về danh sách rỗng
  const isHoTenEmpty = !hoTen || hoTen.trim() === "";
  const isSoSoEmpty = !soSoBhxh || soSoBhxh.trim() === "";

  if (isHoTenEmpty && isSoSoEmpty) {
    return res.json({
      success: true,
      data: [], // Không truy vấn gì cả
    });
  }

  try {
    await pool.connect();

    let query = `SELECT * FROM dulieuthe WHERE 1=1`;
    const request = pool.request();

    if (!isHoTenEmpty) {
      query += ` AND hoTen LIKE @hoTen`;
      request.input("hoTen", `%${hoTen.trim()}%`);
    }

    if (!isSoSoEmpty) {
      query += ` AND soSoBhxh = @soSoBhxh`;
      request.input("soSoBhxh", soSoBhxh.trim());
    }

    const result = await request.query(query);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error("Lỗi khi tìm kiếm dulieuthe:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tìm kiếm dữ liệu",
      error,
    });
  }
});

// quản lý biên lai
router.get("/bienlai-search", async (req, res) => {
  // console.log(req.query);

  try {
    const {
      active,
      ngaykekhai,
      ngaykekhaiden,
      masobhxh,
      hoten,
      tendaily,
      loaihinh,
      page = 1,
      limit = 30,
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offset = (pageNumber - 1) * limitNumber;

    let query = `SELECT * FROM bienlaidientu WHERE 1=1`;
    let queryCount = `SELECT COUNT(*) AS totalCount FROM bienlaidientu WHERE 1=1`;

    const request = pool.request();

    if (active === "1" || active === "0") {
      query += " AND active = @active";
      queryCount += " AND active = @active";
      request.input("active", active === "1" ? 1 : 0);
    }

    if (ngaykekhai && !ngaykekhaiden) {
      query += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaybienlai, 105)) = @ngaykekhai`;
      queryCount += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaybienlai, 105)) = @ngaykekhai`;
      request.input("ngaykekhai", new Date(ngaykekhai));
    }

    if (ngaykekhai && ngaykekhaiden) {
      query += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaybienlai, 105)) BETWEEN @ngaykekhai AND @ngaykekhaiden`;
      queryCount += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaybienlai, 105)) BETWEEN @ngaykekhai AND @ngaykekhaiden`;
      request.input("ngaykekhai", new Date(ngaykekhai));
      request.input("ngaykekhaiden", new Date(ngaykekhaiden));
    }

    if (masobhxh) {
      query += " AND masobhxh = @masobhxh";
      queryCount += " AND masobhxh = @masobhxh";
      request.input("masobhxh", masobhxh.trim());
    }

    if (hoten) {
      query += " AND hoten LIKE @hoten";
      queryCount += " AND hoten LIKE @hoten";
      request.input("hoten", `%${hoten.trim()}%`);
    }

    if (tendaily) {
      query += " AND tendaily LIKE @tendaily";
      queryCount += " AND tendaily LIKE @tendaily";
      request.input("tendaily", `%${tendaily.trim()}%`);
    }

    if (loaihinh) {
      query += " AND loaihinh = @loaihinh";
      queryCount += " AND loaihinh = @loaihinh";
      request.input("loaihinh", loaihinh);
    }

    query += ` ORDER BY _id DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    request.input("offset", offset);
    request.input("limit", limitNumber);

    await pool.connect();

    const result = await request.query(query);

    // Tính count
    const countRequest = pool.request();
    if (active === "1" || active === "0")
      countRequest.input("active", active === "1" ? 1 : 0);
    if (ngaykekhai && !ngaykekhaiden)
      countRequest.input("ngaykekhai", new Date(ngaykekhai));
    if (ngaykekhai && ngaykekhaiden) {
      countRequest.input("ngaykekhai", new Date(ngaykekhai));
      countRequest.input("ngaykekhaiden", new Date(ngaykekhaiden));
    }
    if (masobhxh) countRequest.input("masobhxh", masobhxh.trim());
    if (hoten) countRequest.input("hoten", `%${hoten.trim()}%`);
    if (tendaily) countRequest.input("tendaily", `%${tendaily.trim()}%`);
    if (loaihinh) countRequest.input("loaihinh", loaihinh);

    const countResult = await countRequest.query(queryCount);
    const totalCount = countResult.recordset[0].totalCount;
    const totalPages = Math.ceil(totalCount / limitNumber);

    const info = {
      count: totalCount,
      pages: totalPages,
      next:
        pageNumber < totalPages
          ? `${req.path}?page=${pageNumber + 1}&limit=${limit}`
          : null,
      prev:
        pageNumber > 1
          ? `${req.path}?page=${pageNumber - 1}&limit=${limit}`
          : null,
    };

    res.json({ info, results: result.recordset });

    // console.log("Query cuối:", query);
    // console.log("Input:", req.query);
  } catch (err) {
    console.error("Lỗi tìm kiếm biên lai:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    pool.close();
  }
});

// quản lý biên lai từng điểm thu
router.get("/bienlai-search-diemthu", async (req, res) => {
  // console.log(req.query);

  try {
    const {
      active,
      ngaykekhai,
      ngaykekhaiden,
      masobhxh,
      hoten,
      loaihinh,
      cccd,
      page = 1,
      limit = 30,
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offset = (pageNumber - 1) * limitNumber;

    let query = `SELECT * FROM bienlaidientu WHERE cccd_nguoithutien = '${cccd}'`;
    let queryCount = `SELECT COUNT(*) AS totalCount FROM bienlaidientu WHERE cccd_nguoithutien = '${cccd}'`;

    const request = pool.request();

    if (active === "1" || active === "0") {
      query += " AND active = @active";
      queryCount += " AND active = @active";
      request.input("active", active === "1" ? 1 : 0);
    }

    if (ngaykekhai && !ngaykekhaiden) {
      query += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaybienlai, 105)) = @ngaykekhai`;
      queryCount += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaybienlai, 105)) = @ngaykekhai`;
      request.input("ngaykekhai", new Date(ngaykekhai));
    }

    if (ngaykekhai && ngaykekhaiden) {
      query += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaybienlai, 105)) BETWEEN @ngaykekhai AND @ngaykekhaiden`;
      queryCount += ` AND CONVERT(DATE, TRY_CONVERT(datetime, ngaybienlai, 105)) BETWEEN @ngaykekhai AND @ngaykekhaiden`;
      request.input("ngaykekhai", new Date(ngaykekhai));
      request.input("ngaykekhaiden", new Date(ngaykekhaiden));
    }

    if (masobhxh) {
      query += " AND masobhxh = @masobhxh";
      queryCount += " AND masobhxh = @masobhxh";
      request.input("masobhxh", masobhxh.trim());
    }

    if (hoten) {
      query += " AND hoten LIKE @hoten";
      queryCount += " AND hoten LIKE @hoten";
      request.input("hoten", `%${hoten.trim()}%`);
    }

    if (loaihinh) {
      query += " AND loaihinh = @loaihinh";
      queryCount += " AND loaihinh = @loaihinh";
      request.input("loaihinh", loaihinh);
    }

    query += ` ORDER BY _id DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    request.input("offset", offset);
    request.input("limit", limitNumber);

    await pool.connect();

    const result = await request.query(query);

    // Tính count
    const countRequest = pool.request();
    if (active === "1" || active === "0")
      countRequest.input("active", active === "1" ? 1 : 0);
    if (ngaykekhai && !ngaykekhaiden)
      countRequest.input("ngaykekhai", new Date(ngaykekhai));
    if (ngaykekhai && ngaykekhaiden) {
      countRequest.input("ngaykekhai", new Date(ngaykekhai));
      countRequest.input("ngaykekhaiden", new Date(ngaykekhaiden));
    }
    if (masobhxh) countRequest.input("masobhxh", masobhxh.trim());
    if (hoten) countRequest.input("hoten", `%${hoten.trim()}%`);
    if (loaihinh) countRequest.input("loaihinh", loaihinh);

    const countResult = await countRequest.query(queryCount);
    const totalCount = countResult.recordset[0].totalCount;
    const totalPages = Math.ceil(totalCount / limitNumber);

    const info = {
      count: totalCount,
      pages: totalPages,
      next:
        pageNumber < totalPages
          ? `${req.path}?page=${pageNumber + 1}&limit=${limit}`
          : null,
      prev:
        pageNumber > 1
          ? `${req.path}?page=${pageNumber - 1}&limit=${limit}`
          : null,
    };

    res.json({ info, results: result.recordset });

    // console.log("Query cuối:", query);
    // console.log("Input:", req.query);
  } catch (err) {
    console.error("Lỗi tìm kiếm biên lai:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    pool.close();
  }
});

// HÀM TÌM THÔNG TIN MỚI
let token = null;

async function getValidToken() {
  if (!token) return await login();
  try {
    const decoded = jwt_decode(token);
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp > now) return token;
    return await login();
  } catch (e) {
    return await login();
  }
}

async function login() {
  try {
    const res = await axios.post("https://luongvinh.com/api/v1/auth/login", {
      // username: "3002225999_042182001769_thanhhoanggiatranthihang",
      // password: "123456@a",
      username: "042301002670",
      password: "456789@a",
      email: "",
      fullName: "",
      confirm_password: "",
    });
    token = res.data?.token || res.data?.data?.token;
    return token;
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    return null;
  }
}

// 🧠 API Tìm Thông Tin
router.post("/getinfo", async (req, res) => {
  // console.log('start')
  const { masobhxh } = req.body;
  if (!masobhxh)
    return res
      .status(400)
      .json({ success: false, error: "Thiếu dữ liệu gửi lên" });
  console.log(masobhxh);
  try {
    const validToken = await getValidToken();
    console.log(validToken);
    if (!validToken)
      return res
        .status(401)
        .json({ success: false, error: "Không lấy được token" });

    const apiUrl = `https://luongvinh.com/api/v1/kekhai/autocomplete/ar/${masobhxh}`;
    const result = await axios.get(apiUrl, {
      headers: { Authorization: `Bearer ${validToken}` },
    });

    if (!result.data.success)
      throw new Error("Dữ liệu trả về không thành công");

    const data = result.data.data.data;
    // console.log(data)
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Không tìm được thông tin" });
  }
});

// 🧠 API Tìm Thông Tin
router.post("/getinfo-bhxh", async (req, res) => {
  // console.log('start')
  const { masobhxh } = req.body;
  if (!masobhxh)
    return res
      .status(400)
      .json({ success: false, error: "Thiếu dữ liệu gửi lên" });
  console.log(masobhxh);
  try {
    const validToken = await getValidToken();
    if (!validToken)
      return res
        .status(401)
        .json({ success: false, error: "Không lấy được token" });

    const apiUrl = `https://luongvinh.com/api/v1/kekhai/autocomplete/is/${masobhxh}`;
    const result = await axios.get(apiUrl, {
      headers: { Authorization: `Bearer ${validToken}` },
    });

    if (!result.data.success)
      throw new Error("Dữ liệu trả về không thành công");

    const data = result.data.data.data;
    // console.log(data)
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Không tìm được thông tin" });
  }
});

router.get("/danhsachdaily", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .query(`select _id, name, cccd from users where _id <> 663 and role<> 9`);
    const hs = result.recordset;
    res.json({
      success: true,
      hs,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// code mới ngày 3/8/2025 - Code trợ lý cá nhân
router.get("/hosocanhbaodenhanbhyt", async (req, res) => {
  try {
    const { cccd } = req.query;

    if (!cccd || cccd.length !== 12) {
      return res.status(400).json({ success: false, message: "Thiếu hoặc sai CCCD" });
    }

    const poolConn = await pool.connect();
    const result = await poolConn
      .request()
      .input("cccd", cccd)
      .query(`
        SELECT top 10 *
        FROM kekhai
        WHERE
          maloaihinh <> 'IS' AND maloaihinh <> 'IL'
          AND RIGHT(sohoso, 12) = @cccd
          AND TRY_CONVERT(DATE, denngay, 103) IS NOT NULL
          AND DATEDIFF(DAY, GETDATE(), TRY_CONVERT(DATE, denngay, 103)) BETWEEN 0 AND 30
        ORDER BY TRY_CONVERT(DATE, denngay, 103) ASC
      `);

    const hs = result.recordset;
    res.json({ success: true, hs });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/hosocanhbaodenhanbhyt-tonghop", async (req, res) => {
  try {
    const poolConn = await pool.connect();
    const result = await poolConn
      .request()
      .query(`
        SELECT top 10 *
        FROM kekhai
        WHERE
          maloaihinh <> 'IS' AND maloaihinh <> 'IL'
          AND TRY_CONVERT(DATE, denngay, 103) IS NOT NULL
          AND DATEDIFF(DAY, GETDATE(), TRY_CONVERT(DATE, denngay, 103)) BETWEEN 0 AND 30
        ORDER BY TRY_CONVERT(DATE, denngay, 103) ASC
      `);

    const hs = result.recordset;
    res.json({ success: true, hs });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/hosocanhbaodenhanbhxh", async (req, res) => {
  try {
    const { cccd } = req.query;

    if (!cccd || cccd.length !== 12) {
      return res.status(400).json({ success: false, message: "Thiếu hoặc sai CCCD" });
    }

    const poolConn = await pool.connect();
    const result = await poolConn
      .request()
      .input("cccd", cccd)
      .query(`
        SELECT top 10 *
        FROM kekhai
        WHERE
          maloaihinh = 'IS'
          AND RIGHT(sohoso, 12) = @cccd
          AND TRY_CONVERT(DATE, '01/' + denthang, 103) IS NOT NULL
          AND DATEDIFF(
            DAY,
            GETDATE(),
            EOMONTH(TRY_CONVERT(DATE, '01/' + denthang, 103))
          ) BETWEEN 0 AND 30
        ORDER BY EOMONTH(TRY_CONVERT(DATE, '01/' + denthang, 103)) ASC
      `);

    const hs = result.recordset;
    res.json({ success: true, hs });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/hosocanhbaodenhanbhxh-tonghop", async (req, res) => {
  try {
    const poolConn = await pool.connect();
    const result = await poolConn
      .request()
      .query(`
        SELECT top 10 *
        FROM kekhai
        WHERE
          maloaihinh = 'IS'
          AND TRY_CONVERT(DATE, '01/' + denthang, 103) IS NOT NULL
          AND DATEDIFF(
            DAY,
            GETDATE(),
            EOMONTH(TRY_CONVERT(DATE, '01/' + denthang, 103))
          ) BETWEEN 0 AND 30
        ORDER BY EOMONTH(TRY_CONVERT(DATE, '01/' + denthang, 103)) ASC
      `);

    const hs = result.recordset;
    res.json({ success: true, hs });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/baocaotaichinhcanhan", async (req, res) => {
  try {
    const { cccd, thang, nam } = req.query;
    // console.log(thang, nam)
    if (!cccd || cccd.length !== 12) {
      return res.status(400).json({ success: false, message: "Thiếu hoặc sai CCCD" });
    }

    const thangInt = parseInt(thang);
    const namInt = parseInt(nam);

    if (
      isNaN(thangInt) || thangInt < 1 || thangInt > 12 ||
      isNaN(namInt) || namInt < 2000 || namInt > 2100
    ) {
      return res.status(400).json({ success: false, message: "Tháng/năm không hợp lệ" });
    }

    const poolConn = await pool.connect();
    const result = await poolConn
      .request()
      .input("cccd", cccd)
      .input("thang", thangInt)
      .input("nam", namInt)
      .query(`
        SELECT 
          maloaihinh,
          tenloaihinh,
          COUNT(*) AS sohoso,
          SUM(CAST(sotien AS FLOAT)) AS tongtien
        FROM kekhai
        WHERE 
          MONTH(TRY_CONVERT(DATE, ngaykekhai, 103)) = @thang AND
          YEAR(TRY_CONVERT(DATE, ngaykekhai, 103)) = @nam AND
          RIGHT(sohoso, 12) = @cccd
        GROUP BY maloaihinh, tenloaihinh
      `);

    const hs = result.recordset;
    res.json({ success: true, hs });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/baocaotaichinhtonghop", async (req, res) => {
  try {
    const { thang, nam } = req.query;

    const thangInt = parseInt(thang);
    const namInt = parseInt(nam);

    if (
      isNaN(thangInt) || thangInt < 1 || thangInt > 12 ||
      isNaN(namInt) || namInt < 2000 || namInt > 2100
    ) {
      return res.status(400).json({ success: false, message: "Tháng/năm không hợp lệ" });
    }

    const poolConn = await pool.connect();
    const result = await poolConn
      .request()
      .input("thang", thangInt)
      .input("nam", namInt)
      .query(`
        SELECT 
          maloaihinh,
          tenloaihinh,
          COUNT(*) AS sohoso,
          SUM(CAST(sotien AS FLOAT)) AS tongtien
        FROM kekhai
        WHERE 
          MONTH(TRY_CONVERT(DATE, ngaykekhai, 103)) = @thang AND
          YEAR(TRY_CONVERT(DATE, ngaykekhai, 103)) = @nam
        GROUP BY maloaihinh, tenloaihinh
      `);

    const hs = result.recordset;
    res.json({ success: true, hs });
  } catch (error) {
    res.status(500).json(error);
  }
});



module.exports = router;
