// Sidebar imports
import {
  UilEstate,
  UilClipboardAlt,
  UilUsersAlt,
  UilPackage,
  UilChart,
  UilHistory,
  UilSignOutAlt,
} from "@iconscout/react-unicons";

// Analytics Cards imports
import { UilUsdSquare, UilMoneyWithdrawal } from "@iconscout/react-unicons";
//   import { keyboard } from "@testing-library/user-event/dist/keyboard";


// Sidebar Data
export const SidebarData = [
  {
    icon: UilEstate,
    heading: "Kho hàng",
    url: "/home"
  },
  {
    icon: UilClipboardAlt,
    heading: "Đơn vị nhận",
    url: "/recipient"
  },
  {
    icon: UilUsersAlt,
    heading: "Nguồn hàng",
    url: "/item-source"
  },
  {
    icon: UilPackage,
    heading: 'Mặt hàng',
    url: "/products"
  },
  {
    icon: UilHistory,
    heading: 'Lịch sử',
    url: "/history"
  },
];
