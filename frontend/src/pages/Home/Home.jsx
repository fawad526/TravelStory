import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import TravelStoryCard from "../../components/Cards/TravelStoryCard";
import { MdAdd } from "react-icons/md";
import Modal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddEditTravelStory from "./AddEditTravelStory";
import ViewTravelStory from "./ViewTravelStory";
import EmptyCard from "../../components/Cards/EmptyCard";
import EmptyImg from "../../assets/images/empty.jpg";
import { DayPicker } from "react-day-picker";
import moment from "moment";
import FilterInfoTitle from "../../components/Cards/FilterInfoTitle";
import { getEmptyCardMessage } from "../../utils/helper";
const Home = () => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [allStories, setAllStories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [openViewModal, setOpenViewModal] = useState({
    isShown: false,
    data: null,
  });

  //Get userInfo
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");

      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response.status === 401) {
        //clear storage if unauthorized
        localStorage.clear();
        navigate("/login"); //redirect to login
      }
    }
  };

  //Get all stories
  const getAllStories = async () => {
    try {
      const response = await axiosInstance.get("/get-all-travel-stories");
      if (response.data && response.data.stories) {
        setAllStories(response.data.stories);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //handle edit story clciked
  const handleEdit = (data) => {
    setOpenAddEditModal({ isShown: true, type: "edit", data: data });
  };
  //Handle Travel story clicked
  const handleViewStory = (data) => {
    setOpenViewModal({ isShown: true, data });
  };

  //Handle update favourite
  const updateIsFavourite = async (storyData) => {
    const storyId = storyData._id;

    // Optimistically update the UI before the API call
    setAllStories((prevStories) =>
      prevStories.map((story) =>
        story._id === storyId
          ? { ...story, isFavourites: !story.isFavourites }
          : story
      )
    );

    try {
      // API call to update the favorite status
      const response = await axiosInstance.put("/update-isfav/" + storyId, {
        isFavourites: !storyData.isFavourites,
      });

      if (response.data && response.status === 200) {
        // Optionally show a success message
        toast.success("Story updated successfully");

        if (filterType === "search" && searchQuery) {
          onSearchStory(searchQuery);
        } else if (filterType === "date") {
          filterStoriesByDate(dateRange);
        } else {
          getAllStories();
        }
      } else {
        // Revert the optimistic update if the response is not successful
        setAllStories((prevStories) =>
          prevStories.map((story) =>
            story._id === storyId
              ? { ...story, isFavourites: storyData.isFavourites }
              : story
          )
        );
        toast.error("Failed to update the story");
      }
    } catch (error) {
      console.log(error);

      // Handle error and revert optimistic update
      setAllStories((prevStories) =>
        prevStories.map((story) =>
          story._id === storyId
            ? { ...story, isFavourites: storyData.isFavourites }
            : story
        )
      );

      toast.error("Error updating story");
    }
  };

  const deleteTravelStory = async (data) => {
    const storyId = data._id;

    try {
      const response = await axiosInstance.delete(
        "/delete-travel-story/" + storyId
      );

      if (response.data && !response.data.error) {
        toast.success("Story deleted successfully");
        setOpenViewModal((prevState) => ({ ...prevState, isShown: false }));
        getAllStories();
      }
    } catch (error) {
      console.log("An error occurred while deleting the story:", error);
    }
  };
  //handle search
  const onSearchStory = async (query) => {
    try {
      const response = await axiosInstance.get("/search", {
        params: {
          query,
        },
      });
      if (response.data && response.data.stories) {
        setFilterType("search");
        setAllStories(response.data.stories);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClearSearch = () => {
    setFilterType("");
    getAllStories();
  };

  const filterStoriesByDate = async (day) => {
    try {
      const startDate = day.from ? moment(day.from).valueOf() : null;
      const endDate = day.to ? moment(day.to).valueOf() : null;
      if (startDate && endDate) {
        const response = await axiosInstance.get("/travel-stories/filter", {
          params: {
            startDate,
            endDate,
          },
        });

        if (response.data && response.data.stories) {
          setFilterType("date");
          setAllStories(response.data.stories);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleDayClick = (day) => {
    setDateRange(day);
    filterStoriesByDate(day);
  };
  const resetFilter = () => {
    setDateRange({ form: null, to: null });
    setFilterType("");
    getAllStories();
  };
  useEffect(() => {
    getAllStories();
    getUserInfo();
    return () => {};
  }, []);

  return (
    <>
      <Navbar
        userInfo={userInfo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchNotes={onSearchStory}
        handleClearSearch={handleClearSearch}
      />
      <div className="container mx-auto py-10">
        <FilterInfoTitle
          filterType={filterType}
          filterDates={dateRange}
          onClear={() => {
            resetFilter();
          }}
        />
        <div className="flex gap-7">
          <div className="flex-1 ">
            {allStories.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {allStories.map((item) => (
                  <TravelStoryCard
                    key={item._id}
                    imgUrl={item.imageUrl}
                    title={item.title}
                    story={item.story}
                    date={item.visitedDate}
                    visitedLocation={item.visitedLocation}
                    isFavourites={item.isFavourites}
                    onClick={() => handleViewStory(item)}
                    onFavouriteClick={() => updateIsFavourite(item)}
                  />
                ))}
              </div>
            ) : (
              <>
                <EmptyCard
                  imgSrc={EmptyImg}
                  message={getEmptyCardMessage(filterType)}
                />
              </>
            )}
          </div>
          <div className="w-[350px]">
            <div className="bg-white border border-slate-200 shadow-lg shadow-slate-200/60 rounded-lg">
              <div className="p-3">
                <DayPicker
                  captionLayout="dropdown-buttons"
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDayClick}
                  pagedNavigation
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add edit modal */}

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.2)", zIndex: 999 },
        }}
        appElement={document.getElementById("root")}
        className="model-box"
      >
        <AddEditTravelStory
          type={openAddEditModal.type}
          storyInfo={openAddEditModal.data}
          onClose={() =>
            setOpenAddEditModal({ isShown: false, type: "add", data: null })
          }
          getAllStories={getAllStories}
        />
      </Modal>

      {/* View modal */}
      <Modal
        isOpen={openViewModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.2)", zIndex: 999 },
        }}
        appElement={document.getElementById("root")}
        className="model-box"
      >
        <ViewTravelStory
          storyInfo={openViewModal.data || null}
          onClose={() =>
            setOpenViewModal((prevState) => ({ ...prevState, isShown: false }))
          }
          onEditClick={() => {
            setOpenViewModal((prevState) => ({ ...prevState, isShown: false }));
            handleEdit(openViewModal.data || null);
          }}
          onDeleteClick={() => deleteTravelStory(openViewModal.data || null)}
        />
      </Modal>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-full bg-primary hover:bg-cyan-400 fixed right-10 bottom-10"
        onClick={() =>
          setOpenAddEditModal({ isShown: true, type: "add", data: null })
        }
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />
    </>
  );
};

export default Home;
