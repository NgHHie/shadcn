"use client";

import { useState } from "react";
import {
  Edit3,
  Save,
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

export function Profile() {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    firstName: "Nguyễn",
    lastName: "Hoàng Hiệp",
    email: "hoang.hiep@email.com",
    phone: "0123456789",
    birthday: "1995-03-15",
    role: "Sinh viên Công nghệ thông tin",
    bio: "Sinh viên năm 3 chuyên ngành Công nghệ thông tin tại Đại học Bách Khoa. Đam mê lập trình web và phát triển ứng dụng mobile. Hiện đang học tập và nghiên cứu về AI và Machine Learning.",
  });

  const handleEdit = (field: string) => {
    setIsEditing(field);
  };

  const handleSave = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    setIsEditing(null);
  };

  const handleCancel = () => {
    setIsEditing(null);
  };

  const PasswordField = ({
    field,
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
        <label className="text-sm font-medium text-slate-300 mb-2 block">
          {label}
        </label>
        <div className="relative">
          <div className="relative flex-1">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type={showPassword ? "text" : "password"}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder={placeholder}
              className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 transition-all"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-white/10"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-slate-400" />
              ) : (
                <Eye className="w-4 h-4 text-slate-400" />
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
        <label className="text-sm font-medium text-slate-300 mb-2 block">
          {label}
        </label>
        <div className="relative">
          {isEditing === field ? (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type={type}
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 transition-all"
                  autoFocus
                />
              </div>
              <Button
                size="sm"
                onClick={() => handleSave(field, tempValue)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all group"
              onClick={() => handleEdit(field)}
            >
              <Icon className="w-4 h-4 text-slate-400" />
              <span className="flex-1 text-white">{value}</span>
              <Edit3 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Background blur overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-slate-900/40 backdrop-blur-3xl"></div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header Badge */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2">
            <span className="text-white font-semibold">🎓 HỌC TẬP</span>
          </div>
        </div>

        {/* Main Profile Card */}
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Avatar Section */}
            <div className="lg:col-span-1 flex flex-col items-center">
              <div className="relative group cursor-pointer">
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-pink-400 via-red-400 to-orange-400 p-1 shadow-2xl transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-3xl">
                  <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                    <img
                      src="/placeholder.svg?height=240&width=240"
                      alt="Profile Avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-400/20 via-red-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="mt-6 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <p className="text-pink-300 text-lg font-medium mb-4">
                  {profileData.role}
                </p>
                <p className="text-slate-300 leading-relaxed max-w-md">
                  {profileData.bio}
                </p>
              </div>
            </div>

            {/* Information Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
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

                <EditableField
                  field="birthday"
                  value={profileData.birthday}
                  label="Ngày sinh"
                  icon={Calendar}
                  type="date"
                />

                <EditableField
                  field="role"
                  value={profileData.role}
                  label="Vai trò"
                  icon={User}
                />

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

              <div className="mt-8">
                <EditableField
                  field="bio"
                  value={profileData.bio}
                  label="Giới thiệu bản thân"
                  icon={User}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
                  Lưu thay đổi
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-6 py-2"
                >
                  Hủy bỏ
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Navigation Menu */}
        <div className="flex justify-center mt-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2">
            <div className="flex gap-1">
              {["THỐNG KÊ", "BÀI TẬP", "THÀNH TÍCH", "CÀI ĐẶT"].map((item) => (
                <Button
                  key={item}
                  variant="ghost"
                  className="text-white hover:bg-white/20 px-6 py-2 rounded-xl transition-all"
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
