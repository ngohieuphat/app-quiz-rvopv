import { Button, Icon, Page, Text, Box, useNavigate, Input } from "zmp-ui";
import useAuth from "../hook/authhook";
import { useState, useEffect } from "react";
import { updateUserPharmacy } from "../api/auth";
import Navbar from "./Navbar";

function EditProfilePage() {
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    pharmacyName: "",
    address: {
      street: "",
      ward: "",
      district: "",
      city: "",
      isDefault: true
    }
  });

  useEffect(() => {
    // Initialize form with user data if available
    if (user) {
      
      // Lấy dữ liệu address từ user
      let addressData = {
        street: "",
        ward: "",
        district: "",
        city: "",
        isDefault: true
      };

      // Kiểm tra nếu user.address là array và có phần tử đầu tiên
      if (Array.isArray(user.address) && user.address.length > 0) {
        const firstAddress = user.address[0];
        addressData = {
          street: firstAddress.street || "",
          ward: firstAddress.ward || "",
          district: firstAddress.district || "",
          city: firstAddress.city || "",
          isDefault: firstAddress.isDefault || true
        };
      } 
      // Kiểm tra nếu user.address là object
      else if (user.address && typeof user.address === 'object') {
        addressData = {
          street: user.address.street || "",
          ward: user.address.ward || "",
          district: user.address.district || "",
          city: user.address.city || "",
          isDefault: user.address.isDefault || true
        };
      }

      setFormData({
        pharmacyName: user.pharmacyName || "",
        address: addressData
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    if (!user?.userId) {
      console.error("User ID not found");
      return;
    }

    setIsLoading(true);
    try {
      await updateUserPharmacy(user.userId, formData);
      // Tự động cập nhật dữ liệu user sau khi lưu thành công
      await refreshUserData();
      navigate("/profile");
    } catch (error) {
      console.error("Error updating pharmacy:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  const handleNavTabChange = (tab: "quiz-selection" | "profile") => {
    if (tab === "quiz-selection") {
      navigate("/quiz-selection");
    } else if (tab === "profile") {
      navigate("/profile");
    }
  };

  const handleAddClick = () => {
    // TODO: Handle add click
  };

  return (
    <Page className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-2">
          <Button
            variant="tertiary"
            size="small"
            onClick={handleCancel}
            className="text-white"
          >
            <Icon icon="zi-arrow-left" />
          </Button>
          <div>
            <Text size="small" className="text-white font-bold">RVOPV QUIZ</Text>
            <Text size="xSmall" className="text-blue-100">Chỉnh sửa hồ sơ</Text>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Pharmacy Information Form */}
        <Box className="bg-white rounded-3xl p-6 shadow-xl">
          <div className="space-y-6">
            <div className="text-center">
              <Text.Title size="large" className="text-purple-600 font-bold mb-2">
                Thông tin nhà thuốc
              </Text.Title>
              <Text size="small" className="text-gray-600">
                Cập nhật thông tin nhà thuốc của bạn
              </Text>
            </div>

            {/* Pharmacy Name */}
            <div className="space-y-2">
              <Text size="normal" className="font-medium text-gray-700">
                Tên nhà thuốc *
              </Text>
              <Input
                placeholder="Nhập tên nhà thuốc"
                value={formData.pharmacyName}
                onChange={(e) => handleInputChange('pharmacyName', e.target.value)}
                className="w-full"
              />
            </div>


            {/* Street */}
            <div className="space-y-2">
              <Text size="normal" className="font-medium text-gray-700">
                Đường/Phố
              </Text>
              <Input
                placeholder="Nhập tên đường/phố"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Ward */}
            <div className="space-y-2">
              <Text size="normal" className="font-medium text-gray-700">
                Phường/Xã
              </Text>
              <Input
                placeholder="Nhập phường/xã"
                value={formData.address.ward}
                onChange={(e) => handleInputChange('address.ward', e.target.value)}
                className="w-full"
              />
            </div>

            {/* District */}
            <div className="space-y-2">
              <Text size="normal" className="font-medium text-gray-700">
                Quận/Huyện
              </Text>
              <Input
                placeholder="Nhập quận/huyện"
                value={formData.address.district}
                onChange={(e) => handleInputChange('address.district', e.target.value)}
                className="w-full"
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Text size="normal" className="font-medium text-gray-700">
                Thành phố/Tỉnh
              </Text>
              <Input
                placeholder="Nhập thành phố/tỉnh"
                value={formData.address.city}
                onChange={(e) => handleInputChange('address.city', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Default Address Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <Text size="normal" className="font-medium text-gray-700">
                  Địa chỉ mặc định
                </Text>
                <Text size="small" className="text-gray-500">
                  Sử dụng làm địa chỉ chính
                </Text>
              </div>
              <Button
                variant={formData.address.isDefault ? "primary" : "secondary"}
                size="small"
                onClick={() => handleInputChange('address.isDefault', (!formData.address.isDefault).toString())}
                className={formData.address.isDefault ? "bg-green-500" : ""}
              >
                {formData.address.isDefault ? "Có" : "Không"}
              </Button>
            </div>
          </div>
        </Box>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button
            variant="secondary"
            size="large"
            onClick={handleCancel}
            className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl"
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            size="large"
            onClick={handleSave}
            disabled={isLoading || !formData.pharmacyName}
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <Text size="small">Đang lưu...</Text>
              </div>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </div>

        {/* Footer Info */}
        <div className="text-center space-y-2">
          <Text size="xSmall" className="text-gray-500">
            RVOPV Quiz - Kiến thức dược phẩm
          </Text>
          <Text size="xSmall" className="text-gray-400">
            Công ty dược phẩm RVOPV
          </Text>
        </div>

        {/* Navbar */}
        <Navbar
          activeTab="profile"
          onTabChange={handleNavTabChange}
          onAddClick={handleAddClick}
          onZaloClick={() =>
            window.open("https://zalo.me/2674761099009385171", "_blank")
          }
        />
      </div>
    </Page>
  );
}

export default EditProfilePage;
