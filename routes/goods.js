const express = require("express");
const Goods = require("../schemas/goods");
const router = express.Router();
const Cart = require("../schemas/cart");

//페이지에 글자 적기
router.get("/", (req, res) => {
  res.send("this is root page");
});

//상품에 대한것 가져오기(상품전체조회)
router.get("/goods", async (req, res) => {
  const { category } = req.query;

  const goods = await Goods.find({ category });

  res.json({
    goods,
  });
});

//장바구니 상세조회
router.get("/goods/cart", async (req, res) => {
  const carts = await Cart.find();
  const goodsIds = carts.map((cart) => cart.goodsId);

  const goods = await Goods.find({ goodsId: goodsIds });

  res.json({
      cart: carts.map((cart) => ({
          quantity: cart.quantity,
          goods: goods.find((item) => item.goodsId === cart.goodsId),
      })),
  });
});

//상품 상세조회
router.get("/goods/:goodsId", async (req, res) => {
  const { goodsId } = req.params;

  const [goods] = await Goods.find({ goodsId: Number(goodsId) });

  res.json({
    goods,
  });
});


//장바구니에서 삭제하기
router.delete("/goods/:goodsId/cart", async (req,res) => {
  const { goodsId } = req.params;


  const existsCarts = await Cart.find({ goodsId: Number(goodsId) });
  if (existsCarts.length) {
    await Cart.deleteOne({ goodsId: Number(goodsId) });
  }
  res.json({ success: true });
});

//장바구니에서 상품 수정하기
router.put("/goods/:goodsId/cart", async (req, res) => {
  const { goodsId } = req.params;
  const { quantity } = req.body;

  const existsCarts = await Cart.find({ goodsId: Number(goodsId) });
  if (!existsCarts.length) {
    await Cart.create({ goodsId: Number(goodsId), quantity });
  } else {
    await Cart.updateOne({ goodsId: Number(goodsId) }, { $set: { quantity } });
  }

  res.json({ success: true });
});

//상품이 현재 있는 상품인지 판별하기, 없으면 가져오기
router.post("/goods", async (req, res) => {
  const { goodsId, name, thumbnailUrl, category, price } = req.body;

  const goods = await Goods.find({ goodsId });
  if (goods.length) {
    return res.status(400).json({ success: false, errorMesssage: "이미 있는 데이터입니다." });
  }

  const createdGoods = await Goods.create({ goodsId, name, thumbnailUrl, category, price });

  res.json({ goods: createdGoods });
});

module.exports = router;