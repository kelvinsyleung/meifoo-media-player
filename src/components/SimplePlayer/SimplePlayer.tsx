import React, { useState } from "react";
import "./SimplePlayer.scss";
import Button from "../Button";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import FastForwardIcon from "@mui/icons-material/FastForward";
import SettingsIcon from "@mui/icons-material/Settings";
import PictureInPictureAltIcon from "@mui/icons-material/PictureInPictureAlt";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import Dropdown from "../Dropdown/Dropdown";

const SimplePlayer: React.FC = () => {
    const [displayDropdown, setDisplayDropdown] = useState(false);

    return (
        <div className="vp-container">
            <video controls={false} />
            <div className="vp-controls">
                <div className="vp-controls__header">
                    <time className="vp-time" dateTime="00:00">
                        00:00
                    </time>

                    <div className="vp-progress">
                        <div className="vp-progress__range">
                            <div className="vp-progress__range--background" />
                            <div className="vp-progress__range--buffer" />
                            <div className="vp-progress__range--current">
                                <div className="vp-progress__range--current__thumb" />
                            </div>
                            <input
                                className="vp-progress__range--seek"
                                type="range"
                                step="any"
                            />
                        </div>
                        <div className="vp-progress">
                            {/* progress range */}
                            <span className="vp-progress__tooltip">00:00</span>
                        </div>
                    </div>

                    <time className="vp-time" dateTime="00:00">
                        00:00
                    </time>
                </div>
                <div className="vp-controls__body">
                    <div className="vp-volume">
                        <Button onClick={() => {}}>
                            <VolumeUpIcon />
                        </Button>

                        <div className="vp-volume__range">
                            {/* background */}
                            {/* current volume */}
                            {/* seek */}
                        </div>
                    </div>
                    <div>
                        <Button onClick={() => {}}>
                            <FastRewindIcon />
                        </Button>
                        <Button onClick={() => {}}>
                            <PlayArrowIcon />
                        </Button>
                        <Button onClick={() => {}}>
                            <FastForwardIcon />
                        </Button>
                    </div>
                    <div>
                        <Dropdown on={displayDropdown} />
                        <Button
                            onClick={() => {
                                setDisplayDropdown(!displayDropdown);
                            }}
                        >
                            <SettingsIcon />
                        </Button>
                        <Button onClick={() => {}}>
                            <PictureInPictureAltIcon />
                        </Button>
                        <Button onClick={() => {}}>
                            <FullscreenIcon />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimplePlayer;
