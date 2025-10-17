import { Button, Icon, Page, Text, Box, useNavigate } from "zmp-ui";
import useAuth from "../hook/authhook";
import { getQuizTemplates } from "../api/quiz";
import { createUser, checkAttempt, checkUserExists } from "../api/auth";
import { useState, useEffect } from "react";
import useZaloUserData from "../hook/useZaloUserData";
import Navbar from "../components/Navbar";
import { openWebview } from "zmp-sdk/apis";
// Define quiz interface
interface QuizQuestion {
  id: number;
  type: string;
  points: number;
}

interface QuizReward {
  level: string;
  points: number;
  message: string;
  minScore: number;
}

interface QuizTemplate {
  id: number;
  name: string;
  url: string;
  totalQuestions: number;
  displayQuestions: number;
  actualQuestions: number;
  rewards: any[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  questions: QuizQuestion[];
}

function QuizSelectionPage() {
  const navigate = useNavigate();
  const { user, status, refreshUserData } = useAuth();
  const [quizTemplates, setQuizTemplates] = useState<QuizTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userInfo, phoneNumber, fetchUserData, isLoading: isLoadingUser } = useZaloUserData();
  const [isProcessing, setIsProcessing] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);
  useEffect(() => {
    const fetchQuizTemplates = async () => {
      try {
        setIsLoading(true);
        const response = await getQuizTemplates();
        if (response.success && response.data.quizzes) {
          setQuizTemplates(response.data.quizzes);
        }
      } catch (error) {
        console.error("Error fetching quiz templates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizTemplates();
  }, []);
  // useEffect để xử lý khi state đã update
  useEffect(() => {
    const handleUserData = async () => {
      if (shouldFetch && !isLoadingUser) {
        // Chỉ chuyển page khi user đồng ý chia sẻ
        if (userInfo && phoneNumber) {
          // Gọi API createUser
          try {
            const userData = {
              userId: userInfo.id,
              name: userInfo.name,
              phone: phoneNumber.number,
              avatar: userInfo.avatar,
              idByOA: userInfo.idByOA || "",
              followedOA: userInfo.followedOA || false,
              isSensitive: userInfo.isSensitive || false,
            };
            
            await createUser(userData);
            
            // Sau khi tạo user thành công, navigate trực tiếp (không cần checkAttempt)
            const selectedQuizId = localStorage.getItem("selectedQuizId");
            if (selectedQuizId) {
              navigate(`/quiz/${selectedQuizId}`);
              localStorage.removeItem("selectedQuizId");
            } else {
              navigate("/quiz-selection");
            }
          } catch (error: any) {
            // Nếu tạo user thất bại, vẫn chuyển page
            const selectedQuizId = localStorage.getItem("selectedQuizId");
            if (selectedQuizId) {
              navigate(`/quiz/${selectedQuizId}`);
              localStorage.removeItem("selectedQuizId");
            } else {
              navigate("/quiz-selection");
            }
          }
        } else {
          // User từ chối chia sẻ -> không chuyển page, chỉ reset state
        }
        
        setIsProcessing(false);
        setShouldFetch(false);
      }
    };

    handleUserData();
  }, [userInfo, phoneNumber, isLoadingUser, shouldFetch, navigate]);

  const handleStartQuiz = async (quizId: number) => {
    try {
      setIsProcessing(true);
      
      // Bước 1: Gọi checkAttempt trước để kiểm tra user có trong database không
      if (user && user.userId) {
        try {
          const attemptResult = await checkAttempt(user.userId, quizId);
          
          // Xử lý kết quả check attempt
          if (attemptResult && attemptResult.success && attemptResult.data) {
            if (attemptResult.data.hasAttempted) {
              // User đã làm quiz này rồi - kiểm tra address
              try {
                const userCheckResult = await checkUserExists(user.userId);
                
                if (userCheckResult && userCheckResult.success && userCheckResult.data) {
                  const hasAddress = userCheckResult.data.hasAddress && 
                                   userCheckResult.data.user && 
                                   userCheckResult.data.user.address && 
                                   userCheckResult.data.user.address.length > 0;
                  
                  if (!hasAddress) {
                    // User chưa cập nhật thông tin nhận thưởng
                    alert("Bạn đã làm quiz này rồi! Bạn chưa cập nhật thông tin nhận thưởng. Vui lòng cập nhật thông tin để nhận phần thưởng.");
                    
                    // Navigate to edit profile
                    navigate("/edit-profile", {
                      state: {
                        fromQuizSelection: true,
                        quizId: quizId,
                        message: "Cập nhật thông tin để nhận phần thưởng từ quiz đã hoàn thành"
                      }
                    });
                  } else {
                    // User đã có address - chỉ thông báo đã làm quiz
                    alert("Bạn đã làm quiz này rồi!");
                  }
                } else {
                  // Không kiểm tra được user info - chỉ thông báo đã làm quiz
                  alert("Bạn đã làm quiz này rồi!");
                }
              } catch (addressError) {
                // Lỗi khi kiểm tra address - chỉ thông báo đã làm quiz
                alert("Bạn đã làm quiz này rồi!");
              }
              
              setIsProcessing(false);
              setShouldFetch(false);
              return; // Dừng lại, không tiếp tục
            } else {
              // User chưa làm quiz này, tiếp tục bình thường
              navigate(`/quiz/${quizId}`);
              setIsProcessing(false);
              return;
            }
          } else {
            // API không trả về data hoặc lỗi, không cho qua
            alert("Không thể kiểm tra trạng thái quiz. Vui lòng thử lại!");
            setIsProcessing(false);
            setShouldFetch(false);
            return;
          }
        } catch (attemptError) {
          // Nếu check attempt lỗi, không cho qua
          alert("Lỗi khi kiểm tra trạng thái quiz. Vui lòng thử lại!");
          setIsProcessing(false);
          setShouldFetch(false);
          return;
        }
      }
      
      // Bước 2: Nếu không có user hoặc user.userId, gọi fetchUserData để tạo user
      await fetchUserData();
      
      // Trigger useEffect để xử lý khi state đã update
      setShouldFetch(true);
      
      // Lưu quizId để sử dụng sau khi xử lý user data
      localStorage.setItem("selectedQuizId", quizId.toString());
      
    } catch (error: any) {
      // Nếu có lỗi, reset state và không chuyển page
      setIsProcessing(false);
      setShouldFetch(false);
    }
  };
  const handleNavTabChange = (tab: "quiz-selection" | "profile") => {
    if (tab === "quiz-selection") {
      navigate("/quiz-selection");
    } else if (tab === "profile") {
      navigate("/profile");
    }
  };

  const handleAddClick = () => {
    // Assuming you have a navigation function or useNavigate
    // For now, we'll just log or remove if not needed
    // If you have useNavigate, you would do:
    // navigate("/add-event");
  };
  return (
    <Page className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 px-2 sm:px-4 pt-8 sm:pt-12 pb-2 sm:pb-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden animate-pulse flex-shrink-0">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt="User Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white flex items-center justify-center">
                <Icon icon="zi-user" className="text-purple-600 text-xs sm:text-sm" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <Text size="xSmall" className="text-white font-bold text-[10px] sm:text-xs leading-tight truncate">RVOPV - KIẾN THỨC DƯỢC PHẨM</Text>
            <Text size="xSmall" className="text-blue-100 text-[9px] sm:text-xs leading-tight truncate">Xin chào! {user?.name || "Dược sĩ"}</Text>
          </div>
        </div>
   
      </div>

      {/* Main Content */}
      <div className="px-2 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4 pb-20 sm:pb-24">
        {/* Main Title */}
        <Box className="bg-gradient-to-r from-white to-blue-50 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg border-2 border-purple-300">
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="flex items-center justify-center space-x-1.5 sm:space-x-2">
              <Icon icon="zi-star" className="text-purple-600 animate-bounce text-sm sm:text-base" />
              <Text.Title size="normal" className="text-purple-600 font-bold text-base sm:text-lg">
                RVOPV QUIZ
              </Text.Title>
            </div>
            <div className="flex items-center justify-center space-x-1.5 sm:space-x-2">
              <Text.Title size="normal" className="text-blue-600 font-bold text-sm sm:text-lg leading-tight">
                KIẾN THỨC DƯỢC PHẨM
              </Text.Title>
              <Icon icon="zi-heart" className="text-blue-600 animate-pulse text-sm sm:text-base" />
            </div>
          </div>
        </Box>

        {/* Description */}
        {/* <Box className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 shadow-lg">
          <div className="flex items-start space-x-3">
            <Icon icon="zi-heart" className="text-purple-600 mt-1 animate-pulse flex-shrink-0" />
            <Text size="normal" className="text-gray-700 leading-relaxed">
              Chào mừng bạn đến với{" "}
              <span className="text-purple-600 font-bold">RVOPV Quiz</span>{" "}
              - nền tảng trắc nghiệm kiến thức dược phẩm chuyên nghiệp. Tham gia các bài kiểm tra để nâng cao hiểu biết về{" "}
              <span className="text-blue-600 font-bold">thuốc, dược phẩm và chăm sóc sức khỏe</span>{" "}
              cộng đồng. Mỗi câu trả lời đúng sẽ giúp bạn tích lũy điểm thưởng và nhận được những phần quà hấp dẫn từ RVOPV.
            </Text>
          </div>
        </Box> */}

        {/* Quiz Templates */}
        {isLoading ? (
          <Box className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
            <div className="text-center">
              <div className="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-3 sm:border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3 sm:mb-4"></div>
              <Text size="small" className="text-gray-600 text-xs sm:text-sm">Đang tải danh sách quiz...</Text>
            </div>
          </Box>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {quizTemplates.map((quiz, index) => (
            <Box 
              key={quiz.id} 
              className={`bg-gradient-to-r ${
                index % 2 === 0 
                  ? 'from-emerald-500 to-teal-600' 
                  : 'from-orange-500 to-pink-600'
              } rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-xl relative overflow-hidden transform hover:scale-105 transition-all duration-300 w-full`}
            >
              {/* Decorative elements */}
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex space-x-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>

              <div className="h-[140px] sm:h-36 flex flex-col justify-between">
                {/* Top Section: Image and Title */}
                <div className="flex items-start space-x-2 sm:space-x-4 h-full">
                  {/* Quiz Image */}
                  {quiz.url && (
                    <div className="flex-shrink-0 w-20 h-20 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-3 border-white shadow-lg">
                      <img 
                        src={quiz.url} 
                        alt={quiz.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Quiz Content */}
                  <div className="flex-1 space-y-1 sm:space-y-2 min-w-0 flex flex-col justify-center">
                    <Text.Title size="small" className={`font-bold leading-tight text-sm sm:text-lg ${
                      index % 2 === 0 ? 'text-green-100' : 'text-orange-100'
                    }`}>
                      {quiz.name}
                    </Text.Title>
                    <Text size="xSmall" className={`font-bold text-xs sm:text-sm ${
                      index % 2 === 0 ? 'text-orange-300' : 'text-green-100'
                    }`}>
                      {quiz.actualQuestions || quiz.displayQuestions || quiz.totalQuestions || 0} câu hỏi • 100 điểm
                    </Text>
                  </div>
                </div>
                
                {/* Bottom Section: Button */}
                <div className="flex justify-center pt-2 sm:pt-2">
                  <Button
                    variant="primary"
                    size="small"
                    disabled={isProcessing}
                    className={`text-white font-bold py-1.5 px-4 sm:py-2 sm:px-6 rounded-lg sm:rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 text-xs sm:text-sm ${
                      index % 2 === 0 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-600'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    suffixIcon={isProcessing ? <div className="animate-spin w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full"></div> : <Icon icon="zi-play" className="text-xs sm:text-sm" />}
                    onClick={() => {
                      handleStartQuiz(quiz.id);
                    }}
                  >
                    {isProcessing ? "ĐANG XỬ LÝ..." : "LÀM NGAY"}
                  </Button>
                </div>
              </div>
            </Box>
            ))}
          </div>
        )}
          <Navbar
            activeTab="quiz-selection"
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

export default QuizSelectionPage;
