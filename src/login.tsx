// src/login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Lock, User, Boxes } from "lucide-react";
import { toastSuccess, toastError, toastWarning } from "@/lib/toast";
import { useApi } from "@/lib/api";

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState(""); // Đổi từ email thành username
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const api = useApi();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!username.trim()) {
      toastWarning("Vui lòng nhập tên đăng nhập");
      return;
    }

    if (!password) {
      toastWarning("Vui lòng nhập mật khẩu");
      return;
    }

    if (password.length < 6) {
      toastError("Mật khẩu quá ngắn", {
        description: "Mật khẩu phải có ít nhất 6 ký tự",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call real API
      const response = await api.auth.login({
        username: username.trim(),
        password: password,
        remember: remember,
      });

      // Check if login was successful
      if (response.status === 1) {
        toastSuccess("Đăng nhập thành công!", {
          description: `Chào mừng ${username} quay lại!`,
          duration: 3000,
        });

        // Redirect to main page
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1000);
      } else {
        throw new Error("Đăng nhập thất bại");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      let errorMessage = "Đăng nhập thất bại";

      if (error?.message) {
        if (
          error.message.includes("401") ||
          error.message.includes("unauthorized")
        ) {
          errorMessage = "Tên đăng nhập hoặc mật khẩu không đúng";
        } else if (error.message.includes("400")) {
          errorMessage = "Thông tin đăng nhập không hợp lệ";
        } else if (error.message.includes("500")) {
          errorMessage = "Lỗi server, vui lòng thử lại sau";
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          errorMessage = "Lỗi kết nối, vui lòng kiểm tra internet";
        } else {
          errorMessage = error.message;
        }
      }

      toastError("Đăng nhập thất bại", {
        description: errorMessage,
        duration: 5000,
        action: {
          label: "Thử lại",
          onClick: () => handleLogin(e),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <Boxes className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Đăng nhập Learn SQL
            </h2>
          </div>

          {/* Login Form */}
          <Card className="p-8 shadow-lg border">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Tên đăng nhập {/* Đổi từ "Địa chỉ email" */}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text" // Đổi từ email thành text
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập"
                    className="pl-10 h-12"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="pl-10 pr-12 h-12"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span className="text-muted-foreground">
                    Ghi nhớ đăng nhập
                  </span>
                </label>
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm text-primary"
                  onClick={() =>
                    toastError("Tính năng quên mật khẩu", {
                      description: "Liên hệ admin để reset mật khẩu",
                    })
                  }
                  type="button"
                  disabled={isLoading}
                >
                  Quên mật khẩu?
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>
          </Card>

          {/* Optional register link - commented out as requested */}
          {/* <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-medium text-primary"
                onClick={() =>
                  toastError("Tính năng đăng ký", {
                    description: "Liên hệ admin để tạo tài khoản mới",
                  })
                }
              >
                Đăng ký ngay
              </Button>
            </p>
          </div> */}
        </div>
      </div>

      {/* Left side - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/login.jpg')",
          }}
        />
        {/* Overlay for better text readability if needed */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
    </div>
  );
}
