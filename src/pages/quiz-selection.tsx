import { Button, Icon, Page, Text, Box, useNavigate } from "zmp-ui";
import useAuth from "../hook/authhook";
import { getQuizTemplates } from "../api/quiz";
import { createUser } from "../api/auth";
import { useState, useEffect } from "react";
import useZaloUserData from "../hook/useZaloUserData";
import Navbar from "../components/Navbar";
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
  totalPoints: number;
  rewards: {
    fair: QuizReward;
    good: QuizReward;
    poor: QuizReward;
    average: QuizReward;
    excellent: QuizReward;
  };
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
  // // useEffect để xử lý khi state đã update
  // useEffect(() => {
  //   const handleUserData = async () => {
  //     if (shouldFetch && !isLoadingUser) {
  //       // Chỉ chuyển page khi user đồng ý chia sẻ
  //       if (userInfo && phoneNumber) {
  //         // Gọi API createUser
  //         try {
  //           const userData = {
  //             userId: userInfo.id,
  //             name: userInfo.name,
  //             phone: phoneNumber.number,
  //             avatar: userInfo.avatar,
  //             idByOA: userInfo.idByOA || "",
  //             followedOA: userInfo.followedOA || false,
  //             isSensitive: userInfo.isSensitive || false,
  //           };
            
  //           await createUser(userData);
            
  //           // Chỉ chuyển page sau khi tạo user thành công
  //           const selectedQuizId = localStorage.getItem("selectedQuizId");
  //           if (selectedQuizId) {
  //             navigate(`/quiz/${selectedQuizId}`);
  //             localStorage.removeItem("selectedQuizId");
  //           } else {
  //             navigate("/quiz-selection");
  //           }
  //         } catch (error: any) {
  //           // Nếu tạo user thất bại, vẫn chuyển page
  //           const selectedQuizId = localStorage.getItem("selectedQuizId");
  //           if (selectedQuizId) {
  //             navigate(`/quiz/${selectedQuizId}`);
  //             localStorage.removeItem("selectedQuizId");
  //           } else {
  //             navigate("/quiz-selection");
  //           }
  //         }
  //       } else {
  //         // User từ chối chia sẻ -> không chuyển page, chỉ reset state
  //         console.log("User từ chối chia sẻ dữ liệu");
  //       }
        
  //       setIsProcessing(false);
  //       setShouldFetch(false);
  //     }
  //   };

  //   handleUserData();
  // }, [userInfo, phoneNumber, isLoadingUser, shouldFetch, navigate]);

  // const handleStartQuiz = async (quizId: number) => {
  //   try {
  //     setIsProcessing(true);
      
  //     // Gọi hook để lấy thông tin user từ Zalo khi bấm button
  //     await fetchUserData();
      
  //     // Trigger useEffect để xử lý khi state đã update
  //     setShouldFetch(true);
      
  //     // Lưu quizId để sử dụng sau khi xử lý user data
  //     localStorage.setItem("selectedQuizId", quizId.toString());
      
  //   } catch (error: any) {
  //     // Nếu có lỗi, reset state và không chuyển page
  //     console.log("Lỗi khi lấy dữ liệu user:", error);
  //     setIsProcessing(false);
  //     setShouldFetch(false);
  //   }
  // };
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
      <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full overflow-hidden animate-pulse">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt="User Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white flex items-center justify-center">
                <Icon icon="zi-user" className="text-purple-600" />
              </div>
            )}
          </div>
          <div>
            <Text size="small" className="text-white font-bold">RVOPV - KIẾN THỨC DƯỢC PHẨM</Text>
            <Text size="xSmall" className="text-blue-100">Xin chào! {user?.name || "Dược sĩ"}</Text>
          </div>
        </div>
   
      </div>

      {/* Main Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Main Title */}
        <Box className="bg-gradient-to-r from-white to-blue-50 rounded-2xl p-5 shadow-lg border-2 border-purple-300">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <Icon icon="zi-star" className="text-purple-600 animate-bounce" />
              <Text.Title size="large" className="text-purple-600 font-bold">
                RVOPV QUIZ
              </Text.Title>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Text.Title size="large" className="text-blue-600 font-bold">
                KIẾN THỨC DƯỢC PHẨM
              </Text.Title>
              <Icon icon="zi-heart" className="text-blue-600 animate-pulse" />
            </div>
          </div>
        </Box>

        {/* Description */}
        <Box className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 shadow-lg">
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
        </Box>

        {/* Quiz Templates */}
        {isLoading ? (
          <Box className="bg-white rounded-3xl p-6 shadow-xl">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <Text size="normal" className="text-gray-600">Đang tải danh sách quiz...</Text>
            </div>
          </Box>
        ) : (
          quizTemplates.map((quiz, index) => (
            <Box 
              key={quiz.id} 
              className={`bg-gradient-to-r ${
                index % 2 === 0 
                  ? 'from-emerald-500 to-teal-600' 
                  : 'from-orange-500 to-pink-600'
              } rounded-3xl p-6 shadow-xl relative overflow-hidden transform hover:scale-105 transition-all duration-300`}
            >
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 flex space-x-1">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>

              <div className="h-36 flex flex-col justify-between">
                {/* Top Section: Image and Title */}
                <div className="flex items-start space-x-4">
                  {/* Quiz Image */}
                  {quiz.url && (
                    <div className="flex-shrink-0 w-28 h-28 rounded-2xl overflow-hidden border-3 border-white shadow-lg">
                      <img 
                        src={quiz.url} 
                        alt={quiz.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Quiz Content */}
                  <div className="flex-1 space-y-2">
                    <Text.Title size="large" className={`font-bold leading-tight ${
                      index % 2 === 0 ? 'text-green-100' : 'text-orange-100'
                    }`}>
                      {quiz.name}
                    </Text.Title>
                    <Text.Title size="normal" className={`font-bold ${
                      index % 2 === 0 ? 'text-orange-300' : 'text-green-100'
                    }`}>
                      {quiz.questions.length} câu hỏi • {quiz.totalPoints} điểm
                    </Text.Title>
                  </div>
                </div>
                
                {/* Bottom Section: Button */}
                <div className="flex justify-center pt-2">
                  <Button
                    variant="primary"
                    size="medium"
                    disabled={isProcessing}
                    className={`text-white font-bold py-2 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 ${
                      index % 2 === 0 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-600'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    suffixIcon={isProcessing ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div> : <Icon icon="zi-play" />}
                    onClick={() => {
                      navigate(`/quiz/${quiz.id}`);
                    }}
                  >
                    {isProcessing ? "ĐANG XỬ LÝ..." : "LÀM NGAY"}
                  </Button>
                </div>
              </div>
            </Box>
          ))
        )}
          <Navbar
            activeTab="quiz-selection"
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

export default QuizSelectionPage;
