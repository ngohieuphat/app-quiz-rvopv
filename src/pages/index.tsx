import { Button, Icon, Page } from "zmp-ui";
import { useNavigate } from "zmp-ui";
import { useState, useEffect } from "react";
import newBackground from "@/static/new-background.png";
import useZaloUserData from "../hook/useZaloUserData";
import { createUser } from "../api/auth";

function HomePage() {
  const navigate = useNavigate();
  const { userInfo, phoneNumber, fetchUserData, isLoading } = useZaloUserData();
  const [isProcessing, setIsProcessing] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);

  // useEffect để xử lý khi state đã update
  useEffect(() => {
    const handleUserData = async () => {
      if (shouldFetch && !isLoading) {
        // Điều kiện 1: User đồng ý chia sẻ
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
          } catch (error: any) {
            // Silent error handling
          }
        }
        // Điều kiện 2: User từ chối chia sẻ -> không gọi API
        
        // Chuyển page trong cả 2 trường hợp
        navigate("/quiz-selection");
        setIsProcessing(false);
        setShouldFetch(false);
      }
    };

    handleUserData();
  }, [ isLoading, shouldFetch, navigate]);

  const handleStartQuiz = async () => {
    try {
      setIsProcessing(true);
      
      // Gọi hook để lấy thông tin user từ Zalo khi bấm button
      await fetchUserData();
      
      // Trigger useEffect để xử lý khi state đã update
      setShouldFetch(true);
      
    } catch (error: any) {
      // Vẫn chuyển trang dù có lỗi
      navigate("/quiz-selection");
      setIsProcessing(false);
    }
  };
  
  return (
        <Page className="p-0 m-0 h-screen overflow-hidden">  
      <div className="h-full w-full relative">
        <img 
          src={newBackground}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
      {/* CTA Button overlay ở trên bottom navigation */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center">
        <Button
          variant="primary"
          size="medium"
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-1 px-8 rounded-2xl shadow-lg"
          suffixIcon={<Icon icon="zi-arrow-right" />}
          onClick={handleStartQuiz}
          disabled={isProcessing}
        >
          {isProcessing ? "ĐANG XỬ LÝ..." : "KIỂM TRA NGAY"}
        </Button>
      </div>
    </div>
    </Page>
  );
}

export default HomePage;
