import express from "express";
import { getSearchSuggestions } from "../controllers/search.controller.js";

const router = express.Router();

router.get("/suggestions", getSearchSuggestions);

export default router;
