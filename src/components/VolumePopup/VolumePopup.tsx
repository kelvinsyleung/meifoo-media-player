import React from "react";
import { CSSTransition } from "react-transition-group";

interface VolumePopupProps {
    isDisplaying: boolean;
    currentVolume: number;
    onVolumeInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const VolumePopup: React.FC<VolumePopupProps> = ({
    isDisplaying,
    currentVolume,
    onVolumeInputChange,
}) => {
    return (
        <CSSTransition
            in={isDisplaying}
            classNames="volume-popup"
            timeout={200}
            mountOnEnter
            unmountOnExit
        >
            <div className="volume-popup">
                <div className="volume-bar">
                    <div className="volume-bar-background" />
                    <div
                        className="volume-bar-current"
                        style={{
                            width: `${currentVolume * 100}%`,
                        }}
                    >
                        <div className="volume-bar-current-thumb" />
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={currentVolume}
                        onChange={onVolumeInputChange}
                        className="volume-bar-seek"
                    />
                </div>
            </div>
        </CSSTransition>
    );
};

export default VolumePopup;
