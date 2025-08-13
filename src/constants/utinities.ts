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
        path: "/directory",
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
    // Thêm đoạn mã này vào cuối file src/constants/utinities.ts

export const TDP_LIST = [
  "TDP văn minh",
  "TDP tiến bộ",
  "TDP bắc thượng",
  "TDP kỳ phong",
  "TDP kỷ các",
  "TDP đông tân",
  // Thêm các TDP khác vào đây
];