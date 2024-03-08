import React, { useEffect, useRef, useState } from "react";
import "./PopupDrawer.scss";
import { CSSTransition } from "react-transition-group";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface PopupDrawerProps {
    on: boolean;
    onClose: (on: boolean) => void;
}

const PopupDrawer: React.FC<PopupDrawerProps> = ({ on, onClose }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isInMainMenu, setIsInMainMenu] = useState(true);
    const [activeType, setActiveType] = useState<"speed" | "resolution">(
        "speed",
    );
    const [DrawerHeight, setDrawerHeight] = useState<"initial" | number>(
        "initial",
    );
    const popupDrawerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!on) return;

        const popup = popupDrawerRef.current!;
        const drawer = popup.firstChild as HTMLElement;

        setDrawerHeight(drawer?.offsetHeight || "initial");
    }, [on]);

    useEffect(() => {
        if (!isMounted) return;

        const outsideClickHandler = (event: MouseEvent) => {
            if (!isMounted || !popupDrawerRef || !popupDrawerRef.current)
                return;
            if (!popupDrawerRef.current.contains(event.target as Node)) {
                onClose(false);
            }
        };

        document.addEventListener("click", outsideClickHandler);

        return () => {
            document.removeEventListener("click", outsideClickHandler);
        };
    }, [isMounted, onClose]);

    const drawerEnteredHandler = () => {
        setIsMounted(true);
    };

    const drawerExitedHandler = () => {
        setIsMounted(false);
        setIsInMainMenu(true);
        setDrawerHeight("initial");
    };

    const calcHeight = (element: HTMLElement) => {
        setDrawerHeight(element.offsetHeight);
    };

    const selectMenuHandler = (type: "resolution" | "speed") => {
        setIsInMainMenu(false);
        setActiveType(type);
    };

    const mainMenu = (
        <div className="popup-drawer-menu">
            <ul className="popup-drawer-list">
                <li
                    className="popup-drawer-list-item"
                    onClick={() => selectMenuHandler("speed")}
                >
                    <span>Speed</span>
                    <span>x 1</span>
                </li>
                <li
                    className="popup-drawer-list-item"
                    onClick={() => selectMenuHandler("resolution")}
                >
                    <span>Resolution</span>
                    <span>1080p</span>
                </li>
            </ul>
        </div>
    );

    const settingsMenu = (
        <div className="popup-drawer-menu">
            <div
                className="popup-drawer-label"
                onClick={() => setIsInMainMenu(true)}
            >
                <ArrowBackIcon />
                <span>
                    {activeType === "speed" && "Speed"}
                    {activeType === "resolution" && "Resolution"}
                </span>
            </div>
            <ul className="popup-drawer-list">
                {activeType === "speed" &&
                    [0.5, 0.75, 1, 1.25, 1.5].map((playbackRate) => (
                        <li
                            key={playbackRate}
                            className={`popup-drawer-list-item${
                                playbackRate === 1 ? " active" : ""
                            }`}
                            onClick={() => setIsInMainMenu(true)}
                        >
                            {playbackRate}
                        </li>
                    ))}
                {activeType === "resolution" &&
                    [540, 720, 1080].map((resolution) => (
                        <li
                            key={resolution}
                            className={`popup-drawer-list-item${
                                resolution === 1080 ? " active" : ""
                            }`}
                            onClick={() => setIsInMainMenu(true)}
                        >
                            {resolution}
                        </li>
                    ))}
            </ul>
        </div>
    );

    return (
        <CSSTransition
            in={on}
            classNames="popup-drawer"
            timeout={200}
            mountOnEnter
            unmountOnExit
            onEntered={drawerEnteredHandler}
            onExited={drawerExitedHandler}
        >
            <div
                className="popup-drawer"
                ref={popupDrawerRef}
                style={{ height: DrawerHeight }}
            >
                <CSSTransition
                    in={isInMainMenu}
                    classNames="popup-drawer-main-menu"
                    timeout={300}
                    mountOnEnter
                    unmountOnExit
                    onEnter={calcHeight}
                >
                    {mainMenu}
                </CSSTransition>

                <CSSTransition
                    in={!isInMainMenu}
                    classNames="popup-drawer-specific-settings"
                    timeout={300}
                    mountOnEnter
                    unmountOnExit
                    onEnter={calcHeight}
                >
                    {settingsMenu}
                </CSSTransition>
            </div>
        </CSSTransition>
    );
};

export default PopupDrawer;
