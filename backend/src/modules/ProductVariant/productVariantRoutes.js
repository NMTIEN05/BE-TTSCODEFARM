import express from "express";
import { getVariantsByBookId, createVariant, updateVariant, deleteVariant } from "./productVariantController.js";

const router = express.Router();

router.get("/book/:bookId", getVariantsByBookId);
router.post("/book/:bookId", createVariant);
router.put("/:id", updateVariant);
router.delete("/:id", deleteVariant);

export default router;