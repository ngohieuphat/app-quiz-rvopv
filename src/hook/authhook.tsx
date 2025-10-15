import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
  } from "react";
import { getUserById, checkUserExists } from "../api/auth";
  
  // Tạo context để lưu trữ thông tin người dùng
  const authContext = createContext({} as UseProviderAuth);
  
  export default function useAuth() {
    return useContext(authContext);
  }
  
  type Status = "LOGGED_IN" | "NOT_LOGIN" | "ERROR";
  
  interface Address {
    houseNumber: string;
    city: string;
    district: string;
    ward: string;
    street: string;
  }
  
  interface Gift {
    id: number;
    isUsed: boolean;
    createdAt: string;
    description: string;
  }

  interface QuizAttempt {
    id: number;
    name: string;
    quizId: number;
    score: number;
    status: string;
    completedAt: string;
  }

  interface UserAuth {
    id: number; // ID người dùng
    name: string; // Tên người dùng
    userId: string; // User Id của Zalo
    phone: string; // Số điện thoại
    avatar: string | null; // Link ảnh Zalo
    idByOA: string | null; // ID theo Official Account
    points: number; // Điểm số
    followedOA: boolean; // Trạng thái theo dõi Official Account
    isSensitive: boolean; // Cờ nhạy cảm
    role_code: string; // Mã vai trò của người dùng
    pharmacyName: string | null; // Tên nhà thuốc
    address: any[]; // Địa chỉ từ API (array)
    giftName: Gift[]; // Gift data từ API
    totalQuizzesCompleted: number; // Tổng số quiz đã hoàn thành
    averageScore: string; // Điểm trung bình
    lastQuizDate: string | null; // Ngày quiz cuối cùng
    createdAt: string; // Thời gian tạo
    updatedAt: string; // Thời gian cập nhật
    quizAttempts: QuizAttempt[]; // Lịch sử làm quiz
  }
  
  interface UseProviderAuth {
    user: UserAuth | null;
    error: string | null;
    status: Status;
    isLoading: boolean;
    checkAuth: () => Promise<void>;
    refreshUserData: () => Promise<void>;
  }
  
  function useProviderAuth(): UseProviderAuth {
    const [user, setUser] = useState<UserAuth | null>(null);
    const [status, setStatus] = useState<Status>("NOT_LOGIN");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
  
    const checkAuth = async () => {
      try {
        // Chỉ sử dụng localStorage vì nativeStorage không được hỗ trợ
        const finalUserId = localStorage.getItem("userId");
  
        if (finalUserId) {
          try {
            setIsLoading(true);
            // Lấy thông tin user từ API trực tiếp
            const response = await getUserById(finalUserId);
  
            if (
              response &&
              response.success &&
              response.data &&
              response.data.user
            ) {
              const apiUser = response.data.user;
  
              setUser({
                id: apiUser.id,
                name: apiUser.name,
                userId: apiUser.userId,
                phone: apiUser.phone,
                avatar: apiUser.avatar,
                idByOA: apiUser.idByOA || null,
                points: apiUser.points || 0,
                followedOA: apiUser.followedOA || false,
                isSensitive: apiUser.isSensitive || false,
                role_code: apiUser.role_code || "",
                pharmacyName: apiUser.pharmacyName || null,
                address: apiUser.address || [],
                giftName: apiUser.giftName || [],
                totalQuizzesCompleted: apiUser.totalQuizzesCompleted || 0,
                averageScore: apiUser.averageScore || "0.00",
                lastQuizDate: apiUser.lastQuizDate || null,
                createdAt: apiUser.createdAt,
                updatedAt: apiUser.updatedAt,
                quizAttempts: apiUser.quizAttempts || [],
              });
  
              setStatus("LOGGED_IN");
              setError(null);
            } else {
              setUser(null);
              setStatus("NOT_LOGIN");
              setError("User data not found in response.");
            }
          } catch (error: any) {
            setUser(null);
            setStatus("ERROR");
            setError("Failed to authenticate user. Please login again.");
          } finally {
            setIsLoading(false);
          }
        } else {
          setUser(null);
          setStatus("NOT_LOGIN");
        }
      } catch (error: any) {
        setUser(null);
        setStatus("ERROR");
        setError("Failed to access storage.");
        setIsLoading(false);
      }
    };
  
    // Lắng nghe thay đổi storage để refresh user data
    useEffect(() => {
      const handleStorageChange = async (e: StorageEvent) => {
        // Khi userId thay đổi trong storage (sau khi đăng ký)
        if (e.key === "userId" && e.newValue) {
          await checkAuth();
        }
      };
  
      // Lắng nghe localStorage changes
      window.addEventListener("storage", handleStorageChange);
  
      // Kiểm tra auth lần đầu
      checkAuth();
  
      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }, []);
  
    // Thêm method để force refresh user data
    const refreshUserData = async () => {
      await checkAuth();
    };
  
    return { user, status, checkAuth, refreshUserData, error, isLoading };
  }
  
  export const ProviderAuth = ({ children }) => {
    const auth = useProviderAuth();
    return <authContext.Provider value={auth}>{children}</authContext.Provider>;
  };
  