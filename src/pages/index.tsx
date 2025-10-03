import { Button, Icon, Page } from "zmp-ui";
import { useNavigate } from "zmp-ui";
import { useState, useEffect } from "react";
import newBackground from "@/static/new-background.png";
import { getLoadingScreens } from "../api/loadingscreen";

function HomePage() {
  const navigate = useNavigate();
  const [loadingScreen, setLoadingScreen] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLoadingScreen = async () => {
      try {
        const response = await getLoadingScreens();
        if (response && response.success && response.data && response.data.length > 0) {
          // Lấy loading screen đầu tiên có isActive = true
          const activeScreen = response.data.find(screen => screen.isActive) || response.data[0];
          setLoadingScreen(activeScreen);
        }
      } catch (error) {
        console.error("Error fetching loading screen:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoadingScreen();
  }, []);

  const handleStartQuiz = () => {
    // Chuyển trang trực tiếp
    navigate("/quiz-selection");
  };
  
  if (isLoading) {
    return (
      <Page className="p-0 m-0 h-screen overflow-hidden">
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page className="p-0 m-0 h-screen overflow-hidden">  
      <div className="h-full w-full relative">
        {/* Hiển thị loading screen từ API hoặc fallback background */}
        <img 
          src={loadingScreen?.url || newBackground}
          alt={loadingScreen?.filename || "Background"}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            // Fallback to default background if loading screen fails to load
            (e.target as HTMLImageElement).src = newBackground;
          }}
        />
        
        {/* Loading screen info overlay (optional) */}
        {loadingScreen && (
          <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-xs">
            {loadingScreen.filename}
          </div>
        )}
        
        {/* CTA Button overlay ở trên bottom navigation */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center">
          <Button
            variant="primary"
            size="medium"
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-1 px-8 rounded-2xl shadow-lg"
            suffixIcon={<Icon icon="zi-arrow-right" />}
            onClick={handleStartQuiz}
          >
            KIỂM TRA NGAY
          </Button>
        </div>
      </div>
    </Page>
  );
}

export default HomePage;
