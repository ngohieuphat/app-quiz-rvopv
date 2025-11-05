import { Button, Icon, Page, Text, Box, useNavigate, useLocation, Input } from "zmp-ui";
import useAuth from "../hook/authhook";
import { useState, useEffect } from "react";
import { getDynamicFormConfig, getUserFormData, submitDynamicForm, getVietnameseProvinces, getDistrictsByProvinceId } from "../api/auth";
import { completePharmacyStep } from "../api/apiStep";
import { showAlertToast } from "../api/apiAlert";
import Navbar from "./Navbar";
import { showToast, openWebview } from "zmp-sdk/apis";

function EditProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [formConfig, setFormConfig] = useState<any>(null);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  useEffect(() => {
    const initializeForm = async () => {
      if (!user?.userId) {
        return;
      }

      try {
        setIsLoading(true);
        
        // Always get form config first to know the structure
        const config = await getDynamicFormConfig();
        
        if (config && config.success && config.data) {
          // Sort dynamic fields by fieldType: text -> dynamic_select -> select
          const sortedConfig = { ...config.data };
          if (sortedConfig.dynamicFields && Array.isArray(sortedConfig.dynamicFields)) {
            sortedConfig.dynamicFields = sortedConfig.dynamicFields.sort((a: any, b: any) => {
              const typeOrder = { 'text': 1, 'dynamic_select': 2, 'select': 3 };
              const aOrder = typeOrder[a.fieldType as keyof typeof typeOrder] || 999;
              const bOrder = typeOrder[b.fieldType as keyof typeof typeOrder] || 999;
              return aOrder - bOrder;
            });
          }
          
          setFormConfig(sortedConfig);
          
          // Initialize empty form data based on config
          const initialData: any = {};
          
          // Process dynamic fields
          if (sortedConfig.dynamicFields && Array.isArray(sortedConfig.dynamicFields)) {
            sortedConfig.dynamicFields.forEach((field: any) => {
              initialData[field.fieldKey] = "";
            });
          }
          
          // Then check if user has existing form data
          const userFormData = await getUserFormData(user.userId);
          
          if (userFormData && userFormData.success && userFormData.data) {
            // User has existing data - merge with config structure
            setHasExistingData(true);
            
            // Merge data properly
            const mergedData = { ...initialData };
            
            // Merge dynamic form data
            if (userFormData.data.dynamicFormData) {
              Object.keys(userFormData.data.dynamicFormData).forEach(key => {
                mergedData[key] = userFormData.data.dynamicFormData[key] || "";
              });
            }
            
            setFormData(mergedData);
          } else {
            // User doesn't have data - use empty config structure
            setHasExistingData(false);
            setFormData(initialData);
          }
        }
      } catch (error) {
        console.error("Error initializing form:", error);
        // Fallback to basic structure
        const fallbackData = {
          province: "",
          district: "",
          addressDetail: "",
          company_organization: "",
          address: "",
          role: ""
        };
        setFormData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    initializeForm();
  }, [user]);

  // Load Vietnamese provinces
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const provincesData = await getVietnameseProvinces();
        setProvinces(provincesData);
      } catch (error) {
        console.error("Error loading provinces:", error);
      }
    };

    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    const loadDistricts = async () => {
      // Check both province and province_city fields
      const provinceValue = formData.province || formData.province_city;
      if (!provinceValue || !provinces.length) return;

      try {
        setLoadingDistricts(true);
        
        // Find selected province (handle both names and codes)
        const selectedProvince = provinces.find(p => 
          p.code.toString() === provinceValue.toString() || 
          p.name === provinceValue ||
          p.codename === provinceValue
        );
        
        if (selectedProvince) {
          // Use province_code to fetch wards from bom.asia API
          const provinceId = selectedProvince.code;
          
          try {
            const districtsData = await getDistrictsByProvinceId(provinceId);
            setDistricts(districtsData || []);
            
            // Reset district selection if current district is not in new districts
            if (formData.district && districtsData) {
              const districtExists = districtsData.find(d => 
                d.code.toString() === formData.district.toString() ||
                d.name === formData.district ||
                d.codename === formData.district
              );
              if (!districtExists) {
                setFormData(prev => ({ ...prev, district: "" }));
              }
            }
          } catch (districtError) {
            console.error("Error fetching districts:", districtError);
            setDistricts([]);
          }
        } else {
          setDistricts([]);
        }
      } catch (error) {
        console.error("Error loading districts:", error);
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    };

    loadDistricts();
  }, [formData.province, formData.province_city, provinces]);

  // useEffect for swipe gesture
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const diffX = endX - startX; // Swipe từ trái sang phải
      const diffY = Math.abs(endY - startY);
      
      // Swipe từ trái sang phải (ít nhất 50px) và không quá nhiều theo chiều dọc
      if (diffX > 50 && diffY < 100 && startX < 50) {
        handleGoBack();
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleInputChange = (field: string, value: string) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
  };

  // Format data before sending to server (convert names to readable format)
  const formatFormDataForSubmission = (data: any) => {
    const formattedData = { ...data };
    
    // Find province and district names for better readability
    const provinceField = formattedData.province || formattedData.province_city;
    
    if (provinceField && provinces.length > 0) {
      const provinceObj = provinces.find(p => 
        p.code.toString() === provinceField.toString() ||
        p.name === provinceField ||
        p.codename === provinceField
      );
      
      if (provinceObj) {
        // Update the correct field (province or province_city)
        if (formattedData.province) {
          formattedData.province = provinceObj.name;
        }
        if (formattedData.province_city) {
          formattedData.province_city = provinceObj.name;
        }
      }
    }
    
    if (formattedData.district && districts.length > 0) {
      const districtObj = districts.find(d => 
        d.code.toString() === formattedData.district.toString() ||
        d.name === formattedData.district ||
        d.codename === formattedData.district
      );
      
      if (districtObj) {
        formattedData.district = districtObj.name; // Send name instead of code
      }
    }
    
    return formattedData;
  };

  const handleSave = async () => {
    if (!user?.userId) {
      console.error("User ID not found");
      return;
    }

    // Format data for server submission
    const formattedData = formatFormDataForSubmission(formData);

    setIsLoading(true);
    try {
      const result = await submitDynamicForm(user.userId, formattedData);
      
      // Complete pharmacy step after successful form submission
      try {
        const pharmacyStepResult = await completePharmacyStep(user.userId, formattedData);
      } catch (pharmacyStepError) {
        console.error('❌ Error completing pharmacy step:', pharmacyStepError);
        // Don't block the flow if pharmacy step completion fails
      }
      
      // Tự động cập nhật dữ liệu user sau khi lưu thành công
      await refreshUserData();
      
      // Check if coming from quiz or quiz selection
      const { fromQuiz, fromQuizSelection, quizResult, quizId, message } = location.state || {};
      
      if (fromQuiz && quizResult && quizId) {
        // Coming from quiz flow, show thank you message and go to quiz result
        await showAlertToast("success", "infoSubmitted", "Cảm ơn bạn đã điền thông tin!");
        
        // Wait a bit for toast to display and data to be ready
        setTimeout(() => {
          navigate(`/quiz-result/${quizId}`, { 
            state: { 
              apiResult: quizResult,
              fromEditProfile: true
            } 
          });
        }, 3000); // Wait 3 seconds
      } else if (fromQuizSelection && quizId) {
        // Coming from quiz selection (user already completed quiz but no address)
        await showAlertToast("success", "infoUpdated", "Cảm ơn bạn đã cập nhật thông tin! Bây giờ bạn có thể nhận phần thưởng.");
        
        // Wait a bit for toast to display and go back to quiz selection
        setTimeout(() => {
          navigate("/quiz-selection");
        }, 2000); // Wait 2 seconds
      } else {
        // Normal flow, go to profile
        await showAlertToast("success", "infoSaved", "Lưu thông tin thành công!");
        navigate("/profile");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      await showAlertToast("error", "generalError", "Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    // Check if coming from quiz flow
    const { fromQuiz, quizResult, quizId } = location.state || {};
    
    if (fromQuiz && quizResult && quizId) {
      // Coming from quiz flow, show different message and go to quiz result
      await showAlertToast("warning", "infoUpdateCancelled", "Bạn đã hủy cập nhật thông tin. Vẫn có thể xem kết quả quiz!");
      
      // Wait a bit for toast to display and go to quiz result
      setTimeout(() => {
        navigate(`/quiz-result/${quizId}`, { 
          state: { 
            apiResult: quizResult,
            fromEditProfile: true
          } 
        });
      }, 2000); // Wait 2 seconds
    } else {
      // Normal flow, go to profile
      navigate("/profile");
    }
  };

  const handleGoBack = async () => {
    // Check if coming from quiz flow
    const { fromQuiz, quizResult, quizId } = location.state || {};
    
    if (fromQuiz && quizResult && quizId) {
      // Coming from quiz flow, show different message and go to quiz result
      await showAlertToast("warning", "infoUpdateCancelled", "Bạn đã hủy cập nhật thông tin. Vẫn có thể xem kết quả quiz!");
      
      // Wait a bit for toast to display and go to quiz result
      setTimeout(() => {
        navigate(`/quiz-result/${quizId}`, { 
          state: { 
            apiResult: quizResult,
            fromEditProfile: true
          } 
        });
      }, 2000); // Wait 2 seconds
    } else {
      // Normal flow, go to profile
      navigate("/profile");
    }
  };

  // Get validation error message for a specific field
  const getFieldValidationError = (fieldName: string) => {
    switch (fieldName) {
      case 'province_city':
        const provinceValue = formData.province_city || formData.province;
        if (!provinceValue || provinceValue.toString().trim() === "") {
          return "Vui lòng chọn tỉnh/thành phố";
        }
        break;
      case 'district':
        const provinceValue2 = formData.province_city || formData.province;
        if (provinceValue2 && provinceValue2.toString().trim() !== "") {
          const districtValue = formData.district;
          if (!districtValue || districtValue.toString().trim() === "") {
            return "Vui lòng chọn quận/huyện";
          }
        }
        break;
      case 'address':
        const addressValue = formData.address || formData.addressDetail;
        if (!addressValue || addressValue.toString().trim() === "") {
          return "Vui lòng nhập địa chỉ chi tiết";
        }
        break;
    }
    return null;
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    if (!formConfig) return false;
    
    let requiredFields: any[] = [];
    
    // Check dynamic fields
    if (formConfig.dynamicFields && Array.isArray(formConfig.dynamicFields)) {
      requiredFields = requiredFields.concat(
        formConfig.dynamicFields
          .filter((field: any) => field.isRequired)
          .map((field: any) => ({ name: field.fieldKey, required: true }))
      );
    }
    
    // Additional validation for specific fields
    const specificValidations = [
      // Province/City validation
      {
        name: 'province_city',
        isValid: () => {
          const value = formData.province_city || formData.province;
          return value && value.toString().trim() !== "";
        }
      },
      // District validation - only if province is selected
      {
        name: 'district',
        isValid: () => {
          const provinceValue = formData.province_city || formData.province;
          if (!provinceValue || provinceValue.toString().trim() === "") {
            return true; // District not required if no province
          }
          const districtValue = formData.district;
          return districtValue && districtValue.toString().trim() !== "";
        }
      },
      // Address validation
      {
        name: 'address',
        isValid: () => {
          const value = formData.address || formData.addressDetail;
          return value && value.toString().trim() !== "";
        }
      }
    ];
    
    // Check dynamic required fields
    const dynamicFieldsValid = requiredFields.every((field: any) => {
      const value = formData[field.name];
      return value && value.toString().trim() !== "";
    });
    
    // Check specific field validations
    const specificFieldsValid = specificValidations.every(validation => {
      return validation.isValid();
    });
    
    return dynamicFieldsValid && specificFieldsValid;
  };

  // Render form field based on config
  const renderFormField = (field: any) => {
    const { name, label, type, required, placeholder, options } = field;
    const validationError = getFieldValidationError(name);

    switch (type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div key={name} className="space-y-2">
            <Text size="normal" className="font-medium text-gray-700">
              {label} {required && '*'}
            </Text>
            <Input
              type={type}
              placeholder={placeholder || `Nhập ${label.toLowerCase()}`}
              value={formData[name] || ""}
              onChange={(e) => handleInputChange(name, e.target.value)}
              className={`w-full ${validationError ? 'border-red-500' : ''}`}
            />
            {validationError && (
              <Text size="small" className="text-red-500">
                {validationError}
              </Text>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={name} className="space-y-2">
            <Text size="normal" className="font-medium text-gray-700">
              {label} {required && '*'}
            </Text>
            <textarea
              placeholder={placeholder || `Nhập ${label.toLowerCase()}`}
              value={formData[name] || ""}
              onChange={(e) => handleInputChange(name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${validationError ? 'border-red-500' : 'border-gray-300'}`}
              rows={4}
            />
            {validationError && (
              <Text size="small" className="text-red-500">
                {validationError}
              </Text>
            )}
          </div>
        );

      case 'select':
      case 'dynamic_select':
        return (
          <div key={name} className="space-y-2">
            <Text size="normal" className="font-medium text-gray-700">
              {label} {required && '*'}
            </Text>
            <select
              value={formData[name] || ""}
              onChange={(e) => handleInputChange(name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white ${validationError ? 'border-red-500' : 'border-gray-300'}`}
              disabled={name === 'district' && (!formData.province && !formData.province_city || loadingDistricts)}
            >
              <option value="">{placeholder || `Chọn ${label.toLowerCase()}`}</option>
              
              {/* Province options */}
              {(name === 'province' || name === 'province_city') && provinces.map((province: any) => (
                <option key={province.code} value={province.name}>
                  {province.name}
                </option>
              ))}
              
              {/* District options */}
              {name === 'district' && districts.map((district: any) => (
                <option key={district.code} value={district.name}>
                  {district.name}
                </option>
              ))}
              
              {/* Custom options from config */}
              {name !== 'province' && name !== 'district' && options && Array.isArray(options) && options.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {/* Loading indicator for districts/wards */}
            {name === 'district' && loadingDistricts && (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
                <Text size="small">Đang tải...</Text>
              </div>
            )}
            
            {/* Validation error message */}
            {validationError && (
              <Text size="small" className="text-red-500">
                {validationError}
              </Text>
            )}
          </div>
        );

      default:
        return (
          <div key={name} className="space-y-2">
            <Text size="normal" className="font-medium text-gray-700">
              {label} {required && '*'}
            </Text>
            <Input
              placeholder={placeholder || `Nhập ${label.toLowerCase()}`}
              value={formData[name] || ""}
              onChange={(e) => handleInputChange(name, e.target.value)}
              className={`w-full ${validationError ? 'border-red-500' : ''}`}
            />
            {validationError && (
              <Text size="small" className="text-red-500">
                {validationError}
              </Text>
            )}
          </div>
        );
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
    // TODO: Handle add click
  };

  return (
    <Page className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 px-4 pt-12 pb-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary" 
            size="small"
            onClick={handleGoBack}
            className="text-white bg-white/20 hover:bg-white/30 flex items-center justify-center"
          >
            <Icon icon="zi-arrow-left" />
          </Button>
          <div>
            <Text size="small" className="text-white font-bold">RVOPV QUIZ</Text>
            <Text size="xSmall" className="text-blue-100">Chỉnh sửa hồ sơ</Text>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Pharmacy Information Form */}
        <Box className="bg-white rounded-3xl p-6 shadow-xl">
          <div className="space-y-6">
            <div className="text-center">
              <Text.Title size="large" className="text-purple-600 font-bold mb-2">
                Thông tin nhà thuốc
              </Text.Title>
              <Text size="small" className="text-gray-600">
                {(() => {
                  const { fromQuizSelection, message } = location.state || {};
                  if (fromQuizSelection && message) {
                    return message; // Hiển thị message từ quiz-selection
                  }
                  return hasExistingData ? "Cập nhật thông tin nhà thuốc của bạn" : "Điền thông tin nhà thuốc của bạn";
                })()}
              </Text>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <Text size="small" className="ml-3 text-gray-600">
                  {hasExistingData ? "Đang tải dữ liệu..." : "Đang tải form..."}
              </Text>
            </div>
            ) : (
              <>
                {formConfig && (
                  <>
                    {/* Skip Fixed Fields - Use only DynamicFields */}
                    {/* FixedFields removed - all fields now come from DynamicFields */}
                    
                    {/* Render Dynamic Fields */}
                    {formConfig.dynamicFields && Array.isArray(formConfig.dynamicFields) && 
                     formConfig.dynamicFields.length > 0 && (
                      <>
                        {formConfig.dynamicFields.map((field: any) => {
                            const fieldConfig = {
                              name: field.fieldKey,
                              label: field.fieldLabel,
                              type: field.fieldType,
                              required: field.isRequired,
                              placeholder: field.placeholder,
                              options: field.fieldOptions,
                              sortOrder: field.sortOrder
                            };
                            return renderFormField(fieldConfig);
                          })}
                      </>
                    )}
                    
                    {/* No fields message */}
                    {(!formConfig.fixedFields || Object.keys(formConfig.fixedFields).length === 0) &&
                     (!formConfig.dynamicFields || formConfig.dynamicFields.length === 0) && (
                      <div className="text-center py-6">
                        <Text size="small" className="text-gray-500">
                          Không có trường nào để hiển thị
              </Text>
            </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </Box>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button
            variant="secondary"
            size="large"
            onClick={handleCancel}
            className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl"
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            size="large"
            onClick={handleSave}
            disabled={isLoading || !isFormValid()}
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <Text size="small">Đang lưu...</Text>
              </div>
            ) : (
              "Lưu thay đổi"
            )}
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

        {/* Navbar */}
        <Navbar
          activeTab="profile"
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

export default EditProfilePage;
