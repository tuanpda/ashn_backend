const express = require("express");
const router = express.Router();
const { pool } = require("../database/dbinfo");
const { Transaction } = require("mssql");
const xlsx = require("xlsx");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

// var folderFileUpload = "D:\\code\\tcdvthu_server\\public\\fileimport";
var folderFileUpload =
  "E:\\CODE_APP\\TCDVTHU\\tcdvthu_server\\public\\fileimport";
var urlServer = "192.168.1.5:81";

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    /* Nhớ sửa đường dẫn khi deploy lên máy chủ */
    // đường dẫn cho máy dev MacOS
    // cb(
    //   null,
    //   "/Users/apple/Documents/code/p_Tcdvthu/tcdvthu_server/public/fileimport"
    // );
    // đường dẫn khi deploy máy chủ PHỦ DIỄN
    cb(null, folderFileUpload);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Cấu hình Multer để lưu file vào thư mục "uploads"
const upload = multer({
  dest: "uploads/", // Thư mục lưu file
  limits: {
    fileSize: 50 * 1024 * 1024, // Giới hạn kích thước file (50MB)
  },
});

router.post("/import-file", (req, res) => {
  try {
    console.log("done");

    res.json({
      success: true,
      message: "Quá trình xử lý hoàn tất",
    });
  } catch (error) {}
});

router.post("/add-nguoithamgia", async (req, res) => {
  let dataNtg = req.body;
  let transaction = null;
  let dataExist = [];
  // console.log(dataNtg);

  try {
    // bắt đầu kết nối
    await pool.connect();

    //
    const resExist = await pool
      .request()
      .query("SELECT MaSoBhxh FROM quanlynguoihuong");

    // console.log(resExist.recordset);
    dataExist = resExist.recordset;

    // Kiểm tra nếu MaSoBhxh đã tồn tại
    const isExist = dataExist.some(
      (item) => String(item.MaSoBhxh).trim() === String(dataNtg.MaSoBhxh).trim()
    );

    // console.log(isExist);

    if (isExist) {
      return res.status(200).json({
        success: 5,
        message: "Mã số BHXH đã tồn tại, không thể thêm mới.",
      });
    }

    try {
      // Bắt đầu giao dịch
      transaction = new Transaction(pool);
      await transaction.begin();
      await transaction
        .request()
        .input("STT_HSNS", dataNtg.STT_HSNS)
        .input("MaSoBhxh", dataNtg.MaSoBhxh)
        .input("HoTen", dataNtg.HoTen)
        .input("SoSoBhxh", dataNtg.SoSoBhxh)
        .input("NgaySinh", dataNtg.NgaySinh)
        .input("ChiCoNamSinh", dataNtg.ChiCoNamSinh)
        .input("GioiTinh", dataNtg.GioiTinh)
        .input("SoTheBhyt", dataNtg.SoTheBhyt)
        .input("Cmnd", dataNtg.Cmnd)
        .input("NgayCapCmnd", dataNtg.NgayCapCmnd)
        .input("NoiCapCmnd", dataNtg.NoiCapCmnd)
        .input("DienThoai", dataNtg.DienThoai)
        .input("DanTocId", dataNtg.DanTocId)
        .input("QuocTichId", dataNtg.QuocTichId)
        .input("KhaiSinhTinhId", dataNtg.KhaiSinhTinhId)
        .input("KhaiSinhHuyenId", dataNtg.KhaiSinhHuyenId)
        .input("KhaiSinhXaId", dataNtg.KhaiSinhXaId)
        .input("HoKhauTinhId", dataNtg.HoKhauTinhId)
        .input("HoKhauHuyenId", dataNtg.HoKhauHuyenId)
        .input("HoKhauXaId", dataNtg.HoKhauXaId)
        .input("DiaChiHoKhau", dataNtg.DiaChiHoKhau)
        .input("DiaChiTinhId", dataNtg.DiaChiTinhId)
        .input("DiaChiHuyenId", dataNtg.DiaChiHuyenId)
        .input("DiaChiXaId", dataNtg.DiaChiXaId)
        .input("DiaChiSinhSong", dataNtg.DiaChiSinhSong)
        .input("TinhKhamChuaBenhId", dataNtg.TinhKhamChuaBenhId)
        .input("NoiKhamChuaBenh", dataNtg.NoiKhamChuaBenh)
        .input("ChucVu", dataNtg.ChucVu)
        .input("TrangThaiCongTac", dataNtg.TrangThaiCongTac)
        .input("NoiSinh", dataNtg.NoiSinh)
        .input("MucLuong", dataNtg.MucLuong)
        .input("HeSoLuongCoBan", dataNtg.HeSoLuongCoBan)
        .input("PhuCapChucVu", dataNtg.PhuCapChucVu)
        .input("PhuCapThamNienVuotKhung", dataNtg.PhuCapThamNienVuotKhung)
        .input("PhuCapThamNienNghe", dataNtg.PhuCapThamNienNghe)
        .input("LoaiHopDong", dataNtg.LoaiHopDong)
        .input("PhuCapLuong", dataNtg.PhuCapLuong)
        .input("CacKhoanBoSung", dataNtg.CacKhoanBoSung)
        .input("SoTaiKhoan", dataNtg.SoTaiKhoan)
        .input("TenChuTaiKhoan", dataNtg.TenChuTaiKhoan)
        .input("MaTinh_NH", dataNtg.MaTinh_NH)
        .input("MaNganHang", dataNtg.MaNganHang)
        .input("NguoiGiamHo", dataNtg.NguoiGiamHo)
        .input("DienThoaiChuHo", dataNtg.DienThoaiChuHo)
        .input("MaSoHoGiaDinh", dataNtg.MaSoHoGiaDinh)
        .input("HoTenChuHo", dataNtg.HoTenChuHo)
        .input("SoGiayTo", dataNtg.SoGiayTo)
        .input("LoaiGiayToId", dataNtg.LoaiGiayToId)
        .input("ChuHoTinhId", dataNtg.ChuHoTinhId)
        .input("ChuHoHuyenId", dataNtg.ChuHoHuyenId)
        .input("ChuHoXaId", dataNtg.ChuHoXaId)
        .input("ChuHoThonId", dataNtg.ChuHoThonId)
        .input("KEY_Hosonhansu", dataNtg.KEY_Hosonhansu)
        .input("ngayip", dataNtg.ngayip)
        .input("nguoiip", dataNtg.nguoiip).query(`
                  INSERT INTO quanlynguoihuong (STT_HSNS, MaSoBhxh, HoTen, SoSoBhxh, NgaySinh, ChiCoNamSinh, GioiTinh, SoTheBhyt,
                  Cmnd, NgayCapCmnd, NoiCapCmnd, DienThoai, DanTocId, QuocTichId, KhaiSinhTinhId, KhaiSinhHuyenId, KhaiSinhXaId,
                  HoKhauTinhId, HoKhauHuyenId, HoKhauXaId, DiaChiHoKhau, DiaChiTinhId, DiaChiHuyenId, DiaChiXaId,
                  DiaChiSinhSong, TinhKhamChuaBenhId, NoiKhamChuaBenh, ChucVu, TrangThaiCongTac, NoiSinh, MucLuong, HeSoLuongCoBan,
                  PhuCapChucVu, PhuCapThamNienVuotKhung, PhuCapThamNienNghe, LoaiHopDong, PhuCapLuong, CacKhoanBoSung,
                  SoTaiKhoan, TenChuTaiKhoan, MaTinh_NH, MaNganHang, NguoiGiamHo, DienThoaiChuHo, MaSoHoGiaDinh, HoTenChuHo,
                  SoGiayTo, LoaiGiayToId, ChuHoTinhId, ChuHoHuyenId, ChuHoXaId, ChuHoThonId, KEY_Hosonhansu, ngayip, nguoiip)
                  VALUES (@STT_HSNS, @MaSoBhxh, @HoTen, @SoSoBhxh, @NgaySinh, @ChiCoNamSinh, @GioiTinh, @SoTheBhyt,
                  @Cmnd, @NgayCapCmnd, @NoiCapCmnd, @DienThoai, @DanTocId, @QuocTichId, @KhaiSinhTinhId, @KhaiSinhHuyenId, @KhaiSinhXaId,
                  @HoKhauTinhId, @HoKhauHuyenId, @HoKhauXaId, @DiaChiHoKhau, @DiaChiTinhId, @DiaChiHuyenId, @DiaChiXaId,
                  @DiaChiSinhSong, @TinhKhamChuaBenhId, @NoiKhamChuaBenh, @ChucVu, @TrangThaiCongTac, @NoiSinh, @MucLuong, @HeSoLuongCoBan,
                  @PhuCapChucVu, @PhuCapThamNienVuotKhung, @PhuCapThamNienNghe, @LoaiHopDong, @PhuCapLuong, @CacKhoanBoSung,
                  @SoTaiKhoan, @TenChuTaiKhoan, @MaTinh_NH, @MaNganHang, @NguoiGiamHo, @DienThoaiChuHo, @MaSoHoGiaDinh, @HoTenChuHo,
                  @SoGiayTo, @LoaiGiayToId, @ChuHoTinhId, @ChuHoHuyenId, @ChuHoXaId, @ChuHoThonId, @KEY_Hosonhansu, @ngayip, @nguoiip);
              `);

      // Commit transaction nếu không có lỗi
      await transaction.commit();
    } catch (err) {
      // Rollback transaction nếu có lỗi
      if (transaction) {
        await transaction.rollback();
        console.log(err);
      }
    }

    // Trả về kết quả
    res.json({
      success: true,
      message: "Quá trình xử lý hoàn tất",
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

router.post("/importNtg", async (req, res) => {
  let dataBody = req.body;
  let transaction = null;
  let dataExist = [];
  // console.log(dataBody[0]);

  let dataNtg = dataBody[0];

  try {
    // bắt đầu kết nối
    await pool.connect();

    //
    const resExist = await pool.request().query("SELECT MaSoBhxh FROM ntg");

    // console.log(resExist.recordset);
    dataExist = resExist.recordset;

    // Kiểm tra nếu MaSoBhxh đã tồn tại
    const isExist = dataExist.some(
      (item) => String(item.MaSoBhxh).trim() === String(dataNtg.MaSoBhxh).trim()
    );

    // console.log(isExist);

    if (isExist) {
      return res.status(200).json({
        success: 5,
        message: "Mã số BHXH đã tồn tại, không thể thêm mới.",
      });
    }

    try {
      // Bắt đầu giao dịch
      transaction = new Transaction(pool);
      await transaction.begin();
      await transaction
        .request()
        .input("STT_HSNS", dataNtg.STT_HSNS)
        .input("MaSoBhxh", dataNtg.MaSoBhxh)
        .input("HoTen", dataNtg.HoTen)
        .input("SoSoBhxh", dataNtg.SoSoBhxh)
        .input("NgaySinh", dataNtg.NgaySinh)
        .input("ChiCoNamSinh", dataNtg.ChiCoNamSinh)
        .input("GioiTinh", dataNtg.GioiTinh)
        .input("SoTheBhyt", dataNtg.SoTheBhyt)
        .input("Cmnd", dataNtg.Cmnd)
        .input("NgayCapCmnd", dataNtg.NgayCapCmnd)
        .input("NoiCapCmnd", dataNtg.NoiCapCmnd)
        .input("DienThoai", dataNtg.DienThoai)
        .input("DanTocId", dataNtg.DanTocId)
        .input("QuocTichId", dataNtg.QuocTichId)
        .input("KhaiSinhTinhId", dataNtg.KhaiSinhTinhId)
        .input("KhaiSinhHuyenId", dataNtg.KhaiSinhHuyenId)
        .input("KhaiSinhXaId", dataNtg.KhaiSinhXaId)
        .input("HoKhauTinhId", dataNtg.HoKhauTinhId)
        .input("HoKhauHuyenId", dataNtg.HoKhauHuyenId)
        .input("HoKhauXaId", dataNtg.HoKhauXaId)
        .input("DiaChiHoKhau", dataNtg.DiaChiHoKhau)
        .input("DiaChiTinhId", dataNtg.DiaChiTinhId)
        .input("DiaChiHuyenId", dataNtg.DiaChiHuyenId)
        .input("DiaChiXaId", dataNtg.DiaChiXaId)
        .input("DiaChiSinhSong", dataNtg.DiaChiSinhSong)
        .input("TinhKhamChuaBenhId", dataNtg.TinhKhamChuaBenhId)
        .input("NoiKhamChuaBenh", dataNtg.NoiKhamChuaBenh)
        .input("ChucVu", dataNtg.ChucVu)
        .input("TrangThaiCongTac", dataNtg.TrangThaiCongTac)
        .input("NoiSinh", dataNtg.NoiSinh)
        .input("MucLuong", dataNtg.MucLuong)
        .input("HeSoLuongCoBan", dataNtg.HeSoLuongCoBan)
        .input("PhuCapChucVu", dataNtg.PhuCapChucVu)
        .input("PhuCapThamNienVuotKhung", dataNtg.PhuCapThamNienVuotKhung)
        .input("PhuCapThamNienNghe", dataNtg.PhuCapThamNienNghe)
        .input("LoaiHopDong", dataNtg.LoaiHopDong)
        .input("PhuCapLuong", dataNtg.PhuCapLuong)
        .input("CacKhoanBoSung", dataNtg.CacKhoanBoSung)
        .input("SoTaiKhoan", dataNtg.SoTaiKhoan)
        .input("TenChuTaiKhoan", dataNtg.TenChuTaiKhoan)
        .input("MaTinh_NH", dataNtg.MaTinh_NH)
        .input("MaNganHang", dataNtg.MaNganHang)
        .input("NguoiGiamHo", dataNtg.NguoiGiamHo)
        .input("DienThoaiChuHo", dataNtg.DienThoaiChuHo)
        .input("MaSoHoGiaDinh", dataNtg.MaSoHoGiaDinh)
        .input("HoTenChuHo", dataNtg.HoTenChuHo)
        .input("SoGiayTo", dataNtg.SoGiayTo)
        .input("LoaiGiayToId", dataNtg.LoaiGiayToId)
        .input("ChuHoTinhId", dataNtg.ChuHoTinhId)
        .input("ChuHoHuyenId", dataNtg.ChuHoHuyenId)
        .input("ChuHoXaId", dataNtg.ChuHoXaId)
        .input("ChuHoThonId", dataNtg.ChuHoThonId)
        .input("KEY_Hosonhansu", dataNtg.KEY_Hosonhansu)
        .input("ngayip", dataNtg.ngayip)
        .input("nguoiip", dataNtg.nguoiip).query(`
                  INSERT INTO ntg (STT_HSNS, MaSoBhxh, HoTen, SoSoBhxh, NgaySinh, ChiCoNamSinh, GioiTinh, SoTheBhyt,
                  Cmnd, NgayCapCmnd, NoiCapCmnd, DienThoai, DanTocId, QuocTichId, KhaiSinhTinhId, KhaiSinhHuyenId, KhaiSinhXaId,
                  HoKhauTinhId, HoKhauHuyenId, HoKhauXaId, DiaChiHoKhau, DiaChiTinhId, DiaChiHuyenId, DiaChiXaId,
                  DiaChiSinhSong, TinhKhamChuaBenhId, NoiKhamChuaBenh, ChucVu, TrangThaiCongTac, NoiSinh, MucLuong, HeSoLuongCoBan,
                  PhuCapChucVu, PhuCapThamNienVuotKhung, PhuCapThamNienNghe, LoaiHopDong, PhuCapLuong, CacKhoanBoSung,
                  SoTaiKhoan, TenChuTaiKhoan, MaTinh_NH, MaNganHang, NguoiGiamHo, DienThoaiChuHo, MaSoHoGiaDinh, HoTenChuHo,
                  SoGiayTo, LoaiGiayToId, ChuHoTinhId, ChuHoHuyenId, ChuHoXaId, ChuHoThonId, KEY_Hosonhansu, ngayip, nguoiip)
                  VALUES (@STT_HSNS, @MaSoBhxh, @HoTen, @SoSoBhxh, @NgaySinh, @ChiCoNamSinh, @GioiTinh, @SoTheBhyt,
                  @Cmnd, @NgayCapCmnd, @NoiCapCmnd, @DienThoai, @DanTocId, @QuocTichId, @KhaiSinhTinhId, @KhaiSinhHuyenId, @KhaiSinhXaId,
                  @HoKhauTinhId, @HoKhauHuyenId, @HoKhauXaId, @DiaChiHoKhau, @DiaChiTinhId, @DiaChiHuyenId, @DiaChiXaId,
                  @DiaChiSinhSong, @TinhKhamChuaBenhId, @NoiKhamChuaBenh, @ChucVu, @TrangThaiCongTac, @NoiSinh, @MucLuong, @HeSoLuongCoBan,
                  @PhuCapChucVu, @PhuCapThamNienVuotKhung, @PhuCapThamNienNghe, @LoaiHopDong, @PhuCapLuong, @CacKhoanBoSung,
                  @SoTaiKhoan, @TenChuTaiKhoan, @MaTinh_NH, @MaNganHang, @NguoiGiamHo, @DienThoaiChuHo, @MaSoHoGiaDinh, @HoTenChuHo,
                  @SoGiayTo, @LoaiGiayToId, @ChuHoTinhId, @ChuHoHuyenId, @ChuHoXaId, @ChuHoThonId, @KEY_Hosonhansu, @ngayip, @nguoiip);
              `);

      // Commit transaction nếu không có lỗi
      await transaction.commit();
    } catch (err) {
      // Rollback transaction nếu có lỗi
      if (transaction) {
        await transaction.rollback();
        console.log(err);
      }
    }

    // Trả về kết quả
    res.json({
      success: true,
      message: "Quá trình xử lý hoàn tất",
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

// tim nguoi huong theo ma so bhxh
router.get("/find-nguoihuong", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("MaSoBhxh", req.query.MaSoBhxh)
      .query(
        `SELECT * FROM quanlynguoihuong where MaSoBhxh=@MaSoBhxh and MaSoBhxh<>''`
      );
    const nguoihuong = result.recordset;
    res.json(nguoihuong);
  } catch (error) {
    res.status(500).json(error);
  }
});

// tim nguoi huong theo cccd
router.get("/find-nguoihuong-cccd", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("cccd", req.query.cccd)
      .query(`SELECT * FROM quanlynguoihuong where cccd=@cccd`);
    const nguoihuong = result.recordset;
    res.json(nguoihuong);
  } catch (error) {
    res.status(500).json(error);
  }
});

// tim nguoi huong theo ma so bhxh trong dữ liệu tự nguyện
router.get("/find-nguoihuong-masobhxh-theodulieutunguyen", async (req, res) => {
  // console.log(req.query);

  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("soBhxh", req.query.soBhxh)
      .query(
        `SELECT * FROM dulieutunguyen WHERE soBhxh = @soBhxh AND soBhxh <> ''`
      );

    const nguoihuong = result.recordset;
    // console.log(result.recordset);

    res.status(200).json({
      success: nguoihuong.length > 0,
      message:
        nguoihuong.length > 0 ? "Tìm thấy người hưởng" : "Không có dữ liệu",
      data: nguoihuong,
    });
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    res.status(200).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// tim nguoi huong theo ma so bhxh trong dữ liệu tham gia
router.get("/find-nguoihuong-masobhxh-theodstg", async (req, res) => {
  // console.log(req.query);

  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("soBhxh", req.query.soBhxh)
      .query(`SELECT * FROM dstg WHERE soBhxh = @soBhxh AND soBhxh <> ''`);

    const nguoihuong = result.recordset;
    // console.log(result.recordset);

    res.status(200).json({
      success: nguoihuong.length > 0,
      message:
        nguoihuong.length > 0 ? "Tìm thấy người hưởng" : "Không có dữ liệu",
      data: nguoihuong,
    });
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    res.status(200).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// tim hạn thẻ người hưởng
router.get("/find-nguoihuong-masobhxh-theodstg-timhanthe", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("soSoBhxh", req.query.soSoBhxh)
      .query(
        `SELECT * FROM dulieuthe where soSoBhxh=@soSoBhxh and soSoBhxh<>''`
      );
    const nguoihuong = result.recordset;
    res.json(nguoihuong);
  } catch (error) {
    res.status(500).json(error);
  }
});

// tim nguoi huong theo cccd
router.get("/find-nguoihuong-cccd-theodstg", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("soCmnd", req.query.soCmnd)
      .query(`SELECT * FROM dstg where soCmnd=@soCmnd`);
    const nguoihuong = result.recordset;
    res.json(nguoihuong);
  } catch (error) {
    res.status(500).json(error);
  }
});

// tìm tên tỉnh theo mã tỉnh
router.get("/find-tentinh", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("matinh", req.query.matinh)
      .query(`SELECT tentinh FROM dm_tinhhuyen where matinh=@matinh`);
    const nguoihuong = result.recordset;
    res.json(nguoihuong);
  } catch (error) {
    res.status(500).json(error);
  }
});

// tìm tên huyện theo mã huyện
router.get("/find-tenhuyen", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("matinh", req.query.matinh)
      .input("maquanhuyen", req.query.maquanhuyen)
      .query(
        `SELECT tenquanhuyen FROM dm_quanhuyen where matinh=@matinh and maquanhuyen=@maquanhuyen`
      );
    const nguoihuong = result.recordset;
    res.json(nguoihuong);
  } catch (error) {
    res.status(500).json(error);
  }
});

// tìm tên xã
router.get("/find-tenxa", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("matinh", req.query.matinh)
      .input("maquanhuyen", req.query.maquanhuyen)
      .input("maxaphuong", req.query.maxaphuong)
      .query(
        `SELECT tenxaphuong FROM dm_xaphuong where matinh=@matinh and maquanhuyen=@maquanhuyen and maxaphuong=@maxaphuong`
      );
    const nguoihuong = result.recordset;
    res.json(nguoihuong);
  } catch (error) {
    res.status(500).json(error);
  }
});

// tìm tên huyện theo mã huyện
router.get("/find-benhvien", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("mabenhvien", req.query.mabenhvien)
      .query(
        `SELECT tenbenhvien FROM dm_benhvien where mabenhvien=@mabenhvien`
      );
    const nguoihuong = result.recordset;
    res.json(nguoihuong);
  } catch (error) {
    res.status(500).json(error);
  }
});

// quan lý lao động phân trang
router.get("/get-all-quanlylaodong-pagi", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Chuyển đổi page thành số nguyên
    const limit = parseInt(req.query.limit, 20) || 20;
    const offset = (page - 1) * limit;
    // console.log(offset);
    // console.log(typeof(offset));

    const HoTen = req.query.HoTen;
    const MaSoBhxh = req.query.MaSoBhxh;

    let queryFirst = `SELECT *
        FROM quanlynguoihuong where 1=1
        `;

    let countQueryFirst = `SELECT count(*) as totalCount
        FROM quanlynguoihuong where 1=1
        `;

    if (HoTen) {
      queryFirst += ` AND HoTen LIKE '%' + @HoTen + '%'`;
      countQueryFirst += ` AND HoTen LIKE '%' + @HoTen + '%'`;
    }

    if (MaSoBhxh) {
      queryFirst += ` AND MaSoBhxh LIKE '%' + @MaSoBhxh + '%'`;
      countQueryFirst += ` AND MaSoBhxh LIKE '%' + @MaSoBhxh + '%'`;
    }

    // Thêm ORDER BY và phân trang vào cuối câu truy vấn
    queryFirst += ` ORDER BY _id DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    await pool.connect();
    const result = await pool
      .request()
      .input("HoTen", HoTen)
      .input("MaSoBhxh", MaSoBhxh)
      .input("offset", offset)
      .input("limit", limit)
      .query(queryFirst);

    const data = result.recordset;

    // Đếm tổng số lượng bản ghi
    const countResult = await pool
      .request()
      .input("HoTen", HoTen)
      .input("MaSoBhxh", MaSoBhxh)
      .query(countQueryFirst);
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

router.get("/tim-kiem-thong-tin-han-the", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Chuyển đổi page thành số nguyên
    const limit = parseInt(req.query.limit, 20) || 20;
    const offset = (page - 1) * limit;
    // console.log(offset);
    // console.log(typeof(offset));

    const hoTen = req.query.hoTen;
    const soSoBhxh = req.query.soSoBhxh;

    let queryFirst = `SELECT *
        FROM dulieuthe where 1=1
        `;

    let countQueryFirst = `SELECT count(*) as totalCount
        FROM dulieuthe where 1=1
        `;

    if (hoTen) {
      queryFirst += ` AND hoTen LIKE '%' + @hoTen + '%'`;
      countQueryFirst += ` AND hoTen LIKE '%' + @hoTen + '%'`;
    }

    if (soSoBhxh) {
      queryFirst += ` AND soSoBhxh LIKE '%' + @soSoBhxh + '%'`;
      countQueryFirst += ` AND soSoBhxh LIKE '%' + @soSoBhxh + '%'`;
    }

    // Thêm ORDER BY và phân trang vào cuối câu truy vấn
    queryFirst += ` ORDER BY ngaySinh OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    await pool.connect();
    const result = await pool
      .request()
      .input("hoTen", hoTen)
      .input("soSoBhxh", soSoBhxh)
      .input("offset", offset)
      .input("limit", limit)
      .query(queryFirst);

    const data = result.recordset;

    // Đếm tổng số lượng bản ghi
    const countResult = await pool
      .request()
      .input("hoTen", hoTen)
      .input("soSoBhxh", soSoBhxh)
      .query(countQueryFirst);
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

router.get("/tim-kiem-thong-tin-hgd", async (req, res) => {
  try {
    const { soBhxh, SO_DDCN_CCCD_BCA } = req.query;

    await pool.connect();

    let result;

    if (soBhxh) {
      result = await pool
        .request()
        .input("soBhxh", soBhxh)
        .query(`SELECT * FROM hosocanhan WHERE soBhxh = @soBhxh`);
    } else {
      result = await pool
        .request()
        .input("SO_DDCN_CCCD_BCA", SO_DDCN_CCCD_BCA)
        .query(
          `SELECT * FROM hosocanhan WHERE SO_DDCN_CCCD_BCA = @SO_DDCN_CCCD_BCA`
        );
    }

    const canhan = result.recordset[0] || null;

    let thongtinHgd = [];

    if (canhan && canhan.maHoGiaDinh) {
      const hoGiaDinhResult = await pool
        .request()
        .input("maHoGiaDinh", canhan.maHoGiaDinh)
        .query(
          `SELECT * FROM hosocanhan WHERE maHoGiaDinh = @maHoGiaDinh order by stt_ho`
        );
      thongtinHgd = hoGiaDinhResult.recordset;
    }

    res.json({
      success: true,
      canhan,
      thongtinHgd,
    });
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
