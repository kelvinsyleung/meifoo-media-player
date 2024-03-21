import React from "react";
import "./VideoScreen.scss";
import LoadingIndicator from "../LoadingIndicator";

interface VideoScreenProps {
    videoRef: (videoNode: HTMLVideoElement) => void;
    handleSwitchView: () => void;
    handlePlayPause: () => void;
    handleFullScreen: () => void;
    handleDurationChange: () => void;
    handleVolumeChange: () => void;
    handleTimeUpdate: () => void;
    showLoaderHandler: () => void;
    hideLoaderHandler: () => void;
    isLoading: boolean;
    isZoomedIn: boolean;
    style?: React.CSSProperties;
}

const VideoScreen: React.FC<VideoScreenProps> = ({
    videoRef,
    handleSwitchView,
    handlePlayPause,
    handleFullScreen,
    handleDurationChange,
    handleVolumeChange,
    handleTimeUpdate,
    showLoaderHandler,
    hideLoaderHandler,
    isLoading,
    isZoomedIn,
    style = {},
}) => {
    return (
        <div
            className="video-container"
            onClick={() => {
                if (isZoomedIn) {
                    handlePlayPause();
                } else {
                    handleSwitchView();
                }
            }}
            onDoubleClick={handleFullScreen}
            style={style}
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
