import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import axios from "axios";
import jwt from "jsonwebtoken";
import NodeCache from "node-cache";
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { Readable } from "stream";

dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: "ap-south-1"
});

const app = express();
const port = process.env.PORT || 3000;
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour
const baseUrl = process.env.BASE_URL || 'https://placeus-backend1.onrender.com';

// Multer storage configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "https://placeus.onrender.com"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fetch Google's public keys
async function getGooglePublicKeys() {
  const cachedKeys = cache.get("googleKeys");
  if (cachedKeys) {
    return cachedKeys;
  }

  const response = await axios.get('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
  cache.set("googleKeys", response.data);
  return response.data;
}

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  const idToken = req.headers.authorization;
  if (!idToken) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const keys = await getGooglePublicKeys();
    const decodedToken = await verifyFirebaseToken(idToken, keys);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Function to verify Firebase token
async function verifyFirebaseToken(token, keys) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, keys, {
      algorithms: ['RS256'],
      audience: 'your-firebase-project-id', // Replace with your Firebase project ID
      issuer: 'https://securetoken.google.com/your-firebase-project-id', // Replace with your Firebase project ID
    }, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

// Function to upload file to S3
async function uploadFileToS3(file, key) {
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);
    return `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
}

app.get('/', function(req, res) {
  res.json({ message: "Hello welcome to placeus" });
});

app.post("/upload", upload.fields([{ name: 'file' }, { name: 'thumbnail' }]), async function (req, res) {
  const lessonId = uuidv4();
  const title = req.body.title || 'Untitled';
  const tags = req.body.tags ? JSON.parse(req.body.tags) : [];

  try {
    // Upload video and thumbnail to S3
    const videoKey = `courses/${lessonId}/video${path.extname(req.files['file'][0].originalname)}`;
    const thumbnailKey = `courses/${lessonId}/thumbnail${path.extname(req.files['thumbnail'][0].originalname)}`;

    const videoUrl = await uploadFileToS3(req.files['file'][0], videoKey);
    const thumbnailUrl = await uploadFileToS3(req.files['thumbnail'][0], thumbnailKey);

    // Save metadata
    const metadata = JSON.stringify({ title, tags, videoUrl, thumbnailUrl });
    await uploadFileToS3({ buffer: Buffer.from(metadata), mimetype: 'application/json' }, `courses/${lessonId}/metadata.json`);

    res.json({
      message: "Upload successful. Processing video...",
      lessonId: lessonId,
      title: title,
      tags: tags,
      videoUrl: videoUrl,
      thumbnailUrl: thumbnailUrl
    });

    // Process video
    const outputPath = `/tmp/${lessonId}`;
    const hlsPath = `${outputPath}/index.m3u8`;

    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    const ffmpegCommand = `ffmpeg -i ${videoUrl} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

    exec(ffmpegCommand, async (error, stdout, stderr) => {
      if (error) {
        console.log(`exec error: ${error}`);
        return;
      }

      // Upload HLS files to S3
      const files = fs.readdirSync(outputPath);
      for (const file of files) {
        const fileContent = fs.readFileSync(`${outputPath}/${file}`);
        await uploadFileToS3({ buffer: fileContent, mimetype: 'application/octet-stream' }, `courses/${lessonId}/${file}`);
      }

      // Clean up temporary files
      fs.rmSync(outputPath, { recursive: true, force: true });

      console.log("Video processing complete");
    });

  } catch (error) {
    console.error("Error in upload process:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.get("/videos", async function (req, res) {
  try {
    console.log("Attempting to list objects in S3 bucket");
    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: "courses/",
      Delimiter: "/"
    });

    console.log("Sending list objects command to S3");
    const listObjectsResponse = await s3.send(listObjectsCommand);
    console.log("List objects response:", JSON.stringify(listObjectsResponse));

    if (!listObjectsResponse.CommonPrefixes || listObjectsResponse.CommonPrefixes.length === 0) {
      console.log("No CommonPrefixes found in the response");
      return res.json([]);
    }

    const { CommonPrefixes } = listObjectsResponse;

    console.log("Fetching metadata for each video");
    const videos = await Promise.all(CommonPrefixes.map(async (prefix) => {
      const lessonId = prefix.Prefix.split("/")[1];
      const metadataKey = `courses/${lessonId}/metadata.json`;

      console.log(`Fetching metadata for lessonId: ${lessonId}`);
      const getObjectCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: metadataKey
      });

      try {
        const { Body } = await s3.send(getObjectCommand);
        const metadata = JSON.parse(await streamToString(Body));
        console.log(`Metadata fetched for lessonId: ${lessonId}`);

        return {
          lessonId,
          ...metadata,
          commentCount: 0 // You may need to implement a separate system for comments
        };
      } catch (error) {
        console.error(`Error fetching metadata for lessonId ${lessonId}:`, error);
        return null;
      }
    }));

    const validVideos = videos.filter(video => video !== null);
    console.log(`Returning ${validVideos.length} videos`);
    res.json(validVideos);
  } catch (error) {
    console.error("Error in /videos endpoint:", error);
    res.status(500).json({ error: "Unable to list videos", details: error.message });
  }
});

// Helper function to convert stream to string
function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

// Fetch video info based on lessonId
app.get('/videos/:lessonId', async (req, res) => {
  const lessonId = req.params.lessonId;
  const metadataKey = `courses/${lessonId}/metadata.json`;

  try {
    const getObjectCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: metadataKey
    });

    const { Body } = await s3.send(getObjectCommand);
    const metadata = JSON.parse(await streamToString(Body));

    // Fetch comment count (you may need to implement this separately)
    const commentCount = 0; // Placeholder

    res.json({
      lessonId,
      ...metadata,
      commentCount
    });
  } catch (error) {
    console.error("Error fetching video details:", error);
    res.status(404).json({ message: "Video not found" });
  }
});

// New route to add a comment to a video (requires authentication)
app.post('/videos/:lessonId/comments', verifyToken, async (req, res) => {
  const { lessonId } = req.params;
  const { text } = req.body;
  const author = req.user.name || req.user.email;
  const commentId = uuidv4();
  const timestamp = new Date().toISOString();

  const commentKey = `courses/${lessonId}/comments.json`;

  try {
    // Fetch existing comments
    let comments = [];
    try {
      const getObjectCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: commentKey
      });
      const { Body } = await s3.send(getObjectCommand);
      comments = JSON.parse(await streamToString(Body));
    } catch (error) {
      // If file doesn't exist, we'll start with an empty array
      if (error.name !== 'NoSuchKey') {
        throw error;
      }
    }

    const newComment = { id: commentId, text, author, timestamp };
    comments.push(newComment);

    // Upload updated comments
    await uploadFileToS3({ buffer: Buffer.from(JSON.stringify(comments)), mimetype: 'application/json' }, commentKey);

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Route to get all comments for a video
app.get('/videos/:lessonId/comments', async (req, res) => {
  const { lessonId } = req.params;
  const commentKey = `courses/${lessonId}/comments.json`;

  try {
    const getObjectCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: commentKey
    });

    const { Body } = await s3.send(getObjectCommand);
    const comments = JSON.parse(await streamToString(Body));
    res.json(comments);
  } catch (error) {
    if (error.name === 'NoSuchKey') {
      res.json([]);
    } else {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Unable to fetch comments" });
    }
  }
});

// Optional: Route to delete a comment (requires authentication and ownership verification)
app.delete('/videos/:lessonId/comments/:commentId', verifyToken, async (req, res) => {
  const { lessonId, commentId } = req.params;
  const commentKey = `courses/${lessonId}/comments.json`;

  try {
    const getObjectCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: commentKey
    });

    const { Body } = await s3.send(getObjectCommand);
    let comments = JSON.parse(await streamToString(Body));

    const commentIndex = comments.findIndex(comment => comment.id === commentId);
    
    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user is the author of the comment
    if (comments[commentIndex].author !== req.user.name && comments[commentIndex].author !== req.user.email) {
      return res.status(403).json({ message: "You are not authorized to delete this comment" });
    }

    comments.splice(commentIndex, 1);

    // Upload updated comments
    await uploadFileToS3({ buffer: Buffer.from(JSON.stringify(comments)), mimetype: 'application/json' }, commentKey);

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

app.listen(port, function () {
  console.log(`App is listening at port ${port}...`);
});