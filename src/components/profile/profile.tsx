// src/components/profile/profile.tsx
"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Phone,
  Calendar,
  User,
  Camera,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Save,
  Edit,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toastSuccess, toastError, toastWarning } from "@/lib/toast";
import { useApi, UpdateUserRequest } from "@/lib/api";
import { handleDataFetchError } from "@/lib/error-handler";
import { validateProfileUpdate, isValidEmail, isValidPhone } from "@/lib/validation";

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
}

// Move DisplayField outside to prevent re-creation on every render
const DisplayField = memo(({
  field,
  label,
  icon: Icon,
  type = "text",
  isEditMode,
  currentValue,
  onFieldChange,
  t
}: {
  field: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  type?: string;
  isEditMode: boolean;
  currentValue: string;
  onFieldChange: (field: string, value: string) => void;
  t: (key: string) => string;
}) => {
  return (
    <div className="group">
      <label className="text-sm font-medium text-muted-foreground mb-2 block">
        {label}
      </label>
      <div className="relative">
        {isEditMode ? (
          <div className="relative">
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type={type}
              value={currentValue}
              onChange={(e) => onFieldChange(field, e.target.value)}
              className="pl-10"
              placeholder={`Nhập ${label.toLowerCase()}`}
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="flex-1">{currentValue || t('profile.notSet')}</span>
          </div>
        )}
      </div>
    </div>
  );
});

DisplayField.displayName = 'DisplayField';

// Memoized PasswordField component
const PasswordField = memo(({
  label,
  placeholder,
  field,
  isEditMode,
  value,
  onFieldChange,
}: {
  field: string;
  label: string;
  placeholder: string;
  isEditMode: boolean;
  value: string;
  onFieldChange: (field: string, value: string) => void;
}) => {
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
            value={value}
            onChange={(e) => onFieldChange(field, e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-10"
            disabled={!isEditMode}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => setShowPassword(!showPassword)}
            disabled={!isEditMode}
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
});

PasswordField.displayName = 'PasswordField';

export function Profile() {
  const { t } = useTranslation('common');
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateUserRequest>({});
  const [hasChanges, setHasChanges] = useState(false);

  const api = useApi();

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userData = await api.user.getUserInfo();
        setProfileData(userData);
        
        // Initialize form data with current user data
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          birthDay: userData.birthDay || '',
        });
      } catch (err: unknown) {
        console.error("Error fetching user data:", err);
        
        // Type guard for error with status
        const isErrorWithStatus = (error: unknown): error is { 
          response?: { status?: number }; 
          status?: number; 
          code?: number 
        } => {
          return typeof error === 'object' && error !== null;
        };

        // Handle authentication errors
        let errorStatus: number | undefined;
        if (isErrorWithStatus(err)) {
          errorStatus = err.response?.status || err.status || err.code;
        }

        if (errorStatus === 401) {
          const errorMessage = t('profile.sessionExpired');
          setError(errorMessage);
          toastError(t('profile.authError'), {
            description: errorMessage,
          });
          // Redirect to login after showing error
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
          return;
        }

        // Handle other errors
        const errorMessage = handleDataFetchError(err);
        setError(errorMessage);
        toastError(t('profile.loadUserInfoError'), {
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []); // Empty dependency array - only run once on mount

  // Check for changes in form data
  useEffect(() => {
    if (!profileData) return;
    
    const hasFormChanges = Boolean(
      formData.firstName !== profileData.firstName ||
      formData.lastName !== profileData.lastName ||
      formData.email !== profileData.email ||
      formData.phone !== profileData.phone ||
      formData.birthDay !== profileData.birthDay ||
      formData.password ||
      formData.repassword
    );
    
    setHasChanges(hasFormChanges);
  }, [formData, profileData]);

  const handleEnterEditMode = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Reset form data to original values
    if (profileData) {
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        birthDay: profileData.birthDay || '',
        password: '',
        repassword: '',
      });
    }
    setHasChanges(false);
  };

  const handleSaveChanges = async () => {
    if (!hasChanges) {
      toastWarning(t('profile.noChanges'));
      return;
    }

    // Validate password fields if they are filled
    if (formData.password && formData.password !== formData.repassword) {
      toastError(t('profile.passwordMismatch'), {
        description: t('profile.passwordMismatchDesc'),
      });
      return;
    }

    // Validate form data using validation utilities
    const validationResult = validateProfileUpdate(formData);
    if (!validationResult.isValid) {
      toastError(t('profile.validationError'), {
        description: validationResult.message,
      });
      return;
    }

    // Additional validation for specific fields
    if (formData.email && !isValidEmail(formData.email)) {
      toastError(t('profile.validationError'), {
        description: "Email không hợp lệ",
      });
      return;
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      toastError(t('profile.validationError'), {
        description: "Số điện thoại không hợp lệ",
      });
      return;
    }

    try {
      setSaving(true);
      
      // Prepare update data - only include fields that have values
      const updateData: UpdateUserRequest = {};
      
      if (formData.firstName !== profileData?.firstName) {
        updateData.firstName = formData.firstName;
      }
      if (formData.lastName !== profileData?.lastName) {
        updateData.lastName = formData.lastName;
      }
      if (formData.email !== profileData?.email) {
        updateData.email = formData.email;
      }
      if (formData.phone !== profileData?.phone) {
        updateData.phone = formData.phone;
      }
      if (formData.birthDay !== profileData?.birthDay) {
        updateData.birthDay = formData.birthDay;
      }
      if (formData.password) {
        updateData.password = formData.password;
        updateData.repassword = formData.repassword;
      }

      const response = await api.user.updateUserInfo(updateData);
      
      const isSuccessResponse = (
        response.status === 200 || 
        response.status === 201 || 
        response.status === 204 || 
        response.status === 202 ||
        response.status === undefined // Handle 204 No Content case
      );
      
      if (isSuccessResponse) {
        // Update local profile data with new data
        if (profileData) {
          // For 204 No Content, update based on what we sent (updateData merged with current formData)
          // For 200/201, use response.data if available, otherwise fallback to updateData
          const updatedData = response.data || { ...profileData, ...updateData };
          
          setProfileData({
            ...profileData,
            firstName: updatedData.firstName ?? profileData.firstName,
            lastName: updatedData.lastName ?? profileData.lastName,
            email: updatedData.email ?? profileData.email,
            phone: updatedData.phone ?? profileData.phone,
            birthDay: updatedData.birthDay ?? profileData.birthDay,
            avatar: updatedData.avatar ?? profileData.avatar,
            fullName: `${updatedData.firstName ?? profileData.firstName} ${updatedData.lastName ?? profileData.lastName}`.trim(),
          });
        }
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          password: '',
          repassword: '',
        }));
        
        setIsEditMode(false);
        setHasChanges(false);
        
        toastSuccess(t('profile.profileUpdated'), {
          description: (response.status === 204 || response.status === undefined)
            ? 'Thông tin đã được cập nhật thành công'
            : t('profile.changesSaved'),
          duration: 3000,
        });
      } else {
        console.error('Unexpected API response status:', {
          status: response.status,
          message: response.message,
          data: response.data
        });
        
        // Check if status is in 2xx range (success) but not explicitly handled
        if (response.status && response.status >= 200 && response.status < 300) {
          console.warn('⚠️ Treating unknown 2xx status as success:', response.status);
          
          // Update local profile data with fallback logic
          if (profileData) {
            const updatedData = response.data || { ...profileData, ...updateData };
            
            setProfileData({
              ...profileData,
              firstName: updatedData.firstName ?? profileData.firstName,
              lastName: updatedData.lastName ?? profileData.lastName,
              email: updatedData.email ?? profileData.email,
              phone: updatedData.phone ?? profileData.phone,
              birthDay: updatedData.birthDay ?? profileData.birthDay,
              avatar: updatedData.avatar ?? profileData.avatar,
              fullName: `${updatedData.firstName ?? profileData.firstName} ${updatedData.lastName ?? profileData.lastName}`.trim(),
            });
          }
          
          // Clear password fields
          setFormData(prev => ({
            ...prev,
            password: '',
            repassword: '',
          }));
          
          setIsEditMode(false);
          setHasChanges(false);
          
          toastSuccess(t('profile.profileUpdated'), {
            description: `Cập nhật thành công (Status: ${response.status})`,
            duration: 3000,
          });
        } else {
          throw new Error(`API returned status ${response.status ?? 'unknown'}: ${response.message || 'Update failed'}`);
        }
      }
    } catch (err: unknown) {
      console.error("Error updating user profile:", err);
      
      // Enhanced error logging
      if (err && typeof err === 'object' && 'response' in err) {
        const apiError = err as { response?: { status?: number; data?: unknown }; message?: string };
        console.error('API Error Details:', {
          status: apiError.response?.status,
          data: apiError.response?.data,
          message: apiError.message
        });
      }
      
      const errorMessage = handleDataFetchError(err);
      toastError(t('profile.updateError'), {
        description: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangeAvatar = () => {
    // TODO: Implement avatar upload functionality
    console.log('Avatar change clicked');
  };

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Loading State */}
        {loading && (
          <Card className="px-4 py-6 shadow-lg">
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-1 flex flex-col items-center">
                <Skeleton className="w-64 h-64 rounded-full" />
                <div className="mt-6 text-center space-y-2">
                  <Skeleton className="h-8 w-48 mx-auto" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              </div>
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid md:grid-cols-2 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="px-4 py-6 shadow-lg">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => window.location.reload()}
                >
                  {t('common.retry')}
                </Button>
              </AlertDescription>
            </Alert>
          </Card>
        )}

        {/* Main Profile Card - Only show when data is loaded */}
        {profileData && !loading && !error && (
          <Card className={`px-4 py-6 shadow-lg transition-all duration-300 ${
            isEditMode ? 'ring-2 ring-primary/20 bg-primary/5' : ''
          }`}>
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
                        {profileData.firstName?.charAt(0) || 'U'}
                        {profileData.lastName?.charAt(0) || 'S'}
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <h1 className="text-3xl font-bold mb-2">
                    {profileData.fullName || `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 'User'}
                  </h1>
                  <p className="text-muted-foreground mb-1">
                    {profileData.email || t('profile.noEmail')}
                  </p>
                  <p className="text-muted-foreground">
                    {profileData.birthDay ? new Date(profileData.birthDay).toLocaleDateString("vi-VN") : t('profile.noBirthday')}
                  </p>
                </div>
              </div>

              {/* Information Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <User className="w-6 h-6" />
                    {t('profile.title')}
                    {isEditMode && (
                      <span className="ml-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        Đang chỉnh sửa
                      </span>
                    )}
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <DisplayField
                    field="firstName"
                    label={t('profile.firstName')}
                    icon={User}
                    isEditMode={isEditMode}
                    currentValue={isEditMode 
                      ? (formData.firstName || '') 
                      : (profileData.firstName || '')}
                    onFieldChange={handleFieldChange}
                    t={t}
                  />

                  <DisplayField
                    field="lastName"
                    label={t('profile.lastName')}
                    icon={User}
                    isEditMode={isEditMode}
                    currentValue={isEditMode 
                      ? (formData.lastName || '') 
                      : (profileData.lastName || '')}
                    onFieldChange={handleFieldChange}
                    t={t}
                  />

                  <DisplayField
                    field="email"
                    label={t('profile.email')}
                    icon={Mail}
                    type="email"
                    isEditMode={isEditMode}
                    currentValue={isEditMode 
                      ? (formData.email || '') 
                      : (profileData.email || '')}
                    onFieldChange={handleFieldChange}
                    t={t}
                  />

                  <DisplayField
                    field="phone"
                    label={t('profile.phone')}
                    icon={Phone}
                    type="tel"
                    isEditMode={isEditMode}
                    currentValue={isEditMode 
                      ? (formData.phone || '') 
                      : (profileData.phone || '')}
                    onFieldChange={handleFieldChange}
                    t={t}
                  />

                  <div className="md:col-span-2">
                    <DisplayField
                      field="birthDay"
                      label={t('profile.birthday')}
                      icon={Calendar}
                      type="date"
                      isEditMode={isEditMode}
                      currentValue={isEditMode 
                        ? (formData.birthDay || '') 
                        : (profileData.birthDay || '')}
                      onFieldChange={handleFieldChange}
                      t={t}
                    />
                  </div>

                  <PasswordField
                    field="password"
                    label={t('profile.newPassword')}
                    placeholder={t('profile.newPasswordPlaceholder')}
                    isEditMode={isEditMode}
                    value={formData.password || ''}
                    onFieldChange={handleFieldChange}
                  />

                  <PasswordField
                    field="repassword"
                    label={t('profile.confirmPassword')}
                    placeholder={t('profile.confirmPasswordPlaceholder')}
                    isEditMode={isEditMode}
                    value={formData.repassword || ''}
                    onFieldChange={handleFieldChange}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8 pt-6 border-t">
                  {!isEditMode ? (
                    <Button 
                      className="px-6 py-2" 
                      onClick={handleEnterEditMode}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa thông tin
                    </Button>
                  ) : (
                    <>
                      <Button 
                        className="px-6 py-2" 
                        onClick={handleSaveChanges}
                        disabled={!hasChanges || saving}
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {t('profile.saving')}
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            {t('profile.saveChanges')}
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        className="px-6 py-2"
                        onClick={handleCancelEdit}
                        disabled={saving}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('profile.cancel')}
                      </Button>
                    </>
                  )}
                </div>

                {/* Changes indicator */}
                {hasChanges && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {t('profile.unsavedChanges')}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
