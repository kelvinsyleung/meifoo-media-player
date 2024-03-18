import React from "react";
import "./VideoScreen.scss";
import LoadingIndicator from "../LoadingIndicator";

interface VideoScreenProps {
    videoRef: (videoNode: HTMLVideoElement) => void;
    handlePlayPause: () => void;
    handleFullScreen: () => void;
    handleDurationChange: () => void;
    handleVolumeChange: () => void;
    handleTimeUpdate: () => void;
    showLoaderHandler: () => void;
    hideLoaderHandler: () => void;
    isLoading: boolean;
    // isViewFocused: boolean;
}

const VideoScreen: React.FC<VideoScreenProps> = ({
    videoRef,
    handlePlayPause,
    handleFullScreen,
    handleDurationChange,
    handleVolumeChange,
    handleTimeUpdate,
    showLoaderHandler,
    hideLoaderHandler,
    isLoading,
    // isViewFocused,
}) => {
    return (
        <div
            className="video-container"
            onClick={handlePlayPause}
            onDoubleClick={handleFullScreen}
        >
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
