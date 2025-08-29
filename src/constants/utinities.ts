import * as Icon from "@components/icons";
    import { Utinity } from "@dts";
    import PhoneIcon from "@assets/internal-phone.png";

    export const APP_UTINITIES: Array<Utinity> = [
      {
        key: "feedback",
        label: "Phản ánh hiện trường",
        icon: Icon.PenIcon,
        path: "/feedbacks",
      },
      {
        key: "public-service",
        label: "Tra cứu DVC",
        icon: Icon.SearchIcon,
        link: "https://dichvucong.gov.vn/",
      },
      {
        key: "reporting",
        label: "Báo cáo TDP",
        icon: Icon.ReportIcon,
        path: "/report",
      },
      {
        key: "directory",
        label: "Danh bạ",
        icon: Icon.BookIcon,
        // ✅ Bỏ path để sử dụng onClick từ HomePage
        // path: "/directory",
      },
    ];

    export const CONTACTS: Array<Utinity> = [
  {
    key: "bi-thu",
    label: "Bí thư Đảng ủy phường",
    name: "Đậu Tùng Lâm", 
    iconSrc: PhoneIcon,
    phoneNumber: "0917726888", 
  },
  {
    key: "chu-tich",
    label: "Chủ tịch UBND phường",
    name: "Tô Thái Hòa", 
    iconSrc: PhoneIcon,
    phoneNumber: "0912234666", 
  },
  {
    key: "p-chu-tich-1",
    label: "Phó Chủ tịch UBND phường",
    name: "Nguyễn Nhật Linh", 
    iconSrc: PhoneIcon,
    phoneNumber: "0916266568", 
  },
    {
    key: "p-chu-tich-2",
    label: "Phó Chủ tịch UBND phường",
    name: "Lê Thị Thanh Vân", 
    iconSrc: PhoneIcon,
    phoneNumber: "0915443998", 
  },
  {
    key: "truong-ban-chqs",
    label: "Chỉ huy trưởng Quân sự phường",
    name: "Trương Quang Tuân", 
    iconSrc: PhoneIcon,
    phoneNumber: "0989803123", 
  },
  {
    key: "truong-ca",
    label: "Trưởng Công an phường",
    name: "Diệp Xuân Nam",
    iconSrc: PhoneIcon,
    phoneNumber: "0989893623", 
  },
];

export const TDP_LIST = [
  "TDP Văn Minh",
  "TDP Đông Tân",
  "TDP Bình Tiến",
  "TDP Mỹ Triều",
  "TDP Tân Hòa",
  "TDP Tân Tiến",
  "TDP Thắng Hòa",
  "TDP 17",
  "TDP 18",
  "TDP Nhân Hòa",
  "TDP Tiền Thượng",
  "TDP Phái Nam",
  "TDP Sơn Trình",
  "TDP Phái Đông",
  "TDP La Xá",
  "TDP Kỷ Các",
  "TDP Tân Hòa 1",
  "TDP Yên Trung",
  "TDP Trung Thành",
  "TDP Hương Long",
  "TDP Hương Mỹ",
  "TDP Minh Đình",
  "TDP Văn Bình",
  "TDP Bắc Thượng",
  "TDP Nam Thượng",
  "TDP Liên Hương",
  "TDP Liên Vinh",
  "TDP Kỳ Phong",
  "TDP Kỳ Sơn",
  "TDP Thống Nhất",
  "TDP Nam Bình",
  "TDP Bàu Láng",
  "TDP 2",
  "TDP 3",
  "TDP 4"
];