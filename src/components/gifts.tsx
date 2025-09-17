import { Button, Icon, Page, Text, Box, useNavigate } from "zmp-ui";
import useAuth from "../hook/authhook";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";

function GiftsPage() {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoBack = () => {
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
    console.log("Add clicked");
  };

  // Cập nhật dữ liệu từ server khi component mount (chỉ 1 lần)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        await checkAuth();
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Chỉ fetch nếu chưa có dữ liệu hoặc dữ liệu cũ
    if (!user?.giftName || user.giftName.length === 0) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, []); // Empty dependency array - chỉ chạy 1 lần khi mount

  // Component hiển thị danh sách phần thưởng
  const GiftsList = () => {
    if (!user?.giftName || user.giftName.length === 0) {
      return (
        <Box className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Icon icon="zi-star" className="text-gray-400 text-3xl" />
            </div>
            <div className="space-y-2">
              <Text size="large" className="text-gray-600 font-bold">
                Chưa có phần thưởng
              </Text>
              <Text size="normal" className="text-gray-500">
                Hoàn thành quiz để nhận phần thưởng và điểm thưởng
              </Text>
            </div>
            <Button
              variant="primary"
              size="medium"
              onClick={() => navigate("/quiz-selection")}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg"
            >
              <Icon icon="zi-play" />
              Bắt đầu quiz
            </Button>
          </div>
        </Box>
      );
    }

    // Tính tổng điểm
    const totalPoints = user.giftName.reduce((total, gift) => total + gift.point, 0);
    const usedPoints = user.giftName
      .filter(gift => gift.isUsed)
      .reduce((total, gift) => total + gift.point, 0);
    const availablePoints = totalPoints - usedPoints;

    return (
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          {/* Total Points */}
          <Box className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 shadow-lg">
            <div className="text-center space-y-2">
              <Icon icon="zi-star" className="text-white text-xl mx-auto" />
              <Text size="small" className="text-white font-bold">
                {totalPoints}
              </Text>
              <Text size="xSmall" className="text-blue-100">
                Tổng điểm
              </Text>
            </div>
          </Box>

          {/* Available Points */}
          <Box className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 shadow-lg">
            <div className="text-center space-y-2">
              <Icon icon="zi-check" className="text-white text-xl mx-auto" />
              <Text size="small" className="text-white font-bold">
                {availablePoints}
              </Text>
              <Text size="xSmall" className="text-green-100">
                Có thể dùng
              </Text>
            </div>
          </Box>

          {/* Used Points */}
          <Box className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl p-4 shadow-lg">
            <div className="text-center space-y-2">
              <Icon icon="zi-check-circle" className="text-white text-xl mx-auto" />
              <Text size="small" className="text-white font-bold">
                {usedPoints}
              </Text>
              <Text size="xSmall" className="text-gray-100">
                Đã sử dụng
              </Text>
            </div>
          </Box>
        </div>

        {/* Gifts List */}
        <Box className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <Text size="large" className="font-bold text-gray-800">
                Danh sách phần thưởng
              </Text>
              <Text size="small" className="text-gray-500">
                {user.giftName.length} phần thưởng
              </Text>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {user.giftName.map((gift, index) => (
                <div 
                  key={gift.id}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    gift.isUsed 
                      ? 'border-gray-200 bg-gray-50 opacity-70' 
                      : 'border-green-200 bg-green-50 hover:bg-green-100 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          gift.isUsed ? 'bg-gray-200' : 'bg-green-200'
                        }`}>
                          <Icon 
                            icon={gift.isUsed ? "zi-check" : "zi-star"} 
                            className={`text-lg ${gift.isUsed ? 'text-gray-500' : 'text-green-600'}`}
                          />
                        </div>
                        <div>
                          <Text size="normal" className={`font-bold ${gift.isUsed ? 'text-gray-500' : 'text-green-600'}`}>
                            +{gift.point} điểm
                          </Text>
                          {gift.isUsed && (
                            <span className="px-2 py-1 bg-gray-300 text-gray-600 text-xs rounded-full ml-2">
                              Đã sử dụng
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Text size="normal" className={`${gift.isUsed ? 'text-gray-500' : 'text-gray-700'} mb-2`}>
                        {gift.message}
                      </Text>
                      
                      <div className="flex items-center justify-between">
                        <Text size="small" className="text-gray-400">
                          {new Date(gift.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                        {/* {!gift.isUsed && (
                          <Button
                            variant="secondary"
                            size="small"
                            className="bg-green-500 text-white text-xs px-3 py-1 rounded-lg"
                          >
                            Sử dụng
                          </Button>
                        )} */}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Box>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <Page className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <Text size="normal" className="text-gray-600">Đang tải phần thưởng...</Text>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <Button 
            variant="secondary" 
            size="small"
            onClick={handleGoBack}
            className="text-white bg-white/20 hover:bg-white/30"
          >
            <Icon icon="zi-arrow-left" />
          </Button>
          <div>
            <Text size="small" className="text-white font-bold">RVOPV QUIZ</Text>
            <Text size="xSmall" className="text-blue-100">Phần thưởng</Text>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Page Title */}
        <Box className="bg-gradient-to-r from-white to-blue-50 rounded-2xl p-5 shadow-lg border-2 border-purple-300">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Icon icon="zi-star" className="text-yellow-500 text-2xl" />
              <Text.Title size="large" className="text-purple-600 font-bold">
                Phần thưởng của bạn
              </Text.Title>
            </div>
            <Text size="normal" className="text-gray-600">
              Xem và quản lý các phần thưởng đã nhận được
            </Text>
          </div>
        </Box>

        {/* Gifts List */}
        <GiftsList />

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

export default GiftsPage;
