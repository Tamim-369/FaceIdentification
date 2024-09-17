import { Router } from "express";
import { findUsers } from "../controller/getUsers.js";
const router = Router();

router.get("/", findUsers);

export default router;
