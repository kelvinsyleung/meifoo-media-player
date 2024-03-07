import React, { useCallback, useEffect, useRef, useState } from "react";
import "./SimplePlayer.scss";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SettingsIcon from "@mui/icons-material/Settings";
import PictureInPictureAltIcon from "@mui/icons-material/PictureInPictureAlt";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import PopupDrawer from "../PopupDrawer";

const theme = createTheme({
    palette: {
        primary: {
            main: "#ffffff",
        },
        secondary: {
            main: "#cd131c",
        },
    },
});

interface SimplePlayerProps {
    videoSrc: string;
    isSingleViewMode: boolean;
    onPlay?: () => void;
    onPause?: () => void;
}

const SimplePlayer: React.FC<SimplePlayerProps> = ({
    videoSrc,
    isSingleViewMode = false,
    onPlay,
    onPause,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [bufferedTime, setBufferedTime] = useState(0);
    const [seekTooltip, setSeekTooltip] = useState("00:00");
    const [seekTooltipPosition, setSeekTooltipPosition] = useState("");
    const [duration, setDuration] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [displaySettings, setDisplaySettings] = useState(false);

    const handlePlayPause = useCallback(() => {
        if (isPlaying) {
            videoRef.current?.pause();
            setIsPlaying(false);
            onPause?.();
        } else {
            videoRef.current?.play();
            setIsPlaying(true);
            onPlay?.();
        }
    }, [isPlaying, onPause, onPlay]);

    const handleMute = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    }, []);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);

            const buffered = videoRef.current.buffered;
            if (duration > 0) {
                for (let i = 0; i < buffered.length; i++) {
                    if (
                        buffered.start(buffered.length - 1 - i) === 0 ||
                        buffered.start(buffered.length - 1 - i) <
                            videoRef.current.currentTime
                    ) {
                        setBufferedTime(
                            (buffered.end(buffered.length - 1 - i) / duration) *
                                100,
                        );
                        break;
                    }
                }
            }
        }
    };

    const handleDurationChange = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleFullScreen = useCallback(() => {
        if (!isFullScreen) {
            if (videoRef.current) {
                videoRef.current.requestFullscreen(); // Request full screen
            }
            setIsFullScreen(true);
        } else {
            document.exitFullscreen(); // Exit full screen
            setIsFullScreen(false);
        }
    }, [isFullScreen]);

    const handlePictureInPicture = useCallback(async () => {
        if (videoRef.current) {
            if (!videoRef.current.requestPictureInPicture) {
                console.error(
                    "Picture-in-Picture not supported by your browser.",
                );
                return;
            }
            try {
                await videoRef.current.requestPictureInPicture();
                console.log("Video entered Picture-in-Picture mode.");
            } catch (error) {
                console.error("Error entering Picture-in-Picture mode:", error);
            }
        }
    }, []);

    const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (videoRef.current) {
            const seekTime = parseFloat(event.target.value); // Convert seekTime to a number
            videoRef.current.currentTime = seekTime;
        }
    };

    const seekMouseMoveHandler = (event: React.MouseEvent) => {
        const offsetX = (event as React.MouseEvent).nativeEvent.offsetX;
        seekMoveHandler(event, offsetX);
    };

    const seekTouchMoveHandler = (event: React.TouchEvent) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const offsetX =
            (event as React.TouchEvent).targetTouches[0].pageX - rect.left;
        seekMoveHandler(event, offsetX);
    };

    const seekMoveHandler = (
        event: React.MouseEvent | React.TouchEvent,
        offsetX: number,
    ) => {
        if (videoRef.current) {
            const video = videoRef.current!;

            const rect = event.currentTarget.getBoundingClientRect();
            const skipTo = (offsetX / rect.width) * video.duration;

            let formattedTime: string;

            if (skipTo > video.duration) {
                formattedTime = formatTime(video.duration);
            } else if (skipTo < 0) {
                formattedTime = "00:00";
            } else {
                formattedTime = formatTime(skipTo);
                setSeekTooltipPosition(`${offsetX}px`);
            }

            setSeekTooltip(formattedTime);
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    useEffect(() => {
        const videoElement = videoRef.current;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === " ") {
                event.preventDefault();
                handlePlayPause();
            }
            if (event.key === "ArrowRight") {
                if (videoRef.current) {
                    event.preventDefault();
                    videoRef.current.currentTime += 5;
                }
            }
            if (event.key === "ArrowLeft") {
                if (videoRef.current) {
                    event.preventDefault();
                    videoRef.current.currentTime -= 5;
                }
            }
            if (event.key === "f") {
                handleFullScreen();
            }
            if (event.key === "p") {
                handlePictureInPicture();
            }
        };
        if (videoElement) {
            window.addEventListener("keydown", handleKeyDown);
            return () => {
                window.removeEventListener("keydown", handleKeyDown);
            };
        }
    }, [handleFullScreen, handlePictureInPicture, handlePlayPause, videoRef]);

    return (
        <ThemeProvider theme={theme}>
            <div className="video-player-container">
                <video
                    ref={videoRef}
                    src={videoSrc}
                    onClick={handlePlayPause}
                    onDoubleClick={handleFullScreen}
                    onLoadedMetadata={handleDurationChange}
                    onTimeUpdate={handleTimeUpdate}
                />
                {isSingleViewMode && (
                    <div className="controls">
                        <div className="controls-progress-bar-container">
                            <div className="progress-bar">
                                <div className="progress-line">
                                    <div className="progress-line-background" />
                                    <div
                                        className="progress-line-buffer"
                                        style={{
                                            width: `${bufferedTime}%`,
                                        }}
                                    />
                                    <div
                                        className="progress-line-current"
                                        style={{
                                            width: `${(currentTime / duration) * 100}%`,
                                        }}
                                    >
                                        <div className="progress-line-current-thumb" />
                                    </div>
                                    <input
                                        className="progress-line-seek"
                                        type="range"
                                        min="0"
                                        max={duration}
                                        value={currentTime}
                                        step="any"
                                        onChange={handleSeek}
                                        onMouseMove={seekMouseMoveHandler}
                                        onTouchMove={seekTouchMoveHandler}
                                    />
                                </div>
                                <span
                                    className="progress-tooltip"
                                    style={{ left: seekTooltipPosition }}
                                >
                                    {seekTooltip}
                                </span>
                            </div>
                        </div>
                        <div className="controls-buttons-container">
                            <div className="left-controls">
                                <IconButton
                                    color="primary"
                                    onClick={handlePlayPause}
                                >
                                    {isPlaying ? (
                                        <PauseIcon />
                                    ) : (
                                        <PlayArrowIcon />
                                    )}
                                </IconButton>
                                <div className="volume">
                                    <IconButton
                                        color="primary"
                                        onClick={handleMute}
                                    >
                                        {isMuted ? (
                                            <VolumeOffIcon />
                                        ) : (
                                            <VolumeUpIcon />
                                        )}
                                    </IconButton>
                                    {/* TODO: Volume control drawer */}
                                </div>
                                <div className="time">
                                    <span>{formatTime(currentTime)}</span>
                                    <span> / </span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>
                            <div className="right-controls">
                                <PopupDrawer
                                    on={displaySettings}
                                    onClose={setDisplaySettings}
                                />
                                <IconButton
                                    color="primary"
                                    onClick={() => {
                                        setDisplaySettings((prev) => !prev);
                                    }}
                                >
                                    <SettingsIcon />
                                </IconButton>
                                <IconButton
                                    color="primary"
                                    onClick={handlePictureInPicture}
                                >
                                    <PictureInPictureAltIcon />
                                </IconButton>
                                <IconButton
                                    color="primary"
                                    onClick={handleFullScreen}
                                >
                                    <FullscreenIcon />
                                </IconButton>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ThemeProvider>
    );
};

export default SimplePlayer;
