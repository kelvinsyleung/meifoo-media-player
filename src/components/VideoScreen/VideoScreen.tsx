import React from "react";
import "./VideoScreen.scss";
import LoadingIndicator from "../LoadingIndicator";
import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface VideoScreenProps {
    videoRef: (videoNode: HTMLVideoElement) => void;
    handleZoomIn: () => void;
    handleZoomOut: () => void;
    handlePlayPause: () => void;
    handleFullScreen: () => void;
    handleDurationChange: () => void;
    handleVolumeChange: () => void;
    handleTimeUpdate: () => void;
    showLoaderHandler: () => void;
    hideLoaderHandler: () => void;
    isLoading: boolean;
    isZoomedIn: boolean;
    isOnlyVideo: boolean;
    style?: React.CSSProperties;
}

const VideoScreen: React.FC<VideoScreenProps> = ({
    videoRef,
    handleZoomIn,
    handleZoomOut,
    handlePlayPause,
    handleFullScreen,
    handleDurationChange,
    handleVolumeChange,
    handleTimeUpdate,
    showLoaderHandler,
    hideLoaderHandler,
    isLoading,
    isZoomedIn,
    isOnlyVideo,
    style = {},
}) => {
    return (
        <div
            className="video-container"
            onClick={() => {
                if (isZoomedIn || isOnlyVideo) {
                    handlePlayPause();
                } else {
                    handleZoomIn();
                }
            }}
            onDoubleClick={handleFullScreen}
            style={style}
        >
            {isZoomedIn && !isOnlyVideo && (
                <IconButton
                    className="zoom-out"
                    color={"primary"}
                    onClick={(e) => {
                        // stop propagation to prevent video from pausing
                        e.stopPropagation();
                        handleZoomOut();
                    }}
                >
                    <ArrowBackIcon />
                </IconButton>
            )}
            <video
                ref={videoRef}
                onLoadedMetadata={handleDurationChange}
                onVolumeChange={handleVolumeChange}
                onTimeUpdate={handleTimeUpdate}
                onSeeking={showLoaderHandler}
                onSeeked={hideLoaderHandler}
                onWaiting={showLoaderHandler}
                onCanPlay={hideLoaderHandler}
                onError={(e) => {
                    console.error("Error:", e);
                }}
            />
            <LoadingIndicator on={isLoading} />
        </div>
    );
};

export default VideoScreen;
