import axios from "axios";

export const GetPhoneNumber = async ({ access_token, code }) => {
  var requestConfig = {
    method: "GET",
    headers: {
      access_token: access_token,
      code: code,
      secret_key: "Q4x6SbHvEvB2pn5JV74J",
    },
    url: "https://graph.zalo.me/v2.0/me/info",
  };
  try {
    var result = await axios(requestConfig);
    
    return result?.data;
  } catch (error) {
    throw error;
  }
};
