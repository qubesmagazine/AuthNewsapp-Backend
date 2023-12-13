const News = require("../models/newsModel");
const ImageToBase64 = require("image-to-base64");

//@des AddNews
const addNews = async (req, res, next) => {
  try {
    console.log(req.files);
    const { title, content, author, category, addToSlider } = req.body;

    const base64Data = await ImageToBase64(req.files.newsImage.path);
    // console.log("base64Data", base64Data);
    const news = await News.create({
      author,
      content,
      category,
      addToSlider,
      newsImage: `data:${req.files.newsImage.type};base64,${base64Data}`,
      addedAt: Date.now(),
    });

    if (news) {
      res.status(201).json({
        success: true,
        msg: "Successfully added news",
        data: news,
      });
    } else {
      res.status(400).json({
        success: false,
        msg: "Invalid News Data",
      });
    }
  } catch (error) {
    console.error("Error in addNews:", error);
    res.status(500).json({
      success: false,
      msg: "Internal error occurred",
      data: error.message,
    });
  }
};

//@desc get all News
const getAllNews = async (req, res, next) => {
  try {
    const size = req.params.pageSize;
    const pageNo = req.params.pageNo;
    var query = {};

    if (pageNo < 0 || pageNo === 0) {
      return res.status(401).json({
        success: false,
        msg: "Invalid page number, should start with 1",
      });
    }

    query.skip = (pageNo - 1) * size;
    query.limit = size;

    const newsCount = await News.find({});
    const news = await News.find({})
      .sort("-addedAt")
      .populate({ path: "category", select: ["_id", "category_name"] })
      .limit(Number(query.limit))
      .skip(Number(query.skip));

    res.json({
      success: true,
      count: newsCount.length,
      data: news,
    });
  } catch (error) {
    console.error("Error in getAllNews:", error);
    res.status(500).json({
      success: false,
      msg: "Internal error occurred",
    });
  }
};

//@desc get news by ID
const getNewsById = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.newsId).populate({
      path: "category",
      select: ["_id", "category_name"],
    });

    res.json({
      success: true,
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Internal error occurred",
    });
  }
};

//@desc get SLIDER NEWS
const getSliderNews = async (req, res, next) => {
  try {
    const news = await News.find({ addToSlider: true }).populate({
      path: "category",
      select: ["_id", "category_name"],
    });

    res.json({
      success: true,
      count: news.length,
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Internal error occurred",
    });
  }
};

//@desc get News by Category ID

const getNewsByCategory = async (req, res, next) => {
  try {
    const news = await News.find({ category: req.params.catId }).populate({
      path: "category",
      select: ["_id", "category_name"],
    });

    res.json({
      success: true,
      count: news.length,
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Internal error occurred",
    });
  }
};


//@delete news by id

const deleteNewsById = async (req, res, next) => {
  try {
    const news = await News.findByIdAndDelete(req.params.newsId);

    res.status(201).json({
      success: true,
      msg: "Successfully Deleted",
      data: news,
    });

    if (!news) {
      return res.status(401).json({
        success: false,
        msg: "News not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Internal error occured",

    });
  }
};


//@dec Update News
const editNews = async (req, res, next) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.newsId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(201).json({
      success: true,
      msg: "Successfully Updated",
      data: news,
    });

    if (!news) {
      return res.status(401).json({
        success: false,
        msg: "News not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Internal error occured",
    });
  }
};

module.exports = {
  addNews,
  getAllNews,
  getNewsById,
  getSliderNews,
  getNewsByCategory,
  deleteNewsById,
  editNews
  
};
