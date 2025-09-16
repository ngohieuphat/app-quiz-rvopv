import { useState, useCallback, useEffect } from "react";
import { getUserInfo, getSetting, getPhoneNumber, authorize } from "zmp-sdk/apis";
import { GetPhoneNumber } from "../api/apiZalo";

// Define the types
interface UserInfo {
  id: string;
  name: string;
  avatar: string;
  idByOA?: string;
  isSensitive?: boolean;
  followedOA?: boolean;
}

interface UserPhoneNumber {
  number: string;
}

const useZaloUserData = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<UserPhoneNumber | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<any>(null);

  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Lấy accessToken từ localStorage
      const accessToken = localStorage.getItem("access_token");
      
      if (!accessToken) {
        setUserInfo(null);
        setPhoneNumber(null);
        setIsLoading(false);
        return;
      }

      // Gọi getSetting để lấy permissions trước
      try {
        const settingsResponse = await new Promise<any>((resolve, reject) => {
          getSetting({
            success: resolve,
            fail: reject,
          });
        });
        setSettings(settingsResponse);

        // Kiểm tra xem cần xin quyền nào
        const neededScopes: ("scope.userInfo" | "scope.userPhonenumber" | "scope.userLocation")[] = [];
        if (!settingsResponse.authSetting?.["scope.userInfo"]) {
          neededScopes.push("scope.userInfo");
        }
        if (!settingsResponse.authSetting?.["scope.userPhonenumber"]) {
          neededScopes.push("scope.userPhonenumber");
        }

        // Xin quyền chung nếu cần
        if (neededScopes.length > 0) {
          try {
            await authorize({
              scopes: neededScopes,
            });
          } catch (authorizeError) {
            // Silent error handling - user từ chối
            setUserInfo(null);
            setPhoneNumber(null);
            setIsLoading(false);
            return;
          }
        }

        // Sau khi xin quyền, kiểm tra lại permissions
        const updatedSettingsResponse = await new Promise<any>((resolve, reject) => {
          getSetting({
            success: resolve,
            fail: reject,
          });
        });

        // Lấy user info nếu có quyền
        if (updatedSettingsResponse.authSetting?.["scope.userInfo"]) {
          try {
            const userInfoResponse = await getUserInfo({
              autoRequestPermission: false
            });
            const userInfo: UserInfo = userInfoResponse.userInfo;
            setUserInfo(userInfo);
          } catch (userInfoError) {
            setUserInfo(null);
          }
        } else {
          setUserInfo(null);
        }

        // Lấy phone number nếu có quyền
        if (updatedSettingsResponse.authSetting?.["scope.userPhonenumber"]) {
          try {
            const phoneNumberResponse = await new Promise<any>((resolve, reject) => {
              getPhoneNumber({
                success: resolve,
                fail: reject,
              });
            });
            const { token } = phoneNumberResponse;
            if (token) {
              const phoneNumberData = await GetPhoneNumber({
                access_token: accessToken,
                code: token,
              });
              setPhoneNumber({ number: phoneNumberData.data.number });
            } else {
              setPhoneNumber(null);
            }
          } catch (phoneError) {
            setPhoneNumber(null);
          }
        } else {
          setPhoneNumber(null);
        }

      } catch (error) {
        // Silent error handling
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setIsLoading(false);
    }
    
    // Return current state values
    return { userInfo, phoneNumber };
  }, []);

  // Tự động fetch khi hook được mount
  // useEffect(() => {
  //   fetchUserData();
  // }, [fetchUserData]);

  // Tắt auto-fetch - chỉ fetch khi gọi manual từ button
  // useEffect(() => {
  //   const checkAndFetch = () => {
  //     const accessToken = localStorage.getItem("access_token");
  //     if (accessToken && !userInfo && !isLoading) {
  //       fetchUserData();
  //     }
  //   };

  //   // Check ngay lập tức
  //   checkAndFetch();

  //   // Listen for storage changes
  //   const handleStorageChange = (e: StorageEvent) => {
  //     if (e.key === "access_token" && e.newValue) {
  //       fetchUserData();
  //     }
  //   };

  //   window.addEventListener("storage", handleStorageChange);
  //   return () => window.removeEventListener("storage", handleStorageChange);
  // }, [fetchUserData, userInfo, isLoading]);

  return { 
    userInfo, 
    phoneNumber, 
    isLoading, 
    settings,
    fetchUserData 
  };
};

export default useZaloUserData;