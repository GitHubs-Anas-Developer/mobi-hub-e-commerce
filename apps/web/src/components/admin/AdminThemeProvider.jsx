"use client";

import { App as AntdApp, ConfigProvider } from "antd";

const ELENZO_ADMIN_THEME = {
  token: {
    colorPrimary: "#0755E9",
    colorPrimaryHover: "#0645C4",
    colorPrimaryActive: "#082B70",
    colorInfo: "#0755E9",
    colorSuccess: "#16A34A",
    colorWarning: "#D97706",
    colorError: "#DC2626",
    colorText: "#101828",
    colorTextHeading: "#101828",
    colorTextSecondary: "#64748B",
    colorBorder: "#E2E8F0",
    colorBorderSecondary: "#E2E8F0",
    colorBgLayout: "#F8FAFC",
    colorBgContainer: "#FFFFFF",
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 8,
    fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
    fontSize: 14,
    controlHeight: 38,
  },
  components: {
    Layout: {
      siderBg: "#FFFFFF",
      headerBg: "#FFFFFF",
      bodyBg: "#F8FAFC",
      headerPadding: "0 24px",
      headerHeight: 68,
    },
    Menu: {
      itemBg: "#FFFFFF",
      subMenuItemBg: "#FFFFFF",
      itemSelectedBg: "#EFF6FF",
      itemSelectedColor: "#0755E9",
      itemHoverBg: "#F8FAFC",
      itemHoverColor: "#101828",
      itemColor: "#475569",
      itemBorderRadius: 10,
      itemMarginInline: 8,
      itemHeight: 40,
      groupTitleColor: "#94A3B8",
      groupTitleFontSize: 11,
    },
    Card: {
      borderRadiusLG: 14,
      headerBg: "#FFFFFF",
      paddingLG: 20,
    },
    Table: {
      headerBg: "#F8FAFC",
      headerColor: "#475569",
      headerSplitColor: "transparent",
      rowHoverBg: "#F8FAFC",
      borderColor: "#E2E8F0",
      cellPaddingBlock: 13,
      cellPaddingInline: 14,
    },
    Button: {
      primaryShadow: "0 2px 6px rgba(7, 85, 233, 0.18)",
      defaultBorderColor: "#E2E8F0",
      defaultColor: "#101828",
      fontWeight: 600,
    },
    Tag: {
      borderRadiusSM: 9999,
    },
  },
};

export default function AdminThemeProvider({ children }) {
  return (
    <ConfigProvider theme={ELENZO_ADMIN_THEME}>
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}

