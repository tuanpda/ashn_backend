const express = require("express");
const router = express.Router();
const { pool } = require("../../database/dbinfo");
const {
  Table,
  NVarChar,
  Int,
  Float,
  Transaction,
  Bit,
  Date,
  DateTime,
} = require("mssql");

let table_name = "kekhai_2902141757";

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
    // console.log(soHoso);

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
      .input("trangthai", req.body.trangthai).query(`
                  INSERT INTO ${table_name} (sohoso, matochuc, tentochuc, madaily, tendaily, maloaihinh, tenloaihinh, hoten, masobhxh, cccd, dienthoai,	
                    maphuongan, tenphuongan, ngaysinh, gioitinh, nguoithu, tienluongcs, sotien,	
                    tylengansachdiaphuong, hotrokhac, tungay, tyledong, muctiendong,	
                    maphuongthucdong, tenphuongthucdong, tuthang, tientunguyendong, tienlai, madoituong,	
                    tendoituong, tylensnnht, tiennsnnht, tylensdp, tiennsdp, matinh, tentinh, maquanhuyen, tenquanhuyen,	
                    maxaphuong, tenxaphuong, benhvientinh, mabenhvien, tenbenhvien, tothon, ghichu,	
                    createdAt, createdBy, updatedAt, updatedBy, dotkekhai, kykekhai, ngaykekhai, trangthai) 
                  VALUES (@sohoso, @matochuc, @tentochuc, @madaily, @tendaily, @maloaihinh, @tenloaihinh, @hoten, @masobhxh, @cccd, @dienthoai,	
                    @maphuongan, @tenphuongan, @ngaysinh, @gioitinh, @nguoithu, @tienluongcs, @sotien,	
                    @tylengansachdiaphuong, @hotrokhac, @tungay, @tyledong, @muctiendong,	
                    @maphuongthucdong, @tenphuongthucdong, @tuthang, @tientunguyendong, @tienlai, @madoituong,	
                    @tendoituong, @tylensnnht, @tiennsnnht, @tylensdp, @tiennsdp, @matinh, @tentinh, @maquanhuyen, @tenquanhuyen,	
                    @maxaphuong, @tenxaphuong, @benhvientinh, @mabenhvien, @tenbenhvien, @tothon, @ghichu,	
                    @createdAt, @createdBy, @updatedAt, @updatedBy, @dotkekhai, @kykekhai, @ngaykekhai, @trangthai);
              `);
    const kekhai = req.body;
    res.json(kekhai);
  } catch (error) {
    res.status(500).json(error);
  }
});

// add ke khai chạy theo bộ
router.post("/add-kekhai-series", async (req, res) => {
  // console.log(req.body);
  let dataKekhai = req.body;
  // console.log(dataKekhai);
  let transaction = null;
  // Tạo mảng để lưu thông tin cần trả lại sau khi thành công
  const listSuccess = [];

  try {
    // bắt đầu kết nối
    await pool.connect();
    // Bắt đầu giao dịch
    transaction = new Transaction(pool);
    await transaction.begin();

    // Lấy số hồ sơ lớn nhất hiện tại để tạo số hồ sơ duy nhất
    const maxSoHoSoResult = await pool
      .request()
      .query(`SELECT MAX(_id) as max_so_ho_so FROM ${table_name}`);
    let maxSohoso = maxSoHoSoResult.recordset[0].max_so_ho_so || 0;

    for (const item of dataKekhai) {
      // Tạo số hồ sơ mới
      const newSoHoSo = maxSohoso + 1;
      const soHoso = `${newSoHoSo}/${item.nvt_masobhxh}/${item.nvt_cccd}`;

      const result = await transaction
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
        .input("tienluongcs", item.tienluongcs)
        .input("sotien", item.sotien)
        .input("tylengansachdiaphuong", item.tylengansachdiaphuong)
        .input("hotrokhac", item.hotrokhac)
        .input("tungay", item.tungay)
        .input("tyledong", item.tyledong)
        .input("muctiendong", item.muctiendong)
        .input("maphuongthucdong", item.maphuongthucdong)
        .input("tenphuongthucdong", item.tenphuongthucdong)
        .input("tuthang", item.tuthang)
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
        .input("sobienlai", item.sobienlai)
        .input("trangthai", item.trangthai).query(`
                  INSERT INTO ${table_name} (sohoso, matochuc, tentochuc, madaily, tendaily, maloaihinh, tenloaihinh, hoten, masobhxh, cccd, dienthoai,	
                    maphuongan, tenphuongan, ngaysinh, gioitinh, nguoithu, tienluongcs, sotien,	
                    tylengansachdiaphuong, hotrokhac, tungay, tyledong, muctiendong,	
                    maphuongthucdong, tenphuongthucdong, tuthang, tientunguyendong, tienlai, madoituong,	
                    tendoituong, tylensnnht, tiennsnnht, tylensdp, tiennsdp, matinh, tentinh, maquanhuyen, tenquanhuyen,	
                    maxaphuong, tenxaphuong, benhvientinh, mabenhvien, tenbenhvien, tothon, ghichu,	
                    createdAt, createdBy, updatedAt, updatedBy, dotkekhai, kykekhai, ngaykekhai, ngaybienlai, sobienlai, trangthai) 
                  VALUES (@sohoso, @matochuc, @tentochuc, @madaily, @tendaily, @maloaihinh, @tenloaihinh, @hoten, @masobhxh, @cccd, @dienthoai,	
                    @maphuongan, @tenphuongan, @ngaysinh, @gioitinh, @nguoithu, @tienluongcs, @sotien,	
                    @tylengansachdiaphuong, @hotrokhac, @tungay, @tyledong, @muctiendong,	
                    @maphuongthucdong, @tenphuongthucdong, @tuthang, @tientunguyendong, @tienlai, @madoituong,	
                    @tendoituong, @tylensnnht, @tiennsnnht, @tylensdp, @tiennsdp, @matinh, @tentinh, @maquanhuyen, @tenquanhuyen,	
                    @maxaphuong, @tenxaphuong, @benhvientinh, @mabenhvien, @tenbenhvien, @tothon, @ghichu,	
                    @createdAt, @createdBy, @updatedAt, @updatedBy, @dotkekhai, @kykekhai, @ngaykekhai, @ngaybienlai, @sobienlai, @trangthai);
              `);

      // Lưu thông tin cần thiết vào danh sách
      listSuccess.push({
        sohoso: soHoso,
        dotkekhai: newSoHoSo,
        kykekhai: item.kykekhai,
        ngaykekhai: item.ngaykekhai,
        trangthai: item.trangthai,
        hoten: item.hoten,
        masobhxh: item.masobhxh,
        ngaysinh: item.ngaysinh,
        gioitinh: item.gioitinh,
        cccd: item.cccd,
        dienthoai: item.dienthoai,
      });
    }

    // Nếu thành công, hoàn thành giao dịch
    await transaction.commit();
    res.json({
      success: true,
      message: "Data inserted successfully",
      data: listSuccess,
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

// đẩy thông tin lên cổng
router.post("/pushinfotoportbhxhvn", async (req, res) => {
  // console.log(req.body);
  let data = req.body;
  let transaction = null;
  // Tạo mảng để lưu thông tin cần trả lại sau khi thành công
  const listSuccess = [];

  try {
    // bắt đầu kết nối
    await pool.connect();
    // Bắt đầu giao dịch
    transaction = new Transaction(pool);
    await transaction.begin();

    for (const item of data) {
      const result = await transaction
        .request()
        .input("maSoBhxh", item.masobhxh)
        .input("hoTen", item.hoten)
        .input("soCccd", item.cccd)
        .input("ngaySinh", item.ngaysinh)
        .input("gioiTinh", item.gioitinh)
        .input("loaiDt", item.tenloaihinh)
        .input("soTien", item.sotien)
        .input("soThang", item.maphuongthucdong)
        .input("maToChucDvt", item.matochuc)
        .input("tenToChucDvt", item.tentochuc)
        .input("maNhanVienThu", item.tentochuc)
        .input("tenNhanVienThu", item.tentochuc)
        .input("maCqBhxh", item.tentochuc)
        .input("tenCqBhxh", item.tentochuc)
        .input("keyfrombhvn", item.tentochuc)
        .input("tuNgay", item.tentochuc)
        .input("denNgay", item.tentochuc).query(`
                    INSERT INTO thongtin (maSoBhxh, hoTen, soCccd, ngaySinh, gioiTinh, loaiDt, soTien, soThang, maToChucDvt, tenToChucDvt, maNhanVienThu,
                      tenNhanVienThu, maCqBhxh, tenCqBhxh, keyfrombhvn, tuNgay, denNgay)
                    VALUES (@maSoBhxh, @hoTen, @soCccd, @ngaySinh, @gioiTinh, @loaiDt, @soTien, @soThang, @maToChucDvt, @tenToChucDvt, @maNhanVienThu,
                      @tenNhanVienThu, @maCqBhxh, @tenCqBhxh, @keyfrombhvn, @tuNgay, @denNgay);
                `);
      // Lưu thông tin cần thiết vào danh sách
      const bodyRes = {
        maLoi: "0",
        moTaLoi: "",
        maXacNhan: "POS0000000002",
        noidung: `BHXH Việt Nam xác nhận: Ông (bà): ${item.hoten}, Số CCCD: ${item.cccd}. Ngày 31/07/2023 đã đóng ${item.sotien} đồng, tương ứng
            quá trình tham gia BHXH từ ngày 31/07/2023 đến ngày
            30/07/2024. Sử dụng MÃ XÁC NHẬN POS0000000002 để
            tra cứu thông tin chi tiết tại địa chỉ https://baoh
            iemxahoi.gov.vn`,
      };
    }

    // Nếu thành công, hoàn thành giao dịch
    await transaction.commit();
    res.json({
      success: true,
      message: "Data inserted successfully",
      data: bodyRes,
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

// danh sách kê khai all
router.get("/all-ds-kekhai", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool.request().query(`SELECT * FROM ${table_name}`);
    const kekhai = result.recordset;
    res.json(kekhai);
  } catch (error) {
    res.status(500).json(error);
  }
});

// all danh sách kê khai with loại hình
router.get("/getalldskkwithmalh", async (req, res) => {
  // console.log(req.query.maloaihinh);
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("maloaihinh", req.query.maloaihinh)
      .query(`SELECT * FROM ${table_name} where maloaihinh=@maloaihinh`);
    const kekhai = result.recordset;
    res.json(kekhai);
  } catch (error) {
    res.status(500).json(error);
  }
});

// all danh sách kê khai with loại hình with madaily
router.get("/getalldskkwithmalh", async (req, res) => {
  // console.log(req.query.maloaihinh);
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("maloaihinh", req.query.maloaihinh)
      .input("madaily", req.query.madaily)
      .query(
        `SELECT * FROM ${table_name} where maloaihinh=@maloaihinh and madaily=@madaily`
      );
    const kekhai = result.recordset;
    res.json(kekhai);
  } catch (error) {
    res.status(500).json(error);
  }
});

// all danh sách kê khai with loại hình with madaily
router.get("/getallkekhaiwithuser", async (req, res) => {
  // console.log(req.query.maloaihinh);
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("maloaihinh", req.query.maloaihinh)
      .input("madaily", req.query.madaily)
      .query(
        `SELECT * FROM ${table_name} where madaily=@madaily and maloaihinh=@maloaihinh`
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
        `select * from ${table_name} where maloaihinh=@maloaihinh and madaily=@madaily and tungay between @tungay and @denngay`
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
        `SELECT tendaily, sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, trangthai, maloaihinh, tenloaihinh, COUNT(*) AS so_luong
        FROM ${table_name} where kykekhai=@kykekhai
        GROUP BY tendaily, sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, trangthai, maloaihinh, tenloaihinh`
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

// tìm hồ sơ kê khai dành cho điểm thu
router.get("/kykekhai-search-series-pagi", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Chuyển đổi page thành số nguyên
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    // console.log(offset);
    // console.log(typeof(offset));
    const kykekhai = req.query.kykekhai;
    const madaily = req.query.madaily;

    await pool.connect();
    const result = await pool
      .request()
      .input("kykekhai", kykekhai)
      .input("madaily", madaily)
      .input("offset", offset)
      .input("limit", limit)
      .query(
        `SELECT tendaily, sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, trangthai, maloaihinh, tenloaihinh, COUNT(*) AS so_luong
        FROM ${table_name} where kykekhai=@kykekhai and madaily=@madaily
        GROUP BY tendaily, sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, trangthai, maloaihinh, tenloaihinh
        ORDER BY cast(dotkekhai as int) desc OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `
      );

    const data = result.recordset;

    // Đếm tổng số lượng bản ghi
    const countResult = await pool
      .request()
      .input("kykekhai", kykekhai)
      .input("madaily", madaily)
      .query(
        `with t as (
          SELECT sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, trangthai, maloaihinh, tenloaihinh, COUNT(*) AS so_luong
          FROM ${table_name} where kykekhai=@kykekhai and madaily=@madaily
          GROUP BY sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, trangthai, maloaihinh, tenloaihinh
          )
          SELECT COUNT(*) AS totalCount FROM t`
      );
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

// tìm hồ sơ kê khai dành cho nhân viên thu
router.get("/kykekhai-search-series-pagi-nvcty", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Chuyển đổi page thành số nguyên
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    // console.log(offset);
    // console.log(typeof(offset));
    const kykekhai = req.query.kykekhai;

    await pool.connect();
    const result = await pool
      .request()
      .input("kykekhai", kykekhai)
      .input("offset", offset)
      .input("limit", limit)
      .query(
        `SELECT tendaily, sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, trangthai, maloaihinh, tenloaihinh, COUNT(*) AS so_luong
        FROM ${table_name} where kykekhai=@kykekhai
        GROUP BY tendaily, sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, trangthai, maloaihinh, tenloaihinh
        ORDER BY cast(dotkekhai as int) desc OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `
      );

    const data = result.recordset;

    // Đếm tổng số lượng bản ghi
    const countResult = await pool
      .request()
      .input("kykekhai", kykekhai)
      .query(
        `with t as (
          SELECT sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, trangthai, maloaihinh, tenloaihinh, COUNT(*) AS so_luong
          FROM ${table_name} where kykekhai=@kykekhai
          GROUP BY sohoso, dotkekhai, kykekhai, ngaykekhai, madaily, trangthai, maloaihinh, tenloaihinh
          )
          SELECT COUNT(*) AS totalCount FROM t`
      );
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

// xuất mẫu hồ sơ liệt kê danh sách
router.get("/get-all-kekhai-xuatmau", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("sohoso", req.query.sohoso)
      .query(`SELECT * from ${table_name} where sohoso=@sohoso`);
    const kekhai = result.recordset;
    res.json({
      success: true,
      kekhai,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
