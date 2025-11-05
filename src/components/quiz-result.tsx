import { Button, Icon, Page, Text, Box, useNavigate, useLocation } from "zmp-ui";
import { useState, useEffect } from "react";
import useAuth from "../hook/authhook";
import Navbar from "./Navbar";
import { checkUserExists } from "../api/auth";
import { completeFollowOAStep } from "../api/apiStep";
import { showAlertToast } from "../api/apiAlert";
import { triggerTopup } from "../api/topup";
import { followOA, showToast, openWebview } from "zmp-sdk/apis";

interface RewardValue {
  description: string;
  type?: string;
  gift?: number;
  topup?: number;
  [key: string]: any; // Cho phép các trường khác trong tương lai
}

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
    reward?: {
      message?: string;
      rewardType?: string;
      rewardValue?: RewardValue;
    };
    userStats?: {
      totalQuizzesCompleted: number;
    };
    quiz?: {
      id: number;
      name: string;
      displayQuestions?: number;
    };
    user?: any;
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
        const { answers, quiz, timeSpent, apiResult, fromEditProfile, fromQuizSelection } = location.state || {};
        
        // If coming from edit profile or quiz selection, only need apiResult
        if (fromEditProfile || fromQuizSelection) {
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

  const handleFollowOAButtonClick = async () => {
    // Gọi follow OA và ở lại trang quiz-result
    // Sau khi follow OA thành công, refresh user data để ẩn button (vì đã hoàn thành step 3)
    await handleFollowOAThenNavigate("");
    
    // Refresh user data để cập nhật userSteps (để ẩn button nếu đã hoàn thành step 3)
    await refreshUserData();
  };

  const handleFollowOAThenNavigate = async (destination: string) => {
    try {
      await followOA({
        id: "129295702906748400",
      });
      
      // Complete follow OA step after successful follow
      if (user?.userId) {
        try {
          const followOAData = {
            followedOA: true
          };
          
          const followOAStepResult = await completeFollowOAStep(user.userId, followOAData);
          
          // If completeFollowOAStep successful, trigger topup
          if (followOAStepResult && followOAStepResult.success) {
            // Get quizId from resultData or location.state
            const quizId = resultData?.data?.quiz?.id || location.state?.quizId || location.state?.quiz?.id;
            
            if (quizId && user.userId) {
              try {
                await triggerTopup(user.userId, quizId);
              } catch (topupError) {
                // Don't block the flow if topup fails
              }
            }
          }
        } catch (followOAStepError) {
          // Don't block the flow if follow OA step completion fails
        }
      }
      
      await showAlertToast("success", "thankYou", "Cảm ơn bạn đã theo dõi!");
    } catch (error: any) {
      const code = error?.code;
      if (code === -201) {
        // Người dùng từ chối, không làm gì
      } else {
        // Có lỗi khác, không làm gì
      }
    } finally {
      // Chỉ chuyển trang nếu có destination
      if (destination) {
        navigate(destination);
      }
      // Nếu destination rỗng, ở lại trang hiện tại (quiz-result)
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
  
  // Fallback userStats nếu không có trong response
  const safeUserStats = userStats || { totalQuizzesCompleted: 0 };
  
  // Kiểm tra user đã hoàn thành stepOrder 3 (Follow OA) chưa
  const hasCompletedStep3 = user?.userSteps?.some(
    step => step.stepOrder === 3 && step.isCompleted === true
  ) || false;
  
  // Ensure reward exists with safe defaults
  // const safeReward = reward || {
  //   message: "Cảm ơn bạn đã tham gia đố vui!",
  // };
  


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
            <Text.Title size="xLarge" className="text-purple-600 font-bold mb-4">
              Chúc mừng bạn đã hoàn thành {submission.totalQuestions} câu đố
            </Text.Title>
            <Text size="normal" className="text-gray-600 mb-4">
             Chúc mừng bạn đã nhận được quà tặng {reward?.message}
            </Text>
            
            {/* Chỉ hiển thị text và button nếu chưa hoàn thành stepOrder 3 */}
            {!hasCompletedStep3 && (
              <>
                <Text size="normal" className="text-gray-600 mb-4">
                  Chỉ còn 1 bước nữa thôi để nhận quà nhé {user?.name} ơi!!!!
                </Text>
                {/* Follow OA Button */}
                <div className="mt-4">
                  <Button
                    variant="primary"
                    size="medium"
                    onClick={handleFollowOAButtonClick}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <div className="flex items-center justify-center space-x-2 leading-none">
                      <Icon icon="zi-star" className="text-lg flex-shrink-0 leading-none" />
                      <span className="text-sm font-semibold leading-none">Quan tâm OA để nhận quà ngay!</span>
                    </div>
                  </Button>
                </div>
              </>
            )}
          </div>
        </Box>

        {/* Reward Earned - Show if rewardValue exists OR if we have message/description */}
        {(reward?.rewardValue || reward?.message) && (
          <Box className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-4 shadow-lg">
            <div className="text-center space-y-2">
              <Icon icon="zi-star" className="text-white text-2xl mx-auto" />
              {reward?.rewardValue?.type && (
                <Text size="small" className="text-yellow-100 font-medium mb-1">
                  {reward.rewardValue.type}
                </Text>
              )}
              {/* Show description from rewardValue if available */}
              {reward?.rewardValue?.description && (
                <Text size="normal" className="text-white font-bold">
                  {reward.rewardValue.description}
                </Text>
              )}
              {/* Show message if no description */}
              {!reward?.rewardValue?.description && reward?.message && (
                <Text size="normal" className="text-white font-bold">
                  {reward.message}
                </Text>
              )}
              {reward?.rewardValue?.gift && (
                <Text size="small" className="text-yellow-100 font-medium mt-2">
                  Giá trị: {reward.rewardValue.gift.toLocaleString('vi-VN')} đ
                </Text>
              )}
              {reward?.rewardValue?.topup && (
                <Text size="small" className="text-yellow-100 font-medium mt-2">
                  Nạp tiền: {reward.rewardValue.topup.toLocaleString('vi-VN')} đ
                </Text>
              )}
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
                {safeUserStats.totalQuizzesCompleted}
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
