"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  App as AntdApp,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Tag,
} from "antd";
import { KeyRound, Save, ShieldCheck, Store, User } from "lucide-react";

import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import authService from "@/services/authService";
import {
  BRAND_ADMIN_EMAIL,
  BRAND_NAME,
  BRAND_SUPPORT_EMAIL,
  BRAND_TAGLINE,
} from "@/config/brand";
import { fetchCurrentUser } from "@/store/thunks/authThunks";

export default function AdminSettingsPage() {
  const dispatch = useDispatch();
  const { notification } = AntdApp.useApp();
  const user = useSelector((state) => state.auth.user);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSave = async (values) => {
    try {
      setSavingProfile(true);
      await authService.updateProfile({
        name: values.name?.trim(),
        phone: values.phone?.trim(),
      });
      await dispatch(fetchCurrentUser());
      notification.success({
        message: "Profile Updated",
        description: "Administrator profile details saved.",
      });
    } catch (err) {
      notification.error({
        message: "Update Failed",
        description:
          err.response?.data?.message || "Unable to update profile.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (values, formInstance) => {
    try {
      setSavingPassword(true);
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      formInstance?.resetFields();
      notification.success({
        message: "Password Changed",
        description: "Your administrator password has been updated securely.",
      });
    } catch (err) {
      notification.error({
        message: "Password Update Failed",
        description:
          err.response?.data?.message || "Unable to change password.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const [passwordForm] = Form.useForm();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Settings & Security"
        subtitle="Manage your administrator profile, credentials, and view verified ELENZO platform configuration."
        badge="Administrator"
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Administrator Profile */}
        <Card
          className="!border-[#E2E8F0]"
          title={
            <span className="inline-flex items-center gap-2 font-bold text-[#101828]">
              <User size={17} className="text-[#0755E9]" />
              Administrator Profile
            </span>
          }
        >
          <Form
            layout="vertical"
            initialValues={{
              name: user?.name || "",
              email: user?.email || BRAND_ADMIN_EMAIL,
              phone: user?.phone || "",
            }}
            onFinish={handleProfileSave}
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: "Name is required" }]}
            >
              <Input placeholder="Administrator Name" />
            </Form.Item>

            <Form.Item name="email" label="Email Address">
              <Input disabled />
            </Form.Item>

            <Form.Item name="phone" label="Phone Number">
              <Input placeholder="Phone number" />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={savingProfile}
              icon={<Save size={15} />}
            >
              Save Profile Changes
            </Button>
          </Form>
        </Card>

        {/* Change Password */}
        <Card
          className="!border-[#E2E8F0]"
          title={
            <span className="inline-flex items-center gap-2 font-bold text-[#101828]">
              <KeyRound size={17} className="text-[#0755E9]" />
              Change Password
            </span>
          }
        >
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={(vals) => handlePasswordChange(vals, passwordForm)}
          >
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[
                { required: true, message: "Current password is required" },
              ]}
            >
              <Input.Password placeholder="Enter current password" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: "New password is required" },
                { min: 6, message: "Minimum 6 characters required" },
              ]}
            >
              <Input.Password placeholder="Enter new password" />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={savingPassword}
              icon={<ShieldCheck size={15} />}
            >
              Update Password
            </Button>
          </Form>
        </Card>
      </div>

      {/* Store Identity Info (Read-Only Verified Config) */}
      <Card
        className="!border-[#E2E8F0]"
        title={
          <span className="inline-flex items-center gap-2 font-bold text-[#101828]">
            <Store size={17} className="text-[#0755E9]" />
            ELENZO Store Configuration
          </span>
        }
      >
        <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
          <Descriptions.Item label="Brand Name">{BRAND_NAME}</Descriptions.Item>
          <Descriptions.Item label="Tagline">{BRAND_TAGLINE}</Descriptions.Item>
          <Descriptions.Item label="Support Email">
            {BRAND_SUPPORT_EMAIL}
          </Descriptions.Item>
          <Descriptions.Item label="Session Role">
            <Tag color="blue">{user?.role || "admin"}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}

