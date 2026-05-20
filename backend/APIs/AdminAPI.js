import exp from 'express' 
 import UserTypeModel from '../models/UserModel.js';

export const  adminRoute=exp.Router()


//Read all articles(optional)



//block user
adminRoute.put('/admin/block/:userid', async (req, res) => {
  try {
    const uid = req.params.userid;

    await UserTypeModel.findByIdAndUpdate(
      uid,
      { isActive: false },
      { new: true }
    );

    res.status(200).json({ message: "User blocked" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// unblock user

adminRoute.put('/admin/unblock/:userid', async (req, res) => {
  try {
    const uid = req.params.userid;

    await UserTypeModel.findByIdAndUpdate(
      uid,
      { isActive: true },
      { new: true }
    );

    res.status(200).json({ message: "User unblocked" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});