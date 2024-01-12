import { LogoutIcon } from "@/icons/user/logout";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

export const LogoutButton = () => {
  return (
    <LogoutLink className="flex select-none items-center rounded-xl bg-white px-3 py-2 shadow-md active:scale-95 dark:bg-slate-800">
      {LogoutIcon}
    </LogoutLink>
  );
};
