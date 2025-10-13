import { Button, Icon, Page, Text, Box, useNavigate } from "zmp-ui";
import useAuth from "../hook/authhook";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { openWebview } from "zmp-sdk/apis";

function ViewQuizHistoryPage() {
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
    if (!user?.quizAttempts || user.quizAttempts.length === 0) {
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
        console.log('Swipe gesture detected!'); // Debug log
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

  // Component hiển thị danh sách lịch sử quiz
  const QuizHistoryList = () => {
    if (!user?.quizAttempts || user.quizAttempts.length === 0) {
      return (
        <Box className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Icon icon="zi-star" className="text-gray-400 text-3xl" />
            </div>
            <div className="space-y-2">
              <Text size="large" className="text-gray-600 font-bold">
                Chưa có lịch sử quiz
              </Text>
              <Text size="normal" className="text-gray-500">
                Bắt đầu làm quiz để xem lịch sử của bạn
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

    // Tính thống kê
    const totalQuizzes = user.quizAttempts.length;
    const averageScore = user.averageScore || "0.00";
    const completedQuizzes = user.quizAttempts.filter(attempt => attempt.status === "completed").length;

    return (
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          {/* Total Quizzes */}
          <Box className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 shadow-lg">
            <div className="text-center space-y-2">
              <Icon icon="zi-star" className="text-white text-xl mx-auto" />
              <Text size="small" className="text-white font-bold">
                {totalQuizzes}
              </Text>
              <Text size="xSmall" className="text-blue-100">
                Tổng quiz
              </Text>
            </div>
          </Box>

          {/* Average Score */}
          <Box className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 shadow-lg">
            <div className="text-center space-y-2">
              <Icon icon="zi-check" className="text-white text-xl mx-auto" />
              <Text size="small" className="text-white font-bold">
                {averageScore}
              </Text>
              <Text size="xSmall" className="text-green-100">
                Điểm TB
              </Text>
            </div>
          </Box>

          {/* Completed Quizzes */}
          <Box className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 shadow-lg">
            <div className="text-center space-y-2">
              <Icon icon="zi-check-circle" className="text-white text-xl mx-auto" />
              <Text size="small" className="text-white font-bold">
                {completedQuizzes}
              </Text>
              <Text size="xSmall" className="text-purple-100">
                Hoàn thành
              </Text>
            </div>
          </Box>
        </div>

        {/* Quiz History List */}
        <Box className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <Text size="large" className="font-bold text-gray-800">
                Lịch sử quiz
              </Text>
              <Text size="small" className="text-gray-500">
                {totalQuizzes} quiz
              </Text>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {user.quizAttempts.map((attempt, index) => (
                <div 
                  key={attempt.id}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    attempt.status === "completed"
                      ? 'border-green-200 bg-green-50 hover:bg-green-100 hover:shadow-md'
                      : 'border-gray-200 bg-gray-50 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          attempt.status === "completed" ? 'bg-green-200' : 'bg-gray-200'
                        }`}>
                          <Icon 
                            icon={attempt.status === "completed" ? "zi-check" : "zi-star"} 
                            className={`text-lg ${attempt.status === "completed" ? 'text-green-600' : 'text-gray-500'}`}
                          />
                        </div>
                        <div>
                          <Text size="normal" className={`font-bold ${attempt.status === "completed" ? 'text-green-600' : 'text-gray-500'}`}>
                            {attempt.score}/100 điểm
                          </Text>
                          {attempt.status !== "completed" && (
                            <span className="px-2 py-1 bg-gray-300 text-gray-600 text-xs rounded-full ml-2">
                              Chưa hoàn thành
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Text size="normal" className={`${attempt.status === "completed" ? 'text-gray-700' : 'text-gray-500'} mb-2`}>
                        {attempt.name}
                      </Text>
                      
                      <div className="flex items-center justify-between">
                        <Text size="small" className="text-gray-400">
                          {new Date(attempt.completedAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            attempt.status === "completed" 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {attempt.status === "completed" ? "Hoàn thành" : "Chưa hoàn thành"}
                          </span>
                        </div>
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
            <Text size="normal" className="text-gray-600">Đang tải lịch sử quiz...</Text>
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
            <Text size="xSmall" className="text-blue-100">Lịch sử quiz</Text>
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
                Lịch sử quiz của bạn
              </Text.Title>
            </div>
            <Text size="normal" className="text-gray-600">
              Xem và theo dõi các quiz đã hoàn thành
            </Text>
          </div>
        </Box>

        {/* Quiz History List */}
        <QuizHistoryList />

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

export default ViewQuizHistoryPage;
