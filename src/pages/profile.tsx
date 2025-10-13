import { Button, Icon, Page, Text, Box, useNavigate } from "zmp-ui";
import useAuth from "../hook/authhook";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { openWebview } from "zmp-sdk/apis";

function ProfilePage() {
  const navigate = useNavigate();
  const { user, status, refreshUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleRefreshProfile = async () => {
    setIsLoading(true);
    try {
      await refreshUserData();
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  const handleViewQuizHistory = () => {
    navigate("/quiz-history");
  };

  const handleViewRewards = () => {
    navigate("/gifts");
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate("/");
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

  const handleHelpSupport = () => {
    // Mở trang hỗ trợ trong Zalo webview
    openWebview({
      url: "https://zalo.me/2674761099009385171",
    });
  };

  return (
    <Page className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 px-4 pt-12 pb-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-2">
        
          <div>
            <Text size="small" className="text-white font-bold">RVOPV QUIZ</Text>
            <Text size="xSmall" className="text-blue-100">Hồ sơ cá nhân</Text>
          </div>
        </div>
        
       
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Box className="bg-gradient-to-r from-white to-blue-50 rounded-3xl p-6 shadow-xl border-2 border-purple-300">
          <div className="text-center space-y-4">
            {/* Avatar */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="User Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                      <Icon icon="zi-user" className="text-white text-3xl" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Icon icon="zi-check" className="text-white text-sm" />
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-2">
              <Text.Title size="xLarge" className="text-purple-600 font-bold">
                {user?.name || "Người dùng"}
              </Text.Title>
              <Text size="normal" className="text-gray-600">
                {user?.phone || "Chưa cập nhật"}
              </Text>
              <div className="flex items-center justify-center space-x-2">
                <Icon icon="zi-star" className="text-yellow-500" />
                <Text size="normal" className="text-gray-700 font-medium">
                  {user?.points || 0} điểm
                </Text>
              </div>
            </div>

            {/* Edit Profile Button */}
            <Button
              variant="primary"
              size="medium"
              onClick={handleEditProfile}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-2 px-6 rounded-xl shadow-lg"
            >
              <Icon icon="zi-edit" />
              Chỉnh sửa hồ sơ
            </Button>
          </div>
        </Box>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Quiz Completed */}
          <Box className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 shadow-lg">
            <div className="text-center space-y-2">
              <Icon icon="zi-check-circle" className="text-white text-2xl mx-auto" />
              <Text size="small" className="text-white font-bold">
                {user?.totalQuizzesCompleted || 0}
              </Text>
              <Text size="xSmall" className="text-emerald-100">
                Quiz đã hoàn thành
              </Text>
            </div>
          </Box>

          {/* Average Score */}
          <Box className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl p-4 shadow-lg">
            <div className="text-center space-y-2">
              <Icon icon="zi-star" className="text-white text-2xl mx-auto" />
              <Text size="small" className="text-white font-bold">
                {user?.averageScore || "0.00"}
              </Text>
              <Text size="xSmall" className="text-orange-100">
                Điểm trung bình
              </Text>
            </div>
          </Box>
        </div>

        {/* Menu Options */}
        <div className="space-y-3">
          {/* Quiz History */}
          <Box className="bg-white rounded-2xl p-4 shadow-lg">
            <button 
              onClick={handleViewQuizHistory}
              className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon icon="zi-star" className="text-blue-600" />
                </div>
                <div className="text-left">
                  <Text size="normal" className="font-bold text-gray-800">
                    Lịch sử quiz
                  </Text>
                  <Text size="small" className="text-gray-600">
                    Xem các quiz đã làm
                  </Text>
                </div>
              </div>
              <Icon icon="zi-arrow-right" className="text-gray-400" />
            </button>
          </Box>

          {/* Rewards */}
          <Box className="bg-white rounded-2xl p-4 shadow-lg">
            <button 
              onClick={handleViewRewards}
              className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Icon icon="zi-star" className="text-yellow-600" />
                </div>
                <div className="text-left">
                  <Text size="normal" className="font-bold text-gray-800">
                    Phần thưởng
                  </Text>
                  <Text size="small" className="text-gray-600">
                    Xem quà tặng và điểm thưởng
                  </Text>
                </div>
              </div>
              <Icon icon="zi-arrow-right" className="text-gray-400" />
            </button>
          </Box>

          {/* Settings */}
          {/* <Box className="bg-white rounded-2xl p-4 shadow-lg">
            <button 
              onClick={() => {}}
              className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Icon icon="zi-setting" className="text-gray-600" />
                </div>
                <div className="text-left">
                  <Text size="normal" className="font-bold text-gray-800">
                    Cài đặt
                  </Text>
                  <Text size="small" className="text-gray-600">
                    Quản lý tài khoản và thông báo
                  </Text>
                </div>
              </div>
              <Icon icon="zi-arrow-right" className="text-gray-400" />
            </button>
          </Box> */}

          {/* Help & Support */}
          <Box className="bg-white rounded-2xl p-4 shadow-lg">
            <button 
              onClick={handleHelpSupport}
              className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Icon icon="zi-chat" className="text-green-600" />
                </div>
                <div className="text-left">
                  <Text size="normal" className="font-bold text-gray-800">
                    Trợ giúp & Hỗ trợ
                  </Text>
                  <Text size="small" className="text-gray-600">
                    FAQ và liên hệ hỗ trợ
                  </Text>
                </div>
              </div>
              <Icon icon="zi-arrow-right" className="text-gray-400" />
            </button>
          </Box>
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
            openWebview({
              url: "https://zalo.me/2674761099009385171",
            })
          }
        />
      </div>
    </Page>
  );
}

export default ProfilePage;
