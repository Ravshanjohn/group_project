import { type Request, type Response } from 'express';
import { database } from '../lib/db.js';
import { handleControllerError } from '../lib/utils.js';

// export const count_user_authenticated = async (req: Request, res: Response) => {
//   try {
//     const { data, error } = await database
//       .rpc('count_user_authenticated')
//     if (error) {
//       console.error('Error counting authenticated users:', error);
//       return res.status(500).json({ success: false, message: 'Failed to count authenticated users' });
//     };

//     return res.json({ success: true, count: data });
//   } catch (error) {
//     return handleControllerError(res, error, "count_user_authenticated controller");
//   };
// };

// export const count_user_all = async (req: Request, res: Response) => {
//   try {
//     const { data, error } = await database 
//       .rpc('count_user_all')
//     if (error) {
//       console.error('Error counting all users:', error);
//       return res.status(500).json({ success: false, message: 'Failed to count all users' });
//     };

//     return res.json({ success: true, count: data });
//   } catch (error) {
//     return handleControllerError(res, error, "count_user_all controller");
//   };
// }; 