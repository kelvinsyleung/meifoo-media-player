import React, { useCallback, useEffect, useRef, useState } from "react";
import "./MeiFooPlayer.scss";
import shaka from "shaka-player";
import muxjs from "mux.js";
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
import { formatTime } from "../../utils";
import VideoScreen from "../VideoScreen";

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

interface MeiFooPlayerProps {
    videoSrc: string[];
}

const MeiFooPlayer: React.FC<MeiFooPlayerProps> = ({ videoSrc }) => {
    const videoRefs = useRef<Map<number, HTMLVideoElement>>(
        new Map<number, HTMLVideoElement>(),
    );
    const shakaPlayers = useRef<Map<number, shaka.Player>>(
        new Map<number, shaka.Player>(),
    );
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [volumeState, setVolumeState] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
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
    const [focusedIndex, setFocusedIndex] = useState<null | number>(null);
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    useEffect(() => {
        if (videoSrc.length > 0) {
            videoRefs.current.forEach(async (videoNode, key) => {
                const player = new shaka.Player(videoNode);
                await player.load(videoSrc[key]);
                shakaPlayers.current.set(key, player);

                player.configure({
                    streaming: {
                        lowLatencyMode: true,
                    },
                });
                if (key !== 0) {
                    videoNode.muted = true;
                    videoNode.volume = 0;
                }
            });
            if (videoRefs.current.size == 1) {
                setFocusedIndex(0);
            }
        } else {
            console.warn("Invalid video source provided!");
        }
    }, [videoSrc]);

    const handlePlayPause = useCallback(() => {
        if (isPlaying) {
            videoRefs.current.forEach((videoNode) => videoNode.pause());
            setIsPlaying(false);
        } else {
            videoRefs.current.forEach((videoNode) => videoNode.play());
            setIsPlaying(true);
        }
    }, [isPlaying]);

    const showLoaderHandler = useCallback(() => {
        setIsLoading(true);
    }, []);

    const hideLoaderHandler = useCallback(() => {
        setIsLoading(false);
    }, []);

    const handleMute = useCallback(() => {
        if (videoRefs.current.size > 0) {
            if (!isMuted) {
                videoRefs.current.get(0)!.muted = true;
                setVolumeState(0);
            } else {
                videoRefs.current.get(0)!.muted = false;
                setVolumeState(videoRefs.current.get(0)!.volume);
            }
            setIsMuted(!isMuted);
        }
    }, [isMuted]);

    const handleVolumeChange = useCallback(() => {
        if (videoRefs.current.size > 0) {
            setVolumeState(videoRefs.current.get(0)!.volume);
            setIsMuted(videoRefs.current.get(0)!.muted);

            if (isMuted && volumeState > 0) {
                videoRefs.current.get(0)!.muted = false;
                setIsMuted(false);
            }
        }
    }, [isMuted, volumeState]);

    const handleTimeUpdate = useCallback(() => {
        if (videoRefs.current.size > 0) {
            setCurrentTime(videoRefs.current.get(0)!.currentTime);

            // assume all videos buffers the same as the first video
            // shows the buffered time of the first video
            const buffered = videoRefs.current.get(0)!.buffered;
            if (duration > 0) {
                for (let i = 0; i < buffered.length; i++) {
                    if (
                        buffered.start(buffered.length - 1 - i) === 0 ||
                        buffered.start(buffered.length - 1 - i) <
                            videoRefs.current.get(0)!.currentTime
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
        if (videoRefs.current.size > 0) {
            setDuration(videoRefs.current.get(0)!.duration);
        }
    }, []);

    const changePlaybackRateHandler = useCallback((playbackRate: number) => {
        if (videoRefs.current.size > 0) {
            videoRefs.current.forEach((videoNode) => {
                videoNode.playbackRate = playbackRate;
            });
            setActivePlaybackRate(playbackRate);
        }
    }, []);

    const changeResolutionHandler = useCallback(
        (resolution: shaka.extern.Track | "auto") => {
            const player = shakaPlayers.current.get(focusedIndex || 0)!;

            if (resolution === "auto") {
                player.configure({ abr: { enabled: true } });
                setActiveResolutionHeight("auto");
            } else {
                player.configure({ abr: { enabled: false } });
                player.selectVariantTrack(resolution);
                setActiveResolutionHeight(resolution.height || 0);
            }
        },
        [focusedIndex],
    );

    const intervalRef = useRef<ReturnType<typeof setInterval>>();
    useEffect(() => {
        if (focusedIndex === null) return;
        if (activeResolutionHeight !== "auto" && intervalRef.current) {
            clearInterval(intervalRef.current);
            return;
        }

        intervalRef.current = setInterval(() => {
            const player = shakaPlayers.current.get(focusedIndex || 0)!;
            const tracks = player.getVariantTracks();
            const sortedTracks = tracks.sort((trackA, trackB) =>
                (trackA?.height || 0) < (trackB?.height || 0) ? -1 : 1,
            );
            setResolutions(sortedTracks);
        }, 5000);
    }, [activeResolutionHeight, focusedIndex]);

    const handleFullScreen = useCallback(() => {
        if (videoRefs.current.size > 0) {
            if (!isFullScreen) {
                videoRefs.current.get(focusedIndex || 0)!.requestFullscreen();
                setIsFullScreen(true);
            } else {
                document.exitFullscreen();
                setIsFullScreen(false);
            }
        }
    }, [focusedIndex, isFullScreen]);

    const handlePictureInPicture = useCallback(async () => {
        if (videoRefs.current.size > 0) {
            if (
                !videoRefs.current.get(focusedIndex || 0)!
                    .requestPictureInPicture
            ) {
                console.error(
                    "Picture-in-Picture not supported by your browser.",
                );
                return;
            }
            try {
                await videoRefs.current
                    .get(focusedIndex || 0)!
                    .requestPictureInPicture();
                console.log("Video entered Picture-in-Picture mode.");
            } catch (error) {
                console.error("Error entering Picture-in-Picture mode:", error);
            }
        }
    }, [focusedIndex]);

    const handleVolumeInput = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            if (videoRefs.current.size > 0) {
                videoRefs.current.forEach((videoNode) => {
                    videoNode!.volume = parseFloat(event.target.value);
                });
            }
        },
        [],
    );

    const handleSeek = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            if (videoRefs.current.size > 0) {
                videoRefs.current.forEach((videoNode) => {
                    videoNode.currentTime = parseFloat(event.target.value);
                });
            }
        },
        [],
    );

    const seekMoveHandler = useCallback(
        (event: React.MouseEvent | React.TouchEvent, offsetX: number) => {
            if (videoRefs.current.size > 0) {
                const video = videoRefs.current.get(0)!;

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
        const videoElements = videoRefs.current;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === " ") {
                event.preventDefault();
                handlePlayPause();
            }
            if (event.key === "ArrowRight") {
                if (videoRefs.current) {
                    event.preventDefault();
                    videoRefs.current.forEach((videoNode) => {
                        videoNode.currentTime += 5;
                    });
                }
            }
            if (event.key === "ArrowLeft") {
                if (videoRefs.current) {
                    event.preventDefault();
                    videoRefs.current.forEach((videoNode) => {
                        videoNode.currentTime -= 5;
                    });
                }
            }
            if (event.key === "f") {
                handleFullScreen();
            }
            if (event.key === "p") {
                handlePictureInPicture();
            }
        };
        if (videoElements) {
            window.addEventListener("keydown", handleKeyDown);
            return () => {
                window.removeEventListener("keydown", handleKeyDown);
            };
        }
    }, [handleFullScreen, handlePictureInPicture, handlePlayPause, videoRefs]);

    const getGridTemplate = (numOfVids: number) => {
        if (focusedIndex) {
            return `1fr / 1fr`;
        } else if (numOfVids === 2) {
            return `1fr / 1fr 1fr`;
        } else {
            return `repeat(${Math.ceil(numOfVids / Math.ceil(numOfVids / 2))}, 1fr) / repeat(${Math.ceil(
                numOfVids / 2,
            )}, 1fr)`;
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <div className="video-player-container">
                <div
                    className="video-screen-container"
                    style={{
                        gridTemplate: getGridTemplate(videoSrc.length),
                    }}
                >
                    {videoSrc.map((src, index) => (
                        <VideoScreen
                            key={index}
                            videoRef={(videoNode) => {
                                // ref callback
                                if (videoNode) {
                                    videoRefs.current.set(index, videoNode);
                                } else {
                                    videoRefs.current.delete(index);
                                }
                            }}
                            handleSwitchView={() => setFocusedIndex(index)}
                            handlePlayPause={handlePlayPause}
                            handleFullScreen={handleFullScreen}
                            handleDurationChange={handleDurationChange}
                            handleVolumeChange={handleVolumeChange}
                            handleTimeUpdate={handleTimeUpdate}
                            showLoaderHandler={showLoaderHandler}
                            hideLoaderHandler={hideLoaderHandler}
                            isLoading={isLoading}
                            isZoomedIn={focusedIndex === index}
                            style={{
                                display:
                                    focusedIndex === index ||
                                    focusedIndex === null
                                        ? "block"
                                        : "none",
                            }}
                        />
                    ))}
                </div>
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
                                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
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
                                        onVolumeInputChange={handleVolumeInput}
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
                                onChangePlaybackRate={changePlaybackRateHandler}
                                resolutions={resolutions}
                                activeResolutionHeight={activeResolutionHeight}
                                onChangeResolution={changeResolutionHandler}
                                focusedIndex={focusedIndex}
                            />
                            <IconButton
                                color="primary"
                                onClick={() => {
                                    setDisplaySettings((prev) => !prev);
                                }}
                            >
                                <SettingsIcon />
                            </IconButton>
                            {focusedIndex !== null ? (
                                <>
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
                                </>
                            ) : (
                                <></>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default MeiFooPlayer;
