import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

const WebcamCapture = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [matchedFace, setMatchedFace] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const getSetUser = async () => {
    try {
      const response = await fetch("http://localhost:5000/users");
      if (!response.ok) {
        throw new Error(response.message);
      }
      const data = await response.json();
      setUsers(data);
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  const imageUrl =
    "https://res.cloudinary.com/dd5sixsi4/image/upload/v1726567317/2024-09-17-055844_cn0mdl.jpg";

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
        ]);
        console.log("Models loaded successfully");
        setLoading(false);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };

    loadModels();
    getSetUser();
  }, []);

  const detectFaces = async () => {
    if (webcamRef.current && !loading) {
      const videoEl = webcamRef.current.video;
      const detections = await faceapi
        .detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      const img = await faceapi.fetchImage(imageUrl);
      const referenceDescriptor = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (referenceDescriptor) {
        const faceMatcher = new faceapi.FaceMatcher(referenceDescriptor);
        const results = detections.map((fd) =>
          faceMatcher.findBestMatch(fd.descriptor)
        );

        results.forEach((result) => {
          if (result.distance < 0.5) {
            setMatchedFace(true);
          } else {
            setMatchedFace(false);
            alert("Unable to match the face. Please try again.");
          }
        });

        drawDetections(detections);
      } else {
        console.error("Reference image not found or no faces detected.");
      }
    }
  };

  const drawDetections = (detections) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const displaySize = {
        width: webcamRef.current.video.width,
        height: webcamRef.current.video.height,
      };
      faceapi.matchDimensions(canvas, displaySize);

      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      faceapi.draw.drawDetections(canvas, resizedDetections);
    }
  };

  return (
    <div>
      {loading ? (
        <h2>Loading models...</h2>
      ) : (
        <div className="min-h-screen bg-zinc-950 w-full flex flex-col justify-center items-center px-5">
          <div className="w-full h-full relative">
            <Webcam
              audio={false}
              height={480}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={640}
              className="rounded-md shadow-lg shadow-zinc-900"
              videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
            />
            <canvas
              ref={canvasRef}
              style={{ position: "absolute", top: 0, left: 0 }}
            />

            <div className="py-5">
              {/* <input
                type="text"
                className="w-full p-2 rounded-md bg-zinc-700 border-zinc-500 border-2 text-white focus:outline-none rounded-r-none"
                placeholder="Enter username"
              /> */}
              <button
                className="bg-zinc-500  rounded-md text-white"
                onClick={detectFaces}
              >
                {dataLoading ? (
                  <img
                    src="/loader.png"
                    className="animate-spin h-11 p-1 invert"
                  />
                ) : (
                  <div className="p-2.5">Who am I</div>
                )}
              </button>
            </div>

            {matchedFace && <h2 className="bg-green-600">Face Matched!</h2>}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
