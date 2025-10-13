import { getSystemInfo } from "zmp-sdk";
import {
  AnimationRoutes,
  App,
  Route,
  ZMPRouter,
} from "zmp-ui";
import { AppProps } from "zmp-ui/app";
import { getUserInfo, getAccessToken } from "zmp-sdk";
import { nativeStorage } from "zmp-sdk/apis";
import React, { useEffect } from "react";
import { ProviderAuth } from "../hook/authhook";

import HomePage from "@/pages/index";
import QuizSelectionPage from "@/pages/quiz-selection";
import QuizPage from "@/pages/quiz";
import ProfilePage from "@/pages/profile";
import GiftsPage from "@/components/gifts";
import ViewQuizHistoryPage from "@/components/view-quiz-history";
import EditProfilePage from "@/components/edit-profile";
import QuizResultPage from "@/components/quiz-result";
interface UserInfo {
  id: string;
  idByOA?: string;
  followedOA?: boolean;
  name: string;
  avatar: string;
  isSensitive?: boolean;
}

const Layout = () => {
  const setDataToStorage = async (token: string, userId: string) => {
    try {
      // Thử nativeStorage trước (cho Zalo Mini App)
      try {
        await nativeStorage.setItem("access_token", token);
        await nativeStorage.setItem("userId", userId);
      } catch (nativeError) {
        // Fallback to localStorage (cho development)
        localStorage.setItem("access_token", token);
        localStorage.setItem("userId", userId);
      }
    } catch (error) {
      // Silent error handling
    }
  };

  useEffect(() => {
    const checkAndFetchUserInfo = async () => {
      try {
        // Clear old token
        localStorage.removeItem("token");

        getAccessToken({
          success: async (accessToken: string) => {
            localStorage.setItem("access_token", accessToken);

            try {
              const userInfoResponse = await getUserInfo({});
              const userInfo: UserInfo = userInfoResponse.userInfo;

              if (userInfo?.id) {
                localStorage.setItem("userId", userInfo.id);
                localStorage.setItem("userInfo", JSON.stringify(userInfo));
                await setDataToStorage(accessToken, userInfo.id);
              }
            } catch (userError) {
              // Silent error handling
            }
          },
          fail: (error: { message?: string }) => {
            // Silent error handling
          },
        });
      } catch (error: any) {
        // Silent error handling
      }
    };

    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      // Timeout reached
    }, 5000);

    checkAndFetchUserInfo().then(() => {
      clearTimeout(timeoutId);
    }).catch((error) => {
      clearTimeout(timeoutId);
    });
  }, []);
  return (
    <ProviderAuth>
      <App theme={getSystemInfo().zaloTheme as AppProps["theme"]}>
        <ZMPRouter>
          <AnimationRoutes>
            <Route path="/" element={<HomePage />}></Route>
            <Route path="/quiz-selection" element={<QuizSelectionPage />}></Route>
            <Route path="/quiz/:id" element={<QuizPage />}></Route>
            <Route path="/quiz-result/:id" element={<QuizResultPage />}></Route>
            <Route path="/profile" element={<ProfilePage />}></Route>
            <Route path="/gifts" element={<GiftsPage />}></Route>
             <Route path="/quiz-history" element={<ViewQuizHistoryPage />}></Route>
            <Route path="/edit-profile" element={<EditProfilePage />}></Route>
          </AnimationRoutes>
        </ZMPRouter>
      </App>
    </ProviderAuth>
  );
};

export default Layout;
