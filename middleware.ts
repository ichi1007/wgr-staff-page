import { withAuth } from "next-auth/middleware";

export default withAuth;

export const config = {
  matcher: [
    /*
      ルート（/）、/public 配下、/auth 配下、/_error、/_not-found などを除外
      それ以外を全て保護
    */
    "/((?!$|public/|auth/|_error|_not-found).*)",
  ],
};
