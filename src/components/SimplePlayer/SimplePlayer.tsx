import React, { useCallback, useEffect, useRef, useState } from "react";
import "./SimplePlayer.scss";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeMuteIcon from "@mui/icons-material/VolumeMute";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SettingsIcon from "@mui/icons-material/Settings";
import PictureInPictureAltIcon from "@mui/icons-material/PictureInPictureAlt";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import PopupDrawer from "../PopupDrawer";
import VolumePopup from "../VolumePopup";
import LoadingIndicator from "../LoadingIndicator/LoadingIndicator";
import { formatTime } from "../../utils";
import shaka from "shaka-player";
import muxjs from "mux.js";

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

declare global {
    interface Window {
        muxjs: unknown;
    }
}

window.muxjs = muxjs;

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
    const shakaPlayer = useRef<shaka.Player>();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [volumeState, setVolumeState] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const volumeData = useRef(volumeState || 1);
    const [currentTime, setCurrentTime] = useState(0);
    const [bufferedTime, setBufferedTime] = useState(0);
    const [seekTooltip, setSeekTooltip] = useState("00:00");
    const [seekTooltipPosition, setSeekTooltipPosition] = useState("");
    const [duration, setDuration] = useState(0);
    const [displayVolume, setDisplayVolume] = useState(false);
    const [activePlaybackRate, setActivePlaybackRate] = useState(1);
    const [resolutions, setResolutions] = useState<shaka.extern.TrackList>([]);
    const [activeResolutionHeight, setActiveResolutionHeight] = useState<
        number | "auto"
    >("auto");
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [displaySettings, setDisplaySettings] = useState(false);
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    useEffect(() => {
        (async () => {
            const video = videoRef.current!;
            const player = new shaka.Player(video);
            await player.load(videoSrc);

            shakaPlayer.current = player;
            player.configure({
                streaming: {
                    lowLatencyMode: true,
                },
            });

            const tracks = player.getVariantTracks();
            // Sort it by height
            const sortedTracks = tracks.sort((trackA, trackB) =>
                (trackA?.height || 0) < (trackB?.height || 0) ? -1 : 1,
            );
            setResolutions(sortedTracks);
        })();
    }, [videoSrc]);

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

    const showLoaderHandler = useCallback(() => {
        setIsLoading(true);
    }, []);

    const hideLoaderHandler = useCallback(() => {
        setIsLoading(false);
    }, []);

    const handleMute = useCallback(() => {
        if (videoRef.current) {
            if (!videoRef.current.muted) {
                volumeData.current = videoRef.current.volume;
                videoRef.current.muted = true;
                setVolumeState(0);
                setIsMuted(true);
            } else {
                videoRef.current.volume = volumeData.current;
                videoRef.current.muted = false;
                setVolumeState(volumeData.current);
                setIsMuted(false);
            }
        }
    }, []);

    const handleVolumeChange = useCallback(() => {
        if (videoRef.current) {
            volumeData.current = videoRef.current.volume;
            setVolumeState(videoRef.current.volume);
            setIsMuted(videoRef.current.muted);

            if (isMuted && volumeState > 0) {
                videoRef.current.muted = false;
                setIsMuted(false);
            }
        }
    }, [isMuted, volumeState]);

    const handleTimeUpdate = useCallback(() => {
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
    }, [duration]);

    const handleDurationChange = useCallback(() => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    }, []);

    const changePlaybackRateHandler = useCallback((playbackRate: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackRate;
            setActivePlaybackRate(playbackRate);
        }
    }, []);

    const changeResolutionHandler = useCallback(
        (resolution: shaka.extern.Track | "auto") => {
            const player = shakaPlayer.current!;

            if (resolution === "auto") {
                player.configure({ abr: { enabled: true } });
                setActiveResolutionHeight("auto");
            } else {
                player.configure({ abr: { enabled: false } });
                player.selectVariantTrack(resolution);
                setActiveResolutionHeight(resolution.height || 0);
            }
        },
        [setActiveResolutionHeight],
    );

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

    const handleVolumeInput = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            if (videoRef.current) {
                videoRef.current.volume = parseFloat(event.target.value);
            }
        },
        [],
    );

    const handleSeek = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            if (videoRef.current) {
                videoRef.current.currentTime = parseFloat(event.target.value);
            }
        },
        [],
    );

    const seekMoveHandler = useCallback(
        (event: React.MouseEvent | React.TouchEvent, offsetX: number) => {
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
        },
        [],
    );

    const seekMouseMoveHandler = useCallback(
        (event: React.MouseEvent) => {
            const offsetX = (event as React.MouseEvent).nativeEvent.offsetX;
            seekMoveHandler(event, offsetX);
        },
        [seekMoveHandler],
    );

    const seekTouchMoveHandler = useCallback(
        (event: React.TouchEvent) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const offsetX =
                (event as React.TouchEvent).targetTouches[0].pageX - rect.left;
            seekMoveHandler(event, offsetX);
        },
        [seekMoveHandler],
    );

    // keyboard shortcuts
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
                                <div
                                    className="volume"
                                    onMouseEnter={() => setDisplayVolume(true)}
                                    onMouseLeave={() => setDisplayVolume(false)}
                                >
                                    <IconButton
                                        color="primary"
                                        onClick={handleMute}
                                    >
                                        {isMuted && <VolumeOffIcon />}
                                        {volumeState === 0 && !isMuted && (
                                            <VolumeMuteIcon />
                                        )}
                                        {volumeState > 0 &&
                                            volumeState <= 0.5 &&
                                            !isMuted && <VolumeDownIcon />}
                                        {volumeState > 0.5 && !isMuted && (
                                            <VolumeUpIcon />
                                        )}
                                    </IconButton>
                                    {!isMobile && (
                                        <VolumePopup
                                            isDisplaying={displayVolume}
                                            currentVolume={volumeState}
                                            onVolumeInputChange={
                                                handleVolumeInput
                                            }
                                        />
                                    )}
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
                                    activePlaybackRate={activePlaybackRate}
                                    onChangePlaybackRate={
                                        changePlaybackRateHandler
                                    }
                                    resolutions={resolutions}
                                    activeResolutionHeight={
                                        activeResolutionHeight
                                    }
                                    onChangeResolution={changeResolutionHandler}
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
