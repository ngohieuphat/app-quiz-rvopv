import { Button, Icon, Page, Text, Box, useNavigate } from "zmp-ui";
import useAuth from "../hook/authhook";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { openWebview } from "zmp-sdk/apis";

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

  // useEffect for swipe gesture
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const diffX = endX - startX; // Swipe từ trái sang phải
      const diffY = Math.abs(endY - startY);
      
      // Swipe từ trái sang phải (ít nhất 50px) và không quá nhiều theo chiều dọc
      if (diffX > 50 && diffY < 100 && startX < 50) {
        handleGoBack();
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

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

    // Tính tổng số phần thưởng
    const totalGifts = user.giftName.length;
    const usedGifts = user.giftName.filter(gift => gift.isUsed).length;
    const availableGifts = totalGifts - usedGifts;

    return (
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          {/* Total Gifts */}
          {/* <Box className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 shadow-lg">
            <div className="text-center space-y-2">
              <Icon icon="zi-star" className="text-white text-xl mx-auto" />
              <Text size="small" className="text-white font-bold">
                {totalGifts}
              </Text>
              <Text size="xSmall" className="text-blue-100">
                Tổng phần thưởng
              </Text>
            </div>
          </Box> */}

          {/* Available Gifts */}
          {/* <Box className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 shadow-lg">
            <div className="text-center space-y-2">
              <Icon icon="zi-check" className="text-white text-xl mx-auto" />
              <Text size="small" className="text-white font-bold">
                {availableGifts}
              </Text>
              <Text size="xSmall" className="text-green-100">
                Chưa dùng
              </Text>
            </div>
          </Box> */}

          {/* Used Gifts */}
          {/* <Box className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl p-4 shadow-lg">
            <div className="text-center space-y-2">
              <Icon icon="zi-check-circle" className="text-white text-xl mx-auto" />
              <Text size="small" className="text-white font-bold">
                {usedGifts}
              </Text>
              <Text size="xSmall" className="text-gray-100">
                Đã sử dụng
              </Text>
            </div>
          </Box> */}
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
              {[...user.giftName]
                .sort((a, b) => {
                  const dateA = new Date(a.createdAt).getTime();
                  const dateB = new Date(b.createdAt).getTime();
                  return dateB - dateA; // Mới nhất trước
                })
                .map((gift, index) => (
                <div 
                  key={gift.id}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    gift.isUsed 
                      ? 'border-gray-200 bg-gray-50 opacity-70' 
                      : 'border-green-200 bg-green-50 hover:bg-green-100 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      gift.isUsed ? 'bg-gray-200' : 'bg-green-200'
                    }`}>
                      <Icon 
                        icon={gift.isUsed ? "zi-check" : "zi-star"} 
                        className={`text-xl ${gift.isUsed ? 'text-gray-500' : 'text-green-600'}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          {gift.name && (
                            <Text 
                              size="normal" 
                              className={`font-bold mb-1 ${
                                gift.isUsed ? 'text-gray-500' : 'text-gray-800'
                              }`}
                            >
                              {gift.name}
                            </Text>
                          )}
                          {gift.description && (
                            <Text 
                              size="small" 
                              className={`line-clamp-2 ${
                                gift.isUsed ? 'text-gray-400' : 'text-gray-600'
                              }`}
                            >
                              {gift.description}
                            </Text>
                          )}
                        </div>
                        {gift.isUsed && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium flex-shrink-0">
                            Đã sử dụng
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
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
      <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 px-4 pt-12 pb-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <Button 
            variant="secondary" 
            size="small"
            onClick={handleGoBack}
            className="text-white bg-white/20 hover:bg-white/30 flex items-center justify-center"
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
            openWebview({
              url: "https://zalo.me/2674761099009385171",
            })
          }
        />
      </div>
    </Page>
  );
}

export default GiftsPage;
