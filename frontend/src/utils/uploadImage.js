import axiosInstance from "./axiosInstance";

const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const token = localStorage.getItem("token"); // Retrieve the token

  try {
    const response = await axiosInstance.post("/image-upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`, // Use the token in the Authorization header
      },
    });
    return response.data;
  } catch (error) {
    console.log("Error uploading image:", error);
    throw error;
  }
};

export default uploadImage;
