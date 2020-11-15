import React, { useRef, useEffect, useCallback } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import "./App.css";

const App = () => {
    const videoRef = useRef();
	const canvasRef = useRef();
	
	const detectFrame = useCallback((video, model) => {
        model.detect(video).then((predictions) => {
            renderPredictions(predictions);
            requestAnimationFrame(() => {
                detectFrame(video, model);
            });
        });
    }, []);

    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const webCamPromise = navigator.mediaDevices
                .getUserMedia({
                    audio: false,
                    video: {
                        facingMode: "user",
                    },
                })
                .then((stream) => {
                    window.stream = stream;
                    videoRef.current.srcObject = stream;
                    return new Promise((resolve, reject) => {
                        videoRef.current.onloadedmetadata = () => {
                            resolve();
                        };
                    });
                });

            const modelPromise = cocoSsd.load();
            Promise.all([modelPromise, webCamPromise])
                .then((values) => {
                    detectFrame(videoRef.current, values[0]);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }, [detectFrame]);

    const renderPredictions = (predictions) => {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        //fonts
        const font = "16px sans-serif";
        ctx.font = font;
        ctx.textBaseline = "top";
        predictions.forEach((prediction) => {
            const x = prediction.bbox[0];
            const y = prediction.bbox[1];
            const width = prediction.bbox[2];
            const height = prediction.bbox[3];
            //draw the bounding box
            ctx.strokeStyle = "lightgreen";
            ctx.lineWidth = 4;
            ctx.strokeRect(x, y, width, height);
            //draw the label background
            ctx.fillStyle = "lightgreen";
            const textWidth = ctx.measureText(prediction.class).width;
            const textHeight = parseInt(font, 10);
            ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
        });

        predictions.forEach((prediction) => {
            const x = prediction.bbox[0];
            const y = prediction.bbox[1];
            //draw the last to ensure it's on top
            ctx.fillStyle = "#000000";
            ctx.fillText(prediction.class, x, y);
        });
    };

    return (
        <div className="App">
            <video
                className="size"
                autoPlay
                playsInline
                ref={videoRef}
                muted
                width="600"
                height="500"
            />
            <canvas className="size" ref={canvasRef} width="600" height="500" />
        </div>
    );
};

export default App;
