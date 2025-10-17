import { Button, Icon, Page, Text, Box, useNavigate, useLocation } from "zmp-ui";
import { useState, useEffect } from "react";
import useAuth from "../hook/authhook";
import Navbar from "./Navbar";
import { checkUserExists } from "../api/auth";
import { completeFollowOAStep } from "../api/apiStep";
import { followOA, showToast, openWebview } from "zmp-sdk/apis";

interface QuizResultData {
  success: boolean;
  data: {
    submission: {
      id: number;
      scorePercentage: number;
      totalQuestions: number;
      correctAnswers: number;
      timeSpent: number;
      completedAt: string;
    };
    reward: {
      level: string;
      message: string;
      rewardType?: string;
      rewardValue?: {
        type: string;
        amount: string;
        description: string;
        voucherCode?: string;
      };
    };
    userStats: {
      totalQuizzesCompleted: number;
    };
  };
}

function QuizResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUserData, user } = useAuth();
  const [resultData, setResultData] = useState<QuizResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);

  // useEffect for displaying quiz result
  useEffect(() => {
    const displayQuizResult = () => {
      try {
        // Get quiz data from navigation state
        const { answers, quiz, timeSpent, apiResult, fromEditProfile } = location.state || {};
        
        // If coming from edit profile, only need apiResult
        if (fromEditProfile) {
          if (apiResult && apiResult.success) {
            setResultData(apiResult);
          } else {
            setResultData(null); // Show error state
          }
          // Don't set isLoading to false here, let it continue to load user data
        } else {
          // Normal flow from quiz
          if (!answers || !quiz) {
            setIsLoading(false);
            return;
          }

          // Use API result if available, otherwise show error
          if (apiResult && apiResult.success) {
            setResultData(apiResult);
          } else {
            setResultData(null); // Show error state
          }
        }

      } catch (error) {
        setIsLoading(false);
        return;
      } finally {
        // Always set loading to false
        setIsLoading(false);
        // Refresh user data to update points
        refreshUserData();
      }
    };

    displayQuizResult();
  }, [location.state, refreshUserData]);

  // useEffect for checking user info
  useEffect(() => {
    const checkUser = async () => {
      if (!user?.userId) {
        return;
      }

      try {
        const userCheckResult = await checkUserExists(user.userId);
        
        if (userCheckResult && userCheckResult.success && userCheckResult.data) {
          setUserInfo(userCheckResult.data);
        }
      } catch (error) {
        // Handle error silently
      }
    };

    checkUser();
  }, [user?.userId]);

  const handleFollowOAThenNavigate = async (destination: string) => {
    try {
      await followOA({
        id: "129295702906748400",
      });
      
      // Complete follow OA step after successful follow
      if (user?.userId) {
        try {
          console.log('👥 Completing follow OA step...');
          const followOAData = {
            followedOA: true
          };
          console.log('Follow OA step data:', followOAData);
          
          const followOAStepResult = await completeFollowOAStep(user.userId, followOAData);
          console.log('✅ Follow OA step completed successfully:', followOAStepResult);
        } catch (followOAStepError) {
          console.error('❌ Error completing follow OA step:', followOAStepError);
          // Don't block the flow if follow OA step completion fails
        }
      }
      
      await showToast({
        message: "Cảm ơn bạn đã theo dõi!",
      });
    } catch (error: any) {
      const code = error?.code;
      if (code === -201) {
        // Người dùng từ chối, vẫn chuyển trang
      } else {
        // Có lỗi khác, vẫn chuyển trang
      }
    } finally {
      // Luôn chuyển trang sau khi gọi SDK
      navigate(destination);
    }
  };

  const handleGoHome = () => {
    navigate("/quiz-selection");
  };

  const handleGoToEditProfile = () => {
    handleFollowOAThenNavigate("/edit-profile");
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

  const getLevelColor = (level: string) => {
    switch (level) {
      case "excellent":
      case "Xuất sắc":
        return "from-green-500 to-emerald-600";
      case "good":
      case "Khá tốt":
        return "from-blue-500 to-cyan-600";
      case "average":
      case "Cố gắng":
        return "from-yellow-500 to-orange-600";
      case "fair":
      case "Chưa đạt":
        return "from-orange-500 to-red-500";
      case "poor":
        return "from-red-500 to-pink-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "excellent":
      case "Xuất sắc":
        return "zi-star";
      case "good":
      case "Khá tốt":
        return "zi-check";
      case "average":
      case "Cố gắng":
        return "zi-info-circle";
      case "fair":
      case "Chưa đạt":
        return "zi-warning";
      case "poor":
        return "zi-close";
      default:
        return "zi-star";
    }
  };

  const getLevelText = (level: string) => {
    return "Cảm ơn bạn đã tham gia đố vui";
  };

  if (isLoading) {
    return (
      <Page className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <Text size="normal" className="text-gray-600">Đang tính toán kết quả...</Text>
          </div>
        </div>
      </Page>
    );
  }

  if (!resultData) {
    return (
      <Page className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Icon icon="zi-close" className="text-red-500 text-6xl mb-4" />
            <Text.Title size="large" className="text-red-600 mb-2">Không có kết quả</Text.Title>
            <Button 
              variant="primary" 
              onClick={() => navigate("/quiz-selection")}
              className="mt-4"
            >
              Quay lại
            </Button>
          </div>
        </div>
      </Page>
    );
  }

  const { submission, reward, userStats } = resultData.data;
  const scorePercentage = Math.round((submission.correctAnswers / submission.totalQuestions) * 100);

  return (
    <Page className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-2">
          <div>
            <Text size="small" className="text-white font-bold">RVOPV QUIZ</Text>
            <Text size="xSmall" className="text-blue-100">Kết quả quiz</Text>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Result Header */}
        <Box className="bg-white rounded-3xl p-6 shadow-xl text-center">
          <div className="mb-4">
            <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${getLevelColor(reward.level)} flex items-center justify-center mb-4`}>
              <Icon icon={getLevelIcon(reward.level)} className="text-white text-3xl" />
            </div>
            <Text.Title size="xLarge" className="text-purple-600 font-bold mb-2">
              {getLevelText(reward.level)}
            </Text.Title>
            <Text size="normal" className="text-gray-600 mb-4">
              {reward.message}
            </Text>
            
            {/* Follow OA Button */}
            <div className="mt-4">
              <Button
                variant="primary"
                size="medium"
                onClick={() => handleFollowOAThenNavigate("/quiz-selection")}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-center justify-center space-x-2 leading-none">
                  <Icon icon="zi-add-user" className="text-lg flex-shrink-0 leading-none" />
                  <span className="text-sm font-semibold leading-none">Theo dõi OA để nhận thưởng</span>
                </div>
              </Button>
            </div>
          </div>
        </Box>

        {/* Score Display */}
        <Box className="bg-white rounded-3xl p-6 shadow-xl">
          <div className="text-center mb-6">
            <Text.Title size="large" className="text-gray-800 font-bold mb-2">
              Điểm số của bạn
            </Text.Title>
            <div className="text-6xl font-bold text-purple-600 mb-2">
              {scorePercentage}%
            </div>
            <Text size="normal" className="text-gray-600">
              {submission.correctAnswers}/{submission.totalQuestions} câu đúng
            </Text>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all duration-1000"
              style={{ width: `${scorePercentage}%` }}
            ></div>
          </div>
        </Box>

        {/* Reward Earned */}
        {reward.rewardValue && (
          <Box className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-4 shadow-lg">
            <div className="text-center space-y-2">
              <Icon icon="zi-star" className="text-white text-2xl mx-auto" />
              <Text size="normal" className="text-white font-bold">
                {reward.rewardValue.description}
              </Text>
              {reward.rewardValue.voucherCode && (
                <div className="bg-white/20 rounded-lg px-3 py-2 mt-2">
                  <Text size="xSmall" className="text-yellow-100 font-medium">
                    Mã voucher: {reward.rewardValue.voucherCode}
                  </Text>
                </div>
              )}
              <Text size="xSmall" className="text-yellow-100 font-medium">
                {reward.message}
              </Text>
            </div>
          </Box>
        )}

        {/* User Stats */}
        <Box className="bg-white rounded-3xl p-6 shadow-xl">
          <Text.Title size="large" className="text-gray-800 font-bold mb-4 text-center">
            Thống kê tổng quan
          </Text.Title>
          
          <div className="space-y-4">
            {/* Quizzes Completed */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <Icon icon="zi-check" className="text-blue-600" />
                <Text size="normal" className="font-medium text-gray-700">
                  Quiz đã hoàn thành
                </Text>
              </div>
              <Text size="normal" className="font-bold text-blue-600">
                {userStats.totalQuizzesCompleted}
              </Text>
            </div>
          </div>
        </Box>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Button: Về trang chủ */}
          <Button
            variant="secondary"
            size="large"
            onClick={handleGoHome}
            className="w-full bg-gray-200 text-gray-700 font-bold py-4 rounded-xl"
          >
            <Icon icon="zi-home" />
            Về trang chủ
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

        {/* Navbar
        <Navbar
          activeTab="quiz-selection"
          onTabChange={handleNavTabChange}
          onAddClick={handleAddClick}
          onZaloClick={() =>
            openWebview({
              url: "https://zalo.me/2674761099009385171",
            })
          }
        /> */}
      </div>
    </Page>
  );
}

export default QuizResultPage;
