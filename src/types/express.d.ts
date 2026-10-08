declare global {
    namespace Express {
      interface Request {
        user: {
          userId: string;
        };
        requestId: string;
      }
    }
  }
  
  declare module "cors";
  declare module "compression";
  declare module "cookie-parser";
  declare module "jsonwebtoken";
  declare module "bcrypt";
  
  export {};