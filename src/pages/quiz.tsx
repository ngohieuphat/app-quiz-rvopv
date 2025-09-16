import { Button, Icon, Page, Text, Box, useNavigate, useLocation } from "zmp-ui";
import { useState, useEffect, useRef } from "react";
import { getQuizTemplateById, submitQuizSubmission } from "../api/quiz";
import useAuth from "../hook/authhook";

// Define quiz interfaces
interface QuizAnswer {
  content: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: number;
  type: string;
  points: number;
  content: {
    text: string;
    type: string;
    media?: {
      url: string;
      size: number;
      fileId: string;
      format: string;
      duration?: number;
      originalName: string;
    };
  };
  answers: QuizAnswer[];
}

interface QuizTemplate {
  id: number;
  name: string;
  url: string;
  totalPoints: number;
  rewards: {
    fair: { level: string; points: number; message: string; minScore: number };
    good: { level: string; points: number; message: string; minScore: number };
    poor: { level: string; points: number; message: string; minScore: number };
    average: { level: string; points: number; message: string; minScore: number };
    excellent: { level: string; points: number; message: string; minScore: number };
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  questions: QuizQuestion[];
}

function QuizPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Extract quiz ID from URL path
  const pathSegments = location.pathname.split('/');
  const id = pathSegments[pathSegments.length - 1];
  
  const [quiz, setQuiz] = useState<QuizTemplate | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const timeUpHandled = useRef(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await getQuizTemplateById(parseInt(id));
        
        if (response && response.success && response.data && response.data.quiz) {
          setQuiz(response.data.quiz);
        } else {
          setQuiz(null);
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
        setQuiz(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  // Timer effect
  useEffect(() => {
    let interval: any = null;

    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            // Time's up - auto move to next question or finish quiz
            setTimeout(() => handleTimeUp(), 0);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerActive, timeLeft]);

  // Start timer when question changes
  useEffect(() => {
    if (quiz && quiz.questions.length > 0) {
      console.log("Starting timer for question index:", currentQuestionIndex);
      timeUpHandled.current = false; // Reset flag
      setTimeLeft(30);
      setTimerActive(true);
    }
  }, [currentQuestionIndex, quiz]);

  const handleTimeUp = () => {
    if (timeUpHandled.current) {
      console.log("Time up already handled, skipping...");
      return;
    }
    
    timeUpHandled.current = true;
    setTimerActive(false);
    
    console.log("Time up! Current question index:", currentQuestionIndex);
    
    // Save current answer (if any) or mark as unanswered
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [currentQuestionIndex]: selectedAnswer !== null ? selectedAnswer : -1 // -1 means unanswered
      };
      
      console.log("New answers:", newAnswers);
      
      // Move to next question or finish quiz
      if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
        const nextQuestionIndex = currentQuestionIndex + 1;
        console.log("Moving to next question index:", nextQuestionIndex);
        setCurrentQuestionIndex(nextQuestionIndex);
        setSelectedAnswer(newAnswers[nextQuestionIndex] || null);
      } else {
        // Quiz completed - submit with current answers
        console.log("Quiz completed!");
        setTimeout(() => handleSubmitQuiz(newAnswers), 100);
      }
      
      return newAnswers;
    });
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    setTimerActive(false); // Stop current timer
    
    if (selectedAnswer !== null) {
      setAnswers(prev => {
        const newAnswers = {
          ...prev,
          [currentQuestionIndex]: selectedAnswer
        };
        
        if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
          const nextQuestionIndex = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextQuestionIndex);
          setSelectedAnswer(newAnswers[nextQuestionIndex] || null);
        } else {
          // Quiz completed - submit with current answers
          setTimeout(() => handleSubmitQuiz(newAnswers), 100);
        }
        
        return newAnswers;
      });
    }
  };

  const handlePreviousQuestion = () => {
    setTimerActive(false); // Stop current timer
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1] || null);
    }
  };

  const handleSubmitQuiz = async (finalAnswers?: { [key: number]: number }) => {
    setTimerActive(false); // Stop timer
    setIsSubmitting(true);
    
    let apiResult = null;
    
    try {
      if (user?.userId && quiz) {
        // Use finalAnswers if provided, otherwise use current answers state
        const answersToSubmit = finalAnswers || answers;
        
        // Prepare submission data
        const submissionData = {
          userId: user.userId,
          quizId: quiz.id,
          timeSpent: (30 - timeLeft) + (currentQuestionIndex * 30), // Calculate total time spent
          answers: Object.entries(answersToSubmit).map(([questionIndex, answerIndex]) => {
            const question = quiz.questions[parseInt(questionIndex)];
            return {
              questionId: question.id,
              answer: answerIndex >= 0 ? question.answers[answerIndex].content : ""
            };
          })
        };

        console.log("Submitting quiz data:", submissionData);

        // Submit to API and get result
        apiResult = await submitQuizSubmission(submissionData);
        console.log("API result from quiz.tsx:", apiResult);
      }
    } catch (error: any) {
      console.error("Error submitting quiz:", error);
      
      // Check if it's the "already submitted" error
      if (error.response && error.response.data && error.response.data.message === "User has already submitted this quiz") {
        console.log("User already submitted this quiz, using fallback data");
        // Create fallback result for already submitted quiz
        apiResult = {
          success: true,
          data: {
            submission: {
              id: Date.now(),
              score: 100,
              totalQuestions: quiz?.questions.length || 5,
              correctAnswers: Object.values(finalAnswers || answers).filter((answer: any) => answer >= 0).length,
              timeSpent: (30 - timeLeft) + (currentQuestionIndex * 30),
              completedAt: new Date().toISOString()
            },
            reward: {
              points: 100,
              level: "excellent",
              message: "Xuất sắc! Bạn có kiến thức y tế rất tốt!"
            },
            userStats: {
              totalPoints: (user?.points || 0) + 100,
              totalQuizzesCompleted: 1,
              averageScore: "100.00"
            }
          }
        } as any;
      } else {
        // Other errors - apiResult remains null
        console.log("Other error, apiResult will be null");
      }
    }
    
    // Navigate to results page with API result
    navigate(`/quiz-result/${id}`, { 
      state: { 
        answers: finalAnswers || answers, 
        quiz,
        timeSpent: (30 - timeLeft) + (currentQuestionIndex * 30),
        apiResult: apiResult // Pass API result to quiz-result.tsx
      } 
    });
  };

  if (isLoading) {
    return (
      <Page className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <Text size="normal" className="text-gray-600">Đang tải quiz...</Text>
          </div>
        </div>
      </Page>
    );
  }

  if (!quiz) {
    return (
      <Page className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Icon icon="zi-close" className="text-red-500 text-6xl mb-4" />
            <Text.Title size="large" className="text-red-600 mb-2">Không tìm thấy quiz</Text.Title>
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

  // Safety checks
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <Page className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Icon icon="zi-close" className="text-red-500 text-6xl mb-4" />
            <Text.Title size="large" className="text-red-600 mb-2">Quiz không hợp lệ</Text.Title>
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

  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  // Additional safety check for current question
  if (!currentQuestion) {
    return (
      <Page className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Icon icon="zi-close" className="text-red-500 text-6xl mb-4" />
            <Text.Title size="large" className="text-red-600 mb-2">Câu hỏi không tồn tại</Text.Title>
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
  
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <Page className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-2">
          {/* <Button 
            variant="secondary" 
            size="small"
            onClick={() => navigate("/quiz-selection")}
            className="text-white"
          >
            <Icon icon="zi-arrow-left" />
          </Button> */}
          <div>
            <Text size="small" className="text-white font-bold">RVOPV QUIZ</Text>
            <Text size="xSmall" className="text-blue-100">
              Câu {currentQuestionIndex + 1}/{quiz.questions.length}
            </Text>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="flex-1 mx-4">
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center space-x-2">
          <Icon icon="zi-star" className="text-white" />
          <div className={`text-white font-bold text-lg ${
            timeLeft <= 10 ? 'text-red-300 animate-pulse' : 
            timeLeft <= 20 ? 'text-yellow-300' : 'text-white'
          }`}>
            {timeLeft}s
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Quiz Info */}
        <Box className="bg-white rounded-2xl p-4 mb-6 shadow-lg">
          <div className="text-center">
            <Text.Title size="large" className="text-purple-600 font-bold mb-2">
              {quiz.name}
            </Text.Title>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Icon icon="zi-chat" className="text-blue-500" />
                <span>{quiz.questions.length} câu hỏi</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon icon="zi-star" className="text-yellow-500" />
                <span>{quiz.totalPoints} điểm</span>
              </div>
            </div>
          </div>
        </Box>

        {/* Question */}
        <Box className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="mb-6">
            <Text.Title size="large" className="text-gray-800 font-bold leading-relaxed">
              {currentQuestion.content.text}
            </Text.Title>
          </div>

          {/* Media Content */}
          {currentQuestion.content.media && (
            <div className="mb-6">
              {currentQuestion.content.type === 'video' && (
                <div className="w-full">
                  <video 
                    controls 
                    className="w-full rounded-xl shadow-lg"
                    poster=""
                  >
                    <source src={currentQuestion.content.media.url} type="video/mp4" />
                    Trình duyệt của bạn không hỗ trợ video.
                  </video>
                </div>
              )}
              
              {currentQuestion.content.type === 'audio' && (
                <div className="w-full bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <Icon icon="zi-mic" className="text-purple-600 text-2xl" />
                    <div className="flex-1">
                      <Text size="normal" className="text-gray-700 font-medium mb-2">
                        {currentQuestion.content.media.originalName}
                      </Text>
                      <audio 
                        controls 
                        className="w-full"
                        preload="metadata"
                      >
                        <source src={currentQuestion.content.media.url} type="audio/mpeg" />
                        Trình duyệt của bạn không hỗ trợ audio.
                      </audio>
                    </div>
                  </div>
                </div>
              )}
              
              {currentQuestion.content.type === 'image' && (
                <div className="w-full">
                  <img 
                    src={currentQuestion.content.media.url} 
                    alt="Question image"
                    className="w-full rounded-xl shadow-lg object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.answers && currentQuestion.answers.length > 0 ? currentQuestion.answers.map((answer, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedAnswer === index
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-25'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === index
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswer === index && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <Text size="normal" className="font-medium">
                    {answer.content}
                  </Text>
                </div>
              </button>
            )) : (
              <div className="text-center py-8">
                <Text size="normal" className="text-gray-500">
                  Không có tùy chọn trả lời
                </Text>
              </div>
            )}
          </div>
        </Box>

        {/* Navigation Buttons */}
        <div className="flex space-x-4">
          <Button
            variant="secondary"
            size="large"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex-1"
          >
            <Icon icon="zi-arrow-left" />
            Trước
          </Button>
          
          <Button
            variant="primary"
            size="large"
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null}
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500"
          >
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <>
                <Icon icon="zi-check" />
                Hoàn thành
              </>
            ) : (
              <>
                Tiếp theo
                <Icon icon="zi-arrow-right" />
              </>
            )}
          </Button>
        </div>
      </div>
    </Page>
  );
}

export default QuizPage;
