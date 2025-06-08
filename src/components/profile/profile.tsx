// src/components/profile/profile.tsx
"use client";

import { useState } from "react";
import {
  Edit3,
  X,
  Mail,
  Phone,
  Calendar,
  User,
  Camera,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toastSuccess, toastError, toastWarning, toastInfo } from "@/lib/toast";

export function Profile() {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [profileData] = useState({
    firstName: "Nguyễn",
    lastName: "Hoàng Hiệp",
    email: "hoang.hiep@email.com",
    phone: "0123456789",
    birthday: "1995-03-15",
  });

  const handleEdit = (field: string) => {
    setIsEditing(field);
    toastInfo(`Chỉnh sửa ${getFieldLabel(field)}`);
  };

  const getFieldLabel = (field: string) => {
    const labels = {
      firstName: "Họ",
      lastName: "Tên",
      email: "Email",
      phone: "Số điện thoại",
      birthday: "Ngày sinh",
    };
    return labels[field as keyof typeof labels] || field;
  };

  const handleCancel = () => {
    setIsEditing(null);
    toastInfo("Đã hủy chỉnh sửa");
  };

  const handleChangeAvatar = () => {
    toastInfo("Thay đổi ảnh đại diện", {
      description: "Chọn ảnh mới từ thiết bị của bạn",
      action: {
        label: "Chọn ảnh",
        onClick: () => {
          // Simulate file selection
          setTimeout(() => {
            if (Math.random() > 0.3) {
              toastSuccess("Ảnh đại diện đã được cập nhật!");
            } else {
              toastError("Lỗi tải ảnh", {
                description: "File ảnh không hợp lệ hoặc quá lớn",
              });
            }
          }, 1000);
        },
      },
    });
  };

  const handleSaveAllChanges = () => {
    toastSuccess("Tất cả thay đổi đã được lưu!", {
      description: "Thông tin cá nhân đã được cập nhật thành công",
      duration: 5000,
    });
  };

  const handleCancelAllChanges = () => {
    setIsEditing(null);
    toastWarning("Đã hủy tất cả thay đổi", {
      description: "Thông tin trở về trạng thái ban đầu",
    });
  };

  const PasswordField = ({
    label,
    placeholder,
  }: {
    field: string;
    label: string;
    placeholder: string;
  }) => {
    const [tempValue, setTempValue] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="group">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          {label}
        </label>
        <div className="relative">
          <div className="relative flex-1">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder={placeholder}
              className="pl-10 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Eye className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const EditableField = ({
    field,
    value,
    label,
    icon: Icon,
    type = "text",
  }: {
    field: string;
    value: string;
    label: string;
    icon: any;
    type?: string;
  }) => {
    const [tempValue, setTempValue] = useState(value);

    return (
      <div className="group">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          {label}
        </label>
        <div className="relative">
          {isEditing === field ? (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={type}
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>

              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div
              className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-all group"
              onClick={() => handleEdit(field)}
            >
              <Icon className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1">{value}</span>
              <Edit3 className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Main Profile Card */}
        <Card className="px-4 py-6 shadow-lg">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Avatar Section */}
            <div className="lg:col-span-1 flex flex-col items-center">
              <div
                className="relative group cursor-pointer"
                onClick={handleChangeAvatar}
              >
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-pink-400 via-red-400 to-orange-400 p-1 shadow-2xl transform transition-all duration-300 group-hover:scale-105">
                  <div className="w-full h-full rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center overflow-hidden border">
                    <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-6xl font-bold text-muted-foreground">
                      {profileData.firstName.charAt(0)}
                      {profileData.lastName.charAt(0)}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="mt-6 text-center">
                <h1 className="text-3xl font-bold mb-2">
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <p className="text-muted-foreground mb-1">
                  {profileData.email}
                </p>
                <p className="text-muted-foreground">
                  {new Date(profileData.birthday).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>

            {/* Information Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Thông tin cá nhân
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <EditableField
                  field="firstName"
                  value={profileData.firstName}
                  label="Họ"
                  icon={User}
                />

                <EditableField
                  field="lastName"
                  value={profileData.lastName}
                  label="Tên"
                  icon={User}
                />

                <EditableField
                  field="email"
                  value={profileData.email}
                  label="Email"
                  icon={Mail}
                  type="email"
                />

                <EditableField
                  field="phone"
                  value={profileData.phone}
                  label="Số điện thoại"
                  icon={Phone}
                  type="tel"
                />

                <div className="md:col-span-2">
                  <EditableField
                    field="birthday"
                    value={profileData.birthday}
                    label="Ngày sinh"
                    icon={Calendar}
                    type="date"
                  />
                </div>

                <PasswordField
                  field="password"
                  label="Mật khẩu mới"
                  placeholder="Nhập mật khẩu mới"
                />

                <PasswordField
                  field="confirmPassword"
                  label="Xác nhận mật khẩu"
                  placeholder="Nhập lại mật khẩu"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8 pt-6 border-t">
                <Button className="px-6 py-2" onClick={handleSaveAllChanges}>
                  Lưu thay đổi
                </Button>
                <Button
                  variant="outline"
                  className="px-6 py-2"
                  onClick={handleCancelAllChanges}
                >
                  Hủy bỏ
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
