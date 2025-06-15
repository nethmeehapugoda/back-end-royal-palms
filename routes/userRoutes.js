import express from "express";
import {deleteUser, filterUserByName, getAllUser, getUser, loginUser, register, updateUser,} from "../controllers/UserControllers.js";


const router = express.Router();

router.post("/reg",register);
router.get("/get", getAllUser);
router.get("/get:id",getUser);
router.put("/update:id",updateUser);
router.delete("/delete:id",deleteUser);
router.get("/filter",filterUserByName);
router.post("/login",loginUser);





export default router;



