const express = require("express");
const router = express.Router();
const { pool } = require("../database/dbinfo");

// add ke khai
router.post("/add-org", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("matinh", req.body.matinh)
      .input("tentinh", req.body.tentinh)
      .input("matochuc", req.body.matochuc)
      .input("tentochuc", req.body.tentochuc)
      .input("diachi", req.body.diachi)
      .input("masothue", req.body.masothue)
      .input("tendonvibaohiem", req.body.tendonvibaohiem)
      .input("active", req.body.active)
      .input("createdBy", req.body.createdBy)
      .input("createdAt", req.body.createdAt).query(`
                INSERT INTO tochucdvt (matinh, tentinh, matochuc, tentochuc,
                  diachi, masothue, tendonvibaohiem, active, createdBy, createdAt) 
                VALUES (@matinh, @tentinh, @matochuc, @tentochuc,
                  @diachi, @masothue, @tendonvibaohiem, @active,
                  @createdBy, @createdAt);
            `);
    const tochucdvt = req.body;
    res.json(tochucdvt);
  } catch (error) {
    res.status(500).json(error);
  }
});

// danh sách tổ chức
router.get("/all-org", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool.request().query(`SELECT * FROM tochucdvt`);
    const kekhai = result.recordset;
    res.json(kekhai);
  } catch (error) {
    res.status(500).json(error);
  }
});

// xóa tổ chức
router.post("/delete/org", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool
      .request()
      .input("_id", req.body._id)
      .query(`SELECT * FROM tochucdvt WHERE _id = @_id`);

    let tc = result.recordset.length ? result.recordset[0] : null;
    if (tc) {
      await pool
        .request()
        .input("_id", req.body._id)
        .query(`DELETE FROM tochucdvt WHERE _id = @_id;`);
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
