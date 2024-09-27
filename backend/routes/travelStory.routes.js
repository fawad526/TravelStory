import express from "express";
import TravelStory from "../models/travelStory.model.js";
import authenticateToken from "../utilities.js";
import upload from "../multer.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// Add Travel Story
router.post("/add-travel-story", authenticateToken, async (req, res) => {
  const { title, story, visitedLocation, visitedDate, imageUrl } = req.body;
  const { userId } = req.user;

  if (!title || !story || !visitedLocation || !visitedDate || !imageUrl) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
  }

  const parsedVisitedDate = new Date(parseInt(visitedDate));
  const travelStory = new TravelStory({
    title,
    story,
    visitedLocation,
    visitedDate: parsedVisitedDate,
    imageUrl,
    userId,
  });

  try {
    await travelStory.save();
    res
      .status(201)
      .json({ story: travelStory, message: "Story added successfully" });
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
});

//Route to handle image upload
router.post("/image-upload", upload.single("image"), (req, res) => {
  try {
    // Check if the file is missing
    if (!req.file) {
      return res
        .status(400)
        .json({ error: true, message: "No image uploaded" });
    }

    // Use environment variable to set the correct base URL based on deployment
    const baseUrl = process.env.VERCEL === "true" 
      ? "https://travel-story-api.vercel.app" 
      : "http://localhost:8000";
    
    // Generate the image URL
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    return res.status(201).json({ imageUrl });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
});

//Delete an image from upload folder

router.delete(
  "/delete-travel-story/:id",
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
      const travelStory = await TravelStory.findOne({
        _id: id,
        userId: userId,
      });

      if (!travelStory) {
        return res
          .status(404)
          .json({ error: true, message: "Travel Story not found" });
      }
      //Delete travelstory
      await travelStory.deleteOne({ _id: id, userId: userId });

      // Extract the fileName feom the image Url
      const imageUrl = travelStory.imageUrl;
      const fileName = path.basename(imageUrl);

      //Define the file path
      const filePath = path.join(__dirname, "uploads", fileName);

      //Delete the image file from the uploads folder
      fs.unlinkSync(filePath, (err) => {
        if (err) {
          console.error("Failed to delete the file: ", err);
          return;
        }
      });
      res.status(200).json({ message: "Travel Story deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: true, message: err.message });
    }
  }
);

//Add Travel Story
router.post("/add-travel-story", authenticateToken, async (req, res) => {
  const { title, story, visitedLocation, visitedDate, imageUrl } = req.body;
  const { userId } = req.user; // Extract userId from req.user object

  // Validate fields
  if (!title || !story || !visitedLocation || !visitedDate || !imageUrl) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
  }

  // Convert visitedDate from milliseconds to Date object
  const parseVisitedDate = new Date(parseInt(visitedDate));

  try {
    const travelStory = new TravelStory({
      title,
      story,
      visitedLocation,
      visitedDate: parseVisitedDate,
      imageUrl,
      userId: userId,
    });

    await travelStory.save();
    res
      .status(201)
      .json({ story: travelStory, message: "Story added successfully" });
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
});

//Get All Travel Story
router.get("/get-all-travel-stories", authenticateToken, async (req, res) => {
  const { userId } = req.user;
  try {
    const travelStories = await TravelStory.find({ userId: userId }).sort({
      isFavourite: -1,
    });
    res.status(200).json({
      stories: travelStories,
      message: "Stories fetched successfully",
    });
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
});

//Edit Travel story

router.put("/edit-story/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
  const { userId } = req.user;

  if (!title || !story || !visitedLocation || !visitedDate || !imageUrl) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
  }

  // Convert visitedDate from milliseconds to Date object
  const parseVisitedDate = new Date(parseInt(visitedDate));

  try {
    const travelStory = await TravelStory.findOne({ _id: id, userId: userId });

    if (!travelStory) {
      return res
        .status(404)
        .json({ error: true, message: "Travel Story not found" });
    }

    const placeholderImgUrl = `http://localhost:8000/assets/placeholder.png`;

    travelStory.title = title;
    travelStory.story = story;
    travelStory.visitedLocation = visitedLocation;
    travelStory.visitedDate = parseVisitedDate;
    travelStory.imageUrl = imageUrl || placeholderImgUrl;

    await travelStory.save();
    res.status(200).json({
      story: travelStory,
      message: "Travel Story updated successfully",
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

//Delete Travel Story
router.delete(
  "/delete-travel-story/:id",
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
      const travelStory = await TravelStory.findOne({
        _id: id,
        userId: userId,
      });

      if (!travelStory) {
        return res
          .status(404)
          .json({ error: true, message: "Travel Story not found" });
      }
      //Delete travelstory
      await travelStory.deleteOne({ _id: id, userId: userId });

      // Extract the fileName feom the image Url
      const imageUrl = travelStory.imageUrl;
      const fileName = path.basename(imageUrl);

      //Define the file path
      const filePath = path.join(__dirname, "uploads", fileName);

      //Delete the image file from the uploads folder
      fs.unlinkSync(filePath, (err) => {
        if (err) {
          console.error("Failed to delete the file: ", err);
          return;
        }
      });
      res.status(200).json({ message: "Travel Story deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: true, message: err.message });
    }
  }
);

//update the travel story
router.put("/update-isfav/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { isFavourites } = req.body;
  const { userId } = req.user;

  try {
    const travelStory = await TravelStory.findOne({ _id: id, userId: userId });
    if (!travelStory) {
      return res
        .status(404)
        .json({ error: true, message: "Travel Story not found" });
    }

    travelStory.isFavourites = isFavourites;
    await travelStory.save();
    res.status(200).json({ message: "Travel Story updated successfully" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

//Search stories
router.get("/search", authenticateToken, async (req, res) => {
  const { query } = req.query;
  const { userId } = req.user;

  if (!query) {
    return res.status(400).json({ error: true, message: "Query is required" });
  }

  try {
    const searchResults = await TravelStory.find({
      userId: userId,
      $or: [
        { title: new RegExp(query, "i") },
        { story: new RegExp(query, "i") },
        { visitedLocation: new RegExp(query, "i") },
      ],
    }).sort({ visitedDate: -1 });
    res.status(200).json({ stories: searchResults });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

//filter travel stories by date range
router.get("/travel-stories/filter", authenticateToken, async (req, res) => {
  const { startDate, endDate } = req.query;
  const { userId } = req.user;

  try {
    //Convert startDate and endDate from milliseconds to Date object
    const start = new Date(parseInt(startDate));
    const end = new Date(parseInt(endDate));

    //find travel stories that belong to the authenticated user and fall within the specified date range

    const filteredStories = await TravelStory.find({
      userId: userId,
      visitedDate: {
        $gte: start,
        $lte: end,
      },
    }).sort({ visitedDate: -1 });

    res.status(200).json({ stories: filteredStories });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

export default router;
