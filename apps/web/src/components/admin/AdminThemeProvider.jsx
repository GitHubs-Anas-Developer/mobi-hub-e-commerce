"use client";

import { App as AntdApp, ConfigProvider } from "antd";

const ADMIN_COLORS = {
  primary: "#0755E9",
  primaryHover: "#0645C4",
  primaryActive: "#0539A3",
  primaryLight: "#EFF6FF",
  page: "#F8FAFC",
  surface: "#FFFFFF",
  text: "#101828",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  borderHover: "#CBD5E1",
};

const ADMIN_FOCUS_SHADOW = "0 0 0 3px rgba(7, 85, 233, 0.16)";

const ELENZO_ADMIN_THEME = {
  token: {
    colorPrimary: ADMIN_COLORS.primary,
    colorPrimaryHover: ADMIN_COLORS.primaryHover,
    colorPrimaryActive: ADMIN_COLORS.primaryActive,
    colorInfo: ADMIN_COLORS.primary,
    colorSuccess: "#16A34A",
    colorWarning: "#D97706",
    colorError: "#DC2626",
    colorText: ADMIN_COLORS.text,
    colorTextHeading: ADMIN_COLORS.text,
    colorTextSecondary: ADMIN_COLORS.textSecondary,
    colorBorder: ADMIN_COLORS.border,
    colorBorderSecondary: ADMIN_COLORS.border,
    colorBgLayout: ADMIN_COLORS.page,
    colorBgContainer: ADMIN_COLORS.surface,
    colorFillSecondary: ADMIN_COLORS.page,
    colorPrimaryBg: ADMIN_COLORS.primaryLight,
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 8,
    fontFamily: "var(--font-family-sans)",
    fontSize: 14,
    controlHeight: 40,
    controlHeightSM: 32,
    controlHeightLG: 44,
  },
  components: {
    Layout: {
      siderBg: ADMIN_COLORS.surface,
      headerBg: ADMIN_COLORS.surface,
      bodyBg: ADMIN_COLORS.page,
      headerPadding: "0 24px",
      headerHeight: 68,
    },
    Menu: {
      itemBg: ADMIN_COLORS.surface,
      subMenuItemBg: ADMIN_COLORS.surface,
      itemSelectedBg: ADMIN_COLORS.primaryLight,
      itemSelectedColor: ADMIN_COLORS.primary,
      itemHoverBg: ADMIN_COLORS.page,
      itemHoverColor: ADMIN_COLORS.text,
      itemColor: "#475569",
      itemBorderRadius: 10,
      itemMarginInline: 8,
      itemHeight: 40,
      groupTitleColor: "#94A3B8",
      groupTitleFontSize: 11,
    },
    Card: {
      borderRadiusLG: 14,
      headerBg: ADMIN_COLORS.surface,
      paddingLG: 20,
    },
    Table: {
      headerBg: ADMIN_COLORS.page,
      headerColor: "#475569",
      headerSplitColor: "transparent",
      rowHoverBg: ADMIN_COLORS.page,
      borderColor: ADMIN_COLORS.border,
      cellPaddingBlock: 13,
      cellPaddingInline: 14,
    },
    Button: {
      primaryShadow: "0 2px 6px rgba(7, 85, 233, 0.18)",
      defaultBorderColor: ADMIN_COLORS.border,
      defaultColor: ADMIN_COLORS.text,
      fontWeight: 600,
    },
    Input: {
      hoverBorderColor: ADMIN_COLORS.borderHover,
      activeBorderColor: ADMIN_COLORS.primary,
      activeShadow: ADMIN_FOCUS_SHADOW,
    },
    InputNumber: {
      hoverBorderColor: ADMIN_COLORS.borderHover,
      activeBorderColor: ADMIN_COLORS.primary,
      activeShadow: ADMIN_FOCUS_SHADOW,
    },
    Select: {
      optionSelectedBg: ADMIN_COLORS.primaryLight,
      optionSelectedColor: ADMIN_COLORS.primary,
      optionSelectedFontWeight: 600,
      optionActiveBg: ADMIN_COLORS.page,
      hoverBorderColor: ADMIN_COLORS.borderHover,
      activeBorderColor: ADMIN_COLORS.primary,
      activeOutlineColor: "rgba(7, 85, 233, 0.16)",
    },
    DatePicker: {
      hoverBorderColor: ADMIN_COLORS.borderHover,
      activeBorderColor: ADMIN_COLORS.primary,
      activeShadow: ADMIN_FOCUS_SHADOW,
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

