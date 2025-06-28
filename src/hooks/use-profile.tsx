import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { toastError, toastSuccess } from "@/lib/toast";
import { handleDataFetchError } from "@/lib/error-handler";
import { validateProfileUpdate, formatDateForAPI } from "@/lib/validation";
import { UpdateUserRequest } from "@/lib/api";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  birthDay: string;
  fullName: string;
  avatar: string | null;
  role: string;
  isPremium: boolean;
  password?: string;
  repassword?: string;
}

export const useProfile = () => {
  const [profileData, setProfileData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useApi();

  // Fetch user profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await api.user.getUserInfo();
      setProfileData(userData);
    } catch (err) {
      console.error("Error fetching profile:", err);
      const errorMessage = handleDataFetchError(err);
      setError(errorMessage);
      toastError("Lỗi khi tải thông tin người dùng", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updateData: UpdateUserRequest) => {
    try {
      setUpdating(true);

      // Validate data before sending
      const validation = validateProfileUpdate(updateData);
      if (!validation.isValid) {
        toastError("Lỗi xác thực dữ liệu", {
          description: validation.message,
        });
        return false;
      }

      // Format date if provided
      if (updateData.birthDay) {
        updateData.birthDay = formatDateForAPI(updateData.birthDay);
      }

      // Call API to update user info
      const response = await api.user.updateUserInfo(updateData);

      if (response.status === 1) {
        // Refresh profile data
        await fetchProfile();
        
        toastSuccess("Cập nhật thành công", {
          description: "Thông tin cá nhân đã được cập nhật",
        });
        return true;
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      const errorMessage = handleDataFetchError(err);
      toastError("Lỗi khi cập nhật thông tin", {
        description: errorMessage,
      });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Initialize profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profileData,
    loading,
    updating,
    error,
    fetchProfile,
    updateProfile,
  };
}; 