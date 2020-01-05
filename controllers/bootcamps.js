const ErrorResponse = require("../utils/errorResponse");
const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");

// ─── GET BOOTCAMPS ──────────────────────────────────────────────────────────────
// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // Final query after manipluation and applying operators
  let queryResource;

  // Copy req.query
  const manipulatedQueryString = { ...req.query };

  // Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and delete them from manipulatedQueryString
  removeFields.forEach((param) => delete manipulatedQueryString[param]);

  // Create query string based on manipulatedQueryString
  let buildQueryString = JSON.stringify(manipulatedQueryString);

  // Create operators ($gt, $gte, etc)
  buildQueryString = buildQueryString.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`,
  );

  // Finding resource
  queryResource = Bootcamp.find(JSON.parse(buildQueryString));

  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    queryResource = queryResource.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    queryResource = queryResource.sort(sortBy);
  } else {
    queryResource = queryResource.sort("-createdAt");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const skip = (page - 1) * limit;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  queryResource = queryResource.skip(startIndex).limit(limit);
  // query = query.skip(skip).limit(limit);

  // Executing query
  const bootcamps = await queryResource;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps,
  });
});

// ─── GET BOOTCAMP ───────────────────────────────────────────────────────────────
// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  // const bootcamp = await Bootcamp.findOne({ id });
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404),
    );
  }

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// ─── CREATE BOOTCAMP ────────────────────────────────────────────────────────────
// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// ─── UPDATE BOOTCAMP ────────────────────────────────────────────────────────────
// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404),
    );
  }

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// ─── DELETE BOOTCAMP ────────────────────────────────────────────────────────────
// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404),
    );
  }

  res.status(204).json({
    success: true,
    data: {},
  });
});

// @desc      Get bootcamps within a radius
// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    // https://docs.mongodb.com/manual/reference/operator/query/centerSphere/
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
